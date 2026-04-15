import { put, list } from '@vercel/blob';
import fileContent from '../../../data/content.json';

const BLOB_NAME = 'ntl-site-content.json';

export async function GET() {
  try {
    const { blobs } = await list({ prefix: BLOB_NAME });
    if (blobs.length > 0) {
      const res = await fetch(blobs[0].url, { cache: 'no-store' });
      const content = await res.json();
      return Response.json(content);
    }
    // No blob yet — return the committed file defaults
    return Response.json(fileContent);
  } catch {
    return Response.json(fileContent);
  }
}

export async function POST(request) {
  try {
    const content = await request.json();
    await put(BLOB_NAME, JSON.stringify(content), {
      access: 'public',
      addRandomSuffix: false,
      contentType: 'application/json',
    });
    return Response.json({ ok: true });
  } catch (err) {
    const notConfigured = !process.env.BLOB_READ_WRITE_TOKEN;
    return Response.json(
      {
        ok: false,
        error: notConfigured ? 'BLOB_NOT_CONFIGURED' : String(err?.message ?? err),
      },
      { status: 500 }
    );
  }
}
