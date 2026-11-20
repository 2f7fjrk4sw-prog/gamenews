import { useState, useEffect, useRef, useCallback } from 'react';
import type {
  CompetitorGame,
  ChecklistItem,
  CloudSyncStatus,
  SyncedProjectState,
  TeamMember,
  TeamUser,
  TeamWorkspace,
  OnlineUserPresence,
} from '../types';
import {
  getSupabaseClient,
  getSupabaseConfig,
  fetchCloudTeams,
  saveTeamsDirectoryToCloud,
  fetchTeamStateFromCloud,
  saveTeamStateToCloud,
  loadLocalTeamState,
  saveLocalTeamState,
  mergeTeamsLists,
} from '../lib/supabase';

interface UseCloudSyncProps {
  activeTeamId: string;
  teamName: string;
  setTeamName: (name: string) => void;
  myGameTitle: string;
  setMyGameTitle: (title: string) => void;
  targetDate: string;
  setTargetDate: (date: string) => void;
  competitors: CompetitorGame[];
  setCompetitors: React.Dispatch<React.SetStateAction<CompetitorGame[]>>;
  checklist: ChecklistItem[];
  setChecklist: React.Dispatch<React.SetStateAction<ChecklistItem[]>>;
  teamMembers: TeamMember[];
  setTeamMembers: React.Dispatch<React.SetStateAction<TeamMember[]>>;
  currentMember?: TeamMember;
  registeredUsers: TeamUser[];
  setRegisteredUsers: React.Dispatch<React.SetStateAction<TeamUser[]>>;
  teams: TeamWorkspace[];
  setTeams: React.Dispatch<React.SetStateAction<TeamWorkspace[]>>;
}

export const useCloudSync = ({
  activeTeamId,
  teamName,
  setTeamName,
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
  teams,
  setTeams,
}: UseCloudSyncProps) => {
  const config = getSupabaseConfig();
  const [isPaused, setIsPaused] = useState<boolean>(() => {
    return localStorage.getItem('cloud_sync_paused') === 'true';
  });

  const isCloudEnabled = config.isConfigured && !isPaused;

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

  const currentMemberRef = useRef(currentMember);
  useEffect(() => {
    currentMemberRef.current = currentMember;
  }, [currentMember]);

  const latestStateRef = useRef({
    teamName,
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
      teamName,
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
  }, [teamName, myGameTitle, targetDate, competitors, checklist, teamMembers, registeredUsers]);

  const applyRemoteSnapshot = useCallback(
    (stateObj: SyncedProjectState, targetTeamId: string) => {
      isApplyingRemoteRef.current = true;

      if (stateObj.teamName) {
        setTeamName(stateObj.teamName);
      }
      if (stateObj.myGameTitle) {
        setMyGameTitle(stateObj.myGameTitle);
      }
      if (stateObj.targetDate) {
        setTargetDate(stateObj.targetDate);
      }
      if (Array.isArray(stateObj.competitors)) {
        setCompetitors(stateObj.competitors);
      }
      if (Array.isArray(stateObj.checklist)) {
        setChecklist(stateObj.checklist);
      }
      if (Array.isArray(stateObj.teamMembers)) {
        setTeamMembers(stateObj.teamMembers);
      }
      if (Array.isArray(stateObj.registeredUsers)) {
        setRegisteredUsers(stateObj.registeredUsers);
        localStorage.setItem('game_registered_users', JSON.stringify(stateObj.registeredUsers));
      }

      saveLocalTeamState(targetTeamId, {
        ...stateObj,
        teamId: targetTeamId,
      });

      setLastSyncedAt(new Date().toLocaleTimeString('tr-TR'));
      setSyncStatus('synced');

      setTimeout(() => {
        isApplyingRemoteRef.current = false;
      }, 300);
    },
    [setChecklist, setCompetitors, setMyGameTitle, setRegisteredUsers, setTargetDate, setTeamMembers, setTeamName]
  );

  // Pull latest snapshot for the active team (respecting newer local timestamps)
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

      // 1. Sync teams directory (merge so local creations are never lost)
      const mergedTeams = await fetchCloudTeams();
      if (mergedTeams.length > 0) {
        setTeams((prev) => mergeTeamsLists(prev, mergedTeams));
      }

      // 2. Fetch state for the active team
      const remoteState = await fetchTeamStateFromCloud(activeTeamId);
      const localState = loadLocalTeamState(activeTeamId);

      if (remoteState) {
        if (isInitialLoadDoneRef.current && Date.now() - lastLocalEditRef.current < 3000) {
          setSyncStatus('synced');
          return;
        }

        const localTime = localState?.updatedAt ? Date.parse(localState.updatedAt) || 0 : 0;
        const remoteTime = remoteState.updatedAt ? Date.parse(remoteState.updatedAt) || 0 : 0;

        if (localState && localTime > remoteTime) {
          // Local copy is newer: keep local and push it to cloud
          await saveTeamStateToCloud(activeTeamId, localState);
          setLastSyncedAt(new Date().toLocaleTimeString('tr-TR'));
          setSyncStatus('synced');
        } else {
          applyRemoteSnapshot(remoteState, activeTeamId);
        }
      } else {
        // Team does not exist on cloud yet; upload local state immediately
        const current = latestStateRef.current;
        const initialPayload: SyncedProjectState = {
          teamId: activeTeamId,
          teamName: current.teamName,
          myGameTitle: current.myGameTitle,
          targetDate: current.targetDate,
          competitors: current.competitors,
          checklist: current.checklist,
          teamMembers: current.teamMembers,
          updatedAt: new Date().toISOString(),
        };
        await saveTeamStateToCloud(activeTeamId, initialPayload);
        setLastSyncedAt(new Date().toLocaleTimeString('tr-TR'));
        setSyncStatus('synced');
      }
    } catch (err: unknown) {
      console.error('Error during cloud pull:', err);
      setSyncStatus('error');
      setErrorMessage((err as Error).message);
    }
  }, [activeTeamId, applyRemoteSnapshot, isPaused, setTeams]);

  // Real-time WebSocket Channel per Team
  useEffect(() => {
    isInitialLoadDoneRef.current = false;

    if (!isCloudEnabled) {
      isInitialLoadDoneRef.current = true;
      return;
    }

    const client = getSupabaseClient();
    if (!client) {
      isInitialLoadDoneRef.current = true;
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

    const channel = client.channel(`team_sync_room_${activeTeamId}`, {
      config: {
        broadcast: { self: false },
        presence: { key: clientSessionId },
      },
    });

    channelRef.current = channel;

    channel.on('broadcast', { event: 'state_update' }, ({ payload }) => {
      if (!isMounted || !payload) return;
      if (Date.now() - lastLocalEditRef.current < 2000) return;

      const remoteState = payload as SyncedProjectState;
      if (remoteState.teamId && remoteState.teamId !== activeTeamId) return;
      applyRemoteSnapshot(remoteState, activeTeamId);
    });

    const updatePresenceList = () => {
      if (!isMounted) return;
      const state = channel.presenceState();
      const onlineList: OnlineUserPresence[] = [];
      const seenSessions = new Set<string>();
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

            if ((profileCounts[pId] || 0) > 1) {
              deviceCounter[pId] = (deviceCounter[pId] || 0) + 1;
              displayName = isMe
                ? `${displayName} (Bu Cihaz)`
                : `${displayName} (Cihaz #${deviceCounter[pId]})`;
            } else if (isMe) {
              displayName = `${displayName} (Siz)`;
            }

            onlineList.push({
              sessionId: sId,
              id: pId,
              name: displayName,
              role: raw.role || 'Geliştirici',
              avatarColor: raw.avatarColor || '#4f83cc',
              isMe,
            });
          }
        }
      }

      onlineList.sort((a, b) => (b.isMe ? 1 : 0) - (a.isMe ? 1 : 0));
      setOnlineUsers(onlineList);
    };

    channel.on('presence', { event: 'sync' }, updatePresenceList);
    channel.on('presence', { event: 'join' }, updatePresenceList);
    channel.on('presence', { event: 'leave' }, updatePresenceList);

    channel.on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'team_project_state',
      },
      (payload) => {
        if (!isMounted || !payload.new) return;
        const row = payload.new as { id?: string; state?: unknown };

        if (row.id === 'teams_directory' && row.state) {
          const raw = typeof row.state === 'string' ? JSON.parse(row.state) : row.state;
          if (Array.isArray(raw.teams)) {
            setTeams((prev) => mergeTeamsLists(prev, raw.teams));
          }
          return;
        }

        if (row.id !== `team_${activeTeamId}`) return;
        if (Date.now() - lastLocalEditRef.current < 2000) return;

        let remoteState = row.state;
        if (typeof remoteState === 'string') {
          try {
            remoteState = JSON.parse(remoteState);
          } catch {
            return;
          }
        }
        applyRemoteSnapshot(remoteState as SyncedProjectState, activeTeamId);
      }
    );

    channel.subscribe(async (status) => {
      if (!isMounted) return;
      if (status === 'SUBSCRIBED') {
        setSyncStatus('synced');
        const member = currentMemberRef.current;
        await channel.track({
          sessionId: clientSessionId,
          id: member?.id || 'anonymous',
          name: member?.name || 'Ekip Üyesi',
          role: member?.role || 'Geliştirici',
          avatarColor: member?.avatarColor || '#4f83cc',
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
  }, [activeTeamId, applyRemoteSnapshot, clientSessionId, isCloudEnabled, pullFromCloud, setTeams]);

  // Update presence if current member changes
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

  // Persist active team state immediately to localStorage + debounced sync to Supabase
  useEffect(() => {
    if (!isInitialLoadDoneRef.current || isApplyingRemoteRef.current) {
      return;
    }

    const nowIso = new Date().toISOString();
    const payload: SyncedProjectState = {
      teamId: activeTeamId,
      teamName,
      myGameTitle,
      targetDate,
      competitors,
      checklist,
      teamMembers,
      updatedAt: nowIso,
    };

    // Always persist locally immediately so refresh never loses edits
    saveLocalTeamState(activeTeamId, payload);

    if (!isCloudEnabled) {
      return;
    }

    if (channelRef.current) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'state_update',
        payload,
      });
    }

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(async () => {
      setSyncStatus('syncing');
      const ok = await saveTeamStateToCloud(activeTeamId, payload);
      await saveTeamsDirectoryToCloud(teams);
      if (ok) {
        setLastSyncedAt(new Date().toLocaleTimeString('tr-TR'));
        setSyncStatus('synced');
        setErrorMessage(null);
      } else {
        setSyncStatus('error');
        setErrorMessage('Değişiklikler buluta yazılamadı, yerel olarak saklandı.');
      }
    }, 450);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [activeTeamId, teamName, myGameTitle, targetDate, competitors, checklist, teamMembers, teams, isCloudEnabled]);

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
    syncStatus: !isCloudEnabled ? ('local' as CloudSyncStatus) : syncStatus,
    lastSyncedAt,
    errorMessage,
    isCloudEnabled,
    isPaused,
    onlineUsers,
    togglePauseSync,
    pullFromCloud,
  };
};
