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
      <label className="wire-signup-row row-1"><span>닉네임</span><input className="wire-signup-input" name="name" required placeholder="닉네임을 입력하세요." /></label>
      <label className="wire-signup-row row-2"><span>이메일</span><input className="wire-signup-input" name="email" type="email" required placeholder="이메일을 입력하세요." /></label>
      <label className="wire-signup-row row-3"><span>비밀번호</span><input className="wire-signup-input" name="password" type="password" required placeholder="비밀번호를 입력하세요." /></label>
      <label className="wire-signup-row row-4"><span>비밀번호 확인</span><input className="wire-signup-input" name="confirm" type="password" required placeholder="비밀번호를 다시 입력하세요." /></label>
      <div className="wire-signup-row row-5 wire-signup-actions"><span aria-hidden="true" /><button type="submit" className="wire-signup-submit">회원가입</button></div>
    </form>
  </div></main>;
}
