import { AppShell } from '@/components/layout/app-shell';
import { StructuredWorkspace } from '@/components/workspace/workspace-views';

export default function StructuredRequestPage() {
  return <AppShell currentPath="/requests/structured"><StructuredWorkspace /></AppShell>;
}
