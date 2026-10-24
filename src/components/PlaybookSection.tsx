import React from 'react';
import { 
  BookOpen, 
  Flame, 
  Volume2, 
  UserCheck, 
  TrendingUp, 
  DollarSign 
} from 'lucide-react';

export const PlaybookSection: React.FC = () => {
  return (
    <section className="section-container">
      {/* Hero Playbook Intro */}
      <div className="playbook-hero-banner">
        <div className="playbook-hero-content">
          <div className="playbook-badge">
            <BookOpen size={16} /> FRIENDSLOP PAZARLAMA & MEKANİK MANİFESTOSU
          </div>
          <h2 className="playbook-hero-title">
            Friendslop Nedir ve Neden İnterneti Kasıp Kavuruyor?
          </h2>
          <p className="playbook-hero-text">
            <strong>"Friendslop"</strong>; arkadaş gruplarının bir araya gelerek Discord ses kanalında birbirine bağırıp kahkaha attığı, 
            genellikle yakınlık sesi (proximity chat), komik ragdoll fizikleri ve işlerin ters gitme garantisi barındıran kaotik co-op oyun türüdür.
            Lethal Company, Content Warning, Phasmophobia ve Chained Together bu akımın milyonlar satan dev örnekleridir.
          </p>
        </div>
      </div>

      {/* The 4 Pillars of Viral Friendslop */}
      <div className="playbook-pillars-grid">
        <div className="pillar-card">
          <div className="pillar-icon-box bg-purple">
            <Volume2 size={24} />
          </div>
          <h3 className="pillar-title">1. Yakınlık Sesi (Proximity Chat)</h3>
          <p className="pillar-desc">
            Oyundaki en büyük içerik kaynağı grafikler değil, arkadaşınızın arkadaki koridordan gelen yankılı çığlığıdır. 
            Sesin duvardan boğuk geçmesi ve mesafe açıldıkça kaybolması TikTok ve Twitch için doğrudan bedava organik içerik üretir.
          </p>
          <div className="pillar-tip">
            <strong>Kritik Kural:</strong> Oyun içine dahili 3D konumsal ses koyun; oyuncuları sadece Discord'a mahkum etmeyin.
          </div>
        </div>

        <div className="pillar-card">
          <div className="pillar-icon-box bg-emerald">
            <Flame size={24} />
          </div>
          <h3 className="pillar-title">2. İhanet ve Komik Hata Durumları</h3>
          <p className="pillar-desc">
            Mükemmeliyetçi oyunlar arkadaş gruplarını gerer; Friendslop oyunları ise hata yapmayı ödüllendirir. 
            Kapıyı yanlışlıkla (veya bilerek) arkadaşının yüzüne kapatmak, tuzaktan kaçarken birbirine çarpmak kahkahanın kaynağıdır.
          </p>
          <div className="pillar-tip">
            <strong>Kritik Kural:</strong> "Dost ateşi" (friendly fire) veya fiziksel itme/çarpmayı mutlaka açık tutun.
          </div>
        </div>

        <div className="pillar-card">
          <div className="pillar-icon-box bg-cyan">
            <UserCheck size={24} />
          </div>
          <h3 className="pillar-title">3. 4'lü Yayıncı Paketi Dinamiği</h3>
          <p className="pillar-desc">
            Tek başına yayın yapan bir yayıncı Friendslop oyununu 20 dakikada kapatır. Ancak 4 yayıncı arkadaş bir araya geldiğinde yayın 4-5 saat sürer! 
            Bu yüzden influencer'lara e-posta atarken asla 1 key vermeyin; en az 4 adet Steam key gönderin.
          </p>
          <div className="pillar-tip">
            <strong>Kritik Kural:</strong> Pitch şablonunda "Arkadaş ekibinizle oynamanız için 4 key" cümlesini ilk satıra yazın.
          </div>
        </div>

        <div className="pillar-card">
          <div className="pillar-icon-box bg-amber">
            <DollarSign size={24} />
          </div>
          <h3 className="pillar-title">4. $4.99 - $8.99 Fiyatlandırma Gücü</h3>
          <p className="pillar-desc">
            Friendslop oyunlarında satın alma kararını 1 kişi değil, grup verir. Oyun $7 olduğunda, gruptaki bir oyuncu diğer 3 arkadaşına oyunu cebinden hediye alabilir. 
            $15 ve üzeri fiyat ise arkadaş grubunda direnç yaratır ve satışı baltalar.
          </p>
          <div className="pillar-tip">
            <strong>Kritik Kural:</strong> Çıkışta %10 lansman indirimi ile $5.99 - $7.99 bandını hedefleyin.
          </div>
        </div>
      </div>

      {/* Steam Algorithm Secrets for Indie Devs */}
      <div className="steam-algorithm-box">
        <div className="algo-header">
          <TrendingUp size={22} className="text-emerald" />
          <h3>Steam Algoritmasının 3 Gizli Eşiği</h3>
        </div>

        <div className="algo-steps-grid">
          <div className="algo-step-item">
            <span className="step-tag">EŞİK 1</span>
            <h4>10 Pozitif İnceleme (Reviews)</h4>
            <p>
              Steam'de 10 adet satın alınmış inceleme gelene kadar oyununuz "Pozitif" rozeti alamaz. Lansman günü ilk 10 dürüst incelemeyi almak için Discord çekirdek kitlenizi seferber edin.
            </p>
          </div>

          <div className="algo-step-item">
            <span className="step-tag">EŞİK 2</span>
            <h4>İlk 48 Saat Satış İvmesi (Velocity)</h4>
            <p>
              Steam ana sayfasındaki "Popüler Yeni Çıkanlar" (Popular New Releases) vitrini, ilk 24-48 saatteki satış hızına göre belirlenir. Bu yüzden tüm pazarlama taarruzunu çıkış gününe yığın.
            </p>
          </div>

          <div className="algo-step-item">
            <span className="step-tag">EŞİK 3</span>
            <h4>Wishlist Dönüşüm Oranı (%10 - %15)</h4>
            <p>
              Lansman anında istek listesine eklemiş kişilerin ortalama %10-15'i ilk hafta oyunu satın alır. İlk hafta 2.000 adet satmak için en az 15.000 - 20.000 istek listesi hedefleyin.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
