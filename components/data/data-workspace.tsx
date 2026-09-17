'use client';
import { useSearchParams } from 'next/navigation';
import { ProjectSidebar } from '@/components/layout/project-sidebar';
import { RawDataWorkspace } from './raw-data-workspace';
import { SensoryValidation } from './sensory-validation';
export function DataWorkspace() {
  const sensory = useSearchParams().get('view') === 'sensory';
  return (
    <div className="wf-layout wf-data-page data-redesign">
      <ProjectSidebar />
      <section className="wf-main">
        {sensory ? <SensoryValidation /> : <RawDataWorkspace />}
      </section>
    </div>
  );
}
