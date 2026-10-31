export type Plan = 'trial' | 'standard' | 'premium';

export interface SessionUser {
  sub: string;
  name: string;
  email: string;
}

export interface Tenant {
  id: string;
  name: string;
  plan: Plan;
  owner_sub: string;
}

export type Role = 'guest' | 'admin' | 'teacher';

/** A teacher's account created by the admin. */
export interface StaffLogin {
  id: string;
  name: string;
  username: string;
  mustChangeLogin: boolean;
}

export interface Session {
  authenticated: boolean;
  user: SessionUser | null;
  tenant: Tenant | null;
  /** 'admin' owns the school; 'teacher' sees only what the admin granted. */
  role: Role;
  /** Service keys the account may open (admin: all of them). */
  services: string[];
  /** Teacher's assigned classes; null = admin, every class in the school. */
  streams: string[] | null;
  staff: StaffLogin | null;
}

export interface StaffMember {
  id: string;
  name: string;
  username: string;
  mustChangeLogin: boolean;
  active: boolean;
  createdAt: string;
  classes: string[];
  services: string[];
}

export interface LessonPlanSection {
  key: string;
  label: string;
}

export interface LessonPlanTemplate {
  name: string;
  sections: LessonPlanSection[];
}

export interface LessonPlan {
  id: string;
  staffId: string;
  author: string;
  stream: string;
  subjectId: string;
  lessonDate: string;
  topic: string;
  subStrand: string;
  content: Record<string, string>;
  updatedAt: string;
}

export interface SchemeRow {
  id: string;
  staffId: string;
  author: string;
  stream: string;
  subjectId: string;
  term: string;
  week: number;
  strand: string;
  subStrand: string;
  outcomes: string;
  experiences: string;
  inquiry: string;
  resources: string;
  assessment: string;
  remarks: string;
  updatedAt: string;
}

export interface TimetablePeriod {
  position: number;
  label: string;
  startsAt: string;
  endsAt: string;
}

export interface TimetableEntry {
  id: string;
  day: string;
  period: number;
  stream: string;
  subjectId: string;
  staffId: string;
  room: string;
}

export interface TimetableData {
  periods: TimetablePeriod[];
  days: string[];
  entries: TimetableEntry[];
  staff: { id: string; name: string }[];
}

export interface RecordOfWorkRow {
  id: string;
  staffId: string;
  author: string;
  stream: string;
  subjectId: string;
  day: string;
  topic: string;
  strand: string;
  classSize: number;
  absences: string;
  homework: string;
  remarks: string;
  updatedAt: string;
}

export interface ProgressRecord {
  id: string;
  learnerId: string;
  learnerName: string;
  stream: string;
  staffId: string;
  author: string;
  subjectId: string;
  strand?: string;
  subStrand?: string;
  term: string;
  day: string;
  stage: string;
  note: string;
  createdAt: string;
}

export interface KicdDesign {
  id: string;
  category: 'regular' | 'sne';
  level: string;
  grade: string;
  subjectId: string;
  strand: string;
  subStrand: string;
  outcomes: string[];
  experiences: string[];
  competencies: string[];
  standards: string[];
  inquiry: string[];
  resources: string[];
  inclusive: string;
  /** Where this design came from — teachers must be able to tell official
   *  KICD curriculum apart from school notes and unverified sample data. */
  origin: 'kicd' | 'school' | 'sample';
  status: 'active' | 'disabled';
  sourceUrl: string;
  sourceTitle: string;
  versionLabel: string;
  versionDate: string;
  lastCheckedAt: string;
}

export interface KicdSource {
  key: string;
  label: string;
  url: string;
}

export type ResourceCategory =
  | 'curriculum_design'
  | 'course_book'
  | 'complementary'
  | 'teacher'
  | 'parent';

/** Bibliographic pointer to material KICD has approved — never the file. */
export interface CurriculumResource {
  id: string;
  category: ResourceCategory;
  title: string;
  publisher: string;
  level: string;
  grade: string;
  learningArea: string;
  approvalNote: string;
  sourceUrl: string;
  versionDate: string;
  lastCheckedAt: string;
  status: 'active' | 'disabled';
}

export interface KlbBook {
  id: string;
  publisher: string;
  bookTitle: string;
  grade: string;
  level: string;
  subjectId: string;
  edition: string;
  year: string;
  isbn: string;
  licenseInfo: string;
  permittedUsage: string;
  sourceDoc: string;
  version: string;
  status: string;
}

export interface KlbTopic {
  id: string;
  bookId: string;
  bookTitle?: string;
  publisher?: string;
  grade: string;
  subjectId: string;
  term: string;
  topic: string;
  subtopic: string;
  lessonSeq: number;
  strand: string;
  subStrand: string;
  outcomes: string[];
  activities: string[];
  experiences: string[];
  resources: string[];
  assessment: string[];
  pageRefs: string;
  week?: number;
}

export interface MarkValue {
  score: number;
  rubric: string;
  points: number;
}

export interface Learner {
  id: string;
  name: string;
  gender: string;
  stream: string;
  gradeLevel: string;
  admissionNo: string;
  nemisUpi: string;
  knecNo: string;
  guardianPhone: string;
  feeTotal: number;
  feePaid: number;
  feeBalance: number;
  attendancePct: number;
  boarding?: boolean;
  admissionFeePaid?: boolean;
  additionalFees?: number;
}

export type LearnerMarks = Record<string, MarkValue>;

export interface AttendanceEntry {
  learnerId: string;
  day: string;
  status: 'present' | 'absent';
}

export interface Observation {
  id: string;
  learnerId: string;
  learnerName: string;
  stream: string;
  day: string;
  note: string;
  author: string;
  createdAt: string;
}

export interface Payment {
  id: number;
  learnerId: string;
  learnerName?: string;
  amount: number;
  phone: string | null;
  reference: string;
  createdAt: string;
}

export interface MessageLog {
  id: string;
  learnerId: string;
  learnerName?: string;
  phone: string;
  message: string;
  status: string;
  error?: string;
  createdAt: string;
}

export interface NewLearnerInput {
  name: string;
  gender: string;
  stream: string;
  gradeLevel: string;
  admissionNo: string;
  nemisUpi: string;
  knecNo: string;
  guardianPhone: string;
}
