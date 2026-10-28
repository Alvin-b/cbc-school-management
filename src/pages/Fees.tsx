import { useCallback, useEffect, useState } from 'react';
import { CreditCard, Wallet, Receipt, Smartphone, Settings, Plus } from 'lucide-react';
import { api, ApiError, planSpec } from '../lib/api';
import type { AppCtx } from '../lib/context';
import type { Payment } from '../lib/types';
import {
  Panel, PageHeader, inputCls, labelCls, btnPrimary, btnGhost, EmptyState, ErrorNote, Badge, StatCard,
} from '../components/ui';

const GRADES = ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9'];

export default function Fees({ ctx }: { ctx: AppCtx }) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [learnerId, setLearnerId] = useState('');
  const [amount, setAmount] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState('');
  const [showConfig, setShowConfig] = useState(false);
  const [feeConfig, setFeeConfig] = useState<Record<string, any>>({});
  const [savingConfig, setSavingConfig] = useState(false);
  const spec = planSpec(ctx.session.tenant?.plan);
  const isAdmin = ctx.session.role === 'admin';

  const active = ctx.learners.find((l) => l.id === learnerId) || ctx.visibleLearners[0] || ctx.learners[0];

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [payRes, feeRes] = await Promise.all([
        api.get<{ payments: Payment[] }>('/api/payments'),
        api.get<{ config: Record<string, any> }>('/api/fees/config').catch(() => ({ config: {} })),
      ]);
      setPayments(payRes.payments);
      setFeeConfig(feeRes.config || {});
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load payments');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  useEffect(() => {
    if (!learnerId && active) setLearnerId(active.id);
  }, [learnerId, active]);

  const saveFeeConfig = async () => {
    setSavingConfig(true);
    setError('');
    try {
      const configs = GRADES.map((g) => ({
        gradeLevel: g,
        feeAmount: feeConfig[g]?.feeAmount || 0,
        boardingFee: feeConfig[g]?.boardingFee || 0,
        dayFee: feeConfig[g]?.dayFee || 0,
        admissionFee: feeConfig[g]?.admissionFee || 0,
      }));
      await api.post('/api/fees/config', { configs });
      ctx.toast('Fee configuration saved');
      setShowConfig(false);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to save fee config');
    } finally {
      setSavingConfig(false);
    }
  };

  const post = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!active) return;
    const value = Number(amount);
    if (!Number.isInteger(value) || value <= 0) {
      setError('Enter a whole-shilling amount greater than zero.');
      return;
    }
    setPosting(true);
    setError('');
    try {
      const res = await api.post<{ reference: string; feeBalance: number }>('/api/payments', {
        learnerId: active.id,
        amount: value,
        phone,
      });
      await ctx.reloadLearners();
      await load();
      setAmount('');
      setPhone('');
      ctx.toast(`Receipt ${res.reference} posted — balance KES ${res.feeBalance.toLocaleString()}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Payment failed');
    } finally {
      setPosting(false);
    }
  };

  const [addFeeOpen, setAddFeeOpen] = useState(false);
  const [addFeeAmount, setAddFeeAmount] = useState('');
  const [addFeeReason, setAddFeeReason] = useState('');
  const [addingFee, setAddingFee] = useState(false);

  const addAdditionalFee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!active || !isAdmin) return;
    const value = Number(addFeeAmount);
    if (!Number.isInteger(value) || value < 0) {
      setError('Enter a valid amount');
      return;
    }
    setAddingFee(true);
    setError('');
    try {
      const current = (active as any).additionalFees || 0;
      await api.put('/api/learners', { id: active.id, additionalFees: current + value });
      await ctx.reloadLearners();
      await load();
      setAddFeeAmount('');
      setAddFeeReason('');
      setAddFeeOpen(false);
      ctx.toast(`Additional fee of KES ${value.toLocaleString()} added`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to add fee');
    } finally {
      setAddingFee(false);
    }
  };

  const outstanding = ctx.visibleLearners.reduce((acc, l) => acc + l.feeBalance, 0);
  const collected = payments.reduce((acc, p) => acc + p.amount, 0);
  const defaulters = ctx.visibleLearners.filter((l) => l.feeBalance > 0).length;

  return (
    <div className="space-y-6 animate-fadeIn">
      <PageHeader
        title="Fee Payments"
        sub="M-PESA fee collection posted straight to learner ledgers"
        icon={<CreditCard className="w-4 h-4" />}
        actions={
          <div className="flex items-center gap-2">
            {isAdmin && (
              <button onClick={() => setShowConfig(!showConfig)} className={btnGhost}>
                <Settings className="w-3.5 h-3.5" /> Configure Fees
              </button>
            )}
            <Badge tone="bg-amber-500/10 text-amber-400 border-amber-500/30">{spec.name} plan</Badge>
          </div>
        }
      />

      {showConfig && isAdmin && (
        <Panel title="Fee Configuration per Grade" icon={<Settings className="w-4 h-4 text-cyan-400" />}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase font-semibold text-[10px]">
                <tr>
                  <th className="p-2">Grade</th>
                  <th className="p-2">Day Fee (KES)</th>
                  <th className="p-2">Boarding Fee (KES)</th>
                  <th className="p-2">Admission Fee (KES)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {GRADES.map((g) => (
                  <tr key={g}>
                    <td className="p-2 font-semibold text-white">{g}</td>
                    <td className="p-2">
                      <input
                        type="number"
                        className={inputCls + ' w-32'}
                        value={feeConfig[g]?.dayFee || ''}
                        onChange={(e) => setFeeConfig({ ...feeConfig, [g]: { ...feeConfig[g], dayFee: Number(e.target.value) || 0 } })}
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="number"
                        className={inputCls + ' w-32'}
                        value={feeConfig[g]?.boardingFee || ''}
                        onChange={(e) => setFeeConfig({ ...feeConfig, [g]: { ...feeConfig[g], boardingFee: Number(e.target.value) || 0 } })}
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="number"
                        className={inputCls + ' w-32'}
                        value={feeConfig[g]?.admissionFee || ''}
                        onChange={(e) => setFeeConfig({ ...feeConfig, [g]: { ...feeConfig[g], admissionFee: Number(e.target.value) || 0 } })}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={saveFeeConfig} disabled={savingConfig} className={btnPrimary}>
              {savingConfig ? 'Saving...' : 'Save Fee Configuration'}
            </button>
            <button onClick={() => setShowConfig(false)} className={btnGhost}>Cancel</button>
          </div>
        </Panel>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Outstanding (filtered)" value={`KES ${outstanding.toLocaleString()}`} icon={<Wallet className="w-4 h-4" />} accent="text-amber-400" />
        <StatCard label="Collected to date" value={`KES ${collected.toLocaleString()}`} icon={<Receipt className="w-4 h-4" />} accent="text-emerald-400" foot={`${payments.length} receipts posted`} />
        <StatCard label="Learners with balance" value={defaulters} icon={<Smartphone className="w-4 h-4" />} accent="text-rose-400" />
      </div>

      <Panel
        title="Post M-PESA receipt"
        icon={<Smartphone className="w-4 h-4 text-emerald-400" />}
        right={
          active && (
            <span className="text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-xl">
              Selected balance: KES {active.feeBalance.toLocaleString()}
            </span>
          )
        }
      >
        {error && <ErrorNote message={error} />}
        <form onSubmit={post} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <label className={labelCls}>Learner</label>
            <select className={inputCls} value={active?.id || ''} onChange={(e) => setLearnerId(e.target.value)}>
              {(ctx.visibleLearners.length ? ctx.visibleLearners : ctx.learners).map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name} ({l.admissionNo}) — bal {l.feeBalance.toLocaleString()}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>Amount (KES)</label>
            <input
              type="number"
              className={inputCls}
              placeholder="e.g. 15000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <div className="flex items-end">
            <button type="submit" className={btnPrimary + ' w-full justify-center'} disabled={posting || !active}>
              {posting ? 'Posting…' : 'Post M-PESA Receipt'}
            </button>
          </div>
          <div className="md:col-span-4">
            <label className={labelCls}>Payer phone (optional)</label>
            <input
              className={inputCls + ' max-w-sm'}
              placeholder="+2547…"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <p className="text-[11px] text-slate-500 mt-1">
              No M-PESA gateway is connected yet: receipts are recorded in your ledger with a generated reference.
            </p>
          </div>
        </form>
      </Panel>


      {isAdmin && active && (
        <Panel
          title="Add Additional Fees"
          icon={<Plus className="w-4 h-4 text-amber-400" />}
          right={
            <span className="text-xs text-slate-400">
              Current additional: KES {((active as any).additionalFees || 0).toLocaleString()}
            </span>
          }
        >
          <form onSubmit={addAdditionalFee} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1">
              <label className={labelCls}>Additional Fee Amount (KES)</label>
              <input
                className={inputCls}
                type="number"
                value={addFeeAmount}
                onChange={(e) => setAddFeeAmount(e.target.value)}
                placeholder="e.g. 5000"
              />
            </div>
            <div className="md:col-span-1">
              <label className={labelCls}>Reason (optional)</label>
              <input
                className={inputCls}
                value={addFeeReason}
                onChange={(e) => setAddFeeReason(e.target.value)}
                placeholder="e.g. Trip, Uniform"
              />
            </div>
            <div className="md:col-span-1 flex items-end">
              <button type="submit" className={btnPrimary} disabled={addingFee}>
                {addingFee ? 'Adding...' : 'Add Additional Fee'}
              </button>
            </div>
          </form>
        </Panel>
      )}

      <Panel
        title="Recent receipts"
        icon={<Receipt className="w-4 h-4 text-indigo-400" />}
        right={<Badge tone="bg-slate-950 text-slate-400 border-slate-800">{payments.length}</Badge>}
      >
        {loading ? (
          <div className="h-32 rounded-2xl animate-shimmer" />
        ) : payments.length === 0 ? (
          <EmptyState
            icon={<Receipt className="w-6 h-6" />}
            title="No payments posted yet"
            hint="Every receipt appears here with its reference, phone and timestamp."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-800 rounded-2xl overflow-hidden">
              <thead className="bg-slate-950 text-slate-400 uppercase font-semibold text-[10px]">
                <tr>
                  <th className="p-3">Reference</th>
                  <th className="p-3">Learner</th>
                  <th className="p-3 text-right">Amount (KES)</th>
                  <th className="p-3">Phone</th>
                  <th className="p-3">Posted</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3 font-mono text-indigo-300">{p.reference}</td>
                    <td className="p-3 font-semibold text-white">{p.learnerName}</td>
                    <td className="p-3 text-right font-bold text-emerald-400">{p.amount.toLocaleString()}</td>
                    <td className="p-3 font-mono text-slate-400">{p.phone || '—'}</td>
                    <td className="p-3 text-slate-400">{p.createdAt}</td>
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
