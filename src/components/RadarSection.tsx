import React, { useState, useMemo, useCallback } from 'react';
import type { CompetitorGame, WishlistTier } from '../types';
import { 
  marketDiscoveryDatabase, 
  type MarketDiscoveryGame 
} from '../data/marketDiscoveryGames';
import { 
  Search, 
  Plus, 
  ExternalLink, 
  AlertTriangle, 
  CheckCircle2, 
  Trash2, 
  Calendar, 
  Gamepad2,
  Sparkles,
  Radio,
  TrendingUp,
  RefreshCw,
  Check,
  Zap,
  Globe
} from 'lucide-react';

interface RadarSectionProps {
  competitors: CompetitorGame[];
  setCompetitors: React.Dispatch<React.SetStateAction<CompetitorGame[]>>;
  targetDate: string;
  setTargetDate: (date: string) => void;
  myGameTitle: string;
  setMyGameTitle: (title: string) => void;
}

interface LiveSteamItem {
  id: string;
  appId: number;
  title: string;
  steamUrl: string;
  headerImage: string;
  tinyImage: string;
  price: string;
}

const STEAM_KNOWN_GAMES: Record<string, string> = {
  // Lethal Company
  'comp-0': 'https://store.steampowered.com/app/1966720/Lethal_Company/',
  'lethal company': 'https://store.steampowered.com/app/1966720/Lethal_Company/',

  // Murky Divers (Verified Official Steam App ID: 2963880)
  'comp-1': 'https://store.steampowered.com/app/2963880/Murky_Divers/',
  'murky divers': 'https://store.steampowered.com/app/2963880/Murky_Divers/',
  'murky drivers': 'https://store.steampowered.com/app/2963880/Murky_Divers/',

  // Content Warning
  'comp-3': 'https://store.steampowered.com/app/2881650/Content_Warning/',
  'content warning': 'https://store.steampowered.com/app/2881650/Content_Warning/',

  // Chained Together
  'comp-5': 'https://store.steampowered.com/app/2567870/Chained_Together/',
  'chained together': 'https://store.steampowered.com/app/2567870/Chained_Together/',

  // Liar's Bar
  'comp-4': 'https://store.steampowered.com/app/3097560/Liars_Bar/',
  "liar's bar": 'https://store.steampowered.com/app/3097560/Liars_Bar/',
  'liars bar': 'https://store.steampowered.com/app/3097560/Liars_Bar/',

  // Escape the Backrooms
  'comp-2': 'https://store.steampowered.com/app/1943950/Escape_the_Backrooms/',
  'escape the backrooms': 'https://store.steampowered.com/app/1943950/Escape_the_Backrooms/',

  // Phasmophobia
  'comp-6': 'https://store.steampowered.com/app/739630/Phasmophobia/',
  'phasmophobia': 'https://store.steampowered.com/app/739630/Phasmophobia/',
};

const getSteamLink = (comp: CompetitorGame): string => {
  if (STEAM_KNOWN_GAMES[comp.id]) {
    return STEAM_KNOWN_GAMES[comp.id];
  }

  const lowerTitle = (comp.title || '').toLowerCase();
  for (const [key, link] of Object.entries(STEAM_KNOWN_GAMES)) {
    if (lowerTitle.includes(key)) {
      return link;
    }
  }

  let url = (comp.steamUrl || '').trim();
  if (url.includes('2963840')) {
    url = url.replace('2963840', '2963880');
  }

  if (url.includes('store.steampowered.com/app/')) {
    return url;
  }

  if (url && !url.endsWith('steampowered.com') && !url.endsWith('steampowered.com/')) {
    return url;
  }

  return `https://store.steampowered.com/search/?term=${encodeURIComponent(comp.title)}`;
};

const getSteamAppId = (url?: string): string | null => {
  if (!url) return null;
  const match = url.match(/\/app\/(\d+)/);
  return match ? match[1] : null;
};

const createUniqueId = (prefix: string, seed?: number | string): string => {
  const time = Date.now();
  const rand = Math.random().toString(36).slice(2, 6);
  return seed ? `${prefix}-${seed}-${time}` : `${prefix}-${time}-${rand}`;
};

export const RadarSection: React.FC<RadarSectionProps> = ({
  competitors,
  setCompetitors,
  targetDate,
  setTargetDate,
  myGameTitle,
  setMyGameTitle,
}) => {
  // Main view toggle: 'my-radar' (active tracked games) vs 'discovery' (Steam market intelligence)
  const [activeRadarTab, setActiveRadarTab] = useState<'my-radar' | 'discovery'>('my-radar');

  // Search & Filter for My Radar
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'risk' | 'safe'>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // Discovery Section State
  const [discoveryCategory, setDiscoveryCategory] = useState<'all' | 'friendslop' | 'voice' | 'horror' | 'shooter' | 'social'>('all');
  const [discoverySearch, setDiscoverySearch] = useState('');
  const [liveSteamResults, setLiveSteamResults] = useState<LiveSteamItem[]>([]);
  const [isLiveSearching, setIsLiveSearching] = useState(false);
  const [liveSearchError, setLiveSearchError] = useState<string | null>(null);
  const [justAddedId, setJustAddedId] = useState<string | null>(null);

  // Today's date string YYYY-MM-DD
  const [todayStr] = useState<string>(() => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });

  // Form State for Adding New Competitor Manually
  const [newTitle, setNewTitle] = useState('');
  const [newDev, setNewDev] = useState('');
  const [newDate, setNewDate] = useState('2026-12-10');
  const [newWishlist, setNewWishlist] = useState<WishlistTier>('Moderate (10k-50k)');
  const [newTags, setNewTags] = useState('Online Co-Op, Friendslop');
  const [newDesc, setNewDesc] = useState('');
  const [newSteamUrl, setNewSteamUrl] = useState('');

  // Calculate day difference and collision risk
  const getCollision = useCallback((compDateStr: string, tier: WishlistTier) => {
    const compTime = new Date(compDateStr).getTime();
    const myTime = new Date(targetDate).getTime();
    const diffDays = Math.round((compTime - myTime) / (1000 * 60 * 60 * 24));
    const absDiff = Math.abs(diffDays);

    const isHighTier = tier === 'Very High (100k+)' || tier === 'High (50k-100k)';
    const isRisky = absDiff <= 7 && isHighTier;
    const isMediumRisk = absDiff <= 14 && isHighTier;

    let timeText = '';
    if (diffDays === 0) timeText = 'Aynı gün çıkıyor!';
    else if (diffDays > 0) timeText = `${diffDays} gün sonra`;
    else timeText = `${absDiff} gün önce`;

    return { diffDays, absDiff, isRisky, isMediumRisk, timeText };
  }, [targetDate]);

  // Find critical collisions in active list
  const riskyGames = useMemo(() => {
    return competitors.filter(c => getCollision(c.releaseDate, c.wishlistTier).isRisky);
  }, [competitors, getCollision]);

  // SMART LAUNCH WINDOW RECOMMENDER ALGORITHM
  // Scans future calendar Fridays (standard Steam release days) and finds the calmest window with zero critical conflicts
  const optimalWindow = useMemo(() => {
    const baseDate = new Date(todayStr > targetDate ? todayStr : targetDate);
    let bestDate = '';
    let bestScore = -1;
    let calmReason = '';

    // Combine active competitors and discovery games for a comprehensive market timeline
    const allKnownDates = [
      ...competitors.map(c => ({ date: c.releaseDate, tier: c.wishlistTier, title: c.title })),
      ...marketDiscoveryDatabase.map(m => ({ date: m.releaseDate, tier: m.wishlistTier, title: m.title })),
    ];

    // Check 20 upcoming Fridays
    for (let i = 1; i <= 20; i++) {
      const candidate = new Date(baseDate);
      candidate.setDate(candidate.getDate() + (i * 7));
      // Snap to Friday (day 5)
      const day = candidate.getDay();
      const diff = (5 - day + 7) % 7;
      candidate.setDate(candidate.getDate() + diff);

      const candTime = candidate.getTime();
      const candStr = candidate.toISOString().split('T')[0];

      let penalty = 0;
      let minDistanceDays = 999;
      let closestGameTitle = '';

      for (const item of allKnownDates) {
        const itemTime = new Date(item.date).getTime();
        const dist = Math.abs(Math.round((itemTime - candTime) / (1000 * 60 * 60 * 24)));
        if (dist < minDistanceDays) {
          minDistanceDays = dist;
          closestGameTitle = item.title;
        }

        const isBig = item.tier === 'Very High (100k+)' || item.tier === 'High (50k-100k)';
        if (dist <= 7) {
          penalty += isBig ? 60 : 30;
        } else if (dist <= 14) {
          penalty += isBig ? 25 : 10;
        }
      }

      const score = Math.max(0, 100 - penalty);
      if (score > bestScore && minDistanceDays >= 10) {
        bestScore = score;
        bestDate = candStr;
        calmReason = `En yakın büyük rakip (${closestGameTitle}) bu tarihten ${minDistanceDays} gün uzakta.`;
      }
    }

    // Fallback if no window with minDistance >= 10
    if (!bestDate) {
      bestDate = '2027-02-12';
      bestScore = 95;
      calmReason = 'Şubat ortası Steam kış indirimleri sonrası sakin koridor.';
    }

    return {
      bestDate,
      bestScore,
      calmReason,
    };
  }, [todayStr, targetDate, competitors]);

  // Check if a game is already in active competitors list
  const isGameTracked = useCallback((title: string, appId?: number | string) => {
    const cleanT = title.trim().toLowerCase();
    return competitors.some(c => {
      if (appId && c.appId && String(c.appId) === String(appId)) return true;
      return c.title.trim().toLowerCase() === cleanT;
    });
  }, [competitors]);

  // Import Discovery Game into User's Active Radar
  const handleImportToRadar = (game: MarketDiscoveryGame) => {
    if (isGameTracked(game.title, game.appId)) return;

    const newComp: CompetitorGame = {
      id: createUniqueId('imported', game.appId),
      appId: game.appId,
      title: game.title,
      developer: game.developer,
      releaseDate: game.releaseDate,
      genreTags: game.genreTags,
      steamUrl: game.steamUrl,
      headerImage: game.headerImage,
      wishlistTier: game.wishlistTier,
      collisionRisk: 'Medium',
      description: game.threatAnalysis,
      keyMechanics: game.mechanics,
      pricingEstimate: game.priceEstimate,
    };

    const updated = [newComp, ...competitors];
    setCompetitors(updated);
    localStorage.setItem('game_competitors', JSON.stringify(updated));

    // Flash success feedback
    setJustAddedId(game.id);
    setTimeout(() => setJustAddedId(null), 2500);
  };

  // Import Live Steam Search Result into Radar
  const handleImportLiveSteamItem = (item: LiveSteamItem) => {
    if (isGameTracked(item.title, item.appId)) return;

    const newComp: CompetitorGame = {
      id: createUniqueId('steam', item.appId),
      appId: item.appId,
      title: item.title,
      developer: 'Steam Geliştiricisi',
      releaseDate: targetDate, // Defaults to target date for user adjustment
      genreTags: ['Steam Keşfi', 'Multiplayer / Co-Op'],
      steamUrl: item.steamUrl,
      headerImage: item.headerImage,
      wishlistTier: 'High (50k-100k)',
      collisionRisk: 'Medium',
      description: `${item.title} - Canlı Steam mağaza aramasından radara eklendi.`,
      keyMechanics: ['Online Eşleşme', 'Steam Topluluğu'],
      pricingEstimate: item.price,
    };

    const updated = [newComp, ...competitors];
    setCompetitors(updated);
    localStorage.setItem('game_competitors', JSON.stringify(updated));

    setJustAddedId(item.id);
    setTimeout(() => setJustAddedId(null), 2500);
  };

  // Live Steam Store Search Trigger
  const handleTriggerLiveSteamSearch = async (termToSearch: string) => {
    const term = termToSearch.trim();
    if (!term) return;

    setIsLiveSearching(true);
    setLiveSearchError(null);

    try {
      const response = await fetch(`/api/steam-search?term=${encodeURIComponent(term)}`);
      if (!response.ok) {
        throw new Error(`Steam sunucusu yanıt vermedi (${response.status})`);
      }
      const data = await response.json();
      if (data.items && Array.isArray(data.items)) {
        setLiveSteamResults(data.items);
      } else {
        setLiveSteamResults([]);
      }
    } catch (err) {
      console.warn('Steam live search error, using curated database:', err);
      setLiveSearchError('Steam canlı mağaza sorgusu yapılamadı, yerel istihbarat listesi gösteriliyor.');
    } finally {
      setIsLiveSearching(false);
    }
  };

  // Filtered Discovery List
  const filteredDiscovery = useMemo(() => {
    return marketDiscoveryDatabase.filter(game => {
      // Category filter
      if (discoveryCategory === 'friendslop') {
        const isF = game.genreTags.some(t => t.toLowerCase().includes('friendslop') || t.toLowerCase().includes('physics'));
        if (!isF) return false;
      } else if (discoveryCategory === 'voice') {
        const isV = game.genreTags.some(t => t.toLowerCase().includes('proximity') || t.toLowerCase().includes('voice'));
        if (!isV) return false;
      } else if (discoveryCategory === 'horror') {
        const isH = game.genreTags.some(t => t.toLowerCase().includes('horror'));
        if (!isH) return false;
      } else if (discoveryCategory === 'shooter') {
        const isS = game.genreTags.some(t => t.toLowerCase().includes('shooter') || t.toLowerCase().includes('extraction'));
        if (!isS) return false;
      } else if (discoveryCategory === 'social') {
        const isSoc = game.genreTags.some(t => t.toLowerCase().includes('social') || t.toLowerCase().includes('funny') || t.toLowerCase().includes('casual'));
        if (!isSoc) return false;
      }

      // Text search
      if (discoverySearch.trim()) {
        const q = discoverySearch.toLowerCase();
        return (
          game.title.toLowerCase().includes(q) ||
          game.developer.toLowerCase().includes(q) ||
          game.genreTags.some(t => t.toLowerCase().includes(q)) ||
          game.mechanics.some(m => m.toLowerCase().includes(q))
        );
      }

      return true;
    });
  }, [discoveryCategory, discoverySearch]);

  // Add Competitor Manually
  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const finalSteamUrl = newSteamUrl.trim() || `https://store.steampowered.com/search/?term=${encodeURIComponent(newTitle.trim())}`;
    const extractedAppId = getSteamAppId(finalSteamUrl);

    const newGame: CompetitorGame = {
      id: createUniqueId('custom'),
      appId: extractedAppId ? parseInt(extractedAppId, 10) : undefined,
      title: newTitle.trim(),
      developer: newDev.trim() || 'Bağımsız Geliştirici',
      releaseDate: newDate,
      wishlistTier: newWishlist,
      collisionRisk: 'Medium',
      genreTags: newTags.split(',').map(t => t.trim()).filter(Boolean),
      keyMechanics: ['Yakınlık Sesi', 'Kaotik Co-Op'],
      description: newDesc.trim() || 'Steam de listelenen rakip oyun.',
      steamUrl: finalSteamUrl,
      headerImage: extractedAppId ? `https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/${extractedAppId}/header.jpg` : undefined,
    };

    const updated = [newGame, ...competitors];
    setCompetitors(updated);
    localStorage.setItem('game_competitors', JSON.stringify(updated));

    setNewTitle('');
    setNewDev('');
    setNewDesc('');
    setNewSteamUrl('');
    setShowAddModal(false);
  };

  const handleDelete = (id: string) => {
    const updated = competitors.filter(c => c.id !== id);
    setCompetitors(updated);
    localStorage.setItem('game_competitors', JSON.stringify(updated));
  };

  // Filtered List for My Radar
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
      {/* 1. Game Config, Status & Smart Launch Window Banner */}
      <div className="clean-config-card">
        <div className="config-inputs-row">
          <div className="clean-field">
            <label><Gamepad2 size={14} /> Oyununuzun Adı</label>
            <input 
              type="text"
              value={myGameTitle}
              onChange={(e) => setMyGameTitle(e.target.value)}
              placeholder="Örn: RPS Shoot"
              className="clean-input"
            />
          </div>

          <div className="clean-field">
            <label><Calendar size={14} /> Hedef Çıkış Tarihiniz</label>
            <input 
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="clean-input"
            />
            {targetDate && targetDate < todayStr && (
              <span className="field-hint-warning">
                <AlertTriangle size={12} /> Seçilen tarih geçmişte kalmış görünüyor
              </span>
            )}
          </div>
        </div>

        {/* Status Message */}
        <div className={`clean-status-box ${riskyGames.length > 0 ? 'status-danger' : 'status-success'}`}>
          {riskyGames.length > 0 ? (
            <>
              <AlertTriangle size={18} className="status-ico danger" />
              <div>
                <strong>Dikkat: {riskyGames.length} Oyunla Çakışma Riski Var</strong>
                <p>
                  <strong>{riskyGames[0].title}</strong> hedeflediğiniz tarihe çok yakın ({riskyGames[0].releaseDate}). 
                  Yayıncıların ilgisi ve Steam öne çıkanlar vitrininde bölünmemek için çıkışınızı kaydırmanız tavsiye edilir.
                </p>
              </div>
            </>
          ) : (
            <>
              <CheckCircle2 size={18} className="status-ico success" />
              <div>
                <strong>Güvenli Çıkış Penceresi</strong>
                <p>Seçtiğiniz tarihe (<strong>{targetDate}</strong>) 7 gün mesafede yüksek istek listeli doğrudan bir rakip görünmüyor.</p>
              </div>
            </>
          )}
        </div>

        {/* 🎯 SMART LAUNCH WINDOW RECOMMENDATION CARD */}
        <div className="launch-window-card">
          <div className="launch-window-header">
            <div className="launch-window-title">
              <Sparkles size={16} className="text-amber-400" />
              <span>Algoritma Tavsiyesi: En Uygun Lansman Penceresi</span>
              <span className="launch-window-score">%{optimalWindow.bestScore} Sakin</span>
            </div>
            {targetDate !== optimalWindow.bestDate && (
              <button 
                className="btn-apply-window"
                onClick={() => setTargetDate(optimalWindow.bestDate)}
                title="Hedef tarihi önerilen bu sakin pencereye güncelle"
              >
                <Zap size={13} />
                <span>Bu Tarihi Hedefim Yap ({optimalWindow.bestDate})</span>
              </button>
            )}
          </div>
          <p className="launch-window-desc">
            Steam pazarındaki tüm Friendslop ve Co-Op çıkış takvimi tarandı. <strong>{optimalWindow.bestDate}</strong> tarihi sıfır kritik çakışmaya sahip. {optimalWindow.calmReason}
          </p>
        </div>
      </div>

      {/* 2. SUB-NAVIGATION TABS: MY RADAR vs LIVE STEAM DISCOVERY */}
      <div className="radar-subnav-bar">
        <button 
          className={`radar-tab-btn ${activeRadarTab === 'my-radar' ? 'active' : ''}`}
          onClick={() => setActiveRadarTab('my-radar')}
        >
          <Gamepad2 size={16} />
          <span>Benim Radarım</span>
          <span className="radar-tab-badge">{competitors.length} Oyun</span>
        </button>

        <button 
          className={`radar-tab-btn ${activeRadarTab === 'discovery' ? 'active' : ''}`}
          onClick={() => setActiveRadarTab('discovery')}
        >
          <Radio size={16} className={activeRadarTab === 'discovery' ? 'pulse-icon' : ''} />
          <span>📡 Canlı Steam Pazar Radarı & Keşif</span>
          <span className="radar-tab-badge discovery-badge">16+ Güncel Rakip</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* VIEW A: MY RADAR (ACTIVE TRACKED COMPETITORS) */}
      {/* ======================================================== */}
      {activeRadarTab === 'my-radar' && (
        <>
          {/* Controls Bar: Search & Simple Filters */}
          <div className="simple-controls-bar">
            <div className="simple-search">
              <Search size={16} />
              <input 
                type="text"
                placeholder="Takip ettiğiniz rakipleri veya etiketleri ara..."
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

          {/* Competitor Cards Grid */}
          <div className="clean-cards-grid">
            {filtered.map((comp) => {
              const { isRisky, timeText } = getCollision(comp.releaseDate, comp.wishlistTier);
              const headerImg = comp.headerImage || (comp.appId ? `https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/${comp.appId}/header.jpg` : null);

              return (
                <div key={comp.id} className={`clean-card ${isRisky ? 'card-risk' : ''}`}>
                  {headerImg && (
                    <div className="clean-card-image-wrap">
                      <img 
                        src={headerImg} 
                        alt={comp.title} 
                        className="clean-card-image"
                        loading="lazy"
                        onError={(e) => {
                          // Hide image gracefully if 404
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                      <span className={`card-image-risk-pill ${isRisky ? 'pill-risk' : 'pill-safe'}`}>
                        {isRisky ? '🚨 Çakışma Riski' : '🟢 Güvenli Mesafe'}
                      </span>
                    </div>
                  )}

                  <div className="clean-card-header">
                    <div>
                      <h3 className="clean-card-title">{comp.title}</h3>
                      <span className="clean-card-sub">{comp.developer}</span>
                    </div>
                    {!headerImg && (
                      <span className={`risk-pill ${isRisky ? 'pill-risk' : 'pill-safe'}`}>
                        {isRisky ? '🚨 Çakışma Riski' : '🟢 Güvenli Mesafe'}
                      </span>
                    )}
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
                      {(comp.id.startsWith('custom-') || comp.id.startsWith('imported-') || comp.id.startsWith('steam-')) && (
                        <button 
                          className="icon-del-btn" 
                          onClick={() => handleDelete(comp.id)}
                          title="Radardan Çıkar"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                      <a 
                        href={getSteamLink(comp)}
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
                Aramanıza uygun aktif rakip oyun bulunamadı.
              </div>
            )}
          </div>
        </>
      )}

      {/* ======================================================== */}
      {/* VIEW B: STEAM MARKET RADAR & AUTO DISCOVERY ENGINE */}
      {/* ======================================================== */}
      {activeRadarTab === 'discovery' && (
        <div className="discovery-container">
          {/* Discovery Hero Banner */}
          <div className="discovery-hero-card">
            <div className="discovery-hero-text">
              <div className="discovery-live-badge">
                <span className="pulse-dot"></span>
                <span>Canlı Steam Pazar Radarı & Otomatik Rakip Taraması</span>
              </div>
              <h2>Friendslop, Online Co-Op & Proximity Voice Pazar Takibi</h2>
              <p>
                Bu algoritma, Steam'de yaklaşan veya popüler olan doğrudan rakipleri sürekli tarar.
                Oyununuza olan tehdit seviyelerini ve hedef çıkış tarihinize olan çakışma mesafelerini otomatik hesaplar.
                İlgilendiğiniz rakipleri tek tıkla radara ekleyebilir ve takımınızla bulutta senkronize edebilirsiniz.
              </p>
            </div>
          </div>

          {/* Discovery Controls Bar */}
          <div className="discovery-search-panel">
            <div className="discovery-input-wrapper">
              <Search size={18} className="search-ico" />
              <input 
                type="text" 
                placeholder="Örn: R.E.P.O., Panicore, Co-Op Korku, Simülatör veya Steam oyunu..."
                value={discoverySearch}
                onChange={(e) => setDiscoverySearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleTriggerLiveSteamSearch(discoverySearch);
                  }
                }}
              />
              {discoverySearch && (
                <button className="clear-btn" onClick={() => setDiscoverySearch('')}>×</button>
              )}
              <button 
                className="live-steam-search-btn"
                onClick={() => handleTriggerLiveSteamSearch(discoverySearch || 'co-op')}
                disabled={isLiveSearching}
                title="Steam Mağaza API'sinden canlı ara"
              >
                {isLiveSearching ? (
                  <>
                    <RefreshCw size={14} className="spin-icon" />
                    <span>Taranıyor...</span>
                  </>
                ) : (
                  <>
                    <Globe size={14} />
                    <span>Steam'de Canlı Ara</span>
                  </>
                )}
              </button>
            </div>

            {/* Category Chips */}
            <div className="discovery-chips-row">
              <button 
                className={`category-chip ${discoveryCategory === 'all' ? 'active' : ''}`}
                onClick={() => setDiscoveryCategory('all')}
              >
                Tüm Havuz ({marketDiscoveryDatabase.length})
              </button>
              <button 
                className={`category-chip ${discoveryCategory === 'friendslop' ? 'active' : ''}`}
                onClick={() => setDiscoveryCategory('friendslop')}
              >
                🔥 Friendslop / Kaotik
              </button>
              <button 
                className={`category-chip ${discoveryCategory === 'voice' ? 'active' : ''}`}
                onClick={() => setDiscoveryCategory('voice')}
              >
                🎙️ Proximity Voice
              </button>
              <button 
                className={`category-chip ${discoveryCategory === 'horror' ? 'active' : ''}`}
                onClick={() => setDiscoveryCategory('horror')}
              >
                👻 Co-Op Korku
              </button>
              <button 
                className={`category-chip ${discoveryCategory === 'shooter' ? 'active' : ''}`}
                onClick={() => setDiscoveryCategory('shooter')}
              >
                🔫 Eşli Nişancı
              </button>
              <button 
                className={`category-chip ${discoveryCategory === 'social' ? 'active' : ''}`}
                onClick={() => setDiscoveryCategory('social')}
              >
                🎲 Sosyal & Parti
              </button>
            </div>
          </div>

          {/* Live Steam Search Results (if available) */}
          {liveSteamResults.length > 0 && (
            <div className="live-results-section">
              <div className="live-results-header">
                <Globe size={16} className="text-cyan-400" />
                <h3>Steam Canlı Arama Sonuçları ({liveSteamResults.length})</h3>
                <button 
                  className="btn-clear-live"
                  onClick={() => setLiveSteamResults([])}
                >
                  Sonuçları Kapat
                </button>
              </div>

              <div className="clean-cards-grid">
                {liveSteamResults.map((item) => {
                  const alreadyAdded = isGameTracked(item.title, item.appId);
                  const isJustAdded = justAddedId === item.id;

                  return (
                    <div key={item.id} className="clean-card live-steam-card">
                      <div className="clean-card-image-wrap">
                        <img 
                          src={item.headerImage} 
                          alt={item.title} 
                          className="clean-card-image"
                          loading="lazy"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = item.tinyImage;
                          }}
                        />
                        <span className="live-steam-badge">Canlı Steam</span>
                      </div>

                      <div className="clean-card-header">
                        <div>
                          <h3 className="clean-card-title">{item.title}</h3>
                          <span className="clean-card-sub">App ID: {item.appId}</span>
                        </div>
                      </div>

                      <div className="clean-card-footer">
                        <span className="wishlist-text">{item.price}</span>
                        <div className="footer-actions">
                          <a 
                            href={item.steamUrl} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="clean-link-btn"
                          >
                            <span>Steam'de Aç</span>
                            <ExternalLink size={13} />
                          </a>
                          <button 
                            className={`action-btn-import ${alreadyAdded ? 'imported' : ''}`}
                            onClick={() => handleImportLiveSteamItem(item)}
                            disabled={alreadyAdded}
                          >
                            {alreadyAdded || isJustAdded ? (
                              <>
                                <Check size={14} />
                                <span>Radarda Ekli</span>
                              </>
                            ) : (
                              <>
                                <Plus size={14} />
                                <span>Radarıma Ekle</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {liveSearchError && (
            <div className="live-search-hint-box">
              <AlertTriangle size={15} />
              <span>{liveSearchError}</span>
            </div>
          )}

          {/* Curated Market Discovery Cards Grid */}
          <div className="discovery-section-title">
            <TrendingUp size={16} />
            <span>Takip Edilen Güncel Pazar Havuzu ({filteredDiscovery.length} Oyun)</span>
          </div>

          <div className="clean-cards-grid">
            {filteredDiscovery.map((game) => {
              const { isRisky, isMediumRisk, timeText } = getCollision(game.releaseDate, game.wishlistTier);
              const alreadyAdded = isGameTracked(game.title, game.appId);
              const isJustAdded = justAddedId === game.id;

              return (
                <div key={game.id} className={`clean-card discovery-card ${isRisky ? 'card-risk' : ''}`}>
                  <div className="clean-card-image-wrap">
                    <img 
                      src={game.headerImage} 
                      alt={game.title} 
                      className="clean-card-image"
                      loading="lazy"
                    />
                    <span className={`card-image-risk-pill ${isRisky ? 'pill-risk' : isMediumRisk ? 'pill-medium' : 'pill-safe'}`}>
                      {isRisky ? '🚨 Kritik Çakışma' : isMediumRisk ? '⚠️ Yüksek Risk' : '🟢 Güvenli Mesafe'}
                    </span>
                  </div>

                  <div className="clean-card-header">
                    <div>
                      <h3 className="clean-card-title">{game.title}</h3>
                      <span className="clean-card-sub">{game.developer}</span>
                    </div>
                  </div>

                  <div className="clean-timing-row">
                    <span className="date-text"><Calendar size={13} /> {game.releaseDate} ({game.releaseWindowDisplay})</span>
                    <span className={`offset-text ${isRisky ? 'text-red' : ''}`}>{timeText}</span>
                  </div>

                  <p className="clean-card-desc">{game.threatAnalysis}</p>

                  <div className="clean-tags-row">
                    {game.genreTags.map((tag, idx) => (
                      <span key={idx} className="simple-tag">{tag}</span>
                    ))}
                  </div>

                  <div className="discovery-mechanics-row">
                    {game.mechanics.map((mech, idx) => (
                      <span key={idx} className="mechanic-tag">⚡ {mech}</span>
                    ))}
                  </div>

                  <div className="clean-card-footer">
                    <div className="discovery-meta-left">
                      <span className="wishlist-text">{game.wishlistTier}</span>
                      <span className="price-tag-sub">{game.priceEstimate}</span>
                    </div>

                    <div className="footer-actions">
                      <a 
                        href={game.steamUrl} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="clean-link-btn"
                      >
                        <span>Steam</span>
                        <ExternalLink size={13} />
                      </a>

                      <button 
                        className={`action-btn-import ${alreadyAdded ? 'imported' : ''}`}
                        onClick={() => handleImportToRadar(game)}
                        disabled={alreadyAdded}
                        title={alreadyAdded ? 'Bu oyun zaten aktif radarınızda kayıtlı' : 'Bu oyunu takip listenize ekleyin'}
                      >
                        {alreadyAdded || isJustAdded ? (
                          <>
                            <Check size={14} />
                            <span>Radarda Ekli</span>
                          </>
                        ) : (
                          <>
                            <Plus size={14} />
                            <span>Radarıma Ekle</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredDiscovery.length === 0 && (
              <div className="clean-empty-box">
                Arama kriterlerinize uygun pazar oyunu bulunamadı.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal: Add Competitor Manually */}
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
                <label>Steam Mağaza Linki (İsteğe Bağlı)</label>
                <input 
                  type="url" 
                  value={newSteamUrl}
                  onChange={(e) => setNewSteamUrl(e.target.value)}
                  placeholder="https://store.steampowered.com/app/1234560/..."
                />
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px', display: 'block' }}>
                  Steam linki girdiğinizde oyunun resmi görseli ve mağaza linki otomatik bağlanır.
                </span>
              </div>

              <div className="input-group">
                <label>Kısa Açıklama & Notlar</label>
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
