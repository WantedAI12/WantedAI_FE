import { Leaf } from 'lucide-react';
import { SectionPlaceholder } from '@/components/common/section-placeholder';
import { AppShell } from '@/components/layout/app-shell';
export default function RequestsPage() { return <AppShell currentPath="/requests"><SectionPlaceholder title="향 요청" description="자연어 향 콘셉트와 제품·비용·지속성 제약을 구조화합니다." icon={Leaf} actionLabel="향 요청 작성" /></AppShell>; }
