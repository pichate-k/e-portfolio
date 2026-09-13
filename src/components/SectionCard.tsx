"use client";

import React, { useState } from "react";
import {
  GraduationCap,
  Briefcase,
  Cpu,
  BookOpen,
  Award,
  CheckCircle,
  FolderKanban,
  Layers,
  ExternalLink,
  Calendar,
  Building,
  MapPin,
  Image as ImageIcon,
  FileText,
  X,
} from "lucide-react";
import { Language, translations } from "@/lib/i18n";
import { renderRichText } from "@/lib/renderRichText";
import { formatDateRangeBadge } from "@/components/admin/CalendarInputs";
import styles from "./SectionCard.module.css";

interface CvItem {
  id: string;
  title: string;
  titleTh?: string | null;
  subtitle?: string | null;
  subtitleTh?: string | null;
  organization?: string | null;
  organizationTh?: string | null;
  location?: string | null;
  locationTh?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  isCurrent?: boolean;
  description?: string | null;
  descriptionTh?: string | null;
  url?: string | null;
  imageUrl?: string | null;
  customData?: string | null;
  tags?: string | null;
  orderIndex: number;
}

interface CvSection {
  id: string;
  slug: string;
  title: string;
  titleTh?: string | null;
  description?: string | null;
  descriptionTh?: string | null;
  icon?: string | null;
  contentType?: string | null;
  customFields?: string | null;
  items: CvItem[];
}

interface SectionCardProps {
  section: CvSection;
  lang: Language;
}

function getSectionIcon(icon?: string | null, slug?: string, contentType?: string | null) {
  if (icon && (icon.length <= 4 || /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u.test(icon))) {
    return <span style={{ fontSize: "1.45rem", lineHeight: 1, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>{icon}</span>;
  }
  const key = (icon || slug || "").toLowerCase();
  if (key.includes("grad") || key.includes("edu")) return <GraduationCap size={24} />;
  if (key.includes("brief") || key.includes("exp")) return <Briefcase size={24} />;
  if (key.includes("cpu") || key.includes("expert") || key.includes("skill"))
    return <Cpu size={24} />;
  if (key.includes("book") || key.includes("pub")) return <BookOpen size={24} />;
  if (key.includes("cert") || key.includes("train")) return <CheckCircle size={24} />;
  if (key.includes("project") || key.includes("kanban"))
    return <FolderKanban size={24} />;
  if (key.includes("award") || key.includes("honor") || key.includes("other"))
    return <Award size={24} />;
  if (contentType === "file") return <Award size={24} />;
  if (contentType === "link") return <ExternalLink size={24} />;
  return <Layers size={24} />;
}

export const SectionCard: React.FC<SectionCardProps> = ({ section, lang }) => {
  const t = translations[lang];
  const isTh = lang === "th";
  const [activeLightbox, setActiveLightbox] = useState<{ title: string; url: string } | null>(null);

  const secTitle = (isTh && section.titleTh) || section.title;
  const secDesc = (isTh && section.descriptionTh) || section.description;

  return (
    <section id={section.slug} className={styles.sectionWrapper}>
      <div className={styles.sectionHeader}>
        <div className={styles.headerLeft}>
          <div className={styles.iconBox}>
            {getSectionIcon(section.icon, section.slug, section.contentType)}
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.65rem", flexWrap: "wrap" }}>
              <h2 className={styles.sectionTitle}>{secTitle}</h2>
              {section.contentType === "file" && (
                <span
                  style={{
                    fontSize: "0.72rem",
                    background: "rgba(16, 185, 129, 0.12)",
                    color: "#10b981",
                    padding: "0.15rem 0.55rem",
                    borderRadius: "999px",
                    fontWeight: 600,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.3rem",
                  }}
                >
                  <CheckCircle size={12} /> {isTh ? "ไฟล์เอกสาร / เกียรติบัตร" : "Documents & Certificates"}
                </span>
              )}
              {section.contentType === "link" && (
                <span
                  style={{
                    fontSize: "0.72rem",
                    background: "rgba(14, 165, 233, 0.12)",
                    color: "#0ea5e9",
                    padding: "0.15rem 0.55rem",
                    borderRadius: "999px",
                    fontWeight: 600,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.3rem",
                  }}
                >
                  <ExternalLink size={12} /> {isTh ? "ลิงก์ผลงาน & สื่อวิชาการ" : "Links & Publications"}
                </span>
              )}
            </div>
            {secDesc && <p className={styles.sectionDesc}>{secDesc}</p>}
          </div>
        </div>
        <div className={styles.countBadge}>
          {section.items.length} {section.items.length === 1 ? t.entry : t.entries}
        </div>
      </div>

      {section.items.length === 0 ? (
        <div className={styles.emptyState}>{t.noEntries}</div>
      ) : (
        <div className={styles.itemsGrid}>
          {section.items.map((item) => {
            let cFields: Array<{
              id: string;
              label: string;
              labelTh?: string;
              type: string;
              role?: "header" | "sub_header" | "none";
              icon?: string;
            }> = [];
            try {
              cFields = section.customFields ? JSON.parse(section.customFields) : [];
            } catch {
              cFields = [];
            }

            let cData: Record<string, string> = {};
            try {
              cData = item.customData ? JSON.parse(item.customData) : {};
            } catch {
              cData = {};
            }

            // === 1. CUSTOM FIELDS RENDERING (Zero duplication, strict language separation) ===
            if (cFields && cFields.length > 0) {
              const getFieldVal = (f: {
                id: string;
                type: string;
                role?: string;
                options?: { value?: string; label: string; labelTh?: string }[];
              }) => {
                const isDateType = ["year", "year_range", "date_range", "date"].includes(f.type);
                const isTextType =
                  !isDateType &&
                  (["details", "textarea", "text", "address", "dropdown"].includes(f.type) ||
                    f.role === "header" ||
                    f.role === "sub_header");
                let raw = isTextType
                  ? (isTh ? (cData[`${f.id}_th`] || "") : (cData[f.id] || ""))
                  : (cData[f.id] || cData[`${f.id}_th`] || "");

                // If dropdown, map to language-specific label if options exist
                if (f.type === "dropdown" && raw && f.options && f.options.length > 0) {
                  const matched = f.options.find(
                    (o) => o.value === raw || o.label === raw || o.labelTh === raw
                  );
                  if (matched) {
                    return isTh ? (matched.labelTh || matched.label) : (matched.label || matched.labelTh);
                  }
                }
                return raw;
              };

              // Header field -> Card Title (strictly role === "header")
              const headerField = cFields.find((f) => f.role === "header");
              const titleVal = headerField ? getFieldVal(headerField) : "";

              // Date / Period field -> Header Badge
              const dateField = cFields.find((f) =>
                ["year", "year_range", "date_range", "date"].includes(f.type)
              );
              const rawDate = dateField ? getFieldVal(dateField) : "";
              const dateDisplay = rawDate ? formatDateRangeBadge(rawDate, isTh) : "";

              // Sub-header field -> Card Subtitle/Meta
              const subHeaderField = cFields.find((f) => f.role === "sub_header");
              const subHeaderVal = subHeaderField ? getFieldVal(subHeaderField) : "";

              // Body fields -> Only fields that are NOT header, NOT sub_header, and NOT the top date badge
              const bodyFields = cFields.filter((f) => {
                if (headerField && f.id === headerField.id) return false;
                if (subHeaderField && f.id === subHeaderField.id) return false;
                if (dateField && f.id === dateField.id) return false;
                const val = getFieldVal(f);
                return Boolean(val && val.trim());
              });

              // If there is no data at all in the current language for this item, do not render it
              const hasAnyContent = Boolean(
                (titleVal && titleVal.trim()) ||
                (subHeaderVal && subHeaderVal.trim()) ||
                (dateDisplay && dateDisplay.trim()) ||
                bodyFields.length > 0
              );
              if (!hasAnyContent) return null;

              return (
                <article key={item.id} className={styles.itemCard}>
                  {/* Header: Title & Date Badge */}
                  {(titleVal || dateDisplay) && (
                    <div className={styles.itemHeader}>
                      {titleVal && <h3 className={styles.itemTitle}>{titleVal}</h3>}
                      {dateDisplay && (
                        <span className={styles.dateBadge}>
                          <Calendar size={13} />
                          {dateDisplay}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Sub-header */}
                  {subHeaderVal && (
                    <div className={styles.itemMeta}>
                      <span className={styles.metaSubtitle}>{subHeaderVal}</span>
                    </div>
                  )}

                  {/* Body Fields */}
                  {bodyFields.length > 0 && (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.65rem",
                        marginTop: titleVal || subHeaderVal ? "0.85rem" : 0,
                        paddingTop: titleVal || subHeaderVal ? "0.85rem" : 0,
                        borderTop: titleVal || subHeaderVal ? "1px dashed var(--border-subtle)" : "none",
                      }}
                    >
                      {bodyFields.map((f) => {
                        const val = getFieldVal(f);
                        if (!val || !val.trim()) return null;

                        const iconBadge = f.icon ? (
                          <span style={{ fontSize: "0.95rem", lineHeight: 1 }}>{f.icon}</span>
                        ) : null;
                        const fieldLabel = (isTh && f.labelTh) ? f.labelTh : f.label;

                        // File / Upload
                        if (f.type === "upload" || f.type === "file") {
                          return (
                            <div
                              key={f.id}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "0.5rem",
                                flexWrap: "wrap",
                              }}
                            >
                              <span
                                style={{
                                  fontSize: "0.82rem",
                                  color: "var(--text-muted)",
                                  fontWeight: 500,
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "0.3rem",
                                }}
                              >
                                {iconBadge}
                                {fieldLabel}:
                              </span>
                              {val.startsWith("data:image/") || val.match(/\.(jpg|jpeg|png|webp|gif|svg)($|\?)/i) ? (
                                <button
                                  type="button"
                                  className={styles.certBtn}
                                  onClick={() =>
                                    setActiveLightbox({
                                      title: `${titleVal || "Attachment"} - ${fieldLabel}`,
                                      url: val,
                                    })
                                  }
                                >
                                  <ImageIcon size={14} />
                                  <span>{isTh ? "ดูรูปภาพแนบ" : "View Image"}</span>
                                </button>
                              ) : (
                                <a
                                  href={val}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={styles.certBtn}
                                  style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "0.35rem" }}
                                >
                                  <FileText size={14} />
                                  <span>{isTh ? "เปิดดูไฟล์ / เอกสาร" : "Open Document"}</span>
                                  <ExternalLink size={12} />
                                </a>
                              )}
                            </div>
                          );
                        }

                        // Link
                        if (f.type === "link") {
                          return (
                            <div
                              key={f.id}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "0.5rem",
                                flexWrap: "wrap",
                              }}
                            >
                              <span
                                style={{
                                  fontSize: "0.82rem",
                                  color: "var(--text-muted)",
                                  fontWeight: 500,
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "0.3rem",
                                }}
                              >
                                {iconBadge}
                                {fieldLabel}:
                              </span>
                              <a
                                href={val}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.itemLink}
                                style={{ marginTop: 0 }}
                              >
                                <span>
                                  {val.replace(/^https?:\/\//, "").slice(0, 35)}
                                  {val.replace(/^https?:\/\//, "").length > 35 ? "..." : ""}
                                </span>
                                <ExternalLink size={13} />
                              </a>
                            </div>
                          );
                        }

                        // Dropdown
                        if (f.type === "dropdown") {
                          return (
                            <div
                              key={f.id}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "0.5rem",
                                flexWrap: "wrap",
                              }}
                            >
                              <span
                                style={{
                                  fontSize: "0.82rem",
                                  color: "var(--text-muted)",
                                  fontWeight: 500,
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "0.3rem",
                                }}
                              >
                                {iconBadge}
                                {fieldLabel}:
                              </span>
                              <span
                                style={{
                                  fontSize: "0.82rem",
                                  fontWeight: 600,
                                  color: "var(--text-primary)",
                                  background: "var(--bg-secondary)",
                                  border: "1px solid var(--border-subtle)",
                                  padding: "0.15rem 0.6rem",
                                  borderRadius: "6px",
                                }}
                              >
                                {val}
                              </span>
                            </div>
                          );
                        }

                        // Address
                        if (f.type === "address") {
                          return (
                            <div
                              key={f.id}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "0.45rem",
                                fontSize: "0.85rem",
                                color: "var(--text-secondary)",
                              }}
                            >
                              <span style={{ display: "flex", alignItems: "center", gap: "0.3rem", color: "var(--text-muted)", fontWeight: 500 }}>
                                {iconBadge || <MapPin size={13} />}
                                {fieldLabel}:
                              </span>
                              <span style={{ fontWeight: 500, color: "var(--text-primary)" }}>{val}</span>
                            </div>
                          );
                        }

                        // Details / Textarea
                        if (f.type === "details" || f.type === "textarea") {
                          return (
                            <div
                              key={f.id}
                              style={{
                                fontSize: "0.85rem",
                                color: "var(--text-secondary)",
                                lineHeight: 1.6,
                              }}
                            >
                              <strong
                                style={{
                                  color: "var(--text-primary)",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "0.35rem",
                                  marginBottom: "0.25rem",
                                }}
                              >
                                {iconBadge}
                                {fieldLabel}:
                              </strong>
                              <div className={styles.itemDesc} style={{ marginTop: 0, paddingLeft: "0.2rem" }}>
                                {renderRichText(val)}
                              </div>
                            </div>
                          );
                        }

                        // Default / Badges
                        const displayVal =
                          f.type === "date_range" || f.type === "year_range" || f.type === "date"
                            ? formatDateRangeBadge(val, isTh)
                            : val;
                        return (
                          <div
                            key={f.id}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "0.5rem",
                              flexWrap: "wrap",
                            }}
                          >
                            <span
                              style={{
                                fontSize: "0.82rem",
                                color: "var(--text-muted)",
                                fontWeight: 500,
                                display: "flex",
                                alignItems: "center",
                                gap: "0.3rem",
                              }}
                            >
                              {iconBadge}
                              {fieldLabel}:
                            </span>
                            <span
                              style={{
                                fontSize: "0.8rem",
                                background: "var(--bg-elevated)",
                                border: "1px solid var(--border-subtle)",
                                padding: "0.18rem 0.6rem",
                                borderRadius: "999px",
                                color: "var(--primary)",
                                fontWeight: 600,
                              }}
                            >
                              {displayVal}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </article>
              );
            }

            // === 2. LEGACY SECTION FALLBACK (Only for sections without customFields) ===
            const itemTitle = (isTh && item.titleTh) || item.title;
            const itemSubtitle = (isTh && item.subtitleTh) || item.subtitle;
            const itemOrg = (isTh && item.organizationTh) || item.organization;
            const itemLoc = (isTh && item.locationTh) || item.location;
            const itemDesc = (isTh && item.descriptionTh) || item.description;

            let dateDisplay = "";
            if (item.startDate) {
              dateDisplay = item.isCurrent
                ? `${item.startDate} — ${t.present}`
                : item.endDate
                ? `${item.startDate} — ${item.endDate}`
                : item.startDate;
            }

            const tagList = item.tags
              ? item.tags
                  .split(",")
                  .map((t) => t.trim())
                  .filter(Boolean)
              : [];

            return (
              <article key={item.id} className={styles.itemCard}>
                <div className={styles.itemHeader}>
                  <h3 className={styles.itemTitle}>{itemTitle}</h3>
                  {dateDisplay && (
                    <span
                      className={`${styles.dateBadge} ${
                        item.isCurrent ? styles.dateBadgeCurrent : ""
                      }`}
                    >
                      <Calendar size={13} />
                      {dateDisplay}
                    </span>
                  )}
                </div>

                <div className={styles.itemMeta}>
                  {itemSubtitle && (
                    <span className={styles.metaSubtitle}>{itemSubtitle}</span>
                  )}
                  {itemSubtitle && (itemOrg || itemLoc) && (
                    <span className={styles.metaDot} />
                  )}
                  {itemOrg && (
                    <span className={styles.metaItem}>
                      <Building size={14} />
                      {itemOrg}
                    </span>
                  )}
                  {itemOrg && itemLoc && <span className={styles.metaDot} />}
                  {itemLoc && (
                    <span className={styles.metaItem}>
                      <MapPin size={14} />
                      {itemLoc}
                    </span>
                  )}
                </div>

                {itemDesc && (
                  <div className={styles.itemDesc}>
                    {renderRichText(itemDesc)}
                  </div>
                )}

                {tagList.length > 0 && (
                  <div className={styles.tagsRow}>
                    {tagList.map((tag, idx) => (
                      <span key={idx} className={styles.tagPill}>
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Certificate / Attachment preview button */}
                {item.imageUrl && (
                  <div className={styles.attachmentRow}>
                    <button
                      type="button"
                      className={styles.certBtn}
                      onClick={() =>
                        setActiveLightbox({
                          title: itemTitle,
                          url: item.imageUrl!,
                        })
                      }
                    >
                      <img
                        src={item.imageUrl}
                        alt=""
                        className={styles.certThumb}
                      />
                      <ImageIcon size={15} />
                      <span>
                        {isTh
                          ? "ดูเอกสาร / ใบประกาศนียบัตร"
                          : "View Certificate / Attachment"}
                      </span>
                    </button>
                  </div>
                )}

                {item.url && (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.itemLink}
                  >
                    <span>{t.viewRef}</span>
                    <ExternalLink size={14} />
                  </a>
                )}
              </article>
            );
          })}
        </div>
      )}

      {/* Lightbox Modal */}
      {activeLightbox && (
        <div
          className={styles.lightboxOverlay}
          onClick={() => setActiveLightbox(null)}
        >
          <div
            className={styles.lightboxBox}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.lightboxHeader}>
              <h3 className={styles.lightboxTitle}>
                {activeLightbox.title}
              </h3>
              <button
                type="button"
                className={styles.lightboxClose}
                onClick={() => setActiveLightbox(null)}
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>
            <img
              src={activeLightbox.url}
              alt={activeLightbox.title}
              className={styles.lightboxImage}
            />
          </div>
        </div>
      )}
    </section>
  );
};
