'use client';
import { useState, useEffect } from 'react';
import { getSiteContent } from './siteContent';

export function useSiteContent() {
  const [content, setContent] = useState(getSiteContent);

  useEffect(() => {
    const handler = () => setContent(getSiteContent());
    window.addEventListener('ntl-content-updated', handler);
    return () => window.removeEventListener('ntl-content-updated', handler);
  }, []);

  return content;
}
