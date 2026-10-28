import { useState } from 'react';
import type { FormEvent } from 'react';
import { KeyRound, ShieldAlert, RefreshCw } from 'lucide-react';
import { api } from '../lib/api';
import type { AppCtx } from '../lib/context';
import {
  Panel, PageHeader, inputCls, labelCls, btnPrimary, ErrorNote, EmptyState,
} from '../components/ui';

/**
 * Teachers change their own school login here. The admin creates the initial
 * username/password; this screen is where the teacher replaces it.
 */
export default function MyLogin({ ctx }: { ctx: AppCtx }) {
  const staff = ctx.session.staff;
  const [username, setUsername] = useState(staff?.username || '');
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (ctx.session.role !== 'teacher' || !staff) {
    return (
      <div className="space-y-6 animate-fadeIn">
        <PageHeader title="My Login" icon={<KeyRound className="w-5 h-5" />} />
        <Panel>
          <EmptyState
            icon={<KeyRound className="w-6 h-6" />}
            title="No school login for this account"
            hint="The school administrator signs in with Sign in with Freebuff, so there is no separate username to change."
          />
        </Panel>
      </div>
    );
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (next !== confirm) {
      setError('The new passwords do not match');
      return;
    }
    setBusy(true);
    try {
      await api.post('/api/auth/change-login', {
        username: username.trim().toLowerCase(),
        currentPassword: current,
        newPassword: next,
      });
      setCurrent('');
      setNext('');
      setConfirm('');
      await ctx.refreshSession();
      ctx.toast('Your login has been updated');
      ctx.navigate('dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update your login');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <PageHeader
        title="My Login"
        sub={`Signed in as @${staff.username}`}
        icon={<KeyRound className="w-5 h-5" />}
      />

      {staff.mustChangeLogin && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-3xl p-5 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-200 leading-relaxed">
            <p className="font-bold mb-1">Change your initial login to continue</p>
            <p className="text-amber-300/80">
              Your administrator created this account with a temporary password. Set your own username and
              password below — the rest of your dashboard unlocks right after.
            </p>
          </div>
        </div>
      )}

      <Panel title="Change username & password" icon={<RefreshCw className="w-4 h-4" />}>
        <form onSubmit={submit} className="space-y-4 max-w-md">
          {error && <ErrorNote message={error} />}
          <div>
            <label className={labelCls} htmlFor="me-username">Username</label>
            <input
              id="me-username"
              className={inputCls}
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase())}
              placeholder="e.g. j.wanjiku"
            />
            <p className="text-[10px] text-slate-500 mt-1">
              Leave as-is to keep @{staff.username}. Letters, numbers, dot, dash or underscore.
            </p>
          </div>
          <div>
            <label className={labelCls} htmlFor="me-current">Current password</label>
            <input
              id="me-current"
              type="password"
              className={inputCls}
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={labelCls} htmlFor="me-new">New password</label>
              <input
                id="me-new"
                type="password"
                className={inputCls}
                value={next}
                onChange={(e) => setNext(e.target.value)}
                autoComplete="new-password"
                required
                minLength={6}
              />
            </div>
            <div>
              <label className={labelCls} htmlFor="me-confirm">Confirm new password</label>
              <input
                id="me-confirm"
                type="password"
                className={inputCls}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                autoComplete="new-password"
                required
                minLength={6}
              />
            </div>
          </div>
          <button type="submit" className={`${btnPrimary} w-full justify-center`} disabled={busy}>
            <KeyRound className="w-4 h-4" /> {busy ? 'Saving…' : 'Update my login'}
          </button>
        </form>
      </Panel>
    </div>
  );
}