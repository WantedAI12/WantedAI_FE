'use client';

import { useState } from 'react';
import Link from '@/components/ui/app-link';
import { authApi } from '@/lib/api/resources';
import { ApiError } from '@/lib/api/client';

export function ForgotPasswordForm() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function submit(event: React.SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    const email = new FormData(event.currentTarget).get('email');
    if (typeof email !== 'string') return;
    setLoading(true);
    setError('');
    try {
      await authApi.forgotPassword(email);
      setSent(true);
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : '요청에 실패했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  }

  return <main className="wf-forgot"><section className="wf-forgot-card">
    <Link href="/" className="wf-auth-brand">PERFUMERY</Link>
    <h1 className="wf-auth-title" style={{marginTop:56}}>비밀번호 찾기</h1>
    <p className="wf-forgot-copy">가입한 이메일을 입력하면 비밀번호 재설정 안내를 보내드립니다.</p>
    {sent ? <p className="wf-forgot-copy" style={{marginTop:36}}>가입 여부와 관계없이, 입력한 이메일로 재설정 안내가 발송됩니다.</p> :
      <form onSubmit={submit}>
        <label className="wf-auth-label">이메일<input className="wf-auth-input" name="email" type="email" required placeholder="이메일을 입력하세요." /></label>
        {error && <p role="alert" className="wf-forgot-error">{error}</p>}
        <button className="wf-auth-submit" disabled={loading}>{loading ? '요청 중...' : '재설정 안내 받기'}</button>
      </form>}
    <div className="wf-forgot-actions"><Link className="wf-btn" href="/login">로그인으로 돌아가기</Link></div>
  </section></main>;
}
