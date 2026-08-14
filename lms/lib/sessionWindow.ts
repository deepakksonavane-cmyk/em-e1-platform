import type { Session } from "./types";

export function getSessionWindow(session: Session): { start: Date; end: Date } | null {
  if (!session.scheduledDate) return null;
  const base = new Date(session.scheduledDate);
  const [sh, sm] = (session.startTime || "00:00").split(":").map(Number);
  const [eh, em] = (session.endTime || "23:59").split(":").map(Number);
  const start = new Date(base);
  start.setHours(sh, sm, 0, 0);
  const end = new Date(base);
  end.setHours(eh, em, 0, 0);
  return { start, end };
}

export type LiveState = "live" | "upcoming" | "past";

export function getLiveState(session: Session): {
  state: LiveState;
  window: { start: Date; end: Date } | null;
} {
  const window = getSessionWindow(session);
  if (!window) return { state: "upcoming", window: null };
  const now = new Date();
  if (now >= window.start && now <= window.end) return { state: "live", window };
  if (now < window.start) return { state: "upcoming", window };
  return { state: "past", window };
}

export function formatCountdown(target: Date): string {
  const diffMs = target.getTime() - Date.now();
  if (diffMs <= 0) return "starting now";
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
  const mins = Math.floor((diffMs / (1000 * 60)) % 60);
  if (days > 0) return `in ${days}d ${hours}h`;
  if (hours > 0) return `in ${hours}h ${mins}m`;
  return `in ${mins}m`;
}
