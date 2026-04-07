import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { evaluate } from '@mdx-js/mdx';
import * as runtime from 'react/jsx-runtime';
import { getAllTutorials, getTutorialBySlug } from '@/lib/tutorials';
import {
  buildTutorialTree,
  findNodePath,
  getFirstLeafSlug,
  getLeafSlugsInTreeOrder,
} from '@/lib/tutorial-tree';

type TutorialPageProps = {
  params: Promise<{ slug: string[] }>;
};

export async function generateStaticParams() {
  const tutorials = await getAllTutorials();
  return tutorials.map((item) => ({ slug: item.slugParts }));
}

export default async function TutorialPage({ params }: TutorialPageProps) {
  const { slug } = await params;

  try {
    const tutorials = await getAllTutorials();
    const tutorialTree = buildTutorialTree(tutorials);
    const tutorial = await getTutorialBySlug(slug);
    const tutorialPath = findNodePath(tutorialTree, tutorial.slug);
    const currentNode = tutorialPath[tutorialPath.length - 1];

    if (currentNode && currentNode.children.length > 0) {
      redirect(`/tutoriale-pa4x/${getFirstLeafSlug(currentNode)}`);
    }

    const tutorialBySlug = new Map(tutorials.map((item) => [item.slug, item]));
    const navigationSlugs = getLeafSlugsInTreeOrder(tutorialTree);
    const currentSlug = tutorial.slug;
    const currentIndex = navigationSlugs.findIndex(
      (itemSlug) => itemSlug === currentSlug,
    );

    const previousSlug =
      currentIndex > 0 ? navigationSlugs[currentIndex - 1] : undefined;
    const nextSlug =
      currentIndex >= 0 && currentIndex < navigationSlugs.length - 1
        ? navigationSlugs[currentIndex + 1]
        : undefined;

    const previousTutorial = previousSlug
      ? tutorialBySlug.get(previousSlug)
      : undefined;
    const nextTutorial = nextSlug ? tutorialBySlug.get(nextSlug) : undefined;
    const { default: TutorialContent } = await evaluate(tutorial.content, {
      ...runtime,
    });

    return (
      <article className="rounded-xl border border-slate-200 bg-white p-6 text-slate-900 shadow-sm">
        <header className="mb-6 border-b border-slate-200 pb-4">
          <h1 className="text-3xl font-bold text-slate-950">
            {tutorial.meta.title}
          </h1>
          {tutorial.meta.description ? (
            <p className="mt-2 text-base leading-relaxed text-slate-700 md:text-lg">
              {tutorial.meta.description}
            </p>
          ) : null}
          <div className="mt-3 flex flex-wrap gap-2 text-sm text-slate-500">
            <span>{tutorial.meta.category}</span>
            {tutorial.meta.level ? <span>• {tutorial.meta.level}</span> : null}
            {tutorial.meta.estimatedTime ? (
              <span>• {tutorial.meta.estimatedTime}</span>
            ) : null}
          </div>
        </header>

        <div className="space-y-4 [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:text-slate-950 [&_h2]:mt-6 [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:text-orange-700 [&_h3]:mt-4 [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-slate-900 [&_p]:text-[17px] [&_p]:leading-relaxed md:[&_p]:text-lg [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:py-0.5 [&_li]:text-[17px] [&_li]:leading-relaxed [&_li]:text-slate-800 md:[&_li]:text-lg">
          <TutorialContent />
        </div>

        <nav className="mt-8 grid gap-3 border-t border-slate-200 pt-5 sm:grid-cols-2">
          {previousTutorial ? (
            <Link
              href={`/tutoriale-pa4x/${previousTutorial.slug}`}
              className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 transition-colors hover:border-orange-300 hover:bg-orange-50 hover:text-orange-800"
            >
              <span className="block text-xs uppercase tracking-wide text-slate-500">
                Anteriorul
              </span>
              <span className="mt-1 block font-medium">
                ← {previousTutorial.title}
              </span>
            </Link>
          ) : (
            <div />
          )}

          {nextTutorial ? (
            <Link
              href={`/tutoriale-pa4x/${nextTutorial.slug}`}
              className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-right text-sm text-slate-700 transition-colors hover:border-orange-300 hover:bg-orange-50 hover:text-orange-800"
            >
              <span className="block text-xs uppercase tracking-wide text-slate-500">
                Urmatorul
              </span>
              <span className="mt-1 block font-medium">
                {nextTutorial.title} →
              </span>
            </Link>
          ) : (
            <div />
          )}
        </nav>
      </article>
    );
  } catch {
    notFound();
  }
}
