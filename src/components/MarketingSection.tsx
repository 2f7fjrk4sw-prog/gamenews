import React, { useState } from 'react';
import type { MarketingChannel } from '../types';
import { 
  Search, 
  ExternalLink, 
  Clock, 
  Users, 
  Lightbulb, 
  ShieldAlert 
} from 'lucide-react';

interface MarketingSectionProps {
  channels: MarketingChannel[];
}

export const MarketingSection: React.FC<MarketingSectionProps> = ({ channels }) => {
  const [selectedPlatform, setSelectedPlatform] = useState<string>('Hepsi');
  const [searchQuery, setSearchQuery] = useState('');

  const platforms = [
    { id: 'Hepsi', label: 'Tümü' },
    { id: 'Reddit', label: 'Reddit' },
    { id: 'Discord', label: 'Discord' },
    { id: 'TikTok/Shorts', label: 'TikTok & Shorts' },
    { id: 'Streamer', label: 'Yayıncılar (Twitch)' },
    { id: 'Festival', label: 'Steam Festivalleri' },
    { id: 'Press', label: 'Basın' },
  ];

  const filtered = channels.filter((ch) => {
    if (selectedPlatform !== 'Hepsi' && ch.platform !== selectedPlatform) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        ch.name.toLowerCase().includes(q) ||
        ch.category.toLowerCase().includes(q) ||
        ch.strategyTip.toLowerCase().includes(q) ||
        ch.tags.some(t => t.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="tab-pane">
      {/* 1. Quick Tip Banner */}
      <div className="simple-info-bar">
        <Lightbulb size={18} className="info-icon" />
        <span>
          <strong>Friendslop Pazarlama Kuralı:</strong> Kurumsal tanıtım yerine arkadaşların birbirine bağırdığı komik anlar, 
          Reddit geliştirici hikayeleri ve yayıncılara 4'lü paket key gönderme stratejisi en yüksek dönüşümü sağlar.
        </span>
      </div>

      {/* 2. Platform Filters & Search */}
      <div className="simple-controls-bar">
        <div className="simple-search">
          <Search size={16} />
          <input 
            type="text"
            placeholder="Kanal veya topluluk ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="simple-filters">
          {platforms.map((p) => (
            <button
              key={p.id}
              className={`pill-btn ${selectedPlatform === p.id ? 'active' : ''}`}
              onClick={() => setSelectedPlatform(p.id)}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Channels Cards Grid */}
      <div className="clean-cards-grid">
        {filtered.map((channel) => (
          <div key={channel.id} className="clean-card">
            <div className="clean-card-header">
              <div>
                <span className="platform-tag">{channel.platform}</span>
                <h3 className="clean-card-title">{channel.name}</h3>
                <span className="clean-card-sub">{channel.category}</span>
              </div>
              <div className="members-badge">
                <Users size={13} /> {channel.audienceSize}
              </div>
            </div>

            <div className="channel-info-row">
              <span className="info-label"><Clock size={13} /> En Uygun Zaman:</span>
              <span className="info-value">{channel.bestTiming}</span>
            </div>

            <div className="channel-rule-row">
              <ShieldAlert size={13} className="rule-ico" />
              <span>{channel.rulesSummary}</span>
            </div>

            <div className="channel-tip-box">
              <span className="tip-lead">💡 Taktik:</span>
              <p>{channel.strategyTip}</p>
            </div>

            <div className="clean-card-footer">
              <div className="tag-pills">
                {channel.tags.map((t, idx) => (
                  <span key={idx} className="simple-tag">#{t}</span>
                ))}
              </div>

              <a 
                href={channel.url}
                target="_blank"
                rel="noreferrer"
                className="clean-link-btn"
              >
                <span>Sayfaya Git</span>
                <ExternalLink size={13} />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
