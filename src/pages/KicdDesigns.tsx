import { useCallback, useEffect, useMemo, useState } from 'react';
import { Search, Loader2, X, Trash2, Plus, Download } from 'lucide-react';
import { api, ApiError, planSpec } from '../lib/api';
import type { AppCtx } from '../lib/context';
import type { KicdDesign } from '../lib/types';
import { inputCls, selectCls, labelCls, btnPrimary, btnGhost, Panel, PageHeader, EmptyState, ErrorNote, Badge, Modal, Loading } from '../components/ui';

export default function KicdDesigns({ ctx }: { ctx: AppCtx }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [designs, setDesigns] = useState<KicdDesign[]>([]);
  const [category, setCategory] = useState<'regular' | 'sne'>('regular');
  const [level, setLevel] = useState<string>('');
  const [grade, setGrade] = useState<string>('');
  const [subject, setSubject] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<'regular' | 'sne'>('regular');
  const [filterLevel, setFilterLevel] = useState<string>('');
  const [filterGrade, setFilterGrade] = useState<string>('');
  const [filterSubject, setFilterSubject] = useState<string>('');
  const [draft, setDraft] = useState<KicdDesign | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get<{ designs: KicdDesign[] }>(
        `/api/kicd?category=${filterCategory}`,
      );
      setDesigns(res.designs);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load KICD designs');
    } finally {
      setLoading(false);
    }
  }, [filterCategory]);

  useEffect(() => { void load(); }, [load]);

  const termsOf = (level: string) => {
    const m = level.match(/Grade (\d)/);
    const g = m ? Number(m[1]) : 0;
    if (g >= 1 && g <= 3) return 'Lower Primary';
    if (g >= 4 && g <= 6) return 'Upper Primary';
    if (g >= 7) return 'Junior School';
    return 'Pre-Primary';
  };

  const openNew = () => setDraft(null);

  const openEdit = (design: KicdDesign) =>
    setDraft({ ...design, outcomes: design.outcomes.join('\n'), competencies: design.competencies.join('\n'), standards: design.standards.join('\n'), inquiry: design.inquiry.join('\n'), resources: design.resources.join(', '), inclusive: design.inclusive || '' });

  const save = async () => {
    if (!draft) return;
    setSaving(true);
    setError('');
    try {
      if (draft.id) {
        await api.put('/api/kicd', draft);
        ctx.toast('KICD design updated');
      } else {
        await api.post('/api/kicd', draft);
        ctx.toast('KICD design added');
      }
      setDraft(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Saving failed');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!window.confirm('Delete this KICD design?')) return;
    setDeleting(id);
    try {
      await api.del('/api/kicd', { id });
      ctx.toast('KICD design deleted');
      setDeleting(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
      setDeleting(null);
    }
  };

  const filtered = useMemo(() => {
    return designs.filter((d) =>
      (filterCategory === 'regular' ? d.category !== 'sne' : d.category === 'sne') &&
      (!filterLevel || d.level === filterLevel) &&
      (!filterGrade || d.grade === filterGrade) &&
      (!filterSubject || d.subjectId === filterSubject)
    );
  }, [designs, filterCategory, filterLevel, filterGrade, filterSubject]);

  return (
    <div className="space-y-6 animate-fadeIn">
      <PageHeader
        title="KICD Curriculum Designs"
        sub="Official framework — Regular & SNE designs for CBC implementation. Teachers browse; admins maintain the library."
        icon={<Search className="w-5 h-5" />}
        actions={
          <div className="flex gap-2">
            <button className={btnPrimary} onClick={openNew}>
              <Plus className="w-4 h-4" /> Add design
            </button>
            <select
              className={selectCls}
              onChange={(e) => setFilterCategory(e.target.value as any)}
            >
              <option value="regular">Regular Curriculum Designs</option>
              <option value="sne">SNE Curriculum Designs</option>
            </select>
          </div>
        }
      />

      {error && <ErrorNote message={error} />}

      <Panel title={`Designs (${filtered.length})`} icon={<Search className="w-4 h-4" />}>
        {loading ? (
          <Loading label="Loading designs" />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<Search className="w-6 h-6" />}
            title="No designs yet"
            hint="Admin: add KICD curriculum designs from which teachers will pick strands, outcomes and assessments when writing schemes of work."
          />
        ) : (
          <div className="space-y-2">
            {[...filtered]
              .sort((a, b) => a.level.localeCompare(b.level) || a.subjectId.localeCompare(b.subjectId) || a.grade.localeCompare(b.grade))
              .map((d) => (
                <div key={d.id} className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row gap-3 sm:gap-4 min-h-[140px]">
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-white sm:text-sm">{d.level}</div>
                    <div className="text-[10px] text-slate-400 sm:text-xs">{d.subjectId}</div>
                  </div>
                  <div className="text-center sm:text-right flex-1">
                    <div className="font-mono text-amber-300 text-xs font-bold">{d.grade}</div>
                    <div className="text-[10px] text-slate-500">{d.inclusive || ''}</div>
                  </div>
                  <div className="flex-1">
                    <div className="text-[10px] text-slate-500">{d.outcomes ? 'Outcomes' : ''}</div>
                  </div>
                  {ctx.session.role === 'admin' && (
                    <div className="text-right">
                      <button className={btnGhost} size="small" onClick={() => openEdit(d)}>
                        <Edit className="w-3 h-3" /> Edit
                      </button>
                      <button className={btnGhost} size="small" onClick={() => void remove(d.id)}>
                        <Trash2 className="w-3 h-3" /> Delete
                      </button>
                    </div>
                  )}
                </div>
              ))}
          </div>
        )}
      </Panel>

      {draft !== null ? (
        <Modal
          open={true}
          onClose={() => setDraft(null)}
          title={draft?.id ? 'Edit KICD design' : 'Add KICD design'}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls} htmlFor="kd-category">Category</label>
                <select
                  id="kd-category"
                  className={selectCls}
                  value={draft?.category || 'regular'}
                  onChange={(e) => setDraft({ ...draft, category: e.target.value as any })}>
                  <option value="regular">Regular</option>
                  <option value="sne">SNE</option>
                </select>
              </div>
              <div>
                <label className={labelCls} htmlFor="kd-level">Level</label>
                <input
                  id="kd-level"
                  className={inputCls}
                  value={draft?.level || ''}
                  onChange={(e) => setDraft({ ...draft, level: e.target.value })}
                />
              </div>
              <div>
                <label className={labelCls} htmlFor="kd-grade">Grade</label>
                <input
                  id="kd-grade"
                  className={inputCls}
                  value={draft?.grade || ''}
                  onChange={(e) => setDraft({ ...draft, grade: e.target.value })}
                />
              </div>
              <div>
                <label className={labelCls} htmlFor="kd-subject">Subject</label>
                <select
                  id="kd-subject"
                  className={selectCls}
                  value={draft?.subjectId || ''}
                  onChange={(e) => setDraft({ ...draft, subjectId: e.target.value })}
                >
                  <option value="">Any</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls} htmlFor="kd-strand">Strand</label>
                <input
                  id="kd-strand"
                  className={inputCls}
                  value={draft?.strand || ''}
                  onChange={(e) => setDraft({ ...draft, strand: e.target.value })}
                />
              </div>
              <div>
                <label className={labelCls} htmlFor="kd-subStrand">Sub-strand</label>
                <input
                  id="kd-subStrand"
                  className={inputCls}
                  value={draft?.subStrand || ''}
                  onChange={(e) => setDraft({ ...draft, subStrand: e.target.value })}
                />
              </div>
              <div>
                <label className={labelCls} htmlFor="kd-outcomes">Outcomes</label>
                <textarea
                  id="kd-outcomes"
                  className={`${inputCls} min-h-[80px] leading-relaxed`}
                  value={draft?.outcomes ? draft.outcomes.join('\n') : ''}
                  onChange={(e) => setDraft({ ...draft, outcomes: e.target.value.split('\n') })}
                />
              </div>
              <div>
                <label className={labelCls} htmlFor="kd-competencies">Competencies</label>
                <textarea
                  id="kd-competencies"
                  className={`${inputCls} min-h-[80px] leading-relaxed`}
                  value={draft?.competencies ? draft.competencies.join('\n') : ''}
                  onChange={(e) => setDraft({ ...draft, competencies: e.target.value.split('\n') })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls} htmlFor="kd-standards">Standards</label>
                <textarea
                  id="kd-standards"
                  className={`${inputCls} min-h-[80px] leading-relaxed`}
                  value={draft?.standards ? draft.standards.join('\n') : ''}
                  onChange={(e) => setDraft({ ...draft, standards: e.target.value.split('\n') })}
                />
              </div>
              <div>
                <label className={labelCls} htmlFor="kd-inquiry">Inquiry questions</label>
                <textarea
                  id="kd-inquiry"
                  className={`${inputCls} min-h-[80px] leading-relaxed`}
                  value={draft?.inquiry ? draft.inquiry.join('\n') : ''}
                  onChange={(e) => setDraft({ ...draft, inquiry: e.target.value.split('\n') })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls} htmlFor="kd-resources">Resources</label>
                <textarea
                  id="kd-resources"
                  className={`${inputCls} min-h-[80px] leading-relaxed`}
                  value={draft?.resources ? draft.resources.join(', ') : ''}
                  onChange={(e) => setDraft({ ...draft, resources: e.target.value.split(', ') })}
                />
              </div>
              <div>
                <label className={labelCls} htmlFor="kd-inclusive">Inclusive education</label>
                <input
                  id="kd-inclusive"
                  className={inputCls}
                  value={draft?.inclusive || ''}
                  onChange={(e) => setDraft({ ...draft, inclusive: e.target.value })}
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button className={`${btnPrimary}`} onClick={() => save()}>
                {draft?.id ? 'Update design' : 'Add design'}
              </button>
              <button className={btnGhost} onClick={() => setDraft(null)}>
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      ) : null}
    </div>
  );
}