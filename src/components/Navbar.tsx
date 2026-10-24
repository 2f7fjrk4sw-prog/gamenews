import React from 'react';
import { 
  Radar, 
  Share2, 
  Send, 
  CheckSquare, 
  Calendar, 
  BookOpen, 
  Gamepad2, 
  Sparkles,
  AlertTriangle
} from 'lucide-react';

export type ActiveTab = 'radar' | 'marketing' | 'pitch' | 'checklist' | 'calendar' | 'playbook';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  targetDate: string;
  setTargetDate: (date: string) => void;
  myGameTitle: string;
  setMyGameTitle: (title: string) => void;
  criticalCollisionsCount: number;
  checklistProgress: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  targetDate,
  setTargetDate,
  myGameTitle,
  setMyGameTitle,
  criticalCollisionsCount,
  checklistProgress,
}) => {
  return (
    <header className="site-header">
      <div className="header-top">
        <div className="brand-group">
          <div className="brand-icon-wrapper">
            <Radar className="brand-radar-icon pulse-animation" size={28} />
          </div>
          <div>
            <div className="brand-title-row">
              <h1 className="brand-title">GameLaunch Radar</h1>
              <span className="badge-friendslop">FRIENDSLOP EDITION</span>
            </div>
            <p className="brand-subtitle">
              Steam Lansman & Topluluk Pazarlama İstihbarat Platformu
            </p>
          </div>
        </div>

        {/* Quick Config Bar for Developer's Game */}
        <div className="my-game-config">
          <div className="config-item">
            <span className="config-label">
              <Gamepad2 size={14} /> Oyununuz:
            </span>
            <input 
              type="text" 
              className="config-input title-input" 
              value={myGameTitle}
              onChange={(e) => setMyGameTitle(e.target.value)}
              placeholder="Oyununuzun Adı"
            />
          </div>
          <div className="config-item">
            <span className="config-label">
              <Calendar size={14} /> Hedef Çıkış:
            </span>
            <input 
              type="date" 
              className="config-input date-input"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
            />
          </div>
          {criticalCollisionsCount > 0 ? (
            <div className="collision-alert-badge">
              <AlertTriangle size={15} />
              <span>{criticalCollisionsCount} Kritik Çakışma!</span>
            </div>
          ) : (
            <div className="safe-window-badge">
              <Sparkles size={15} />
              <span>Güvenli Çıkış Penceresi</span>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <nav className="nav-tabs">
        <button 
          className={`nav-tab-btn ${activeTab === 'radar' ? 'active' : ''}`}
          onClick={() => setActiveTab('radar')}
        >
          <Radar size={18} />
          <span>Rakip Radarı & Çakışma</span>
          {criticalCollisionsCount > 0 && (
            <span className="tab-bubble alert">{criticalCollisionsCount}</span>
          )}
        </button>

        <button 
          className={`nav-tab-btn ${activeTab === 'marketing' ? 'active' : ''}`}
          onClick={() => setActiveTab('marketing')}
        >
          <Share2 size={18} />
          <span>Topluluk Pazarlama Dizini</span>
          <span className="tab-bubble">12</span>
        </button>

        <button 
          className={`nav-tab-btn ${activeTab === 'pitch' ? 'active' : ''}`}
          onClick={() => setActiveTab('pitch')}
        >
          <Send size={18} />
          <span>Akıllı Pitch & E-Posta</span>
        </button>

        <button 
          className={`nav-tab-btn ${activeTab === 'checklist' ? 'active' : ''}`}
          onClick={() => setActiveTab('checklist')}
        >
          <CheckSquare size={18} />
          <span>Lansman Kontrol Listesi</span>
          <span className="tab-bubble progress">{checklistProgress}%</span>
        </button>

        <button 
          className={`nav-tab-btn ${activeTab === 'calendar' ? 'active' : ''}`}
          onClick={() => setActiveTab('calendar')}
        >
          <Calendar size={18} />
          <span>Steam Festivalleri</span>
        </button>

        <button 
          className={`nav-tab-btn ${activeTab === 'playbook' ? 'active' : ''}`}
          onClick={() => setActiveTab('playbook')}
        >
          <BookOpen size={18} />
          <span>Friendslop Taktik Rehberi</span>
        </button>
      </nav>
    </header>
  );
};
