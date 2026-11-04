import React, { useState } from 'react';
import { 
  Cloud, 
  CloudCheck, 
  CloudOff, 
  RefreshCw, 
  Copy, 
  Check, 
  AlertCircle, 
  X,
  Database
} from 'lucide-react';
import type { CloudSyncStatus } from '../types';
import { 
  getSupabaseConfig, 
  saveCustomSupabaseConfig, 
  clearCustomSupabaseConfig,
  testSupabaseConnection 
} from '../lib/supabase';

interface CloudSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  syncStatus: CloudSyncStatus;
  lastSyncedAt: string | null;
  errorMessage: string | null;
  onRefresh: () => Promise<void>;
}

const SQL_SETUP_SCRIPT = `-- 1. Ekip Proje Durumu Tablosu
create table if not exists team_project_state (
  id text primary key,
  state jsonb not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Herkesin okuyup yazabilmesi için izinler
alter table team_project_state enable row level security;
create policy "Ekip erisimi" on team_project_state for all using (true) with check (true);

-- 3. Canlı senkronizasyon (Realtime) aktif etme
alter publication supabase_realtime add table team_project_state;`;

export const CloudSyncModal: React.FC<CloudSyncModalProps> = ({
  isOpen,
  onClose,
  syncStatus,
  lastSyncedAt,
  errorMessage,
  onRefresh,
}) => {
  const config = getSupabaseConfig();
  const [urlInput, setUrlInput] = useState(config.url || '');
  const [keyInput, setKeyInput] = useState(config.anonKey || '');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message?: string } | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  if (!isOpen) return null;

  const handleCopySql = () => {
    navigator.clipboard.writeText(SQL_SETUP_SCRIPT);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  const handleTestAndSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim() || !keyInput.trim()) {
      setTestResult({ success: false, message: 'Lütfen hem URL hem de Anon Key alanlarını doldurun.' });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    const res = await testSupabaseConnection(urlInput, keyInput);
    setIsTesting(false);
    setTestResult(res);

    if (res.success) {
      saveCustomSupabaseConfig(urlInput, keyInput);
      await onRefresh();
    }
  };

  const handleClear = () => {
    clearCustomSupabaseConfig();
    setUrlInput('');
    setKeyInput('');
    setTestResult(null);
    window.location.reload();
  };

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await onRefresh();
    setIsRefreshing(false);
  };

  return (
    <div className="clean-modal-backdrop" onClick={onClose}>
      <div className="clean-modal-card cloud-modal" onClick={(e) => e.stopPropagation()}>
        <div className="clean-modal-header">
          <div className="modal-title-with-ico">
            <Database size={20} className="primary-ico" />
            <h3>Ekip Bulut Senkronizasyonu (Canlı Veritabanı)</h3>
          </div>
          <button className="clean-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="clean-modal-body">
          {/* Status Banner */}
          <div className={`cloud-status-banner ${syncStatus}`}>
            {syncStatus === 'synced' && (
              <>
                <CloudCheck size={24} className="status-ico success" />
                <div>
                  <strong>Canlı Senkronizasyon Aktif</strong>
                  <p>Tüm ekip üyeleri aynı verileri anlık olarak görür ve düzenler.</p>
                  {lastSyncedAt && <small>Son Eşitleme: {lastSyncedAt}</small>}
                </div>
              </>
            )}

            {syncStatus === 'syncing' && (
              <>
                <RefreshCw size={24} className="status-ico spin" />
                <div>
                  <strong>Buluta Gönderiliyor...</strong>
                  <p>Yaptığınız değişiklikler ekip veritabanına aktarılıyor.</p>
                </div>
              </>
            )}

            {syncStatus === 'connecting' && (
              <>
                <RefreshCw size={24} className="status-ico spin" />
                <div>
                  <strong>Buluta Bağlanılıyor...</strong>
                  <p>Son veriler sunucudan çekiliyor.</p>
                </div>
              </>
            )}

            {syncStatus === 'local' && (
              <>
                <CloudOff size={24} className="status-ico neutral" />
                <div>
                  <strong>Yerel Mod (Tek Cihaz)</strong>
                  <p>Değişiklikler şu an sadece sizin tarayıcınızda saklanıyor. Ekip arkadaşlarınızla canlı paylaşmak için aşağıdaki ücretsiz adımları izleyin.</p>
                </div>
              </>
            )}

            {syncStatus === 'error' && (
              <>
                <AlertCircle size={24} className="status-ico danger" />
                <div>
                  <strong>Bağlantı Uyarısı</strong>
                  <p>{errorMessage || 'Veritabanına bağlanılamadı. Lütfen ayarlarınızı kontrol edin.'}</p>
                </div>
              </>
            )}
          </div>

          {/* Quick Action: If connected */}
          {config.isConfigured && (
            <div className="cloud-active-details">
              <div className="cloud-active-row">
                <span>Bağlı URL:</span>
                <code>{config.url.replace(/https:\/\/(.*)\.supabase\.co.*/, 'https://$1.supabase.co')}</code>
                <span className="badge-source">{config.source === 'env' ? 'Vercel / .env' : 'Tarayıcı Ayarı'}</span>
              </div>
              <div className="cloud-active-actions">
                <button 
                  className="clean-btn secondary btn-sm"
                  onClick={handleManualRefresh}
                  disabled={isRefreshing}
                >
                  <RefreshCw size={14} className={isRefreshing ? 'spin' : ''} />
                  Verileri Yenile
                </button>
                {config.source === 'custom' && (
                  <button 
                    className="clean-btn danger-outline btn-sm"
                    onClick={handleClear}
                  >
                    Bağlantıyı Sıfırla
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Setup / Configuration Form */}
          {(!config.isConfigured || config.source === 'custom') && (
            <form onSubmit={handleTestAndSave} className="cloud-config-form">
              <h4>Ücretsiz Supabase Kurulumu (1 Dakika)</h4>

              <div className="clean-field">
                <label>Supabase Project URL</label>
                <input 
                  type="url"
                  placeholder="https://xyzproject.supabase.co"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  className="clean-input"
                  required
                />
              </div>

              <div className="clean-field">
                <label>Supabase Anon Public API Key</label>
                <input 
                  type="password"
                  placeholder="eyJh..."
                  value={keyInput}
                  onChange={(e) => setKeyInput(e.target.value)}
                  className="clean-input"
                  required
                />
              </div>

              {testResult && (
                <div className={`clean-alert-inline ${testResult.success ? 'alert-success' : 'alert-danger'}`}>
                  {testResult.success ? (
                    <>
                      <Check size={16} />
                      <span>Bağlantı başarılı! Veriler ekip bulutuna bağlandı.</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle size={16} />
                      <span>{testResult.message}</span>
                    </>
                  )}
                </div>
              )}

              <button 
                type="submit" 
                className="clean-btn primary full-width"
                disabled={isTesting}
              >
                {isTesting ? (
                  <>
                    <RefreshCw size={16} className="spin" />
                    Bağlantı Test Ediliyor...
                  </>
                ) : (
                  <>
                    <Cloud size={16} />
                    Test Et ve Buluta Bağla
                  </>
                )}
              </button>
            </form>
          )}

          {/* Step-by-Step Mini Guide & Copy SQL */}
          <div className="cloud-sql-box">
            <div className="cloud-sql-header">
              <span>Supabase SQL Editörüne Yapıştırılacak Kod:</span>
              <button 
                type="button" 
                className="copy-sql-btn"
                onClick={handleCopySql}
              >
                {copiedSql ? (
                  <>
                    <Check size={12} /> Kopyalandı!
                  </>
                ) : (
                  <>
                    <Copy size={12} /> Kodu Kopyala
                  </>
                )}
              </button>
            </div>
            <pre className="cloud-sql-code">{SQL_SETUP_SCRIPT}</pre>
            <p className="cloud-guide-note">
              💡 <strong>Nasıl Kurulur?</strong> 
              1. <a href="https://supabase.com" target="_blank" rel="noreferrer">supabase.com</a> sitesine GitHub ile ücretsiz kaydolun.
              2. <strong>New Project</strong> oluşturun.
              3. Sol menüden <strong>SQL Editor</strong>'ü açıp yukarıdaki kodu yapıştırıp <strong>Run</strong> deyin.
              4. <strong>Project Settings -&gt; API</strong> altındaki URL ve anon key'i buraya yapıştırın!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
