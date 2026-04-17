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

export type SavedProgress = {
  selectedIbCourses: IBCourseSelection[];
  predictedIbScore: number | null;
  satActData: SatActData;
  lastUpdated: number;
};

export type FriendRequest = {
  fromUsername: string;
  fromAvatar: string;
  timestamp: number;
  status: 'pending' | 'accepted' | 'declined';
};

export type FriendProfile = {
  username: string;
  avatarEmoji: string;
  graduationYear: number;
  selectedIbCourses?: IBCourseSelection[];
  predictedIbScore?: number;
  satActSummary?: {
    satScore: number | null;
    actScore: number | null;
  };
};

export type UserProfile = {
  username: string;
  firstName: string;
  lastName: string;
  graduationYear: number;
  avatarEmoji: string;
  pinHash: string;
  friendsList?: string[];
  friendRequests?: FriendRequest[];
  savedProgress?: SavedProgress;
  lastUpdated?: number;
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

export type Friend = {
  username: string;
  avatarEmoji: string;
  status: 'online' | 'active' | 'away' | 'offline';
  location: string;
};
