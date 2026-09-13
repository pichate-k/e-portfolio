"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  User,
  Layers,
  FileText,
  Lock,
  LogOut,
  ExternalLink,
  ArrowUp,
  ArrowDown,
  Plus,
  Trash2,
  Edit2,
  Check,
  AlertCircle,
  Eye,
  EyeOff,
  Download,
  Loader2,
  Save,
  Globe,
  Upload,
  Image as ImageIcon,
  Link as LinkIcon,
  Cloud,
  Key,
  CheckCircle2,
  XCircle,
  HelpCircle,
  FolderOpen,
  Calendar,
  CreditCard,
  Database,
} from "lucide-react";
import { SectionFieldsBuilder } from "@/components/admin/SectionFieldsBuilder";
import { ExportSettingsPanel } from "@/components/admin/ExportSettingsPanel";
import { PersonalInfoManager } from "@/components/admin/PersonalInfoManager";
import { GalleryManager } from "@/components/admin/GalleryManager";
import { BackupMigrationPanel } from "@/components/admin/BackupMigrationPanel";
import {
  YearPickerInput,
  YearRangePickerInput,
  DateRangePickerInput,
} from "@/components/admin/CalendarInputs";
import {
  CustomFieldDef,
  StandardFieldType,
  SectionExportConfig,
  STANDARD_FIELD_TYPES,
  AVAILABLE_ICONS,
  AVAILABLE_SECTION_ICONS,
  FIELD_PRESETS,
  CvItemState,
  CvSectionState,
} from "@/types/customFields";
import styles from "./admin.module.css";

function SectionIconSelector({
  value,
  onChange,
}: {
  value: string;
  onChange: (icon: string) => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
      <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "0.4rem" }}>
        <span>Section Icon (ไอคอนประจำหมวดหมู่)</span>
        <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", fontWeight: 400 }}>
          (คลิกเลือกไอคอนที่ต้องการแสดงหน้าหมวดหมู่นี้)
        </span>
      </label>
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
        <div
          style={{
            width: "44px",
            height: "44px",
            borderRadius: "var(--radius-md)",
            background: "var(--primary-subtle)",
            border: "2px solid var(--primary)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.5rem",
            flexShrink: 0,
          }}
        >
          {value || "📚"}
        </div>
        <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap", flex: 1 }}>
          {AVAILABLE_SECTION_ICONS.map((ic) => (
            <button
              key={ic}
              type="button"
              onClick={() => onChange(ic)}
              style={{
                width: "36px",
                height: "36px",
                fontSize: "1.2rem",
                background: value === ic ? "var(--primary-subtle)" : "var(--bg-elevated)",
                border: value === ic ? "2px solid var(--primary)" : "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-sm)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.15s ease",
              }}
              title={ic}
            >
              {ic}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

interface ProfileState {
  id?: string;
  fullName: string;
  fullNameTh: string;
  currentPosition: string;
  currentPositionTh: string;
  workplace: string;
  workplaceTh: string;
  address: string;
  addressTh: string;
  email: string;
  phone: string;
  websiteUrl: string;
  linkedinUrl: string;
  githubUrl: string;
  googleScholarUrl: string;
  avatarUrl: string;
  bio: string;
  bioTh: string;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<
    "profile" | "sections" | "entries" | "export" | "gallery" | "namecards" | "security" | "backup"
  >("profile");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Profile data (Dual Language TH-EN)
  const [profile, setProfile] = useState<ProfileState>({
    fullName: "",
    fullNameTh: "",
    currentPosition: "",
    currentPositionTh: "",
    workplace: "",
    workplaceTh: "",
    address: "",
    addressTh: "",
    email: "",
    phone: "",
    websiteUrl: "",
    linkedinUrl: "",
    githubUrl: "",
    googleScholarUrl: "",
    avatarUrl: "",
    bio: "",
    bioTh: "",
  });

  // Sections & items state
  const [sections, setSections] = useState<CvSectionState[]>([]);
  const [selectedSectionId, setSelectedSectionId] = useState<string>("");

  // New section form (Dual Language & Custom Fields)
  const [newSectionTitle, setNewSectionTitle] = useState("");
  const [newSectionTitleTh, setNewSectionTitleTh] = useState("");
  const [newSectionDesc, setNewSectionDesc] = useState("");
  const [newSectionDescTh, setNewSectionDescTh] = useState("");
  const [newSectionContentType, setNewSectionContentType] = useState<"text" | "file" | "link" | "mixed">("text");
  const [newSectionIcon, setNewSectionIcon] = useState("📚");
  const [newSectionCustomFields, setNewSectionCustomFields] = useState<CustomFieldDef[]>([]);
  const [showAddSection, setShowAddSection] = useState(false);

  // Section edit modal state (Dual Language & Custom Fields)
  const [editingSection, setEditingSection] = useState<CvSectionState | null>(null);
  const [showSectionModal, setShowSectionModal] = useState(false);

  // Edit/Add item modal state (Dual Language & Dynamic Custom Fields)
  const [editingItem, setEditingItem] = useState<Partial<CvItemState> | null>(
    null
  );
  const [showItemModal, setShowItemModal] = useState(false);
  const [itemLangTab, setItemLangTab] = useState<"th" | "en">("th");

  // Upload states
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingItemImage, setUploadingItemImage] = useState(false);
  const [uploadingCustomFieldId, setUploadingCustomFieldId] = useState<string | null>(null);
  const [dbWarning, setDbWarning] = useState(false);

  // Security settings
  const [settings, setSettings] = useState({
    siteTitle: "",
    bioTagline: "",
    requireCvPassword: true,
    newCvPassword: "",
    confirmCvPassword: "",
    currentAdminPassword: "",
    newAdminPassword: "",
  });

  // Google Drive Cloud Storage Settings
  const [googleDrive, setGoogleDrive] = useState({
    enabled: false,
    folderLink: "",
    folderId: "",
    clientEmail: "",
    privateKey: "",
    hasPrivateKey: false,
  });
  const [testingDrive, setTestingDrive] = useState(false);
  const [driveTestResult, setDriveTestResult] = useState<{
    success?: boolean;
    message?: string;
    folderName?: string;
  } | null>(null);
  const [showJsonPasteModal, setShowJsonPasteModal] = useState(false);
  const [pastedJsonText, setPastedJsonText] = useState("");

  // Export Settings State
  const [exportSettings, setExportSettings] = useState<{
    includeProfile: boolean;
    profileTemplate: "academic" | "modern" | "compact";
    selectedSectionIds: string[];
    sectionConfigs: Record<string, SectionExportConfig>;
  }>({
    includeProfile: true,
    profileTemplate: "academic",
    selectedSectionIds: [],
    sectionConfigs: {},
  });

  const loadData = async () => {
    try {
      const authRes = await fetch("/api/auth/me");
      if (!authRes.ok) {
        router.push("/admin/login");
        return;
      }

      // Fetch profile
      const profRes = await fetch("/api/admin/profile");
      if (profRes.ok) {
        const profData = await profRes.json();
        if (profData._dbConfigured === false) {
          setDbWarning(true);
        }
        setProfile({
          id: profData.id,
          fullName: profData.fullName || "",
          fullNameTh: profData.fullNameTh || "",
          currentPosition: profData.currentPosition || "",
          currentPositionTh: profData.currentPositionTh || "",
          workplace: profData.workplace || "",
          workplaceTh: profData.workplaceTh || "",
          address: profData.address || "",
          addressTh: profData.addressTh || "",
          email: profData.email || "",
          phone: profData.phone || "",
          websiteUrl: profData.websiteUrl || "",
          linkedinUrl: profData.linkedinUrl || "",
          githubUrl: profData.githubUrl || "",
          googleScholarUrl: profData.googleScholarUrl || "",
          avatarUrl: profData.avatarUrl || "",
          bio: profData.bio || "",
          bioTh: profData.bioTh || "",
        });
      }

      // Fetch sections
      const secRes = await fetch("/api/admin/sections");
      if (secRes.ok) {
        const secData = await secRes.json();
        setSections(secData);
        if (secData.length > 0 && !selectedSectionId) {
          setSelectedSectionId(secData[0].id);
        }

        // Initialize section configs from section.exportConfig if present
        const initConfigs: Record<string, SectionExportConfig> = {};
        for (const s of secData) {
          if (s.exportConfig) {
            try {
              initConfigs[s.id] = JSON.parse(s.exportConfig);
            } catch (e) {}
          }
        }
        if (Object.keys(initConfigs).length > 0) {
          setExportSettings((prev) => ({
            ...prev,
            sectionConfigs: { ...prev.sectionConfigs, ...initConfigs },
          }));
        }
      }

      // Fetch settings
      const setRes = await fetch("/api/admin/settings");
      if (setRes.ok) {
        const setData = await setRes.json();
        setSettings((prev) => ({
          ...prev,
          siteTitle: setData.siteTitle || "",
          bioTagline: setData.bioTagline || "",
          requireCvPassword: setData.requireCvPassword ?? true,
        }));
        if (setData.googleDrive) {
          setGoogleDrive({
            enabled: Boolean(setData.googleDrive.enabled),
            folderLink: setData.googleDrive.folderLink || setData.googleDrive.folderId || "",
            folderId: setData.googleDrive.folderId || "",
            clientEmail: setData.googleDrive.clientEmail || "",
            privateKey: setData.googleDrive.hasPrivateKey ? "••••••••••••••••" : "",
            hasPrivateKey: Boolean(setData.googleDrive.hasPrivateKey),
          });
        }
      }

      // Fetch global export settings
      try {
        const expRes = await fetch("/api/admin/export-settings");
        if (expRes.ok) {
          const expData = await expRes.json();
          setExportSettings((prev) => ({
            ...prev,
            includeProfile: expData.includeProfile ?? true,
            profileTemplate: expData.profileTemplate || "academic",
            selectedSectionIds: Array.isArray(expData.selectedSectionIds)
              ? expData.selectedSectionIds
              : [],
            sectionConfigs: {
              ...prev.sectionConfigs,
              ...(expData.sectionConfigs || {}),
            },
          }));
        }
      } catch (expErr) {
        console.warn("Could not fetch export settings:", expErr);
      }

      setLoading(false);
    } catch {
      router.push("/admin/login");
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const showStatus = (type: "success" | "error", text: string) => {
    setStatusMsg({ type, text });
    setTimeout(() => setStatusMsg(null), 4000);
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
  };

  // --- Upload Helpers ---
  const compressImage = (
    file: File,
    maxWidth = 800,
    maxHeight = 800,
    quality = 0.85
  ): Promise<string> => {
    return new Promise((resolve) => {
      if (file.type === "image/svg+xml") {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let { width, height } = img;
          if (width > maxWidth || height > maxHeight) {
            if (width > height) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            } else {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            resolve(e.target?.result as string);
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/jpeg", quality));
        };
        img.onerror = () => resolve(e.target?.result as string);
        img.src = e.target?.result as string;
      };
      reader.onerror = () => resolve("");
      reader.readAsDataURL(file);
    });
  };

  const handleFileUpload = async (file: File): Promise<string | null> => {
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Upload failed");
      }
      const data = await res.json();
      return data.url;
    } catch (err: any) {
      console.warn("Upload endpoint failed, using local Data URL:", err?.message);
      return null;
    }
  };

  const handleAvatarFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    try {
      // 1. Process client-side compression (guarantees fast loading and zero-fail on Vercel)
      const compressedDataUrl = await compressImage(file, 800, 800, 0.88);
      if (compressedDataUrl) {
        setProfile((prev) => ({ ...prev, avatarUrl: compressedDataUrl }));
        showStatus("success", "Avatar ready! Click 'Save All Changes' below to persist.");
      } else {
        const serverUrl = await handleFileUpload(file);
        if (serverUrl) {
          setProfile((prev) => ({ ...prev, avatarUrl: serverUrl }));
          showStatus("success", "Avatar ready! Click 'Save All Changes' below to persist.");
        }
      }
    } catch (err: any) {
      showStatus("error", err?.message || "Failed to process avatar image.");
    } finally {
      setUploadingAvatar(false);
      // Reset input value so re-selecting same file triggers change
      e.target.value = "";
    }
  };

  const handleItemImageChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingItemImage(true);
    try {
      // High-res crisp compression for certificates and proof docs
      const compressedDataUrl = await compressImage(file, 1600, 1600, 0.85);
      if (compressedDataUrl) {
        setEditingItem((prev) => (prev ? { ...prev, imageUrl: compressedDataUrl } : prev));
        showStatus("success", "Certificate/Item image attached!");
      } else {
        const serverUrl = await handleFileUpload(file);
        if (serverUrl) {
          setEditingItem((prev) => (prev ? { ...prev, imageUrl: serverUrl } : prev));
          showStatus("success", "Certificate/Item image attached!");
        }
      }
    } catch (err: any) {
      showStatus("error", err?.message || "Failed to process image.");
    } finally {
      setUploadingItemImage(false);
      e.target.value = "";
    }
  };

  const insertLinkIntoDesc = (field: "description" | "descriptionTh") => {
    const url = prompt("Enter URL (e.g. https://example.com):", "https://");
    if (!url) return;
    const label = prompt("Enter Link Text:", "Learn More") || url;
    const markdownLink = ` [${label}](${url}) `;

    setEditingItem((prev) => {
      if (!prev) return prev;
      const currentVal = (prev[field] as string) || "";
      return {
        ...prev,
        [field]: currentVal ? `${currentVal}${markdownLink}` : `[${label}](${url})`,
      };
    });
  };

  const insertLinkIntoCustomField = (fieldKey: string) => {
    const url = prompt("Enter URL (e.g. https://example.com):", "https://");
    if (!url) return;
    const label = prompt("Enter Link Text:", "Learn More") || url;
    const markdownLink = ` [${label}](${url}) `;
    const currentVal = getCustomFieldValue(fieldKey);
    setCustomFieldValue(fieldKey, currentVal ? `${currentVal}${markdownLink}` : `[${label}](${url})`);
  };

  // --- Profile Handler ---
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/admin/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });

      const resData = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(resData?.error || "Failed to save profile");
      }
      showStatus("success", "Personal information (TH & EN) saved successfully!");
    } catch (err: unknown) {
      showStatus(
        "error",
        err instanceof Error ? err.message : "Error saving personal information."
      );
    } finally {
      setSaving(false);
    }
  };

  // --- Section Handlers ---
  const handleCreateSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSectionTitle.trim()) return;

    setSaving(true);
    try {
      const res = await fetch("/api/admin/sections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newSectionTitle,
          titleTh: newSectionTitleTh,
          description: newSectionDesc,
          descriptionTh: newSectionDescTh,
          icon: newSectionIcon || "📚",
          contentType: newSectionContentType,
          customFields: JSON.stringify(newSectionCustomFields),
        }),
      });

      if (!res.ok) throw new Error("Failed to create section");
      const created = await res.json();
      setSections([...sections, created]);
      setSelectedSectionId(created.id);
      setNewSectionTitle("");
      setNewSectionTitleTh("");
      setNewSectionDesc("");
      setNewSectionDescTh("");
      setNewSectionIcon("📚");
      setNewSectionContentType("text");
      setNewSectionCustomFields([]);
      setShowAddSection(false);
      showStatus("success", `Created custom section: "${created.title}"`);
    } catch {
      showStatus("error", "Failed to create section.");
    } finally {
      setSaving(false);
    }
  };

  const handleOpenEditSection = (section: CvSectionState) => {
    let fields: CustomFieldDef[] = [];
    try {
      fields = section.customFields ? JSON.parse(section.customFields) : [];
    } catch {
      fields = [];
    }
    setEditingSection({
      ...section,
      icon: section.icon || "📚",
      contentType: section.contentType || "text",
      customFields: JSON.stringify(fields),
    });
    setShowSectionModal(true);
  };

  const handleSaveSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSection || !editingSection.title.trim()) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/admin/sections/${editingSection.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editingSection.title.trim(),
          titleTh: editingSection.titleTh?.trim() || null,
          description: editingSection.description?.trim() || null,
          descriptionTh: editingSection.descriptionTh?.trim() || null,
          icon: editingSection.icon || "📚",
          contentType: editingSection.contentType || "text",
          customFields: editingSection.customFields || "[]",
        }),
      });

      const resData = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(resData?.error || "Failed to update section");
      }

      setSections(
        sections.map((s) =>
          s.id === editingSection.id
            ? {
                ...s,
                title: resData.title,
                titleTh: resData.titleTh,
                description: resData.description,
                descriptionTh: resData.descriptionTh,
                icon: resData.icon,
                contentType: resData.contentType,
                customFields: resData.customFields,
              }
            : s
        )
      );
      setShowSectionModal(false);
      setEditingSection(null);
      showStatus("success", `Section "${resData.title}" updated successfully!`);
    } catch (err: any) {
      showStatus("error", err?.message || "Failed to update section.");
    } finally {
      setSaving(false);
    }
  };

  // Custom Field Item Value Helpers
  const getCustomFieldValue = (fieldId: string) => {
    try {
      const data = JSON.parse(editingItem?.customData || "{}");
      return data[fieldId] || "";
    } catch {
      return "";
    }
  };

  const setCustomFieldValue = (fieldId: string, val: string) => {
    setEditingItem((prev) => {
      if (!prev) return null;
      let data: Record<string, string> = {};
      try {
        data = JSON.parse(prev.customData || "{}");
      } catch {
        data = {};
      }
      data[fieldId] = val;
      return { ...prev, customData: JSON.stringify(data) };
    });
  };

  const handleCustomFileUpload = async (fieldId: string, file: File) => {
    setUploadingCustomFieldId(fieldId);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (res.ok && data.url) {
        setCustomFieldValue(fieldId, data.url);
        showStatus("success", "Uploaded file successfully!");
      } else {
        showStatus("error", data.error || "Upload failed");
      }
    } catch {
      showStatus("error", "Failed to upload file");
    } finally {
      setUploadingCustomFieldId(null);
    }
  };

  const handleToggleSectionVisibility = async (section: CvSectionState) => {
    const updatedVisible = !section.isVisible;
    try {
      const res = await fetch(`/api/admin/sections/${section.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isVisible: updatedVisible }),
      });
      if (res.ok) {
        setSections(
          sections.map((s) =>
            s.id === section.id ? { ...s, isVisible: updatedVisible } : s
          )
        );
        showStatus(
          "success",
          `Section "${section.title}" is now ${
            updatedVisible ? "visible" : "hidden"
          } on public site.`
        );
      }
    } catch {
      showStatus("error", "Failed to update visibility.");
    }
  };

  const handleMoveSection = async (index: number, direction: "up" | "down") => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === sections.length - 1)
    )
      return;

    const targetIndex = direction === "up" ? index - 1 : index + 1;
    const newSections = [...sections];
    const temp = newSections[index];
    newSections[index] = newSections[targetIndex];
    newSections[targetIndex] = temp;

    setSections(newSections);

    try {
      const res = await fetch("/api/admin/sections/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sectionIds: newSections.map((s) => s.id) }),
      });
      if (res.ok) {
        showStatus("success", "Section order updated!");
      }
    } catch {
      showStatus("error", "Failed to persist section order.");
    }
  };

  const handleDeleteSection = async (section: CvSectionState) => {
    if (section.isSystem) {
      alert("หัวข้อเริ่มต้นของระบบ (System Section) ไม่สามารถลบได้ คุณสามารถเลือกซ่อน (Hide) แทนได้ครับ");
      return;
    }

    // Protect section from deletion if items/content exist
    if (section.items && section.items.length > 0) {
      alert(
        `⚠️ ไม่สามารถลบหัวข้อ "${section.title}" ได้!\n\nเนื่องจากยังมีข้อมูลบันทึกอยู่ภายในหัวข้อนี้จำนวน ${section.items.length} รายการ\nกรุณาย้ายหรือลบรายการข้อมูลข้างในออกให้หมดก่อนทำการลบหัวข้อนี้ครับ`
      );
      return;
    }

    if (
      !confirm(
        `คุณแน่ใจหรือไม่ว่าต้องการลบหัวข้อ "${section.title}"?`
      )
    )
      return;

    try {
      const res = await fetch(`/api/admin/sections/${section.id}`, {
        method: "DELETE",
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        const remaining = sections.filter((s) => s.id !== section.id);
        setSections(remaining);
        if (selectedSectionId === section.id && remaining.length > 0) {
          setSelectedSectionId(remaining[0].id);
        }
        showStatus("success", `ลบหัวข้อ "${section.title}" เรียบร้อยแล้ว`);
      } else {
        showStatus("error", data.error || "ไม่สามารถลบหัวข้อได้");
      }
    } catch {
      showStatus("error", "เกิดข้อผิดพลาดในการลบหัวข้อ");
    }
  };

  // --- Item Handlers ---
  const activeSection = sections.find((s) => s.id === selectedSectionId);

  const handleOpenNewItem = () => {
    setEditingItem({
      sectionId: selectedSectionId,
      title: "",
      titleTh: "",
      subtitle: "",
      subtitleTh: "",
      organization: "",
      organizationTh: "",
      location: "",
      locationTh: "",
      startDate: "",
      endDate: "",
      isCurrent: false,
      description: "",
      descriptionTh: "",
      url: "",
      tags: "",
      customData: "{}",
    });
    setShowItemModal(true);
  };

  const handleEditItem = (item: CvItemState) => {
    let initialCustomData: Record<string, string> = {};
    try {
      initialCustomData = JSON.parse(item.customData || "{}");
    } catch {
      initialCustomData = {};
    }

    // Only for old legacy items created before custom fields existed (customData is empty)
    if (Object.keys(initialCustomData).length === 0 && activeSection?.customFields) {
      try {
        const cFields: CustomFieldDef[] = JSON.parse(activeSection.customFields);
        const headerField = cFields.find((f) => f.role === "header");
        if (headerField) {
          if (item.title) initialCustomData[headerField.id] = item.title;
          if (item.titleTh) initialCustomData[`${headerField.id}_th`] = item.titleTh;
        }
        const subHeaderField = cFields.find((f) => f.role === "sub_header");
        if (subHeaderField) {
          if (item.subtitle) initialCustomData[subHeaderField.id] = item.subtitle;
          if (item.subtitleTh) initialCustomData[`${subHeaderField.id}_th`] = item.subtitleTh;
        }
        // Migrate description only to the first details field that is not the header
        const detailsField = cFields.find((f) => f.id !== headerField?.id && (f.type === "details" || f.type === "textarea"));
        if (detailsField) {
          if (item.description) initialCustomData[detailsField.id] = item.description;
          if (item.descriptionTh) initialCustomData[`${detailsField.id}_th`] = item.descriptionTh;
        }
        const dateField = cFields.find((f) => ["year", "year_range", "date_range"].includes(f.type));
        if (dateField && item.startDate) {
          initialCustomData[dateField.id] = item.startDate;
          initialCustomData[`${dateField.id}_th`] = item.startDate;
        }
      } catch {}
    }

    setEditingItem({ ...item, customData: JSON.stringify(initialCustomData) });
    setShowItemModal(true);
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    let payload = { ...editingItem };
    if (activeSection?.customFields) {
      try {
        const cFields: CustomFieldDef[] = JSON.parse(activeSection.customFields);
        const cData = JSON.parse(payload.customData || "{}");
        
        // Strictly keep customData independent per language (no auto-sync/copying)
        payload.customData = JSON.stringify(cData);

        const headerField = cFields.find((f) => f.role === "header");
        if (headerField) {
          payload.title = cData[headerField.id] || "";
          payload.titleTh = cData[`${headerField.id}_th`] || null;
        } else {
          // If no field has role === "header", save first field value to title for DB consistency
          const firstField = cFields[0];
          const fallbackEn = firstField ? cData[firstField.id] : "";
          const fallbackTh = firstField ? cData[`${firstField.id}_th`] : "";
          payload.title = fallbackEn || fallbackTh || "-";
          payload.titleTh = fallbackTh || fallbackEn || null;
        }
        const subHeaderField = cFields.find((f) => f.role === "sub_header");
        if (subHeaderField) {
          payload.subtitle = cData[subHeaderField.id] || null;
          payload.subtitleTh = cData[`${subHeaderField.id}_th`] || null;
        }
        // Only set description from a details field if it is NOT the header field
        const nonHeaderDetails = cFields.find((f) => f.id !== headerField?.id && (f.type === "details" || f.type === "textarea"));
        if (nonHeaderDetails) {
          payload.description = cData[nonHeaderDetails.id] || null;
          payload.descriptionTh = cData[`${nonHeaderDetails.id}_th`] || null;
        } else {
          payload.description = null;
          payload.descriptionTh = null;
        }
        const dateField = cFields.find((f) => ["year", "year_range", "date_range"].includes(f.type));
        if (dateField) {
          const dateVal = cData[dateField.id] || cData[`${dateField.id}_th`];
          if (dateVal) {
            payload.startDate = dateVal;
            cData[dateField.id] = dateVal;
            cData[`${dateField.id}_th`] = dateVal;
          }
        }
        const addrField = cFields.find((f) => f.type === "address");
        if (addrField) {
          payload.location = cData[addrField.id] || null;
          payload.locationTh = cData[`${addrField.id}_th`] || null;
        }
        const linkField = cFields.find((f) => f.type === "link");
        if (linkField && cData[linkField.id]) {
          payload.url = cData[linkField.id];
        }
        const fileField = cFields.find((f) => f.type === "upload" || f.type === "file");
        if (fileField && cData[fileField.id]) {
          const fileVal = cData[fileField.id];
          // Only assign to imageUrl if not an oversized base64 string to keep payload light
          if (!fileVal.startsWith("data:") || fileVal.length < 300000) {
            payload.imageUrl = fileVal;
          }
        }
      } catch (err) {}
    }

    // Ensure title has a non-empty string for Prisma DB schema requirement
    if (!payload.title || !payload.title.trim()) {
      if (payload.titleTh && payload.titleTh.trim()) {
        payload.title = payload.titleTh.trim();
      } else {
        try {
          const cData = JSON.parse(payload.customData || "{}");
          const firstVal = Object.values(cData).find((v) => typeof v === "string" && (v as string).trim().length > 0);
          if (firstVal) {
            payload.title = firstVal as string;
          }
        } catch (err) {}
      }
    }

    if (!payload.title || !payload.title.trim()) {
      showStatus("error", "กรุณากรอกข้อมูลในฟิลด์อย่างน้อยหนึ่งช่อง");
      return;
    }

    setSaving(true);
    try {
      if (payload.id) {
        // Update existing item
        const res = await fetch(`/api/admin/items/${payload.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const resData = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(resData?.error || "Failed to update item");
        const updated = resData;

        setSections(
          sections.map((s) =>
            s.id === selectedSectionId
              ? {
                  ...s,
                  items: s.items.map((it) =>
                    it.id === updated.id ? updated : it
                  ),
                }
              : s
          )
        );
        showStatus("success", "Entry (TH & EN) updated successfully!");
      } else {
        // Create new item
        const res = await fetch("/api/admin/items", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const resData = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(resData?.error || "Failed to create item");
        const created = resData;

        setSections(
          sections.map((s) =>
            s.id === selectedSectionId
              ? { ...s, items: [...s.items, created] }
              : s
          )
        );
        showStatus("success", "New entry added successfully!");
      }

      setShowItemModal(false);
      setEditingItem(null);
    } catch (err: any) {
      showStatus("error", err?.message || "Failed to save entry.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm("Are you sure you want to delete this entry?")) return;

    try {
      const res = await fetch(`/api/admin/items/${itemId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setSections(
          sections.map((s) =>
            s.id === selectedSectionId
              ? { ...s, items: s.items.filter((it) => it.id !== itemId) }
              : s
          )
        );
        showStatus("success", "Entry deleted.");
      }
    } catch {
      showStatus("error", "Failed to delete entry.");
    }
  };

  const handleMoveItem = async (index: number, direction: "up" | "down") => {
    if (!activeSection) return;
    const items = [...activeSection.items];
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === items.length - 1)
    )
      return;

    const targetIndex = direction === "up" ? index - 1 : index + 1;
    const temp = items[index];
    items[index] = items[targetIndex];
    items[targetIndex] = temp;

    setSections(
      sections.map((s) =>
        s.id === selectedSectionId ? { ...s, items } : s
      )
    );

    try {
      await fetch("/api/admin/items/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemIds: items.map((i) => i.id) }),
      });
      showStatus("success", "Entry order updated!");
    } catch {
      showStatus("error", "Failed to persist entry order.");
    }
  };

  // --- Settings Handler ---
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      settings.newCvPassword &&
      settings.newCvPassword !== settings.confirmCvPassword
    ) {
      showStatus("error", "CV download passwords do not match.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          siteTitle: settings.siteTitle,
          bioTagline: settings.bioTagline,
          requireCvPassword: settings.requireCvPassword,
          newCvPassword: settings.newCvPassword || undefined,
          currentAdminPassword: settings.currentAdminPassword || undefined,
          newAdminPassword: settings.newAdminPassword || undefined,
          googleDrive: {
            enabled: Boolean(googleDrive.enabled),
            folderLink: googleDrive.folderLink.trim(),
            folderId: (googleDrive.folderId || googleDrive.folderLink).trim(),
            clientEmail: googleDrive.clientEmail.trim(),
            privateKey: googleDrive.privateKey,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update settings");

      showStatus("success", "Settings updated successfully!");
      setSettings((prev) => ({
        ...prev,
        newCvPassword: "",
        confirmCvPassword: "",
        currentAdminPassword: "",
        newAdminPassword: "",
      }));
    } catch (err: unknown) {
      showStatus(
        "error",
        err instanceof Error ? err.message : "Failed to update settings."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleTestGoogleDrive = async () => {
    setTestingDrive(true);
    setDriveTestResult(null);
    try {
      const res = await fetch("/api/admin/google-drive/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          folderId: googleDrive.folderId || googleDrive.folderLink,
          clientEmail: googleDrive.clientEmail,
          privateKey: googleDrive.privateKey || undefined,
        }),
      });
      const data = await res.json();
      setDriveTestResult({
        success: data.success,
        message: data.message,
        folderName: data.folderName,
      });
      if (data.success) {
        showStatus("success", data.message || "Google Drive connection successful!");
      } else {
        showStatus("error", data.message || "Google Drive test failed.");
      }
    } catch (err: any) {
      setDriveTestResult({
        success: false,
        message: err?.message || "Failed to test connection",
      });
      showStatus("error", "Error connecting to Google Drive");
    } finally {
      setTestingDrive(false);
    }
  };

  const handlePasteJsonConfirm = () => {
    try {
      const parsed = JSON.parse(pastedJsonText);
      if (parsed.client_email || parsed.private_key) {
        setGoogleDrive((prev) => ({
          ...prev,
          clientEmail: parsed.client_email || prev.clientEmail,
          privateKey: parsed.private_key || prev.privateKey,
        }));
        setShowJsonPasteModal(false);
        setPastedJsonText("");
        showStatus("success", "นำเข้าข้อมูล Google Service Account จาก JSON สำเร็จแล้ว!");
      } else {
        showStatus("error", "ไม่พบ client_email หรือ private_key ในไฟล์ JSON");
      }
    } catch {
      showStatus("error", "รูปแบบ JSON ไม่ถูกต้อง กรุณาตรวจสอบข้อความที่วาง");
    }
  };

  const handleSaveExportSettings = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/export-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(exportSettings),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save export settings");
      showStatus("success", "บันทึกการตั้งค่าการ Export เรียบร้อยแล้ว!");
    } catch (err: any) {
      showStatus("error", err?.message || "Failed to save export settings");
    } finally {
      setSaving(false);
    }
  };

  const handleAdminExport = async (format: "pdf" | "docx", lang: "en" | "th" = "en") => {
    try {
      const res = await fetch("/api/cv/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          format,
          password: "admin_bypass_or_current",
          lang,
          includeProfile: exportSettings.includeProfile,
          profileTemplate: exportSettings.profileTemplate,
          selectedSectionIds: exportSettings.selectedSectionIds,
        }),
      });

      if (res.status === 401) {
        const pwd = prompt("Enter CV download password to test export:");
        if (!pwd) return;
        const retry = await fetch("/api/cv/export", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ format, password: pwd, lang }),
        });
        if (!retry.ok) {
          alert("Incorrect password or export failed.");
          return;
        }
        downloadBlob(await retry.blob(), `CV_Export_${lang.toUpperCase()}.${format}`);
        return;
      }

      if (res.ok) {
        downloadBlob(await res.blob(), `CV_Export_${lang.toUpperCase()}.${format}`);
      }
    } catch {
      alert("Failed to export CV.");
    }
  };

  const downloadBlob = (blob: Blob, name: string) => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "0.75rem",
        }}
      >
        <Loader2 size={24} className="animate-spin" />
        <span>Loading Admin Portal...</span>
      </div>
    );
  }

  return (
    <div className={styles.adminContainer}>
      {/* Top Header */}
      <header className={styles.topBar}>
        <div className={styles.brandGroup}>
          <span className={styles.badgeAdmin}>Admin</span>
          <span style={{ fontWeight: 700 }}>CV Management System (TH-EN Dual Language)</span>
        </div>

        <div className={styles.topActions}>
          <Link href="/" target="_blank" className={styles.topBtn}>
            <span>View Public Site</span>
            <ExternalLink size={14} />
          </Link>
          <button
            onClick={handleLogout}
            className={`${styles.topBtn} ${styles.logoutBtn}`}
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className={styles.contentArea}>
        {dbWarning && (
          <div
            style={{
              marginBottom: "1.5rem",
              padding: "1rem 1.25rem",
              borderRadius: "10px",
              background: "rgba(239, 68, 68, 0.12)",
              border: "1px solid rgba(239, 68, 68, 0.35)",
              color: "#fca5a5",
              fontSize: "0.92rem",
              lineHeight: "1.6",
            }}
          >
            <strong style={{ color: "#f87171", display: "block", fontSize: "1rem", marginBottom: "0.25rem" }}>
              ⚠️ Database Not Connected (Missing DATABASE_URL on Vercel)
            </strong>
            <span>
              Your profile changes cannot be saved because the <code>DATABASE_URL</code> environment variable is missing on Vercel.
              Please open your <strong>Vercel Dashboard → Project Settings → Environment Variables</strong>, add <code>DATABASE_URL</code>, then redeploy.
            </span>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className={styles.tabList}>
          <button
            className={`${styles.tabBtn} ${
              activeTab === "profile" || activeTab === "namecards" ? styles.tabBtnActive : ""
            }`}
            onClick={() => setActiveTab("profile")}
          >
            <User size={16} />
            <span>Personal Info & Digital Cards</span>
          </button>

          <button
            className={`${styles.tabBtn} ${
              activeTab === "sections" ? styles.tabBtnActive : ""
            }`}
            onClick={() => setActiveTab("sections")}
          >
            <Layers size={16} />
            <span>CV Sections ({sections.length})</span>
          </button>

          <button
            className={`${styles.tabBtn} ${
              activeTab === "entries" ? styles.tabBtnActive : ""
            }`}
            onClick={() => setActiveTab("entries")}
          >
            <FileText size={16} />
            <span>Content Entries</span>
          </button>

          <button
            className={`${styles.tabBtn} ${
              activeTab === "export" ? styles.tabBtnActive : ""
            }`}
            onClick={() => setActiveTab("export")}
          >
            <Download size={16} />
            <span>Export Settings</span>
          </button>

          <button
            className={`${styles.tabBtn} ${
              activeTab === "gallery" ? styles.tabBtnActive : ""
            }`}
            onClick={() => setActiveTab("gallery")}
          >
            <ImageIcon size={16} />
            <span>Activity Gallery</span>
          </button>

          <button
            className={`${styles.tabBtn} ${
              activeTab === "security" ? styles.tabBtnActive : ""
            }`}
            onClick={() => setActiveTab("security")}
          >
            <Lock size={16} />
            <span>Security & Passwords</span>
          </button>

          <button
            className={`${styles.tabBtn} ${
              activeTab === "backup" ? styles.tabBtnActive : ""
            }`}
            onClick={() => setActiveTab("backup")}
          >
            <Database size={16} />
            <span>Backup & Migration</span>
          </button>
        </div>

        {/* Status Toast */}
        {statusMsg && (
          <div
            className={`${styles.statusToast} ${
              statusMsg.type === "success"
                ? styles.toastSuccess
                : styles.toastError
            }`}
          >
            {statusMsg.type === "success" ? (
              <Check size={18} />
            ) : (
              <AlertCircle size={18} />
            )}
            <span>{statusMsg.text}</span>
          </div>
        )}

        {/* TAB 1: Personal Information & Digital Profiles */}
        {(activeTab === "profile" || activeTab === "namecards") && (
          <section className={styles.panel}>
            <PersonalInfoManager
              onNotify={(msg) => showStatus(msg.type, msg.text)}
            />
          </section>
        )}

        {/* TAB 2: CV Sections Manager */}
        {activeTab === "sections" && (
          <section className={styles.panel}>
            <div className={styles.panelHeader}>
              <div>
                <h2 className={styles.panelTitle}>CV Sections & Categories</h2>
                <p className={styles.panelDesc}>
                  Reorder sections using the Up/Down buttons, toggle visibility on
                  your public site, or add custom sections with dual language
                  support.
                </p>
              </div>

              <button
                onClick={() => setShowAddSection(!showAddSection)}
                className={styles.actionBtn}
              >
                <Plus size={16} />
                <span>Add Custom Section</span>
              </button>
            </div>

            {showAddSection && (
              <form
                onSubmit={handleCreateSection}
                style={{
                  background: "var(--bg-secondary)",
                  padding: "1.5rem",
                  borderRadius: "var(--radius-md)",
                  marginBottom: "1.75rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "1.25rem",
                  border: "1px solid var(--border-subtle)",
                }}
              >
                <h3 style={{ fontSize: "1.1rem", fontWeight: 700 }}>
                  Create New Custom Section (Dual Language)
                </h3>

                <SectionIconSelector
                  value={newSectionIcon}
                  onChange={setNewSectionIcon}
                />

                {/* EN block */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: "1rem" }}>
                  <input
                    type="text"
                    required
                    placeholder="Section Title in English (e.g. Certifications)"
                    value={newSectionTitle}
                    onChange={(e) => setNewSectionTitle(e.target.value)}
                    className={styles.input}
                  />
                  <input
                    type="text"
                    placeholder="English Subtitle/Description (optional)"
                    value={newSectionDesc}
                    onChange={(e) => setNewSectionDesc(e.target.value)}
                    className={styles.input}
                  />
                </div>

                {/* TH block */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: "1rem" }}>
                  <input
                    type="text"
                    placeholder="ชื่อหมวดหมู่ภาษาไทย (เช่น ใบประกาศนียบัตรวิชาชีพ)"
                    value={newSectionTitleTh}
                    onChange={(e) => setNewSectionTitleTh(e.target.value)}
                    className={styles.input}
                  />
                  <input
                    type="text"
                    placeholder="คำอธิบายภาษาไทย (ไม่บังคับ)"
                    value={newSectionDescTh}
                    onChange={(e) => setNewSectionDescTh(e.target.value)}
                    className={styles.input}
                  />
                </div>
                {/* Custom Fields Builder */}
                <SectionFieldsBuilder
                  fields={newSectionCustomFields}
                  onChange={setNewSectionCustomFields}
                />

                <div style={{ display: "flex", gap: "0.75rem" }}>
                  <button
                    type="submit"
                    disabled={saving}
                    className={styles.actionBtn}
                  >
                    Save Section
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddSection(false)}
                    className={`${styles.actionBtn} ${styles.btnSecondary}`}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            <div className={styles.sectionList}>
              {sections.map((sec, index) => (
                <div key={sec.id} className={styles.sectionRow}>
                  <div className={styles.sectionRowInfo}>
                    <span className={styles.orderBadge}>{index + 1}</span>
                    <span style={{ fontSize: "1.3rem", display: "inline-flex", alignItems: "center" }} title="Section Icon">
                      {sec.icon || "📚"}
                    </span>
                    <div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                          flexWrap: "wrap",
                        }}
                      >
                        <span
                          style={{
                            fontWeight: 600,
                            fontSize: "1rem",
                            color: sec.isVisible
                              ? "var(--text-primary)"
                              : "var(--text-muted)",
                          }}
                        >
                          {sec.title}
                        </span>
                        {sec.titleTh && (
                          <span
                            style={{
                              fontSize: "0.92rem",
                              color: "var(--primary)",
                              fontWeight: 500,
                            }}
                          >
                            / {sec.titleTh}
                          </span>
                        )}
                        {sec.isSystem ? (
                          <span
                            style={{
                              fontSize: "0.7rem",
                              background: "var(--bg-secondary)",
                              padding: "0.15rem 0.45rem",
                              borderRadius: "4px",
                              color: "var(--text-muted)",
                            }}
                          >
                            Default
                          </span>
                        ) : (
                          <span
                            style={{
                              fontSize: "0.7rem",
                              background: "var(--primary-subtle)",
                              color: "var(--primary)",
                              padding: "0.15rem 0.45rem",
                              borderRadius: "4px",
                            }}
                          >
                            Custom
                          </span>
                        )}
                        {/* Format Badge */}
                        <span
                          style={{
                            fontSize: "0.7rem",
                            fontWeight: 500,
                            background:
                              sec.contentType === "file"
                                ? "rgba(16, 185, 129, 0.12)"
                                : sec.contentType === "link"
                                ? "rgba(14, 165, 233, 0.12)"
                                : sec.contentType === "mixed"
                                ? "rgba(168, 85, 247, 0.12)"
                                : "var(--bg-secondary)",
                            color:
                              sec.contentType === "file"
                                ? "#10b981"
                                : sec.contentType === "link"
                                ? "#0ea5e9"
                                : sec.contentType === "mixed"
                                ? "#a855f7"
                                : "var(--text-muted)",
                            padding: "0.15rem 0.45rem",
                            borderRadius: "4px",
                          }}
                        >
                          {sec.contentType === "file"
                            ? "📄 File Upload"
                            : sec.contentType === "link"
                            ? "🔗 Link"
                            : sec.contentType === "mixed"
                            ? "🌟 Mixed"
                            : "📝 Text"}
                        </span>
                        {/* Custom Fields Count Badge */}
                        {(() => {
                          try {
                            const fCount = JSON.parse(sec.customFields || "[]").length;
                            if (fCount > 0) {
                              return (
                                <span
                                  style={{
                                    fontSize: "0.7rem",
                                    fontWeight: 500,
                                    background: "rgba(99, 102, 241, 0.12)",
                                    color: "#6366f1",
                                    padding: "0.15rem 0.45rem",
                                    borderRadius: "4px",
                                  }}
                                >
                                  📋 {fCount} custom {fCount === 1 ? "field" : "fields"}
                                </span>
                              );
                            }
                          } catch {}
                          return null;
                        })()}
                        {!sec.isVisible && (
                          <span
                            style={{
                              fontSize: "0.7rem",
                              background: "rgba(239, 68, 68, 0.1)",
                              color: "#ef4444",
                              padding: "0.15rem 0.45rem",
                              borderRadius: "4px",
                            }}
                          >
                            Hidden
                          </span>
                        )}
                      </div>
                      {(sec.description || sec.descriptionTh) && (
                        <p
                          style={{
                            fontSize: "0.82rem",
                            color: "var(--text-muted)",
                            marginTop: "0.2rem",
                          }}
                        >
                          {sec.description} {sec.descriptionTh ? `(${sec.descriptionTh})` : ""}
                        </p>
                      )}
                      <span
                        style={{
                          fontSize: "0.78rem",
                          color: "var(--text-light)",
                        }}
                      >
                        {sec.items.length} {sec.items.length === 1 ? "entry" : "entries"}
                      </span>
                    </div>
                  </div>

                  <div className={styles.sectionRowActions}>
                    <button
                      onClick={() => handleMoveSection(index, "up")}
                      disabled={index === 0}
                      className={styles.iconBtn}
                      title="Move Up"
                    >
                      <ArrowUp size={16} />
                    </button>
                    <button
                      onClick={() => handleMoveSection(index, "down")}
                      disabled={index === sections.length - 1}
                      className={styles.iconBtn}
                      title="Move Down"
                    >
                      <ArrowDown size={16} />
                    </button>

                    <button
                      onClick={() => handleOpenEditSection(sec)}
                      className={styles.iconBtn}
                      title="Edit Section Name & Details"
                    >
                      <Edit2 size={16} />
                    </button>

                    <button
                      onClick={() => handleToggleSectionVisibility(sec)}
                      className={styles.iconBtn}
                      title={sec.isVisible ? "Hide Section" : "Show Section"}
                    >
                      {sec.isVisible ? <Eye size={16} /> : <EyeOff size={16} />}
                    </button>

                    {!sec.isSystem && (
                      <button
                        onClick={() => handleDeleteSection(sec)}
                        className={`${styles.iconBtn} ${styles.btnDanger}`}
                        style={
                          sec.items && sec.items.length > 0
                            ? {
                                opacity: 0.5,
                                cursor: "not-allowed",
                                filter: "grayscale(60%)",
                              }
                            : undefined
                        }
                        title={
                          sec.items && sec.items.length > 0
                            ? `⚠️ ไม่สามารถลบได้เนื่องจากมีข้อมูลอยู่ ${sec.items.length} รายการ (ต้องลบข้อมูลข้างในออกก่อน)`
                            : "ลบหัวข้อนี้"
                        }
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* TAB 3: Content Entries Manager */}
        {activeTab === "entries" && (
          <section className={styles.panel}>
            <div className={styles.panelHeader}>
              <div>
                <h2 className={styles.panelTitle}>Content Entries</h2>
                <p className={styles.panelDesc}>
                  Add, edit, delete, and reorder entries with separate English and
                  Thai data blocks.
                </p>
              </div>

              <button onClick={handleOpenNewItem} className={styles.actionBtn}>
                <Plus size={16} />
                <span>Add Entry to Section</span>
              </button>
            </div>

            {/* Section Switcher Dropdown */}
            <div style={{ marginBottom: "1.5rem", maxWidth: "480px", display: "flex", gap: "0.75rem", alignItems: "flex-end" }}>
              <div style={{ flex: 1 }}>
                <label className={styles.label}>Select Section to Manage</label>
                <select
                  value={selectedSectionId}
                  onChange={(e) => setSelectedSectionId(e.target.value)}
                  className={styles.select}
                  style={{ width: "100%", marginTop: "0.35rem" }}
                >
                  {sections.map((sec) => (
                    <option key={sec.id} value={sec.id}>
                      {sec.title} {sec.titleTh ? `(${sec.titleTh})` : ""} [{sec.items.length}]
                    </option>
                  ))}
                </select>
              </div>

              {activeSection && (
                <button
                  type="button"
                  onClick={() => handleOpenEditSection(activeSection)}
                  className={`${styles.actionBtn} ${styles.btnSecondary}`}
                  style={{
                    padding: "0.5rem 0.85rem",
                    fontSize: "0.85rem",
                    whiteSpace: "nowrap",
                    height: "40px",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.35rem",
                  }}
                  title="Edit Section Name & Thai Title"
                >
                  <Edit2 size={14} />
                  <span>Edit Section</span>
                </button>
              )}
            </div>

            {/* Items in active section */}
            {activeSection && (
              <div className={styles.sectionList}>
                {activeSection.items.length === 0 ? (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "2.5rem",
                      background: "var(--bg-main)",
                      borderRadius: "var(--radius-md)",
                      color: "var(--text-muted)",
                      border: "1px dashed var(--border-strong)",
                    }}
                  >
                    No entries in this section yet. Click &quot;Add Entry to Section&quot;
                    to create one!
                  </div>
                ) : (
                  activeSection.items.map((item, index) => (
                    <div key={item.id} className={styles.sectionRow}>
                      <div className={styles.sectionRowInfo}>
                        <span className={styles.orderBadge}>{index + 1}</span>
                        <div>
                          <p style={{ fontWeight: 600, fontSize: "1rem" }}>
                            {item.title}
                          </p>
                          {item.titleTh && (
                            <p
                              style={{
                                fontSize: "0.88rem",
                                color: "var(--accent-purple)",
                                fontWeight: 500,
                              }}
                            >
                              🇹🇭 {item.titleTh}
                            </p>
                          )}
                          <p
                            style={{
                              fontSize: "0.85rem",
                              color: "var(--text-secondary)",
                              marginTop: "0.15rem",
                            }}
                          >
                            {[item.subtitle, item.organization, item.location]
                              .filter(Boolean)
                              .join(" • ")}
                          </p>
                          {(item.startDate || item.endDate) && (
                            <p
                              style={{
                                fontSize: "0.78rem",
                                color: "var(--primary)",
                                marginTop: "0.2rem",
                              }}
                            >
                              {item.startDate}
                              {item.isCurrent
                                ? " — Present"
                                : item.endDate
                                ? ` — ${item.endDate}`
                                : ""}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className={styles.sectionRowActions}>
                        <button
                          onClick={() => handleMoveItem(index, "up")}
                          disabled={index === 0}
                          className={styles.iconBtn}
                          title="Move Up"
                        >
                          <ArrowUp size={16} />
                        </button>
                        <button
                          onClick={() => handleMoveItem(index, "down")}
                          disabled={index === activeSection.items.length - 1}
                          className={styles.iconBtn}
                          title="Move Down"
                        >
                          <ArrowDown size={16} />
                        </button>
                        <button
                          onClick={() => handleEditItem(item)}
                          className={styles.iconBtn}
                          title="Edit Entry"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className={`${styles.iconBtn} ${styles.btnDanger}`}
                          title="Delete Entry"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </section>
        )}

        {/* TAB 4: Export Settings Customization */}
        {activeTab === "export" && (
          <section className={styles.panel}>
            <ExportSettingsPanel
              sections={sections}
              exportSettings={exportSettings}
              onUpdateExportSettings={setExportSettings}
              onSave={handleSaveExportSettings}
              saving={saving}
              onTestExport={handleAdminExport}
            />
          </section>
        )}

        {/* TAB 5: Activity Gallery & Google Drive */}
        {activeTab === "gallery" && (
          <section className={styles.panel}>
            <GalleryManager onNotify={(msg) => showStatus(msg.type, msg.text)} />
          </section>
        )}

        {/* TAB 6: Security & Passwords */}
        {activeTab === "security" && (
          <section className={styles.panel}>
            <div className={styles.panelHeader}>
              <div>
                <h2 className={styles.panelTitle}>Security & Export Settings</h2>
                <p className={styles.panelDesc}>
                  Configure password protection for CV download and test both
                  Thai and English document extractions.
                </p>
              </div>
              <button
                type="submit"
                form="settings-form"
                disabled={saving}
                className={styles.actionBtn}
              >
                {saving ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Save size={16} />
                )}
                <span>Save Settings</span>
              </button>
            </div>

            <form
              id="settings-form"
              onSubmit={handleSaveSettings}
              className={styles.formGrid}
            >
              <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.5rem" }}>
                  1. CV Download Password
                </h3>
                <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "0.85rem" }}>
                  Visitors must enter this password to download your CV in PDF or
                  DOCX format.
                </p>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    cursor: "pointer",
                    fontSize: "0.92rem",
                    marginBottom: "1rem",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={settings.requireCvPassword}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        requireCvPassword: e.target.checked,
                      })
                    }
                  />
                  <span>Require password before downloading CV</span>
                </label>
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label}>
                  New CV Download Password (leave blank to keep current)
                </label>
                <input
                  type="password"
                  value={settings.newCvPassword}
                  onChange={(e) =>
                    setSettings({ ...settings, newCvPassword: e.target.value })
                  }
                  className={styles.input}
                  placeholder="Set new CV password"
                />
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label}>Confirm CV Download Password</label>
                <input
                  type="password"
                  value={settings.confirmCvPassword}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      confirmCvPassword: e.target.value,
                    })
                  }
                  className={styles.input}
                  placeholder="Repeat new password"
                />
              </div>

              {/* 2. Google Drive Cloud Storage */}
              {/* 2. Google Drive Cloud Storage */}
              <div className={`${styles.inputGroup} ${styles.fullWidth}`} style={{ marginTop: "1.5rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem", marginBottom: "0.4rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <Cloud size={20} color="var(--primary)" />
                    <h3 style={{ fontSize: "1.1rem", fontWeight: 700, margin: 0 }}>
                      2. การจัดเก็บไฟล์บน Google Drive (Cloud Storage)
                    </h3>
                  </div>
                  {googleDrive.hasPrivateKey && (
                    <span style={{ fontSize: "0.75rem", background: "rgba(16, 185, 129, 0.15)", color: "#10b981", padding: "0.2rem 0.6rem", borderRadius: "9999px", display: "inline-flex", alignItems: "center", gap: "0.3rem", fontWeight: 600 }}>
                      <CheckCircle2 size={13} />
                      เชื่อมต่อกุญแจความปลอดภัยแล้ว (Key Configured)
                    </span>
                  )}
                </div>
                <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "1rem" }}>
                  ไฟล์รูปภาพและเอกสารที่อัปโหลด (รูปโปรไฟล์, เกียรติบัตร, PDF) จะถูกส่งไปจัดเก็บยังโฟลเดอร์ Google Drive ของคุณโดยตรง
                </p>

                {/* Enable toggle */}
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.6rem",
                    padding: "0.75rem 1rem",
                    background: "var(--bg-elevated)",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--border-subtle)",
                    cursor: "pointer",
                    marginBottom: "1rem",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={googleDrive.enabled}
                    onChange={(e) =>
                      setGoogleDrive({
                        ...googleDrive,
                        enabled: e.target.checked,
                      })
                    }
                    style={{ width: "18px", height: "18px", accentColor: "var(--primary)" }}
                  />
                  <div>
                    <strong style={{ display: "block", fontSize: "0.9rem" }}>
                      เปิดใช้งาน Google Drive สำหรับบันทึกไฟล์อัปโหลดอัตโนมัติ
                    </strong>
                    <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                      หากปิดใช้งาน ระบบจะบันทึกลงพื้นที่จัดเก็บภายใน (Local / Base64) ให้อัตโนมัติ
                    </span>
                  </div>
                </label>

                {googleDrive.enabled && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "1rem", padding: "1.25rem", background: "var(--bg-card)", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)" }}>
                    {/* Folder ID / Link */}
                    <div>
                      <label className={styles.label} style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                        <FolderOpen size={16} color="var(--primary)" />
                        <span>Google Drive Folder Link หรือ Folder ID</span>
                      </label>
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        <input
                          type="url"
                          value={googleDrive.folderLink}
                          onChange={(e) =>
                            setGoogleDrive({ ...googleDrive, folderLink: e.target.value.trim(), folderId: e.target.value.trim() })
                          }
                          placeholder="วาง URL โฟลเดอร์ เช่น https://drive.google.com/drive/folders/..."
                          className={styles.input}
                        />
                        {googleDrive.folderLink && (
                          <a
                            href={
                              googleDrive.folderLink.startsWith("http")
                                ? googleDrive.folderLink
                                : `https://drive.google.com/drive/folders/${googleDrive.folderLink}`
                            }
                            target="_blank"
                            rel="noreferrer"
                            className={styles.actionBtn}
                            style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", whiteSpace: "nowrap", textDecoration: "none" }}
                          >
                            <ExternalLink size={15} />
                            <span>เปิดโฟลเดอร์ Drive</span>
                          </a>
                        )}
                      </div>
                      <span style={{ fontSize: "0.76rem", color: "var(--text-muted)", marginTop: "0.3rem", display: "block" }}>
                        💡 คุณสามารถคัดลอก URL ของโฟลเดอร์จาก Browser มาวางได้เลย ระบบจะดึง Folder ID ให้โดยอัตโนมัติ
                      </span>
                    </div>

                    {/* Service Account Email */}
                    <div>
                      <label className={styles.label} style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                        <User size={15} color="var(--primary)" />
                        <span>Google Service Account Client Email</span>
                      </label>
                      <input
                        type="email"
                        value={googleDrive.clientEmail}
                        onChange={(e) =>
                          setGoogleDrive({ ...googleDrive, clientEmail: e.target.value.trim() })
                        }
                        placeholder="เช่น my-bot@my-project.iam.gserviceaccount.com"
                        className={styles.input}
                      />
                    </div>

                    {/* Private Key */}
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.3rem" }}>
                        <label className={styles.label} style={{ display: "flex", alignItems: "center", gap: "0.4rem", margin: 0 }}>
                          <Key size={15} color="var(--primary)" />
                          <span>Google Service Account Private Key</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => setShowJsonPasteModal(true)}
                          style={{
                            background: "transparent",
                            border: "1px solid var(--primary)",
                            color: "var(--primary)",
                            fontSize: "0.78rem",
                            padding: "0.2rem 0.6rem",
                            borderRadius: "var(--radius-sm)",
                            cursor: "pointer",
                            fontWeight: 600,
                          }}
                        >
                          📋 วางไฟล์ JSON Key ทั้งก้อน (Auto-fill)
                        </button>
                      </div>
                      <textarea
                        rows={3}
                        value={googleDrive.privateKey}
                        onChange={(e) =>
                          setGoogleDrive({ ...googleDrive, privateKey: e.target.value })
                        }
                        placeholder={
                          googleDrive.hasPrivateKey
                            ? "•••••••••••••••• (กุญแจถูกบันทึกในระบบแล้ว — กรอกใหม่หากต้องการเปลี่ยน)"
                            : "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
                        }
                        className={styles.textarea}
                        style={{ fontFamily: "monospace", fontSize: "0.8rem" }}
                      />
                    </div>

                    {/* Action buttons & Test connection */}
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap", marginTop: "0.5rem" }}>
                      <button
                        type="button"
                        onClick={handleTestGoogleDrive}
                        disabled={testingDrive || !googleDrive.folderLink}
                        className={`${styles.actionBtn} ${styles.btnSecondary}`}
                      >
                        {testingDrive ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <CheckCircle2 size={16} />
                        )}
                        <span>ทดสอบการเชื่อมต่อ (Test Connection)</span>
                      </button>

                      {driveTestResult && (
                        <div
                          style={{
                            fontSize: "0.85rem",
                            padding: "0.4rem 0.8rem",
                            borderRadius: "var(--radius-sm)",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.4rem",
                            background: driveTestResult.success ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)",
                            color: driveTestResult.success ? "#10b981" : "#ef4444",
                            border: `1px solid ${driveTestResult.success ? "rgba(16, 185, 129, 0.3)" : "rgba(239, 68, 68, 0.3)"}`,
                          }}
                        >
                          {driveTestResult.success ? <CheckCircle2 size={15} /> : <XCircle size={15} />}
                          <span>{driveTestResult.message}</span>
                        </div>
                      )}
                    </div>

                    {/* Instructions */}
                    <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", background: "var(--bg-elevated)", padding: "0.85rem 1rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-subtle)", lineHeight: 1.6 }}>
                      <strong style={{ display: "flex", alignItems: "center", gap: "0.3rem", color: "var(--text-primary)", marginBottom: "0.3rem" }}>
                        <HelpCircle size={14} />
                        วิธีเชื่อมต่อ Google Drive เข้ากับระบบ (3 ขั้นตอนง่ายๆ):
                      </strong>
                      <ol style={{ paddingLeft: "1.2rem", margin: 0 }}>
                        <li>สร้าง Service Account ใน <strong>Google Cloud Console</strong> แล้วดาวน์โหลดไฟล์ Key (.json)</li>
                        <li>เปิด Google Drive สร้างโฟลเดอร์สำหรับเก็บไฟล์ แล้วกด <strong>Share (แชร์)</strong> โฟลเดอร์นั้นให้อีเมล Service Account โดยตั้งสิทธิ์เป็น <strong>Editor (ผู้แก้ไข)</strong></li>
                        <li>กดปุ่ม <em>"วางไฟล์ JSON Key ทั้งก้อน"</em> นำข้อความจากไฟล์ .json มาวาง ระบบจะดึง Email และ Private Key ให้อัตโนมัติ</li>
                      </ol>
                    </div>
                  </div>
                )}
              </div>

              {/* 3. Test Dual Language CV Document Generation */}
              <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                <h3
                  style={{
                    fontSize: "1.1rem",
                    fontWeight: 700,
                    marginTop: "1.5rem",
                    marginBottom: "0.5rem",
                  }}
                >
                  3. Test Dual Language CV Document Generation
                </h3>
                <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "0.85rem" }}>
                  Verify that your CV extracts properly in either English or
                  Thai:
                </p>
                <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                  <button
                    type="button"
                    onClick={() => handleAdminExport("pdf", "en")}
                    className={`${styles.actionBtn} ${styles.btnSecondary}`}
                  >
                    <Download size={16} />
                    <span>Download PDF (EN)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAdminExport("docx", "en")}
                    className={`${styles.actionBtn} ${styles.btnSecondary}`}
                  >
                    <Download size={16} />
                    <span>Download Word (EN)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAdminExport("docx", "th")}
                    className={`${styles.actionBtn} ${styles.btnSecondary}`}
                  >
                    <Download size={16} />
                    <span>Download Word (TH ภาษาไทย)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAdminExport("pdf", "th")}
                    className={`${styles.actionBtn} ${styles.btnSecondary}`}
                  >
                    <Download size={16} />
                    <span>Download PDF (TH)</span>
                  </button>
                </div>
              </div>
            </form>
          </section>
        )}

        {/* TAB 7: Full System Backup & Migration */}
        {activeTab === "backup" && (
          <section className={styles.panel}>
            <BackupMigrationPanel
              onNotify={(msg) => setStatusMsg(msg)}
              onRefreshAll={loadData}
            />
          </section>
        )}
      </main>

      {/* Modal: Add or Edit Item (With Dual Language Separate Data Blocks) */}
      {showItemModal && editingItem && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.75)",
            backdropFilter: "blur(8px)",
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1.5rem",
          }}
          onClick={() => setShowItemModal(false)}
        >
          <div
            style={{
              background: "var(--bg-elevated)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-lg)",
              maxWidth: "800px",
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
              padding: "2rem",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontSize: "1.35rem", fontWeight: 700, marginBottom: "1.25rem" }}>
              {editingItem.id ? "Edit CV Entry (TH-EN)" : "New CV Entry (TH-EN)"}
            </h3>

            <form onSubmit={handleSaveItem} noValidate>
              {(() => {
                let sectionFields: CustomFieldDef[] = [];
                try {
                  sectionFields = activeSection?.customFields
                    ? JSON.parse(activeSection.customFields)
                    : [];
                } catch {
                  sectionFields = [];
                }

                if (sectionFields.length === 0) {
                  return (
                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "1.5rem" }}>
                      <div style={{ padding: "0.85rem 1rem", background: "rgba(245, 158, 11, 0.08)", border: "1px solid rgba(245, 158, 11, 0.25)", borderRadius: "8px", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                        ⚠️ หัวข้อนี้ยังไม่มีการกำหนดโครงสร้างฟิลด์มาตรฐาน คุณสามารถแก้ไขโครงสร้างฟิลด์ได้ที่ปุ่ม <strong>"แก้ไข Section"</strong> ในหน้ารายการหัวข้อ
                      </div>
                      <div className={styles.formGrid}>
                        <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                          <label className={styles.label}>Entry Title (EN) *</label>
                          <input
                            type="text"
                            required
                            value={editingItem.title || ""}
                            onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                            className={styles.input}
                            placeholder="Title in English"
                          />
                        </div>
                        <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                          <label className={styles.label}>ชื่อรายการภาษาไทย (TH)</label>
                          <input
                            type="text"
                            value={editingItem.titleTh || ""}
                            onChange={(e) => setEditingItem({ ...editingItem, titleTh: e.target.value })}
                            className={styles.input}
                            placeholder="ชื่อรายการภาษาไทย"
                          />
                        </div>
                        <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                          <label className={styles.label}>Description (EN)</label>
                          <textarea
                            value={editingItem.description || ""}
                            onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                            className={styles.textarea}
                            rows={3}
                          />
                        </div>
                        <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                          <label className={styles.label}>คำอธิบายภาษาไทย (TH)</label>
                          <textarea
                            value={editingItem.descriptionTh || ""}
                            onChange={(e) => setEditingItem({ ...editingItem, descriptionTh: e.target.value })}
                            className={styles.textarea}
                            rows={3}
                          />
                        </div>
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    className={`${styles.langBlock} ${styles.langBlockShared}`}
                    style={{
                      border: "1px solid var(--primary)",
                      background: "rgba(14, 165, 233, 0.03)",
                      marginBottom: "1.5rem",
                    }}
                  >
                    <div className={styles.langBlockHeader}>
                      <span style={{ fontSize: "1.2rem" }}>📋</span>
                      <h4 className={styles.langBlockTitle}>
                        ฟิลด์ข้อมูลเฉพาะของหมวดหมู่นี้ ({activeSection?.titleTh || activeSection?.title})
                      </h4>
                      <span
                        className={styles.langTag}
                        style={{ background: "var(--primary)", color: "#fff" }}
                      >
                        Custom Fields
                      </span>
                    </div>

                    {/* Language Switcher Bar */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        padding: "0.6rem 0.85rem",
                        background: "var(--bg-secondary)",
                        border: "1px solid var(--border-subtle)",
                        borderRadius: "8px",
                        marginBottom: "1.25rem",
                        flexWrap: "wrap",
                      }}
                    >
                      <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)" }}>
                        🌐 ภาษาของข้อมูล:
                      </span>
                      <button
                        type="button"
                        onClick={() => setItemLangTab("th")}
                        style={{
                          padding: "0.3rem 0.75rem",
                          borderRadius: "6px",
                          fontSize: "0.8rem",
                          fontWeight: 600,
                          cursor: "pointer",
                          border: itemLangTab === "th" ? "1px solid var(--primary)" : "1px solid var(--border-subtle)",
                          background: itemLangTab === "th" ? "var(--primary)" : "var(--bg-elevated)",
                          color: itemLangTab === "th" ? "#fff" : "var(--text-secondary)",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.35rem",
                        }}
                      >
                        <span>🇹🇭</span>
                        <span>ภาษาไทย (TH)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setItemLangTab("en")}
                        style={{
                          padding: "0.3rem 0.75rem",
                          borderRadius: "6px",
                          fontSize: "0.8rem",
                          fontWeight: 600,
                          cursor: "pointer",
                          border: itemLangTab === "en" ? "1px solid var(--primary)" : "1px solid var(--border-subtle)",
                          background: itemLangTab === "en" ? "var(--primary)" : "var(--bg-elevated)",
                          color: itemLangTab === "en" ? "#fff" : "var(--text-secondary)",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.35rem",
                        }}
                      >
                        <span>🇺🇸</span>
                        <span>English (EN)</span>
                      </button>
                      <span style={{ marginLeft: "auto", fontSize: "0.72rem", color: "var(--text-muted)" }}>
                        💡 สลับแท็บเพื่อกรอกข้อมูลภาษาไทยและภาษาอังกฤษแยกจากกันอย่างอิสระ
                      </span>
                    </div>

                    <div className={styles.formGrid}>
                      {sectionFields.map((f) => {
                        const isDateType = ["year", "year_range", "date_range", "date"].includes(f.type);
                        const isTextType =
                          !isDateType &&
                          (["details", "textarea", "text", "address"].includes(f.type) ||
                            f.role === "header" ||
                            f.role === "sub_header");
                        const activeKey = (isTextType && itemLangTab === "th") ? `${f.id}_th` : f.id;
                        const val = isDateType
                          ? (getCustomFieldValue(f.id) || getCustomFieldValue(`${f.id}_th`))
                          : getCustomFieldValue(activeKey);
                        
                        const fieldLabel = itemLangTab === "th" 
                          ? (f.labelTh ? `${f.labelTh} (${f.label})` : f.label)
                          : (f.label ? `${f.label}${f.labelTh ? ` (${f.labelTh})` : ""}` : "Field");

                        const iconDisplay = f.icon ? `${f.icon} ` : "";
                        const roleBadge =
                          f.role === "header" ? (
                            <span style={{ fontSize: "0.7rem", background: "var(--primary-subtle)", color: "var(--primary)", padding: "0.1rem 0.4rem", borderRadius: "4px", fontWeight: 600 }}>
                              👑 Header
                            </span>
                          ) : f.role === "sub_header" ? (
                            <span style={{ fontSize: "0.7rem", background: "rgba(100, 116, 139, 0.12)", color: "var(--text-muted)", padding: "0.1rem 0.4rem", borderRadius: "4px", fontWeight: 600 }}>
                              📌 Sub-header
                            </span>
                          ) : null;

                        // 1. DETAILS / TEXTAREA
                        if (f.type === "details" || f.type === "textarea") {
                          return (
                            <div key={f.id} className={`${styles.inputGroup} ${styles.fullWidth}`}>
                              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.3rem" }}>
                                <label className={styles.label} style={{ marginBottom: 0 }}>
                                  {iconDisplay}{fieldLabel} {f.required && <span style={{ color: "#ef4444" }}>*</span>}
                                </label>
                                {roleBadge}
                              </div>
                              <textarea
                                value={val}
                                onChange={(e) => setCustomFieldValue(activeKey, e.target.value)}
                                className={styles.textarea}
                                rows={3}
                                placeholder={itemLangTab === "th" ? `กรอกรายละเอียด ${f.labelTh || f.label}` : `Enter details for ${f.label}`}
                              />
                            </div>
                          );
                        }

                        // 2. UPLOAD / FILE
                        if (f.type === "upload" || f.type === "file") {
                          const fileVal = getCustomFieldValue(f.id);
                          const isDataUrl = fileVal.startsWith("data:");
                          const isImage = isDataUrl ? fileVal.startsWith("data:image/") : Boolean(fileVal.match(/\.(jpg|jpeg|png|webp|gif|svg)($|\?)/i));
                          const displayName = isDataUrl
                            ? (isImage ? "🖼️ ไฟล์รูปภาพแนบ (Image Upload)" : "📄 เอกสารแนบ (Document Upload)")
                            : fileVal.startsWith("http")
                            ? fileVal
                            : fileVal.split("/").pop() || "Attached File";

                          return (
                            <div key={f.id} className={`${styles.inputGroup} ${styles.fullWidth}`}>
                              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.3rem" }}>
                                <label className={styles.label} style={{ marginBottom: 0 }}>
                                  {iconDisplay}{fieldLabel} {f.required && <span style={{ color: "#ef4444" }}>*</span>}
                                </label>
                                {roleBadge}
                              </div>
                              <div style={{ width: "100%" }}>
                                {fileVal ? (
                                  <div
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "space-between",
                                      background: "var(--bg-secondary)",
                                      padding: "0.55rem 0.85rem",
                                      borderRadius: "6px",
                                      border: "1px solid var(--border-subtle)",
                                      flexWrap: "wrap",
                                      gap: "0.5rem",
                                    }}
                                  >
                                    <span style={{ fontSize: "0.83rem", color: "var(--primary)", fontWeight: 500, wordBreak: "break-all", display: "flex", alignItems: "center", gap: "0.4rem", maxWidth: "70%" }}>
                                      {displayName}
                                    </span>
                                    <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", flexShrink: 0 }}>
                                      {isDataUrl ? (
                                        <a
                                          href={fileVal}
                                          download={isImage ? "attachment.png" : "document.pdf"}
                                          style={{ fontSize: "0.8rem", color: "var(--primary)", textDecoration: "underline", fontWeight: 600 }}
                                        >
                                          ดาวน์โหลดไฟล์ ⬇
                                        </a>
                                      ) : (
                                        <a
                                          href={fileVal}
                                          target="_blank"
                                          rel="noreferrer"
                                          style={{ fontSize: "0.8rem", color: "var(--primary)", textDecoration: "underline", fontWeight: 600 }}
                                        >
                                          เปิดดูไฟล์ ↗
                                        </a>
                                      )}
                                      <button
                                        type="button"
                                        onClick={() => setCustomFieldValue(f.id, "")}
                                        style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: "0.8rem", marginLeft: "0.25rem" }}
                                      >
                                        ✕ ลบ / เปลี่ยนไฟล์
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <div style={{ display: "flex", flexDirection: "column", gap: "0.45rem", width: "100%" }}>
                                    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
                                      <input
                                        type="text"
                                        value={val}
                                        onChange={(e) => setCustomFieldValue(f.id, e.target.value)}
                                        placeholder="วางลิงก์ Google Drive หรือ URL ไฟล์แนบ..."
                                        className={styles.input}
                                        style={{ flex: 1, minWidth: "220px" }}
                                      />
                                      <label className={styles.uploadButton} style={{ whiteSpace: "nowrap", cursor: "pointer", margin: 0, padding: "0.5rem 0.85rem", fontSize: "0.82rem" }}>
                                        {uploadingCustomFieldId === f.id ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
                                        <span>
                                          {uploadingCustomFieldId === f.id ? "กำลังอัปโหลด..." : "อัปโหลดจากเครื่อง"}
                                        </span>
                                        <input
                                          type="file"
                                          accept="image/*,application/pdf,.doc,.docx"
                                          style={{ display: "none" }}
                                          disabled={uploadingCustomFieldId === f.id}
                                          onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) handleCustomFileUpload(f.id, file);
                                          }}
                                        />
                                      </label>
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.4rem" }}>
                                      {googleDrive.enabled && googleDrive.hasPrivateKey ? (
                                        <span style={{ fontSize: "0.76rem", color: "#10b981", display: "inline-flex", alignItems: "center", gap: "0.3rem", fontWeight: 600 }}>
                                          <Cloud size={13} />
                                          <span>ไฟล์ที่อัปโหลดจะถูกส่งไปยัง Google Drive โฟลเดอร์ที่ตั้งค่าไว้</span>
                                        </span>
                                      ) : (
                                        <span style={{ fontSize: "0.74rem", color: "var(--text-muted)" }}>
                                          💡 วางลิงก์ไฟล์ Google Drive หรืออัปโหลดไฟล์จากเครื่อง
                                        </span>
                                      )}

                                      {googleDrive.folderLink && (
                                        <a
                                          href={
                                            googleDrive.folderLink.startsWith("http")
                                              ? googleDrive.folderLink
                                              : `https://drive.google.com/drive/folders/${googleDrive.folderLink}`
                                          }
                                          target="_blank"
                                          rel="noreferrer"
                                          style={{ fontSize: "0.78rem", color: "var(--primary)", display: "inline-flex", alignItems: "center", gap: "0.25rem", textDecoration: "none", fontWeight: 500 }}
                                        >
                                          <FolderOpen size={13} />
                                          <span>เปิดโฟลเดอร์ Google Drive ↗</span>
                                        </a>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        }

                        // 2.5 DROPDOWN
                        if (f.type === "dropdown") {
                          const options = f.options || [];
                          return (
                            <div key={f.id} className={styles.inputGroup}>
                              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.3rem" }}>
                                <label className={styles.label} style={{ marginBottom: 0 }}>
                                  {iconDisplay}{fieldLabel} {f.required && <span style={{ color: "#ef4444" }}>*</span>}
                                </label>
                                {roleBadge}
                              </div>
                              <select
                                value={val}
                                onChange={(e) => setCustomFieldValue(activeKey, e.target.value)}
                                className={styles.input}
                                style={{ cursor: "pointer" }}
                              >
                                <option value="">-- {itemLangTab === "th" ? `เลือก${fieldLabel}` : `Select ${fieldLabel}`} --</option>
                                {options.map((opt, optIdx) => {
                                  const optLabel = itemLangTab === "th" ? (opt.labelTh || opt.label) : (opt.label || opt.labelTh);
                                  const optVal = opt.value || opt.label;
                                  return (
                                    <option key={optIdx} value={optVal}>
                                      {optLabel}
                                    </option>
                                  );
                                })}
                              </select>
                            </div>
                          );
                        }

                        // 3. LINK
                        if (f.type === "link") {
                          const linkVal = getCustomFieldValue(f.id);
                          return (
                            <div key={f.id} className={`${styles.inputGroup} ${styles.fullWidth}`}>
                              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.3rem" }}>
                                <label className={styles.label} style={{ marginBottom: 0 }}>
                                  {iconDisplay}{fieldLabel} (URL ลิงก์) {f.required && <span style={{ color: "#ef4444" }}>*</span>}
                                </label>
                                {roleBadge}
                              </div>
                              <div style={{ display: "flex", gap: "0.5rem" }}>
                                <input
                                  type="url"
                                  value={linkVal}
                                  onChange={(e) => setCustomFieldValue(f.id, e.target.value)}
                                  className={styles.input}
                                  placeholder="https://..."
                                />
                                {linkVal && (
                                  <a href={linkVal} target="_blank" rel="noreferrer" className={styles.actionBtn} style={{ padding: "0.45rem 0.85rem", fontSize: "0.82rem", whiteSpace: "nowrap" }}>
                                    เปิดลิงก์ ↗
                                  </a>
                                )}
                              </div>
                            </div>
                          );
                        }

                        // 4. YEAR (Selection จาก Calendar Tools)
                        if (f.type === "year") {
                          return (
                            <div key={f.id} className={styles.inputGroup}>
                              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.3rem" }}>
                                <label className={styles.label} style={{ marginBottom: 0 }}>
                                  {iconDisplay}{fieldLabel} {f.required && <span style={{ color: "#ef4444" }}>*</span>}
                                </label>
                                {roleBadge}
                              </div>
                              <YearPickerInput
                                value={val}
                                lang={itemLangTab}
                                onChange={(newYear) => {
                                  setCustomFieldValue(f.id, newYear);
                                  setCustomFieldValue(`${f.id}_th`, newYear);
                                }}
                              />
                            </div>
                          );
                        }

                        // 5. YEAR RANGE (เลือกหัว-ท้าย)
                        if (f.type === "year_range") {
                          return (
                            <div key={f.id} className={`${styles.inputGroup} ${styles.fullWidth}`}>
                              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.3rem" }}>
                                <label className={styles.label} style={{ marginBottom: 0 }}>
                                  {iconDisplay}{fieldLabel} {f.required && <span style={{ color: "#ef4444" }}>*</span>}
                                </label>
                                {roleBadge}
                              </div>
                              <YearRangePickerInput
                                value={val}
                                lang={itemLangTab}
                                onChange={(newRange) => {
                                  setCustomFieldValue(f.id, newRange);
                                  setCustomFieldValue(`${f.id}_th`, newRange);
                                }}
                              />
                            </div>
                          );
                        }

                        // 6. DATE RANGE (ช่วงเวลาเดือนปี เลือกหัว-ท้าย ผ่าน Calendar Tools)
                        if (f.type === "date_range") {
                          return (
                            <div key={f.id} className={`${styles.inputGroup} ${styles.fullWidth}`}>
                              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.3rem" }}>
                                <label className={styles.label} style={{ marginBottom: 0 }}>
                                  {iconDisplay}{fieldLabel} {f.required && <span style={{ color: "#ef4444" }}>*</span>}
                                </label>
                                {roleBadge}
                              </div>
                              <DateRangePickerInput
                                value={val}
                                lang={itemLangTab}
                                onChange={(newRange) => {
                                  setCustomFieldValue(f.id, newRange);
                                  setCustomFieldValue(`${f.id}_th`, newRange);
                                }}
                              />
                            </div>
                          );
                        }

                        // 7. ADDRESS & OTHER TEXT FIELDS
                        let placeholderText = `กรอก ${fieldLabel}`;
                        if (f.type === "address") placeholderText = itemLangTab === "th" ? "เช่น จ.ปทุมธานี หรือ มทร.ธัญบุรี" : "e.g. Bangkok, Thailand";

                        return (
                          <div key={f.id} className={styles.inputGroup}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.3rem" }}>
                              <label className={styles.label} style={{ marginBottom: 0 }}>
                                {iconDisplay}{fieldLabel} {f.required && <span style={{ color: "#ef4444" }}>*</span>}
                              </label>
                              {roleBadge}
                            </div>
                            <input
                              type="text"
                              value={val}
                              onChange={(e) => {
                                setCustomFieldValue(activeKey, e.target.value);
                              }}
                              className={styles.input}
                              placeholder={placeholderText}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "0.75rem",
                  marginTop: "1rem",
                }}
              >
                <button
                  type="button"
                  onClick={() => setShowItemModal(false)}
                  className={`${styles.actionBtn} ${styles.btnSecondary}`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className={styles.actionBtn}
                >
                  {saving ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Save size={16} />
                  )}
                  <span>Save Entry</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SECTION EDIT MODAL (Dual Language Popup Window) */}
      {showSectionModal && editingSection && (
        <div
          className={styles.modalOverlay}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowSectionModal(false);
              setEditingSection(null);
            }
          }}
        >
          <div className={styles.modalCard}>
            <div className={styles.modalHeader}>
              <div>
                <h3 className={styles.modalTitle}>
                  Edit Section ({editingSection.isSystem ? "Default Section" : "Custom Section"})
                </h3>
                <p className={styles.modalSubtitle}>
                  Update the section name and description in both English and Thai.
                </p>
              </div>
              <button
                onClick={() => {
                  setShowSectionModal(false);
                  setEditingSection(null);
                }}
                className={styles.modalCloseBtn}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveSection} className={styles.modalForm}>
              {/* Section Icon Selection */}
              <div style={{ background: "var(--bg-secondary)", padding: "1.25rem", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)", marginBottom: "0.5rem" }}>
                <SectionIconSelector
                  value={editingSection.icon || "📚"}
                  onChange={(ic) => setEditingSection({ ...editingSection, icon: ic })}
                />
              </div>

              {/* EN Block */}
              <div className={`${styles.langBlock} ${styles.langBlockEn}`}>
                <div className={styles.langBlockHeader}>
                  <span style={{ fontSize: "1.2rem" }}>🇬🇧</span>
                  <h4 className={styles.langBlockTitle}>English Section Information</h4>
                  <span className={styles.langTag}>EN</span>
                </div>

                <div className={styles.formGrid}>
                  <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                    <label className={styles.label}>Section Title (EN) *</label>
                    <input
                      type="text"
                      required
                      value={editingSection.title}
                      onChange={(e) =>
                        setEditingSection({ ...editingSection, title: e.target.value })
                      }
                      className={styles.input}
                      placeholder="e.g. Educational Background, Work Experience"
                    />
                  </div>

                  <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                    <label className={styles.label}>Description / Subtitle (EN)</label>
                    <textarea
                      value={editingSection.description || ""}
                      onChange={(e) =>
                        setEditingSection({
                          ...editingSection,
                          description: e.target.value,
                        })
                      }
                      className={styles.textarea}
                      placeholder="Brief overview or description for this section in English."
                      rows={2}
                    />
                  </div>
                </div>
              </div>

              {/* TH Block */}
              <div className={`${styles.langBlock} ${styles.langBlockTh}`}>
                <div className={styles.langBlockHeader}>
                  <span style={{ fontSize: "1.2rem" }}>🇹🇭</span>
                  <h4 className={styles.langBlockTitle}>ข้อมูลหมวดหมู่ภาษาไทย (Thai Section Information)</h4>
                  <span className={styles.langTag}>TH</span>
                </div>

                <div className={styles.formGrid}>
                  <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                    <label className={styles.label}>ชื่อหมวดหมู่ภาษาไทย (TH)</label>
                    <input
                      type="text"
                      value={editingSection.titleTh || ""}
                      onChange={(e) =>
                        setEditingSection({ ...editingSection, titleTh: e.target.value })
                      }
                      className={styles.input}
                      placeholder="เช่น ประวัติการศึกษา, ประสบการณ์การทำงาน"
                    />
                  </div>

                  <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                    <label className={styles.label}>คำอธิบาย / รายละเอียดย่อ (TH)</label>
                    <textarea
                      value={editingSection.descriptionTh || ""}
                      onChange={(e) =>
                        setEditingSection({
                          ...editingSection,
                          descriptionTh: e.target.value,
                        })
                      }
                      className={styles.textarea}
                      placeholder="คำอธิบายสรุปสำหรับหมวดหมู่นี้ในภาษาไทย"
                      rows={2}
                    />
                  </div>
                </div>
              </div>

              {/* Custom Fields Builder for Editing Section */}
              {(() => {
                let editingFields: CustomFieldDef[] = [];
                try {
                  editingFields = editingSection.customFields
                    ? JSON.parse(editingSection.customFields)
                    : [];
                } catch {
                  editingFields = [];
                }

                const setEditingFields = (fields: CustomFieldDef[]) => {
                  setEditingSection({
                    ...editingSection,
                    customFields: JSON.stringify(fields),
                  });
                };

                return (
                  <div style={{ marginTop: "1rem" }}>
                    <SectionFieldsBuilder
                      fields={editingFields}
                      onChange={setEditingFields}
                    />
                  </div>
                );
              })()}

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "0.75rem",
                  marginTop: "1rem",
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    setShowSectionModal(false);
                    setEditingSection(null);
                  }}
                  className={`${styles.actionBtn} ${styles.btnSecondary}`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className={styles.actionBtn}
                >
                  {saving ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Save size={16} />
                  )}
                  <span>Save Section</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* JSON Key Import Modal */}
      {showJsonPasteModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.75)",
            backdropFilter: "blur(4px)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1.5rem",
          }}
          onClick={() => setShowJsonPasteModal(false)}
        >
          <div
            style={{
              background: "var(--bg-elevated)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-lg)",
              maxWidth: "600px",
              width: "100%",
              padding: "1.5rem",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.5)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
              <Key size={20} color="var(--primary)" />
              <h3 style={{ fontSize: "1.15rem", fontWeight: 700, margin: 0 }}>
                วางเนื้อหาไฟล์ Service Account JSON
              </h3>
            </div>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "1rem" }}>
              เปิดไฟล์คีย์ <code>.json</code> ที่ดาวน์โหลดจาก Google Cloud Console คัดลอกเนื้อหาทั้งหมดมาวางในช่องด้านล่าง ระบบจะดึงค่า Client Email และ Private Key ให้อัตโนมัติ:
            </p>
            <textarea
              rows={8}
              value={pastedJsonText}
              onChange={(e) => setPastedJsonText(e.target.value)}
              placeholder='{\n  "type": "service_account",\n  "project_id": "...",\n  "private_key_id": "...",\n  "private_key": "-----BEGIN PRIVATE KEY-----\\n...",\n  "client_email": "...@...iam.gserviceaccount.com"\n}'
              className={styles.textarea}
              style={{ fontFamily: "monospace", fontSize: "0.78rem" }}
            />
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1.25rem" }}>
              <button
                type="button"
                onClick={() => {
                  setShowJsonPasteModal(false);
                  setPastedJsonText("");
                }}
                className={`${styles.actionBtn} ${styles.btnSecondary}`}
              >
                ยกเลิก (Cancel)
              </button>
              <button
                type="button"
                onClick={handlePasteJsonConfirm}
                className={styles.actionBtn}
              >
                นำเข้าข้อมูล (Import Key)
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
