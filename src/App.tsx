import React, { useEffect, useMemo, useState } from 'react';
import { generateUsernameFromProfile, normalizeUsername, uniqueUsername } from './lib/username';
import { saveDualStats, saveTestZip } from './lib/storage';
import {
  ibCourseOptions,
  ibGroupAverages,
  ibSubjectGroups,
  globalIBAverage,
  unisIBAverage,
  unisTotalAverage
} from './data/ibData';
import type { DuelStats, IBCourseSelection, SatActData, TestCenter, UserProfile, SessionData, Friend } from './types';

const SAT_AVERAGE = 1029;
const UNIS_SAT = 1370;
const UNIS_MATH = 690;
const UNIS_ENGLISH = 690;
const ACT_AVERAGE = 19.4;
const UNIS_ACT = 31;
const UNIS_ACT_SECTIONS = { Math: 29, Reading: 32, English: 32, Science: 30 };
const SAT_CAP = 1580;
const STRONG_GAIN = 70;
const CONSERVATIVE_GAIN = 35;

const AVATAR_OPTIONS = [
  // Marvel
  { id: 0, name: 'Iron Man', universe: 'Marvel', emoji: '⚡', color: '#d32f2f', bgColor: '#ffebee', icon: 'I' },
  { id: 1, name: 'Captain America', universe: 'Marvel', emoji: '🛡️', color: '#1976d2', bgColor: '#e3f2fd', icon: 'C' },
  { id: 2, name: 'Thor', universe: 'Marvel', emoji: '🔨', color: '#ffa000', bgColor: '#fff8e1', icon: 'T' },
  { id: 3, name: 'Hulk', universe: 'Marvel', emoji: '💪', color: '#388e3c', bgColor: '#e8f5e8', icon: 'H' },
  { id: 4, name: 'Black Widow', universe: 'Marvel', emoji: '🕷️', color: '#212121', bgColor: '#f5f5f5', icon: 'W' },
  { id: 5, name: 'Spider-Man', universe: 'Marvel', emoji: '🕷️', color: '#d32f2f', bgColor: '#ffebee', icon: 'S' },
  { id: 6, name: 'Doctor Strange', universe: 'Marvel', emoji: '🔮', color: '#7b1fa2', bgColor: '#f3e5f5', icon: 'D' },
  { id: 7, name: 'Black Panther', universe: 'Marvel', emoji: '🐆', color: '#212121', bgColor: '#f5f5f5', icon: 'P' },
  { id: 8, name: 'Scarlet Witch', universe: 'Marvel', emoji: '🌀', color: '#c41c3b', bgColor: '#fce4ec', icon: 'W' },
  { id: 9, name: 'Loki', universe: 'Marvel', emoji: '👑', color: '#2196f3', bgColor: '#e1f5fe', icon: 'L' },
  
  // DC
  { id: 10, name: 'Batman', universe: 'DC', emoji: '🦇', color: '#000000', bgColor: '#f5f5f5', icon: 'B' },
  { id: 11, name: 'Superman', universe: 'DC', emoji: '🔴', color: '#002b7f', bgColor: '#e3f2fd', icon: 'S' },
  { id: 12, name: 'Wonder Woman', universe: 'DC', emoji: '👸', color: '#c41e3a', bgColor: '#fce4ec', icon: 'W' },
  { id: 13, name: 'Flash', universe: 'DC', emoji: '⚡', color: '#d32f2f', bgColor: '#ffebee', icon: 'F' },
  { id: 14, name: 'Aquaman', universe: 'DC', emoji: '🌊', color: '#006cb4', bgColor: '#e1f5fe', icon: 'A' },
  { id: 15, name: 'Cyborg', universe: 'DC', emoji: '🤖', color: '#c0c0c0', bgColor: '#fafafa', icon: 'C' },
  { id: 16, name: 'Green Lantern', universe: 'DC', emoji: '💍', color: '#228b22', bgColor: '#e8f5e8', icon: 'G' },
  { id: 17, name: 'Joker', universe: 'DC', emoji: '🤡', color: '#9c27b0', bgColor: '#f3e5f5', icon: 'J' },
  { id: 18, name: 'Harley Quinn', universe: 'DC', emoji: '🎪', color: '#e91e63', bgColor: '#fce4ec', icon: 'H' },
  { id: 19, name: 'Lex Luthor', universe: 'DC', emoji: '🧠', color: '#ffc107', bgColor: '#fff8e1', icon: 'L' },
  { id: 20, name: 'Darkseid', universe: 'DC', emoji: '👹', color: '#212121', bgColor: '#f5f5f5', icon: 'D' },
  { id: 21, name: 'Nightwing', universe: 'DC', emoji: '🌙', color: '#1a1a1a', bgColor: '#f5f5f5', icon: 'N' },
  { id: 22, name: 'Robin', universe: 'DC', emoji: '🦅', color: '#ff6600', bgColor: '#fff3e0', icon: 'R' },
  { id: 23, name: 'Shazam', universe: 'DC', emoji: '⚡', color: '#ffd600', bgColor: '#fffde7', icon: 'S' },
  { id: 24, name: 'Green Arrow', universe: 'DC', emoji: '🏹', color: '#228b22', bgColor: '#e8f5e8', icon: 'G' },
  
  // The Boys
  { id: 25, name: 'Homelander', universe: 'The Boys', emoji: '🦸', color: '#0066cc', bgColor: '#e1f5fe', icon: 'H' },
  { id: 26, name: 'Billy Butcher', universe: 'The Boys', emoji: '🔨', color: '#333333', bgColor: '#f5f5f5', icon: 'B' },
  { id: 27, name: 'Hughie Campbell', universe: 'The Boys', emoji: '😤', color: '#0066cc', bgColor: '#e1f5fe', icon: 'H' },
  { id: 28, name: 'Starlight', universe: 'The Boys', emoji: '⭐', color: '#ffcc00', bgColor: '#fff8e1', icon: 'S' },
  { id: 29, name: 'Queen Maeve', universe: 'The Boys', emoji: '♦️', color: '#9966cc', bgColor: '#f3e5f5', icon: 'M' },
  { id: 30, name: 'A-Train', universe: 'The Boys', emoji: '🚂', color: '#cc0000', bgColor: '#ffebee', icon: 'A' },
  { id: 31, name: 'The Deep', universe: 'The Boys', emoji: '🐠', color: '#0099ff', bgColor: '#e1f5fe', icon: 'D' },
  { id: 32, name: 'Black Noir', universe: 'The Boys', emoji: '🖤', color: '#000000', bgColor: '#f5f5f5', icon: 'N' },
  { id: 33, name: 'Soldier Boy', universe: 'The Boys', emoji: '🪖', color: '#8b4513', bgColor: '#efebe9', icon: 'S' },
  { id: 34, name: 'Kimiko', universe: 'The Boys', emoji: '⚔️', color: '#dc143c', bgColor: '#ffebee', icon: 'K' },
  { id: 35, name: 'Frenchie', universe: 'The Boys', emoji: '🇫🇷', color: '#1e90ff', bgColor: '#e1f5fe', icon: 'F' },
  { id: 36, name: 'Mother\'s Milk', universe: 'The Boys', emoji: '💪', color: '#2f4f4f', bgColor: '#f5f5f5', icon: 'M' },
  { id: 37, name: 'Victoria Neuman', universe: 'The Boys', emoji: '🧠', color: '#8b0000', bgColor: '#ffebee', icon: 'V' },
  { id: 38, name: 'Stan Edgar', universe: 'The Boys', emoji: '💼', color: '#000000', bgColor: '#f5f5f5', icon: 'E' },
  { id: 39, name: 'Ashley Barrett', universe: 'The Boys', emoji: '📱', color: '#ff1493', bgColor: '#fce4ec', icon: 'A' },
  
  // Invincible
  { id: 40, name: 'Invincible', universe: 'Invincible', emoji: '🦸', color: '#ff0000', bgColor: '#ffebee', icon: 'I' },
  { id: 41, name: 'Omni-Man', universe: 'Invincible', emoji: '👨', color: '#ffcc00', bgColor: '#fff8e1', icon: 'O' },
  { id: 42, name: 'Atom Eve', universe: 'Invincible', emoji: '🧪', color: '#ff69b4', bgColor: '#fce4ec', icon: 'A' },
  { id: 43, name: 'Allen the Alien', universe: 'Invincible', emoji: '👽', color: '#00ff00', bgColor: '#e8f5e8', icon: 'A' },
  { id: 44, name: 'Robot', universe: 'Invincible', emoji: '🤖', color: '#696969', bgColor: '#f5f5f5', icon: 'R' },
  { id: 45, name: 'Rex Splode', universe: 'Invincible', emoji: '💥', color: '#ff4500', bgColor: '#ffebee', icon: 'R' },
  { id: 46, name: 'Dupli-Kate', universe: 'Invincible', emoji: '👯', color: '#9370db', bgColor: '#f3e5f5', icon: 'D' },
  { id: 47, name: 'Cecil Stedman', universe: 'Invincible', emoji: '🕵️', color: '#1c1c1c', bgColor: '#f5f5f5', icon: 'C' },
  { id: 48, name: 'The Immortal', universe: 'Invincible', emoji: '♾️', color: '#8b4513', bgColor: '#efebe9', icon: 'I' },
  { id: 49, name: 'Monster Girl', universe: 'Invincible', emoji: '🦖', color: '#ff6347', bgColor: '#ffebee', icon: 'M' },
  { id: 50, name: 'Battle Beast', universe: 'Invincible', emoji: '🦁', color: '#a0522d', bgColor: '#efebe9', icon: 'B' },
  { id: 51, name: 'Angstrom Levy', universe: 'Invincible', emoji: '🌪️', color: '#2f4f4f', bgColor: '#f5f5f5', icon: 'A' },
  { id: 52, name: 'Thragg', universe: 'Invincible', emoji: '👹', color: '#8b0000', bgColor: '#ffebee', icon: 'T' },
  { id: 53, name: 'Conquest', universe: 'Invincible', emoji: '⚔️', color: '#2f4f4f', bgColor: '#f5f5f5', icon: 'C' },
  { id: 54, name: 'Debbie Grayson', universe: 'Invincible', emoji: '👩', color: '#daa520', bgColor: '#fff8e1', icon: 'D' }
];

const testCentersBase: Omit<TestCenter, 'label'>[] = [
  {
    name: 'Hudson Test Center',
    distance: 2.1,
    reliability: 95,
    environment: 88,
    stress: 12
  },
  {
    name: 'Midtown Learning Hall',
    distance: 4.8,
    reliability: 87,
    environment: 78,
    stress: 24
  },
  {
    name: 'Eastside Prep Campus',
    distance: 8.4,
    reliability: 91,
    environment: 82,
    stress: 18
  },
  {
    name: 'Riverview Study Center',
    distance: 12.9,
    reliability: 73,
    environment: 70,
    stress: 32
  }
];

const categoryGroups: Record<string, string[]> = {
  Sciences: ['Group 4'],
  Humanities: ['Group 3'],
  Math: ['Group 5'],
  Languages: ['Group 1', 'Group 2'],
  Arts: ['Group 6']
};

type Section = 'home' | 'ib' | 'sat' | 'act' | 'dual';

type ServerPhase = 'open' | 'lobby' | 'input' | 'compare' | 'reveal';

type DuelCourseRow = {
  id: string;
  course: string;
  grade: string;
};

type ServerPlayer = {
  username: string;
  avatarId: number;
  ready: boolean;
  submitted: boolean;
  lineup: DuelCourseRow[];
  satScore: number | null;
  actScore: number | null;
};

type ServerRoom = {
  id: number;
  name: string;
  players: ServerPlayer[];
  phase: ServerPhase;
};

type DuelSummary = {
  winner: 'player' | 'opponent' | 'tie';
  pointsDelta: number;
  playerTotal: number;
  opponentTotal: number;
};

function pinArrayToString(digits: [string, string, string, string]) {
  return digits.join('');
}

function isValidPin(pin: string) {
  return /^\d{4}$/.test(pin);
}

async function hashPin(pin: string) {
  if (typeof window !== 'undefined' && window.crypto?.subtle) {
    const data = new TextEncoder().encode(pin);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hashBuffer)).map((b) => b.toString(16).padStart(2, '0')).join('');
  }
  return btoa(pin);
}

function usePersistentState<T>(storageKey: string, defaultValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [state, setState] = useState<T>(() => {
    if (typeof window === 'undefined') return defaultValue;
    try {
      const item = localStorage.getItem(storageKey);
      return item ? (JSON.parse(item) as T) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(state));
    } catch {
      // ignore storage failures
    }
  }, [storageKey, state]);

  return [state, setState];
}

function mapIBToUS(average: number) {
  if (average >= 6.95) return 4.0;
  if (average >= 5.95) return 3.9;
  if (average >= 4.95) return 3.3;
  if (average >= 3.95) return 2.7;
  if (average >= 2.95) return 2.0;
  if (average >= 1.95) return 1.0;
  return 0.0;
}

function computePrediction(score: number | null, type: 'sat' | 'act' | 'psat') {
  if (score === null) return { conservative: 0, best: 0 };
  if (type === 'sat') {
    return {
      conservative: Math.min(1600, Math.round(score + 45)),
      best: Math.min(1600, Math.round(score + 110))
    };
  }
  if (type === 'act') {
    return {
      conservative: Math.min(36, Math.round(score + 3)),
      best: Math.min(36, Math.round(score + 6))
    };
  }
  return {
    conservative: Math.min(1600, Math.round(score * 1.03 + 40)),
    best: Math.min(1600, Math.round(score * 1.08 + 70))
  };
}

function simulateSatProgression(start: number, intervals: number, gain: number, cap: number) {
  const points: number[] = [Math.round(start)];
  let current = start;
  for (let i = 1; i <= intervals; i += 1) {
    const next = current + gain * (1 - current / cap);
    current = Math.min(cap, Math.max(current, next));
    points.push(Math.round(current));
    if (current >= cap) break;
  }
  return points;
}

const INITIAL_SERVERS: ServerRoom[] = Array.from({ length: 10 }, (_, index) => ({
  id: index + 1,
  name: `Server ${index + 1}`,
  players: [],
  phase: 'open'
}));

function createEmptyLineup(prefix: string) {
  return [
    { id: `${prefix}1`, course: '', grade: '5' },
    { id: `${prefix}2`, course: '', grade: '5' },
    { id: `${prefix}3`, course: '', grade: '5' }
  ];
}

function styleWidth(value: number, max: number) {
  return `${Math.min(100, Math.max(0, (value / max) * 100))}%`;
}

function gradeMultiplier(grade: number) {
  if (grade >= 6) return 1.08;
  if (grade >= 5) return 1.04;
  if (grade >= 3) return 1.0;
  return 0.92;
}

function App() {
  const [storedProfile, setStoredProfile] = usePersistentState<UserProfile | null>('gradepilot-profile', null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [currentAvatarId, setCurrentAvatarId] = useState<number>(() => Math.floor(Math.random() * AVATAR_OPTIONS.length));
  const [section, setSection] = useState<Section>('home');
  const [ibStep, setIbStep] = useState<'select' | 'dashboard'>('select');
  const [selectedCourses, setSelectedCourses] = usePersistentState<IBCourseSelection[]>('gradepilot-ib-courses', []);
  const [customCourse, setCustomCourse] = usePersistentState('gradepilot-ib-custom', '');
  const [satActData, setSatActData] = usePersistentState<SatActData>('gradepilot-sat-act', {
    psat: null,
    psatMath: null,
    psatEnglish: null,
    sat: null,
    act: null,
    satHistory: [],
    activeSatAttemptId: null
  });
  const [testZip, setTestZip] = usePersistentState('gradepilot-test-zip', '10010');
  const [serverRooms, setServerRooms] = usePersistentState<ServerRoom[]>('gradepilot-servers', INITIAL_SERVERS);
  const [currentServerId, setCurrentServerId] = usePersistentState<number | null>('gradepilot-current-server', null);
  const [dualStats, setDualStats] = usePersistentState<DuelStats>('gradepilot-dual-stats', { wins: 0, losses: 0, elo: 1200, streak: 0 });
  const [playerRows, setPlayerRows] = usePersistentState<DuelCourseRow[]>('gradepilot-dual-player-rows', createEmptyLineup('p'));
  const [playerSat, setPlayerSat] = usePersistentState<number | null>('gradepilot-dual-player-sat', null);
  const [playerAct, setPlayerAct] = usePersistentState<number | null>('gradepilot-dual-player-act', null);
  const [dualSummary, setDualSummary] = useState<DuelSummary | null>(null);
  const [userPresence, setUserPresence] = useState<Record<string, { status: 'online' | 'active' | 'away' | 'offline', lastSeen: number }>>({});
  const [friends, setFriends] = useState<Friend[]>([]);
  const [lastActivity, setLastActivity] = useState(Date.now());
  const [clientSessionId, setClientSessionId] = useState<string>('');
  const [activeSessions, setActiveSessions] = useState<Record<string, SessionData>>({});
  const [serverRefreshKey, setServerRefreshKey] = useState(0);
  const [serverError, setServerError] = useState<string | null>(null);
  const [satHorizonWeeks, setSatHorizonWeeks] = useState(8);
  const [studyWeeks, setStudyWeeks] = useState(0);
  const [studyHours, setStudyHours] = useState('1 to 3 hours');
  const [showOptionalPsat, setShowOptionalPsat] = useState(false);
  const [gradYear, setGradYear] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [usernameSuggestion, setUsernameSuggestion] = useState('');
  const [editedUsername, setEditedUsername] = useState('');
  const [pinDigits, setPinDigits] = useState(['', '', '', ''] as [string, string, string, string]);
  const [confirmPinDigits, setConfirmPinDigits] = useState(['', '', '', ''] as [string, string, string, string]);
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPinDigits, setLoginPinDigits] = useState(['', '', '', ''] as [string, string, string, string]);
  const [authError, setAuthError] = useState<string | null>(null);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [dualSearchQuery, setDualSearchQuery] = useState('');
  const [dualSelectedIds, setDualSelectedIds] = useState<Set<string>>(new Set());
  const [showIbImport, setShowIbImport] = useState(false);
  const dualCourseOptions = useMemo(() => ibCourseOptions.filter((option) => option.id !== 'tok'), []);

  const existingUsernames = useMemo(
    () => serverRooms.flatMap((room) => room.players.map((player) => normalizeUsername(player.username))),
    [serverRooms]
  );

  const suggestedProfileUsername = useMemo(() => {
    const yearNum = Number(gradYear);
    if (!yearNum || !firstName || !lastName) return '';
    return uniqueUsername(generateUsernameFromProfile(yearNum, firstName, lastName), existingUsernames);
  }, [gradYear, firstName, lastName, existingUsernames]);

  useEffect(() => {
    if (!editedUsername || editedUsername === usernameSuggestion) {
      setEditedUsername(suggestedProfileUsername);
    }
    setUsernameSuggestion(suggestedProfileUsername);
  }, [suggestedProfileUsername]);

  useEffect(() => {
    if (storedProfile?.username) {
      setLoginUsername(storedProfile.username);
    }
  }, [storedProfile]);

  useEffect(() => {
    // Track user activity
    const handleActivity = () => setLastActivity(Date.now());
    window.addEventListener('click', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('mousemove', handleActivity);
    
    return () => {
      window.removeEventListener('click', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('mousemove', handleActivity);
    };
  }, []);

  useEffect(() => {
    // Update presence based on activity
    const interval = setInterval(() => {
      const now = Date.now();
      const timeSinceActivity = now - lastActivity;
      
      let status: 'online' | 'active' | 'away' | 'offline' = 'online';
      if (timeSinceActivity > 5 * 60 * 1000) { // 5 minutes
        status = 'away';
      } else if (timeSinceActivity > 30 * 1000) { // 30 seconds
        status = 'active';
      }
      
      setUserPresence(prev => ({
        ...prev,
        [username]: { status, lastSeen: now }
      }));
    }, 10000); // Update every 10 seconds
    
    return () => clearInterval(interval);
  }, [lastActivity, username]);

  useEffect(() => {
    // Automatic server refresh every 3-5 seconds
    const interval = setInterval(() => {
      refreshServers();
    }, 4000); // 4 seconds
    
    return () => clearInterval(interval);
  }, []);

  const selectedIds = useMemo(() => new Set(selectedCourses.map((item) => item.id)), [selectedCourses]);

  function renderAvatar(avatarId: number, size: 'small' | 'medium' | 'large' = 'small') {
    const avatar = AVATAR_OPTIONS[avatarId];
    if (!avatar) return <span>👤</span>;
    
    const sizeMap = {
      small: '1.2rem',
      medium: '1.5rem', 
      large: '2rem'
    };
    
    return (
      <div 
        style={{ 
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: sizeMap[size],
          height: sizeMap[size],
          borderRadius: '50%',
          backgroundColor: avatar.bgColor,
          color: avatar.color,
          fontSize: size === 'small' ? '0.7rem' : size === 'medium' ? '0.8rem' : '1rem',
          fontWeight: 'bold',
          border: '1px solid rgba(0,0,0,0.1)'
        }}
        title={avatar.name}
      >
        {avatar.icon}
      </div>
    );
  }

  function chooseAvatar(id: number) {
    setCurrentAvatarId(id);
  }

  const dualFilteredCourses = useMemo(() => {
    if (!dualSearchQuery.trim()) return dualCourseOptions;
    const query = dualSearchQuery.toLowerCase();
    return dualCourseOptions.filter((option) =>
      option.name.toLowerCase().includes(query) ||
      option.level.toLowerCase().includes(query) ||
      option.category.toLowerCase().includes(query) ||
      option.group.toLowerCase().includes(query)
    );
  }, [dualSearchQuery, dualCourseOptions]);

  const dualSelectedCourses = useMemo(() => {
    return dualCourseOptions.filter((option) => dualSelectedIds.has(option.id)).map((option) => ({
      ...option,
      grade: playerRows.find((row) => row.course === option.id)?.grade || ''
    }));
  }, [dualSelectedIds, dualCourseOptions, playerRows]);

  function handleDualToggleCourse(courseId: string) {
    const newSelectedIds = new Set(dualSelectedIds);
    if (newSelectedIds.has(courseId)) {
      newSelectedIds.delete(courseId);
      // Remove from playerRows
      setPlayerRows(playerRows.filter((row) => row.course !== courseId));
    } else {
      newSelectedIds.add(courseId);
      // Add to playerRows with empty grade
      setPlayerRows([...playerRows, { id: `p-${Date.now()}`, course: courseId, grade: '' }]);
    }
    setDualSelectedIds(newSelectedIds);
  }

  function handleDualGradeChange(courseId: string, grade: string) {
    const next = [...playerRows];
    const index = next.findIndex((row) => row.course === courseId);
    if (index >= 0) {
      next[index] = { ...next[index], grade };
      setPlayerRows(next);
    }
  }

  function importIbCourses() {
    const importedRows = selectedCourses.map((course) => ({
      id: `p-${Date.now()}-${course.id}`,
      course: course.id,
      grade: course.grade.toString()
    }));
    setPlayerRows(importedRows);
    const courseIds = new Set(importedRows.map((row) => row.course));
    setDualSelectedIds(courseIds);
    setShowIbImport(false);
  }

  function getPresenceStatus(username: string) {
    const presence = userPresence[username];
    if (!presence) return { status: 'offline' as const, label: 'Offline' };
    
    const now = Date.now();
    const timeSinceSeen = now - presence.lastSeen;
    
    if (timeSinceSeen < 30 * 1000) return { status: 'online' as const, label: 'Online' };
    if (timeSinceSeen < 5 * 60 * 1000) return { status: 'active' as const, label: 'Active just now' };
    if (timeSinceSeen < 30 * 60 * 1000) return { status: 'away' as const, label: `Active ${Math.floor(timeSinceSeen / (60 * 1000))}m ago` };
    return { status: 'offline' as const, label: 'Offline' };
  }

  function refreshServers() {
    // Simulate refreshing server data by updating the refresh key
    // This will trigger a re-render and update of server states
    setServerRefreshKey(prev => prev + 1);
  }

  async function handleCreateAccount() {
    setAuthError(null);
    const yearNum = Number(gradYear);
    if (!yearNum || yearNum < 2020 || yearNum > 2100) {
      setAuthError('Please enter a valid graduation year.');
      return;
    }
    if (!firstName.trim() || !lastName.trim()) {
      setAuthError('Enter both first name and last name.');
      return;
    }
    const usernameInput = normalizeUsername(editedUsername || suggestedProfileUsername);
    if (!usernameInput) {
      setAuthError('Enter a valid username.');
      return;
    }
    const pin = pinArrayToString(pinDigits);
    const confirmPin = pinArrayToString(confirmPinDigits);
    if (!isValidPin(pin) || !isValidPin(confirmPin)) {
      setAuthError('PIN must be exactly 4 digits.');
      return;
    }
    if (pin !== confirmPin) {
      setAuthError('PIN values do not match.');
      return;
    }
    const uniqueName = uniqueUsername(usernameInput, existingUsernames);
    if (uniqueName !== usernameInput) {
      setAuthError('Username is taken. Regenerate or edit your username.');
      return;
    }
    const pinHash = await hashPin(pin);
    const profile: UserProfile = {
      username: uniqueName,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      graduationYear: yearNum,
      avatarId: currentAvatarId,
      pinHash
    };
    setStoredProfile(profile);
    setUsername(profile.username);
    setCurrentAvatarId(profile.avatarId);
    setIsAuthenticated(true);
  }

  async function handleLogin() {
    setAuthError(null);
    if (!storedProfile) {
      setAuthError('Username not found');
      return;
    }
    const attemptedUsername = normalizeUsername(loginUsername || storedProfile.username);
    if (attemptedUsername !== storedProfile.username) {
      setAuthError('Username not found');
      return;
    }
    const pin = pinArrayToString(loginPinDigits);
    if (!isValidPin(pin)) {
      setAuthError('PIN must be exactly 4 digits.');
      return;
    }
    const pinHash = await hashPin(pin);
    if (pinHash !== storedProfile.pinHash) {
      setAuthError('Incorrect PIN');
      return;
    }
    setUsername(storedProfile.username);
    setCurrentAvatarId(storedProfile.avatarId);
    setIsAuthenticated(true);
  }

  function handleLogout() {
    setIsAuthenticated(false);
    setUsername('');
    setLoginPinDigits(['', '', '', '']);
    setAuthError(null);
  }

  const currentServer = useMemo(() => serverRooms.find((room) => room.id === currentServerId) || null, [serverRooms, currentServerId]);
  const currentPlayer = useMemo(() => currentServer?.players.find((player) => player.username === username) || null, [currentServer, username]);
  const otherPlayers = useMemo(() => (currentServer ? currentServer.players.filter((player) => player.username !== username) : []), [currentServer, username]);
  const activeOpponentPlayer = useMemo(() => {
    const readyOpponent = otherPlayers.find((player) => player.ready && !player.submitted);
    return readyOpponent ?? otherPlayers[0] ?? null;
  }, [otherPlayers]);
  const roomPhase: ServerPhase = currentServer?.phase ?? 'open';

  useEffect(() => {
    const listener = (event: StorageEvent) => {
      if (event.key === 'gradepilot-servers' && event.newValue) {
        try {
          const nextRooms = JSON.parse(event.newValue) as ServerRoom[];
          setServerRooms(nextRooms);
        } catch {
          // ignore invalid storage payloads
        }
      }
    };
    window.addEventListener('storage', listener);
    return () => window.removeEventListener('storage', listener);
  }, [setServerRooms]);

  useEffect(() => {
    if (currentPlayer) {
      setPlayerRows(currentPlayer.lineup);
      setPlayerSat(currentPlayer.satScore);
      setPlayerAct(currentPlayer.actScore);
    }
  }, [currentPlayer, setPlayerAct, setPlayerRows, setPlayerSat]);

  const activeSatAttempt = useMemo(() => {
    return satActData.satHistory.find((attempt) => attempt.id === satActData.activeSatAttemptId) || null;
  }, [satActData.satHistory, satActData.activeSatAttemptId]);

  const activeSatScore = useMemo(() => {
    if (satActData.sat !== null) return satActData.sat;
    return activeSatAttempt?.total ?? null;
  }, [satActData.sat, activeSatAttempt]);

  const activePsatScore = useMemo(() => {
    if (satActData.psat !== null) return satActData.psat;
    const math = satActData.psatMath ?? 0;
    const english = satActData.psatEnglish ?? 0;
    const total = (satActData.psatMath !== null || satActData.psatEnglish !== null) ? math + english : null;
    return total;
  }, [satActData.psat, satActData.psatMath, satActData.psatEnglish]);

  const filteredCourses = useMemo(() => {
    const query = searchQuery.toLowerCase();
    if (!query) return ibCourseOptions;
    return ibCourseOptions.filter((course) => 
      course.name.toLowerCase().includes(query) || 
      course.group.toLowerCase().includes(query) ||
      course.category.toLowerCase().includes(query) ||
      course.level.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const ibAverage = useMemo(() => {
    if (!selectedCourses.length) return 0;
    return selectedCourses.reduce((sum, course) => sum + course.grade, 0) / selectedCourses.length;
  }, [selectedCourses]);

  const ibComparison = useMemo(() => {
    const diff = ibAverage ? ibAverage - globalIBAverage : 0;
    const unisDiff = ibAverage ? ibAverage - unisIBAverage : 0;
    return {
      global: diff,
      unis: unisDiff
    };
  }, [ibAverage]);

  const predictedSat = useMemo(() => computePrediction(activeSatScore, 'sat'), [activeSatScore]);
  const predictedAct = useMemo(() => computePrediction(satActData.act, 'act'), [satActData.act]);
  const predictedPsa = useMemo(() => computePrediction(activePsatScore, 'psat'), [activePsatScore]);

  const satTrendBoost = useMemo(() => {
    const totals = satActData.satHistory
      .map((attempt) => attempt.total)
      .filter((value): value is number => value !== null);
    if (totals.length < 2) return 0;
    return totals[totals.length - 1] > totals[totals.length - 2] ? 5 : 0;
  }, [satActData.satHistory]);

  const strongSatProgression = useMemo(() => {
    if (activeSatScore === null) return [];
    return simulateSatProgression(activeSatScore, satHorizonWeeks / 2, STRONG_GAIN + satTrendBoost, SAT_CAP);
  }, [activeSatScore, satHorizonWeeks, satTrendBoost]);

  const conservativeSatProgression = useMemo(() => {
    if (activeSatScore === null) return [];
    return simulateSatProgression(activeSatScore, satHorizonWeeks / 2, CONSERVATIVE_GAIN + Math.max(0, satTrendBoost - 2), SAT_CAP);
  }, [activeSatScore, satHorizonWeeks, satTrendBoost]);

  const centerOptions: TestCenter[] = useMemo(() => {
    return testCentersBase.map((center) => {
      const score = center.reliability * 0.4 + center.environment * 0.3 + (100 - center.stress) * 0.2 - center.distance * 1.5;
      const label = score > 80 ? 'Best Choice' : score > 70 ? 'Good Option' : score > 55 ? 'Backup' : 'Avoid';
      return { ...center, label };
    });
  }, [testZip]);

  const duelCategories = useMemo(() => {
    const scoreRow = (rows: DuelCourseRow[]) => {
      const totals: Record<string, number[]> = {};
      rows.forEach((row) => {
        const option = ibCourseOptions.find((course) => course.id === row.course);
        if (!option) return;
        const grade = Number(row.grade) || 0;
        Object.entries(categoryGroups).forEach(([category, groups]) => {
          if (groups.includes(option.group)) {
            totals[category] ||= [];
            totals[category].push(grade * gradeMultiplier(grade));
          }
        });
      });
      return Object.entries(totals).map(([category, values]) => ({
        category,
        average: values.length ? values.reduce((sum, item) => sum + item, 0) / values.length : 0
      }));
    };

    return {
      player: scoreRow(playerRows),
      opponent: scoreRow(activeOpponentPlayer?.lineup ?? [])
    };
  }, [playerRows, activeOpponentPlayer]);

  function handleToggleCourse(optionId: string) {
    const existing = selectedCourses.find((item) => item.id === optionId);
    if (existing) {
      setSelectedCourses(selectedCourses.filter((item) => item.id !== optionId));
      return;
    }
    const option = ibCourseOptions.find((item) => item.id === optionId);
    if (!option) return;
    setSelectedCourses([...selectedCourses, { ...option, grade: 5 }]);
  }

  function handleGradeChange(courseId: string, gradeValue: string) {
    const grade = Number(gradeValue);
    if (Number.isNaN(grade) || grade < 1 || grade > 7) return;
    setSelectedCourses(
      selectedCourses.map((item) => (item.id === courseId ? { ...item, grade } : item))
    );
  }

  function handleAddCustomCourse() {
    const trimmed = customCourse.trim();
    if (!trimmed) return;
    const id = `custom-${trimmed.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`;
    setSelectedCourses([
      ...selectedCourses,
      {
        id,
        name: trimmed,
        group: 'Group 6',
        level: 'SL',
        category: 'interdisciplinary',
        difficulty: 1.0,
        grade: 5,
        benchmark: 4.5
      }
    ]);
    setCustomCourse('');
  }

  function updateCombinedPsat(psatMath: number | null, psatEnglish: number | null) {
    const combined = psatMath !== null || psatEnglish !== null ? (psatMath ?? 0) + (psatEnglish ?? 0) : null;
    setSatActData({ ...satActData, psatMath, psatEnglish, psat: combined });
  }

  function clearPsatData() {
    setSatActData({
      ...satActData,
      psat: null,
      psatMath: null,
      psatEnglish: null
    });
  }

  function addSatAttempt() {
    const newAttempt = {
      id: `sat-${Date.now()}`,
      date: '',
      total: null,
      math: null,
      english: null
    };
    setSatActData({
      ...satActData,
      satHistory: [...satActData.satHistory, newAttempt],
      activeSatAttemptId: newAttempt.id,
      sat: null
    });
  }

  function updateSatAttempt(id: string, field: 'date' | 'total' | 'math' | 'english', value: string) {
    const updatedHistory = satActData.satHistory.map((attempt) =>
      attempt.id === id
        ? {
            ...attempt,
            [field]: value === '' ? null : field === 'date' ? value : Number(value)
          }
        : attempt
    );

    const activeAttempt = updatedHistory.find((attempt) => attempt.id === satActData.activeSatAttemptId);
    setSatActData({
      ...satActData,
      satHistory: updatedHistory,
      sat: activeAttempt ? activeAttempt.total : satActData.sat
    });
  }

  function setActiveSatAttempt(id: string) {
    const attempt = satActData.satHistory.find((item) => item.id === id);
    setSatActData({
      ...satActData,
      activeSatAttemptId: id,
      sat: attempt?.total ?? satActData.sat
    });
  }

  function removeSatAttempt(id: string) {
    setSatActData({
      ...satActData,
      satHistory: satActData.satHistory.filter((attempt) => attempt.id !== id),
      activeSatAttemptId: satActData.activeSatAttemptId === id ? null : satActData.activeSatAttemptId,
      sat: satActData.activeSatAttemptId === id ? null : satActData.sat
    });
  }

  function buildCenterLabel(center: TestCenter) {
    return `${center.name} • ${center.label}`;
  }

  function updateServerRoom(updated: ServerRoom) {
    setServerRooms((rooms) => rooms.map((room) => (room.id === updated.id ? updated : room)));
  }

  function joinServer(serverId: number) {
    if (currentServerId === serverId) return;
    if (currentServerId) {
      leaveServer();
    }
    const room = serverRooms.find((item) => item.id === serverId);
    if (!room) return;
    
    // Check if server is full
    if (room.players.length >= 2) {
      setServerError('Server is full, please refresh');
      return;
    }
    
    const existingPlayer = room.players.find((player) => player.username === username);
    const nextPlayers = existingPlayer
      ? room.players
      : [
          ...room.players,
          {
            username,
            avatarId: currentAvatarId,
            ready: false,
            submitted: false,
            lineup: createEmptyLineup('p'),
            satScore: playerSat,
            actScore: playerAct
          }
        ];
    updateServerRoom({ ...room, players: nextPlayers, phase: room.phase === 'reveal' ? 'open' : room.phase });
    setCurrentServerId(serverId);
    setServerError(null); // Clear any previous error
  }

  function leaveServer() {
    if (!currentServerId) return;
    setServerRooms((rooms) =>
      rooms.map((room) =>
        room.id === currentServerId
          ? { ...room, players: room.players.filter((player) => player.username !== username) }
          : room
      )
    );
    setCurrentServerId(null);
    setPlayerRows(createEmptyLineup('p'));
    setPlayerSat(null);
    setPlayerAct(null);
    setDualSummary(null);
  }

  function updateMyServerProfile(data: Partial<ServerPlayer>) {
    if (!currentServer) return;
    setServerRooms((rooms) =>
      rooms.map((room) => {
        if (room.id !== currentServerId) return room;
        return {
          ...room,
          players: room.players.map((player) =>
            player.username === username ? { ...player, ...data } : player
          )
        };
      })
    );
  }

  function toggleReady() {
    if (!currentPlayer) return;
    updateMyServerProfile({ ready: !currentPlayer.ready });
  }

  function beginMatch() {
    if (!currentServer || !currentPlayer || !activeOpponentPlayer) return;
    if (!currentPlayer.ready || !activeOpponentPlayer.ready) return;
    if (currentServer.phase !== 'open') return;
    updateServerRoom({ ...currentServer, phase: 'input' });
  }

  function submitLineup() {
    if (!currentPlayer || !currentServer) return;
    updateMyServerProfile({
      submitted: true,
      lineup: playerRows,
      satScore: playerSat,
      actScore: playerAct
    });
  }

  useEffect(() => {
    if (!currentServer || currentServer.phase !== 'input' || !currentPlayer || !activeOpponentPlayer) return;
    if (currentPlayer.submitted && activeOpponentPlayer.submitted) {
      updateServerRoom({ ...currentServer, phase: 'compare' });
    }
  }, [currentServer, currentPlayer, activeOpponentPlayer]);

  function revealDuel() {
    if (!currentPlayer || !activeOpponentPlayer || !currentServer) return;
    const playerTotal = duelCategories.player.reduce((sum, row) => sum + row.average, 0);
    const opponentTotal = duelCategories.opponent.reduce((sum, row) => sum + row.average, 0);
    const winner = playerTotal >= opponentTotal ? 'player' : 'opponent';
    const delta = Math.round(Math.abs(playerTotal - opponentTotal) * 10);
    setDualSummary({ winner, pointsDelta: delta, playerTotal, opponentTotal });
    const updated: DuelStats = { ...dualStats };

    if (winner === 'player') {
      updated.wins += 1;
      updated.streak += 1;
      updated.elo += 20 + updated.streak * 5;
    } else {
      updated.losses += 1;
      updated.streak = 0;
    }
    if (updated.elo < 1000) updated.elo = 1000;
    setDualStats(updated);
    saveDualStats(updated);
    updateServerRoom({ ...currentServer, phase: 'reveal' });
  }

  function handleResetIB() {
    setSelectedCourses([]);
    setIbStep('select');
  }

  const profileAvatar = AVATAR_OPTIONS[currentAvatarId] ?? AVATAR_OPTIONS[0];
  const centerLabel = `Nearby test centers for ${testZip}`;

  if (!isAuthenticated) {
    const previewAvatar = storedProfile ? AVATAR_OPTIONS[storedProfile.avatarId] : profileAvatar;
    const authMode = storedProfile ? 'login' : 'onboarding';

    return (
      <div className="container">
        <div className="top-bar">
          <div className="brand">
            <h1>Gradepilot</h1>
            <div className="subtle">Fast login, fun avatar, and secure 4-digit PIN.</div>
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div className="pill" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.35rem' }}>{renderAvatar(previewAvatar.id, 'medium')}</span>
              <span>{previewAvatar.name}</span>
            </div>
          </div>
        </div>
        <div className="card" style={{ maxWidth: '520px', margin: '2rem auto' }}>
          <h2>{authMode === 'onboarding' ? 'Create Your Account' : 'Welcome back'}</h2>
          <p className="subtle">
            {authMode === 'onboarding'
              ? 'Choose a graduation year, enter your name, and claim a fun username with a quick PIN.'
              : 'Enter your 4-digit PIN to access your Gradepilot profile.'}
          </p>
          {authMode === 'onboarding' ? (
            <>
              <div style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
                <div style={{ display: 'grid', gap: '0.75rem' }}>
                  <strong>Avatar</strong>
                  <div className="subject-item" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ fontSize: '2rem' }}>{renderAvatar(previewAvatar.id, 'large')}</span>
                    <span>{previewAvatar.name}</span>
                    <button type="button" onClick={() => setCurrentAvatarId((value) => (value + 1) % AVATAR_OPTIONS.length)}>
                      Randomize
                    </button>
                    <button type="button" onClick={() => setShowAvatarPicker((visible) => !visible)}>
                      Choose avatar
                    </button>
                  </div>
                </div>
                {showAvatarPicker && (
                  <div style={{ marginTop: '1rem' }}>
                    {['Marvel', 'DC', 'The Boys', 'Invincible'].map((universe) => {
                      const universeAvatars = AVATAR_OPTIONS.filter((a) => a.universe === universe);
                      return (
                        <div key={universe} style={{ marginBottom: '2rem' }}>
                          <div style={{ fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.7 }}>
                            {universe}
                          </div>
                          <div className="subject-grid" style={{ gridTemplateColumns: 'repeat(5, minmax(0, 1fr))' }}>
                            {universeAvatars.map((avatar) => (
                              <button
                                key={avatar.id}
                                type="button"
                                className={`subject-item ${avatar.id === currentAvatarId ? 'active' : ''}`}
                                onClick={() => chooseAvatar(avatar.id)}
                                style={{ fontSize: '1.2rem', padding: '1rem', textAlign: 'center', borderRadius: '0.5rem', border: avatar.id === currentAvatarId ? '2px solid #4ade80' : '1px solid #ddd', background: avatar.id === currentAvatarId ? '#f0fdf4' : '#fff', cursor: 'pointer', transition: 'all 0.2s' }}
                              >
                                <div style={{ fontSize: '2rem', marginBottom: '0.4rem' }}>{renderAvatar(avatar.id, 'large')}</div>
                                <div style={{ fontSize: '0.65rem', fontWeight: '500', lineHeight: 1.2 }}>{avatar.name}</div>
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                <label>
                  Graduation year
                  <input type="number" min={2020} max={2100} value={gradYear} onChange={(event) => setGradYear(event.target.value)} placeholder="2027" />
                </label>
                <label>
                  First name
                  <input value={firstName} onChange={(event) => setFirstName(event.target.value)} placeholder="Isaac" />
                </label>
                <label>
                  Last name
                  <input value={lastName} onChange={(event) => setLastName(event.target.value)} placeholder="Effik" />
                </label>
                <label>
                  Suggested username
                  <div className="mini-row" style={{ alignItems: 'center', gap: '0.75rem' }}>
                    <input
                      value={editedUsername}
                      onChange={(event) => setEditedUsername(normalizeUsername(event.target.value))}
                      placeholder={usernameSuggestion || '27ieffik'}
                      style={{ flex: 1 }}
                    />
                    <button type="button" onClick={() => setEditedUsername(suggestedProfileUsername)}>
                      Regenerate
                    </button>
                  </div>
                </label>
              </div>
              <div style={{ marginTop: '1rem' }}>
                <strong>Create a 4-digit PIN</strong>
                <div className="mini-row" style={{ gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.75rem' }}>
                  {pinDigits.map((digit, index) => (
                    <input
                      key={`pin-${index}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(event) => {
                        const value = event.target.value.replace(/[^0-9]/g, '');
                        const next = [...pinDigits] as [string, string, string, string];
                        next[index] = value;
                        setPinDigits(next);
                      }}
                      style={{ width: '3rem', textAlign: 'center' }}
                    />
                  ))}
                </div>
                <div className="mini-row" style={{ gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.75rem' }}>
                  {confirmPinDigits.map((digit, index) => (
                    <input
                      key={`confirm-pin-${index}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(event) => {
                        const value = event.target.value.replace(/[^0-9]/g, '');
                        const next = [...confirmPinDigits] as [string, string, string, string];
                        next[index] = value;
                        setConfirmPinDigits(next);
                      }}
                      style={{ width: '3rem', textAlign: 'center' }}
                    />
                  ))}
                </div>
              </div>
              <div className="info-box" style={{ marginTop: '1rem' }}>
                <p>Your username and avatar will stay saved locally. Reopen the app and sign in quickly with your PIN.</p>
              </div>
              {authError && <div className="info-box" style={{ marginTop: '1rem', color: '#ff8b8b' }}>{authError}</div>}
              <button type="button" onClick={handleCreateAccount} style={{ marginTop: '1rem' }}>
                Create account
              </button>
            </>
          ) : (
            <>
              <div style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
                <div className="subject-item" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span style={{ fontSize: '2rem' }}>{renderAvatar(previewAvatar.id, 'large')}</span>
                  <div>
                    <div>{storedProfile?.firstName} {storedProfile?.lastName}</div>
                    <div className="subtle">{storedProfile?.username}</div>
                  </div>
                </div>
                <label>
                  Username
                  <input value={loginUsername} onChange={(event) => setLoginUsername(event.target.value)} placeholder="Your username" />
                </label>
                <div>
                  <strong>Enter PIN</strong>
                  <div className="mini-row" style={{ gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.75rem' }}>
                    {loginPinDigits.map((digit, index) => (
                      <input
                        key={`login-pin-${index}`}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(event) => {
                          const value = event.target.value.replace(/[^0-9]/g, '');
                          const next = [...loginPinDigits] as [string, string, string, string];
                          next[index] = value;
                          setLoginPinDigits(next);
                        }}
                        style={{ width: '3rem', textAlign: 'center' }}
                      />
                    ))}
                  </div>
                </div>
                {authError && <div className="info-box" style={{ marginTop: '1rem', color: '#ff8b8b' }}>{authError}</div>}
              </div>
              <button type="button" onClick={handleLogin} style={{ marginTop: '1rem' }}>
                Unlock profile
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="top-bar">
        <div className="brand">
          <h1>Gradepilot</h1>
          <div className="subtle">Student performance platform for IB, SAT, ACT, and DUAL.</div>
        </div>
        <div style={{ display: 'grid', gap: '0.8rem', justifyItems: 'end' }}>
          <div className="pill" style={{ display: 'grid', gap: '0.4rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span style={{ fontSize: '1.4rem' }}>{renderAvatar(profileAvatar.id, 'medium')}</span>
              <strong>{username}</strong>
            </div>
            <span className="subtle">Logged in as {storedProfile?.firstName} {storedProfile?.lastName}</span>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            <button type="button" onClick={() => setShowAvatarPicker((visible) => !visible)}>
              Change avatar
            </button>
            <button type="button" onClick={handleLogout}>Logout</button>
          </div>
          <div className="stats-row" style={{ width: '100%', maxWidth: '420px' }}>
            <div className="metric"><strong>🥖 {dualStats.wins}</strong> Wins</div>
            <div className="metric"><strong>🍞 {dualStats.losses}</strong> Losses</div>
            <div className="metric"><strong>{dualStats.elo}</strong> Elo</div>
          </div>
        </div>
      </div>
      {showAvatarPicker && (
        <div className="card" style={{ margin: '1rem 0' }}>
          <h2>Choose your avatar</h2>
          {['Marvel', 'DC', 'The Boys', 'Invincible'].map((universe) => {
            const universeAvatars = AVATAR_OPTIONS.filter((a) => a.universe === universe);
            return (
              <div key={universe} style={{ marginBottom: '2rem' }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.7 }}>
                  {universe}
                </div>
                <div className="subject-grid" style={{ gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', gap: '0.75rem' }}>
                  {universeAvatars.map((avatar) => (
                    <button
                      key={avatar.id}
                      type="button"
                      className={`subject-item ${avatar.id === currentAvatarId ? 'active' : ''}`}
                      onClick={() => chooseAvatar(avatar.id)}
                      style={{ fontSize: '1.2rem', padding: '1rem', textAlign: 'center', borderRadius: '0.5rem', border: avatar.id === currentAvatarId ? '2px solid #4ade80' : '1px solid #ddd', background: avatar.id === currentAvatarId ? '#f0fdf4' : '#fff', cursor: 'pointer', transition: 'all 0.2s' }}
                    >
                      <div style={{ fontSize: '2rem', marginBottom: '0.4rem' }}>{renderAvatar(avatar.id, 'large')}</div>
                      <div style={{ fontSize: '0.65rem', fontWeight: '500', lineHeight: 1.2 }}>{avatar.name}</div>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="section-nav">
        {(['home', 'ib', 'sat', 'act', 'dual'] as Section[]).map((key) => (
          <button
            key={key}
            className={section === key ? 'active' : ''}
            onClick={() => setSection(key)}
          >
            {key.toUpperCase()}
          </button>
        ))}
      </div>

      {section === 'home' && (
        <>
          <div className="card-grid">
            <div className="card">
              <h2>IB / GPA</h2>
              <p className="subtle">Track subjects, calculate IB average, and compare against global and UNIS benchmarks.</p>
              <button type="button" onClick={() => { setSection('ib'); setIbStep('select'); }}>Open IB dashboard</button>
            </div>
            <div className="card">
              <h2>SAT</h2>
              <p className="subtle">Enter PSAT / SAT scores, view conservative and best-case predictions, and benchmark progress.</p>
              <button type="button" onClick={() => setSection('sat')}>Plan SAT</button>
            </div>
            <div className="card">
              <h2>ACT</h2>
              <p className="subtle">Log ACT performance and compare with global and UNIS section averages.</p>
              <button type="button" onClick={() => setSection('act')}>Plan ACT</button>
            </div>
            <div className="card">
              <h2>DUAL</h2>
              <p className="subtle">Compete in 1v1 IB-style matchups and grow your win streak, bread, and Elo score.</p>
              <button type="button" onClick={() => setSection('dual')}>Enter DUAL</button>
            </div>
          </div>

          <div className="grid-2" style={{ marginTop: '1.5rem' }}>
            <div className="card">
              <h2>Quick metrics</h2>
              <div className="stats-row">
                <div className="metric"><strong>{selectedCourses.length}</strong> IB courses</div>
                <div className="metric"><strong>{activeSatScore ?? '-'}</strong> SAT</div>
                <div className="metric"><strong>{satActData.act ?? '-'}</strong> ACT</div>
              </div>
              <div className="info-box">
                <strong>Benchmark summary</strong>
                <p>Global IB average: {globalIBAverage.toFixed(2)} • UNIS IB: {unisIBAverage.toFixed(2)} • SAT: {SAT_AVERAGE} • ACT: {ACT_AVERAGE}</p>
              </div>
            </div>
            <div className="card">
              <h2>DUAL readiness</h2>
              <p className="subtle">Friend search, pending requests, and match setup are available in the DUAL tab.</p>
              <div className="info-box">
                <p>Use your generated username as your identity. No passwords, no accounts, just a persistent local profile.</p>
              </div>
            </div>
          </div>

          <div className="footer-note">
            Benchmark source: November 2024 IB Statistical Bulletin and UNIS published averages. Data updates when latest IB releases are available.
          </div>
        </>
      )}

      {section === 'ib' && (
        <>
          {ibStep === 'select' ? (
            <>
              <div className="grid-2">
                <div className="card">
                  <h2>Step 1: choose IB subjects</h2>
                  <p className="subtle">Search or browse courses by subject group, level, and category. Tap to select.</p>
                  <div style={{ marginTop: '1rem', marginBottom: '1rem' }}>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(event) => setSearchQuery(event.target.value)}
                      placeholder="Search courses (e.g., Biology, HL, Language ab initio)"
                      style={{ width: '100%' }}
                    />
                  </div>
                  {searchQuery.length > 0 ? (
                    <div>
                      <h3>Search results ({filteredCourses.length})</h3>
                      <div className="subject-grid">
                        {filteredCourses.map((option) => (
                          <div
                            key={option.id}
                            className={`subject-item ${selectedIds.has(option.id) ? 'active' : ''}`}
                            onClick={() => handleToggleCourse(option.id)}
                          >
                            <strong>{option.name}</strong>
                            <small>{option.level} • {option.category}</small>
                            <small style={{ marginTop: '0.25rem' }}>Benchmark {option.benchmark.toFixed(1)}</small>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div>
                      {ibSubjectGroups.map((group) => {
                        const groupCourses = ibCourseOptions.filter((option) => option.group === group.key);
                        return (
                          <div key={group.key} className="subject-group">
                            <h3>{group.label}</h3>
                            <div className="subject-grid">
                              {groupCourses.map((option) => (
                                <div
                                  key={option.id}
                                  className={`subject-item ${selectedIds.has(option.id) ? 'active' : ''}`}
                                  onClick={() => handleToggleCourse(option.id)}
                                >
                                  <strong>{option.name}</strong>
                                  <small>{option.level} • {option.category}</small>
                                  <small style={{ marginTop: '0.25rem' }}>Benchmark {option.benchmark.toFixed(1)}</small>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
                <div className="card">
                  <h2>Selected courses</h2>
                  {selectedCourses.length ? (
                    <div style={{ display: 'grid', gap: '0.85rem' }}>
                      {selectedCourses.map((course) => (
                        <div key={course.id} className="subject-item active" style={{ cursor: 'default' }}>
                          <div className="mini-row" style={{ justifyContent: 'space-between' }}>
                            <div style={{ flex: 1 }}>
                              <strong>{course.name}</strong>
                              <small style={{ display: 'block', marginTop: '0.25rem' }}>{course.level} • {course.category}</small>
                            </div>
                            <input
                              type="number"
                              min={1}
                              max={7}
                              value={course.grade}
                              onChange={(event) => handleGradeChange(course.id, event.target.value)}
                              style={{ width: '4rem' }}
                            />
                          </div>
                          <small>Group: {course.group}</small>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="subtle">No subjects selected yet. Select at least one course to see GPA insights.</p>
                  )}
                  <div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <button type="button" onClick={() => setIbStep('dashboard')} disabled={!selectedCourses.length}>Continue</button>
                    <button type="button" onClick={handleResetIB} style={{ background: 'rgba(255,255,255,0.08)', color: 'var(--text)' }}>Reset</button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="grid-2">
                <div className="card">
                  <h2>IB GPA Dashboard</h2>
                  <div className="stats-row">
                    <div className="metric"><strong>{ibAverage.toFixed(2)}</strong> IB GPA</div>
                    <div className="metric"><strong>{mapIBToUS(ibAverage).toFixed(2)}</strong> US GPA</div>
                    <div className="metric"><strong>{selectedCourses.length}</strong> Courses</div>
                  </div>
                  <div className="info-box">
                    <strong>Comparison</strong>
                    <p>Global IB average difference: {ibComparison.global >= 0 ? '+' : ''}{ibComparison.global.toFixed(2)}.</p>
                    <p>UNIS benchmark: {ibComparison.unis >= 0 ? '+' : ''}{ibComparison.unis.toFixed(2)} relative to UNIS average of {unisIBAverage.toFixed(2)}.</p>
                  </div>
                </div>
                <div className="card">
                  <h2>GPA snapshot</h2>
                  <p className="subtle">Your IB average scales into a US GPA estimate and compares with UNIS and worldwide performance.</p>
                  <div className="info-box">
                    <strong>Scale</strong>
                    <p>7 = 4.0 / 6 = 3.9 / 5 = 3.3 / 4 = 2.7 / 3 = 2.0.</p>
                    <p>The system uses official IB averages and the most recent UNIS published statistics.</p>
                  </div>
                </div>
              </div>
              <div className="card" style={{ marginTop: '1rem' }}>
                <h2>Course tracker</h2>
                <div style={{ display: 'grid', gap: '1rem' }}>
                  {selectedCourses.map((course) => {
                    const benchmark = course.benchmark ?? ibGroupAverages[course.group] ?? globalIBAverage;
                    return (
                      <div key={course.id}>
                        <div className="mini-row" style={{ justifyContent: 'space-between' }}>
                          <strong>{course.name}</strong>
                          <span>{course.grade}/7 vs {benchmark.toFixed(1)}/7</span>
                        </div>
                        <div className="scale-track">
                          <div className="scale-knob" style={{ left: styleWidth(course.grade, 7) }} />
                          <div className="scale-knob" style={{ left: styleWidth(benchmark, 7), background: 'rgba(255,255,255,0.65)' }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <button type="button" style={{ marginTop: '1rem' }} onClick={() => setIbStep('select')}>Back to subject selection</button>
            </>
          )}
        </>
      )}

      {section === 'sat' && (
        <div className="grid-2">
          <div className="card">
            <h2>SAT history & input</h2>
            <p className="subtle">Add multiple SAT attempts and pick an active score. PSAT is optional and only used as a supplemental signal.</p>
            <div className="mini-row" style={{ marginTop: '1rem', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button type="button" onClick={addSatAttempt}>+ Add SAT attempt</button>
              <button
                type="button"
                onClick={() => setShowOptionalPsat((value) => !value)}
                style={{ background: 'rgba(255,255,255,0.08)', color: 'var(--text)' }}
              >
                {showOptionalPsat ? 'Hide optional PSAT' : 'Add optional PSAT data'}
              </button>
            </div>
            <div className="pill" style={{ padding: '0.65rem 1rem', marginTop: '0.75rem' }}>
              Active attempt: {activeSatAttempt ? (activeSatAttempt.date || `Total ${activeSatAttempt.total ?? '—'}`) : 'None selected'}
            </div>
            {satActData.satHistory.length ? (
              <div style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
                {satActData.satHistory.map((attempt) => (
                  <div key={attempt.id} className="subject-item" style={{ padding: '1rem' }}>
                    <div className="mini-row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <strong>{attempt.date || 'New attempt'}</strong>
                        <small style={{ display: 'block', marginTop: '0.35rem' }}>
                          Total {attempt.total ?? '—'} • Math {attempt.math ?? '—'} • English {attempt.english ?? '—'}
                        </small>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <button
                          type="button"
                          onClick={() => setActiveSatAttempt(attempt.id)}
                          style={satActData.activeSatAttemptId === attempt.id ? { background: 'var(--accent-strong)' } : undefined}
                        >
                          {satActData.activeSatAttemptId === attempt.id ? 'Active' : 'Use'}
                        </button>
                        <button
                          type="button"
                          onClick={() => removeSatAttempt(attempt.id)}
                          style={{ background: 'rgba(255,255,255,0.08)', color: 'var(--text)' }}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                    <div className="mini-row" style={{ gap: '0.75rem', flexWrap: 'wrap', marginTop: '0.9rem' }}>
                      <input
                        type="date"
                        value={attempt.date}
                        onChange={(event) => updateSatAttempt(attempt.id, 'date', event.target.value)}
                        style={{ minWidth: '170px' }}
                      />
                      <input
                        type="number"
                        min={400}
                        max={1600}
                        value={attempt.total ?? ''}
                        onChange={(event) => updateSatAttempt(attempt.id, 'total', event.target.value)}
                        placeholder="Total SAT"
                        style={{ width: '10rem' }}
                      />
                    </div>
                    <div className="mini-row" style={{ gap: '0.75rem', flexWrap: 'wrap', marginTop: '0.75rem' }}>
                      <input
                        type="number"
                        min={200}
                        max={800}
                        value={attempt.math ?? ''}
                        onChange={(event) => updateSatAttempt(attempt.id, 'math', event.target.value)}
                        placeholder="Math"
                        style={{ width: '10rem' }}
                      />
                      <input
                        type="number"
                        min={200}
                        max={800}
                        value={attempt.english ?? ''}
                        onChange={(event) => updateSatAttempt(attempt.id, 'english', event.target.value)}
                        placeholder="English"
                        style={{ width: '10rem' }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="subtle" style={{ marginTop: '1rem' }}>No SAT attempts yet. Add one to build your score history.</p>
            )}
            {showOptionalPsat && (
              <div className="card" style={{ marginTop: '1.25rem', padding: '1rem' }}>
                <h3>Optional PSAT data</h3>
                <p className="subtle">PSAT is supplemental only. Use it to enhance the model, but it is not required.</p>
                <div className="mini-row" style={{ marginTop: '1rem', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <label style={{ width: '100%', maxWidth: '240px' }}>
                    PSAT Math
                    <input
                      type="number"
                      min={8}
                      max={760}
                      value={satActData.psatMath ?? ''}
                      onChange={(event) => updateCombinedPsat(event.target.value ? Number(event.target.value) : null, satActData.psatEnglish)}
                      placeholder="Math score"
                    />
                  </label>
                  <label style={{ width: '100%', maxWidth: '240px' }}>
                    PSAT English
                    <input
                      type="number"
                      min={8}
                      max={760}
                      value={satActData.psatEnglish ?? ''}
                      onChange={(event) => updateCombinedPsat(satActData.psatMath, event.target.value ? Number(event.target.value) : null)}
                      placeholder="English score"
                    />
                  </label>
                </div>
                <div className="mini-row" style={{ marginTop: '1rem', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <button type="button" onClick={clearPsatData} style={{ background: 'rgba(255,255,255,0.08)', color: 'var(--text)' }}>
                    Clear PSAT data
                  </button>
                </div>
                <div className="info-box" style={{ marginTop: '1rem' }}>
                  <p>PSAT is optional and separate from the SAT attempts above. The SAT forecast works fully without it.</p>
                </div>
              </div>
            )}
          </div>
          <div className="card">
            <h2>SAT forecast</h2>
            <div className="bar-graph">
              <div className="bar-row">
                <span>Your score</span>
                <div>
                  <div className="bar-track"><div className="bar-fill user" style={{ width: styleWidth(activeSatScore ?? 0, 1600) }} /></div>
                  <div className="bar-label">{activeSatScore ?? '-'} / 1600</div>
                </div>
              </div>
              <div className="bar-row">
                <span>Conservative</span>
                <div>
                  <div className="bar-track"><div className="bar-fill predicted" style={{ width: styleWidth(predictedSat.conservative, 1600) }} /></div>
                  <div className="bar-label">{predictedSat.conservative} projected</div>
                </div>
              </div>
              <div className="bar-row">
                <span>Best case</span>
                <div>
                  <div className="bar-track"><div className="bar-fill predicted" style={{ width: styleWidth(predictedSat.best, 1600) }} /></div>
                  <div className="bar-label">{predictedSat.best} projected</div>
                </div>
              </div>
              <div className="bar-row">
                <span>Global average</span>
                <div>
                  <div className="bar-track"><div className="bar-fill" style={{ width: styleWidth(SAT_AVERAGE, 1600), background: 'rgba(255,182,74,0.9)' }} /></div>
                  <div className="bar-label">{SAT_AVERAGE}</div>
                </div>
              </div>
              <div className="bar-row">
                <span>UNIS average</span>
                <div>
                  <div className="bar-track"><div className="bar-fill" style={{ width: styleWidth(UNIS_SAT, 1600), background: 'rgba(99,218,141,0.9)' }} /></div>
                  <div className="bar-label">{UNIS_SAT}</div>
                </div>
              </div>
              <div className="bar-row">
                <span>UNIS Math / English</span>
                <div>
                  <div className="bar-track"><div className="bar-fill" style={{ width: styleWidth(UNIS_MATH, 1600), background: 'rgba(80,199,255,0.9)' }} /></div>
                  <div className="bar-label">{UNIS_MATH} / {UNIS_ENGLISH}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="card" style={{ gridColumn: '1 / -1' }}>
            <h2>SAT progression</h2>
            <div className="mini-row" style={{ gap: '0.75rem', flexWrap: 'wrap', marginTop: '1rem' }}>
              <label style={{ width: '100%', maxWidth: '220px' }}>
                How long have you been studying?
                <select
                  value={studyWeeks}
                  onChange={(event) => setStudyWeeks(Number(event.target.value))}
                >
                  <option value={0}>0 weeks</option>
                  <option value={2}>2 weeks</option>
                  <option value={4}>4 weeks</option>
                  <option value={6}>6 weeks</option>
                  <option value={8}>8 weeks</option>
                  <option value={12}>12 weeks</option>
                  <option value={16}>16 weeks</option>
                </select>
              </label>
              <label style={{ width: '100%', maxWidth: '220px' }}>
                How many hours per week?
                <select
                  value={studyHours}
                  onChange={(event) => setStudyHours(event.target.value)}
                >
                  <option value="less than 1 hour">Less than 1 hour</option>
                  <option value="1 to 3 hours">1 to 3 hours</option>
                  <option value="4 to 6 hours">4 to 6 hours</option>
                  <option value="7 to 10 hours">7 to 10 hours</option>
                  <option value="10+ hours">10+ hours</option>
                </select>
              </label>
              <div className="pill">Score cap {SAT_CAP}</div>
            </div>
            <div className="info-box" style={{ marginTop: '1rem' }}>
              <p>
                Based on {studyWeeks > 0 ? `${studyWeeks} weeks` : 'no prior'} study experience and {studyHours.toLowerCase()} of weekly practice,
                here's your projected SAT score growth over the next 8 weeks.
              </p>
              <p>The optimistic scenario assumes consistent effort and good study habits. The conservative scenario accounts for typical challenges and plateaus.</p>
            </div>
            {activeSatScore === null ? (
              <p className="subtle" style={{ marginTop: '1rem' }}>Select an active SAT attempt or enter a total score to see progression projections.</p>
            ) : (
              <div className="progression-chart">
                <div className="progression-row header" style={{ fontWeight: 700 }}>
                  <span>Interval</span>
                  <span>Strong</span>
                  <span>Conservative</span>
                </div>
                {Array.from({ length: 5 }, (_, idx) => {
                  const label = idx === 0 ? 'Start' : `${idx * 2} weeks`;
                  const strongScore = strongSatProgression[idx] ?? strongSatProgression[strongSatProgression.length - 1] ?? activeSatScore;
                  const conservativeScore = conservativeSatProgression[idx] ?? conservativeSatProgression[conservativeSatProgression.length - 1] ?? activeSatScore;
                  return (
                    <div key={idx} className="progression-row">
                      <span>{label}</span>
                      <div className="progression-line">
                        <div className="progression-fill strong" style={{ width: styleWidth(strongScore, 1600) }} />
                        <div className="progression-point" style={{ left: styleWidth(strongScore, 1600) }} />
                      </div>
                      <div className="progression-line">
                        <div className="progression-fill conservative" style={{ width: styleWidth(conservativeScore, 1600) }} />
                        <div className="progression-point" style={{ left: styleWidth(conservativeScore, 1600) }} />
                      </div>
                    </div>
                  );
                })}
                <div className="label-row" style={{ marginTop: '1rem' }}>
                  <span />
                  <span>Optimistic: {strongSatProgression[strongSatProgression.length - 1] ?? activeSatScore} (+{((strongSatProgression[strongSatProgression.length - 1] ?? activeSatScore) - (activeSatScore ?? 0))})</span>
                  <span>Conservative: {conservativeSatProgression[conservativeSatProgression.length - 1] ?? activeSatScore} (+{((conservativeSatProgression[conservativeSatProgression.length - 1] ?? activeSatScore) - (activeSatScore ?? 0))})</span>
                </div>
              </div>
            )}
          </div>

          <div className="card" style={{ gridColumn: '1 / -1' }}>
            <h2>Find My Test Center</h2>
            <div className="mini-row" style={{ marginTop: '1rem' }}>
              <input
                value={testZip}
                onChange={(event) => setTestZip(event.target.value)}
                placeholder="Zip code"
              />
              <button type="button" onClick={() => saveTestZip(testZip)}>Update</button>
            </div>
            <p className="subtle">Test center recommendations are ranked by commute, reliability, environment, and stress.</p>
            {centerOptions.map((center) => (
              <div key={center.name} className="subject-item" style={{ display: 'grid', gap: '0.55rem' }}>
                <div className="mini-row" style={{ justifyContent: 'space-between' }}>
                  <strong>{center.name}</strong>
                  <span>{center.label}</span>
                </div>
                <div className="label-row">
                  <span>Distance {center.distance.toFixed(1)} mi</span>
                  <span>Reliability {center.reliability}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {section === 'act' && (
        <div className="grid-2">
          <div className="card">
            <h2>ACT input</h2>
            <label style={{ width: '100%', marginTop: '1rem' }}>
              ACT score
              <input
                type="number"
                value={satActData.act ?? ''}
                onChange={(event) => setSatActData({ ...satActData, act: event.target.value ? Number(event.target.value) : null })}
                placeholder="Enter ACT"
              />
            </label>
            <div className="info-box" style={{ marginTop: '1.25rem' }}>
              <strong>Prediction</strong>
              <p>Conservative and best-case outcomes update from your entry.</p>
            </div>
          </div>
          <div className="card">
            <h2>ACT forecast</h2>
            <div className="bar-graph">
              <div className="bar-row">
                <span>Your score</span>
                <div>
                  <div className="bar-track"><div className="bar-fill user" style={{ width: styleWidth(satActData.act ?? 0, 36) }} /></div>
                  <div className="bar-label">{satActData.act ?? '-'} / 36</div>
                </div>
              </div>
              <div className="bar-row">
                <span>Conservative</span>
                <div>
                  <div className="bar-track"><div className="bar-fill predicted" style={{ width: styleWidth(predictedAct.conservative, 36) }} /></div>
                  <div className="bar-label">{predictedAct.conservative}</div>
                </div>
              </div>
              <div className="bar-row">
                <span>Best case</span>
                <div>
                  <div className="bar-track"><div className="bar-fill predicted" style={{ width: styleWidth(predictedAct.best, 36) }} /></div>
                  <div className="bar-label">{predictedAct.best}</div>
                </div>
              </div>
              <div className="bar-row">
                <span>Global average</span>
                <div>
                  <div className="bar-track"><div className="bar-fill" style={{ width: styleWidth(ACT_AVERAGE, 36), background: 'rgba(255,182,74,0.9)' }} /></div>
                  <div className="bar-label">{ACT_AVERAGE}</div>
                </div>
              </div>
              <div className="bar-row">
                <span>UNIS</span>
                <div>
                  <div className="bar-track"><div className="bar-fill" style={{ width: styleWidth(UNIS_ACT, 36), background: 'rgba(99,218,141,0.9)' }} /></div>
                  <div className="bar-label">{UNIS_ACT}</div>
                </div>
              </div>
            </div>
          </div>
          <div className="card" style={{ gridColumn: '1 / -1' }}>
            <h2>UNIS ACT section averages</h2>
            <div className="bar-graph">
              {Object.entries(UNIS_ACT_SECTIONS).map(([label, value]) => (
                <div key={label} className="bar-row">
                  <span>{label}</span>
                  <div>
                    <div className="bar-track"><div className="bar-fill" style={{ width: styleWidth(value, 36), background: 'rgba(80,199,255,0.9)' }} /></div>
                    <div className="bar-label">{value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {section === 'dual' && (
        <div className="grid-2">
          <div className="card">
            <h2>Online Now</h2>
            <p className="subtle">See who is online and where they are.</p>
            <div style={{ display: 'grid', gap: '0.75rem', marginTop: '1rem' }}>
              {friends.filter(friend => friend.status !== 'offline').map((friend) => (
                <div key={friend.username} className="subject-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontSize: '1.2rem' }}>{renderAvatar(friend.avatarId, 'small')}</span>
                    <div>
                      <span>{friend.username}</span>
                      <div style={{ fontSize: '0.7rem', opacity: 0.7, color: friend.status === 'online' ? '#4ade80' : friend.status === 'active' ? '#fbbf24' : '#f97316' }}>
                        {friend.status === 'online' ? 'Online' : friend.status === 'active' ? 'Active' : 'Away'} • {friend.location}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button type="button" style={{ fontSize: '0.8rem', padding: '0.4rem 0.6rem' }}>Join</button>
                    <button type="button" style={{ fontSize: '0.8rem', padding: '0.4rem 0.6rem', background: 'rgba(255,255,255,0.08)' }}>Invite</button>
                  </div>
                </div>
              ))}
              {friends.filter(friend => friend.status !== 'offline').length === 0 && (
                <p className="subtle">No friends online right now. Add friends to see them here.</p>
              )}
            </div>
          </div>
          <div className="card">
            <h2>Friends</h2>
            <p className="subtle">Manage your friends list.</p>
            <div style={{ marginTop: '1rem' }}>
              <input
                type="text"
                placeholder="Search username to add friend"
                style={{ width: '100%', marginBottom: '0.5rem' }}
              />
              <button type="button" style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}>Add Friend</button>
            </div>
            <div style={{ display: 'grid', gap: '0.75rem', marginTop: '1rem' }}>
              {friends.map((friend) => (
                <div key={friend.username} className="subject-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontSize: '1.2rem' }}>{renderAvatar(friend.avatarId, 'small')}</span>
                    <div>
                      <span>{friend.username}</span>
                      <div style={{ fontSize: '0.7rem', opacity: 0.7, color: friend.status === 'online' ? '#4ade80' : friend.status === 'active' ? '#fbbf24' : friend.status === 'away' ? '#f97316' : '#6b7280' }}>
                        {friend.status === 'online' ? 'Online' : friend.status === 'active' ? 'Active' : friend.status === 'away' ? 'Away' : 'Offline'} • {friend.location}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button type="button" style={{ fontSize: '0.8rem', padding: '0.4rem 0.6rem' }}>Join</button>
                    <button type="button" style={{ fontSize: '0.8rem', padding: '0.4rem 0.6rem', background: 'rgba(255,255,255,0.08)' }}>Invite</button>
                  </div>
                </div>
              ))}
              {friends.length === 0 && (
                <p className="subtle">No friends added yet. Search for usernames to add friends.</p>
              )}
            </div>
          </div>
          <div className="card">
            <h2>Open servers</h2>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <p className="subtle">Join any of the 10 open DUAL servers and see who is currently waiting.</p>
              <button
                type="button"
                onClick={refreshServers}
                style={{ fontSize: '0.85rem', padding: '0.4rem 0.8rem', background: 'rgba(255,255,255,0.08)', color: 'var(--text)' }}
              >
                Refresh Servers
              </button>
            </div>
            <div style={{ display: 'grid', gap: '0.75rem', marginTop: '1rem' }}>
              {serverRooms.map((room) => (
                <div key={room.id} className="subject-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong>{room.name}</strong>
                    <div className="subtle" style={{ marginTop: '0.35rem' }}>
                      {room.players.length}/2 players {room.players.length === 2 ? '(full)' : room.players.length === 0 ? '(empty)' : '(open)'}
                      {room.players.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.45rem' }}>
                          {room.players.map((player) => (
                            <div key={player.username} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem' }}>
                              {renderAvatar(player.avatarId, 'small')}
                              <span>{player.username}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => joinServer(room.id)}
                    disabled={currentServerId === room.id}
                    style={{ fontSize: '0.9rem', padding: '0.6rem 0.85rem' }}
                  >
                    {currentServerId === room.id ? 'Joined' : 'Join'}
                  </button>
                </div>
              ))}
            </div>
            <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '0.5rem' }}>
              <h4>Join by Room Code</h4>
              <p className="subtle" style={{ fontSize: '0.8rem' }}>Enter a room code to join a private server.</p>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <input type="text" placeholder="Room code" style={{ flex: 1 }} />
                <button type="button" style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}>Join</button>
              </div>
            </div>
            {serverError && (
              <div className="info-box" style={{ marginTop: '1rem', color: '#ff8b8b', borderColor: '#ff8b8b' }}>
                {serverError}
              </div>
            )}
          </div>
          <div className="card" style={{ gridColumn: '1 / -1' }}>
            {!currentServer ? (
              <>
                <h2>Server lobby</h2>
                <p className="subtle">Join a server on the left to enter the shared DUAL lobby.</p>
              </>
            ) : (
              <>
                <h2>{currentServer.name}</h2>
                <p className="subtle">{currentServer.players.length} player{currentServer.players.length === 1 ? '' : 's'} present</p>
                <div style={{ marginTop: '1rem' }}>
                  <strong>Lobby players</strong>
                  <div style={{ display: 'grid', gap: '0.75rem', marginTop: '0.75rem' }}>
                    {currentServer.players.map((player) => {
                      const presence = getPresenceStatus(player.username);
                      return (
                        <div key={player.username} className="subject-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <span style={{ fontSize: '1.2rem' }}>{renderAvatar(player.avatarId, 'small')}</span>
                            <div>
                              <span>{player.username}</span>
                              <div style={{ fontSize: '0.7rem', opacity: 0.7, color: presence.status === 'online' ? '#4ade80' : presence.status === 'active' ? '#fbbf24' : presence.status === 'away' ? '#f97316' : '#6b7280' }}>
                                {presence.label}
                              </div>
                            </div>
                          </div>
                          <span className="pill" style={{ background: player.ready ? 'rgba(99,218,141,0.18)' : 'rgba(255,255,255,0.05)' }}>
                            {player.ready ? 'Ready' : 'Not Ready'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="mini-row" style={{ marginTop: '1rem', justifyContent: 'space-between' }}>
                  <button type="button" onClick={leaveServer} style={{ background: 'rgba(255,255,255,0.08)', color: 'var(--text)' }}>
                    Leave server
                  </button>
                  <button type="button" onClick={toggleReady}>
                    {currentPlayer?.ready ? 'Undo Ready' : 'Ready'}
                  </button>
                </div>
                {roomPhase === 'open' && (
                  <div className="info-box" style={{ marginTop: '1rem' }}>
                    <p>{currentPlayer?.ready ? 'Waiting for another ready player.' : 'Mark ready when you are prepared to play.'}</p>
                    <p>The match starts automatically when two players in this server are ready.</p>
                  </div>
                )}
                {roomPhase === 'open' && currentPlayer?.ready && activeOpponentPlayer?.ready && (
                  <div className="mini-row" style={{ marginTop: '1rem' }}>
                    <button type="button" onClick={beginMatch}>
                      Begin match with {activeOpponentPlayer.username}
                    </button>
                  </div>
                )}
                {roomPhase === 'input' && (
                  <>
                    <div className="info-box" style={{ marginTop: '1rem' }}>
                      <p>Enter your own IB lineup and optional SAT/ACT score. Opponent details stay hidden until the reveal.</p>
                      {selectedCourses.length > 0 && dualSelectedCourses.length === 0 && !showIbImport && (
                        <div style={{ marginTop: '1rem' }}>
                          <button type="button" onClick={() => setShowIbImport(true)} style={{ background: 'rgba(99,218,141,0.18)', color: 'var(--text)' }}>
                            Import from IB profile ({selectedCourses.length} courses)
                          </button>
                        </div>
                      )}
                      {showIbImport && (
                        <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '0.5rem' }}>
                          <p><strong>Import your saved IB courses and grades?</strong></p>
                          <p>You have {selectedCourses.length} courses saved in your IB profile. Import them to quickly set up your DUAL lineup.</p>
                          <div className="mini-row" style={{ gap: '0.75rem', marginTop: '1rem' }}>
                            <button type="button" onClick={importIbCourses}>Import courses</button>
                            <button type="button" onClick={() => setShowIbImport(false)} style={{ background: 'rgba(255,255,255,0.08)', color: 'var(--text)' }}>
                              Select manually
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="grid-2" style={{ marginTop: '1rem', gap: '1rem' }}>
                      <div className="subject-item" style={{ padding: '1.2rem' }}>
                        <h3>Your profile</h3>
                        <div className="mini-row" style={{ gap: '0.75rem', flexWrap: 'wrap', marginTop: '1rem' }}>
                          <label style={{ width: '100%', maxWidth: '240px' }}>
                            SAT (optional)
                            <input
                              type="number"
                              min={400}
                              max={1600}
                              value={playerSat ?? ''}
                              disabled={currentPlayer?.submitted}
                              onChange={(event) => setPlayerSat(event.target.value ? Number(event.target.value) : null)}
                              placeholder="Score"
                            />
                          </label>
                          <label style={{ width: '100%', maxWidth: '240px' }}>
                            ACT (optional)
                            <input
                              type="number"
                              min={1}
                              max={36}
                              value={playerAct ?? ''}
                              disabled={currentPlayer?.submitted}
                              onChange={(event) => setPlayerAct(event.target.value ? Number(event.target.value) : null)}
                              placeholder="Score"
                            />
                          </label>
                        </div>
                        <div style={{ marginTop: '1rem', marginBottom: '1rem' }}>
                          <input
                            type="text"
                            value={dualSearchQuery}
                            onChange={(event) => setDualSearchQuery(event.target.value)}
                            placeholder="Search courses (e.g., Biology, HL)"
                            style={{ width: '100%' }}
                            disabled={currentPlayer?.submitted}
                          />
                        </div>
                        {dualSearchQuery.length > 0 ? (
                          <div>
                            <h4>Search results ({dualFilteredCourses.length})</h4>
                            <div className="subject-grid" style={{ gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '0.5rem' }}>
                              {dualFilteredCourses.map((option) => (
                                <div
                                  key={option.id}
                                  className={`subject-item ${dualSelectedIds.has(option.id) ? 'active' : ''}`}
                                  onClick={() => !currentPlayer?.submitted && handleDualToggleCourse(option.id)}
                                  style={{ padding: '0.75rem', fontSize: '0.85rem', cursor: currentPlayer?.submitted ? 'default' : 'pointer' }}
                                >
                                  <strong style={{ fontSize: '0.8rem' }}>{option.name}</strong>
                                  <small style={{ fontSize: '0.7rem' }}>{option.level} • {option.category}</small>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div>
                            {ibSubjectGroups.filter(group => group.key !== 'Interdisciplinary').map((group) => {
                              const groupCourses = dualCourseOptions.filter((option) => option.group === group.key);
                              return (
                                <div key={group.key} className="subject-group" style={{ marginBottom: '1rem' }}>
                                  <h4 style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>{group.label}</h4>
                                  <div className="subject-grid" style={{ gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '0.5rem' }}>
                                    {groupCourses.map((option) => (
                                      <div
                                        key={option.id}
                                        className={`subject-item ${dualSelectedIds.has(option.id) ? 'active' : ''}`}
                                        onClick={() => !currentPlayer?.submitted && handleDualToggleCourse(option.id)}
                                        style={{ padding: '0.75rem', fontSize: '0.85rem', cursor: currentPlayer?.submitted ? 'default' : 'pointer' }}
                                      >
                                        <strong style={{ fontSize: '0.8rem' }}>{option.name}</strong>
                                        <small style={{ fontSize: '0.7rem' }}>{option.level} • {option.category}</small>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                        <div style={{ marginTop: '1rem' }}>
                          <h4>Selected courses ({dualSelectedCourses.length})</h4>
                          {dualSelectedCourses.length > 0 ? (
                            <div style={{ display: 'grid', gap: '0.5rem', marginTop: '0.5rem' }}>
                              {dualSelectedCourses.map((course) => (
                                <div key={course.id} className="subject-item active" style={{ padding: '0.75rem', cursor: 'default' }}>
                                  <div className="mini-row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ flex: 1 }}>
                                      <strong style={{ fontSize: '0.8rem' }}>{course.name}</strong>
                                      <small style={{ display: 'block', marginTop: '0.25rem', fontSize: '0.7rem' }}>{course.level}</small>
                                    </div>
                                    <input
                                      type="number"
                                      min={1}
                                      max={7}
                                      value={course.grade}
                                      onChange={(event) => handleDualGradeChange(course.id, event.target.value)}
                                      disabled={currentPlayer?.submitted}
                                      style={{ width: '3rem', fontSize: '0.8rem' }}
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="subtle" style={{ fontSize: '0.8rem' }}>No subjects selected. Select courses to build your lineup.</p>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={submitLineup}
                          disabled={currentPlayer?.submitted}
                          style={{ marginTop: '1rem' }}
                        >
                          {currentPlayer?.submitted ? 'Submitted' : 'Submit your lineup'}
                        </button>
                      </div>
                      <div className="subject-item" style={{ padding: '1.2rem' }}>
                        <h3>{activeOpponentPlayer?.username ?? 'Opponent'}'s profile</h3>
                        <div className="info-box" style={{ marginTop: '1rem' }}>
                          <p>Opponent lineup and SAT/ACT profile are hidden until the reveal stage.</p>
                          <p>{activeOpponentPlayer?.submitted ? 'Opponent has submitted.' : 'Opponent is still submitting.'}</p>
                        </div>
                        <div className="pill" style={{ marginTop: '1rem', background: activeOpponentPlayer?.submitted ? 'rgba(99,218,141,0.18)' : 'rgba(255,255,255,0.05)' }}>
                          {activeOpponentPlayer?.submitted ? 'Opponent submitted' : 'Opponent pending'}
                        </div>
                      </div>
                    </div>
                    <div className="info-box" style={{ marginTop: '1rem' }}>
                      <p>{currentPlayer?.submitted ? 'Your profile is locked.' : 'Waiting for you to submit.'}</p>
                      <p>{activeOpponentPlayer?.submitted ? 'Opponent profile is locked.' : 'Opponent profile pending.'}</p>
                    </div>
                    <div className="mini-row" style={{ marginTop: '1rem', justifyContent: 'space-between' }}>
                      <button type="button" onClick={leaveServer} style={{ background: 'rgba(255,255,255,0.08)', color: 'var(--text)' }}>Cancel match</button>
                      <button type="button" onClick={revealDuel} disabled={!currentPlayer?.submitted || !activeOpponentPlayer?.submitted}>
                        {currentPlayer?.submitted && activeOpponentPlayer?.submitted ? 'Reveal results' : 'Waiting on both submissions'}
                      </button>
                    </div>
                  </>
                )}
                {roomPhase === 'compare' && (
                  <div className="subject-item" style={{ marginTop: '1rem' }}>
                    <h3>Category comparison</h3>
                    <div className="bar-graph" style={{ marginTop: '1rem' }}>
                      {Object.keys(categoryGroups).map((category) => {
                        const player = duelCategories.player.find((row) => row.category === category)?.average ?? 0;
                        const opponent = duelCategories.opponent.find((row) => row.category === category)?.average ?? 0;
                        return (
                          <div key={category} className="subject-item">
                            <div className="mini-row" style={{ justifyContent: 'space-between' }}>
                              <strong>{category}</strong>
                              <span>{player.toFixed(1)} vs {opponent.toFixed(1)}</span>
                            </div>
                            <div className="bar-track"><div className="bar-fill user" style={{ width: styleWidth(player, 12) }} /></div>
                            <div className="bar-track"><div className="bar-fill predicted" style={{ width: styleWidth(opponent, 12) }} /></div>
                          </div>
                        );
                      })}
                    </div>
                    <button type="button" style={{ marginTop: '1rem' }} onClick={revealDuel}>Reveal full results</button>
                  </div>
                )}
                {roomPhase === 'reveal' && dualSummary && (
                  <div className="subject-item" style={{ marginTop: '1rem' }}>
                    <h3>DUAL results</h3>
                    <div className="stats-row" style={{ marginTop: '1rem' }}>
                      <div className="metric" style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                        <span style={{ fontSize: '1.2rem' }}>{renderAvatar(profileAvatar.id, 'small')}</span>
                        <strong>{dualSummary.playerTotal.toFixed(1)}</strong>
                        <span>You</span>
                      </div>
                      <div className="metric" style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                        <span style={{ fontSize: '1.2rem' }}>{renderAvatar(activeOpponentPlayer?.avatarId ?? 0, 'small')}</span>
                        <strong>{dualSummary.opponentTotal.toFixed(1)}</strong>
                        <span>{activeOpponentPlayer?.username ?? 'Opponent'}</span>
                      </div>
                      <div className="metric"><strong>{dualSummary.winner === 'player' ? 'Victory' : dualSummary.winner === 'tie' ? 'Tie' : 'Loss'}</strong></div>
                    </div>
                    <div className="info-box" style={{ marginTop: '1rem' }}>
                      <p>{dualSummary.winner === 'player' ? 'Winner gets bread!' : dualSummary.winner === 'opponent' ? 'Hamburger bun loss recorded.' : 'Tied outcome, both sides stay sharp.'}</p>
                      <p>Final score margin: {dualSummary.pointsDelta}</p>
                    </div>
                    <div style={{ marginTop: '1rem' }}>
                      <strong>Course reveal</strong>
                      <div className="grid-2" style={{ gap: '1rem', marginTop: '1rem' }}>
                        <div className="subject-item">
                          <strong>Your lineup</strong>
                          {playerRows.map((row) => {
                            const option = ibCourseOptions.find((course) => course.id === row.course);
                            return <div key={row.id}>{option?.name ?? 'Unknown'} • Grade {row.grade}</div>;
                          })}
                          <div style={{ marginTop: '0.75rem', color: 'var(--muted)' }}><strong>SAT score:</strong> {playerSat ?? 'N/A'}</div>
                          <div style={{ marginTop: '0.25rem', color: 'var(--muted)' }}><strong>ACT score:</strong> {playerAct ?? 'N/A'}</div>
                        </div>
                        <div className="subject-item">
                          <strong>{activeOpponentPlayer?.username ?? 'Opponent'}'s lineup</strong>
                          {activeOpponentPlayer?.lineup.map((row) => {
                            const option = ibCourseOptions.find((course) => course.id === row.course);
                            return <div key={row.id}>{option?.name ?? 'Unknown'} • Grade {row.grade}</div>;
                          })}
                          <div style={{ marginTop: '0.75rem', color: 'var(--muted)' }}><strong>SAT score:</strong> {activeOpponentPlayer?.satScore ?? 'N/A'}</div>
                          <div style={{ marginTop: '0.25rem', color: 'var(--muted)' }}><strong>ACT score:</strong> {activeOpponentPlayer?.actScore ?? 'N/A'}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      <div className="footer-note">
        Gradepilot stores your performance locally in the browser. This version uses no passwords or account authentication.
      </div>
    </div>
  );
}

export default App;
