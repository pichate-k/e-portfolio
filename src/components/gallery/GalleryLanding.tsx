"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Calendar,
  MapPin,
  Image as ImageIcon,
  ArrowRight,
  ArrowLeft,
  Search,
  Sparkles,
  Tag,
  FolderOpen,
} from "lucide-react";
import { Language } from "@/lib/i18n";
import styles from "./GalleryLanding.module.css";

export interface GalleryActivityItem {
  id: string;
  slug: string;
  title: string;
  titleTh?: string | null;
  description?: string | null;
  descriptionTh?: string | null;
  eventDate: string;
  location?: string | null;
  locationTh?: string | null;
  category?: string | null;
  coverImageUrl?: string | null;
  driveFolderId: string;
  photoCount?: number | null;
  isVisible: boolean;
  orderIndex: number;
}

interface GalleryLandingProps {
  initialActivities: GalleryActivityItem[];
}

export const GalleryLanding: React.FC<GalleryLandingProps> = ({
  initialActivities = [],
}) => {
  const [lang, setLang] = useState<Language>("th");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const isTh = lang === "th";

  // Categories list
  const categories = useMemo(() => {
    const set = new Set<string>();
    initialActivities.forEach((act) => {
      if (act.category) set.add(act.category);
    });
    return Array.from(set);
  }, [initialActivities]);

  // Total photos across activities
  const totalPhotos = useMemo(() => {
    return initialActivities.reduce(
      (sum, act) => sum + (act.photoCount || 0),
      0
    );
  }, [initialActivities]);

  // Filtered activities
  const filteredActivities = useMemo(() => {
    return initialActivities.filter((act) => {
      // Category filter
      if (selectedCategory !== "all" && act.category !== selectedCategory) {
        return false;
      }

      // Search filter
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const matchTitle =
        act.title.toLowerCase().includes(q) ||
        (act.titleTh && act.titleTh.toLowerCase().includes(q));
      const matchLoc =
        (act.location && act.location.toLowerCase().includes(q)) ||
        (act.locationTh && act.locationTh.toLowerCase().includes(q));
      const matchDesc =
        (act.description && act.description.toLowerCase().includes(q)) ||
        (act.descriptionTh && act.descriptionTh.toLowerCase().includes(q));
      const matchDate = act.eventDate.toLowerCase().includes(q);

      return matchTitle || matchLoc || matchDesc || matchDate;
    });
  }, [initialActivities, selectedCategory, searchQuery]);

  return (
    <div className={styles.galleryPage} lang={lang} data-lang={lang}>
      <div className={styles.glowTop} />
      <div className={styles.glowSphereRight} />

      <div className={styles.container}>
        {/* Top Control Bar */}
        <div className={styles.topNav}>
          <Link href="/" className={styles.backBtn}>
            <ArrowLeft size={16} />
            <span>{isTh ? "กลับหน้าหลัก Portfolio" : "Back to Portfolio"}</span>
          </Link>

          <div className={styles.langToggle}>
            <button
              type="button"
              onClick={() => setLang("en")}
              className={`${styles.langBtn} ${lang === "en" ? styles.langBtnActive : ""}`}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => setLang("th")}
              className={`${styles.langBtn} ${lang === "th" ? styles.langBtnActive : ""}`}
            >
              TH
            </button>
          </div>
        </div>

        {/* Hero Section */}
        <section className={styles.heroSection}>
          <div className={styles.badgePill}>
            <Sparkles size={13} />
            <span>
              {isTh
                ? `${initialActivities.length} กิจกรรม • ภาพถ่ายทั้งหมด ${totalPhotos}+ ภาพ`
                : `${initialActivities.length} Activities • Over ${totalPhotos}+ Photos`}
            </span>
          </div>

          <h1 className={styles.heroTitle}>
            {isTh
              ? "แกลเลอรีภาพกิจกรรมและผลงาน"
              : "Academic & Research Activity Gallery"}
          </h1>

          <p className={styles.heroDesc}>
            {isTh
              ? "ประมวลภาพถ่ายกิจกรรม การอบรมเชิงปฏิบัติการ การนำเสนอผลงานวิจัยระดับนานาชาติ และนวัตกรรมเทคโนโลยีปัญญาประดิษฐ์ จัดเก็บและเชื่อมต่อกับ Google Drive ประจำแต่ละกิจกรรม"
              : "A photographic retrospective of engineering workshops, international conference paper presentations, scientific exhibitions, and AI robotics demonstrations."}
          </p>
        </section>

        {/* Search & Category Filter Controls */}
        <div className={styles.controlsRow}>
          <div className={styles.searchBox}>
            <Search size={16} color="var(--muted-foreground)" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isTh ? "ค้นหากิจกรรม, สถานที่, วันที่..." : "Search activities, locations, dates..."}
              className={styles.searchInput}
            />
          </div>

          <div className={styles.categoriesList}>
            <button
              type="button"
              onClick={() => setSelectedCategory("all")}
              className={`${styles.catPill} ${
                selectedCategory === "all" ? styles.catPillActive : ""
              }`}
            >
              {isTh ? "ทั้งหมด" : "All Categories"}
            </button>

            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`${styles.catPill} ${
                  selectedCategory === cat ? styles.catPillActive : ""
                }`}
              >
                <Tag size={12} />
                <span>{cat}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Activities Grid */}
        {filteredActivities.length === 0 ? (
          <div className={styles.emptyState}>
            <FolderOpen size={40} style={{ margin: "0 auto 12px auto", opacity: 0.5 }} />
            <p style={{ fontSize: 16, fontWeight: 600, margin: "0 0 6px" }}>
              {isTh ? "ไม่พบกิจกรรมที่ตรงกับการค้นหา" : "No matching activities found"}
            </p>
            <span style={{ fontSize: 13 }}>
              {isTh ? "ลองเปลี่ยนคำค้นหาหรือเลือกหมวดหมู่อื่น" : "Try adjusting your search query or category filter."}
            </span>
          </div>
        ) : (
          <div className={styles.activitiesGrid}>
            {filteredActivities.map((act) => {
              const title = (isTh && act.titleTh) || act.title;
              const location = (isTh && act.locationTh) || act.location;
              const description = (isTh && act.descriptionTh) || act.description;

              const coverImage =
                act.coverImageUrl ||
                "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=80";

              return (
                <Link
                  key={act.id}
                  href={`/gallery/${act.slug}`}
                  className={styles.activityCard}
                >
                  {/* Cover Media */}
                  <div className={styles.coverContainer}>
                    <img
                      src={coverImage}
                      alt={title}
                      className={styles.coverImage}
                      loading="lazy"
                    />
                    <div className={styles.coverOverlay}>
                      <span className={styles.categoryTag}>
                        {act.category || "Activity"}
                      </span>
                      {act.photoCount ? (
                        <span className={styles.photoCountBadge}>
                          <ImageIcon size={12} />
                          <span>{act.photoCount} Photos</span>
                        </span>
                      ) : null}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className={styles.cardBody}>
                    <div>
                      <h2 className={styles.cardTitle}>{title}</h2>

                      <div className={styles.cardMetaGroup}>
                        <div className={styles.metaItem}>
                          <Calendar size={14} />
                          <span>{act.eventDate}</span>
                        </div>

                        {location && (
                          <div className={styles.metaItem}>
                            <MapPin size={14} />
                            <span>{location}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {description && (
                      <p className={styles.cardDesc}>{description}</p>
                    )}

                    {/* Footer Action */}
                    <div className={styles.cardFooter}>
                      <span>{isTh ? "เปิดดูภาพในอัลบั้ม" : "View Photo Album"}</span>
                      <span className={styles.viewAction}>
                        <span>{isTh ? "เข้าชมภาพ" : "Explore"}</span>
                        <ArrowRight size={14} />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        <footer
          style={{
            borderTop: "1px solid var(--border-subtle)",
            marginTop: "4rem",
            padding: "2rem 0 1rem 0",
            textAlign: "center",
            fontSize: "0.85rem",
            color: "var(--muted-foreground)",
          }}
        >
          <p style={{ fontSize: "0.8rem", opacity: 0.9 }}>
            © {new Date().getFullYear()} All rights reserved by Kunatechnology Co.,LTD
          </p>
        </footer>
      </div>
    </div>
  );
};
