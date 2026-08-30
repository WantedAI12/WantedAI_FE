import type { LucideIcon } from 'lucide-react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function SectionPlaceholder({ title, description, icon: Icon, actionLabel }: { title: string; description: string; icon: LucideIcon; actionLabel: string }) {
  return <div className="mx-auto max-w-7xl px-5 py-8 md:px-8 md:py-10"><div className="flex items-end justify-between gap-4"><div><h1 className="text-3xl font-semibold tracking-tight">{title}</h1><p className="mt-2 text-sm text-muted-foreground">{description}</p></div><Button className="rounded-xl"><Plus className="size-4" />{actionLabel}</Button></div><section className="mt-8 grid min-h-[420px] place-items-center rounded-2xl border border-dashed bg-card/55 p-8 text-center"><div><div className="mx-auto grid size-14 place-items-center rounded-2xl bg-secondary text-primary"><Icon className="size-6" /></div><h2 className="mt-5 font-semibold">아직 등록된 데이터가 없습니다</h2><p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted-foreground">백엔드 API가 준비되면 이 화면에 목록, 필터, 상세 작업 흐름을 연결할 수 있습니다.</p></div></section></div>;
}
