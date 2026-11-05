import { useState, useEffect, useRef, useCallback } from 'react';
import type { 
  CompetitorGame, 
  ChecklistItem, 
  CloudSyncStatus, 
  SyncedProjectState, 
  TeamMember,
  TeamUser,
  OnlineUserPresence 
} from '../types';
import { getSupabaseClient, getSupabaseConfig } from '../lib/supabase';

interface UseCloudSyncProps {
  myGameTitle: string;
  setMyGameTitle: (title: string) => void;
  targetDate: string;
  setTargetDate: (date: string) => void;
  competitors: CompetitorGame[];
  setCompetitors: React.Dispatch<React.SetStateAction<CompetitorGame[]>>;
  checklist: ChecklistItem[];
  setChecklist: React.Dispatch<React.SetStateAction<ChecklistItem[]>>;
  teamMembers?: TeamMember[];
  setTeamMembers?: React.Dispatch<React.SetStateAction<TeamMember[]>>;
  currentMember?: TeamMember;
  registeredUsers?: TeamUser[];
  setRegisteredUsers?: React.Dispatch<React.SetStateAction<TeamUser[]>>;
}

export const useCloudSync = ({
  myGameTitle,
  setMyGameTitle,
  targetDate,
  setTargetDate,
  competitors,
  setCompetitors,
  checklist,
  setChecklist,
  teamMembers,
  setTeamMembers,
  currentMember,
  registeredUsers,
  setRegisteredUsers,
}: UseCloudSyncProps) => {
  const config = getSupabaseConfig();
  const [isPaused, setIsPaused] = useState<boolean>(() => {
    return localStorage.getItem('cloud_sync_paused') === 'true';
  });

  const isCloudEnabled = config.isConfigured && !isPaused;

  // Unique session ID per browser tab/device to allow accurate multi-device presence tracking
  const [clientSessionId] = useState<string>(() => {
    try {
      const existing = sessionStorage.getItem('app_presence_session_id');
      if (existing) return existing;
      const newId = 'sess_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now().toString(36);
      sessionStorage.setItem('app_presence_session_id', newId);
      return newId;
    } catch {
      return 'sess_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now().toString(36);
    }
  });

  const [syncStatus, setSyncStatus] = useState<CloudSyncStatus>(() => {
    if (isPaused || !config.isConfigured) return 'local';
    return 'connecting';
  });
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUserPresence[]>([]);

  // Keep a stable ref to the current member so channel re-subscriptions don't churn
  const currentMemberRef = useRef(currentMember);
  useEffect(() => {
    currentMemberRef.current = currentMember;
  }, [currentMember]);

  // Keep a stable ref to the latest state
  const latestStateRef = useRef({
    myGameTitle,
    targetDate,
    competitors,
    checklist,
    teamMembers,
    registeredUsers,
  });

  const lastLocalEditRef = useRef<number>(0);
  const isApplyingRemoteRef = useRef(false);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isInitialLoadDoneRef = useRef(false);
  const channelRef = useRef<ReturnType<NonNullable<ReturnType<typeof getSupabaseClient>>['channel']> | null>(null);

  useEffect(() => {
    latestStateRef.current = {
      myGameTitle,
      targetDate,
      competitors,
      checklist,
      teamMembers,
      registeredUsers,
    };
    if (!isApplyingRemoteRef.current && isInitialLoadDoneRef.current) {
      lastLocalEditRef.current = Date.now();
    }
  }, [myGameTitle, targetDate, competitors, checklist, teamMembers, registeredUsers]);

  // Pull latest snapshot from database
  const pullFromCloud = useCallback(async () => {
    if (isPaused) {
      setSyncStatus('local');
      return;
    }

    const client = getSupabaseClient();
    if (!client) {
      setSyncStatus('local');
      return;
    }

    try {
      setSyncStatus('connecting');
      setErrorMessage(null);

      const { data, error } = await client
        .from('team_project_state')
        .select('state, updated_at')
        .eq('id', 'default')
        .maybeSingle();

      if (error) {
        console.warn('Cloud pull error:', error.message);
        setSyncStatus('error');
        setErrorMessage(error.message);
        return;
      }

      if (data && data.state) {
        // If initial load is already done and local user has edited something in the last 3 seconds, protect local input
        if (isInitialLoadDoneRef.current && Date.now() - lastLocalEditRef.current < 3000) {
          setSyncStatus('synced');
          return;
        }

        let remoteState = data.state;
        if (typeof remoteState === 'string') {
          try {
            remoteState = JSON.parse(remoteState);
          } catch {
            return;
          }
        }
        const stateObj = remoteState as SyncedProjectState;

        isApplyingRemoteRef.current = true;

        if (stateObj.myGameTitle) {
          setMyGameTitle(stateObj.myGameTitle);
          localStorage.setItem('user_game_title', stateObj.myGameTitle);
        }
        if (stateObj.targetDate) {
          setTargetDate(stateObj.targetDate);
          localStorage.setItem('user_game_target_date', stateObj.targetDate);
        }
        if (Array.isArray(stateObj.competitors)) {
          setCompetitors(stateObj.competitors);
          localStorage.setItem('game_competitors', JSON.stringify(stateObj.competitors));
        }
        if (Array.isArray(stateObj.checklist)) {
          setChecklist(stateObj.checklist);
          localStorage.setItem('game_checklist', JSON.stringify(stateObj.checklist));
        }
        if (Array.isArray(stateObj.teamMembers) && setTeamMembers) {
          setTeamMembers(stateObj.teamMembers);
          localStorage.setItem('game_team_members', JSON.stringify(stateObj.teamMembers));
        }
        if (Array.isArray(stateObj.registeredUsers) && setRegisteredUsers) {
          setRegisteredUsers(stateObj.registeredUsers);
          localStorage.setItem('game_registered_users', JSON.stringify(stateObj.registeredUsers));
        }
        if (Array.isArray(stateObj.registeredUsers) && setRegisteredUsers) {
          setRegisteredUsers(stateObj.registeredUsers);
          localStorage.setItem('game_registered_users', JSON.stringify(stateObj.registeredUsers));
        }

        const now = new Date().toLocaleTimeString('tr-TR');
        setLastSyncedAt(now);
        setSyncStatus('synced');

        setTimeout(() => {
          isApplyingRemoteRef.current = false;
        }, 300);
      } else {
        // Table row does not exist yet; seed it with current local state
        const currentState = latestStateRef.current;
        const initialPayload = {
          ...currentState,
          updatedAt: new Date().toISOString(),
        };

        await client.from('team_project_state').upsert({
          id: 'default',
          state: initialPayload,
          updated_at: new Date().toISOString(),
        });

        const now = new Date().toLocaleTimeString('tr-TR');
        setLastSyncedAt(now);
        setSyncStatus('synced');
      }
    } catch (err: unknown) {
      console.error('Error during cloud pull:', err);
      setSyncStatus('error');
      setErrorMessage((err as Error).message);
    }
  }, [isPaused, setChecklist, setCompetitors, setMyGameTitle, setTargetDate, setTeamMembers, setRegisteredUsers]);

  // Real-time WebSocket Channel: Instant Broadcast (<50ms) + Presence Tracking + Postgres Backup
  useEffect(() => {
    if (!isCloudEnabled) {
      return;
    }

    const client = getSupabaseClient();
    if (!client) {
      return;
    }

    let isMounted = true;

    const initSync = async () => {
      await pullFromCloud();
      if (isMounted) {
        isInitialLoadDoneRef.current = true;
      }
    };

    initSync();

    // Create channel with Broadcast enabled and Presence tracking keyed by clientSessionId
    const channel = client.channel('team_sync_room', {
      config: {
        broadcast: { self: false },
        presence: { key: clientSessionId },
      },
    });

    channelRef.current = channel;

    // 1. Instant Peer-to-Peer WebSocket Broadcast Event
    channel.on('broadcast', { event: 'state_update' }, ({ payload }) => {
      if (!isMounted || !payload) return;

      // If user has edited locally in the last 2 seconds, do not overwrite active typing
      if (Date.now() - lastLocalEditRef.current < 2000) {
        return;
      }

      const remoteState = payload as SyncedProjectState;
      isApplyingRemoteRef.current = true;

      if (remoteState.myGameTitle) {
        setMyGameTitle(remoteState.myGameTitle);
        localStorage.setItem('user_game_title', remoteState.myGameTitle);
      }
      if (remoteState.targetDate) {
        setTargetDate(remoteState.targetDate);
        localStorage.setItem('user_game_target_date', remoteState.targetDate);
      }
      if (Array.isArray(remoteState.competitors)) {
        setCompetitors(remoteState.competitors);
        localStorage.setItem('game_competitors', JSON.stringify(remoteState.competitors));
      }
      if (Array.isArray(remoteState.checklist)) {
        setChecklist(remoteState.checklist);
        localStorage.setItem('game_checklist', JSON.stringify(remoteState.checklist));
      }
      if (Array.isArray(remoteState.teamMembers) && setTeamMembers) {
        setTeamMembers(remoteState.teamMembers);
        localStorage.setItem('game_team_members', JSON.stringify(remoteState.teamMembers));
      }
      if (Array.isArray(remoteState.registeredUsers) && setRegisteredUsers) {
        setRegisteredUsers(remoteState.registeredUsers);
        localStorage.setItem('game_registered_users', JSON.stringify(remoteState.registeredUsers));
      }

      const now = new Date().toLocaleTimeString('tr-TR');
      setLastSyncedAt(now);
      setSyncStatus('synced');

      setTimeout(() => {
        isApplyingRemoteRef.current = false;
      }, 300);
    });

    // 2. Real-time Presence: Track all connected devices / team members
    const updatePresenceList = () => {
      if (!isMounted) return;
      const state = channel.presenceState();
      const onlineList: OnlineUserPresence[] = [];
      const seenSessions = new Set<string>();

      // Count occurrences of each member ID across distinct sessions
      const profileCounts: Record<string, number> = {};
      for (const presences of Object.values(state)) {
        for (const raw of presences as unknown as OnlineUserPresence[]) {
          const sId = raw.sessionId;
          if (sId && !seenSessions.has(sId)) {
            seenSessions.add(sId);
            const pId = raw.id || 'anonymous';
            profileCounts[pId] = (profileCounts[pId] || 0) + 1;
          }
        }
      }

      seenSessions.clear();
      const deviceCounter: Record<string, number> = {};

      for (const [key, presences] of Object.entries(state)) {
        for (const raw of presences as unknown as OnlineUserPresence[]) {
          const sId = raw.sessionId || key;
          if (sId && !seenSessions.has(sId)) {
            seenSessions.add(sId);

            const isMe = sId === clientSessionId;
            const pId = raw.id || 'anonymous';
            let displayName = raw.name || 'Ekip Üyesi';

            // If multiple devices share the same profile (e.g. default "Sen (Proje Lideri)"),
            // differentiate them cleanly so it is clear there are multiple devices online
            if ((profileCounts[pId] || 0) > 1) {
              deviceCounter[pId] = (deviceCounter[pId] || 0) + 1;
              const devNum = deviceCounter[pId];
              if (isMe) {
                displayName = `${displayName} (Bu Cihaz)`;
              } else {
                displayName = `${displayName} (Cihaz #${devNum})`;
              }
            } else if (isMe) {
              displayName = `${displayName} (Siz)`;
            }

            onlineList.push({
              sessionId: sId,
              id: pId,
              name: displayName,
              role: raw.role || 'Geliştirici',
              avatarColor: raw.avatarColor || '#58a6ff',
              isMe,
            });
          }
        }
      }

      // Sort so current client device is first
      onlineList.sort((a, b) => (b.isMe ? 1 : 0) - (a.isMe ? 1 : 0));
      setOnlineUsers(onlineList);
    };

    channel.on('presence', { event: 'sync' }, updatePresenceList);
    channel.on('presence', { event: 'join' }, updatePresenceList);
    channel.on('presence', { event: 'leave' }, updatePresenceList);

    // 3. PostgreSQL database changes fallback
    channel.on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'team_project_state',
      },
      (payload) => {
        if (!isMounted || !payload.new) return;
        if (Date.now() - lastLocalEditRef.current < 2000) return;

        let remoteState = (payload.new as Record<string, unknown>).state;
        if (typeof remoteState === 'string') {
          try {
            remoteState = JSON.parse(remoteState);
          } catch {
            return;
          }
        }
        const stateObj = remoteState as SyncedProjectState;

        isApplyingRemoteRef.current = true;

        if (stateObj.myGameTitle) {
          setMyGameTitle(stateObj.myGameTitle);
          localStorage.setItem('user_game_title', stateObj.myGameTitle);
        }
        if (stateObj.targetDate) {
          setTargetDate(stateObj.targetDate);
          localStorage.setItem('user_game_target_date', stateObj.targetDate);
        }
        if (Array.isArray(stateObj.competitors)) {
          setCompetitors(stateObj.competitors);
          localStorage.setItem('game_competitors', JSON.stringify(stateObj.competitors));
        }
        if (Array.isArray(stateObj.checklist)) {
          setChecklist(stateObj.checklist);
          localStorage.setItem('game_checklist', JSON.stringify(stateObj.checklist));
        }
        if (Array.isArray(stateObj.teamMembers) && setTeamMembers) {
          setTeamMembers(stateObj.teamMembers);
          localStorage.setItem('game_team_members', JSON.stringify(stateObj.teamMembers));
        }
        if (Array.isArray(stateObj.registeredUsers) && setRegisteredUsers) {
          setRegisteredUsers(stateObj.registeredUsers);
          localStorage.setItem('game_registered_users', JSON.stringify(stateObj.registeredUsers));
        }

        const now = new Date().toLocaleTimeString('tr-TR');
        setLastSyncedAt(now);
        setSyncStatus('synced');

        setTimeout(() => {
          isApplyingRemoteRef.current = false;
        }, 300);
      }
    );

    channel.subscribe(async (status) => {
      if (!isMounted) return;
      if (status === 'SUBSCRIBED') {
        setSyncStatus('synced');
        // Track presence immediately with unique sessionId
        const member = currentMemberRef.current;
        await channel.track({
          sessionId: clientSessionId,
          id: member?.id || 'anonymous',
          name: member?.name || 'Ekip Üyesi',
          role: member?.role || 'Geliştirici',
          avatarColor: member?.avatarColor || '#58a6ff',
        });
      } else if (status === 'CHANNEL_ERROR') {
        setSyncStatus('error');
      }
    });

    const handleBeforeUnload = () => {
      if (channelRef.current) {
        channelRef.current.untrack();
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      isMounted = false;
      window.removeEventListener('beforeunload', handleBeforeUnload);
      channel.untrack();
      channel.unsubscribe();
      channelRef.current = null;
    };
  }, [isCloudEnabled, pullFromCloud, setChecklist, setCompetitors, setMyGameTitle, setTargetDate, setTeamMembers, setRegisteredUsers, clientSessionId]);

  // Update presence tracking if current member profile changes without recreating channel
  useEffect(() => {
    if (channelRef.current && currentMember && isCloudEnabled) {
      channelRef.current.track({
        sessionId: clientSessionId,
        id: currentMember.id,
        name: currentMember.name,
        role: currentMember.role,
        avatarColor: currentMember.avatarColor,
      });
    }
  }, [currentMember, isCloudEnabled, clientSessionId]);

  // Broadcast change immediately to peers + Debounced save to DB
  useEffect(() => {
    if (!isCloudEnabled || !isInitialLoadDoneRef.current || isApplyingRemoteRef.current) {
      return;
    }

    const payload: SyncedProjectState = {
      ...latestStateRef.current,
      updatedAt: new Date().toISOString(),
    };

    // 1. Send instantaneous WebSocket broadcast to all connected devices (<50ms)
    if (channelRef.current) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'state_update',
        payload,
      });
    }

    // 2. Debounced save to PostgreSQL DB for persistence
    const client = getSupabaseClient();
    if (!client) return;

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(async () => {
      setSyncStatus('syncing');
      try {
        const { error } = await client.from('team_project_state').upsert({
          id: 'default',
          state: payload,
          updated_at: new Date().toISOString(),
        });

        if (error) {
          console.error('Push to cloud failed:', error.message);
          setSyncStatus('error');
          setErrorMessage(error.message);
        } else {
          setLastSyncedAt(new Date().toLocaleTimeString('tr-TR'));
          setSyncStatus('synced');
          setErrorMessage(null);
        }
      } catch (err: unknown) {
        setSyncStatus('error');
        setErrorMessage((err as Error).message);
      }
    }, 600);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [myGameTitle, targetDate, competitors, checklist, teamMembers, registeredUsers, isCloudEnabled]);

  const togglePauseSync = useCallback(() => {
    const nextPaused = !isPaused;
    if (nextPaused) {
      localStorage.setItem('cloud_sync_paused', 'true');
      setSyncStatus('local');
    } else {
      localStorage.removeItem('cloud_sync_paused');
      setSyncStatus('connecting');
    }
    setIsPaused(nextPaused);
  }, [isPaused]);

  return {
    syncStatus,
    lastSyncedAt,
    errorMessage,
    isCloudEnabled,
    isPaused,
    onlineUsers,
    togglePauseSync,
    pullFromCloud,
  };
};
