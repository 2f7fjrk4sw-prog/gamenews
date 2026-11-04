import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  Trash2, 
  Check, 
  X, 
  Share2, 
  Copy, 
  CheckCircle2,
  Shield
} from 'lucide-react';
import type { TeamMember, OnlineUserPresence } from '../types';

interface TeamManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  teamMembers: TeamMember[];
  setTeamMembers: React.Dispatch<React.SetStateAction<TeamMember[]>>;
  currentMemberId: string;
  setCurrentMemberId: (id: string) => void;
  onlineUsers?: OnlineUserPresence[];
}

const PRESET_ROLES = [
  '🎮 Oyun Tasarımcısı & Yapımcı',
  '📢 Pazarlama & Lansman Lideri',
  '💻 Co-Op & Ağ Geliştiricisi',
  '🎬 TikTok & İçerik Üreticisi',
  '💬 Discord & Topluluk Yöneticisi',
  '🎨 Sanat & Arayüz Tasarımcısı',
  '🎙️ Yayıncı & PR İletişimi',
];

const AVATAR_COLORS = [
  '#58a6ff', // Blue
  '#3fb950', // Green
  '#d29922', // Orange/Yellow
  '#bc8cff', // Purple
  '#f778ba', // Pink
  '#ff7b72', // Coral/Red
  '#39c5bb', // Teal
];

export const TeamManagementModal: React.FC<TeamManagementModalProps> = ({
  isOpen,
  onClose,
  teamMembers,
  setTeamMembers,
  currentMemberId,
  setCurrentMemberId,
  onlineUsers = [],
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [role, setRole] = useState(PRESET_ROLES[0]);
  const [customRole, setCustomRole] = useState('');
  const [isCustomRole, setIsCustomRole] = useState(false);
  const [contact, setContact] = useState('');
  const [selectedColor, setSelectedColor] = useState(AVATAR_COLORS[0]);
  const [copiedInvite, setCopiedInvite] = useState(false);

  if (!isOpen) return null;

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const finalRole = isCustomRole && customRole.trim() ? customRole.trim() : role;

    const newMember: TeamMember = {
      id: `member-${Date.now()}`,
      name: name.trim(),
      role: finalRole,
      avatarColor: selectedColor,
      emailOrDiscord: contact.trim() || undefined,
      joinedAt: new Date().toISOString().split('T')[0],
    };

    const updated = [...teamMembers, newMember];
    setTeamMembers(updated);
    localStorage.setItem('game_team_members', JSON.stringify(updated));

    // Reset form
    setName('');
    setContact('');
    setCustomRole('');
    setIsCustomRole(false);
    setShowAddForm(false);
  };

  const handleDeleteMember = (id: string) => {
    if (teamMembers.length <= 1) {
      alert('Ekipte en az bir üye kalmalıdır.');
      return;
    }
    const updated = teamMembers.filter((m) => m.id !== id);
    setTeamMembers(updated);
    localStorage.setItem('game_team_members', JSON.stringify(updated));

    if (currentMemberId === id && updated.length > 0) {
      setCurrentMemberId(updated[0].id);
      localStorage.setItem('current_team_member_id', updated[0].id);
    }
  };

  const handleSelectActiveMember = (id: string) => {
    setCurrentMemberId(id);
    localStorage.setItem('current_team_member_id', id);
  };

  const handleCopyInvite = () => {
    const inviteText = `🎮 GameLaunch Radar Ekip Daveti\n🔗 Site: https://gamenews-teal.vercel.app/\n🔑 Giriş Şifresi: friendslop\nEkip paneline katılarak lansman stratejisini birlikte yönetebilirsin!`;
    navigator.clipboard.writeText(inviteText);
    setCopiedInvite(true);
    setTimeout(() => setCopiedInvite(false), 2500);
  };

  return (
    <div className="clean-modal-backdrop" onClick={onClose}>
      <div className="clean-modal-card team-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="clean-modal-header">
          <div className="modal-title-with-ico">
            <Users size={20} className="primary-ico" />
            <h3>Ekip Üyeleri & Kullanıcı Yönetimi ({teamMembers.length})</h3>
          </div>
          <button className="clean-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="clean-modal-body">
          {/* Top Actions: Copy Invite */}
          <div className="team-invite-card">
            <div className="invite-info">
              <Share2 size={16} className="invite-ico" />
              <div>
                <strong>Yeni Arkadaşını Ekibe Davet Et</strong>
                <p>Site linkini ve şifreyi tek tıkla kopyalayıp WhatsApp/Discord'dan gönderin.</p>
              </div>
            </div>
            <button 
              type="button" 
              className="clean-btn secondary btn-sm"
              onClick={handleCopyInvite}
            >
              {copiedInvite ? (
                <>
                  <Check size={14} className="text-green" /> Davet Kopyalandı!
                </>
              ) : (
                <>
                  <Copy size={14} /> Daveti Kopyala
                </>
              )}
            </button>
          </div>

          {/* Members List */}
          <div className="team-members-list">
            {teamMembers.map((member) => {
              const isCurrent = member.id === currentMemberId;
              const initials = member.name
                .split(' ')
                .map((n) => n[0])
                .slice(0, 2)
                .join('')
                .toUpperCase();

              return (
                <div 
                  key={member.id} 
                  className={`team-member-row ${isCurrent ? 'active-member-row' : ''}`}
                >
                  <div 
                    className="member-avatar"
                    style={{ backgroundColor: member.avatarColor }}
                  >
                    {initials || 'U'}
                  </div>

                  <div className="member-details">
                    <div className="member-name-row">
                      <strong>{member.name}</strong>
                      {isCurrent && (
                        <span className="badge-active-user">
                          <CheckCircle2 size={11} /> Aktif Profil (Siz)
                        </span>
                      )}
                      {onlineUsers.some((u) => u.id === member.id) ? (
                        <span className="badge-online-dot" title="Şu an sitede aktif">
                          <span className="online-green-pulse" /> Canlı Sitede
                          {onlineUsers.filter((u) => u.id === member.id).length > 1 && (
                            <span className="badge-device-count">
                              ({onlineUsers.filter((u) => u.id === member.id).length} cihaz)
                            </span>
                          )}
                        </span>
                      ) : (
                        <span className="badge-offline-dot" title="Çevrim dışı">
                          Çevrim Dışı
                        </span>
                      )}
                    </div>
                    <div className="member-meta-row">
                      <span className="member-role-tag">{member.role}</span>
                      {member.emailOrDiscord && (
                        <span className="member-contact">{member.emailOrDiscord}</span>
                      )}
                      <span className="member-date">Katıldı: {member.joinedAt}</span>
                    </div>
                  </div>

                  <div className="member-actions">
                    {!isCurrent && (
                      <button 
                        type="button" 
                        className="clean-btn secondary btn-xs"
                        onClick={() => handleSelectActiveMember(member.id)}
                        title="Bu kullanıcı kimliğiyle devam et"
                      >
                        Buna Geç
                      </button>
                    )}
                    {teamMembers.length > 1 && (
                      <button 
                        type="button" 
                        className="clean-btn-icon danger-hover"
                        onClick={() => handleDeleteMember(member.id)}
                        title="Üyeyi Ekipten Çıkar"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add New Member Section */}
          {!showAddForm ? (
            <button 
              type="button" 
              className="clean-btn primary full-width"
              onClick={() => setShowAddForm(true)}
            >
              <UserPlus size={16} /> Yeni Ekip Üyesi Ekle
            </button>
          ) : (
            <form onSubmit={handleAddMember} className="team-add-form">
              <div className="add-form-header">
                <h4>Yeni Kullanıcı Bilgileri</h4>
                <button 
                  type="button" 
                  className="clean-btn secondary btn-xs"
                  onClick={() => setShowAddForm(false)}
                >
                  Vazgeç
                </button>
              </div>

              <div className="clean-field">
                <label>Kullanıcı / Üye Adı *</label>
                <input 
                  type="text" 
                  required
                  placeholder="Örn: Berkay (Yayıncı Sorumlusu)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="clean-input"
                />
              </div>

              <div className="clean-field">
                <label>Ekipteki Rolü</label>
                {!isCustomRole ? (
                  <select 
                    value={role} 
                    onChange={(e) => {
                      if (e.target.value === 'CUSTOM') {
                        setIsCustomRole(true);
                      } else {
                        setRole(e.target.value);
                      }
                    }}
                    className="clean-select"
                  >
                    {PRESET_ROLES.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                    <option value="CUSTOM">+ Özel Rol Yaz...</option>
                  </select>
                ) : (
                  <div className="custom-role-input-row">
                    <input 
                      type="text" 
                      placeholder="Özel Rol Adı (Örn: Çevirmen & Ses Sanatçısı)"
                      value={customRole}
                      onChange={(e) => setCustomRole(e.target.value)}
                      className="clean-input"
                      autoFocus
                    />
                    <button 
                      type="button" 
                      className="clean-btn secondary btn-sm"
                      onClick={() => setIsCustomRole(false)}
                    >
                      Listeden Seç
                    </button>
                  </div>
                )}
              </div>

              <div className="clean-field">
                <label>Discord veya E-posta (İsteğe bağlı)</label>
                <input 
                  type="text" 
                  placeholder="@kullaniciadi veya isim@ornek.com"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  className="clean-input"
                />
              </div>

              <div className="clean-field">
                <label>Avatar Rengi</label>
                <div className="color-palette-row">
                  {AVATAR_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      className={`color-dot-btn ${selectedColor === c ? 'active' : ''}`}
                      style={{ backgroundColor: c }}
                      onClick={() => setSelectedColor(c)}
                    >
                      {selectedColor === c && <Check size={12} className="color-check-ico" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-submit-row">
                <button 
                  type="submit" 
                  className="clean-btn primary full-width"
                >
                  <UserPlus size={16} /> Kullanıcıyı Ekle
                </button>
              </div>
            </form>
          )}

          <div className="team-security-note">
            <Shield size={14} className="note-ico" />
            <span>Eklediğiniz tüm kullanıcılar bulut senkronizasyonu sayesinde diğer tüm ekip üyelerinin ekranında otomatik görünür.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

