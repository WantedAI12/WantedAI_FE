'use client';

import Image from 'next/image';
import Link from '@/components/ui/app-link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { routes } from '@/lib/routes';
import { authApi } from '@/lib/api/resources';
import { tokenStorage } from '@/lib/api/client';
import type { MemberResponse } from '@/types/domain';

const singleItems = [
  [routes.home, '프로젝트 홈', 'sidebar-home.svg'],
  [routes.request, '향 요청', 'sidebar-request.svg'],
  [routes.formulas, '후보 조향식', 'sidebar-data.svg'],
] as const;

export function ProjectSidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [testsOpen, setTestsOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [member, setMember] = useState<MemberResponse | null>(null);
  useEffect(() => {
    if (!tokenStorage.getAccessToken() && !tokenStorage.getRefreshToken()) return;
    authApi.me().then(setMember).catch(() => undefined);
  }, []);
  const experimentView = searchParams.get('view') ?? 'safety';
  const isActive = (href: string) =>
    href === '/formulas'
      ? pathname.startsWith('/formulas')
      : href === '/requests'
        ? pathname.startsWith('/requests')
        : pathname === href;

  return (
    <aside className="project-sidebar">
      <Link href="/" className="project-sidebar-brand">
        PERFUMERY
      </Link>
      <button
        type="button"
        className="project-sidebar-toggle"
        aria-expanded={menuOpen}
        aria-label="사이드바 메뉴 열기 또는 닫기"
        onClick={() => setMenuOpen((open) => !open)}
      >
        <i />
        <i />
        <i />
      </button>
      {menuOpen && (
        <button
          type="button"
          className="project-sidebar-scrim"
          aria-label="사이드바 메뉴 닫기"
          onClick={() => setMenuOpen(false)}
        />
      )}
      <div className={`project-sidebar-panel ${menuOpen ? 'is-open' : ''}`}>
        <nav>
          {singleItems.map(([href, label, icon]) => (
            <Link
              href={href}
              className={isActive(href) ? 'active' : ''}
              key={href}
            >
              <Image src={`/figma/${icon}`} alt="" width={21} height={21} />
              <span>{label}</span>
            </Link>
          ))}
          <div
            className={`project-nav-group ${pathname === '/experiments' ? 'active' : ''}`}
          >
            <button
              type="button"
              className="project-nav-parent"
              onClick={() => setTestsOpen((value) => !value)}
            >
              <Image
                src="/figma/sidebar-flask.svg"
                alt=""
                width={21}
                height={21}
              />
              <span>시험 / 검증</span>
              <i
                className={`wf-chevron ${testsOpen ? '' : 'is-right'}`}
                aria-hidden="true"
              />
            </button>
            {testsOpen && (
              <div className="project-nav-children">
                <Link
                  className={
                    pathname === '/experiments' && experimentView === 'safety'
                      ? 'active-child'
                      : ''
                  }
                  href="/experiments?view=safety"
                >
                  안전·규제 승인 검토
                </Link>
                <Link
                  className={
                    pathname === '/experiments' && experimentView === 'audit'
                      ? 'active-child'
                      : ''
                  }
                  href="/experiments?view=audit"
                >
                  증거·감사 이력
                </Link>
              </div>
            )}
          </div>
          <Link href={routes.ingredients} className={pathname === '/ingredients' ? 'active' : ''}>
              <Image
                src="/figma/sidebar-test.svg"
                alt=""
                width={21}
                height={21}
              />
              <span>데이터</span>
          </Link>
          <Link
            href={routes.projects}
            className={pathname.startsWith(routes.projects) ? 'active' : ''}
          >
            <Image src="/figma/sidebar-org.svg" alt="" width={21} height={21} />
            <span>프로젝트 관리</span>
          </Link>
          <Link
            href={routes.formulaManagement}
            className={pathname === routes.formulaManagement ? 'active' : ''}
          >
            <Image
              src="/figma/sidebar-data.svg"
              alt=""
              width={21}
              height={21}
            />
            <span>조향식 관리</span>
          </Link>
          <Link
            href={routes.organization}
            className={pathname.startsWith(routes.organization) ? 'active' : ''}
          >
            <Image
              src="/figma/sidebar-profile.svg"
              alt=""
              width={21}
              height={21}
            />
            <span>조직 관리</span>
          </Link>
          <Link
            href="/operations"
            className={pathname === '/operations' ? 'active' : ''}
          >
            <i className="project-service-icon">⚙</i>
            <span>서비스 운영</span>
          </Link>
        </nav>
        <Link
          href="/profile"
          className={`project-sidebar-user ${pathname.startsWith('/profile') ? 'active' : ''}`}
        >
          <Image
            src="/figma/sidebar-formula.svg"
            alt=""
            width={32}
            height={32}
          />
          <span>
            <b>{member?.name ?? '게스트'}</b>
            <small>{member?.email ?? '로그인 후 이용 가능'}</small>
          </span>
        </Link>
      </div>
    </aside>
  );
}
