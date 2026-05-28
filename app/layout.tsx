import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Maison Rinceau — Inventory Management",
  description: "Luxury rental inventory management for Maison Rinceau",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
