import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const getEnvOrStored = (envKey: string, storedKey: string): string => {
  const envVal = import.meta.env[envKey];
  if (typeof envVal === 'string' && envVal.trim() !== '') {
    return envVal.trim();
  }
  return localStorage.getItem(storedKey) || '';
};

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isConfigured: boolean;
  source: 'env' | 'custom' | 'none';
}

export const getSupabaseConfig = (): SupabaseConfig => {
  const envUrl = import.meta.env.VITE_SUPABASE_URL;
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (typeof envUrl === 'string' && envUrl.trim() !== '' && typeof envKey === 'string' && envKey.trim() !== '') {
    return {
      url: envUrl.trim(),
      anonKey: envKey.trim(),
      isConfigured: true,
      source: 'env',
    };
  }

  const customUrl = getEnvOrStored('VITE_SUPABASE_URL', 'supabase_custom_url');
  const customKey = getEnvOrStored('VITE_SUPABASE_ANON_KEY', 'supabase_custom_anon_key');

  if (customUrl && customKey && customUrl.startsWith('http')) {
    return {
      url: customUrl.trim(),
      anonKey: customKey.trim(),
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

export const saveCustomSupabaseConfig = (url: string, anonKey: string) => {
  localStorage.setItem('supabase_custom_url', url.trim());
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
  try {
    const testClient = createClient(url.trim(), key.trim(), {
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
