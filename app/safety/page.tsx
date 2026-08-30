import { ShieldCheck } from 'lucide-react';
import { SectionPlaceholder } from '@/components/common/section-placeholder';
import { AppShell } from '@/components/layout/app-shell';
export default function SafetyPage() { return <AppShell currentPath="/safety"><SectionPlaceholder title="안전·규제" description="조향식별 안전 게이트, 규제 적합성과 승인 이력을 확인합니다." icon={ShieldCheck} actionLabel="검토 만들기" /></AppShell>; }
