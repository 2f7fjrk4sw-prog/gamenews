import type { TeamMember } from '../types';

export const initialTeamMembers: TeamMember[] = [
  {
    id: 'member-lead',
    name: 'Proje & Pazarlama Lideri',
    role: 'Pazarlama & Lansman',
    avatarColor: '#58a6ff', // blue
    passcode: 'friendslop',
    emailOrDiscord: '@projelideri',
    joinedAt: '2026-11-01',
  },
  {
    id: 'member-dev',
    name: 'Baş Oyun Geliştirici',
    role: 'Oynanış & Steamworks',
    avatarColor: '#3fb950', // green
    passcode: 'friendslop',
    emailOrDiscord: '@gamedev',
    joinedAt: '2026-11-02',
  },
  {
    id: 'member-community',
    name: 'Topluluk Yöneticisi',
    role: 'TikTok & Discord',
    avatarColor: '#d29922', // orange
    passcode: 'friendslop',
    emailOrDiscord: '@community',
    joinedAt: '2026-11-03',
  },
];
