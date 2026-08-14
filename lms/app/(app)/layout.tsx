import Sidebar from "@/components/Sidebar";
import { requireStudent } from "@/lib/student";
import { query } from "@/lib/db";
import Link from "next/link";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const student = await requireStudent();

  const unread = await query<{ c: number }>(
    'SELECT COUNT(*)::int AS c FROM "Notification" WHERE "userId" = $1 AND "isRead" = false',
    [student.user.id]
  );
  const unreadCount = unread[0]?.c ?? 0;

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-10 bg-white border-b border-slate-200 px-4 md:px-8 py-3 flex items-center justify-between">
          <div className="md:hidden font-bold text-indigo-700">E1 LMS</div>
          <div className="hidden md:block text-sm text-slate-500">
            {student.studentId} · {student.batch}
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/notifications"
              className="relative text-slate-500 hover:text-indigo-600"
              aria-label="Notifications"
            >
              🔔
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-[10px] leading-none rounded-full w-4 h-4 flex items-center justify-center">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Link>
            <Link href="/profile" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm font-semibold">
                {student.user.name.charAt(0)}
              </div>
              <span className="hidden sm:block text-sm font-medium text-slate-700">
                {student.user.name}
              </span>
            </Link>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-8 max-w-6xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
