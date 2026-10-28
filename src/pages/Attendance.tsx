import { useCallback, useEffect, useMemo, useState } from 'react';
import { CalendarCheck, Check, X } from 'lucide-react';
import { api, ApiError } from '../lib/api';
import type { AppCtx } from '../lib/context';
import type { AttendanceEntry } from '../lib/types';
import { termDays } from '../lib/curriculum';
import { Panel, PageHeader, inputCls, labelCls, btnGhost, EmptyState, ErrorNote, Badge } from '../components/ui';

const DAYS = termDays();

export default function Attendance({ ctx }: { ctx: AppCtx }) {
  const [records, setRecords] = useState<Record<string, 'present' | 'absent'>>({});
  const [day, setDay] = useState(DAYS[DAYS.length - 1].iso);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [savingIds, setSavingIds] = useState<Record<string, boolean>>({});

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<{ records: AttendanceEntry[] }>('/api/attendance');
      const map: Record<string, 'present' | 'absent'> = {};
      for (const r of res.records) map[`${r.learnerId}|${r.day}`] = r.status;
      setRecords(map);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load attendance');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const key = (learnerId: string, d: string) => `${learnerId}|${d}`;
  const statusOf = (learnerId: string, d: string) => records[key(learnerId, d)];

  const toggle = async (learnerId: string) => {
    const current = statusOf(learnerId, day) || 'present';
    const next = current === 'present' ? 'absent' : 'present';
    setRecords((prev) => ({ ...prev, [key(learnerId, day)]: next }));
    setSavingIds((prev) => ({ ...prev, [learnerId]: true }));
    try {
      await api.post('/api/attendance', { items: [{ learnerId, day, status: next }] });
    } catch (err) {
      setRecords((prev) => ({ ...prev, [key(learnerId, day)]: current }));
      setError(err instanceof ApiError ? err.message : 'Failed to save attendance');
    } finally {
      setSavingIds((prev) => ({ ...prev, [learnerId]: false }));
    }
  };

  const markAllPresent = async () => {
    const items = ctx.visibleLearners.map((l) => ({ learnerId: l.id, day, status: 'present' as const }));
    if (!items.length) return;
    try {
      await api.post('/api/attendance', { items });
      setRecords((prev) => {
        const next = { ...prev };
        for (const it of items) next[key(it.learnerId, it.day)] = 'present';
        return next;
      });
      ctx.toast(`Marked ${items.length} learners present`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to save attendance');
    }
  };

  const dayLabel = DAYS.find((d) => d.iso === day)?.label || day;

  const summary = useMemo(() => {
    const present = ctx.visibleLearners.filter((l) => (statusOf(l.id, day) || 'present') === 'present').length;
    const total = ctx.visibleLearners.length;
    return { present, absent: total - present, pct: total ? Math.round((present / total) * 100) : 0 };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ctx.visibleLearners, records, day]);

  return (
    <div className="space-y-6 animate-fadeIn">
      <PageHeader
        title="Attendance Register"
        sub="Daily present/absent marking across the current term window"
        icon={<CalendarCheck className="w-4 h-4" />}
        actions={
          <>
            <div className="flex items-center gap-2">
              <label className={labelCls + ' mb-0'}>Register day</label>
              <select className={inputCls + ' w-auto'} value={day} onChange={(e) => setDay(e.target.value)}>
                {DAYS.map((d) => (
                  <option key={d.iso} value={d.iso}>{d.label}</option>
                ))}
              </select>
            </div>
            <button className={btnGhost} onClick={() => void markAllPresent()}>
              <Check className="w-4 h-4" /> Mark all present
            </button>
          </>
        }
      />

      <Panel
        title={`Register — ${dayLabel}`}
        icon={<CalendarCheck className="w-4 h-4 text-indigo-400" />}
        right={
          <div className="flex items-center gap-2 text-xs">
            <Badge tone="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">{summary.present} present</Badge>
            <Badge tone="bg-rose-500/10 text-rose-400 border-rose-500/20">{summary.absent} absent</Badge>
            <Badge>{summary.pct}%</Badge>
          </div>
        }
      >
        {error && <ErrorNote message={error} />}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-slate-800 rounded-2xl overflow-hidden">
            <thead className="bg-slate-950 text-slate-400 uppercase font-semibold text-[10px]">
              <tr>
                <th className="p-3">Learner</th>
                <th className="p-3">Adm No</th>
                {DAYS.map((d) => (
                  <th key={d.iso} className="p-2 text-center">{d.label}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                <tr><td colSpan={2 + DAYS.length} className="p-6 text-center text-slate-500">Loading register…</td></tr>
              ) : ctx.visibleLearners.length === 0 ? (
                <tr><td colSpan={2 + DAYS.length} className="p-6"><EmptyState title="No learners match the current filters" /></td></tr>
              ) : (
                ctx.visibleLearners.map((learner) => (
                  <tr key={learner.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3 font-semibold text-white">{learner.name}</td>
                    <td className="p-3 font-mono text-slate-400">{learner.admissionNo}</td>
                    {DAYS.map((d) => {
                      const status = statusOf(learner.id, d.iso);
                      const isToday = d.iso === day;
                      const present = status !== 'absent';
                      return (
                        <td key={d.iso} className="p-1 text-center">
                          <button
                            onClick={() => { setDay(d.iso); void toggle(learner.id); }}
                            disabled={savingIds[learner.id]}
                            aria-label={`${learner.name} on ${d.label}`}
                            className={`w-8 h-8 rounded-lg text-[10px] font-bold border transition-all ${
                              present
                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                                : 'bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20'
                            } ${isToday ? 'ring-2 ring-indigo-500/60' : ''}`}
                          >
                            {present ? <Check className="w-3.5 h-3.5 mx-auto" /> : <X className="w-3.5 h-3.5 mx-auto" />}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <p className="text-[11px] text-slate-500 mt-3">
          Unmarked learners default to present; clicking a cell flips that day's status and saves it immediately.
        </p>
      </Panel>
    </div>
  );
}
