import { requireStudent } from "@/lib/student";
import { query, queryOne } from "@/lib/db";
import { Card } from "@/components/Card";
import type { Weekend, WeekendAttendance } from "@/lib/types";
import { format } from "date-fns";

const DAY_HOURS: Record<string, { day: string; hours: number }[]> = {
  W1: [
    { day: "Friday", hours: 8 },
    { day: "Saturday", hours: 8 },
    { day: "Sunday", hours: 5 },
  ],
  W2: [
    { day: "Friday", hours: 6 },
    { day: "Saturday", hours: 8 },
    { day: "Sunday", hours: 5 },
  ],
  W3: [
    { day: "Friday", hours: 6 },
    { day: "Saturday", hours: 8 },
    { day: "Sunday", hours: 6 },
  ],
};

export default async function WeekendsPage() {
  const student = await requireStudent();

  const weekends = await query<Weekend>('SELECT * FROM "Weekend" ORDER BY week ASC');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">In-Person Weekends</h1>
        <p className="text-slate-500 text-sm mt-1">
          3 mandatory in-person weekends: Week 1 (Start), Week 12 (Mid-Term), Week 24 (Final / Graduation).
        </p>
      </div>

      <div className="space-y-8">
        {weekends.map((w) => (
          <WeekendCard key={w.id} weekend={w} studentId={student.id} />
        ))}
      </div>
    </div>
  );
}

async function WeekendCard({ weekend: w, studentId }: { weekend: Weekend; studentId: string }) {
  const attendance = await queryOne<WeekendAttendance>(
    'SELECT * FROM "WeekendAttendance" WHERE "weekendId" = $1 AND "studentId" = $2',
    [w.id, studentId]
  );
  const schedule = DAY_HOURS[w.code] ?? [];

  return (
    <Card>
              <div className="flex items-start justify-between flex-wrap gap-3 mb-4">
                <div>
                  <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wide">
                    {w.code} · Week {w.week}
                  </p>
                  <h2 className="text-xl font-bold text-slate-900 mt-0.5">{w.name}</h2>
                  <p className="text-sm text-slate-500 mt-1">{w.focus}</p>
                </div>
                <div className="text-right text-sm text-slate-500">
                  {w.startDate && w.endDate && (
                    <p>
                      {format(new Date(w.startDate), "MMM d")} – {format(new Date(w.endDate), "MMM d, yyyy")}
                    </p>
                  )}
                  <p className="font-semibold text-slate-700">{w.totalHours} total hours</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-700 mb-2">Schedule</h3>
                    <ul className="text-sm text-slate-600 space-y-1">
                      {schedule.map((s) => (
                        <li key={s.day} className="flex justify-between border-b border-slate-100 py-1">
                          <span>{s.day}</span>
                          <span className="font-medium">{s.hours} hrs</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-slate-700 mb-2">Activities</h3>
                    <ul className="flex flex-wrap gap-2">
                      {w.activities.map((a) => (
                        <li
                          key={a}
                          className="bg-indigo-50 text-indigo-700 text-xs font-medium px-3 py-1.5 rounded-full"
                        >
                          {a}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-slate-700 mb-2">Travel & Accommodation</h3>
                    <p className="text-sm text-slate-600 bg-slate-50 rounded-md p-3">
                      Students traveling from outside the city are advised to arrive the evening before
                      Day 1. A list of partner-rate accommodation options near the venue is shared via
                      the orientation kit and email 2 weeks prior. Meals are provided on all 3 days;
                      please inform faculty in advance of any dietary requirements. Local transport
                      (cabs/metro) is the most convenient way to reach the venue — see the map below.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-slate-700 mb-2">Your Attendance</h3>
                    {attendance ? (
                      <div className="flex gap-2">
                        <AttendancePill label="Fri" present={attendance.fridayPresent} />
                        <AttendancePill label="Sat" present={attendance.saturdayPresent} />
                        <AttendancePill label="Sun" present={attendance.sundayPresent} />
                      </div>
                    ) : (
                      <p className="text-sm text-slate-400">
                        Attendance not yet recorded by faculty for this weekend.
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-slate-700 mb-2">Venue</h3>
                  <p className="text-sm text-slate-600 mb-2">{w.venueName}</p>
                  <p className="text-xs text-slate-400 mb-3">{w.venueAddress}</p>
                  {w.venueMapUrl && (
                    <div className="rounded-lg overflow-hidden border border-slate-200 aspect-video">
                      <iframe
                        src={w.venueMapUrl}
                        className="w-full h-full"
                        loading="lazy"
                        title={`Map — ${w.venueName}`}
                      />
                    </div>
                  )}
                </div>
              </div>
    </Card>
  );
}

function AttendancePill({ label, present }: { label: string; present: boolean }) {
  return (
    <span
      className={`text-xs font-medium px-3 py-1.5 rounded-full ${
        present ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
      }`}
    >
      {label}: {present ? "Present" : "Absent"}
    </span>
  );
}
