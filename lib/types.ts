export interface InventoryItem {
  id: string;
  name: string;
  name_fr?: string;
  category: string;
  era?: string;
  quantity: number;
  qty_available: number;
  status: "available" | "rented" | "damaged" | "cleaning" | "retired";
  origin?: string;
  value?: number;
  description?: string;
  notes?: string;
  created_at?: string;
}

export interface Client {
  id: string;
  name: string;
  company?: string;
  email?: string;
  phone?: string;
  city?: string;
  address?: string;
  notes?: string;
  created_at?: string;
}

export interface OrderItem {
  item_id: string;
  qty: number;
  unit_price: number;
}

export interface Order {
  id: string;
  client_id?: string;
  status: "draft" | "confirmed" | "active" | "completed" | "cancelled";
  start_date?: string;
  end_date?: string;
  total: number;
  items: OrderItem[];
  notes?: string;
  created_at?: string;
}

export interface DamageReport {
  id: string;
  item_id?: string;
  report_date?: string;
  severity: "minor" | "major" | "loss";
  repair_cost: number;
  description?: string;
  notes?: string;
  status: "pending" | "resolved";
  created_at?: string;
}
