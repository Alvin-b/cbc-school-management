import { useCallback, useEffect, useMemo, useState } from 'react';
import { Calendar, Loader2, Search, X, Edit, Trash2, CheckCircle, AlertCircle, Plus } from 'lucide-react';
import { api, ApiError, planSpec } from '../lib/api';
import type { AppCtx } from '../lib/context';
import { inputCls, selectCls, labelCls, btnPrimary, btnGhost, Panel, PageHeader, EmptyState, ErrorNote, Badge, Modal, Loading } from '../components/ui';

interface RowForm {
  stream: string;
  subjectId: string;
  day: string;
  topic: string;
  strand: string;
  classSize: number;
  absences: string;
  homework: string;
  remarks: string;
}

interface RowData {
  id: string;
  stream: string;
  subjectId: string;
  day: string;
  topic: string;
  strand: string;
  classSize: number;
  absences: string;
  homework: string;
  remarks: string;
  author: string;
  createdAt: string;
  updatedAt: string;
}

export default function RecordOfWork({ ctx }: { ctx: AppCtx }) {
  const spec = planSpec(ctx.session.tenant?.plan);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rows, setRows] = useState<RowData[]>([]);
  const [form, setForm] = useState<RowForm | null>(null);
  const [editing, setEditing] = useState<RowData | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get<{ rows: RowData[] }>('/api/recordofwork');
      setRows(res.rows);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load record of work');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const filterRows = (rows: RowData[]) =>
    rows.filter((r) =>
      (ctx.session.streams === null || ctx.session.streams.includes(r.stream)) &&
      (r.staffId === ctx.session.user?.sub || ctx.session.role === 'admin')
    );

  const openForm = (row?: RowData) => {
    const data: RowForm = {
      stream: row?.stream || (ctx.session.streams?.[0] || ''),
      subjectId: row?.subjectId || '',
      day: row?.day || '',
      topic: row?.topic || '',
      strand: row?.strand || '',
      classSize: row?.classSize ?? 0,
      absences: row?.absences || '',
      homework: row?.homework || '',
      remarks: row?.remarks || '',
    };
    if (row) setEditing(row);
    else setForm(data);
  };

  const save = async () => {
    if (!form) return;
    setLoading(true);
    setError('');
    try {
      if (form.stream && form.day && form.topic) {
        if (editing && editing.id) {
          await api.put('/api/recordofwork', { ...form, id: editing.id });
          ctx.toast('Record updated');
        } else {
          await api.post('/api/recordofwork', form);
          ctx.toast('Record added');
        }
      } else {
        setError('Stream, day and topic are required');
      }
      setForm(null);
      setEditing(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setLoading(false);
    }
  };

  const remove = async (id: string) => {
    if (!window.confirm('Delete this record of work entry?')) return;
    try {
      await api.del('/api/recordofwork', { id });
      ctx.toast('Record deleted');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
    }
  };

  const filtered = useMemo(() => filterRows(rows), [rows]);

  return (
    <div className="space-y-6 animate-fadeIn">
      <PageHeader
        title="Record of Work"
        sub="What was actually taught — scheme vs reality, absences, homework, end-of-lesson remarks"
        icon={<Calendar className="w-5 h-5" />}
        actions={
          ctx.session.role === 'admin' ? (
            <button className={btnPrimary} onClick={openForm}>
              <Plus className="w-4 h-4" /> Add record
            </button>
          ) : null
        }
      />

      {error && <ErrorNote message={error} />}

      <Panel title={`Records (${filtered.length})`} icon={<Calendar className="w-4 h-4" />}>
        {loading ? (
          <Loading label="Loading records" />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<Calendar className="w-6 h-6" />}
            title="No records yet"
            hint="Admin or teacher: log what was taught each day — stream, subject, topic, strand, class size, absences and homework."
          />
        ) : (
          <div className="space-y-2">
            {[...filtered]
              .sort((a, b) => a.day.localeCompare(b.day) || a.stream.localeCompare(b.stream) || a.topic.localeCompare(b.topic))
              .map((row) => (
                <div key={row.id} className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row gap-3 sm:gap-4 min-h-[130px]">
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-white sm:text-sm">{row.stream}</div>
                    <div className="text-[10px] text-slate-400 sm:text-xs">{row.topic}</div>
                  </div>
                  <div className="text-center sm:text-right">
                    <div className="font-mono text-amber-300 text-xs font-bold">{row.day}</div>
                    <div className="text-[10px] text-slate-500">{row.subjectId || '—'}</div>
                  </div>
                  <div className="flex-1">
                    <div className="text-[10px] text-slate-500">Class: {row.classSize}</div>
                    {row.absences && <div className="text-[10px] text-amber-300">{row.absences} absent</div>}
                    {row.homework && <div className="text-[10px] text-slate-400 mt-1">{row.homework}</div>}
                  </div>
                  {ctx.session.role === 'admin' && (
                    <div className="text-right">
                      <button className={btnGhost} size="small" onClick={() => openForm(row)}>
                        <Edit className="w-3 h-3" /> Edit
                      </button>
                      <button className={btnGhost} size="small" onClick={() => void remove(row.id)}>
                        <Trash2 className="w-3 h-3" /> Delete
                      </button>
                    </div>
                  )}
                </div>
              ))}
          </div>
        )}
      </Panel>

      {form !== null || editing !== null ? (
        <Modal
          open={form !== null || editing !== null}
          onClose={() => {
            setForm(null);
            setEditing(null);
          }}
          title={editing ? 'Edit record of work' : 'Add record of work'}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls} htmlFor="row-stream">Stream</label>
                <select
                  id="row-stream"
                  className={selectCls}
                  value={form?.stream || editing?.stream || ''}
                  onChange={(e) => setForm({ ...form, stream: e.target.value })}
                >
                  {ctx.session.streams ? ctx.session.streams.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  )) : []}
                </select>
              </div>
              <div>
                <label className={labelCls} htmlFor="row-subject">Subject</label>
                <select
                  id="row-subject"
                  className={selectCls}
                  value={form?.subjectId || editing?.subjectId || ''}
                  onChange={(e) => setForm({ ...form, subjectId: e.target.value })}
                >
                  <option value="">Any</option>
                </select>
              </div>
              <div>
                <label className={labelCls} htmlFor="row-day">Day</label>
                <select
                  id="row-day"
                  className={selectCls}
                  value={form?.day || editing?.day || ''}
                  onChange={(e) => setForm({ ...form, day: e.target.value })}
                >
                  <option value="Monday">Monday</option>
                  <option value="Tuesday">Tuesday</option>
                  <option value="Wednesday">Wednesday</option>
                  <option value="Thursday">Thursday</option>
                  <option value="Friday">Friday</option>
                </select>
              </div>
              <div>
                <label className={labelCls} htmlFor="row-topic">Topic</label>
                <input
                  id="row-topic"
                  className={inputCls}
                  value={form?.topic || editing?.topic || ''}
                  onChange={(e) => setForm({ ...form, topic: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls} htmlFor="row-strand">Strand</label>
                <input
                  id="row-strand"
                  className={inputCls}
                  value={form?.strand || editing?.strand || ''}
                  onChange={(e) => setForm({ ...form, strand: e.target.value })}
                />
              </div>
              <div>
                <label className={labelCls} htmlFor="row-class-size">Class size</label>
                <input
                  id="row-class-size"
                  type="number"
                  min={0}
                  className={inputCls}
                  value={(form?.classSize ?? editing?.classSize ?? 0)}
                  onChange={(e) => setForm({ ...form, classSize: Number(e.target.value) })}
                />
              </div>
              <div>
                <label className={labelCls} htmlFor="row-absences">Absences</label>
                <input
                  id="row-absences"
                  className={inputCls}
                  value={form?.absences || editing?.absences || ''}
                  onChange={(e) => setForm({ ...form, absences: e.target.value })}
                />
              </div>
              <div>
                <label className={labelCls} htmlFor="row-homework">Homework</label>
                <input
                  id="row-homework"
                  className={inputCls}
                  value={form?.homework || editing?.homework || ''}
                  onChange={(e) => setForm({ ...form, homework: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls} htmlFor="row-remarks">Remarks / end-of-lesson comments</label>
                <textarea
                  id="row-remarks"
                  className={`${inputCls} min-h-[80px] leading-relaxed`}
                  value={form?.remarks || editing?.remarks || ''}
                  onChange={(e) => setForm({ ...form, remarks: e.target.value })}
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button className={`${btnPrimary}`} onClick={() => save()}>
                {editing ? 'Update record' : 'Add record'}
              </button>
              <button className={btnGhost} onClick={() => { setForm(null); setEditing(null); }}>
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      ) : null}
    </div>
  );
}