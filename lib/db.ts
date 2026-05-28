import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

export { sql };


const SEED_INVENTORY = [
  {
    id: "GTR-CUT-19C-001",
    name: "Silver Fish Fork Set",
    name_fr: "Service à poisson en argent",
    category: "CUT",
    era: "19C",
    quantity: 48,
    qty_available: 48,
    status: "available",
    origin: "Bordeaux",
    value: 12000,
    description: "48-piece silver fish fork set, hallmarked 1872",
  },
  {
    id: "GTR-TAB-NAP-001",
    name: "Limoges Dinner Plates",
    name_fr: "Assiettes de dîner Limoges",
    category: "TAB",
    era: "NAP",
    quantity: 60,
    qty_available: 52,
    status: "available",
    origin: "Limoges, France",
    value: 36000,
    description: "Hand-painted Napoleonic-era dinner plates",
  },
  {
    id: "GTR-GLS-ART-001",
    name: "Crystal Champagne Flutes",
    name_fr: "Flûtes à champagne en cristal",
    category: "GLS",
    era: "ART",
    quantity: 120,
    qty_available: 110,
    status: "available",
    origin: "Baccarat, France",
    value: 48000,
    description: "Art Deco Baccarat crystal champagne flutes",
  },
  {
    id: "GTR-CHR-LXV-001",
    name: "Louis XV Gilt Chairs",
    name_fr: "Chaises dorées Louis XV",
    category: "CHR",
    era: "LXV",
    quantity: 24,
    qty_available: 20,
    status: "available",
    origin: "Paris, France",
    value: 96000,
    description: "Authentic Louis XV carved and gilt chairs with silk upholstery",
  },
  {
    id: "GTR-TBL-EMP-001",
    name: "Empire Dining Tables",
    name_fr: "Tables de salle à manger Empire",
    category: "TBL",
    era: "EMP",
    quantity: 6,
    qty_available: 4,
    status: "available",
    origin: "Lyon, France",
    value: 72000,
    description: "Mahogany Empire-style extendable dining tables",
  },
];

const SEED_CLIENTS = [
  {
    id: "CLT-001",
    name: "Hôtel La Mamounia",
    company: "La Mamounia SARL",
    email: "events@mamounia.com",
    phone: "+212 524 388 600",
    city: "Marrakech",
    address: "Avenue Bab Jdid",
    notes: "Premium client — luxury events",
  },
  {
    id: "CLT-002",
    name: "Fatima Zahra Benali",
    company: "FZB Events",
    email: "fzb@events.ma",
    phone: "+212 661 234 567",
    city: "Marrakech",
    address: "Quartier Guéliz",
    notes: "",
  },
];

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

  const [{ count }] = await sql`SELECT COUNT(*)::int AS count FROM inventory`;
  if (count === 0) {
    for (const item of SEED_INVENTORY) {
      await sql`
        INSERT INTO inventory (id, name, name_fr, category, era, quantity, qty_available, status, origin, value, description)
        VALUES (${item.id}, ${item.name}, ${item.name_fr}, ${item.category}, ${item.era},
                ${item.quantity}, ${item.qty_available}, ${item.status}, ${item.origin},
                ${item.value}, ${item.description})
        ON CONFLICT (id) DO NOTHING
      `;
    }
    for (const client of SEED_CLIENTS) {
      await sql`
        INSERT INTO clients (id, name, company, email, phone, city, address, notes)
        VALUES (${client.id}, ${client.name}, ${client.company}, ${client.email},
                ${client.phone}, ${client.city}, ${client.address}, ${client.notes})
        ON CONFLICT (id) DO NOTHING
      `;
    }
  }
}
