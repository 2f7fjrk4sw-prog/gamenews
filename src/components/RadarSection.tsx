import React, { useState, useMemo, useCallback } from 'react';
import type { CompetitorGame, WishlistTier, GameReleaseStatus } from '../types';
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
  RefreshCw,
  Check,
  Zap,
  Globe,
  Flame,
  Star
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
  // Blight: Survival
  'comp-blight': 'https://store.steampowered.com/app/1774880/Blight_Survival/',
  'blight: survival': 'https://store.steampowered.com/app/1774880/Blight_Survival/',

  // Kingmakers
  'comp-kingmakers': 'https://store.steampowered.com/app/2109770/Kingmakers/',
  'kingmakers': 'https://store.steampowered.com/app/2109770/Kingmakers/',

  // R.E.P.O.
  'comp-repo': 'https://store.steampowered.com/app/3241660/REPO/',
  'r.e.p.o.': 'https://store.steampowered.com/app/3241660/REPO/',
  'repo': 'https://store.steampowered.com/app/3241660/REPO/',

  // Big Walk
  'comp-bigwalk': 'https://store.steampowered.com/app/1478500/Big_Walk/',
  'big walk': 'https://store.steampowered.com/app/1478500/Big_Walk/',

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
};

const getSteamLink = (comp: CompetitorGame | MarketDiscoveryGame): string => {
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
  // Main view toggle: 'my-radar' vs 'discovery'
  const [activeRadarTab, setActiveRadarTab] = useState<'my-radar' | 'discovery'>('my-radar');

  // Search & Filter for My Radar
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'upcoming' | 'risk' | 'safe'>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // Discovery Section State - Default to 'upcoming' so user directly sees unreleased wishlist hits!
  const [discoveryCategory, setDiscoveryCategory] = useState<'all' | 'upcoming' | 'friendslop' | 'voice' | 'horror' | 'shooter' | 'social'>('upcoming');
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
  const [newWishlist, setNewWishlist] = useState<WishlistTier>('High (50k-100k)');
  const [newStatus, setNewStatus] = useState<GameReleaseStatus>('upcoming');
  const [newWishlistEst, setNewWishlistEst] = useState('100k+ Wishlist');
  const [newTags, setNewTags] = useState('Online Co-Op, Proximity Voice');
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
    if (diffDays === 0) timeText = 'Aynı gün';
    else if (diffDays > 0) timeText = `+${diffDays} gün`;
    else timeText = `-${absDiff} gün`;

    return { diffDays, absDiff, isRisky, isMediumRisk, timeText };
  }, [targetDate]);

  // Find critical collisions in active list
  const riskyGames = useMemo(() => {
    return competitors.filter(c => getCollision(c.releaseDate, c.wishlistTier).isRisky);
  }, [competitors, getCollision]);

  // Count upcoming in radar
  const upcomingInRadar = useMemo(() => {
    return competitors.filter(c => c.releaseStatus === 'upcoming' || (!c.releaseStatus && c.releaseDate >= todayStr));
  }, [competitors, todayStr]);

  // SMART LAUNCH WINDOW RECOMMENDER ALGORITHM
  const optimalWindow = useMemo(() => {
    const baseDate = new Date(todayStr > targetDate ? todayStr : targetDate);
    let bestDate = '';
    let bestScore = -1;
    let calmReason = '';

    const allKnownDates = [
      ...competitors.map(c => ({ date: c.releaseDate, tier: c.wishlistTier, title: c.title })),
      ...marketDiscoveryDatabase.map(m => ({ date: m.releaseDate, tier: m.wishlistTier, title: m.title })),
    ];

    for (let i = 1; i <= 20; i++) {
      const candidate = new Date(baseDate);
      candidate.setDate(candidate.getDate() + (i * 7));
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
        calmReason = `En yakın büyük rakip (${closestGameTitle}) ${minDistanceDays} gün uzakta.`;
      }
    }

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
      releaseStatus: game.releaseStatus,
      wishlistEstimate: game.wishlistEstimate,
      description: game.threatAnalysis,
      keyMechanics: game.mechanics,
      pricingEstimate: game.priceEstimate,
    };

    const updated = [newComp, ...competitors];
    setCompetitors(updated);
    localStorage.setItem('game_competitors', JSON.stringify(updated));

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
      releaseDate: targetDate,
      genreTags: ['Steam Keşfi', 'Multiplayer / Co-Op'],
      steamUrl: item.steamUrl,
      headerImage: item.headerImage,
      wishlistTier: 'High (50k-100k)',
      collisionRisk: 'Medium',
      releaseStatus: 'upcoming',
      wishlistEstimate: 'Canlı Steam Keşfi',
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
      if (discoveryCategory === 'upcoming') {
        if (game.releaseStatus !== 'upcoming') return false;
      } else if (discoveryCategory === 'friendslop') {
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

      if (discoverySearch.trim()) {
        const q = discoverySearch.toLowerCase();
        return (
          game.title.toLowerCase().includes(q) ||
          game.developer.toLowerCase().includes(q) ||
          game.genreTags.some(t => t.toLowerCase().includes(q)) ||
          game.mechanics.some(m => m.toLowerCase().includes(q)) ||
          (game.wishlistEstimate && game.wishlistEstimate.toLowerCase().includes(q))
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
      releaseStatus: newStatus,
      wishlistEstimate: newWishlistEst.trim() || 'Wishlist Aşamasında',
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

    if (filterMode === 'upcoming') {
      const isUp = comp.releaseStatus === 'upcoming' || (!comp.releaseStatus && comp.releaseDate >= todayStr);
      if (!isUp) return false;
    }
    if (filterMode === 'risk' && !isRisky) return false;
    if (filterMode === 'safe' && isRisky) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        comp.title.toLowerCase().includes(q) ||
        comp.developer.toLowerCase().includes(q) ||
        comp.genreTags.some(t => t.toLowerCase().includes(q)) ||
        (comp.wishlistEstimate && comp.wishlistEstimate.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="tab-pane">
      {/* 1. PROFESSIONAL COMMAND BAR (STUDIO BAR) */}
      <div className="studio-command-bar">
        <div className="studio-bar-left">
          <div className="studio-input-pill">
            <Gamepad2 size={15} className="studio-ico" />
            <span className="studio-label">Oyununuz:</span>
            <input 
              type="text"
              value={myGameTitle}
              onChange={(e) => setMyGameTitle(e.target.value)}
              placeholder="RPS Shoot"
              className="studio-bare-input"
            />
          </div>

          <div className="studio-input-pill">
            <Calendar size={15} className="studio-ico" />
            <span className="studio-label">Hedef Çıkış:</span>
            <input 
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="studio-bare-input date-input"
            />
          </div>
        </div>

        <div className="studio-bar-right">
          {/* Collision Risk Indicator */}
          <div className={`studio-status-badge ${riskyGames.length > 0 ? 'badge-risk' : 'badge-safe'}`}>
            {riskyGames.length > 0 ? (
              <>
                <AlertTriangle size={14} />
                <span>{riskyGames.length} Çakışma Riski</span>
              </>
            ) : (
              <>
                <CheckCircle2 size={14} />
                <span>Güvenli Pencere</span>
              </>
            )}
          </div>

          {/* Recommender Action */}
          <div className="studio-recommender-pill">
            <Sparkles size={14} className="text-amber-400" />
            <span className="recommender-text">
              Tavsiye: <strong>{optimalWindow.bestDate}</strong> (%{optimalWindow.bestScore} Sakin)
            </span>
            {targetDate !== optimalWindow.bestDate && (
              <button 
                className="btn-quick-apply"
                onClick={() => setTargetDate(optimalWindow.bestDate)}
                title="Tavsiye edilen en sakin tarihe güncelle"
              >
                <Zap size={11} />
                <span>Hedefim Yap</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. UNIFIED SEGMENTED NAVIGATION & CONTROLS TOOLBAR */}
      <div className="radar-modern-toolbar">
        {/* Segmented Switcher */}
        <div className="segmented-control">
          <button 
            className={`seg-btn ${activeRadarTab === 'my-radar' ? 'active' : ''}`}
            onClick={() => setActiveRadarTab('my-radar')}
          >
            <Gamepad2 size={14} />
            <span>Radarım</span>
            <span className="seg-count">{competitors.length}</span>
          </button>

          <button 
            className={`seg-btn ${activeRadarTab === 'discovery' ? 'active' : ''}`}
            onClick={() => setActiveRadarTab('discovery')}
          >
            <Radio size={14} className={activeRadarTab === 'discovery' ? 'pulse-icon' : ''} />
            <span>Steam Keşif & Wishlist</span>
            <span className="seg-count highlight">{marketDiscoveryDatabase.length}</span>
          </button>
        </div>

        {/* Search Box */}
        <div className="toolbar-search-box">
          <Search size={15} className="toolbar-search-ico" />
          <input 
            type="text" 
            placeholder={activeRadarTab === 'my-radar' ? "Takipteki oyunları veya etiketleri ara..." : "Wishlist liderleri veya Steam oyunları ara..."}
            value={activeRadarTab === 'my-radar' ? searchQuery : discoverySearch}
            onChange={(e) => {
              if (activeRadarTab === 'my-radar') setSearchQuery(e.target.value);
              else setDiscoverySearch(e.target.value);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && activeRadarTab === 'discovery') {
                handleTriggerLiveSteamSearch(discoverySearch);
              }
            }}
          />
          {(activeRadarTab === 'my-radar' ? searchQuery : discoverySearch) && (
            <button 
              className="toolbar-clear-btn"
              onClick={() => {
                if (activeRadarTab === 'my-radar') setSearchQuery('');
                else setDiscoverySearch('');
              }}
            >
              ×
            </button>
          )}
        </div>

        {/* Primary Action Button */}
        <div className="toolbar-actions">
          {activeRadarTab === 'my-radar' ? (
            <button 
              className="btn-pro-primary"
              onClick={() => setShowAddModal(true)}
            >
              <Plus size={14} />
              <span>Yeni Rakip Ekle</span>
            </button>
          ) : (
            <button 
              className="btn-pro-secondary"
              onClick={() => handleTriggerLiveSteamSearch(discoverySearch || 'co-op')}
              disabled={isLiveSearching}
            >
              {isLiveSearching ? (
                <>
                  <RefreshCw size={13} className="spin-icon" />
                  <span>Aranıyor...</span>
                </>
              ) : (
                <>
                  <Globe size={13} />
                  <span>Steam'de Canlı Ara</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* 3. FILTER CHIPS ROW */}
      <div className="filter-chips-bar">
        {activeRadarTab === 'my-radar' ? (
          <>
            <button 
              className={`filter-chip ${filterMode === 'all' ? 'active' : ''}`}
              onClick={() => setFilterMode('all')}
            >
              Tümü ({competitors.length})
            </button>
            <button 
              className={`filter-chip chip-purple ${filterMode === 'upcoming' ? 'active' : ''}`}
              onClick={() => setFilterMode('upcoming')}
            >
              <Star size={12} />
              <span>🔜 Çıkacak Olanlar ({upcomingInRadar.length})</span>
            </button>
            <button 
              className={`filter-chip chip-red ${filterMode === 'risk' ? 'active' : ''}`}
              onClick={() => setFilterMode('risk')}
            >
              <AlertTriangle size={12} />
              <span>🚨 Çakışma Riski ({riskyGames.length})</span>
            </button>
            <button 
              className={`filter-chip chip-green ${filterMode === 'safe' ? 'active' : ''}`}
              onClick={() => setFilterMode('safe')}
            >
              <CheckCircle2 size={12} />
              <span>🟢 Güvenli ({competitors.length - riskyGames.length})</span>
            </button>
          </>
        ) : (
          <>
            <button 
              className={`filter-chip chip-star ${discoveryCategory === 'upcoming' ? 'active' : ''}`}
              onClick={() => setDiscoveryCategory('upcoming')}
            >
              <Star size={12} />
              <span>⭐ Sadece Çıkacak Olanlar (Wishlist)</span>
            </button>
            <button 
              className={`filter-chip ${discoveryCategory === 'all' ? 'active' : ''}`}
              onClick={() => setDiscoveryCategory('all')}
            >
              Tüm Havuz ({marketDiscoveryDatabase.length})
            </button>
            <button 
              className={`filter-chip ${discoveryCategory === 'friendslop' ? 'active' : ''}`}
              onClick={() => setDiscoveryCategory('friendslop')}
            >
              <Flame size={12} />
              <span>🔥 Friendslop</span>
            </button>
            <button 
              className={`filter-chip ${discoveryCategory === 'voice' ? 'active' : ''}`}
              onClick={() => setDiscoveryCategory('voice')}
            >
              🎙️ Proximity Voice
            </button>
            <button 
              className={`filter-chip ${discoveryCategory === 'horror' ? 'active' : ''}`}
              onClick={() => setDiscoveryCategory('horror')}
            >
              👻 Co-Op Korku
            </button>
            <button 
              className={`filter-chip ${discoveryCategory === 'shooter' ? 'active' : ''}`}
              onClick={() => setDiscoveryCategory('shooter')}
            >
              🔫 Eşli Nişancı
            </button>
            <button 
              className={`filter-chip ${discoveryCategory === 'social' ? 'active' : ''}`}
              onClick={() => setDiscoveryCategory('social')}
            >
              🎲 Sosyal & Parti
            </button>
          </>
        )}
      </div>

      {/* ======================================================== */}
      {/* VIEW A: MY RADAR (ACTIVE TRACKED COMPETITORS) */}
      {/* ======================================================== */}
      {activeRadarTab === 'my-radar' && (
        <div className="pro-cards-grid">
          {filtered.map((comp) => {
            const { isRisky, timeText } = getCollision(comp.releaseDate, comp.wishlistTier);
            const headerImg = comp.headerImage || (comp.appId ? `https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/${comp.appId}/header.jpg` : null);
            const isUpcoming = comp.releaseStatus === 'upcoming' || (!comp.releaseStatus && comp.releaseDate >= todayStr);

            return (
              <div key={comp.id} className={`pro-game-card ${isRisky ? 'card-border-risk' : ''}`}>
                <div className="pro-card-image-wrap">
                  {headerImg ? (
                    <img 
                      src={headerImg} 
                      alt={comp.title} 
                      className="pro-card-image"
                      loading="lazy"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="pro-card-placeholder-image">
                      <Gamepad2 size={24} />
                    </div>
                  )}
                  <div className="pro-card-gradient-overlay" />

                  {/* Status Pill */}
                  <span className={`pro-status-pill status-${comp.releaseStatus || (isUpcoming ? 'upcoming' : 'released')}`}>
                    {comp.releaseStatus === 'released' 
                      ? '✅ Piyasada' 
                      : comp.releaseStatus === 'early_access'
                      ? '⚡ Erken Erişim'
                      : '🔜 Çıkacak'}
                  </span>

                  {/* Risk Pill */}
                  <span className={`pro-risk-pill ${isRisky ? 'risk-active' : 'risk-safe'}`}>
                    {isRisky ? `🚨 Çakışma (${timeText})` : `🟢 Güvenli (${timeText})`}
                  </span>
                </div>

                <div className="pro-card-body">
                  <div className="pro-card-title-row">
                    <div>
                      <h3 className="pro-card-title">{comp.title}</h3>
                      <span className="pro-card-dev">{comp.developer}</span>
                    </div>
                    {comp.wishlistEstimate && (
                      <span className="pro-wishlist-pill" title="Steam Wishlist / Takipçi">
                        ⭐ {comp.wishlistEstimate.split('(')[0].trim()}
                      </span>
                    )}
                  </div>

                  <p className="pro-card-desc">{comp.description}</p>

                  <div className="pro-card-tags">
                    {comp.genreTags.slice(0, 3).map((tag, idx) => (
                      <span key={idx} className="pro-tag">{tag}</span>
                    ))}
                    {comp.genreTags.length > 3 && (
                      <span className="pro-tag-more">+{comp.genreTags.length - 3}</span>
                    )}
                  </div>
                </div>

                <div className="pro-card-footer">
                  <div className="pro-footer-meta">
                    <span className="pro-date-text">
                      <Calendar size={12} />
                      <span>{comp.releaseDate}</span>
                    </span>
                    {comp.pricingEstimate && (
                      <span className="pro-price-text">{comp.pricingEstimate}</span>
                    )}
                  </div>

                  <div className="pro-footer-actions">
                    {(comp.id.startsWith('custom-') || comp.id.startsWith('imported-') || comp.id.startsWith('steam-')) && (
                      <button 
                        className="pro-btn-icon-del" 
                        onClick={() => handleDelete(comp.id)}
                        title="Radardan Sil"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                    <a 
                      href={getSteamLink(comp)}
                      target="_blank" 
                      rel="noreferrer"
                      className="pro-btn-steam"
                    >
                      <span>Steam</span>
                      <ExternalLink size={11} />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="pro-empty-box">
              Aramanıza uygun aktif rakip oyun bulunamadı.
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* VIEW B: STEAM MARKET RADAR & AUTO DISCOVERY ENGINE */}
      {/* ======================================================== */}
      {activeRadarTab === 'discovery' && (
        <div className="discovery-container">
          {/* Live Steam Search Results (if available) */}
          {liveSteamResults.length > 0 && (
            <div className="live-results-section">
              <div className="live-results-header">
                <Globe size={15} className="text-cyan-400" />
                <h3>Steam Canlı Arama Sonuçları ({liveSteamResults.length})</h3>
                <button 
                  className="btn-clear-live"
                  onClick={() => setLiveSteamResults([])}
                >
                  Kapat
                </button>
              </div>

              <div className="pro-cards-grid">
                {liveSteamResults.map((item) => {
                  const alreadyAdded = isGameTracked(item.title, item.appId);
                  const isJustAdded = justAddedId === item.id;

                  return (
                    <div key={item.id} className="pro-game-card">
                      <div className="pro-card-image-wrap">
                        <img 
                          src={item.headerImage} 
                          alt={item.title} 
                          className="pro-card-image"
                          loading="lazy"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = item.tinyImage;
                          }}
                        />
                        <div className="pro-card-gradient-overlay" />
                        <span className="pro-status-pill status-early_access">Steam Canlı</span>
                      </div>

                      <div className="pro-card-body">
                        <div className="pro-card-title-row">
                          <div>
                            <h3 className="pro-card-title">{item.title}</h3>
                            <span className="pro-card-dev">App ID: {item.appId}</span>
                          </div>
                        </div>
                      </div>

                      <div className="pro-card-footer">
                        <span className="pro-price-text">{item.price}</span>
                        <div className="pro-footer-actions">
                          <a 
                            href={item.steamUrl} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="pro-btn-steam"
                          >
                            <span>Steam</span>
                            <ExternalLink size={11} />
                          </a>
                          <button 
                            className={`pro-btn-import ${alreadyAdded ? 'imported' : ''}`}
                            onClick={() => handleImportLiveSteamItem(item)}
                            disabled={alreadyAdded}
                          >
                            {alreadyAdded || isJustAdded ? (
                              <>
                                <Check size={12} />
                                <span>Ekli</span>
                              </>
                            ) : (
                              <>
                                <Plus size={12} />
                                <span>Radara Ekle</span>
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
              <AlertTriangle size={14} />
              <span>{liveSearchError}</span>
            </div>
          )}

          {/* Curated Market Discovery Cards Grid */}
          <div className="pro-cards-grid">
            {filteredDiscovery.map((game) => {
              const { isRisky, isMediumRisk, timeText } = getCollision(game.releaseDate, game.wishlistTier);
              const alreadyAdded = isGameTracked(game.title, game.appId);
              const isJustAdded = justAddedId === game.id;

              return (
                <div key={game.id} className={`pro-game-card ${isRisky ? 'card-border-risk' : ''}`}>
                  <div className="pro-card-image-wrap">
                    <img 
                      src={game.headerImage} 
                      alt={game.title} 
                      className="pro-card-image"
                      loading="lazy"
                    />
                    <div className="pro-card-gradient-overlay" />

                    {/* Status Pill */}
                    <span className={`pro-status-pill status-${game.releaseStatus}`}>
                      {game.releaseStatus === 'released' 
                        ? '✅ Piyasada' 
                        : game.releaseStatus === 'early_access'
                        ? '⚡ Erken Erişim'
                        : '🔜 Çıkacak'}
                    </span>

                    {/* Risk Pill */}
                    <span className={`pro-risk-pill ${isRisky ? 'risk-active' : isMediumRisk ? 'risk-medium' : 'risk-safe'}`}>
                      {isRisky ? `🚨 Çakışma (${timeText})` : isMediumRisk ? `⚠️ Risk (${timeText})` : `🟢 Güvenli (${timeText})`}
                    </span>
                  </div>

                  <div className="pro-card-body">
                    <div className="pro-card-title-row">
                      <div>
                        <h3 className="pro-card-title">{game.title}</h3>
                        <span className="pro-card-dev">{game.developer}</span>
                      </div>
                      {game.wishlistEstimate && (
                        <span className="pro-wishlist-pill" title="Steam Wishlist / Takipçi">
                          ⭐ {game.wishlistEstimate.split('(')[0].trim()}
                        </span>
                      )}
                    </div>

                    <p className="pro-card-desc">{game.threatAnalysis}</p>

                    <div className="pro-card-tags">
                      {game.genreTags.slice(0, 3).map((tag, idx) => (
                        <span key={idx} className="pro-tag">{tag}</span>
                      ))}
                      {game.genreTags.length > 3 && (
                        <span className="pro-tag-more">+{game.genreTags.length - 3}</span>
                      )}
                    </div>
                  </div>

                  <div className="pro-card-footer">
                    <div className="pro-footer-meta">
                      <span className="pro-date-text">
                        <Calendar size={12} />
                        <span>{game.releaseDate}</span>
                      </span>
                      <span className="pro-price-text">{game.priceEstimate}</span>
                    </div>

                    <div className="pro-footer-actions">
                      <a 
                        href={game.steamUrl} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="pro-btn-steam"
                      >
                        <span>Steam</span>
                        <ExternalLink size={11} />
                      </a>

                      <button 
                        className={`pro-btn-import ${alreadyAdded ? 'imported' : ''}`}
                        onClick={() => handleImportToRadar(game)}
                        disabled={alreadyAdded}
                      >
                        {alreadyAdded || isJustAdded ? (
                          <>
                            <Check size={12} />
                            <span>Ekli</span>
                          </>
                        ) : (
                          <>
                            <Plus size={12} />
                            <span>Radara Ekle</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredDiscovery.length === 0 && (
              <div className="pro-empty-box">
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

              <div className="input-group-row">
                <div className="input-group">
                  <label>Yayınlanma Durumu</label>
                  <select 
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as GameReleaseStatus)}
                  >
                    <option value="upcoming">🔜 Çıkacak (Wishlist Aşamasında)</option>
                    <option value="early_access">⚡ Erken Erişim</option>
                    <option value="released">✅ Çıkış Yaptı (Piyasada)</option>
                  </select>
                </div>
                <div className="input-group">
                  <label>İstek Listesi (Wishlist) Tahmini</label>
                  <input 
                    type="text" 
                    value={newWishlistEst}
                    onChange={(e) => setNewWishlistEst(e.target.value)}
                    placeholder="Örn: 250k+ Wishlist (#20 Steam)"
                  />
                </div>
              </div>

              <div className="input-group">
                <label>Wishlist Hacim Grubu</label>
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
