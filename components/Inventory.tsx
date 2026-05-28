"use client";

import { useState } from "react";
import Modal from "./Modal";
import { InventoryItem } from "@/lib/types";

const CATEGORIES: Record<string, { en: string; fr: string }> = {
  TAB: { en: "Tableware", fr: "Art de la table" },
  CUT: { en: "Cutlery", fr: "Couverts" },
  GLS: { en: "Glassware", fr: "Verrerie" },
  CHR: { en: "Chairs", fr: "Chaises" },
  TBL: { en: "Tables", fr: "Tables" },
  LIN: { en: "Linen", fr: "Linge de table" },
  DEC: { en: "Decorative", fr: "Décoration" },
};

const ERAS: Record<string, { en: string; fr: string }> = {
  "19C": { en: "19th Century", fr: "XIXe siècle" },
  "20C": { en: "20th Century", fr: "XXe siècle" },
  ART: { en: "Art Deco", fr: "Art Déco" },
  NAP: { en: "Napoleonic", fr: "Napoléonien" },
  LXV: { en: "Louis XV", fr: "Louis XV" },
  LXV1: { en: "Louis XVI", fr: "Louis XVI" },
  EMP: { en: "Empire", fr: "Empire" },
};

const STATUS_COLORS: Record<string, string> = {
  available: "#4ade80",
  rented: "#c9a455",
  damaged: "#f87171",
  cleaning: "#60a5fa",
  retired: "#94a3b8",
};

function generateId(category: string, era: string, seq: number) {
  return `GTR-${category}-${era}-${String(seq).padStart(3, "0")}`;
}

interface Props {
  data: InventoryItem[];
  setData: React.Dispatch<React.SetStateAction<InventoryItem[]>>;
  lang: "en" | "fr";
}

export default function Inventory({ data, setData, lang }: Props) {
  const [catFilter, setCatFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<null | "add" | InventoryItem>(null);
  const [form, setForm] = useState<Partial<InventoryItem>>({});

  const filtered = data.filter(i => {
    const matchCat = catFilter === "All" || i.category === catFilter;
    const q = search.toLowerCase();
    const matchQ = !q || i.name?.toLowerCase().includes(q) || i.id?.toLowerCase().includes(q) || i.name_fr?.toLowerCase().includes(q);
    return matchCat && matchQ;
  });

  function f(field: keyof InventoryItem, val: unknown) {
    setForm(prev => ({ ...prev, [field]: val }));
  }

  function openAdd() {
    setForm({ category: "CUT", era: "19C", status: "available", quantity: 1, qty_available: 1 });
    setModal("add");
  }

  function openEdit(item: InventoryItem) {
    setForm({ ...item });
    setModal(item);
  }

  async function save() {
    const id = (form as InventoryItem).id || generateId(form.category!, form.era || "19C", data.length + 1);
    const row = { ...form, id } as InventoryItem;

    if (modal === "add") {
      const res = await fetch("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(row),
      });
      const saved = await res.json();
      setData(prev => [saved, ...prev]);
    } else {
      const res = await fetch(`/api/inventory/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(row),
      });
      const saved = await res.json();
      setData(prev => prev.map(i => i.id === id ? saved : i));
    }
    setModal(null);
  }

  async function del(id: string) {
    if (!confirm("Delete this item?")) return;
    await fetch(`/api/inventory/${id}`, { method: "DELETE" });
    setData(prev => prev.filter(i => i.id !== id));
  }

  return (
    <div>
      {/* Category pills */}
      <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginBottom: 18 }}>
        {["All", ...Object.keys(CATEGORIES)].map(c => (
          <button
            key={c}
            className={`pill${catFilter === c ? " on" : ""}`}
            onClick={() => setCatFilter(c)}
          >
            {c === "All" ? "All" : CATEGORIES[c][lang]}
          </button>
        ))}
      </div>

      {/* Header row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18, flexWrap: "wrap", gap: 10 }}>
        <div>
          <h1 className="pt">Inventory</h1>
          <p className="ps">{filtered.length} items · {filtered.reduce((s, i) => s + (i.quantity || 0), 0)} total units</p>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <input
            className="inp"
            style={{ width: 200 }}
            placeholder="Search…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <button className="btn btn-g" onClick={openAdd}>+ Add Item</button>
        </div>
      </div>

      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Catalogue ID</th>
              <th>Item Name</th>
              <th>Category</th>
              <th>Era</th>
              <th>Total</th>
              <th>Available</th>
              <th>Value (MAD)</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={9} style={{ textAlign: "center", padding: 40, color: "var(--text-faint)" }}>No items found.</td></tr>
            ) : filtered.map(item => {
              const sc = STATUS_COLORS[item.status] || "#94a3b8";
              return (
                <tr key={item.id}>
                  <td className="mono">{item.id}</td>
                  <td>
                    <div style={{ color: "var(--text)", fontWeight: 500 }}>
                      {lang === "fr" && item.name_fr ? item.name_fr : item.name}
                    </div>
                    {item.origin && <div style={{ fontSize: 11, color: "var(--text-faint)" }}>{item.origin}</div>}
                  </td>
                  <td style={{ fontSize: 12, color: "var(--text-muted)" }}>{CATEGORIES[item.category]?.[lang] || item.category}</td>
                  <td style={{ fontSize: 12, color: "var(--text-muted)" }}>{ERAS[item.era || ""]?.[lang] || item.era || "—"}</td>
                  <td>{item.quantity}</td>
                  <td style={{ color: (item.qty_available ?? 0) < 5 ? "#f87171" : "#4ade80", fontWeight: 600 }}>{item.qty_available}</td>
                  <td>{item.value ? Number(item.value).toLocaleString() : "—"}</td>
                  <td>
                    <span className="chip" style={{ background: sc + "1a", color: sc }}>{item.status}</span>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button className="btn btn-o btn-sm" onClick={() => openEdit(item)}>Edit</button>
                      <button className="btn btn-d btn-sm" onClick={() => del(item.id)}>Del</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {modal && (
        <Modal
          title={modal === "add" ? "Add Item" : "Edit Item"}
          onClose={() => setModal(null)}
          onSave={save}
        >
          <div className="fl2">
            <div>
              <label>Name (EN)</label>
              <input className="inp" value={form.name || ""} onChange={e => f("name", e.target.value)} />
            </div>
            <div>
              <label>Name (FR)</label>
              <input className="inp" value={form.name_fr || ""} onChange={e => f("name_fr", e.target.value)} />
            </div>
          </div>
          <div className="fl2">
            <div>
              <label>Category</label>
              <select className="sel" value={form.category || "CUT"} onChange={e => f("category", e.target.value)}>
                {Object.entries(CATEGORIES).map(([k, v]) => <option key={k} value={k}>{v[lang]}</option>)}
              </select>
            </div>
            <div>
              <label>Era</label>
              <select className="sel" value={form.era || "19C"} onChange={e => f("era", e.target.value)}>
                {Object.entries(ERAS).map(([k, v]) => <option key={k} value={k}>{v[lang]}</option>)}
              </select>
            </div>
          </div>
          <div className="fl2">
            <div>
              <label>Total Qty</label>
              <input type="number" className="inp" value={form.quantity ?? ""} onChange={e => f("quantity", +e.target.value)} />
            </div>
            <div>
              <label>Available Qty</label>
              <input type="number" className="inp" value={form.qty_available ?? ""} onChange={e => f("qty_available", +e.target.value)} />
            </div>
          </div>
          <div className="fl2">
            <div>
              <label>Status</label>
              <select className="sel" value={form.status || "available"} onChange={e => f("status", e.target.value as InventoryItem["status"])}>
                {["available", "rented", "damaged", "cleaning", "retired"].map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label>Value (MAD)</label>
              <input type="number" className="inp" value={form.value ?? ""} onChange={e => f("value", +e.target.value)} />
            </div>
          </div>
          <div className="fl">
            <label>Origin</label>
            <input className="inp" value={form.origin || ""} onChange={e => f("origin", e.target.value)} />
          </div>
          <div className="fl">
            <label>Description</label>
            <textarea className="inp" value={form.description || ""} onChange={e => f("description", e.target.value)} />
          </div>
          <div className="fl">
            <label>Notes</label>
            <textarea className="inp" value={form.notes || ""} onChange={e => f("notes", e.target.value)} />
          </div>
        </Modal>
      )}
    </div>
  );
}
