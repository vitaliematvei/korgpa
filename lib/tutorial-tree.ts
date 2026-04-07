import type { TutorialListItem } from '@/lib/tutorials';

export type TutorialTreeNode = TutorialListItem & {
  children: TutorialTreeNode[];
};

export function buildTutorialTree(
  tutorials: TutorialListItem[],
): TutorialTreeNode[] {
  const nodes = new Map<string, TutorialTreeNode>(
    tutorials.map((item) => [item.slug, { ...item, children: [] }]),
  );
  const roots: TutorialTreeNode[] = [];

  for (const item of tutorials) {
    const node = nodes.get(item.slug);
    if (!node) continue;

    const parentNode = item.parent ? nodes.get(item.parent) : undefined;
    if (parentNode) {
      parentNode.children.push(node);
      continue;
    }

    roots.push(node);
  }

  const sortNodes = (list: TutorialTreeNode[]) => {
    list.sort((a, b) =>
      a.order !== b.order
        ? a.order - b.order
        : a.title.localeCompare(b.title, 'ro'),
    );
    for (const node of list) sortNodes(node.children);
  };

  sortNodes(roots);

  return roots;
}

export function getFirstLeafSlug(node: TutorialTreeNode): string {
  if (node.children.length === 0) {
    return node.slug;
  }

  return getFirstLeafSlug(node.children[0]);
}

export function getContainerSlugs(tutorials: TutorialListItem[]): Set<string> {
  return new Set(
    tutorials
      .map((item) => item.parent)
      .filter((parentSlug): parentSlug is string => Boolean(parentSlug)),
  );
}

export function findNodePath(
  nodes: TutorialTreeNode[],
  targetSlug: string,
): TutorialTreeNode[] {
  for (const node of nodes) {
    if (node.slug === targetSlug) {
      return [node];
    }

    const childPath = findNodePath(node.children, targetSlug);
    if (childPath.length > 0) {
      return [node, ...childPath];
    }
  }

  return [];
}

export function getLeafSlugsInTreeOrder(nodes: TutorialTreeNode[]): string[] {
  const slugs: string[] = [];

  const visit = (node: TutorialTreeNode) => {
    if (node.children.length === 0) {
      slugs.push(node.slug);
      return;
    }

    for (const child of node.children) {
      visit(child);
    }
  };

  for (const node of nodes) {
    visit(node);
  }

  return slugs;
}
