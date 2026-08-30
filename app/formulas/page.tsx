import { FlaskConical } from 'lucide-react';
import { SectionPlaceholder } from '@/components/common/section-placeholder';
import { AppShell } from '@/components/layout/app-shell';
export default function FormulasPage() {
  return (
    <AppShell currentPath="/formulas">
      <SectionPlaceholder
        title="조향식"
        description="생성된 후보 조향식을 비교하고 버전과 검토 이력을 관리합니다."
        icon={FlaskConical}
        actionLabel="후보 생성"
      />
    </AppShell>
  );
}
