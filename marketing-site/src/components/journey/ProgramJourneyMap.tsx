"use client";

import { useMemo, useState } from "react";
import { subjects, weekends } from "@/lib/program";

// The 24-week journey, laid out as points along an S-curve path so the whole
// program reads as one continuous "live" route rather than a static table.
// Positions are derived from real week numbers in program-data.json — the
// path shape is illustrative, the underlying weeks/hours/sessions are not.

const TOTAL_WEEKS = 24;

// x,y as percentages of the SVG viewBox (0-100). A gentle S-curve so nodes
// don't all sit on one flat line — this is what reads as "3D-ish" together
// with the perspective wrapper and layered glow/shadow.
function weekToPoint(week: number) {
  const t = (week - 1) / (TOTAL_WEEKS - 1); // 0..1
  const x = 12 + t * 76;
  const wave = Math.sin(t * Math.PI * 2.1) * 16;
  const y = 50 + wave;
  return { x, y };
}

const WEEKEND_WEEKS = [1, 12, 24];

type HoverTarget =
  | { kind: "subject"; index: number }
  | { kind: "weekend"; index: number }
  | null;

export default function ProgramJourneyMap() {
  const [hover, setHover] = useState<HoverTarget>(null);
  const [progressWeek, setProgressWeek] = useState(1);

  const subjectBands = useMemo(() => {
    // Approximate each subject's week span from its `weeks` string (e.g. "6-9").
    return subjects.map((s) => {
      const [startStr, endStr] = s.weeks.split(",")[0].split("-");
      const start = parseInt(startStr, 10);
      const end = endStr ? parseInt(endStr, 10) : start;
      return { ...s, start, end: Number.isFinite(end) ? end : start };
    });
  }, []);

  const pathD = useMemo(() => {
    const points = Array.from({ length: TOTAL_WEEKS }, (_, i) => weekToPoint(i + 1));
    return points
      .map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`))
      .join(" ");
  }, []);

  const progressPoint = weekToPoint(progressWeek);

  return (
    <div className="rounded-2xl bg-navy-950 p-4 sm:p-8">
      <div
        className="relative overflow-hidden rounded-xl"
        style={{ perspective: "1400px" }}
      >
        <div
          className="relative rounded-xl bg-[radial-gradient(ellipse_at_50%_0%,rgba(41,151,255,0.18),transparent_60%),linear-gradient(180deg,#000_0%,#0a0a0c_100%)] px-4 py-10 sm:px-10"
          style={{
            transform: "rotateX(8deg)",
            transformStyle: "preserve-3d",
          }}
        >
          {/* twinkling particles — represent the 74 live sessions happening across the program */}
          <div className="pointer-events-none absolute inset-0 opacity-70">
            {Array.from({ length: 60 }).map((_, i) => {
              const left = (i * 37) % 100;
              const top = (i * 53) % 100;
              const delay = (i % 12) * 0.35;
              const size = i % 5 === 0 ? 2.5 : 1.5;
              return (
                <span
                  key={i}
                  className="absolute animate-pulse rounded-full bg-gold-300"
                  style={{
                    left: `${left}%`,
                    top: `${top}%`,
                    width: size,
                    height: size,
                    opacity: 0.5,
                    animationDelay: `${delay}s`,
                    animationDuration: "2.6s",
                  }}
                />
              );
            })}
          </div>

          <svg
            viewBox="0 0 100 100"
            className="relative h-[420px] w-full sm:h-[460px]"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#2997ff" stopOpacity="0.9" />
                <stop offset="50%" stopColor="#6ebeff" stopOpacity="0.7" />
                <stop offset="100%" stopColor="#2997ff" stopOpacity="0.9" />
              </linearGradient>
              <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="1.4" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* base path */}
            <path
              d={pathD}
              fill="none"
              stroke="url(#pathGradient)"
              strokeWidth="0.5"
              strokeLinecap="round"
              filter="url(#glow)"
              vectorEffect="non-scaling-stroke"
            />

            {/* subject segment hotspots */}
            {subjectBands.map((s, i) => {
              const mid = (s.start + s.end) / 2;
              const p = weekToPoint(mid);
              const isHover = hover?.kind === "subject" && hover.index === i;
              const isSelected = hover?.kind === "subject" && hover.index === i;
              return (
                <g
                  key={s.code}
                  className="cursor-pointer"
                  onMouseEnter={() => setHover({ kind: "subject", index: i })}
                  onMouseLeave={() => setHover(null)}
                  onClick={() =>
                    setHover(isSelected ? null : { kind: "subject", index: i })
                  }
                >
                  {/* generous invisible hit area — the visible dot is small,
                      this is what actually catches the hover/tap */}
                  <circle cx={p.x} cy={p.y} r={5} fill="transparent" />
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={isHover ? 2.4 : 1.5}
                    fill={isHover ? "#2997ff" : "#a8d4ff"}
                    className="pointer-events-none transition-all"
                  />
                  <text
                    x={p.x}
                    y={p.y - 4}
                    textAnchor="middle"
                    fontSize="2.6"
                    fill="#a1a1a6"
                    className="pointer-events-none select-none"
                  >
                    {s.code}
                  </text>
                </g>
              );
            })}

            {/* weekend landmark nodes — the three in-person immersions */}
            {weekends.map((w, i) => {
              const p = weekToPoint(WEEKEND_WEEKS[i]);
              const isHover = hover?.kind === "weekend" && hover.index === i;
              const isSelected = hover?.kind === "weekend" && hover.index === i;
              return (
                <g
                  key={w.code}
                  className="cursor-pointer"
                  onMouseEnter={() => setHover({ kind: "weekend", index: i })}
                  onMouseLeave={() => setHover(null)}
                  onClick={() =>
                    setHover(isSelected ? null : { kind: "weekend", index: i })
                  }
                >
                  {/* generous invisible hit area — the visible dot is small,
                      this is what actually catches the hover/tap */}
                  <circle cx={p.x} cy={p.y} r={7} fill="transparent" />
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={isHover ? 5.5 : 4.2}
                    fill="none"
                    stroke="#e8ac33"
                    strokeWidth="0.35"
                    opacity="0.55"
                    className="pointer-events-none transition-all"
                  />
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={isHover ? 3 : 2.4}
                    fill="#ffd479"
                    filter="url(#glow)"
                    className="pointer-events-none transition-all"
                  />
                  <text
                    x={p.x}
                    y={p.y + 8}
                    textAnchor="middle"
                    fontSize="2.9"
                    fontWeight={600}
                    fill="#ffd479"
                    className="pointer-events-none select-none"
                  >
                    Weekend {i + 1}
                  </text>
                </g>
              );
            })}

            {/* progress marker */}
            <circle
              cx={progressPoint.x}
              cy={progressPoint.y}
              r="1.8"
              fill="#ffffff"
              stroke="#2997ff"
              strokeWidth="0.6"
              filter="url(#glow)"
            />
          </svg>

          {/* hover card — glassmorphism */}
          {hover && (
            <div className="pointer-events-none absolute left-1/2 top-4 w-72 -translate-x-1/2 rounded-xl border border-white/15 bg-white/10 p-5 text-white shadow-2xl backdrop-blur-xl sm:left-auto sm:right-6 sm:translate-x-0">
              {hover.kind === "subject" &&
                (() => {
                  const s = subjectBands[hover.index];
                  return (
                    <>
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-gold-300">
                        {s.code} · Weeks {s.weeks}
                      </p>
                      <p className="mt-1 font-display text-base font-semibold">{s.name}</p>
                      <p className="mt-2 text-sm text-white/70">
                        {s.sessions} sessions · {s.hours} hours · {s.lecturer}
                      </p>
                    </>
                  );
                })()}
              {hover.kind === "weekend" &&
                (() => {
                  const w = weekends[hover.index];
                  return (
                    <>
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-gold-300">
                        {w.name} · Week {w.week} · {w.totalHours} hours
                      </p>
                      <p className="mt-1 font-display text-base font-semibold">{w.focus}</p>
                      <ul className="mt-2 space-y-1 text-sm text-white/70">
                        {w.activities.slice(0, 4).map((a) => (
                          <li key={a}>· {a}</li>
                        ))}
                      </ul>
                    </>
                  );
                })()}
            </div>
          )}
        </div>
      </div>

      {/* progress control */}
      <div className="mt-6 flex items-center gap-4 px-2">
        <span className="text-xs font-medium uppercase tracking-wide text-navy-300">
          Week {progressWeek}
        </span>
        <input
          type="range"
          min={1}
          max={TOTAL_WEEKS}
          value={progressWeek}
          onChange={(e) => setProgressWeek(Number(e.target.value))}
          className="h-1.5 w-full flex-1 cursor-pointer appearance-none rounded-full bg-navy-700 accent-gold-400"
        />
        <span className="text-xs font-medium uppercase tracking-wide text-navy-300">
          Week 24
        </span>
      </div>
      <p className="mt-3 text-center text-xs text-navy-400">
        Drag the slider to see where a student is in the 24-week journey.
        Hover or tap any node for details.
      </p>
    </div>
  );
}
