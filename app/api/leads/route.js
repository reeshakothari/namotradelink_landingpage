import postgres from 'postgres';

export const dynamic = 'force-dynamic';

function getDB() {
  return postgres(process.env.POSTGRES_URL, { ssl: 'require', max: 1 });
}

async function ensureTable(db) {
  await db`
    CREATE TABLE IF NOT EXISTS leads (
      id        bigserial PRIMARY KEY,
      name      text NOT NULL,
      phone     text NOT NULL,
      email     text,
      company   text,
      requirement text,
      notes     text,
      status    text DEFAULT 'new',
      type      text DEFAULT 'inbound',
      date      text,
      created_at timestamptz DEFAULT now()
    )
  `;
  await db`ALTER TABLE leads ADD COLUMN IF NOT EXISTS quality  text DEFAULT 'warm'`;
  await db`ALTER TABLE leads ADD COLUMN IF NOT EXISTS ref_link text`;
}

// GET /api/leads — fetch all leads
export async function GET() {
  if (!process.env.POSTGRES_URL) return Response.json([]);
  try {
    const db = getDB();
    await ensureTable(db);
    const rows = await db`SELECT * FROM leads ORDER BY created_at DESC`;
    await db.end();
    return Response.json(rows);
  } catch (err) {
    console.error('[leads GET]', err);
    return Response.json([]);
  }
}

// POST /api/leads — insert a new lead
export async function POST(request) {
  if (!process.env.POSTGRES_URL)
    return Response.json({ ok: false, error: 'DB_NOT_CONFIGURED' }, { status: 500 });
  try {
    const body = await request.json();
    const db = getDB();
    await ensureTable(db);
    const [row] = await db`
      INSERT INTO leads (name, phone, email, company, requirement, notes, status, type, date, quality, ref_link)
      VALUES (
        ${body.name ?? ''},
        ${body.phone ?? ''},
        ${body.email ?? null},
        ${body.company ?? null},
        ${body.requirement ?? null},
        ${body.notes ?? null},
        ${body.status ?? 'new'},
        ${body.type ?? 'inbound'},
        ${body.date ?? new Date().toLocaleDateString('en-IN')},
        ${body.quality ?? 'warm'},
        ${body.ref_link ?? null}
      )
      RETURNING *
    `;
    await db.end();
    return Response.json(row);
  } catch (err) {
    console.error('[leads POST]', err);
    return Response.json({ ok: false, error: String(err?.message ?? err) }, { status: 500 });
  }
}

// PATCH /api/leads — update a lead by id
export async function PATCH(request) {
  if (!process.env.POSTGRES_URL)
    return Response.json({ ok: false, error: 'DB_NOT_CONFIGURED' }, { status: 500 });
  try {
    const { id, ...fields } = await request.json();
    const db = getDB();
    await db`
      UPDATE leads SET
        name        = COALESCE(${fields.name ?? null}, name),
        phone       = COALESCE(${fields.phone ?? null}, phone),
        email       = COALESCE(${fields.email ?? null}, email),
        company     = COALESCE(${fields.company ?? null}, company),
        requirement = COALESCE(${fields.requirement ?? null}, requirement),
        notes       = COALESCE(${fields.notes ?? null}, notes),
        status      = COALESCE(${fields.status ?? null}, status),
        type        = COALESCE(${fields.type ?? null}, type),
        quality     = COALESCE(${fields.quality ?? null}, quality),
        ref_link    = COALESCE(${fields.ref_link ?? null}, ref_link)
      WHERE id = ${id}
    `;
    await db.end();
    return Response.json({ ok: true });
  } catch (err) {
    console.error('[leads PATCH]', err);
    return Response.json({ ok: false, error: String(err?.message ?? err) }, { status: 500 });
  }
}

// DELETE /api/leads?id=X — delete a lead
export async function DELETE(request) {
  if (!process.env.POSTGRES_URL)
    return Response.json({ ok: false, error: 'DB_NOT_CONFIGURED' }, { status: 500 });
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const db = getDB();
    await db`DELETE FROM leads WHERE id = ${id}`;
    await db.end();
    return Response.json({ ok: true });
  } catch (err) {
    console.error('[leads DELETE]', err);
    return Response.json({ ok: false, error: String(err?.message ?? err) }, { status: 500 });
  }
}
