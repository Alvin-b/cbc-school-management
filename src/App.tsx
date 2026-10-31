import { useCallback, useEffect, useMemo, useState } from 'react';import { GraduationCap, Search, Filter, LayoutDashboard, ClipboardCheck, Eye,
  CalendarCheck, FileSpreadsheet, Users, Award, GraduationCap as CapIcon,
  CreditCard, MessageSquare, Sparkles, LogOut, Layers, BookOpen, KeyRound, UserCog,
  CalendarRange, Clock, NotebookPen, TrendingUp, LibraryBig, BookMarked, Settings,
} from 'lucide-react';
import { api, ApiError, planSpec } from './lib/api';
import type { Learner, Session } from './lib/types';
import type { AppCtx, Toast } from './lib/context';
import { signInUrl } from './lib/auth';
import { STREAMS } from './lib/curriculum';
import { Badge } from './components/ui';
import SignIn from './pages/SignIn';
import Dashboard from './pages/Dashboard';
import Marksbook from './pages/Marksbook';
import Observations from './pages/Observations';
import Attendance from './pages/Attendance';
import Broadsheet from './pages/Broadsheet';
import LearnersPage from './pages/Learners';
import ReportCard from './pages/ReportCard';
import Pathways from './pages/Pathways';
import Fees from './pages/Fees';
import WhatsAppPage from './pages/WhatsApp';
import Billing from './pages/Billing';
import LessonPlans from './pages/LessonPlans';
import StaffAccess from './pages/StaffAccess';
import MyLogin from './pages/MyLogin';
import Schemes from './pages/Schemes';
import Timetable from './pages/Timetable';
import RecordOfWork from './pages/RecordOfWork';
import Progress from './pages/Progress';
import KicdDesigns from './pages/KicdDesigns';
import CurriculumResources from './pages/CurriculumResources';
import SettingsPage from './pages/Settings';

/**
 * `service` — the service an admin must grant a teacher before this entry
 * appears. `adminOnly` / `teacherOnly` pin entries to one role.
 */
const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, service: 'dashboard' },
  { id: 'marksbook', label: 'Marksbook', icon: ClipboardCheck, service: 'marks' },
  { id: 'lessonplans', label: 'Lesson Plans', icon: BookOpen, service: 'lesson_plans' },
  { id: 'schemes', label: 'Schemes', icon: CalendarRange, service: 'schemes' },
  { id: 'timetable', label: 'Timetable', icon: Clock, service: 'timetable' },
  { id: 'recordwork', label: 'Record of Work', icon: NotebookPen, service: 'recordwork' },
  { id: 'progress', label: 'Progress', icon: TrendingUp, service: 'progress' },
  { id: 'kicd', label: 'KICD Designs', icon: LibraryBig, service: 'kicd' },
  { id: 'resources', label: 'Approved Resources', icon: BookMarked, service: 'kicd' },
  { id: 'observations', label: 'Observations', icon: Eye, service: 'observations' },
  { id: 'attendance', label: 'Attendance', icon: CalendarCheck, service: 'attendance' },
  { id: 'broadsheet', label: 'Broadsheet', icon: FileSpreadsheet, service: 'broadsheet' },
  { id: 'learners', label: 'Learners', icon: Users, service: 'learners' },
  { id: 'reportcard', label: 'Report Cards', icon: Award, service: 'reportcards' },
  { id: 'pathways', label: 'Pathways', icon: CapIcon, service: 'pathways' },
  { id: 'fees', label: 'Fee Payments', icon: CreditCard, service: 'fees' },
  { id: 'whatsapp', label: 'WhatsApp', icon: MessageSquare, service: 'whatsapp' },
  { id: 'staff', label: 'Staff & Access', icon: UserCog, adminOnly: true },
  { id: 'settings', label: 'Settings', icon: Settings, adminOnly: true },
  { id: 'billing', label: 'Plan & Billing', icon: Layers, adminOnly: true },
  { id: 'account', label: 'My Login', icon: KeyRound, teacherOnly: true },
];

const GUEST_SESSION: Session = {
  authenticated: false,
  user: null,
  tenant: null,
  role: 'guest',
  services: [],
  streams: null,
  staff: null,
};

const routeFromHash = () => {
  // The app is hash-routed, but people also open /timetable or /progress
  // directly (the SPA fallback serves index.html for them). Honour a valid
  // hash first, then fall back to the path so those URLs land on their page.
  const hash = window.location.hash.replace(/^#\/?/, '').split('?')[0];
  if (hash && NAV_ITEMS.some((n) => n.id === hash)) return hash;
  const path = window.location.pathname.replace(/^\/+/, '').split('?')[0];
  if (path && NAV_ITEMS.some((n) => n.id === path)) return path;
  return 'dashboard';
};

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [booting, setBooting] = useState(true);
  const [route, setRoute] = useState(routeFromHash);
  const [stream, setStream] = useState('All Streams');
  const [query, setQuery] = useState('');
  const [learners, setLearners] = useState<Learner[]>([]);
  const [selectedLearnerId, setSelectedLearnerId] = useState('');
  const [learnersLoading, setLearnersLoading] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((message: string, tone: 'ok' | 'err' = 'ok') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, tone }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4200);
  }, []);

  const loadSession = useCallback(async () => {
    try {
      const s = await api.get<Session>('/api/session');
      setSession(s);
      return s;
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setSession(GUEST_SESSION);
        return null;
      }
      toast('Could not reach the API', 'err');
      return null;
    } finally {
      setBooting(false);
    }
  }, [toast]);

  const reloadLearners = useCallback(async () => {
    setLearnersLoading(true);
    try {
      const res = await api.get<{ learners: Learner[] }>('/api/learners');
      setLearners(res.learners);
    } catch (err) {
      // Signed out or the admin has not granted a roster-backed service:
      // neither is an error the teacher can act on from here.
      const skipped = err instanceof ApiError && (err.status === 401 || err.code === 'SERVICE_DENIED');
      if (!skipped) {
        toast(err instanceof Error ? err.message : 'Failed to load learners', 'err');
      }
    } finally {
      setLearnersLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    void loadSession();
  }, [loadSession]);

  useEffect(() => {
    // A teacher still on their initial login is locked to the My Login screen.
    const locked = !!session?.staff?.mustChangeLogin;
    if (session?.authenticated && !locked) void reloadLearners();
  }, [session?.authenticated, session?.staff?.mustChangeLogin, reloadLearners]);

  useEffect(() => {
    const onHash = () => setRoute(routeFromHash());
    const onUnauth = () => setSession(GUEST_SESSION);
    window.addEventListener('hashchange', onHash);
    window.addEventListener('elimu:unauthenticated', onUnauth);
    return () => {
      window.removeEventListener('hashchange', onHash);
      window.removeEventListener('elimu:unauthenticated', onUnauth);
    };
  }, []);

  const navigate = useCallback((next: string) => {
    if (window.location.pathname !== '/') {
      // Arrived via a path route such as /timetable: fold it back to the hash
      // form so the address bar does not keep two competing routes.
      history.replaceState(null, '', `${window.location.origin}/#/${next}`);
    } else {
      window.location.hash = `#/${next}`;
    }
    setRoute(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const visibleLearners = useMemo(() => {
    const q = query.trim().toLowerCase();
    return learners.filter((l) => {
      if (stream !== 'All Streams' && l.stream !== stream) return false;
      if (!q) return true;
      return (
        l.name.toLowerCase().includes(q) ||
        l.admissionNo.toLowerCase().includes(q) ||
        l.nemisUpi.toLowerCase().includes(q)
      );
    });
  }, [learners, stream, query]);

  if (booting) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-400 text-sm">
          <div className="w-5 h-5 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
          Loading ElimuTrack…
        </div>
      </div>
    );
  }

  if (!session?.authenticated || !session.tenant) {
    return <SignIn session={session} onRetry={() => void loadSession()} />;
  }

  const spec = planSpec(session.tenant.plan);
  const isAdmin = session.role === 'admin';
  // A teacher must set their own login before they can open anything else.
  const mustChange = session.role === 'teacher' && !!session.staff?.mustChangeLogin;

  const allowedNav = NAV_ITEMS.filter((item) => {
    if (mustChange) return item.id === 'account';
    if (isAdmin) return !item.teacherOnly;
    if (item.adminOnly) return false;
    return !item.service || session.services.includes(item.service);
  });
  const navIds = allowedNav.map((n) => n.id);
  const activeRoute = navIds.includes(route) ? route : navIds[0] || 'account';

  // Teachers only ever choose from the classes the admin assigned them.
  const streamOptions = session.streams === null ? [...STREAMS] : session.streams;
  if (stream !== 'All Streams' && !streamOptions.includes(stream as never)) {
    // Assigned classes changed (or a fresh login): drop the stale selection.
    setStream('All Streams');
  }

  const ctx: AppCtx = {
    session,
    learners,
    learnersLoading,
    reloadLearners,
    refreshSession: loadSession,
    stream,
    setStream,
    query,
    setQuery,
    route,
    navigate,
    selectedLearnerId,
    setSelectedLearnerId,
    toast,
    visibleLearners,
  };

  const pages: Record<string, JSX.Element> = {
    dashboard: <Dashboard ctx={ctx} />,
    marksbook: <Marksbook ctx={ctx} />,
    lessonplans: <LessonPlans ctx={ctx} />,
    schemes: <Schemes ctx={ctx} />,
    timetable: <Timetable ctx={ctx} />,
    recordwork: <RecordOfWork ctx={ctx} />,
    progress: <Progress ctx={ctx} />,
    kicd: <KicdDesigns ctx={ctx} />,
    resources: <CurriculumResources ctx={ctx} />,
    observations: <Observations ctx={ctx} />,
    attendance: <Attendance ctx={ctx} />,
    broadsheet: <Broadsheet ctx={ctx} />,
    learners: <LearnersPage ctx={ctx} />,
    reportcard: <ReportCard ctx={ctx} />,
    pathways: <Pathways ctx={ctx} />,
    fees: <Fees ctx={ctx} />,
    whatsapp: <WhatsAppPage ctx={ctx} />,
    billing: <Billing ctx={ctx} />,
    staff: <StaffAccess ctx={ctx} />,
    settings: <SettingsPage ctx={ctx} />,
    account: <MyLogin ctx={ctx} />,
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans antialiased selection:bg-indigo-500 selection:text-white">
      {/* TOP HEADER */}
      <header className="no-print bg-slate-900/80 backdrop-blur-xl border-b border-slate-800/80 sticky top-0 z-40 px-6 py-3.5 flex items-center justify-between gap-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-tr from-indigo-600 to-violet-500 text-white p-2.5 rounded-2xl shadow-lg shadow-indigo-500/25">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-base font-bold tracking-tight text-white">ElimuTrack Enterprise</h1>
              <span className="text-[10px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                CBC ERP 2026
              </span>
            </div>
            <p className="text-xs text-slate-400">{session.tenant.name}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-1 max-w-2xl justify-end">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search learner, Adm No, NEMIS UPI…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-800 text-xs text-slate-100 pl-9 pr-3 py-2 rounded-xl focus:border-indigo-500/60 focus:outline-none transition-all shadow-inner"
            />
          </div>

          <div className="hidden lg:flex items-center gap-2 bg-slate-950/80 border border-slate-800 px-3 py-1.5 rounded-xl text-xs">
            <Filter className="w-3.5 h-3.5 text-indigo-400" />
            <select
              value={stream}
              onChange={(e) => setStream(e.target.value)}
              className="bg-transparent font-semibold text-indigo-300 focus:outline-none cursor-pointer"
            >
              <option value="All Streams" className="bg-slate-900">
                {isAdmin ? 'All Streams (Grades 1-9)' : 'All My Classes'}
              </option>
              {streamOptions.map((st) => (
                <option key={st} value={st} className="bg-slate-900">{st}</option>
              ))}
            </select>
          </div>

          <Badge
            tone={
              spec.id === 'premium'
                ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                : spec.id === 'standard'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
            }
          >
            {spec.name}
          </Badge>

          <div className="hidden sm:flex items-center gap-2 bg-slate-950/80 border border-slate-800 px-3 py-1.5 rounded-xl text-xs max-w-[13rem]">
            <span className="w-6 h-6 rounded-full bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 flex items-center justify-center text-[10px] font-bold">
              {(session.user?.name || session.user?.email || '?').slice(0, 1).toUpperCase()}
            </span>
            <span className="truncate text-slate-300 font-medium">{session.user?.name || session.user?.email}</span>
          </div>

          {isAdmin ? (
            <form
              method="post"
              action={signInUrl() + "/../auth/freebuff/signout"}
              className="bg-slate-950/80 hover:bg-slate-800 border border-slate-800 p-0 rounded-xl"
              title="Sign out"
            >
              <button
                type="submit"
                className="px-2.5 py-2 text-slate-400 hover:text-white transition-all"
                aria-label="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </form>
          ) : (
            // Teachers hold a school session cookie, not a Freebuff one.
            <button
              onClick={async () => {
                try {
                  await api.post('/api/auth/logout');
                } finally {
                  setSession(GUEST_SESSION);
                  window.location.hash = '';
                }
              }}
              className="bg-slate-950/80 hover:bg-slate-800 border border-slate-800 px-2.5 py-2 rounded-xl text-slate-400 hover:text-white transition-all"
              title="Sign out"
              aria-label="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </header>

      <div className="flex-1 flex max-w-[1600px] w-full mx-auto p-6 gap-6">
        {/* SIDEBAR */}
        <aside className="no-print w-64 shrink-0 hidden md:block">
          <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-3xl p-3 sticky top-24 space-y-1.5 shadow-xl">
            <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              {isAdmin ? 'Administration' : 'My Modules'}
            </div>
            {allowedNav.map((item) => {
              const Icon = item.icon;
              const isActive = activeRoute === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => navigate(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all group ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-600/25'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                      isActive ? 'text-white' : 'text-slate-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </button>
              );
            })}
            <div className="px-3 py-2 text-[10px] text-slate-600 leading-relaxed border-t border-slate-800/80 mt-2">
              Signed in as <span className="text-slate-400">{session.user?.email}</span>
              {session.role === 'teacher' && (
                <span className="block text-slate-600">
                  Teacher · {session.streams?.length || 0} class{(session.streams?.length || 0) === 1 ? '' : 'es'}
                </span>
              )}
            </div>
          </div>
        </aside>

        {/* CONTENT */}
        <main className="flex-1 min-w-0 space-y-6">
          {learnersLoading && learners.length === 0 ? (
            <div className="space-y-4">
              <div className="h-24 rounded-3xl animate-shimmer" />
              <div className="h-64 rounded-3xl animate-shimmer" />
            </div>
          ) : (
            pages[activeRoute] || pages.dashboard
          )}
        </main>
      </div>

      {/* MOBILE NAV */}
      <nav className="no-print md:hidden sticky bottom-0 z-40 bg-slate-900/95 border-t border-slate-800 flex overflow-x-auto">
        {allowedNav.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.id)}
              className={`flex flex-col items-center gap-1 px-4 py-2.5 text-[10px] font-semibold whitespace-nowrap ${
                activeRoute === item.id ? 'text-indigo-400' : 'text-slate-500'
              }`}
            >
              <Icon className="w-4 h-4" />
              {item.label.split(' ')[0]}
            </button>
          );
        })}
      </nav>

      {/* TOASTS */}
      <div className="fixed bottom-6 right-6 z-50 space-y-2 no-print">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`px-4 py-3 rounded-2xl text-xs font-semibold shadow-2xl border animate-fadeIn ${
              t.tone === 'ok'
                ? 'bg-slate-900 border-emerald-500/30 text-emerald-300'
                : 'bg-slate-900 border-rose-500/30 text-rose-300'
            }`}
          >
            {t.message}
          </div>
        ))}
      </div>

      {/* SETUP HINT: brand-new tenants start empty */}
      {isAdmin && learners.length === 0 && !learnersLoading && (
        <div className="fixed bottom-6 left-6 z-50 no-print max-w-xs">
          <button
            onClick={async () => {
              try {
                await api.post('/api/seed');
                await reloadLearners();
                toast('Demo school data created');
              } catch (err) {
                toast(err instanceof Error ? err.message : 'Seeding failed', 'err');
              }
            }}
            className="w-full text-left bg-slate-900 border border-indigo-500/40 rounded-2xl p-4 shadow-2xl hover:border-indigo-400 transition-all"
          >
            <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold mb-1">
              <Sparkles className="w-4 h-4" /> Empty school?
            </div>
            <p className="text-[11px] text-slate-400">
              Generate a demo cohort with learners, marks, attendance and fees so you can explore every module.
            </p>
          </button>
        </div>
      )}
    </div>
  );
}