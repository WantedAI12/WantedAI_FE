import { AppShell } from '@/components/layout/app-shell';
import { OrganizationWorkspace } from '@/components/organization/organization-workspace';
export default function ProjectsPage() {
  return (
    <AppShell currentPath="/projects">
      <OrganizationWorkspace forcedView="projects" />
    </AppShell>
  );
}
