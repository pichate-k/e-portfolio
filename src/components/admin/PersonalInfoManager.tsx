"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  CreditCard,
  Plus,
  Trash2,
  Copy,
  Star,
  Download,
  ExternalLink,
  Save,
  Check,
  Palette,
  QrCode,
  User,
  Share2,
  Sparkles,
  Globe,
  Upload,
  Image as ImageIcon,
  Loader2,
  FileText,
  Phone,
  Mail,
  RotateCw,
} from "lucide-react";
import { NamecardData, CARD_TEMPLATES } from "../card/cardTemplates";
import { NamecardVisual, NamecardVisualRef } from "../card/NamecardVisual";
import { downloadCardImage, downloadBothSides } from "@/lib/cardExport";
import styles from "./PersonalInfoManager.module.css";

interface PersonalInfoManagerProps {
  onNotify?: (msg: { type: "success" | "error"; text: string }) => void;
}

// Client-side image compression utility
async function compressImage(
  file: File,
  maxWidth = 800,
  maxHeight = 800,
  quality = 0.88
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        let { width, height } = img;
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(event.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = (e) => reject(e);
    };
    reader.onerror = (e) => reject(e);
  });
}

export const PersonalInfoManager: React.FC<PersonalInfoManagerProps> = ({ onNotify }) => {
  const [profiles, setProfiles] = useState<NamecardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedId, setSelectedId] = useState<string>("");
  const [activeProfile, setActiveProfile] = useState<NamecardData | null>(null);

  const [activeSide, setActiveSide] = useState<"front" | "back">("front");
  const [previewLang, setPreviewLang] = useState<"en" | "th">("en");
  const [exporting, setExporting] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const visualRef = useRef<NamecardVisualRef>(null);

  // Fetch all profiles / namecards
  const fetchProfiles = async (selectId?: string) => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/namecards");
      const data = await res.json();
      if (data.success && data.cards) {
        setProfiles(data.cards);
        if (data.cards.length > 0) {
          const target = selectId
            ? data.cards.find((c: NamecardData) => c.id === selectId || c.slug === selectId)
            : data.cards.find((c: NamecardData) => c.isDefault) || data.cards[0];
          const active = target || data.cards[0];
          setSelectedId(active.id || active.slug);
          setActiveProfile({ ...active });
        }
      } else {
        onNotify?.({ type: "error", text: data.error || "Failed to load profiles" });
      }
    } catch (err: any) {
      onNotify?.({ type: "error", text: err.message || "Network error loading profiles" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  // Switch active profile
  const handleSelectProfile = (profile: NamecardData) => {
    setSelectedId(profile.id || profile.slug);
    setActiveProfile({ ...profile });
    setActiveSide("front");
  };

  // Add new profile dataset / persona
  const handleAddProfile = () => {
    const defaultTemplate = CARD_TEMPLATES[0];
    const newIndex = profiles.length + 1;
    const base = activeProfile || profiles[0];

    const newPersona: NamecardData = {
      slug: `profile-${newIndex}`,
      title: `Profile ${newIndex} (${defaultTemplate.name.split(" ")[0]})`,
      template: defaultTemplate.id,
      isDefault: profiles.length === 0,
      fullName: base?.fullName || "Dr. Pichate K.",
      fullNameTh: base?.fullNameTh || "ดร. พิเชษฐ์ เค.",
      position: "Senior Researcher & Consultant",
      positionTh: "นักวิจัยอาวุโส และที่ปรึกษา",
      organization: base?.organization || "Rajamangala University of Technology Thanyaburi",
      organizationTh: base?.organizationTh || "มหาวิทยาลัยเทคโนโลยีราชมงคลธัญบุรี",
      department: base?.department || "Faculty of Engineering",
      departmentTh: base?.departmentTh || "คณะวิศวกรรมศาสตร์",
      email: base?.email || "",
      phone: base?.phone || "",
      websiteUrl: base?.websiteUrl || "",
      address: base?.address || "Pathum Thani, Thailand",
      addressTh: base?.addressTh || "จ.ปทุมธานี ประเทศไทย",
      avatarUrl: base?.avatarUrl || "",
      logoUrl: base?.logoUrl || "",
      linkedinUrl: base?.linkedinUrl || "",
      githubUrl: base?.githubUrl || "",
      googleScholarUrl: base?.googleScholarUrl || "",
      lineId: base?.lineId || "",
      bio: base?.bio || "",
      bioTh: base?.bioTh || "",
      backTagline: "Advancing Applied Engineering & Technology",
      backTaglineTh: "พัฒนาเทคโนโลยีและงานวิศวกรรมประยุกต์ชั้นสูง",
      backSubtitle: "Research • Academic • Consulting",
      qrType: "card_url",
      primaryColor: defaultTemplate.defaultPrimary,
      accentColor: defaultTemplate.defaultAccent,
      backgroundColor: defaultTemplate.defaultBg,
    };

    setActiveProfile(newPersona);
    setSelectedId("new");
    setActiveSide("front");
  };

  // Duplicate active profile
  const handleDuplicateProfile = async () => {
    if (!activeProfile) return;
    try {
      const cloned: Partial<NamecardData> = {
        ...activeProfile,
        id: undefined,
        slug: `${activeProfile.slug}-copy`,
        title: `${activeProfile.title} (Copy)`,
        isDefault: false,
      };

      const res = await fetch("/api/admin/namecards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cloned),
      });
      const data = await res.json();
      if (data.success && data.card) {
        onNotify?.({
          type: "success",
          text: `Cloned "${activeProfile.title}" successfully!`,
        });
        await fetchProfiles(data.card.id);
      } else {
        onNotify?.({ type: "error", text: data.error || "Failed to duplicate profile" });
      }
    } catch (err: any) {
      onNotify?.({ type: "error", text: err.message });
    }
  };

  // Set active profile as default
  const handleSetDefault = async () => {
    if (!activeProfile || !activeProfile.id) return;
    try {
      const res = await fetch(`/api/admin/namecards/${activeProfile.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isDefault: true }),
      });
      const data = await res.json();
      if (data.success) {
        onNotify?.({
          type: "success",
          text: `"${activeProfile.title}" is now the default profile & e-card!`,
        });
        await fetchProfiles(activeProfile.id);
      }
    } catch (err: any) {
      onNotify?.({ type: "error", text: err.message });
    }
  };

  // Delete active profile
  const handleDeleteProfile = async () => {
    if (!activeProfile || !activeProfile.id) return;
    if (profiles.length <= 1) {
      alert("Cannot delete the only profile. You must have at least 1 profile dataset.");
      return;
    }
    if (!confirm(`Are you sure you want to delete profile "${activeProfile.title}"?`)) return;

    try {
      const res = await fetch(`/api/admin/namecards/${activeProfile.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        onNotify?.({ type: "success", text: "Profile dataset deleted successfully" });
        await fetchProfiles();
      } else {
        onNotify?.({ type: "error", text: data.error || "Failed to delete profile" });
      }
    } catch (err: any) {
      onNotify?.({ type: "error", text: err.message });
    }
  };

  // Save profile & namecard changes
  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!activeProfile) return;

    if (!activeProfile.fullName.trim()) {
      onNotify?.({ type: "error", text: "Full Name (EN) is required" });
      return;
    }

    setSaving(true);
    try {
      const isNew = selectedId === "new" || !activeProfile.id;
      const url = isNew ? "/api/admin/namecards" : `/api/admin/namecards/${activeProfile.id}`;
      const method = isNew ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(activeProfile),
      });

      const data = await res.json();
      if (data.success && data.card) {
        onNotify?.({
          type: "success",
          text: isNew
            ? "New profile & digital namecard created successfully!"
            : "Saved all profile & digital namecard changes!",
        });
        await fetchProfiles(data.card.id);
      } else {
        onNotify?.({ type: "error", text: data.error || "Failed to save profile" });
      }
    } catch (err: any) {
      onNotify?.({ type: "error", text: err.message || "Error saving profile" });
    } finally {
      setSaving(false);
    }
  };

  // Avatar file upload handler with client-side compression
  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeProfile) return;
    setUploadingAvatar(true);
    try {
      const compressedDataUrl = await compressImage(file, 800, 800, 0.88);
      setActiveProfile({ ...activeProfile, avatarUrl: compressedDataUrl });
      onNotify?.({
        type: "success",
        text: "Avatar image compressed & loaded! Click 'Save All Changes' to persist.",
      });
    } catch (err: any) {
      onNotify?.({ type: "error", text: err.message || "Failed to process photo" });
    } finally {
      setUploadingAvatar(false);
      e.target.value = "";
    }
  };

  // High-res Image Downloads
  const handleDownloadFront = async () => {
    if (!visualRef.current?.frontElement || !activeProfile) return;
    try {
      setExporting(true);
      await downloadCardImage({
        element: visualRef.current.frontElement,
        filename: `${activeProfile.slug}-front`,
      });
      onNotify?.({ type: "success", text: "Downloaded Front PNG (300 DPI)!" });
    } catch {
      onNotify?.({ type: "error", text: "Could not export front card image" });
    } finally {
      setExporting(false);
    }
  };

  const handleDownloadBack = async () => {
    if (!visualRef.current?.backElement || !activeProfile) return;
    try {
      setExporting(true);
      await downloadCardImage({
        element: visualRef.current.backElement,
        filename: `${activeProfile.slug}-back`,
      });
      onNotify?.({ type: "success", text: "Downloaded Back PNG (300 DPI)!" });
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
      !activeProfile
    )
      return;
    try {
      setExporting(true);
      await downloadBothSides(
        visualRef.current.frontElement,
        visualRef.current.backElement,
        activeProfile.slug
      );
      onNotify?.({ type: "success", text: "Downloaded Both Card Sides (300 DPI)!" });
    } catch {
      onNotify?.({ type: "error", text: "Could not export card images" });
    } finally {
      setExporting(false);
    }
  };

  // Copy card link
  const handleCopyLink = () => {
    if (!activeProfile) return;
    const url = `${window.location.origin}/card/${activeProfile.slug}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  // Template select change
  const handleSelectTemplate = (templateId: string) => {
    if (!activeProfile) return;
    const tmplDef = CARD_TEMPLATES.find((t) => t.id === templateId);
    if (!tmplDef) return;

    setActiveProfile({
      ...activeProfile,
      template: templateId,
      primaryColor: tmplDef.defaultPrimary,
      accentColor: tmplDef.defaultAccent,
      backgroundColor: tmplDef.defaultBg,
    });
  };

  if (loading) {
    return (
      <div style={{ padding: "50px 20px", textAlign: "center", color: "var(--muted-foreground)" }}>
        <Loader2 size={28} className="animate-spin" style={{ margin: "0 auto 12px auto" }} />
        <p>Loading Personal Information & Digital Profiles...</p>
      </div>
    );
  }

  if (!activeProfile) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <p>No profile datasets found.</p>
        <button onClick={handleAddProfile} className={styles.btnPrimary}>
          <Plus size={16} /> Create First Profile
        </button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header & Description */}
      <div className={styles.headerRow}>
        <div>
          <h2 className={styles.headerTitle}>Personal Information & Digital Profiles</h2>
          <p className={styles.headerDesc}>
            Manage multiple persona profiles, synchronized Digital E-Cards, dual-language data, and direct export.
          </p>
        </div>

        <button
          type="button"
          onClick={() => handleSave()}
          disabled={saving}
          className={styles.btnPrimary}
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          <span>{saving ? "Saving Changes..." : "Save All Changes"}</span>
        </button>
      </div>

      {/* Profile / Persona Switcher Bar */}
      <div className={styles.profileSelectorContainer}>
        <div className={styles.profileSelectorHeader}>
          <span>Profile Datasets ({profiles.length})</span>
          <span>Click a profile to edit its personal info & digital namecard</span>
        </div>

        <div className={styles.profilePillsList}>
          {profiles.map((p) => {
            const isCurrent = (p.id || p.slug) === (activeProfile.id || activeProfile.slug);
            return (
              <button
                key={p.id || p.slug}
                type="button"
                onClick={() => handleSelectProfile(p)}
                className={`${styles.profilePill} ${isCurrent ? styles.profilePillActive : ""}`}
              >
                <CreditCard size={14} />
                <span>{p.title || p.slug}</span>
                {p.isDefault && <span className={styles.defaultTag}>Default</span>}
              </button>
            );
          })}

          <button
            type="button"
            onClick={handleAddProfile}
            className={styles.addProfileBtn}
            title="Create new profile dataset"
          >
            <Plus size={14} />
            <span>New Profile Persona</span>
          </button>
        </div>

        {/* Action toolbar for currently selected persona */}
        <div className={styles.profileActionsBar}>
          <div className={styles.profileMeta}>
            <strong>Active Persona:</strong>
            <span>{activeProfile.title}</span>
            <span className={styles.profileMetaSlug}>/card/{activeProfile.slug}</span>
            {activeProfile.isDefault && (
              <span style={{ color: "var(--primary)", fontSize: 12, fontWeight: 600 }}>
                ★ Primary Default
              </span>
            )}
          </div>

          <div className={styles.profileToolbarBtns}>
            {!activeProfile.isDefault && activeProfile.id && (
              <button
                type="button"
                onClick={handleSetDefault}
                className={styles.btnSecondary}
                title="Make this profile the default homepage & card"
              >
                <Star size={14} />
                <span>Set as Default</span>
              </button>
            )}

            {activeProfile.id && (
              <button
                type="button"
                onClick={handleDuplicateProfile}
                className={styles.btnSecondary}
                title="Duplicate this profile and card"
              >
                <Copy size={14} />
                <span>Duplicate</span>
              </button>
            )}

            {profiles.length > 1 && activeProfile.id && (
              <button
                type="button"
                onClick={handleDeleteProfile}
                className={`${styles.btnSecondary} ${styles.btnDanger}`}
                title="Delete this profile"
              >
                <Trash2 size={14} />
                <span>Delete</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className={styles.mainLayout}>
        {/* Left Column: Form Blocks */}
        <form onSubmit={handleSave} className={styles.formColumn}>
          {/* BLOCK 1: 🇺🇸 English Personal Information */}
          <div className={`${styles.langBlock} ${styles.langBlockEn}`}>
            <div className={styles.blockHeader}>
              <div className={styles.blockTitleGroup}>
                <span style={{ fontSize: "1.25rem" }}>🇺🇸</span>
                <h3 className={styles.blockTitle}>English Information Block</h3>
              </div>
              <span className={`${styles.blockTag} ${styles.tagEn}`}>EN Block</span>
            </div>

            <div className={styles.formGrid}>
              <div className={styles.inputGroup}>
                <label className={styles.label}>Full Name (EN) *</label>
                <input
                  type="text"
                  required
                  value={activeProfile.fullName}
                  onChange={(e) =>
                    setActiveProfile({ ...activeProfile, fullName: e.target.value })
                  }
                  className={styles.input}
                  placeholder="e.g. Dr. Pichate K."
                />
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label}>Current Job Position (EN) *</label>
                <input
                  type="text"
                  required
                  value={activeProfile.position}
                  onChange={(e) =>
                    setActiveProfile({ ...activeProfile, position: e.target.value })
                  }
                  className={styles.input}
                  placeholder="e.g. Assistant Professor & Senior AI Researcher"
                />
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label}>Workplace / Affiliation (EN) *</label>
                <input
                  type="text"
                  required
                  value={activeProfile.organization || ""}
                  onChange={(e) =>
                    setActiveProfile({ ...activeProfile, organization: e.target.value })
                  }
                  className={styles.input}
                  placeholder="e.g. Faculty of Engineering, RMUTT"
                />
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label}>Department / Faculty (EN)</label>
                <input
                  type="text"
                  value={activeProfile.department || ""}
                  onChange={(e) =>
                    setActiveProfile({ ...activeProfile, department: e.target.value })
                  }
                  className={styles.input}
                  placeholder="e.g. Dept. of Computer and Control Engineering"
                />
              </div>

              <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                <label className={styles.label}>Current Address (EN)</label>
                <input
                  type="text"
                  value={activeProfile.address || ""}
                  onChange={(e) =>
                    setActiveProfile({ ...activeProfile, address: e.target.value })
                  }
                  className={styles.input}
                  placeholder="e.g. Pathum Thani 12110, Thailand"
                />
              </div>

              <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                <label className={styles.label}>Professional Bio & Summary (EN)</label>
                <textarea
                  value={activeProfile.bio || ""}
                  onChange={(e) =>
                    setActiveProfile({ ...activeProfile, bio: e.target.value })
                  }
                  className={styles.textarea}
                  placeholder="Executive summary of academic background, core disciplines, and research mission."
                />
              </div>
            </div>
          </div>

          {/* BLOCK 2: 🇹🇭 Thai Personal Information */}
          <div className={`${styles.langBlock} ${styles.langBlockTh}`}>
            <div className={styles.blockHeader}>
              <div className={styles.blockTitleGroup}>
                <span style={{ fontSize: "1.25rem" }}>🇹🇭</span>
                <h3 className={styles.blockTitle}>ข้อมูลภาษาไทย (Thai Information Block)</h3>
              </div>
              <span className={`${styles.blockTag} ${styles.tagTh}`}>TH Block</span>
            </div>

            <div className={styles.formGrid}>
              <div className={styles.inputGroup}>
                <label className={styles.label}>ชื่อ-นามสกุล ภาษาไทย (TH)</label>
                <input
                  type="text"
                  value={activeProfile.fullNameTh || ""}
                  onChange={(e) =>
                    setActiveProfile({ ...activeProfile, fullNameTh: e.target.value })
                  }
                  className={styles.input}
                  placeholder="เช่น ดร. พิเชษฐ์ เค."
                />
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label}>ตำแหน่งงาน / ตำแหน่งทางวิชาการ (TH)</label>
                <input
                  type="text"
                  value={activeProfile.positionTh || ""}
                  onChange={(e) =>
                    setActiveProfile({ ...activeProfile, positionTh: e.target.value })
                  }
                  className={styles.input}
                  placeholder="เช่น ผู้ช่วยศาสตราจารย์ และนักวิจัย AI"
                />
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label}>สถานที่ทำงาน / สังกัดหน่วยงาน (TH)</label>
                <input
                  type="text"
                  value={activeProfile.organizationTh || ""}
                  onChange={(e) =>
                    setActiveProfile({ ...activeProfile, organizationTh: e.target.value })
                  }
                  className={styles.input}
                  placeholder="เช่น มหาวิทยาลัยเทคโนโลยีราชมงคลธัญบุรี"
                />
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label}>ภาควิชา / ส่วนงาน (TH)</label>
                <input
                  type="text"
                  value={activeProfile.departmentTh || ""}
                  onChange={(e) =>
                    setActiveProfile({ ...activeProfile, departmentTh: e.target.value })
                  }
                  className={styles.input}
                  placeholder="เช่น คณะวิศวกรรมศาสตร์"
                />
              </div>

              <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                <label className={styles.label}>ที่อยู่ปัจจุบัน (TH)</label>
                <input
                  type="text"
                  value={activeProfile.addressTh || ""}
                  onChange={(e) =>
                    setActiveProfile({ ...activeProfile, addressTh: e.target.value })
                  }
                  className={styles.input}
                  placeholder="เช่น จ.ปทุมธานี 12110 ประเทศไทย"
                />
              </div>

              <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                <label className={styles.label}>ประวัติย่อและวิสัยทัศน์ทางวิชาชีพ (TH)</label>
                <textarea
                  value={activeProfile.bioTh || ""}
                  onChange={(e) =>
                    setActiveProfile({ ...activeProfile, bioTh: e.target.value })
                  }
                  className={styles.textarea}
                  placeholder="บทสรุปผลงาน ความเชี่ยวชาญ และเป้าหมายทางวิชาการในภาษาไทย"
                />
              </div>
            </div>
          </div>

          {/* BLOCK 3: 🌐 Shared Contact Details & Media */}
          <div className={`${styles.langBlock} ${styles.langBlockShared}`}>
            <div className={styles.blockHeader}>
              <div className={styles.blockTitleGroup}>
                <Globe size={18} color="#c084fc" />
                <h3 className={styles.blockTitle}>Shared Contact Details & Media</h3>
              </div>
              <span className={`${styles.blockTag} ${styles.tagShared}`}>Shared</span>
            </div>

            <div className={styles.formGrid}>
              <div className={styles.inputGroup}>
                <label className={styles.label}>Email Address *</label>
                <input
                  type="email"
                  value={activeProfile.email || ""}
                  onChange={(e) =>
                    setActiveProfile({ ...activeProfile, email: e.target.value })
                  }
                  className={styles.input}
                  placeholder="pichate.k@rmutt.ac.th"
                />
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label}>Phone Number</label>
                <input
                  type="text"
                  value={activeProfile.phone || ""}
                  onChange={(e) =>
                    setActiveProfile({ ...activeProfile, phone: e.target.value })
                  }
                  className={styles.input}
                  placeholder="+66 (0) 2-549-3400"
                />
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label}>Personal Website URL</label>
                <input
                  type="text"
                  value={activeProfile.websiteUrl || ""}
                  onChange={(e) =>
                    setActiveProfile({ ...activeProfile, websiteUrl: e.target.value })
                  }
                  className={styles.input}
                  placeholder="https://pichatek.com"
                />
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label}>LinkedIn Profile URL</label>
                <input
                  type="text"
                  value={activeProfile.linkedinUrl || ""}
                  onChange={(e) =>
                    setActiveProfile({ ...activeProfile, linkedinUrl: e.target.value })
                  }
                  className={styles.input}
                  placeholder="https://linkedin.com/in/pichatek"
                />
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label}>GitHub Profile URL</label>
                <input
                  type="text"
                  value={activeProfile.githubUrl || ""}
                  onChange={(e) =>
                    setActiveProfile({ ...activeProfile, githubUrl: e.target.value })
                  }
                  className={styles.input}
                  placeholder="https://github.com/pichatek"
                />
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label}>Google Scholar URL</label>
                <input
                  type="text"
                  value={activeProfile.googleScholarUrl || ""}
                  onChange={(e) =>
                    setActiveProfile({ ...activeProfile, googleScholarUrl: e.target.value })
                  }
                  className={styles.input}
                  placeholder="https://scholar.google.com/citations?user=..."
                />
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label}>LINE ID / LINE Contact URL</label>
                <input
                  type="text"
                  value={activeProfile.lineId || ""}
                  onChange={(e) =>
                    setActiveProfile({ ...activeProfile, lineId: e.target.value })
                  }
                  className={styles.input}
                  placeholder="e.g. pichate_k หรือ https://line.me/ti/p/~..."
                />
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label}>Workplace / Brand Logo URL</label>
                <input
                  type="text"
                  value={activeProfile.logoUrl || ""}
                  onChange={(e) =>
                    setActiveProfile({ ...activeProfile, logoUrl: e.target.value })
                  }
                  className={styles.input}
                  placeholder="https://... (Optional logo for card & CV)"
                />
              </div>

              {/* Profile Photo / Avatar Upload */}
              <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                <label className={styles.label}>Profile Image / Photo</label>
                <div className={styles.uploadWidget}>
                  {activeProfile.avatarUrl ? (
                    <img
                      src={activeProfile.avatarUrl}
                      alt="Profile Avatar"
                      className={styles.avatarPreview}
                    />
                  ) : (
                    <div className={styles.avatarPreview}>
                      <ImageIcon size={28} />
                    </div>
                  )}

                  <div className={styles.uploadActions}>
                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      <label className={styles.btnSecondary} style={{ cursor: "pointer" }}>
                        {uploadingAvatar ? (
                          <Loader2 size={15} className="animate-spin" />
                        ) : (
                          <Upload size={15} />
                        )}
                        <span>{uploadingAvatar ? "Processing..." : "Upload Photo"}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarFileChange}
                          style={{ display: "none" }}
                          disabled={uploadingAvatar}
                        />
                      </label>

                      {activeProfile.avatarUrl && (
                        <button
                          type="button"
                          onClick={() =>
                            setActiveProfile({ ...activeProfile, avatarUrl: "" })
                          }
                          className={`${styles.btnSecondary} ${styles.btnDanger}`}
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    <input
                      type="text"
                      value={activeProfile.avatarUrl || ""}
                      onChange={(e) =>
                        setActiveProfile({ ...activeProfile, avatarUrl: e.target.value })
                      }
                      className={styles.input}
                      placeholder="Or paste external photo URL: https://..."
                      style={{ fontSize: "12px", padding: "6px 10px" }}
                    />
                    <span style={{ fontSize: "11px", color: "var(--muted-foreground)" }}>
                      This photo is displayed on your portfolio homepage, digital e-card, and PDF/DOCX exports.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* BLOCK 4: 📇 Digital Namecard Configuration */}
          <div className={`${styles.langBlock} ${styles.langBlockCard}`}>
            <div className={styles.blockHeader}>
              <div className={styles.blockTitleGroup}>
                <CreditCard size={18} color="#fb923c" />
                <h3 className={styles.blockTitle}>Digital Namecard Configuration</h3>
              </div>
              <span className={`${styles.blockTag} ${styles.tagCard}`}>E-Card Settings</span>
            </div>

            <div className={styles.formGrid}>
              <div className={styles.inputGroup}>
                <label className={styles.label}>Card Display Title *</label>
                <input
                  type="text"
                  required
                  value={activeProfile.title}
                  onChange={(e) =>
                    setActiveProfile({ ...activeProfile, title: e.target.value })
                  }
                  className={styles.input}
                  placeholder="e.g. Academic & Research Card"
                />
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label}>Card URL Slug (/card/[slug]) *</label>
                <input
                  type="text"
                  required
                  value={activeProfile.slug}
                  onChange={(e) =>
                    setActiveProfile({
                      ...activeProfile,
                      slug: e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, "-"),
                    })
                  }
                  className={styles.input}
                  placeholder="e.g. academic, consultant"
                />
              </div>

              {/* Template Picker */}
              <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                <label className={styles.label}>Card Design Template</label>
                <div className={styles.templateGrid}>
                  {CARD_TEMPLATES.map((tmpl) => (
                    <button
                      key={tmpl.id}
                      type="button"
                      onClick={() => handleSelectTemplate(tmpl.id)}
                      className={`${styles.templateOption} ${
                        activeProfile.template === tmpl.id ? styles.templateOptionActive : ""
                      }`}
                    >
                      <div
                        className={styles.templateSwatch}
                        style={{ background: tmpl.previewBg }}
                      >
                        <Sparkles size={12} color={tmpl.defaultAccent} />
                      </div>
                      <span className={styles.templateName}>{tmpl.name.split(" ")[0]}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Colors */}
              <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                <label className={styles.label}>Card Theme Colors</label>
                <div className={styles.colorRow}>
                  <div className={styles.colorPickerGroup}>
                    <input
                      type="color"
                      value={activeProfile.primaryColor || "#ea580c"}
                      onChange={(e) =>
                        setActiveProfile({ ...activeProfile, primaryColor: e.target.value })
                      }
                      className={styles.colorPickerInput}
                    />
                    <span className={styles.colorHexLabel}>
                      Primary: {activeProfile.primaryColor || "#ea580c"}
                    </span>
                  </div>

                  <div className={styles.colorPickerGroup}>
                    <input
                      type="color"
                      value={activeProfile.accentColor || "#f97316"}
                      onChange={(e) =>
                        setActiveProfile({ ...activeProfile, accentColor: e.target.value })
                      }
                      className={styles.colorPickerInput}
                    />
                    <span className={styles.colorHexLabel}>
                      Accent: {activeProfile.accentColor || "#f97316"}
                    </span>
                  </div>

                  <div className={styles.colorPickerGroup}>
                    <input
                      type="color"
                      value={activeProfile.backgroundColor || "#0f172a"}
                      onChange={(e) =>
                        setActiveProfile({
                          ...activeProfile,
                          backgroundColor: e.target.value,
                        })
                      }
                      className={styles.colorPickerInput}
                    />
                    <span className={styles.colorHexLabel}>
                      Background: {activeProfile.backgroundColor || "#0f172a"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Back Details */}
              <div className={styles.inputGroup}>
                <label className={styles.label}>Back Tagline (EN)</label>
                <input
                  type="text"
                  value={activeProfile.backTagline || ""}
                  onChange={(e) =>
                    setActiveProfile({ ...activeProfile, backTagline: e.target.value })
                  }
                  className={styles.input}
                  placeholder="e.g. Innovating AI, Robotics & Education"
                />
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label}>Back Tagline (TH)</label>
                <input
                  type="text"
                  value={activeProfile.backTaglineTh || ""}
                  onChange={(e) =>
                    setActiveProfile({ ...activeProfile, backTaglineTh: e.target.value })
                  }
                  className={styles.input}
                  placeholder="เช่น สร้างสรรค์นวัตกรรม AI และระบบสมองกลฝังตัว"
                />
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label}>Back Subtitle (Bullets)</label>
                <input
                  type="text"
                  value={activeProfile.backSubtitle || ""}
                  onChange={(e) =>
                    setActiveProfile({ ...activeProfile, backSubtitle: e.target.value })
                  }
                  className={styles.input}
                  placeholder="e.g. Research • Academic • Consulting"
                />
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label}>QR Code Target Destination</label>
                <select
                  value={activeProfile.qrType || "card_url"}
                  onChange={(e) =>
                    setActiveProfile({ ...activeProfile, qrType: e.target.value })
                  }
                  className={styles.select}
                >
                  <option value="card_url">Link to Digital E-Card (/card/{activeProfile.slug})</option>
                  <option value="vcf">Direct Phone Contact (.vcf download)</option>
                  <option value="custom">Custom External URL</option>
                </select>
              </div>

              {activeProfile.qrType === "custom" && (
                <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                  <label className={styles.label}>Custom QR Destination URL</label>
                  <input
                    type="text"
                    value={activeProfile.customQrUrl || ""}
                    onChange={(e) =>
                      setActiveProfile({ ...activeProfile, customQrUrl: e.target.value })
                    }
                    className={styles.input}
                    placeholder="https://..."
                  />
                </div>
              )}
            </div>
          </div>

          {/* Sticky Save Bar */}
          <div className={styles.saveStickyBar}>
            <span style={{ fontSize: 13, color: "var(--muted-foreground)" }}>
              Ensure all Thai and English details are correct before saving.
            </span>
            <button
              type="button"
              onClick={() => handleSave()}
              disabled={saving}
              className={styles.btnPrimary}
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              <span>{saving ? "Saving Changes..." : "Save Persona & Card"}</span>
            </button>
          </div>
        </form>

        {/* Right Column: Live 3D Preview & Downloads */}
        <aside className={styles.previewColumn}>
          <div className={styles.previewCard}>
            <div className={styles.previewHeader}>
              <span className={styles.previewTitle}>
                <Sparkles size={15} color="var(--primary)" />
                <span>Live 3D Card Preview</span>
              </span>

              <div className={styles.langSwitchBtns}>
                <button
                  type="button"
                  onClick={() => setPreviewLang("en")}
                  className={`${styles.langBtn} ${previewLang === "en" ? styles.langBtnActive : ""}`}
                >
                  EN
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewLang("th")}
                  className={`${styles.langBtn} ${previewLang === "th" ? styles.langBtnActive : ""}`}
                >
                  TH
                </button>
              </div>
            </div>

            {/* Interactive 3D Card */}
            <div>
              <NamecardVisual
                ref={visualRef}
                card={activeProfile}
                lang={previewLang}
                activeSide={activeSide}
                onFlipChange={setActiveSide}
                showFlipButton={true}
              />
            </div>

            {/* Download Center */}
            <div className={styles.downloadSection}>
              <div className={styles.downloadTitle}>
                <Download size={14} />
                <span>Download Digital E-Card</span>
              </div>

              <div className={styles.downloadGrid}>
                <button
                  type="button"
                  onClick={handleDownloadFront}
                  disabled={exporting}
                  className={styles.downloadBtn}
                  title="Download front side as 300 DPI PNG"
                >
                  <Download size={13} />
                  <span>Front PNG</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadBack}
                  disabled={exporting}
                  className={styles.downloadBtn}
                  title="Download back side as 300 DPI PNG"
                >
                  <Download size={13} />
                  <span>Back PNG</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadBoth}
                  disabled={exporting}
                  className={`${styles.downloadBtn} ${styles.downloadBothBtn}`}
                  title="Download both front and back images (ZIP / separate PNGs)"
                >
                  <Sparkles size={13} />
                  <span>Both Sides (300 DPI)</span>
                </button>

                <a
                  href={`/api/card/vcf?id=${activeProfile.slug || activeProfile.id || ""}&lang=${previewLang}`}
                  className={styles.downloadBtn}
                  style={{ gridColumn: "1 / -1" }}
                  download
                >
                  <User size={13} />
                  <span>Download vCard Contact (.vcf)</span>
                </a>
              </div>

              {/* External Links */}
              <div className={styles.externalLinksRow}>
                <a
                  href={`/card/${activeProfile.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.extLinkBtn}
                  title="Open live public card page"
                >
                  <ExternalLink size={12} />
                  <span>View Card</span>
                </a>

                <a
                  href={`/?profile=${encodeURIComponent(activeProfile.slug)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.extLinkBtn}
                  title="Open full CV matching this persona"
                >
                  <FileText size={12} />
                  <span>View Full CV</span>
                </a>

                <button
                  type="button"
                  onClick={handleCopyLink}
                  className={styles.extLinkBtn}
                  title="Copy share link"
                >
                  {copiedLink ? <Check size={12} color="#10b981" /> : <Share2 size={12} />}
                  <span>{copiedLink ? "Copied!" : "Share Link"}</span>
                </button>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};
