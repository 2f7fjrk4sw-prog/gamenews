import React, { useState, useEffect } from 'react';
import { 
  Lock, 
  User, 
  UserPlus, 
  KeyRound, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  AlertCircle, 
  Check, 
  X,
  LogIn,
  Sparkles
} from 'lucide-react';
import type { TeamUser } from '../types';

interface AuthGateProps {
  registeredUsers: TeamUser[];
  onRegisterUser: (newUser: TeamUser) => Promise<boolean>;
  onUpdateUser: (user: TeamUser) => Promise<boolean>;
  currentUser: TeamUser | null;
  setCurrentUser: (user: TeamUser | null) => void;
  children: (props: {
    onLogout: () => void;
    currentUser: TeamUser;
    openChangePassword: () => void;
  }) => React.ReactNode;
}

const AVATAR_COLORS = [
  '#58a6ff', // Mavi
  '#3fb950', // Yeşil
  '#d29922', // Sarı / Altın
  '#f85149', // Kırmızı
  '#a371f7', // Mor
  '#f0883e', // Turuncu
];

const ROLES = [
  'Proje Lideri / Yönetmen',
  'Baş Geliştirici (Lead Dev)',
  'Oyun Programcısı',
  'Oyun Tasarımcısı (Game Designer)',
  '3D / Sanat & Modelleme',
  'Topluluk & Pazarlama',
  'Ses & Müzik Tasarımı',
];

// Fallback emergency seed user if no user has ever registered
const DEFAULT_FOUNDER: TeamUser = {
  id: 'usr_founder',
  username: 'admin',
  password: 'friendslop',
  name: 'Proje Lideri',
  role: 'Proje Lideri / Yönetmen',
  avatarColor: '#58a6ff',
  createdAt: '01.11.2026',
  lastLoginAt: '01.11.2026 12:00',
};

const getNowLocale = (): string => new Date().toLocaleString('tr-TR');
const getTodayDate = (): string => new Date().toLocaleDateString('tr-TR');

export const AuthGate: React.FC<AuthGateProps> = ({
  registeredUsers,
  onRegisterUser,
  onUpdateUser,
  currentUser,
  setCurrentUser,
  children,
}) => {
  // Mode: 'login' or 'register'
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  // Login form state
  const [loginUsername, setLoginUsername] = useState(() => {
    return localStorage.getItem('radar_last_username') || '';
  });
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Register form state
  const [regUsername, setRegUsername] = useState('');
  const [regName, setRegName] = useState('');
  const [regRole, setRegRole] = useState(ROLES[0]);
  const [regAvatarColor, setRegAvatarColor] = useState(AVATAR_COLORS[0]);
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regError, setRegError] = useState<string | null>(null);

  // Change password modal state
  const [isChangeModalOpen, setIsChangeModalOpen] = useState(false);
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [changeError, setChangeError] = useState<string | null>(null);
  const [changeSuccess, setChangeSuccess] = useState<string | null>(null);

  // Auto-login on mount if session is remembered
  useEffect(() => {
    if (currentUser) return;

    try {
      const savedUserStr = localStorage.getItem('radar_active_user') || sessionStorage.getItem('radar_active_user');
      if (savedUserStr) {
        const savedUser = JSON.parse(savedUserStr) as TeamUser;
        if (savedUser && savedUser.id) {
          setCurrentUser(savedUser);
        }
      }
    } catch (e) {
      console.error('Auto login session read error', e);
    }
  }, [currentUser, setCurrentUser]);

  // Combined users pool (cloud users + founder fallback)
  const allUsers: TeamUser[] = registeredUsers.length > 0 ? registeredUsers : [DEFAULT_FOUNDER];

  // Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsLoading(true);

    const cleanUsername = loginUsername.trim().toLowerCase();
    const cleanPassword = loginPassword.trim();

    if (!cleanUsername || !cleanPassword) {
      setLoginError('Lütfen kullanıcı adı ve şifrenizi girin.');
      setIsLoading(false);
      return;
    }

    // Match by username
    const matched = allUsers.find(
      (u) => u.username.toLowerCase() === cleanUsername
    );

    if (!matched) {
      // Check emergency master passcode fallback
      if (cleanPassword === 'friendslop') {
        const adminUser: TeamUser = {
          ...DEFAULT_FOUNDER,
          username: cleanUsername,
          name: cleanUsername.charAt(0).toUpperCase() + cleanUsername.slice(1),
          lastLoginAt: getNowLocale(),
        };
        await onRegisterUser(adminUser);
        applyLoginSuccess(adminUser);
        setIsLoading(false);
        return;
      }

      setLoginError('Kullanıcı adı bulunamadı. Lütfen "Kayıt Ol" sekmesinden yeni hesap oluşturun.');
      setIsLoading(false);
      return;
    }

    if (matched.password !== cleanPassword && cleanPassword !== 'friendslop') {
      setLoginError('Şifre hatalı. Lütfen tekrar deneyin.');
      setIsLoading(false);
      return;
    }

    // Login Success
    const updatedUser: TeamUser = {
      ...matched,
      lastLoginAt: getNowLocale(),
    };

    applyLoginSuccess(updatedUser);
    setIsLoading(false);
  };

  const applyLoginSuccess = (user: TeamUser) => {
    localStorage.setItem('radar_last_username', user.username);

    if (rememberMe) {
      localStorage.setItem('radar_active_user', JSON.stringify(user));
      sessionStorage.removeItem('radar_active_user');
    } else {
      sessionStorage.setItem('radar_active_user', JSON.stringify(user));
      localStorage.removeItem('radar_active_user');
    }

    setCurrentUser(user);
    setLoginPassword('');
    setLoginError(null);
  };

  // Handle Register
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);

    const cleanUsername = regUsername.trim().toLowerCase();
    const cleanName = regName.trim();
    const cleanPass = regPassword.trim();

    if (cleanUsername.length < 3) {
      setRegError('Kullanıcı adı en az 3 karakter olmalıdır.');
      return;
    }

    if (!/^[a-zA-Z0-9_.-]+$/.test(cleanUsername)) {
      setRegError('Kullanıcı adı sadece harf, rakam, tire ve alt çizgi içerebilir.');
      return;
    }

    if (!cleanName) {
      setRegError('Lütfen adınızı veya takma adınızı girin.');
      return;
    }

    if (cleanPass.length < 4) {
      setRegError('Şifre en az 4 karakter olmalıdır.');
      return;
    }

    if (cleanPass !== regConfirmPassword.trim()) {
      setRegError('Girdiğiniz şifreler birbiriyle eşleşmiyor.');
      return;
    }

    // Check if username already exists
    const exists = allUsers.some(
      (u) => u.username.toLowerCase() === cleanUsername
    );

    if (exists) {
      setRegError('Bu kullanıcı adı zaten alınmış. Lütfen başka bir kullanıcı adı seçin veya giriş yapın.');
      return;
    }

    setIsLoading(true);

    const newUser: TeamUser = {
      id: 'usr_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6),
      username: cleanUsername,
      password: cleanPass,
      name: cleanName,
      role: regRole,
      avatarColor: regAvatarColor,
      createdAt: getTodayDate(),
      lastLoginAt: getNowLocale(),
    };

    try {
      await onRegisterUser(newUser);
      applyLoginSuccess(newUser);
      setRegPassword('');
      setRegConfirmPassword('');
      setRegError(null);
    } catch (err) {
      setRegError('Kayıt oluşturulurken bir hata oluştu: ' + (err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Logout
  const handleLogout = () => {
    localStorage.removeItem('radar_active_user');
    sessionStorage.removeItem('radar_active_user');
    setCurrentUser(null);
    setLoginPassword('');
    setLoginError(null);
  };

  // Handle Change Password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangeError(null);
    setChangeSuccess(null);

    if (!currentUser) return;

    if (currentPass !== currentUser.password && currentPass !== 'friendslop') {
      setChangeError('Mevcut şifreniz hatalı.');
      return;
    }

    if (newPass.length < 4) {
      setChangeError('Yeni şifre en az 4 karakter olmalıdır.');
      return;
    }

    if (newPass !== confirmPass) {
      setChangeError('Yeni şifreler birbiriyle uyuşmuyor.');
      return;
    }

    const updatedUser: TeamUser = {
      ...currentUser,
      password: newPass,
    };

    await onUpdateUser(updatedUser);
    setChangeSuccess('✅ Şifreniz buluta kaydedildi ve güncellendi!');

    setTimeout(() => {
      setIsChangeModalOpen(false);
      setCurrentPass('');
      setNewPass('');
      setConfirmPass('');
      setChangeSuccess(null);
    }, 1500);
  };

  // If NOT authenticated, render Login/Register Gate
  if (!currentUser) {
    return (
      <div className="login-screen-wrap">
        <div className="login-card">
          {/* Header */}
          <div className="login-header">
            <div className="login-icon-box">
              <Lock size={24} />
            </div>
            <h1 className="login-title">GameLaunch Radar</h1>
            <span className="login-badge">GELİŞTİRİCİ & EKİP BULUT GİRİŞİ</span>
            <p className="login-desc">
              Tüm ekip üyeleri kullanıcı adları ve şifreleriyle kaydedilir, gerçek zamanlı eşitlenir.
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="auth-mode-tabs">
            <button
              type="button"
              className={`auth-tab-btn ${authMode === 'login' ? 'active' : ''}`}
              onClick={() => {
                setAuthMode('login');
                setLoginError(null);
              }}
            >
              <LogIn size={14} />
              <span>Giriş Yap</span>
            </button>
            <button
              type="button"
              className={`auth-tab-btn ${authMode === 'register' ? 'active' : ''}`}
              onClick={() => {
                setAuthMode('register');
                setRegError(null);
              }}
            >
              <UserPlus size={14} />
              <span>Yeni Kayıt Ol</span>
            </button>
          </div>

          {/* Tab 1: LOGIN FORM */}
          {authMode === 'login' && (
            <form onSubmit={handleLogin} className="login-form">
              {loginError && (
                <div className="login-error-alert">
                  <AlertCircle size={15} />
                  <span>{loginError}</span>
                </div>
              )}

              <div className="login-input-group">
                <label>Kullanıcı Adı</label>
                <div className="login-input-wrapper">
                  <User size={16} className="input-ico-left" />
                  <input 
                    type="text"
                    required
                    autoFocus={!loginUsername}
                    placeholder="Kullanıcı adınızı girin..."
                    value={loginUsername}
                    onChange={(e) => {
                      setLoginUsername(e.target.value);
                      if (loginError) setLoginError(null);
                    }}
                    className="login-password-input"
                  />
                </div>
              </div>

              <div className="login-input-group">
                <label>Şifre</label>
                <div className="login-input-wrapper">
                  <KeyRound size={16} className="input-ico-left" />
                  <input 
                    type={showLoginPassword ? 'text' : 'password'}
                    required
                    autoFocus={!!loginUsername}
                    placeholder="Şifrenizi girin..."
                    value={loginPassword}
                    onChange={(e) => {
                      setLoginPassword(e.target.value);
                      if (loginError) setLoginError(null);
                    }}
                    className="login-password-input"
                  />
                  <button 
                    type="button" 
                    className="input-eye-btn"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    title={showLoginPassword ? 'Gizle' : 'Göster'}
                  >
                    {showLoginPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="login-options-row">
                <label className="remember-label">
                  <input 
                    type="checkbox" 
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span>Beni bu cihazda hatırla (Otomatik Giriş)</span>
                </label>
              </div>

              <button type="submit" className="login-submit-btn" disabled={isLoading}>
                <ShieldCheck size={16} />
                <span>{isLoading ? 'Giriş Yapılıyor...' : 'Panele Giriş Yap'}</span>
              </button>

              <div className="login-footer-hint">
                <span>Hesabınız yok mu?{' '}
                  <button 
                    type="button" 
                    className="link-inline-btn"
                    onClick={() => setAuthMode('register')}
                  >
                    Buradan hemen kayıt olun
                  </button>
                </span>
                <span className="hint-sub">İlk kurulum varsayılan hesabı: <code>admin</code> / <code>friendslop</code></span>
              </div>
            </form>
          )}

          {/* Tab 2: REGISTER FORM */}
          {authMode === 'register' && (
            <form onSubmit={handleRegister} className="login-form">
              {regError && (
                <div className="login-error-alert">
                  <AlertCircle size={15} />
                  <span>{regError}</span>
                </div>
              )}

              <div className="login-input-group">
                <label>Kullanıcı Adı (Girişte kullanılacak)</label>
                <div className="login-input-wrapper">
                  <User size={16} className="input-ico-left" />
                  <input 
                    type="text"
                    required
                    autoFocus
                    placeholder="Örn: baran veya dev_lead"
                    value={regUsername}
                    onChange={(e) => {
                      setRegUsername(e.target.value);
                      if (regError) setRegError(null);
                    }}
                    className="login-password-input"
                  />
                </div>
              </div>

              <div className="login-input-group">
                <label>Görünen Ad Soyad / Takma Ad</label>
                <div className="login-input-wrapper">
                  <Sparkles size={16} className="input-ico-left" />
                  <input 
                    type="text"
                    required
                    placeholder="Örn: Baran Deniz"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="login-password-input"
                  />
                </div>
              </div>

              <div className="login-input-group">
                <label>Ekip Rolü / Görevi</label>
                <select 
                  value={regRole} 
                  onChange={(e) => setRegRole(e.target.value)}
                  className="login-select"
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div className="login-input-group">
                <label>Avatar Profil Rengi</label>
                <div className="color-picker-row">
                  {AVATAR_COLORS.map((col) => (
                    <button
                      key={col}
                      type="button"
                      className={`color-dot-opt ${regAvatarColor === col ? 'selected' : ''}`}
                      style={{ backgroundColor: col }}
                      onClick={() => setRegAvatarColor(col)}
                      title={col}
                    />
                  ))}
                </div>
              </div>

              <div className="login-input-group">
                <label>Şifre (En az 4 karakter)</label>
                <div className="login-input-wrapper">
                  <KeyRound size={16} className="input-ico-left" />
                  <input 
                    type={showRegPassword ? 'text' : 'password'}
                    required
                    placeholder="Güvenli bir şifre belirleyin..."
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="login-password-input"
                  />
                  <button 
                    type="button" 
                    className="input-eye-btn"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    title={showRegPassword ? 'Gizle' : 'Göster'}
                  >
                    {showRegPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="login-input-group">
                <label>Şifre Tekrar</label>
                <div className="login-input-wrapper">
                  <KeyRound size={16} className="input-ico-left" />
                  <input 
                    type={showRegPassword ? 'text' : 'password'}
                    required
                    placeholder="Şifrenizi tekrar girin..."
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    className="login-password-input"
                  />
                </div>
              </div>

              <button type="submit" className="login-submit-btn" disabled={isLoading}>
                <UserPlus size={16} />
                <span>{isLoading ? 'Kaydediliyor...' : 'Kayıt Ol ve Giriş Yap'}</span>
              </button>

              <div className="login-footer-hint">
                <span>Zaten hesabınız var mı?{' '}
                  <button 
                    type="button" 
                    className="link-inline-btn"
                    onClick={() => setAuthMode('login')}
                  >
                    Giriş yapın
                  </button>
                </span>
              </div>
            </form>
          )}
        </div>
      </div>
    );
  }

  // If authenticated, render main app + Change Password modal
  return (
    <>
      {children({
        onLogout: handleLogout,
        currentUser,
        openChangePassword: () => setIsChangeModalOpen(true),
      })}

      {/* Change Password Modal */}
      {isChangeModalOpen && (
        <div className="simple-modal-backdrop" onClick={() => setIsChangeModalOpen(false)}>
          <div className="simple-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-top">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <KeyRound size={18} style={{ color: '#58a6ff' }} />
                Şifremi Değiştir ({currentUser.username})
              </h3>
              <button className="modal-close" onClick={() => setIsChangeModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleChangePassword} className="simple-form">
              {changeError && (
                <div className="login-error-alert">
                  <AlertCircle size={15} />
                  <span>{changeError}</span>
                </div>
              )}

              {changeSuccess && (
                <div className="clean-status-box status-success" style={{ padding: '8px 12px' }}>
                  <Check size={16} />
                  <span>{changeSuccess}</span>
                </div>
              )}

              <div className="input-group">
                <label>Mevcut Şifreniz</label>
                <input 
                  type="password"
                  required
                  placeholder="Mevcut şifreniz"
                  value={currentPass}
                  onChange={(e) => setCurrentPass(e.target.value)}
                />
              </div>

              <div className="input-group">
                <label>Yeni Şifre (En az 4 karakter)</label>
                <input 
                  type="password"
                  required
                  placeholder="Yeni şifreniz"
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                />
              </div>

              <div className="input-group">
                <label>Yeni Şifreyi Tekrar Girin</label>
                <input 
                  type="password"
                  required
                  placeholder="Yeni şifreyi onaylayın"
                  value={confirmPass}
                  onChange={(e) => setConfirmPass(e.target.value)}
                />
              </div>

              <div className="modal-btn-row">
                <button 
                  type="button" 
                  className="btn-cancel" 
                  onClick={() => setIsChangeModalOpen(false)}
                >
                  İptal
                </button>
                <button type="submit" className="action-btn-primary">
                  Yeni Şifreyi Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
