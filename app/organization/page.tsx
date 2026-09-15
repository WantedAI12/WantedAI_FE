import { AppShell } from '@/components/layout/app-shell';
import { OrganizationWorkspace } from '@/components/organization/organization-workspace';

export default function OrganizationPage() {
  return (
    <AppShell currentPath="/organization">
      <OrganizationWorkspace />
    </AppShell>
  );
}
