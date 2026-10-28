/** Server-side copy of the curriculum constants (codes must match src/lib/curriculum.ts). */

export const PRIMARY_SUBJECTS = [
  { id: 'math_p', name: 'Mathematics', code: 'MAT001', level: 'Primary' },
  { id: 'eng_p', name: 'English Language', code: 'ENG002', level: 'Primary' },
  { id: 'kis_p', name: 'Kiswahili / KSL', code: 'KIS003', level: 'Primary' },
  { id: 'env_p', name: 'Environmental Activities', code: 'ENV004', level: 'Primary' },
  { id: 'rel_p', name: 'Religious Education', code: 'CRE005', level: 'Primary' },
  { id: 'crt_p', name: 'Creative Arts & Movement', code: 'CAM006', level: 'Primary' },
];

export const JSS_SUBJECTS = [
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

export const ALL_SUBJECTS = [...PRIMARY_SUBJECTS, ...JSS_SUBJECTS];
export const SUBJECT_BY_ID = Object.fromEntries(ALL_SUBJECTS.map((s) => [s.id, s]));

export const PRIMARY_GRADES = ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6'];

export function subjectsForGrade(gradeLevel) {
  return PRIMARY_GRADES.includes(gradeLevel) ? PRIMARY_SUBJECTS : JSS_SUBJECTS;
}

export function rubricFor(score) {
  if (score >= 80) return { rubric: 'EE', points: 4 };
  if (score >= 60) return { rubric: 'ME', points: 3 };
  if (score >= 40) return { rubric: 'AE', points: 2 };
  return { rubric: 'BE', points: 1 };
}

export const PLAN_SPECS = {
  trial: { name: 'Starter Trial', maxLearners: 60, whatsapp: false, exportCsv: false, streams: 1 },
  standard: { name: 'School Standard', maxLearners: 600, whatsapp: true, exportCsv: true, streams: 6 },
  premium: { name: 'Campus Premium', maxLearners: 100000, whatsapp: true, exportCsv: true, streams: 99 },
};
