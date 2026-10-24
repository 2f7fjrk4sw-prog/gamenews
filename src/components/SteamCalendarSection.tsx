import React from 'react';
import type { SteamFestivalEvent } from '../types';
import { 
  Calendar, 
  Sparkles, 
  AlertTriangle, 
  Clock, 
  CheckCircle, 
  Zap, 
  ShieldAlert 
} from 'lucide-react';

interface SteamCalendarSectionProps {
  festivals: SteamFestivalEvent[];
  targetDate: string;
}

export const SteamCalendarSection: React.FC<SteamCalendarSectionProps> = ({ festivals, targetDate }) => {
  // Sort festivals by start date
  const sorted = [...festivals].sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

  // Check if target date overlaps with any seasonal sale
  const overlappingSales = festivals.filter((fest) => {
    if (fest.type !== 'Seasonal Sale') return false;
    const start = new Date(fest.startDate).getTime();
    const end = new Date(fest.endDate).getTime();
    const target = new Date(targetDate).getTime();
    return target >= start && target <= end;
  });

  return (
    <section className="section-container">
      {/* Blackout Warning Banner if Overlapping with Seasonal Sale */}
      {overlappingSales.length > 0 ? (
        <div className="sale-blackout-banner alert">
          <ShieldAlert size={32} className="pulse-animation" />
          <div>
            <h3>🚨 KRİTİK STEAM İNDİRİMİ ÇAKIŞMASI TESPİT EDİLDİ!</h3>
            <p>
              Hedeflediğiniz çıkış tarihi ({targetDate}), <strong>{overlappingSales[0].name}</strong> ({overlappingSales[0].startDate} — {overlappingSales[0].endDate}) tarih aralığının tam ortasına denk geliyor!
              Steam indirim haftalarında tüm vitrin indirimli eski oyunlara tahsis edilir; yeni çıkan bağımsız oyunlar görünürlük elde edemez.
              <strong> Lütfen çıkışınızı indirim bittikten sonraki haftaya kaydırın.</strong>
            </p>
          </div>
        </div>
      ) : (
        <div className="sale-blackout-banner safe">
          <CheckCircle size={28} />
          <div>
            <h3>✅ Steam İndirim Kara Deliğinde Değilsiniz</h3>
            <p>
              Seçili çıkış tarihiniz ({targetDate}) herhangi bir büyük Steam Mevsimsel İndirim dönemine doğrudan çakışmıyor.
            </p>
          </div>
        </div>
      )}

      {/* Steam Algorithm Golden Rules */}
      <div className="steam-rules-cards-grid">
        <div className="steam-rule-box">
          <div className="rule-box-header">
            <Zap size={18} className="text-amber" />
            <h4>En İyi Çıkış Günleri</h4>
          </div>
          <p>
            Steam için en ideal çıkış günleri <strong>Salı</strong> ve <strong>Perşembe</strong> öğleden sonradır (Türkiye saatiyle 20:00 - 21:00 / Valve saatiyle 10:00 AM PST). Hafta sonuna kadar algoritmik ivme kazanır.
          </p>
        </div>

        <div className="steam-rule-box">
          <div className="rule-box-header">
            <AlertTriangle size={18} className="text-red" />
            <h4>Lansman İndirimi Şarttır</h4>
          </div>
          <p>
            Steam lansmanında mutlaka <strong>%10 veya %15 lansman indirimi</strong> uygulayın. Bu indirim, oyununuzu istek listesine eklemiş olan binlerce kişiye anında e-posta bildirimi tetikler.
          </p>
        </div>

        <div className="steam-rule-box">
          <div className="rule-box-header">
            <Sparkles size={18} className="text-cyan" />
            <h4>Steam Next Fest Gücü</h4>
          </div>
          <p>
            Her indie oyunun ömründe 1 kez Next Fest'e katılma hakkı vardır. İyi bir 4 kişilik co-op demo ile bu festivalden <strong>10.000 - 40.000 yeni istek listesi</strong> toplamak mümkündür.
          </p>
        </div>
      </div>

      {/* Festivals List */}
      <div className="festivals-timeline">
        <div className="timeline-header">
          <Calendar size={20} />
          <h3>Resmi Steam Festivalleri ve İndirim Dönemleri Takvimi</h3>
        </div>

        <div className="festivals-grid">
          {sorted.map((fest) => {
            const isSale = fest.type === 'Seasonal Sale';
            const isNextFest = fest.type === 'Next Fest';

            return (
              <div 
                key={fest.id} 
                className={`festival-card ${isSale ? 'fest-sale' : isNextFest ? 'fest-nextfest' : 'fest-themed'}`}
              >
                <div className="fest-top-row">
                  <div className="fest-type-pill">
                    {fest.type}
                  </div>
                  <div className={`fest-impact-badge impact-${fest.impactLevel.toLowerCase()}`}>
                    Etki: {fest.impactLevel}
                  </div>
                </div>

                <h4 className="fest-name">{fest.name}</h4>

                <div className="fest-dates-row">
                  <Clock size={15} />
                  <span>{fest.startDate} &nbsp;➔&nbsp; {fest.endDate}</span>
                </div>

                <p className="fest-desc">{fest.description}</p>

                <div className="fest-action-box">
                  <span className="fest-action-label">Geliştirici Aksiyon Planı:</span>
                  <p className="fest-action-text">{fest.developerAction}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
