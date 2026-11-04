import React from 'react';
import { 
  Radar, 
  Share2, 
  Send, 
  CheckSquare, 
  BookOpen, 
  AlertCircle,
  Smartphone,
  FileDown,
  KeyRound,
  LogOut
} from 'lucide-react';

export type ActiveTab = 'radar' | 'social' | 'marketing' | 'pitch' | 'checklist' | 'guide' | 'report';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  criticalCollisionsCount: number;
  checklistProgress: number;
  onLogout?: () => void;
  openChangePassword?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  criticalCollisionsCount,
  checklistProgress,
  onLogout,
  openChangePassword,
}) => {
  return (
    <header className="clean-navbar">
      <div className="navbar-container">
        {/* Brand */}
        <div className="brand-box">
          <div className="brand-logo">
            <Radar size={18} />
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
            <Radar size={15} />
            <span>Rakip Radarı</span>
            {criticalCollisionsCount > 0 && (
              <span className="badge-danger-dot" title={`${criticalCollisionsCount} Kritik Çakışma`}>
                <AlertCircle size={11} /> {criticalCollisionsCount}
              </span>
            )}
          </button>

          <button 
            className={`clean-nav-item ${activeTab === 'social' ? 'active' : ''}`}
            onClick={() => setActiveTab('social')}
          >
            <Smartphone size={15} />
            <span>Instagram & TikTok</span>
          </button>

          <button 
            className={`clean-nav-item ${activeTab === 'marketing' ? 'active' : ''}`}
            onClick={() => setActiveTab('marketing')}
          >
            <Share2 size={15} />
            <span>Tanıtım Kanalları</span>
          </button>

          <button 
            className={`clean-nav-item ${activeTab === 'pitch' ? 'active' : ''}`}
            onClick={() => setActiveTab('pitch')}
          >
            <Send size={15} />
            <span>Pitch & E-Posta</span>
          </button>

          <button 
            className={`clean-nav-item ${activeTab === 'checklist' ? 'active' : ''}`}
            onClick={() => setActiveTab('checklist')}
          >
            <CheckSquare size={15} />
            <span>Lansman Kontrolü</span>
            <span className="badge-progress-small">{checklistProgress}%</span>
          </button>

          <button 
            className={`clean-nav-item ${activeTab === 'guide' ? 'active' : ''}`}
            onClick={() => setActiveTab('guide')}
          >
            <BookOpen size={15} />
            <span>Rehber</span>
          </button>

          <button 
            className={`clean-nav-item nav-export-highlight ${activeTab === 'report' ? 'active' : ''}`}
            onClick={() => setActiveTab('report')}
          >
            <FileDown size={15} />
            <span>Rapor & Dışa Aktar</span>
          </button>
        </nav>

        {/* Auth / Account Actions */}
        <div className="navbar-auth-actions">
          {openChangePassword && (
            <button 
              className="navbar-icon-btn" 
              onClick={openChangePassword}
              title="Ekip Şifresini Değiştir"
            >
              <KeyRound size={14} />
              <span className="btn-hide-mobile">Şifre Değiştir</span>
            </button>
          )}

          {onLogout && (
            <button 
              className="navbar-icon-btn logout" 
              onClick={onLogout}
              title="Oturumu Kapat"
            >
              <LogOut size={14} />
              <span className="btn-hide-mobile">Çıkış</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
