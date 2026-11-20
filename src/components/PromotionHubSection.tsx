import React, { useState } from 'react';
import { Smartphone, Share2, Send } from 'lucide-react';
import type { MarketingChannel, PitchTemplate } from '../types';
import { SocialMediaSection } from './SocialMediaSection';
import { MarketingSection } from './MarketingSection';
import { PitchStudioSection } from './PitchStudioSection';

interface PromotionHubSectionProps {
  myGameTitle: string;
  teamName: string;
  channels: MarketingChannel[];
  pitchTemplates: PitchTemplate[];
}

export const PromotionHubSection: React.FC<PromotionHubSectionProps> = ({
  myGameTitle,
  teamName,
  channels,
  pitchTemplates,
}) => {
  const [subTab, setSubTab] = useState<'social' | 'channels' | 'pitch'>('social');

  return (
    <div className="tab-pane">
      {/* Page Introduction */}
      <div className="page-intro-box">
        <div>
          <h2 className="page-intro-title">Tanıtım & Mesajlar</h2>
          <p className="page-intro-desc">
            Oyununuzu nerede ve nasıl tanıtacağınızı buradan planlayın: kısa video senaryoları alın, paylaşım topluluklarını görün ve yayıncılara göndereceğiniz hazır metinleri kopyalayın.
          </p>
        </div>
      </div>

      {/* Simple 3-way sub-tabs */}
      <div className="guide-sub-tabs">
        <button
          type="button"
          className={`guide-tab-btn ${subTab === 'social' ? 'active' : ''}`}
          onClick={() => setSubTab('social')}
        >
          <Smartphone size={15} />
          <span>1. Kısa Video Fikirleri (TikTok / Reels)</span>
        </button>

        <button
          type="button"
          className={`guide-tab-btn ${subTab === 'channels' ? 'active' : ''}`}
          onClick={() => setSubTab('channels')}
        >
          <Share2 size={15} />
          <span>2. Nerede Paylaşılır? (Reddit / Discord)</span>
        </button>

        <button
          type="button"
          className={`guide-tab-btn ${subTab === 'pitch' ? 'active' : ''}`}
          onClick={() => setSubTab('pitch')}
        >
          <Send size={15} />
          <span>3. Hazır Mesaj & E-Posta Metinleri</span>
        </button>
      </div>

      {subTab === 'social' && <SocialMediaSection myGameTitle={myGameTitle} />}
      {subTab === 'channels' && <MarketingSection channels={channels} />}
      {subTab === 'pitch' && (
        <PitchStudioSection
          templates={pitchTemplates}
          myGameTitle={myGameTitle}
          teamName={teamName}
        />
      )}
    </div>
  );
};
