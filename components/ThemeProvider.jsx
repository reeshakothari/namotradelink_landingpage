'use client';
import { useEffect } from 'react';
import { useSiteContent } from '@/lib/useSiteContent';

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r}, ${g}, ${b}`;
}

function darken(hex, amount = 30) {
  const r = Math.max(0, parseInt(hex.slice(1, 3), 16) - amount);
  const g = Math.max(0, parseInt(hex.slice(3, 5), 16) - amount);
  const b = Math.max(0, parseInt(hex.slice(5, 7), 16) - amount);
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

function lighten(hex, amount = 20) {
  const r = Math.min(255, parseInt(hex.slice(1, 3), 16) + amount);
  const g = Math.min(255, parseInt(hex.slice(3, 5), 16) + amount);
  const b = Math.min(255, parseInt(hex.slice(5, 7), 16) + amount);
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

export default function ThemeProvider() {
  const content = useSiteContent();
  const theme = content?.theme;

  useEffect(() => {
    if (!theme?.primary || !theme?.secondary) return;
    const root = document.documentElement;
    root.style.setProperty('--orange', theme.primary);
    root.style.setProperty('--orange-dark', theme.primaryDark || darken(theme.primary));
    root.style.setProperty('--navy', theme.secondary);
    root.style.setProperty('--navy-light', theme.secondaryLight || lighten(theme.secondary));
  }, [theme]);

  return null;
}
