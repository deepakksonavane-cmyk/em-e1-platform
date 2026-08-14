import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Container from "@/components/ui/Container";
import { blogPosts, getPostBySlug } from "@/data/blog-posts";

export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const post = getPostBySlug(params.slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
    },
  };
}

function renderParagraph(text: string, key: number) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <p key={key} className="text-base leading-relaxed text-navy-700">
      {parts.map((part, i) =>
        part.startsWith("**") && part.endsWith("**") ? (
          <strong key={i} className="font-semibold text-navy-900">
            {part.slice(2, -2)}
          </strong>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </p>
  );
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = getPostBySlug(params.slug);
  if (!post) notFound();

  return (
    <>
      <section className="bg-navy-gradient py-14 text-white md:py-16">
        <Container className="max-w-3xl">
          <Link href="/blog" className="text-sm font-medium text-gold-300 hover:text-gold-200">
            ← Back to Blog
          </Link>
          <div className="mt-4 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span key={tag} className="rounded-full bg-white/10 px-2.5 py-0.5 text-[11px] font-medium text-white/80">
                {tag}
              </span>
            ))}
          </div>
          <h1 className="mt-4 font-display text-3xl font-bold sm:text-4xl">{post.title}</h1>
          <p className="mt-4 text-sm text-white/60">
            {new Date(post.date).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}
            {" · "}
            {post.author} · {post.readTime}
          </p>
        </Container>
      </section>

      <section className="section bg-white">
        <Container className="max-w-3xl space-y-6">
          {post.content.map((para, i) => renderParagraph(para, i))}

          <div className="mt-12 rounded-xl bg-navy-50 p-6">
            <p className="text-sm text-navy-600">
              Interested in building these skills yourself?
            </p>
            <Link href="/apply" className="mt-3 inline-block rounded-md bg-navy-900 px-6 py-3 text-sm font-semibold text-white hover:bg-navy-700">
              Apply to Event Management &amp; Team Leadership E1
            </Link>
          </div>
        </Container>
      </section>
    </>
  );
}
