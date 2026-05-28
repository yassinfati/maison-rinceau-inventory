"use client";

import { InventoryItem, Order, Client, DamageReport } from "@/lib/types";

const CATEGORIES: Record<string, { en: string; fr: string }> = {
  TAB: { en: "Tableware", fr: "Art de la table" },
  CUT: { en: "Cutlery", fr: "Couverts" },
  GLS: { en: "Glassware", fr: "Verrerie" },
  CHR: { en: "Chairs", fr: "Chaises" },
  TBL: { en: "Tables", fr: "Tables" },
  LIN: { en: "Linen", fr: "Linge de table" },
  DEC: { en: "Decorative", fr: "Décoration" },
};

const ORDER_STATUS: Record<string, { c: string; bg: string }> = {
  draft: { c: "#94a3b8", bg: "rgba(148,163,184,0.10)" },
  confirmed: { c: "#60a5fa", bg: "rgba(96,165,250,0.10)" },
  active: { c: "#c9a455", bg: "rgba(201,164,85,0.12)" },
  completed: { c: "#4ade80", bg: "rgba(74,222,128,0.12)" },
  cancelled: { c: "#f87171", bg: "rgba(248,113,113,0.10)" },
};

interface Props {
  inventory: InventoryItem[];
  orders: Order[];
  clients: Client[];
  damage: DamageReport[];
  lang: "en" | "fr";
}

export default function Dashboard({ inventory, orders, clients, damage, lang }: Props) {
  const totalUnits = inventory.reduce((s, i) => s + (i.quantity || 0), 0);
  const availableUnits = inventory.reduce((s, i) => s + (i.qty_available || 0), 0);
  const activeOrders = orders.filter(o => o.status === "active" || o.status === "confirmed").length;
  const openDamage = damage.filter(d => d.status === "pending").length;

  const catBreakdown = Object.entries(CATEGORIES).map(([key, val]) => ({
    label: val[lang],
    total: inventory.filter(i => i.category === key).reduce((s, i) => s + (i.quantity || 0), 0),
    available: inventory.filter(i => i.category === key).reduce((s, i) => s + (i.qty_available || 0), 0),
    rented: inventory.filter(i => i.category === key).reduce((s, i) => s + Math.max(0, (i.quantity || 0) - (i.qty_available || 0)), 0),
  })).filter(c => c.total > 0);

  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
    .slice(0, 6);

  const stats = [
    { v: inventory.length, l: "Catalogue SKUs" },
    { v: totalUnits, l: "Total Units" },
    { v: availableUnits, l: "Available", col: availableUnits > 0 ? "#4ade80" : "#f87171" },
    { v: activeOrders, l: "Active Orders", col: "#c9a455" },
    { v: clients.length, l: "Total Clients", col: "#c9a455" },
    { v: openDamage, l: "Open Damage Reports", col: openDamage > 0 ? "#fb923c" : "#4a4030" },
  ];

  return (
    <div>
      {/* Stat cards */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 28 }}>
        {stats.map((s, i) => (
          <div key={i} className="sc">
            <div className="sv" style={s.col ? { color: s.col } : undefined}>{s.v}</div>
            <div className="sl">{s.l}</div>
          </div>
        ))}
      </div>

      {/* Category breakdown */}
      <div className="card">
        <div className="card-head">Category Breakdown</div>
        <table>
          <thead>
            <tr>
              <th>Category</th>
              <th>Total</th>
              <th>Available</th>
              <th>Rented</th>
              <th>Utilization</th>
            </tr>
          </thead>
          <tbody>
            {catBreakdown.length === 0 ? (
              <tr><td colSpan={5} style={{ textAlign: "center", padding: 32, color: "var(--text-faint)" }}>No inventory data.</td></tr>
            ) : catBreakdown.map((c, i) => {
              const pct = c.total ? Math.round((c.rented / c.total) * 100) : 0;
              return (
                <tr key={i}>
                  <td style={{ color: "var(--text)", fontWeight: 500 }}>{c.label}</td>
                  <td>{c.total}</td>
                  <td style={{ color: c.available === 0 ? "#f87171" : "#4ade80" }}>{c.available}</td>
                  <td style={{ color: "#c9a455" }}>{c.rented}</td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div className="bar-wrap">
                        <div className="bar-fill" style={{ width: `${pct}%` }} />
                      </div>
                      <span style={{ fontSize: 11, color: "var(--text-faint)", minWidth: 30 }}>{pct}%</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Recent orders */}
      {recentOrders.length > 0 && (
        <div className="card">
          <div className="card-head">Recent Orders</div>
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Client</th>
                <th>Start Date</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map(o => {
                const client = clients.find(c => c.id === o.client_id);
                const m = ORDER_STATUS[o.status] || ORDER_STATUS.draft;
                return (
                  <tr key={o.id}>
                    <td className="mono">{o.id}</td>
                    <td style={{ color: "var(--text)", fontWeight: 500 }}>{client?.name || "—"}</td>
                    <td>{o.start_date || "—"}</td>
                    <td style={{ color: "var(--text-muted)" }}>{(o.items || []).length} items</td>
                    <td>{Number(o.total || 0).toLocaleString()} MAD</td>
                    <td>
                      <span className="chip" style={{ background: m.bg, color: m.c }}>{o.status}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
