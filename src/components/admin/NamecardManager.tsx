"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  CreditCard,
  Plus,
  Edit2,
  Trash2,
  Copy,
  Star,
  Download,
  ExternalLink,
  Save,
  ArrowLeft,
  Check,
  Palette,
  QrCode,
  User,
  Share2,
  Sparkles,
} from "lucide-react";
import { NamecardData, CARD_TEMPLATES } from "../card/cardTemplates";
import { NamecardVisual, NamecardVisualRef } from "../card/NamecardVisual";
import { downloadCardImage, downloadBothSides } from "@/lib/cardExport";
import styles from "./NamecardManager.module.css";

interface NamecardManagerProps {
  onNotify?: (msg: { type: "success" | "error"; text: string }) => void;
}

export const NamecardManager: React.FC<NamecardManagerProps> = ({ onNotify }) => {
  const [cards, setCards] = useState<NamecardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingCard, setEditingCard] = useState<NamecardData | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [activeSide, setActiveSide] = useState<"front" | "back">("front");
  const [previewLang, setPreviewLang] = useState<"en" | "th">("en");
  const [exporting, setExporting] = useState(false);

  const visualRef = useRef<NamecardVisualRef>(null);

  // Load namecards
  const fetchCards = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/namecards");
      const data = await res.json();
      if (data.success && data.cards) {
        setCards(data.cards);
      } else {
        onNotify?.({ type: "error", text: data.error || "Failed to load cards" });
      }
    } catch (err: any) {
      onNotify?.({ type: "error", text: err.message || "Network error loading cards" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCards();
  }, []);

  // Create new card
  const handleStartCreate = () => {
    const defaultTemplate = CARD_TEMPLATES[0];
    const newCard: NamecardData = {
      slug: `card-${cards.length + 1}`,
      title: `Digital Card ${cards.length + 1}`,
      template: defaultTemplate.id,
      isDefault: cards.length === 0,
      fullName: cards[0]?.fullName || "Dr. Pichate K.",
      fullNameTh: cards[0]?.fullNameTh || "ดร. พิเชษฐ์ เค.",
      position: cards[0]?.position || "Assistant Professor & AI Researcher",
      positionTh: cards[0]?.positionTh || "ผู้ช่วยศาสตราจารย์ และนักวิจัย AI",
      organization: cards[0]?.organization || "Rajamangala University of Technology Thanyaburi",
      organizationTh: cards[0]?.organizationTh || "มหาวิทยาลัยเทคโนโลยีราชมงคลธัญบุรี",
      department: cards[0]?.department || "Faculty of Engineering",
      departmentTh: cards[0]?.departmentTh || "คณะวิศวกรรมศาสตร์",
      email: cards[0]?.email || "",
      phone: cards[0]?.phone || "",
      websiteUrl: cards[0]?.websiteUrl || "",
      address: cards[0]?.address || "Pathum Thani, Thailand",
      addressTh: cards[0]?.addressTh || "จ.ปทุมธานี ประเทศไทย",
      avatarUrl: cards[0]?.avatarUrl || "",
      logoUrl: cards[0]?.logoUrl || "",
      linkedinUrl: cards[0]?.linkedinUrl || "",
      githubUrl: cards[0]?.githubUrl || "",
      lineId: cards[0]?.lineId || "",
      backTagline: "Innovating AI & Embedded Systems",
      backTaglineTh: "สร้างสรรค์นวัตกรรม AI และระบบสมองกลฝังตัว",
      backSubtitle: "Research • Academic • Consulting",
      qrType: "card_url",
      primaryColor: defaultTemplate.defaultPrimary,
      accentColor: defaultTemplate.defaultAccent,
      backgroundColor: defaultTemplate.defaultBg,
    };

    setEditingCard(newCard);
    setIsNew(true);
    setActiveSide("front");
  };

  // Edit existing card
  const handleStartEdit = (card: NamecardData) => {
    setEditingCard({ ...card });
    setIsNew(false);
    setActiveSide("front");
  };

  // Duplicate card
  const handleDuplicate = async (card: NamecardData) => {
    try {
      const cloned: Partial<NamecardData> = {
        ...card,
        id: undefined,
        slug: `${card.slug}-copy`,
        title: `${card.title} (Copy)`,
        isDefault: false,
      };

      const res = await fetch("/api/admin/namecards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cloned),
      });
      const data = await res.json();
      if (data.success) {
        onNotify?.({ type: "success", text: `Cloned "${card.title}" successfully!` });
        await fetchCards();
      } else {
        onNotify?.({ type: "error", text: data.error || "Failed to clone card" });
      }
    } catch (err: any) {
      onNotify?.({ type: "error", text: err.message });
    }
  };

  // Set as default
  const handleSetDefault = async (card: NamecardData) => {
    if (!card.id) return;
    try {
      const res = await fetch(`/api/admin/namecards/${card.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isDefault: true }),
      });
      const data = await res.json();
      if (data.success) {
        onNotify?.({ type: "success", text: `Set "${card.title}" as default e-card!` });
        await fetchCards();
      }
    } catch (err: any) {
      onNotify?.({ type: "error", text: err.message });
    }
  };

  // Delete card
  const handleDelete = async (card: NamecardData) => {
    if (!card.id) return;
    if (!confirm(`Are you sure you want to delete "${card.title}"?`)) return;

    try {
      const res = await fetch(`/api/admin/namecards/${card.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        onNotify?.({ type: "success", text: "Namecard deleted successfully" });
        await fetchCards();
      } else {
        onNotify?.({ type: "error", text: data.error || "Failed to delete" });
      }
    } catch (err: any) {
      onNotify?.({ type: "error", text: err.message });
    }
  };

  // Save changes
  const handleSave = async () => {
    if (!editingCard) return;
    setSaving(true);

    try {
      const url = isNew
        ? "/api/admin/namecards"
        : `/api/admin/namecards/${editingCard.id}`;
      const method = isNew ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingCard),
      });

      const data = await res.json();
      if (data.success) {
        onNotify?.({
          type: "success",
          text: isNew ? "Created namecard successfully!" : "Saved namecard changes!",
        });
        setEditingCard(null);
        await fetchCards();
      } else {
        onNotify?.({ type: "error", text: data.error || "Failed to save namecard" });
      }
    } catch (err: any) {
      onNotify?.({ type: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  };

  // Image Export handlers
  const handleDownloadFront = async () => {
    if (!visualRef.current?.frontElement || !editingCard) return;
    try {
      setExporting(true);
      await downloadCardImage({
        element: visualRef.current.frontElement,
        filename: `${editingCard.slug}-front`,
      });
      onNotify?.({ type: "success", text: "Downloaded front card image (PNG)!" });
    } catch {
      onNotify?.({ type: "error", text: "Could not export front card image" });
    } finally {
      setExporting(false);
    }
  };

  const handleDownloadBack = async () => {
    if (!visualRef.current?.backElement || !editingCard) return;
    try {
      setExporting(true);
      await downloadCardImage({
        element: visualRef.current.backElement,
        filename: `${editingCard.slug}-back`,
      });
      onNotify?.({ type: "success", text: "Downloaded back card image (PNG)!" });
    } catch {
      onNotify?.({ type: "error", text: "Could not export back card image" });
    } finally {
      setExporting(false);
    }
  };

  const handleDownloadBoth = async () => {
    if (
      !visualRef.current?.frontElement ||
      !visualRef.current?.backElement ||
      !editingCard
    )
      return;
    try {
      setExporting(true);
      await downloadBothSides(
        visualRef.current.frontElement,
        visualRef.current.backElement,
        editingCard.slug
      );
      onNotify?.({ type: "success", text: "Downloaded both card images (PNG)!" });
    } catch {
      onNotify?.({ type: "error", text: "Could not export card images" });
    } finally {
      setExporting(false);
    }
  };

  // Template select change
  const handleSelectTemplate = (templateId: string) => {
    if (!editingCard) return;
    const tmplDef = CARD_TEMPLATES.find((t) => t.id === templateId);
    if (!tmplDef) return;

    setEditingCard({
      ...editingCard,
      template: templateId,
      primaryColor: tmplDef.defaultPrimary,
      accentColor: tmplDef.defaultAccent,
      backgroundColor: tmplDef.defaultBg,
    });
  };

  if (loading) {
    return (
      <div style={{ padding: "40px", textAlign: "center", opacity: 0.7 }}>
        Loading Digital Namecards...
      </div>
    );
  }

  // =========================================================================
  // VIEW 1: EDITOR / DRAWER
  // =========================================================================
  if (editingCard) {
    return (
      <div className={styles.container}>
        {/* Top Control Bar */}
        <div className={styles.headerRow}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button
              onClick={() => setEditingCard(null)}
              className={styles.btnSecondary}
              type="button"
            >
              <ArrowLeft size={16} />
              <span>Back to Cards List</span>
            </button>
            <div>
              <h2 className={styles.headerTitle}>
                {isNew ? "Create New Digital Namecard" : `Edit: ${editingCard.title}`}
              </h2>
              <p className={styles.headerDesc}>
                Live 2-sided 3D preview, QR Code, VCF, and high-resolution export.
              </p>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className={styles.btnPrimary}
            >
              <Save size={16} />
              <span>{saving ? "Saving..." : "Save Card"}</span>
            </button>
          </div>
        </div>

        {/* Editor Grid: Sticky Preview on Left, Settings on Right */}
        <div className={styles.editorGrid}>
          {/* Left Column: Live Visual Preview */}
          <div className={styles.previewColumn}>
            <div className={styles.previewHeader}>
              <span className={styles.previewTitle}>Live 2-Sided Preview</span>
              <div style={{ display: "flex", gap: 4 }}>
                <button
                  type="button"
                  onClick={() => setPreviewLang("en")}
                  className={`${styles.btnSecondary} ${
                    previewLang === "en" ? styles.templateOptionActive : ""
                  }`}
                  style={{ padding: "4px 8px", fontSize: 11 }}
                >
                  EN
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewLang("th")}
                  className={`${styles.btnSecondary} ${
                    previewLang === "th" ? styles.templateOptionActive : ""
                  }`}
                  style={{ padding: "4px 8px", fontSize: 11 }}
                >
                  TH
                </button>
              </div>
            </div>

            {/* Visual Card Component */}
            <NamecardVisual
              ref={visualRef}
              card={editingCard}
              lang={previewLang}
              activeSide={activeSide}
              onFlipChange={(side) => setActiveSide(side)}
              showFlipButton={true}
            />

            {/* High-Resolution Export Buttons */}
            <div className={styles.exportButtonsBox}>
              <span className={styles.exportTitle}>High-Res Card Image Export (PNG)</span>
              <div className={styles.downloadRow}>
                <button
                  type="button"
                  onClick={handleDownloadFront}
                  disabled={exporting}
                  className={styles.btnDownload}
                >
                  <Download size={14} />
                  <span>Front Side</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadBack}
                  disabled={exporting}
                  className={styles.btnDownload}
                >
                  <Download size={14} />
                  <span>Back Side</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadBoth}
                  disabled={exporting}
                  className={`${styles.btnDownload} ${styles.btnDownloadAll}`}
                >
                  <Sparkles size={14} />
                  <span>Download Both Sides (300 DPI)</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Form Settings */}
          <div className={styles.formColumn}>
            {/* 1. Identification & Template */}
            <div className={styles.formSection}>
              <h3 className={styles.formSectionTitle}>
                <Palette size={16} color="var(--primary)" />
                <span>Card Identity & Design Template</span>
              </h3>

              <div className={styles.fieldRow}>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>Card Label / Title</label>
                  <input
                    type="text"
                    value={editingCard.title}
                    onChange={(e) =>
                      setEditingCard({ ...editingCard, title: e.target.value })
                    }
                    className={styles.input}
                    placeholder="e.g. Academic & Research Card"
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>URL Slug</label>
                  <input
                    type="text"
                    value={editingCard.slug}
                    onChange={(e) =>
                      setEditingCard({ ...editingCard, slug: e.target.value })
                    }
                    className={styles.input}
                    placeholder="e.g. academic, consultant"
                  />
                  <span className={styles.fieldHint}>
                    Live card path: /card/{editingCard.slug || "..."}
                  </span>
                </div>
              </div>

              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={editingCard.isDefault}
                  onChange={(e) =>
                    setEditingCard({ ...editingCard, isDefault: e.target.checked })
                  }
                />
                <span>Set as Default Card (opens at /card and /ecard)</span>
              </label>

              {/* Template Selector */}
              <div className={styles.fieldGroup} style={{ marginTop: 10 }}>
                <label className={styles.fieldLabel}>Select Design Template</label>
                <div className={styles.templatePickerGrid}>
                  {CARD_TEMPLATES.map((tmpl) => (
                    <div
                      key={tmpl.id}
                      onClick={() => handleSelectTemplate(tmpl.id)}
                      className={`${styles.templateOption} ${
                        editingCard.template === tmpl.id
                          ? styles.templateOptionActive
                          : ""
                      }`}
                    >
                      <div
                        className={styles.templatePreviewSwath}
                        style={{ background: tmpl.previewBg }}
                      />
                      <span className={styles.templateName}>{tmpl.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Colors Override */}
              <div className={styles.colorPickerRow}>
                <div className={styles.colorPickerItem}>
                  <label>Primary Accent:</label>
                  <input
                    type="color"
                    value={editingCard.primaryColor || "#ea580c"}
                    onChange={(e) =>
                      setEditingCard({ ...editingCard, primaryColor: e.target.value })
                    }
                    className={styles.colorInput}
                  />
                </div>

                <div className={styles.colorPickerItem}>
                  <label>Secondary Accent:</label>
                  <input
                    type="color"
                    value={editingCard.accentColor || "#f97316"}
                    onChange={(e) =>
                      setEditingCard({ ...editingCard, accentColor: e.target.value })
                    }
                    className={styles.colorInput}
                  />
                </div>
              </div>
            </div>

            {/* 2. Personal & Professional Information (Dual Language) */}
            <div className={styles.formSection}>
              <h3 className={styles.formSectionTitle}>
                <User size={16} color="var(--primary)" />
                <span>Front Side: Persona & Credentials</span>
              </h3>

              <div className={styles.fieldRow}>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>Full Name (EN)</label>
                  <input
                    type="text"
                    value={editingCard.fullName}
                    onChange={(e) =>
                      setEditingCard({ ...editingCard, fullName: e.target.value })
                    }
                    className={styles.input}
                    placeholder="Dr. Pichate K."
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>Full Name (TH)</label>
                  <input
                    type="text"
                    value={editingCard.fullNameTh || ""}
                    onChange={(e) =>
                      setEditingCard({ ...editingCard, fullNameTh: e.target.value })
                    }
                    className={styles.input}
                    placeholder="ดร. พิเชษฐ์ เค."
                  />
                </div>
              </div>

              <div className={styles.fieldRow}>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>Position / Role (EN)</label>
                  <input
                    type="text"
                    value={editingCard.position}
                    onChange={(e) =>
                      setEditingCard({ ...editingCard, position: e.target.value })
                    }
                    className={styles.input}
                    placeholder="Assistant Professor & Lead AI Researcher"
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>Position / Role (TH)</label>
                  <input
                    type="text"
                    value={editingCard.positionTh || ""}
                    onChange={(e) =>
                      setEditingCard({ ...editingCard, positionTh: e.target.value })
                    }
                    className={styles.input}
                    placeholder="ผู้ช่วยศาสตราจารย์ และหัวหน้าทีมนักวิจัย AI"
                  />
                </div>
              </div>

              <div className={styles.fieldRow}>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>Organization / University (EN)</label>
                  <input
                    type="text"
                    value={editingCard.organization || ""}
                    onChange={(e) =>
                      setEditingCard({ ...editingCard, organization: e.target.value })
                    }
                    className={styles.input}
                    placeholder="Rajamangala University of Technology Thanyaburi"
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>Organization / University (TH)</label>
                  <input
                    type="text"
                    value={editingCard.organizationTh || ""}
                    onChange={(e) =>
                      setEditingCard({ ...editingCard, organizationTh: e.target.value })
                    }
                    className={styles.input}
                    placeholder="มหาวิทยาลัยเทคโนโลยีราชมงคลธัญบุรี"
                  />
                </div>
              </div>

              <div className={styles.fieldRow}>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>Faculty / Department (EN)</label>
                  <input
                    type="text"
                    value={editingCard.department || ""}
                    onChange={(e) =>
                      setEditingCard({ ...editingCard, department: e.target.value })
                    }
                    className={styles.input}
                    placeholder="Faculty of Engineering"
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>Faculty / Department (TH)</label>
                  <input
                    type="text"
                    value={editingCard.departmentTh || ""}
                    onChange={(e) =>
                      setEditingCard({ ...editingCard, departmentTh: e.target.value })
                    }
                    className={styles.input}
                    placeholder="คณะวิศวกรรมศาสตร์"
                  />
                </div>
              </div>

              <div className={styles.fieldRow}>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>Avatar / Photo URL</label>
                  <input
                    type="text"
                    value={editingCard.avatarUrl || ""}
                    onChange={(e) =>
                      setEditingCard({ ...editingCard, avatarUrl: e.target.value })
                    }
                    className={styles.input}
                    placeholder="https://... or upload"
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>Logo / Crest URL (Optional)</label>
                  <input
                    type="text"
                    value={editingCard.logoUrl || ""}
                    onChange={(e) =>
                      setEditingCard({ ...editingCard, logoUrl: e.target.value })
                    }
                    className={styles.input}
                    placeholder="Institutional Logo URL"
                  />
                </div>
              </div>
            </div>

            {/* 3. Contact & Social Information */}
            <div className={styles.formSection}>
              <h3 className={styles.formSectionTitle}>
                <Share2 size={16} color="var(--primary)" />
                <span>Contact Details & vCard Fields</span>
              </h3>

              <div className={styles.fieldRow}>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>Email Address</label>
                  <input
                    type="email"
                    value={editingCard.email || ""}
                    onChange={(e) =>
                      setEditingCard({ ...editingCard, email: e.target.value })
                    }
                    className={styles.input}
                    placeholder="pichate.k@rmutt.ac.th"
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>Phone Number</label>
                  <input
                    type="tel"
                    value={editingCard.phone || ""}
                    onChange={(e) =>
                      setEditingCard({ ...editingCard, phone: e.target.value })
                    }
                    className={styles.input}
                    placeholder="+66 (0) 2-549-3400"
                  />
                </div>
              </div>

              <div className={styles.fieldRow}>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>Website URL</label>
                  <input
                    type="url"
                    value={editingCard.websiteUrl || ""}
                    onChange={(e) =>
                      setEditingCard({ ...editingCard, websiteUrl: e.target.value })
                    }
                    className={styles.input}
                    placeholder="https://pichatek.com"
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>Address / Location</label>
                  <input
                    type="text"
                    value={editingCard.address || ""}
                    onChange={(e) =>
                      setEditingCard({ ...editingCard, address: e.target.value })
                    }
                    className={styles.input}
                    placeholder="Pathum Thani, Thailand"
                  />
                </div>
              </div>

              <div className={styles.fieldRow}>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>LinkedIn Profile</label>
                  <input
                    type="text"
                    value={editingCard.linkedinUrl || ""}
                    onChange={(e) =>
                      setEditingCard({ ...editingCard, linkedinUrl: e.target.value })
                    }
                    className={styles.input}
                    placeholder="https://linkedin.com/in/..."
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>GitHub Profile</label>
                  <input
                    type="text"
                    value={editingCard.githubUrl || ""}
                    onChange={(e) =>
                      setEditingCard({ ...editingCard, githubUrl: e.target.value })
                    }
                    className={styles.input}
                    placeholder="https://github.com/..."
                  />
                </div>
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>LINE ID / Social Handle</label>
                <input
                  type="text"
                  value={editingCard.lineId || ""}
                  onChange={(e) =>
                    setEditingCard({ ...editingCard, lineId: e.target.value })
                  }
                  className={styles.input}
                  placeholder="@yourlineid"
                />
              </div>
            </div>

            {/* 4. Back Side & QR Code Destination */}
            <div className={styles.formSection}>
              <h3 className={styles.formSectionTitle}>
                <QrCode size={16} color="var(--primary)" />
                <span>Back Side: Slogan, Subtitle & QR Code Target</span>
              </h3>

              <div className={styles.fieldRow}>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>Back Tagline / Motto (EN)</label>
                  <input
                    type="text"
                    value={editingCard.backTagline || ""}
                    onChange={(e) =>
                      setEditingCard({ ...editingCard, backTagline: e.target.value })
                    }
                    className={styles.input}
                    placeholder="Innovating AI & Embedded Systems"
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>Back Tagline / Motto (TH)</label>
                  <input
                    type="text"
                    value={editingCard.backTaglineTh || ""}
                    onChange={(e) =>
                      setEditingCard({ ...editingCard, backTaglineTh: e.target.value })
                    }
                    className={styles.input}
                    placeholder="สร้างสรรค์นวัตกรรม AI และระบบสมองกลฝังตัว"
                  />
                </div>
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Back Subtitle / Mission Pill</label>
                <input
                  type="text"
                  value={editingCard.backSubtitle || ""}
                  onChange={(e) =>
                    setEditingCard({ ...editingCard, backSubtitle: e.target.value })
                  }
                  className={styles.input}
                  placeholder="Research • Academic • Consulting"
                />
              </div>

              <div className={styles.fieldRow}>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>QR Code Target Destination</label>
                  <select
                    value={editingCard.qrType || "card_url"}
                    onChange={(e) =>
                      setEditingCard({ ...editingCard, qrType: e.target.value })
                    }
                    className={styles.input}
                  >
                    <option value="card_url">
                      Open Live Digital E-Card Page (/card/{editingCard.slug})
                    </option>
                    <option value="vcf">
                      Direct vCard Download (.vcf - Instant Phone Save)
                    </option>
                    <option value="custom">Custom External URL</option>
                  </select>
                </div>

                {editingCard.qrType === "custom" && (
                  <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>Custom QR URL</label>
                    <input
                      type="url"
                      value={editingCard.customQrUrl || ""}
                      onChange={(e) =>
                        setEditingCard({ ...editingCard, customQrUrl: e.target.value })
                      }
                      className={styles.input}
                      placeholder="https://..."
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: CARDS LIST / GALLERY
  // =========================================================================
  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <div>
          <h2 className={styles.headerTitle}>Digital Namecards (นามบัตรดิจิทัล)</h2>
          <p className={styles.headerDesc}>
            Manage multiple business cards, generate dynamic QR codes, customize 2-sided
            templates, share via VCF, and export high-resolution card images.
          </p>
        </div>

        <button type="button" onClick={handleStartCreate} className={styles.btnPrimary}>
          <Plus size={16} />
          <span>Create New Namecard</span>
        </button>
      </div>

      <div className={styles.cardsGrid}>
        {cards.map((card) => {
          const tmplDef = CARD_TEMPLATES.find((t) => t.id === card.template);

          return (
            <div
              key={card.id || card.slug}
              className={`${styles.cardItem} ${
                card.isDefault ? styles.cardItemDefault : ""
              }`}
            >
              <div>
                <div className={styles.cardTop}>
                  <div className={styles.badgeRow}>
                    {card.isDefault && (
                      <span className={styles.badgeDefault}>
                        <Star size={11} fill="#ea580c" />
                        Default Card
                      </span>
                    )}
                    <span className={styles.badgeTmpl}>{tmplDef?.name || card.template}</span>
                  </div>

                  <a
                    href={`/card/${card.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className={styles.iconBtn}
                    title="Open live card in new tab"
                  >
                    <ExternalLink size={14} />
                  </a>
                </div>

                <h3 className={styles.cardItemTitle}>{card.title}</h3>
                <span className={styles.cardItemSlug}>/card/{card.slug}</span>

                <div className={styles.cardItemPersona}>
                  <p className={styles.cardItemName}>{card.fullName}</p>
                  <p className={styles.cardItemPosition}>
                    {card.position}
                    {card.organization ? ` • ${card.organization}` : ""}
                  </p>
                </div>
              </div>

              <div className={styles.cardActions}>
                <button
                  type="button"
                  onClick={() => handleStartEdit(card)}
                  className={styles.btnSecondary}
                  style={{ padding: "6px 12px", fontSize: 12.5 }}
                >
                  <Edit2 size={13} />
                  <span>Edit & Export</span>
                </button>

                <div className={styles.actionBtnGroup}>
                  {!card.isDefault && (
                    <button
                      type="button"
                      onClick={() => handleSetDefault(card)}
                      className={styles.iconBtn}
                      title="Set as Default Card"
                    >
                      <Star size={14} />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleDuplicate(card)}
                    className={styles.iconBtn}
                    title="Duplicate this Card"
                  >
                    <Copy size={14} />
                  </button>

                  {cards.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleDelete(card)}
                      className={`${styles.iconBtn} ${styles.iconBtnDanger}`}
                      title="Delete Card"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
