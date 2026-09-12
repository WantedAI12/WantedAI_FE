import { AppShell } from '@/components/layout/app-shell';
import { FormulaDetail } from '@/components/workspace/formula-detail';
import { ProjectSidebar } from '@/components/layout/project-sidebar';

export default function FormulaDetailPage() {
  return <AppShell currentPath="/formulas/1"><ProjectSidebar /><FormulaDetail /></AppShell>;
}
