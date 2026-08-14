import Link from "next/link";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; email?: string; next?: string }>;
}) {
  const params = await searchParams;
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <p className="text-indigo-400 text-xs font-semibold uppercase tracking-wide">
            Event Management &amp; Team Leadership
          </p>
          <h1 className="text-2xl font-bold text-white mt-1">E1 Student LMS</h1>
        </div>
        <div className="bg-white rounded-xl shadow-xl p-8">
          <h2 className="text-lg font-semibold text-slate-900 mb-1">Sign in</h2>
          <p className="text-sm text-slate-500 mb-6">
            Welcome back. Enter your credentials to continue.
          </p>

          {params.error && (
            <div className="mb-4 rounded-md bg-rose-50 border border-rose-200 text-rose-700 text-sm px-3 py-2">
              {params.error}
            </div>
          )}

          <form action="/api/auth/login" method="POST" className="space-y-4">
            <input type="hidden" name="next" value={params.next || "/dashboard"} />
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                required
                defaultValue={params.email}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="you@student.em-e1.edu"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Password
              </label>
              <input
                type="password"
                name="password"
                required
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-md py-2.5 text-sm transition-colors"
            >
              Sign in
            </button>
          </form>

          <p className="text-sm text-slate-500 mt-6 text-center">
            New student?{" "}
            <Link href="/register" className="text-indigo-600 font-medium hover:underline">
              Register here
            </Link>
          </p>

          <div className="mt-6 border-t border-slate-100 pt-4 text-xs text-slate-400">
            <p className="font-medium text-slate-500 mb-1">Demo credentials</p>
            <p>Student: aarav.sharma@student.em-e1.edu / Student@123</p>
            <p>Faculty: lecturer1@em-e1.edu / Faculty@123</p>
          </div>
        </div>
      </div>
    </div>
  );
}
