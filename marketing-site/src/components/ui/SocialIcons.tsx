import clsx from "@/lib/clsx";

// Real, hand-authored icon components (no external icon dependency).
// URLs below are placeholders — swap for the institute's real social
// profiles before launch.
export const SOCIAL_LINKS = [
  { name: "Instagram", href: "https://instagram.com/eventmanagement.e1", icon: "instagram" },
  { name: "LinkedIn", href: "https://linkedin.com/company/eventmanagement-e1", icon: "linkedin" },
  { name: "Facebook", href: "https://facebook.com/eventmanagement.e1", icon: "facebook" },
  { name: "YouTube", href: "https://youtube.com/@eventmanagement-e1", icon: "youtube" },
] as const;

type IconName = (typeof SOCIAL_LINKS)[number]["icon"];

function IconGlyph({ name, className }: { name: IconName; className?: string }) {
  const common = { className, fill: "currentColor", viewBox: "0 0 24 24" } as const;
  switch (name) {
    case "instagram":
      return (
        <svg {...common} xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2.2c3.2 0 3.6 0 4.85.07 1.17.05 1.97.24 2.43.4a4.9 4.9 0 0 1 1.77 1.15 4.9 4.9 0 0 1 1.15 1.77c.16.46.35 1.26.4 2.43.06 1.25.07 1.65.07 4.85s0 3.6-.07 4.85c-.05 1.17-.24 1.97-.4 2.43a4.9 4.9 0 0 1-1.15 1.77 4.9 4.9 0 0 1-1.77 1.15c-.46.16-1.26.35-2.43.4-1.25.06-1.65.07-4.85.07s-3.6 0-4.85-.07c-1.17-.05-1.97-.24-2.43-.4a4.9 4.9 0 0 1-1.77-1.15 4.9 4.9 0 0 1-1.15-1.77c-.16-.46-.35-1.26-.4-2.43C2.2 15.6 2.2 15.2 2.2 12s0-3.6.07-4.85c.05-1.17.24-1.97.4-2.43A4.9 4.9 0 0 1 3.82 3c.5-.5 1.06-.9 1.77-1.15.46-.16 1.26-.35 2.43-.4C9.27 1.4 9.4 2.2 12 2.2zm0 1.8c-3.14 0-3.5 0-4.74.07-.96.04-1.48.2-1.83.34-.46.18-.79.4-1.13.75a3.1 3.1 0 0 0-.75 1.13c-.14.35-.3.87-.34 1.83C3.14 8.5 3.14 8.86 3.14 12s0 3.5.07 4.74c.04.96.2 1.48.34 1.83.18.46.4.79.75 1.13.34.34.67.57 1.13.75.35.14.87.3 1.83.34 1.24.06 1.6.07 4.74.07s3.5 0 4.74-.07c.96-.04 1.48-.2 1.83-.34.46-.18.79-.4 1.13-.75.34-.34.57-.67.75-1.13.14-.35.3-.87.34-1.83.06-1.24.07-1.6.07-4.74s0-3.5-.07-4.74c-.04-.96-.2-1.48-.34-1.83a3.03 3.03 0 0 0-.75-1.13 3.1 3.1 0 0 0-1.13-.75c-.35-.14-.87-.3-1.83-.34C15.5 4 15.14 4 12 4zm0 3.4A4.6 4.6 0 1 1 7.4 12 4.6 4.6 0 0 1 12 7.4zm0 1.8a2.8 2.8 0 1 0 2.8 2.8A2.8 2.8 0 0 0 12 9.2zm4.8-2.05a1.08 1.08 0 1 1-1.08-1.08 1.08 1.08 0 0 1 1.08 1.08z" />
        </svg>
      );
    case "linkedin":
      return (
        <svg {...common} xmlns="http://www.w3.org/2000/svg">
          <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9h4v12H3zM9 9h3.8v1.7h.06c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.77 2.65 4.77 6.1V21h-4v-5.6c0-1.34-.02-3.06-1.87-3.06-1.87 0-2.16 1.46-2.16 2.96V21H9z" />
        </svg>
      );
    case "facebook":
      return (
        <svg {...common} xmlns="http://www.w3.org/2000/svg">
          <path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.77-3.89 1.1 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0 0 22 12z" />
        </svg>
      );
    case "youtube":
      return (
        <svg {...common} xmlns="http://www.w3.org/2000/svg">
          <path d="M23.5 6.19a3.02 3.02 0 0 0-2.12-2.14C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.38.55A3.02 3.02 0 0 0 .5 6.19 31.6 31.6 0 0 0 0 12a31.6 31.6 0 0 0 .5 5.81 3.02 3.02 0 0 0 2.12 2.14C4.5 20.5 12 20.5 12 20.5s7.5 0 9.38-.55a3.02 3.02 0 0 0 2.12-2.14A31.6 31.6 0 0 0 24 12a31.6 31.6 0 0 0-.5-5.81zM9.6 15.6V8.4l6.4 3.6z" />
        </svg>
      );
  }
}

export default function SocialIcons({
  className,
  iconClassName,
}: {
  className?: string;
  iconClassName?: string;
}) {
  return (
    <div className={clsx("flex items-center gap-3", className)}>
      {SOCIAL_LINKS.map((link) => (
        <a
          key={link.name}
          href={link.href}
          target="_blank"
          rel="noreferrer noopener"
          aria-label={link.name}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-gold-400 hover:text-navy-900"
        >
          <IconGlyph name={link.icon} className={clsx("h-4 w-4", iconClassName)} />
        </a>
      ))}
    </div>
  );
}
