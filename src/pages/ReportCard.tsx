import { useEffect, useMemo, useState } from 'react';
import { Award, Printer, TrendingUp, AlertTriangle } from 'lucide-react';
import { api, ApiError } from '../lib/api';
import type { AppCtx } from '../lib/context';
import type { Learner, LearnerMarks } from '../lib/types';
import {
  subjectsForGrade, rubricFor, RUBRIC_LABELS, GRADE_MILESTONES, PATHWAY_RULES,
} from '../lib/curriculum';
import {
  Panel, PageHeader, inputCls, labelCls, btnPrimary, EmptyState, ErrorNote, Badge,
} from '../components/ui';

interface MarkRow {
  learnerId: string;
  subjectId: string;
  score: number;
  rubric: string;
  points: number;
}

const bandClass = (score: number) =>
  score >= 80 ? 'text-emerald-400' : score >= 60 ? 'text-indigo-300' : score >= 40 ? 'text-amber-400' : 'text-rose-400';

export default function ReportCard({ ctx }: { ctx: AppCtx }) {
  const [marks, setMarks] = useState<MarkRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const learner: Learner | undefined = useMemo(() => {
    if (ctx.selectedLearnerId) {
      const found = ctx.learners.find((l) => l.id === ctx.selectedLearnerId);
      if (found) return found;
    }
    return ctx.visibleLearners[0] || ctx.learners[0];
  }, [ctx.selectedLearnerId, ctx.learners, ctx.visibleLearners]);

  useEffect(() => {
    if (!learner) return;
    let cancelled = false;
    setLoading(true);
    setError('');
    api
      .get<{ marks: MarkRow[] }>(`/api/marks?learner=${encodeURIComponent(learner.id)}`)
      .then((res) => { if (!cancelled) setMarks(res.marks); })
      .catch((err) => { if (!cancelled) setError(err instanceof ApiError ? err.message : 'Failed to load marks'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [learner?.id]);

  if (!learner) {
    return (
      <div className="animate-fadeIn">
        <EmptyState title="No learner selected" hint="Enrol learners first, then open their report card here." />
      </div>
    );
  }

  const subjects = subjectsForGrade(learner.gradeLevel);
  const marksById: LearnerMarks = {};
  for (const m of marks) marksById[m.subjectId] = { score: m.score, rubric: m.rubric, points: m.points };

  const scored = subjects.filter((s) => marksById[s.id]);
  const totalPoints = scored.reduce((acc, s) => acc + (marksById[s.id]?.points || 0), 0);
  const maxPoints = scored.length * 4;
  const average = scored.length
    ? Math.round((scored.reduce((a, s) => a + marksById[s.id].score, 0) / scored.length) * 10) / 10
    : null;
  const milestone = GRADE_MILESTONES[learner.gradeLevel];
  const bestPathway = useMemo(() => {
    if (!scored.length) return null;
    return PATHWAY_RULES.map((rule) => {
      const matched = scored.filter((s) => rule.subjects.includes(s.id));
      const avg = matched.length
        ? matched.reduce((a, s) => a + marksById[s.id].score, 0) / matched.length
        : 0;
      return { name: rule.name, match: Math.round(avg) };
    }).sort((a, b) => b.match - a.match)[0];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scored, marks]);

  return (
    <div className="space-y-6 animate-fadeIn no-print-parent">
      <PageHeader
        title="Report Card"
        sub="Official competency evaluation sheet — print ready"
        icon={<Award className="w-4 h-4" />}
        actions={
          <>
            <div className="flex items-center gap-2">
              <label className={labelCls + ' mb-0'}>Select profile</label>
              <select
                className={inputCls + ' w-auto max-w-xs'}
                value={learner.id}
                onChange={(e) => ctx.setSelectedLearnerId(e.target.value)}
              >
                {ctx.visibleLearners.map((s) => (
                  <option key={s.id} value={s.id}>{s.name} ({s.stream})</option>
                ))}
              </select>
            </div>
            <button className={`${btnPrimary} no-print`} onClick={() => window.print()}>
              <Printer className="w-4 h-4" /> Print Official Report Card
            </button>
          </>
        }
      />

      {error && <ErrorNote message={error} />}

      <div id="printable-report" className="print-sheet bg-slate-900/95 p-8 rounded-3xl border border-slate-800 text-slate-100 max-w-4xl mx-auto space-y-6 shadow-2xl">
        <div className="border-b border-slate-800 pb-6 text-center space-y-2">
          <div className="w-12 h-12 bg-gradient-to-tr from-indigo-600 to-violet-600 text-white font-bold text-xl rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-indigo-600/30">
            ET
          </div>
          <h1 className="text-lg font-bold uppercase tracking-wider">ElimuTrack Academy Primary &amp; Junior Secondary</h1>
          <p className="text-xs print-muted text-slate-400">
            OFFICIAL COMPETENCY EVALUATION REPORT CARD — {learner.gradeLevel}
            {milestone ? ` · ${milestone.stage}` : ''}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-950 rounded-2xl border border-slate-800 text-xs">
          {[
            ['Learner Name', learner.name],
            ['Stream', learner.stream],
            ['NEMIS UPI', learner.nemisUpi || '—'],
            ['KNEC Assessment No', learner.knecNo || '—'],
            ['Admission No', learner.admissionNo],
            ['Gender', learner.gender],
            ['Attendance', `${learner.attendancePct}%`],
            ['Fee Balance', `KES ${learner.feeBalance.toLocaleString()}`],
          ].map(([label, value]) => (
            <div key={label}>
              <span className="print-muted block text-[10px] uppercase font-bold text-slate-500">{label}</span>
              <span className="font-semibold text-white">{value}</span>
            </div>
          ))}
        </div>

        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">
            Continuous Competency &amp; Subject Performance
          </h3>
          {loading ? (
            <div className="h-32 rounded-2xl animate-shimmer" />
          ) : (
            <table className="w-full text-left text-xs border border-slate-800 rounded-2xl overflow-hidden">
              <thead className="bg-slate-950 text-slate-400 uppercase font-semibold text-[10px]">
                <tr>
                  <th className="p-3">Learning Area</th>
                  <th className="p-3 text-center">Score (100)</th>
                  <th className="p-3 text-center">Rubric Band</th>
                  <th className="p-3 text-center">Points</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {subjects.map((s) => {
                  const m = marksById[s.id];
                  return (
                    <tr key={s.id}>
                      <td className="p-3 font-semibold text-white">{s.name}</td>
                      <td className={`p-3 text-center font-bold ${m ? bandClass(m.score) : 'text-slate-600'}`}>
                        {m ? m.score : '—'}
                      </td>
                      <td className="p-3 text-center">
                        {m ? (
                          <span className="text-slate-300">{m.rubric}</span>
                        ) : (
                          <span className="text-slate-600">—</span>
                        )}
                      </td>
                      <td className="p-3 text-center text-slate-300">{m ? m.points : '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-slate-950">
                  <td className="p-3 font-bold text-white uppercase text-[10px] tracking-wider">Aggregate</td>
                  <td className="p-3 text-center font-bold text-white">{average ?? '—'}</td>
                  <td className="p-3 text-center text-slate-400">{scored.length} areas assessed</td>
                  <td className="p-3 text-center font-bold text-white">
                    {totalPoints}{maxPoints ? ` / ${maxPoints}` : ''}
                  </td>
                </tr>
              </tfoot>
            </table>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Rubric key</h4>
            {Object.entries(RUBRIC_LABELS).map(([band, label]) => (
              <div key={band} className="flex items-center gap-2 text-[11px]">
                <span className="w-7 font-mono font-bold text-indigo-300">{band}</span>
                <span className="text-slate-400">{label}</span>
              </div>
            ))}
          </div>
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <TrendingUp className="w-3.5 h-3.5" /> Pathway outlook
            </h4>
            {bestPathway ? (
              <>
                <p className="text-sm font-bold text-white">{bestPathway.name} — {bestPathway.match}% match</p>
                <p className="text-[11px] text-slate-400">
                  Suggested from continuous-assessment performance in related learning areas.
                </p>
              </>
            ) : (
              <p className="text-[11px] text-slate-500">Capture marks to generate a pathway recommendation.</p>
            )}
          </div>
        </div>

        {milestone && (
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4">
            <Badge>{milestone.assessment}</Badge>
            <p className="text-[11px] text-slate-400 mt-2">
              Term focus: {milestone.focus}. Competency grades above are derived from school-based continuous
              assessment recorded in the ElimuTrack marksbook.
            </p>
          </div>
        )}

        <div className="flex justify-between items-end pt-4 border-t border-slate-800 text-[11px] text-slate-400 print-muted">
          <div>
            <div className="border-b border-slate-700 w-44 mb-1" />Class Teacher Signature
          </div>
          <div>
            <div className="border-b border-slate-700 w-44 mb-1" />Head Teacher Signature
          </div>
          <div className="text-right">
            <div className="font-mono text-slate-300">{new Date().toISOString().slice(0, 10)}</div>
            Date issued
          </div>
        </div>
      </div>

      {scored.length === 0 && !loading && (
        <div className="flex items-center gap-2 text-amber-300 text-xs bg-amber-500/10 border border-amber-500/30 p-3 rounded-xl">
          <AlertTriangle className="w-4 h-4" /> No marks recorded for this learner yet.
        </div>
      )}
    </div>
  );
}
