export interface Subject {
  id: string;
  name: string;
  code: string;
  level: 'Primary' | 'JSS';
}

export const PRIMARY_SUBJECTS: Subject[] = [
  { id: 'math_p', name: 'Mathematics', code: 'MAT001', level: 'Primary' },
  { id: 'eng_p', name: 'English Language', code: 'ENG002', level: 'Primary' },
  { id: 'kis_p', name: 'Kiswahili / KSL', code: 'KIS003', level: 'Primary' },
  { id: 'env_p', name: 'Environmental Activities', code: 'ENV004', level: 'Primary' },
  { id: 'rel_p', name: 'Religious Education', code: 'CRE005', level: 'Primary' },
  { id: 'crt_p', name: 'Creative Arts & Movement', code: 'CAM006', level: 'Primary' },
];

export const JSS_SUBJECTS: Subject[] = [
  { id: 'eng', name: 'English Language', code: 'ENG101', level: 'JSS' },
  { id: 'kis', name: 'Kiswahili', code: 'KIS102', level: 'JSS' },
  { id: 'math', name: 'Mathematics', code: 'MAT103', level: 'JSS' },
  { id: 'isci', name: 'Integrated Science', code: 'SCI104', level: 'JSS' },
  { id: 'sost', name: 'Social Studies', code: 'SST105', level: 'JSS' },
  { id: 'agri', name: 'Agriculture & Nutrition', code: 'AGN106', level: 'JSS' },
  { id: 'ptech', name: 'Pre-Technical Studies', code: 'PTS107', level: 'JSS' },
  { id: 'arts', name: 'Creative Arts & Sports', code: 'CAS108', level: 'JSS' },
  { id: 'reled', name: 'Religious Education (CRE)', code: 'CRE109', level: 'JSS' },
];

export const STREAMS = [
  'Grade 1 Alpha', 'Grade 2 Beta', 'Grade 3 Gamma',
  'Grade 4 Delta', 'Grade 5 Epsilon', 'Grade 6 Zeta',
  'Grade 7 Eta', 'Grade 8 Theta', 'Grade 9 Iota',
] as const;

export const GRADES = [
  'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5',
  'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9',
] as const;

export const PRIMARY_GRADES = ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6'];

export const GRADE_MILESTONES: Record<string, { stage: string; assessment: string; focus: string }> = {
  'Grade 1': { stage: 'Lower Primary', assessment: 'Formative Qualitative Assessment', focus: 'Foundational Literacy, Numeracy & Social Skills' },
  'Grade 2': { stage: 'Lower Primary', assessment: 'Internal School-Based Assessment', focus: 'Consolidation of Basic Literacy & Numeracy' },
  'Grade 3': { stage: 'Lower Primary', assessment: 'KEYA Early Years Progress Monitoring', focus: 'Early Years Foundation & Environment Literacy' },
  'Grade 4': { stage: 'Upper Primary', assessment: 'SBA Portfolio & Project Rubrics', focus: 'Introduction to Agriculture, Science & Digital Literacy' },
  'Grade 5': { stage: 'Upper Primary', assessment: 'Continuous Assessment Tests (CATs)', focus: 'Problem Solving, Crafts & Practical Projects' },
  'Grade 6': { stage: 'Upper Primary', assessment: 'KPSEA National & School Evaluation', focus: 'Primary Level Summary & Practical Inquiry' },
  'Grade 7': { stage: 'Junior Secondary', assessment: 'JSS School-Based Assessment', focus: 'Pre-Technical Studies & Integrated Sciences' },
  'Grade 8': { stage: 'Junior Secondary', assessment: 'JSS Formative Continuous Assessment', focus: 'Career Exploration, STEM & Creative Arts' },
  'Grade 9': { stage: 'Junior Secondary', assessment: 'KJSEA Comprehensive Assessment', focus: 'Senior High Pathway Selection & Career Profiling' },
};

export function subjectsForGrade(gradeLevel: string): Subject[] {
  return PRIMARY_GRADES.includes(gradeLevel) ? PRIMARY_SUBJECTS : JSS_SUBJECTS;
}

export function subjectsForStream(stream: string): Subject[] {
  const grade = stream.split(' ').slice(0, 2).join(' ');
  return subjectsForGrade(grade);
}

/** KNEC competency rubric bands: EE / ME / AE / BE -> 4 / 3 / 2 / 1 points. */
export function rubricFor(score: number): { rubric: string; points: number } {
  if (score >= 80) return { rubric: 'EE', points: 4 };
  if (score >= 60) return { rubric: 'ME', points: 3 };
  if (score >= 40) return { rubric: 'AE', points: 2 };
  return { rubric: 'BE', points: 1 };
}

export const RUBRIC_LABELS: Record<string, string> = {
  EE: 'Exceeding Expectation',
  ME: 'Meeting Expectation',
  AE: 'Approaching Expectation',
  BE: 'Below Expectation',
};

export function gradeLevelForStream(stream: string): string {
  return stream.split(' ').slice(0, 2).join(' ');
}

/** Last 10 weekdays as ISO days (the current term register). */
export function termDays(): { iso: string; label: string }[] {
  const days: { iso: string; label: string }[] = [];
  const cursor = new Date();
  while (days.length < 10) {
    const dow = cursor.getDay();
    if (dow !== 0 && dow !== 6) {
      const iso = cursor.toISOString().slice(0, 10);
      days.push({
        iso,
        label: cursor.toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit' }),
      });
    }
    cursor.setDate(cursor.getDate() - 1);
  }
  return days.reverse();
}

export const PATHWAY_RULES: { id: string; name: string; subjects: string[]; blurb: string }[] = [
  {
    id: 'stem',
    name: 'STEM Pathway',
    subjects: ['math', 'isci', 'agri', 'ptech', 'math_p', 'env_p'],
    blurb: 'Recommended based on strong performance in Mathematics, Integrated Science, and Agriculture.',
  },
  {
    id: 'social',
    name: 'Social Sciences',
    subjects: ['sost', 'kis', 'eng', 'reled', 'kis_p', 'eng_p', 'rel_p'],
    blurb: 'Solid aptitude in Social Studies, Languages, and Religious Education.',
  },
  {
    id: 'arts',
    name: 'Arts & Sports Science',
    subjects: ['arts', 'crt_p', 'eng_p', 'kis_p'],
    blurb: 'Good creativity in Creative Arts and Sports activities.',
  },
];
export const SUBJECT_BY_ID = Object.fromEntries([...PRIMARY_SUBJECTS, ...JSS_SUBJECTS].map(s => [s.id, s]));
