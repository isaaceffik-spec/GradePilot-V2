export type IBCourseSelection = {
  id: string;
  name: string;
  group: string;
  level: 'HL' | 'SL' | 'Both';
  category: 'languages' | 'sciences' | 'humanities' | 'mathematics' | 'arts' | 'interdisciplinary';
  difficulty: number;
  grade: number;
  benchmark?: number;
};

export type SatAttempt = {
  id: string;
  date: string;
  total: number | null;
  math: number | null;
  english: number | null;
};

export type SatActData = {
  psat: number | null;
  psatMath: number | null;
  psatEnglish: number | null;
  sat: number | null;
  act: number | null;
  satHistory: SatAttempt[];
  activeSatAttemptId: string | null;
};

export type UserProfile = {
  username: string;
  firstName: string;
  lastName: string;
  graduationYear: number;
  avatarId: number;
  pinHash: string;
};

export type DuelStats = {
  wins: number;
  losses: number;
  elo: number;
  streak: number;
};

export type TestCenter = {
  name: string;
  distance: number;
  reliability: number;
  environment: number;
  stress: number;
  label: string;
};

export type SessionData = {
  userId: string;
  status: 'online' | 'active' | 'away' | 'offline';
  lastSeen: number;
};
