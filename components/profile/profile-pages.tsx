'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import { ProjectSidebar } from '@/components/layout/project-sidebar';
import { authApi } from '@/lib/api/resources';

function Avatar({
  editable = false,
  onPick,
}: {
  editable?: boolean;
  onPick?: () => void;
}) {
  return (
    <div className="wf-profile-avatar" aria-label="프로필 사진">
      <i />
      <span />
      {editable && (
        <button type="button" onClick={onPick} aria-label="프로필 사진 선택">
          ●
        </button>
      )}
    </div>
  );
}

export function ProfilePage() {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  const logout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await authApi.logout();
    } catch {
      // Local credentials still need to be cleared if the server is unavailable.
    } finally {
      sessionStorage.removeItem('perfumery.auth');
      router.replace('/login');
    }
  };

  return (
    <div className="wf-layout wf-profile-page">
      <ProjectSidebar />
      <section className="wf-main">
        <h1>마이페이지</h1>
        <p className="wf-profile-sub">
          계정 정보와 활동 내역을 한눈에 확인할 수 있습니다.
        </p>
        <div className="wf-profile-card">
          <div className="wf-profile-identity">
            <Avatar />
            <div>
              <strong>김멋사</strong>
              <span>dkjoekfnnvle@gmail.com</span>
            </div>
          </div>
          <dl>
            <div>
              <dt>소속</dt>
              <dd>개발팀</dd>
            </div>
            <div>
              <dt>직책</dt>
              <dd>연구원</dd>
            </div>
            <div>
              <dt>가입일</dt>
              <dd>2025.03.12</dd>
            </div>
          </dl>
          <Link href="/profile/edit" className="wf-profile-edit">
            프로필 수정
          </Link>
          <button
            type="button"
            className="wf-profile-logout"
            onClick={logout}
            disabled={loggingOut}
          >
            <b>↪</b>
            <span>
              <strong>{loggingOut ? '로그아웃 중...' : '로그아웃'}</strong>
              <small>안전하게 로그아웃합니다.</small>
            </span>
          </button>
        </div>
      </section>
    </div>
  );
}

export function ProfileEditPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    name: '김멋사',
    team: '개발팀',
    role: '연구원',
  });
  const [emailNotice, setEmailNotice] = useState(true);
  const [marketing, setMarketing] = useState(false);
  const update = (field: keyof typeof form, value: string) =>
    setForm((current) => ({ ...current, [field]: value }));
  const save = () => {
    sessionStorage.setItem(
      'perfumery.profile',
      JSON.stringify({ ...form, emailNotice, marketing }),
    );
    router.push('/profile');
  };
  return (
    <div className="wf-layout wf-profile-page wf-profile-edit-page">
      <ProjectSidebar />
      <section className="wf-main">
        <div className="wf-profile-edit-card">
          <button
            type="button"
            className="wf-profile-close"
            onClick={() => router.push('/profile')}
            aria-label="닫기"
          >
            ×
          </button>
          <h1>프로필 수정</h1>
          <p>회원님의 정보를 수정할 수 있습니다.</p>
          <div className="wf-profile-edit-grid">
            <div className="wf-profile-photo">
              <Avatar editable onPick={() => fileRef.current?.click()} />
              <input ref={fileRef} type="file" accept="image/*" />
              <button type="button" onClick={() => fileRef.current?.click()}>
                프로필 사진 변경
              </button>
            </div>
            <div className="wf-profile-fields">
              <label>
                이름
                <input
                  value={form.name}
                  onChange={(event) => update('name', event.target.value)}
                />
              </label>
              <label>
                이메일
                <input value="dkjoekfnnvle@gmail.com" disabled />
                <small>이메일은 변경할 수 없습니다.</small>
              </label>
              <label>
                소속
                <input
                  value={form.team}
                  onChange={(event) => update('team', event.target.value)}
                />
              </label>
              <label>
                직책
                <input
                  value={form.role}
                  onChange={(event) => update('role', event.target.value)}
                />
              </label>
              <div className="wf-profile-field">
                비밀번호 변경
                <button type="button" className="wf-password-change">
                  ▣　비밀번호 변경하기
                </button>
              </div>
              <hr />
              <h2>알림 설정</h2>
              <div className="wf-notification">
                <span>
                  <b>이메일 알림</b>
                  <small>
                    프로젝트 업데이트 및 주요 알림을 이메일로 받아보세요.
                  </small>
                </span>
                <button
                  type="button"
                  className={emailNotice ? 'on' : ''}
                  onClick={() => setEmailNotice((value) => !value)}
                  aria-label="이메일 알림 전환"
                >
                  <i />
                </button>
              </div>
              <div className="wf-notification">
                <span>
                  <b>마케팅 정보 수신</b>
                  <small>이벤트 정보를 수신합니다.</small>
                </span>
                <button
                  type="button"
                  className={marketing ? 'on' : ''}
                  onClick={() => setMarketing((value) => !value)}
                  aria-label="마케팅 정보 수신 전환"
                >
                  <i />
                </button>
              </div>
              <div className="wf-profile-save">
                <button type="button" onClick={save}>
                  저장
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
