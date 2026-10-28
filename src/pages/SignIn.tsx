import { useState } from 'react';
import type { FormEvent } from 'react';
import { GraduationCap, ShieldCheck, Database, CreditCard, ArrowRight, KeyRound, LogIn } from 'lucide-react';
import { signInUrl } from '../lib/auth';
import { api } from '../lib/api';
import { inputCls, labelCls, btnPrimary, ErrorNote } from '../components/ui';
import type { Session } from '../lib/types';

export default function SignIn({
  session,
  onRetry,
}: {
  session: Session | null;
  onRetry: () => void;
}) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const teacherLogin = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await api.post('/api/auth/login', { username, password });
      // Session cookie is set: re-read /api/session and enter the dashboard.
      await onRetry();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <header className="border-b border-slate-800/80 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-tr from-indigo-600 to-violet-500 text-white p-2.5 rounded-2xl shadow-lg shadow-indigo-500/25">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight text-white">ElimuTrack Enterprise</h1>
              <p className="text-xs text-slate-400">Integrated Competency &amp; School Management Suite</p>
            </div>
          </div>
          <a
            href={signInUrl()}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-5 py-2.5 rounded-2xl text-xs transition-all shadow-lg shadow-indigo-600/25"
          >
            Sign in
          </a>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-16 grid lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6 animate-fadeIn">
          <span className="text-[10px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-3 py-1 rounded-full uppercase tracking-wider">
            CBC ERP 2026 · Grades 1–9
          </span>
          <h2 className="text-4xl font-bold leading-tight text-white">
            Run your whole school on one competency-based platform.
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed max-w-lg">
            Marksbook, attendance register, KNEC broadsheet, report cards, Grade 9 pathway recommendations,
            fee ledgers and guardian WhatsApp — with a real multi-tenant database behind every screen.
          </p>

          <ul className="space-y-3 text-sm text-slate-300">
            {[
              { icon: <ShieldCheck className="w-4 h-4" />, text: 'Sign in with your Freebuff account — your school data stays in your own tenant.' },
              { icon: <Database className="w-4 h-4" />, text: 'Learners, marks, attendance, payments and message logs persisted in Cloudflare D1.' },
              { icon: <CreditCard className="w-4 h-4" />, text: 'Start on the Starter Trial, upgrade when you need WhatsApp messaging and CSV exports.' },
            ].map((f, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="text-indigo-400 mt-0.5">{f.icon}</span>
                {f.text}
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-3 pt-2">
            <a
              href={signInUrl()}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-6 py-3 rounded-2xl text-sm flex items-center gap-2 transition-all shadow-lg shadow-indigo-600/30"
            >
              Sign in with Freebuff <ArrowRight className="w-4 h-4" />
            </a>
            <button
              onClick={onRetry}
              className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-semibold px-5 py-3 rounded-2xl text-sm transition-all"
            >
              Refresh session
            </button>
          </div>
          {session && !session.authenticated && (
            <p className="text-xs text-slate-500">
              You are signed out. Sign in to open your school workspace.
            </p>
          )}

          {/* Teachers sign in with the school login the admin created */}
          <form
            onSubmit={teacherLogin}
            className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-4 max-w-md"
          >
            <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
              <KeyRound className="w-4 h-4 text-indigo-400" /> Teacher sign-in
            </div>
            {error && <ErrorNote message={error} />}
            <div>
              <label className={labelCls} htmlFor="staff-username">Username</label>
              <input
                id="staff-username"
                className={inputCls}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. j.kamau"
                autoComplete="username"
                required
              />
            </div>
            <div>
              <label className={labelCls} htmlFor="staff-password">Password</label>
              <input
                id="staff-password"
                type="password"
                className={inputCls}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your school password"
                autoComplete="current-password"
                required
              />
            </div>
            <button type="submit" className={`${btnPrimary} w-full justify-center`} disabled={busy}>
              <LogIn className="w-4 h-4" /> {busy ? 'Signing in…' : 'Sign in with school login'}
            </button>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Your administrator creates your username and initial password. You will be asked to change
              them the first time you sign in.
            </p>
          </form>
        </div>

        <div className="relative animate-fadeIn">
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Learners', value: '450' },
                { label: 'Streams', value: '9' },
                { label: 'Attendance', value: '93%' },
              ].map((s) => (
                <div key={s.label} className="bg-slate-950 rounded-2xl p-4 border border-slate-800">
                  <div className="text-[10px] uppercase tracking-wider text-slate-500">{s.label}</div>
                  <div className="text-xl font-bold text-white mt-1">{s.value}</div>
                </div>
              ))}
            </div>
            <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800 space-y-2">
              <div className="text-[10px] uppercase tracking-wider text-slate-500">Subject mean · Grade 7 Eta</div>
              {[['MAT103', 74], ['SCI104', 68], ['ENG101', 71], ['SST105', 63]].map(([code, val]) => (
                <div key={code as string} className="flex items-center gap-3 text-xs">
                  <span className="w-16 text-slate-400 font-mono">{code}</span>
                  <div className="flex-1 h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-indigo-600 to-violet-500" style={{ width: `${val}%` }} />
                  </div>
                  <span className="w-8 text-right text-slate-300">{val}</span>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-slate-500 text-center">
              Illustrative preview — once signed in, every figure on the dashboard is read live from your own
              school's database.
            </p>
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-800/80 px-6 py-5 text-xs text-slate-500">
        <div className="max-w-6xl mx-auto flex justify-between gap-4 flex-wrap">
          <span>© 2026 ElimuTrack Enterprise · Nairobi, Kenya</span>
          <span>Competency-Based Curriculum · KNEC-aligned assessment</span>
        </div>
      </footer>
    </div>
  );
}
