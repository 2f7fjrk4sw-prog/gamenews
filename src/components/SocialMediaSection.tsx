import React, { useState } from 'react';
import { initialSocialTemplates, type SocialPostTemplate } from '../data/socialTemplates';
import { 
  Copy, 
  Check, 
  Sparkles, 
  Volume2, 
  Film, 
  MessageCircle 
} from 'lucide-react';

interface SocialMediaSectionProps {
  myGameTitle: string;
}

export const SocialMediaSection: React.FC<SocialMediaSectionProps> = ({ myGameTitle }) => {
  const [templates] = useState<SocialPostTemplate[]>(initialSocialTemplates);
  const [selectedPlatform, setSelectedPlatform] = useState<string>('Hepsi');
  const [gameTitle, setGameTitle] = useState(myGameTitle || 'Kaos Ekibi');
  const [price, setPrice] = useState('6.99');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filterPlatforms = ['Hepsi', 'TikTok', 'Instagram', 'Both'];

  // Dynamic variable replacement
  const compile = (text: string) => {
    return text
      .replace(/\[Oyun Adı\]/g, gameTitle)
      .replace(/\[Oyununuzun Adı\]/g, gameTitle)
      .replace(/\[Fiyat\]/g, price);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(compile(text));
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filtered = templates.filter((tpl) => {
    if (selectedPlatform === 'Hepsi') return true;
    if (selectedPlatform === 'Both') return tpl.platform === 'Both';
    return tpl.platform === selectedPlatform || tpl.platform === 'Both';
  });

  return (
    <div className="tab-pane">
      {/* 1. Quick Config Bar */}
      <div className="simple-params-bar">
        <div className="param-field">
          <label>Oyun Adınız:</label>
          <input 
            type="text" 
            value={gameTitle} 
            onChange={(e) => setGameTitle(e.target.value)} 
            placeholder="Oyun Adı"
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

        <div className="simple-filters" style={{ marginLeft: 'auto' }}>
          {filterPlatforms.map((plat) => (
            <button
              key={plat}
              className={`pill-btn ${selectedPlatform === plat ? 'active' : ''}`}
              onClick={() => setSelectedPlatform(plat)}
            >
              {plat === 'Hepsi' ? 'Tüm Formatlar' : plat === 'Both' ? 'TikTok + Reels' : plat}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Viral Guidelines Box */}
      <div className="simple-info-bar">
        <Sparkles size={16} className="info-icon" />
        <span>
          <strong>TikTok & Instagram Reels Kuralı:</strong> Menü veya logo göstermeyin. İlk 2 saniyede komik çığlık, kapı kilitleme veya arkadaşı tuzağa itme anı olmalıdır.
        </span>
      </div>

      {/* 3. Cards Grid */}
      <div className="clean-cards-grid">
        {filtered.map((tpl) => {
          const compiledCaption = compile(tpl.captionTemplate);
          const fullScript = `EKRANDAKİ YAZI:\n"${compile(tpl.hookText)}"\n\nSES FİKRİ:\n${tpl.audioIdea}\n\nKURGU SENARYOSU:\n${tpl.videoScenario}\n\nAÇIKLAMA:\n${compiledCaption}\n\nHASHTAGLER:\n${tpl.hashtags.join(' ')}`;

          return (
            <div key={tpl.id} className="clean-card">
              <div className="clean-card-header">
                <div>
                  <span className="platform-tag">
                    {tpl.platform === 'Both' ? 'TikTok & Instagram' : tpl.platform} • {tpl.type}
                  </span>
                  <h3 className="clean-card-title">{tpl.title}</h3>
                </div>
              </div>

              {/* On-Screen Hook Box */}
              <div className="social-hook-box">
                <span className="hook-label">Ekrandaki İlk Yazı (Hook):</span>
                <p className="hook-text">"{compile(tpl.hookText)}"</p>
              </div>

              {/* Audio Idea */}
              <div className="channel-info-row">
                <span className="info-label"><Volume2 size={13} /> Önerilen Ses:</span>
                <span className="info-value">{tpl.audioIdea}</span>
              </div>

              {/* Scenario Outline */}
              <div className="social-scenario-box">
                <span className="info-label"><Film size={13} /> Kurgu Akışı:</span>
                <pre className="scenario-text">{tpl.videoScenario}</pre>
              </div>

              {/* Caption & Hashtags Preview */}
              <div className="social-caption-preview">
                <span className="info-label"><MessageCircle size={13} /> Gönderi Açıklaması:</span>
                <p className="caption-snippet">{compiledCaption}</p>
                <div className="hashtags-row">
                  {tpl.hashtags.map((h, i) => (
                    <span key={i} className="hashtag-chip">{h}</span>
                  ))}
                </div>
              </div>

              <div className="clean-card-footer">
                <button 
                  className="clean-link-btn"
                  onClick={() => handleCopy(fullScript, `${tpl.id}-full`)}
                >
                  {copiedId === `${tpl.id}-full` ? (
                    <>
                      <Check size={13} /> Senaryo Kopyalandı
                    </>
                  ) : (
                    <>
                      <Film size={13} /> Senaryoyu Kopyala
                    </>
                  )}
                </button>

                <button 
                  className="copy-main-btn"
                  onClick={() => handleCopy(`${compiledCaption}\n\n${tpl.hashtags.join(' ')}`, `${tpl.id}-cap`)}
                >
                  {copiedId === `${tpl.id}-cap` ? (
                    <>
                      <Check size={13} /> Açıklama Kopyalandı!
                    </>
                  ) : (
                    <>
                      <Copy size={13} /> Açıklamayı Kopyala
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
