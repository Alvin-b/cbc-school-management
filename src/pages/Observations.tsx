import { useCallback, useEffect, useMemo, useState } from 'react';
import { Eye, Shuffle, Sparkles, Save, Trash2 } from 'lucide-react';
import { api, ApiError } from '../lib/api';
import type { AppCtx } from '../lib/context';
import type { Observation } from '../lib/types';
import {
  Panel, PageHeader, PageHeader as _PH, inputCls, labelCls, btnPrimary, btnGhost,
  EmptyState, ErrorNote, Badge,
} from '../components/ui';

export default function Observations ({ ctx }: { ctx: AppCtx }) {
  const [history, setHistory] = useState<Observation[]>([]);
  const [sampled, setSampled] = useState<string[]>([]);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [day, setDay] = useState(new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<{ observations: Observation[] }>('/api/observations');
      setHistory(res.observations);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load observations');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const pickRandom = () => {
    const pool = [...ctx.visibleLearners];
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    const picked = pool.slice(0, Math.min(5, pool.length)).map((l) => l.id);
    setSampled(picked);
    setNotes({});
  };

  const save = async () => {
    const items = sampled
      .map((id) => ({ learnerId: id, day, note: (notes[id] || '').trim() }))
      .filter((i) => i.note.length > 0);
    if (!items.length) {
      setError('Write at least one observation note before saving.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await api.post('/api/observations', { items });
      setSampled([]);
      setNotes({});
      await load();
      ctx.toast(`Logged ${items.length} observation${items.length === 1 ? '' : 's'}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to save observations');
    } finally {
      setSaving(false);
    }
  };

  const sampledLearners = useMemo(
    () => sampled.map((id) => ctx.learners.find((l) => l.id === id)).filter(Boolean),
    [sampled, ctx.learners],
  );

  const filledCount = sampled.filter((id) => (notes[id] || '').trim().length > 0).length;

  return (
    <div className="space-y-6 animate-fadeIn">
      <PageHeader
        title="Learning Observations"
        sub="Qualitative CBC notes captured on a random sample of learners"
        icon={<Eye className="w-4 h-4" />}
        actions={
          <>
            <div className="flex items-center gap-2">
              <label className={labelCls + ' mb-0'}>Observation date</label>
              <input type="date" className={inputCls + ' w-auto'} value={day} onChange={(e) => setDay(e.target.value)} />
            </div>
            <button className={btnGhost} onClick={pickRandom}>
              <Shuffle className="w-4 h-4" /> Pick 5 random learners
            </button>
          </>
        }
      />

      <Panel
        title={`Sampled Observation Queue (${sampledLearners.length})`}
        icon={<Sparkles className="w-4 h-4 text-indigo-400" />}
        right={
          <button className={btnPrimary} onClick={() => void save()} disabled={saving || sampled.length === 0}>
            <Save className="w-4 h-4" /> {saving ? 'Saving…' : 'Save observations'}
          </button>
        }
      >
        {error && <ErrorNote message={error} />}
        {sampledLearners.length === 0 ? (
          <EmptyState
            icon={<Shuffle className="w-6 h-6" />}
            title="No learners sampled yet"
            hint="Pick 5 random learners from the current stream filter to start writing notes."
          />
        ) : (
          <div className="space-y-3">
            <div className="text-[11px] text-slate-500">
              {filledCount} of {sampledLearners.length} notes written — blank notes are skipped.
            </div>
            {sampledLearners.map((learner) => (
              <div key={learner!.id} className="grid grid-cols-1 md:grid-cols-3 gap-3 items-start bg-slate-950 border border-slate-800 rounded-2xl p-4">
                <div>
                  <div className="text-xs font-semibold text-white">{learner!.name}</div>
                  <div className="text-[11px] text-slate-500 font-mono">{learner!.admissionNo} · {learner!.stream}</div>
                </div>
                <textarea
                  rows={2}
                  placeholder="Observation, e.g. 'Contributed confidently during group science inquiry…'"
                  className={`md:col-span-2 bg-slate-900 border text-slate-100 p-2.5 rounded-xl text-xs focus:outline-none transition-all ${
                    (notes[learner!.id] || '').trim() ? 'border-indigo-500/50' : 'border-slate-800 focus:border-indigo-500/70'
                  }`}
                  value={notes[learner!.id] || ''}
                  onChange={(e) => setNotes((prev) => ({ ...prev, [learner!.id]: e.target.value }))}
                />
              </div>
            ))}
          </div>
        )}
      </Panel>

      <Panel
        title="Observation History"
        icon={<Eye className="w-4 h-4 text-indigo-400" />}
        right={<Badge tone="bg-slate-950 text-slate-400 border-slate-800">{history.length} entries</Badge>}
      >
        {loading ? (
          <div className="h-24 rounded-2xl animate-shimmer" />
        ) : history.length === 0 ? (
          <EmptyState title="No observations recorded yet" hint="Saved notes appear here with learner, stream and date." />
        ) : (
          <div className="space-y-2">
            {history.slice(0, 50).map((obs) => (
              <div key={obs.id} className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 flex justify-between gap-4 items-start">
                <div>
                  <div className="text-xs font-semibold text-white">
                    {obs.learnerName} <span className="text-slate-500 font-normal">· {obs.stream}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">{obs.note}</p>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-[10px] font-mono text-indigo-400">{obs.day}</div>
                  <div className="text-[10px] text-slate-500">{obs.author || 'teacher'}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}
