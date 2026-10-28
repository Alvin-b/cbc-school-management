import React from 'react';
import { createPortal } from 'react-dom';
import { X, Lock, Sparkles } from 'lucide-react';

export const panelCls =
  'bg-slate-900/80 backdrop-blur-md p-6 rounded-3xl border border-slate-800/80 shadow-xl';
export const inputCls =
  'w-full bg-slate-950 border border-slate-800 text-slate-100 p-2.5 rounded-xl text-xs focus:border-indigo-500/70 focus:outline-none transition-all';
export const selectCls = `${inputCls} font-semibold cursor-pointer`;
export const labelCls = 'text-[11px] text-slate-400 font-semibold block mb-1';
export const btnPrimary =
  'bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-4 py-2.5 rounded-2xl text-xs flex items-center gap-2 transition-all shadow-lg shadow-indigo-600/25 disabled:opacity-50 disabled:cursor-not-allowed';
export const btnGhost =
  'bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 font-semibold px-4 py-2.5 rounded-2xl text-xs flex items-center gap-2 transition-all';

export const Panel: React.FC<{
  title?: React.ReactNode;
  icon?: React.ReactNode;
  right?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}> = ({ title, icon, right, children, className = '' }) => (
  <div className={`${panelCls} ${className}`}>
    {(title || right) && (
      <div className="flex justify-between items-center border-b border-slate-800/80 pb-4 mb-4 gap-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
          {icon}
          {title}
        </h3>
        {right}
      </div>
    )}
    {children}
  </div>
);

export const StatCard: React.FC<{
  label: string;
  value: React.ReactNode;
  icon: React.ReactNode;
  accent?: string;
  foot?: React.ReactNode;
}> = ({ label, value, icon, accent = 'text-indigo-400', foot }) => (
  <div className="bg-slate-900/80 backdrop-blur-md p-5 rounded-3xl border border-slate-800/80 space-y-3 shadow-xl">
    <div className="flex justify-between items-center text-slate-400">
      <span className="text-xs font-semibold uppercase tracking-wider">{label}</span>
      <span className={accent}>{icon}</span>
    </div>
    <div className="text-3xl font-bold text-white">{value}</div>
    {foot && <div className="text-[11px] text-slate-400">{foot}</div>}
  </div>
);

export const PageHeader: React.FC<{
  title: string;
  sub?: string;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
}> = ({ title, sub, icon, actions }) => (
  <div className="bg-slate-900/80 backdrop-blur-md p-5 rounded-3xl border border-slate-800/80 flex flex-wrap justify-between items-center gap-4 shadow-xl">
    <div className="flex items-center gap-3">
      <span className="text-indigo-400">{icon}</span>
      <div>
        <h2 className="text-sm font-bold text-white tracking-tight">{title}</h2>
        {sub && <p className="text-xs text-slate-400">{sub}</p>}
      </div>
    </div>
    <div className="flex items-center gap-2 flex-wrap">{actions}</div>
  </div>
);

export const Badge: React.FC<{ children: React.ReactNode; tone?: string }> = ({
  children,
  tone = 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
}) => (
  <span className={`text-[10px] font-semibold border px-2.5 py-0.5 rounded-full uppercase tracking-wider ${tone}`}>
    {children}
  </span>
);

export const Modal: React.FC<{
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}> = ({ open, onClose, title, children }) => {
  if (!open) return null;
  // Portalled to <body>: page wrappers carry `animation: fadeIn … both`, whose
  // retained transform otherwise becomes the containing block for `fixed`,
  // making the dialog scroll up under the sticky header and hide its top fields.
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl animate-fadeIn max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors" aria-label="Close">
            <X className="w-4 h-4" />
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body,
  );
};

export const EmptyState: React.FC<{ icon?: React.ReactNode; title: string; hint?: string }> = ({
  icon,
  title,
  hint,
}) => (
  <div className="text-center py-12 space-y-2">
    <div className="flex justify-center text-slate-600">{icon || <Sparkles className="w-6 h-6" />}</div>
    <p className="text-sm font-semibold text-slate-300">{title}</p>
    {hint && <p className="text-xs text-slate-500">{hint}</p>}
  </div>
);

/** Shown where a paid plan is required — never a dead end: links to Billing. */
export const PlanLock: React.FC<{
  feature: string;
  planName: string;
  onUpgrade: () => void;
}> = ({ feature, planName, onUpgrade }) => (
  <div className="text-center py-12 space-y-3">
    <div className="flex justify-center">
      <div className="bg-amber-500/10 border border-amber-500/30 text-amber-400 p-3 rounded-2xl">
        <Lock className="w-5 h-5" />
      </div>
    </div>
    <p className="text-sm font-semibold text-slate-200">{feature} is not included in {planName}</p>
    <p className="text-xs text-slate-500 max-w-sm mx-auto">
      Upgrade your school's plan to unlock it. Billing integration is stubbed — no card is charged.
    </p>
    <button className={`${btnPrimary} mx-auto`} onClick={onUpgrade}>
      <Sparkles className="w-4 h-4" /> View plans
    </button>
  </div>
);

export const Loading: React.FC<{ label?: string }> = ({ label = 'Loading' }) => (
  <div className="flex items-center gap-3 text-slate-400 text-xs p-6">
    <div className="w-4 h-4 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
    {label}…
  </div>
);

export const ErrorNote: React.FC<{ message: string }> = ({ message }) => (
  <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs p-3 rounded-xl">
    {message}
  </div>
);
