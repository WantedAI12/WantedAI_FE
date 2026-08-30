import { ArrowRight, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

const projects = [
  { name: 'Citrus Dawn', brief: '산뜻한 데일리 퍼퓸', progress: 72, status: '후보 검토', tone: 'lime' },
  { name: 'Velvet Library', brief: '우디 앰버 홈 프래그런스', progress: 48, status: '조향식 생성', tone: 'violet' },
  { name: 'Rain on Fig', brief: '그린 피그 바디워시', progress: 24, status: '요청 구조화', tone: 'sky' },
];

export function DashboardOverview() {
  return <div className="mx-auto max-w-7xl px-5 py-8 md:px-8 md:py-10">
    <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="mb-2 text-sm font-medium text-primary">2026년 8월 30일</p><h1 className="text-3xl font-semibold tracking-[-0.035em] md:text-4xl">향 개발 워크스페이스</h1><p className="mt-2 text-sm text-muted-foreground">아이디어부터 검증까지, 진행 중인 연구를 한눈에 관리하세요.</p></div><Button size="lg" className="h-10 rounded-xl px-4"><Plus className="size-4" /> 새 프로젝트</Button></div>
    <div className="mt-8 grid gap-4 md:grid-cols-3">{[['진행 중 프로젝트','3','이번 주 +1'],['검토 대기 후보','8','안전 검토 3건'],['등록 원료','128','사용 가능 116종']].map(([label,value,note]) => <article key={label} className="rounded-2xl border bg-card p-5 shadow-[0_1px_2px_rgb(23_31_28/3%)]"><p className="text-sm text-muted-foreground">{label}</p><div className="mt-3 flex items-end justify-between"><strong className="text-3xl font-semibold tracking-tight">{value}</strong><span className="text-xs text-muted-foreground">{note}</span></div></article>)}</div>
    <section className="mt-8"><div className="mb-4 flex items-center justify-between"><div><h2 className="text-lg font-semibold">최근 프로젝트</h2><p className="mt-1 text-sm text-muted-foreground">현재 진행 중인 향 개발 현황입니다.</p></div><Button render={<a href="/projects" />} nativeButton={false} variant="ghost">전체 보기 <ArrowRight className="size-4" /></Button></div><div className="grid gap-4 md:grid-cols-3">{projects.map(project => <article key={project.name} className="group rounded-2xl border bg-card p-5 transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/5"><div className={`mb-5 flex h-28 items-end overflow-hidden rounded-xl scent-card scent-card-${project.tone}`}><span className="m-3 rounded-full border border-white/50 bg-white/65 px-2.5 py-1 text-[11px] font-medium backdrop-blur">{project.status}</span></div><h3 className="font-semibold tracking-tight">{project.name}</h3><p className="mt-1 text-sm text-muted-foreground">{project.brief}</p><div className="mt-5 flex items-center gap-3"><div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${project.progress}%` }} /></div><span className="text-xs font-medium tabular-nums text-muted-foreground">{project.progress}%</span></div></article>)}</div></section>
  </div>;
}
