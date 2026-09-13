"use client";

import React, { useMemo } from "react";
import { Calendar, CheckCircle2, RotateCcw, Clock } from "lucide-react";

export const THAI_MONTHS = [
  "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
  "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."
];

export const ENG_MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

export interface MonthOption {
  value: string;
  short: string;
  fullTh: string;
  fullEn: string;
}

export const MONTH_OPTIONS: MonthOption[] = [
  { value: "01", short: "ม.ค.", fullTh: "มกราคม", fullEn: "January" },
  { value: "02", short: "ก.พ.", fullTh: "กุมภาพันธ์", fullEn: "February" },
  { value: "03", short: "มี.ค.", fullTh: "มีนาคม", fullEn: "March" },
  { value: "04", short: "เม.ย.", fullTh: "เมษายน", fullEn: "April" },
  { value: "05", short: "พ.ค.", fullTh: "พฤษภาคม", fullEn: "May" },
  { value: "06", short: "มิ.ย.", fullTh: "มิถุนายน", fullEn: "June" },
  { value: "07", short: "ก.ค.", fullTh: "กรกฎาคม", fullEn: "July" },
  { value: "08", short: "ส.ค.", fullTh: "สิงหาคม", fullEn: "August" },
  { value: "09", short: "ก.ย.", fullTh: "กันยายน", fullEn: "September" },
  { value: "10", short: "ต.ค.", fullTh: "ตุลาคม", fullEn: "October" },
  { value: "11", short: "พ.ย.", fullTh: "พฤศจิกายน", fullEn: "November" },
  { value: "12", short: "ธ.ค.", fullTh: "ธันวาคม", fullEn: "December" },
];

/**
 * Format a YYYY-MM string into a localized readable label
 * e.g. "2024-06" -> "มิ.ย. 2024" or "Jun 2024"
 */
export function formatMonthYearBadge(ym: string, isTh = true): string {
  if (!ym) return "";
  const match = ym.trim().match(/^(\d{4})-(\d{2})$/);
  if (!match) return ym;
  const year = parseInt(match[1], 10);
  const monthIdx = parseInt(match[2], 10) - 1;
  if (monthIdx >= 0 && monthIdx < 12) {
    if (isTh) {
      return `${THAI_MONTHS[monthIdx]} ${year}`;
    }
    return `${ENG_MONTHS[monthIdx]} ${year}`;
  }
  return ym;
}

/**
 * Safely splits a range string (e.g. "2020-01 - 2024-06", "2020 - 2024", "2020-01 - Present")
 * into startPart and endPart without splitting internal hyphens inside YYYY-MM dates.
 */
export function splitRangeString(val: string): { startPart: string; endPart: string } {
  if (!val) return { startPart: "", endPart: "" };
  const trimmed = val.trim();

  // 1. Two YYYY-MM without spaces, e.g. "2020-01-2024-06"
  const ymYmMatch = trimmed.match(/^(\d{4}-\d{2})\s*[-—–]\s*(\d{4}-\d{2})$/);
  if (ymYmMatch) {
    return { startPart: ymYmMatch[1], endPart: ymYmMatch[2] };
  }

  // 2. Two YYYY without spaces, e.g. "2020-2024"
  const yYMatch = trimmed.match(/^(\d{4})\s*[-—–]\s*(\d{4})$/);
  if (yYMatch) {
    return { startPart: yYMatch[1], endPart: yYMatch[2] };
  }

  // 3. Separated by spaces and dash/to, e.g. "2020-01 - 2024-06", "2020-01 - Present", "2020 - 2024", "ม.ค. 2020 — มิ.ย. 2024"
  if (/\s+[-—–]\s+|\s+to\s+/i.test(trimmed)) {
    const parts = trimmed.split(/\s+[-—–]\s+|\s+to\s+/i);
    return { startPart: parts[0]?.trim() || "", endPart: parts[1]?.trim() || "" };
  }

  // 4. Single value (could be "2024-05", "2024", "05", "May 2024", etc.)
  return { startPart: trimmed, endPart: "" };
}

/**
 * Extracts year (YYYY) and month (MM) from a date part string.
 * Supports "YYYY-MM", "YYYY", "MM", and localized strings ("ม.ค. 2024", "Jan 2024").
 */
export function parseDatePart(p: string): { year: string; month: string } {
  if (!p) return { year: "", month: "" };
  const str = p.trim();

  // 1. "YYYY-MM" (e.g. "2024-05")
  const ymMatch = str.match(/^(\d{4})-(\d{2})$/);
  if (ymMatch) {
    return { year: ymMatch[1], month: ymMatch[2] };
  }

  // 2. Single 4-digit year "YYYY" (e.g. "2024")
  if (/^\d{4}$/.test(str)) {
    return { year: str, month: "" };
  }

  // 3. Single 1-2 digit month "MM" or "M" (e.g. "05" or "5")
  if (/^\d{1,2}$/.test(str)) {
    const mNum = parseInt(str, 10);
    if (mNum >= 1 && mNum <= 12) {
      return { year: "", month: String(mNum).padStart(2, "0") };
    }
  }

  // 4. Formatted string like "ม.ค. 2024", "Jan 2024", "January 2024"
  let year = "";
  let month = "";

  const yMatch = str.match(/\b(\d{4})\b/);
  if (yMatch) {
    year = yMatch[1];
  }

  for (const m of MONTH_OPTIONS) {
    if (
      str.includes(m.short) ||
      str.includes(m.fullTh) ||
      str.toLowerCase().includes(m.fullEn.toLowerCase()) ||
      str.toLowerCase().includes(m.fullEn.slice(0, 3).toLowerCase())
    ) {
      month = m.value;
      break;
    }
  }

  return { year, month };
}

/**
 * Format any date/year range string into a friendly localized string
 * e.g. "2020-01 - 2024-06" -> "ม.ค. 2020 — มิ.ย. 2024"
 *      "2020-01 - Present" -> "ม.ค. 2020 — ปัจจุบัน"
 */
export function formatDateRangeBadge(val: string, isTh = true): string {
  if (!val) return "";
  const { startPart, endPart } = splitRangeString(val);

  const formatSingle = (p: string): string => {
    if (!p) return "";
    if (p.toLowerCase() === "present" || p === "ปัจจุบัน") {
      return isTh ? "ปัจจุบัน" : "Present";
    }
    const { year, month } = parseDatePart(p);
    if (year && month) {
      const monthIdx = parseInt(month, 10) - 1;
      if (monthIdx >= 0 && monthIdx < 12) {
        const mName = isTh ? THAI_MONTHS[monthIdx] : ENG_MONTHS[monthIdx];
        const yStr = isTh ? `${year} (พ.ศ. ${Number(year) + 543})` : year;
        return `${mName} ${yStr}`;
      }
      return `${month}/${year}`;
    }
    if (year) {
      return isTh ? `${year} (พ.ศ. ${Number(year) + 543})` : year;
    }
    if (month) {
      const monthIdx = parseInt(month, 10) - 1;
      if (monthIdx >= 0 && monthIdx < 12) {
        return isTh ? THAI_MONTHS[monthIdx] : ENG_MONTHS[monthIdx];
      }
      return month;
    }
    return p;
  };

  const startFmt = formatSingle(startPart);
  const endFmt = formatSingle(endPart);

  if (startFmt && endFmt) return `${startFmt} — ${endFmt}`;
  if (startFmt) return startFmt;
  if (endFmt) return endFmt;
  return val;
}

// Generate a list of years from currentYear + 5 down to 1960
export function getYearOptions(minYear = 1960, forwardYears = 5): number[] {
  const currentYear = new Date().getFullYear();
  const maxYear = currentYear + forwardYears;
  const years: number[] = [];
  for (let y = maxYear; y >= minYear; y--) {
    years.push(y);
  }
  return years;
}

// -------------------------------------------------------------
// 1. YearPickerInput: Single Year Selection Tool
// -------------------------------------------------------------
export interface YearPickerInputProps {
  value: string;
  onChange: (val: string) => void;
  lang?: "th" | "en";
  id?: string;
  placeholder?: string;
}

export const YearPickerInput: React.FC<YearPickerInputProps> = ({
  value,
  onChange,
  lang = "th",
  id,
  placeholder,
}) => {
  const isTh = lang === "th";
  const currentYear = new Date().getFullYear();
  const yearOptions = useMemo(() => getYearOptions(1960, 5), []);

  const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(e.target.value);
  };

  const setThisYear = () => {
    onChange(String(currentYear));
  };

  const handleClear = () => {
    onChange("");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <div style={{ position: "relative", flex: 1 }}>
          <div
            style={{
              position: "absolute",
              left: "0.85rem",
              top: "50%",
              transform: "translateY(-50%)",
              pointerEvents: "none",
              color: "var(--primary)",
              display: "flex",
              alignItems: "center",
            }}
          >
            <Calendar size={16} />
          </div>
          <select
            id={id}
            value={value || ""}
            onChange={handleSelect}
            style={{
              width: "100%",
              padding: "0.7rem 1rem 0.7rem 2.4rem",
              borderRadius: "var(--radius-md, 8px)",
              border: "1px solid var(--border-strong, #3b82f644)",
              background: "var(--bg-main, #0f172a)",
              color: value ? "var(--text-primary, #fff)" : "var(--text-muted, #94a3b8)",
              fontSize: "0.92rem",
              cursor: "pointer",
              outline: "none",
            }}
          >
            <option value="">
              {placeholder || (isTh ? "-- เลือกปี (Calendar Selection) --" : "-- Select Year --")}
            </option>
            {/* If value is custom and not in list */}
            {value && !yearOptions.includes(Number(value)) && (
              <option value={value}>{value} (ระบุเอง)</option>
            )}
            {yearOptions.map((y) => (
              <option key={y} value={String(y)}>
                {isTh ? `${y} (พ.ศ. ${y + 543})` : `${y} (B.E. ${y + 543})`}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={setThisYear}
          title={isTh ? "เลือกปีปัจจุบัน" : "Set to this year"}
          style={{
            padding: "0.68rem 0.85rem",
            borderRadius: "var(--radius-md, 8px)",
            border: "1px solid var(--border-strong, #3b82f644)",
            background: "var(--bg-secondary, #1e293b)",
            color: "var(--text-primary, #fff)",
            fontSize: "0.8rem",
            cursor: "pointer",
            whiteSpace: "nowrap",
            fontWeight: 500,
            display: "inline-flex",
            alignItems: "center",
            gap: "0.35rem",
          }}
        >
          <span>ปีปัจจุบัน ({currentYear})</span>
        </button>

        {value && (
          <button
            type="button"
            onClick={handleClear}
            title={isTh ? "ล้างค่า" : "Clear"}
            style={{
              padding: "0.68rem 0.75rem",
              borderRadius: "var(--radius-md, 8px)",
              border: "1px solid var(--border-subtle, #334155)",
              background: "transparent",
              color: "var(--text-muted, #94a3b8)",
              cursor: "pointer",
              fontSize: "0.8rem",
            }}
          >
            <RotateCcw size={14} />
          </button>
        )}
      </div>

      {value && (
        <div style={{ fontSize: "0.78rem", color: "var(--text-muted, #94a3b8)", display: "flex", alignItems: "center", gap: "0.35rem" }}>
          <span>ปีที่เลือก:</span>
          <strong style={{ color: "var(--primary, #38bdf8)" }}>
            {value} {/^\d{4}$/.test(value) && isTh ? `(พ.ศ. ${Number(value) + 543})` : ""}
          </strong>
        </div>
      )}
    </div>
  );
};

// -------------------------------------------------------------
// 2. YearRangePickerInput: Start Year & End Year (เลือกหัว-ท้าย)
// -------------------------------------------------------------
export interface YearRangePickerInputProps {
  value: string;
  onChange: (val: string) => void;
  lang?: "th" | "en";
  id?: string;
}

export const YearRangePickerInput: React.FC<YearRangePickerInputProps> = ({
  value,
  onChange,
  lang = "th",
}) => {
  const isTh = lang === "th";
  const currentYear = new Date().getFullYear();
  const yearOptions = useMemo(() => getYearOptions(1960, 5), []);

  // Parse existing value: e.g. "2020 - 2024" or "2020 - Present" or "2020 - ปัจจุบัน"
  const parsed = useMemo(() => {
    if (!value) return { start: "", end: "", isCurrent: false };
    const parts = value.split("-").map((s) => s.trim());
    const start = parts[0] || "";
    const endPart = parts[1] || "";
    const isCurrent =
      endPart.toLowerCase() === "present" || endPart === "ปัจจุบัน";
    const end = isCurrent ? "" : endPart;
    return { start, end, isCurrent };
  }, [value]);

  const updateRange = (newStart: string, newEnd: string, newIsCurrent: boolean) => {
    if (!newStart && !newEnd && !newIsCurrent) {
      onChange("");
      return;
    }
    if (newIsCurrent) {
      const ongoingLabel = isTh ? "ปัจจุบัน" : "Present";
      onChange(newStart ? `${newStart} - ${ongoingLabel}` : ongoingLabel);
    } else if (newStart && newEnd) {
      onChange(`${newStart} - ${newEnd}`);
    } else if (newStart) {
      onChange(newStart);
    } else if (newEnd) {
      onChange(newEnd);
    } else {
      onChange("");
    }
  };

  const handleStartChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateRange(e.target.value, parsed.end, parsed.isCurrent);
  };

  const handleEndChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateRange(parsed.start, e.target.value, false);
  };

  const handleCurrentToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateRange(parsed.start, parsed.end, e.target.checked);
  };

  return (
    <div
      style={{
        padding: "0.85rem",
        borderRadius: "var(--radius-md, 8px)",
        background: "var(--bg-secondary, #1e293b)",
        border: "1px solid var(--border-subtle, #334155)",
        display: "flex",
        flexDirection: "column",
        gap: "0.75rem",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr auto 1fr",
          alignItems: "center",
          gap: "0.6rem",
        }}
      >
        {/* หัว: ปีเริ่มต้น */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
          <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--text-secondary, #cbd5e1)", display: "flex", alignItems: "center", gap: "0.3rem" }}>
            <span style={{ color: "var(--primary, #38bdf8)" }}>หัว:</span> ปีเริ่มต้น
          </label>
          <div style={{ position: "relative" }}>
            <Calendar size={14} style={{ position: "absolute", left: "0.65rem", top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "var(--primary, #38bdf8)" }} />
            <select
              value={parsed.start}
              onChange={handleStartChange}
              style={{
                width: "100%",
                padding: "0.6rem 0.6rem 0.6rem 2rem",
                borderRadius: "var(--radius-sm, 6px)",
                border: "1px solid var(--border-strong, #3b82f644)",
                background: "var(--bg-main, #0f172a)",
                color: parsed.start ? "var(--text-primary, #fff)" : "var(--text-muted, #94a3b8)",
                fontSize: "0.86rem",
                cursor: "pointer",
                outline: "none",
              }}
            >
              <option value="">-- เลือกปีเริ่ม --</option>
              {parsed.start && !yearOptions.includes(Number(parsed.start)) && (
                <option value={parsed.start}>{parsed.start}</option>
              )}
              {yearOptions.map((y) => (
                <option key={y} value={String(y)}>
                  {y} {isTh ? `(พ.ศ. ${y + 543})` : ""}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Separator */}
        <div style={{ color: "var(--text-muted, #94a3b8)", fontWeight: 700, paddingTop: "1rem", fontSize: "0.95rem" }}>
          —
        </div>

        {/* ท้าย: ปีสิ้นสุด */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
          <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--text-secondary, #cbd5e1)", display: "flex", alignItems: "center", gap: "0.3rem" }}>
            <span style={{ color: "#ec4899" }}>ท้าย:</span> {parsed.isCurrent ? "ถึงปัจจุบัน" : "ปีสิ้นสุด"}
          </label>
          <div style={{ position: "relative" }}>
            <Calendar size={14} style={{ position: "absolute", left: "0.65rem", top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: parsed.isCurrent ? "var(--text-muted)" : "#ec4899" }} />
            <select
              value={parsed.end}
              disabled={parsed.isCurrent}
              onChange={handleEndChange}
              style={{
                width: "100%",
                padding: "0.6rem 0.6rem 0.6rem 2rem",
                borderRadius: "var(--radius-sm, 6px)",
                border: "1px solid var(--border-strong, #3b82f644)",
                background: parsed.isCurrent ? "rgba(15, 23, 42, 0.5)" : "var(--bg-main, #0f172a)",
                color: parsed.isCurrent ? "var(--text-muted, #64748b)" : parsed.end ? "var(--text-primary, #fff)" : "var(--text-muted, #94a3b8)",
                fontSize: "0.86rem",
                cursor: parsed.isCurrent ? "not-allowed" : "pointer",
                outline: "none",
              }}
            >
              <option value="">{parsed.isCurrent ? "ปัจจุบัน (Present)" : "-- เลือกปีจบ --"}</option>
              {parsed.end && !yearOptions.includes(Number(parsed.end)) && (
                <option value={parsed.end}>{parsed.end}</option>
              )}
              {yearOptions.map((y) => (
                <option key={y} value={String(y)}>
                  {y} {isTh ? `(พ.ศ. ${y + 543})` : ""}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Bottom controls: Checkbox "ถึงปัจจุบัน" & Result Preview */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem", borderTop: "1px dashed var(--border-subtle, #334155)", paddingTop: "0.6rem" }}>
        <label
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.45rem",
            cursor: "pointer",
            fontSize: "0.82rem",
            color: parsed.isCurrent ? "var(--primary, #38bdf8)" : "var(--text-secondary, #cbd5e1)",
            fontWeight: 500,
          }}
        >
          <input
            type="checkbox"
            checked={parsed.isCurrent}
            onChange={handleCurrentToggle}
            style={{ width: "15px", height: "15px", accentColor: "var(--primary, #38bdf8)", cursor: "pointer" }}
          />
          <span>ยังดำเนินอยู่ / ถึงปัจจุบัน (Present)</span>
        </label>

        {value ? (
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.8rem", background: "rgba(56, 189, 248, 0.12)", color: "var(--primary, #38bdf8)", padding: "0.2rem 0.6rem", borderRadius: "999px", fontWeight: 600 }}>
            <span>⏳ {value}</span>
            <button
              type="button"
              onClick={() => onChange("")}
              style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", padding: "0 0.1rem", fontSize: "0.85rem", lineHeight: 1 }}
              title="ล้างค่า"
            >
              ×
            </button>
          </div>
        ) : (
          <span style={{ fontSize: "0.78rem", color: "var(--text-muted, #64748b)" }}>ยังไม่ได้ระบุช่วงปี</span>
        )}
      </div>
    </div>
  );
};

// -------------------------------------------------------------
// 3. DateRangePickerInput: 4-Way Month & Year Selector
//    - เดือน (เริ่มต้น)
//    - ปี (เริ่มต้น)
//    - เดือน (สิ้นสุด)
//    - ปี (สิ้นสุด)
//    - ไม่บังคับใส่ข้อมูล (Optional)
// -------------------------------------------------------------
export interface DateRangePickerInputProps {
  value: string;
  onChange: (val: string) => void;
  lang?: "th" | "en";
  id?: string;
}

export const DateRangePickerInput: React.FC<DateRangePickerInputProps> = ({
  value,
  onChange,
  lang = "th",
}) => {
  const isTh = lang === "th";
  const yearOptions = useMemo(() => getYearOptions(1960, 5), []);

  // Parse existing value: e.g. "2020-01 - 2024-06" or "2020-01 - Present" or "2020 - 2024"
  const parsed = useMemo(() => {
    if (!value) {
      return { startMonth: "", startYear: "", endMonth: "", endYear: "", isCurrent: false };
    }
    const { startPart, endPart } = splitRangeString(value);

    const isCurrent =
      endPart.toLowerCase() === "present" || endPart === "ปัจจุบัน";

    const { year: sYear, month: sMonth } = parseDatePart(startPart);
    const { year: eYear, month: eMonth } = isCurrent
      ? { year: "", month: "" }
      : parseDatePart(endPart);

    return {
      startMonth: sMonth,
      startYear: sYear,
      endMonth: eMonth,
      endYear: eYear,
      isCurrent,
    };
  }, [value]);

  const updateRange = (
    sMonth: string,
    sYear: string,
    eMonth: string,
    eYear: string,
    current: boolean
  ) => {
    // Start part
    let startStr = "";
    if (sYear && sMonth) {
      startStr = `${sYear}-${sMonth}`;
    } else if (sYear) {
      startStr = sYear;
    } else if (sMonth) {
      startStr = sMonth;
    }

    // End part
    let endStr = "";
    if (current) {
      endStr = "Present";
    } else if (eYear && eMonth) {
      endStr = `${eYear}-${eMonth}`;
    } else if (eYear) {
      endStr = eYear;
    } else if (eMonth) {
      endStr = eMonth;
    }

    if (!startStr && !endStr) {
      onChange("");
      return;
    }

    if (startStr && endStr) {
      onChange(`${startStr} - ${endStr}`);
    } else if (startStr) {
      onChange(startStr);
    } else if (endStr) {
      onChange(endStr);
    }
  };

  const handleStartMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateRange(e.target.value, parsed.startYear, parsed.endMonth, parsed.endYear, parsed.isCurrent);
  };

  const handleStartYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateRange(parsed.startMonth, e.target.value, parsed.endMonth, parsed.endYear, parsed.isCurrent);
  };

  const handleEndMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateRange(parsed.startMonth, parsed.startYear, e.target.value, parsed.endYear, false);
  };

  const handleEndYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateRange(parsed.startMonth, parsed.startYear, parsed.endMonth, e.target.value, false);
  };

  const handleCurrentToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateRange(parsed.startMonth, parsed.startYear, parsed.endMonth, parsed.endYear, e.target.checked);
  };

  const formattedDisplay = formatDateRangeBadge(value, isTh);

  const selectStyle: React.CSSProperties = {
    width: "100%",
    padding: "0.55rem 0.65rem",
    borderRadius: "var(--radius-sm, 6px)",
    border: "1px solid var(--border-strong, #3b82f644)",
    background: "var(--bg-main, #0f172a)",
    color: "var(--text-primary, #fff)",
    fontSize: "0.85rem",
    cursor: "pointer",
    outline: "none",
  };

  const disabledSelectStyle: React.CSSProperties = {
    ...selectStyle,
    background: "rgba(15, 23, 42, 0.5)",
    color: "var(--text-muted, #64748b)",
    cursor: "not-allowed",
    opacity: 0.6,
  };

  return (
    <div
      style={{
        padding: "0.85rem",
        borderRadius: "var(--radius-md, 8px)",
        background: "var(--bg-secondary, #1e293b)",
        border: "1px solid var(--border-subtle, #334155)",
        display: "flex",
        flexDirection: "column",
        gap: "0.75rem",
      }}
    >
      {/* 1. ส่วนหัว: เริ่มต้น (Start Date) - แยกเดือน กับ ปี */}
      <div
        style={{
          background: "rgba(15, 23, 42, 0.4)",
          padding: "0.65rem 0.75rem",
          borderRadius: "6px",
          border: "1px solid var(--border-subtle, #334155)",
          display: "flex",
          flexDirection: "column",
          gap: "0.45rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--primary, #38bdf8)", display: "flex", alignItems: "center", gap: "0.35rem" }}>
            <span>🟢</span> {isTh ? "เริ่มต้น (Start Date)" : "Start Date"}
          </span>
          <span style={{ fontSize: "0.7rem", color: "var(--text-muted, #94a3b8)" }}>
            {isTh ? "(ไม่บังคับ)" : "(Optional)"}
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
          {/* 1.1 เดือน (เริ่มต้น) */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
            <label style={{ fontSize: "0.74rem", color: "var(--text-secondary, #cbd5e1)", display: "flex", alignItems: "center", gap: "0.25rem" }}>
              <Clock size={12} style={{ color: "var(--primary, #38bdf8)" }} />
              <span>{isTh ? "เดือน (เริ่มต้น)" : "Start Month"}</span>
            </label>
            <select
              value={parsed.startMonth}
              onChange={handleStartMonthChange}
              style={{
                ...selectStyle,
                color: parsed.startMonth ? "var(--text-primary, #fff)" : "var(--text-muted, #94a3b8)",
              }}
            >
              <option value="">{isTh ? "-- เลือกเดือน --" : "-- Select Month --"}</option>
              {MONTH_OPTIONS.map((m) => (
                <option key={m.value} value={m.value}>
                  {isTh ? `${m.short} (${m.fullTh})` : `${m.short} (${m.fullEn})`}
                </option>
              ))}
            </select>
          </div>

          {/* 1.2 ปี (เริ่มต้น) */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
            <label style={{ fontSize: "0.74rem", color: "var(--text-secondary, #cbd5e1)", display: "flex", alignItems: "center", gap: "0.25rem" }}>
              <Calendar size={12} style={{ color: "var(--primary, #38bdf8)" }} />
              <span>{isTh ? "ปี (เริ่มต้น)" : "Start Year"}</span>
            </label>
            <select
              value={parsed.startYear}
              onChange={handleStartYearChange}
              style={{
                ...selectStyle,
                color: parsed.startYear ? "var(--text-primary, #fff)" : "var(--text-muted, #94a3b8)",
              }}
            >
              <option value="">{isTh ? "-- เลือกปี --" : "-- Select Year --"}</option>
              {parsed.startYear && !yearOptions.includes(Number(parsed.startYear)) && (
                <option value={parsed.startYear}>{parsed.startYear}</option>
              )}
              {yearOptions.map((y) => (
                <option key={y} value={String(y)}>
                  {y} {isTh ? `(พ.ศ. ${y + 543})` : ""}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 2. ส่วนท้าย: สิ้นสุด (End Date) - แยกเดือน กับ ปี */}
      <div
        style={{
          background: parsed.isCurrent ? "rgba(15, 23, 42, 0.2)" : "rgba(15, 23, 42, 0.4)",
          padding: "0.65rem 0.75rem",
          borderRadius: "6px",
          border: "1px solid var(--border-subtle, #334155)",
          display: "flex",
          flexDirection: "column",
          gap: "0.45rem",
          opacity: parsed.isCurrent ? 0.75 : 1,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: "0.78rem", fontWeight: 600, color: parsed.isCurrent ? "var(--text-muted)" : "#ec4899", display: "flex", alignItems: "center", gap: "0.35rem" }}>
            <span>🔴</span> {isTh ? "สิ้นสุด (End Date)" : "End Date"}
          </span>
          <span style={{ fontSize: "0.7rem", color: "var(--text-muted, #94a3b8)" }}>
            {parsed.isCurrent ? (isTh ? "กำลังดำเนินอยู่ (Present)" : "Ongoing") : (isTh ? "(ไม่บังคับ)" : "(Optional)")}
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
          {/* 2.1 เดือน (สิ้นสุด) */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
            <label style={{ fontSize: "0.74rem", color: "var(--text-secondary, #cbd5e1)", display: "flex", alignItems: "center", gap: "0.25rem" }}>
              <Clock size={12} style={{ color: parsed.isCurrent ? "var(--text-muted)" : "#ec4899" }} />
              <span>{isTh ? "เดือน (สิ้นสุด)" : "End Month"}</span>
            </label>
            <select
              value={parsed.endMonth}
              disabled={parsed.isCurrent}
              onChange={handleEndMonthChange}
              style={
                parsed.isCurrent
                  ? disabledSelectStyle
                  : {
                      ...selectStyle,
                      color: parsed.endMonth ? "var(--text-primary, #fff)" : "var(--text-muted, #94a3b8)",
                    }
              }
            >
              <option value="">
                {parsed.isCurrent ? (isTh ? "ปัจจุบัน (Present)" : "Present") : (isTh ? "-- เลือกเดือน --" : "-- Select Month --")}
              </option>
              {!parsed.isCurrent &&
                MONTH_OPTIONS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {isTh ? `${m.short} (${m.fullTh})` : `${m.short} (${m.fullEn})`}
                  </option>
                ))}
            </select>
          </div>

          {/* 2.2 ปี (สิ้นสุด) */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
            <label style={{ fontSize: "0.74rem", color: "var(--text-secondary, #cbd5e1)", display: "flex", alignItems: "center", gap: "0.25rem" }}>
              <Calendar size={12} style={{ color: parsed.isCurrent ? "var(--text-muted)" : "#ec4899" }} />
              <span>{isTh ? "ปี (สิ้นสุด)" : "End Year"}</span>
            </label>
            <select
              value={parsed.endYear}
              disabled={parsed.isCurrent}
              onChange={handleEndYearChange}
              style={
                parsed.isCurrent
                  ? disabledSelectStyle
                  : {
                      ...selectStyle,
                      color: parsed.endYear ? "var(--text-primary, #fff)" : "var(--text-muted, #94a3b8)",
                    }
              }
            >
              <option value="">
                {parsed.isCurrent ? (isTh ? "ปัจจุบัน (Present)" : "Present") : (isTh ? "-- เลือกปี --" : "-- Select Year --")}
              </option>
              {!parsed.isCurrent &&
                parsed.endYear &&
                !yearOptions.includes(Number(parsed.endYear)) && (
                  <option value={parsed.endYear}>{parsed.endYear}</option>
                )}
              {!parsed.isCurrent &&
                yearOptions.map((y) => (
                  <option key={y} value={String(y)}>
                    {y} {isTh ? `(พ.ศ. ${y + 543})` : ""}
                  </option>
                ))}
            </select>
          </div>
        </div>
      </div>

      {/* Bottom controls: Checkbox "ถึงปัจจุบัน" & Formatted Result Chip */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "0.5rem",
          borderTop: "1px dashed var(--border-subtle, #334155)",
          paddingTop: "0.6rem",
        }}
      >
        <label
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.45rem",
            cursor: "pointer",
            fontSize: "0.82rem",
            color: parsed.isCurrent ? "var(--primary, #38bdf8)" : "var(--text-secondary, #cbd5e1)",
            fontWeight: 500,
          }}
        >
          <input
            type="checkbox"
            checked={parsed.isCurrent}
            onChange={handleCurrentToggle}
            style={{ width: "15px", height: "15px", accentColor: "var(--primary, #38bdf8)", cursor: "pointer" }}
          />
          <span>{isTh ? "ยังดำเนินอยู่ / ถึงปัจจุบัน (Present)" : "Currently ongoing / Present"}</span>
        </label>

        {value ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
              fontSize: "0.8rem",
              background: "rgba(56, 189, 248, 0.12)",
              color: "var(--primary, #38bdf8)",
              padding: "0.2rem 0.6rem",
              borderRadius: "999px",
              fontWeight: 600,
            }}
          >
            <span>🗓️ {formattedDisplay || value}</span>
            <button
              type="button"
              onClick={() => onChange("")}
              style={{
                background: "none",
                border: "none",
                color: "inherit",
                cursor: "pointer",
                padding: "0 0.1rem",
                fontSize: "0.85rem",
                lineHeight: 1,
              }}
              title={isTh ? "ล้างค่า" : "Clear"}
            >
              ×
            </button>
          </div>
        ) : (
          <span style={{ fontSize: "0.78rem", color: "var(--text-muted, #64748b)" }}>
            {isTh ? "ยังไม่ได้เลือกช่วงเวลา (ไม่บังคับ)" : "No date range selected (Optional)"}
          </span>
        )}
      </div>
    </div>
  );
};
