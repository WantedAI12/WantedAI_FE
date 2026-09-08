import Link from 'next/link';
import Image from 'next/image';

const menu=[['PROJECTS','/projects'],['FORMULAS','/formulas'],['EXPERIMENTS','/experiments'],['DATA','/ingredients']];
export function AppShell({children,currentPath}:{children:React.ReactNode;currentPath?:string}){
  const isHome=currentPath==='/';
  const isFormulaDetail=currentPath?.startsWith('/formulas/') ?? false;
  return <main className={`wf-shell ${isHome?'':'has-project-sidebar'} ${isFormulaDetail?'is-formula-detail':''}`}>{isHome&&<header className="wf-header"><div className="wf-header-inner is-home"><Link href="/" className="wf-brand">PERFUMERY AI CORE</Link><nav className="wf-nav">{menu.map(([label,href])=><Link key={href} href={href}>{label}</Link>)}</nav><Link href="/login" aria-label="로그인" className="wf-avatar"><Image src="/figma/asset-1.svg" alt="" width={46} height={46} /></Link></div></header>}{children}</main>;
}
