'use client';

import { useState } from 'react';
import { AlertCircle, Leaf, LoaderCircle } from 'lucide-react';
import { authApi } from '@/lib/api/resources';
import { ApiError } from '@/lib/api/client';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function LoginForm() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(
    event: React.SyntheticEvent<HTMLFormElement, SubmitEvent>,
  ) {
    event.preventDefault();
    setLoading(true);
    setError('');
    const data = new FormData(event.currentTarget);
    const email = data.get('email');
    const password = data.get('password');
    if (typeof email !== 'string' || typeof password !== 'string') {
      setError('이메일과 비밀번호를 확인해주세요.');
      setLoading(false);
      return;
    }
    try {
      await authApi.login({
        email,
        password,
      });
      window.location.assign('/projects');
    } catch (cause) {
      setError(
        cause instanceof ApiError
          ? cause.message
          : '로그인 중 알 수 없는 오류가 발생했습니다.',
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-background px-5">
      <section className="w-full max-w-md rounded-3xl border bg-card p-7 shadow-xl shadow-primary/5 sm:p-9">
        <div className="mb-8 flex items-center gap-3">
          <div className="grid size-11 place-items-center rounded-2xl bg-primary text-primary-foreground">
            <Leaf className="size-5" />
          </div>
          <div>
            <h1 className="text-xl font-semibold">Perfumery AI</h1>
            <p className="text-sm text-muted-foreground">
              R&amp;D Workspace 로그인
            </p>
          </div>
        </div>
        {error && (
          <Alert variant="destructive" className="mb-5">
            <AlertCircle />
            <AlertTitle>로그인 실패</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <label htmlFor="email" className="block text-sm font-medium">
            이메일
            <Input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="mt-2 h-10"
              placeholder="name@company.com"
            />
          </label>
          <label htmlFor="password" className="block text-sm font-medium">
            비밀번호
            <Input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="mt-2 h-10"
            />
          </label>
          <Button
            type="submit"
            disabled={loading}
            className="mt-2 h-10 w-full rounded-xl"
          >
            {loading && <LoaderCircle className="size-4 animate-spin" />}
            {loading ? '연결 중' : '로그인'}
          </Button>
        </form>
        <p className="mt-5 text-center text-xs leading-5 text-muted-foreground">
          현재 백엔드가 실행 중이어야 로그인할 수 있습니다.
          <br />
          토큰은 브라우저 세션이 끝나면 삭제됩니다.
        </p>
      </section>
    </main>
  );
}
