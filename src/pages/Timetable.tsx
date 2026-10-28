import { useCallback, useEffect, useState } from 'react';
import { Calendar, Layout, Grid, Clock, Search, Loader2, X, Plus } from 'lucide-react';
import { api, ApiError, planSpec } from '../lib/api';
import type { AppCtx } from '../lib/context';
import type { TimetablePeriod, TimetableEntry } from '../lib/types';
import { inputCls, selectCls, labelCls, btnPrimary, btnGhost, Panel, PageHeader, EmptyState, ErrorNote, Badge, Modal, Loading } from '../components/ui';

interface PeriodForm {
  position: number;
  label: string;
  startsAt: string;
  endsAt: string;
}

export default function Timetable({ ctx }: { ctx: AppCtx }) {
  const spec = planSpec(ctx.session.tenant?.plan);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [periods, setPeriods] = useState<TimetablePeriod[]>([]);
  const [entries, setEntries] = useState<TimetableEntry[]>([]);
  const [form, setForm] = useState<PeriodForm | null>(null);
  const [mode, setMode] = useState<'period' | 'entry' | null>('period');
  const [editingEntry, setEditingEntry] = useState<TimetableEntry | null>(null);
  const [newEntry, setNewEntry] = useState<TimetableEntry | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get<any>('/api/timetable');
      setPeriods(res.periods || []);
      setEntries(res.entries || []);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load timetable');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const openPeriodForm = (period?: TimetablePeriod) => {
    const data = period
      ? { position: period.position, label: period.label, startsAt: period.starts_at, endsAt: period.ends_at }
      : { position: periods.length + 1, label: '', startsAt: '', endsAt: '' };
    setForm(data);
    setMode('period');
  };

  const savePeriod = async () => {
    if (!form) return;
    setLoading(true);
    setError('');
    try {
      if (form.position) {
        await api.put('/api/timetable/periods', { ...form, position: form.position });
      } else {
        await api.post('/api/timetable/periods', form);
      }
      ctx.toast('Period saved');
      await load();
      setForm(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setLoading(false);
    }
  };

  const removePeriod = async (position: number) => {
    if (!window.confirm(`Remove period ${position}?`)) return;
    try {
      await api.del(`/api/timetable/periods/${position}`);
      ctx.toast('Period removed');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
    }
  };

  const openEntryForm = (entry?: TimetableEntry) => {
    const data = entry
      ? { ...entry, day: entry.day, period: entry.period, stream: entry.stream, subjectId: entry.subject_id || entry.subjectId, room: entry.room }
      : { day: 'Monday', period: '1', stream: ctx.session.streams?.[0] || '', subjectId: '', room: '' };
    setNewEntry(data);
    setMode('entry');
  };

  const saveEntry = async () => {
    if (!newEntry) return;
    setLoading(true);
    setError('');
    try {
      if (newEntry.id) {
        await api.post('/api/timetable/entry', newEntry);
        ctx.toast('Timetable entry updated');
      } else {
        await api.post('/api/timetable/entry', newEntry);
        ctx.toast('Timetable entry added');
      }
      await load();
      setNewEntry(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setLoading(false);
    }
  };

  const removeEntry = async (entry: TimetableEntry) => {
    if (!window.confirm(`Remove ${entry.day} period ${entry.period} for ${entry.stream}?`)) return;
    try {
      await api.del('/api/timetable/entry', { id: entry.id });
      ctx.toast('Entry removed');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
    }
  };

  const toggleLoading = () => setLoading(true);

  const filteredEntries = entries.filter((e) =>
    (ctx.session.streams === null || ctx.session.streams.includes(e.stream)) &&
    (e.staffId === ctx.session.user?.sub || ctx.session.role === 'admin')
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      <PageHeader
        title="Timetable"
        sub="Weekly lesson grid — admin defines periods; teachers see their assigned slots"
        icon={<Layout className="w-5 h-5" />}
        actions={
          ctx.session.role === 'admin' ? (
            <div className="flex gap-2">
              <button className={btnGhost} onClick={openPeriodForm}>
                <Plus className="w-4 h-4" /> Add period
              </button>
              <button className={btnPrimary} onClick={() => openEntryForm()}>
                <Plus className="w-4 h-4" /> Add entry
              </button>
            </div>
          ) : null
        }
      />

      {error && <ErrorNote message={error} />}

      {/* Periods grid (admin only) */}
      {ctx.session.role === 'admin' && (
        <Panel title="Period definitions" icon={<Clock className="w-4 h-4" />}>
          {loading ? (
            <Loading label="Loading periods" />
          ) : periods.length === 0 ? (
            <EmptyState
              icon={<Clock className="w-6 h-6" />}
              title="No periods defined"
              hint="Add the school day periods first — teachers will be assigned to them."
            />
          ) : (
            <div className="grid grid-cols-6 gap-2 sm:grid-cols-12">
              {periods.map((p) => (
                <div
                  key={p.position}
                  className="bg-slate-800 text-center rounded-xl p-3 text-xs font-semibold text-slate-200"
                >
                  {p.label || `Period ${p.position}`}
                  {p.starts_at && <div className="mt-1 text-[10px] text-slate-400">{p.starts_at} – {p.ends_at}</div>}
                </div>
              ))}
            </div>
          )}
          {ctx.session.role === 'admin' && (
            <button className={`${btnGhost} mt-3 w-full text-xs`} onClick={openPeriodForm}>
              Add new period
            </button>
          )}
        </Panel>
      )}

      {/* Teacher's view: entries they can see/edit */}
      <Panel title={`My timetable entries (${filteredEntries.length})`} icon={<Grid className="w-4 h-4" />}>
        {loading ? (
          <Loading label="Loading entries" />
        ) : filteredEntries.length === 0 ? (
          <EmptyState
            icon={<Grid className="w-6 h-6" />}
            title="No entries for your classes"
            hint="Admin: add periods first, then assign lessons. Teacher: ensure you're assigned to the right streams."
          />
        ) : (
          <div className="space-y-2">
            {[...filteredEntries]
              .sort((a, b) => a.day.localeCompare(b.day) || a.period - b.period)
              .map((e) => (
                <div
                  key={e.id}
                  className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row gap-3 sm:gap-4 min-h-[120px]"
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-white sm:text-sm">{e.stream}</div>
                    <div className="text-[10px] text-slate-400 sm:text-xs">{e.subjectId ? ` ${e.subjectId}` : ''}</div>
                  </div>
                  <div className="text-center sm:text-right">
                    <div className="font-mono text-amber-300 text-xs font-bold">{e.period}</div>
                    <div className="text-[10px] text-slate-500">{e.day}</div>
                  </div>
                  {ctx.session.role === 'admin' && (
                    <div className="flex-1">
                      <button className={btnGhost} size="small" onClick={() => openEntryForm(e)}>
                        <X className="w-3 h-3 text-slate-500" /> View
                      </button>
                      <button className={btnGhost} size="small" onClick={() => void removeEntry(e)}>
                        <X className="w-3 h-3 text-slate-500" /> Remove
                      </button>
                    </div>
                  )}
                </div>
              ))}
          </div>
        )}
      </Panel>

      {/* Add/Edit entry modal (teachers + admin) */}
      {form !== null || mode === 'period' || editingEntry !== null || newEntry !== null ? (
        <Modal
          open={form !== null || mode === 'period' || editingEntry !== null || newEntry !== null}
          onClose={() => {
            setForm(null);
            setMode('period');
            setEditingEntry(null);
            setNewEntry(null);
          }}
          title={
            form !== null
              ? form.position
                ? 'Edit period'
                : 'Add new period'
              : editingEntry !== null
                ? 'Edit timetable entry'
                : 'Add timetable entry'
          }
        >
          {form !== null && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls} htmlFor="tt-position">Period #</label>
                  <input
                    id="tt-position"
                    className={inputCls}
                    type="number"
                    min={1}
                    value={form?.position || ''}
                    onChange={(e) => setForm({ ...form, position: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className={labelCls} htmlFor="tt-label">Period label</label>
                  <input
                    id="tt-label"
                    className={inputCls}
                    value={form?.label || ''}
                    onChange={(e) => setForm({ ...form, label: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls} htmlFor="tt-starts">Starts</label>
                  <input
                    id="tt-starts"
                    className={inputCls}
                    value={form?.startsAt || ''}
                    onChange={(e) => setForm({ ...form, startsAt: e.target.value })}
                  />
                </div>
                <div>
                  <label className={labelCls} htmlFor="tt-ends">Ends</label>
                  <input
                    id="tt-ends"
                    className={inputCls}
                    value={form?.endsAt || ''}
                    onChange={(e) => setForm({ ...form, endsAt: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <button className={`${btnPrimary} w-48`} onClick={() => savePeriod()}>
                  {form?.position ? 'Update period' : 'Add period'}
                </button>
                <button className={btnGhost} onClick={() => setForm(null)}>
                  Cancel
                </button>
              </div>
            </div>
          )}

          {editingEntry !== null && (
            <div className="space-y-4">
              <input
                type="hidden"
                value={editingEntry.id}
                onChange={(e) => { }} // keep id hidden
              />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls} htmlFor="tt-entry-day">Day</label>
                  <select
                    id="tt-entry-day"
                    className={selectCls}
                    value={editingEntry?.day || ''}
                    onChange={(e) => setEditingEntry({ ...editingEntry, day: e.target.value })}
                  >
                    <option value="Monday">Monday</option>
                    <option value="Tuesday">Tuesday</option>
                    <option value="Wednesday">Wednesday</option>
                    <option value="Thursday">Thursday</option>
                    <option value="Friday">Friday</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls} htmlFor="tt-entry-period">Period</label>
                  <select
                    id="tt-entry-period"
                    className={selectCls}
                    value={editingEntry?.period || '1'}
                    onChange={(e) => setEditingEntry({ ...editingEntry, period: Number(e.target.value) })}
                  >
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5</option>
                    <option value="6">6</option>
                    <option value="7">7</option>
                    <option value="8">8</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls} htmlFor="tt-entry-stream">Stream</label>
                  <select
                    id="tt-entry-stream"
                    className={selectCls}
                    value={editingEntry?.stream || ''}
                    onChange={(e) => setEditingEntry({ ...editingEntry, stream: e.target.value })}
                  >
                    {ctx.session.streams ? ctx.session.streams.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    )) : []}
                  </select>
                </div>
                <div>
                  <label className={labelCls} htmlFor="tt-entry-subject">Subject</label>
                  <select
                    id="tt-entry-subject"
                    className={selectCls}
                    value={editingEntry?.subjectId || ''}
                    onChange={(e) => setEditingEntry({ ...editingEntry, subjectId: e.target.value })}
                  >
                    <option value="">Any</option>
                  </select>
                </div>
              </div>
              <div>
                <label className={labelCls} htmlFor="tt-entry-room">Room</label>
                <input
                  id="tt-entry-room"
                  className={inputCls}
                  value={editingEntry?.room || ''}
                  onChange={(e) => setEditingEntry({ ...editingEntry, room: e.target.value })}
                />
              </div>
              <div className="flex gap-3">
                <button className={`${btnPrimary}`} onClick={() => saveEntry()}>
                  Save entry
                </button>
                <button className={btnGhost} onClick={() => setEditingEntry(null)}>
                  Cancel
                </button>
              </div>
            </div>
          )}

          {newEntry !== null && (
            <div className="space-y-4">
              <input type="hidden" value="" onChange={(e) => { }} />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls} htmlFor="ntt-entry-day">Day</label>
                  <select
                    id="ntt-entry-day"
                    className={selectCls}
                    value={newEntry?.day || ''}
                    onChange={(e) => setNewEntry({ ...newEntry, day: e.target.value })}
                  >
                    <option value="Monday">Monday</option>
                    <option value="Tuesday">Tuesday</option>
                    <option value="Wednesday">Wednesday</option>
                    <option value="Thursday">Thursday</option>
                    <option value="Friday">Friday</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls} htmlFor="ntt-entry-period">Period</label>
                  <select
                    id="ntt-entry-period"
                    className={selectCls}
                    value={newEntry?.period || '1'}
                    onChange={(e) => setNewEntry({ ...newEntry, period: Number(e.target.value) })}
                  >
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5</option>
                    <option value="6">6</option>
                    <option value="7">7</option>
                    <option value="8">8</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls} htmlFor="ntt-entry-stream">Stream</label>
                  <select
                    id="ntt-entry-stream"
                    className={selectCls}
                    value={newEntry?.stream || ''}
                    onChange={(e) => setNewEntry({ ...newEntry, stream: e.target.value })}
                  >
                    {ctx.session.streams ? ctx.session.streams.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    )) : []}
                  </select>
                </div>
                <div>
                  <label className={labelCls} htmlFor="ntt-entry-subject">Subject</label>
                  <select
                    id="ntt-entry-subject"
                    className={selectCls}
                    value={newEntry?.subjectId || ''}
                    onChange={(e) => setNewEntry({ ...newEntry, subjectId: e.target.value })}
                  >
                    <option value="">Any</option>
                  </select>
                </div>
              </div>
              <div>
                <label className={labelCls} htmlFor="ntt-entry-room">Room</label>
                <input
                  id="ntt-entry-room"
                  className={inputCls}
                  value={newEntry?.room || ''}
                  onChange={(e) => setNewEntry({ ...newEntry, room: e.target.value })}
                />
              </div>
              <div className="flex gap-3">
                <button className={`${btnPrimary}`} onClick={() => saveEntry()}>
                  Add entry
                </button>
                <button className={btnGhost} onClick={() => setNewEntry(null)}>
                  Cancel
                </button>
              </div>
            </div>
          )}
        </Modal>
      ) : null}
    </div>
  );
}