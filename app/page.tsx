"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LandingPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        router.push("/dashboard");
      } else {
        setError("Incorrect password. Please try again.");
        setPassword("");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--bg)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px",
    }}>
      {/* Decorative background radial */}
      <div style={{
        position: "fixed",
        inset: 0,
        background: "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(201,164,85,0.07) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      {/* Brand mark */}
      <div style={{ textAlign: "center", marginBottom: 48, position: "relative" }}>
        <div style={{ fontSize: 32, color: "var(--gold)", marginBottom: 16 }}>✦</div>
        <h1 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 36,
          fontWeight: 700,
          color: "var(--text)",
          letterSpacing: "0.02em",
          marginBottom: 8,
        }}>
          Maison Rinceau
        </h1>
        <p style={{
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: "var(--text-faint)",
        }}>
          Inventory Management
        </p>
      </div>

      {/* Login card */}
      <div style={{
        background: "var(--card)",
        border: "1px solid rgba(201,164,85,0.18)",
        borderRadius: 16,
        padding: "40px 36px",
        width: "100%",
        maxWidth: 380,
        position: "relative",
      }}>
        <p style={{
          textAlign: "center",
          color: "var(--text-dim)",
          fontSize: 14,
          marginBottom: 28,
          lineHeight: 1.6,
        }}>
          Enter your access password to manage the inventory.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="fl">
            <label>Access Password</label>
            <input
              type="password"
              className="inp"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoFocus
              required
            />
          </div>

          {error && (
            <div style={{
              color: "#f87171",
              fontSize: 13,
              padding: "8px 12px",
              background: "rgba(248,113,113,0.07)",
              borderRadius: 6,
              marginBottom: 16,
              textAlign: "center",
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-g"
            disabled={loading}
            style={{ width: "100%", justifyContent: "center", padding: "12px 18px", fontSize: 14 }}
          >
            {loading ? "Verifying…" : "Enter"}
          </button>
        </form>
      </div>

      {/* Footer */}
      <p style={{
        marginTop: 40,
        fontSize: 11,
        color: "var(--text-faint)",
        letterSpacing: "0.06em",
      }}>
        Grandeur Tableware Rentals — Marrakech
      </p>
    </div>
  );
}
