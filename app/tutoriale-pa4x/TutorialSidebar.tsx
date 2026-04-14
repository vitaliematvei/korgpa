'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

import type { TutorialListItem } from '@/lib/tutorials';
import {
  buildTutorialTree,
  findNodePath,
  getFirstLeafSlug,
  type TutorialTreeNode,
} from '@/lib/tutorial-tree';

// Props type kept at top-level for type checking only
type TutorialSidebarProps = {
  tutorials: TutorialListItem[];
  basePath?: string;
  storageKey?: string;
};

function getActiveSlug(pathname: string, basePath: string) {
  const escaped = basePath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return pathname
    .replace(new RegExp(`^\\/${escaped}\\/?`), '')
    .replace(/\/+$/, '');
}

function normalizeText(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function filterTreeByQuery(
  nodes: TutorialTreeNode[],
  normalizedQuery: string,
): TutorialTreeNode[] {
  if (!normalizedQuery) return nodes;

  const filtered: TutorialTreeNode[] = [];

  for (const node of nodes) {
    const filteredChildren = filterTreeByQuery(node.children, normalizedQuery);
    const ownMatch = normalizeText(node.title).includes(normalizedQuery);

    if (ownMatch || filteredChildren.length > 0) {
      filtered.push({ ...node, children: filteredChildren });
    }
  }

  return filtered;
}

function buildNormalizedIndexMap(value: string) {
  const starts: number[] = [];
  const ends: number[] = [];
  let normalized = '';

  for (let index = 0; index < value.length; ) {
    const codePoint = value.codePointAt(index);
    if (codePoint === undefined) break;

    const char = String.fromCodePoint(codePoint);
    const charLength = char.length;
    const start = index;
    const end = index + charLength;
    const normalizedChunk = char
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();

    normalized += normalizedChunk;

    for (let i = 0; i < normalizedChunk.length; i += 1) {
      starts.push(start);
      ends.push(end);
    }

    index = end;
  }

  return { normalized, starts, ends };
}

function renderHighlightedText(title: string, query: string) {
  const normalizedQuery = normalizeText(query);
  if (!normalizedQuery) return title;

  const {
    normalized: normalizedTitle,
    starts,
    ends,
  } = buildNormalizedIndexMap(title);
  const ranges: Array<{ start: number; end: number }> = [];

  let searchIndex = 0;
  while (searchIndex < normalizedTitle.length) {
    const foundAt = normalizedTitle.indexOf(normalizedQuery, searchIndex);
    if (foundAt === -1) break;

    const start = starts[foundAt];
    const end = ends[foundAt + normalizedQuery.length - 1];

    if (start !== undefined && end !== undefined) {
      ranges.push({ start, end });
    }

    searchIndex = foundAt + normalizedQuery.length;
  }

  if (ranges.length === 0) return title;

  return (
    <>
      {ranges.map((range, index) => {
        const previousEnd = index === 0 ? 0 : ranges[index - 1].end;
        const before = title.slice(previousEnd, range.start);
        const matched = title.slice(range.start, range.end);

        return (
          <span key={`${range.start}-${range.end}-${index}`}>
            {before}
            <mark className="rounded bg-orange-200/80 px-0.5 text-inherit">
              {matched}
            </mark>
          </span>
        );
      })}
      {title.slice(ranges[ranges.length - 1].end)}
    </>
  );
}

function getLinkClasses(depth: number, isActive: boolean, isAncestor: boolean) {
  if (isActive) {
    const base =
      'block flex-1 rounded px-2 bg-orange-100 text-orange-800 font-semibold';
    if (depth === 0) return base + ' py-2 text-base';
    if (depth === 1) return base + ' py-1.5 text-sm';
    return base + ' py-1.5 text-xs';
  }

  if (isAncestor) {
    const base =
      'block flex-1 rounded px-2 text-orange-700 transition-colors hover:bg-orange-50';
    if (depth === 0) return base + ' py-2 text-base font-medium';
    if (depth === 1) return base + ' py-1.5 text-sm';
    return base + ' py-1.5 text-xs';
  }

  if (depth === 0) {
    return 'block flex-1 rounded px-2 py-2 text-base font-medium text-slate-900 transition-colors hover:bg-orange-50 hover:text-orange-700';
  }

  if (depth === 1) {
    return 'block flex-1 rounded px-2 py-1.5 text-sm text-slate-600 transition-colors hover:bg-orange-50 hover:text-orange-700';
  }

  return 'block flex-1 rounded px-2 py-1.5 text-xs text-slate-500 transition-colors hover:bg-orange-50 hover:text-orange-700';
}

export default function TutorialSidebar({
  tutorials,
  basePath = 'tutoriale-pa4x',
  storageKey = 'pa4xTutorialSidebarExpanded',
}: TutorialSidebarProps) {
  const pathname = usePathname();
  const tree = useMemo(() => buildTutorialTree(tutorials), [tutorials]);
  const [query, setQuery] = useState('');
  const normalizedQuery = useMemo(() => normalizeText(query), [query]);
  const filteredTree = useMemo(
    () => filterTreeByQuery(tree, normalizedQuery),
    [tree, normalizedQuery],
  );
  const hasActiveQuery = normalizedQuery.length > 0;
  const activeSlug = useMemo(
    () => getActiveSlug(pathname, basePath),
    [pathname, basePath],
  );
  const activePath = useMemo(
    () => findNodePath(tree, activeSlug).map((node) => node.slug),
    [activeSlug, tree],
  );

  const containerSlugs = useMemo(() => {
    const slugs = new Set<string>();
    const visit = (nodes: TutorialTreeNode[]) => {
      for (const node of nodes) {
        if (node.children.length > 0) {
          slugs.add(node.slug);
          visit(node.children);
        }
      }
    };
    visit(tree);
    return slugs;
  }, [tree]);

  const [expanded, setExpanded] = useState<Record<string, boolean>>(() => {
    const initialState: Record<string, boolean> = {};

    for (const slug of activePath.slice(0, -1)) {
      initialState[slug] = true;
    }

    return initialState;
  });

  useEffect(() => {
    const loadedState: Record<string, boolean> = {};
    const saved = localStorage.getItem(storageKey);

    let parsed: Record<string, unknown> = {};
    if (saved) {
      try {
        parsed = JSON.parse(saved) as Record<string, unknown>;
      } catch {}
    }

    for (const [slug, value] of Object.entries(parsed)) {
      // Drop stale keys that no longer exist as containers in the current tree
      if (value === true && containerSlugs.has(slug)) {
        loadedState[slug] = true;
      }
    }

    for (const slug of activePath.slice(0, -1)) {
      loadedState[slug] = true;
    }

    setExpanded(loadedState);
  }, [activePath, containerSlugs, storageKey]);

  useEffect(() => {
    // Only persist valid container slugs to keep storage clean
    const clean = Object.fromEntries(
      Object.entries(expanded).filter(([slug]) => containerSlugs.has(slug)),
    );
    localStorage.setItem(storageKey, JSON.stringify(clean));
  }, [expanded, containerSlugs, storageKey]);

  const toggleGroup = (slug: string, currentIsExpanded: boolean) => {
    setExpanded((prev) => ({
      ...prev,
      [slug]: !currentIsExpanded,
    }));
  };

  const renderNodes = (nodes: TutorialTreeNode[], depth = 0) => {
    const listClassName =
      depth === 0
        ? 'space-y-1'
        : 'mt-1 ml-4 space-y-1 border-l border-slate-200 pl-2';

    return (
      <ul className={listClassName}>
        {nodes.map((node) => {
          const hasChildren = node.children.length > 0;
          const isExpanded = hasActiveQuery || Boolean(expanded[node.slug]);
          const controlsId = hasChildren ? `subitems-${node.slug}` : undefined;
          const href = `/${basePath}/${getFirstLeafSlug(node)}`;
          const isActive = node.slug === activeSlug;
          const isAncestor = !isActive && activePath.includes(node.slug);

          return (
            <li key={node.slug}>
              <div className="flex items-center gap-1">
                {hasChildren ? (
                  <>
                    <button
                      type="button"
                      onClick={() =>
                        toggleGroup(node.slug, Boolean(expanded[node.slug]))
                      }
                      className={`${getLinkClasses(depth, isActive, isAncestor)} text-left`}
                      aria-expanded={isExpanded}
                      aria-controls={controlsId}
                    >
                      {renderHighlightedText(node.title, query)}
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        toggleGroup(node.slug, Boolean(expanded[node.slug]))
                      }
                      aria-expanded={isExpanded}
                      aria-controls={controlsId}
                      aria-label={`${isExpanded ? 'Restrange' : 'Extinde'} sectiunea ${node.title}`}
                      disabled={hasActiveQuery}
                      className="flex h-6 w-6 items-center justify-center rounded text-slate-500 transition-colors hover:bg-orange-50 hover:text-orange-700"
                    >
                      <span
                        className={`inline-block text-[10px] transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                      >
                        ▶
                      </span>
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href={href}
                      className={getLinkClasses(depth, isActive, isAncestor)}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      {renderHighlightedText(node.title, query)}
                    </Link>
                    <span className="inline-block h-6 w-6" aria-hidden="true" />
                  </>
                )}
              </div>
              {hasChildren ? (
                <div id={controlsId} hidden={!isExpanded}>
                  {isExpanded ? renderNodes(node.children, depth + 1) : null}
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <div className="space-y-3 lg:flex lg:min-h-0 lg:flex-1 lg:flex-col">
      <label htmlFor="tutorial-sidebar-search" className="sr-only">
        Cauta in tutoriale
      </label>
      <input
        id="tutorial-sidebar-search"
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Cauta in tutoriale..."
        className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
      />

      <div className="lg:min-h-0 lg:flex-1 lg:overflow-y-auto lg:pr-1">
        {filteredTree.length > 0 ? (
          renderNodes(filteredTree)
        ) : (
          <p className="rounded-md border border-dashed border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-600">
            Nu exista rezultate pentru cautarea curenta.
          </p>
        )}
      </div>
    </div>
  );
}
