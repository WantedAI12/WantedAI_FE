'use client';
import { ProjectSidebar } from '@/components/layout/project-sidebar';
import { RawDataWorkspace } from './raw-data-workspace';
export function DataWorkspace() {
  return (
    <div className="wf-layout wf-data-page data-redesign">
      <ProjectSidebar />
      <section className="wf-main">
        <RawDataWorkspace />
      </section>
    </div>
  );
}
