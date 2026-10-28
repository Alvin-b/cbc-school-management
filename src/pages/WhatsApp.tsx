import { useCallback, useEffect, useState } from 'react';
import { MessageSquare, Send, Inbox, PlugZap, ShieldAlert } from 'lucide-react';
import { api, ApiError, planSpec } from '../lib/api';
import type { AppCtx } from '../lib/context';
import type { MessageLog } from '../lib/types';
import {
  Panel, PageHeader, inputCls, labelCls, btnPrimary, btnGhost, EmptyState, ErrorNote, Badge, PlanLock,
} from '../components/ui';

const DEFAULT_MSG =
  'Dear Parent, continuous assessment results are now published on ElimuTrack.';

const REQUIRED_VARS = ['EVOLUTION_BASE_URL', 'EVOLUTION_API_KEY', 'EVOLUTION_INSTANCE'];

export default function WhatsAppPage({ ctx }: { ctx: AppCtx }) {
  const spec = planSpec(ctx.session.tenant?.plan);
  const [messages, setMessages] = useState<MessageLog[]>([]);
  const [configured, setConfigured] = useState(true);
  const [recipientId, setRecipientId] = useState('');
  const [text, setText] = useState(DEFAULT_MSG);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<{ messages: MessageLog[]; configured: boolean }>('/api/whatsapp');
      setMessages(res.messages);
      setConfigured(res.configured);
      setError('');
    } catch (err) {
      if (!(err instanceof ApiError && (err.status === 401 || err.code === 'SERVICE_DENIED'))) {
        setError(err instanceof ApiError ? err.message : 'Failed to load the outbox');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const recipient = ctx.learners.find((l) => l.id === recipientId);

  const dispatch = async () => {
    if (!recipientId) {
      setError('Choose a guardian to message.');
      return;
    }
    if (!text.trim()) {
      setError('Write a message first.');
      return;
    }
    setSending(true);
    setError('');
    try {
      const res = await api.post<{ message: MessageLog }>('/api/whatsapp', {
        learnerId: recipientId,
        message: text.trim(),
      });
      setMessages((prev) => [res.message, ...prev]);
      ctx.toast(`WhatsApp sent to ${res.message.phone}`);
    } catch (err) {
      if (err instanceof ApiError && err.code === 'NOT_CONFIGURED') {
        setConfigured(false);
      }
      setError(err instanceof ApiError ? err.message : 'Send failed');
    } finally {
      setSending(false);
    }
  };

  const statusTone = (status: string) =>
    status === 'SENT'
      ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
      : status === 'FAILED'
        ? 'bg-rose-500/10 text-rose-300 border-rose-500/30'
        : 'bg-amber-500/10 text-amber-300 border-amber-500/30';

  return (
    <div className="space-y-6 animate-fadeIn">
      <PageHeader
        title="WhatsApp to Guardians"
        sub="Send through your Evolution API WhatsApp instance with an audited outbox"
        icon={<MessageSquare className="w-5 h-5" />}
        actions={
          <Badge tone={configured ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-amber-500/10 text-amber-400 border-amber-500/30'}>
            {configured ? 'Evolution API connected' : 'Not configured'}
          </Badge>
        }
      />

      {error && <ErrorNote message={error} />}

      {!spec.whatsapp ? (
        <Panel title="WhatsApp messaging" icon={<MessageSquare className="w-4 h-4 text-indigo-400" />}>
          <PlanLock feature="WhatsApp messaging" planName={spec.name} onUpgrade={() => ctx.navigate('billing')} />
        </Panel>
      ) : !configured ? (
        <Panel title="Connect your WhatsApp instance" icon={<PlugZap className="w-4 h-4 text-amber-400" />}>
          <div className="space-y-4">
            <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">
              This school's WhatsApp sender runs on your own Evolution API instance. Add these three values under
              <span className="text-slate-200 font-semibold"> Sites → Secrets</span> in Freebuff, then deploy once —
              no keys ever reach the browser.
            </p>
            <div className="grid gap-2 sm:grid-cols-3">
              {REQUIRED_VARS.map((v) => (
                <div key={v} className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5">
                  <span className="text-[10px] uppercase tracking-wider text-slate-500 block">Secret</span>
                  <span className="text-xs font-mono text-indigo-300">{v}</span>
                </div>
              ))}
            </div>
            <ul className="text-[11px] text-slate-500 space-y-1 list-disc pl-5">
              <li><span className="font-mono text-slate-400">EVOLUTION_BASE_URL</span> — where your Evolution API v2 is reachable.</li>
              <li><span className="font-mono text-slate-400">EVOLUTION_API_KEY</span> — the instance API key (sent as the <span className="font-mono">apikey</span> header).</li>
              <li><span className="font-mono text-slate-400">EVOLUTION_INSTANCE</span> — instance name, already connected and showing QR-scanned in Evolution.</li>
            </ul>
            <button className={btnGhost} onClick={() => void load()}>
              <PlugZap className="w-4 h-4" /> Re-check configuration
            </button>
          </div>
        </Panel>
      ) : (
        <Panel
          title="Compose message"
          icon={<Send className="w-4 h-4 text-indigo-400" />}
          right={<span className="text-xs text-slate-400">{text.length} characters</span>}
        >
          <div className="space-y-4">
            <div>
              <label className={labelCls}>Target guardian</label>
              <select className={inputCls} value={recipientId} onChange={(e) => setRecipientId(e.target.value)}>
                <option value="">Choose a learner's guardian…</option>
                {ctx.learners.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name} — {l.guardianPhone || 'no phone on file'}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelCls}>Message text</label>
              <textarea
                rows={4}
                className={inputCls}
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
            </div>

            <button className={btnPrimary} onClick={() => void dispatch()} disabled={sending || !recipientId}>
              <Send className="w-4 h-4" /> {sending ? 'Sending…' : 'Send on WhatsApp'}
            </button>

            {!recipient?.guardianPhone && recipientId && (
              <p className="text-[11px] text-amber-400">This learner has no guardian phone number on file.</p>
            )}
            <p className="text-[11px] text-slate-500">
              Numbers are normalised to international format (E.164 without "+") before the message leaves the
              server. Every attempt — sent or failed — is written to the outbox below.
            </p>
          </div>
        </Panel>
      )}

      <Panel
        title="Outbox log"
        icon={<Inbox className="w-4 h-4 text-indigo-400" />}
        right={<Badge tone="bg-slate-950 text-slate-400 border-slate-800">{messages.length}</Badge>}
      >
        {loading ? (
          <div className="h-32 rounded-2xl animate-shimmer" />
        ) : messages.length === 0 ? (
          <EmptyState
            icon={<Inbox className="w-6 h-6" />}
            title="No messages yet"
            hint="Messages sent to guardians appear here with recipient, status and timestamp."
          />
        ) : (
          <div className="space-y-2">
            {messages.map((m) => (
              <div key={m.id} className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-start text-xs gap-4">
                <div className="min-w-0">
                  <span className="font-semibold text-white">{m.learnerName} ({m.phone})</span>
                  <p className="text-slate-400 text-[11px] mt-0.5">{m.message}</p>
                  {m.status === 'FAILED' && m.error && (
                    <p className="text-[10px] text-rose-400 mt-1 flex items-start gap-1">
                      <ShieldAlert className="w-3 h-3 shrink-0 mt-px" /> {m.error}
                    </p>
                  )}
                </div>
                <span className={`text-[10px] font-mono px-2.5 py-1 rounded-lg border shrink-0 ${statusTone(m.status)}`}>
                  {m.status} · {m.createdAt}
                </span>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}