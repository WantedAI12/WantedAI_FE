import { AppShell } from '@/components/layout/app-shell';
import { OperationsWorkspace } from '@/components/operations/operations-workspace';

export default function OperationsPage() {
  return (
    <AppShell currentPath="/operations">
      <OperationsWorkspace />
    </AppShell>
  );
}
