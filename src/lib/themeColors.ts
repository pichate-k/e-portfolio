export interface ThemeColorDef {
  id: string;
  name: string;
  nameTh: string;
  hex: string;
  gradient: string;
}

export const THEME_COLORS: ThemeColorDef[] = [
  {
    id: "orange",
    name: "Sunset Orange",
    nameTh: "ส้มพระอาทิตย์ (ค่าเริ่มต้น)",
    hex: "#ea580c",
    gradient: "linear-gradient(135deg, #ea580c 0%, #f59e0b 100%)",
  },
  {
    id: "blue",
    name: "Sapphire Blue",
    nameTh: "น้ำเงินไพลิน",
    hex: "#2563eb",
    gradient: "linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)",
  },
  {
    id: "emerald",
    name: "Emerald Green",
    nameTh: "เขียวมรกต",
    hex: "#059669",
    gradient: "linear-gradient(135deg, #059669 0%, #10b981 100%)",
  },
  {
    id: "violet",
    name: "Royal Violet",
    nameTh: "ม่วงรอยัล",
    hex: "#7c3aed",
    gradient: "linear-gradient(135deg, #7c3aed 0%, #c026d3 100%)",
  },
  {
    id: "rose",
    name: "Crimson Rose",
    nameTh: "แดงกุหลาบ",
    hex: "#e11d48",
    gradient: "linear-gradient(135deg, #e11d48 0%, #f97316 100%)",
  },
  {
    id: "teal",
    name: "Ocean Teal",
    nameTh: "ฟ้าอมเขียว",
    hex: "#0d9488",
    gradient: "linear-gradient(135deg, #0d9488 0%, #0284c7 100%)",
  },
  {
    id: "amber",
    name: "Amber Gold",
    nameTh: "ทองอำพัน",
    hex: "#d97706",
    gradient: "linear-gradient(135deg, #d97706 0%, #fbbf24 100%)",
  },
  {
    id: "slate",
    name: "Classic Slate",
    nameTh: "เทามินิมอล",
    hex: "#475569",
    gradient: "linear-gradient(135deg, #475569 0%, #94a3b8 100%)",
  },
];

export const DEFAULT_THEME_COLOR = "orange";

export function getSavedThemeColor(): string {
  if (typeof window === "undefined") return DEFAULT_THEME_COLOR;
  return localStorage.getItem("theme-color") || DEFAULT_THEME_COLOR;
}

export function applyThemeColor(colorId: string) {
  if (typeof window === "undefined") return;
  const isValid = THEME_COLORS.some((c) => c.id === colorId);
  const selected = isValid ? colorId : DEFAULT_THEME_COLOR;

  document.documentElement.setAttribute("data-color", selected);
  localStorage.setItem("theme-color", selected);
  window.dispatchEvent(
    new CustomEvent("theme-color-change", { detail: selected })
  );
}
