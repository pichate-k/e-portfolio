"use client";

import React, { useState, useEffect, useRef } from "react";
import { Palette, Check } from "lucide-react";
import {
  THEME_COLORS,
  getSavedThemeColor,
  applyThemeColor,
} from "@/lib/themeColors";
import { Language } from "@/lib/i18n";
import styles from "./ThemeColorPicker.module.css";

interface ThemeColorPickerProps {
  lang?: Language;
  align?: "left" | "right";
}

export const ThemeColorPicker: React.FC<ThemeColorPickerProps> = ({
  lang = "en",
  align = "right",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeColor, setActiveColor] = useState("orange");
  const [mounted, setMounted] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    const saved = getSavedThemeColor();
    setActiveColor(saved);

    const handleColorChange = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail) setActiveColor(detail);
    };

    window.addEventListener("theme-color-change", handleColorChange);
    return () => {
      window.removeEventListener("theme-color-change", handleColorChange);
    };
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const handleSelectColor = (colorId: string) => {
    setActiveColor(colorId);
    applyThemeColor(colorId);
    setIsOpen(false);
  };

  const currentColorDef = THEME_COLORS.find((c) => c.id === activeColor) || THEME_COLORS[0];

  if (!mounted) {
    return null;
  }

  return (
    <div className={styles.pickerWrapper} ref={popoverRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={styles.triggerBtn}
        aria-label={lang === "th" ? "เลือกโทนสีเว็บไซต์" : "Choose theme color"}
        title={lang === "th" ? `โทนสี: ${currentColorDef.nameTh}` : `Theme color: ${currentColorDef.name}`}
      >
        <Palette size={16} />
        <span
          className={styles.activeColorBadge}
          style={{ background: currentColorDef.hex }}
        />
      </button>

      {isOpen && (
        <div
          className={`${styles.popover} ${
            align === "left" ? styles.popoverAlignLeft : ""
          }`}
          role="dialog"
          aria-modal="true"
        >
          <div className={styles.header}>
            <span className={styles.title}>
              <Palette size={14} color="var(--primary)" />
              <span>{lang === "th" ? "เลือกโทนสีเว็บไซต์" : "Theme Color"}</span>
            </span>
          </div>

          <div className={styles.colorGrid}>
            {THEME_COLORS.map((color) => {
              const isActive = color.id === activeColor;
              const label = lang === "th" ? color.nameTh : color.name;

              return (
                <button
                  key={color.id}
                  type="button"
                  onClick={() => handleSelectColor(color.id)}
                  className={`${styles.colorOption} ${
                    isActive ? styles.colorOptionActive : ""
                  }`}
                  title={label}
                >
                  <span
                    className={styles.colorCircle}
                    style={{ background: color.gradient }}
                  />
                  <span className={styles.colorLabel}>{label}</span>
                  {isActive && <Check size={13} className={styles.checkIcon} />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
