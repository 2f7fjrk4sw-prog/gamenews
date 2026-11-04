import { useState, useEffect, useRef, useCallback } from 'react';
import type { CompetitorGame, ChecklistItem, CloudSyncStatus, SyncedProjectState } from '../types';
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
}: UseCloudSyncProps) => {
  const config = getSupabaseConfig();
  const [isPaused, setIsPaused] = useState<boolean>(() => {
    return localStorage.getItem('cloud_sync_paused') === 'true';
  });

  const isCloudEnabled = config.isConfigured && !isPaused;

  const [syncStatus, setSyncStatus] = useState<CloudSyncStatus>(() => {
    if (isPaused || !config.isConfigured) return 'local';
    return 'connecting';
  });
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Unique session ID to ignore our own echoes from Supabase Realtime
  const [sessionId] = useState<string>(() => Math.random().toString(36).substring(2, 9));

  // Keep a stable ref to the latest state
  const latestStateRef = useRef({
    myGameTitle,
    targetDate,
    competitors,
    checklist,
  });

  // Track the timestamp of the last local edit made by the user
  const lastLocalEditRef = useRef<number>(0);
  const isApplyingRemoteRef = useRef(false);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isInitialLoadDoneRef = useRef(false);

  useEffect(() => {
    latestStateRef.current = {
      myGameTitle,
      targetDate,
      competitors,
      checklist,
    };
    if (!isApplyingRemoteRef.current) {
      lastLocalEditRef.current = Date.now();
    }
  }, [myGameTitle, targetDate, competitors, checklist]);

  // Stable pull function
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
        console.warn('Could not pull from cloud:', error.message);
        setSyncStatus('error');
        setErrorMessage(error.message);
        return;
      }

      if (data && data.state) {
        // If local user has actively edited in the last 4 seconds, protect local input from snap-back
        if (Date.now() - lastLocalEditRef.current < 4000) {
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
        const stateObj = remoteState as SyncedProjectState & { updatedBy?: string };

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

        const now = new Date().toLocaleTimeString('tr-TR');
        setLastSyncedAt(now);
        setSyncStatus('synced');

        setTimeout(() => {
          isApplyingRemoteRef.current = false;
        }, 500);
      } else {
        // Table row does not exist yet; seed it with current local state
        const currentState = latestStateRef.current;
        const initialPayload = {
          ...currentState,
          updatedAt: new Date().toISOString(),
          updatedBy: sessionId,
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
  }, [isPaused, setChecklist, setCompetitors, setMyGameTitle, setTargetDate, sessionId]);

  // Subscribe to Realtime Postgres Changes
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

    const channel = client
      .channel('team_project_state_realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'team_project_state',
          filter: 'id=eq.default',
        },
        (payload) => {
          if (!isMounted) return;

          if (payload.new && (payload.new as Record<string, unknown>).state) {
            let remoteState = (payload.new as Record<string, unknown>).state;
            if (typeof remoteState === 'string') {
              try {
                remoteState = JSON.parse(remoteState);
              } catch {
                return;
              }
            }
            const stateObj = remoteState as SyncedProjectState & { updatedBy?: string };

            // Ignore echoes of changes originating from this tab/session
            if (stateObj?.updatedBy === sessionId) {
              return;
            }

            // If user has edited locally in the last 4 seconds, protect local input from snap-back
            if (Date.now() - lastLocalEditRef.current < 4000) {
              return;
            }

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

            const now = new Date().toLocaleTimeString('tr-TR');
            setLastSyncedAt(now);
            setSyncStatus('synced');

            setTimeout(() => {
              isApplyingRemoteRef.current = false;
            }, 500);
          }
        }
      )
      .subscribe((status) => {
        if (!isMounted) return;
        if (status === 'SUBSCRIBED') {
          setSyncStatus('synced');
        } else if (status === 'CHANNEL_ERROR') {
          setSyncStatus('error');
        }
      });

    return () => {
      isMounted = false;
      channel.unsubscribe();
    };
  }, [isCloudEnabled, pullFromCloud, sessionId, setChecklist, setCompetitors, setMyGameTitle, setTargetDate]);

  // Debounced push of local changes to cloud
  useEffect(() => {
    if (!isCloudEnabled || !isInitialLoadDoneRef.current || isApplyingRemoteRef.current) {
      return;
    }

    const client = getSupabaseClient();
    if (!client) return;

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(async () => {
      setSyncStatus('syncing');
      try {
        const payload = {
          ...latestStateRef.current,
          updatedAt: new Date().toISOString(),
          updatedBy: sessionId,
        };

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
    }, 1000);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [myGameTitle, targetDate, competitors, checklist, isCloudEnabled, sessionId]);

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
    togglePauseSync,
    pullFromCloud,
  };
};
