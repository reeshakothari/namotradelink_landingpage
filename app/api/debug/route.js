export async function GET() {
  return Response.json({
    BLOB_READ_WRITE_TOKEN: !!process.env.BLOB_READ_WRITE_TOKEN,
    BLOB_TOKEN_PREFIX: process.env.BLOB_READ_WRITE_TOKEN?.slice(0, 12) ?? 'NOT SET',
    NODE_ENV: process.env.NODE_ENV,
  });
}
