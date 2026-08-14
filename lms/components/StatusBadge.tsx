const STYLES: Record<string, string> = {
  PRESENT: "bg-emerald-100 text-emerald-700",
  ABSENT: "bg-rose-100 text-rose-700",
  LATE: "bg-amber-100 text-amber-700",
  EXCUSED: "bg-slate-100 text-slate-600",
  NOT_SUBMITTED: "bg-slate-100 text-slate-600",
  SUBMITTED: "bg-blue-100 text-blue-700",
  GRADED: "bg-emerald-100 text-emerald-700",
  RETURNED: "bg-amber-100 text-amber-700",
  upcoming: "bg-slate-100 text-slate-600",
  live: "bg-rose-100 text-rose-700",
  completed: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-slate-200 text-slate-500",
  not_started: "bg-slate-100 text-slate-600",
  in_progress: "bg-blue-100 text-blue-700",
  submitted: "bg-amber-100 text-amber-700",
  evaluated: "bg-emerald-100 text-emerald-700",
};

export default function StatusBadge({ status }: { status: string }) {
  const cls = STYLES[status] ?? "bg-slate-100 text-slate-600";
  return (
    <span
      className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium capitalize ${cls}`}
    >
      {status.replace(/_/g, " ").toLowerCase()}
    </span>
  );
}
