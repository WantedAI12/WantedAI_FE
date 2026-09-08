import Image from 'next/image';
import Link from 'next/link';

const items = [
  ['/projects', '프로젝트 홈', 'sidebar-home.svg'],
  ['/requests', '향 요청', 'sidebar-request.svg'],
  ['/formulas', '후보 조향식', 'sidebar-formula.svg'],
  ['/experiments', '시험 / 검증', 'sidebar-test.svg'],
  ['/ingredients', '데이터', 'sidebar-data.svg'],
  ['/projects', '조직관리', 'sidebar-org.svg'],
] as const;

export function ProjectSidebar() {
  return <aside className="project-sidebar"><Link href="/" className="project-sidebar-brand">PERFUMERY AI CORE</Link><div className="project-sidebar-panel"><nav>{items.map(([href,label,icon])=><Link href={href} key={`${href}-${label}`}><Image src={`/figma/${icon}`} alt="" width={21} height={21}/><span>{label}</span></Link>)}</nav><div className="project-sidebar-user"><Image src="/figma/sidebar-profile.svg" alt="" width={32} height={32}/><span><b>김멋사</b><small>dkjoekfnnvle@gmail.com</small></span></div></div></aside>;
}
