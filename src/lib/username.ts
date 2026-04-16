const adjectives = [
  'blue', 'solar', 'prime', 'quiet', 'swift', 'brave', 'neon', 'lunar', 'crimson', 'verdant',
  'stellar', 'amber', 'rapid', 'silent', 'bold', 'glow', 'icy', 'golden', 'fierce', 'deep'
];

const nouns = [
  'tiger', 'wave', 'comet', 'meadow', 'oracle', 'flame', 'phoenix', 'shadow', 'voyage', 'paper',
  'canyon', 'spark', 'circuit', 'harbor', 'whisper', 'rocket', 'mirror', 'relay', 'ember', 'ripple'
];

const extras = [
  'storm', 'pulse', 'beam', 'stream', 'horizon', 'trail', 'field', 'cascade', 'quest', 'sparkle',
  'drift', 'quest', 'zenith', 'echo', 'novel', 'fiber', 'cipher', 'groove', 'atlas', 'spectrum'
];

function randomItem(list: string[]) {
  return list[Math.floor(Math.random() * list.length)];
}

export function normalizeUsername(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[^a-z0-9]/g, '');
}

export function generateUsername() {
  return [randomItem(adjectives), randomItem(nouns), randomItem(extras), randomItem(extras)]
    .map((word) => word.toLowerCase())
    .join('-');
}

export function generateUsernameFromProfile(year: number, firstName: string, lastName: string) {
  const yearSuffix = year.toString().slice(-2);
  const firstInitial = firstName.charAt(0);
  const raw = `${yearSuffix}${firstInitial}${lastName}`;
  return normalizeUsername(raw);
}

export function uniqueUsername(base: string, existing: string[]) {
  const normalizedBase = normalizeUsername(base);
  if (!existing.includes(normalizedBase)) return normalizedBase;

  let suffix = 1;
  while (existing.includes(`${normalizedBase}${suffix}`)) {
    suffix += 1;
  }
  return `${normalizedBase}${suffix}`;
}
