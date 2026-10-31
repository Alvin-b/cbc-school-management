import { useCallback, useEffect, useMemo, useState } from 'react';
import { Search, Loader2, X, Trash2, Plus, Download, Edit, ExternalLink, Eye, EyeOff, BookOpen } from 'lucide-react';
import { api, ApiError, planSpec } from '../lib/api';
import type { AppCtx } from '../lib/context';
import type { KicdDesign, KicdSource } from '../lib/types';
import { inputCls, selectCls, labelCls, btnPrimary, btnGhost, Panel, PageHeader, EmptyState, ErrorNote, Badge, Modal, Loading } from '../components/ui';
import { SUBJECT_BY_ID, PRIMARY_SUBJECTS, JSS_SUBJECTS } from '../lib/curriculum';
import CurriculumResources from './CurriculumResources';

/**
 * Provenance is the whole point of this screen: a teacher must be able to tell
 * KICD curriculum from school notes from the sample data we ship.
 */
const ORIGIN_META: Record<string, { label: string; cls: string; hint: string }> = {
  kicd: {
    label: 'Official KICD',
    cls: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
    hint: 'Imported from a cited KICD source document.',
  },
  school: {
    label: 'School entered',
    cls: 'bg-sky-500/10 text-sky-300 border-sky-500/30',
    hint: 'Written by your school — not official curriculum text.',
  },
  sample: {
    label: 'Sample data',
    cls: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
    hint: 'Illustrative placeholder shipped with the app. Do not treat as curriculum.',
  },
};

export default function KicdDesigns({ ctx }: { ctx: AppCtx }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [designs, setDesigns] = useState<KicdDesign[]>([]);
  const [sources, setSources] = useState<KicdSource[]>([]);
  const [strandOptions, setStrandOptions] = useState<string[]>([]);
  const [category, setCategory] = useState<'regular' | 'sne'>('regular');
  const [level, setLevel] = useState<string>('');
  const [grade, setGrade] = useState<string>('');
  const [subject, setSubject] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<'regular' | 'sne'>('regular');
  const [filterLevel, setFilterLevel] = useState<string>('');
  const [filterGrade, setFilterGrade] = useState<string>('');
  const [filterSubject, setFilterSubject] = useState<string>('');
  const [filterStrand, setFilterStrand] = useState<string>('');
  const [filterOrigin, setFilterOrigin] = useState<string>('');
  const [includeDisabled, setIncludeDisabled] = useState(false);
  const [draft, setDraft] = useState<KicdDesign | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const isAdmin = ctx.session.role === 'admin';

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ category: filterCategory });
      if (filterLevel) params.set('level', filterLevel);
      if (filterGrade) params.set('grade', filterGrade);
      if (includeDisabled) params.set('includeDisabled', '1');
      const res = await api.get<{ designs: KicdDesign[]; sources: KicdSource[]; strands: string[] }>(
        `/api/kicd?${params.toString()}`,
      );
      setDesigns(res.designs);
      setSources(res.sources || []);
      setStrandOptions(res.strands || []);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load KICD designs');
    } finally {
      setLoading(false);
    }
  }, [filterCategory, filterLevel, filterGrade, includeDisabled]);

  useEffect(() => { void load(); }, [load]);

  const termsOf = (level: string) => {
    const m = level.match(/Grade (\d)/);
    const g = m ? Number(m[1]) : 0;
    if (g >= 1 && g <= 3) return 'Lower Primary';
    if (g >= 4 && g <= 6) return 'Upper Primary';
    if (g >= 7) return 'Junior School';
    return 'Pre-Primary';
  };

  const openNew = () => setDraft({
    id: '',
    category: filterCategory,
    level: '',
    grade: '',
    subjectId: '',
    strand: '',
    subStrand: '',
    outcomes: [],
    experiences: [],
    competencies: [],
    standards: [],
    inquiry: [],
    resources: [],
    inclusive: '',
    origin: 'school',
    status: 'active',
    sourceUrl: '',
    sourceTitle: '',
    versionLabel: '',
    versionDate: '',
    lastCheckedAt: '',
  });

  // The form keeps every list field as an array and joins on render, so the
  // record can be handed straight back in — pre-joining it here would leave a
  // string where the textarea expects an array.
  const openEdit = (design: KicdDesign) => setDraft({ ...design });

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
      (!filterSubject || d.subjectId === filterSubject) &&
      (!filterStrand || d.strand === filterStrand) &&
      (!filterOrigin || d.origin === filterOrigin)
    );
  }, [designs, filterCategory, filterLevel, filterGrade, filterSubject, filterStrand, filterOrigin]);

  // Grade 1 is the pilot cohort: make sure a teacher landing here can get from
  // grade to learning area to strand without reading a PDF.
  const coverage = useMemo(() => {
    const byGrade = new Map<string, Set<string>>();
    for (const d of designs) {
      if (!d.grade) continue;
      if (!byGrade.has(d.grade)) byGrade.set(d.grade, new Set());
      if (d.subjectId) byGrade.get(d.grade)!.add(d.subjectId);
    }
    return [...byGrade.entries()]
      .map(([g, s]) => ({ grade: g, areas: s.size }))
      .sort((a, b) => a.grade.localeCompare(b.grade, undefined, { numeric: true }));
  }, [designs]);

  const toggleDisabled = async (d: KicdDesign) => {
    const next = d.status === 'disabled' ? 'active' : 'disabled';
    const verb = next === 'disabled' ? 'withdraw' : 'restore';
    if (!window.confirm(`${verb === 'withdraw' ? 'Withdraw' : 'Restore'} “${d.strand || 'this design'}”? ${next === 'disabled' ? 'It stays in reports but is no longer offered for new planning.' : ''}`)) return;
    setDeleting(d.id);
    try {
      await api.put('/api/kicd', { ...d, status: next });
      ctx.toast(next === 'disabled' ? 'Design withdrawn' : 'Design restored');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update status');
    } finally {
      setDeleting(null);
    }
  };

  // The learning area offered in the form follows the design's KICD level:
  // only Junior School uses the JSS learning areas.
  const draftSubjects = useMemo(
    () => (draft?.level === 'Junior School' ? JSS_SUBJECTS : PRIMARY_SUBJECTS),
    [draft?.level],
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      <PageHeader
        title="KICD Curriculum Designs"
        sub="Curriculum reference layer: what should be taught, by grade and learning area. Official KICD content, school notes and sample data are labelled separately."
        icon={<Search className="w-5 h-5" />}
        actions={
          <div className="flex gap-2">
            {isAdmin && (
              <button className={btnPrimary} onClick={openNew}>
                <Plus className="w-4 h-4" /> Add design
              </button>
            )}
            <select
              className={selectCls}
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value as 'regular' | 'sne')}
            >
              <option value="regular">Regular Curriculum Designs</option>
              <option value="sne">SNE Curriculum Designs</option>
            </select>
          </div>
        }
      />

      {error && <ErrorNote message={error} />}

      <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 space-y-3">
        <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-slate-500">
          <BookOpen className="w-3.5 h-3.5" /> Official KICD sources
          <span className="normal-case font-normal tracking-normal text-slate-600">
            — linked, not copied. KICD content is © KICD and not redistributed here.
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {sources.map((s) => (
            <a
              key={s.key}
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-[11px] text-slate-300 hover:border-indigo-500/50 hover:text-white"
            >
              {s.label} <ExternalLink className="w-3 h-3" />
            </a>
          ))}
        </div>
      </div>

      <Panel title={`Designs (${filtered.length})`} icon={<Search className="w-4 h-4" />}>
        <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
          <div>
            <label className={labelCls} htmlFor="kd-f-level">Level</label>
            <select id="kd-f-level" className={selectCls} value={filterLevel} onChange={(e) => setFilterLevel(e.target.value)}>
              <option value="">All levels</option>
              {['Pre-Primary', 'Lower Primary', 'Upper Primary', 'Junior School'].map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls} htmlFor="kd-f-grade">Grade</label>
            <select id="kd-f-grade" className={selectCls} value={filterGrade} onChange={(e) => setFilterGrade(e.target.value)}>
              <option value="">All grades</option>
              {Array.from({ length: 9 }, (_, i) => `Grade ${i + 1}`).map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls} htmlFor="kd-f-subject">Learning area</label>
            <select id="kd-f-subject" className={selectCls} value={filterSubject} onChange={(e) => setFilterSubject(e.target.value)}>
              <option value="">All learning areas</option>
              {[...PRIMARY_SUBJECTS, ...JSS_SUBJECTS].map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls} htmlFor="kd-f-strand">Strand</label>
            <select id="kd-f-strand" className={selectCls} value={filterStrand} onChange={(e) => setFilterStrand(e.target.value)}>
              <option value="">All strands</option>
              {strandOptions.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls} htmlFor="kd-f-origin">Origin</label>
            <select id="kd-f-origin" className={selectCls} value={filterOrigin} onChange={(e) => setFilterOrigin(e.target.value)}>
              <option value="">All origins</option>
              <option value="kicd">Official KICD</option>
              <option value="school">School entered</option>
              <option value="sample">Sample data</option>
            </select>
          </div>
        </div>

        {isAdmin && (
          <label className="mb-4 flex items-center gap-2 text-[11px] text-slate-400">
            <input
              type="checkbox"
              className="accent-indigo-500"
              checked={includeDisabled}
              onChange={(e) => setIncludeDisabled(e.target.checked)}
            />
            Show withdrawn versions (kept for report history)
          </label>
        )}

        {coverage.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {coverage.map((c) => (
              <button
                key={c.grade}
                type="button"
                onClick={() => setFilterGrade(filterGrade === c.grade ? '' : c.grade)}
                className={`rounded-lg border px-2.5 py-1 text-[11px] transition ${
                  filterGrade === c.grade
                    ? 'border-indigo-500/60 bg-indigo-500/15 text-indigo-200'
                    : 'border-slate-700 bg-slate-900 text-slate-400 hover:border-slate-500'
                }`}
                title={`${c.areas} learning areas covered`}
              >
                {c.grade} · {c.areas} learning areas
              </button>
            ))}
          </div>
        )}

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
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded border px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide ${ORIGIN_META[d.origin]?.cls || ORIGIN_META.school.cls}`}>
                        {ORIGIN_META[d.origin]?.label || d.origin}
                      </span>
                      {d.status === 'disabled' && (
                        <span className="rounded border border-rose-500/30 bg-rose-500/10 px-1.5 py-0.5 text-[9px] font-bold uppercase text-rose-300">
                          Withdrawn
                        </span>
                      )}
                    </div>
                    <div className="mt-1 font-semibold text-white sm:text-sm">{d.level}</div>
                    <div className="text-[10px] text-slate-400 sm:text-xs">
                      {SUBJECT_BY_ID[d.subjectId]?.name || d.subjectId}
                    </div>
                  </div>
                  <div className="text-center sm:text-right flex-1">
                    <div className="font-mono text-amber-300 text-xs font-bold">{d.grade}</div>
                    <div className="text-[10px] text-slate-500">
                      {d.strand}{d.subStrand ? ` · ${d.subStrand}` : ''}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="text-[10px] text-slate-500">
                      {d.outcomes.length ? `${d.outcomes.length} outcomes` : ''}
                    </div>
                    {d.origin === 'sample' && (
                      <div className="text-[10px] text-amber-400/80">
                        Placeholder — not KICD curriculum
                      </div>
                    )}
                    {d.origin === 'kicd' && (
                      <div className="text-[10px] text-slate-500">
                        {d.versionLabel}
                        {d.versionDate ? ` · ${d.versionDate}` : ''}
                        {d.lastCheckedAt ? ` · checked ${d.lastCheckedAt}` : ''}
                      </div>
                    )}
                    {d.origin === 'kicd' && d.sourceUrl && (
                      <a
                        href={d.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[10px] text-indigo-300 hover:text-indigo-200"
                      >
                        Source <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                  </div>
                  {isAdmin && (
                    <div className="text-right">
                      <button className={btnGhost} onClick={() => openEdit(d)}>
                        <Edit className="w-3 h-3" /> Edit
                      </button>
                      <button className={btnGhost} onClick={() => void toggleDisabled(d)} disabled={deleting === d.id}>
                        {d.status === 'disabled'
                          ? <><Eye className="w-3 h-3" /> Restore</>
                          : <><EyeOff className="w-3 h-3" /> Withdraw</>}
                      </button>
                      <button className={btnGhost} onClick={() => void remove(d.id)}>
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
                  <option value="" disabled>Choose a learning area</option>
                  {draftSubjects.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
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
                <label className={labelCls} htmlFor="kd-experiences">Learning experiences</label>
                <textarea
                  id="kd-experiences"
                  className={`${inputCls} min-h-[80px] leading-relaxed`}
                  value={draft?.experiences ? draft.experiences.join('\n') : ''}
                  onChange={(e) => setDraft({ ...draft, experiences: e.target.value.split('\n') })}
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

            {draft.origin === 'sample' && (
              <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-[11px] text-amber-200">
                Sample data — illustrative placeholder, not KICD curriculum. Change the origin below
                once it has been checked against an official design.
              </div>
            )}

            <div className="space-y-3 border-t border-slate-800 pt-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Provenance — where this content came from
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls} htmlFor="kd-origin">Origin</label>
                  <select
                    id="kd-origin"
                    className={selectCls}
                    value={draft?.origin || 'school'}
                    onChange={(e) => setDraft({ ...draft, origin: e.target.value as KicdDesign['origin'] })}
                  >
                    <option value="kicd">Official KICD</option>
                    <option value="school">School entered</option>
                    <option value="sample">Sample data</option>
                  </select>
                  <p className="mt-1 text-[10px] text-slate-600">
                    {ORIGIN_META[draft?.origin || 'school']?.hint}
                  </p>
                </div>
                <div>
                  <label className={labelCls} htmlFor="kd-status">Status</label>
                  <select
                    id="kd-status"
                    className={selectCls}
                    value={draft?.status || 'active'}
                    onChange={(e) => setDraft({ ...draft, status: e.target.value as 'active' | 'disabled' })}
                  >
                    <option value="active">Active — offered for planning</option>
                    <option value="disabled">Withdrawn — history only</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls} htmlFor="kd-source-title">Source document</label>
                  <input
                    id="kd-source-title"
                    className={inputCls}
                    value={draft?.sourceTitle || ''}
                    onChange={(e) => setDraft({ ...draft, sourceTitle: e.target.value })}
                    placeholder="e.g. Lower Primary Curriculum Designs, Vol. 1"
                  />
                </div>
                <div>
                  <label className={labelCls} htmlFor="kd-source-url">Source link</label>
                  <input
                    id="kd-source-url"
                    className={inputCls}
                    value={draft?.sourceUrl || ''}
                    onChange={(e) => setDraft({ ...draft, sourceUrl: e.target.value })}
                    placeholder="https://kicd.ac.ke/…"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className={labelCls} htmlFor="kd-version">Version</label>
                  <input
                    id="kd-version"
                    className={inputCls}
                    value={draft?.versionLabel || ''}
                    onChange={(e) => setDraft({ ...draft, versionLabel: e.target.value })}
                    placeholder="2017"
                  />
                </div>
                <div>
                  <label className={labelCls} htmlFor="kd-version-date">Published</label>
                  <input
                    id="kd-version-date"
                    className={inputCls}
                    value={draft?.versionDate || ''}
                    onChange={(e) => setDraft({ ...draft, versionDate: e.target.value })}
                    placeholder="2017-09"
                  />
                </div>
                <div>
                  <label className={labelCls} htmlFor="kd-checked">Last checked</label>
                  <input
                    id="kd-checked"
                    className={inputCls}
                    value={draft?.lastCheckedAt || ''}
                    onChange={(e) => setDraft({ ...draft, lastCheckedAt: e.target.value })}
                    placeholder="YYYY-MM-DD"
                  />
                </div>
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

      <CurriculumResources ctx={ctx} />
    </div>
  );
}