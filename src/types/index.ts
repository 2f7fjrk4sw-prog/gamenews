export type PlatformType = 'Reddit' | 'Discord' | 'TikTok/Shorts' | 'Streamer' | 'Festival' | 'Press';

export type CollisionRisk = 'Low' | 'Medium' | 'High' | 'Critical';

export type WishlistTier = 'Very High (100k+)' | 'High (50k-100k)' | 'Moderate (10k-50k)' | 'Emerging (<10k)';

export interface CompetitorGame {
  id: string;
  title: string;
  developer: string;
  releaseDate: string; // YYYY-MM-DD
  genreTags: string[];
  steamUrl?: string;
  wishlistTier: WishlistTier;
  collisionRisk: CollisionRisk;
  description: string;
  keyMechanics: string[];
  pricingEstimate?: string;
}

export interface MarketingChannel {
  id: string;
  name: string;
  platform: PlatformType;
  category: string;
  url: string;
  audienceSize: string;
  bestTiming: string;
  rulesSummary: string;
  strategyTip: string;
  tags: string[];
}

export interface PitchTemplate {
  id: string;
  title: string;
  category: 'Streamer 4-Pack' | 'Press / News' | 'Reddit Launch' | 'TikTok Hook' | 'Discord Community';
  badge: string;
  subject: string;
  templateBody: string;
  tips: string[];
}

export interface ChecklistItem {
  id: string;
  phase: '6 Ay Önce' | '3 Ay Önce' | '1 Ay Önce' | 'Çıkış Haftası' | 'Çıkış Sonrası';
  task: string;
  description: string;
  isDone: boolean;
  priority: 'Kritik' | 'Önemli' | 'Tavsiye';
  howTo?: {
    steps: string[];
    proTip: string;
    toolsOrLinks?: string;
  };
}

export interface SteamFestivalEvent {
  id: string;
  name: string;
  type: 'Next Fest' | 'Seasonal Sale' | 'Themed Fest';
  startDate: string;
  endDate: string;
  description: string;
  developerAction: string;
  impactLevel: 'Extreme' | 'High' | 'Medium';
}

export type CloudSyncStatus = 'local' | 'connecting' | 'synced' | 'syncing' | 'error';

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatarColor: string;
  passcode?: string;
  emailOrDiscord?: string;
  joinedAt: string;
}

export interface OnlineUserPresence {
  sessionId: string;
  id: string;
  name: string;
  role: string;
  avatarColor: string;
  isMe?: boolean;
}

export interface SyncedProjectState {
  myGameTitle: string;
  targetDate: string;
  competitors: CompetitorGame[];
  checklist: ChecklistItem[];
  teamMembers?: TeamMember[];
  updatedAt: string;
}
