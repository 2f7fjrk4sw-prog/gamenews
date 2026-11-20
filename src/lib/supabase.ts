import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { TeamUser, SyncedProjectState, TeamWorkspace } from '../types';

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

export const TEAMS_STORAGE_KEY = 'radar_teams_directory_v1';
export const ACTIVE_TEAM_STORAGE_KEY = 'radar_active_team_id';

export const getTeamStateStorageKey = (teamId: string): string => `radar_team_state_${teamId}`;

export const generateInviteCode = (teamName: string): string => {
  const clean = teamName
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 4) || 'EKIP';
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${clean}-${rand}`;
};

export const loadLocalTeams = (): TeamWorkspace[] => {
  try {
    const raw = localStorage.getItem(TEAMS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const saveLocalTeams = (teams: TeamWorkspace[]): void => {
  try {
    localStorage.setItem(TEAMS_STORAGE_KEY, JSON.stringify(teams));
  } catch (e) {
    console.error('saveLocalTeams error', e);
  }
};

export const loadLocalTeamState = (teamId: string): SyncedProjectState | null => {
  try {
    const raw = localStorage.getItem(getTeamStateStorageKey(teamId));
    if (!raw) return null;
    return JSON.parse(raw) as SyncedProjectState;
  } catch {
    return null;
  }
};

export const saveLocalTeamState = (teamId: string, state: SyncedProjectState): void => {
  try {
    localStorage.setItem(getTeamStateStorageKey(teamId), JSON.stringify(state));
  } catch (e) {
    console.error('saveLocalTeamState error', e);
  }
};

export const mergeTeamsLists = (
  localTeams: TeamWorkspace[],
  remoteTeams: TeamWorkspace[]
): TeamWorkspace[] => {
  const map = new Map<string, TeamWorkspace>();

  for (const t of remoteTeams) {
    if (t && t.id) {
      map.set(t.id, t);
    }
  }

  for (const t of localTeams) {
    if (!t || !t.id) continue;
    const existing = map.get(t.id);
    if (!existing) {
      map.set(t.id, t);
    } else {
      const localTime = Date.parse(t.updatedAt || '') || 0;
      const remoteTime = Date.parse(existing.updatedAt || '') || 0;
      if (localTime >= remoteTime) {
        map.set(t.id, t);
      }
    }
  }

  return Array.from(map.values()).sort((a, b) => {
    const ta = Date.parse(a.createdAt || '') || 0;
    const tb = Date.parse(b.createdAt || '') || 0;
    return ta - tb;
  });
};

export const fetchCloudTeams = async (): Promise<TeamWorkspace[]> => {
  const localTeams = loadLocalTeams();
  const client = getSupabaseClient();
  if (!client) return localTeams;

  try {
    const { data, error } = await client
      .from('team_project_state')
      .select('state')
      .eq('id', 'teams_directory')
      .maybeSingle();

    if (error || !data?.state) {
      return localTeams;
    }

    let rawState = data.state;
    if (typeof rawState === 'string') {
      try {
        rawState = JSON.parse(rawState);
      } catch {
        return localTeams;
      }
    }

    const remoteTeams = Array.isArray((rawState as { teams?: TeamWorkspace[] }).teams)
      ? (rawState as { teams: TeamWorkspace[] }).teams
      : [];

    const merged = mergeTeamsLists(localTeams, remoteTeams);
    saveLocalTeams(merged);
    return merged;
  } catch (e) {
    console.error('fetchCloudTeams error', e);
    return localTeams;
  }
};

export const saveTeamsDirectoryToCloud = async (teams: TeamWorkspace[]): Promise<boolean> => {
  saveLocalTeams(teams);
  const client = getSupabaseClient();
  if (!client) return true;

  try {
    const nowIso = new Date().toISOString();
    const { error } = await client.from('team_project_state').upsert({
      id: 'teams_directory',
      state: { teams, updatedAt: nowIso },
      updated_at: nowIso,
    });
    if (error) {
      console.error('saveTeamsDirectoryToCloud error:', error.message);
      return false;
    }
    return true;
  } catch (e) {
    console.error('saveTeamsDirectoryToCloud exception:', e);
    return false;
  }
};

export const fetchTeamStateFromCloud = async (teamId: string): Promise<SyncedProjectState | null> => {
  const client = getSupabaseClient();
  if (!client) return loadLocalTeamState(teamId);

  try {
    const rowId = `team_${teamId}`;
    const { data, error } = await client
      .from('team_project_state')
      .select('state')
      .eq('id', rowId)
      .maybeSingle();

    if (error) {
      console.warn('fetchTeamStateFromCloud error:', error.message);
      return loadLocalTeamState(teamId);
    }

    if (data?.state) {
      const parsed = typeof data.state === 'string' ? JSON.parse(data.state) : data.state;
      return parsed as SyncedProjectState;
    }

    // Legacy fallback ONLY for default team if 'team_team_default' doesn't exist yet
    if (teamId === 'team_default') {
      const legacy = await client
        .from('team_project_state')
        .select('state')
        .eq('id', 'default')
        .maybeSingle();

      if (legacy.data?.state) {
        const parsedLegacy = typeof legacy.data.state === 'string'
          ? JSON.parse(legacy.data.state)
          : legacy.data.state;
        return parsedLegacy as SyncedProjectState;
      }
    }

    return loadLocalTeamState(teamId);
  } catch (e) {
    console.error('fetchTeamStateFromCloud exception:', e);
    return loadLocalTeamState(teamId);
  }
};

export const saveTeamStateToCloud = async (teamId: string, state: SyncedProjectState): Promise<boolean> => {
  saveLocalTeamState(teamId, state);
  const client = getSupabaseClient();
  if (!client) return true;

  try {
    const nowIso = state.updatedAt || new Date().toISOString();
    const { error } = await client.from('team_project_state').upsert({
      id: `team_${teamId}`,
      state: { ...state, teamId, updatedAt: nowIso },
      updated_at: nowIso,
    });
    if (error) {
      console.error('saveTeamStateToCloud error:', error.message);
      return false;
    }
    return true;
  } catch (e) {
    console.error('saveTeamStateToCloud exception:', e);
    return false;
  }
};

export const fetchCloudUsers = async (): Promise<TeamUser[]> => {
  const client = getSupabaseClient();
  const readLocal = (): TeamUser[] => {
    try {
      const local = localStorage.getItem('game_registered_users');
      return local ? JSON.parse(local) : [];
    } catch {
      return [];
    }
  };

  if (!client) {
    return readLocal();
  }

  try {
    // Prefer dedicated users_directory row
    const { data: usersRow } = await client
      .from('team_project_state')
      .select('state')
      .eq('id', 'users_directory')
      .maybeSingle();

    if (usersRow?.state) {
      const parsed = typeof usersRow.state === 'string' ? JSON.parse(usersRow.state) : usersRow.state;
      if (Array.isArray(parsed.registeredUsers)) {
        localStorage.setItem('game_registered_users', JSON.stringify(parsed.registeredUsers));
        return parsed.registeredUsers;
      }
    }

    // Legacy fallback from 'default' row
    const { data, error } = await client
      .from('team_project_state')
      .select('state')
      .eq('id', 'default')
      .maybeSingle();

    if (error || !data?.state) {
      return readLocal();
    }

    let state = data.state;
    if (typeof state === 'string') {
      try {
        state = JSON.parse(state);
      } catch {
        return readLocal();
      }
    }

    const stateObj = state as SyncedProjectState;
    if (Array.isArray(stateObj.registeredUsers)) {
      localStorage.setItem('game_registered_users', JSON.stringify(stateObj.registeredUsers));
      return stateObj.registeredUsers;
    }

    return readLocal();
  } catch (e) {
    console.error('fetchCloudUsers error', e);
    return readLocal();
  }
};

export const saveUserToCloud = async (newUser: TeamUser): Promise<boolean> => {
  const client = getSupabaseClient();

  const existingUsers = await fetchCloudUsers();
  const filtered = existingUsers.filter(u => u.username.toLowerCase() !== newUser.username.toLowerCase());
  const updatedUsers = [...filtered, newUser];
  localStorage.setItem('game_registered_users', JSON.stringify(updatedUsers));

  if (!client) return true;

  try {
    const nowIso = new Date().toISOString();
    await client.from('team_project_state').upsert({
      id: 'users_directory',
      state: { registeredUsers: updatedUsers, updatedAt: nowIso },
      updated_at: nowIso,
    });
    return true;
  } catch (e) {
    console.error('saveUserToCloud error', e);
    return false;
  }
};

