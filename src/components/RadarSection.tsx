import React, { useState } from 'react';
import type { CompetitorGame, WishlistTier } from '../types';
import { 
  Search, 
  Plus, 
  ExternalLink, 
  AlertTriangle, 
  CheckCircle2, 
  Trash2, 
  Calendar, 
  Gamepad2
} from 'lucide-react';

interface RadarSectionProps {
  competitors: CompetitorGame[];
  setCompetitors: React.Dispatch<React.SetStateAction<CompetitorGame[]>>;
  targetDate: string;
  setTargetDate: (date: string) => void;
  myGameTitle: string;
  setMyGameTitle: (title: string) => void;
}

export const RadarSection: React.FC<RadarSectionProps> = ({
  competitors,
  setCompetitors,
  targetDate,
  setTargetDate,
  myGameTitle,
  setMyGameTitle,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'risk' | 'safe'>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // Today's date in YYYY-MM-DD for minimum date restriction
  const [todayStr] = useState<string>(() => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });

  // Form State for Adding New Competitor
  const [newTitle, setNewTitle] = useState('');
  const [newDev, setNewDev] = useState('');
  const [newDate, setNewDate] = useState('2026-12-10');
  const [newWishlist, setNewWishlist] = useState<WishlistTier>('Moderate (10k-50k)');
  const [newTags, setNewTags] = useState('Online Co-Op, Friendslop');
  const [newDesc, setNewDesc] = useState('');

  // Calculate day difference and collision risk
  const getCollision = (compDateStr: string, tier: WishlistTier) => {
    const compTime = new Date(compDateStr).getTime();
    const myTime = new Date(targetDate).getTime();
    const diffDays = Math.round((compTime - myTime) / (1000 * 60 * 60 * 24));
    const absDiff = Math.abs(diffDays);

    const isHighTier = tier === 'Very High (100k+)' || tier === 'High (50k-100k)';
    const isRisky = absDiff <= 7 && isHighTier;

    let timeText = '';
    if (diffDays === 0) timeText = 'Aynı gün çıkıyor!';
    else if (diffDays > 0) timeText = `${diffDays} gün sonra`;
    else timeText = `${absDiff} gün önce`;

    return { diffDays, absDiff, isRisky, timeText };
  };

  // Find critical collisions
  const riskyGames = competitors.filter(c => getCollision(c.releaseDate, c.wishlistTier).isRisky);

  // Add Competitor
  const handleAdd = (e: React.FormEvent) => {
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
      keyMechanics: ['Yakınlık Sesi', 'Kaotik Co-Op'],
      description: newDesc.trim() || 'Steam de listelenen rakip oyun.',
      steamUrl: 'https://store.steampowered.com',
    };

    const updated = [newGame, ...competitors];
    setCompetitors(updated);
    localStorage.setItem('game_competitors', JSON.stringify(updated));

    setNewTitle('');
    setNewDev('');
    setNewDesc('');
    setShowAddModal(false);
  };

  const handleDelete = (id: string) => {
    const updated = competitors.filter(c => c.id !== id);
    setCompetitors(updated);
    localStorage.setItem('game_competitors', JSON.stringify(updated));
  };

  // Filtered List
  const filtered = competitors.filter(comp => {
    const { isRisky } = getCollision(comp.releaseDate, comp.wishlistTier);

    if (filterMode === 'risk' && !isRisky) return false;
    if (filterMode === 'safe' && isRisky) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        comp.title.toLowerCase().includes(q) ||
        comp.developer.toLowerCase().includes(q) ||
        comp.genreTags.some(t => t.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="tab-pane">
      {/* 1. Simple Game Config & Status Card */}
      <div className="clean-config-card">
        <div className="config-inputs-row">
          <div className="clean-field">
            <label><Gamepad2 size={14} /> Oyununuzun Adı</label>
            <input 
              type="text"
              value={myGameTitle}
              onChange={(e) => setMyGameTitle(e.target.value)}
              placeholder="Örn: Kaos Ekibi"
              className="clean-input"
            />
          </div>

          <div className="clean-field">
            <label><Calendar size={14} /> Hedef Çıkış Tarihiniz</label>
            <input 
              type="date"
              min={todayStr}
              value={targetDate}
              onChange={(e) => {
                const val = e.target.value;
                if (val && val < todayStr) {
                  setTargetDate(todayStr);
                } else {
                  setTargetDate(val);
                }
              }}
              className="clean-input"
            />
          </div>
        </div>

        {/* Clear Status Message */}
        <div className={`clean-status-box ${riskyGames.length > 0 ? 'status-danger' : 'status-success'}`}>
          {riskyGames.length > 0 ? (
            <>
              <AlertTriangle size={18} className="status-ico danger" />
              <div>
                <strong>Dikkat: {riskyGames.length} Oyunla Çakışma Riski Var</strong>
                <p>
                  <strong>{riskyGames[0].title}</strong> hedeflediğiniz tarihe çok yakın ({riskyGames[0].releaseDate}). 
                  Yayıncıların ilgisi bölünmemesi için çıkışınızı 1-2 hafta kaydırmanız tavsiye edilir.
                </p>
              </div>
            </>
          ) : (
            <>
              <CheckCircle2 size={18} className="status-ico success" />
              <div>
                <strong>Güvenli Çıkış Penceresi</strong>
                <p>Seçtiğiniz tarihe (<strong>{targetDate}</strong>) 7 gün mesafede yüksek istek listeli doğrudan bir Friendslop oyunu görünmüyor.</p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* 2. Controls Bar: Search & Simple Filters */}
      <div className="simple-controls-bar">
        <div className="simple-search">
          <Search size={16} />
          <input 
            type="text"
            placeholder="Oyun veya etiket ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="clear-btn" onClick={() => setSearchQuery('')}>×</button>
          )}
        </div>

        <div className="simple-filters">
          <button 
            className={`pill-btn ${filterMode === 'all' ? 'active' : ''}`}
            onClick={() => setFilterMode('all')}
          >
            Tümü ({competitors.length})
          </button>
          <button 
            className={`pill-btn danger-pill ${filterMode === 'risk' ? 'active' : ''}`}
            onClick={() => setFilterMode('risk')}
          >
            🚨 Çakışma Riski ({riskyGames.length})
          </button>
          <button 
            className={`pill-btn success-pill ${filterMode === 'safe' ? 'active' : ''}`}
            onClick={() => setFilterMode('safe')}
          >
            🟢 Güvenli ({competitors.length - riskyGames.length})
          </button>
          <button 
            className="action-btn-primary"
            onClick={() => setShowAddModal(true)}
          >
            <Plus size={15} /> Yeni Rakip Ekle
          </button>
        </div>
      </div>

      {/* 3. Competitor Cards List */}
      <div className="clean-cards-grid">
        {filtered.map((comp) => {
          const { isRisky, timeText } = getCollision(comp.releaseDate, comp.wishlistTier);

          return (
            <div key={comp.id} className={`clean-card ${isRisky ? 'card-risk' : ''}`}>
              <div className="clean-card-header">
                <div>
                  <h3 className="clean-card-title">{comp.title}</h3>
                  <span className="clean-card-sub">{comp.developer}</span>
                </div>
                <span className={`risk-pill ${isRisky ? 'pill-risk' : 'pill-safe'}`}>
                  {isRisky ? '🚨 Çakışma Riski' : '🟢 Güvenli Mesafe'}
                </span>
              </div>

              <div className="clean-timing-row">
                <span className="date-text"><Calendar size={13} /> {comp.releaseDate}</span>
                <span className={`offset-text ${isRisky ? 'text-red' : ''}`}>{timeText}</span>
              </div>

              <p className="clean-card-desc">{comp.description}</p>

              <div className="clean-tags-row">
                {comp.genreTags.map((tag, idx) => (
                  <span key={idx} className="simple-tag">{tag}</span>
                ))}
              </div>

              <div className="clean-card-footer">
                <span className="wishlist-text">{comp.wishlistTier}</span>
                <div className="footer-actions">
                  {comp.id.startsWith('custom-') && (
                    <button 
                      className="icon-del-btn" 
                      onClick={() => handleDelete(comp.id)}
                      title="Sil"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                  <a 
                    href={comp.steamUrl || `https://store.steampowered.com/search/?term=${encodeURIComponent(comp.title)}`}
                    target="_blank" 
                    rel="noreferrer"
                    className="clean-link-btn"
                  >
                    <span>Steam'de Gör</span>
                    <ExternalLink size={13} />
                  </a>
                </div>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="clean-empty-box">
            Aramanıza uygun oyun bulunamadı.
          </div>
        )}
      </div>

      {/* Modal: Add Competitor */}
      {showAddModal && (
        <div className="simple-modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div className="simple-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-top">
              <h3>Yeni Rakip Oyun Ekle</h3>
              <button className="modal-close" onClick={() => setShowAddModal(false)}>×</button>
            </div>

            <form onSubmit={handleAdd} className="simple-form">
              <div className="input-group">
                <label>Oyun Başlığı</label>
                <input 
                  type="text" 
                  required 
                  placeholder="Örn: Deep Ocean Buddies"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                />
              </div>

              <div className="input-group-row">
                <div className="input-group">
                  <label>Geliştirici</label>
                  <input 
                    type="text" 
                    placeholder="Stüdyo Adı"
                    value={newDev}
                    onChange={(e) => setNewDev(e.target.value)}
                  />
                </div>
                <div className="input-group">
                  <label>Çıkış Tarihi</label>
                  <input 
                    type="date" 
                    required 
                    min={todayStr}
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="input-group">
                <label>Tahmini İstek Listesi (Wishlist)</label>
                <select 
                  value={newWishlist}
                  onChange={(e) => setNewWishlist(e.target.value as WishlistTier)}
                >
                  <option value="Very High (100k+)">100k+ (Çok Yüksek)</option>
                  <option value="High (50k-100k)">50k - 100k (Yüksek)</option>
                  <option value="Moderate (10k-50k)">10k - 50k (Orta)</option>
                  <option value="Emerging (<10k)">&lt;10k (Gelişmekte)</option>
                </select>
              </div>

              <div className="input-group">
                <label>Etiketler (Virgülle ayırın)</label>
                <input 
                  type="text" 
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  placeholder="Online Co-Op, Proximity Voice"
                />
              </div>

              <div className="input-group">
                <label>Kısa Açıklama</label>
                <textarea 
                  rows={2}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Oyun hakkında kısa not..."
                />
              </div>

              <div className="modal-btn-row">
                <button type="button" className="btn-cancel" onClick={() => setShowAddModal(false)}>İptal</button>
                <button type="submit" className="action-btn-primary">Kaydet</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
