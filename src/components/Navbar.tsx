"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Download, Sun, Moon, ShieldCheck, User } from "lucide-react";
import { Language, translations } from "@/lib/i18n";
import styles from "./Navbar.module.css";

interface NavbarProps {
  fullName?: string;
  fullNameTh?: string | null;
  currentPosition?: string;
  currentPositionTh?: string | null;
  lang: Language;
  onToggleLang: (lang: Language) => void;
  onOpenDownloadModal: () => void;
  sections?: { id: string; slug: string; title: string; titleTh?: string | null }[];
}

export const Navbar: React.FC<NavbarProps> = ({
  fullName = "User Name",
  fullNameTh,
  currentPosition = "Portfolio",
  currentPositionTh,
  lang,
  onToggleLang,
  onOpenDownloadModal,
  sections = [],
}) => {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);
  const t = translations[lang];

  useEffect(() => {
    setMounted(true);
    const currentTheme =
      document.documentElement.getAttribute("data-theme") === "dark"
        ? "dark"
        : "light";
    setTheme(currentTheme);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
    localStorage.setItem("theme", nextTheme);
  };

  const displayName = lang === "th" && fullNameTh ? fullNameTh : fullName;
  const displayPosition =
    lang === "th" && currentPositionTh ? currentPositionTh : currentPosition;

  const initials = fullName
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("");

  return (
    <header className={styles.navbar}>
      <div className={`container ${styles.navContainer}`}>
        <Link href="/" className={styles.brand}>
          <span className={styles.brandName}>{displayName}</span>
          <span className={styles.brandDot} />
        </Link>

        <nav className={styles.nav}>
          <ul className={styles.navLinks}>
            {sections.slice(0, 4).map((sec) => (
              <li key={sec.id}>
                <a href={`#${sec.slug}`} className={styles.navLink}>
                  {lang === "th" && sec.titleTh ? sec.titleTh : sec.title}
                </a>
              </li>
            ))}
            <li>
              <Link href="/card" className={styles.navLink}>
                {lang === "th" ? "นามบัตรดิจิทัล" : "E-Card"}
              </Link>
            </li>
            <li>
              <Link href="/gallery" className={styles.navLink}>
                {lang === "th" ? "แกลเลอรีภาพ" : "Gallery"}
              </Link>
            </li>
          </ul>
        </nav>

        <div className={styles.navActions}>
          {/* Minimal Language Switcher */}
          <div className={styles.langToggle}>
            <button
              onClick={() => onToggleLang("en")}
              className={`${styles.langBtn} ${
                lang === "en" ? styles.langBtnActive : ""
              }`}
              title="Switch to English"
            >
              EN
            </button>
            <span className={styles.langDivider}>/</span>
            <button
              onClick={() => onToggleLang("th")}
              className={`${styles.langBtn} ${
                lang === "th" ? styles.langBtnActive : ""
              }`}
              title="เปลี่ยนเป็นภาษาไทย"
            >
              TH
            </button>
          </div>

          {mounted && (
            <button
              onClick={toggleTheme}
              className={styles.iconBtn}
              aria-label="Toggle Theme"
              title={theme === "dark" ? t.switchThemeLight : t.switchThemeDark}
            >
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          )}

          <button
            onClick={onOpenDownloadModal}
            className={styles.downloadBtn}
            title={t.downloadCvFull}
          >
            <Download size={14} />
            <span>CV</span>
          </button>

          <Link
            href="/admin"
            className={styles.iconBtn}
            title={t.adminPortal}
            aria-label="Admin Portal"
          >
            <ShieldCheck size={16} />
          </Link>
        </div>
      </div>
    </header>
  );
};
