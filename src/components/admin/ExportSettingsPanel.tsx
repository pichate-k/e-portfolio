"use client";

import React, { useState } from "react";
import {
  FileText,
  Table as TableIcon,
  List as ListIcon,
  Check,
  Download,
  Save,
  Loader2,
  Settings2,
  Eye,
  EyeOff,
} from "lucide-react";
import {
  CvSectionState,
  SectionExportConfig,
  CustomFieldDef,
} from "@/types/customFields";

interface ExportSettingsPanelProps {
  sections: CvSectionState[];
  exportSettings: {
    includeProfile: boolean;
    profileTemplate: "academic" | "modern" | "compact";
    selectedSectionIds: string[];
    sectionConfigs: Record<string, SectionExportConfig>;
  };
  onUpdateExportSettings: (updated: {
    includeProfile: boolean;
    profileTemplate: "academic" | "modern" | "compact";
    selectedSectionIds: string[];
    sectionConfigs: Record<string, SectionExportConfig>;
  }) => void;
  onSave: () => Promise<void>;
  saving: boolean;
  onTestExport: (format: "pdf" | "docx", lang: "en" | "th") => void;
}

export const ExportSettingsPanel: React.FC<ExportSettingsPanelProps> = ({
  sections,
  exportSettings,
  onUpdateExportSettings,
  onSave,
  saving,
  onTestExport,
}) => {
  const [activeSectionConfigId, setActiveSectionConfigId] = useState<string>(
    sections[0]?.id || ""
  );

  // Toggle section selection
  const handleToggleSection = (sectionId: string) => {
    let currentSelected = [...(exportSettings.selectedSectionIds || [])];
    if (currentSelected.length === 0) {
      // If empty, it means all sections were previously included
      currentSelected = sections.map((s) => s.id);
    }

    if (currentSelected.includes(sectionId)) {
      currentSelected = currentSelected.filter((id) => id !== sectionId);
    } else {
      currentSelected.push(sectionId);
    }

    onUpdateExportSettings({
      ...exportSettings,
      selectedSectionIds: currentSelected,
    });
  };

  const handleSelectAllSections = (select: boolean) => {
    onUpdateExportSettings({
      ...exportSettings,
      selectedSectionIds: select ? sections.map((s) => s.id) : [],
    });
  };

  const updateSectionConfig = (
    sectionId: string,
    updates: Partial<SectionExportConfig>
  ) => {
    const existing = exportSettings.sectionConfigs[sectionId] || {
      layout: "list",
      listStyle: "bullet",
      columnsCount: 3,
    };
    onUpdateExportSettings({
      ...exportSettings,
      sectionConfigs: {
        ...exportSettings.sectionConfigs,
        [sectionId]: {
          ...existing,
          ...updates,
        },
      },
    });
  };

  const activeSec = sections.find((s) => s.id === activeSectionConfigId) || sections[0];
  const activeSecConfig =
    (activeSec && exportSettings.sectionConfigs[activeSec.id]) || {
      layout: "list",
      listStyle: "bullet",
      columnsCount: 3,
    };

  // Extract fields for active section
  let activeSecFields: CustomFieldDef[] = [];
  if (activeSec?.customFields) {
    try {
      activeSecFields = JSON.parse(activeSec.customFields);
    } catch {
      activeSecFields = [];
    }
  }

  const isSectionSelected = (sectionId: string) => {
    if (exportSettings.selectedSectionIds.length === 0) return true;
    return exportSettings.selectedSectionIds.includes(sectionId);
  };

  const isFieldHidden = (fieldId: string) => {
    return Boolean(activeSecConfig.hiddenFields && activeSecConfig.hiddenFields.includes(fieldId));
  };

  const toggleFieldVisibility = (fieldId: string) => {
    const currentHidden = activeSecConfig.hiddenFields || [];
    let updatedHidden: string[];
    if (currentHidden.includes(fieldId)) {
      updatedHidden = currentHidden.filter((id) => id !== fieldId);
    } else {
      updatedHidden = [...currentHidden, fieldId];
    }
    updateSectionConfig(activeSec.id, { hiddenFields: updatedHidden });
  };

  const setAllFieldsVisibility = (showAll: boolean) => {
    if (showAll) {
      updateSectionConfig(activeSec.id, { hiddenFields: [] });
    } else {
      const fieldIds =
        activeSecFields.length > 0
          ? activeSecFields.map((f) => f.id)
          : ["f_title", "f_date", "f_sub", "f_desc"];
      updateSectionConfig(activeSec.id, { hiddenFields: fieldIds });
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Header Bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem",
          background: "var(--bg-secondary)",
          padding: "1.25rem 1.5rem",
          borderRadius: "10px",
          border: "1px solid var(--border-subtle)",
        }}
      >
        <div>
          <h2 style={{ fontSize: "1.3rem", fontWeight: 700, color: "var(--text-primary)" }}>
            ⚙️ การตั้งค่าการ Export เอกสาร CV (PDF & Word DOCX)
          </h2>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
            เลือกส่วนที่ต้องการส่งออก, เลือกเทมเพลตข้อมูลส่วนบุคคล, และปรับแต่งรูปแบบตารางหรือลิสต์ของแต่ละหมวดหมู่
          </p>
        </div>

        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.6rem 1.25rem",
            borderRadius: "8px",
            background: "var(--primary)",
            color: "#ffffff",
            border: "none",
            fontWeight: 600,
            fontSize: "0.9rem",
            cursor: "pointer",
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
          }}
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          <span>บันทึกการตั้งค่า (Save Settings)</span>
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.6fr", gap: "1.5rem" }}>
        {/* LEFT COLUMN: Data Subsets Selection & Personal Info Template */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {/* Card 1: Personal Data & Template */}
          <div
            style={{
              background: "var(--bg-secondary)",
              padding: "1.25rem",
              borderRadius: "10px",
              border: "1px solid var(--border-subtle)",
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-primary)" }}>
                👤 ข้อมูลส่วนบุคคล (Personal Profile)
              </h3>
              <label style={{ display: "flex", alignItems: "center", gap: "0.4rem", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={exportSettings.includeProfile}
                  onChange={(e) =>
                    onUpdateExportSettings({
                      ...exportSettings,
                      includeProfile: e.target.checked,
                    })
                  }
                  style={{ width: "16px", height: "16px", accentColor: "var(--primary)" }}
                />
                <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--text-primary)" }}>
                  ส่งออกข้อมูลส่วนบุคคล
                </span>
              </label>
            </div>

            {exportSettings.includeProfile && (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <span style={{ fontSize: "0.82rem", color: "var(--text-muted)", fontWeight: 600 }}>
                  เลือกเทมเพลตข้อมูลส่วนบุคคล (Profile Template):
                </span>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {[
                    {
                      id: "academic",
                      title: "🏛️ Academic / Classic (มาตรฐานทางการ)",
                      desc: "แบนเนอร์สีสุภาพ พร้อมรูปถ่าย, ตำแหน่ง, สังกัด, ข้อมูลติดต่อ และบทสรุปประวัติ",
                    },
                    {
                      id: "modern",
                      title: "💼 Modern Executive (ทันสมัยโทนเข้ม)",
                      desc: "แบนเนอร์โทนเข้ม Slate สวยงาม พร้อมรูปและกล่องข้อมูลติดต่อสไตล์โมเดิร์น",
                    },
                    {
                      id: "compact",
                      title: "📄 Compact Minimal (กะทัดรัด ประหยัดพื้นที่)",
                      desc: "เน้นชื่อและตำแหน่งเด่นชัด ไม่ใส่รูปถ่าย ประหยัดพื้นที่เพื่อจุเนื้อหาได้มากที่สุด",
                    },
                  ].map((tpl) => {
                    const isSelected = exportSettings.profileTemplate === tpl.id;
                    return (
                      <div
                        key={tpl.id}
                        onClick={() =>
                          onUpdateExportSettings({
                            ...exportSettings,
                            profileTemplate: tpl.id as any,
                          })
                        }
                        style={{
                          padding: "0.75rem 0.9rem",
                          borderRadius: "8px",
                          border: isSelected
                            ? "2px solid var(--primary)"
                            : "1px solid var(--border-subtle)",
                          background: isSelected ? "var(--primary-subtle)" : "var(--bg-elevated)",
                          cursor: "pointer",
                          transition: "all 0.15s ease",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <span style={{ fontWeight: 600, fontSize: "0.88rem", color: isSelected ? "var(--primary)" : "var(--text-primary)" }}>
                            {tpl.title}
                          </span>
                          {isSelected && <Check size={16} color="var(--primary)" />}
                        </div>
                        <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.2rem", lineHeight: 1.4 }}>
                          {tpl.desc}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Card 2: Section Selection (Checkboxes) */}
          <div
            style={{
              background: "var(--bg-secondary)",
              padding: "1.25rem",
              borderRadius: "10px",
              border: "1px solid var(--border-subtle)",
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-primary)" }}>
                  📑 เลือกหมวดหมู่ที่จะ Export
                </h3>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                  เลือกเฉพาะหมวดหมู่ที่ต้องการส่งออก
                </span>
              </div>

              <div style={{ display: "flex", gap: "0.4rem" }}>
                <button
                  type="button"
                  onClick={() => handleSelectAllSections(true)}
                  style={{
                    fontSize: "0.72rem",
                    padding: "0.2rem 0.5rem",
                    borderRadius: "4px",
                    background: "var(--bg-elevated)",
                    border: "1px solid var(--border-subtle)",
                    color: "var(--text-primary)",
                    cursor: "pointer",
                  }}
                >
                  เลือกทั้งหมด
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectAllSections(false)}
                  style={{
                    fontSize: "0.72rem",
                    padding: "0.2rem 0.5rem",
                    borderRadius: "4px",
                    background: "var(--bg-elevated)",
                    border: "1px solid var(--border-subtle)",
                    color: "var(--text-primary)",
                    cursor: "pointer",
                  }}
                >
                  ยกเลิกทั้งหมด
                </button>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.45rem", marginTop: "0.25rem" }}>
              {sections.map((sec) => {
                const checked = isSectionSelected(sec.id);
                return (
                  <label
                    key={sec.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "0.5rem 0.75rem",
                      borderRadius: "6px",
                      background: checked ? "var(--bg-elevated)" : "transparent",
                      border: "1px solid var(--border-subtle)",
                      cursor: "pointer",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => handleToggleSection(sec.id)}
                        style={{ width: "16px", height: "16px", accentColor: "var(--primary)" }}
                      />
                      <span style={{ fontSize: "0.85rem", fontWeight: checked ? 600 : 400, color: "var(--text-primary)" }}>
                        {sec.title} {sec.titleTh ? `(${sec.titleTh})` : ""}
                      </span>
                    </div>

                    <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                      {sec.items?.length || 0} รายการ
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Card 3: Quick Test Downloads */}
          <div
            style={{
              background: "var(--bg-secondary)",
              padding: "1.25rem",
              borderRadius: "10px",
              border: "1px solid var(--border-subtle)",
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
            }}
          >
            <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-primary)" }}>
              📥 ทดสอบส่งออกเอกสารทันที
            </h3>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
              ดาวน์โหลดไฟล์เพื่อตรวจสอบการจัดหน้าและรูปแบบที่ตั้งค่าไว้
            </span>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.6rem" }}>
              <button
                type="button"
                onClick={() => onTestExport("pdf", "th")}
                style={{
                  padding: "0.55rem",
                  borderRadius: "6px",
                  background: "var(--bg-elevated)",
                  border: "1px solid var(--border-subtle)",
                  color: "var(--text-primary)",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.35rem",
                }}
              >
                <Download size={14} />
                <span>PDF (ไทย)</span>
              </button>

              <button
                type="button"
                onClick={() => onTestExport("pdf", "en")}
                style={{
                  padding: "0.55rem",
                  borderRadius: "6px",
                  background: "var(--bg-elevated)",
                  border: "1px solid var(--border-subtle)",
                  color: "var(--text-primary)",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.35rem",
                }}
              >
                <Download size={14} />
                <span>PDF (English)</span>
              </button>

              <button
                type="button"
                onClick={() => onTestExport("docx", "th")}
                style={{
                  padding: "0.55rem",
                  borderRadius: "6px",
                  background: "var(--bg-elevated)",
                  border: "1px solid var(--border-subtle)",
                  color: "var(--text-primary)",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.35rem",
                }}
              >
                <Download size={14} />
                <span>Word (ไทย)</span>
              </button>

              <button
                type="button"
                onClick={() => onTestExport("docx", "en")}
                style={{
                  padding: "0.55rem",
                  borderRadius: "6px",
                  background: "var(--bg-elevated)",
                  border: "1px solid var(--border-subtle)",
                  color: "var(--text-primary)",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.35rem",
                }}
              >
                <Download size={14} />
                <span>Word (English)</span>
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Section-Level Export Layout Customization */}
        <div
          style={{
            background: "var(--bg-secondary)",
            padding: "1.25rem",
            borderRadius: "10px",
            border: "1px solid var(--border-subtle)",
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
          }}
        >
          <div>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)" }}>
              📊 กำหนดรูปแบบเฉพาะของแต่ละหมวดหมู่ (Section Export Formats)
            </h3>
            <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>
              เลือกว่าหมวดหมู่นี้จะแสดงแบบ <strong>ตาราง (Table)</strong> หรือ <strong>ลิสต์ (List)</strong> ในไฟล์ PDF และ Word
            </p>
          </div>

          {/* Section Picker Pills */}
          <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", overflowX: "auto" }}>
            {sections.map((sec) => {
              const isActive = sec.id === activeSectionConfigId;
              const cfg = exportSettings.sectionConfigs[sec.id];
              const isTable = cfg?.layout === "table";
              return (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => setActiveSectionConfigId(sec.id)}
                  style={{
                    padding: "0.45rem 0.85rem",
                    borderRadius: "6px",
                    border: isActive ? "2px solid var(--primary)" : "1px solid var(--border-subtle)",
                    background: isActive ? "var(--primary-subtle)" : "var(--bg-elevated)",
                    color: isActive ? "var(--primary)" : "var(--text-primary)",
                    fontWeight: 600,
                    fontSize: "0.82rem",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.35rem",
                    whiteSpace: "nowrap",
                  }}
                >
                  <span>{isTable ? "📑" : "📝"}</span>
                  <span>{sec.title}</span>
                </button>
              );
            })}
          </div>

          {activeSec && (
            <div
              style={{
                background: "var(--bg-elevated)",
                padding: "1.25rem",
                borderRadius: "8px",
                border: "1px solid var(--border-subtle)",
                display: "flex",
                flexDirection: "column",
                gap: "1.25rem",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <span style={{ fontWeight: 700, fontSize: "1rem", color: "var(--text-primary)" }}>
                    หมวด: {activeSec.title} {activeSec.titleTh ? `(${activeSec.titleTh})` : ""}
                  </span>
                  <span style={{ display: "block", fontSize: "0.75rem", color: "var(--text-muted)" }}>
                    {activeSecFields.length} ฟิลด์ข้อมูล | {activeSec.items?.length || 0} รายการ
                  </span>
                </div>
              </div>

              {/* Layout Switch: Table vs List */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--text-primary)" }}>
                  รูปแบบการแสดงผล (Layout):
                </span>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                  <button
                    type="button"
                    onClick={() => updateSectionConfig(activeSec.id, { layout: "table" })}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.6rem",
                      padding: "0.75rem 1rem",
                      borderRadius: "8px",
                      border:
                        activeSecConfig.layout === "table"
                          ? "2px solid var(--primary)"
                          : "1px solid var(--border-subtle)",
                      background:
                        activeSecConfig.layout === "table"
                          ? "var(--primary-subtle)"
                          : "var(--bg-secondary)",
                      cursor: "pointer",
                    }}
                  >
                    <TableIcon size={20} color={activeSecConfig.layout === "table" ? "var(--primary)" : "var(--text-muted)"} />
                    <div style={{ textAlign: "left" }}>
                      <span style={{ fontWeight: 600, fontSize: "0.88rem", display: "block", color: "var(--text-primary)" }}>
                        📑 ตาราง (Table)
                      </span>
                      <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                        กำหนดจำนวนคอลัมน์ และเลือกฟิลด์ในแต่ละช่อง
                      </span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => updateSectionConfig(activeSec.id, { layout: "list" })}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.6rem",
                      padding: "0.75rem 1rem",
                      borderRadius: "8px",
                      border:
                        activeSecConfig.layout !== "table"
                          ? "2px solid var(--primary)"
                          : "1px solid var(--border-subtle)",
                      background:
                        activeSecConfig.layout !== "table"
                          ? "var(--primary-subtle)"
                          : "var(--bg-secondary)",
                      cursor: "pointer",
                    }}
                  >
                    <ListIcon size={20} color={activeSecConfig.layout !== "table" ? "var(--primary)" : "var(--text-muted)"} />
                    <div style={{ textAlign: "left" }}>
                      <span style={{ fontWeight: 600, fontSize: "0.88rem", display: "block", color: "var(--text-primary)" }}>
                        📝 ลิสต์ (List)
                      </span>
                      <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                        แสดงเป็นรายการแบบ Bullet หรือตัวเลข
                      </span>
                    </div>
                  </button>
                </div>
              </div>

              {/* TABLE CONFIGURATION */}
              {activeSecConfig.layout === "table" ? (
                <div
                  style={{
                    background: "var(--bg-secondary)",
                    padding: "1rem",
                    borderRadius: "8px",
                    border: "1px solid var(--border-subtle)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "1rem",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontWeight: 600, fontSize: "0.85rem", color: "var(--text-primary)" }}>
                      กำหนดจำนวนคอลัมน์ของตาราง:
                    </span>
                    <div style={{ display: "flex", gap: "0.4rem" }}>
                      {[2, 3, 4].map((num) => {
                        const isCol = (activeSecConfig.columnsCount || 3) === num;
                        return (
                          <button
                            key={num}
                            type="button"
                            onClick={() => {
                              const existingTitles = activeSecConfig.columnTitles || [];
                              const newTitles = Array.from({ length: num }, (_, i) => existingTitles[i] || `คอลัมน์ ${i + 1}`);
                              updateSectionConfig(activeSec.id, {
                                columnsCount: num,
                                columnTitles: newTitles,
                              });
                            }}
                            style={{
                              padding: "0.3rem 0.75rem",
                              borderRadius: "6px",
                              border: isCol ? "2px solid var(--primary)" : "1px solid var(--border-subtle)",
                              background: isCol ? "var(--primary)" : "var(--bg-elevated)",
                              color: isCol ? "#ffffff" : "var(--text-primary)",
                              fontWeight: 600,
                              fontSize: "0.82rem",
                              cursor: "pointer",
                            }}
                          >
                            {num} คอลัมน์
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Column Header Titles */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                    <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-muted)" }}>
                      ชื่อหัวตารางแต่ละคอลัมน์ (Column Headers):
                    </span>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: `repeat(${activeSecConfig.columnsCount || 3}, 1fr)`,
                        gap: "0.5rem",
                      }}
                    >
                      {Array.from({ length: activeSecConfig.columnsCount || 3 }).map((_, colIdx) => {
                        const currentTitles = activeSecConfig.columnTitles || [
                          "ปี / ช่วงเวลา",
                          "หัวข้อและรายละเอียด",
                          "สถานที่ / ลิงก์",
                        ];
                        const titleVal = currentTitles[colIdx] || `คอลัมน์ ${colIdx + 1}`;
                        return (
                          <div key={colIdx} style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                            <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
                              คอลัมน์ {colIdx + 1}:
                            </span>
                            <input
                              type="text"
                              value={titleVal}
                              onChange={(e) => {
                                const updated = [...currentTitles];
                                updated[colIdx] = e.target.value;
                                updateSectionConfig(activeSec.id, { columnTitles: updated });
                              }}
                              style={{
                                padding: "0.4rem 0.6rem",
                                fontSize: "0.82rem",
                                borderRadius: "6px",
                                border: "1px solid var(--border-subtle)",
                                background: "var(--bg-elevated)",
                                color: "var(--text-primary)",
                              }}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Field-to-Column Mapping */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--text-primary)" }}>
                        การจัดวางฟิลด์ลงในคอลัมน์ (Field to Column Mapping):
                      </span>
                      <div style={{ display: "flex", gap: "0.4rem" }}>
                        <button
                          type="button"
                          onClick={() => setAllFieldsVisibility(true)}
                          style={{
                            fontSize: "0.72rem",
                            padding: "0.2rem 0.5rem",
                            borderRadius: "4px",
                            background: "var(--bg-elevated)",
                            border: "1px solid var(--border-subtle)",
                            color: "var(--text-primary)",
                            cursor: "pointer",
                          }}
                        >
                          แสดงทุกฟิลด์
                        </button>
                        <button
                          type="button"
                          onClick={() => setAllFieldsVisibility(false)}
                          style={{
                            fontSize: "0.72rem",
                            padding: "0.2rem 0.5rem",
                            borderRadius: "4px",
                            background: "var(--bg-elevated)",
                            border: "1px solid var(--border-subtle)",
                            color: "var(--text-primary)",
                            cursor: "pointer",
                          }}
                        >
                          ซ่อนทุกฟิลด์
                        </button>
                      </div>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "0.45rem" }}>
                      {(activeSecFields.length > 0
                        ? activeSecFields
                        : [
                            { id: "f_title", label: "Title / หัวข้อ", type: "details" as const },
                            { id: "f_date", label: "Year/Period / ช่วงเวลา", type: "date_range" as const },
                            { id: "f_sub", label: "Organization / หน่วยงาน", type: "address" as const },
                            { id: "f_desc", label: "Description / รายละเอียด", type: "details" as const },
                          ]
                      ).map((f) => {
                        const currentMapping = activeSecConfig.columnMappings || {};
                        const colAssigned = currentMapping[f.id] !== undefined ? currentMapping[f.id] : 1;
                        const colTitles = activeSecConfig.columnTitles || ["คอลัมน์ 1", "คอลัมน์ 2", "คอลัมน์ 3"];
                        const hidden = isFieldHidden(f.id);

                        return (
                          <div
                            key={f.id}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              padding: "0.5rem 0.75rem",
                              borderRadius: "6px",
                              background: hidden ? "rgba(239, 68, 68, 0.05)" : "var(--bg-elevated)",
                              border: hidden ? "1px solid rgba(239, 68, 68, 0.35)" : "1px solid var(--border-subtle)",
                              transition: "all 0.15s ease",
                            }}
                          >
                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                              <button
                                type="button"
                                onClick={() => toggleFieldVisibility(f.id)}
                                title={hidden ? "คลิกเพื่อแสดงฟิลด์นี้ในตาราง" : "คลิกเพื่อซ่อนฟิลด์นี้ ไม่ให้แสดงในตาราง"}
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  width: "24px",
                                  height: "24px",
                                  borderRadius: "4px",
                                  border: hidden ? "1px solid rgba(239, 68, 68, 0.4)" : "1px solid var(--border-subtle)",
                                  background: hidden ? "rgba(239, 68, 68, 0.15)" : "var(--bg-secondary)",
                                  color: hidden ? "#ef4444" : "var(--text-muted)",
                                  cursor: "pointer",
                                }}
                              >
                                {hidden ? <EyeOff size={13} /> : <Eye size={13} />}
                              </button>

                              <div>
                                <span style={{ fontSize: "0.82rem", color: hidden ? "var(--text-muted)" : "var(--text-primary)", fontWeight: hidden ? 400 : 600 }}>
                                  {f.icon || "🏷️"} {f.label || f.id} {f.labelTh ? `(${f.labelTh})` : ""}
                                </span>
                                {hidden && (
                                  <span style={{ fontSize: "0.7rem", color: "#ef4444", marginLeft: "0.4rem", fontWeight: 600 }}>
                                    (🚫 ซ่อน — ไม่แสดงในตาราง)
                                  </span>
                                )}
                              </div>
                            </div>

                            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                              <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>วางที่:</span>
                              <select
                                value={hidden ? "hidden" : colAssigned}
                                onChange={(e) => {
                                  if (e.target.value === "hidden") {
                                    const currentHidden = activeSecConfig.hiddenFields || [];
                                    if (!currentHidden.includes(f.id)) {
                                      updateSectionConfig(activeSec.id, { hiddenFields: [...currentHidden, f.id] });
                                    }
                                  } else {
                                    const colNum = parseInt(e.target.value, 10);
                                    const currentHidden = (activeSecConfig.hiddenFields || []).filter((id) => id !== f.id);
                                    const updatedMappings = {
                                      ...currentMapping,
                                      [f.id]: colNum,
                                    };
                                    updateSectionConfig(activeSec.id, {
                                      columnMappings: updatedMappings,
                                      hiddenFields: currentHidden,
                                    });
                                  }
                                }}
                                style={{
                                  padding: "0.3rem 0.5rem",
                                  fontSize: "0.8rem",
                                  borderRadius: "6px",
                                  border: hidden ? "1px solid rgba(239, 68, 68, 0.4)" : "1px solid var(--border-subtle)",
                                  background: hidden ? "rgba(239, 68, 68, 0.08)" : "var(--bg-secondary)",
                                  color: hidden ? "#ef4444" : "var(--text-primary)",
                                  fontWeight: 600,
                                }}
                              >
                                <option value="hidden" style={{ color: "#ef4444", fontWeight: 700 }}>
                                  🚫 ไม่แสดงในเอกสาร (ซ่อนฟิลด์นี้)
                                </option>
                                {Array.from({ length: activeSecConfig.columnsCount || 3 }).map((_, idx) => (
                                  <option key={idx} value={idx}>
                                    คอลัมน์ {idx + 1} ({colTitles[idx] || `Col ${idx + 1}`})
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                /* LIST CONFIGURATION */
                <div
                  style={{
                    background: "var(--bg-secondary)",
                    padding: "1rem",
                    borderRadius: "8px",
                    border: "1px solid var(--border-subtle)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "1rem",
                  }}
                >
                  <div>
                    <span style={{ fontWeight: 600, fontSize: "0.85rem", color: "var(--text-primary)" }}>
                      รูปแบบหัวข้อย่อยของลิสต์ (List Style):
                    </span>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginTop: "0.4rem" }}>
                      <button
                        type="button"
                        onClick={() => updateSectionConfig(activeSec.id, { listStyle: "bullet" })}
                        style={{
                          padding: "0.6rem 0.85rem",
                          borderRadius: "8px",
                          border:
                            (activeSecConfig.listStyle || "bullet") === "bullet"
                              ? "2px solid var(--primary)"
                              : "1px solid var(--border-subtle)",
                          background:
                            (activeSecConfig.listStyle || "bullet") === "bullet"
                              ? "var(--primary-subtle)"
                              : "var(--bg-elevated)",
                          cursor: "pointer",
                          textAlign: "left",
                        }}
                      >
                        <span style={{ fontWeight: 600, fontSize: "0.88rem", display: "block", color: "var(--text-primary)" }}>
                          • Bullet (จุดสัญลักษณ์)
                        </span>
                        <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                          แสดงเป็นรายการแบบจุดกลมนำหน้าแต่ละข้อ
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => updateSectionConfig(activeSec.id, { listStyle: "number" })}
                        style={{
                          padding: "0.6rem 0.85rem",
                          borderRadius: "8px",
                          border:
                            activeSecConfig.listStyle === "number"
                              ? "2px solid var(--primary)"
                              : "1px solid var(--border-subtle)",
                          background:
                            activeSecConfig.listStyle === "number"
                              ? "var(--primary-subtle)"
                              : "var(--bg-elevated)",
                          cursor: "pointer",
                          textAlign: "left",
                        }}
                      >
                        <span style={{ fontWeight: 600, fontSize: "0.88rem", display: "block", color: "var(--text-primary)" }}>
                          1. 2. 3. Number (ลำดับตัวเลข)
                        </span>
                        <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                          แสดงเรียงลำดับตัวเลข 1, 2, 3 นำหน้าแต่ละรายการ
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Field Visibility in List Layout */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontWeight: 600, fontSize: "0.85rem", color: "var(--text-primary)" }}>
                        👁️ เลือกฟิลด์ที่จะแสดงในลิสต์ (Fields Included in List):
                      </span>
                      <div style={{ display: "flex", gap: "0.4rem" }}>
                        <button
                          type="button"
                          onClick={() => setAllFieldsVisibility(true)}
                          style={{
                            fontSize: "0.72rem",
                            padding: "0.2rem 0.5rem",
                            borderRadius: "4px",
                            background: "var(--bg-elevated)",
                            border: "1px solid var(--border-subtle)",
                            color: "var(--text-primary)",
                            cursor: "pointer",
                          }}
                        >
                          แสดงทุกฟิลด์
                        </button>
                        <button
                          type="button"
                          onClick={() => setAllFieldsVisibility(false)}
                          style={{
                            fontSize: "0.72rem",
                            padding: "0.2rem 0.5rem",
                            borderRadius: "4px",
                            background: "var(--bg-elevated)",
                            border: "1px solid var(--border-subtle)",
                            color: "var(--text-primary)",
                            cursor: "pointer",
                          }}
                        >
                          ซ่อนทุกฟิลด์
                        </button>
                      </div>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                      {(activeSecFields.length > 0
                        ? activeSecFields
                        : [
                            { id: "f_title", label: "Title / หัวข้อ", type: "details" as const },
                            { id: "f_date", label: "Year/Period / ช่วงเวลา", type: "date_range" as const },
                            { id: "f_sub", label: "Organization / หน่วยงาน", type: "address" as const },
                            { id: "f_desc", label: "Description / รายละเอียด", type: "details" as const },
                          ]
                      ).map((f) => {
                        const hidden = isFieldHidden(f.id);
                        return (
                          <div
                            key={f.id}
                            onClick={() => toggleFieldVisibility(f.id)}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              padding: "0.5rem 0.75rem",
                              borderRadius: "6px",
                              background: hidden ? "rgba(239, 68, 68, 0.05)" : "var(--bg-elevated)",
                              border: hidden ? "1px solid rgba(239, 68, 68, 0.35)" : "1px solid var(--border-subtle)",
                              cursor: "pointer",
                              transition: "all 0.15s ease",
                            }}
                          >
                            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                              <input
                                type="checkbox"
                                checked={!hidden}
                                onChange={() => toggleFieldVisibility(f.id)}
                                style={{ width: "16px", height: "16px", accentColor: "var(--primary)", cursor: "pointer" }}
                                onClick={(e) => e.stopPropagation()}
                              />
                              <span style={{ fontSize: "0.84rem", fontWeight: hidden ? 400 : 500, color: hidden ? "var(--text-muted)" : "var(--text-primary)" }}>
                                {f.icon || "🏷️"} {f.label || f.id} {f.labelTh ? `(${f.labelTh})` : ""}
                              </span>
                            </div>

                            <span
                              style={{
                                fontSize: "0.72rem",
                                padding: "0.2rem 0.5rem",
                                borderRadius: "4px",
                                fontWeight: 600,
                                background: hidden ? "rgba(239, 68, 68, 0.15)" : "rgba(16, 185, 129, 0.15)",
                                color: hidden ? "#ef4444" : "#10b981",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "0.25rem",
                              }}
                            >
                              {hidden ? <EyeOff size={12} /> : <Eye size={12} />}
                              <span>{hidden ? "ไม่แสดง (ซ่อน)" : "แสดงในลิสต์"}</span>
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
