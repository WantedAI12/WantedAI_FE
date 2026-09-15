import { AppShell } from '@/components/layout/app-shell';
import { OrganizationWorkspace } from '@/components/organization/organization-workspace';

export default function OrganizationMembersPage() {
  return (
    <AppShell currentPath="/organization/members">
      <OrganizationWorkspace forcedView="members" />
    </AppShell>
  );
}
