import { AppShell } from '@/components/layout/app-shell';
import { FormulaDetail } from '@/components/workspace/formula-detail';

export default function FormulaDetailPage() {
  return <AppShell currentPath="/formulas/1"><FormulaDetail /></AppShell>;
}
