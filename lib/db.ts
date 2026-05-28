import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

export { sql };

let initialized = false;

export async function initDb() {
  if (initialized) return;
  initialized = true;

  await sql`CREATE TABLE IF NOT EXISTS inventory (
    id            VARCHAR PRIMARY KEY,
    name          VARCHAR NOT NULL,
    name_fr       VARCHAR,
    category      VARCHAR NOT NULL,
    era           VARCHAR,
    quantity      INTEGER DEFAULT 0,
    qty_available INTEGER DEFAULT 0,
    status        VARCHAR DEFAULT 'available',
    origin        VARCHAR,
    value         NUMERIC,
    description   TEXT,
    notes         TEXT,
    created_at    TIMESTAMPTZ DEFAULT NOW()
  )`;

  await sql`CREATE TABLE IF NOT EXISTS clients (
    id         VARCHAR PRIMARY KEY,
    name       VARCHAR NOT NULL,
    company    VARCHAR,
    email      VARCHAR,
    phone      VARCHAR,
    city       VARCHAR,
    address    TEXT,
    notes      TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
  )`;

  await sql`CREATE TABLE IF NOT EXISTS orders (
    id         VARCHAR PRIMARY KEY,
    client_id  VARCHAR REFERENCES clients(id) ON DELETE SET NULL,
    status     VARCHAR DEFAULT 'draft',
    start_date DATE,
    end_date   DATE,
    total      NUMERIC DEFAULT 0,
    items      JSONB DEFAULT '[]',
    notes      TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
  )`;

  await sql`CREATE TABLE IF NOT EXISTS damage_reports (
    id          VARCHAR PRIMARY KEY,
    item_id     VARCHAR REFERENCES inventory(id) ON DELETE SET NULL,
    report_date DATE,
    severity    VARCHAR DEFAULT 'minor',
    repair_cost NUMERIC DEFAULT 0,
    description TEXT,
    notes       TEXT,
    status      VARCHAR DEFAULT 'pending',
    created_at  TIMESTAMPTZ DEFAULT NOW()
  )`;
}
