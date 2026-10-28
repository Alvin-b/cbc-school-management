import { useEffect, useMemo, useState } from 'react';
import { GraduationCap, Sparkles, BarChart2 } from 'lucide-react';
import { api, ApiError, planSpec } from '../lib/api';
import type { AppCtx } from '../lib/context';
import type { LearnerMarks } from '../lib/types';
import { PATHWAY_RULES, subjectsForGrade } from '../lib/curriculum';
import { Panel, PageHeader, EmptyState, ErrorNote, Badge, StatCard } from '../components/ui';

interface MarkRow {
  learnerId: string;
  subjectId: string;
  score: number;
  rubric: string;
  points: number;
}

export default function Pathways({ ctx }: { ctx: AppCtx }) {
  const [marks, setMarks] = useState<MarkRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const stream = ctx.stream === 'All Streams' ? '' : ctx.stream;
  const spec = planSpec(ctx.session.tenant?.plan);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    api
      .get<{ marks: MarkRow[] }>(`/api/marks?stream=${encodeURIComponent(stream)}`)
      .then((res) => { if (!cancelled) setMarks(res.marks); })
      .catch((err) => { if (!cancelled) setError(err instanceof ApiError ? err.message : 'Failed to load marks'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [stream]);

  const byLearner = useMemo(() => {
    const map: Record<string, LearnerMarks> = {};
    for (const m of marks) {
      map[m.learnerId] = map[m.learnerId] || {};
      map[m.learnerId][m.subjectId] = { score: m.score, rubric: m.rubric, points: m.points };
    }
    return map;
  }, [marks]);

  /** Cohort match: mean score over each pathway's learning areas. */
  const cohortMatches = useMemo(() => {
    return PATHWAY_RULES.map((rule) => {
      let sum = 0;
      let count = 0;
      for (const learner of ctx.visibleLearners) {
        const learnerMarks = byLearner[learner.id];
        if (!learnerMarks) continue;
        const areas = subjectsForGrade(learner.gradeLevel).filter((s) => rule.subjects.includes(s.id));
        for (const area of areas) {
          const m = learnerMarks[area.id];
          if (m) { sum += m.score; count++; }
        }
      }
      return {
        id: rule.id,
        name: rule.name,
        blurb: rule.blurb,
        match: count ? Math.round((sum / count) * 10) / 10 : 0,
        sample: count,
      };
    }).sort((a, b) => b.match - a.match);
  }, [ctx.visibleLearners, byLearner]);

  /** Per-learner recommendation for Grade 9, falling back to any assessed learner. */
  const recommendations = useMemo(() => {
    const rows = ctx.visibleLearners
      .filter((l) => byLearner[l.id])
      .map((l) => {
        const learnerMarks = byLearner[l.id];
        const areas = subjectsForGrade(l.gradeLevel);
        const best = PATHWAY_RULES.map((rule) => {
          const matched = areas.filter((s) => rule.subjects.includes(s.id));
          const avg = matched.length
            ? matched.reduce((acc, s) => acc + (learnerMarks[s.id]?.score ?? 0), 0) / matched.length
            : 0;
          return { name: rule.name, match: Math.round(avg * 10) / 10 };
        }).sort((a, b) => b.match - a.match);
        return { learner: l, top: best[0], runnerUp: best[1] };
      })
      .sort((a, b) => b.top.match - a.top.match);

    const gradeNine = rows.filter((r) => r.learner.gradeLevel === 'Grade 9');
    return (gradeNine.length ? gradeNine : rows).slice(0, 25);
  }, [ctx.visibleLearners, byLearner]);

  return (
    <div className="space-y-6 animate-fadeIn">
      <PageHeader
        title="Senior Secondary Pathway Recommendations"
        sub="Aptitude model built from continuous-assessment scores in Junior Secondary"
        icon={<GraduationCap className="w-4 h-4" />}
        actions={
          <>
            <Badge>{ctx.stream}</Badge>
            <Badge tone="bg-amber-500/10 text-amber-400 border-amber-500/30">{spec.name}</Badge>
          </>
        }
      />

      {error && <ErrorNote message={error} />}

      {loading ? (
        <div className="h-64 rounded-3xl animate-shimmer" />
      ) : marks.length === 0 ? (
        <Panel>
          <EmptyState
            icon={<Sparkles className="w-6 h-6" />}
            title="No assessment data for this cohort yet"
            hint="Record marks in the Marksbook first — pathway matching is calculated from real subject scores, never hardcoded."
          />
        </Panel>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {cohortMatches.map((c, i) => (
              <div
                key={c.id}
                className={`bg-slate-900 p-5 rounded-2xl border space-y-2 ${
                  i === 0 ? 'border-indigo-500/40 shadow-lg shadow-indigo-500/10' : 'border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold uppercase tracking-wider ${i === 0 ? 'text-indigo-400' : 'text-slate-400'}`}>
                    {c.name}
                  </span>
                  {i === 0 && <Badge>Top fit</Badge>}
                </div>
                <p className={`text-2xl font-bold ${i === 0 ? 'text-white' : 'text-slate-300'}`}>{c.match}% Match</p>
                <p className="text-[11px] text-slate-400">{c.blurb}</p>
                <p className="text-[10px] text-slate-600">Based on {c.sample} subject scores</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard
              label="Assessed learners"
              value={ctx.visibleLearners.filter((l) => byLearner[l.id]).length}
              icon={<BarChart2 className="w-4 h-4" />}
            />
            <StatCard
              label="Leading pathway"
              value={cohortMatches[0]?.name.replace(' Pathway', '') || '—'}
              icon={<Sparkles className="w-4 h-4" />}
              accent="text-violet-400"
            />
            <StatCard
              label="Grade 9 learners"
              value={ctx.visibleLearners.filter((l) => l.gradeLevel === 'Grade 9').length}
              icon={<GraduationCap className="w-4 h-4" />}
              accent="text-emerald-400"
              foot="Primary audience for pathway selection"
            />
          </div>

          <Panel
            title="Learner recommendations"
            icon={<GraduationCap className="w-4 h-4 text-indigo-400" />}
            right={<span className="text-xs text-slate-400">Ranked by top match</span>}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-800 rounded-2xl overflow-hidden">
                <thead className="bg-slate-950 text-slate-400 uppercase font-semibold text-[10px]">
                  <tr>
                    <th className="p-3">Learner</th>
                    <th className="p-3">Stream</th>
                    <th className="p-3">Recommended pathway</th>
                    <th className="p-3 text-center">Match</th>
                    <th className="p-3">Runner-up</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {recommendations.map((r) => (
                    <tr key={r.learner.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-3 font-semibold text-white">{r.learner.name}</td>
                      <td className="p-3 text-slate-400">{r.learner.stream}</td>
                      <td className="p-3 text-indigo-300 font-semibold">{r.top.name}</td>
                      <td className="p-3 text-center font-bold text-white">{r.top.match}%</td>
                      <td className="p-3 text-slate-400">{r.runnerUp.name} · {r.runnerUp.match}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-[11px] text-slate-500 mt-3">
              Matching averages each pathway's related learning areas for every learner using scores already in the
              marksbook — it changes the moment you update a mark.
            </p>
          </Panel>
        </>
      )}
    </div>
  );
}
