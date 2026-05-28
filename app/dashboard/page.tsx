"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Dashboard from "@/components/Dashboard";
import Inventory from "@/components/Inventory";
import Orders from "@/components/Orders";
import Clients from "@/components/Clients";
import Damage from "@/components/Damage";
import { InventoryItem, Order, Client, DamageReport } from "@/lib/types";

type Tab = "dashboard" | "inventory" | "orders" | "clients" | "damage";

const NAV: { key: Tab; label: string; icon: string }[] = [
  { key: "dashboard", label: "Dashboard", icon: "◈" },
  { key: "inventory", label: "Inventory", icon: "🏺" },
  { key: "orders", label: "Orders", icon: "📋" },
  { key: "clients", label: "Clients", icon: "👥" },
  { key: "damage", label: "Damage & Loss", icon: "⚠️" },
];

export default function DashboardPage() {
  const [tab, setTab] = useState<Tab>("dashboard");
  const [lang, setLang] = useState<"en" | "fr">("en");
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [damage, setDamage] = useState<DamageReport[]>([]);
  const [loaded, setLoaded] = useState(false);
  const router = useRouter();

  useEffect(() => {
    Promise.all([
      fetch("/api/inventory").then(r => r.json()),
      fetch("/api/orders").then(r => r.json()),
      fetch("/api/clients").then(r => r.json()),
      fetch("/api/damage").then(r => r.json()),
    ]).then(([inv, ord, cli, dmg]) => {
      setInventory(inv);
      setOrders(ord.map((o: Order & { items: unknown }) => ({
        ...o,
        items: typeof o.items === "string" ? JSON.parse(o.items) : (o.items || []),
      })));
      setClients(cli);
      setDamage(dmg);
      setLoaded(true);
    }).catch(() => {
      router.push("/");
    });
  }, [router]);

  async function logout() {
    await fetch("/api/auth", { method: "DELETE" }).catch(() => {});
    document.cookie = "session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    router.push("/");
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg)" }}>
      {/* Sidebar */}
      <aside style={{
        width: 220,
        background: "#0e0c09",
        borderRight: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        position: "fixed",
        top: 0, left: 0, bottom: 0,
        zIndex: 100,
      }}>
        {/* Brand */}
        <div style={{ padding: "24px 20px 18px", borderBottom: "1px solid var(--border)" }}>
          <div style={{ fontSize: 22, color: "var(--gold)", marginBottom: 8 }}>✦</div>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 600, color: "var(--text)", letterSpacing: "0.02em" }}>
            Maison Rinceau
          </div>
          <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--text-faint)", marginTop: 3 }}>
            Inventory
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "12px 0" }}>
          {NAV.map(n => (
            <button
              key={n.key}
              onClick={() => setTab(n.key)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                width: "100%",
                padding: "10px 20px",
                background: tab === n.key ? "rgba(201,164,85,0.09)" : "transparent",
                border: "none",
                borderLeft: tab === n.key ? "3px solid var(--gold)" : "3px solid transparent",
                color: tab === n.key ? "var(--gold)" : "var(--text-muted)",
                fontSize: 13,
                fontWeight: tab === n.key ? 500 : 400,
                cursor: "pointer",
                textAlign: "left",
                transition: "all 0.15s",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              <span style={{ fontSize: 15, width: 18, textAlign: "center" }}>{n.icon}</span>
              <span>{n.label}</span>
            </button>
          ))}
        </nav>

        {/* Language toggle + logout */}
        <div style={{ padding: "14px 20px", borderTop: "1px solid var(--border)" }}>
          <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
            {(["en", "fr"] as const).map(l => (
              <button
                key={l}
                onClick={() => setLang(l)}
                style={{
                  flex: 1,
                  padding: "5px",
                  border: "1px solid",
                  borderColor: lang === l ? "var(--gold)" : "rgba(255,255,255,0.1)",
                  background: lang === l ? "rgba(201,164,85,0.15)" : "transparent",
                  color: lang === l ? "var(--gold)" : "var(--text-faint)",
                  borderRadius: 6,
                  cursor: "pointer",
                  fontSize: 12,
                  fontWeight: 600,
                  fontFamily: "'DM Sans', sans-serif",
                  transition: "all 0.15s",
                }}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>
          <button
            onClick={logout}
            style={{
              width: "100%",
              padding: "7px",
              border: "1px solid rgba(248,113,113,0.2)",
              background: "transparent",
              color: "#f87171",
              borderRadius: 6,
              cursor: "pointer",
              fontSize: 12,
              fontFamily: "'DM Sans', sans-serif",
              transition: "all 0.15s",
            }}
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ marginLeft: 220, flex: 1, padding: "28px 32px", minHeight: "100vh" }}>
        {!loaded ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", color: "var(--text-faint)", fontSize: 14 }}>
            Loading…
          </div>
        ) : (
          <>
            {tab === "dashboard" && (
              <Dashboard inventory={inventory} orders={orders} clients={clients} damage={damage} lang={lang} />
            )}
            {tab === "inventory" && (
              <Inventory data={inventory} setData={setInventory} lang={lang} />
            )}
            {tab === "orders" && (
              <Orders data={orders} setData={setOrders} inventory={inventory} clients={clients} lang={lang} />
            )}
            {tab === "clients" && (
              <Clients data={clients} setData={setClients} />
            )}
            {tab === "damage" && (
              <Damage data={damage} setData={setDamage} inventory={inventory} lang={lang} />
            )}
          </>
        )}
      </main>
    </div>
  );
}
