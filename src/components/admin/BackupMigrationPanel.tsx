"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Database,
  Download,
  Upload,
  CheckCircle2,
  AlertTriangle,
  FileJson,
  Layers,
  FileText,
  CreditCard,
  User,
  Loader2,
  RefreshCw,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import styles from "./BackupMigrationPanel.module.css";

interface BackupMigrationPanelProps {
  onNotify?: (msg: { type: "success" | "error"; text: string }) => void;
  onRefreshAll?: () => void;
}

interface ParsedBackupInfo {
  filename: string;
  version: string;
  exportedAt: string;
  sectionsCount: number;
  itemsCount: number;
  namecardsCount: number;
  rawPayload: any;
}

export const BackupMigrationPanel: React.FC<BackupMigrationPanelProps> = ({
  onNotify,
  onRefreshAll,
}) => {
  const [downloading, setDownloading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [parsedBackup, setParsedBackup] = useState<ParsedBackupInfo | null>(null);
  const [importMode, setImportMode] = useState<"merge" | "replace">("merge");
  const [confirmReplace, setConfirmReplace] = useState(false);

  // Live stats from system
  const [stats, setStats] = useState<{
    sectionsCount: number;
    itemsCount: number;
    namecardsCount: number;
    hasProfile: boolean;
  }>({
    sectionsCount: 0,
    itemsCount: 0,
    namecardsCount: 0,
    hasProfile: false,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch current live database counts
  const loadStats = async () => {
    try {
      const [secRes, cardRes, profRes] = await Promise.all([
        fetch("/api/admin/sections"),
        fetch("/api/admin/namecards"),
        fetch("/api/admin/profile"),
      ]);

      const secData = await secRes.json();
      const cardData = await cardRes.json();
      const profData = await profRes.json();

      let items = 0;
      if (secData.success && Array.isArray(secData.sections)) {
        items = secData.sections.reduce(
          (acc: number, s: any) => acc + (s.items?.length || 0),
          0
        );
      }

      setStats({
        sectionsCount: secData.sections?.length || 0,
        itemsCount: items,
        namecardsCount: cardData.cards?.length || 0,
        hasProfile: Boolean(profData.profile?.fullName),
      });
    } catch {
      // Ignore background stats failure
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  // 1. Handle Export
  const handleExportBackup = async () => {
    setDownloading(true);
    try {
      const res = await fetch("/api/admin/backup/export");
      if (!res.ok) {
        throw new Error("Failed to export backup data");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      const dateStr = new Date().toISOString().split("T")[0];
      link.href = url;
      link.download = `portfolio-backup-${dateStr}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      onNotify?.({
        type: "success",
        text: "ส่งออกไฟล์สำรองข้อมูล (.json) สำเร็จเรียบร้อย!",
      });
    } catch (err: any) {
      onNotify?.({
        type: "error",
        text: err.message || "เกิดข้อผิดพลาดในการดาวน์โหลดไฟล์สำรองข้อมูล",
      });
    } finally {
      setDownloading(false);
    }
  };

  // 2. Process file selection
  const processFile = (file: File) => {
    if (!file.name.endsWith(".json")) {
      onNotify?.({ type: "error", text: "กรุณาเลือกไฟล์สำรองข้อมูลนามสกุล .json เท่านั้น" });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const parsed = JSON.parse(text);

        const data = parsed.data || parsed;
        const sections = Array.isArray(data.sections) ? data.sections : [];
        const itemsCount = sections.reduce(
          (acc: number, s: any) => acc + (Array.isArray(s.items) ? s.items.length : 0),
          0
        );
        const namecards = Array.isArray(data.namecards) ? data.namecards : [];

        setParsedBackup({
          filename: file.name,
          version: parsed.version || "1.0",
          exportedAt: parsed.exportedAt || "Unknown date",
          sectionsCount: sections.length,
          itemsCount,
          namecardsCount: namecards.length,
          rawPayload: data,
        });

        onNotify?.({
          type: "success",
          text: `ตรวจสอบไฟล์ "${file.name}" สำเร็จ พร้อมสำหรับการกู้คืน/ย้ายระบบ`,
        });
      } catch (err) {
        onNotify?.({ type: "error", text: "ไฟล์ JSON ไม่ถูกต้อง หรือโครงสร้างข้อมูลเสียหาย" });
      }
    };
    reader.readAsText(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => {
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  // 3. Handle Import / Restore
  const handleExecuteImport = async () => {
    if (!parsedBackup) return;

    if (importMode === "replace" && !confirmReplace) {
      onNotify?.({
        type: "error",
        text: "กรุณาทำเครื่องหมายยินยอมเพื่อยืนยันการกู้คืนแบบทับข้อมูลเดิมทั้งหมด",
      });
      return;
    }

    setImporting(true);
    try {
      const res = await fetch("/api/admin/backup/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: importMode,
          data: parsedBackup.rawPayload,
        }),
      });

      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.error || result.details || "Import failed");
      }

      onNotify?.({
        type: "success",
        text: `กู้คืนข้อมูลสำเร็จ! (${result.restored.sectionsCount} Sections, ${result.restored.itemsCount} Items, ${result.restored.namecardsCount} Namecards)`,
      });

      setParsedBackup(null);
      setConfirmReplace(false);
      if (fileInputRef.current) fileInputRef.current.value = "";

      // Refresh stats & reload system data
      await loadStats();
      onRefreshAll?.();
    } catch (err: any) {
      onNotify?.({
        type: "error",
        text: err.message || "เกิดข้อผิดพลาดในการนำเข้าข้อมูล",
      });
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.headerRow}>
        <div>
          <h2 className={styles.headerTitle}>
            Data Backup & Migration (ระบบสำรองข้อมูลและย้ายระบบ)
          </h2>
          <p className={styles.headerDesc}>
            ส่งออกข้อมูลทั้งหมดเป็นไฟล์ JSON เพื่อการสำรองข้อมูลที่สมบูรณ์ 100%
            หรือนำเข้าเพื่อย้ายระบบขึ้นโฮสติ้งใหม่/กู้คืนข้อมูลเดิม
          </p>
        </div>

        <button
          type="button"
          onClick={loadStats}
          className={styles.btnSecondary}
          title="รีเฟรชสถิติข้อมูล"
        >
          <RefreshCw size={14} />
          <span>รีเฟรชสถานะ</span>
        </button>
      </div>

      {/* Live Database Overview */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIconBox}>
            <User size={20} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>
              {stats.hasProfile ? "พร้อมใช้งาน" : "ยังไม่มีข้อมูล"}
            </span>
            <span className={styles.statLabel}>Personal Profile (TH/EN)</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIconBox}>
            <Layers size={20} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{stats.sectionsCount}</span>
            <span className={styles.statLabel}>CV Sections (หมวดหมู่)</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIconBox}>
            <FileText size={20} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{stats.itemsCount}</span>
            <span className={styles.statLabel}>Content Items (รายการผลงาน)</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIconBox}>
            <CreditCard size={20} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{stats.namecardsCount}</span>
            <span className={styles.statLabel}>Digital Namecards (นามบัตร)</span>
          </div>
        </div>
      </div>

      {/* 2-Column Panels: Export vs Import */}
      <div className={styles.panelsGrid}>
        {/* PANEL 1: EXPORT (สำรองข้อมูล) */}
        <div className={styles.panelCard}>
          <div className={styles.panelHeader}>
            <Download size={18} color="var(--primary)" />
            <h3 className={styles.panelTitle}>1. ส่งออกข้อมูลสำรอง (Export Backup)</h3>
          </div>

          <p className={styles.panelDesc}>
            ดาวน์โหลด Snapshot ข้อมูลทั้งหมดของระบบเป็นไฟล์ <code>.json</code> ฉบับเดียว
            มีโครงสร้างครบถ้วนสำหรับนำไปสำรองหรือย้ายไปยังเซิร์ฟเวอร์/ฐานข้อมูลใหม่
          </p>

          <div className={styles.featureList}>
            <div className={styles.featureItem}>
              <CheckCircle2 size={14} className={styles.featureIcon} />
              <span>ข้อมูลประวัติส่วนตัว 2 ภาษา (Profile TH/EN & Bio)</span>
            </div>
            <div className={styles.featureItem}>
              <CheckCircle2 size={14} className={styles.featureIcon} />
              <span>
                โครงสร้างหมวดหมู่ CV ทุก Section ({stats.sectionsCount}) พร้อม Custom Fields
              </span>
            </div>
            <div className={styles.featureItem}>
              <CheckCircle2 size={14} className={styles.featureIcon} />
              <span>รายการผลงานทุกชิ้น ({stats.itemsCount}) พร้อมวันที่และไฟล์แนบ</span>
            </div>
            <div className={styles.featureItem}>
              <CheckCircle2 size={14} className={styles.featureIcon} />
              <span>นามบัตรดิจิทัลทุกใบ ({stats.namecardsCount}) พร้อมเทมเพลตและ QR Code</span>
            </div>
            <div className={styles.featureItem}>
              <CheckCircle2 size={14} className={styles.featureIcon} />
              <span>การตั้งค่าระบบและ Export Config ทั้งหมด</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleExportBackup}
            disabled={downloading}
            className={styles.btnPrimary}
          >
            {downloading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>กำลังสร้างไฟล์สำรองข้อมูล...</span>
              </>
            ) : (
              <>
                <Download size={16} />
                <span>ดาวน์โหลดไฟล์สำรองข้อมูล (.json)</span>
              </>
            )}
          </button>
        </div>

        {/* PANEL 2: IMPORT & RESTORE (นำเข้าและย้ายระบบ) */}
        <div className={styles.panelCard}>
          <div className={styles.panelHeader}>
            <Upload size={18} color="var(--primary)" />
            <h3 className={styles.panelTitle}>2. นำเข้าข้อมูล / ย้ายระบบ (Import & Restore)</h3>
          </div>

          <p className={styles.panelDesc}>
            เลือกไฟล์สำรองข้อมูล <code>.json</code> ที่ส่งออกจากระบบ เพื่อกู้คืนข้อมูลเดิม
            หรือผสานข้อมูลเพิ่มเติมเข้าสู่ฐานข้อมูลปัจจุบัน
          </p>

          {/* Drag & Drop Zone */}
          {!parsedBackup && (
            <div
              className={`${styles.dropzone} ${dragActive ? styles.dropzoneActive : ""}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className={styles.dropzoneIcon}>
                <FileJson size={24} />
              </div>
              <div>
                <p className={styles.dropzoneTitle}>
                  ลากไฟล์ .json มาวางที่นี่ หรือคลิกเพื่อเลือกไฟล์
                </p>
                <p className={styles.dropzoneSub}>
                  รองรับไฟล์สำรองข้อมูลที่ส่งออกจากระบบนี้
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                onChange={handleFileChange}
                style={{ display: "none" }}
              />
            </div>
          )}

          {/* Backup File Preview */}
          {parsedBackup && (
            <div className={styles.filePreview}>
              <div className={styles.filePreviewTop}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <FileJson size={18} color="var(--primary)" />
                  <span className={styles.fileName}>{parsedBackup.filename}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setParsedBackup(null);
                    setConfirmReplace(false);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                  className={styles.btnSecondary}
                  style={{ padding: "3px 8px", fontSize: 11 }}
                >
                  เปลี่ยนไฟล์
                </button>
              </div>

              <div className={styles.filePills}>
                <span className={styles.filePill}>
                  {parsedBackup.sectionsCount} Sections
                </span>
                <span className={styles.filePill}>
                  {parsedBackup.itemsCount} Items
                </span>
                <span className={styles.filePill}>
                  {parsedBackup.namecardsCount} Namecards
                </span>
                <span className={styles.filePill}>
                  สำรองเมื่อ: {new Date(parsedBackup.exportedAt).toLocaleDateString("th-TH")}
                </span>
              </div>

              {/* Mode Selection */}
              <div className={styles.modeRadioGroup} style={{ marginTop: 6 }}>
                <label
                  className={`${styles.modeOption} ${
                    importMode === "merge" ? styles.modeOptionActive : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="importMode"
                    value="merge"
                    checked={importMode === "merge"}
                    onChange={() => setImportMode("merge")}
                  />
                  <div className={styles.modeText}>
                    <span className={styles.modeTitle}>
                      Merge / Update (ผสานข้อมูล - แนะนำ)
                    </span>
                    <span className={styles.modeDesc}>
                      อัปเดตและเพิ่มข้อมูลใหม่ โดยไม่ลบรายการเดิมที่อยู่นอกเหนือไฟล์
                    </span>
                  </div>
                </label>

                <label
                  className={`${styles.modeOption} ${
                    importMode === "replace" ? styles.modeOptionActive : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="importMode"
                    value="replace"
                    checked={importMode === "replace"}
                    onChange={() => setImportMode("replace")}
                  />
                  <div className={styles.modeText}>
                    <span className={styles.modeTitle}>
                      Clean Restore (กู้คืนทับทั้งหมด)
                    </span>
                    <span className={styles.modeDesc}>
                      ล้างข้อมูลเดิมและแทนที่ด้วยข้อมูลจากไฟล์สำรอง 100% เหมาะสำหรับการย้ายระบบใหม่
                    </span>
                  </div>
                </label>
              </div>

              {/* Confirmation check for Replace mode */}
              {importMode === "replace" && (
                <label className={styles.confirmBox}>
                  <input
                    type="checkbox"
                    checked={confirmReplace}
                    onChange={(e) => setConfirmReplace(e.target.checked)}
                  />
                  <span>
                    ฉันเข้าใจว่าข้อมูลเดิมทั้งหมดในระบบจะถูกแทนที่ด้วยข้อมูลจากไฟล์นี้
                  </span>
                </label>
              )}

              {/* Execute Import Button */}
              <button
                type="button"
                onClick={handleExecuteImport}
                disabled={importing || (importMode === "replace" && !confirmReplace)}
                className={styles.btnPrimary}
                style={{
                  background:
                    importMode === "replace" ? "#dc2626" : "var(--primary)",
                }}
              >
                {importing ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>กำลังกู้คืนข้อมูลเข้าสู่ฐานข้อมูล...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck size={16} />
                    <span>
                      {importMode === "replace"
                        ? "ยืนยันกู้คืนทับข้อมูลทั้งหมด"
                        : "เริ่มนำเข้าและผสานข้อมูล (Restore)"}
                    </span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
