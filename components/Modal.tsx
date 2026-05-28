"use client";

import React from "react";

interface ModalProps {
  title: string;
  onClose: () => void;
  onSave?: () => void;
  saveLabel?: string;
  children: React.ReactNode;
}

export default function Modal({ title, onClose, onSave, saveLabel = "Save", children }: ModalProps) {
  return (
    <div
      className="overlay"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="modal-box">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 19, color: "var(--text)" }}>
            {title}
          </h2>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", color: "var(--text-muted)", fontSize: 18, cursor: "pointer" }}
          >
            ✕
          </button>
        </div>

        {children}

        {onSave && (
          <div style={{ display: "flex", gap: 9, justifyContent: "flex-end", marginTop: 20 }}>
            <button className="btn btn-o" onClick={onClose}>Cancel</button>
            <button className="btn btn-g" onClick={onSave}>{saveLabel}</button>
          </div>
        )}
      </div>
    </div>
  );
}
