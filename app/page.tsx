'use client';

import { useEffect, useSyncExternalStore } from 'react';
import { DashboardOverview } from '@/components/dashboard/dashboard-overview';
import { AppShell } from '@/components/layout/app-shell';
import { tokenStorage } from '@/lib/api/client';

const subscribe = () => () => {};
const getSessionSnapshot = () =>
  Boolean(tokenStorage.getAccessToken() || tokenStorage.getRefreshToken());
const getServerSnapshot = () => null;

export default function Home() {
  const ready = useSyncExternalStore(subscribe, getSessionSnapshot, getServerSnapshot);

  useEffect(() => {
    // Tokens live in browser storage; defer the home screen until it is checked.
    if (ready === false) {
      window.location.replace('/login');
    }
  }, [ready]);

  if (!ready) return <main aria-busy="true" aria-label="로그인 상태 확인 중" />;

  return (
    <AppShell currentPath="/">
      <DashboardOverview />
    </AppShell>
  );
}
