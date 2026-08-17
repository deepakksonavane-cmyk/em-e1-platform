import clsx from "@/lib/clsx";

export default function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  light = false,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  light?: boolean;
}) {
  return (
    <div className={clsx("max-w-3xl", align === "center" && "mx-auto text-center")}>
      {eyebrow && (
        <p
          className={clsx(
            "text-sm font-semibold uppercase tracking-wide",
            light ? "text-gold-300" : "text-gold-500"
          )}
        >
          {eyebrow}
        </p>
      )}
      <h2
        className={clsx(
          "mt-3 font-display text-4xl font-semibold tracking-tightest sm:text-5xl",
          light ? "text-white" : "text-navy-900"
        )}
      >
        {title}
      </h2>
      {description && (
        <p className={clsx("mt-5 text-lg leading-relaxed", light ? "text-white/70" : "text-navy-500")}>
          {description}
        </p>
      )}
    </div>
  );
}
