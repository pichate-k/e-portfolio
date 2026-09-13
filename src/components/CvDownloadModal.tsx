"use client";

import React, { useState } from "react";
import {
  FileText,
  FileCode,
  Lock,
  Eye,
  EyeOff,
  X,
  Download,
  AlertCircle,
  Loader2,
  Globe,
} from "lucide-react";
import { Language, translations } from "@/lib/i18n";
import styles from "./CvDownloadModal.module.css";

interface CvDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  requirePassword?: boolean;
  currentLang?: Language;
}

export const CvDownloadModal: React.FC<CvDownloadModalProps> = ({
  isOpen,
  onClose,
  requirePassword = true,
  currentLang = "en",
}) => {
  const [format, setFormat] = useState<"pdf" | "docx">("pdf");
  const [docLang, setDocLang] = useState<Language>(currentLang);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const t = translations[currentLang];

  if (!isOpen) return null;

  const handleDownload = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch("/api/cv/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          format,
          password: password.trim(),
          lang: docLang,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || "Failed to download CV document.");
        setIsLoading(false);
        return;
      }

      // Download file blob
      const blob = await response.blob();
      const filenameHeader = response.headers.get("Content-Disposition");
      let filename = `Portfolio_CV_${docLang.toUpperCase()}.${format}`;
      if (filenameHeader && filenameHeader.includes("filename=")) {
        const match = filenameHeader.match(/filename="?([^"]+)"?/);
        if (match && match[1]) filename = decodeURIComponent(match[1]);
      }

      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);

      setIsLoading(false);
      onClose();
    } catch {
      setError("An unexpected network error occurred.");
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div className={styles.titleArea}>
            <div className={styles.iconShield}>
              <Lock size={20} />
            </div>
            <div>
              <h3 className={styles.modalTitle}>{t.downloadCv}</h3>
              <p className={styles.modalSubtitle}>
                {t.chooseFormat} & {t.accessPassword}
              </p>
            </div>
          </div>
          <button onClick={onClose} className={styles.closeBtn} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleDownload}>
          <div className={styles.modalBody}>
            {/* Choose Format */}
            <label className={styles.inputLabel}>{t.chooseFormat}</label>
            <div className={styles.formatSelector}>
              <div
                className={`${styles.formatOption} ${
                  format === "pdf" ? styles.formatOptionActive : ""
                }`}
                onClick={() => setFormat("pdf")}
              >
                <FileText size={28} />
                <span className={styles.formatName}>{t.pdfDoc}</span>
                <span className={styles.formatDesc}>{t.pdfDesc}</span>
              </div>

              <div
                className={`${styles.formatOption} ${
                  format === "docx" ? styles.formatOptionActive : ""
                }`}
                onClick={() => setFormat("docx")}
              >
                <FileCode size={28} />
                <span className={styles.formatName}>{t.wordDoc}</span>
                <span className={styles.formatDesc}>{t.wordDesc}</span>
              </div>
            </div>

            {/* Choose Document Language */}
            <div className={styles.inputGroup}>
              <label className={styles.inputLabel} style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <Globe size={15} />
                <span>{t.downloadLanguage}</span>
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "0.5rem" }}>
                <button
                  type="button"
                  onClick={() => setDocLang("en")}
                  style={{
                    padding: "0.65rem",
                    borderRadius: "var(--radius-md)",
                    border: docLang === "en" ? "2px solid var(--primary)" : "1px solid var(--border-strong)",
                    background: docLang === "en" ? "var(--primary-subtle)" : "var(--bg-card)",
                    color: docLang === "en" ? "var(--primary)" : "var(--text-secondary)",
                    fontWeight: 600,
                    fontSize: "0.88rem",
                    cursor: "pointer",
                  }}
                >
                  🇺🇸 English (EN)
                </button>
                <button
                  type="button"
                  onClick={() => setDocLang("th")}
                  style={{
                    padding: "0.65rem",
                    borderRadius: "var(--radius-md)",
                    border: docLang === "th" ? "2px solid var(--primary)" : "1px solid var(--border-strong)",
                    background: docLang === "th" ? "var(--primary-subtle)" : "var(--bg-card)",
                    color: docLang === "th" ? "var(--primary)" : "var(--text-secondary)",
                    fontWeight: 600,
                    fontSize: "0.88rem",
                    cursor: "pointer",
                  }}
                >
                  🇹🇭 ภาษาไทย (TH)
                </button>
              </div>
            </div>

            {/* Access Password */}
            {requirePassword && (
              <div className={styles.inputGroup}>
                <label className={styles.inputLabel} htmlFor="cv-password">
                  {t.accessPassword}
                </label>
                <div className={styles.passwordInputWrapper}>
                  <input
                    id="cv-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t.enterPassword}
                    className={styles.passwordInput}
                    required
                    autoFocus
                  />
                  <button
                    type="button"
                    className={styles.toggleEyeBtn}
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <p className={styles.helperNote}>{t.defaultKeyHint}</p>
              </div>
            )}

            {error && (
              <div className={styles.errorBanner}>
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}
          </div>

          <div className={styles.modalFooter}>
            <button
              type="button"
              onClick={onClose}
              className={styles.cancelBtn}
              disabled={isLoading}
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              className={styles.submitBtn}
              disabled={isLoading || (requirePassword && !password)}
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Loading...</span>
                </>
              ) : (
                <>
                  <Download size={18} />
                  <span>
                    {t.download} {format.toUpperCase()} ({docLang.toUpperCase()})
                  </span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
