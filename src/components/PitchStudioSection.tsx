import React, { useState } from 'react';
import type { PitchTemplate } from '../types';
import { 
  Copy, 
  Check, 
  Key, 
  RefreshCw, 
  Info 
} from 'lucide-react';

interface PitchStudioProps {
  templates: PitchTemplate[];
  myGameTitle: string;
}

export const PitchStudioSection: React.FC<PitchStudioProps> = ({ templates, myGameTitle }) => {
  const [selectedId, setSelectedId] = useState<string>(templates[0]?.id || 'pitch-streamer');
  const [copied, setCopied] = useState(false);

  // Key Dynamic Inputs
  const [gameTitle, setGameTitle] = useState(myGameTitle || 'Kaos Ekibi');
  const [price, setPrice] = useState('6.99');
  const [mechanic, setMechanic] = useState('4 arkadaş canavarlardan kaçarken sesinizi sadece yakındayken duyabildiğiniz fizik-korku oyunu');
  const [steamLink, setSteamLink] = useState('https://store.steampowered.com/app/XXXXXX');
  const [streamerName, setStreamerName] = useState('Sevgili Yayıncı');

  // 4 Steam Keys
  const [keys, setKeys] = useState({
    key1: 'ABCD-1234-EFGH',
    key2: 'IJKL-5678-MNOP',
    key3: 'QRST-9012-UVWX',
    key4: 'YZAB-3456-CDEF',
  });

  const generateKeys = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const r = () => Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    setKeys({
      key1: `${r()}-${r()}-${r()}`,
      key2: `${r()}-${r()}-${r()}`,
      key3: `${r()}-${r()}-${r()}`,
      key4: `${r()}-${r()}-${r()}`,
    });
  };

  const selectedTemplate = templates.find((t) => t.id === selectedId) || templates[0];

  // Dynamic text replacement
  const compile = (text: string) => {
    return text
      .replace(/\[Oyununuzun Adı\]/g, gameTitle)
      .replace(/\[Oyun Adı\]/g, gameTitle)
      .replace(/\[Adınız \/ Ekip Adınız\]/g, 'Geliştirici Ekip')
      .replace(/\[Ekip Sayısı\]/g, '3')
      .replace(/\[1 Cümlelik Kaotik Mekanik.*?\]/g, mechanic)
      .replace(/\[1 Cümlelik Kaotik Mekanik\]/g, mechanic)
      .replace(/\[Özel Mekaniğiniz.*?\]/g, mechanic)
      .replace(/\[Yayıncı Adı\]/g, streamerName)
      .replace(/\[Fiyat\]/g, price)
      .replace(/\[Steam Linkiniz\]/g, steamLink)
      .replace(/\[Steam Link\]/g, steamLink)
      .replace(/\[Klip Linki\]/g, 'https://tiktok.com/@video-linki')
      .replace(/\[Press Kit Linki \/ Google Drive\]/g, 'https://drive.google.com/press-kit')
      .replace(/\[STEAM-KEY-1\]/g, keys.key1)
      .replace(/\[STEAM-KEY-2\]/g, keys.key2)
      .replace(/\[STEAM-KEY-3\]/g, keys.key3)
      .replace(/\[STEAM-KEY-4\]/g, keys.key4);
  };

  const compiledSubject = compile(selectedTemplate.subject);
  const compiledBody = compile(selectedTemplate.templateBody);

  const handleCopy = () => {
    navigator.clipboard.writeText(`Konu: ${compiledSubject}\n\n${compiledBody}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="tab-pane">
      {/* 1. Template Selector Tabs */}
      <div className="pitch-tabs-row">
        {templates.map((tpl) => (
          <button
            key={tpl.id}
            className={`pitch-tab-btn ${selectedId === tpl.id ? 'active' : ''}`}
            onClick={() => setSelectedId(tpl.id)}
          >
            {tpl.title.split('(')[0]}
          </button>
        ))}
      </div>

      {/* 2. Simple Parameters Bar */}
      <div className="simple-params-bar">
        <div className="param-field">
          <label>Oyun Adınız:</label>
          <input 
            type="text" 
            value={gameTitle} 
            onChange={(e) => setGameTitle(e.target.value)} 
          />
        </div>

        <div className="param-field">
          <label>Fiyat ($):</label>
          <input 
            type="text" 
            style={{ width: '80px' }} 
            value={price} 
            onChange={(e) => setPrice(e.target.value)} 
          />
        </div>

        <div className="param-field grow">
          <label>1 Cümlelik Mekanik:</label>
          <input 
            type="text" 
            value={mechanic} 
            onChange={(e) => setMechanic(e.target.value)} 
          />
        </div>

        <div className="param-field">
          <label>Steam Link:</label>
          <input 
            type="text" 
            value={steamLink} 
            onChange={(e) => setSteamLink(e.target.value)} 
          />
        </div>

        {selectedTemplate.category === 'Streamer 4-Pack' && (
          <div className="param-field">
            <label>Yayıncı Adı:</label>
            <input 
              type="text" 
              value={streamerName} 
              onChange={(e) => setStreamerName(e.target.value)} 
            />
          </div>
        )}
      </div>

      {/* Optional Streamer Keys Box */}
      {selectedTemplate.category === 'Streamer 4-Pack' && (
        <div className="simple-keys-bar">
          <div className="keys-lead">
            <Key size={14} /> 4 Adet Steam Key:
          </div>
          <span className="key-pill">{keys.key1}</span>
          <span className="key-pill">{keys.key2}</span>
          <span className="key-pill">{keys.key3}</span>
          <span className="key-pill">{keys.key4}</span>
          <button className="key-refresh-btn" onClick={generateKeys}>
            <RefreshCw size={13} /> Yenile
          </button>
        </div>
      )}

      {/* 3. Clean Preview Box */}
      <div className="clean-preview-box">
        <div className="preview-top-bar">
          <div className="preview-heading">
            <span className="preview-subject-label">Konu:</span>
            <strong>{compiledSubject}</strong>
          </div>
          <button 
            className={`copy-main-btn ${copied ? 'copied' : ''}`}
            onClick={handleCopy}
          >
            {copied ? (
              <>
                <Check size={15} /> Kopyalandı!
              </>
            ) : (
              <>
                <Copy size={15} /> Metni Kopyala
              </>
            )}
          </button>
        </div>

        <div className="preview-content-box">
          <pre>{compiledBody}</pre>
        </div>

        <div className="preview-footer-tips">
          <Info size={14} className="tip-ico" />
          <span>
            {selectedTemplate.tips[0]}
          </span>
        </div>
      </div>
    </div>
  );
};
