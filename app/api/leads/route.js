export const dynamic = 'force-dynamic';

// Proxy to the VAI platform — no Supabase credentials needed on the client site.
// VAI_API_URL and VAI_SITE_ID are set as Vercel env vars during site creation.

function getApiBase() {
  return (process.env.VAI_API_URL ?? 'https://www.vai.ad').replace(/\/$/, '');
}

// POST /api/leads — submit a new lead from the contact form
export async function POST(request) {
  try {
    const body = await request.json();
    const res = await fetch(`${getApiBase()}/api/collect-lead`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        site_id:      process.env.VAI_SITE_ID ?? 'unknown',
        company_name: process.env.VAI_COMPANY_NAME ?? null,
        name:         body.name        ?? '',
        phone:        body.phone       ?? '',
        email:        body.email       ?? null,
        requirement:  body.requirement ?? null,
        notes:        body.notes       ?? null,
        source:       'website_form',
      }),
    });
    const data = await res.json();
    if (!data.ok) throw new Error(data.error ?? 'Failed');
    return Response.json(data);
  } catch (err) {
    console.error('[leads POST]', err);
    return Response.json({ ok: false, error: String(err?.message ?? err) }, { status: 500 });
  }
}

// GET /api/leads — fetch leads for this site (used by dashboard)
export async function GET() {
  try {
    const site_id = process.env.VAI_SITE_ID ?? 'unknown';
    const res = await fetch(
      `${getApiBase()}/api/collect-lead?site_id=${encodeURIComponent(site_id)}`,
      { cache: 'no-store' }
    );
    const data = await res.json();
    return Response.json(data.leads ?? []);
  } catch (err) {
    console.error('[leads GET]', err);
    return Response.json([]);
  }
}

// PATCH /api/leads — update a lead
export async function PATCH(request) {
  try {
    const body = await request.json();
    const res = await fetch(`${getApiBase()}/api/collect-lead`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return Response.json(data);
  } catch (err) {
    return Response.json({ ok: false, error: String(err?.message ?? err) }, { status: 500 });
  }
}
