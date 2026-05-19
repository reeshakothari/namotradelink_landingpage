'use client';
import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';

export default function CompanyLogin() {
  const { companyId } = useParams();
  const router = useRouter();

  useEffect(() => {
    router.replace(`/${companyId}/dashboard`);
  }, [companyId, router]);

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0d1b30 0%, #1a2a4a 60%, #0d1b30 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div style={{ background: '#fff', borderRadius: 20, padding: '48px 44px', width: '100%', maxWidth: 420, boxShadow: '0 24px 80px rgba(0,0,0,0.35)' }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 36 }}>
          <Image src="/logo.png" alt="Namo Steel" width={40} height={40} style={{ objectFit: 'contain' }} />
          <div>
            <div style={{ fontWeight: 900, fontSize: 16, color: '#1a2a4a', letterSpacing: '0.08em' }}>NAMO STEEL</div>
            <div style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Company Portal</div>
          </div>
        </div>

        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1a2a4a', margin: '0 0 6px' }}>Welcome back</h1>
        <p style={{ fontSize: 14, color: '#64748b', margin: '0 0 28px' }}>
          Redirecting to <strong style={{ color: '#e87722' }}>/{companyId}</strong> dashboard…
        </p>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px 0', color: '#94a3b8', fontSize: 14 }}>
          Loading…
        </div>

        <p style={{ textAlign: 'center', fontSize: 12, color: '#94a3b8', marginTop: 24, marginBottom: 0 }}>
          Don&apos;t have access? Contact <a href="https://wa.me/919860489490" style={{ color: '#e87722', textDecoration: 'none' }}>Namo Steel</a>
        </p>
      </div>
    </div>
  );
}
