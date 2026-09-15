'use client';

import { useState } from 'react';
import Link from 'next/link';
import { authApi } from '@/lib/api/resources';
import { ApiError } from '@/lib/api/client';

export function SignupForm() {
  const [error, setError] = useState('');

  async function submit(event: React.SyntheticEvent<HTMLFormElement, SubmitEvent>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = form.get('name');
    const email = form.get('email');
    const password = form.get('password');
    const confirm = form.get('confirm');

    if (typeof name !== 'string' || typeof email !== 'string' || typeof password !== 'string' || typeof confirm !== 'string') return;
    if (password !== confirm) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    try {
      await authApi.signup({ email, password, name });
      location.assign('/login');
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : '회원가입에 실패했습니다.');
    }
  }

  return <main className="wire-signup"><div className="wire-signup-canvas">
    <Link href="/" className="wire-signup-brand">PERFUMERY AI CORE</Link>
    <form className="wire-signup-form" onSubmit={submit}>
      {error && <p className="signup-error">{error}</p>}
      <label className="wire-signup-row row-1"><span>이메일</span><input className="wire-signup-input" name="email" type="email" required placeholder="이메일을 입력하세요." /></label>
      <label className="wire-signup-row row-2"><span>비밀번호</span><input className="wire-signup-input" name="password" type="password" required placeholder="비밀번호를 입력하세요." /></label>
      <label className="wire-signup-row row-3"><span>비밀번호 확인</span><input className="wire-signup-input" name="confirm" type="password" required placeholder="비밀번호를 다시 입력하세요." /></label>
      <label className="wire-signup-row row-4"><span>이름</span><input className="wire-signup-input" name="name" required placeholder="이름을 입력하세요." /></label>
      <label className="wire-signup-row row-5"><span>소속/회사명</span><input className="wire-signup-input" name="company" placeholder="소속 또는 회사명을 입력하세요." /></label>
      <div className="wire-signup-row row-6 wire-signup-actions"><span aria-hidden="true" /><button type="submit" className="wire-signup-submit">회원가입</button></div>
      <p className="wire-signup-login">이미 계정이 있으신가요? <Link href="/login">로그인</Link></p>
    </form>
  </div></main>;
}
