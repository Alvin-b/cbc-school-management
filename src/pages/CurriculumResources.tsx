import { useCallback, useEffect, useMemo, useState } from 'react';
import { BookOpen, ExternalLink, Plus, Pencil, Trash2, Eye, EyeOff, Search } from 'lucide-react';
import { api, ApiError } from '../lib/api';
import type { AppCtx } from '../lib/context';
import type { CurriculumResource, ResourceCategory } from '../lib/types';
import {
  inputCls, selectCls, labelCls, btnPrimary, btnGhost, Panel,
  EmptyState, ErrorNote, Loading, Modal,
} from '../components/ui';

const CATEGORY_LABELS: Record<ResourceCategory, string> = {
  curriculum_design: 'Curriculum designs',
  course_book: 'Approved course books',
  complementary: 'Complementary materials',
  teacher: 'Teacher resources',
  parent: 'Parent resources',
};

const BLANK: CurriculumResource = {
  id: '',
  category: 'course_book',
  title: '',
  publisher: 'Kenya Institute of Curriculum Development',
  level: '',
  grade: '',
  learningArea: '',
  approvalNote: '',
  sourceUrl: '',
  versionDate: '',
  lastCheckedAt: '',
  status: 'active',
};

/**
 * Approved-material reference index. Deliberately bibliographic: KICD's site is
 * "© Kenya Institute of Curriculum Development. All Rights Reserved", and an
 * approval to use a book in schools is not a licence to redistribute the file.
 * Everything here is metadata plus a link back to the legitimate source.
 */
export default function CurriculumResources({ ctx }: { ctx: AppCtx }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [resources, setResources] = useState<CurriculumResource[]>([]);
  const [checkedOn, setCheckedOn] = useState('');
  const [query, setQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterGrade, setFilterGrade] = useState('');
  const [filterLevel, setFilterLevel] = useState('');
  const [draft, setDraft] = useState<CurriculumResource | null>(null);
  const [saving, setSaving] = useState(false);

  const isAdmin = ctx.session.role === 'admin';

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get<{ resources: CurriculumResource[]; checkedOn: string }>(
        '/api/resources',
      );
      setResources(res.resources || []);
      setCheckedOn(res.checkedOn || '');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load curriculum sources');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return resources.filter((r) =>
      (!filterCategory || r.category === filterCategory) &&
      (!filterGrade || r.grade === filterGrade) &&
      (!filterLevel || r.level === filterLevel) &&
      (!q ||
        r.title.toLowerCase().includes(q) ||
        r.publisher.toLowerCase().includes(q) ||
        r.learningArea.toLowerCase().includes(q) ||
        r.approvalNote.toLowerCase().includes(q)),
    );
  }, [resources, query, filterCategory, filterGrade, filterLevel]);

  const levels = useMemo(
    () => [...new Set(resources.map((r) => r.level).filter(Boolean))].sort(),
    [resources],
  );
  const grades = useMemo(
    () => [...new Set(resources.map((r) => r.grade).filter(Boolean))]
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true })),
    [resources],
  );

  const save = async () => {
    if (!draft) return;
    setSaving(true);
    setError('');
    try {
      if (draft.id) {
        await api.put('/api/resources', draft);
        ctx.toast('Source updated');
      } else {
        await api.post('/api/resources', draft);
        ctx.toast('Source added');
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
    if (!window.confirm('Remove this reference? The linked KICD page is unaffected.')) return;
    try {
      await api.del('/api/resources', { id });
      ctx.toast('Reference removed');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
    }
  };

  const toggleStatus = async (r: CurriculumResource) => {
    const next = r.status === 'disabled' ? 'active' : 'disabled';
    try {
      await api.put('/api/resources', { ...r, status: next });
      ctx.toast(next === 'disabled' ? 'Reference hidden' : 'Reference restored');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update status');
    }
  };

  return (
    <Panel
      title={`Approved material references (${filtered.length})`}
      icon={<BookOpen className="w-4 h-4" />}
    >
      <div className="mb-4 flex items-start gap-2 rounded-lg border border-sky-500/20 bg-sky-500/5 px-3 py-2 text-[11px] leading-relaxed text-sky-200/90">
        <Search className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        <span>
          Bibliographic references only — book files are never stored here. KICD approval to use a
          resource in schools does not grant the right to copy it, so each row links back to the
          legitimate source.
          {checkedOn ? ` Sources last checked ${checkedOn}.` : ''}
        </span>
      </div>

      {error && <ErrorNote message={error} />}

      <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <div>
          <label className={labelCls} htmlFor="cr-q">Search</label>
          <input
            id="cr-q"
            className={inputCls}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Title, publisher, learning area…"
          />
        </div>
        <div>
          <label className={labelCls} htmlFor="cr-cat">Category</label>
          <select
            id="cr-cat"
            className={selectCls}
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="">All categories</option>
            {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelCls} htmlFor="cr-level">Level</label>
          <select
            id="cr-level"
            className={selectCls}
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value)}
          >
            <option value="">All levels</option>
            {levels.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls} htmlFor="cr-grade">Grade</label>
          <select
            id="cr-grade"
            className={selectCls}
            value={filterGrade}
            onChange={(e) => setFilterGrade(e.target.value)}
          >
            <option value="">All grades</option>
            {grades.map((g) => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
      </div>

      {isAdmin && (
        <button
          className={`${btnPrimary} mb-4`}
          onClick={() => setDraft({ ...BLANK })}
        >
          <Plus className="w-4 h-4" /> Add source
        </button>
      )}

      {loading ? (
        <Loading label="Loading sources" />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<BookOpen className="w-6 h-6" />}
          title="No references match"
          hint="Adjust the filters, or have the administrator add a KICD source link."
        />
      ) : (
        <div className="space-y-2">
          {filtered.map((r) => (
            <div
              key={r.id}
              className="rounded-2xl border border-slate-800 bg-slate-950 p-4"
              style={r.status === 'disabled' ? { opacity: 0.55 } : undefined}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded border border-slate-700 bg-slate-900 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-slate-300">
                      {CATEGORY_LABELS[r.category] || r.category}
                    </span>
                    {r.status === 'disabled' && (
                      <span className="rounded border border-rose-500/30 bg-rose-500/10 px-1.5 py-0.5 text-[9px] font-bold uppercase text-rose-300">
                        Hidden
                      </span>
                    )}
                  </div>
                  <div className="mt-1 font-semibold text-white">{r.title}</div>
                  <div className="text-[11px] text-slate-400">{r.publisher}</div>
                  <div className="mt-1 flex flex-wrap gap-1.5 text-[10px] text-slate-500">
                    {r.level && <span>{r.level}</span>}
                    {r.grade && <span>· {r.grade}</span>}
                    {r.learningArea && <span>· {r.learningArea}</span>}
                    {r.versionDate && <span>· {r.versionDate}</span>}
                    {r.lastCheckedAt && <span>· checked {r.lastCheckedAt}</span>}
                  </div>
                  {r.approvalNote && (
                    <p className="mt-2 text-[11px] leading-relaxed text-slate-400">
                      {r.approvalNote}
                    </p>
                  )}
                </div>

                <div className="flex shrink-0 flex-col items-end gap-2">
                  {r.sourceUrl && (
                    <a
                      href={r.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-[11px] text-slate-300 hover:border-indigo-500/50 hover:text-white"
                    >
                      Open source <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                  {isAdmin && (
                    <div className="flex gap-1">
                      <button className={btnGhost} onClick={() => setDraft({ ...r })}>
                        <Pencil className="h-3 w-3" /> Edit
                      </button>
                      <button className={btnGhost} onClick={() => void toggleStatus(r)}>
                        {r.status === 'disabled'
                          ? <><Eye className="h-3 w-3" /> Show</>
                          : <><EyeOff className="h-3 w-3" /> Hide</>}
                      </button>
                      <button className={btnGhost} onClick={() => void remove(r.id)}>
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {draft !== null && (
        <Modal
          open
          onClose={() => setDraft(null)}
          title={draft.id ? 'Edit source' : 'Add source'}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls} htmlFor="cr-d-title">Title</label>
                <input
                  id="cr-d-title"
                  className={inputCls}
                  value={draft.title}
                  onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                  placeholder="Approved Grade 1 Coursebooks"
                />
              </div>
              <div>
                <label className={labelCls} htmlFor="cr-d-cat">Category</label>
                <select
                  id="cr-d-cat"
                  className={selectCls}
                  value={draft.category}
                  onChange={(e) => setDraft({ ...draft, category: e.target.value as ResourceCategory })}
                >
                  {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls} htmlFor="cr-d-pub">Publisher / body</label>
                <input
                  id="cr-d-pub"
                  className={inputCls}
                  value={draft.publisher}
                  onChange={(e) => setDraft({ ...draft, publisher: e.target.value })}
                />
              </div>
              <div>
                <label className={labelCls} htmlFor="cr-d-area">Learning area</label>
                <input
                  id="cr-d-area"
                  className={inputCls}
                  value={draft.learningArea}
                  onChange={(e) => setDraft({ ...draft, learningArea: e.target.value })}
                  placeholder="Mathematics"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className={labelCls} htmlFor="cr-d-level">Level</label>
                <input
                  id="cr-d-level"
                  className={inputCls}
                  value={draft.level}
                  onChange={(e) => setDraft({ ...draft, level: e.target.value })}
                  placeholder="Lower Primary"
                />
              </div>
              <div>
                <label className={labelCls} htmlFor="cr-d-grade">Grade</label>
                <input
                  id="cr-d-grade"
                  className={inputCls}
                  value={draft.grade}
                  onChange={(e) => setDraft({ ...draft, grade: e.target.value })}
                  placeholder="Grade 1"
                />
              </div>
              <div>
                <label className={labelCls} htmlFor="cr-d-version">Version date</label>
                <input
                  id="cr-d-version"
                  className={inputCls}
                  value={draft.versionDate}
                  onChange={(e) => setDraft({ ...draft, versionDate: e.target.value })}
                  placeholder="2017-09"
                />
              </div>
            </div>

            <div>
              <label className={labelCls} htmlFor="cr-d-url">Source link</label>
              <input
                id="cr-d-url"
                className={inputCls}
                value={draft.sourceUrl}
                onChange={(e) => setDraft({ ...draft, sourceUrl: e.target.value })}
                placeholder="https://kicd.ac.ke/…"
              />
            </div>

            <div>
              <label className={labelCls} htmlFor="cr-d-note">Approval / reference notes</label>
              <textarea
                id="cr-d-note"
                className={`${inputCls} min-h-[72px] leading-relaxed`}
                value={draft.approvalNote}
                onChange={(e) => setDraft({ ...draft, approvalNote: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls} htmlFor="cr-d-checked">Last checked</label>
                <input
                  id="cr-d-checked"
                  className={inputCls}
                  value={draft.lastCheckedAt}
                  onChange={(e) => setDraft({ ...draft, lastCheckedAt: e.target.value })}
                  placeholder="YYYY-MM-DD"
                />
              </div>
              <div>
                <label className={labelCls} htmlFor="cr-d-status">Status</label>
                <select
                  id="cr-d-status"
                  className={selectCls}
                  value={draft.status}
                  onChange={(e) => setDraft({ ...draft, status: e.target.value as 'active' | 'disabled' })}
                >
                  <option value="active">Visible</option>
                  <option value="disabled">Hidden</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3">
              <button className={btnPrimary} onClick={() => void save()} disabled={saving}>
                {saving ? 'Saving…' : draft.id ? 'Update source' : 'Add source'}
              </button>
              <button className={btnGhost} onClick={() => setDraft(null)}>Cancel</button>
            </div>
          </div>
        </Modal>
      )}
    </Panel>
  );
}
