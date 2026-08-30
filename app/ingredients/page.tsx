import { Beaker } from 'lucide-react';
import { SectionPlaceholder } from '@/components/common/section-placeholder';
import { AppShell } from '@/components/layout/app-shell';
export default function IngredientsPage() {
  return (
    <AppShell currentPath="/ingredients">
      <SectionPlaceholder
        title="원료 라이브러리"
        description="원료의 향조, 가격, 공급 가능성과 적용 정보를 관리합니다."
        icon={Beaker}
        actionLabel="원료 등록"
      />
    </AppShell>
  );
}
