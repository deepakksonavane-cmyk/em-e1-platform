"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: "🏠" },
  { href: "/sessions", label: "Sessions", icon: "📅" },
  { href: "/assessments", label: "Assessments", icon: "📝" },
  { href: "/students", label: "Students", icon: "🎓" },
  { href: "/reports/attendance", label: "Reports", icon: "📊" },
  { href: "/messages", label: "Messages", icon: "✉️" },
  { href: "/announcements", label: "Announcements", icon: "📢" },
];

export default function Sidebar({
  name,
  role,
  specialization,
}: {
  name: string;
  role: string;
  specialization?: string | null;
}) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="hidden md:flex md:flex-col w-64 shrink-0 bg-slate-900 text-slate-200 h-screen sticky top-0">
      <div className="px-5 py-5 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-lg bg-brand-500 flex items-center justify-center font-bold text-white text-sm">
            E1
          </div>
          <div>
            <p className="text-sm font-semibold text-white leading-tight">EM&amp;TL E1</p>
            <p className="text-xs text-slate-400 leading-tight">Faculty Admin</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {NAV.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-brand-600 text-white"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-800 p-4">
        <div className="mb-3">
          <p className="text-sm font-medium text-white truncate">{name}</p>
          <p className="text-xs text-slate-400 truncate">
            {role === "ADMIN" ? "Program Admin" : specialization || "Faculty"}
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="w-full text-left text-sm text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg px-3 py-2 transition-colors"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
