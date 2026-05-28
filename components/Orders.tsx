"use client";

import { useState } from "react";
import Modal from "./Modal";
import { Order, Client, InventoryItem, OrderItem } from "@/lib/types";

const STATUS_STYLES: Record<string, { c: string; bg: string }> = {
  draft: { c: "#94a3b8", bg: "rgba(148,163,184,0.10)" },
  confirmed: { c: "#60a5fa", bg: "rgba(96,165,250,0.10)" },
  active: { c: "#c9a455", bg: "rgba(201,164,85,0.12)" },
  completed: { c: "#4ade80", bg: "rgba(74,222,128,0.12)" },
  cancelled: { c: "#f87171", bg: "rgba(248,113,113,0.10)" },
};

interface Props {
  data: Order[];
  setData: React.Dispatch<React.SetStateAction<Order[]>>;
  inventory: InventoryItem[];
  clients: Client[];
  lang: "en" | "fr";
}

export default function Orders({ data, setData, inventory, clients, lang }: Props) {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [modal, setModal] = useState<null | "add" | Order>(null);
  const [form, setForm] = useState<Partial<Order>>({});
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);

  const filtered = data.filter(o => {
    const client = clients.find(c => c.id === o.client_id);
    const q = search.toLowerCase();
    const matchQ = !q || o.id?.toLowerCase().includes(q) || client?.name?.toLowerCase().includes(q);
    const matchStatus = !filterStatus || o.status === filterStatus;
    return matchQ && matchStatus;
  });

  function f(field: keyof Order, val: unknown) {
    setForm(prev => ({ ...prev, [field]: val }));
  }

  function openAdd() {
    setForm({ status: "draft", start_date: new Date().toISOString().split("T")[0] });
    setOrderItems([]);
    setModal("add");
  }

  function openEdit(o: Order) {
    setForm({ ...o });
    setOrderItems(o.items || []);
    setModal(o);
  }

  function addLine() {
    setOrderItems(prev => [...prev, { item_id: inventory[0]?.id || "", qty: 1, unit_price: 0 }]);
  }

  function updateLine(idx: number, field: keyof OrderItem, val: string | number) {
    setOrderItems(prev => prev.map((it, i) => i === idx ? { ...it, [field]: val } : it));
  }

  const computedTotal = orderItems.reduce((s, it) => s + ((+it.qty || 0) * (+it.unit_price || 0)), 0);

  async function save() {
    const id = (form as Order).id || `ORD-${String(data.length + 1).padStart(4, "0")}`;
    const row = { ...form, id, items: orderItems, total: computedTotal } as Order;

    if (modal === "add") {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(row),
      });
      const saved = await res.json();
      setData(prev => [saved, ...prev]);
    } else {
      const res = await fetch(`/api/orders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(row),
      });
      const saved = await res.json();
      setData(prev => prev.map(o => o.id === id ? saved : o));
    }
    setModal(null);
  }

  async function del(id: string) {
    if (!confirm("Delete this order?")) return;
    await fetch(`/api/orders/${id}`, { method: "DELETE" });
    setData(prev => prev.filter(o => o.id !== id));
  }

  async function changeStatus(id: string, status: Order["status"]) {
    const order = data.find(o => o.id === id);
    if (!order) return;
    const updated = { ...order, status };
    const res = await fetch(`/api/orders/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    });
    const saved = await res.json();
    setData(prev => prev.map(o => o.id === id ? saved : o));
  }

  return (
    <div>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 22, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 className="pt">Orders</h1>
          <p className="ps">{data.length} total · {data.filter(o => o.status === "active").length} active</p>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <input className="inp" style={{ width: 180 }} placeholder="Search…" value={search} onChange={e => setSearch(e.target.value)} />
          <select className="sel" style={{ width: 130 }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="">All Status</option>
            {["draft", "confirmed", "active", "completed", "cancelled"].map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <button className="btn btn-g" onClick={openAdd}>+ New Order</button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "60px 20px", color: "var(--text-faint)" }}>
          No orders yet. Create your first rental order.
        </div>
      ) : filtered.map(o => {
        const client = clients.find(c => c.id === o.client_id);
        const m = STATUS_STYLES[o.status] || STATUS_STYLES.draft;
        const items = Array.isArray(o.items) ? o.items : [];
        return (
          <div key={o.id} className="oc">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 5 }}>
                  <span className="mono">{o.id}</span>
                  <span className="chip" style={{ background: m.bg, color: m.c }}>{o.status}</span>
                </div>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 17, fontWeight: 600, color: "var(--text)" }}>
                  {client?.name || "Unknown client"}
                </div>
                {client?.company && <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>{client.company}</div>}
                <div style={{ fontSize: 12, color: "var(--text-faint)", marginTop: 4 }}>
                  {o.start_date || "—"} → {o.end_date || "—"} · {items.length} items · {Number(o.total || 0).toLocaleString()} MAD
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                {o.status === "active" && (
                  <>
                    <button className="btn btn-o btn-sm" onClick={() => changeStatus(o.id, "completed")}>Mark Completed</button>
                    <button className="btn btn-d btn-sm" onClick={() => changeStatus(o.id, "cancelled")}>Cancel</button>
                  </>
                )}
                {o.status === "draft" && (
                  <button className="btn btn-o btn-sm" onClick={() => changeStatus(o.id, "confirmed")}>Confirm</button>
                )}
                {o.status === "confirmed" && (
                  <button className="btn btn-o btn-sm" onClick={() => changeStatus(o.id, "active")}>Activate</button>
                )}
                <button className="btn btn-o btn-sm" onClick={() => openEdit(o)}>Edit</button>
                <button className="btn btn-d btn-sm" onClick={() => del(o.id)}>Del</button>
              </div>
            </div>

            {items.length > 0 && (
              <div style={{ marginTop: 14, paddingTop: 13, borderTop: "1px solid rgba(255,255,255,0.04)" }}>
                <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--text-faint)", marginBottom: 9 }}>Items</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                  {items.map((it, idx) => {
                    const inv = inventory.find(i => i.id === it.item_id);
                    return inv ? (
                      <div key={idx} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 6, padding: "5px 11px", fontSize: 12 }}>
                        <span style={{ color: "var(--text-dim)" }}>{lang === "fr" && inv.name_fr ? inv.name_fr : inv.name}</span>
                        <span style={{ color: "var(--gold)", marginLeft: 5, fontWeight: 600 }}>×{it.qty}</span>
                      </div>
                    ) : null;
                  })}
                </div>
              </div>
            )}
          </div>
        );
      })}

      {modal && (
        <Modal title={modal === "add" ? "New Order" : "Edit Order"} onClose={() => setModal(null)} onSave={save}>
          <div className="fl">
            <label>Client</label>
            <select className="sel" value={form.client_id || ""} onChange={e => f("client_id", e.target.value)}>
              <option value="">— Select client —</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name}{c.company ? ` (${c.company})` : ""}</option>)}
            </select>
          </div>
          <div className="fl2">
            <div>
              <label>Start Date</label>
              <input type="date" className="inp" value={form.start_date || ""} onChange={e => f("start_date", e.target.value)} />
            </div>
            <div>
              <label>End Date</label>
              <input type="date" className="inp" value={form.end_date || ""} onChange={e => f("end_date", e.target.value)} />
            </div>
          </div>
          <div className="fl">
            <label>Status</label>
            <select className="sel" value={form.status || "draft"} onChange={e => f("status", e.target.value as Order["status"])}>
              {["draft", "confirmed", "active", "completed", "cancelled"].map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div className="fl">
            <label>Notes</label>
            <textarea className="inp" value={form.notes || ""} onChange={e => f("notes", e.target.value)} />
          </div>

          {/* Line items */}
          <div style={{ marginTop: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <label style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--text-faint)" }}>Items</label>
              <button className="btn btn-o btn-sm" onClick={addLine}>+ Add Line</button>
            </div>
            {orderItems.map((it, idx) => (
              <div key={idx} style={{ display: "grid", gridTemplateColumns: "2fr 80px 110px auto", gap: 8, marginBottom: 8, alignItems: "center" }}>
                <select className="sel" value={it.item_id} onChange={e => updateLine(idx, "item_id", e.target.value)}>
                  <option value="">— Item —</option>
                  {inventory.map(i => <option key={i.id} value={i.id}>{lang === "fr" && i.name_fr ? i.name_fr : i.name}</option>)}
                </select>
                <input type="number" className="inp" placeholder="Qty" value={it.qty} onChange={e => updateLine(idx, "qty", +e.target.value)} />
                <input type="number" className="inp" placeholder="Unit price" value={it.unit_price} onChange={e => updateLine(idx, "unit_price", +e.target.value)} />
                <button className="btn btn-d btn-sm" onClick={() => setOrderItems(prev => prev.filter((_, i) => i !== idx))}>×</button>
              </div>
            ))}
            {orderItems.length > 0 && (
              <div style={{ textAlign: "right", marginTop: 10, fontFamily: "'Playfair Display', serif", fontSize: 18, color: "var(--text)" }}>
                Total: <strong style={{ color: "var(--gold)" }}>{computedTotal.toLocaleString()} MAD</strong>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
