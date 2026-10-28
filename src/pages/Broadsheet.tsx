import { useEffect, useMemo, useState } from 'react';
import { FileSpreadsheet, Download, Trophy, AlertTriangle } from 'lucide-react';
import { api, ApiError, planSpec, PLAN_LIMIT_CODES } from '../lib/api';
import type { AppCtx } from '../lib/context';
import type { LearnerMarks } from '../lib/types';
import { subjectsForStream, rubricFor } from '../lib/curriculum';
import {
  Panel, PageHeader, inputCls, labelCls, btnPrimary, EmptyState, ErrorNote,
  Badge, PlanLock,
} from '../components/ui';

interface MarkRow {
  learnerId: string;
  subjectId: string;
  score: number;
  rubric: string;
  points: number;
}

export default function Broadsheet({ ctx }: { ctx: AppCtx }) {
  const [rows, setRows] = useState<MarkRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [exporting, setExporting] = useState(false);
  const [sortKey, setSortKey] = useState<'rank' | 'name'>('rank');

  const spec = planSpec(ctx.session.tenant?.plan);
  const stream = ctx.stream === 'All Streams' ? '' : ctx.stream;
  const subjects = useMemo(
    () => subjectsForStream(ctx.stream === 'All Streams' ? 'Grade 7 Eta' : ctx.stream),
    [ctx.stream],
  );

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    api
      .get<{ marks: MarkRow[] }>(`/api/marks?stream=${encodeURIComponent(stream)}`)
      .then((res) => { if (!cancelled) setRows(res.marks); })
      .catch((err) => { if (!cancelled) setError(err instanceof ApiError ? err.message : 'Failed to load broadsheet'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [stream]);

  const byLearner = useMemo(() => {
    const map: Record<string, LearnerMarks> = {};
    for (const r of rows) {
      map[r.learnerId] = map[r.learnerId] || {};
      map[r.learnerId][r.subjectId] = { score: r.score, rubric: r.rubric, points: r.points };
    }
    return map;
  }, [rows]);

  const ranked = useMemo(() => {
    const list = ctx.visibleLearners.map((l) => {
      const marks = byLearner[l.id] || {};
      const scores = subjects.map((s) => marks[s.id]?.score).filter((v): v is number => typeof v === 'number');
      const totalPoints = subjects.reduce((acc, s) => acc + (marks[s.id]?.points || 0), 0);
      const average = scores.length
        ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10
        : null;
      return { learner: l, marks, average, totalPoints, scored: scores.length };
    });

    // Rank strictly on performance, then optionally re-sort for display.
    const byPerformance = [...list].sort((a, b) => (b.average ?? -1) - (a.average ?? -1));
    const withRank = byPerformance.map((row, i) => ({ ...row, rank: i + 1 }));
    if (sortKey === 'name') withRank.sort((a, b) => a.learner.name.localeCompare(b.learner.name));
    return withRank;
  }, [ctx.visibleLearners, byLearner, subjects, sortKey]);

  const download = async () => {
    setExporting(true);
    setError('');
    try {
      const res = await fetch(`/api/broadsheet/csv?stream=${encodeURIComponent(stream)}`, {
        credentials: 'same-origin',
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error || `Export failed (${res.status})`);
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `elimutrack-broadsheet-${stream || 'all-streams'}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      ctx.toast('KNEC broadsheet CSV downloaded');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <PageHeader
        title="KNEC Broadsheet"
        sub="Ranked continuous-assessment sheet across the current cohort"
        icon={<FileSpreadsheet className="w-4 h-4" />}
        actions={
          <>
            <div className="flex items-center gap-2">
              <label className={labelCls + ' mb-0'}>Sort</label>
              <select className={inputCls + ' w-auto'} value={sortKey} onChange={(e) => setSortKey(e.target.value as 'rank' | 'name')}>
                <option value="rank">By rank</option>
                <option value="name">By name</option>
              </select>
            </div>
            <button
              className={btnPrimary}
              onClick={() => void download()}
              disabled={exporting || !spec.exportCsv || ranked.length === 0}
            >
              <Download className="w-4 h-4" /> {exporting ? 'Exporting…' : 'Export KNEC CSV'}
            </button>
          </>
        }
      />

      {error && <ErrorNote message={error} />}
      {ctx.visibleLearners.length > 0 && ranked.every((r) => r.average === null) && (
        <div className="flex items-center gap-2 text-amber-300 text-xs bg-amber-500/10 border border-amber-500/30 p-3 rounded-xl">
          <AlertTriangle className="w-4 h-4" /> No marks recorded for this cohort yet — the sheet stays blank until
          you capture scores in the Marksbook.
        </div>
      )}

      <Panel
        title={`Broadsheet — ${ctx.stream}`}
        icon={<Trophy className="w-4 h-4 text-indigo-400" />}
        right={
          <div className="flex items-center gap-2">
            <Badge>{ranked.length} learners</Badge>
            <Badge tone="bg-slate-950 text-slate-400 border-slate-800">{spec.name}</Badge>
          </div>
        }
      >
        {!spec.exportCsv ? (
          <PlanLock feature="KNEC CSV export" planName={spec.name} onUpgrade={() => ctx.navigate('billing')} />
        ) : loading ? (
          <div className="h-40 rounded-2xl animate-shimmer" />
        ) : ranked.length === 0 ? (
          <EmptyState
            icon={<FileSpreadsheet className="w-6 h-6" />}
            title="No learners match the current filters"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-800 rounded-2xl overflow-hidden">
              <thead className="bg-slate-950 text-slate-400 uppercase font-semibold text-[10px]">
                <tr>
                  <th className="p-3">Rank</th>
                  <th className="p-3">Adm No</th>
                  <th className="p-3">Learner</th>
                  <th className="p-3">Stream</th>
                  {subjects.map((s) => (
                    <th key={s.id} className="p-2 text-center" title={s.name}>{s.code}</th>
                  ))}
                  <th className="p-3 text-center">Average</th>
                  <th className="p-3 text-center">Points</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {ranked.map((row) => (
                  <tr key={row.learner.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3 font-mono text-slate-400">
                      {sortKey === 'rank' ? row.rank : '—'}
                    </td>
                    <td className="p-3 font-mono text-slate-400">{row.learner.admissionNo}</td>
                    <td className="p-3 font-semibold text-white">{row.learner.name}</td>
                    <td className="p-3 text-slate-400">{row.learner.stream}</td>
                    {subjects.map((s) => {
                      const m = row.marks[s.id];
                      return (
                        <td key={s.id} className="p-2 text-center">
                          {m ? (
                            <span
                              title={`${rubricFor(m.score).rubric} · ${m.score}`}
                              className={m.score >= 80 ? 'text-emerald-400 font-semibold'
                                : m.score >= 60 ? 'text-indigo-300 font-semibold'
                                  : m.score >= 40 ? 'text-amber-400 font-semibold'
                                    : 'text-rose-400 font-semibold'}
                            >
                              {m.score}
                            </span>
                          ) : (
                            <span className="text-slate-600">—</span>
                          )}
                        </td>
                      );
                    })}
                    <td className="p-3 text-center font-bold text-white">
                      {row.average ?? '—'}
                    </td>
                    <td className="p-3 text-center text-slate-300">{row.totalPoints}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
}
