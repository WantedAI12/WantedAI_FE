'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

const DESKTOP_BREAKPOINT = 901;
const DESIGN_HEIGHT = 1024;
const UNSCALED_PATHS = new Set(['/login', '/signup', '/forgot-password']);

export function DesktopViewportFit() {
  const pathname = usePathname();

  useEffect(() => {
    const updateScale = () => {
      const isDesktop = window.innerWidth >= DESKTOP_BREAKPOINT;
      const keepsOriginalSize = UNSCALED_PATHS.has(pathname);
      const scale = isDesktop && !keepsOriginalSize
        ? Math.min(1, window.innerHeight / DESIGN_HEIGHT)
        : 1;

      document.documentElement.style.setProperty('--desktop-fit-scale', String(scale));
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => {
      window.removeEventListener('resize', updateScale);
      document.documentElement.style.removeProperty('--desktop-fit-scale');
    };
  }, [pathname]);

  return null;
}
