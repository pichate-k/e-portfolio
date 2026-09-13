"use client";

import React, { useState, useEffect } from "react";
import {
  Folder,
  Plus,
  Edit2,
  Trash2,
  ExternalLink,
  Eye,
  EyeOff,
  Calendar,
  MapPin,
  Image as ImageIcon,
  Save,
  X,
  Loader2,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Search,
} from "lucide-react";
import { GalleryActivityItem } from "../gallery/GalleryLanding";
import styles from "./GalleryManager.module.css";

interface GalleryManagerProps {
  onNotify?: (msg: { type: "success" | "error"; text: string }) => void;
}

export const GalleryManager: React.FC<GalleryManagerProps> = ({ onNotify }) => {
  const [activities, setActivities] = useState<GalleryActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testingDrive, setTestingDrive] = useState(false);
  const [driveTestResult, setDriveTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  // Modal State
  const [editingActivity, setEditingActivity] = useState<Partial<GalleryActivityItem> | null>(null);
  const [isNew, setIsNew] = useState(false);

  // Fetch activities
  const fetchActivities = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/gallery");
      const data = await res.json();
      if (data.success && data.activities) {
        setActivities(data.activities);
      } else {
        onNotify?.({ type: "error", text: data.error || "Failed to load activities" });
      }
    } catch (err: any) {
      onNotify?.({ type: "error", text: err.message || "Network error loading activities" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingActivity({
      title: "",
      titleTh: "",
      slug: "",
      eventDate: "15 มกราคม 2568",
      location: "Faculty of Engineering, RMUTT",
      locationTh: "คณะวิศวกรรมศาสตร์ มหาวิทยาลัยเทคโนโลยีราชมงคลธัญบุรี",
      category: "Workshop",
      coverImageUrl: "",
      driveFolderId: "",
      description: "",
      descriptionTh: "",
      isVisible: true,
      photoCount: 0,
    });
    setIsNew(true);
    setDriveTestResult(null);
  };

  // Open Edit Modal
  const handleOpenEdit = (act: GalleryActivityItem) => {
    setEditingActivity({ ...act });
    setIsNew(false);
    setDriveTestResult(null);
  };

  // Test Drive Folder Connection
  const handleTestDriveFolder = async () => {
    if (!editingActivity?.driveFolderId?.trim()) {
      setDriveTestResult({
        success: false,
        message: "กรุณาระบุ Google Drive Folder ID หรือ Folder Link ก่อนทดสอบ",
      });
      return;
    }

    setTestingDrive(true);
    setDriveTestResult(null);

    try {
      const res = await fetch("/api/admin/google-drive/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folderId: editingActivity.driveFolderId }),
      });

      const data = await res.json();
      if (data.success) {
        setDriveTestResult({
          success: true,
          message: data.message || `เชื่อมต่อสำเร็จ! โฟลเดอร์ "${data.folderName}"`,
        });
      } else {
        setDriveTestResult({
          success: false,
          message: data.message || "ไม่สามารถเข้าถึงโฟลเดอร์ Google Drive ได้",
        });
      }
    } catch (err: any) {
      setDriveTestResult({
        success: false,
        message: err.message || "เกิดข้อผิดพลาดในการทดสอบ Google Drive",
      });
    } finally {
      setTestingDrive(false);
    }
  };

  // Save Activity
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingActivity) return;

    if (!editingActivity.title?.trim()) {
      onNotify?.({ type: "error", text: "กรุณากรอกชื่อกิจกรรม (Title EN)" });
      return;
    }
    if (!editingActivity.eventDate?.trim()) {
      onNotify?.({ type: "error", text: "กรุณากรอกวันที่จัดกิจกรรม (Event Date)" });
      return;
    }
    if (!editingActivity.driveFolderId?.trim()) {
      onNotify?.({ type: "error", text: "กรุณาระบุ Google Drive Folder ID" });
      return;
    }

    setSaving(true);
    try {
      const url = isNew
        ? "/api/admin/gallery"
        : `/api/admin/gallery/${editingActivity.id}`;
      const method = isNew ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingActivity),
      });

      const data = await res.json();
      if (data.success) {
        onNotify?.({
          type: "success",
          text: isNew
            ? `สร้างกิจกรรม "${data.activity.title}" เรียบร้อยแล้ว!`
            : `บันทึกการแก้ไขกิจกรรม "${data.activity.title}" สำเร็จ!`,
        });
        setEditingActivity(null);
        await fetchActivities();
      } else {
        onNotify?.({ type: "error", text: data.error || "Failed to save activity" });
      }
    } catch (err: any) {
      onNotify?.({ type: "error", text: err.message || "Network error" });
    } finally {
      setSaving(false);
    }
  };

  // Toggle Visibility
  const handleToggleVisibility = async (act: GalleryActivityItem) => {
    try {
      const res = await fetch(`/api/admin/gallery/${act.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isVisible: !act.isVisible }),
      });
      const data = await res.json();
      if (data.success) {
        onNotify?.({
          type: "success",
          text: act.isVisible
            ? `ซ่อนกิจกรรม "${act.title}" แล้ว`
            : `เปิดแสดงกิจกรรม "${act.title}" แล้ว`,
        });
        await fetchActivities();
      }
    } catch (err: any) {
      onNotify?.({ type: "error", text: err.message });
    }
  };

  // Delete Activity
  const handleDelete = async (act: GalleryActivityItem) => {
    if (!confirm(`ต้องการลบกิจกรรม "${act.title}" ใช่หรือไม่?`)) return;

    try {
      const res = await fetch(`/api/admin/gallery/${act.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        onNotify?.({ type: "success", text: "ลบกิจกรรมเรียบร้อยแล้ว" });
        await fetchActivities();
      } else {
        onNotify?.({ type: "error", text: data.error || "Failed to delete" });
      }
    } catch (err: any) {
      onNotify?.({ type: "error", text: err.message });
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "50px", textAlign: "center", color: "var(--muted-foreground)" }}>
        <Loader2 size={28} className="animate-spin" style={{ margin: "0 auto 12px auto" }} />
        <p>Loading Activity Gallery...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header Row */}
      <div className={styles.headerRow}>
        <div>
          <h2 className={styles.headerTitle}>Activity Gallery & Google Drive Folders</h2>
          <p className={styles.headerDesc}>
            Manage activity albums, cover images, and Google Drive folder IDs for public photo showcase.
          </p>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <a
            href="/gallery"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.btnSecondary}
          >
            <ExternalLink size={14} />
            <span>View Public Gallery</span>
          </a>

          <button
            type="button"
            onClick={handleOpenCreate}
            className={styles.btnPrimary}
          >
            <Plus size={16} />
            <span>Add New Activity</span>
          </button>
        </div>
      </div>

      {/* Activities Grid */}
      {activities.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px", background: "var(--bg-card)", borderRadius: "var(--radius-lg)", border: "1px dashed var(--border-strong)" }}>
          <Folder size={40} style={{ margin: "0 auto 12px auto", opacity: 0.4, color: "var(--text-muted)" }} />
          <p style={{ fontSize: 16, fontWeight: 600, margin: "0 0 6px", color: "var(--text-primary)" }}>No activities added yet</p>
          <p style={{ fontSize: 13, color: "var(--text-muted)", margin: "0 0 16px" }}>
            Create an activity and link a Google Drive folder ID to showcase photos.
          </p>
          <button type="button" onClick={handleOpenCreate} className={styles.btnPrimary}>
            <Plus size={14} /> Add First Activity
          </button>
        </div>
      ) : (
        <div className={styles.activitiesGrid}>
          {activities.map((act) => {
            const coverImage =
              act.coverImageUrl ||
              "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80";

            return (
              <div key={act.id} className={styles.activityCard}>
                <div className={styles.cardCoverMedia}>
                  <img src={coverImage} alt={act.title} className={styles.cardCoverImg} />
                  <span className={styles.cardCoverBadge}>{act.category || "Workshop"}</span>
                  <span
                    className={`${styles.cardStatusBadge} ${
                      act.isVisible ? styles.statusVisible : styles.statusHidden
                    }`}
                  >
                    {act.isVisible ? "Visible" : "Hidden"}
                  </span>
                </div>

                <div className={styles.cardBody}>
                  <div>
                    <h3 className={styles.cardTitle}>{act.title}</h3>
                    {act.titleTh && (
                      <p style={{ fontSize: 12.5, color: "var(--text-muted)", margin: "4px 0 0" }}>
                        {act.titleTh}
                      </p>
                    )}

                    <div className={styles.cardMetaRow} style={{ marginTop: 10 }}>
                      <div className={styles.metaItem}>
                        <Calendar size={13} color="var(--primary)" />
                        <span>{act.eventDate}</span>
                      </div>

                      {act.location && (
                        <div className={styles.metaItem}>
                          <MapPin size={13} color="var(--primary)" />
                          <span>{act.location}</span>
                        </div>
                      )}

                      <div className={styles.metaItem}>
                        <Folder size={13} color="#f59e0b" />
                        <span style={{ fontFamily: "monospace" }}>
                          Drive: {act.driveFolderId.slice(0, 16)}...
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.cardActionsRow}>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button
                        type="button"
                        onClick={() => handleToggleVisibility(act)}
                        className={styles.actionIconBtn}
                        title={act.isVisible ? "Hide from public" : "Show to public"}
                      >
                        {act.isVisible ? <Eye size={14} /> : <EyeOff size={14} color="#ef4444" />}
                      </button>

                      <a
                        href={`/gallery/${act.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.actionIconBtn}
                        title="View photo album page"
                      >
                        <ExternalLink size={14} />
                      </a>
                    </div>

                    <div style={{ display: "flex", gap: 6 }}>
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(act)}
                        className={styles.actionIconBtn}
                        title="Edit activity"
                      >
                        <Edit2 size={14} />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(act)}
                        className={`${styles.actionIconBtn} ${styles.btnDanger}`}
                        title="Delete activity"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* =================================================================== */}
      {/* ADD / EDIT ACTIVITY MODAL */}
      {/* =================================================================== */}
      {editingActivity && (
        <div
          className={styles.modalOverlay}
          onClick={(e) => {
            if (e.target === e.currentTarget) setEditingActivity(null);
          }}
        >
          <div className={styles.modalDialog}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>
                {isNew ? "Add New Activity" : `Edit Activity: ${editingActivity.title}`}
              </h3>
              <button
                type="button"
                onClick={() => setEditingActivity(null)}
                className={styles.modalCloseBtn}
                title="Close modal"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSave} className={styles.modalForm}>
              <div className={styles.formGrid}>
                <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                  <label className={styles.label}>Activity Title (EN) *</label>
                  <input
                    type="text"
                    required
                    value={editingActivity.title || ""}
                    onChange={(e) =>
                      setEditingActivity({ ...editingActivity, title: e.target.value })
                    }
                    className={styles.input}
                    placeholder="e.g. Advanced Edge AI & Robotics Workshop 2025"
                  />
                </div>

                <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                  <label className={styles.label}>ชื่อกิจกรรม ภาษาไทย (TH)</label>
                  <input
                    type="text"
                    value={editingActivity.titleTh || ""}
                    onChange={(e) =>
                      setEditingActivity({ ...editingActivity, titleTh: e.target.value })
                    }
                    className={styles.input}
                    placeholder="เช่น การอบรมเชิงปฏิบัติการระบบปัญญาประดิษฐ์และสมองกลฝังตัว 2568"
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.label}>Event Date (วันที่จัดกิจกรรม) *</label>
                  <input
                    type="text"
                    required
                    value={editingActivity.eventDate || ""}
                    onChange={(e) =>
                      setEditingActivity({ ...editingActivity, eventDate: e.target.value })
                    }
                    className={styles.input}
                    placeholder="e.g. 15-18 มกราคม 2568 หรือ January 15-18, 2025"
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.label}>Category (หมวดหมู่)</label>
                  <select
                    value={editingActivity.category || "Workshop"}
                    onChange={(e) =>
                      setEditingActivity({ ...editingActivity, category: e.target.value })
                    }
                    className={styles.select}
                  >
                    <option value="Workshop">Workshop (การอบรมเชิงปฏิบัติการ)</option>
                    <option value="Conference">Conference (การประชุมวิชาการ)</option>
                    <option value="Research">Research (งานวิจัยและนวัตกรรม)</option>
                    <option value="Exhibition">Exhibition (นิทรรศการ)</option>
                    <option value="Keynote">Keynote / Invited Speaker (บรรยายพิเศษ)</option>
                    <option value="Activity">Special Activity (กิจกรรมพิเศษ)</option>
                  </select>
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.label}>Location (EN)</label>
                  <input
                    type="text"
                    value={editingActivity.location || ""}
                    onChange={(e) =>
                      setEditingActivity({ ...editingActivity, location: e.target.value })
                    }
                    className={styles.input}
                    placeholder="e.g. BITEC Bangna, Bangkok"
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.label}>สถานที่จัดกิจกรรม (TH)</label>
                  <input
                    type="text"
                    value={editingActivity.locationTh || ""}
                    onChange={(e) =>
                      setEditingActivity({ ...editingActivity, locationTh: e.target.value })
                    }
                    className={styles.input}
                    placeholder="เช่น ศูนย์นิทรรศการและการประชุมไบเทค บางนา"
                  />
                </div>

                {/* Google Drive Folder ID / Link */}
                <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                  <label className={styles.label}>
                    Google Drive Folder ID หรือ Folder Link *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingActivity.driveFolderId || ""}
                    onChange={(e) =>
                      setEditingActivity({ ...editingActivity, driveFolderId: e.target.value })
                    }
                    className={styles.input}
                    placeholder="e.g. 1a2b3c... หรือ https://drive.google.com/drive/folders/..."
                  />

                  <div className={styles.testConnectionRow}>
                    <button
                      type="button"
                      onClick={handleTestDriveFolder}
                      disabled={testingDrive}
                      className={styles.btnSecondary}
                      style={{ fontSize: 11.5, padding: "5px 12px" }}
                    >
                      {testingDrive ? (
                        <Loader2 size={13} className="animate-spin" />
                      ) : (
                        <Sparkles size={13} color="var(--primary)" />
                      )}
                      <span>{testingDrive ? "Checking Drive..." : "Test Drive Folder"}</span>
                    </button>

                    {driveTestResult && (
                      <span
                        className={`${styles.testResultBadge} ${
                          driveTestResult.success ? styles.testSuccess : styles.testError
                        }`}
                      >
                        {driveTestResult.success ? (
                          <CheckCircle size={12} style={{ verticalAlign: "middle", marginRight: 4 }} />
                        ) : (
                          <AlertCircle size={12} style={{ verticalAlign: "middle", marginRight: 4 }} />
                        )}
                        {driveTestResult.message}
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: 11.5, color: "var(--text-muted)" }}>
                    Make sure the Google Drive folder is shared with your Service Account email or set to Anyone with the link can view.
                  </span>
                </div>

                {/* Cover Image URL */}
                <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                  <label className={styles.label}>Cover Image URL (ภาพปก)</label>
                  <input
                    type="text"
                    value={editingActivity.coverImageUrl || ""}
                    onChange={(e) =>
                      setEditingActivity({ ...editingActivity, coverImageUrl: e.target.value })
                    }
                    className={styles.input}
                    placeholder="https://... (Optional: If empty, first photo in Drive is used)"
                  />
                </div>

                {/* Description EN */}
                <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                  <label className={styles.label}>Description (EN)</label>
                  <textarea
                    value={editingActivity.description || ""}
                    onChange={(e) =>
                      setEditingActivity({ ...editingActivity, description: e.target.value })
                    }
                    className={styles.textarea}
                    placeholder="Brief description of the activity and outcomes..."
                  />
                </div>

                {/* Description TH */}
                <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                  <label className={styles.label}>คำอธิบายกิจกรรม (TH)</label>
                  <textarea
                    value={editingActivity.descriptionTh || ""}
                    onChange={(e) =>
                      setEditingActivity({ ...editingActivity, descriptionTh: e.target.value })
                    }
                    className={styles.textarea}
                    placeholder="บทสรุปภาพรวมของกิจกรรม..."
                  />
                </div>

                {/* Visibility checkbox */}
                <div className={styles.fullWidth} style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 4 }}>
                  <input
                    type="checkbox"
                    id="isVisibleCheck"
                    checked={editingActivity.isVisible ?? true}
                    onChange={(e) =>
                      setEditingActivity({ ...editingActivity, isVisible: e.target.checked })
                    }
                    style={{ width: 18, height: 18, cursor: "pointer", accentColor: "var(--primary)" }}
                  />
                  <label htmlFor="isVisibleCheck" style={{ fontSize: 13, cursor: "pointer", userSelect: "none", color: "var(--text-primary)", fontWeight: 500 }}>
                    แสดงกิจกรรมนี้ในหน้า Gallery สาธารณะ (Visible to public)
                  </label>
                </div>
              </div>

              <div className={styles.modalFooter}>
                <button
                  type="button"
                  onClick={() => setEditingActivity(null)}
                  className={styles.btnSecondary}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className={styles.btnPrimary}
                >
                  {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                  <span>{saving ? "Saving..." : isNew ? "Create Activity" : "Save Changes"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
