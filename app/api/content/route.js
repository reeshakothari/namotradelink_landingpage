import { kv } from '@vercel/kv';
import fileContent from '../../../data/content.json';

const KEY = 'ntl_site_content';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const content = await kv.get(KEY);
    return Response.json(content ?? fileContent, {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch {
    // KV not configured yet — serve the committed file
    return Response.json(fileContent);
  }
}

export async function POST(request) {
  if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
    return Response.json({ ok: false, error: 'KV_NOT_CONFIGURED' }, { status: 500 });
  }
  try {
    const content = await request.json();
    await kv.set(KEY, content);
    return Response.json({ ok: true });
  } catch (err) {
    console.error('[content POST]', err);
    return Response.json({ ok: false, error: String(err?.message ?? err) }, { status: 500 });
  }
}
