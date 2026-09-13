"use client";

import React, { useState } from "react";
import {
  ArrowUp,
  ArrowDown,
  Plus,
  Trash2,
  Sparkles,
  ChevronDown,
} from "lucide-react";
import {
  CustomFieldDef,
  StandardFieldType,
  STANDARD_FIELD_TYPES,
  AVAILABLE_ICONS,
  FIELD_PRESETS,
} from "@/types/customFields";

interface SectionFieldsBuilderProps {
  fields: CustomFieldDef[];
  onChange: (fields: CustomFieldDef[]) => void;
}

export const SectionFieldsBuilder: React.FC<SectionFieldsBuilderProps> = ({
  fields,
  onChange,
}) => {
  const [activeIconPickerIndex, setActiveIconPickerIndex] = useState<number | null>(null);
  const [newOptionEn, setNewOptionEn] = useState<Record<number, string>>({});
  const [newOptionTh, setNewOptionTh] = useState<Record<number, string>>({});

  const handleAddOption = (fieldIndex: number) => {
    const en = (newOptionEn[fieldIndex] || "").trim();
    const th = (newOptionTh[fieldIndex] || "").trim();
    if (!en && !th) return;

    const optLabelEn = en || th;
    const optLabelTh = th || en;
    const currentOptions = fields[fieldIndex].options || [];

    const newOpt = {
      value: optLabelEn,
      label: optLabelEn,
      labelTh: optLabelTh,
    };

    updateField(fieldIndex, {
      options: [...currentOptions, newOpt],
    });

    setNewOptionEn((prev) => ({ ...prev, [fieldIndex]: "" }));
    setNewOptionTh((prev) => ({ ...prev, [fieldIndex]: "" }));
  };

  const handleRemoveOption = (fieldIndex: number, optionIndex: number) => {
    const currentOptions = fields[fieldIndex].options || [];
    updateField(fieldIndex, {
      options: currentOptions.filter((_, i) => i !== optionIndex),
    });
  };

  const moveField = (index: number, direction: "up" | "down") => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === fields.length - 1)
    )
      return;
    const target = direction === "up" ? index - 1 : index + 1;
    const updated = [...fields];
    const temp = updated[index];
    updated[index] = updated[target];
    updated[target] = temp;
    onChange(updated);
  };

  const addFieldOfType = (type: StandardFieldType) => {
    const meta = STANDARD_FIELD_TYPES.find((m) => m.id === type) || {
      id: type,
      label: "New Field",
      defaultIcon: "📝",
    };

    const newField: CustomFieldDef = {
      id: `f_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      label: "",
      type,
      role: type === "details" && fields.length === 0 ? "header" : "none",
      icon: meta.defaultIcon,
      required: false,
      options: type === "dropdown" ? [] : undefined,
    };

    onChange([...fields, newField]);
  };

  const updateField = (index: number, updates: Partial<CustomFieldDef>) => {
    const updated = fields.map((f, i) => (i === index ? { ...f, ...updates } : f));
    onChange(updated);
  };

  const removeField = (index: number) => {
    onChange(fields.filter((_, i) => i !== index));
  };

  return (
    <div
      style={{
        background: "var(--bg-elevated)",
        padding: "1.25rem",
        borderRadius: "10px",
        border: "1px solid var(--border-subtle)",
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
      }}
    >
      {/* Header with Title & Quick Add */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "0.5rem",
        }}
      >
        <div>
          <label
            style={{
              fontSize: "0.95rem",
              fontWeight: 700,
              color: "var(--text-primary)",
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
            }}
          >
            <span>📋 ฟิลด์ข้อมูลมาตรฐานสำหรับหมวดหมู่นี้</span>
            <span
              style={{
                fontSize: "0.72rem",
                background: "var(--primary-subtle)",
                color: "var(--primary)",
                padding: "0.15rem 0.5rem",
                borderRadius: "999px",
                fontWeight: 600,
              }}
            >
              {fields.length} ฟิลด์
            </span>
          </label>
          <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
            กำหนดชื่อฟิลด์, เลือกชนิดข้อมูล, กำหนด Header/Sub-header, เลือกไอคอน และจัดลำดับ
          </span>
        </div>

        {/* Quick Add Specific Field Buttons */}
        <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap", alignItems: "center" }}>
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600 }}>
            + เพิ่มฟิลด์:
          </span>
          {STANDARD_FIELD_TYPES.map((std) => (
            <button
              key={std.id}
              type="button"
              onClick={() => addFieldOfType(std.id)}
              style={{
                fontSize: "0.75rem",
                padding: "0.22rem 0.55rem",
                borderRadius: "6px",
                background: "var(--bg-secondary)",
                border: "1px solid var(--border-subtle)",
                color: "var(--text-primary)",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.25rem",
                transition: "all 0.15s ease",
              }}
              title={std.desc}
            >
              <span>{std.defaultIcon}</span>
              <span>{std.id.replace("_", " ")}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Dual Language Presets Toolbar */}
      <div
        style={{
          display: "flex",
          gap: "0.5rem",
          flexWrap: "wrap",
          alignItems: "center",
          padding: "0.6rem 0.85rem",
          background: "var(--bg-secondary)",
          borderRadius: "8px",
          border: "1px solid var(--border-subtle)",
        }}
      >
        <span
          style={{
            fontSize: "0.78rem",
            fontWeight: 600,
            color: "var(--primary)",
            display: "flex",
            alignItems: "center",
            gap: "0.3rem",
          }}
        >
          <Sparkles size={14} />
          <span>แม่แบบสองภาษาสำเร็จรูป (Dual Language Presets):</span>
        </span>
        {FIELD_PRESETS.map((p) => (
          <button
            key={p.name}
            type="button"
            onClick={() => {
              const cloned = p.fields.map((f) => ({
                ...f,
                id: `f_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
              }));
              onChange(cloned);
            }}
            style={{
              fontSize: "0.78rem",
              padding: "0.22rem 0.6rem",
              borderRadius: "6px",
              background: "var(--bg-elevated)",
              border: "1px solid var(--border-subtle)",
              color: "var(--text-primary)",
              cursor: "pointer",
              fontWeight: 500,
              transition: "all 0.15s ease",
            }}
            title={`โหลดแม่แบบ ${p.name}`}
          >
            {p.name}
          </button>
        ))}
      </div>

      {/* Fields List */}
      {fields.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "1.5rem 1rem",
            background: "var(--bg-secondary)",
            borderRadius: "8px",
            border: "1px dashed var(--border-subtle)",
            fontSize: "0.86rem",
            color: "var(--text-muted)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <span>ยังไม่มีฟิลด์ในหมวดหมู่นี้</span>
          <span style={{ fontSize: "0.78rem" }}>
            เลือก <strong>แม่แบบสองภาษาสำเร็จรูป</strong> ด้านบน หรือคลิกปุ่มชนิดฟิลด์เพื่อเพิ่มฟิลด์ตามต้องการ
          </span>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
          {fields.map((f, idx) => (
            <div
              key={f.id}
              style={{
                background: "var(--bg-secondary)",
                padding: "0.75rem 0.85rem",
                borderRadius: "8px",
                border: "1px solid var(--border-subtle)",
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem",
                position: "relative",
              }}
            >
              {/* Row 1: Order buttons, Icon, Dual-Language Label inputs, Delete */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "auto auto 1fr auto",
                  gap: "0.55rem",
                  alignItems: "center",
                }}
              >
                {/* Reorder Buttons */}
                <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => moveField(idx, "up")}
                    style={{
                      border: "none",
                      background: "transparent",
                      color: idx === 0 ? "var(--text-muted)" : "var(--primary)",
                      cursor: idx === 0 ? "default" : "pointer",
                      padding: "2px",
                      opacity: idx === 0 ? 0.3 : 1,
                      display: "flex",
                      alignItems: "center",
                    }}
                    title="เลื่อนขึ้น (Move Up)"
                  >
                    <ArrowUp size={14} />
                  </button>
                  <button
                    type="button"
                    disabled={idx === fields.length - 1}
                    onClick={() => moveField(idx, "down")}
                    style={{
                      border: "none",
                      background: "transparent",
                      color: idx === fields.length - 1 ? "var(--text-muted)" : "var(--primary)",
                      cursor: idx === fields.length - 1 ? "default" : "pointer",
                      padding: "2px",
                      opacity: idx === fields.length - 1 ? 0.3 : 1,
                      display: "flex",
                      alignItems: "center",
                    }}
                    title="เลื่อนลง (Move Down)"
                  >
                    <ArrowDown size={14} />
                  </button>
                </div>

                {/* Icon Picker Trigger */}
                <div style={{ position: "relative" }}>
                  <button
                    type="button"
                    onClick={() =>
                      setActiveIconPickerIndex(activeIconPickerIndex === idx ? null : idx)
                    }
                    style={{
                      fontSize: "1.1rem",
                      padding: "0.35rem 0.55rem",
                      borderRadius: "6px",
                      border: "1px solid var(--border-subtle)",
                      background: "var(--bg-elevated)",
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.2rem",
                    }}
                    title="คลิกเพื่อเลือกไอคอนบนหน้าเว็บ"
                  >
                    <span>{f.icon || "📝"}</span>
                    <ChevronDown size={11} color="var(--text-muted)" />
                  </button>

                  {/* Icon Picker Popup */}
                  {activeIconPickerIndex === idx && (
                    <div
                      style={{
                        position: "absolute",
                        top: "100%",
                        left: 0,
                        zIndex: 50,
                        background: "var(--bg-elevated)",
                        border: "1px solid var(--border-subtle)",
                        borderRadius: "8px",
                        boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
                        padding: "0.5rem",
                        display: "grid",
                        gridTemplateColumns: "repeat(5, 1fr)",
                        gap: "0.35rem",
                        width: "180px",
                        marginTop: "4px",
                      }}
                    >
                      {AVAILABLE_ICONS.map((ic) => (
                        <button
                          key={ic}
                          type="button"
                          onClick={() => {
                            updateField(idx, { icon: ic });
                            setActiveIconPickerIndex(null);
                          }}
                          style={{
                            fontSize: "1.15rem",
                            padding: "0.35rem",
                            borderRadius: "4px",
                            border: f.icon === ic ? "1px solid var(--primary)" : "none",
                            background: f.icon === ic ? "var(--primary-subtle)" : "transparent",
                            cursor: "pointer",
                            textAlign: "center",
                          }}
                        >
                          {ic}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Dual Language Label Inputs */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "0.5rem",
                  }}
                >
                  <div style={{ position: "relative" }}>
                    <input
                      type="text"
                      placeholder="Field Label (English, e.g. Degree)"
                      value={f.label}
                      onChange={(e) => updateField(idx, { label: e.target.value })}
                      style={{
                        width: "100%",
                        padding: "0.45rem 0.65rem 0.45rem 1.85rem",
                        fontSize: "0.85rem",
                        borderRadius: "6px",
                        border: "1px solid var(--border-subtle)",
                        background: "var(--bg-elevated)",
                        color: "var(--text-primary)",
                        boxSizing: "border-box",
                      }}
                    />
                    <span
                      style={{
                        position: "absolute",
                        left: "0.45rem",
                        top: "50%",
                        transform: "translateY(-50%)",
                        fontSize: "0.82rem",
                        pointerEvents: "none",
                      }}
                      title="English Label"
                    >
                      🇺🇸
                    </span>
                  </div>

                  <div style={{ position: "relative" }}>
                    <input
                      type="text"
                      placeholder="ชื่อฟิลด์ภาษาไทย (เช่น วุฒิการศึกษา)"
                      value={f.labelTh || ""}
                      onChange={(e) => updateField(idx, { labelTh: e.target.value })}
                      style={{
                        width: "100%",
                        padding: "0.45rem 0.65rem 0.45rem 1.85rem",
                        fontSize: "0.85rem",
                        borderRadius: "6px",
                        border: "1px solid var(--border-subtle)",
                        background: "var(--bg-elevated)",
                        color: "var(--text-primary)",
                        boxSizing: "border-box",
                      }}
                    />
                    <span
                      style={{
                        position: "absolute",
                        left: "0.45rem",
                        top: "50%",
                        transform: "translateY(-50%)",
                        fontSize: "0.82rem",
                        pointerEvents: "none",
                      }}
                      title="ชื่อภาษาไทย"
                    >
                      🇹🇭
                    </span>
                  </div>
                </div>

                {/* Delete Button */}
                <button
                  type="button"
                  onClick={() => removeField(idx)}
                  style={{
                    background: "rgba(239, 68, 68, 0.1)",
                    color: "#ef4444",
                    border: "none",
                    borderRadius: "6px",
                    padding: "0.45rem 0.65rem",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                  }}
                  title="ลบฟิลด์นี้"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              {/* Row 2: Field Type & Role Selectors */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1.3fr 1.2fr",
                  gap: "0.65rem",
                  paddingLeft: "1.75rem",
                }}
              >
                {/* Standard Field Type Selector */}
                <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                  <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontWeight: 600 }}>
                    ชนิดข้อมูล (Field Type):
                  </span>
                  <select
                    value={f.type}
                    onChange={(e) => {
                      const newType = e.target.value as StandardFieldType;
                      const stdMeta = STANDARD_FIELD_TYPES.find((m) => m.id === newType);
                      updateField(idx, {
                        type: newType,
                        icon: f.icon || stdMeta?.defaultIcon || "📝",
                      });
                    }}
                    style={{
                      padding: "0.38rem 0.55rem",
                      fontSize: "0.82rem",
                      borderRadius: "6px",
                      border: "1px solid var(--border-subtle)",
                      background: "var(--bg-elevated)",
                      color: "var(--text-primary)",
                    }}
                  >
                    <option value="details">📝 Details (ข้อความ/รายละเอียด)</option>
                    <option value="dropdown">🔽 Dropdown (ตัวเลือกรายการ)</option>
                    <option value="year">📅 Year (ระบุปี เช่น 2024 / 2567)</option>
                    <option value="year_range">⏳ Year Range (ช่วงปี เช่น 2020 - 2024)</option>
                    <option value="date_range">🗓️ Date range (ช่วงเวลา เดือน ปี)</option>
                    <option value="address">📍 Address (ที่อยู่ / สถานที่ / หน่วยงาน)</option>
                    <option value="link">🔗 Link (ลิงก์ URL)</option>
                    <option value="upload">📤 Upload (อัปโหลดไฟล์ / เกียรติบัตร)</option>
                  </select>
                </div>

                {/* Role Option Selector */}
                <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                  <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontWeight: 600 }}>
                    ระดับหัวข้อ (Role Option):
                  </span>
                  <select
                    value={f.role || "none"}
                    onChange={(e) =>
                      updateField(idx, {
                        role: e.target.value as "header" | "sub_header" | "none",
                      })
                    }
                    style={{
                      padding: "0.38rem 0.55rem",
                      fontSize: "0.82rem",
                      borderRadius: "6px",
                      border: "1px solid var(--border-subtle)",
                      background: "var(--bg-elevated)",
                      color: f.role === "header" ? "var(--primary)" : "var(--text-primary)",
                      fontWeight: f.role === "header" ? 600 : 400,
                    }}
                  >
                    <option value="none">🏷️ ข้อมูลทั่วไป (Normal / Body)</option>
                    <option value="header">👑 หัวข้อหลัก (Header / Primary Title)</option>
                    <option value="sub_header">📌 หัวข้อย่อย (Sub-header / Organization)</option>
                  </select>
                </div>
              </div>

              {/* Row 3: Dropdown Options Configuration Panel */}
              {f.type === "dropdown" && (
                <div
                  style={{
                    background: "var(--bg-card)",
                    padding: "0.85rem 1rem",
                    borderRadius: "8px",
                    border: "1px dashed var(--border-subtle)",
                    marginLeft: "1.75rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.6rem",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem" }}>
                    <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--primary)", display: "flex", alignItems: "center", gap: "0.35rem" }}>
                      <span>🔽 ตั้งค่าตัวเลือก Dropdown ({f.options?.length || 0} ตัวเลือก):</span>
                    </span>
                    <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                      พิมพ์ตัวเลือก EN และ TH แล้วกด "เพิ่ม" (หรือกดปุ่ม Enter)
                    </span>
                  </div>

                  {/* Add Option Inputs */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: "0.45rem", alignItems: "center" }}>
                    <div style={{ position: "relative" }}>
                      <input
                        type="text"
                        placeholder="ตัวเลือกภาษาอังกฤษ (EN) เช่น Bachelor's Degree"
                        value={newOptionEn[idx] || ""}
                        onChange={(e) => setNewOptionEn({ ...newOptionEn, [idx]: e.target.value })}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddOption(idx);
                          }
                        }}
                        style={{
                          width: "100%",
                          padding: "0.4rem 0.6rem 0.4rem 1.7rem",
                          fontSize: "0.8rem",
                          borderRadius: "6px",
                          border: "1px solid var(--border-subtle)",
                          background: "var(--bg-elevated)",
                          color: "var(--text-primary)",
                          boxSizing: "border-box",
                        }}
                      />
                      <span style={{ position: "absolute", left: "0.45rem", top: "50%", transform: "translateY(-50%)", fontSize: "0.78rem", pointerEvents: "none" }}>
                        🇺🇸
                      </span>
                    </div>

                    <div style={{ position: "relative" }}>
                      <input
                        type="text"
                        placeholder="ตัวเลือกภาษาไทย (TH) เช่น ปริญญาตรี"
                        value={newOptionTh[idx] || ""}
                        onChange={(e) => setNewOptionTh({ ...newOptionTh, [idx]: e.target.value })}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddOption(idx);
                          }
                        }}
                        style={{
                          width: "100%",
                          padding: "0.4rem 0.6rem 0.4rem 1.7rem",
                          fontSize: "0.8rem",
                          borderRadius: "6px",
                          border: "1px solid var(--border-subtle)",
                          background: "var(--bg-elevated)",
                          color: "var(--text-primary)",
                          boxSizing: "border-box",
                        }}
                      />
                      <span style={{ position: "absolute", left: "0.45rem", top: "50%", transform: "translateY(-50%)", fontSize: "0.78rem", pointerEvents: "none" }}>
                        🇹🇭
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleAddOption(idx)}
                      style={{
                        padding: "0.4rem 0.8rem",
                        fontSize: "0.8rem",
                        fontWeight: 600,
                        background: "var(--primary)",
                        color: "#fff",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                        whiteSpace: "nowrap",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.25rem",
                      }}
                    >
                      <Plus size={13} />
                      <span>เพิ่มตัวเลือก</span>
                    </button>
                  </div>

                  {/* Options List */}
                  {f.options && f.options.length > 0 ? (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginTop: "0.2rem" }}>
                      {f.options.map((opt, optIdx) => (
                        <div
                          key={optIdx}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.35rem",
                            background: "var(--bg-elevated)",
                            border: "1px solid var(--border-subtle)",
                            padding: "0.25rem 0.6rem",
                            borderRadius: "6px",
                            fontSize: "0.78rem",
                          }}
                        >
                          <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>
                            {opt.label}
                          </span>
                          {opt.labelTh && opt.labelTh !== opt.label && (
                            <span style={{ color: "var(--primary)", fontSize: "0.72rem" }}>
                              / {opt.labelTh}
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemoveOption(idx, optIdx)}
                            style={{
                              background: "none",
                              border: "none",
                              color: "#ef4444",
                              cursor: "pointer",
                              padding: "0 2px",
                              fontSize: "0.78rem",
                              display: "flex",
                              alignItems: "center",
                              marginLeft: "0.2rem",
                            }}
                            title="ลบตัวเลือกนี้"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontStyle: "italic", padding: "0.2rem 0" }}>
                      💡 ยังไม่มีตัวเลือก: กรุณาพิมพ์ตัวเลือกในช่องด้านบนแล้วกดปุ่ม "เพิ่มตัวเลือก" (หรือกด Enter)
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add Field generic button */}
      <div>
        <button
          type="button"
          onClick={() => addFieldOfType("details")}
          style={{
            padding: "0.45rem 0.85rem",
            fontSize: "0.82rem",
            borderRadius: "6px",
            background: "var(--primary-subtle)",
            color: "var(--primary)",
            border: "1px solid var(--primary)",
            cursor: "pointer",
            fontWeight: 600,
            display: "inline-flex",
            alignItems: "center",
            gap: "0.35rem",
          }}
        >
          <Plus size={14} />
          <span>+ เพิ่มฟิลด์ใหม่ (Add Field)</span>
        </button>
      </div>
    </div>
  );
};
