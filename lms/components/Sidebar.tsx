"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import SubmitButton from "./SubmitButton";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: "🏠" },
  { href: "/courses", label: "My Courses", icon: "📚" },
  { href: "/sessions", label: "Sessions", icon: "🗓️" },
  { href: "/assessments", label: "Assessments", icon: "📝" },
  { href: "/weekends", label: "In-Person Weekends", icon: "🏫" },
  { href: "/internship", label: "Internship", icon: "💼" },
  { href: "/messages", label: "Messages", icon: "✉️" },
  { href: "/notifications", label: "Notifications", icon: "🔔" },
  { href: "/profile", label: "Profile", icon: "👤" },
];

export default function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="hidden md:flex md:flex-col w-64 shrink-0 h-screen sticky top-0 bg-slate-900 text-slate-200">
      <div className="px-5 py-5 border-b border-slate-800">
        <p className="text-xs uppercase tracking-wide text-indigo-400 font-semibold">
          Event Management &amp; Team Leadership
        </p>
        <p className="text-lg font-bold text-white">E1 Student LMS</p>
      </div>
      <nav className="flex-1 overflow-y-auto py-4">
        {NAV.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-5 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-indigo-600 text-white"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>
      <form action="/api/auth/logout" method="POST" className="p-4 border-t border-slate-800">
        <SubmitButton
          pendingText="⎋ Signing out…"
          className="w-full text-sm text-slate-300 hover:text-white text-left px-1 py-2"
        >
          ⎋ Sign out
        </SubmitButton>
      </form>
    </aside>
  );
}
