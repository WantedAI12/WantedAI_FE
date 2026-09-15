import { AppShell } from '@/components/layout/app-shell';
import { NewProjectWorkspace } from '@/components/organization/new-project-workspace';

export default function NewProjectPage() {
  return (
    <AppShell currentPath="/organization/new-project">
      <NewProjectWorkspace />
    </AppShell>
  );
}
