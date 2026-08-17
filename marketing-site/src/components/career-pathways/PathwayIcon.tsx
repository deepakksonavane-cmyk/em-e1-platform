export type PathwayIconName =
  | "briefcase"
  | "heart"
  | "building"
  | "megaphone"
  | "handshake"
  | "video"
  | "hotel"
  | "rocket";

const PATHS: Record<PathwayIconName, string> = {
  briefcase:
    "M3 8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8ZM8 6V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v1M3 12h18",
  heart:
    "M12 20.5s-7.5-4.6-9.7-9.2C1 8.1 2.4 4.9 5.7 4.2c2-.4 3.9.5 5 2.1a.6.6 0 0 0 1 0c1.1-1.6 3-2.5 5-2.1 3.3.7 4.7 3.9 3.4 7.1-2.2 4.6-9.7 9.2-9.7 9.2Z",
  building:
    "M4 21V5a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v16M13 21V9a1 1 0 0 1 1-1h5a1 1 0 0 1 1 1v12M4 21h16M7 7h1M7 11h1M7 15h1M16 12h1M16 16h1",
  megaphone:
    "M3 10v4a1 1 0 0 0 1 1h2l3 6 2-1-2.5-5H15l5 3V6l-5 3H6a1 1 0 0 0-1 1v0Z M9 15v3a2 2 0 0 0 4 0v-2",
  handshake:
    "M8 12l3 3 6-6M2 12l4-4h3l3 3M22 12l-4-4h-3l-1 1M9 15l-3 3a2 2 0 1 0 3 3l1-1M15 15l3 3a2 2 0 1 1-3 3l-1-1",
  video:
    "M3 7a1 1 0 0 1 1-1h11a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7ZM16 10l5-3v10l-5-3",
  hotel:
    "M3 21V9a1 1 0 0 1 1-1h4V5a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v3h4a1 1 0 0 1 1 1v12M3 21h18M9 21v-4h6v4M9 8h.01M13 8h.01M9 12h.01M13 12h.01",
  rocket:
    "M12 2c2 2 4 6 4 10 0 1.7-.4 3-1 4l3 3-4-1c-1 .6-2.3 1-4 1s-3-.4-4-1l-4 1 3-3c-.6-1-1-2.3-1-4 0-4 2-8 4-10ZM9 16l-2 4M15 16l2 4",
};

export default function PathwayIcon({ name, className }: { name: PathwayIconName; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d={PATHS[name]} />
    </svg>
  );
}
