import { createClient, type SupabaseClient } from '@supabase/supabase-js';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isConfigured: boolean;
  source: 'env' | 'custom' | 'none';
}

export const getSupabaseConfig = (): SupabaseConfig => {
  // Vite replaces static `import.meta.env.VITE_*` variables during production build
  const envUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim() || '';
  const envKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim() || '';

  if (envUrl && envKey && envUrl.startsWith('http')) {
    return {
      url: envUrl,
      anonKey: envKey,
      isConfigured: true,
      source: 'env',
    };
  }

  const customUrl = (localStorage.getItem('supabase_custom_url') || '').trim();
  const customKey = (localStorage.getItem('supabase_custom_anon_key') || '').trim();

  if (customUrl && customKey && customUrl.startsWith('http')) {
    return {
      url: customUrl,
      anonKey: customKey,
      isConfigured: true,
      source: 'custom',
    };
  }

  return {
    url: '',
    anonKey: '',
    isConfigured: false,
    source: 'none',
  };
};

export const sanitizeSupabaseUrl = (input: string): string => {
  let cleaned = input.trim();
  if (!cleaned) return '';

  // If user pasted dashboard link like https://supabase.com/dashboard/project/abcdefgh...
  const dashboardMatch = cleaned.match(/supabase\.com\/dashboard\/project\/([a-z0-9_-]+)/i);
  if (dashboardMatch && dashboardMatch[1]) {
    return `https://${dashboardMatch[1]}.supabase.co`;
  }

  // Remove trailing slashes and common path additions
  cleaned = cleaned.replace(/\/rest\/v1\/?$/i, '');
  cleaned = cleaned.replace(/\/+$/, '');

  // Ensure https:// prefix if missing
  if (!cleaned.startsWith('http://') && !cleaned.startsWith('https://')) {
    cleaned = `https://${cleaned}`;
  }

  return cleaned;
};

export const saveCustomSupabaseConfig = (url: string, anonKey: string) => {
  const sanitizedUrl = sanitizeSupabaseUrl(url);
  localStorage.setItem('supabase_custom_url', sanitizedUrl);
  localStorage.setItem('supabase_custom_anon_key', anonKey.trim());
  // reset client cache
  cachedClient = null;
};

export const clearCustomSupabaseConfig = () => {
  localStorage.removeItem('supabase_custom_url');
  localStorage.removeItem('supabase_custom_anon_key');
  cachedClient = null;
};

let cachedClient: SupabaseClient | null = null;
let lastUsedUrl = '';
let lastUsedKey = '';

export const getSupabaseClient = (): SupabaseClient | null => {
  const config = getSupabaseConfig();
  if (!config.isConfigured) {
    return null;
  }

  if (!cachedClient || lastUsedUrl !== config.url || lastUsedKey !== config.anonKey) {
    try {
      cachedClient = createClient(config.url, config.anonKey, {
        auth: {
          persistSession: false,
        },
        realtime: {
          params: {
            eventsPerSecond: 10,
          },
        },
      });
      lastUsedUrl = config.url;
      lastUsedKey = config.anonKey;
    } catch (err) {
      console.error('Supabase client error:', err);
      cachedClient = null;
    }
  }

  return cachedClient;
};

export const testSupabaseConnection = async (url: string, key: string): Promise<{ success: boolean; message?: string }> => {
  const sanitizedUrl = sanitizeSupabaseUrl(url);
  const sanitizedKey = key.trim();

  if (sanitizedUrl.includes('supabase.com/dashboard')) {
    return {
      success: false,
      message: 'Geçersiz URL: Tarayıcının adres çubuğundaki yönetim linkini değil, Project Settings > Data API altındaki Project URL (https://xxxx.supabase.co) adresini girmelisiniz.',
    };
  }

  try {
    const testClient = createClient(sanitizedUrl, sanitizedKey, {
      auth: { persistSession: false },
    });

    const { error } = await testClient.from('team_project_state').select('id').limit(1);

    if (error) {
      if (error.code === 'PGRST116' || error.message.includes('relation') || error.message.includes('does not exist')) {
        return {
          success: false,
          message: 'Supabase bağlandı ancak "team_project_state" tablosu bulunamadı. Lütfen SQL kodunu Supabase panelinde çalıştırın.',
        };
      }
      if (error.message.includes('Invalid path specified in request URL')) {
        return {
          success: false,
          message: 'Geçersiz URL formatı: Lütfen Supabase Project Settings > Data API sekmesindeki Project URL (https://xxxx.supabase.co) değerini kopyaladığınızdan emin olun.',
        };
      }
      return {
        success: false,
        message: `Bağlantı hatası: ${error.message}`,
      };
    }

    return { success: true };
  } catch (e: unknown) {
    const err = e as Error;
    return {
      success: false,
      message: err.message || 'Bağlantı sağlanamadı.',
    };
  }
};

