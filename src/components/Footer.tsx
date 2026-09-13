"use client";

import React from "react";
import Link from "next/link";
import { ShieldCheck, Heart } from "lucide-react";
import { Language, translations } from "@/lib/i18n";

interface FooterProps {
  fullName?: string;
  fullNameTh?: string | null;
  workplace?: string;
  workplaceTh?: string | null;
  lang: Language;
}

export const Footer: React.FC<FooterProps> = ({
  fullName = "User Name",
  fullNameTh,
  workplace = "University / Organization",
  workplaceTh,
  lang,
}) => {
  const t = translations[lang];
  const name = (lang === "th" && fullNameTh) || fullName;
  const place = (lang === "th" && workplaceTh) || workplace;

  return (
    <footer
      style={{
        borderTop: "1px solid var(--border-subtle)",
        background: "var(--bg-card)",
        padding: "3rem 0 2rem 0",
        marginTop: "4rem",
        color: "var(--text-muted)",
        fontSize: "0.9rem",
      }}
    >
      <div
        className="container"
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "1.5rem",
        }}
      >
        <div>
          <p style={{ fontWeight: 600, color: "var(--text-primary)" }}>{name}</p>
          <p style={{ fontSize: "0.85rem", marginTop: "0.2rem" }}>{place}</p>
          <p style={{ fontSize: "0.8rem", marginTop: "0.5rem" }}>
            © {new Date().getFullYear()} All rights reserved by Kunatechnology Co.,LTD
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>

          <Link
            href="/admin"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
              padding: "0.4rem 0.8rem",
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--border-subtle)",
              background: "var(--bg-main)",
              color: "var(--text-secondary)",
              fontWeight: 500,
              fontSize: "0.82rem",
            }}
          >
            <ShieldCheck size={15} />
            <span>{t.adminPortal}</span>
          </Link>
        </div>
      </div>
    </footer>
  );
};
