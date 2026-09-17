'use client';

import Link from '@/components/ui/app-link';
import Image from 'next/image';
import { routes } from '@/lib/routes';
import { useState } from 'react';

const menu = [
  ['후보 조향식', routes.formulas],
  ['시험 / 검증', routes.experiments],
  ['데이터', routes.ingredients],
  ['프로젝트 관리', routes.projects],
  ['조향식 관리', routes.formulaManagement],
  ['조직 관리', routes.organization],
  ['서비스 운영', routes.operations],
];
export function AppShell({
  children,
  currentPath,
}: {
  children: React.ReactNode;
  currentPath?: string;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const isHome = currentPath === '/';
  const isFormulaDetail = currentPath?.startsWith('/formulas/') ?? false;
  return (
    <main
      className={`wf-shell ${isHome ? '' : 'has-project-sidebar'} ${isFormulaDetail ? 'is-formula-detail' : ''}`}
    >
      {isHome && (
        <header className="wf-header">
          <div className="wf-header-inner is-home">
            <Link href={routes.home} className="wf-brand">
              PERFUMERY
            </Link>
            <button
              type="button"
              className="wf-mobile-nav-toggle"
              aria-expanded={menuOpen}
              aria-label="전체 메뉴 열기 또는 닫기"
              onClick={() => setMenuOpen((open) => !open)}
            >
              <i />
              <i />
              <i />
            </button>
            <nav className={`wf-nav ${menuOpen ? 'is-open' : ''}`}>
              {menu.map(([label, href]) => (
                <Link key={href} href={href}>
                  {label}
                </Link>
              ))}
            </nav>
            <Link href={routes.profile} aria-label="마이페이지" className="wf-avatar">
              <Image src="/figma/asset-1.svg" alt="" width={46} height={46} />
            </Link>
          </div>
        </header>
      )}
      {children}
    </main>
  );
}
