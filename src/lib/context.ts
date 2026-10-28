import type { Learner, Session } from './types';

export interface Toast {
  id: number;
  message: string;
  tone: 'ok' | 'err';
}

export interface AppCtx {
  session: Session;
  learners: Learner[];
  learnersLoading: boolean;
  reloadLearners: () => Promise<void>;
  /** Re-reads /api/session (plan, tenant, user) after a billing change. */
  refreshSession: () => Promise<unknown>;
  stream: string;
  setStream: (stream: string) => void;
  query: string;
  setQuery: (q: string) => void;
  route: string;
  navigate: (route: string) => void;
  /** Learner currently open on the report card / profile views. */
  selectedLearnerId: string;
  setSelectedLearnerId: (id: string) => void;
  toast: (message: string, tone?: 'ok' | 'err') => void;
  /** Learners matching the global stream + search filters. */
  visibleLearners: Learner[];
}
