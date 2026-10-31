import { useCallback, useEffect, useMemo, useState } from 'react';
import { Loader2, Search, X, CheckCircle, AlertCircle, Users, Clipboard, Calendar, Mail, Shield, Edit, Trash2, Plus } from 'lucide-react';
import { api, ApiError, planSpec } from '../lib/api';
import type { AppCtx } from '../lib/context';
import { inputCls, selectCls, labelCls, btnPrimary, btnGhost, Panel, PageHeader, EmptyState, ErrorNote, Badge, Modal, Loading } from '../components/ui';
import { subjectsForStream, STREAMS } from '../lib/curriculum';
import type { KicdDesign } from '../lib/types';

interface ProgressForm {
  learnerId: string;
  subjectId: string;
  strand: string;
  subStrand: string;
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
  strand?: string;
  subStrand?: string;
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
  const [viewMode, setViewMode] = useState<'byLearner' | 'byStrand'>('byLearner');
  const [filterStream, setFilterStream] = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  const [filterStrand, setFilterStrand] = useState('');
  const [filterSubStrand, setFilterSubStrand] = useState('');
  const [kicdDesigns, setKicdDesigns] = useState<KicdDesign[]>([]);

  const streams = useMemo(
    () => ctx.session.streams === null ? [...STREAMS] : ctx.session.streams,
    [ctx.session.streams],
  );

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

  useEffect(() => {
    const fetchKicd = async () => {
      try {
        const res = await api.get<{ designs: KicdDesign[] }>('/api/kicd?category=regular');
        setKicdDesigns(res.designs || []);
      } catch {
        setKicdDesigns([]);
      }
    };
    void fetchKicd();
  }, []);

  const levelOf = (stream: string) => {
    const m = stream.match(/Grade (\d)/);
    const g = m ? Number(m[1]) : 0;
    if (g >= 1 && g <= 3) return 'Lower Primary';
    if (g >= 4 && g <= 6) return 'Upper Primary';
    if (g >= 7) return 'Junior School';
    return 'Pre-Primary';
  };

  const relevantDesigns = useMemo(() => {
    if (!filterStream || !filterSubject) return [];
    return kicdDesigns.filter(d => 
      d.level === levelOf(filterStream) && d.subjectId === filterSubject
    );
  }, [kicdDesigns, filterStream, filterSubject]);

  const strands = useMemo(() => [...new Set(relevantDesigns.map(d => d.strand).filter(Boolean))], [relevantDesigns]);
  const subStrands = useMemo(() => {
    if (!filterStrand) return [];
    return relevantDesigns.filter(d => d.strand === filterStrand).map(d => d.subStrand).filter(Boolean);
  }, [relevantDesigns, filterStrand]);

  const learnersForStream = useMemo(() => {
    if (!filterStream) return ctx.learners;
    return ctx.learners.filter(l => l.stream === filterStream);
  }, [ctx.learners, filterStream]);

  const openForm = (learnerId?: string) => {
    const data: ProgressForm = {
      learnerId: learnerId || (learnersForStream[0]?.id || ''),
      subjectId: filterSubject || (subjectsForStream(filterStream)[0]?.id || ''),
      strand: filterStrand || '',
      subStrand: filterSubStrand || '',
      term: `Term ${Math.ceil((new Date().getMonth() + 1) / 4)}`,
      day: new Date().toISOString().slice(0, 10),
      stage: 'Developing',
      note: '',
    };
    setForm(data);
  };

  const save = async () => {
    if (!form) return;
    setLoading(true);
    setError('');
    try {
      if (form.learnerId && form.note) {
        await api.post('/api/progress', form);
        ctx.toast('Progress record added');
        setForm(null);
        await load();
      } else {
        setError('Learner and note are required');
      }
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

  const filteredRecords = useMemo(() => {
    let result = records;
    if (filterStream) {
      const learnerIds = new Set(learnersForStream.map(l => l.id));
      result = result.filter(r => learnerIds.has(r.learnerId));
    }
    if (filterSubject) result = result.filter(r => r.subjectId === filterSubject);
    if (filterStrand) result = result.filter(r => r.strand === filterStrand);
    if (filterSubStrand) result = result.filter(r => r.subStrand === filterSubStrand);
    return result.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [records, filterStream, filterSubject, filterStrand, filterSubStrand, learnersForStream]);

  return (
    <div className="space-y-6 animate-fadeIn">
      <PageHeader
        title="Learner Progress"
        sub="Track learner progress by strand and sub-strand linked to KICD curriculum"
        icon={<Clipboard className="w-5 h-5" />}
        actions={
          <button className={btnPrimary} onClick={() => openForm()}>
            <Plus className="w-4 h-4" /> Add Progress
          </button>
        }
      />

      {error && <ErrorNote message={error} />}

      <Panel title="Filter Progress" icon={<Search className="w-4 h-4" />}>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <div>
            <label className={labelCls}>Class/Grade</label>
            <select className={selectCls} value={filterStream} onChange={(e) => {
              setFilterStream(e.target.value);
              setFilterSubject('');
              setFilterStrand('');
              setFilterSubStrand('');
            }}>
              <option value="">All Classes</option>
              {streams.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Learning Area</label>
            <select className={selectCls} value={filterSubject} onChange={(e) => {
              setFilterSubject(e.target.value);
              setFilterStrand('');
              setFilterSubStrand('');
            }} disabled={!filterStream}>
              <option value="">All Areas</option>
              {filterStream && subjectsForStream(filterStream).map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>Strand</label>
            <select className={selectCls} value={filterStrand} onChange={(e) => {
              setFilterStrand(e.target.value);
              setFilterSubStrand('');
            }} disabled={!filterSubject}>
              <option value="">All Strands</option>
              {strands.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Sub-Strand</label>
            <select className={selectCls} value={filterSubStrand} onChange={(e) => setFilterSubStrand(e.target.value)} disabled={!filterStrand}>
              <option value="">All Sub-Strands</option>
              {[...new Set(subStrands)].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="flex items-end">
            <button className={btnGhost} onClick={() => {
              setFilterStream(''); setFilterSubject(''); setFilterStrand(''); setFilterSubStrand('');
            }}>
              Clear Filters
            </button>
          </div>
        </div>
      </Panel>

      <Panel title={`Progress Records (${filteredRecords.length})`} icon={<Calendar className="w-4 h-4" />}>
        {loading ? (
          <Loading label="Loading records" />
        ) : filteredRecords.length === 0 ? (
          <EmptyState
            icon={<Clipboard className="w-6 h-6" />}
            title="No progress records"
            hint="Select a class, learning area, strand and add progress for learners."
          />
        ) : (
          <div className="space-y-2">
            {filteredRecords.map((row) => (
              <div key={row.id} className="bg-slate-950 border border-slate-800 rounded-2xl p-4">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge tone="bg-indigo-500/10 text-indigo-300 border-indigo-500/30">{row.learnerName}</Badge>
                    <Badge tone="bg-slate-500/10 text-slate-300 border-slate-500/30">{row.stream}</Badge>
                    <span className="text-xs text-slate-400">{row.subjectId}</span>
                    <Badge tone="bg-emerald-500/10 text-emerald-300 border-emerald-500/30">{row.stage}</Badge>
                  </div>
                  {(ctx.session.role === 'admin' || row.staffId === ctx.session.staff?.id) && (
                    <button className={btnGhost} onClick={() => void remove(row.id)}>
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
                {(row.strand || row.subStrand) && (
                  <div className="text-xs text-slate-400 mb-2">
                    {row.strand && <span className="text-indigo-300">{row.strand}</span>}
                    {row.strand && row.subStrand && <span> → </span>}
                    {row.subStrand && <span className="text-sky-300">{row.subStrand}</span>}
                  </div>
                )}
                <p className="text-sm text-slate-300 leading-relaxed">{row.note}</p>
                <div className="mt-2 text-xs text-slate-500">
                  {row.term} • {row.day} • by {row.author}
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>

      {form !== null && (
        <Modal
          open={form !== null}
          onClose={() => {
            setForm(null);
          }}
          title={'Add progress record'}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls} htmlFor="prog-learner">Learner</label>
                <select
                  id="prog-learner"
                  className={selectCls}
                  value={form.learnerId}
                  onChange={(e) => setForm((f) => (f ? { ...f, learnerId: e.target.value } : f))}
                >
                  {ctx.learners ? ctx.learners.map((l) => (
                    <option key={l.id} value={l.id}>{l.name}</option>
                  )) : []}
                </select>
              </div>
              <div>
                <label className={labelCls} htmlFor="prog-subject">Learning Area</label>
                <select
                  id="prog-subject"
                  className={selectCls}
                  value={form.subjectId}
                  onChange={(e) => setForm((f) => (f ? { ...f, subjectId: e.target.value } : f))}
                >
                  <option value="">Select</option>
                  {form && filterStream ? subjectsForStream(filterStream).map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  )) : []}
                </select>
              </div>
              <div>
                <label className={labelCls} htmlFor="prog-strand">Strand</label>
                <select
                  id="prog-strand"
                  className={selectCls}
                  value={form.strand}
                  onChange={(e) => setForm((f) => (f ? { ...f, strand: e.target.value, subStrand: '' } : f))}
                >
                  <option value="">Select</option>
                  {strands.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls} htmlFor="prog-substrand">Sub-Strand</label>
                <select
                  id="prog-substrand"
                  className={selectCls}
                  value={form.subStrand}
                  onChange={(e) => setForm((f) => (f ? { ...f, subStrand: e.target.value } : f))}
                >
                  <option value="">Select</option>
                  {[...new Set(subStrands)].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls} htmlFor="prog-term">Term</label>
                <input
                  id="prog-term"
                  className={inputCls}
                  value={form.term}
                  onChange={(e) => setForm((f) => (f ? { ...f, term: e.target.value } : f))}
                />
              </div>
              <div>
                <label className={labelCls} htmlFor="prog-day">Date</label>
                <input
                  id="prog-day"
                  type="date"
                  className={inputCls}
                  value={form.day}
                  onChange={(e) => setForm((f) => (f ? { ...f, day: e.target.value } : f))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls} htmlFor="prog-stage">Stage/Level of Achievement</label>
                <select
                  id="prog-stage"
                  className={selectCls}
                  value={form.stage}
                  onChange={(e) => setForm((f) => (f ? { ...f, stage: e.target.value } : f))}
                >
                  <option value="Beginning">Beginning</option>
                  <option value="Developing">Developing</option>
                  <option value="Secure">Secure</option>
                  <option value="Exceeding">Exceeding</option>
                </select>
              </div>
              <div>
                <label className={labelCls} htmlFor="prog-note">Progress Notes / Comments</label>
                <textarea
                  id="prog-note"
                  className={`${inputCls} min-h-[80px] leading-relaxed`}
                  value={form.note}
                  onChange={(e) => setForm((f) => (f ? { ...f, note: e.target.value } : f))}
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button className={`${btnPrimary}`} onClick={() => save()}>
                Save Progress
              </button>
              <button className={btnGhost} onClick={() => { setForm(null); }}>
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}