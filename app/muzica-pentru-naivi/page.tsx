import Link from 'next/link';
import { getAllTutorials } from '@/lib/tutorials';
import { buildTutorialTree, getFirstLeafSlug } from '@/lib/tutorial-tree';

function renderNodeList(nodes: ReturnType<typeof buildTutorialTree>) {
  return (
    <ul className="space-y-1">
      {nodes.map((node) => (
        <li key={node.slug}>
          <Link
            href={`/muzica-pentru-naivi/${getFirstLeafSlug(node)}`}
            className="text-base text-orange-700 transition-colors hover:text-orange-800"
          >
            {node.title}
          </Link>
          {node.children.length > 0 ? (
            <div className="mt-1 ml-4 border-l border-slate-200 pl-3">
              {renderNodeList(node.children)}
            </div>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

export default async function MuzicaPentruNaiviIndexPage() {
  const tutorials = await getAllTutorials('muzica-pentru-naivi');
  const tutorialTree = buildTutorialTree(tutorials);

  return (
    <main className="rounded-xl border border-slate-200 bg-white p-6 text-slate-900 shadow-sm">
      <h1 className="text-3xl font-bold text-slate-950">Muzica pentru Naivi</h1>
      <p className="mt-2 text-base leading-relaxed text-slate-700 md:text-lg">
        Lectii si concepte muzicale explicate simplu, de la zero.
      </p>

      <div className="mt-6 space-y-3">
        {tutorialTree.map((item) => (
          <article
            key={item.slug}
            className="rounded-lg border border-slate-200 bg-slate-50 p-4"
          >
            <h2 className="text-xl font-semibold text-slate-900">
              {item.title}
            </h2>
            <p className="mt-1 text-base leading-relaxed text-slate-700">
              {item.description}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-slate-500">
              <span>{item.category}</span>
              {item.level ? <span>• {item.level}</span> : null}
              {item.estimatedTime ? <span>• {item.estimatedTime}</span> : null}
            </div>
            <Link
              href={`/muzica-pentru-naivi/${getFirstLeafSlug(item)}`}
              className="mt-4 inline-block rounded bg-orange-500 px-3 py-1.5 text-base font-semibold text-white transition-colors hover:bg-orange-600"
            >
              Citeste lectia
            </Link>

            {item.children.length > 0 ? (
              <div className="mt-4 border-t border-slate-200 pt-3">
                <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
                  Subitemi
                </p>
                {renderNodeList(item.children)}
              </div>
            ) : null}
          </article>
        ))}
      </div>
    </main>
  );
}
