import { AppShell } from '@/components/layout/app-shell';
import { DataWorkspace } from '@/components/data/data-workspace';

export default function IngredientsPage() {
  return (
    <AppShell currentPath="/ingredients">
      <DataWorkspace />
    </AppShell>
  );
}
