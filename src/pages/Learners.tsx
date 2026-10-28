import { useMemo, useState } from 'react';
import { Users, UserPlus, Eye, Award, Search } from 'lucide-react';
import { api, ApiError, planSpec, PLAN_LIMIT_CODES } from '../lib/api';
import type { AppCtx } from '../lib/context';
import type { NewLearnerInput } from '../lib/types';
import { STREAMS, gradeLevelForStream } from '../lib/curriculum';
import {
  Panel, PageHeader, inputCls, labelCls, btnPrimary, btnGhost, Modal,
  EmptyState, ErrorNote, Badge,
} from '../components/ui';

const EMPTY: any = {
  name: '', gender: 'Male', stream: 'Grade 7 Eta', gradeLevel: 'Grade 7',
  admissionNo: '', nemisUpi: '', knecNo: '', guardianPhone: '',
  boarding: false, admissionFeePaid: false,
};

export default function LearnersPage({ ctx }: { ctx: AppCtx }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<NewLearnerInput>(EMPTY);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const spec = planSpec(ctx.session.tenant?.plan);

  const atLimit = ctx.learners.length >= spec.maxLearners;

  const groups = useMemo(() => {
    const map = new Map<string, typeof ctx.visibleLearners>();
    for (const l of ctx.visibleLearners) {
      map.set(l.stream, [...(map.get(l.stream) || []), l]);
    }
    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [ctx.visibleLearners]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.admissionNo.trim()) {
      setError('Learner name and admission number are required.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await api.post('/api/learners', form);
      await ctx.reloadLearners();
      setForm(EMPTY);
      setOpen(false);
      ctx.toast(`${form.name} enrolled`);
    } catch (err) {
      if (err instanceof ApiError && err.code === PLAN_LIMIT_CODES.LEARNER_LIMIT) {
        setError(`Your ${spec.name} plan allows up to ${spec.maxLearners} learners. Upgrade to enrol more.`);
      } else {
        setError(err instanceof ApiError ? err.message : 'Failed to enrol learner');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <PageHeader
        title="Learners"
        sub={`${ctx.learners.length} enrolled · plan capacity ${spec.maxLearners >= 100000 ? 'unlimited' : spec.maxLearners}`}
        icon={<Users className="w-4 h-4" />}
        actions={
          <button
            className={btnPrimary}
            onClick={() => { setError(''); setOpen(true); }}
            disabled={atLimit}
            title={atLimit ? 'Plan limit reached' : 'Enrol a new learner'}
          >
            <UserPlus className="w-4 h-4" /> Enrol New Learner
          </button>
        }
      />

      {atLimit && (
        <ErrorNote
          message={`Plan limit reached: ${spec.name} includes up to ${spec.maxLearners} learners. Open Plan & Billing to upgrade.`}
        />
      )}

      <Panel
        title="Enrolment roster"
        icon={<Users className="w-4 h-4 text-indigo-400" />}
        right={
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              className={inputCls + ' pl-8 w-56'}
              placeholder="Filter by name or adm no…"
              value={ctx.query}
              onChange={(e) => ctx.setQuery(e.target.value)}
            />
          </div>
        }
      >
        {ctx.visibleLearners.length === 0 ? (
          <EmptyState
            icon={<Users className="w-6 h-6" />}
            title={ctx.learners.length === 0 ? 'No learners enrolled yet' : 'No learners match your filters'}
            hint={ctx.learners.length === 0 ? 'Enrol your first learner, or generate a demo cohort from the panel below.' : 'Clear the search box or switch the stream filter.'}
          />
        ) : (
          <div className="space-y-6">
            {groups.map(([stream, list]) => (
              <div key={stream} className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-indigo-400">{stream}</h4>
                  <span className="text-[11px] text-slate-500">{list.length} learners</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                  {list.map((l) => (
                    <div
                      key={l.id}
                      className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex justify-between items-start gap-3 hover:border-indigo-500/40 transition-all"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 flex items-center justify-center text-[10px] font-bold shrink-0">
                            {l.name.slice(0, 1)}
                          </span>
                          <span className="text-xs font-semibold text-white truncate">{l.name}</span>
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono mt-1.5 truncate">
                          {l.admissionNo} · {l.nemisUpi}
                        </div>
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          <Badge tone="bg-slate-950 text-slate-400 border-slate-800">{l.gender}</Badge>
                          <Badge tone={l.feeBalance > 0 ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'}>
                            {l.feeBalance > 0 ? `Bal ${l.feeBalance.toLocaleString()}` : 'Fees clear'}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 shrink-0">
                        <button
                          title="Open report card"
                          onClick={() => { ctx.setSelectedLearnerId(l.id); ctx.navigate('reportcard'); }}
                          className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-indigo-300 hover:border-indigo-500/50 transition-all"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          title="Pathway profile"
                          onClick={() => ctx.navigate('pathways')}
                          className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-indigo-300 hover:border-indigo-500/50 transition-all"
                        >
                          <Award className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>

      <Modal open={open} onClose={() => setOpen(false)} title="Enrol New Learner">
        <form onSubmit={submit} className="space-y-4">
          {error && <ErrorNote message={error} />}
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className={labelCls}>Full name *</label>
              <input
                className={inputCls}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Amina Wanjiku Mohamed"
              />
            </div>
            <div>
              <label className={labelCls}>Gender</label>
              <select className={inputCls} value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
                <option>Male</option>
                <option>Female</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Stream</label>
              <select
                className={inputCls}
                value={form.stream}
                onChange={(e) =>
                  setForm({
                    ...form,
                    stream: e.target.value,
                    gradeLevel: gradeLevelForStream(e.target.value),
                  })
                }
              >
                {STREAMS.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Admission No *</label>
              <input
                className={inputCls}
                value={form.admissionNo}
                onChange={(e) => setForm({ ...form, admissionNo: e.target.value })}
                placeholder="e.g. 7051"
              />
            </div>
            <div>
              <label className={labelCls}>NEMIS UPI</label>
              <input
                className={inputCls}
                value={form.nemisUpi}
                onChange={(e) => setForm({ ...form, nemisUpi: e.target.value })}
                placeholder="NEM-xxxx"
              />
            </div>
            <div>
              <label className={labelCls}>KNEC No</label>
              <input
                className={inputCls}
                value={form.knecNo}
                onChange={(e) => setForm({ ...form, knecNo: e.target.value })}
                placeholder="KNC-2026-xxxx"
              />
            </div>
            <div>
              <label className={labelCls}>Guardian phone</label>
              <input
                className={inputCls}
                value={form.guardianPhone}
                onChange={(e) => setForm({ ...form, guardianPhone: e.target.value })}
                placeholder="+2547…"
              />
            </div>
            <div className="col-span-2 flex items-center gap-6">
              <label className="flex items-center gap-2 text-xs text-slate-300">
                <input
                  type="checkbox"
                  checked={(form as any).boarding || false}
                  onChange={(e) => setForm({ ...form, boarding: e.target.checked } as any)}
                  className="rounded border-slate-700"
                />
                Boarding student
              </label>
              <label className="flex items-center gap-2 text-xs text-slate-300">
                <input
                  type="checkbox"
                  checked={(form as any).admissionFeePaid || false}
                  onChange={(e) => setForm({ ...form, admissionFeePaid: e.target.checked } as any)}
                  className="rounded border-slate-700"
                />
                Admission fee paid
              </label>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className={btnGhost} onClick={() => setOpen(false)}>Cancel</button>
            <button type="submit" className={btnPrimary} disabled={saving}>
              {saving ? 'Enrolling…' : 'Enrol learner'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
