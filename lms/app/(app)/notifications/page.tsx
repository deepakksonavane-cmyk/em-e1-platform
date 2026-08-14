import { requireStudent } from "@/lib/student";
import { query } from "@/lib/db";
import { Card } from "@/components/Card";
import { markNotificationReadAction, markAllNotificationsReadAction } from "@/lib/actions";
import type { Notification } from "@/lib/types";
import { format } from "date-fns";
import Link from "next/link";

const ICON: Record<string, string> = {
  SESSION_REMINDER: "🗓️",
  DEADLINE_REMINDER: "⏰",
  GRADE_POSTED: "✅",
  ANNOUNCEMENT: "📣",
  ATTENDANCE: "🧾",
  GENERAL: "🔔",
};

export default async function NotificationsPage() {
  const student = await requireStudent();
  const notifications = await query<Notification>(
    'SELECT * FROM "Notification" WHERE "userId" = $1 ORDER BY "createdAt" DESC',
    [student.user.id]
  );

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
          <p className="text-slate-500 text-sm mt-1">Program announcements, reminders, and grade updates.</p>
        </div>
        <form action={markAllNotificationsReadAction}>
          <button className="text-sm text-indigo-600 hover:underline">Mark all as read</button>
        </form>
      </div>

      <Card className="!p-0 divide-y divide-slate-100">
        {notifications.length === 0 ? (
          <p className="text-sm text-slate-400 p-5">No notifications yet.</p>
        ) : (
          notifications.map((n) => (
            <div key={n.id} className={`p-4 flex gap-3 ${n.isRead ? "" : "bg-indigo-50/40"}`}>
              <div className="text-xl">{ICON[n.type] ?? "🔔"}</div>
              <div className="flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium text-slate-800">{n.title}</p>
                  <p className="text-xs text-slate-400 whitespace-nowrap">
                    {format(new Date(n.createdAt), "MMM d, h:mm a")}
                  </p>
                </div>
                <p className="text-sm text-slate-500 mt-0.5">{n.body}</p>
                <div className="flex items-center gap-3 mt-2">
                  {n.link && (
                    <Link href={n.link} className="text-xs text-indigo-600 hover:underline">
                      View
                    </Link>
                  )}
                  {!n.isRead && (
                    <form action={markNotificationReadAction}>
                      <input type="hidden" name="id" value={n.id} />
                      <button className="text-xs text-slate-400 hover:text-slate-600">Mark read</button>
                    </form>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </Card>
    </div>
  );
}
