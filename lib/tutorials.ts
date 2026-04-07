import fs from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';

export type TutorialMeta = {
  title: string;
  description: string;
  category: string;
  order: number;
  parent?: string;
  level?: string;
  estimatedTime?: string;
};

export type TutorialListItem = TutorialMeta & {
  slug: string;
  slugParts: string[];
};

const TUTORIALS_DIR = path.join(process.cwd(), 'content', 'tutoriale-pa4x');

function slugifySegment(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // elimină diacriticele
    .replace(/\.{3}|…/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function normalizeSegment(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\.{3}|…/g, '')
    .toLowerCase();
}

async function walkMdxFiles(dir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        return walkMdxFiles(fullPath);
      }

      if (!entry.name.endsWith('.mdx') || entry.name.startsWith('_')) {
        return [] as string[];
      }

      return [fullPath];
    }),
  );

  return files.flat();
}

function normalizeSlug(filePath: string) {
  const relative = path.relative(TUTORIALS_DIR, filePath);
  const withoutExt = relative.replace(/\.mdx$/, '');
  const pathParts = withoutExt.split(path.sep).filter(Boolean);
  const rawParts =
    pathParts[pathParts.length - 1] === 'index'
      ? pathParts.slice(0, -1)
      : pathParts;

  const slugParts = rawParts.map(slugifySegment);

  const slug = slugParts.join('/');
  return { slug, slugParts };
}

async function resolveTutorialFilePath(slugParts: string[]) {
  const candidatePaths = [
    path.join(TUTORIALS_DIR, ...slugParts) + '.mdx',
    path.join(TUTORIALS_DIR, ...slugParts, 'index.mdx'),
  ];

  if (slugParts[slugParts.length - 1] === 'index') {
    candidatePaths.push(
      path.join(TUTORIALS_DIR, ...slugParts.slice(0, -1), 'index.mdx'),
    );
  }

  for (const candidatePath of candidatePaths) {
    try {
      await fs.access(candidatePath);
      return candidatePath;
    } catch {
      // Try the next candidate path.
    }
  }

  // Last resort: compare requested slug with all MDX slugs using normalized
  // segments to tolerate unicode composition / diacritics differences.
  const requestedKey = slugParts
    .filter(
      (segment, index, parts) =>
        !(segment === 'index' && index === parts.length - 1),
    )
    .map(normalizeSegment)
    .join('/');
  const mdxFiles = await walkMdxFiles(TUTORIALS_DIR);

  for (const candidatePath of mdxFiles) {
    const candidate = normalizeSlug(candidatePath);
    const candidateKey = candidate.slugParts.map(normalizeSegment).join('/');

    if (candidateKey === requestedKey) {
      return candidatePath;
    }
  }

  throw new Error('Tutorial file not found');
}

export async function getAllTutorials(): Promise<TutorialListItem[]> {
  const mdxFiles = await walkMdxFiles(TUTORIALS_DIR);
  const items = await Promise.all(
    mdxFiles.map(async (filePath) => {
      const source = await fs.readFile(filePath, 'utf8');
      const { data } = matter(source);
      const { slug, slugParts } = normalizeSlug(filePath);

      // Derive parent from slug hierarchy
      let parent: string | undefined;
      if (slugParts.length > 1) {
        parent = slugParts.slice(0, -1).join('/');
      }

      const meta: TutorialMeta = {
        title: String(data.title ?? 'Tutorial fara titlu'),
        description: String(data.description ?? ''),
        category: String(data.category ?? 'General'),
        order: Number(data.order ?? 9999),
        parent,
        level: data.level ? String(data.level) : undefined,
        estimatedTime: data.estimatedTime
          ? String(data.estimatedTime)
          : undefined,
      };

      return {
        ...meta,
        slug,
        slugParts,
      };
    }),
  );

  return items.sort((a, b) => {
    if (a.order !== b.order) return a.order - b.order;
    return a.title.localeCompare(b.title, 'ro');
  });
}

export async function getTutorialBySlug(slugParts: string[]) {
  const cleanParts = slugParts.filter(Boolean);
  const filePath = await resolveTutorialFilePath(cleanParts);
  const canonical = normalizeSlug(filePath);
  const source = await fs.readFile(filePath, 'utf8');

  const { content, data } = matter(source);
  const parent =
    canonical.slugParts.length > 1
      ? canonical.slugParts.slice(0, -1).join('/')
      : undefined;

  const meta: TutorialMeta = {
    title: String(data.title ?? cleanParts.join(' / ')),
    description: String(data.description ?? ''),
    category: String(data.category ?? 'General'),
    order: Number(data.order ?? 9999),
    parent,
    level: data.level ? String(data.level) : undefined,
    estimatedTime: data.estimatedTime ? String(data.estimatedTime) : undefined,
  };

  return {
    meta,
    content,
    slug: canonical.slug,
    slugParts: canonical.slugParts,
  };
}
