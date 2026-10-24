import React, { useState } from 'react';
import type { MarketingChannel } from '../types';
import { 
  Search, 
  ExternalLink, 
  Clock, 
  ShieldAlert, 
  Lightbulb, 
  Users, 
  MessageSquare,
  Video,
  Radio,
  Sparkles,
  Award,
  Globe
} from 'lucide-react';

interface MarketingSectionProps {
  channels: MarketingChannel[];
}

export const MarketingSection: React.FC<MarketingSectionProps> = ({ channels }) => {
  const [selectedPlatform, setSelectedPlatform] = useState<string>('Hepsi');
  const [searchQuery, setSearchQuery] = useState('');

  const platforms: { id: string; label: string; icon: React.ReactNode }[] = [
    { id: 'Hepsi', label: 'Tüm Kanallar', icon: <Globe size={15} /> },
    { id: 'Reddit', label: 'Reddit', icon: <MessageSquare size={15} /> },
    { id: 'Discord', label: 'Discord', icon: <Users size={15} /> },
    { id: 'TikTok/Shorts', label: 'TikTok & Shorts', icon: <Video size={15} /> },
    { id: 'Streamer', label: 'Yayıncılar (Twitch)', icon: <Radio size={15} /> },
    { id: 'Festival', label: 'Steam Festivalleri', icon: <Sparkles size={15} /> },
    { id: 'Press', label: 'Basın & Medya', icon: <Award size={15} /> },
  ];

  const filteredChannels = channels.filter((ch) => {
    if (selectedPlatform !== 'Hepsi' && ch.platform !== selectedPlatform) {
      return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = ch.name.toLowerCase().includes(q);
      const matchCat = ch.category.toLowerCase().includes(q);
      const matchRule = ch.rulesSummary.toLowerCase().includes(q);
      const matchTip = ch.strategyTip.toLowerCase().includes(q);
      const matchTags = ch.tags.some(t => t.toLowerCase().includes(q));
      return matchName || matchCat || matchRule || matchTip || matchTags;
    }

    return true;
  });

  return (
    <section className="section-container">
      {/* Strategic Callout Banner */}
      <div className="marketing-strategy-banner">
        <div className="strategy-banner-col">
          <div className="strategy-badge">
            <Lightbulb size={16} /> FRIENDSLOP PAZARLAMA FORMÜLÜ
          </div>
          <h2 className="strategy-title">
            Oyununuz Arkadaşlarla Kaos İçeriyorsa, Standart Reklamlar İşe Yaramaz!
          </h2>
          <p className="strategy-text">
            Friendslop oyunları (Lethal Company, Content Warning, Chained Together gibi) kurumsal pazarlama bütçesiyle değil, 
            <strong> organik kahkaha anları, 4'lü yayıncı paketleri ve samimi geliştirici hikayeleriyle</strong> viral olur.
          </p>
        </div>

        <div className="golden-rules-grid">
          <div className="golden-rule-item">
            <span className="rule-number">01</span>
            <span className="rule-heading">4'lü Streamer Paketi</span>
            <span className="rule-desc">Yayıncıya tek key göndermeyin; ekibiyle oynaması için her zaman en az 4 key verin.</span>
          </div>
          <div className="golden-rule-item">
            <span className="rule-number">02</span>
            <span className="rule-heading">TikTok İlk 3 Saniye</span>
            <span className="rule-desc">Menü/logo yok! Doğrudan yakınlık sesinden gelen çığlık veya arkadaşa yapılan ihanetle başlayın.</span>
          </div>
          <div className="golden-rule-item">
            <span className="rule-number">03</span>
            <span className="rule-heading">Reddit Samimiyeti</span>
            <span className="rule-desc">"Oyunumuzu satın alın" değil, "Geliştirirken başımıza gelen en komik hata" hikayesi anlatın.</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="controls-panel">
        <div className="search-bar-wrap">
          <Search size={18} className="search-icon" />
          <input 
            type="text"
            className="search-input"
            placeholder="Kanal adı, platform, strateji veya kural ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="clear-search-btn" onClick={() => setSearchQuery('')}>×</button>
          )}
        </div>

        {/* Platform Tabs */}
        <div className="platform-tabs-row">
          {platforms.map((p) => (
            <button
              key={p.id}
              className={`platform-tab-btn ${selectedPlatform === p.id ? 'active' : ''}`}
              onClick={() => setSelectedPlatform(p.id)}
            >
              {p.icon}
              <span>{p.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Channels Cards Grid */}
      <div className="channels-grid">
        {filteredChannels.map((channel) => {
          return (
            <div key={channel.id} className="channel-card">
              <div className="channel-top">
                <div className="channel-header-info">
                  <span className={`platform-badge badge-${channel.platform.toLowerCase().replace('/', '-')}`}>
                    {channel.platform}
                  </span>
                  <h3 className="channel-name">{channel.name}</h3>
                  <span className="channel-cat">{channel.category}</span>
                </div>
                
                <div className="audience-tag" title="Topluluk Büyüklüğü">
                  <Users size={14} />
                  <span>{channel.audienceSize}</span>
                </div>
              </div>

              <div className="channel-meta-box">
                <div className="meta-row">
                  <Clock size={15} className="meta-icon time" />
                  <div>
                    <span className="meta-label">En Uygun Zaman:</span>
                    <span className="meta-val">{channel.bestTiming}</span>
                  </div>
                </div>

                <div className="meta-row">
                  <ShieldAlert size={15} className="meta-icon rules" />
                  <div>
                    <span className="meta-label">Topluluk Kuralları:</span>
                    <span className="meta-val">{channel.rulesSummary}</span>
                  </div>
                </div>
              </div>

              {/* Friendslop Secret Strategy */}
              <div className="strategy-tip-box">
                <div className="tip-header">
                  <Lightbulb size={14} />
                  <span>FRIENDSLOP TAKTİĞİ</span>
                </div>
                <p className="tip-text">{channel.strategyTip}</p>
              </div>

              <div className="channel-footer">
                <div className="channel-tags">
                  {channel.tags.map((t, idx) => (
                    <span key={idx} className="channel-tag">#{t}</span>
                  ))}
                </div>

                <a 
                  href={channel.url}
                  target="_blank"
                  rel="noreferrer"
                  className="channel-link-btn"
                >
                  <span>Kanala Git</span>
                  <ExternalLink size={14} />
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
