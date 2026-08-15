// Date helpers used to project the static seed-data.json curriculum onto a
// realistic, always-current calendar so the app is demoable at any time.

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function mondayOfWeekContaining(d: Date): Date {
  const date = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const day = date.getDay(); // 0 = Sunday
  const diffToMonday = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diffToMonday);
  date.setHours(0, 0, 0, 0);
  return date;
}

// Anchor the program so "today" always falls around week 10 of 24 — enough
// completed history for attendance/grades, and an upcoming mid-point weekend
// (week 12) to demo "next" cards regardless of when this app is run.
const WEEKS_ELAPSED_ANCHOR = 9;
export const PROGRAM_WEEK1_MONDAY = (() => {
  const monday = mondayOfWeekContaining(new Date());
  monday.setDate(monday.getDate() - WEEKS_ELAPSED_ANCHOR * 7);
  return monday;
})();

export function mondayOfWeek(weekNumber: number): Date {
  const d = new Date(PROGRAM_WEEK1_MONDAY);
  d.setDate(d.getDate() + (weekNumber - 1) * 7);
  return d;
}

const WEEKDAY_OFFSET: Record<string, number> = {
  Monday: 0,
  Tuesday: 1,
  Wednesday: 2,
  Thursday: 3,
  Friday: 4,
  Saturday: 5,
  Sunday: 6,
};

export function dateForWeekAndDay(weekNumber: number, dayName: string): Date {
  const monday = mondayOfWeek(weekNumber);
  const offset = WEEKDAY_OFFSET[dayName] ?? 0;
  const d = new Date(monday);
  d.setDate(d.getDate() + offset);
  return d;
}

// Sessions run 6:00pm - 8:00pm IST-style evening slot (typical for a
// blended-learning working-professionals program).
export const SESSION_START_HOUR = 18;
export const SESSION_END_HOUR = 20;

export function sessionDateTime(weekNumber: number, dayName: string) {
  const start = dateForWeekAndDay(weekNumber, dayName);
  start.setHours(SESSION_START_HOUR, 0, 0, 0);
  const end = new Date(start);
  end.setHours(SESSION_END_HOUR, 0, 0, 0);
  return { start, end };
}

export function isPast(d: Date): boolean {
  return d.getTime() < Date.now();
}

export function formatDate(d: Date | string): string {
  const date = typeof d === 'string' ? new Date(d) : d;
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatShortDate(d: Date | string): string {
  const date = typeof d === 'string' ? new Date(d) : d;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function formatTime(d: Date | string): string {
  const date = typeof d === 'string' ? new Date(d) : d;
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

export function formatDateTime(d: Date | string): string {
  return `${formatDate(d)} · ${formatTime(d)}`;
}

export function daysUntil(d: Date | string): number {
  const date = typeof d === 'string' ? new Date(d) : d;
  const diff = date.getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function relativeDayLabel(d: Date | string): string {
  const days = daysUntil(d);
  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  if (days === -1) return 'Yesterday';
  if (days > 1) return `In ${days} days`;
  return `${Math.abs(days)} days ago`;
}

export { DAY_NAMES };
