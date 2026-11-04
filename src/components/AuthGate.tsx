import React, { useState } from 'react';
import { 
  Lock, 
  KeyRound, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  AlertCircle, 
  Check, 
  X
} from 'lucide-react';

interface AuthGateProps {
  children: (props: {
    onLogout: () => void;
    openChangePassword: () => void;
  }) => React.ReactNode;
}

const DEFAULT_PASSCODE = 'friendslop';

export const AuthGate: React.FC<AuthGateProps> = ({ children }) => {
  // Check existing session
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return (
      localStorage.getItem('radar_authenticated') === 'true' ||
      sessionStorage.getItem('radar_authenticated') === 'true'
    );
  });

  // Login form state
  const [inputPass, setInputPass] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Change password modal state
  const [isChangeModalOpen, setIsChangeModalOpen] = useState(false);
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [changeError, setChangeError] = useState<string | null>(null);
  const [changeSuccess, setChangeSuccess] = useState<string | null>(null);

  // Get active passcode
  const getStoredPasscode = (): string => {
    return localStorage.getItem('radar_team_passcode') || DEFAULT_PASSCODE;
  };

  // Handle Login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const correctPass = getStoredPasscode();

    if (inputPass.trim() === correctPass.trim()) {
      setErrorMsg(null);
      if (rememberMe) {
        localStorage.setItem('radar_authenticated', 'true');
      } else {
        sessionStorage.setItem('radar_authenticated', 'true');
      }
      setIsAuthenticated(true);
    } else {
      setErrorMsg('Girdiğiniz şifre hatalı. Lütfen tekrar deneyin.');
    }
  };

  // Handle Logout
  const handleLogout = () => {
    localStorage.removeItem('radar_authenticated');
    sessionStorage.removeItem('radar_authenticated');
    setIsAuthenticated(false);
    setInputPass('');
    setErrorMsg(null);
  };

  // Handle Change Password
  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setChangeError(null);
    setChangeSuccess(null);

    const correctPass = getStoredPasscode();

    if (currentPass !== correctPass) {
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

    localStorage.setItem('radar_team_passcode', newPass);
    setChangeSuccess('✅ Ekip şifresi başarıyla güncellendi!');
    setTimeout(() => {
      setIsChangeModalOpen(false);
      setCurrentPass('');
      setNewPass('');
      setConfirmPass('');
      setChangeSuccess(null);
    }, 1500);
  };

  // If NOT authenticated, render Login Screen
  if (!isAuthenticated) {
    return (
      <div className="login-screen-wrap">
        <div className="login-card">
          {/* Logo & Header */}
          <div className="login-header">
            <div className="login-icon-box">
              <Lock size={24} />
            </div>
            <h1 className="login-title">GameLaunch Radar</h1>
            <span className="login-badge">GELİŞTİRİCİ & EKİP GİRİŞİ</span>
            <p className="login-desc">
              Bu platform ekibinize özel lansman stratejilerini, çakışma analizlerini ve Steam key şablonlarını barındırır.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="login-form">
            {errorMsg && (
              <div className="login-error-alert">
                <AlertCircle size={15} />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="login-input-group">
              <label>Ekip Erişim Şifresi</label>
              <div className="login-input-wrapper">
                <KeyRound size={16} className="input-ico-left" />
                <input 
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoFocus
                  placeholder="Şifrenizi girin..."
                  value={inputPass}
                  onChange={(e) => {
                    setInputPass(e.target.value);
                    if (errorMsg) setErrorMsg(null);
                  }}
                  className="login-password-input"
                />
                <button 
                  type="button" 
                  className="input-eye-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? 'Gizle' : 'Göster'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
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
                <span>Beni bu tarayıcıda hatırla</span>
              </label>
            </div>

            <button type="submit" className="login-submit-btn">
              <ShieldCheck size={16} />
              <span>Panele Giriş Yap</span>
            </button>
          </form>

          {/* Default Pass Hint */}
          <div className="login-footer-hint">
            <span>İlk kurulum varsayılan şifresi: <code>friendslop</code></span>
            <span className="hint-sub">Giriş yaptıktan sonra şifrenizi istediğiniz zaman değiştirebilirsiniz.</span>
          </div>
        </div>
      </div>
    );
  }

  // If authenticated, render main app + optional password change modal
  return (
    <>
      {children({
        onLogout: handleLogout,
        openChangePassword: () => setIsChangeModalOpen(true),
      })}

      {/* Change Password Modal */}
      {isChangeModalOpen && (
        <div className="simple-modal-backdrop" onClick={() => setIsChangeModalOpen(false)}>
          <div className="simple-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-top">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <KeyRound size={18} style={{ color: '#58a6ff' }} />
                Ekip Erişim Şifresini Değiştir
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
                <label>Mevcut Şifre</label>
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
                  Şifreyi Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

