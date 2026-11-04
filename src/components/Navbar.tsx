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
  LogOut,
  CloudCheck,
  CloudOff,
  RefreshCw,
  Users
} from 'lucide-react';
import type { CloudSyncStatus, TeamMember, OnlineUserPresence } from '../types';

export type ActiveTab = 'radar' | 'social' | 'marketing' | 'pitch' | 'checklist' | 'guide' | 'report';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  criticalCollisionsCount: number;
  checklistProgress: number;
  syncStatus?: CloudSyncStatus;
  openCloudModal?: () => void;
  teamMembers?: TeamMember[];
  currentMemberId?: string;
  onlineUsers?: OnlineUserPresence[];
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
  teamMembers,
  currentMemberId,
  onlineUsers = [],
  openTeamModal,
  onLogout,
  openChangePassword,
}) => {
  const currentMember = teamMembers?.find((m) => m.id === currentMemberId) || teamMembers?.[0];
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
          {onlineUsers.length > 0 && (
            <div 
              className="navbar-presence-pill"
              onClick={openTeamModal}
              title={`${onlineUsers.length} kişi şu an canlı sitede: ${onlineUsers.map((u) => u.name).join(', ')}`}
            >
              <span className="presence-pulse-dot" />
              <span className="presence-count">{onlineUsers.length} Çevrim İçi</span>
              <div className="presence-avatar-stack">
                {onlineUsers.slice(0, 3).map((u) => (
                  <span 
                    key={u.id}
                    className="stack-avatar" 
                    style={{ backgroundColor: u.avatarColor }}
                    title={`${u.name} (${u.role})`}
                  >
                    {u.name[0]?.toUpperCase() || 'U'}
                  </span>
                ))}
              </div>
            </div>
          )}

          {openTeamModal && currentMember && (
            <button 
              className="navbar-icon-btn team-profile-btn"
              onClick={openTeamModal}
              title={`Ekip Üyeleri: ${currentMember.name} (${currentMember.role})`}
            >
              <span 
                className="nav-user-avatar-dot"
                style={{ backgroundColor: currentMember.avatarColor }}
              >
                {currentMember.name[0]?.toUpperCase() || 'U'}
              </span>
              <span className="btn-hide-mobile nav-user-label">
                {currentMember.name.split(' ')[0]}
              </span>
              <Users size={12} className="nav-team-mini-ico" />
            </button>
          )}

          {openCloudModal && (
            <button 
              className={`navbar-icon-btn cloud-badge-btn ${syncStatus}`}
              onClick={openCloudModal}
              title="Ekip Bulut Senkronizasyon Ayarları"
            >
              {syncStatus === 'synced' && <CloudCheck size={14} className="sync-ico success" />}
              {(syncStatus === 'syncing' || syncStatus === 'connecting') && <RefreshCw size={14} className="sync-ico spin" />}
              {syncStatus === 'local' && <CloudOff size={14} className="sync-ico neutral" />}
              {syncStatus === 'error' && <AlertCircle size={14} className="sync-ico danger" />}
              <span className="btn-hide-mobile">
                {syncStatus === 'synced' && 'Bulut Canlı'}
                {syncStatus === 'syncing' && 'Eşitleniyor'}
                {syncStatus === 'connecting' && 'Bağlanıyor'}
                {syncStatus === 'local' && 'Yerel Mod'}
                {syncStatus === 'error' && 'Bulut Hatası'}
              </span>
            </button>
          )}

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
