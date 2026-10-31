import type { Plan } from './types';

export class ApiError extends Error {
  status: number;
  code: string;
  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
    ...init,
  });

  if (res.status === 401) {
    // Session expired or signed out: let the app render the sign-in screen.
    window.dispatchEvent(new CustomEvent('elimu:unauthenticated'));
    throw new ApiError(401, 'unauthenticated', 'Sign in required');
  }

  const text = await res.text();
  const body = text ? (() => { try { return JSON.parse(text); } catch { return null; } })() : null;

  if (!res.ok) {
    const msg =
      body && typeof body === 'object' && ('message' in body || 'error' in body)
        ? (body.message || body.error)
        : body && typeof body === 'string'
          ? body
          : `Request failed (${res.status})`;
    throw new ApiError(res.status, (body && (body.code || (body.error && 'error'))) || 'error', msg);
  }
  return body as T;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body ?? {}) }),
  put: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'PUT', body: JSON.stringify(body ?? {}) }),
  del: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'DELETE', body: JSON.stringify(body ?? {}) }),
};

/* ---------------- Plan entitlements (UI + server agree on these) ---------------- */

export interface PlanSpec {
  id: Plan;
  name: string;
  price: string;
  cadence: string;
  maxLearners: number;
  whatsapp: boolean;
  exportCsv: boolean;
  streams: number;
  blurb: string;
  features: string[];
}

export const PLANS: PlanSpec[] = [
  {
    id: 'trial',
    name: 'Starter Trial',
    price: 'KES 0',
    cadence: '14-day trial',
    maxLearners: 60,
    whatsapp: false,
    exportCsv: false,
    streams: 1,
    blurb: 'Evaluate ElimuTrack with a single stream and full assessment tooling.',
    features: ['1 stream', 'Up to 60 learners', 'Marksbook, attendance & report cards', 'Community support'],
  },
  {
    id: 'standard',
    name: 'School Standard',
    price: 'KES 8,500',
    cadence: 'per term',
    maxLearners: 600,
    whatsapp: true,
    exportCsv: true,
    streams: 6,
    blurb: 'For a full primary or junior secondary school running CBC end to end.',
    features: ['Up to 6 streams', 'Up to 600 learners', 'WhatsApp to guardians', 'KNEC broadsheet CSV export', 'Fee ledger & M-PESA posting'],
  },
  {
    id: 'premium',
    name: 'Campus Premium',
    price: 'KES 20,000',
    cadence: 'per term',
    maxLearners: 100000,
    whatsapp: true,
    exportCsv: true,
    streams: 99,
    blurb: 'Multi-campus groups with unlimited learners and priority onboarding.',
    features: ['Unlimited streams & learners', 'Multi-campus grouping', 'Priority onboarding & support', 'Pathway analytics for Grade 9'],
  },
];

export function planSpec(plan: Plan | undefined | null): PlanSpec {
  return PLANS.find((p) => p.id === plan) || PLANS[0];
}

/* ---------------- School services (admin grants these to teachers) ---------------- */

export interface ServiceDef {
  id: string;
  label: string;
  hint: string;
}

/** Keys must match SERVICES in worker/src/index.js. */
export const SERVICES: ServiceDef[] = [
  { id: 'dashboard', label: 'Dashboard', hint: 'School overview and summary tiles' },
  { id: 'marks', label: 'Marksbook', hint: 'Enter and edit subject scores' },
  { id: 'lesson_plans', label: 'Lesson Plans', hint: 'Write and store lesson plans' },
  { id: 'attendance', label: 'Attendance', hint: 'Daily class register' },
  { id: 'observations', label: 'Observations', hint: 'Learner observation notes' },
  { id: 'broadsheet', label: 'Broadsheet', hint: 'Ranked class analysis and CSV export' },
  { id: 'learners', label: 'Learners', hint: 'Learner records and admission' },
  { id: 'reportcards', label: 'Report Cards', hint: 'End-of-term report generation' },
  { id: 'pathways', label: 'Pathways', hint: 'Grade 9 pathway recommendations' },
  { id: 'fees', label: 'Fee Payments', hint: 'Fee ledger and payment posting' },
  { id: 'whatsapp', label: 'WhatsApp', hint: 'WhatsApp messages to guardians' },
  { id: 'schemes', label: 'Schemes of Work', hint: 'Termly scheme rows built from KICD designs' },
  { id: 'timetable', label: 'Timetable', hint: 'Weekly lesson timetable' },
  { id: 'recordwork', label: 'Record of Work', hint: 'What was actually taught' },
  { id: 'progress', label: 'Learner Progress', hint: 'Progress records for each learner' },
  { id: 'kicd', label: 'KICD Designs', hint: 'Regular & SNE curriculum design library' },
];

export const SERVICE_IDS = SERVICES.map((s) => s.id);

export const PLAN_LIMIT_CODES = {
  LEARNER_LIMIT: 'PLAN_LEARNER_LIMIT',
  WHATSAPP_LOCKED: 'PLAN_WHATSAPP_LOCKED',
  EXPORT_LOCKED: 'PLAN_EXPORT_LOCKED',
  STREAMS_LOCKED: 'PLAN_STREAMS_LOCKED',
};
