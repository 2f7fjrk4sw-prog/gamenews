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
import { GuideSection } from './components/GuideSection';

import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('radar');

  // Developer's Game Configuration (Persistent in localStorage)
  const [targetDate, setTargetDate] = useState<string>(() => {
    return localStorage.getItem('user_game_target_date') || '2026-11-20';
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
    return Math.abs(diffDays) <= 7 && isHighTier;
  }).length;

  // Compute checklist progress percentage
  const totalTasks = checklist.length;
  const completedTasks = checklist.filter((item) => item.isDone).length;
  const checklistProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="clean-app">
      <Navbar 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        criticalCollisionsCount={criticalCollisionsCount}
        checklistProgress={checklistProgress}
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
      </main>

      <footer className="clean-footer">
        <div className="footer-inner">
          <span>GameLaunch Radar — Steam Co-Op & Friendslop Marketing</span>
          <span className="footer-mute">Yerel ve Çevrim Dışı Öncelikli Araç</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
