"use client";

import { useState } from "react";
import Modal from "./Modal";
import { DamageReport, InventoryItem } from "@/lib/types";

const SEV_COLORS: Record<string, string> = {
  minor: "#f59e0b",
  major: "#f87171",
  loss: "#a78bfa",
};

interface Props {
  data: DamageReport[];
  setData: React.Dispatch<React.SetStateAction<DamageReport[]>>;
  inventory: InventoryItem[];
  lang: "en" | "fr";
}

export default function Damage({ data, setData, inventory, lang }: Props) {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [modal, setModal] = useState<null | "add" | DamageReport>(null);
  const [form, setForm] = useState<Partial<DamageReport>>({});

  const filtered = data.filter(d => {
    const item = inventory.find(i => i.id === d.item_id);
    const q = search.toLowerCase();
    const matchQ = !q || d.id?.toLowerCase().includes(q) || item?.name?.toLowerCase().includes(q);
    const matchStatus = !filterStatus || d.status === filterStatus;
    return matchQ && matchStatus;
  });

  function f(field: keyof DamageReport, val: unknown) {
    setForm(prev => ({ ...prev, [field]: val }));
  }

  function openAdd() {
    setForm({ status: "pending", severity: "minor", report_date: new Date().toISOString().split("T")[0], repair_cost: 0 });
    setModal("add");
  }

  function openEdit(d: DamageReport) {
    setForm({ ...d });
    setModal(d);
  }

  async function save() {
    const id = (form as DamageReport).id || `DMG-${String(data.length + 1).padStart(4, "0")}`;
    const row = { ...form, id } as DamageReport;

    if (modal === "add") {
      const res = await fetch("/api/damage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(row),
      });
      const saved = await res.json();
      setData(prev => [saved, ...prev]);
    } else {
      const res = await fetch(`/api/damage/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(row),
      });
      const saved = await res.json();
      setData(prev => prev.map(d => d.id === id ? saved : d));
    }
    setModal(null);
  }

  async function del(id: string) {
    if (!confirm("Delete this report?")) return;
    await fetch(`/api/damage/${id}`, { method: "DELETE" });
    setData(prev => prev.filter(d => d.id !== id));
  }

  return (
    <div>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 22, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 className="pt">Damage & Loss</h1>
          <p className="ps">{data.filter(d => d.status === "pending").length} open · {data.length} total reports</p>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <input className="inp" style={{ width: 180 }} placeholder="Search…" value={search} onChange={e => setSearch(e.target.value)} />
          <select className="sel" style={{ width: 130 }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="resolved">Resolved</option>
          </select>
          <button className="btn btn-g" onClick={openAdd}>+ Add Report</button>
        </div>
      </div>

      <div className="card">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Item</th>
              <th>Date</th>
              <th>Severity</th>
              <th>Repair Cost</th>
              <th>Description</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={8} style={{ textAlign: "center", padding: 40, color: "var(--text-faint)" }}>No reports found.</td></tr>
            ) : filtered.map(d => {
              const item = inventory.find(i => i.id === d.item_id);
              const sc = SEV_COLORS[d.severity] || "#94a3b8";
              const statusColor = d.status === "resolved" ? "#4ade80" : "#c9a455";
              return (
                <tr key={d.id}>
                  <td className="mono">{d.id}</td>
                  <td>
                    <div style={{ color: "var(--text)", fontWeight: 500, fontSize: 13 }}>
                      {item ? (lang === "fr" && item.name_fr ? item.name_fr : item.name) : "—"}
                    </div>
                    <span className="mono">{d.item_id}</span>
                  </td>
                  <td>{d.report_date || "—"}</td>
                  <td>
                    <span className="chip" style={{ background: sc + "1a", color: sc }}>{d.severity}</span>
                  </td>
                  <td>{d.repair_cost ? Number(d.repair_cost).toLocaleString() + " MAD" : "—"}</td>
                  <td style={{ maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: 12, color: "var(--text-muted)" }}>
                    {d.description || "—"}
                  </td>
                  <td>
                    <span className="chip" style={{ background: statusColor + "1a", color: statusColor }}>{d.status}</span>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button className="btn btn-o btn-sm" onClick={() => openEdit(d)}>Edit</button>
                      <button className="btn btn-d btn-sm" onClick={() => del(d.id)}>Del</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {modal && (
        <Modal title={modal === "add" ? "Add Damage Report" : "Edit Report"} onClose={() => setModal(null)} onSave={save}>
          <div className="fl">
            <label>Item</label>
            <select className="sel" value={form.item_id || ""} onChange={e => f("item_id", e.target.value)}>
              <option value="">— Select item —</option>
              {inventory.map(i => <option key={i.id} value={i.id}>{i.id} — {lang === "fr" && i.name_fr ? i.name_fr : i.name}</option>)}
            </select>
          </div>
          <div className="fl2">
            <div>
              <label>Report Date</label>
              <input type="date" className="inp" value={form.report_date || ""} onChange={e => f("report_date", e.target.value)} />
            </div>
            <div>
              <label>Severity</label>
              <select className="sel" value={form.severity || "minor"} onChange={e => f("severity", e.target.value as DamageReport["severity"])}>
                <option value="minor">Minor</option>
                <option value="major">Major</option>
                <option value="loss">Loss</option>
              </select>
            </div>
          </div>
          <div className="fl2">
            <div>
              <label>Repair Cost (MAD)</label>
              <input type="number" className="inp" value={form.repair_cost ?? ""} onChange={e => f("repair_cost", +e.target.value)} />
            </div>
            <div>
              <label>Status</label>
              <select className="sel" value={form.status || "pending"} onChange={e => f("status", e.target.value as DamageReport["status"])}>
                <option value="pending">Pending</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
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
