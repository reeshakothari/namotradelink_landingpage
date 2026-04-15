import { kv } from '@vercel/kv';
import fileContent from '../../../data/content.json';

const KV_KEY = 'ntl_site_content';

export async function GET() {
  try {
    const content = await kv.get(KV_KEY);
    return Response.json(content ?? fileContent);
  } catch {
    // KV not yet configured — fall back to the committed file
    return Response.json(fileContent);
  }
}

export async function POST(request) {
  try {
    const content = await request.json();
    await kv.set(KV_KEY, content);
    return Response.json({ ok: true });
  } catch (err) {
    const notConfigured =
      !process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN;
    return Response.json(
      {
        ok: false,
        error: notConfigured
          ? 'KV_NOT_CONFIGURED'
          : String(err?.message ?? err),
      },
      { status: 500 }
    );
  }
}
