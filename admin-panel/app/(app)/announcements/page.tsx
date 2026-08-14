import { getFacultyContext } from "@/lib/context";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import AnnouncementForm from "./AnnouncementForm";

export const dynamic = "force-dynamic";

export default async function AnnouncementsPage() {
  await getFacultyContext();

  const batches = await prisma.student.findMany({ distinct: ["batch"], select: { batch: true } });

  const announcements = await prisma.notification.findMany({
    where: { type: "ANNOUNCEMENT" },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  // Group by title+createdAt minute to approximate a single broadcast "send".
  const grouped = new Map<string, { title: string; body: string; createdAt: Date; recipients: number }>();
  for (const n of announcements) {
    const key = `${n.title}__${n.body}__${Math.floor(n.createdAt.getTime() / 60000)}`;
    const existing = grouped.get(key);
    if (existing) {
      existing.recipients += 1;
    } else {
      grouped.set(key, { title: n.title, body: n.body, createdAt: n.createdAt, recipients: 1 });
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Announcements</h1>
        <p className="text-slate-500 mt-1">Broadcast a message to all (or one batch of) active students</p>
      </div>

      <AnnouncementForm batches={batches.map((b) => b.batch)} />

      <div className="card">
        <h2 className="font-semibold text-slate-900 mb-4">Broadcast History</h2>
        {grouped.size === 0 ? (
          <p className="text-sm text-slate-500">No announcements sent yet.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {Array.from(grouped.values()).map((a, i) => (
              <li key={i} className="py-3">
                <div className="flex justify-between items-baseline flex-wrap gap-2">
                  <p className="text-sm font-medium text-slate-800">{a.title}</p>
                  <p className="text-xs text-slate-400">
                    {format(a.createdAt, "dd MMM yyyy, HH:mm")} · {a.recipients} recipients
                  </p>
                </div>
                <p className="text-sm text-slate-500 mt-0.5">{a.body}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
