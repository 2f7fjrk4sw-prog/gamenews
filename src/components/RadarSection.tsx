import React, { useState, useMemo, useCallback } from 'react';
import type { CompetitorGame, WishlistTier, GameReleaseStatus } from '../types';
import {
  marketDiscoveryDatabase,
  type MarketDiscoveryGame,
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
  Users,
  Radio,
  RefreshCw,
  Check,
  Globe,
  HelpCircle,
  Save,
} from 'lucide-react';

interface RadarSectionProps {
  competitors: CompetitorGame[];
  setCompetitors: React.Dispatch<React.SetStateAction<CompetitorGame[]>>;
  targetDate: string;
  setTargetDate: (date: string) => void;
  teamName: string;
  myGameTitle: string;
  onSaveTeamAndGame: (data: { teamName: string; gameTitle: string; targetDate: string }) => Promise<void>;
  onOpenTeamModal: () => void;
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
  'comp-blight': 'https://store.steampowered.com/app/1774880/Blight_Survival/',
  'blight: survival': 'https://store.steampowered.com/app/1774880/Blight_Survival/',
  'comp-kingmakers': 'https://store.steampowered.com/app/2109770/Kingmakers/',
  kingmakers: 'https://store.steampowered.com/app/2109770/Kingmakers/',
  'comp-repo': 'https://store.steampowered.com/app/3241660/REPO/',
  'r.e.p.o.': 'https://store.steampowered.com/app/3241660/REPO/',
  repo: 'https://store.steampowered.com/app/3241660/REPO/',
  'comp-bigwalk': 'https://store.steampowered.com/app/1478500/Big_Walk/',
  'big walk': 'https://store.steampowered.com/app/1478500/Big_Walk/',
  'comp-0': 'https://store.steampowered.com/app/1966720/Lethal_Company/',
  'lethal company': 'https://store.steampowered.com/app/1966720/Lethal_Company/',
  'comp-1': 'https://store.steampowered.com/app/2963880/Murky_Divers/',
  'murky divers': 'https://store.steampowered.com/app/2963880/Murky_Divers/',
  'murky drivers': 'https://store.steampowered.com/app/2963880/Murky_Divers/',
  'comp-3': 'https://store.steampowered.com/app/2881650/Content_Warning/',
  'content warning': 'https://store.steampowered.com/app/2881650/Content_Warning/',
  'comp-5': 'https://store.steampowered.com/app/2567870/Chained_Together/',
  'chained together': 'https://store.steampowered.com/app/2567870/Chained_Together/',
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
  teamName,
  myGameTitle,
  onSaveTeamAndGame,
  onOpenTeamModal,
}) => {
  const [activeRadarTab, setActiveRadarTab] = useState<'my-radar' | 'discovery'>('my-radar');

  // Local editable drafts for Team Name & Game Title
  const [draftTeamNameOverride, setDraftTeamNameOverride] = useState<string | null>(null);
  const [draftGameTitleOverride, setDraftGameTitleOverride] = useState<string | null>(null);
  const [draftDateOverride, setDraftDateOverride] = useState<string | null>(null);
  const draftTeamName = draftTeamNameOverride ?? teamName;
  const draftGameTitle = draftGameTitleOverride ?? myGameTitle;
  const draftDate = draftDateOverride ?? targetDate;
  const [saveFeedback, setSaveFeedback] = useState(false);
  const [showHowTo, setShowHowTo] = useState<boolean>(() => {
    return localStorage.getItem('hide_home_howto') !== 'true';
  });

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'upcoming' | 'risk' | 'safe'>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // Discovery Section State
  const [discoveryCategory, setDiscoveryCategory] = useState<
    'all' | 'upcoming' | 'friendslop' | 'voice' | 'horror' | 'shooter' | 'social'
  >('upcoming');
  const [discoverySearch, setDiscoverySearch] = useState('');
  const [liveSteamResults, setLiveSteamResults] = useState<LiveSteamItem[]>([]);
  const [isLiveSearching, setIsLiveSearching] = useState(false);
  const [liveSearchError, setLiveSearchError] = useState<string | null>(null);
  const [justAddedId, setJustAddedId] = useState<string | null>(null);

  const [todayStr] = useState<string>(() => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });

  // Add Competitor Form State
  const [newTitle, setNewTitle] = useState('');
  const [newDev, setNewDev] = useState('');
  const [newDate, setNewDate] = useState('2026-12-10');
  const [newWishlist, setNewWishlist] = useState<WishlistTier>('High (50k-100k)');
  const [newStatus, setNewStatus] = useState<GameReleaseStatus>('upcoming');
  const [newTags, setNewTags] = useState('Online Co-Op, Proximity Voice');
  const [newDesc, setNewDesc] = useState('');
  const [newSteamUrl, setNewSteamUrl] = useState('');

  const handleSaveTeamBar = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTeam = draftTeamName.trim() || teamName;
    const cleanGame = draftGameTitle.trim() || myGameTitle;
    const cleanDate = draftDate || targetDate;
    await onSaveTeamAndGame({
      teamName: cleanTeam,
      gameTitle: cleanGame,
      targetDate: cleanDate,
    });
    setDraftTeamNameOverride(null);
    setDraftGameTitleOverride(null);
    setDraftDateOverride(null);
    setSaveFeedback(true);
    setTimeout(() => setSaveFeedback(false), 2500);
  };

  const hasUnsavedTeamChanges =
    draftTeamName.trim() !== teamName.trim() ||
    draftGameTitle.trim() !== myGameTitle.trim() ||
    draftDate !== targetDate;

  const getCollision = useCallback(
    (compDateStr: string, tier: WishlistTier) => {
      const compTime = new Date(compDateStr).getTime();
      const myTime = new Date(targetDate).getTime();
      const diffDays = Math.round((compTime - myTime) / (1000 * 60 * 60 * 24));
      const absDiff = Math.abs(diffDays);

      const isHighTier = tier === 'Very High (100k+)' || tier === 'High (50k-100k)';
      const isRisky = absDiff <= 7 && isHighTier;
      const isMediumRisk = absDiff <= 14 && isHighTier;

      let timeText = '';
      if (diffDays === 0) timeText = 'Aynı gün';
      else if (diffDays > 0) timeText = `${diffDays} gün sonra`;
      else timeText = `${absDiff} gün önce`;

      return { diffDays, absDiff, isRisky, isMediumRisk, timeText };
    },
    [targetDate]
  );

  const riskyGames = useMemo(() => {
    return competitors.filter((c) => getCollision(c.releaseDate, c.wishlistTier).isRisky);
  }, [competitors, getCollision]);

  const upcomingInRadar = useMemo(() => {
    return competitors.filter(
      (c) => c.releaseStatus === 'upcoming' || (!c.releaseStatus && c.releaseDate >= todayStr)
    );
  }, [competitors, todayStr]);

  // Recommender Algorithm
  const optimalWindow = useMemo(() => {
    const baseDate = new Date(todayStr > targetDate ? todayStr : targetDate);
    let bestDate = '';
    let bestScore = -1;

    const allKnownDates = [
      ...competitors.map((c) => ({ date: c.releaseDate, tier: c.wishlistTier, title: c.title })),
      ...marketDiscoveryDatabase.map((m) => ({
        date: m.releaseDate,
        tier: m.wishlistTier,
        title: m.title,
      })),
    ];

    for (let i = 1; i <= 20; i++) {
      const candidate = new Date(baseDate);
      candidate.setDate(candidate.getDate() + i * 7);
      const day = candidate.getDay();
      const diff = (5 - day + 7) % 7;
      candidate.setDate(candidate.getDate() + diff);

      const candTime = candidate.getTime();
      const candStr = candidate.toISOString().split('T')[0];

      let penalty = 0;
      let minDistanceDays = 999;

      for (const item of allKnownDates) {
        const itemTime = new Date(item.date).getTime();
        const dist = Math.abs(Math.round((itemTime - candTime) / (1000 * 60 * 60 * 24)));
        if (dist < minDistanceDays) {
          minDistanceDays = dist;
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
      }
    }

    if (!bestDate) {
      bestDate = '2027-02-12';
      bestScore = 95;
    }

    return { bestDate, bestScore };
  }, [todayStr, targetDate, competitors]);

  const isGameTracked = useCallback(
    (title: string, appId?: number | string) => {
      const cleanT = title.trim().toLowerCase();
      return competitors.some((c) => {
        if (appId && c.appId && String(c.appId) === String(appId)) return true;
        return c.title.trim().toLowerCase() === cleanT;
      });
    },
    [competitors]
  );

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

    setCompetitors((prev) => [newComp, ...prev]);
    setJustAddedId(game.id);
    setTimeout(() => setJustAddedId(null), 2500);
  };

  const handleImportLiveSteamItem = (item: LiveSteamItem) => {
    if (isGameTracked(item.title, item.appId)) return;

    const newComp: CompetitorGame = {
      id: createUniqueId('steam', item.appId),
      appId: item.appId,
      title: item.title,
      developer: 'Steam Geliştiricisi',
      releaseDate: targetDate,
      genreTags: ['Steam', 'Co-Op'],
      steamUrl: item.steamUrl,
      headerImage: item.headerImage,
      wishlistTier: 'High (50k-100k)',
      collisionRisk: 'Medium',
      releaseStatus: 'upcoming',
      wishlistEstimate: 'Steam Araması',
      description: `${item.title} — Steam aramasından listeye eklendi.`,
      keyMechanics: ['Online Co-Op'],
      pricingEstimate: item.price,
    };

    setCompetitors((prev) => [newComp, ...prev]);
    setJustAddedId(item.id);
    setTimeout(() => setJustAddedId(null), 2500);
  };

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
      console.warn('Steam live search error:', err);
      setLiveSearchError('Steam canlı aramaya şu an ulaşılamadı, aşağıdaki hazır liste gösteriliyor.');
    } finally {
      setIsLiveSearching(false);
    }
  };

  const filteredDiscovery = useMemo(() => {
    return marketDiscoveryDatabase.filter((game) => {
      if (discoveryCategory === 'upcoming') {
        if (game.releaseStatus !== 'upcoming') return false;
      } else if (discoveryCategory === 'friendslop') {
        const isF = game.genreTags.some(
          (t) => t.toLowerCase().includes('friendslop') || t.toLowerCase().includes('physics')
        );
        if (!isF) return false;
      } else if (discoveryCategory === 'voice') {
        const isV = game.genreTags.some(
          (t) => t.toLowerCase().includes('proximity') || t.toLowerCase().includes('voice')
        );
        if (!isV) return false;
      } else if (discoveryCategory === 'horror') {
        if (!game.genreTags.some((t) => t.toLowerCase().includes('horror'))) return false;
      } else if (discoveryCategory === 'shooter') {
        if (
          !game.genreTags.some(
            (t) => t.toLowerCase().includes('shooter') || t.toLowerCase().includes('extraction')
          )
        ) {
          return false;
        }
      } else if (discoveryCategory === 'social') {
        if (
          !game.genreTags.some(
            (t) =>
              t.toLowerCase().includes('social') ||
              t.toLowerCase().includes('funny') ||
              t.toLowerCase().includes('casual')
          )
        ) {
          return false;
        }
      }

      if (discoverySearch.trim()) {
        const q = discoverySearch.toLowerCase();
        return (
          game.title.toLowerCase().includes(q) ||
          game.developer.toLowerCase().includes(q) ||
          game.genreTags.some((t) => t.toLowerCase().includes(q)) ||
          game.mechanics.some((m) => m.toLowerCase().includes(q))
        );
      }

      return true;
    });
  }, [discoveryCategory, discoverySearch]);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const finalSteamUrl =
      newSteamUrl.trim() ||
      `https://store.steampowered.com/search/?term=${encodeURIComponent(newTitle.trim())}`;
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
      wishlistEstimate: 'Takip Aşamasında',
      genreTags: newTags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      keyMechanics: ['Co-Op'],
      description: newDesc.trim() || 'Listeye eklenen rakip oyun.',
      steamUrl: finalSteamUrl,
      headerImage: extractedAppId
        ? `https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/${extractedAppId}/header.jpg`
        : undefined,
    };

    setCompetitors((prev) => [newGame, ...prev]);
    setNewTitle('');
    setNewDev('');
    setNewDesc('');
    setNewSteamUrl('');
    setShowAddModal(false);
  };

  const handleDelete = (id: string) => {
    setCompetitors((prev) => prev.filter((c) => c.id !== id));
  };

  const filtered = competitors.filter((comp) => {
    const { isRisky } = getCollision(comp.releaseDate, comp.wishlistTier);

    if (filterMode === 'upcoming') {
      const isUp =
        comp.releaseStatus === 'upcoming' || (!comp.releaseStatus && comp.releaseDate >= todayStr);
      if (!isUp) return false;
    }
    if (filterMode === 'risk' && !isRisky) return false;
    if (filterMode === 'safe' && isRisky) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        comp.title.toLowerCase().includes(q) ||
        comp.developer.toLowerCase().includes(q) ||
        comp.genreTags.some((t) => t.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const toggleHowTo = () => {
    const next = !showHowTo;
    setShowHowTo(next);
    if (!next) {
      localStorage.setItem('hide_home_howto', 'true');
    } else {
      localStorage.removeItem('hide_home_howto');
    }
  };

  return (
    <div className="tab-pane">
      {/* 1. Plain-Language Onboarding Guide */}
      <div className="howto-card">
        <div className="howto-header">
          <div className="howto-title-wrap">
            <HelpCircle size={16} className="muted-accent-ico" />
            <span>Bu panel nasıl kullanılır?</span>
          </div>
          <button type="button" className="link-quiet-btn" onClick={toggleHowTo}>
            {showHowTo ? 'Gizle' : 'Göster'}
          </button>
        </div>

        {showHowTo && (
          <div className="howto-steps-grid">
            <div className="howto-step">
              <span className="step-num">1</span>
              <div>
                <strong>Ekibini ve Oyununu Kaydet</strong>
                <p>Aşağıdaki kutudan ekip adını, oyunun adını ve hedef çıkış tarihini girip kaydedin. Başka ekipler oluşturmak için sağdaki Ekip Değiştir butonunu kullanın.</p>
              </div>
            </div>
            <div className="howto-step">
              <span className="step-num">2</span>
              <div>
                <strong>Çıkış Tarihini Kontrol Et</strong>
                <p>Aynı hafta çıkan büyük benzer oyunlar varsa sistem uyarı verir. İsterseniz önerilen sakin tarihi tek tıkla seçebilirsiniz.</p>
              </div>
            </div>
            <div className="howto-step">
              <span className="step-num">3</span>
              <div>
                <strong>Listeyi & Tanıtımı Takip Et</strong>
                <p>Üst menüden Yapılacaklar listesini işaretleyin, Tanıtım & Mesajlar kısmından hazır paylaşım metinlerini kopyalayın.</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 2. Team & Game Configuration Card */}
      <form onSubmit={handleSaveTeamBar} className="team-workspace-card">
        <div className="workspace-fields-row">
          <div className="workspace-field">
            <label htmlFor="team-name-input">
              <Users size={13} /> Ekip Adı
            </label>
            <input
              id="team-name-input"
              type="text"
              value={draftTeamName}
              onChange={(e) => setDraftTeamNameOverride(e.target.value)}
              placeholder="Örn: Kaos Ekibi"
              className="clean-input"
            />
          </div>

          <div className="workspace-field">
            <label htmlFor="game-title-input">
              <Gamepad2 size={13} /> Ekibin Oyunu
            </label>
            <input
              id="game-title-input"
              type="text"
              value={draftGameTitle}
              onChange={(e) => setDraftGameTitleOverride(e.target.value)}
              placeholder="Örn: RPS Shoot"
              className="clean-input"
            />
          </div>

          <div className="workspace-field date-field">
            <label htmlFor="target-date-input">
              <Calendar size={13} /> Hedef Çıkış Tarihi
            </label>
            <input
              id="target-date-input"
              type="date"
              value={draftDate}
              onChange={(e) => {
                setDraftDateOverride(e.target.value);
                setTargetDate(e.target.value);
              }}
              className="clean-input"
            />
          </div>

          <div className="workspace-actions">
            <button
              type="submit"
              className={`clean-btn ${hasUnsavedTeamChanges ? 'primary' : 'secondary'}`}
            >
              <Save size={14} />
              <span>{saveFeedback ? 'Kaydedildi' : 'Ekip & Oyunu Kaydet'}</span>
            </button>
            <button type="button" className="clean-btn secondary" onClick={onOpenTeamModal}>
              <Users size={14} />
              <span>Ekip Değiştir / Oluştur</span>
            </button>
          </div>
        </div>

        {/* Quiet Status Line */}
        <div className="workspace-status-strip">
          <div className={`quiet-status-pill ${riskyGames.length > 0 ? 'status-warn' : 'status-ok'}`}>
            {riskyGames.length > 0 ? (
              <>
                <AlertTriangle size={14} />
                <span>
                  Dikkat: Hedef tarihinize yakın ({riskyGames.length}) rakip oyun çıkıyor.
                </span>
              </>
            ) : (
              <>
                <CheckCircle2 size={14} />
                <span>Seçili çıkış tarihi şu an için sakin görünüyor.</span>
              </>
            )}
          </div>

          <div className="quiet-recommender">
            <span>
              Önerilen sakin tarih: <strong>{optimalWindow.bestDate}</strong>
            </span>
            {targetDate !== optimalWindow.bestDate && (
              <button
                type="button"
                className="link-quiet-btn"
                onClick={async () => {
                  setDraftDateOverride(null);
                  await onSaveTeamAndGame({
                    teamName: draftTeamName.trim() || teamName,
                    gameTitle: draftGameTitle.trim() || myGameTitle,
                    targetDate: optimalWindow.bestDate,
                  });
                }}
              >
                Bu tarihi seç
              </button>
            )}
          </div>
        </div>
      </form>

      {/* 3. Toolbar: My Tracked Games vs Find on Steam */}
      <div className="radar-modern-toolbar">
        <div className="segmented-control">
          <button
            type="button"
            className={`seg-btn ${activeRadarTab === 'my-radar' ? 'active' : ''}`}
            onClick={() => setActiveRadarTab('my-radar')}
          >
            <Gamepad2 size={14} />
            <span>Takip Listesi ({competitors.length})</span>
          </button>

          <button
            type="button"
            className={`seg-btn ${activeRadarTab === 'discovery' ? 'active' : ''}`}
            onClick={() => setActiveRadarTab('discovery')}
          >
            <Radio size={14} />
            <span>Steam'den Oyun Bul ({marketDiscoveryDatabase.length})</span>
          </button>
        </div>

        <div className="toolbar-search-box">
          <Search size={15} className="toolbar-search-ico" />
          <input
            type="text"
            placeholder={
              activeRadarTab === 'my-radar'
                ? 'Takip ettiğiniz oyunlarda ara...'
                : 'Steam oyunları içinde ara...'
            }
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
              type="button"
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

        <div className="toolbar-actions">
          {activeRadarTab === 'my-radar' ? (
            <button type="button" className="clean-btn primary" onClick={() => setShowAddModal(true)}>
              <Plus size={14} />
              <span>Yeni Rakip Ekle</span>
            </button>
          ) : (
            <button
              type="button"
              className="clean-btn secondary"
              onClick={() => handleTriggerLiveSteamSearch(discoverySearch || 'co-op')}
              disabled={isLiveSearching}
            >
              {isLiveSearching ? (
                <>
                  <RefreshCw size={13} className="spin" />
                  <span>Aranıyor...</span>
                </>
              ) : (
                <>
                  <Globe size={13} />
                  <span>Steam'de Ara</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* 4. Filter Chips */}
      <div className="filter-chips-bar">
        {activeRadarTab === 'my-radar' ? (
          <>
            <button
              type="button"
              className={`filter-chip ${filterMode === 'all' ? 'active' : ''}`}
              onClick={() => setFilterMode('all')}
            >
              Tümü ({competitors.length})
            </button>
            <button
              type="button"
              className={`filter-chip ${filterMode === 'upcoming' ? 'active' : ''}`}
              onClick={() => setFilterMode('upcoming')}
            >
              Yakında Çıkacaklar ({upcomingInRadar.length})
            </button>
            <button
              type="button"
              className={`filter-chip ${filterMode === 'risk' ? 'active' : ''}`}
              onClick={() => setFilterMode('risk')}
            >
              Çakışanlar ({riskyGames.length})
            </button>
            <button
              type="button"
              className={`filter-chip ${filterMode === 'safe' ? 'active' : ''}`}
              onClick={() => setFilterMode('safe')}
            >
              Uygun Olanlar ({competitors.length - riskyGames.length})
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              className={`filter-chip ${discoveryCategory === 'upcoming' ? 'active' : ''}`}
              onClick={() => setDiscoveryCategory('upcoming')}
            >
              Yakında Çıkacaklar
            </button>
            <button
              type="button"
              className={`filter-chip ${discoveryCategory === 'all' ? 'active' : ''}`}
              onClick={() => setDiscoveryCategory('all')}
            >
              Tümü ({marketDiscoveryDatabase.length})
            </button>
            <button
              type="button"
              className={`filter-chip ${discoveryCategory === 'friendslop' ? 'active' : ''}`}
              onClick={() => setDiscoveryCategory('friendslop')}
            >
              Eşli / Fizik Tabanlı
            </button>
            <button
              type="button"
              className={`filter-chip ${discoveryCategory === 'voice' ? 'active' : ''}`}
              onClick={() => setDiscoveryCategory('voice')}
            >
              Sesli Sohbet
            </button>
            <button
              type="button"
              className={`filter-chip ${discoveryCategory === 'horror' ? 'active' : ''}`}
              onClick={() => setDiscoveryCategory('horror')}
            >
              Co-Op Korku
            </button>
            <button
              type="button"
              className={`filter-chip ${discoveryCategory === 'shooter' ? 'active' : ''}`}
              onClick={() => setDiscoveryCategory('shooter')}
            >
              Eşli Nişancı
            </button>
            <button
              type="button"
              className={`filter-chip ${discoveryCategory === 'social' ? 'active' : ''}`}
              onClick={() => setDiscoveryCategory('social')}
            >
              Sosyal & Parti
            </button>
          </>
        )}
      </div>

      {/* VIEW A: MY RADAR */}
      {activeRadarTab === 'my-radar' && (
        <div className="pro-cards-grid">
          {filtered.map((comp) => {
            const { isRisky, timeText } = getCollision(comp.releaseDate, comp.wishlistTier);
            const headerImg =
              comp.headerImage ||
              (comp.appId
                ? `https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/${comp.appId}/header.jpg`
                : null);
            const isUpcoming =
              comp.releaseStatus === 'upcoming' || (!comp.releaseStatus && comp.releaseDate >= todayStr);

            return (
              <div key={comp.id} className={`calm-game-card ${isRisky ? 'card-warn' : ''}`}>
                <div className="calm-card-top">
                  {headerImg ? (
                    <img
                      src={headerImg}
                      alt={comp.title}
                      className="calm-card-thumb"
                      loading="lazy"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="calm-card-thumb placeholder">
                      <Gamepad2 size={18} />
                    </div>
                  )}

                  <div className="calm-card-heading">
                    <h3 className="pro-card-title">{comp.title}</h3>
                    <span className="pro-card-dev">{comp.developer}</span>
                  </div>
                </div>

                <div className="calm-card-badges">
                  <span className="calm-badge neutral">
                    {comp.releaseStatus === 'released'
                      ? 'Piyasada'
                      : comp.releaseStatus === 'early_access'
                      ? 'Erken Erişim'
                      : isUpcoming
                      ? 'Çıkacak'
                      : 'Piyasada'}
                  </span>
                  <span className={`calm-badge ${isRisky ? 'warn' : 'ok'}`}>
                    {isRisky ? `Çakışma (${timeText})` : `Uygun (${timeText})`}
                  </span>
                </div>

                <p className="pro-card-desc">{comp.description}</p>

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
                    {(comp.id.startsWith('custom-') ||
                      comp.id.startsWith('imported-') ||
                      comp.id.startsWith('steam-')) && (
                      <button
                        type="button"
                        className="pro-btn-icon-del"
                        onClick={() => handleDelete(comp.id)}
                        title="Listeden Çıkar"
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
            <div className="pro-empty-box">Aramanıza uygun oyun bulunamadı.</div>
          )}
        </div>
      )}

      {/* VIEW B: DISCOVERY */}
      {activeRadarTab === 'discovery' && (
        <div className="discovery-container">
          {liveSteamResults.length > 0 && (
            <div className="live-results-section">
              <div className="live-results-header">
                <Globe size={15} />
                <h3>Steam Arama Sonuçları ({liveSteamResults.length})</h3>
                <button
                  type="button"
                  className="link-quiet-btn"
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
                    <div key={item.id} className="calm-game-card">
                      <div className="calm-card-top">
                        <img
                          src={item.headerImage}
                          alt={item.title}
                          className="calm-card-thumb"
                          loading="lazy"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = item.tinyImage;
                          }}
                        />
                        <div className="calm-card-heading">
                          <h3 className="pro-card-title">{item.title}</h3>
                          <span className="pro-card-dev">{item.price}</span>
                        </div>
                      </div>

                      <div className="pro-card-footer">
                        <span className="pro-date-text">App ID: {item.appId}</span>
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
                            type="button"
                            className={`pro-btn-import ${alreadyAdded ? 'imported' : ''}`}
                            onClick={() => handleImportLiveSteamItem(item)}
                            disabled={alreadyAdded}
                          >
                            {alreadyAdded || isJustAdded ? (
                              <>
                                <Check size={12} />
                                <span>Listede</span>
                              </>
                            ) : (
                              <>
                                <Plus size={12} />
                                <span>Takibe Al</span>
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

          <div className="pro-cards-grid">
            {filteredDiscovery.map((game) => {
              const { isRisky, isMediumRisk, timeText } = getCollision(
                game.releaseDate,
                game.wishlistTier
              );
              const alreadyAdded = isGameTracked(game.title, game.appId);
              const isJustAdded = justAddedId === game.id;

              return (
                <div key={game.id} className={`calm-game-card ${isRisky ? 'card-warn' : ''}`}>
                  <div className="calm-card-top">
                    <img
                      src={game.headerImage}
                      alt={game.title}
                      className="calm-card-thumb"
                      loading="lazy"
                    />
                    <div className="calm-card-heading">
                      <h3 className="pro-card-title">{game.title}</h3>
                      <span className="pro-card-dev">{game.developer}</span>
                    </div>
                  </div>

                  <div className="calm-card-badges">
                    <span className="calm-badge neutral">
                      {game.releaseStatus === 'released'
                        ? 'Piyasada'
                        : game.releaseStatus === 'early_access'
                        ? 'Erken Erişim'
                        : 'Çıkacak'}
                    </span>
                    <span
                      className={`calm-badge ${isRisky ? 'warn' : isMediumRisk ? 'medium' : 'ok'}`}
                    >
                      {isRisky
                        ? `Çakışma (${timeText})`
                        : isMediumRisk
                        ? `Yakın (${timeText})`
                        : `Uygun (${timeText})`}
                    </span>
                  </div>

                  <p className="pro-card-desc">{game.threatAnalysis}</p>

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
                        type="button"
                        className={`pro-btn-import ${alreadyAdded ? 'imported' : ''}`}
                        onClick={() => handleImportToRadar(game)}
                        disabled={alreadyAdded}
                      >
                        {alreadyAdded || isJustAdded ? (
                          <>
                            <Check size={12} />
                            <span>Listede</span>
                          </>
                        ) : (
                          <>
                            <Plus size={12} />
                            <span>Takibe Al</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredDiscovery.length === 0 && (
              <div className="pro-empty-box">Arama kriterlerinize uygun oyun bulunamadı.</div>
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
              <button type="button" className="modal-close" onClick={() => setShowAddModal(false)}>
                ×
              </button>
            </div>

            <form onSubmit={handleAdd} className="simple-form">
              <div className="input-group">
                <label>Oyunun Adı *</label>
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
                  <label>Geliştirici / Stüdyo</label>
                  <input
                    type="text"
                    placeholder="Stüdyo Adı"
                    value={newDev}
                    onChange={(e) => setNewDev(e.target.value)}
                  />
                </div>
                <div className="input-group">
                  <label>Çıkış Tarihi *</label>
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
                  <label>Durum</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as GameReleaseStatus)}
                  >
                    <option value="upcoming">Yakında Çıkacak</option>
                    <option value="early_access">Erken Erişim</option>
                    <option value="released">Piyasada</option>
                  </select>
                </div>
                <div className="input-group">
                  <label>Beklenti / Popülerlik</label>
                  <select
                    value={newWishlist}
                    onChange={(e) => setNewWishlist(e.target.value as WishlistTier)}
                  >
                    <option value="Very High (100k+)">Çok Yüksek (100k+)</option>
                    <option value="High (50k-100k)">Yüksek (50k - 100k)</option>
                    <option value="Moderate (10k-50k)">Orta (10k - 50k)</option>
                    <option value="Emerging (<10k)">Yeni / Küçük (&lt;10k)</option>
                  </select>
                </div>
              </div>

              <div className="input-group">
                <label>Etiketler (Virgülle ayırın)</label>
                <input
                  type="text"
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  placeholder="Online Co-Op, Korku"
                />
              </div>

              <div className="input-group">
                <label>Steam Linki (İsteğe Bağlı)</label>
                <input
                  type="url"
                  value={newSteamUrl}
                  onChange={(e) => setNewSteamUrl(e.target.value)}
                  placeholder="https://store.steampowered.com/app/..."
                />
              </div>

              <div className="input-group">
                <label>Kısa Not</label>
                <textarea
                  rows={2}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Oyun hakkında kısa bilgi..."
                />
              </div>

              <div className="modal-btn-row">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setShowAddModal(false)}
                >
                  İptal
                </button>
                <button type="submit" className="action-btn-primary">
                  Listeye Ekle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
