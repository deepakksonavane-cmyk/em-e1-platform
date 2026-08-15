import SubmitButton from "@/components/SubmitButton";

export default function FacultyNoticePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <div className="bg-white rounded-xl shadow-xl p-8 max-w-md text-center">
        <h1 className="text-lg font-semibold text-slate-900 mb-2">
          This is the Student LMS
        </h1>
        <p className="text-sm text-slate-500 mb-6">
          Your account is registered as Faculty. Faculty & administrative
          tools (grading, attendance, session management) live in the
          separate Faculty Admin Panel, not in this Student LMS.
        </p>
        <form action="/api/auth/logout" method="POST">
          <SubmitButton
            pendingText="Signing out…"
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-md px-4 py-2"
          >
            Sign out
          </SubmitButton>
        </form>
      </div>
    </div>
  );
}
