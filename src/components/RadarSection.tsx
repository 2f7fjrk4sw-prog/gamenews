import React, { useState } from 'react';
import type { CompetitorGame, CollisionRisk, WishlistTier } from '../types';
import { 
  Radar, 
  Search, 
  Plus, 
  ExternalLink, 
  AlertOctagon, 
  AlertTriangle, 
  CheckCircle, 
  Trash2, 
  Calendar, 
  Sparkles, 
  Info 
} from 'lucide-react';

interface RadarSectionProps {
  competitors: CompetitorGame[];
  setCompetitors: React.Dispatch<React.SetStateAction<CompetitorGame[]>>;
  targetDate: string;
  setTargetDate: (date: string) => void;
  myGameTitle: string;
}

export const RadarSection: React.FC<RadarSectionProps> = ({
  competitors,
  setCompetitors,
  targetDate,
  setTargetDate,
  myGameTitle,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('Hepsi');
  const [riskFilter, setRiskFilter] = useState<string>('Hepsi');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State for Adding New Competitor
  const [newTitle, setNewTitle] = useState('');
  const [newDev, setNewDev] = useState('');
  const [newDate, setNewDate] = useState('2026-12-10');
  const [newWishlist, setNewWishlist] = useState<WishlistTier>('Moderate (10k-50k)');
  const [newTags, setNewTags] = useState('Online Co-Op, Friendslop, Proximity Voice');
  const [newMechanics, setNewMechanics] = useState('Yakınlık Sesi, Ragdoll Fizik');
  const [newPrice, setNewPrice] = useState('$7.99');
  const [newDesc, setNewDesc] = useState('');

  // Calculate day difference and dynamic collision risk
  const getCollisionAnalysis = (compDateStr: string, tier: WishlistTier): {
    diffDays: number;
    dynamicRisk: CollisionRisk;
    statusText: string;
  } => {
    const compTime = new Date(compDateStr).getTime();
    const myTime = new Date(targetDate).getTime();
    const diffDays = Math.round((compTime - myTime) / (1000 * 60 * 60 * 24));

    let dynamicRisk: CollisionRisk = 'Low';
    const absDiff = Math.abs(diffDays);

    const isHighTier = tier === 'Very High (100k+)' || tier === 'High (50k-100k)';

    if (absDiff <= 5 && isHighTier) {
      dynamicRisk = 'Critical';
    } else if (absDiff <= 10 && isHighTier) {
      dynamicRisk = 'High';
    } else if (absDiff <= 14) {
      dynamicRisk = 'Medium';
    } else {
      dynamicRisk = 'Low';
    }

    let statusText = '';
    if (diffDays === 0) {
      statusText = 'TAM AYNI GÜN ÇIKIYOR! 🚨';
    } else if (diffDays > 0) {
      statusText = `Sizden ${diffDays} gün sonra çıkıyor`;
    } else {
      statusText = `Sizden ${Math.abs(diffDays)} gün önce çıkıyor`;
    }

    return { diffDays, dynamicRisk, statusText };
  };

  // Find critical collisions
  const criticalItems = competitors.filter(comp => {
    const analysis = getCollisionAnalysis(comp.releaseDate, comp.wishlistTier);
    return analysis.dynamicRisk === 'Critical';
  });

  const highItems = competitors.filter(comp => {
    const analysis = getCollisionAnalysis(comp.releaseDate, comp.wishlistTier);
    return analysis.dynamicRisk === 'High';
  });

  // Handle Add Competitor
  const handleAddCompetitor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newGame: CompetitorGame = {
      id: `custom-${Date.now()}`,
      title: newTitle.trim(),
      developer: newDev.trim() || 'Bağımsız Geliştirici',
      releaseDate: newDate,
      wishlistTier: newWishlist,
      collisionRisk: 'Medium',
      genreTags: newTags.split(',').map(t => t.trim()).filter(Boolean),
      keyMechanics: newMechanics.split(',').map(m => m.trim()).filter(Boolean),
      pricingEstimate: newPrice.trim(),
      description: newDesc.trim() || 'Steam de keşfedilen benzer co-op oyunu.',
      steamUrl: 'https://store.steampowered.com',
    };

    const updated = [newGame, ...competitors];
    setCompetitors(updated);
    localStorage.setItem('game_competitors', JSON.stringify(updated));

    // Reset Form
    setNewTitle('');
    setNewDev('');
    setNewDesc('');
    setShowAddModal(false);
  };

  const handleDeleteCompetitor = (id: string) => {
    const updated = competitors.filter(c => c.id !== id);
    setCompetitors(updated);
    localStorage.setItem('game_competitors', JSON.stringify(updated));
  };

  // Collect all unique tags
  const allTags = ['Hepsi', ...Array.from(new Set(competitors.flatMap(c => c.genreTags)))].slice(0, 8);

  // Filter competitors
  const filteredCompetitors = competitors.filter(comp => {
    const analysis = getCollisionAnalysis(comp.releaseDate, comp.wishlistTier);
    
    // Tag filter
    if (selectedTag !== 'Hepsi' && !comp.genreTags.includes(selectedTag)) {
      return false;
    }

    // Risk filter
    if (riskFilter !== 'Hepsi' && analysis.dynamicRisk !== riskFilter) {
      return false;
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = comp.title.toLowerCase().includes(q);
      const matchDev = comp.developer.toLowerCase().includes(q);
      const matchDesc = comp.description.toLowerCase().includes(q);
      const matchTags = comp.genreTags.some(t => t.toLowerCase().includes(q));
      const matchMech = comp.keyMechanics.some(m => m.toLowerCase().includes(q));
      return matchTitle || matchDev || matchDesc || matchTags || matchMech;
    }

    return true;
  });

  return (
    <section className="section-container">
      {/* Banner: Collision Intelligence */}
      <div className="radar-header-banner">
        <div className="radar-header-content">
          <div className="radar-status-icon-wrap">
            {criticalItems.length > 0 ? (
              <AlertOctagon className="status-icon critical pulse-animation" size={36} />
            ) : highItems.length > 0 ? (
              <AlertTriangle className="status-icon high" size={36} />
            ) : (
              <CheckCircle className="status-icon safe" size={36} />
            )}
          </div>
          <div>
            <h2 className="radar-banner-title">
              {criticalItems.length > 0
                ? `🚨 DİKKAT: ${criticalItems.length} Kritik Çıkış Çakışması Tespit Edildi!`
                : highItems.length > 0
                ? `⚠️ UYARI: Hedef tarihinize yakın ${highItems.length} güçlü rakip var!`
                : `✅ GÜVENLİ LİMAN: Seçilen tarih (${targetDate}) için çakışma riski düşük.`}
            </h2>
            <p className="radar-banner-text">
              {criticalItems.length > 0 ? (
                <>
                  <strong>{criticalItems[0].title}</strong> ({criticalItems[0].releaseDate}), 
                  sizin hedef tarihinizle <strong>{Math.abs(getCollisionAnalysis(criticalItems[0].releaseDate, criticalItems[0].wishlistTier).diffDays)} gün</strong> farkla neredeyse aynı anda çıkıyor.
                  Twitch yayıncıları ve Steam ana sayfası aynı türde iki oyunu aynı anda kaldıramaz. Çıkışınızı en az 10 gün ileri veya geri almanız tavsiye edilir.
                </>
              ) : (
                <>
                  Hedeflediğiniz <strong>"{myGameTitle}"</strong> için bu dönemde 50k+ istek listeli doğrudan bir Friendslop oyunu bulunmuyor.
                  Yayıncı paketlerinizi ve TikTok kampanyalarınızı bu tarihe göre planlayabilirsiniz.
                </>
              )}
            </p>
          </div>
        </div>

        <div className="radar-banner-actions">
          <div className="target-date-box">
            <span className="target-date-caption">Hedef Çıkışınız:</span>
            <input 
              type="date" 
              className="target-date-picker"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
            />
          </div>
          <button 
            className="btn-primary"
            onClick={() => setShowAddModal(true)}
          >
            <Plus size={16} /> Yeni Rakip Ekle
          </button>
        </div>
      </div>

      {/* Control Bar: Search & Filters */}
      <div className="controls-panel">
        <div className="search-bar-wrap">
          <Search size={18} className="search-icon" />
          <input 
            type="text"
            className="search-input"
            placeholder="Oyun adı, mekanik (örn: Proximity Chat, Ragdoll) veya geliştirici ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="clear-search-btn" onClick={() => setSearchQuery('')}>×</button>
          )}
        </div>

        <div className="filter-group">
          <span className="filter-label">Risk Seviyesi:</span>
          {['Hepsi', 'Critical', 'High', 'Medium', 'Low'].map((risk) => (
            <button
              key={risk}
              className={`filter-chip ${riskFilter === risk ? 'active' : ''} ${risk.toLowerCase()}`}
              onClick={() => setRiskFilter(risk)}
            >
              {risk === 'Critical' ? '🚨 Kritik' : risk === 'High' ? '⚠️ Yüksek' : risk === 'Medium' ? '🟡 Orta' : risk === 'Low' ? '🟢 Düşük' : 'Tümü'}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Tag Pills */}
      <div className="tag-pills-row">
        <span className="tag-row-title">Popüler Türler:</span>
        {allTags.map((tag) => (
          <button
            key={tag}
            className={`tag-pill-btn ${selectedTag === tag ? 'active' : ''}`}
            onClick={() => setSelectedTag(tag)}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Competitor Cards Grid */}
      <div className="competitors-grid">
        {filteredCompetitors.map((comp) => {
          const analysis = getCollisionAnalysis(comp.releaseDate, comp.wishlistTier);
          const isCritical = analysis.dynamicRisk === 'Critical';
          const isHigh = analysis.dynamicRisk === 'High';

          return (
            <div 
              key={comp.id} 
              className={`competitor-card ${isCritical ? 'card-critical' : isHigh ? 'card-high' : ''}`}
            >
              <div className="card-top-row">
                <div className="game-main-info">
                  <h3 className="game-title">{comp.title}</h3>
                  <span className="game-dev">{comp.developer}</span>
                </div>
                
                <div className={`risk-badge ${analysis.dynamicRisk.toLowerCase()}`}>
                  {analysis.dynamicRisk === 'Critical' && '🚨 Kritik Çakışma'}
                  {analysis.dynamicRisk === 'High' && '⚠️ Yüksek Risk'}
                  {analysis.dynamicRisk === 'Medium' && '🟡 Orta Risk'}
                  {analysis.dynamicRisk === 'Low' && '🟢 Güvenli Mesafe'}
                </div>
              </div>

              <div className="timing-status-bar">
                <div className="date-badge">
                  <Calendar size={14} />
                  <span>{comp.releaseDate}</span>
                </div>
                <div className={`timing-offset ${isCritical ? 'text-critical' : ''}`}>
                  {analysis.statusText}
                </div>
              </div>

              <p className="game-desc">{comp.description}</p>

              <div className="game-mechanics-section">
                <span className="mechanics-title">Kilit Mekanikler:</span>
                <div className="mechanics-tags">
                  {comp.keyMechanics.map((mech, i) => (
                    <span key={i} className="mechanic-tag">
                      <Sparkles size={12} /> {mech}
                    </span>
                  ))}
                </div>
              </div>

              <div className="game-genre-tags">
                {comp.genreTags.map((tag, i) => (
                  <span key={i} className="genre-tag">{tag}</span>
                ))}
              </div>

              <div className="card-footer">
                <div className="tier-and-price">
                  <span className="wishlist-tag" title="Tahmini Steam İstek Listesi">
                    ★ {comp.wishlistTier}
                  </span>
                  {comp.pricingEstimate && (
                    <span className="price-tag">{comp.pricingEstimate}</span>
                  )}
                </div>

                <div className="card-actions">
                  {comp.id.startsWith('custom-') && (
                    <button 
                      className="delete-comp-btn"
                      onClick={() => handleDeleteCompetitor(comp.id)}
                      title="Bu oyunu listeden kaldır"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                  <a 
                    href={comp.steamUrl || `https://store.steampowered.com/search/?term=${encodeURIComponent(comp.title)}`}
                    target="_blank" 
                    rel="noreferrer"
                    className="steam-link-btn"
                  >
                    <span>Steam'de Ara</span>
                    <ExternalLink size={14} />
                  </a>
                </div>
              </div>
            </div>
          );
        })}

        {filteredCompetitors.length === 0 && (
          <div className="empty-state">
            <Info size={36} />
            <p>Seçilen filtrelere uyan rakip oyun bulunamadı.</p>
            <button className="btn-secondary" onClick={() => { setSearchQuery(''); setSelectedTag('Hepsi'); setRiskFilter('Hepsi'); }}>
              Filtreleri Sıfırla
            </button>
          </div>
        )}
      </div>

      {/* Modal: Add Custom Competitor */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-wrap">
                <Radar size={22} className="modal-icon" />
                <h3>Yeni Steam Rakip Oyunu Ekle</h3>
              </div>
              <button className="close-btn" onClick={() => setShowAddModal(false)}>×</button>
            </div>

            <form onSubmit={handleAddCompetitor} className="modal-form">
              <div className="form-group">
                <label>Oyun Başlığı *</label>
                <input 
                  type="text" 
                  required 
                  className="form-input"
                  placeholder="Örn: Ghost Janitors Online"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Geliştirici / Stüdyo</label>
                  <input 
                    type="text" 
                    className="form-input"
                    placeholder="Örn: PanicRoom Games"
                    value={newDev}
                    onChange={(e) => setNewDev(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Tahmini Çıkış Tarihi *</label>
                  <input 
                    type="date" 
                    required 
                    className="form-input"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Tahmini İstek Listesi (Wishlist)</label>
                  <select 
                    className="form-select"
                    value={newWishlist}
                    onChange={(e) => setNewWishlist(e.target.value as WishlistTier)}
                  >
                    <option value="Very High (100k+)">Çok Yüksek (100k+ Wishlist)</option>
                    <option value="High (50k-100k)">Yüksek (50k - 100k Wishlist)</option>
                    <option value="Moderate (10k-50k)">Orta (10k - 50k Wishlist)</option>
                    <option value="Emerging (<10k)">Gelişmekte (&lt;10k Wishlist)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Tahmini Fiyat</label>
                  <input 
                    type="text" 
                    className="form-input"
                    placeholder="Örn: $7.99"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Tür Etiketleri (Virgülle ayırın)</label>
                <input 
                  type="text" 
                  className="form-input"
                  placeholder="Online Co-Op, Proximity Voice, Ragdoll Physics, Funny"
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Kilit Mekanikler (Virgülle ayırın)</label>
                <input 
                  type="text" 
                  className="form-input"
                  placeholder="Telsiz Cızırtısı, Canavardan Kaçış, Eşya Taşıma"
                  value={newMechanics}
                  onChange={(e) => setNewMechanics(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Kısa Oyun Açıklaması</label>
                <textarea 
                  className="form-textarea"
                  rows={2}
                  placeholder="Oyunun temel döngüsü ve komedi/kaos unsuru..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowAddModal(false)}>
                  İptal
                </button>
                <button type="submit" className="btn-primary">
                  Radara Ekle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};
