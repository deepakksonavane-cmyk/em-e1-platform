"use client";

import { useState } from "react";
import clsx from "@/lib/clsx";
import type { FaqItem } from "@/data/faq";

export default function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="divide-y divide-navy-100 rounded-xl border border-navy-100 bg-white">
      {items.map((item, index) => {
        const isOpen = openIndex === index;

        return (
          <div key={item.question}>
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : index)}
              className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
              aria-expanded={isOpen}
            >
              <span className="font-display text-base font-medium text-navy-900 sm:text-lg">
                {item.question}
              </span>
              <span
                className={clsx(
                  "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-navy-200 text-navy-600 transition-transform",
                  isOpen && "rotate-45 border-gold-400 text-gold-500"
                )}
              >
                +
              </span>
            </button>

            {isOpen && (
              <div className="border-t border-navy-100 bg-navy-50/60 px-6 py-5">
                <p className="text-sm leading-relaxed text-navy-600">{item.answer}</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
