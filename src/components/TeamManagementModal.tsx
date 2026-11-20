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
  FolderPlus,
  Gamepad2,
  KeyRound,
  Save,
  ArrowRightLeft,
} from 'lucide-react';
import type { TeamMember, OnlineUserPresence, TeamWorkspace } from '../types';

interface TeamManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  teams: TeamWorkspace[];
  activeTeam: TeamWorkspace;
  onSwitchTeam: (teamId: string) => void;
  onCreateTeam: (data: { teamName: string; gameTitle: string; targetDate: string }) => Promise<void>;
  onUpdateActiveTeam: (data: { teamName: string; gameTitle: string; targetDate: string }) => Promise<void>;
  onDeleteTeam: (teamId: string) => void;
  onJoinTeamByCode: (code: string) => Promise<{ success: boolean; message: string }>;
  teamMembers: TeamMember[];
  setTeamMembers: React.Dispatch<React.SetStateAction<TeamMember[]>>;
  currentMemberId: string;
  setCurrentMemberId: (id: string) => void;
  onlineUsers?: OnlineUserPresence[];
}

const PRESET_ROLES = [
  'Oyun Tasarımcısı & Yapımcı',
  'Pazarlama & Lansman Lideri',
  'Geliştirici / Programcı',
  'Kısa Video & İçerik Üreticisi',
  'Discord & Topluluk Yöneticisi',
  'Sanat & Arayüz Tasarımcısı',
  'Yayıncı & İletişim Sorumlusu',
];

const AVATAR_COLORS = [
  '#4f83cc',
  '#4ea878',
  '#c6923a',
  '#8c7ae6',
  '#c96a8b',
  '#c95d5d',
  '#3f9f9a',
];

export const TeamManagementModal: React.FC<TeamManagementModalProps> = ({
  isOpen,
  onClose,
  teams,
  activeTeam,
  onSwitchTeam,
  onCreateTeam,
  onUpdateActiveTeam,
  onDeleteTeam,
  onJoinTeamByCode,
  teamMembers,
  setTeamMembers,
  currentMemberId,
  setCurrentMemberId,
  onlineUsers = [],
}) => {
  const [modalTab, setModalTab] = useState<'teams' | 'members'>('teams');

  // Edit active team
  const [editTeamNameOverride, setEditTeamNameOverride] = useState<string | null>(null);
  const [editGameTitleOverride, setEditGameTitleOverride] = useState<string | null>(null);
  const [editTargetDateOverride, setEditTargetDateOverride] = useState<string | null>(null);
  const editTeamName = editTeamNameOverride ?? activeTeam.teamName;
  const editGameTitle = editGameTitleOverride ?? activeTeam.gameTitle;
  const editTargetDate = editTargetDateOverride ?? activeTeam.targetDate;
  const [savedEditBanner, setSavedEditBanner] = useState(false);

  // Create new team form
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [newGameTitle, setNewGameTitle] = useState('');
  const [newTargetDate, setNewTargetDate] = useState(activeTeam.targetDate);
  const [isCreating, setIsCreating] = useState(false);

  // Join by invite code
  const [joinCode, setJoinCode] = useState('');
  const [joinFeedback, setJoinFeedback] = useState<{ ok: boolean; msg: string } | null>(null);

  // Add member state
  const [showAddMemberForm, setShowAddMemberForm] = useState(false);
  const [memberName, setMemberName] = useState('');
  const [memberRole, setMemberRole] = useState(PRESET_ROLES[0]);
  const [customRole, setCustomRole] = useState('');
  const [isCustomRole, setIsCustomRole] = useState(false);
  const [contact, setContact] = useState('');
  const [selectedColor, setSelectedColor] = useState(AVATAR_COLORS[0]);
  const [copiedInvite, setCopiedInvite] = useState(false);

  if (!isOpen) return null;

  const handleSaveCurrentTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTeamName.trim() || !editGameTitle.trim()) return;
    await onUpdateActiveTeam({
      teamName: editTeamName.trim(),
      gameTitle: editGameTitle.trim(),
      targetDate: editTargetDate || activeTeam.targetDate,
    });
    setEditTeamNameOverride(null);
    setEditGameTitleOverride(null);
    setEditTargetDateOverride(null);
    setSavedEditBanner(true);
    setTimeout(() => setSavedEditBanner(false), 2500);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamName.trim() || !newGameTitle.trim()) return;
    setIsCreating(true);
    await onCreateTeam({
      teamName: newTeamName.trim(),
      gameTitle: newGameTitle.trim(),
      targetDate: newTargetDate || activeTeam.targetDate,
    });
    setIsCreating(false);
    setNewTeamName('');
    setNewGameTitle('');
    setShowCreateForm(false);
  };

  const handleJoinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim()) return;
    const res = await onJoinTeamByCode(joinCode.trim());
    setJoinFeedback({ ok: res.success, msg: res.message });
    if (res.success) {
      setJoinCode('');
      setTimeout(() => setJoinFeedback(null), 2500);
    }
  };

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberName.trim()) return;

    const finalRole = isCustomRole && customRole.trim() ? customRole.trim() : memberRole;
    const newMember: TeamMember = {
      id: `member-${Date.now()}`,
      name: memberName.trim(),
      role: finalRole,
      avatarColor: selectedColor,
      emailOrDiscord: contact.trim() || undefined,
      joinedAt: new Date().toISOString().split('T')[0],
    };

    setTeamMembers((prev) => [...prev, newMember]);
    setMemberName('');
    setContact('');
    setCustomRole('');
    setIsCustomRole(false);
    setShowAddMemberForm(false);
  };

  const handleDeleteMember = (id: string) => {
    if (teamMembers.length <= 1) {
      alert('Ekipte en az bir üye kalmalıdır.');
      return;
    }
    const updated = teamMembers.filter((m) => m.id !== id);
    setTeamMembers(updated);
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
    const inviteText = `Oyun Lansman Paneli Ekip Daveti\nEkip: ${activeTeam.teamName}\nOyun: ${activeTeam.gameTitle}\nEkip Kodu: ${activeTeam.inviteCode}\nSite: https://gamenews-teal.vercel.app/`;
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
            <Users size={19} className="primary-ico" />
            <h3>Ekip, Oyun & Üye Yönetimi</h3>
          </div>
          <button className="clean-close-btn" onClick={onClose} aria-label="Kapat">
            <X size={18} />
          </button>
        </div>

        {/* Simple Modal Tabs */}
        <div className="modal-tab-bar">
          <button
            type="button"
            className={`modal-tab-btn ${modalTab === 'teams' ? 'active' : ''}`}
            onClick={() => setModalTab('teams')}
          >
            <Gamepad2 size={15} />
            <span>Ekipler & Oyunları ({teams.length})</span>
          </button>
          <button
            type="button"
            className={`modal-tab-btn ${modalTab === 'members' ? 'active' : ''}`}
            onClick={() => setModalTab('members')}
          >
            <Users size={15} />
            <span>Bu Ekibin Üyeleri ({teamMembers.length})</span>
          </button>
        </div>

        {/* Body */}
        <div className="clean-modal-body">
          {modalTab === 'teams' && (
            <>
              {/* Current Team Settings */}
              <form onSubmit={handleSaveCurrentTeam} className="team-edit-box">
                <div className="team-box-head">
                  <div>
                    <strong>Aktif Ekip & Oyun Bilgileri</strong>
                    <p>Burada yaptığınız değişiklikler kalıcı olarak bu ekibe kaydedilir.</p>
                  </div>
                  <span className="invite-code-tag" title="Arkadaşlarınızı bu kodla ekibe davet edebilirsiniz">
                    Kod: {activeTeam.inviteCode}
                  </span>
                </div>

                <div className="team-form-grid">
                  <div className="clean-field">
                    <label>Ekip Adı</label>
                    <input
                      type="text"
                      required
                      value={editTeamName}
                      onChange={(e) => setEditTeamNameOverride(e.target.value)}
                      placeholder="Örn: Kaos Ekibi"
                      className="clean-input"
                    />
                  </div>
                  <div className="clean-field">
                    <label>Ekibin Oyunu</label>
                    <input
                      type="text"
                      required
                      value={editGameTitle}
                      onChange={(e) => setEditGameTitleOverride(e.target.value)}
                      placeholder="Örn: RPS Shoot"
                      className="clean-input"
                    />
                  </div>
                  <div className="clean-field">
                    <label>Hedef Çıkış Tarihi</label>
                    <input
                      type="date"
                      value={editTargetDate}
                      onChange={(e) => setEditTargetDateOverride(e.target.value)}
                      className="clean-input"
                    />
                  </div>
                </div>

                <div className="team-save-row">
                  <button type="submit" className="clean-btn primary btn-sm">
                    <Save size={14} />
                    <span>Ekip & Oyun Bilgilerini Kaydet</span>
                  </button>
                  {savedEditBanner && (
                    <span className="saved-inline-msg">
                      <Check size={14} /> Kalıcı olarak kaydedildi
                    </span>
                  )}
                </div>
              </form>

              {/* Saved Teams List */}
              <div className="teams-directory-section">
                <div className="section-row-between">
                  <h4>Kayıtlı Ekipler ({teams.length})</h4>
                  <button
                    type="button"
                    className="clean-btn secondary btn-xs"
                    onClick={() => setShowCreateForm((v) => !v)}
                  >
                    <FolderPlus size={14} />
                    <span>{showCreateForm ? 'Formu Kapat' : 'Yeni Ekip Oluştur'}</span>
                  </button>
                </div>

                {/* Create New Team Form */}
                {showCreateForm && (
                  <form onSubmit={handleCreateSubmit} className="team-add-form">
                    <div className="add-form-header">
                      <h4>Yeni Ekip & Oyun Oluştur</h4>
                    </div>
                    <div className="team-form-grid">
                      <div className="clean-field">
                        <label>Yeni Ekip Adı *</label>
                        <input
                          type="text"
                          required
                          autoFocus
                          value={newTeamName}
                          onChange={(e) => setNewTeamName(e.target.value)}
                          placeholder="Örn: Piksel Tayfa"
                          className="clean-input"
                        />
                      </div>
                      <div className="clean-field">
                        <label>Bu Ekibin Oyunu *</label>
                        <input
                          type="text"
                          required
                          value={newGameTitle}
                          onChange={(e) => setNewGameTitle(e.target.value)}
                          placeholder="Örn: Zindan Kaçışı"
                          className="clean-input"
                        />
                      </div>
                      <div className="clean-field">
                        <label>Hedef Çıkış Tarihi</label>
                        <input
                          type="date"
                          value={newTargetDate}
                          onChange={(e) => setNewTargetDate(e.target.value)}
                          className="clean-input"
                        />
                      </div>
                    </div>
                    <button type="submit" className="clean-btn primary full-width" disabled={isCreating}>
                      <FolderPlus size={15} />
                      <span>{isCreating ? 'Kaydediliyor...' : 'Ekibi Oluştur ve Bu Ekibe Geç'}</span>
                    </button>
                  </form>
                )}

                <div className="team-members-list">
                  {teams.map((t) => {
                    const isActive = t.id === activeTeam.id;
                    return (
                      <div key={t.id} className={`team-member-row ${isActive ? 'active-member-row' : ''}`}>
                        <div className="member-details">
                          <div className="member-name-row">
                            <strong>{t.teamName}</strong>
                            {isActive && (
                              <span className="badge-active-user">
                                <CheckCircle2 size={11} /> Şu An Açık
                              </span>
                            )}
                          </div>
                          <div className="member-meta-row">
                            <span className="member-role-tag">Oyun: {t.gameTitle}</span>
                            <span className="member-date">Hedef: {t.targetDate}</span>
                            <span className="member-date">Kod: {t.inviteCode}</span>
                          </div>
                        </div>

                        <div className="member-actions">
                          {!isActive && (
                            <button
                              type="button"
                              className="clean-btn secondary btn-xs"
                              onClick={() => onSwitchTeam(t.id)}
                            >
                              <ArrowRightLeft size={12} />
                              <span>Bu Ekibe Geç</span>
                            </button>
                          )}
                          {teams.length > 1 && (
                            <button
                              type="button"
                              className="clean-btn-icon danger-hover"
                              onClick={() => {
                                if (window.confirm(`"${t.teamName}" ekibini silmek istediğinize emin misiniz?`)) {
                                  onDeleteTeam(t.id);
                                }
                              }}
                              title="Ekibi Sil"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Join Team by Code */}
                <form onSubmit={handleJoinSubmit} className="join-code-row">
                  <KeyRound size={15} className="text-muted-ico" />
                  <input
                    type="text"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value)}
                    placeholder="Arkadaşınızın ekip kodu (örn: KAOS-12AB)"
                    className="clean-input"
                  />
                  <button type="submit" className="clean-btn secondary btn-sm">
                    Koda Katıl
                  </button>
                </form>
                {joinFeedback && (
                  <p className={`join-feedback ${joinFeedback.ok ? 'ok' : 'err'}`}>
                    {joinFeedback.msg}
                  </p>
                )}
              </div>
            </>
          )}

          {modalTab === 'members' && (
            <>
              <div className="team-invite-card">
                <div className="invite-info">
                  <Share2 size={16} className="invite-ico" />
                  <div>
                    <strong>Arkadaşını "{activeTeam.teamName}" Ekibine Davet Et</strong>
                    <p>Ekip adını, oyun adını ve ekip kodunu ({activeTeam.inviteCode}) tek tıkla kopyalayın.</p>
                  </div>
                </div>
                <button type="button" className="clean-btn secondary btn-sm" onClick={handleCopyInvite}>
                  {copiedInvite ? (
                    <>
                      <Check size={14} /> Kopyalandı
                    </>
                  ) : (
                    <>
                      <Copy size={14} /> Daveti Kopyala
                    </>
                  )}
                </button>
              </div>

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
                      <div className="member-avatar" style={{ backgroundColor: member.avatarColor }}>
                        {initials || 'U'}
                      </div>

                      <div className="member-details">
                        <div className="member-name-row">
                          <strong>{member.name}</strong>
                          {isCurrent && (
                            <span className="badge-active-user">
                              <CheckCircle2 size={11} /> Siz
                            </span>
                          )}
                          {onlineUsers.some((u) => u.id === member.id) && (
                            <span className="badge-online-dot">Çevrim İçi</span>
                          )}
                        </div>
                        <div className="member-meta-row">
                          <span className="member-role-tag">{member.role}</span>
                          {member.emailOrDiscord && (
                            <span className="member-contact">{member.emailOrDiscord}</span>
                          )}
                        </div>
                      </div>

                      <div className="member-actions">
                        {!isCurrent && (
                          <button
                            type="button"
                            className="clean-btn secondary btn-xs"
                            onClick={() => handleSelectActiveMember(member.id)}
                          >
                            Profil Seç
                          </button>
                        )}
                        {teamMembers.length > 1 && (
                          <button
                            type="button"
                            className="clean-btn-icon danger-hover"
                            onClick={() => handleDeleteMember(member.id)}
                            title="Üyeyi Çıkar"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {!showAddMemberForm ? (
                <button
                  type="button"
                  className="clean-btn primary full-width"
                  onClick={() => setShowAddMemberForm(true)}
                >
                  <UserPlus size={16} /> Yeni Ekip Üyesi Ekle
                </button>
              ) : (
                <form onSubmit={handleAddMember} className="team-add-form">
                  <div className="add-form-header">
                    <h4>Yeni Üye Ekle</h4>
                    <button
                      type="button"
                      className="clean-btn secondary btn-xs"
                      onClick={() => setShowAddMemberForm(false)}
                    >
                      Vazgeç
                    </button>
                  </div>

                  <div className="clean-field">
                    <label>Ad / Takma Ad *</label>
                    <input
                      type="text"
                      required
                      placeholder="Örn: Berkay"
                      value={memberName}
                      onChange={(e) => setMemberName(e.target.value)}
                      className="clean-input"
                    />
                  </div>

                  <div className="clean-field">
                    <label>Görevi</label>
                    {!isCustomRole ? (
                      <select
                        value={memberRole}
                        onChange={(e) => {
                          if (e.target.value === 'CUSTOM') {
                            setIsCustomRole(true);
                          } else {
                            setMemberRole(e.target.value);
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
                          placeholder="Özel Rol Adı"
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
                      placeholder="@kullaniciadi"
                      value={contact}
                      onChange={(e) => setContact(e.target.value)}
                      className="clean-input"
                    />
                  </div>

                  <div className="clean-field">
                    <label>Renk</label>
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

                  <button type="submit" className="clean-btn primary full-width">
                    <UserPlus size={16} /> Üyeyi Kaydet
                  </button>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
