'use client';

import { useState } from 'react';
import Link from '@/components/ui/app-link';
import Image from 'next/image';
import { authApi } from '@/lib/api/resources';
import { ApiError } from '@/lib/api/client';
import { GuestSessionNotice } from './guest-session-notice';

export function LoginForm() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [remember, setRemember] = useState(false);
  const [guestLoading, setGuestLoading] = useState(false);

  async function submit(e: React.SyntheticEvent<HTMLFormElement, SubmitEvent>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const email = form.get('email');
    const password = form.get('password');
    if (typeof email !== 'string' || typeof password !== 'string') return;

    setLoading(true);
    setError('');
    try {
      await authApi.login({ email, password }, remember);
      location.assign('/');
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : '로그인에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }

  async function continueAsGuest() {
    setGuestLoading(true);
    setError('');
    try {
      await authApi.guestLogin();
      location.assign('/');
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : '게스트 로그인을 시작하지 못했습니다.');
      setGuestLoading(false);
    }
  }

  return (
    <main className="wf-auth">
      <Link href="/" className="wf-auth-brand">PERFUMERY</Link>
      <div className="wf-auth-grid">
        <section>
          <h1 className="wf-auth-message">
            <Image className="wf-auth-script" src="/figma/home-script-logo.svg" alt="Design" width={354} height={109} priority />
            Scents.<br />With Intelligence.
          </h1>
          <p className="wf-auth-copy">향의 언어를 데이터로, 데이터를 조향식으로,<br />조향식을 검증 가능한 연구로.</p>
        </section>
        <section className="wf-auth-card">
          <h2 className="wf-auth-title">로그인</h2>
          <GuestSessionNotice />
          {error && <p className="signup-error">{error}</p>}
          <form onSubmit={submit}>
            <label className="wf-auth-label">이메일<input className="wf-auth-input" name="email" type="email" required placeholder="이메일을 입력하세요." /></label>
            <label className="wf-auth-label">비밀번호<input className="wf-auth-input" name="password" type="password" required placeholder="비밀번호를 입력하세요." /></label>
            <div className="wf-auth-row">
              <label className="wf-remember"><input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} /> 로그인 상태 유지</label>
              <Link href="/forgot-password">비밀번호 찾기</Link>
            </div>
            <button className="wf-auth-submit" disabled={loading || guestLoading}>{loading ? '로그인 중...' : '로그인'}</button>
          </form>
          <div className="wf-divider" />
          <button className="wf-easy wf-guest-login" type="button" onClick={continueAsGuest} disabled={loading || guestLoading}>{guestLoading ? '게스트 시작 중...' : '게스트로 시작하기'}</button>
          <p style={{ fontSize: 13, lineHeight: 1.6, marginTop: 12 }}>게스트로 시작할 때마다 새 계정이 생성됩니다. 이전 게스트의 프로젝트는 새 계정에서 보이지 않습니다.</p>
          <p className="wf-auth-foot">계정이 없으신가요? <Link href="/signup"><b>회원가입</b></Link></p>
        </section>
      </div>
    </main>
  );
}
