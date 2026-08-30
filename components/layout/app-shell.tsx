import { Beaker, FlaskConical, FolderKanban, Leaf, Search, ShieldCheck, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

const menu = [
  { label: '대시보드', href: '/', icon: Sparkles },
  { label: '프로젝트', href: '/projects', icon: FolderKanban },
  { label: '향 요청', href: '/requests', icon: Leaf },
  { label: '조향식', href: '/formulas', icon: FlaskConical },
  { label: '원료 라이브러리', href: '/ingredients', icon: Beaker },
  { label: '안전·규제', href: '/safety', icon: ShieldCheck },
];

export function AppShell({ children, currentPath = '/' }: { children: React.ReactNode; currentPath?: string }) {
  return <main className="min-h-screen bg-background text-foreground">
    <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 border-r border-sidebar-border bg-sidebar px-4 py-5 lg:flex lg:flex-col">
      <a href="/" className="flex items-center gap-3 px-3"><div className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm"><Leaf className="size-5" /></div><div><p className="font-semibold tracking-tight">Perfumery AI</p><p className="text-xs text-muted-foreground">R&amp;D Workspace</p></div></a>
      <nav aria-label="주요 메뉴" className="mt-9 space-y-1">{menu.map(({ label, href, icon: Icon }) => { const active = currentPath === href; return <a key={href} href={href} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${active ? 'bg-sidebar-accent font-medium text-sidebar-accent-foreground' : 'text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground'}`}><Icon className="size-4" />{label}</a>; })}</nav>
      <div className="mt-auto rounded-2xl border border-sidebar-border bg-white/70 p-3.5"><p className="text-xs font-medium">데이터 연결 상태</p><div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground"><span className="size-2 rounded-full bg-amber-400" />백엔드 API 준비 중</div></div>
    </aside>
    <section className="lg:pl-64">
      <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/90 px-5 backdrop-blur md:px-8"><a href="/" className="flex items-center gap-2 lg:hidden"><Leaf className="size-5 text-primary" /><span className="font-semibold">Perfumery AI</span></a><div className="relative hidden w-full max-w-sm md:block"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input aria-label="통합 검색" placeholder="프로젝트, 조향식, 원료 검색" className="h-9 bg-muted/55 pl-9" /></div><div className="flex items-center gap-3"><Badge variant="outline" className="hidden sm:inline-flex">R&amp;D Team</Badge><div className="grid size-9 place-items-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">JS</div></div></header>
      {children}
    </section>
  </main>;
}
