import { FolderKanban } from 'lucide-react';
import { SectionPlaceholder } from '@/components/common/section-placeholder';
import { AppShell } from '@/components/layout/app-shell';
export default function ProjectsPage() { return <AppShell currentPath="/projects"><SectionPlaceholder title="프로젝트" description="향 개발 프로젝트와 단계별 진행 상태를 관리합니다." icon={FolderKanban} actionLabel="프로젝트 만들기" /></AppShell>; }
