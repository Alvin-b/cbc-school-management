import { useCallback, useEffect, useMemo, useState } from 'react';
import { BookOpen, Plus, Pencil, Trash2, Settings2, Save, X } from 'lucide-react';
import { api, ApiError } from '../lib/api';
import type { AppCtx } from '../lib/context';
import type { LessonPlan, LessonPlanTemplate } from '../lib/types';
import { STREAMS, subjectsForStream, PRIMARY_SUBJECTS, JSS_SUBJECTS } from '../lib/curriculum';
import {
  Panel, PageHeader, inputCls, selectCls, labelCls, btnPrimary, btnGhost,
  EmptyState, ErrorNote, Badge, Modal, Loading,
} from '../components/ui';

interface Draft {
  id?: string;
  stream: string;
  subjectId: string;
  lessonDate: string;
  topic: string;
  subStrand: string;
  content: Record<string, string>;
}

const today = () => new Date().toISOString().slice(0, 10);

const SUBJECT_LABELS: Record<string, string> = Object.fromEntries(
  [...PRIMARY_SUBJECTS, ...JSS_SUBJECTS].map((s) => [s.id, s.name]),
);

const subjectList = (stream: string) => {
  const list = subjectsForStream(stream);
  return list.length ? list : [...PRIMARY_SUBJECTS, ...JSS_SUBJECTS];
};

export default function LessonPlans({ ctx }: { ctx: AppCtx }) {
  const [template, setTemplate] = useState<LessonPlanTemplate | null>(null);
  const [plans, setPlans] = useState<LessonPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [draft, setDraft] = useState<Draft | null>(null);
  const [saving, setSaving] = useState(false);
  const [templateOpen, setTemplateOpen] = useState(false);
  const [tplName, setTplName] = useState('');
  const [tplSections, setTplSections] = useState<{ label: string }[]>([]);

  const isAdmin = ctx.session.role === 'admin';
  const streamOptions = useMemo(
    () => (ctx.session.streams === null ? [...STREAMS] : ctx.session.streams),
    [ctx.session.streams],
  );

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<{ template: LessonPlanTemplate; plans: LessonPlan[] }>('/api/lesson-plans');
      setTemplate(res.template);
      setPlans(res.plans);
      setError('');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load lesson plans');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const openNew = () => {
    const stream = streamOptions[0] || STREAMS[0];
    setDraft({
      stream,
      subjectId: subjectList(stream)[0].id,
      lessonDate: today(),
      topic: '',
      subStrand: '',
      content: {},
    });
  };

  const openPlan = (plan: LessonPlan) => {
    setDraft({
      id: plan.id,
      stream: plan.stream,
      subjectId: plan.subjectId,
      lessonDate: plan.lessonDate,
      topic: plan.topic,
      subStrand: plan.subStrand || '',
      content: { ...plan.content },
    });
  };

  const save = async () => {
    if (!draft) return;
    setSaving(true);
    setError('');
    try {
      if (draft.id) {
        await api.put('/api/lesson-plans', draft);
        ctx.toast('Lesson plan updated');
      } else {
        await api.post('/api/lesson-plans', draft);
        ctx.toast('Lesson plan stored');
      }
      setDraft(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Saving failed');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (plan: LessonPlan) => {
    if (!window.confirm(`Delete the lesson plan "${plan.topic}"?`)) return;
    try {
      await api.del('/api/lesson-plans', { id: plan.id });
      ctx.toast('Lesson plan deleted');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
    }
  };

  const openTemplateEditor = () => {
    if (!template) return;
    setTplName(template.name);
    setTplSections(
      template.sections
        .filter((s) => !/^sub[_\s-]?(strand|topic)$/i.test(s.key))
        .map((s) => ({ label: s.label })),
    );
    setTemplateOpen(true);
  };

  const saveTemplate = async () => {
    setSaving(true);
    setError('');
    try {
      await api.put('/api/lesson-plans/template', { name: tplName, sections: tplSections });
      setTemplateOpen(false);
      ctx.toast('Standard lesson plan updated');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Saving failed');
    } finally {
      setSaving(false);
    }
  };

  // Sub-strand is a first-class field beside the topic, so drop the legacy
  // template entry for it — otherwise it renders twice on older tenants.
  const allSections = template?.sections || [];
  const sections = allSections.filter((s) => !/^sub[_\s-]?(strand|topic)$/i.test(s.key));
  const remarksKey = sections.find((s) => /remark|comment/i.test(s.label))?.key;

  return (
    <div className="space-y-6 animate-fadeIn">
      <PageHeader
        title="Lesson Plans"
        sub={template ? `${template.name} · ${sections.length} sections` : 'Standard lesson plan'}
        icon={<BookOpen className="w-5 h-5" />}
        actions={
          <>
            {isAdmin && (
              <button className={btnGhost} onClick={openTemplateEditor}>
                <Settings2 className="w-4 h-4" /> Edit standard
              </button>
            )}
            <button className={btnPrimary} onClick={openNew} disabled={!streamOptions.length}>
              <Plus className="w-4 h-4" /> New lesson plan
            </button>
          </>
        }
      />

      {error && <ErrorNote message={error} />}

      <Panel title="Stored lesson plans" icon={<BookOpen className="w-4 h-4" />}>
        {loading ? (
          <Loading label="Loading lesson plans" />
        ) : plans.length === 0 ? (
          <EmptyState
            icon={<BookOpen className="w-6 h-6" />}
            title="No lesson plans yet"
            hint="Write your first plan — objectives, activities, assessment and the end-of-lesson remarks are all stored."
          />
        ) : (
          <div className="space-y-3">
            {plans.map((plan) => (
              <div key={plan.id} className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge tone="bg-indigo-500/10 text-indigo-300 border-indigo-500/30">{plan.stream}</Badge>
                      <Badge tone="bg-slate-500/10 text-slate-300 border-slate-500/30">
                        {SUBJECT_LABELS[plan.subjectId] || plan.subjectId}
                      </Badge>
                      <span className="text-[11px] text-slate-500">{plan.lessonDate}</span>
                    </div>
                    <p className="text-sm font-bold text-white truncate">{plan.topic}</p>
                    {plan.subStrand && (
                      <p className="text-[11px] text-indigo-300 truncate">{plan.subStrand}</p>
                    )}
                    <p className="text-[11px] text-slate-500">By {plan.author}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className={btnGhost} onClick={() => openPlan(plan)}>
                      <Pencil className="w-3.5 h-3.5" /> Open
                    </button>
                    <button className={btnGhost} onClick={() => void remove(plan)} title="Delete">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                {remarksKey && plan.content[remarksKey] && (
                  <p className="text-xs text-slate-400 border-t border-slate-800 pt-2">
                    <span className="text-slate-500 font-semibold">Remarks: </span>
                    {plan.content[remarksKey]}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </Panel>

      {/* PLAN EDITOR */}
      <Modal
        open={!!draft}
        onClose={() => setDraft(null)}
        title={draft?.id ? 'Edit lesson plan' : 'New lesson plan'}
      >
        {draft && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={labelCls} htmlFor="lp-stream">Class</label>
                <select
                  id="lp-stream"
                  className={selectCls}
                  value={draft.stream}
                  onChange={(e) => {
                    const stream = e.target.value;
                    setDraft({
                      ...draft,
                      stream,
                      subjectId: subjectList(stream).some((s) => s.id === draft.subjectId)
                        ? draft.subjectId
                        : subjectList(stream)[0].id,
                    });
                  }}
                >
                  {streamOptions.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls} htmlFor="lp-subject">Learning area</label>
                <select
                  id="lp-subject"
                  className={selectCls}
                  value={draft.subjectId}
                  onChange={(e) => setDraft({ ...draft, subjectId: e.target.value })}
                >
                  {subjectList(draft.stream).map((s) => (
                    <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls} htmlFor="lp-date">Lesson date</label>
                <input
                  id="lp-date"
                  type="date"
                  className={inputCls}
                  value={draft.lessonDate}
                  onChange={(e) => setDraft({ ...draft, lessonDate: e.target.value })}
                />
              </div>
              <div>
                <label className={labelCls} htmlFor="lp-topic">Topic / Main Topic</label>
                <input
                  id="lp-topic"
                  className={inputCls}
                  value={draft.topic}
                  onChange={(e) => setDraft({ ...draft, topic: e.target.value })}
                  placeholder="e.g. Fractions & equivalent sets"
                />
              </div>
              <div>
                <label className={labelCls} htmlFor="lp-subtopic">Subtopic / Substrand</label>
                <input
                  id="lp-subtopic"
                  className={inputCls}
                  value={draft.subStrand}
                  onChange={(e) => setDraft({ ...draft, subStrand: e.target.value })}
                  placeholder="e.g. Equivalent fractions"
                />
              </div>
            </div>

            <div className="space-y-3 border-t border-slate-800 pt-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                {template?.name || 'Standard lesson plan'}
              </p>
              {sections.map((section) => (
                <div key={section.key}>
                  <label className={labelCls} htmlFor={`sec-${section.key}`}>{section.label}</label>
                  <textarea
                    id={`sec-${section.key}`}
                    className={`${inputCls} min-h-[72px] leading-relaxed`}
                    value={draft.content[section.key] || ''}
                    onChange={(e) =>
                      setDraft({ ...draft, content: { ...draft.content, [section.key]: e.target.value } })
                    }
                    placeholder={
                      /remark|comment/i.test(section.label)
                        ? 'How the lesson ended, what learners grasped, follow-up…'
                        : ''
                    }
                  />
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <button className={`${btnPrimary} flex-1 justify-center`} onClick={() => void save()} disabled={saving}>
                <Save className="w-4 h-4" /> {saving ? 'Saving…' : 'Save lesson plan'}
              </button>
              <button className={btnGhost} onClick={() => setDraft(null)}>
                <X className="w-4 h-4" /> Cancel
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* ADMIN: EDIT THE SCHOOL'S STANDARD LESSON PLAN */}
      <Modal open={templateOpen} onClose={() => setTemplateOpen(false)} title="Standard lesson plan">
        <div className="space-y-4">
          <div>
            <label className={labelCls} htmlFor="tpl-name">Plan name</label>
            <input
              id="tpl-name"
              className={inputCls}
              value={tplName}
              onChange={(e) => setTplName(e.target.value)}
            />
          </div>
          <div>
            <span className={labelCls}>Sections (in order)</span>
            <div className="space-y-2">
              {tplSections.map((section, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    className={inputCls}
                    value={section.label}
                    onChange={(e) => setTplSections(
                      tplSections.map((s, j) => (j === i ? { label: e.target.value } : s)),
                    )}
                    placeholder={`Section ${i + 1}`}
                  />
                  <button
                    className={btnGhost}
                    title="Remove section"
                    onClick={() => setTplSections(tplSections.filter((_, j) => j !== i))}
                    disabled={tplSections.length <= 2}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
            <button
              className={`${btnGhost} mt-2`}
              onClick={() => setTplSections([...tplSections, { label: '' }])}
              disabled={tplSections.length >= 12}
            >
              <Plus className="w-3.5 h-3.5" /> Add section
            </button>
            <p className="text-[10px] text-slate-500 mt-1.5">
              Every teacher's lesson plan editor follows this structure, including the end-of-lesson remarks.
            </p>
          </div>
          <button className={`${btnPrimary} w-full justify-center`} onClick={() => void saveTemplate()} disabled={saving}>
            <Save className="w-4 h-4" /> {saving ? 'Saving…' : 'Save standard'}
          </button>
        </div>
      </Modal>
    </div>
  );
}