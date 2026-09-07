import Link from 'next/link';
import Image from 'next/image';

const menu=[['PROJECTS','/projects'],['FORMULAS','/formulas'],['EXPERIMENTS','/experiments'],['DATA','/ingredients']];
export function AppShell({children,currentPath}:{children:React.ReactNode;currentPath?:string}){
  return <main className="wf-shell"><header className="wf-header"><div className={`wf-header-inner ${currentPath === '/' || currentPath === '/requests' ? 'is-home' : ''} ${currentPath === '/formulas/1' ? 'is-detail' : ''}`}><Link href="/" className="wf-brand">PERFUMERY AI CORE</Link><nav className="wf-nav">{menu.map(([label,href])=><Link key={href} href={href}>{label}</Link>)}</nav><Link href="/login" aria-label="로그인" className="wf-avatar"><Image src="/figma/asset-1.svg" alt="" width={46} height={46} /></Link></div></header>{children}</main>;
}
