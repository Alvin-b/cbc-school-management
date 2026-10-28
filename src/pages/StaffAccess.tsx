import { useCallback, useEffect, useState } from 'react';
import { UserCog, Plus, KeyRound, ShieldCheck, ShieldOff, Pencil } from 'lucide-react';
import { api, ApiError, SERVICES } from '../lib/api';
import type { AppCtx } from '../lib/context';
import type { StaffMember } from '../lib/types';
import { STREAMS } from '../lib/curriculum';
import {
  Panel, PageHeader, inputCls, labelCls, btnPrimary, btnGhost,
  EmptyState, ErrorNote, Badge, Modal, Loading,
} from '../components/ui';

interface Draft {
  id?: string;
  name: string;
  username: string;
  password: string;
  classes: string[];
  services: string[];
  active: boolean;
}

const blankDraft = (): Draft => ({
  name: '',
  username: '',
  password: '',
  classes: [],
  services: SERVICES.map((s) => s.id),
  active: true,
});

const draftOf = (member: StaffMember): Draft => ({
  id: member.id,
  name: member.name,
  username: member.username,
  password: '',
  classes: [...member.classes],
  services: [...member.services],
  active: member.active,
});

const CheckGrid: React.FC<{
  options: { id: string; label: string; hint?: string }[];
  selected: string[];
  onToggle: (id: string) => void;
  columns?: string;
}> = ({ options, selected, onToggle, columns = 'sm:grid-cols-2' }) => (
  <div className={`grid grid-cols-1 ${columns} gap-2`}>
    {options.map((opt) => {
      const on = selected.includes(opt.id);
      return (
        <button
          key={opt.id}
          type="button"
          onClick={() => onToggle(opt.id)}
          className={`text-left border rounded-xl px-3 py-2 transition-all ${
            on
              ? 'bg-indigo-500/10 border-indigo-500/50 text-indigo-200'
              : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
          }`}
        >
          <span className="text-xs font-semibold block">{opt.label}</span>
          {opt.hint && <span className="text-[10px] text-slate-500">{opt.hint}</span>}
        </button>
      );
    })}
  </div>
);

export default function StaffAccess({ ctx }: { ctx: AppCtx }) {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [draft, setDraft] = useState<Draft | null>(null);
  const [resetFor, setResetFor] = useState<StaffMember | null>(null);
  const [resetPassword, setResetPassword] = useState('');
  const [saving, setSaving] = useState(false);
  // Modal-scoped errors: page-level notices render behind the modal overlay.
  const [formError, setFormError] = useState('');
  const [resetError, setResetError] = useState('');
  const [attempted, setAttempted] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<{ staff: StaffMember[] }>('/api/staff');
      setStaff(res.staff);
      setError('');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load staff');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const toggle = (list: string[], id: string) =>
    list.includes(id) ? list.filter((x) => x !== id) : [...list, id];

  const openCreate = () => {
    setAttempted(false);
    setFormError('');
    setDraft(blankDraft());
  };

  const openEdit = (member: StaffMember) => {
    setAttempted(false);
    setFormError('');
    setDraft(draftOf(member));
  };

  /** Mirrors the server's rules so a miss is named before the round-trip. */
  const validate = (d: Draft): { message: string; field: string } => {
    if (!d.name.trim()) {
      return { message: "Enter the teacher's full name — it is the first field, above Username.", field: 't-name' };
    }
    if (!d.id) {
      if (!/^[a-z0-9][a-z0-9._-]{2,31}$/.test(d.username)) {
        return {
          message: 'Username must be 3-32 characters: letters, numbers, dot, dash or underscore.',
          field: 't-username',
        };
      }
      if (d.password.length < 6) {
        return { message: 'Initial password must be at least 6 characters.', field: 't-password' };
      }
    }
    if (!d.classes.length) return { message: 'Assign at least one class to this teacher.', field: 'staff-classes' };
    if (!d.services.length) return { message: 'Choose at least one service for this teacher.', field: 'staff-services' };
    return { message: '', field: '' };
  };

  const save = async () => {
    if (!draft) return;
    setAttempted(true);
    const problem = validate(draft);
    if (problem.message) {
      setFormError(problem.message);
      // The form is long: bring the offending field and the message to the user.
      requestAnimationFrame(() => {
        const node = problem.field ? document.getElementById(problem.field) : null;
        if (node) node.scrollIntoView({ block: 'center', behavior: 'smooth' });
      });
      return;
    }
    setFormError('');
    setSaving(true);
    setError('');
    try {
      if (draft.id) {
        await api.put('/api/staff', {
          id: draft.id,
          name: draft.name,
          active: draft.active,
          services: draft.services,
          classes: draft.classes,
        });
        ctx.toast('Teacher access updated');
      } else {
        await api.post('/api/staff', {
          name: draft.name,
          username: draft.username,
          password: draft.password,
          services: draft.services,
          classes: draft.classes,
        });
        ctx.toast('Teacher account created');
      }
      setDraft(null);
      await load();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Saving failed';
      setFormError(message);
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const resetLogin = async () => {
    if (!resetFor) return;
    if (resetPassword.length < 6) {
      setResetError('New password must be at least 6 characters');
      return;
    }
    setResetError('');
    setSaving(true);
    setError('');
    try {
      await api.post('/api/staff/reset', { id: resetFor.id, password: resetPassword });
      setResetFor(null);
      setResetPassword('');
      ctx.toast('Login reset — the teacher must change it at next sign-in');
      await load();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Reset failed';
      setResetError(message);
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (member: StaffMember) => {
    try {
      await api.put('/api/staff', { id: member.id, active: !member.active });
      ctx.toast(member.active ? `${member.name} deactivated` : `${member.name} reactivated`);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed');
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <PageHeader
        title="Staff & Access"
        sub="Create teacher logins, assign classes, and choose the services each teacher can see"
        icon={<UserCog className="w-5 h-5" />}
        actions={
          <button className={btnPrimary} onClick={openCreate}>
            <Plus className="w-4 h-4" /> Add teacher
          </button>
        }
      />

      {error && <ErrorNote message={error} />}

      <Panel title={`Teachers (${staff.length})`} icon={<ShieldCheck className="w-4 h-4" />}>
        {loading ? (
          <Loading label="Loading staff" />
        ) : staff.length === 0 ? (
          <EmptyState
            icon={<UserCog className="w-6 h-6" />}
            title="No teachers yet"
            hint="Add your first teacher: they get a school login, assigned classes, and only the services you grant."
          />
        ) : (
          <div className="space-y-3">
            {staff.map((member) => (
              <div
                key={member.id}
                className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center gap-4 justify-between"
              >
                <div className="min-w-0 space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold text-white">{member.name}</span>
                    <span className="text-xs text-slate-400 font-mono">@{member.username}</span>
                    {member.mustChangeLogin && (
                      <Badge tone="bg-amber-500/10 text-amber-400 border-amber-500/30">Initial login</Badge>
                    )}
                    {!member.active && (
                      <Badge tone="bg-rose-500/10 text-rose-400 border-rose-500/30">Suspended</Badge>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {member.classes.length === 0 ? (
                      <Badge tone="bg-slate-500/10 text-slate-400 border-slate-500/30">No classes</Badge>
                    ) : (
                      member.classes.map((c) => (
                        <Badge key={c} tone="bg-indigo-500/10 text-indigo-300 border-indigo-500/30">{c}</Badge>
                      ))
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {member.services.length === 0 ? (
                      <Badge tone="bg-slate-500/10 text-slate-400 border-slate-500/30">No services</Badge>
                    ) : (
                      member.services.map((s) => (
                        <Badge key={s} tone="bg-emerald-500/10 text-emerald-300 border-emerald-500/30">
                          {SERVICES.find((x) => x.id === s)?.label || s}
                        </Badge>
                      ))
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className={btnGhost} onClick={() => openEdit(member)}>
                    <Pencil className="w-3.5 h-3.5" /> Edit access
                  </button>
                  <button className={btnGhost} onClick={() => { setResetFor(member); setResetPassword(''); setResetError(''); }}>
                    <KeyRound className="w-3.5 h-3.5" /> Reset login
                  </button>
                  <button
                    className={btnGhost}
                    onClick={() => void toggleActive(member)}
                    title={member.active ? 'Suspend this teacher' : 'Reactivate this teacher'}
                  >
                    {member.active ? <ShieldOff className="w-3.5 h-3.5" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                    {member.active ? 'Suspend' : 'Activate'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>

      {/* CREATE / EDIT TEACHER */}
      <Modal
        open={!!draft}
        onClose={() => setDraft(null)}
        title={draft?.id ? 'Edit teacher access' : 'Add a teacher'}
      >
        {draft && (
          <div className="space-y-4">
            {formError && <ErrorNote message={formError} />}
            <div>
              <label className={labelCls} htmlFor="t-name">
                Full name <span className="text-rose-400">*</span>
              </label>
              <input
                id="t-name"
                className={`${inputCls} ${attempted && !draft.name.trim() ? 'border-rose-500/70' : ''}`}
                value={draft.name}
                onChange={(e) => { setDraft({ ...draft, name: e.target.value }); setFormError(''); }}
                placeholder="e.g. Jane Wanjiku"
                autoFocus={!draft.id}
                aria-invalid={attempted && !draft.name.trim()}
              />
              <p className="text-[10px] text-slate-500 mt-1">
                The teacher's name as it appears on their dashboard and lesson plans.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={labelCls} htmlFor="t-username">
                  Username <span className="text-rose-400">*</span>
                </label>
                <input
                  id="t-username"
                  className={inputCls}
                  value={draft.username}
                  disabled={!!draft.id}
                  onChange={(e) => { setDraft({ ...draft, username: e.target.value.toLowerCase() }); setFormError(''); }}
                  placeholder="e.g. j.wanjiku"
                />
              </div>
              <div>
                <label className={labelCls} htmlFor="t-password">
                  {draft.id ? 'New password (optional)' : <>Initial password <span className="text-rose-400">*</span></>}
                </label>
                <input
                  id="t-password"
                  className={inputCls}
                  value={draft.password}
                  disabled={!!draft.id}
                  onChange={(e) => { setDraft({ ...draft, password: e.target.value }); setFormError(''); }}
                  placeholder="Min. 6 characters"
                />
              </div>
            </div>
            {draft.id && (
              <label className="flex items-center gap-2 text-xs text-slate-300">
                <input
                  type="checkbox"
                  checked={draft.active}
                  onChange={(e) => setDraft({ ...draft, active: e.target.checked })}
                  className="accent-indigo-500"
                />
                Account active (uncheck to suspend and sign them out everywhere)
              </label>
            )}

            <div id="staff-classes">
              <span className={labelCls}>Classes in charge of</span>
              <CheckGrid
                options={[...STREAMS].map((s) => ({ id: s, label: s }))}
                selected={draft.classes}
                onToggle={(id) => setDraft({ ...draft, classes: toggle(draft.classes, id) })}
              />
              <p className="text-[10px] text-slate-500 mt-1.5">
                The class selector and every screen a teacher opens are limited to these classes.
              </p>
            </div>

            <div id="staff-services">
              <span className={labelCls}>Services they can access</span>
              <CheckGrid
                options={SERVICES}
                selected={draft.services}
                onToggle={(id) => setDraft({ ...draft, services: toggle(draft.services, id) })}
              />
              <p className="text-[10px] text-slate-500 mt-1.5">
                Only the ticked services appear on their dashboard.
              </p>
            </div>

            <button className={`${btnPrimary} w-full justify-center`} onClick={() => void save()} disabled={saving}>
              {saving ? 'Saving…' : draft.id ? 'Save access' : 'Create teacher login'}
            </button>
          </div>
        )}
      </Modal>

      {/* RESET LOGIN */}
      <Modal
        open={!!resetFor}
        onClose={() => setResetFor(null)}
        title={`Reset login — ${resetFor?.name || ''}`}
      >
        <div className="space-y-4">
          {resetError && <ErrorNote message={resetError} />}
          <p className="text-xs text-slate-400">
            Sign <span className="font-mono text-slate-200">@{resetFor?.username}</span> out everywhere and set a
            new password. They will be asked to change it at their next sign-in.
          </p>
          <div>
            <label className={labelCls} htmlFor="t-reset">New password</label>
            <input
              id="t-reset"
              className={inputCls}
              type="password"
              value={resetPassword}
              onChange={(e) => { setResetPassword(e.target.value); setResetError(''); }}
              placeholder="Min. 6 characters"
              autoFocus
            />
          </div>
          <button className={`${btnPrimary} w-full justify-center`} onClick={() => void resetLogin()} disabled={saving}>
            <KeyRound className="w-4 h-4" /> {saving ? 'Resetting…' : 'Reset login'}
          </button>
        </div>
      </Modal>
    </div>
  );
}