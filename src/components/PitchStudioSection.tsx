import React, { useState } from 'react';
import type { PitchTemplate } from '../types';
import { 
  Send, 
  Copy, 
  Check, 
  Sparkles, 
  Key, 
  RefreshCw, 
  HelpCircle, 
  Radio, 
  MessageSquare, 
  Video, 
  Award,
  Users
} from 'lucide-react';

interface PitchStudioProps {
  templates: PitchTemplate[];
  myGameTitle: string;
}

export const PitchStudioSection: React.FC<PitchStudioProps> = ({ templates, myGameTitle }) => {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(templates[0]?.id || 'pitch-streamer');
  const [copied, setCopied] = useState(false);

  // Dynamic Generator Fields
  const [gameTitle, setGameTitle] = useState(myGameTitle || 'Kaos Ekibi');
  const [studioName, setStudioName] = useState('PixelChaos Studio');
  const [mechanic, setMechanic] = useState('4 arkadaş canavarlardan kaçarken birbirinin sesini sadece yakındayken duyabildiği ve cesetleri gemiye taşımak zorunda kaldığı fizik-korku oyunu');
  const [streamerName, setStreamerName] = useState('Sevgili Yayıncı / İçerik Üreticisi');
  const [price, setPrice] = useState('6.99');
  const [steamLink, setSteamLink] = useState('https://store.steampowered.com/app/XXXXXX');
  const [clipLink, setClipLink] = useState('https://tiktok.com/@oyunumuz/video/komik-klip');
  const [pressKitLink, setPressKitLink] = useState('https://drive.google.com/drive/folders/oyun-press-kit');
  
  // 4 Steam Keys
  const [keys, setKeys] = useState({
    key1: 'ABCD-1234-EFGH',
    key2: 'IJKL-5678-MNOP',
    key3: 'QRST-9012-UVWX',
    key4: 'YZAB-3456-CDEF',
  });

  const generateRandomKeys = () => {
    const genKey = () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      const part = (len: number) => Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
      return `${part(4)}-${part(4)}-${part(4)}`;
    };
    setKeys({
      key1: genKey(),
      key2: genKey(),
      key3: genKey(),
      key4: genKey(),
    });
  };

  const selectedTemplate = templates.find((t) => t.id === selectedTemplateId) || templates[0];

  // Dynamically replace placeholders with user values
  const processText = (text: string): string => {
    return text
      .replace(/\[Oyununuzun Adı\]/g, gameTitle)
      .replace(/\[Oyun Adı\]/g, gameTitle)
      .replace(/\[Adınız \/ Ekip Adınız\]/g, studioName)
      .replace(/\[Ekip Sayısı\]/g, '3')
      .replace(/\[1 Cümlelik Kaotik Mekanik.*?\]/g, mechanic)
      .replace(/\[1 Cümlelik Kaotik Mekanik\]/g, mechanic)
      .replace(/\[Özel Mekaniğiniz.*?\]/g, mechanic)
      .replace(/\[Yayıncı Adı\]/g, streamerName)
      .replace(/\[Fiyat\]/g, price)
      .replace(/\[Steam Linkiniz\]/g, steamLink)
      .replace(/\[Steam Link\]/g, steamLink)
      .replace(/\[Klip Linki\]/g, clipLink)
      .replace(/\[Press Kit Linki \/ Google Drive\]/g, pressKitLink)
      .replace(/\[STEAM-KEY-1\]/g, keys.key1)
      .replace(/\[STEAM-KEY-2\]/g, keys.key2)
      .replace(/\[STEAM-KEY-3\]/g, keys.key3)
      .replace(/\[STEAM-KEY-4\]/g, keys.key4);
  };

  const compiledSubject = processText(selectedTemplate.subject);
  const compiledBody = processText(selectedTemplate.templateBody);

  const fullCopyText = `Konu: ${compiledSubject}\n\n${compiledBody}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(fullCopyText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const getTemplateIcon = (category: PitchTemplate['category']) => {
    switch (category) {
      case 'Streamer 4-Pack':
        return <Radio size={16} />;
      case 'Press / News':
        return <Award size={16} />;
      case 'Reddit Launch':
        return <MessageSquare size={16} />;
      case 'TikTok Hook':
        return <Video size={16} />;
      case 'Discord Community':
        return <Users size={16} />;
      default:
        return <Send size={16} />;
    }
  };

  return (
    <section className="section-container">
      {/* Template Chooser Bar */}
      <div className="template-nav-bar">
        {templates.map((tpl) => (
          <button
            key={tpl.id}
            className={`template-nav-btn ${selectedTemplateId === tpl.id ? 'active' : ''}`}
            onClick={() => setSelectedTemplateId(tpl.id)}
          >
            {getTemplateIcon(tpl.category)}
            <span>{tpl.title.split('(')[0]}</span>
            <span className="template-badge-pill">{tpl.badge.split(' ')[0]}</span>
          </button>
        ))}
      </div>

      <div className="pitch-studio-layout">
        {/* Left Column: Interactive Inputs */}
        <div className="pitch-inputs-panel">
          <div className="panel-title-row">
            <Sparkles size={18} className="panel-icon" />
            <h3>Akıllı Değişkenleri Özelleştir</h3>
          </div>
          <p className="panel-subtitle">
            Aşağıdaki alanları doldurduğunuzda sağdaki şablon anında otomatik güncellenir.
          </p>

          <div className="pitch-form">
            <div className="form-group">
              <label>Oyununuzun Adı</label>
              <input 
                type="text" 
                className="form-input" 
                value={gameTitle}
                onChange={(e) => setGameTitle(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Stüdyo / Geliştirici Ekip Adı</label>
              <input 
                type="text" 
                className="form-input" 
                value={studioName}
                onChange={(e) => setStudioName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>1 Cümlelik Kaotik Mekanik (Friendslop Hook)</label>
              <textarea 
                className="form-textarea" 
                rows={2}
                value={mechanic}
                onChange={(e) => setMechanic(e.target.value)}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Hedef Fiyat ($)</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Yayıncı / Alıcı Adı</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={streamerName}
                  onChange={(e) => setStreamerName(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Steam Mağaza Linki</label>
              <input 
                type="text" 
                className="form-input" 
                value={steamLink}
                onChange={(e) => setSteamLink(e.target.value)}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Kısa Oynanış Klibi (TikTok / Shorts)</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={clipLink}
                  onChange={(e) => setClipLink(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Basın Kiti (Google Drive / Web)</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={pressKitLink}
                  onChange={(e) => setPressKitLink(e.target.value)}
                />
              </div>
            </div>

            {/* 4-Pack Keys Generator */}
            {selectedTemplate.category === 'Streamer 4-Pack' && (
              <div className="keys-generator-box">
                <div className="keys-header">
                  <div className="keys-title">
                    <Key size={15} /> 4'lü Steam Key Paketi
                  </div>
                  <button 
                    type="button" 
                    className="btn-text-small"
                    onClick={generateRandomKeys}
                  >
                    <RefreshCw size={13} /> Rastgele Üret
                  </button>
                </div>
                <div className="keys-inputs-grid">
                  <input 
                    type="text" 
                    className="key-input"
                    value={keys.key1}
                    onChange={(e) => setKeys({ ...keys, key1: e.target.value })}
                  />
                  <input 
                    type="text" 
                    className="key-input"
                    value={keys.key2}
                    onChange={(e) => setKeys({ ...keys, key2: e.target.value })}
                  />
                  <input 
                    type="text" 
                    className="key-input"
                    value={keys.key3}
                    onChange={(e) => setKeys({ ...keys, key3: e.target.value })}
                  />
                  <input 
                    type="text" 
                    className="key-input"
                    value={keys.key4}
                    onChange={(e) => setKeys({ ...keys, key4: e.target.value })}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Compiled Preview & Copy */}
        <div className="pitch-preview-panel">
          <div className="preview-header">
            <div>
              <span className="preview-badge">{selectedTemplate.badge}</span>
              <h3 className="preview-title">{selectedTemplate.title}</h3>
            </div>
            <button 
              className={`btn-copy ${copied ? 'copied' : ''}`}
              onClick={handleCopy}
            >
              {copied ? (
                <>
                  <Check size={16} /> Panoya Kopyalandı!
                </>
              ) : (
                <>
                  <Copy size={16} /> Şablonu Kopyala
                </>
              )}
            </button>
          </div>

          <div className="preview-subject-box">
            <span className="subject-label">E-Posta / Gönderi Konusu:</span>
            <p className="subject-content">{compiledSubject}</p>
          </div>

          <div className="preview-body-box">
            <pre className="body-content">{compiledBody}</pre>
          </div>

          {/* Pro Tips Box */}
          <div className="pitch-tips-card">
            <div className="tips-card-header">
              <HelpCircle size={16} />
              <span>Geliştirici İpuçları & Friendslop Kuralları</span>
            </div>
            <ul className="tips-list">
              {selectedTemplate.tips.map((tip, idx) => (
                <li key={idx}>{tip}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

