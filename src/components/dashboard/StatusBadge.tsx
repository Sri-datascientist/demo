const STATUS_STYLES: Record<string, string> = {
  submitted: 'bg-amber-50 text-amber-800 ring-amber-200/60',
  processing: 'bg-sky-50 text-sky-800 ring-sky-200/60',
  completed: 'bg-emerald-50 text-emerald-800 ring-emerald-200/60',
  open: 'bg-rose-50 text-rose-800 ring-rose-200/60',
  in_progress: 'bg-sky-50 text-sky-800 ring-sky-200/60',
  resolved: 'bg-emerald-50 text-emerald-800 ring-emerald-200/60',
  closed: 'bg-slate-100 text-slate-600 ring-slate-200/60',
  pending: 'bg-amber-50 text-amber-800 ring-amber-200/60',
  confirmed: 'bg-sky-50 text-sky-800 ring-sky-200/60',
  shipped: 'bg-indigo-50 text-indigo-800 ring-indigo-200/60',
  delivered: 'bg-emerald-50 text-emerald-800 ring-emerald-200/60',
  cancelled: 'bg-slate-100 text-slate-600 ring-slate-200/60',
  verified: 'bg-emerald-50 text-emerald-800 ring-emerald-200/60',
  rejected: 'bg-rose-50 text-rose-800 ring-rose-200/60',
  approved: 'bg-emerald-50 text-emerald-800 ring-emerald-200/60',
  draft: 'bg-slate-100 text-slate-600 ring-slate-200/60',
  quality_check: 'bg-violet-50 text-violet-800 ring-violet-200/60',
};

export function StatusBadge({ status }: { status: string }) {
  const normalized = status.toLowerCase().replace(/\s+/g, '_');
  const style = STATUS_STYLES[normalized] ?? 'bg-slate-100 text-slate-700 ring-slate-200/60';

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ring-1 ring-inset ${style}`}
    >
      {status.replace(/_/g, ' ')}
    </span>
  );
}
