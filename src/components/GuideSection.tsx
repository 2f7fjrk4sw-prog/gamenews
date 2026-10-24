import React, { useState } from 'react';
import type { SteamFestivalEvent } from '../types';
import { 
  Calendar, 
  Lightbulb, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Volume2, 
  Users, 
  DollarSign, 
  Flame, 
  TrendingUp 
} from 'lucide-react';

interface GuideSectionProps {
  festivals: SteamFestivalEvent[];
  targetDate: string;
}

export const GuideSection: React.FC<GuideSectionProps> = ({ festivals, targetDate }) => {
  const [subTab, setSubTab] = useState<'steam' | 'tactics'>('steam');

  // Check if target date overlaps with any seasonal sale
  const overlappingSales = festivals.filter((fest) => {
    if (fest.type !== 'Seasonal Sale') return false;
    const start = new Date(fest.startDate).getTime();
    const end = new Date(fest.endDate).getTime();
    const target = new Date(targetDate).getTime();
    return target >= start && target <= end;
  });

  return (
    <div className="tab-pane">
      {/* Sub-navigation */}
      <div className="guide-sub-tabs">
        <button 
          className={`guide-tab-btn ${subTab === 'steam' ? 'active' : ''}`}
          onClick={() => setSubTab('steam')}
        >
          <Calendar size={16} />
          <span>Steam Festivalleri & İndirim Takvimi</span>
        </button>

        <button 
          className={`guide-tab-btn ${subTab === 'tactics' ? 'active' : ''}`}
          onClick={() => setSubTab('tactics')}
        >
          <Lightbulb size={16} />
          <span>Friendslop Viral Taktik Rehberi</span>
        </button>
      </div>

      {/* VIEW 1: STEAM CALENDAR */}
      {subTab === 'steam' && (
        <div className="guide-content-area">
          {/* Sale Blackout Alert */}
          {overlappingSales.length > 0 ? (
            <div className="clean-status-box status-danger">
              <AlertTriangle size={18} className="status-ico danger" />
              <div>
                <strong>🚨 Çıkış Tarihiniz Büyük Steam İndirimine Denk Geliyor!</strong>
                <p>
                  {overlappingSales[0].name} ({overlappingSales[0].startDate} — {overlappingSales[0].endDate}) haftasında 
                  Steam mağazasının tüm vitrini indirimli eski oyunlara ayrılır. Çıkışınızı indirim bittikten sonraki haftaya kaydırın.
                </p>
              </div>
            </div>
          ) : (
            <div className="clean-status-box status-success">
              <CheckCircle2 size={18} className="status-ico success" />
              <div>
                <strong>Steam İndirim Kara Deliğinde Değilsiniz</strong>
                <p>Hedef çıkış tarihiniz ({targetDate}) herhangi bir büyük Steam indirim dönemiyle çakışmıyor.</p>
              </div>
            </div>
          )}

          {/* Steam Timing Rules */}
          <div className="mini-rules-row">
            <div className="mini-rule-card">
              <h4>📅 En İyi Çıkış Günleri</h4>
              <p>Steam için en ideal çıkış günleri <strong>Salı</strong> ve <strong>Perşembe</strong> öğleden sonradır (TR saatiyle 20:00). Hafta sonuna ivmeyle girersiniz.</p>
            </div>
            <div className="mini-rule-card">
              <h4>💸 %10 Lansman İndirimi</h4>
              <p>İlk 7-14 gün için %10 veya %15 lansman indirimi tanımlayın. İstek listesindeki (wishlist) tüm oyunculara anında satın alma bildirimi gider.</p>
            </div>
            <div className="mini-rule-card">
              <h4>🎪 Steam Next Fest</h4>
              <p>Oyun ömründe sadece 1 kez Next Fest'e katılabilir. 4 kişilik çalışan bir demo ile bu festivalden 10k-40k wishlist toplayabilirsiniz.</p>
            </div>
          </div>

          {/* Festival Cards List */}
          <h3 className="section-subheading">Resmi Steam Festivalleri</h3>
          <div className="clean-cards-grid">
            {festivals.map((fest) => (
              <div key={fest.id} className="clean-card">
                <div className="clean-card-header">
                  <div>
                    <span className="platform-tag">{fest.type}</span>
                    <h3 className="clean-card-title">{fest.name}</h3>
                  </div>
                  <span className={`risk-pill ${fest.impactLevel === 'Extreme' ? 'pill-risk' : 'pill-safe'}`}>
                    Etki: {fest.impactLevel}
                  </span>
                </div>

                <div className="channel-info-row">
                  <span className="info-label"><Clock size={13} /> Tarihler:</span>
                  <span className="info-value">{fest.startDate} &nbsp;➔&nbsp; {fest.endDate}</span>
                </div>

                <p className="clean-card-desc">{fest.description}</p>

                <div className="channel-tip-box">
                  <span className="tip-lead">Geliştirici Aksiyonu:</span>
                  <p>{fest.developerAction}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 2: FRIENDSLOP TACTICS */}
      {subTab === 'tactics' && (
        <div className="guide-content-area">
          <div className="simple-info-bar">
            <Lightbulb size={18} className="info-icon" />
            <span>
              <strong>Friendslop Nedir?</strong> Arkadaş gruplarının ses kanalında birbirine bağırıp kahkaha attığı, 
              yakınlık sesi (proximity chat) ve komik fizik hataları barındıran kaotik eşli oyun ekolüdür (Lethal Company, Content Warning, Chained Together).
            </span>
          </div>

          <div className="tactics-cards-grid">
            <div className="tactic-card">
              <div className="tactic-header">
                <Volume2 size={20} className="tactic-icon" />
                <h4>1. Yakınlık Sesi (Proximity Chat)</h4>
              </div>
              <p>
                En büyük pazarlama içeriği arkadaşınızın koridordan gelen boğuk çığlığıdır. 
                Dahili 3D konumsal ses, TikTok ve Twitch için bedava viral klip üretir.
              </p>
            </div>

            <div className="tactic-card">
              <div className="tactic-header">
                <Flame size={20} className="tactic-icon" />
                <h4>2. İhanet ve Komik Hatalar</h4>
              </div>
              <p>
                Kapıyı yanlışlıkla arkadaşının yüzüne kapatmak veya onu tuzağa itmek kahkahanın kaynağıdır. 
                Dost ateşi ve ragdoll fiziklerini açık tutun.
              </p>
            </div>

            <div className="tactic-card">
              <div className="tactic-header">
                <Users size={20} className="tactic-icon" />
                <h4>3. 4'lü Yayıncı Paketi Kuralı</h4>
              </div>
              <p>
                Yayıncıya asla 1 key göndermeyin; 4 kişilik ekibiyle oynaması için en az 4 Steam Key verin. 
                Tek kişi 20 dakika oynar, 4 kişi 4 saat yayın yapar.
              </p>
            </div>

            <div className="tactic-card">
              <div className="tactic-header">
                <DollarSign size={20} className="tactic-icon" />
                <h4>4. $4.99 - $7.99 Fiyat Bandı</h4>
              </div>
              <p>
                Kararı tek kişi değil arkadaş grubu verir. $6 olduğunda gruptaki bir kişi diğer 3 arkadaşına oyunu hediye alabilir. 
                $15 ve üzeri fiyat grup direncine takılır.
              </p>
            </div>
          </div>

          <h3 className="section-subheading" style={{ marginTop: '24px' }}>
            <TrendingUp size={18} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} />
            Steam Algoritmasının 3 Gizli Eşiği
          </h3>

          <div className="mini-rules-row">
            <div className="mini-rule-card">
              <h4>1. Eşik: İlk 10 İnceleme (Reviews)</h4>
              <p>Steam'de satın alınmış 10 inceleme gelene kadar oyun "Pozitif" rozeti alamaz. Lansman günü çekirdek kitlenizden ilk 10 dürüst incelemeyi alın.</p>
            </div>
            <div className="mini-rule-card">
              <h4>2. Eşik: İlk 48 Saatlik Hız (Velocity)</h4>
              <p>Steam vitrinindeki "Popüler Yeni Çıkanlar" sırası ilk 48 saatteki satış ivmesine bakar. Tüm TikTok ve yayıncı e-postalarını çıkış gününe yığın.</p>
            </div>
            <div className="mini-rule-card">
              <h4>3. Eşik: %10-15 Wishlist Dönüşümü</h4>
              <p>İstek listesindekilerin ortalama %10-15'i ilk hafta oyunu satın alır. İlk hafta 2.000 satış için en az 15.000-20.000 wishlist hedefleyin.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

