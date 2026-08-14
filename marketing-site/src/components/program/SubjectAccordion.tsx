"use client";

import { useState } from "react";
import clsx from "@/lib/clsx";
import type { Subject } from "@/lib/program";
import { getSessionsForSubject, getLecturerForSubject } from "@/lib/program";

export default function SubjectAccordion({ subjects }: { subjects: Subject[] }) {
  const [openCode, setOpenCode] = useState<string | null>(subjects[0]?.code ?? null);

  return (
    <div className="divide-y divide-navy-100 rounded-xl border border-navy-100 bg-white">
      {subjects.map((subject, index) => {
        const isOpen = openCode === subject.code;
        const sessionList = getSessionsForSubject(subject.code);
        const lecturer = getLecturerForSubject(subject.code);

        return (
          <div key={subject.code}>
            <button
              type="button"
              onClick={() => setOpenCode(isOpen ? null : subject.code)}
              className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
              aria-expanded={isOpen}
            >
              <div>
                <span className="text-xs font-semibold uppercase tracking-wide text-gold-600">
                  {subject.code} · Weeks {subject.weeks}
                </span>
                <h3 className="mt-1 font-display text-lg font-semibold text-navy-900">
                  {index + 1}. {subject.name}
                </h3>
                <p className="mt-1 text-sm text-navy-500">
                  {subject.sessions} sessions · {subject.hours} hours · {lecturer?.name ?? subject.lecturer}
                </p>
              </div>
              <span
                className={clsx(
                  "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-navy-200 text-navy-600 transition-transform",
                  isOpen && "rotate-45 border-gold-400 text-gold-600"
                )}
              >
                +
              </span>
            </button>

            {isOpen && (
              <div className="border-t border-navy-100 bg-navy-50/60 px-6 py-6">
                {lecturer && (
                  <p className="mb-5 text-sm text-navy-600">
                    <span className="font-semibold text-navy-800">{lecturer.name}</span> —{" "}
                    {lecturer.specialization}
                  </p>
                )}
                <ol className="space-y-3">
                  {sessionList.map((session) => (
                    <li
                      key={session.code}
                      className="rounded-lg bg-white p-4 shadow-sm"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-xs font-semibold uppercase tracking-wide text-navy-400">
                          Session {session.sessionNumber} · Week {session.week}, {session.day}
                        </span>
                        <span className="text-xs text-navy-400">{session.hours}h</span>
                      </div>
                      <p className="mt-1.5 font-medium text-navy-900">{session.topic}</p>
                      <p className="mt-1 text-xs text-navy-500">
                        {session.teachingMethod} · Assessment: {session.assessment}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {session.keyTopics.map((topic) => (
                          <span
                            key={topic}
                            className="rounded-full bg-navy-100 px-2.5 py-0.5 text-[11px] font-medium text-navy-600"
                          >
                            {topic}
                          </span>
                        ))}
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
