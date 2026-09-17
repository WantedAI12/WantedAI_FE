'use client';

import Link from '@/components/ui/app-link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ProjectSidebar } from '@/components/layout/project-sidebar';
import { authApi } from '@/lib/api/resources';
import { tokenStorage } from '@/lib/api/client';
import type { MemberResponse } from '@/types/domain';

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
  const [member, setMember] = useState<MemberResponse | null>(null);
  const [profileError, setProfileError] = useState('');

  useEffect(() => {
    if (!tokenStorage.getAccessToken() && !tokenStorage.getRefreshToken()) return;
    authApi.me().then(setMember).catch(() => setProfileError('계정 정보를 불러오지 못했습니다.'));
  }, []);

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
              <strong>{member?.name ?? '게스트'}</strong>
              <span>{member?.email ?? '로그인 후 계정 정보를 확인할 수 있습니다.'}</span>
            </div>
          </div>
          <dl>
            <div>
              <dt>소속</dt>
              <dd>{member?.projects?.length ? `참여 프로젝트 ${member.projects.length}개` : '—'}</dd>
            </div>
            <div>
              <dt>직책</dt>
              <dd>{member?.projects?.[0]?.role ?? '—'}</dd>
            </div>
            <div>
              <dt>가입일</dt>
              <dd>—</dd>
            </div>
          </dl>
          {member && <Link href="/profile/edit" className="wf-profile-edit">프로필 수정</Link>}
          {profileError && <p role="alert">{profileError}</p>}
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
  const [member, setMember] = useState<MemberResponse | null>(null);
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    authApi.me().then((value) => { setMember(value); setName(value.name); })
      .catch(() => setError('계정 정보를 불러오지 못했습니다.'));
  }, []);
  const save = async () => {
    if (!name.trim()) { setError('이름을 입력해 주세요.'); return; }
    setSaving(true);
    try { await authApi.updateProfile(name.trim()); router.push('/profile'); }
    catch (cause) { setError(cause instanceof Error ? cause.message : '프로필 저장에 실패했습니다.'); }
    finally { setSaving(false); }
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
            <div className="wf-profile-photo"><Avatar /><small>사진 업로드는 아직 지원되지 않습니다.</small></div>
            <div className="wf-profile-fields">
              <label>
                이름
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                />
              </label>
              <label>
                이메일
                <input value={member?.email ?? ''} disabled />
                <small>이메일은 변경할 수 없습니다.</small>
              </label>
              <label>
                소속
                <input value={member?.projects?.length ? `참여 프로젝트 ${member.projects.length}개` : ''} disabled />
              </label>
              <label>
                직책
                <input value={member?.projects?.[0]?.role ?? ''} disabled />
              </label>
              <div className="wf-profile-field">
                비밀번호 변경
                <button type="button" className="wf-password-change" disabled>
                  ▣　비밀번호 변경하기
                </button>
              </div>
              <p>비밀번호 변경과 알림 설정은 서버 지원 후 사용할 수 있습니다.</p>
              {error && <p role="alert">{error}</p>}
              <div className="wf-profile-save">
                <button type="button" onClick={save} disabled={saving || !member}>
                  {saving ? '저장 중…' : '저장'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
