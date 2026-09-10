'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useState } from 'react';

const singleItems = [
  ['/', '프로젝트 홈', 'sidebar-home.svg'],
  ['/requests', '향 요청', 'sidebar-request.svg'],
  ['/formulas', '후보 조향식', 'sidebar-data.svg'],
] as const;

export function ProjectSidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [testsOpen, setTestsOpen] = useState(true);
  const [dataOpen, setDataOpen] = useState(true);
  const experimentView = searchParams.get('view') ?? 'safety';
  const dataView = searchParams.get('view') ?? 'raw';
  const isActive = (href: string) =>
    href === '/formulas'
      ? pathname.startsWith('/formulas')
      : href === '/requests'
        ? pathname.startsWith('/requests')
        : pathname === href;

  return (
    <aside className="project-sidebar">
      <Link href="/" className="project-sidebar-brand">
        PERFUMERY AI CORE
      </Link>
      <div className="project-sidebar-panel">
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
          <div
            className={`project-nav-group ${pathname === '/ingredients' ? 'active' : ''}`}
          >
            <button
              type="button"
              className="project-nav-parent"
              onClick={() => setDataOpen((value) => !value)}
            >
              <Image
                src="/figma/sidebar-test.svg"
                alt=""
                width={21}
                height={21}
              />
              <span>데이터</span>
              <i
                className={`wf-chevron ${dataOpen ? '' : 'is-right'}`}
                aria-hidden="true"
              />
            </button>
            {dataOpen && (
              <div className="project-nav-children">
                <Link
                  className={
                    pathname === '/ingredients' && dataView === 'sensory'
                      ? 'active-child'
                      : ''
                  }
                  href="/ingredients?view=sensory"
                >
                  관능 검증 관리
                </Link>
                <Link
                  className={
                    pathname === '/ingredients' && dataView === 'impact'
                      ? 'active-child'
                      : ''
                  }
                  href="/ingredients?view=impact"
                >
                  변경 영향 분석
                </Link>
                <Link
                  className={
                    pathname === '/ingredients' && dataView === 'raw'
                      ? 'active-child'
                      : ''
                  }
                  href="/ingredients?view=raw"
                >
                  원료·시험 데이터
                </Link>
              </div>
            )}
          </div>
          <Link
            href="/organization"
            className={pathname === '/organization' ? 'active' : ''}
          >
            <Image
              src="/figma/sidebar-profile.svg"
              alt=""
              width={21}
              height={21}
            />
            <span>조직관리</span>
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
            <b>김멋사</b>
            <small>dkjoekfnnvle@gmail.com</small>
          </span>
        </Link>
      </div>
    </aside>
  );
}
