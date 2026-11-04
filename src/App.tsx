import { useState, useEffect } from 'react';
import type { CompetitorGame, ChecklistItem, TeamMember } from './types';
import { initialCompetitors } from './data/competitors';
import { initialChecklist } from './data/launchChecklist';
import { initialTeamMembers } from './data/teamMembers';
import { marketingChannels } from './data/marketingChannels';
import { pitchTemplates } from './data/pitchTemplates';
import { steamFestivals } from './data/steamFestivals';

import { Navbar, type ActiveTab } from './components/Navbar';
import { RadarSection } from './components/RadarSection';
import { SocialMediaSection } from './components/SocialMediaSection';
import { MarketingSection } from './components/MarketingSection';
import { PitchStudioSection } from './components/PitchStudioSection';
import { ChecklistSection } from './components/ChecklistSection';
import { GuideSection } from './components/GuideSection';
import { ReportExportSection } from './components/ReportExportSection';
import { AuthGate } from './components/AuthGate';
import { CloudSyncModal } from './components/CloudSyncModal';
import { TeamManagementModal } from './components/TeamManagementModal';
import { useCloudSync } from './hooks/useCloudSync';

import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('radar');
  const [isCloudModalOpen, setIsCloudModalOpen] = useState(false);

  // Developer's Game Configuration (Persistent in localStorage)
  const [targetDate, setTargetDate] = useState<string>(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const todayStr = `${year}-${month}-${day}`;

    const saved = localStorage.getItem('user_game_target_date');
    if (saved && saved >= todayStr) {
      return saved;
    }
    return '2026-11-20' >= todayStr ? '2026-11-20' : todayStr;
  });

  const [myGameTitle, setMyGameTitle] = useState<string>(() => {
    return localStorage.getItem('user_game_title') || 'Kaos Ekibi';
  });

  // Competitors Data (Persistent in localStorage)
  const [competitors, setCompetitors] = useState<CompetitorGame[]>(() => {
    const saved = localStorage.getItem('game_competitors');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error loading saved competitors', e);
      }
    }
    return initialCompetitors;
  });

  // Launch Checklist Data (Persistent in localStorage)
  const [checklist, setChecklist] = useState<ChecklistItem[]>(() => {
    const saved = localStorage.getItem('game_checklist');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error loading saved checklist', e);
      }
    }
    return initialChecklist;
  });

  // Team Members Data (Persistent in localStorage & Supabase)
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(() => {
    const saved = localStorage.getItem('game_team_members');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error loading saved team members', e);
      }
    }
    return initialTeamMembers;
  });

  const [currentMemberId, setCurrentMemberId] = useState<string>(() => {
    return localStorage.getItem('current_team_member_id') || 'member-lead';
  });

  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('user_game_target_date', targetDate);
  }, [targetDate]);

  useEffect(() => {
    localStorage.setItem('user_game_title', myGameTitle);
  }, [myGameTitle]);

  useEffect(() => {
    localStorage.setItem('game_team_members', JSON.stringify(teamMembers));
  }, [teamMembers]);

  const currentMember = teamMembers.find((m) => m.id === currentMemberId) || teamMembers[0];

  // Real-time Cloud Synchronization (Supabase)
  const {
    syncStatus,
    lastSyncedAt,
    errorMessage: cloudError,
    isPaused,
    onlineUsers,
    togglePauseSync,
    pullFromCloud,
  } = useCloudSync({
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
  });

  // Compute collision risk count
  const criticalCollisionsCount = competitors.filter((comp) => {
    const compTime = new Date(comp.releaseDate).getTime();
    const myTime = new Date(targetDate).getTime();
    const diffDays = Math.round((compTime - myTime) / (1000 * 60 * 60 * 24));
    const isHighTier = comp.wishlistTier === 'Very High (100k+)' || comp.wishlistTier === 'High (50k-100k)';
    return Math.abs(diffDays) <= 7 && isHighTier;
  }).length;

  // Compute checklist progress percentage
  const totalTasks = checklist.length;
  const completedTasks = checklist.filter((item) => item.isDone).length;
  const checklistProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <AuthGate>
      {({ onLogout, openChangePassword }) => (
        <div className="clean-app">
          <Navbar 
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            criticalCollisionsCount={criticalCollisionsCount}
            checklistProgress={checklistProgress}
            syncStatus={syncStatus}
            openCloudModal={() => setIsCloudModalOpen(true)}
            teamMembers={teamMembers}
            currentMemberId={currentMemberId}
            onlineUsers={onlineUsers}
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
                myGameTitle={myGameTitle}
                setMyGameTitle={setMyGameTitle}
              />
            )}

            {activeTab === 'social' && (
              <SocialMediaSection 
                myGameTitle={myGameTitle}
              />
            )}

            {activeTab === 'marketing' && (
              <MarketingSection channels={marketingChannels} />
            )}

            {activeTab === 'pitch' && (
              <PitchStudioSection 
                templates={pitchTemplates} 
                myGameTitle={myGameTitle}
              />
            )}

            {activeTab === 'checklist' && (
              <ChecklistSection 
                checklist={checklist}
                setChecklist={setChecklist}
              />
            )}

            {activeTab === 'guide' && (
              <GuideSection 
                festivals={steamFestivals}
                targetDate={targetDate}
              />
            )}

            {activeTab === 'report' && (
              <ReportExportSection 
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
              <span>GameLaunch Radar — Steam Co-Op & Friendslop Marketing</span>
              <span className="footer-mute">
                {syncStatus === 'synced' ? '🟢 Bulut Senkronizasyonu Aktif' : '🟡 Yerel ve Çevrim Dışı Öncelikli'}
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
            teamMembers={teamMembers}
            setTeamMembers={setTeamMembers}
            currentMemberId={currentMemberId}
            setCurrentMemberId={setCurrentMemberId}
            onlineUsers={onlineUsers}
          />
        </div>
      )}
    </AuthGate>
  );
}

export default App;
