import { useCallback, useEffect, useMemo, useState } from 'react';
import { Loader2, Search, X, CheckCircle, AlertCircle, Users, Clipboard, Calendar, Mail, Shield, Edit, Trash2 } from 'lucide-react';
import { api, ApiError, planSpec } from '../lib/api';
import type { AppCtx } from '../lib/context';
import { inputCls, selectCls, labelCls, btnPrimary, btnGhost, Panel, PageHeader, EmptyState, ErrorNote, Badge, Modal, Loading } from '../components/ui';

interface ProgressForm {
  learnerId: string;
  subjectId: string;
  term: string;
  day: string;
  stage: string;
  note: string;
}

interface ProgressRecord {
  id: string;
  learnerId: string;
  learnerName: string;
  stream: string;
  staffId: string;
  author: string;
  subjectId: string;
  term: string;
  day: string;
  stage: string;
  note: string;
  createdAt: string;
}

export default function LearnerProgress({ ctx }: { ctx: AppCtx }) {
  const spec = planSpec(ctx.session.tenant?.plan);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [records, setRecords] = useState<ProgressRecord[]>([]);
  const [form, setForm] = useState<ProgressForm | null>(null);
  const [editing, setEditing] = useState<ProgressRecord | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showing, setShowing] = useState<'all' | 'my-students' | 'all-students'>('all');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get<{ records: ProgressRecord[] }>('/api/progress');
      setRecords(res.records);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load progress records');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const filtered = useMemo(() => {
    if (showing === 'my-students') {
      return records.filter((r) => r.staffId === ctx.session.user?.sub || ctx.session.role === 'admin');
    }
    if (showing === 'all-students') {
      return records;
    }
    return records;
  }, [records, showing, ctx.session.user?.sub, ctx.session.role]);

  const openForm = (record?: ProgressRecord) => {
    const data: ProgressForm = {
      learnerId: record?.learnerId || '',
      subjectId: record?.subjectId || '',
      term: record?.term || '',
      day: record?.day || '',
      stage: record?.stage || '',
      note: record?.note || '',
    };
    if (record) setEditing(record);
    else setForm(data);
  };

  const save = async () => {
    if (!form) return;
    setLoading(true);
    setError('');
    try {
      if (form.learnerId && form.subjectId && form.note) {
        if (editing && editing.id) {
          await api.put('/api/progress', { ...form, id: editing.id });
          ctx.toast('Progress record updated');
        } else {
          await api.post('/api/progress', form);
          ctx.toast('Progress record added');
        }
      } else {
        setError('Learner, subject and note are required');
      }
      setForm(null);
      setEditing(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setLoading(false);
    }
  };

  const remove = async (id: string) => {
    if (!window.confirm('Delete this progress record?')) return;
    try {
      await api.del('/api/progress', { id });
      ctx.toast('Progress record deleted');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
    }
  };

  const streams = useMemo(
    () => ctx.session.streams === null ? [] : ctx.session.streams,
    [ctx.session.streams],
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      <PageHeader
        title="Learner Progress"
        sub="Narrative competency snapshots per learner per term"
        icon={<Clipboard className="w-5 h-5" />}
        actions={
          <div className="flex gap-2">
            <select
              className={selectCls}
              onChange={(e) => setShowing(e.target.value as any)}
            >
              <option value="all">All learners</option>
              <option value="my-students">My students only</option>
            </select>
            <Badge tone="bg-indigo-500/10 text-indigo-400 border-indigo-500/20">
              {showing === 'all' ? 'All' : 'My'}
            </Badge>
          </div>
        }
      />

      {error && <ErrorNote message={error} />}

      <Panel title={`Progress records (${filtered.length})`} icon={<Calendar className="w-4 h-4" />}>
        {loading ? (
          <Loading label="Loading records" />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<Calendar className="w-6 h-6" />}
            title="No progress records yet"
            hint="Admin or teacher: record competency stages and narrative notes per learner per term."
          />
        ) : (
          <div className="space-y-2">
            {[...filtered]
              .sort((a, b) => a.learnerName.localeCompare(b.learnerName) || a.day.localeCompare(b.day))
              .map((row) => (
                <div key={row.id} className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row gap-3 sm:gap-4 min-h-[130px]">
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-white sm:text-sm">{row.learnerName}</div>
                    <div className="text-[10px] text-slate-400 sm:text-xs">{row.stream}</div>
                  </div>
                  <div className="text-center sm:text-right">
                    <div className="font-mono text-amber-300 text-xs font-bold">{row.day}</div>
                    <div className="text-[10px] text-slate-500">{row.term}</div>
                  </div>
                  <div className="flex-1">
                    <div className="text-[10px] text-slate-500">Stage: {row.stage}</div>
                    {row.note && <div className="text-[10px] text-slate-400 mt-1 truncate">{row.note}</div>}
                  </div>
                  {ctx.session.role === 'admin' && (
                    <div className="text-right">
                      <button className={btnGhost} size="small" onClick={() => openForm(row)}>
                        <Edit className="w-3 h-3" /> Edit
                      </button>
                      <button className={btnGhost} size="small" onClick={() => void remove(row.id)}>
                        <Trash2 className="w-3 h-3" /> Delete
                      </button>
                    </div>
                  )}
                </div>
              ))}
          </div>
        )}
      </Panel>

      {form !== null || editing !== null ? (
        <Modal
          open={form !== null || editing !== null}
          onClose={() => {
            setForm(null);
            setEditing(null);
          }}
          title={editing ? 'Edit progress record' : 'Add progress record'}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls} htmlFor="prog-learner">Learner</label>
                <select
                  id="prog-learner"
                  className={selectCls}
                  value={form?.learnerId || editing?.learnerId || ''}
                  onChange={(e) => setForm({ ...form, learnerId: e.target.value })}
                >
                  {ctx.learners ? ctx.learners.map((l) => (
                    <option key={l.id} value={l.id}>{l.name}</option>
                  )) : []}
                </select>
              </div>
              <div>
                <label className={labelCls} htmlFor="prog-subject">Subject</label>
                <select
                  id="prog-subject"
                  className={selectCls}
                  value={form?.subjectId || editing?.subjectId || ''}
                  onChange={(e) => setForm({ ...form, subjectId: e.target.value })}
                >
                  <option value="">Any</option>
                </select>
              </div>
              <div>
                <label className={labelCls} htmlFor="prog-term">Term</label>
                <input
                  id="prog-term"
                  className={inputCls}
                  value={form?.term || editing?.term || ''}
                  onChange={(e) => setForm({ ...form, term: e.target.value })}
                />
              </div>
              <div>
                <label className={labelCls} htmlFor="prog-day">Day</label>
                <input
                  id="prog-day"
                  className={inputCls}
                  value={form?.day || editing?.day || ''}
                  onChange={(e) => setForm({ ...form, day: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls} htmlFor="prog-stage">Stage</label>
                <input
                  id="prog-stage"
                  className={inputCls}
                  value={form?.stage || editing?.stage || ''}
                  onChange={(e) => setForm({ ...form, stage: e.target.value })}
                />
              </div>
              <div>
                <label className={labelCls} htmlFor="prog-note">Note / competency snapshot</label>
                <textarea
                  id="prog-note"
                  className={`${inputCls} min-h-[80px] leading-relaxed`}
                  value={form?.note || editing?.note || ''}
                  onChange={(e) => setForm({ ...form, note: e.target.value })}
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button className={`${btnPrimary}`} onClick={() => save()}>
                {editing ? 'Update record' : 'Add record'}
              </button>
              <button className={btnGhost} onClick={() => { setForm(null); setEditing(null); }}>
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      ) : null}
    </div>
  );
}