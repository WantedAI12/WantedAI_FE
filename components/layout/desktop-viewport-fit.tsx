'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

const DESKTOP_BREAKPOINT = 901;
const DESIGN_HEIGHT = 1024;
const UNSCALED_PATHS = new Set(['/', '/login', '/signup', '/forgot-password']);

export function DesktopViewportFit() {
  const pathname = usePathname();

  useEffect(() => {
    const updateScale = () => {
      const isDesktop = window.innerWidth >= DESKTOP_BREAKPOINT;
      const keepsOriginalSize = UNSCALED_PATHS.has(pathname);
      const scale =
        isDesktop && !keepsOriginalSize
          ? Math.min(1, window.innerHeight / DESIGN_HEIGHT)
          : 1;

      document.documentElement.style.setProperty(
        '--desktop-fit-scale',
        String(scale),
      );
      document.body.style.width =
        scale < 1 ? `${window.innerWidth / scale}px` : '100%';
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => {
      window.removeEventListener('resize', updateScale);
      document.documentElement.style.removeProperty('--desktop-fit-scale');
      document.body.style.removeProperty('width');
    };
  }, [pathname]);

  return null;
}
