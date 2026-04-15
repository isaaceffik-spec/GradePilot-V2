export type IBSubjectOption = {
  id: string;
  name: string;
  group: string;
  level: 'HL' | 'SL' | 'Both';
  category: 'languages' | 'sciences' | 'humanities' | 'mathematics' | 'arts' | 'interdisciplinary';
  difficulty: number;
  benchmark: number;
};

export const ibSubjectGroups = [
  { key: 'Group 1', label: 'Studies in Language and Literature' },
  { key: 'Group 2', label: 'Language Acquisition' },
  { key: 'Group 3', label: 'Individuals and Societies' },
  { key: 'Group 4', label: 'Sciences' },
  { key: 'Group 5', label: 'Mathematics' },
  { key: 'Group 6', label: 'The Arts' },
  { key: 'Interdisciplinary', label: 'Interdisciplinary' }
];

export const ibCourseOptions: IBSubjectOption[] = [
  // Group 1: Studies in Language and Literature
  { id: 'en-lit-hl', name: 'English A: Language and Literature (HL)', group: 'Group 1', level: 'HL', category: 'languages', difficulty: 1.05, benchmark: 4.95 },
  { id: 'en-lit-sl', name: 'English A: Language and Literature (SL)', group: 'Group 1', level: 'SL', category: 'languages', difficulty: 1.0, benchmark: 4.85 },
  { id: 'en-literature-hl', name: 'English A: Literature (HL)', group: 'Group 1', level: 'HL', category: 'languages', difficulty: 1.05, benchmark: 5.0 },
  { id: 'en-literature-sl', name: 'English A: Literature (SL)', group: 'Group 1', level: 'SL', category: 'languages', difficulty: 1.0, benchmark: 4.9 },
  { id: 'spa-a-hl', name: 'Spanish A (HL)', group: 'Group 1', level: 'HL', category: 'languages', difficulty: 1.05, benchmark: 4.8 },
  { id: 'spa-a-sl', name: 'Spanish A (SL)', group: 'Group 1', level: 'SL', category: 'languages', difficulty: 1.0, benchmark: 4.7 },
  { id: 'fra-a-hl', name: 'French A (HL)', group: 'Group 1', level: 'HL', category: 'languages', difficulty: 1.05, benchmark: 4.8 },
  { id: 'fra-a-sl', name: 'French A (SL)', group: 'Group 1', level: 'SL', category: 'languages', difficulty: 1.0, benchmark: 4.7 },
  { id: 'ger-a-hl', name: 'German A (HL)', group: 'Group 1', level: 'HL', category: 'languages', difficulty: 1.05, benchmark: 4.8 },
  { id: 'ger-a-sl', name: 'German A (SL)', group: 'Group 1', level: 'SL', category: 'languages', difficulty: 1.0, benchmark: 4.7 },
  { id: 'jpn-a-hl', name: 'Japanese A (HL)', group: 'Group 1', level: 'HL', category: 'languages', difficulty: 1.08, benchmark: 5.1 },
  { id: 'jpn-a-sl', name: 'Japanese A (SL)', group: 'Group 1', level: 'SL', category: 'languages', difficulty: 1.03, benchmark: 5.0 },
  { id: 'man-a-hl', name: 'Mandarin A (HL)', group: 'Group 1', level: 'HL', category: 'languages', difficulty: 1.08, benchmark: 5.1 },
  { id: 'man-a-sl', name: 'Mandarin A (SL)', group: 'Group 1', level: 'SL', category: 'languages', difficulty: 1.03, benchmark: 5.0 },
  { id: 'ara-a-hl', name: 'Arabic A (HL)', group: 'Group 1', level: 'HL', category: 'languages', difficulty: 1.08, benchmark: 5.0 },
  { id: 'ara-a-sl', name: 'Arabic A (SL)', group: 'Group 1', level: 'SL', category: 'languages', difficulty: 1.03, benchmark: 4.9 },
  { id: 'rus-a-hl', name: 'Russian A (HL)', group: 'Group 1', level: 'HL', category: 'languages', difficulty: 1.08, benchmark: 5.0 },
  { id: 'rus-a-sl', name: 'Russian A (SL)', group: 'Group 1', level: 'SL', category: 'languages', difficulty: 1.03, benchmark: 4.9 },
  { id: 'ita-a-hl', name: 'Italian A (HL)', group: 'Group 1', level: 'HL', category: 'languages', difficulty: 1.05, benchmark: 4.8 },
  { id: 'ita-a-sl', name: 'Italian A (SL)', group: 'Group 1', level: 'SL', category: 'languages', difficulty: 1.0, benchmark: 4.7 },

  // Group 2: Language Acquisition - Language B (HL/SL)
  { id: 'spa-b-hl', name: 'Spanish B (HL)', group: 'Group 2', level: 'HL', category: 'languages', difficulty: 1.04, benchmark: 4.7 },
  { id: 'spa-b-sl', name: 'Spanish B (SL)', group: 'Group 2', level: 'SL', category: 'languages', difficulty: 0.98, benchmark: 4.6 },
  { id: 'fra-b-hl', name: 'French B (HL)', group: 'Group 2', level: 'HL', category: 'languages', difficulty: 1.04, benchmark: 4.7 },
  { id: 'fra-b-sl', name: 'French B (SL)', group: 'Group 2', level: 'SL', category: 'languages', difficulty: 0.98, benchmark: 4.6 },
  { id: 'ger-b-hl', name: 'German B (HL)', group: 'Group 2', level: 'HL', category: 'languages', difficulty: 1.04, benchmark: 4.7 },
  { id: 'ger-b-sl', name: 'German B (SL)', group: 'Group 2', level: 'SL', category: 'languages', difficulty: 0.98, benchmark: 4.6 },
  { id: 'jpn-b-hl', name: 'Japanese B (HL)', group: 'Group 2', level: 'HL', category: 'languages', difficulty: 1.06, benchmark: 4.8 },
  { id: 'jpn-b-sl', name: 'Japanese B (SL)', group: 'Group 2', level: 'SL', category: 'languages', difficulty: 1.0, benchmark: 4.7 },
  { id: 'man-b-hl', name: 'Mandarin B (HL)', group: 'Group 2', level: 'HL', category: 'languages', difficulty: 1.06, benchmark: 4.8 },
  { id: 'man-b-sl', name: 'Mandarin B (SL)', group: 'Group 2', level: 'SL', category: 'languages', difficulty: 1.0, benchmark: 4.7 },
  { id: 'ara-b-hl', name: 'Arabic B (HL)', group: 'Group 2', level: 'HL', category: 'languages', difficulty: 1.06, benchmark: 4.75 },
  { id: 'ara-b-sl', name: 'Arabic B (SL)', group: 'Group 2', level: 'SL', category: 'languages', difficulty: 1.0, benchmark: 4.65 },
  { id: 'rus-b-hl', name: 'Russian B (HL)', group: 'Group 2', level: 'HL', category: 'languages', difficulty: 1.06, benchmark: 4.75 },
  { id: 'rus-b-sl', name: 'Russian B (SL)', group: 'Group 2', level: 'SL', category: 'languages', difficulty: 1.0, benchmark: 4.65 },
  { id: 'ita-b-hl', name: 'Italian B (HL)', group: 'Group 2', level: 'HL', category: 'languages', difficulty: 1.04, benchmark: 4.7 },
  { id: 'ita-b-sl', name: 'Italian B (SL)', group: 'Group 2', level: 'SL', category: 'languages', difficulty: 0.98, benchmark: 4.6 },
  { id: 'kor-b-hl', name: 'Korean B (HL)', group: 'Group 2', level: 'HL', category: 'languages', difficulty: 1.06, benchmark: 4.75 },
  { id: 'kor-b-sl', name: 'Korean B (SL)', group: 'Group 2', level: 'SL', category: 'languages', difficulty: 1.0, benchmark: 4.65 },

  // Group 2: Language Acquisition - Language ab initio (SL only)
  { id: 'spa-ab-sl', name: 'Spanish ab initio (SL)', group: 'Group 2', level: 'SL', category: 'languages', difficulty: 0.95, benchmark: 4.5 },
  { id: 'fra-ab-sl', name: 'French ab initio (SL)', group: 'Group 2', level: 'SL', category: 'languages', difficulty: 0.95, benchmark: 4.5 },
  { id: 'ger-ab-sl', name: 'German ab initio (SL)', group: 'Group 2', level: 'SL', category: 'languages', difficulty: 0.95, benchmark: 4.5 },
  { id: 'jpn-ab-sl', name: 'Japanese ab initio (SL)', group: 'Group 2', level: 'SL', category: 'languages', difficulty: 1.0, benchmark: 4.6 },
  { id: 'man-ab-sl', name: 'Mandarin ab initio (SL)', group: 'Group 2', level: 'SL', category: 'languages', difficulty: 1.0, benchmark: 4.6 },
  { id: 'ara-ab-sl', name: 'Arabic ab initio (SL)', group: 'Group 2', level: 'SL', category: 'languages', difficulty: 1.0, benchmark: 4.55 },
  { id: 'rus-ab-sl', name: 'Russian ab initio (SL)', group: 'Group 2', level: 'SL', category: 'languages', difficulty: 1.0, benchmark: 4.55 },
  { id: 'ita-ab-sl', name: 'Italian ab initio (SL)', group: 'Group 2', level: 'SL', category: 'languages', difficulty: 0.95, benchmark: 4.5 },
  { id: 'kor-ab-sl', name: 'Korean ab initio (SL)', group: 'Group 2', level: 'SL', category: 'languages', difficulty: 1.0, benchmark: 4.55 },

  // Group 3: Individuals and Societies
  { id: 'history-hl', name: 'History (HL)', group: 'Group 3', level: 'HL', category: 'humanities', difficulty: 1.04, benchmark: 4.5 },
  { id: 'history-sl', name: 'History (SL)', group: 'Group 3', level: 'SL', category: 'humanities', difficulty: 0.99, benchmark: 4.4 },
  { id: 'geo-hl', name: 'Geography (HL)', group: 'Group 3', level: 'HL', category: 'humanities', difficulty: 1.04, benchmark: 4.6 },
  { id: 'geo-sl', name: 'Geography (SL)', group: 'Group 3', level: 'SL', category: 'humanities', difficulty: 0.99, benchmark: 4.5 },
  { id: 'eco-hl', name: 'Economics (HL)', group: 'Group 3', level: 'HL', category: 'humanities', difficulty: 1.06, benchmark: 4.8 },
  { id: 'eco-sl', name: 'Economics (SL)', group: 'Group 3', level: 'SL', category: 'humanities', difficulty: 1.0, benchmark: 4.7 },
  { id: 'psy-hl', name: 'Psychology (HL)', group: 'Group 3', level: 'HL', category: 'humanities', difficulty: 1.03, benchmark: 4.65 },
  { id: 'psy-sl', name: 'Psychology (SL)', group: 'Group 3', level: 'SL', category: 'humanities', difficulty: 0.98, benchmark: 4.55 },
  { id: 'business-hl', name: 'Business Management (HL)', group: 'Group 3', level: 'HL', category: 'humanities', difficulty: 1.03, benchmark: 4.6 },
  { id: 'business-sl', name: 'Business Management (SL)', group: 'Group 3', level: 'SL', category: 'humanities', difficulty: 0.98, benchmark: 4.5 },
  { id: 'geopol-hl', name: 'Global Politics (HL)', group: 'Group 3', level: 'HL', category: 'humanities', difficulty: 1.04, benchmark: 4.55 },
  { id: 'geopol-sl', name: 'Global Politics (SL)', group: 'Group 3', level: 'SL', category: 'humanities', difficulty: 0.99, benchmark: 4.45 },
  { id: 'phil-hl', name: 'Philosophy (HL)', group: 'Group 3', level: 'HL', category: 'humanities', difficulty: 1.05, benchmark: 4.7 },
  { id: 'phil-sl', name: 'Philosophy (SL)', group: 'Group 3', level: 'SL', category: 'humanities', difficulty: 1.0, benchmark: 4.6 },
  { id: 'anth-hl', name: 'Anthropology (HL)', group: 'Group 3', level: 'HL', category: 'humanities', difficulty: 1.04, benchmark: 4.6 },
  { id: 'anth-sl', name: 'Anthropology (SL)', group: 'Group 3', level: 'SL', category: 'humanities', difficulty: 0.99, benchmark: 4.5 },

  // Group 4: Sciences
  { id: 'bio-hl', name: 'Biology (HL)', group: 'Group 4', level: 'HL', category: 'sciences', difficulty: 1.06, benchmark: 4.85 },
  { id: 'bio-sl', name: 'Biology (SL)', group: 'Group 4', level: 'SL', category: 'sciences', difficulty: 1.0, benchmark: 4.75 },
  { id: 'chem-hl', name: 'Chemistry (HL)', group: 'Group 4', level: 'HL', category: 'sciences', difficulty: 1.07, benchmark: 4.75 },
  { id: 'chem-sl', name: 'Chemistry (SL)', group: 'Group 4', level: 'SL', category: 'sciences', difficulty: 1.01, benchmark: 4.65 },
  { id: 'phys-hl', name: 'Physics (HL)', group: 'Group 4', level: 'HL', category: 'sciences', difficulty: 1.08, benchmark: 4.7 },
  { id: 'phys-sl', name: 'Physics (SL)', group: 'Group 4', level: 'SL', category: 'sciences', difficulty: 1.02, benchmark: 4.6 },
  { id: 'cs-hl', name: 'Computer Science (HL)', group: 'Group 4', level: 'HL', category: 'sciences', difficulty: 1.07, benchmark: 4.8 },
  { id: 'cs-sl', name: 'Computer Science (SL)', group: 'Group 4', level: 'SL', category: 'sciences', difficulty: 1.01, benchmark: 4.7 },
  { id: 'dt-hl', name: 'Design Technology (HL)', group: 'Group 4', level: 'HL', category: 'sciences', difficulty: 1.05, benchmark: 4.65 },
  { id: 'dt-sl', name: 'Design Technology (SL)', group: 'Group 4', level: 'SL', category: 'sciences', difficulty: 0.99, benchmark: 4.55 },
  { id: 'sehs-hl', name: 'Sports Exercise and Health Science (HL)', group: 'Group 4', level: 'HL', category: 'sciences', difficulty: 1.03, benchmark: 4.7 },
  { id: 'sehs-sl', name: 'Sports Exercise and Health Science (SL)', group: 'Group 4', level: 'SL', category: 'sciences', difficulty: 0.98, benchmark: 4.6 },

  // Group 5: Mathematics
  { id: 'math-aa-hl', name: 'Mathematics: Analysis and Approaches (HL)', group: 'Group 5', level: 'HL', category: 'mathematics', difficulty: 1.08, benchmark: 4.55 },
  { id: 'math-aa-sl', name: 'Mathematics: Analysis and Approaches (SL)', group: 'Group 5', level: 'SL', category: 'mathematics', difficulty: 1.02, benchmark: 4.45 },
  { id: 'math-ai-hl', name: 'Mathematics: Applications and Interpretation (HL)', group: 'Group 5', level: 'HL', category: 'mathematics', difficulty: 1.06, benchmark: 4.5 },
  { id: 'math-ai-sl', name: 'Mathematics: Applications and Interpretation (SL)', group: 'Group 5', level: 'SL', category: 'mathematics', difficulty: 1.0, benchmark: 4.4 },

  // Group 6: The Arts
  { id: 'va-hl', name: 'Visual Arts (HL)', group: 'Group 6', level: 'HL', category: 'arts', difficulty: 1.02, benchmark: 4.35 },
  { id: 'va-sl', name: 'Visual Arts (SL)', group: 'Group 6', level: 'SL', category: 'arts', difficulty: 0.97, benchmark: 4.25 },
  { id: 'theatre-hl', name: 'Theatre (HL)', group: 'Group 6', level: 'HL', category: 'arts', difficulty: 1.02, benchmark: 4.4 },
  { id: 'theatre-sl', name: 'Theatre (SL)', group: 'Group 6', level: 'SL', category: 'arts', difficulty: 0.97, benchmark: 4.3 },
  { id: 'film-hl', name: 'Film (HL)', group: 'Group 6', level: 'HL', category: 'arts', difficulty: 1.02, benchmark: 4.35 },
  { id: 'film-sl', name: 'Film (SL)', group: 'Group 6', level: 'SL', category: 'arts', difficulty: 0.97, benchmark: 4.25 },
  { id: 'music-hl', name: 'Music (HL)', group: 'Group 6', level: 'HL', category: 'arts', difficulty: 1.03, benchmark: 4.45 },
  { id: 'music-sl', name: 'Music (SL)', group: 'Group 6', level: 'SL', category: 'arts', difficulty: 0.98, benchmark: 4.35 },
  { id: 'dance-hl', name: 'Dance (HL)', group: 'Group 6', level: 'HL', category: 'arts', difficulty: 1.02, benchmark: 4.4 },
  { id: 'dance-sl', name: 'Dance (SL)', group: 'Group 6', level: 'SL', category: 'arts', difficulty: 0.97, benchmark: 4.3 },

  // Interdisciplinary
  { id: 'ess-sl', name: 'Environmental Systems and Societies (SL)', group: 'Group 3', level: 'SL', category: 'humanities', difficulty: 1.0, benchmark: 4.55 },
  { id: 'tok', name: 'Theory of Knowledge', group: 'Interdisciplinary', level: 'Both', category: 'interdisciplinary', difficulty: 1.0, benchmark: 4.9 }
];

export const ibGroupAverages: Record<string, number> = {
  'Group 1': 4.85,
  'Group 2': 4.65,
  'Group 3': 4.55,
  'Group 4': 4.72,
  'Group 5': 4.48,
  'Group 6': 4.33,
  'Interdisciplinary': 4.72
};

export const globalIBAverage = 4.6;
export const unisIBAverage = 5.67;
export const unisTotalAverage = 34;
export const globalTotalAverage = 30.58;
