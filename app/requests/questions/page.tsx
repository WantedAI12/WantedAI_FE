import { AppShell } from '@/components/layout/app-shell';
import { ComplementaryQuestionsWorkspace } from '@/components/workspace/workspace-views';

export default function ComplementaryQuestionsPage() {
  return <AppShell currentPath="/requests/questions"><ComplementaryQuestionsWorkspace /></AppShell>;
}
