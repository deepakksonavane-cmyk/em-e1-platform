import type { Metadata } from "next";
import Link from "next/link";
import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import { blogPosts } from "@/data/blog-posts";

export const metadata: Metadata = {
  title: "Blog & News",
  description:
    "Insights on event leadership, budgeting, hybrid production, and building an event management career — from the E1 faculty team.",
};

export default function BlogIndexPage() {
  return (
    <>
      <section className="bg-navy-gradient py-14 text-white md:py-16">
        <Container>
          <p className="text-sm font-semibold uppercase tracking-widest text-gold-300">
            Insights
          </p>
          <h1 className="mt-3 font-display text-4xl font-bold sm:text-5xl">Blog &amp; News</h1>
          <p className="mt-4 max-w-2xl text-white/80">
            Practical articles on event leadership, budgeting, digital
            production, and building a career or business in events —
            grounded in the E1 curriculum.
          </p>
        </Container>
      </section>

      <section className="section bg-white">
        <Container>
          <SectionHeading eyebrow="Latest Articles" title="From the E1 faculty team" />
          <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2">
            {blogPosts.map((post) => (
              <article key={post.slug} className="flex flex-col rounded-xl border border-navy-100 p-7 shadow-card">
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <span key={tag} className="rounded-full bg-navy-100 px-2.5 py-0.5 text-[11px] font-medium text-navy-600">
                      {tag}
                    </span>
                  ))}
                </div>
                <h2 className="mt-4 font-display text-xl font-semibold text-navy-900">
                  <Link href={`/blog/${post.slug}`} className="hover:text-gold-600">
                    {post.title}
                  </Link>
                </h2>
                <p className="mt-3 flex-1 text-sm text-navy-600">{post.excerpt}</p>
                <div className="mt-5 flex items-center justify-between text-xs text-navy-400">
                  <span>{new Date(post.date).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}</span>
                  <span>{post.readTime}</span>
                </div>
                <Link href={`/blog/${post.slug}`} className="mt-4 text-sm font-semibold text-gold-600 hover:text-gold-700">
                  Read article →
                </Link>
              </article>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
