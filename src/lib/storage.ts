import type { DuelStats, IBCourseSelection, SatActData, UserProfile } from '../types';

const STORAGE = {
  profile: 'gradepilot-profile',
  ibCourses: 'gradepilot-ib-courses',
  customCourse: 'gradepilot-ib-custom',
  satAct: 'gradepilot-sat-act',
  testZip: 'gradepilot-test-zip',
  friends: 'gradepilot-friends',
  requests: 'gradepilot-requests',
  stats: 'gradepilot-dual-stats'
};

function safeParse<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function loadUserProfile(): UserProfile | null {
  if (typeof window === 'undefined') return null;
  return safeParse(localStorage.getItem(STORAGE.profile), null);
}

export function saveUserProfile(profile: UserProfile) {
  localStorage.setItem(STORAGE.profile, JSON.stringify(profile));
}

export function loadIBCourses(): IBCourseSelection[] {
  return safeParse(localStorage.getItem(STORAGE.ibCourses), []);
}

export function saveIBCourses(courses: IBCourseSelection[]) {
  localStorage.setItem(STORAGE.ibCourses, JSON.stringify(courses));
}

export function loadCustomCourse(): string {
  return safeParse(localStorage.getItem(STORAGE.customCourse), '');
}

export function saveCustomCourse(name: string) {
  localStorage.setItem(STORAGE.customCourse, JSON.stringify(name));
}

export function loadSatAct(): SatActData {
  return safeParse(localStorage.getItem(STORAGE.satAct), {
    psat: null,
    psatMath: null,
    psatEnglish: null,
    sat: null,
    act: null,
    satHistory: [],
    activeSatAttemptId: null
  });
}

export function saveSatAct(data: SatActData) {
  localStorage.setItem(STORAGE.satAct, JSON.stringify(data));
}

export function loadTestZip(): string {
  return safeParse(localStorage.getItem(STORAGE.testZip), '10010');
}

export function saveTestZip(zip: string) {
  localStorage.setItem(STORAGE.testZip, JSON.stringify(zip));
}

export function loadFriends(): string[] {
  return safeParse(localStorage.getItem(STORAGE.friends), []);
}

export function saveFriends(friends: string[]) {
  localStorage.setItem(STORAGE.friends, JSON.stringify(friends));
}

export function loadRequests(): { incoming: string[]; outgoing: string[] } {
  return safeParse(localStorage.getItem(STORAGE.requests), { incoming: [], outgoing: [] });
}

export function saveRequests(requests: { incoming: string[]; outgoing: string[] }) {
  localStorage.setItem(STORAGE.requests, JSON.stringify(requests));
}

export function loadDualStats(): DuelStats {
  return safeParse(localStorage.getItem(STORAGE.stats), { wins: 0, losses: 0, elo: 1200, streak: 0 });
}

export function saveDualStats(stats: DuelStats) {
  localStorage.setItem(STORAGE.stats, JSON.stringify(stats));
}
