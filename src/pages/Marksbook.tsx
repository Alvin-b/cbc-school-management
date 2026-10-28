import { useEffect, useMemo, useState } from 'react';
import { ClipboardCheck, Save, BookOpen, AlertTriangle } from 'lucide-react';
import { api, ApiError } from '../lib/api';
import type { AppCtx } from '../lib/context';
import type { LearnerMarks, MarkValue } from '../lib/types';
import { subjectsForStream, rubricFor, RUBRIC_LABELS } from '../lib/curriculum';
import { Panel, PageHeader, inputCls, labelCls, btnPrimary, ErrorNote, EmptyState, Badge } from '../components/ui';

interface MarkRow {
  learnerId: string;
  subjectId: string;
  score: number;
  rubric: string;
  points: number;
}

export default function Marksbook({ ctx }: { ctx: AppCtx }) {
  const subjects = useMemo(() => subjectsForStream(ctx.stream === 'All Streams' ? 'Grade 7 Eta' : ctx.stream), [ctx.stream]);
  const [subjectId, setSubjectId] = useState(subjects[0].id);
  const [rows, setRows] = useState<MarkRow[]>([]);
  const [edits, setEdits] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!subjects.some((s) => s.id === subjectId)) setSubjectId(subjects[0].id);
  }, [subjects, subjectId]);

  const subject = subjects.find((s) => s.id === subjectId) || subjects[0];

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    setEdits({});
    const stream = ctx.stream === 'All Streams' ? '' : ctx.stream;
    api
      .get<{ marks: MarkRow[] }>(`/api/marks?stream=${encodeURIComponent(stream)}`)
      .then((res) => { if (!cancelled) setRows(res.marks); })
      .catch((err) => { if (!cancelled) setError(err instanceof ApiError ? err.message : 'Failed to load marks'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [ctx.stream, ctx.reloadLearners]);

  const marksByLearner = useMemo(() => {
    const map: Record<string, LearnerMarks> = {};
    for (const row of rows) {
      map[row.learnerId] = map[row.learnerId] || {};
      map[row.learnerId][row.subjectId] = { score: row.score, rubric: row.rubric, points: row.points };
    }
    return map;
  }, [rows]);

  const dirty = Object.keys(edits).length > 0;
  const invalid = Object.values(edits).some((v) => {
    const n = Number(v);
    return v.trim() === '' || Number.isNaN(n) || n < 0 || n > 100 || !Number.isInteger(n);
  });

  const save = async () => {
    if (!dirty || invalid) return;
    setSaving(true);
    setError('');
    try {
      const items = Object.entries(edits).map(([learnerId, raw]) => ({
        learnerId,
        subjectId,
        score: Number(raw),
      }));
      await api.put('/api/marks', { items });
      await refresh();
      setEdits({}); // clearing here prevents stale values leaking into another subject
      ctx.toast(`Saved ${items.length} mark${items.length === 1 ? '' : 's'} · ${subject.name}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to save marks');
    } finally {
      setSaving(false);
    }
  };

  const refresh = async () => {
    const stream = ctx.stream === 'All Streams' ? '' : ctx.stream;
    const res = await api.get<{ marks: MarkRow[] }>(`/api/marks?stream=${encodeURIComponent(stream)}`);
    setRows(res.marks);
  };

  const mean = useMemo(() => {
    const scores = ctx.visibleLearners
      .map((l) => {
        const e = edits[l.id];
        if (e !== undefined && !Number.isNaN(Number(e))) return Number(e);
        return marksByLearner[l.id]?.[subject.id]?.score;
      })
      .filter((s): s is number => typeof s === 'number');
    if (!scores.length) return null;
    return Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10;
  }, [ctx.visibleLearners, edits, marksByLearner, subject.id]);

  return (
    <div className="space-y-6 animate-fadeIn">
      <PageHeader
        title="Marksbook"
        sub="Continuous assessment capture with automatic KNEC competency banding"
        icon={<ClipboardCheck className="w-4 h-4" />}
        actions={
          <button className={btnPrimary} onClick={() => void save()} disabled={!dirty || invalid || saving}>
            <Save className="w-4 h-4" />
            {saving ? 'Saving…' : `Save ${dirty ? Object.keys(edits).length : ''} change${Object.keys(edits).length === 1 ? '' : 's'}`}
          </button>
        }
      />

      <Panel
        title={subject.name}
        icon={<BookOpen className="w-4 h-4 text-indigo-400" />}
        right={
          <div className="flex items-center gap-3 flex-wrap">
            <Badge>{subject.code}</Badge>
            <Badge tone="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
              Continuous Assessment (CAT)
            </Badge>
            {mean !== null && <span className="text-xs text-slate-400">Column mean: <b className="text-white">{mean}</b></span>}
          </div>
        }
      >
        <div className="flex flex-wrap items-end gap-4 pb-4">
          <div className="min-w-56">
            <label className={labelCls}>Learning Area</label>
            <select className={inputCls} value={subjectId} onChange={(e) => setSubjectId(e.target.value)}>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
              ))}
            </select>
          </div>
          <div className="text-[11px] text-slate-500 max-w-md">
            Bands are applied on save: EE ≥ 80, ME ≥ 60, AE ≥ 40, BE &lt; 40 → 4/3/2/1 points.
          </div>
        </div>

        {error && <ErrorNote message={error} />}
        {invalid && (
          <div className="mt-3 flex items-center gap-2 text-amber-300 text-xs bg-amber-500/10 border border-amber-500/30 p-3 rounded-xl">
            <AlertTriangle className="w-4 h-4" /> Scores must be whole numbers between 0 and 100.
          </div>
        )}

        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left text-xs border border-slate-800 rounded-2xl overflow-hidden">
            <thead className="bg-slate-950 text-slate-400 uppercase font-semibold text-[10px]">
              <tr>
                <th className="p-3">#</th>
                <th className="p-3">Learner</th>
                <th className="p-3">Adm No</th>
                <th className="p-3 text-center">Score (100)</th>
                <th className="p-3 text-center">Rubric</th>
                <th className="p-3 text-center">Points</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                <tr><td colSpan={6} className="p-6 text-center text-slate-500">Loading marks…</td></tr>
              ) : ctx.visibleLearners.length === 0 ? (
                <tr><td colSpan={6} className="p-6"><EmptyState title="No learners match the current filters" /></td></tr>
              ) : (
                ctx.visibleLearners.map((learner, idx) => {
                  const existing = marksByLearner[learner.id]?.[subject.id];
                  const raw = edits[learner.id];
                  const effective = raw !== undefined ? raw : existing ? String(existing.score) : '';
                  const previewScore =
                    raw !== undefined && !Number.isNaN(Number(raw)) && raw.trim() !== ''
                      ? Number(raw)
                      : existing?.score;
                  const preview = previewScore !== undefined ? rubricFor(previewScore) : null;
                  return (
                    <tr key={learner.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-3 text-slate-500 font-mono">{idx + 1}</td>
                      <td className="p-3 font-semibold text-white">{learner.name}</td>
                      <td className="p-3 font-mono text-slate-400">{learner.admissionNo}</td>
                      <td className="p-3 text-center">
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={effective}
                          placeholder="—"
                          onChange={(e) => setEdits((prev) => ({ ...prev, [learner.id]: e.target.value }))}
                          className="w-24 bg-slate-950 border border-slate-800 text-center text-white p-1.5 rounded-lg text-xs font-semibold focus:border-indigo-500 focus:outline-none"
                        />
                      </td>
                      <td className="p-3 text-center">
                        {preview ? (
                          <span
                            className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border ${
                              preview.rubric === 'EE' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                : preview.rubric === 'ME' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30'
                                  : preview.rubric === 'AE' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                                    : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                            }`}
                            title={RUBRIC_LABELS[preview.rubric]}
                          >
                            {preview.rubric}
                          </span>
                        ) : (
                          <span className="text-slate-600">—</span>
                        )}
                      </td>
                      <td className="p-3 text-center text-slate-300 font-semibold">{preview ? preview.points : '—'}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
