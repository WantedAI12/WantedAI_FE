import { AppShell } from '@/components/layout/app-shell';
import { OrganizationWorkspace } from '@/components/organization/organization-workspace';

export default function FormulaManagementPage() {
  return (
    <AppShell currentPath="/formula-management">
      <OrganizationWorkspace forcedView="formulas" />
    </AppShell>
  );
}
