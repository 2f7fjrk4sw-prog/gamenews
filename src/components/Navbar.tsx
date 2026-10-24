import React from 'react';
import { 
  Radar, 
  Share2, 
  Send, 
  CheckSquare, 
  BookOpen, 
  AlertCircle
} from 'lucide-react';

export type ActiveTab = 'radar' | 'marketing' | 'pitch' | 'checklist' | 'guide';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  criticalCollisionsCount: number;
  checklistProgress: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  criticalCollisionsCount,
  checklistProgress,
}) => {
  return (
    <header className="clean-navbar">
      <div className="navbar-container">
        {/* Brand */}
        <div className="brand-box">
          <div className="brand-logo">
            <Radar size={20} />
          </div>
          <div className="brand-text">
            <span className="brand-name">GameLaunch Radar</span>
            <span className="brand-tag">Friendslop & Co-Op</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="clean-nav-links">
          <button 
            className={`clean-nav-item ${activeTab === 'radar' ? 'active' : ''}`}
            onClick={() => setActiveTab('radar')}
          >
            <Radar size={16} />
            <span>Rakip Radarı</span>
            {criticalCollisionsCount > 0 && (
              <span className="badge-danger-dot" title={`${criticalCollisionsCount} Kritik Çakışma`}>
                <AlertCircle size={12} /> {criticalCollisionsCount}
              </span>
            )}
          </button>

          <button 
            className={`clean-nav-item ${activeTab === 'marketing' ? 'active' : ''}`}
            onClick={() => setActiveTab('marketing')}
          >
            <Share2 size={16} />
            <span>Tanıtım Kanalları</span>
          </button>

          <button 
            className={`clean-nav-item ${activeTab === 'pitch' ? 'active' : ''}`}
            onClick={() => setActiveTab('pitch')}
          >
            <Send size={16} />
            <span>Pitch & E-Posta</span>
          </button>

          <button 
            className={`clean-nav-item ${activeTab === 'checklist' ? 'active' : ''}`}
            onClick={() => setActiveTab('checklist')}
          >
            <CheckSquare size={16} />
            <span>Lansman Kontrolü</span>
            <span className="badge-progress-small">{checklistProgress}%</span>
          </button>

          <button 
            className={`clean-nav-item ${activeTab === 'guide' ? 'active' : ''}`}
            onClick={() => setActiveTab('guide')}
          >
            <BookOpen size={16} />
            <span>Steam & Taktik Rehberi</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
