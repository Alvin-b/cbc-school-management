import { useCallback, useEffect, useMemo, useState } from 'react';
import { CalendarRange, Plus, Pencil, Trash2, Download } from 'lucide-react';
import { api, ApiError } from '../lib/api';
import type { AppCtx } from '../lib/context';
import type { KicdDesign, SchemeRow } from '../lib/types';
import { STREAMS, subjectsForStream, SUBJECT_BY_ID } from '../lib/curriculum';
import {
  Panel, PageHeader, inputCls, selectCls, labelCls, btnPrimary, btnGhost,
  EmptyState, ErrorNote, Badge, Modal, Loading,
} from '../components/ui';

const defaultTerm = () => {
  const d = new Date();
  return `Term ${Math.min(3, Math.floor(d.getMonth() / 3) + 1)} ${d.getFullYear()}`;
};

const levelOf = (stream: string) => {
  const m = stream.match(/Grade (\d)/);
  const g = m ? Number(m[1]) : 0;
  if (g >= 1 && g <= 3) return 'Lower Primary';
  if (g >= 4 && g <= 6) return 'Upper Primary';
  if (g >= 7) return 'Junior School';
  return 'Pre-Primary';
};

interface Draft {
  id?: string;
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
}

export default function Schemes({ ctx }: { ctx: AppCtx }) {
  const streams = useMemo(
    () => (ctx.session.streams === null ? [...STREAMS] : ctx.session.streams),
    [ctx.session.streams],
  );
  const [rows, setRows] = useState<SchemeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStream, setFilterStream] = useState('All Streams');
  const [filterSubject, setFilterSubject] = useState('');
  const [filterTerm, setFilterTerm] = useState('');
  const [draft, setDraft] = useState<Draft | null>(null);
  const [saving, setSaving] = useState(false);
  const [designs, setDesigns] = useState<KicdDesign[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<{ rows: SchemeRow[] }>('/api/schemes');
      setRows(res.rows);
      setError('');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load schemes of work');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const visible = useMemo(() => rows.filter((r) =>
    (filterStream === 'All Streams' || r.stream === filterStream) &&
    (!filterSubject || r.subjectId === filterSubject) &&
    (!filterTerm || r.term === filterTerm)), [rows, filterStream, filterSubject, filterTerm]);

  const terms = useMemo(() => [...new Set(rows.map((r) => r.term))], [rows]);

  const openNew = () => {
    const stream = streams[0] || STREAMS[0];
    setDraft({
      stream, subjectId: subjectsForStream(stream)[0].id, term: defaultTerm(),
      week: 1, strand: '', subStrand: '', outcomes: '', experiences: '',
      inquiry: '', resources: '', assessment: '', remarks: '',
    });
  };

  const openEdit = (row: SchemeRow) => setDraft({
    id: row.id, stream: row.stream, subjectId: row.subjectId, term: row.term, week: row.week,
    strand: row.strand, subStrand: row.subStrand, outcomes: row.outcomes,
    experiences: row.experiences, inquiry: row.inquiry, resources: row.resources,
    assessment: row.assessment, remarks: row.remarks,
  });

  // Pull the official strand/outcomes straight from the KICD library.
  const loadDesign = async (designId: string) => {
    if (!draft || !designId) return;
    try {
      const res = await api.get<{ designs: KicdDesign[] }>('/api/kicd?category=regular');
      const d = res.designs.find((x) => x.id === designId);
      if (!d) return;
      setDraft({
        ...draft,
        subjectId: d.subjectId,
        strand: d.strand,
        subStrand: d.subStrand,
        outcomes: d.outcomes.join('\n'),
        inquiry: d.inquiry.join('\n'),
        resources: d.resources.join(', '),
        assessment: d.standards.join(', '),
      });
      ctx.toast('Prefilled from the KICD design');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load designs');
    }
  };

  const fetchDesigns = async (stream: string, subjectId: string) => {
    try {
      const res = await api.get<{ designs: KicdDesign[] }>(
        `/api/kicd?category=regular&level=${encodeURIComponent(levelOf(stream))}&subject=${encodeURIComponent(subjectId)}`,
      );
      setDesigns(res.designs);
    } catch { setDesigns([]); }
  };

  const save = async () => {
    if (!draft) return;
    setSaving(true);
    setError('');
    try {
      if (draft.id) {
        await api.put('/api/schemes', draft);
        ctx.toast('Scheme row updated');
      } else {
        await api.post('/api/schemes', draft);
        ctx.toast('Scheme row added');
      }
      setDraft(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Saving failed');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (row: SchemeRow) => {
    if (!window.confirm(`Delete week ${row.week} for ${row.stream}?`)) return;
    try {
      await api.del('/api/schemes', { id: row.id });
      ctx.toast('Scheme row deleted');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
    }
  };

  const subjectName = (id: string) => SUBJECT_BY_ID[id]?.name || id;

  return (
    <div className="space-y-6 animate-fadeIn">
      <PageHeader
        title="Schemes of Work"
        sub="Termly teaching plans built from the KICD curriculum designs"
        icon={<CalendarRange className="w-5 h-5" />}
        actions={
          <button className={btnPrimary} onClick={openNew}>
            <Plus className="w-4 h-4" /> Add scheme row
          </button>
        }
      />

      <div className="flex flex-wrap gap-3">
        <select className={`${selectCls} w-auto`} value={filterStream} onChange={(e) => setFilterStream(e.target.value)}>
          <option value="All Streams">All my classes</option>
          {streams.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select className={`${selectCls} w-auto`} value={filterSubject} onChange={(e) => setFilterSubject(e.target.value)}>
          <option value="">All learning areas</option>
          {subjectsForStream(filterStream === 'All Streams' ? (streams[0] || STREAMS[0]) : filterStream).map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
        <select className={`${selectCls} w-auto`} value={filterTerm} onChange={(e) => setFilterTerm(e.target.value)}>
          <option value="">All terms</option>
          {terms.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      {error && <ErrorNote message={error} />}

      <Panel
        title={`Scheme rows (${visible.length})`}
        icon={<CalendarRange className="w-4 h-4" />}
      >
        {loading ? (
          <Loading label="Loading schemes" />
        ) : visible.length === 0 ? (
          <EmptyState
            icon={<CalendarRange className="w-6 h-6" />}
            title="No scheme rows yet"
            hint="Add your first week — you can prefill strand, outcomes and assessment straight from a KICD design."
          />
        ) : (
          <div className="space-y-2">
            {[...visible].sort((a, b) => a.stream.localeCompare(b.stream) || a.subjectId.localeCompare(b.subjectId) || a.week - b.week)
              .map((row) => (
                <div key={row.id} className="bg-slate-950 border border-slate-800 rounded-2xl p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone="bg-indigo-500/10 text-indigo-300 border-indigo-500/30">Week {row.week}</Badge>
                      <Badge tone="bg-slate-500/10 text-slate-300 border-slate-500/30">{row.stream}</Badge>
                      <span className="text-xs font-semibold text-white">{subjectName(row.subjectId)}</span>
                      <span className="text-[11px] text-slate-500">{row.term} · by {row.author}</span>
                    </div>
                    <div className="flex gap-2">
                      <button className={btnGhost} onClick={() => openEdit(row)}>
                        <Pencil className="w-3.5 h-3.5" /> Edit
                      </button>
                      <button className={btnGhost} onClick={() => void remove(row)} title="Delete">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-slate-400 grid gap-x-6 gap-y-1 sm:grid-cols-2">
                    {row.strand && <p><span className="text-slate-500 font-semibold">Strand: </span>{row.strand}{row.subStrand ? ` → ${row.subStrand}` : ''}</p>}
                    {row.outcomes && <p><span className="text-slate-500 font-semibold">Outcomes: </span>{row.outcomes}</p>}
                    {row.assessment && <p><span className="text-slate-500 font-semibold">Assessment: </span>{row.assessment}</p>}
                    {row.remarks && <p><span className="text-slate-500 font-semibold">Remarks: </span>{row.remarks}</p>}
                  </div>
                </div>
              ))}
          </div>
        )}
      </Panel>

      <Modal
        open={!!draft}
        onClose={() => setDraft(null)}
        title={draft?.id ? 'Edit scheme row' : 'New scheme row'}
      >
        {draft && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls} htmlFor="sc-stream">Class</label>
                <select
                  id="sc-stream"
                  className={selectCls}
                  value={draft.stream}
                  onChange={(e) => {
                    const stream = e.target.value;
                    const subjects = subjectsForStream(stream);
                    const subjectId = subjects.some((s) => s.id === draft.subjectId) ? draft.subjectId : subjects[0].id;
                    setDraft({ ...draft, stream, subjectId });
                    void fetchDesigns(stream, subjectId);
                  }}
                >
                  {streams.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls} htmlFor="sc-subject">Learning area</label>
                <select
                  id="sc-subject"
                  className={selectCls}
                  value={draft.subjectId}
                  onChange={(e) => { setDraft({ ...draft, subjectId: e.target.value }); void fetchDesigns(draft.stream, e.target.value); }}
                >
                  {subjectsForStream(draft.stream).map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls} htmlFor="sc-term">Term</label>
                <input id="sc-term" className={inputCls} value={draft.term}
                  onChange={(e) => setDraft({ ...draft, term: e.target.value })} />
              </div>
              <div>
                <label className={labelCls} htmlFor="sc-week">Week (1-40)</label>
                <input id="sc-week" type="number" min={1} max={40} className={inputCls} value={draft.week}
                  onChange={(e) => setDraft({ ...draft, week: Number(e.target.value) })} />
              </div>
            </div>

            {!draft.id && designs.length > 0 && (
              <div>
                <label className={labelCls} htmlFor="sc-design">Pre-fill from a KICD curriculum design</label>
                <select id="sc-design" className={selectCls} value=""
                  onChange={(e) => void loadDesign(e.target.value)}>
                  <option value="">Choose a design…</option>
                  {designs.map((d) => (
                    <option key={d.id} value={d.id}>{d.strand}{d.subStrand ? ` → ${d.subStrand}` : ''}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="space-y-3">
              {([
                ['strand', 'Strand'], ['subStrand', 'Sub-strand'],
                ['outcomes', 'Specific learning outcomes'], ['experiences', 'Learning experiences / activities'],
                ['inquiry', 'Key inquiry questions'], ['resources', 'Learning resources'],
                ['assessment', 'Assessment'], ['remarks', "Teacher's remarks"],
              ] as const).map(([key, label]) => (
                <div key={key}>
                  <label className={labelCls} htmlFor={`sc-${key}`}>{label}</label>
                  <textarea
                    id={`sc-${key}`}
                    className={`${inputCls} min-h-[60px] leading-relaxed`}
                    value={draft[key]}
                    onChange={(e) => setDraft({ ...draft, [key]: e.target.value })}
                  />
                </div>
              ))}
            </div>

            <button className={`${btnPrimary} w-full justify-center`} onClick={() => void save()} disabled={saving}>
              <Download className="w-4 h-4" /> {saving ? 'Saving…' : draft.id ? 'Save changes' : 'Add to scheme'}
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
}