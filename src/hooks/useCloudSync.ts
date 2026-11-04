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
  const [syncStatus, setSyncStatus] = useState<CloudSyncStatus>(() => {
    return getSupabaseConfig().isConfigured ? 'connecting' : 'local';
  });
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isApplyingRemoteRef = useRef(false);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isInitialLoadDoneRef = useRef(false);

  const config = getSupabaseConfig();
  const isCloudEnabled = config.isConfigured;

  // Manual trigger to pull latest data from Supabase
  const pullFromCloud = useCallback(async () => {
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
        const remoteState = data.state as SyncedProjectState;
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

        const now = new Date().toLocaleTimeString('tr-TR');
        setLastSyncedAt(now);
        setSyncStatus('synced');

        setTimeout(() => {
          isApplyingRemoteRef.current = false;
        }, 500);
      } else {
        // Table row does not exist yet; seed it with current local state
        const initialPayload: SyncedProjectState = {
          myGameTitle,
          targetDate,
          competitors,
          checklist,
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
      console.error('Error during initial cloud pull:', err);
      setSyncStatus('error');
      setErrorMessage((err as Error).message);
    }
  }, [
    myGameTitle,
    targetDate,
    competitors,
    checklist,
    setMyGameTitle,
    setTargetDate,
    setCompetitors,
    setChecklist,
  ]);

  // Subscribe to Realtime Postgres Changes
  useEffect(() => {
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
          if (payload.new && (payload.new as Record<string, unknown>).state) {
            const remoteState = (payload.new as Record<string, unknown>).state as SyncedProjectState;
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
  }, [pullFromCloud, setChecklist, setCompetitors, setMyGameTitle, setTargetDate]);

  // Push local changes to cloud (Debounced)
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
        const payload: SyncedProjectState = {
          myGameTitle,
          targetDate,
          competitors,
          checklist,
          updatedAt: new Date().toISOString(),
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
    }, 800);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [myGameTitle, targetDate, competitors, checklist, isCloudEnabled]);

  return {
    syncStatus,
    lastSyncedAt,
    errorMessage,
    isCloudEnabled,
    pullFromCloud,
  };
};
