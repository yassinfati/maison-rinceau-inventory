
import { useState, useEffect, useCallback } from "react";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ─── SUPABASE CONFIG ──────────────────────────────────────────────────────────
// Replace with your actual Supabase project URL and anon key
const SUPABASE_URL = "https://ebaqlssiuyawayvvtcmi.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImViYXFsc3NpdXlhd2F5dnZ0Y21pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYwODA1MzMsImV4cCI6MjA5MTY1NjUzM30.jqc4k3HF27zOUQn571k8pT2g8_dYWgt_mB3Jz_r6aCI";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ─── DEMO MODE (localStorage fallback when Supabase not configured) ───────────
const DEMO_MODE = SUPABASE_URL.includes("your-project");

// ─── CATEGORY & ERA MAPS ──────────────────────────────────────────────────────
const CATEGORIES = {
  TAB: { en: "Tableware", fr: "Art de la table" },
  CUT: { en: "Cutlery", fr: "Couverts" },
  GLS: { en: "Glassware", fr: "Verrerie" },
  CHR: { en: "Chairs", fr: "Chaises" },
  TBL: { en: "Tables", fr: "Tables" },
  LIN: { en: "Linen", fr: "Linge de table" },
  DEC: { en: "Decorative", fr: "Décoration" },
};

const ERAS = {
  "19C": { en: "19th Century", fr: "XIXe siècle" },
  "20C": { en: "20th Century", fr: "XXe siècle" },
  ART: { en: "Art Deco", fr: "Art Déco" },
  NAP: { en: "Napoleonic", fr: "Napoléonien" },
  LXV: { en: "Louis XV", fr: "Louis XV" },
  LXV1: { en: "Louis XVI", fr: "Louis XVI" },
  EMP: { en: "Empire", fr: "Empire" },
};

const STATUS_COLORS = {
  available: "#4ade80",
  rented: "#f59e0b",
  damaged: "#ef4444",
  cleaning: "#60a5fa",
  retired: "#9ca3af",
};

const ORDER_STATUS_COLORS = {
  draft: "#9ca3af",
  confirmed: "#60a5fa",
  active: "#f59e0b",
  completed: "#4ade80",
  cancelled: "#ef4444",
};

// ─── STORAGE LAYER (Demo or Supabase) ────────────────────────────────────────
const Storage = {
  async get(key) {
    if (DEMO_MODE) {
      const raw = localStorage.getItem("mr_" + key);
      return raw ? JSON.parse(raw) : [];
    }
    const { data } = await supabase.from(key).select("*").order("created_at", { ascending: false });
    return data || [];
  },
  async insert(key, row) {
    if (DEMO_MODE) {
      const all = await Storage.get(key);
      const newRow = { ...row, id: crypto.randomUUID(), created_at: new Date().toISOString() };
      localStorage.setItem("mr_" + key, JSON.stringify([newRow, ...all]));
      return newRow;
    }
    const { data } = await supabase.from(key).insert(row).select().single();
    return data;
  },
  async update(key, id, row) {
    if (DEMO_MODE) {
      const all = await Storage.get(key);
      const updated = all.map(r => r.id === id ? { ...r, ...row } : r);
      localStorage.setItem("mr_" + key, JSON.stringify(updated));
      return updated.find(r => r.id === id);
    }
    const { data } = await supabase.from(key).update(row).eq("id", id).select().single();
    return data;
  },
  async delete(key, id) {
    if (DEMO_MODE) {
      const all = await Storage.get(key);
      localStorage.setItem("mr_" + key, JSON.stringify(all.filter(r => r.id !== id)));
      return true;
    }
    await supabase.from(key).delete().eq("id", id);
    return true;
  },
};

// ─── ID GENERATOR ─────────────────────────────────────────────────────────────
function generateId(category, era, seq) {
  return `GTR-${category}-${era}-${String(seq).padStart(3, "0")}`;
}

// ─── TRANSLATIONS ─────────────────────────────────────────────────────────────
const T = {
  en: {
    appName: "Maison Rinceau",
    appSub: "Inventory Management",
    dashboard: "Dashboard",
    inventory: "Inventory",
    orders: "Rental Orders",
    clients: "Clients",
    damage: "Damage & Loss",
    addItem: "Add Item",
    addOrder: "Add Order",
    addClient: "Add Client",
    addReport: "Add Report",
    search: "Search…",
    save: "Save",
    cancel: "Cancel",
    edit: "Edit",
    delete: "Delete",
    close: "Close",
    name: "Name",
    category: "Category",
    era: "Era",
    quantity: "Qty",
    available: "Available",
    rented: "Rented",
    damaged: "Damaged",
    cleaning: "In Cleaning",
    retired: "Retired",
    status: "Status",
    description: "Description",
    origin: "Origin",
    value: "Value (MAD)",
    notes: "Notes",
    client: "Client",
    items: "Items",
    startDate: "Start Date",
    endDate: "End Date",
    total: "Total (MAD)",
    phone: "Phone",
    email: "Email",
    company: "Company",
    address: "Address",
    city: "City",
    severity: "Severity",
    minor: "Minor",
    major: "Major",
    loss: "Loss",
    resolved: "Resolved",
    pending: "Pending",
    totalItems: "Total Items",
    activeOrders: "Active Orders",
    totalClients: "Total Clients",
    openDamage: "Open Damage Reports",
    recentOrders: "Recent Orders",
    inventoryBreakdown: "Inventory Breakdown",
    demoMode: "Demo Mode — using localStorage. Configure Supabase to persist data.",
    confirmDelete: "Are you sure you want to delete this?",
    noData: "No records found.",
    itemId: "Item ID",
    repairCost: "Repair Cost (MAD)",
    reportDate: "Report Date",
    orderId: "Order ID",
    draft: "Draft",
    confirmed: "Confirmed",
    active: "Active",
    completed: "Completed",
    cancelled: "Cancelled",
  },
  fr: {
    appName: "Maison Rinceau",
    appSub: "Gestion des Stocks",
    dashboard: "Tableau de bord",
    inventory: "Inventaire",
    orders: "Commandes de location",
    clients: "Clients",
    damage: "Dommages & Pertes",
    addItem: "Ajouter un article",
    addOrder: "Ajouter une commande",
    addClient: "Ajouter un client",
    addReport: "Ajouter un rapport",
    search: "Rechercher…",
    save: "Enregistrer",
    cancel: "Annuler",
    edit: "Modifier",
    delete: "Supprimer",
    close: "Fermer",
    name: "Nom",
    category: "Catégorie",
    era: "Époque",
    quantity: "Qté",
    available: "Disponible",
    rented: "Loué",
    damaged: "Endommagé",
    cleaning: "En nettoyage",
    retired: "Retiré",
    status: "Statut",
    description: "Description",
    origin: "Origine",
    value: "Valeur (MAD)",
    notes: "Notes",
    client: "Client",
    items: "Articles",
    startDate: "Date de début",
    endDate: "Date de fin",
    total: "Total (MAD)",
    phone: "Téléphone",
    email: "Email",
    company: "Société",
    address: "Adresse",
    city: "Ville",
    severity: "Gravité",
    minor: "Mineur",
    major: "Majeur",
    loss: "Perte",
    resolved: "Résolu",
    pending: "En attente",
    totalItems: "Total articles",
    activeOrders: "Commandes actives",
    totalClients: "Total clients",
    openDamage: "Rapports ouverts",
    recentOrders: "Commandes récentes",
    inventoryBreakdown: "Répartition inventaire",
    demoMode: "Mode Démo — localStorage utilisé. Configurez Supabase pour persister les données.",
    confirmDelete: "Voulez-vous vraiment supprimer ceci ?",
    noData: "Aucun enregistrement trouvé.",
    itemId: "ID Article",
    repairCost: "Coût réparation (MAD)",
    reportDate: "Date du rapport",
    orderId: "ID Commande",
    draft: "Brouillon",
    confirmed: "Confirmé",
    active: "Actif",
    completed: "Terminé",
    cancelled: "Annulé",
  },
};

// ─── SEED DATA ────────────────────────────────────────────────────────────────
const SEED_INVENTORY = [
  { id: "GTR-CUT-19C-001", name: "Silver Fish Fork Set", name_fr: "Service à poisson en argent", category: "CUT", era: "19C", quantity: 48, quantity_available: 48, status: "available", origin: "Bordeaux", value: 12000, description: "48-piece silver fish fork set, hallmarked 1872" },
  { id: "GTR-TAB-NAP-001", name: "Limoges Dinner Plates", name_fr: "Assiettes de dîner Limoges", category: "TAB", era: "NAP", quantity: 60, quantity_available: 52, status: "available", origin: "Limoges, France", value: 36000, description: "Hand-painted Napoleonic-era dinner plates" },
  { id: "GTR-GLS-ART-001", name: "Crystal Champagne Flutes", name_fr: "Flûtes à champagne en cristal", category: "GLS", era: "ART", quantity: 120, quantity_available: 110, status: "available", origin: "Baccarat, France", value: 48000, description: "Art Deco Baccarat crystal champagne flutes" },
  { id: "GTR-CHR-LXV-001", name: "Louis XV Gilt Chairs", name_fr: "Chaises dorées Louis XV", category: "CHR", era: "LXV", quantity: 24, quantity_available: 20, status: "available", origin: "Paris, France", value: 96000, description: "Authentic Louis XV carved and gilt chairs with silk upholstery" },
  { id: "GTR-TBL-EMP-001", name: "Empire Dining Tables", name_fr: "Tables de salle à manger Empire", category: "TBL", era: "EMP", quantity: 6, quantity_available: 4, status: "available", origin: "Lyon, France", value: 72000, description: "Mahogany Empire-style extendable dining tables" },
];

const SEED_CLIENTS = [
  { id: "CLT-001", name: "Hôtel La Mamounia", company: "La Mamounia SARL", email: "events@mamounia.com", phone: "+212 524 388 600", city: "Marrakech", address: "Avenue Bab Jdid", notes: "Premium client — luxury events" },
  { id: "CLT-002", name: "Fatima Zahra Benali", company: "FZB Events", email: "fzb@events.ma", phone: "+212 661 234 567", city: "Marrakech", address: "Quartier Guéliz", notes: "" },
];

// ─── STYLES ───────────────────────────────────────────────────────────────────
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=Jost:wght@300;400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --cream: #f5f0e8;
    --ivory: #faf8f3;
    --gold: #b8974a;
    --gold-light: #d4b06a;
    --gold-pale: #e8d9b0;
    --forest: #2d4a35;
    --forest-light: #3d6347;
    --charcoal: #2a2520;
    --warm-gray: #6b6560;
    --border: #d9d0be;
    --border-light: #ede7d9;
    --white: #ffffff;
    --shadow: 0 2px 16px rgba(42,37,32,0.10);
    --shadow-lg: 0 8px 40px rgba(42,37,32,0.15);
    --radius: 6px;
    --sidebar-w: 220px;
  }

  body { background: var(--cream); color: var(--charcoal); font-family: 'Jost', sans-serif; font-size: 14px; }

  .app { display: flex; min-height: 100vh; }

  /* SIDEBAR */
  .sidebar {
    width: var(--sidebar-w);
    background: var(--forest);
    color: var(--cream);
    display: flex;
    flex-direction: column;
    padding: 0;
    position: fixed;
    top: 0; left: 0; bottom: 0;
    z-index: 100;
    box-shadow: 2px 0 20px rgba(0,0,0,0.18);
  }
  .sidebar-brand {
    padding: 28px 24px 20px;
    border-bottom: 1px solid rgba(255,255,255,0.1);
  }
  .sidebar-brand h1 {
    font-family: 'Cormorant Garamond', serif;
    font-size: 20px;
    font-weight: 600;
    letter-spacing: 0.04em;
    color: var(--gold-light);
    line-height: 1.2;
  }
  .sidebar-brand p {
    font-size: 10px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: rgba(245,240,232,0.5);
    margin-top: 4px;
    font-weight: 300;
  }
  .sidebar-nav { flex: 1; padding: 16px 0; }
  .nav-item {
    display: flex; align-items: center; gap: 10px;
    padding: 11px 24px;
    cursor: pointer;
    transition: all 0.18s;
    font-size: 13px;
    font-weight: 400;
    letter-spacing: 0.04em;
    color: rgba(245,240,232,0.65);
    border-left: 3px solid transparent;
  }
  .nav-item:hover { background: rgba(255,255,255,0.06); color: var(--cream); }
  .nav-item.active { background: rgba(184,151,74,0.15); color: var(--gold-light); border-left-color: var(--gold); font-weight: 500; }
  .nav-icon { font-size: 16px; width: 20px; text-align: center; }

  .sidebar-lang {
    padding: 16px 24px;
    border-top: 1px solid rgba(255,255,255,0.1);
    display: flex; gap: 8px;
  }
  .lang-btn {
    flex: 1; padding: 6px; border: 1px solid rgba(255,255,255,0.2);
    background: transparent; color: rgba(245,240,232,0.6);
    border-radius: var(--radius); cursor: pointer;
    font-family: 'Jost', sans-serif; font-size: 12px;
    letter-spacing: 0.06em; transition: all 0.18s;
  }
  .lang-btn.active { background: var(--gold); color: var(--forest); border-color: var(--gold); font-weight: 600; }

  /* MAIN */
  .main { margin-left: var(--sidebar-w); flex: 1; display: flex; flex-direction: column; }

  .topbar {
    background: var(--ivory);
    border-bottom: 1px solid var(--border);
    padding: 16px 32px;
    display: flex; align-items: center; justify-content: space-between;
    position: sticky; top: 0; z-index: 50;
  }
  .topbar h2 {
    font-family: 'Cormorant Garamond', serif;
    font-size: 22px; font-weight: 500; letter-spacing: 0.02em;
  }
  .topbar-actions { display: flex; gap: 10px; align-items: center; }

  .btn {
    padding: 8px 18px; border-radius: var(--radius);
    border: none; cursor: pointer;
    font-family: 'Jost', sans-serif; font-size: 13px;
    font-weight: 500; letter-spacing: 0.04em;
    transition: all 0.18s;
  }
  .btn-primary { background: var(--forest); color: var(--cream); }
  .btn-primary:hover { background: var(--forest-light); }
  .btn-gold { background: var(--gold); color: var(--white); }
  .btn-gold:hover { background: var(--gold-light); }
  .btn-ghost { background: transparent; border: 1px solid var(--border); color: var(--charcoal); }
  .btn-ghost:hover { border-color: var(--gold); color: var(--gold); }
  .btn-danger { background: #ef4444; color: white; }
  .btn-danger:hover { background: #dc2626; }
  .btn-sm { padding: 5px 12px; font-size: 12px; }

  .search-bar {
    padding: 8px 14px; border: 1px solid var(--border);
    border-radius: var(--radius); background: var(--white);
    font-family: 'Jost', sans-serif; font-size: 13px;
    width: 240px; outline: none; color: var(--charcoal);
    transition: border-color 0.18s;
  }
  .search-bar:focus { border-color: var(--gold); }

  .content { padding: 28px 32px; flex: 1; }

  /* DEMO BANNER */
  .demo-banner {
    background: linear-gradient(90deg, #b8974a22, #b8974a11);
    border: 1px solid var(--gold-pale);
    border-radius: var(--radius);
    padding: 10px 16px;
    margin-bottom: 20px;
    font-size: 12px; color: var(--gold);
    display: flex; align-items: center; gap: 8px;
  }

  /* DASHBOARD */
  .stat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 28px; }
  .stat-card {
    background: var(--white); border-radius: var(--radius);
    border: 1px solid var(--border-light);
    padding: 20px 24px;
    box-shadow: var(--shadow);
  }
  .stat-card .stat-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.12em; color: var(--warm-gray); margin-bottom: 8px; }
  .stat-card .stat-value { font-family: 'Cormorant Garamond', serif; font-size: 36px; font-weight: 500; color: var(--charcoal); }
  .stat-card .stat-sub { font-size: 12px; color: var(--warm-gray); margin-top: 4px; }
  .stat-card .stat-icon { font-size: 24px; margin-bottom: 10px; }

  .dash-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
  .dash-card {
    background: var(--white); border-radius: var(--radius);
    border: 1px solid var(--border-light); padding: 24px;
    box-shadow: var(--shadow);
  }
  .dash-card h3 {
    font-family: 'Cormorant Garamond', serif;
    font-size: 16px; font-weight: 500; margin-bottom: 16px;
    padding-bottom: 10px; border-bottom: 1px solid var(--border-light);
    color: var(--charcoal);
  }

  .bar-row { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
  .bar-label { font-size: 12px; width: 110px; color: var(--warm-gray); flex-shrink: 0; }
  .bar-track { flex: 1; height: 6px; background: var(--border-light); border-radius: 3px; overflow: hidden; }
  .bar-fill { height: 100%; border-radius: 3px; background: var(--gold); transition: width 0.6s; }
  .bar-count { font-size: 12px; color: var(--warm-gray); width: 30px; text-align: right; }

  /* TABLE */
  .table-wrap { background: var(--white); border-radius: var(--radius); border: 1px solid var(--border-light); box-shadow: var(--shadow); overflow: hidden; }
  table { width: 100%; border-collapse: collapse; }
  thead tr { background: var(--ivory); border-bottom: 2px solid var(--border); }
  th { padding: 12px 16px; text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: var(--warm-gray); font-weight: 600; }
  td { padding: 12px 16px; border-bottom: 1px solid var(--border-light); font-size: 13px; vertical-align: middle; }
  tr:last-child td { border-bottom: none; }
  tr:hover td { background: #faf8f355; }

  .badge {
    display: inline-block; padding: 3px 10px; border-radius: 20px;
    font-size: 11px; font-weight: 500; letter-spacing: 0.04em;
    text-transform: capitalize;
  }

  .id-code {
    font-family: 'Jost', monospace; font-size: 12px;
    color: var(--warm-gray); letter-spacing: 0.04em;
  }

  .table-actions { display: flex; gap: 6px; }

  /* MODAL */
  .modal-overlay {
    position: fixed; inset: 0;
    background: rgba(42,37,32,0.55);
    z-index: 200;
    display: flex; align-items: center; justify-content: center;
    padding: 20px;
    backdrop-filter: blur(2px);
  }
  .modal {
    background: var(--ivory);
    border-radius: 8px;
    width: 100%; max-width: 560px;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: var(--shadow-lg);
    border: 1px solid var(--border);
  }
  .modal-header {
    padding: 22px 28px 16px;
    border-bottom: 1px solid var(--border-light);
    display: flex; align-items: center; justify-content: space-between;
  }
  .modal-header h3 {
    font-family: 'Cormorant Garamond', serif;
    font-size: 20px; font-weight: 500;
  }
  .modal-close { background: none; border: none; cursor: pointer; font-size: 20px; color: var(--warm-gray); line-height: 1; padding: 4px; }
  .modal-body { padding: 24px 28px; }
  .modal-footer { padding: 16px 28px; border-top: 1px solid var(--border-light); display: flex; justify-content: flex-end; gap: 10px; }

  /* FORM */
  .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
  .form-group { display: flex; flex-direction: column; gap: 5px; }
  .form-group.full { grid-column: 1 / -1; }
  label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: var(--warm-gray); font-weight: 600; }
  input, select, textarea {
    padding: 9px 12px; border: 1px solid var(--border);
    border-radius: var(--radius); background: var(--white);
    font-family: 'Jost', sans-serif; font-size: 13px;
    color: var(--charcoal); outline: none;
    transition: border-color 0.18s;
  }
  input:focus, select:focus, textarea:focus { border-color: var(--gold); }
  textarea { resize: vertical; min-height: 72px; }

  /* STATUS DOT */
  .status-dot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; margin-right: 6px; }

  .empty-state {
    text-align: center; padding: 48px;
    color: var(--warm-gray); font-size: 14px;
  }
  .empty-state .empty-icon { font-size: 40px; margin-bottom: 12px; }

  .filter-row { display: flex; gap: 10px; margin-bottom: 16px; flex-wrap: wrap; align-items: center; }
  .filter-select {
    padding: 7px 12px; border: 1px solid var(--border);
    border-radius: var(--radius); background: var(--white);
    font-family: 'Jost', sans-serif; font-size: 13px;
    color: var(--charcoal); outline: none; cursor: pointer;
  }

  .tag {
    display: inline-block; padding: 2px 8px;
    background: var(--border-light); border-radius: 4px;
    font-size: 11px; color: var(--warm-gray);
    margin-right: 4px;
  }

  @media (max-width: 900px) {
    .stat-grid { grid-template-columns: 1fr 1fr; }
    .dash-grid { grid-template-columns: 1fr; }
  }
`;

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function Badge({ status, label }) {
  const color = STATUS_COLORS[status] || ORDER_STATUS_COLORS[status] || "#9ca3af";
  return (
    <span className="badge" style={{ background: color + "22", color }}>
      <span className="status-dot" style={{ background: color }} />
      {label}
    </span>
  );
}

function Modal({ title, onClose, onSave, children, saveLabel = "Save" }) {
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">{children}</div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          {onSave && <button className="btn btn-primary" onClick={onSave}>{saveLabel}</button>}
        </div>
      </div>
    </div>
  );
}

function EmptyState({ icon, text }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">{icon}</div>
      <div>{text}</div>
    </div>
  );
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function Dashboard({ inventory, orders, clients, damage, t }) {
  const totalItems = inventory.reduce((s, i) => s + (i.quantity || 0), 0);
  const availableItems = inventory.reduce((s, i) => s + (i.quantity_available || 0), 0);
  const activeOrders = orders.filter(o => o.status === "active" || o.status === "confirmed").length;
  const openDamage = damage.filter(d => d.status === "pending").length;

  const catBreakdown = Object.entries(CATEGORIES).map(([key, val]) => ({
    label: val[t === T.fr ? "fr" : "en"],
    count: inventory.filter(i => i.category === key).reduce((s, i) => s + (i.quantity || 0), 0),
  })).filter(c => c.count > 0);
  const maxCat = Math.max(...catBreakdown.map(c => c.count), 1);

  const recentOrders = [...orders].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 5);

  return (
    <div>
      <div className="stat-grid">
        {[
          { icon: "🏺", label: t.totalItems, value: totalItems, sub: `${availableItems} available` },
          { icon: "📋", label: t.activeOrders, value: activeOrders, sub: `${orders.length} total` },
          { icon: "👥", label: t.totalClients, value: clients.length, sub: "registered clients" },
          { icon: "⚠️", label: t.openDamage, value: openDamage, sub: `${damage.length} total reports` },
        ].map((s, i) => (
          <div key={i} className="stat-card">
            <div className="stat-icon">{s.icon}</div>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value">{s.value}</div>
            <div className="stat-sub">{s.sub}</div>
          </div>
        ))}
      </div>
      <div className="dash-grid">
        <div className="dash-card">
          <h3>{t.inventoryBreakdown}</h3>
          {catBreakdown.length === 0 ? <EmptyState icon="📦" text={t.noData} /> :
            catBreakdown.map((c, i) => (
              <div key={i} className="bar-row">
                <div className="bar-label">{c.label}</div>
                <div className="bar-track"><div className="bar-fill" style={{ width: `${(c.count / maxCat) * 100}%` }} /></div>
                <div className="bar-count">{c.count}</div>
              </div>
            ))}
        </div>
        <div className="dash-card">
          <h3>{t.recentOrders}</h3>
          {recentOrders.length === 0 ? <EmptyState icon="📋" text={t.noData} /> :
            recentOrders.map((o, i) => {
              const client = clients.find(c => c.id === o.client_id);
              const statusKey = o.status || "draft";
              return (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, paddingBottom: 10, borderBottom: i < recentOrders.length - 1 ? "1px solid var(--border-light)" : "none" }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{client?.name || "—"}</div>
                    <div className="id-code">{o.id}</div>
                  </div>
                  <Badge status={statusKey} label={t[statusKey] || statusKey} />
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}

// ─── INVENTORY ────────────────────────────────────────────────────────────────
function Inventory({ data, setData, t, lang }) {
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [modal, setModal] = useState(null); // null | "add" | {item}
  const [form, setForm] = useState({});

  const filtered = data.filter(i => {
    const q = search.toLowerCase();
    const matchQ = !q || i.name?.toLowerCase().includes(q) || i.id?.toLowerCase().includes(q) || i.name_fr?.toLowerCase().includes(q);
    const matchCat = !filterCat || i.category === filterCat;
    const matchStatus = !filterStatus || i.status === filterStatus;
    return matchQ && matchCat && matchStatus;
  });

  function openAdd() {
    const nextSeq = data.filter(i => i.category === "CUT").length + 1;
    setForm({ category: "CUT", era: "19C", status: "available", quantity: 1, quantity_available: 1 });
    setModal("add");
  }

  function openEdit(item) {
    setForm({ ...item });
    setModal(item);
  }

  async function save() {
    const id = form.id || generateId(form.category, form.era, data.length + 1);
    const row = { ...form, id };
    if (modal === "add") {
      const saved = await Storage.insert("inventory", row);
      setData(prev => [saved || row, ...prev]);
    } else {
      const saved = await Storage.update("inventory", form.id, row);
      setData(prev => prev.map(i => i.id === form.id ? (saved || row) : i));
    }
    setModal(null);
  }

  async function del(id) {
    if (!confirm(t.confirmDelete)) return;
    await Storage.delete("inventory", id);
    setData(prev => prev.filter(i => i.id !== id));
  }

  const statusKeys = ["available", "rented", "damaged", "cleaning", "retired"];

  return (
    <div>
      <div className="filter-row">
        <input className="search-bar" placeholder={t.search} value={search} onChange={e => setSearch(e.target.value)} />
        <select className="filter-select" value={filterCat} onChange={e => setFilterCat(e.target.value)}>
          <option value="">All Categories</option>
          {Object.entries(CATEGORIES).map(([k, v]) => <option key={k} value={k}>{v[lang]}</option>)}
        </select>
        <select className="filter-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">All Status</option>
          {statusKeys.map(s => <option key={s} value={s}>{t[s]}</option>)}
        </select>
        <button className="btn btn-primary" onClick={openAdd}>+ {t.addItem}</button>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>{t.itemId}</th>
              <th>{t.name}</th>
              <th>{t.category}</th>
              <th>{t.era}</th>
              <th>{t.quantity}</th>
              <th>{t.available}</th>
              <th>{t.value}</th>
              <th>{t.status}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={9}><EmptyState icon="📦" text={t.noData} /></td></tr>
            ) : filtered.map(item => (
              <tr key={item.id}>
                <td><span className="id-code">{item.id}</span></td>
                <td>
                  <div style={{ fontWeight: 500 }}>{lang === "fr" && item.name_fr ? item.name_fr : item.name}</div>
                  {item.origin && <div style={{ fontSize: 11, color: "var(--warm-gray)" }}>{item.origin}</div>}
                </td>
                <td><span className="tag">{CATEGORIES[item.category]?.[lang] || item.category}</span></td>
                <td><span className="tag">{ERAS[item.era]?.[lang] || item.era}</span></td>
                <td>{item.quantity}</td>
                <td style={{ color: item.quantity_available < 5 ? "#ef4444" : "inherit", fontWeight: item.quantity_available < 5 ? 600 : 400 }}>{item.quantity_available}</td>
                <td>{item.value ? Number(item.value).toLocaleString() : "—"}</td>
                <td><Badge status={item.status} label={t[item.status] || item.status} /></td>
                <td>
                  <div className="table-actions">
                    <button className="btn btn-ghost btn-sm" onClick={() => openEdit(item)}>{t.edit}</button>
                    <button className="btn btn-danger btn-sm" onClick={() => del(item.id)}>{t.delete}</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <Modal title={modal === "add" ? t.addItem : t.edit} onClose={() => setModal(null)} onSave={save} saveLabel={t.save}>
          <div className="form-grid">
            <div className="form-group full">
              <label>{t.name} (EN)</label>
              <input value={form.name || ""} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="form-group full">
              <label>{t.name} (FR)</label>
              <input value={form.name_fr || ""} onChange={e => setForm(f => ({ ...f, name_fr: e.target.value }))} />
            </div>
            <div className="form-group">
              <label>{t.category}</label>
              <select value={form.category || ""} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                {Object.entries(CATEGORIES).map(([k, v]) => <option key={k} value={k}>{v[lang]}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>{t.era}</label>
              <select value={form.era || ""} onChange={e => setForm(f => ({ ...f, era: e.target.value }))}>
                {Object.entries(ERAS).map(([k, v]) => <option key={k} value={k}>{v[lang]}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>{t.quantity}</label>
              <input type="number" value={form.quantity || ""} onChange={e => setForm(f => ({ ...f, quantity: +e.target.value }))} />
            </div>
            <div className="form-group">
              <label>{t.available}</label>
              <input type="number" value={form.quantity_available || ""} onChange={e => setForm(f => ({ ...f, quantity_available: +e.target.value }))} />
            </div>
            <div className="form-group">
              <label>{t.status}</label>
              <select value={form.status || "available"} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                {["available", "rented", "damaged", "cleaning", "retired"].map(s => <option key={s} value={s}>{t[s]}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>{t.value}</label>
              <input type="number" value={form.value || ""} onChange={e => setForm(f => ({ ...f, value: +e.target.value }))} />
            </div>
            <div className="form-group">
              <label>{t.origin}</label>
              <input value={form.origin || ""} onChange={e => setForm(f => ({ ...f, origin: e.target.value }))} />
            </div>
            <div className="form-group full">
              <label>{t.description}</label>
              <textarea value={form.description || ""} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            </div>
            <div className="form-group full">
              <label>{t.notes}</label>
              <textarea value={form.notes || ""} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── CLIENTS ──────────────────────────────────────────────────────────────────
function Clients({ data, setData, t }) {
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});

  const filtered = data.filter(c => {
    const q = search.toLowerCase();
    return !q || c.name?.toLowerCase().includes(q) || c.company?.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q) || c.city?.toLowerCase().includes(q);
  });

  function openAdd() { setForm({ city: "Marrakech" }); setModal("add"); }
  function openEdit(c) { setForm({ ...c }); setModal(c); }

  async function save() {
    const nextId = "CLT-" + String(data.length + 1).padStart(3, "0");
    const row = { ...form, id: form.id || nextId };
    if (modal === "add") {
      const saved = await Storage.insert("clients", row);
      setData(prev => [saved || row, ...prev]);
    } else {
      const saved = await Storage.update("clients", form.id, row);
      setData(prev => prev.map(c => c.id === form.id ? (saved || row) : c));
    }
    setModal(null);
  }

  async function del(id) {
    if (!confirm(t.confirmDelete)) return;
    await Storage.delete("clients", id);
    setData(prev => prev.filter(c => c.id !== id));
  }

  return (
    <div>
      <div className="filter-row">
        <input className="search-bar" placeholder={t.search} value={search} onChange={e => setSearch(e.target.value)} />
        <button className="btn btn-primary" onClick={openAdd}>+ {t.addClient}</button>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>{t.name}</th>
              <th>{t.company}</th>
              <th>{t.email}</th>
              <th>{t.phone}</th>
              <th>{t.city}</th>
              <th>{t.notes}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={8}><EmptyState icon="👥" text={t.noData} /></td></tr>
            ) : filtered.map(c => (
              <tr key={c.id}>
                <td><span className="id-code">{c.id}</span></td>
                <td style={{ fontWeight: 500 }}>{c.name}</td>
                <td>{c.company || "—"}</td>
                <td>{c.email || "—"}</td>
                <td>{c.phone || "—"}</td>
                <td>{c.city || "—"}</td>
                <td style={{ maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "var(--warm-gray)", fontSize: 12 }}>{c.notes || "—"}</td>
                <td>
                  <div className="table-actions">
                    <button className="btn btn-ghost btn-sm" onClick={() => openEdit(c)}>{t.edit}</button>
                    <button className="btn btn-danger btn-sm" onClick={() => del(c.id)}>{t.delete}</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <Modal title={modal === "add" ? t.addClient : t.edit} onClose={() => setModal(null)} onSave={save} saveLabel={t.save}>
          <div className="form-grid">
            <div className="form-group full"><label>{t.name}</label><input value={form.name || ""} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
            <div className="form-group"><label>{t.company}</label><input value={form.company || ""} onChange={e => setForm(f => ({ ...f, company: e.target.value }))} /></div>
            <div className="form-group"><label>{t.email}</label><input value={form.email || ""} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
            <div className="form-group"><label>{t.phone}</label><input value={form.phone || ""} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></div>
            <div className="form-group"><label>{t.city}</label><input value={form.city || ""} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} /></div>
            <div className="form-group full"><label>{t.address}</label><input value={form.address || ""} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} /></div>
            <div className="form-group full"><label>{t.notes}</label><textarea value={form.notes || ""} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} /></div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── RENTAL ORDERS ────────────────────────────────────────────────────────────
function Orders({ data, setData, inventory, clients, t, lang }) {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const [orderItems, setOrderItems] = useState([]);

  const filtered = data.filter(o => {
    const q = search.toLowerCase();
    const client = clients.find(c => c.id === o.client_id);
    const matchQ = !q || o.id?.toLowerCase().includes(q) || client?.name?.toLowerCase().includes(q);
    const matchStatus = !filterStatus || o.status === filterStatus;
    return matchQ && matchStatus;
  });

  function openAdd() {
    setForm({ status: "draft", start_date: new Date().toISOString().split("T")[0], end_date: "", total: 0 });
    setOrderItems([]);
    setModal("add");
  }

  function openEdit(o) {
    setForm({ ...o });
    setOrderItems(o.items || []);
    setModal(o);
  }

  function addOrderItem() {
    setOrderItems(prev => [...prev, { item_id: inventory[0]?.id || "", qty: 1, unit_price: 0 }]);
  }

  function updateOrderItem(idx, field, val) {
    setOrderItems(prev => prev.map((it, i) => i === idx ? { ...it, [field]: val } : it));
  }

  function removeOrderItem(idx) {
    setOrderItems(prev => prev.filter((_, i) => i !== idx));
  }

  const computedTotal = orderItems.reduce((s, it) => s + ((+it.qty || 0) * (+it.unit_price || 0)), 0);

  async function save() {
    const nextId = "ORD-" + String(data.length + 1).padStart(4, "0");
    const row = { ...form, id: form.id || nextId, items: orderItems, total: computedTotal };
    if (modal === "add") {
      const saved = await Storage.insert("orders", row);
      setData(prev => [saved || row, ...prev]);
    } else {
      const saved = await Storage.update("orders", form.id, row);
      setData(prev => prev.map(o => o.id === form.id ? (saved || row) : o));
    }
    setModal(null);
  }

  async function del(id) {
    if (!confirm(t.confirmDelete)) return;
    await Storage.delete("orders", id);
    setData(prev => prev.filter(o => o.id !== id));
  }

  const statusKeys = ["draft", "confirmed", "active", "completed", "cancelled"];

  return (
    <div>
      <div className="filter-row">
        <input className="search-bar" placeholder={t.search} value={search} onChange={e => setSearch(e.target.value)} />
        <select className="filter-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">All Status</option>
          {statusKeys.map(s => <option key={s} value={s}>{t[s]}</option>)}
        </select>
        <button className="btn btn-primary" onClick={openAdd}>+ {t.addOrder}</button>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>{t.orderId}</th>
              <th>{t.client}</th>
              <th>{t.startDate}</th>
              <th>{t.endDate}</th>
              <th>{t.items}</th>
              <th>{t.total}</th>
              <th>{t.status}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={8}><EmptyState icon="📋" text={t.noData} /></td></tr>
            ) : filtered.map(o => {
              const client = clients.find(c => c.id === o.client_id);
              return (
                <tr key={o.id}>
                  <td><span className="id-code">{o.id}</span></td>
                  <td style={{ fontWeight: 500 }}>{client?.name || "—"}<br /><span style={{ fontSize: 11, color: "var(--warm-gray)" }}>{client?.company}</span></td>
                  <td>{o.start_date || "—"}</td>
                  <td>{o.end_date || "—"}</td>
                  <td>{(o.items || []).length}</td>
                  <td>{Number(o.total || 0).toLocaleString()} MAD</td>
                  <td><Badge status={o.status} label={t[o.status] || o.status} /></td>
                  <td>
                    <div className="table-actions">
                      <button className="btn btn-ghost btn-sm" onClick={() => openEdit(o)}>{t.edit}</button>
                      <button className="btn btn-danger btn-sm" onClick={() => del(o.id)}>{t.delete}</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {modal && (
        <Modal title={modal === "add" ? t.addOrder : t.edit} onClose={() => setModal(null)} onSave={save} saveLabel={t.save}>
          <div className="form-grid">
            <div className="form-group full">
              <label>{t.client}</label>
              <select value={form.client_id || ""} onChange={e => setForm(f => ({ ...f, client_id: e.target.value }))}>
                <option value="">— Select client —</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}{c.company ? ` (${c.company})` : ""}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>{t.startDate}</label>
              <input type="date" value={form.start_date || ""} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))} />
            </div>
            <div className="form-group">
              <label>{t.endDate}</label>
              <input type="date" value={form.end_date || ""} onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))} />
            </div>
            <div className="form-group">
              <label>{t.status}</label>
              <select value={form.status || "draft"} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                {statusKeys.map(s => <option key={s} value={s}>{t[s]}</option>)}
              </select>
            </div>
            <div className="form-group full">
              <label>{t.notes}</label>
              <textarea value={form.notes || ""} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
            </div>
          </div>

          <div style={{ marginTop: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <label style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--warm-gray)", fontWeight: 600 }}>{t.items}</label>
              <button className="btn btn-ghost btn-sm" onClick={addOrderItem}>+ Add item</button>
            </div>
            {orderItems.map((it, idx) => (
              <div key={idx} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr auto", gap: 8, marginBottom: 8, alignItems: "center" }}>
                <select value={it.item_id} onChange={e => updateOrderItem(idx, "item_id", e.target.value)} style={{ padding: "8px 10px", border: "1px solid var(--border)", borderRadius: "var(--radius)", fontFamily: "Jost, sans-serif", fontSize: 13 }}>
                  <option value="">— Item —</option>
                  {inventory.map(i => <option key={i.id} value={i.id}>{lang === "fr" && i.name_fr ? i.name_fr : i.name}</option>)}
                </select>
                <input type="number" placeholder="Qty" value={it.qty} onChange={e => updateOrderItem(idx, "qty", e.target.value)} style={{ padding: "8px 10px", border: "1px solid var(--border)", borderRadius: "var(--radius)", fontFamily: "Jost, sans-serif", fontSize: 13 }} />
                <input type="number" placeholder="Unit price" value={it.unit_price} onChange={e => updateOrderItem(idx, "unit_price", e.target.value)} style={{ padding: "8px 10px", border: "1px solid var(--border)", borderRadius: "var(--radius)", fontFamily: "Jost, sans-serif", fontSize: 13 }} />
                <button className="btn btn-danger btn-sm" onClick={() => removeOrderItem(idx)}>×</button>
              </div>
            ))}
            <div style={{ textAlign: "right", marginTop: 10, fontFamily: "Cormorant Garamond, serif", fontSize: 18, color: "var(--charcoal)" }}>
              Total: <strong>{computedTotal.toLocaleString()} MAD</strong>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── DAMAGE & LOSS ────────────────────────────────────────────────────────────
function Damage({ data, setData, inventory, t, lang }) {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});

  const filtered = data.filter(d => {
    const q = search.toLowerCase();
    const item = inventory.find(i => i.id === d.item_id);
    const matchQ = !q || d.id?.toLowerCase().includes(q) || item?.name?.toLowerCase().includes(q);
    const matchStatus = !filterStatus || d.status === filterStatus;
    return matchQ && matchStatus;
  });

  function openAdd() {
    setForm({ status: "pending", severity: "minor", report_date: new Date().toISOString().split("T")[0], repair_cost: 0 });
    setModal("add");
  }

  function openEdit(d) { setForm({ ...d }); setModal(d); }

  async function save() {
    const nextId = "DMG-" + String(data.length + 1).padStart(4, "0");
    const row = { ...form, id: form.id || nextId };
    if (modal === "add") {
      const saved = await Storage.insert("damage_reports", row);
      setData(prev => [saved || row, ...prev]);
    } else {
      const saved = await Storage.update("damage_reports", form.id, row);
      setData(prev => prev.map(d => d.id === form.id ? (saved || row) : d));
    }
    setModal(null);
  }

  async function del(id) {
    if (!confirm(t.confirmDelete)) return;
    await Storage.delete("damage_reports", id);
    setData(prev => prev.filter(d => d.id !== id));
  }

  const sevColors = { minor: "#f59e0b", major: "#ef4444", loss: "#7c3aed" };

  return (
    <div>
      <div className="filter-row">
        <input className="search-bar" placeholder={t.search} value={search} onChange={e => setSearch(e.target.value)} />
        <select className="filter-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">All Status</option>
          <option value="pending">{t.pending}</option>
          <option value="resolved">{t.resolved}</option>
        </select>
        <button className="btn btn-primary" onClick={openAdd}>+ {t.addReport}</button>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>{t.itemId}</th>
              <th>{t.reportDate}</th>
              <th>{t.severity}</th>
              <th>{t.repairCost}</th>
              <th>{t.description}</th>
              <th>{t.status}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={8}><EmptyState icon="⚠️" text={t.noData} /></td></tr>
            ) : filtered.map(d => {
              const item = inventory.find(i => i.id === d.item_id);
              return (
                <tr key={d.id}>
                  <td><span className="id-code">{d.id}</span></td>
                  <td>
                    <div style={{ fontWeight: 500, fontSize: 13 }}>{item ? (lang === "fr" && item.name_fr ? item.name_fr : item.name) : "—"}</div>
                    <span className="id-code">{d.item_id}</span>
                  </td>
                  <td>{d.report_date || "—"}</td>
                  <td>
                    <span className="badge" style={{ background: (sevColors[d.severity] || "#9ca3af") + "22", color: sevColors[d.severity] || "#9ca3af" }}>
                      {t[d.severity] || d.severity}
                    </span>
                  </td>
                  <td>{d.repair_cost ? Number(d.repair_cost).toLocaleString() + " MAD" : "—"}</td>
                  <td style={{ maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "var(--warm-gray)", fontSize: 12 }}>{d.description || "—"}</td>
                  <td><Badge status={d.status} label={t[d.status] || d.status} /></td>
                  <td>
                    <div className="table-actions">
                      <button className="btn btn-ghost btn-sm" onClick={() => openEdit(d)}>{t.edit}</button>
                      <button className="btn btn-danger btn-sm" onClick={() => del(d.id)}>{t.delete}</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {modal && (
        <Modal title={modal === "add" ? t.addReport : t.edit} onClose={() => setModal(null)} onSave={save} saveLabel={t.save}>
          <div className="form-grid">
            <div className="form-group full">
              <label>{t.itemId}</label>
              <select value={form.item_id || ""} onChange={e => setForm(f => ({ ...f, item_id: e.target.value }))}>
                <option value="">— Select item —</option>
                {inventory.map(i => <option key={i.id} value={i.id}>{i.id} — {lang === "fr" && i.name_fr ? i.name_fr : i.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>{t.reportDate}</label>
              <input type="date" value={form.report_date || ""} onChange={e => setForm(f => ({ ...f, report_date: e.target.value }))} />
            </div>
            <div className="form-group">
              <label>{t.severity}</label>
              <select value={form.severity || "minor"} onChange={e => setForm(f => ({ ...f, severity: e.target.value }))}>
                <option value="minor">{t.minor}</option>
                <option value="major">{t.major}</option>
                <option value="loss">{t.loss}</option>
              </select>
            </div>
            <div className="form-group">
              <label>{t.repairCost}</label>
              <input type="number" value={form.repair_cost || ""} onChange={e => setForm(f => ({ ...f, repair_cost: +e.target.value }))} />
            </div>
            <div className="form-group">
              <label>{t.status}</label>
              <select value={form.status || "pending"} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                <option value="pending">{t.pending}</option>
                <option value="resolved">{t.resolved}</option>
              </select>
            </div>
            <div className="form-group full">
              <label>{t.description}</label>
              <textarea value={form.description || ""} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            </div>
            <div className="form-group full">
              <label>{t.notes}</label>
              <textarea value={form.notes || ""} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── APP ROOT ─────────────────────────────────────────────────────────────────
export default function App() {
  const [lang, setLang] = useState("en");
  const t = T[lang];
  const [tab, setTab] = useState("dashboard");
  const [inventory, setInventory] = useState([]);
  const [orders, setOrders] = useState([]);
  const [clients, setClients] = useState([]);
  const [damage, setDamage] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    async function load() {
      const [inv, ord, cli, dmg] = await Promise.all([
        Storage.get("inventory"),
        Storage.get("orders"),
        Storage.get("clients"),
        Storage.get("damage_reports"),
      ]);
      setInventory(inv.length ? inv : DEMO_MODE ? SEED_INVENTORY : []);
      setOrders(ord);
      setClients(cli.length ? cli : DEMO_MODE ? SEED_CLIENTS : []);
      setDamage(dmg);
      if (DEMO_MODE && inv.length === 0) {
        localStorage.setItem("mr_inventory", JSON.stringify(SEED_INVENTORY));
        localStorage.setItem("mr_clients", JSON.stringify(SEED_CLIENTS));
      }
      setLoaded(true);
    }
    load();
  }, []);

  const NAV = [
    { key: "dashboard", icon: "◈", label: t.dashboard },
    { key: "inventory", icon: "🏺", label: t.inventory },
    { key: "orders", icon: "📋", label: t.orders },
    { key: "clients", icon: "👥", label: t.clients },
    { key: "damage", icon: "⚠️", label: t.damage },
  ];

  const PAGE_TITLES = {
    dashboard: t.dashboard,
    inventory: t.inventory,
    orders: t.orders,
    clients: t.clients,
    damage: t.damage,
  };

  return (
    <>
      <style>{styles}</style>
      <div className="app">
        <div className="sidebar">
          <div className="sidebar-brand">
            <h1>{t.appName}</h1>
            <p>{t.appSub}</p>
          </div>
          <nav className="sidebar-nav">
            {NAV.map(n => (
              <div key={n.key} className={`nav-item${tab === n.key ? " active" : ""}`} onClick={() => setTab(n.key)}>
                <span className="nav-icon">{n.icon}</span>
                <span>{n.label}</span>
              </div>
            ))}
          </nav>
          <div className="sidebar-lang">
            <button className={`lang-btn${lang === "en" ? " active" : ""}`} onClick={() => setLang("en")}>EN</button>
            <button className={`lang-btn${lang === "fr" ? " active" : ""}`} onClick={() => setLang("fr")}>FR</button>
          </div>
        </div>

        <div className="main">
          <div className="topbar">
            <h2>{PAGE_TITLES[tab]}</h2>
            <div className="topbar-actions">
              {DEMO_MODE && <span style={{ fontSize: 11, color: "var(--gold)", background: "var(--gold-pale)", padding: "4px 10px", borderRadius: 4 }}>DEMO</span>}
            </div>
          </div>

          <div className="content">
            {DEMO_MODE && (
              <div className="demo-banner">
                <span>⚡</span> {t.demoMode}
              </div>
            )}
            {!loaded ? (
              <div style={{ textAlign: "center", padding: 60, color: "var(--warm-gray)" }}>Loading…</div>
            ) : (
              <>
                {tab === "dashboard" && <Dashboard inventory={inventory} orders={orders} clients={clients} damage={damage} t={t} />}
                {tab === "inventory" && <Inventory data={inventory} setData={setInventory} t={t} lang={lang} />}
                {tab === "orders" && <Orders data={orders} setData={setOrders} inventory={inventory} clients={clients} t={t} lang={lang} />}
                {tab === "clients" && <Clients data={clients} setData={setClients} t={t} />}
                {tab === "damage" && <Damage data={damage} setData={setDamage} inventory={inventory} t={t} lang={lang} />}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
