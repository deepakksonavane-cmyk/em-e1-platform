import { getFacultyContext } from "@/lib/context";
import Sidebar from "@/components/Sidebar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { session, faculty } = await getFacultyContext();

  return (
    <div className="flex min-h-screen">
      <Sidebar name={session.name} role={session.role} specialization={faculty.specialization} />
      <div className="flex-1 min-w-0">
        <header className="md:hidden bg-slate-900 text-white px-4 py-3 flex items-center justify-between">
          <span className="font-semibold">EM&amp;TL E1 Admin</span>
        </header>
        <main className="p-4 md:p-8 max-w-7xl mx-auto w-full">{children}</main>
      </div>
    </div>
  );
}
