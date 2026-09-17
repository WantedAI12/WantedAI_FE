import { AppShell } from '@/components/layout/app-shell';
import { FormulaDetail } from '@/components/workspace/formula-detail';
import { ProjectSidebar } from '@/components/layout/project-sidebar';

export default function RequestFormulaDetailPage() {
  return <AppShell currentPath="/formulas/detail"><ProjectSidebar /><FormulaDetail requestOnly /></AppShell>;
}
