'use client';
import { useEffect, useState } from 'react';
export function GuestSessionNotice() {
  const [notice, setNotice] = useState('');
  useEffect(() => { queueMicrotask(() => setNotice(window.sessionStorage.getItem('perfumery:guest-session-notice') ?? '')); }, []);
  if (!notice) return null;
  return <div className="guest-session-notice"><output>{notice}</output><button type="button" onClick={() => { window.sessionStorage.removeItem('perfumery:guest-session-notice'); setNotice(''); }}>확인</button></div>;
}
