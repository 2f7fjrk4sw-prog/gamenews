import { useState, useEffect, useCallback, useMemo } from 'react';
import type {
  CompetitorGame,
  ChecklistItem,
  TeamMember,
  TeamUser,
  TeamWorkspace,
  SyncedProjectState,
} from './types';
import { initialCompetitors } from './data/competitors';
import { initialChecklist } from './data/launchChecklist';
import { initialTeamMembers } from './data/teamMembers';
import { marketingChannels } from './data/marketingChannels';
import { pitchTemplates } from './data/pitchTemplates';
import { steamFestivals } from './data/steamFestivals';
import {
  fetchCloudUsers,
  saveUserToCloud,
  fetchCloudTeams,
  saveTeamsDirectoryToCloud,
  fetchTeamStateFromCloud,
  saveTeamStateToCloud,
  loadLocalTeams,
  saveLocalTeams,
  loadLocalTeamState,
  saveLocalTeamState,
  mergeTeamsLists,
  generateInviteCode,
  ACTIVE_TEAM_STORAGE_KEY,
} from './lib/supabase';

import { Navbar, type ActiveTab } from './components/Navbar';
import { RadarSection } from './components/RadarSection';
import { PromotionHubSection } from './components/PromotionHubSection';
import { ChecklistSection } from './components/ChecklistSection';
import { GuideSection } from './components/GuideSection';
import { ReportExportSection } from './components/ReportExportSection';
import { AuthGate } from './components/AuthGate';
import { CloudSyncModal } from './components/CloudSyncModal';
import { TeamManagementModal } from './components/TeamManagementModal';
import { useCloudSync } from './hooks/useCloudSync';

import './App.css';

const getDefaultTargetDate = (): string => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const todayStr = `${year}-${month}-${day}`;
  const saved = localStorage.getItem('user_game_target_date');
  if (saved && saved >= todayStr) return saved;
  return '2026-11-20' >= todayStr ? '2026-11-20' : todayStr;
};

const createSeedDefaultTeam = (): TeamWorkspace => {
  const nowIso = new Date().toISOString();
  const savedTitle = localStorage.getItem('user_game_title') || 'Oyunumuz';
  return {
    id: 'team_default',
    teamName: localStorage.getItem('user_team_name') || 'Ana Ekip',
    gameTitle: savedTitle,
    targetDate: getDefaultTargetDate(),
    inviteCode: 'EKIP-01',
    createdAt: nowIso,
    updatedAt: nowIso,
  };
};

function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('radar');
  const [isCloudModalOpen, setIsCloudModalOpen] = useState(false);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);

  // Teams Directory (Persistent in localStorage + Supabase)
  const [teams, setTeams] = useState<TeamWorkspace[]>(() => {
    const local = loadLocalTeams();
    if (local.length > 0) return local;
    const seeded = [createSeedDefaultTeam()];
    saveLocalTeams(seeded);
    return seeded;
  });

  const [activeTeamId, setActiveTeamId] = useState<string>(() => {
    const savedActive = localStorage.getItem(ACTIVE_TEAM_STORAGE_KEY);
    const local = loadLocalTeams();
    if (savedActive && local.some((t) => t.id === savedActive)) {
      return savedActive;
    }
    return local[0]?.id || 'team_default';
  });

  const activeTeam: TeamWorkspace = useMemo(() => {
    return teams.find((t) => t.id === activeTeamId) || teams[0] || createSeedDefaultTeam();
  }, [teams, activeTeamId]);

  // Active Team State
  const initialActiveSnapshot = useMemo(() => {
    return loadLocalTeamState(activeTeamId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [teamName, setTeamName] = useState<string>(() => {
    return initialActiveSnapshot?.teamName || activeTeam.teamName || 'Ana Ekip';
  });

  const [myGameTitle, setMyGameTitle] = useState<string>(() => {
    return (
      initialActiveSnapshot?.myGameTitle ||
      activeTeam.gameTitle ||
      localStorage.getItem('user_game_title') ||
      'Oyunumuz'
    );
  });

  const [targetDate, setTargetDate] = useState<string>(() => {
    return initialActiveSnapshot?.targetDate || activeTeam.targetDate || getDefaultTargetDate();
  });

  const [competitors, setCompetitors] = useState<CompetitorGame[]>(() => {
    if (Array.isArray(initialActiveSnapshot?.competitors)) {
      return initialActiveSnapshot.competitors;
    }
    const saved = localStorage.getItem('game_competitors');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // ignore
      }
    }
    return initialCompetitors;
  });

  const [checklist, setChecklist] = useState<ChecklistItem[]>(() => {
    if (Array.isArray(initialActiveSnapshot?.checklist)) {
      return initialActiveSnapshot.checklist;
    }
    const saved = localStorage.getItem('game_checklist');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // ignore
      }
    }
    return initialChecklist;
  });

  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(() => {
    if (Array.isArray(initialActiveSnapshot?.teamMembers)) {
      return initialActiveSnapshot.teamMembers;
    }
    const saved = localStorage.getItem('game_team_members');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // ignore
      }
    }
    return initialTeamMembers;
  });

  const [currentMemberId, setCurrentMemberId] = useState<string>(() => {
    return localStorage.getItem('current_team_member_id') || 'member-lead';
  });

  // Registered Users (shared across teams)
  const [registeredUsers, setRegisteredUsers] = useState<TeamUser[]>(() => {
    try {
      const saved = localStorage.getItem('game_registered_users');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [currentUser, setCurrentUser] = useState<TeamUser | null>(() => {
    try {
      const saved =
        localStorage.getItem('radar_active_user') || sessionStorage.getItem('radar_active_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Persist activeTeamId & teams list whenever they change
  useEffect(() => {
    localStorage.setItem(ACTIVE_TEAM_STORAGE_KEY, activeTeamId);
  }, [activeTeamId]);

  useEffect(() => {
    saveLocalTeams(teams);
  }, [teams]);

  // Fetch registered users & teams directory from cloud on mount
  useEffect(() => {
    fetchCloudUsers().then((cloudUsers) => {
      if (cloudUsers && cloudUsers.length > 0) {
        setRegisteredUsers(cloudUsers);
      }
    });

    fetchCloudTeams().then((cloudTeams) => {
      if (cloudTeams && cloudTeams.length > 0) {
        setTeams((prev) => mergeTeamsLists(prev, cloudTeams));
      }
    });
  }, []);

  // Keep activeTeam metadata in sync when teamName, myGameTitle, or targetDate changes
  useEffect(() => {
    setTeams((prev) => {
      let changed = false;
      const next = prev.map((t) => {
        if (t.id !== activeTeamId) return t;
        if (
          t.teamName === teamName &&
          t.gameTitle === myGameTitle &&
          t.targetDate === targetDate
        ) {
          return t;
        }
        changed = true;
        return {
          ...t,
          teamName,
          gameTitle: myGameTitle,
          targetDate,
          updatedAt: new Date().toISOString(),
        };
      });
      return changed ? next : prev;
    });
  }, [activeTeamId, teamName, myGameTitle, targetDate]);

  // Helper to apply a team's state cleanly into React state
  const applyTeamStateToUI = useCallback(
    (team: TeamWorkspace, snapshot: SyncedProjectState | null) => {
      setTeamName(snapshot?.teamName || team.teamName);
      setMyGameTitle(snapshot?.myGameTitle || team.gameTitle);
      setTargetDate(snapshot?.targetDate || team.targetDate);
      setCompetitors(
        Array.isArray(snapshot?.competitors) ? snapshot.competitors : initialCompetitors
      );
      setChecklist(Array.isArray(snapshot?.checklist) ? snapshot.checklist : initialChecklist);
      setTeamMembers(
        Array.isArray(snapshot?.teamMembers) ? snapshot.teamMembers : initialTeamMembers
      );
    },
    []
  );

  // Switch active team
  const handleSwitchTeam = useCallback(
    async (nextTeamId: string) => {
      if (nextTeamId === activeTeamId) return;

      // Save current team snapshot before switching
      const currentSnapshot: SyncedProjectState = {
        teamId: activeTeamId,
        teamName,
        myGameTitle,
        targetDate,
        competitors,
        checklist,
        teamMembers,
        updatedAt: new Date().toISOString(),
      };
      saveLocalTeamState(activeTeamId, currentSnapshot);

      const targetTeam = teams.find((t) => t.id === nextTeamId);
      if (!targetTeam) return;

      const localTarget = loadLocalTeamState(nextTeamId);
      applyTeamStateToUI(targetTeam, localTarget);
      setActiveTeamId(nextTeamId);
      localStorage.setItem(ACTIVE_TEAM_STORAGE_KEY, nextTeamId);

      // Check cloud for fresher snapshot
      const cloudTarget = await fetchTeamStateFromCloud(nextTeamId);
      if (cloudTarget) {
        const localTime = localTarget?.updatedAt ? Date.parse(localTarget.updatedAt) || 0 : 0;
        const cloudTime = cloudTarget.updatedAt ? Date.parse(cloudTarget.updatedAt) || 0 : 0;
        if (!localTarget || cloudTime > localTime) {
          saveLocalTeamState(nextTeamId, cloudTarget);
          applyTeamStateToUI(targetTeam, cloudTarget);
        }
      }
    },
    [
      activeTeamId,
      applyTeamStateToUI,
      checklist,
      competitors,
      myGameTitle,
      targetDate,
      teamMembers,
      teamName,
      teams,
    ]
  );

  // Create a brand new team & its game (persists immediately!)
  const handleCreateTeam = useCallback(
    async ({
      teamName: newTName,
      gameTitle: newGTitle,
      targetDate: newTDate,
    }: {
      teamName: string;
      gameTitle: string;
      targetDate: string;
    }) => {
      const nowIso = new Date().toISOString();
      const newId = `team_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 5)}`;
      const newTeam: TeamWorkspace = {
        id: newId,
        teamName: newTName,
        gameTitle: newGTitle,
        targetDate: newTDate,
        inviteCode: generateInviteCode(newTName),
        createdAt: nowIso,
        updatedAt: nowIso,
      };

      const initialMembers: TeamMember[] = currentUser
        ? [
            {
              id: currentUser.id,
              name: currentUser.name,
              role: currentUser.role,
              avatarColor: currentUser.avatarColor,
              joinedAt: nowIso.split('T')[0],
            },
          ]
        : initialTeamMembers;

      const newSnapshot: SyncedProjectState = {
        teamId: newId,
        teamName: newTName,
        myGameTitle: newGTitle,
        targetDate: newTDate,
        competitors: initialCompetitors,
        checklist: initialChecklist,
        teamMembers: initialMembers,
        updatedAt: nowIso,
      };

      // Persist synchronously to localStorage first
      const updatedTeams = [...teams, newTeam];
      saveLocalTeams(updatedTeams);
      saveLocalTeamState(newId, newSnapshot);
      localStorage.setItem(ACTIVE_TEAM_STORAGE_KEY, newId);

      setTeams(updatedTeams);
      setActiveTeamId(newId);
      applyTeamStateToUI(newTeam, newSnapshot);

      // Persist immediately to Supabase
      await saveTeamsDirectoryToCloud(updatedTeams);
      await saveTeamStateToCloud(newId, newSnapshot);
    },
    [applyTeamStateToUI, currentUser, teams]
  );

  // Explicitly save active team's name, game title, and target date
  const handleUpdateActiveTeam = useCallback(
    async ({
      teamName: nextTeamName,
      gameTitle: nextGameTitle,
      targetDate: nextTargetDate,
    }: {
      teamName: string;
      gameTitle: string;
      targetDate: string;
    }) => {
      const nowIso = new Date().toISOString();

      setTeamName(nextTeamName);
      setMyGameTitle(nextGameTitle);
      setTargetDate(nextTargetDate);

      const updatedTeams = teams.map((t) =>
        t.id === activeTeamId
          ? {
              ...t,
              teamName: nextTeamName,
              gameTitle: nextGameTitle,
              targetDate: nextTargetDate,
              updatedAt: nowIso,
            }
          : t
      );
      setTeams(updatedTeams);
      saveLocalTeams(updatedTeams);

      const snapshot: SyncedProjectState = {
        teamId: activeTeamId,
        teamName: nextTeamName,
        myGameTitle: nextGameTitle,
        targetDate: nextTargetDate,
        competitors,
        checklist,
        teamMembers,
        updatedAt: nowIso,
      };
      saveLocalTeamState(activeTeamId, snapshot);

      await saveTeamsDirectoryToCloud(updatedTeams);
      await saveTeamStateToCloud(activeTeamId, snapshot);
    },
    [activeTeamId, checklist, competitors, teamMembers, teams]
  );

  const handleDeleteTeam = useCallback(
    async (teamIdToDelete: string) => {
      if (teams.length <= 1) return;
      const updatedTeams = teams.filter((t) => t.id !== teamIdToDelete);
      setTeams(updatedTeams);
      saveLocalTeams(updatedTeams);
      localStorage.removeItem(`radar_team_state_${teamIdToDelete}`);

      if (activeTeamId === teamIdToDelete && updatedTeams[0]) {
        const fallback = updatedTeams[0];
        const snap = loadLocalTeamState(fallback.id);
        setActiveTeamId(fallback.id);
        localStorage.setItem(ACTIVE_TEAM_STORAGE_KEY, fallback.id);
        applyTeamStateToUI(fallback, snap);
      }

      await saveTeamsDirectoryToCloud(updatedTeams);
    },
    [activeTeamId, applyTeamStateToUI, teams]
  );

  const handleJoinTeamByCode = useCallback(
    async (code: string): Promise<{ success: boolean; message: string }> => {
      const normalized = code.trim().toUpperCase();
      // Pull freshest directory from cloud first
      const cloudTeams = await fetchCloudTeams();
      const pool = mergeTeamsLists(teams, cloudTeams);
      setTeams(pool);

      const match = pool.find((t) => t.inviteCode.toUpperCase() === normalized);
      if (!match) {
        return {
          success: false,
          message: 'Bu koda sahip bir ekip bulunamadı. Kodu kontrol edip tekrar deneyin.',
        };
      }

      await handleSwitchTeam(match.id);
      return {
        success: true,
        message: `"${match.teamName}" (${match.gameTitle}) ekibine geçildi.`,
      };
    },
    [handleSwitchTeam, teams]
  );

  // User registration & updates
  const handleRegisterUser = async (newUser: TeamUser): Promise<boolean> => {
    setRegisteredUsers((prev) => {
      const filtered = prev.filter(
        (u) => u.username.toLowerCase() !== newUser.username.toLowerCase()
      );
      const next = [...filtered, newUser];
      localStorage.setItem('game_registered_users', JSON.stringify(next));
      return next;
    });

    setTeamMembers((prev) => {
      if (prev.some((m) => m.id === newUser.id)) return prev;
      return [
        ...prev,
        {
          id: newUser.id,
          name: newUser.name,
          role: newUser.role,
          avatarColor: newUser.avatarColor,
          joinedAt: newUser.createdAt,
        },
      ];
    });

    await saveUserToCloud(newUser);
    return true;
  };

  const handleUpdateUser = async (updatedUser: TeamUser): Promise<boolean> => {
    setRegisteredUsers((prev) => {
      const next = prev.map((u) => (u.id === updatedUser.id ? updatedUser : u));
      localStorage.setItem('game_registered_users', JSON.stringify(next));
      return next;
    });
    setCurrentUser(updatedUser);
    localStorage.setItem('radar_active_user', JSON.stringify(updatedUser));
    await saveUserToCloud(updatedUser);
    return true;
  };

  const currentMember: TeamMember = currentUser
    ? {
        id: currentUser.id,
        name: currentUser.name,
        role: currentUser.role,
        avatarColor: currentUser.avatarColor,
        joinedAt: currentUser.createdAt,
      }
    : teamMembers.find((m) => m.id === currentMemberId) || teamMembers[0];

  const {
    syncStatus,
    lastSyncedAt,
    errorMessage: cloudError,
    isPaused,
    onlineUsers,
    togglePauseSync,
    pullFromCloud,
  } = useCloudSync({
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
  });

  const criticalCollisionsCount = competitors.filter((comp) => {
    const compTime = new Date(comp.releaseDate).getTime();
    const myTime = new Date(targetDate).getTime();
    const diffDays = Math.round((compTime - myTime) / (1000 * 60 * 60 * 24));
    const isHighTier =
      comp.wishlistTier === 'Very High (100k+)' || comp.wishlistTier === 'High (50k-100k)';
    return Math.abs(diffDays) <= 7 && isHighTier;
  }).length;

  const totalTasks = checklist.length;
  const completedTasks = checklist.filter((item) => item.isDone).length;
  const checklistProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <AuthGate
      registeredUsers={registeredUsers}
      onRegisterUser={handleRegisterUser}
      onUpdateUser={handleUpdateUser}
      currentUser={currentUser}
      setCurrentUser={setCurrentUser}
    >
      {({ onLogout, openChangePassword }) => (
        <div className="clean-app">
          <Navbar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            criticalCollisionsCount={criticalCollisionsCount}
            checklistProgress={checklistProgress}
            syncStatus={syncStatus}
            openCloudModal={() => setIsCloudModalOpen(true)}
            activeTeam={{
              ...activeTeam,
              teamName,
              gameTitle: myGameTitle,
              targetDate,
            }}
            onlineCount={onlineUsers.length}
            openTeamModal={() => setIsTeamModalOpen(true)}
            onLogout={onLogout}
            openChangePassword={openChangePassword}
          />

          <main className="clean-main">
            {activeTab === 'radar' && (
              <RadarSection
                competitors={competitors}
                setCompetitors={setCompetitors}
                targetDate={targetDate}
                setTargetDate={setTargetDate}
                teamName={teamName}
                myGameTitle={myGameTitle}
                onSaveTeamAndGame={handleUpdateActiveTeam}
                onOpenTeamModal={() => setIsTeamModalOpen(true)}
              />
            )}

            {activeTab === 'checklist' && (
              <ChecklistSection checklist={checklist} setChecklist={setChecklist} />
            )}

            {activeTab === 'promo' && (
              <PromotionHubSection
                myGameTitle={myGameTitle}
                teamName={teamName}
                channels={marketingChannels}
                pitchTemplates={pitchTemplates}
              />
            )}

            {activeTab === 'guide' && (
              <GuideSection festivals={steamFestivals} targetDate={targetDate} />
            )}

            {activeTab === 'report' && (
              <ReportExportSection
                teamName={teamName}
                myGameTitle={myGameTitle}
                setMyGameTitle={setMyGameTitle}
                targetDate={targetDate}
                setTargetDate={setTargetDate}
                competitors={competitors}
                setCompetitors={setCompetitors}
                checklist={checklist}
                setChecklist={setChecklist}
                criticalCollisionsCount={criticalCollisionsCount}
                checklistProgress={checklistProgress}
              />
            )}
          </main>

          <footer className="clean-footer">
            <div className="footer-inner">
              <span>
                {teamName} · {myGameTitle}
              </span>
              <span className="footer-mute">
                {syncStatus === 'synced'
                  ? 'Bulut Senkronizasyonu Aktif'
                  : 'Yerel Tarayıcı Kaydı Aktif'}
              </span>
            </div>
          </footer>

          <CloudSyncModal
            isOpen={isCloudModalOpen}
            onClose={() => setIsCloudModalOpen(false)}
            syncStatus={syncStatus}
            lastSyncedAt={lastSyncedAt}
            errorMessage={cloudError}
            isPaused={isPaused}
            onTogglePause={togglePauseSync}
            onRefresh={pullFromCloud}
          />

          <TeamManagementModal
            isOpen={isTeamModalOpen}
            onClose={() => setIsTeamModalOpen(false)}
            teams={teams}
            activeTeam={{
              ...activeTeam,
              teamName,
              gameTitle: myGameTitle,
              targetDate,
            }}
            onSwitchTeam={handleSwitchTeam}
            onCreateTeam={handleCreateTeam}
            onUpdateActiveTeam={handleUpdateActiveTeam}
            onDeleteTeam={handleDeleteTeam}
            onJoinTeamByCode={handleJoinTeamByCode}
            teamMembers={teamMembers}
            setTeamMembers={setTeamMembers}
            currentMemberId={currentUser ? currentUser.id : currentMemberId}
            setCurrentMemberId={setCurrentMemberId}
            onlineUsers={onlineUsers}
          />
        </div>
      )}
    </AuthGate>
  );
}

export default App;
