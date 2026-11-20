import React from 'react';
import {
  Radar,
  Send,
  CheckSquare,
  BookOpen,
  FileDown,
  KeyRound,
  LogOut,
  CloudCheck,
  CloudOff,
  RefreshCw,
  AlertCircle,
  Users,
  ChevronDown,
} from 'lucide-react';
import type { CloudSyncStatus, TeamWorkspace } from '../types';

export type ActiveTab = 'radar' | 'checklist' | 'promo' | 'guide' | 'report';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  criticalCollisionsCount: number;
  checklistProgress: number;
  syncStatus?: CloudSyncStatus;
  openCloudModal?: () => void;
  activeTeam: TeamWorkspace;
  onlineCount?: number;
  openTeamModal?: () => void;
  onLogout?: () => void;
  openChangePassword?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  criticalCollisionsCount,
  checklistProgress,
  syncStatus = 'local',
  openCloudModal,
  activeTeam,
  onlineCount = 0,
  openTeamModal,
  onLogout,
  openChangePassword,
}) => {
  return (
    <header className="clean-navbar">
      <div className="navbar-container">
        {/* Left: Brand & Active Team Pill */}
        <div className="navbar-left-group">
          <div className="brand-box">
            <div className="brand-logo">
              <Radar size={16} />
            </div>
            <span className="brand-name">Oyun Paneli</span>
          </div>

          {openTeamModal && (
            <button
              type="button"
              className="navbar-team-switcher"
              onClick={openTeamModal}
              title="Ekip adını değiştir, yeni ekip oluştur veya ekibin oyununu düzenle"
            >
              <Users size={14} />
              <span className="team-switcher-text">
                <strong>{activeTeam.teamName}</strong>
                <span className="team-switcher-sep">·</span>
                <span>{activeTeam.gameTitle}</span>
              </span>
              {onlineCount > 1 && (
                <span className="team-online-count">{onlineCount} aktif</span>
              )}
              <ChevronDown size={13} />
            </button>
          )}
        </div>

        {/* Center: 5 Clear Navigation Tabs */}
        <nav className="clean-nav-links" aria-label="Ana Menü">
          <button
            type="button"
            className={`clean-nav-item ${activeTab === 'radar' ? 'active' : ''}`}
            onClick={() => setActiveTab('radar')}
          >
            <Radar size={15} />
            <span>Genel Bakış & Rakipler</span>
            {criticalCollisionsCount > 0 && (
              <span className="badge-danger-dot" title={`${criticalCollisionsCount} tarih çakışması`}>
                {criticalCollisionsCount}
              </span>
            )}
          </button>

          <button
            type="button"
            className={`clean-nav-item ${activeTab === 'checklist' ? 'active' : ''}`}
            onClick={() => setActiveTab('checklist')}
          >
            <CheckSquare size={15} />
            <span>Yapılacaklar</span>
            <span className="badge-progress-small">%{checklistProgress}</span>
          </button>

          <button
            type="button"
            className={`clean-nav-item ${activeTab === 'promo' ? 'active' : ''}`}
            onClick={() => setActiveTab('promo')}
          >
            <Send size={15} />
            <span>Tanıtım & Mesajlar</span>
          </button>

          <button
            type="button"
            className={`clean-nav-item ${activeTab === 'guide' ? 'active' : ''}`}
            onClick={() => setActiveTab('guide')}
          >
            <BookOpen size={15} />
            <span>Takvim & İpuçları</span>
          </button>

          <button
            type="button"
            className={`clean-nav-item ${activeTab === 'report' ? 'active' : ''}`}
            onClick={() => setActiveTab('report')}
          >
            <FileDown size={15} />
            <span>Rapor & Yedek</span>
          </button>
        </nav>

        {/* Right: Quiet Utility Controls */}
        <div className="navbar-auth-actions">
          {openCloudModal && (
            <button
              type="button"
              className={`navbar-icon-btn cloud-badge-btn ${syncStatus}`}
              onClick={openCloudModal}
              title="Bulut Kayıt ve Senkronizasyon Durumu"
            >
              {syncStatus === 'synced' && <CloudCheck size={14} />}
              {(syncStatus === 'syncing' || syncStatus === 'connecting') && (
                <RefreshCw size={14} className="spin" />
              )}
              {syncStatus === 'local' && <CloudOff size={14} />}
              {syncStatus === 'error' && <AlertCircle size={14} />}
              <span className="btn-hide-mobile">
                {syncStatus === 'synced' && 'Kayıtlı'}
                {syncStatus === 'syncing' && 'Kaydediliyor'}
                {syncStatus === 'connecting' && 'Bağlanıyor'}
                {syncStatus === 'local' && 'Yerel'}
                {syncStatus === 'error' && 'Hata'}
              </span>
            </button>
          )}

          {openChangePassword && (
            <button
              type="button"
              className="navbar-icon-btn"
              onClick={openChangePassword}
              title="Şifre Değiştir"
            >
              <KeyRound size={14} />
              <span className="btn-hide-mobile">Şifre</span>
            </button>
          )}

          {onLogout && (
            <button
              type="button"
              className="navbar-icon-btn logout"
              onClick={onLogout}
              title="Çıkış Yap"
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
