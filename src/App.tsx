import React, { useEffect, useMemo, useState } from 'react';
import { generateUsernameFromProfile, normalizeUsername, uniqueUsername } from './lib/username';
import { saveTestZip } from './lib/storage';
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

// Simple emoji pool for user avatars - assigned randomly on account creation, permanent and unchangeable
const AVATAR_EMOJIS = [
  '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇',
  '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😚', '😙',
  '🥲', '😋', '😛', '😜', '🤪', '😝', '😑', '😐', '😶', '🙁',
  '😏', '😒', '🙄', '😬', '🤥', '😌', '😔', '😪', '🤤', '😴',
  '😷', '🤒', '🤕', '🤮', '🤢', '🤮', '🤮', '🤮', '😵', '🤯',
  '🤠', '🥳', '😎', '🤓', '🧐', '😕', '😟', '🙁', '☹️', '😮',
  '😯', '😲', '😳', '🥺', '😦', '😧', '😨', '😰', '😥', '😢',
  '😭', '😱', '😖', '😣', '😞', '😓', '😩', '😫', '🥱', '😤',
  '😡', '😠', '🤬', '😈', '👿', '💀', '🐶', '🐱', '🐭', '🐹',
  '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸',
  '🐵', '🙈', '🙉', '🙊', '🐒', '🐔', '🐧', '🐦', '🐤', '🦆',
  '🦅', '🦉', '🦇', '🐺', '🐗', '🐴', '🦄', '🐝', '🐛', '🦋',
  '🌟', '⭐', '✨', '💫', '🔥', '💥', '⚡', '🌈', '☀️', '🌙'
];

function getRandomEmoji(): string {
  return AVATAR_EMOJIS[Math.floor(Math.random() * AVATAR_EMOJIS.length)];
}

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

type Section = 'home' | 'ib' | 'sat' | 'act';

type ServerPhase = 'open' | 'lobby' | 'input' | 'compare' | 'reveal';

type TrendOption = 'improving' | 'stable' | 'declining';
type WeightingOption = 'low' | 'normal' | 'strong';
type MatchCategory = 'Reach' | 'Competitive' | 'Safe';

type University = {
  name: string;
  min: number;
  max: number;
  note?: string;
};

const COLLEGE_MATCHES: University[] = [
  { name: 'Oxford', min: 38, max: 40 },
  { name: 'Cambridge', min: 40, max: 42 },
  { name: 'Imperial', min: 38, max: 40, note: 'STEM 38–42' },
  { name: 'ETH Zurich', min: 38, max: 40 },
  { name: 'UCL', min: 34, max: 39 },
  { name: 'TUM', min: 36, max: 38 },
  { name: 'Edinburgh', min: 34, max: 38 },
  { name: 'LMU Munich', min: 35, max: 38 },
  { name: 'EPFL', min: 38, max: 40 },
  { name: 'King’s', min: 35, max: 37 },
  { name: 'KU Leuven', min: 32, max: 36 },
  { name: 'PSL', min: 36, max: 38, note: '36–38+' },
  { name: 'Heidelberg', min: 35, max: 38 },
  { name: 'LSE', min: 37, max: 38 },
  { name: 'Karolinska', min: 34, max: 38 },
  { name: 'Manchester', min: 32, max: 37 },
  { name: 'Delft', min: 32, max: 36 },
  { name: 'Amsterdam', min: 32, max: 36 },
  { name: 'Wageningen', min: 32, max: 35 },
  { name: 'Institut Polytechnique Paris', min: 36, max: 39 },
  { name: 'Paris-Saclay', min: 34, max: 38 },
  { name: 'Leiden', min: 32, max: 36 },
  { name: 'Sorbonne', min: 34, max: 38 },
  { name: 'Bristol', min: 32, max: 36 },
  { name: 'Groningen', min: 32, max: 35 },
  { name: 'Glasgow', min: 34, max: 38 },
  { name: 'Humboldt Berlin', min: 34, max: 37 },
  { name: 'Copenhagen', min: 32, max: 36 },
  { name: 'Charité', min: 36, max: 38, note: '36–38+' },
  { name: 'RWTH Aachen', min: 35, max: 38 },
  { name: 'Bonn', min: 34, max: 37 },
  { name: 'Lund', min: 32, max: 36 },
  { name: 'Vienna', min: 32, max: 36 },
  { name: 'KTH', min: 34, max: 37 },
  { name: 'Birmingham', min: 32, max: 36 },
  { name: 'Tübingen', min: 34, max: 37 },
  { name: 'Aarhus', min: 32, max: 35 },
  { name: 'Helsinki', min: 32, max: 36 },
  { name: 'Erasmus', min: 32, max: 36 },
  { name: 'Bern / Sheffield', min: 32, max: 37 }
];

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

function satEquivalentFromPsat(score: number) {
  return Math.min(1600, Math.max(400, Math.round(score * 0.95 + 35)));
}

function refineSatPredictionWithPsat(prediction: { conservative: number; best: number }, satScore: number, psatScore: number) {
  const psatEquivalent = satEquivalentFromPsat(psatScore);
  const adjustment = Math.round((psatEquivalent - satScore) * 0.15);
  return {
    conservative: Math.min(1600, Math.max(satScore, prediction.conservative + adjustment)),
    best: Math.min(1600, Math.max(satScore, prediction.best + adjustment))
  };
}

function computePrediction(score: number | null, type: 'sat' | 'act' | 'psat') {
  if (score === null) return { conservative: 0, best: 0 };
  const baseline = type === 'psat' ? satEquivalentFromPsat(score) : score;
  if (type === 'sat' || type === 'psat') {
    return {
      conservative: Math.min(1600, Math.round(baseline + 45)),
      best: Math.min(1600, Math.round(baseline + 110))
    };
  }
  return {
    conservative: Math.min(36, Math.round(score + 3)),
    best: Math.min(36, Math.round(score + 6))
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

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function roundIbGrade(value: number) {
  return clamp(Math.round(value), 1, 7);
}

function computeSubjectPrediction(currentGrade: number, trend: TrendOption, weighting: WeightingOption) {
  const trendDelta = trend === 'improving' ? 0.25 : trend === 'declining' ? -0.25 : 0;
  const weightDelta = weighting === 'strong' ? 0.15 : weighting === 'low' ? -0.15 : 0;
  return roundIbGrade(currentGrade + trendDelta + weightDelta);
}

function adjustScenarioGrades(grades: number[], count: number, change: number, chooseHighest = false) {
  const indexed = grades.map((grade, index) => ({ grade, index }));
  const sorted = indexed.sort((a, b) => chooseHighest ? b.grade - a.grade : a.grade - b.grade);
  const targetIndices = sorted.slice(0, Math.min(count, grades.length)).map((item) => item.index);
  return grades.map((grade, index) => targetIndices.includes(index) ? clamp(grade + change, 1, 7) : grade);
}

function computeIbPredictions(grades: number[], trend: TrendOption, weighting: WeightingOption) {
  const baseGrades = grades.map((grade) => computeSubjectPrediction(grade, trend, weighting));
  const fullGrades = baseGrades.length >= 6 ? baseGrades.slice(0, 6) : [...baseGrades, ...Array(6 - baseGrades.length).fill(baseGrades.length ? Math.round(baseGrades.reduce((sum, value) => sum + value, 0) / baseGrades.length) : 5)];
  const realistic = fullGrades.reduce((sum, value) => sum + value, 0);
  const best = adjustScenarioGrades(fullGrades, Math.min(3, fullGrades.length), 1).reduce((sum, value) => sum + value, 0);
  const worst = adjustScenarioGrades(fullGrades, Math.min(3, fullGrades.length), -1, true).reduce((sum, value) => sum + value, 0);
  return { realistic, best, worst };
}

function calculateConfidenceLabel(selectedCount: number, trend: TrendOption, weighting: WeightingOption) {
  if (selectedCount < 6 || weighting === 'low') return 'Low';
  if (trend === 'stable' && weighting === 'strong') return 'High';
  return 'Medium';
}

function satActModifier(sat: number | null, act: number | null) {
  if (sat !== null) {
    if (sat >= 1500) return { level: 'strong', adjustment: 16, note: 'SAT 1500+ strong boost' };
    if (sat >= 1400) return { level: 'moderate', adjustment: 10, note: 'SAT 1400–1490 moderate boost' };
    if (sat >= 1300) return { level: 'slight', adjustment: 5, note: 'SAT 1300–1390 slight boost' };
    return { level: 'negative', adjustment: -10, note: 'SAT below 1300 negative impact' };
  }
  if (act !== null) {
    if (act >= 34) return { level: 'strong', adjustment: 16, note: 'ACT 34+ strong boost' };
    if (act >= 31) return { level: 'moderate', adjustment: 10, note: 'ACT 31–33 moderate boost' };
    if (act >= 28) return { level: 'slight', adjustment: 5, note: 'ACT 28–30 slight boost' };
    return { level: 'negative', adjustment: -10, note: 'ACT below 28 negative impact' };
  }
  return { level: 'none', adjustment: 0, note: 'No SAT/ACT data' };
}

function evaluateCollegeMatch(university: University, score: number, modifier: ReturnType<typeof satActModifier>) {
  const baseCategory: MatchCategory = score < university.min ? 'Reach' : score > university.max ? 'Safe' : 'Competitive';
  let category = baseCategory;
  if (modifier.level === 'strong') {
    if (category === 'Reach') category = 'Competitive';
    else if (category === 'Competitive' && score >= university.max - 1) category = 'Safe';
  } else if (modifier.level === 'moderate') {
    if (category === 'Reach' && score >= university.min - 2) category = 'Competitive';
    else if (category === 'Competitive' && score > university.max) category = 'Safe';
  } else if (modifier.level === 'slight') {
    if (category === 'Reach' && score >= university.min - 1) category = 'Competitive';
  } else if (modifier.level === 'negative') {
    if (category === 'Safe') category = 'Competitive';
    else if (category === 'Competitive') category = 'Reach';
  }

  let acceptance = 0;
  if (score < university.min) {
    const deficit = university.min - score;
    acceptance = deficit <= 1 ? 25 : deficit <= 3 ? 18 : 10;
  } else if (score <= university.max) {
    const rangeSpan = Math.max(1, university.max - university.min + 1);
    const progress = (score - university.min) / rangeSpan;
    acceptance = 40 + Math.round(progress * 30);
  } else {
    acceptance = 70 + Math.min(20, (score - university.max) * 4);
  }

  acceptance = clamp(acceptance + modifier.adjustment, 5, 90);

  return {
    university,
    baseCategory,
    category,
    acceptance,
    note: modifier.note
  };
}

function normalizeCollegeCategory(category: MatchCategory) {
  return category;
}

function formatRange(university: University) {
  return `${university.min}–${university.max}`;
}

function App() {
  const [storedProfile, setStoredProfile] = usePersistentState<UserProfile | null>('gradepilot-profile', null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [currentAvatarEmoji, setCurrentAvatarEmoji] = useState<string>(() => getRandomEmoji());
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
  const [satHorizonWeeks, setSatHorizonWeeks] = useState(8);
  const [studyWeeks, setStudyWeeks] = useState(0);
  const [studyHours, setStudyHours] = useState('1 to 3 hours');
  const [showOptionalPsat, setShowOptionalPsat] = useState(false);
  const [ibTrend, setIbTrend] = useState<TrendOption>('stable');
  const [ibWeighting, setIbWeighting] = useState<WeightingOption>('normal');
  const [actualIbScore, setActualIbScore] = useState<number | null>(null);
  const [gradYear, setGradYear] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [usernameSuggestion, setUsernameSuggestion] = useState('');
  const [editedUsername, setEditedUsername] = useState('');
  const [profileMigrated, setProfileMigrated] = usePersistentState<boolean>('gradepilot-profile-migrated', false);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(
    () => Object.fromEntries(ibSubjectGroups.map((group) => [group.key, false]))
  );
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPin, setLoginPin] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const existingUsernames = useMemo(
    () => (storedProfile ? [normalizeUsername(storedProfile.username)] : []),
    [storedProfile]
  );

  const suggestedProfileUsername = useMemo(() => {
    const yearNum = Number(gradYear);
    if (!yearNum || !firstName || !lastName) return '';
    return uniqueUsername(generateUsernameFromProfile(yearNum, firstName, lastName), existingUsernames);
  }, [gradYear, firstName, lastName, existingUsernames]);

  // Define functions
  function renderAvatar(emoji: string, size: 'small' | 'medium' | 'large' = 'small') {
    const sizeMap = {
      small: '1.2rem',
      medium: '1.5rem',
      large: '2rem'
    };
    
    return (
      <span style={{ fontSize: sizeMap[size], lineHeight: 1 }}>
        {emoji}
      </span>
    );
  }

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

  const selectedIds = useMemo(() => new Set(selectedCourses.map((item) => item.id)), [selectedCourses]);

  function chooseAvatar(emoji: string) {
    setCurrentAvatarEmoji(emoji);
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
      avatarEmoji: currentAvatarEmoji,
      pinHash
    };
    setStoredProfile(profile);
    setUsername(profile.username);
    setCurrentAvatarEmoji(profile.avatarEmoji);
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
    const pin = loginPin;
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
    setCurrentAvatarEmoji(storedProfile.avatarEmoji);
    setIsAuthenticated(true);
  }

  function handleLogout() {
    setIsAuthenticated(false);
    setUsername('');
    setLoginPin('');
    setAuthError(null);
  }

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

  const activeBaselineScore = useMemo(() => {
    if (activeSatScore !== null) return activeSatScore;
    if (activePsatScore !== null) return satEquivalentFromPsat(activePsatScore);
    return null;
  }, [activeSatScore, activePsatScore]);

  const baselineSource = useMemo(() => {
    if (activeSatScore !== null) return 'SAT score';
    if (activePsatScore !== null) return 'PSAT equivalent';
    return null;
  }, [activeSatScore, activePsatScore]);

  const studyGainMultiplier = useMemo(() => {
    let multiplier = 1;
    if (studyHours === 'less than 1 hour') multiplier = 0.9;
    else if (studyHours === '1 to 3 hours') multiplier = 1;
    else if (studyHours === '4 to 6 hours') multiplier = 1.08;
    else if (studyHours === '7 to 10 hours') multiplier = 1.16;
    else if (studyHours === '10+ hours') multiplier = 1.22;
    if (studyWeeks >= 16) multiplier += 0.08;
    else if (studyWeeks >= 8) multiplier += 0.04;
    return multiplier;
  }, [studyHours, studyWeeks]);

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

  const selectedIbGrades = useMemo(() => {
    return selectedCourses.slice(0, 6).map((course) => course.grade);
  }, [selectedCourses]);

  const predictedIb = useMemo(() => {
    return computeIbPredictions(selectedIbGrades, ibTrend, ibWeighting);
  }, [selectedIbGrades, ibTrend, ibWeighting]);

  const predictedIbConfidence = useMemo(() => {
    return calculateConfidenceLabel(selectedCourses.length, ibTrend, ibWeighting);
  }, [selectedCourses.length, ibTrend, ibWeighting]);

  const collegeMatchScore = useMemo(() => {
    return actualIbScore !== null ? actualIbScore : predictedIb.realistic;
  }, [actualIbScore, predictedIb.realistic]);

  const satActBoost = useMemo(() => {
    return satActModifier(activeSatScore, satActData.act);
  }, [activeSatScore, satActData.act]);

  const collegeMatches = useMemo(() => {
    return COLLEGE_MATCHES.map((university) => evaluateCollegeMatch(university, collegeMatchScore, satActBoost));
  }, [collegeMatchScore, satActBoost]);

  const campusGroups = useMemo(() => {
    return {
      Reach: collegeMatches.filter((match) => match.category === 'Reach'),
      Competitive: collegeMatches.filter((match) => match.category === 'Competitive'),
      Safe: collegeMatches.filter((match) => match.category === 'Safe')
    };
  }, [collegeMatches]);

  const scoreSourceLabel = actualIbScore !== null ? 'Actual IB score' : 'Predicted IB score';

  const selectedCourseCountMessage = selectedCourses.length < 6 ? 'Select 6 courses for the most reliable IB forecast.' : '6 courses selected; prediction uses the top six grades.';

  const activeSatOrAct = activeSatScore !== null ? activeSatScore : satActData.act;

  const predictedSat = useMemo(() => {
    if (activeBaselineScore === null) return { conservative: 0, best: 0 };
    const basePrediction = computePrediction(activeBaselineScore, 'sat');
    if (activeSatScore !== null && activePsatScore !== null) {
      return refineSatPredictionWithPsat(basePrediction, activeSatScore, activePsatScore);
    }
    return basePrediction;
  }, [activeBaselineScore, activeSatScore, activePsatScore]);
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
    if (activeBaselineScore === null) return [];
    return simulateSatProgression(activeBaselineScore, satHorizonWeeks / 2, (STRONG_GAIN * studyGainMultiplier) + satTrendBoost, SAT_CAP);
  }, [activeBaselineScore, satHorizonWeeks, satTrendBoost, studyGainMultiplier]);

  const conservativeSatProgression = useMemo(() => {
    if (activeBaselineScore === null) return [];
    return simulateSatProgression(activeBaselineScore, satHorizonWeeks / 2, (CONSERVATIVE_GAIN * studyGainMultiplier) + Math.max(0, satTrendBoost - 2), SAT_CAP);
  }, [activeBaselineScore, satHorizonWeeks, satTrendBoost, studyGainMultiplier]);

  const centerOptions: TestCenter[] = useMemo(() => {
    return testCentersBase.map((center) => {
      const score = center.reliability * 0.4 + center.environment * 0.3 + (100 - center.stress) * 0.2 - center.distance * 1.5;
      const label = score > 80 ? 'Best Choice' : score > 70 ? 'Good Option' : score > 55 ? 'Backup' : 'Avoid';
      return { ...center, label };
    });
  }, [testZip]);

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

  function handleResetIB() {
    setSelectedCourses([]);
    setIbStep('select');
  }

  const centerLabel = `Nearby test centers for ${testZip}`;

  if (!isAuthenticated) {
    const previewEmoji = storedProfile ? storedProfile.avatarEmoji : currentAvatarEmoji;
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
              <span style={{ fontSize: '1.35rem' }}>{renderAvatar(previewEmoji, 'medium')}</span>
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
                  <strong>Your Avatar</strong>
                  <div className="subject-item" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ fontSize: '2rem' }}>{renderAvatar(currentAvatarEmoji, 'large')}</span>
                    <span className="subtle">Your unique emoji avatar is permanent and will appear on your profile.</span>
                  </div>
                </div>
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
                <label>
                  Create a 4-digit PIN
                  <input
                    type="password"
                    inputMode="numeric"
                    maxLength={4}
                    value={pin}
                    onChange={(event) => setPin(event.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="1234"
                    style={{ width: '100%', marginTop: '0.5rem' }}
                  />
                </label>
                <label style={{ marginTop: '1rem', display: 'block' }}>
                  Confirm PIN
                  <input
                    type="password"
                    inputMode="numeric"
                    maxLength={4}
                    value={confirmPin}
                    onChange={(event) => setConfirmPin(event.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="1234"
                    style={{ width: '100%', marginTop: '0.5rem' }}
                  />
                </label>
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
                  <span style={{ fontSize: '2rem' }}>{renderAvatar(previewEmoji, 'large')}</span>
                  <div>
                    <div>{storedProfile?.firstName} {storedProfile?.lastName}</div>
                    <div className="subtle">{storedProfile?.username}</div>
                  </div>
                </div>
                <label>
                  Username
                  <input value={loginUsername} onChange={(event) => setLoginUsername(event.target.value)} placeholder="Your username" />
                </label>
                <label>
                  Enter PIN
                  <input
                    type="password"
                    inputMode="numeric"
                    maxLength={4}
                    value={loginPin}
                    onChange={(event) => setLoginPin(event.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="1234"
                    style={{ width: '100%', marginTop: '0.5rem' }}
                  />
                </label>
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
              <span style={{ fontSize: '1.4rem' }}>{renderAvatar(currentAvatarEmoji, 'medium')}</span>
              <strong>{username}</strong>
            </div>
            <span className="subtle">Logged in as {storedProfile?.firstName} {storedProfile?.lastName}</span>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            <button type="button" onClick={handleLogout}>Logout</button>
          </div>
        </div>
      </div>

      <div className="section-nav">
        {(['home', 'ib', 'sat', 'act'] as Section[]).map((key) => (
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
              <h2>Profile</h2>
              <p className="subtle">Manage your graduation year, username, PIN, and saved progress.</p>
              <button type="button" onClick={() => setSection('ib')}>Open IB dashboard</button>
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
              <h2>Profile status</h2>
              <p className="subtle">Your username, PIN, and saved progress are preserved locally.</p>
              <div className="info-box">
                <p>Update your graduation year, first and last name to refresh your compact username format.</p>
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
                <h2>IB prediction & college match</h2>
                <p className="subtle">Estimate your final 45-point IB outcome, then compare it with university requirements.</p>
                <div className="mini-row" style={{ gap: '0.75rem', flexWrap: 'wrap', marginTop: '1rem' }}>
                  <label style={{ width: '100%', maxWidth: '200px' }}>
                    Actual IB score
                    <input
                      type="number"
                      min={1}
                      max={45}
                      value={actualIbScore ?? ''}
                      onChange={(event) => setActualIbScore(event.target.value === '' ? null : Number(event.target.value))}
                      placeholder="45"
                    />
                  </label>
                  <label style={{ width: '100%', maxWidth: '220px' }}>
                    Trend
                    <select value={ibTrend} onChange={(event) => setIbTrend(event.target.value as TrendOption)}>
                      <option value="improving">Improving</option>
                      <option value="stable">Stable</option>
                      <option value="declining">Declining</option>
                    </select>
                  </label>
                  <label style={{ width: '100%', maxWidth: '220px' }}>
                    Evidence
                    <select value={ibWeighting} onChange={(event) => setIbWeighting(event.target.value as WeightingOption)}>
                      <option value="strong">Strong (mocks/IA)</option>
                      <option value="normal">Normal</option>
                      <option value="low">Low</option>
                    </select>
                  </label>
                </div>
                <div className="stats-row" style={{ marginTop: '1rem' }}>
                  <div className="metric"><strong>{scoreSourceLabel}</strong></div>
                  <div className="metric"><strong>{selectedCourseCountMessage}</strong></div>
                  <div className="metric"><strong>Confidence: {predictedIbConfidence}</strong></div>
                </div>
                <div className="info-box" style={{ marginTop: '1rem' }}>
                  <p>Best: {predictedIb.best} / 45 • Realistic: {predictedIb.realistic} / 45 • Worst: {predictedIb.worst} / 45</p>
                  {selectedCourses.length < 6 && (
                    <p className="subtle">Predictions are most reliable with six courses entered.</p>
                  )}
                </div>
                <div className="bar-graph" style={{ marginTop: '1rem' }}>
                  <div className="bar-row">
                    <span>Best</span>
                    <div>
                      <div className="bar-track"><div className="bar-fill predicted" style={{ width: styleWidth(predictedIb.best, 45) }} /></div>
                      <div className="bar-label">{predictedIb.best}</div>
                    </div>
                  </div>
                  <div className="bar-row">
                    <span>Realistic</span>
                    <div>
                      <div className="bar-track"><div className="bar-fill user" style={{ width: styleWidth(predictedIb.realistic, 45) }} /></div>
                      <div className="bar-label">{predictedIb.realistic}</div>
                    </div>
                  </div>
                  <div className="bar-row">
                    <span>Worst</span>
                    <div>
                      <div className="bar-track"><div className="bar-fill" style={{ width: styleWidth(predictedIb.worst, 45), background: 'rgba(245,158,11,0.9)' }} /></div>
                      <div className="bar-label">{predictedIb.worst}</div>
                    </div>
                  </div>
                </div>
                <div className="info-box" style={{ marginTop: '1rem' }}>
                  <p>{satActBoost.note}. {activeSatOrAct !== null ? `Using ${activeSatScore !== null ? 'SAT' : 'ACT'} data for match guidance.` : 'No SAT/ACT boost applied.'}</p>
                </div>
                <div style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
                  {(['Reach', 'Competitive', 'Safe'] as MatchCategory[]).map((groupKey) => (
                    <div key={groupKey} className="subject-item" style={{ padding: '1rem', background: 'rgba(255,255,255,0.04)' }}>
                      <h3>{groupKey}</h3>
                      {campusGroups[groupKey].length ? (
                        <div style={{ display: 'grid', gap: '0.75rem', marginTop: '0.75rem' }}>
                          {campusGroups[groupKey].map((match) => (
                            <div key={match.university.name} className="mini-row" style={{ justifyContent: 'space-between', gap: '0.5rem', padding: '0.65rem', background: 'rgba(0,0,0,0.05)', borderRadius: '0.35rem' }}>
                              <div>
                                <strong>{match.university.name}</strong>
                                <div className="subtle" style={{ fontSize: '0.8rem' }}>{formatRange(match.university)}{match.university.note ? ` • ${match.university.note}` : ''}</div>
                              </div>
                              <div style={{ textAlign: 'right' }}>
                                <div>{match.category}</div>
                                <div className="subtle" style={{ fontSize: '0.8rem' }}>{match.acceptance}%</div>
                                <div className="subtle" style={{ fontSize: '0.72rem' }}>{match.note}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="subtle" style={{ marginTop: '0.5rem' }}>No {groupKey.toLowerCase()} matches for this score range.</p>
                      )}
                    </div>
                  ))}
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
                  <p>PSAT is optional but now helps create a SAT baseline when SAT scores are missing. If both SAT and PSAT are entered, SAT remains primary and PSAT refines the projected range.</p>
                </div>
              </div>
            )}
          </div>
          <div className="card">
            <h2>SAT forecast</h2>
            <div className="bar-graph">
              <div className="bar-row">
                <span>Baseline</span>
                <div>
                  <div className="bar-track"><div className="bar-fill user" style={{ width: styleWidth(activeBaselineScore ?? 0, 1600) }} /></div>
                  <div className="bar-label">{activeBaselineScore ?? '-'} / 1600</div>
                </div>
              </div>
              {baselineSource && (
                <div className="bar-row">
                  <span>Baseline source</span>
                  <div>
                    <div className="bar-track"><div className="bar-fill" style={{ width: '100%', background: 'rgba(209,213,219,0.35)' }} /></div>
                    <div className="bar-label">{baselineSource}</div>
                  </div>
                </div>
              )}
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
                here's your projected SAT score growth trajectory.
              </p>
              <p>The optimistic scenario assumes consistent effort and good study habits. The conservative scenario accounts for typical challenges and plateaus.</p>
            </div>
            <div style={{ overflowX: 'auto', marginTop: '1rem' }}>
              <table style={{ width: '100%', minWidth: '620px', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Timeline</th>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Total Hours</th>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Daily Intensity</th>
                    <th style={{ padding: '0.75rem 0.5rem' }}>UNIS Student Profile</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ padding: '0.75rem 0.5rem' }}>0 Weeks</td>
                    <td style={{ padding: '0.75rem 0.5rem' }}>0</td>
                    <td style={{ padding: '0.75rem 0.5rem' }}>0 hrs</td>
                    <td style={{ padding: '0.75rem 0.5rem' }}>The Baseline: Seeing where your IB classes naturally put you (usually 1200+)</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '0.75rem 0.5rem' }}>2 Weeks</td>
                    <td style={{ padding: '0.75rem 0.5rem' }}>~14</td>
                    <td style={{ padding: '0.75rem 0.5rem' }}>&lt; 1 hr</td>
                    <td style={{ padding: '0.75rem 0.5rem' }}>The Light Refresher: Just a few practice sets to learn the digital interface</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '0.75rem 0.5rem' }}>4 Weeks</td>
                    <td style={{ padding: '0.75rem 0.5rem' }}>~25</td>
                    <td style={{ padding: '0.75rem 0.5rem' }}>~1 hr</td>
                    <td style={{ padding: '0.75rem 0.5rem' }}>The Quick Fix: Brushing up on a few specific math rules or grammar tips</td>
                  </tr>
                  <tr style={{ background: 'rgba(198,255,211,0.8)' }}>
                    <td style={{ padding: '0.75rem 0.5rem', fontWeight: 700 }}>6 Weeks</td>
                    <td style={{ padding: '0.75rem 0.5rem' }}>~40</td>
                    <td style={{ padding: '0.75rem 0.5rem' }}>1–3 hrs</td>
                    <td style={{ padding: '0.75rem 0.5rem' }}>The Realistic Sprint: Moderate daily work to bridge a 50–70 point gap</td>
                  </tr>
                  <tr style={{ background: 'rgba(220,247,233,0.65)' }}>
                    <td style={{ padding: '0.75rem 0.5rem', fontWeight: 700 }}>8 Weeks</td>
                    <td style={{ padding: '0.75rem 0.5rem', fontWeight: 700 }}>~60</td>
                    <td style={{ padding: '0.75rem 0.5rem', fontWeight: 700 }}>1–3 hrs</td>
                    <td style={{ padding: '0.75rem 0.5rem', fontWeight: 700 }}>The Balanced Path: The "sweet spot" for most UNIS juniors to hit the 1370</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '0.75rem 0.5rem' }}>12 Weeks</td>
                    <td style={{ padding: '0.75rem 0.5rem' }}>~85</td>
                    <td style={{ padding: '0.75rem 0.5rem' }}>1–3 hrs</td>
                    <td style={{ padding: '0.75rem 0.5rem' }}>The Steady Climber: Long-term mastery without burning out on IB work</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '0.75rem 0.5rem' }}>16 Weeks</td>
                    <td style={{ padding: '0.75rem 0.5rem' }}>~110</td>
                    <td style={{ padding: '0.75rem 0.5rem' }}>1–3 hrs</td>
                    <td style={{ padding: '0.75rem 0.5rem' }}>The Elite Goal: For students aiming for 1500+ (well above the school average)</td>
                  </tr>
                </tbody>
              </table>
            </div>
            {activeBaselineScore === null ? (
              <p className="subtle" style={{ marginTop: '1rem' }}>Select an SAT score or enter PSAT input to see progression projections.</p>
            ) : (
              <div className="progression-chart">
                <div className="progression-row header" style={{ fontWeight: 700 }}>
                  <span>Interval</span>
                  <span>Strong</span>
                  <span>Conservative</span>
                </div>
                {Array.from({ length: 5 }, (_, idx) => {
                  const label = idx === 0 ? 'Start' : `${idx * 2} weeks`;
                  const strongScore = strongSatProgression[idx] ?? strongSatProgression[strongSatProgression.length - 1] ?? activeBaselineScore;
                  const conservativeScore = conservativeSatProgression[idx] ?? conservativeSatProgression[conservativeSatProgression.length - 1] ?? activeBaselineScore;
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
                  <span>Optimistic: {strongSatProgression[strongSatProgression.length - 1] ?? activeBaselineScore} (+{((strongSatProgression[strongSatProgression.length - 1] ?? activeBaselineScore) - (activeBaselineScore ?? 0))})</span>
                  <span>Conservative: {conservativeSatProgression[conservativeSatProgression.length - 1] ?? activeBaselineScore} (+{((conservativeSatProgression[conservativeSatProgression.length - 1] ?? activeBaselineScore) - (activeBaselineScore ?? 0))})</span>
                </div>
              </div>
            )}
          </div>

          <div className="card" style={{ gridColumn: '1 / -1' }}>
            <h2>Find My Test Center</h2>
            <div className="info-box" style={{ marginTop: '1rem' }}>
              <p>This is currently under development!</p>
            </div>
            <div className="mini-row" style={{ marginTop: '1rem', gap: '0.75rem', flexWrap: 'wrap' }}>
              <input
                value={testZip}
                disabled
                placeholder="Zip code"
                style={{ flex: 1, background: 'rgba(229,231,235,0.5)', color: '#6b7280' }}
              />
              <button type="button" disabled style={{ opacity: 0.65, cursor: 'not-allowed' }}>Update</button>
            </div>
            <p className="subtle" style={{ marginTop: '0.75rem' }}>Test center recommendations are paused until this feature is ready.</p>
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


    </div>
  );
}

export default App;
