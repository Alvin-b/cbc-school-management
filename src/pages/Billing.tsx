import { useState } from 'react';
import { Layers, Check, Sparkles, Users, Info } from 'lucide-react';
import { api, ApiError, PLANS, planSpec } from '../lib/api';
import type { AppCtx } from '../lib/context';
import { Panel, PageHeader, ErrorNote, Badge } from '../components/ui';

export default function Billing({ ctx }: { ctx: AppCtx }) {
  const current = planSpec(ctx.session.tenant?.plan);
  const [switching, setSwitching] = useState('');
  const [error, setError] = useState('');
  const used = ctx.learners.length;

  const choose = async (planId: string) => {
    if (planId === current.id) return;
    setSwitching(planId);
    setError('');
    try {
      await api.post('/api/plan', { plan: planId });
      // Refresh session so the header badge and entitlements update, then
      // reload the roster since plan limits may now include more learners.
      await ctx.refreshSession();
      await ctx.reloadLearners();
      ctx.toast(`Plan changed to ${planSpec(planId as never).name}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not change plan');
    } finally {
      setSwitching('');
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <PageHeader
        title="Plan & Billing"
        sub="Manage your school's ElimuTrack subscription"
        icon={<Layers className="w-4 h-4" />}
        actions={
          <Badge tone="bg-indigo-500/10 text-indigo-400 border-indigo-500/20">
            Current: {current.name}
          </Badge>
        }
      />

      {error && <ErrorNote message={error} />}

      <div className="flex items-start gap-2 text-[11px] text-slate-400 bg-slate-900/80 border border-slate-800 p-3 rounded-xl">
        <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
        <span>
          Plan switching is live in this build, but no payment processor is connected yet: changing plan takes
          effect immediately and nothing is charged. Entitlement limits are enforced on the server as well as here.
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {PLANS.map((plan) => {
          const isCurrent = plan.id === current.id;
          return (
            <div
              key={plan.id}
              className={`bg-slate-900/90 border rounded-3xl p-6 space-y-4 shadow-xl flex flex-col ${
                isCurrent ? 'border-indigo-500/60 ring-1 ring-indigo-500/30' : 'border-slate-800/80'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">{plan.name}</span>
                {isCurrent && <Badge tone="bg-indigo-500/10 text-indigo-400 border-indigo-500/30">Active</Badge>}
              </div>

              <div>
                <div className="text-2xl font-bold text-white">{plan.price}</div>
                <div className="text-[11px] text-slate-500">{plan.cadence}</div>
              </div>

              <p className="text-[11px] text-slate-400">{plan.blurb}</p>

              <ul className="space-y-2 text-[11px] text-slate-300 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              <div className="text-[11px] text-slate-500 border-t border-slate-800 pt-3">
                <span className="inline-flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  {used} / {plan.maxLearners >= 100000 ? 'unlimited' : plan.maxLearners} learners used
                </span>
              </div>

              <button
                onClick={() => void choose(plan.id)}
                disabled={isCurrent || switching === plan.id}
                className={`w-full py-2.5 rounded-2xl text-xs font-semibold transition-all ${
                  isCurrent
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    : plan.id === 'premium'
                      ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-600/25 hover:opacity-90'
                      : 'bg-slate-950 border border-slate-800 text-slate-200 hover:border-indigo-500/60'
                }`}
              >
                {switching === plan.id
                  ? 'Switching…'
                  : isCurrent
                    ? 'Current plan'
                    : `Switch to ${plan.name}`}
              </button>
            </div>
          );
        })}
      </div>

      <Panel title="What unlocks on upgrade" icon={<Sparkles className="w-4 h-4 text-indigo-400" />}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-300">
          {[
            { locked: !current.whatsapp, label: 'WhatsApp to guardians', plan: 'School Standard' },
            { locked: !current.exportCsv, label: 'KNEC broadsheet CSV export', plan: 'School Standard' },
            { locked: current.maxLearners < 600, label: 'Up to 600 learners', plan: 'School Standard' },
          ].map((f) => (
            <div
              key={f.label}
              className={`rounded-2xl p-4 border ${
                f.locked ? 'border-amber-500/30 bg-amber-500/5' : 'border-emerald-500/30 bg-emerald-500/5'
              }`}
            >
              <div className={`text-[10px] uppercase tracking-wider font-bold ${f.locked ? 'text-amber-400' : 'text-emerald-400'}`}>
                {f.locked ? `Requires ${f.plan}` : 'Included'}
              </div>
              <div className="mt-1 font-semibold text-white">{f.label}</div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
