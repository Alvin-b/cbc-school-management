import { useEffect, useState } from 'react';
import {
  Users, Building, CalendarCheck, DollarSign, ArrowUpRight, BarChart2,
  PieChart as PieChartIcon, Sparkles,
} from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
} from 'recharts';
import { api, ApiError, planSpec } from '../lib/api';
import type { AppCtx } from '../lib/context';
import { Panel, StatCard, EmptyState, ErrorNote } from '../components/ui';

interface DashboardData {
  subjects: { code: string; name: string; mean: number }[];
  rubric: { band: string; count: number }[];
  attendancePct: number;
  presentDays: number;
  totalDays: number;
  outstandingFees: number;
  learners: number;
}

const RUBRIC_NAMES: Record<string, string> = {
  EE: 'EE (Exceeding)', ME: 'ME (Meeting)', AE: 'AE (Approaching)', BE: 'BE (Below)',
};

export default function Dashboard({ ctx }: { ctx: AppCtx }) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const streamParam = ctx.stream === 'All Streams' ? '' : ctx.stream;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    api
      .get<DashboardData>(`/api/dashboard?stream=${encodeURIComponent(streamParam)}`)
      .then((res) => { if (!cancelled) setData(res); })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof ApiError ? err.message : 'Failed to load dashboard');
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [streamParam]);

  const spec = planSpec(ctx.session.tenant?.plan);

  if (loading) {
    return (
      <div className="space-y-4 animate-fadeIn">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[0, 1, 2, 3].map((i) => <div key={i} className="h-32 rounded-3xl animate-shimmer" />)}
        </div>
        <div className="h-80 rounded-3xl animate-shimmer" />
      </div>
    );
  }

  if (error) return <ErrorNote message={error} />;

  const outstanding = data?.outstandingFees ?? 0;

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Enrolled"
          value={data?.learners ?? 0}
          icon={<Users className="w-4 h-4" />}
          foot={`Grades 1 to 9 active in ${ctx.session.tenant?.name}`}
        />
        <StatCard
          label="Filtered Cohort"
          value={ctx.visibleLearners.length}
          icon={<Building className="w-4 h-4" />}
          accent="text-violet-400"
          foot={<>Active stream: <span className="text-indigo-400 font-semibold">{ctx.stream}</span></>}
        />
        <StatCard
          label="Term Attendance"
          value={`${data?.attendancePct ?? 0}%`}
          icon={<CalendarCheck className="w-4 h-4" />}
          accent="text-emerald-400"
          foot={
            <>
              <span className="inline-flex items-center gap-1 text-emerald-400">
                <ArrowUpRight className="w-3.5 h-3.5" />
                {data?.presentDays ?? 0} of {data?.totalDays ?? 0} registers marked
              </span>
            </>
          }
        />
        <StatCard
          label="Outstanding Fees"
          value={`KES ${outstanding.toLocaleString()}`}
          icon={<DollarSign className="w-4 h-4" />}
          accent="text-amber-400"
          foot={`${spec.name} plan · M-PESA reconciliation`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Panel
          title="Subject Mean Performance"
          icon={<BarChart2 className="w-4 h-4 text-indigo-400" />}
          right={<span className="text-xs text-slate-400">{ctx.stream}</span>}
        >
          <div className="h-64 w-full">
            {data && data.subjects.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.subjects}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="code" stroke="#64748b" fontSize={11} />
                  <YAxis domain={[0, 100]} stroke="#64748b" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a', borderColor: '#334155',
                      borderRadius: '12px', color: '#fff', fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="mean" fill="#6366f1" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState
                icon={<Sparkles className="w-6 h-6" />}
                title="No marks recorded yet"
                hint="Enter marks in the Marksbook to populate this chart."
              />
            )}
          </div>
        </Panel>

        <Panel
          title="Competency Rubric Distribution"
          icon={<PieChartIcon className="w-4 h-4 text-indigo-400" />}
          right={<span className="text-xs text-slate-400">Rubric level analysis</span>}
        >
          <div className="h-64 w-full">
            {data && data.rubric.some((r) => r.count > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart
                  data={data.rubric.map((r) => ({ subject: RUBRIC_NAMES[r.band] || r.band, value: r.count }))}
                >
                  <PolarGrid stroke="#334155" />
                  <PolarAngleAxis dataKey="subject" stroke="#94a3b8" fontSize={11} />
                  <PolarRadiusAxis stroke="#475569" />
                  <Radar name="Marks" dataKey="value" stroke="#6366f1" fill="#6366f1" fillOpacity={0.4} />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState title="No competency data yet" hint="Marks you save are banded automatically." />
            )}
          </div>
        </Panel>
      </div>

      <Panel title="Quick actions" icon={<Sparkles className="w-4 h-4 text-indigo-400" />}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { route: 'marksbook', label: 'Capture continuous assessment marks' },
            { route: 'attendance', label: 'Mark today’s attendance register' },
            { route: 'reportcard', label: 'Generate a printable report card' },
          ].map((a) => (
            <button
              key={a.route}
              onClick={() => ctx.navigate(a.route)}
              className="text-left bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500/50 rounded-2xl p-4 text-xs font-semibold text-slate-300 transition-all"
            >
              {a.label}
            </button>
          ))}
        </div>
      </Panel>
    </div>
  );
}
