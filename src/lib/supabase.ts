import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { TeamUser, SyncedProjectState } from '../types';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isConfigured: boolean;
  source: 'env' | 'custom' | 'default' | 'none';
}

// Built-in default project credentials (can be pre-populated for permanent 24/7 cloud sync)
export const DEFAULT_SUPABASE_URL: string = 'https://hvnycpduhlbodjyewjve.supabase.co';
export const DEFAULT_SUPABASE_ANON_KEY: string = 'sb_publishable_JeSR2HP59ZLzExbC2-UVJA_CSeIpTU8';

export const getSupabaseConfig = (): SupabaseConfig => {
  // 1. Built-in default project credentials (Permanent 24/7 cloud sync for all devices)
  if (DEFAULT_SUPABASE_URL && DEFAULT_SUPABASE_ANON_KEY && DEFAULT_SUPABASE_URL.startsWith('http')) {
    return {
      url: DEFAULT_SUPABASE_URL,
      anonKey: DEFAULT_SUPABASE_ANON_KEY,
      isConfigured: true,
      source: 'default',
    };
  }

  // 2. Vite replaces static `import.meta.env.VITE_*` variables during production build
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

  // 3. Custom URL saved via in-app CloudSyncModal
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

export const fetchCloudUsers = async (): Promise<TeamUser[]> => {
  const client = getSupabaseClient();
  if (!client) {
    const local = localStorage.getItem('game_registered_users');
    return local ? JSON.parse(local) : [];
  }

  try {
    const { data, error } = await client
      .from('team_project_state')
      .select('state')
      .eq('id', 'default')
      .maybeSingle();

    if (error || !data?.state) {
      const local = localStorage.getItem('game_registered_users');
      return local ? JSON.parse(local) : [];
    }

    let state = data.state;
    if (typeof state === 'string') {
      try {
        state = JSON.parse(state);
      } catch {
        return [];
      }
    }

    const stateObj = state as SyncedProjectState;
    if (Array.isArray(stateObj.registeredUsers)) {
      localStorage.setItem('game_registered_users', JSON.stringify(stateObj.registeredUsers));
      return stateObj.registeredUsers;
    }

    const local = localStorage.getItem('game_registered_users');
    return local ? JSON.parse(local) : [];
  } catch (e) {
    console.error('fetchCloudUsers error', e);
    const local = localStorage.getItem('game_registered_users');
    return local ? JSON.parse(local) : [];
  }
};

export const saveUserToCloud = async (newUser: TeamUser): Promise<boolean> => {
  const client = getSupabaseClient();
  
  // Local first
  const existingUsers = await fetchCloudUsers();
  const filtered = existingUsers.filter(u => u.username.toLowerCase() !== newUser.username.toLowerCase());
  const updatedUsers = [...filtered, newUser];
  localStorage.setItem('game_registered_users', JSON.stringify(updatedUsers));

  if (!client) return true;

  try {
    const { data } = await client
      .from('team_project_state')
      .select('state')
      .eq('id', 'default')
      .maybeSingle();

    let currentState: SyncedProjectState = {
      myGameTitle: 'Kaos Ekibi: Hayatta Kalma',
      targetDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 90).toISOString().split('T')[0],
      competitors: [],
      checklist: [],
      updatedAt: new Date().toISOString(),
    };

    if (data?.state) {
      currentState = typeof data.state === 'string' ? JSON.parse(data.state) : data.state;
    }

    currentState.registeredUsers = updatedUsers;
    currentState.updatedAt = new Date().toISOString();

    await client.from('team_project_state').upsert({
      id: 'default',
      state: currentState,
      updated_at: new Date().toISOString(),
    });

    return true;
  } catch (e) {
    console.error('saveUserToCloud error', e);
    return false;
  }
};

