import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Clock, CalendarDays } from "lucide-react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import GuideRenderer from "@/components/learn/GuideRenderer";
import ModuleWorkspace from "@/components/learn/ModuleWorkspace";
import {
  getGuide,
  getAllGuideSlugs,
  getAdjacentGuides,
} from "@/content/guides";
import { getModuleMeta } from "@/content/modules";

export function generateStaticParams() {
  return getAllGuideSlugs().map((slug) => ({ slug }));
}

export function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Metadata {
  const guide = getGuide(params.slug);
  if (!guide) return { title: "Guide not found - CortexSim" };
  return { title: `${guide.title} - CortexSim`, description: guide.summary };
}

export default function GuidePage({ params }: { params: { slug: string } }) {
  const guide = getGuide(params.slug);
  if (!guide) notFound();

  const { prev, next } = getAdjacentGuides(params.slug);
  const meta = getModuleMeta(params.slug);

  return (
    <main className="min-h-screen bg-ink text-white">
      <Navbar />
      <article className="mx-auto max-w-3xl px-6 pb-20 pt-32">
        <Link
          href="/learn"
          className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white"
        >
          <ArrowLeft size={15} />
          All guides
        </Link>

        <div className="mt-5">
          <span className="rounded-md bg-brand/15 px-2.5 py-1 text-xs font-bold text-brand">
            {guide.category}
          </span>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
            {guide.title}
          </h1>
          <p className="mt-3 text-lg leading-8 text-slate-400">{guide.summary}</p>
          <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <Clock size={13} />
              {guide.readingTimeMin} min read
            </span>
            <span className="flex items-center gap-1.5">
              <CalendarDays size={13} />
              Updated {guide.updated}
            </span>
            {meta ? (
              <span className="rounded bg-warn/15 px-1.5 py-0.5 font-semibold text-warn">
                +{meta.xp} XP
              </span>
            ) : null}
          </div>
        </div>

        <hr className="my-8 border-edge/60" />

        <GuideRenderer blocks={guide.blocks} />

        {meta ? (
          <div className="mt-12">
            <ModuleWorkspace meta={meta} title={guide.title} />
          </div>
        ) : null}

        <nav className="mt-12 grid gap-4 sm:grid-cols-2">
          {prev ? (
            <Link
              href={`/learn/${prev.slug}`}
              className="group rounded-xl border border-edge bg-panel/70 p-4 transition-colors hover:border-brand/50"
            >
              <span className="flex items-center gap-1 text-xs text-slate-500">
                <ArrowLeft size={13} /> Previous
              </span>
              <span className="mt-1 block font-semibold text-white">{prev.title}</span>
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link
              href={`/learn/${next.slug}`}
              className="group rounded-xl border border-edge bg-panel/70 p-4 text-right transition-colors hover:border-brand/50"
            >
              <span className="flex items-center justify-end gap-1 text-xs text-slate-500">
                Next <ArrowRight size={13} />
              </span>
              <span className="mt-1 block font-semibold text-white">{next.title}</span>
            </Link>
          ) : (
            <span />
          )}
        </nav>
      </article>
      <Footer />
    </main>
  );
}
