import type { ReactNode } from 'react';
import { getAllTutorials } from '@/lib/tutorials';
import TutorialSidebar from '@/app/tutoriale-pa4x/TutorialSidebar';

export default async function MuzicaPentruNaiviLayout({
  children,
}: {
  children: ReactNode;
}) {
  const tutorials = await getAllTutorials('muzica-pentru-naivi');

  return (
    <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-4 bg-[#f8fafc] px-4 py-6 lg:grid-cols-[280px_1fr] lg:px-6">
      <aside className="h-fit rounded-xl border border-slate-200 bg-white p-4 shadow-sm lg:sticky lg:top-4 lg:flex lg:max-h-[calc(100vh-2rem)] lg:flex-col lg:overflow-hidden">
        <h2 className="mb-3 text-base font-semibold uppercase tracking-wide text-orange-600">
          Muzica pentru Naivi
        </h2>
        <TutorialSidebar
          tutorials={tutorials}
          basePath="muzica-pentru-naivi"
          storageKey="muzicaNaiviSidebarExpanded"
        />
      </aside>

      <section>{children}</section>
    </div>
  );
}
