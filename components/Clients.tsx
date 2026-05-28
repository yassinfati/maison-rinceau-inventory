"use client";

import { useState } from "react";
import Modal from "./Modal";
import { Client } from "@/lib/types";

interface Props {
  data: Client[];
  setData: React.Dispatch<React.SetStateAction<Client[]>>;
}

export default function Clients({ data, setData }: Props) {
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<null | "add" | Client>(null);
  const [form, setForm] = useState<Partial<Client>>({});

  const filtered = data.filter(c => {
    const q = search.toLowerCase();
    return !q || c.name?.toLowerCase().includes(q) || c.company?.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q) || c.city?.toLowerCase().includes(q);
  });

  function f(field: keyof Client, val: string) {
    setForm(prev => ({ ...prev, [field]: val }));
  }

  function openAdd() {
    setForm({ city: "Marrakech" });
    setModal("add");
  }

  function openEdit(c: Client) {
    setForm({ ...c });
    setModal(c);
  }

  async function save() {
    const id = (form as Client).id || `CLT-${String(data.length + 1).padStart(3, "0")}`;
    const row = { ...form, id } as Client;

    if (modal === "add") {
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(row),
      });
      const saved = await res.json();
      setData(prev => [saved, ...prev]);
    } else {
      const res = await fetch(`/api/clients/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(row),
      });
      const saved = await res.json();
      setData(prev => prev.map(c => c.id === id ? saved : c));
    }
    setModal(null);
  }

  async function del(id: string) {
    if (!confirm("Delete this client?")) return;
    await fetch(`/api/clients/${id}`, { method: "DELETE" });
    setData(prev => prev.filter(c => c.id !== id));
  }

  return (
    <div>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 22, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 className="pt">Clients</h1>
          <p className="ps">{data.length} registered clients</p>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <input className="inp" style={{ width: 200 }} placeholder="Search…" value={search} onChange={e => setSearch(e.target.value)} />
          <button className="btn btn-g" onClick={openAdd}>+ Add Client</button>
        </div>
      </div>

      <div className="card">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Company</th>
              <th>Email</th>
              <th>Phone</th>
              <th>City</th>
              <th>Notes</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={8} style={{ textAlign: "center", padding: 40, color: "var(--text-faint)" }}>No clients found.</td></tr>
            ) : filtered.map(c => (
              <tr key={c.id}>
                <td className="mono">{c.id}</td>
                <td style={{ color: "var(--text)", fontWeight: 500 }}>{c.name}</td>
                <td>{c.company || "—"}</td>
                <td>{c.email || "—"}</td>
                <td>{c.phone || "—"}</td>
                <td>{c.city || "—"}</td>
                <td style={{ maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: 12, color: "var(--text-muted)" }}>{c.notes || "—"}</td>
                <td>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button className="btn btn-o btn-sm" onClick={() => openEdit(c)}>Edit</button>
                    <button className="btn btn-d btn-sm" onClick={() => del(c.id)}>Del</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <Modal title={modal === "add" ? "Add Client" : "Edit Client"} onClose={() => setModal(null)} onSave={save}>
          <div className="fl">
            <label>Name</label>
            <input className="inp" value={form.name || ""} onChange={e => f("name", e.target.value)} />
          </div>
          <div className="fl2">
            <div>
              <label>Company</label>
              <input className="inp" value={form.company || ""} onChange={e => f("company", e.target.value)} />
            </div>
            <div>
              <label>City</label>
              <input className="inp" value={form.city || ""} onChange={e => f("city", e.target.value)} />
            </div>
          </div>
          <div className="fl2">
            <div>
              <label>Email</label>
              <input className="inp" value={form.email || ""} onChange={e => f("email", e.target.value)} />
            </div>
            <div>
              <label>Phone</label>
              <input className="inp" value={form.phone || ""} onChange={e => f("phone", e.target.value)} />
            </div>
          </div>
          <div className="fl">
            <label>Address</label>
            <input className="inp" value={form.address || ""} onChange={e => f("address", e.target.value)} />
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
