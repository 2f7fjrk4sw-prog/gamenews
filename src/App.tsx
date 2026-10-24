import { useState, useEffect } from 'react';
import type { CompetitorGame, ChecklistItem } from './types';
import { initialCompetitors } from './data/competitors';
import { initialChecklist } from './data/launchChecklist';
import { marketingChannels } from './data/marketingChannels';
import { pitchTemplates } from './data/pitchTemplates';
import { steamFestivals } from './data/steamFestivals';

import { Navbar, type ActiveTab } from './components/Navbar';
import { RadarSection } from './components/RadarSection';
import { MarketingSection } from './components/MarketingSection';
import { PitchStudioSection } from './components/PitchStudioSection';
import { ChecklistSection } from './components/ChecklistSection';
import { SteamCalendarSection } from './components/SteamCalendarSection';
import { PlaybookSection } from './components/PlaybookSection';

import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('radar');

  // Developer's Game Configuration (Persistent in localStorage)
  const [targetDate, setTargetDate] = useState<string>(() => {
    return localStorage.getItem('user_game_target_date') || '2026-11-20';
  });

  const [myGameTitle, setMyGameTitle] = useState<string>(() => {
    return localStorage.getItem('user_game_title') || 'Kaos Ekibi / My Co-Op Project';
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

  // Save game config when changed
  useEffect(() => {
    localStorage.setItem('user_game_target_date', targetDate);
  }, [targetDate]);

  useEffect(() => {
    localStorage.setItem('user_game_title', myGameTitle);
  }, [myGameTitle]);

  // Compute collision risk count
  const criticalCollisionsCount = competitors.filter((comp) => {
    const compTime = new Date(comp.releaseDate).getTime();
    const myTime = new Date(targetDate).getTime();
    const diffDays = Math.round((compTime - myTime) / (1000 * 60 * 60 * 24));
    const isHighTier = comp.wishlistTier === 'Very High (100k+)' || comp.wishlistTier === 'High (50k-100k)';
    return Math.abs(diffDays) <= 5 && isHighTier;
  }).length;

  // Compute checklist progress percentage
  const totalTasks = checklist.length;
  const completedTasks = checklist.filter((item) => item.isDone).length;
  const checklistProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="app-shell">
      <Navbar 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        targetDate={targetDate}
        setTargetDate={setTargetDate}
        myGameTitle={myGameTitle}
        setMyGameTitle={setMyGameTitle}
        criticalCollisionsCount={criticalCollisionsCount}
        checklistProgress={checklistProgress}
      />

      <main className="main-content-area">
        {activeTab === 'radar' && (
          <RadarSection 
            competitors={competitors}
            setCompetitors={setCompetitors}
            targetDate={targetDate}
            setTargetDate={setTargetDate}
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

        {activeTab === 'calendar' && (
          <SteamCalendarSection 
            festivals={steamFestivals}
            targetDate={targetDate}
          />
        )}

        {activeTab === 'playbook' && (
          <PlaybookSection />
        )}
      </main>

      <footer className="site-footer">
        <div className="footer-content">
          <div className="footer-left">
            <span className="footer-brand">GameLaunch & Friendslop Marketing Radar</span>
            <span className="footer-desc">
              Steam bağımsız oyun geliştiricileri için tasarlanmış taktiksel lansman platformu.
            </span>
          </div>
          <div className="footer-right">
            <span>Hedef Tür: Online Co-Op, Proximity Voice & Komedi</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
