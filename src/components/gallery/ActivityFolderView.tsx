"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Calendar,
  MapPin,
  Image as ImageIcon,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  X,
  Download,
  ZoomIn,
  ZoomOut,
  Maximize2,
  ExternalLink,
  Folder,
  Tag,
  Sparkles,
} from "lucide-react";
import { Language } from "@/lib/i18n";
import { DriveImageFile } from "@/lib/googleDrive";
import { GalleryActivityItem } from "./GalleryLanding";
import styles from "./ActivityFolderView.module.css";

interface ActivityFolderViewProps {
  activity: GalleryActivityItem;
  initialFiles: DriveImageFile[];
  folderName?: string;
  driveError?: string;
}

export const ActivityFolderView: React.FC<ActivityFolderViewProps> = ({
  activity,
  initialFiles = [],
  folderName,
  driveError,
}) => {
  const [lang, setLang] = useState<Language>("th");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  const isTh = lang === "th";
  const title = (isTh && activity.titleTh) || activity.title;
  const location = (isTh && activity.locationTh) || activity.location;
  const description = (isTh && activity.descriptionTh) || activity.description;

  const activePhoto =
    lightboxIndex !== null ? initialFiles[lightboxIndex] : null;

  // Open Lightbox
  const handleOpenLightbox = (index: number) => {
    setLightboxIndex(index);
    setZoomLevel(1);
  };

  // Close Lightbox
  const handleCloseLightbox = () => {
    setLightboxIndex(null);
    setZoomLevel(1);
  };

  // Navigate Next
  const handleNext = useCallback(() => {
    if (lightboxIndex === null || initialFiles.length === 0) return;
    setLightboxIndex((prev) => ((prev ?? 0) + 1) % initialFiles.length);
    setZoomLevel(1);
  }, [lightboxIndex, initialFiles.length]);

  // Navigate Prev
  const handlePrev = useCallback(() => {
    if (lightboxIndex === null || initialFiles.length === 0) return;
    setLightboxIndex((prev) =>
      (prev ?? 0) === 0 ? initialFiles.length - 1 : (prev ?? 0) - 1
    );
    setZoomLevel(1);
  }, [lightboxIndex, initialFiles.length]);

  // Zoom In / Out
  const handleZoomIn = () => {
    setZoomLevel((z) => Math.min(z + 0.35, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel((z) => Math.max(z - 0.35, 0.7));
  };

  const handleResetZoom = () => {
    setZoomLevel(1);
  };

  // Keyboard Navigation Listener
  useEffect(() => {
    if (lightboxIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleCloseLightbox();
      } else if (e.key === "ArrowRight") {
        handleNext();
      } else if (e.key === "ArrowLeft") {
        handlePrev();
      } else if (e.key === "+" || e.key === "=") {
        handleZoomIn();
      } else if (e.key === "-") {
        handleZoomOut();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxIndex, handleNext, handlePrev]);

  // Prevent background scroll when Lightbox is active
  useEffect(() => {
    if (lightboxIndex !== null) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [lightboxIndex]);

  // Google Drive External Folder URL
  const driveFolderUrl = activity.driveFolderId.startsWith("http")
    ? activity.driveFolderId
    : `https://drive.google.com/drive/folders/${activity.driveFolderId}`;

  return (
    <div className={styles.folderPage} lang={lang} data-lang={lang}>
      <div className={styles.glowTop} />

      <div className={styles.container}>
        {/* Breadcrumb Top Bar */}
        <div className={styles.topNav}>
          <div className={styles.breadcrumbs}>
            <Link href="/" className={styles.crumbLink}>
              {isTh ? "หน้าหลัก" : "Portfolio"}
            </Link>
            <span>/</span>
            <Link href="/gallery" className={styles.crumbLink}>
              {isTh ? "แกลเลอรีภาพกิจกรรม" : "Gallery"}
            </Link>
            <span>/</span>
            <span className={styles.crumbCurrent} title={title}>
              {title}
            </span>
          </div>

          <div className={styles.topActions}>
            <a
              href={driveFolderUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.driveBtn}
              title="Open source folder in Google Drive"
            >
              <Folder size={14} color="#f59e0b" />
              <span>{isTh ? "เปิดโฟลเดอร์ Google Drive" : "Google Drive"}</span>
              <ExternalLink size={12} style={{ opacity: 0.7 }} />
            </a>

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
        </div>

        {/* Activity Header Info */}
        <header className={styles.activityHeader}>
          <div className={styles.titleRow}>
            <div>
              <h1 className={styles.activityTitle}>{title}</h1>
            </div>

            <div className={styles.metaBadges}>
              {activity.category && (
                <span className={`${styles.badge} ${styles.categoryBadge}`}>
                  <Tag size={13} />
                  <span>{activity.category}</span>
                </span>
              )}

              <span className={styles.badge}>
                <Calendar size={13} color="var(--primary)" />
                <span>{activity.eventDate}</span>
              </span>

              {location && (
                <span className={styles.badge}>
                  <MapPin size={13} color="var(--primary)" />
                  <span>{location}</span>
                </span>
              )}

              <span className={styles.badge}>
                <ImageIcon size={13} />
                <span>
                  {initialFiles.length} {isTh ? "ภาพถ่าย" : "Photos"}
                </span>
              </span>
            </div>
          </div>

          {description && <p className={styles.activityDesc}>{description}</p>}
        </header>

        {/* Thumbnail Photo Grid */}
        {initialFiles.length === 0 ? (
          <div className={styles.emptyState}>
            <Folder size={44} style={{ margin: "0 auto 12px auto", opacity: 0.4 }} />
            <p style={{ fontSize: 16, fontWeight: 600, margin: "0 0 6px" }}>
              {isTh ? "ยังไม่มีรูปภาพในโฟลเดอร์นี้" : "No photos found in this folder"}
            </p>
            <span style={{ fontSize: 13 }}>
              {driveError
                ? driveError
                : isTh
                ? "กรุณาอัปโหลดรูปภาพเข้าสู่ Google Drive ของกิจกรรมนี้"
                : "Upload photos into the Google Drive folder configured for this activity."}
            </span>
          </div>
        ) : (
          <div className={styles.photoGrid}>
            {initialFiles.map((photo, idx) => (
              <div
                key={photo.id}
                className={styles.photoCard}
                onClick={() => handleOpenLightbox(idx)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    handleOpenLightbox(idx);
                  }
                }}
                aria-label={`View photo: ${photo.name}`}
              >
                <img
                  src={photo.thumbnailUrl}
                  alt={photo.name}
                  className={styles.thumbnailImg}
                  loading="lazy"
                  onError={(e) => {
                    // Fallback to fullUrl or placeholder if thumbnail fails
                    (e.target as HTMLImageElement).src = photo.fullUrl;
                  }}
                />

                <div className={styles.photoOverlay}>
                  <span className={styles.photoCaption} title={photo.name}>
                    {photo.name}
                  </span>
                  <div className={styles.expandIcon}>
                    <Maximize2 size={13} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* =================================================================== */}
      {/* FULL-SCREEN LIGHTBOX MODAL */}
      {/* =================================================================== */}
      {lightboxIndex !== null && activePhoto && (
        <div
          className={styles.lightboxModal}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              handleCloseLightbox();
            }
          }}
        >
          {/* Top Bar Controls */}
          <div className={styles.lightboxTopBar}>
            <div className={styles.lightboxTitleGroup}>
              <span className={styles.lightboxCounter}>
                {lightboxIndex + 1} / {initialFiles.length}
              </span>
              <span className={styles.lightboxFileName}>
                {activePhoto.name}
              </span>
            </div>

            <div className={styles.lightboxControlsGroup}>
              <button
                type="button"
                onClick={handleZoomIn}
                className={styles.lightboxBtn}
                title="Zoom In (+)"
              >
                <ZoomIn size={16} />
              </button>

              <button
                type="button"
                onClick={handleZoomOut}
                className={styles.lightboxBtn}
                title="Zoom Out (-)"
              >
                <ZoomOut size={16} />
              </button>

              {zoomLevel !== 1 && (
                <button
                  type="button"
                  onClick={handleResetZoom}
                  className={styles.lightboxBtn}
                  title="Reset Zoom"
                  style={{ fontSize: 11, fontWeight: 700 }}
                >
                  100%
                </button>
              )}

              <a
                href={activePhoto.fullUrl}
                download={activePhoto.name}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.lightboxBtn}
                title="Download / View original image"
              >
                <Download size={16} />
              </a>

              {activePhoto.webViewLink && (
                <a
                  href={activePhoto.webViewLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.lightboxBtn}
                  title="Open in Google Drive"
                >
                  <ExternalLink size={16} />
                </a>
              )}

              <button
                type="button"
                onClick={handleCloseLightbox}
                className={`${styles.lightboxBtn} ${styles.closeBtn}`}
                title="Close viewer (Esc)"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Central Image View Stage */}
          <div className={styles.lightboxStage}>
            {/* Left Prev Button */}
            {initialFiles.length > 1 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrev();
                }}
                className={`${styles.navChevron} ${styles.navPrev}`}
                title="Previous photo (Left Arrow)"
              >
                <ChevronLeft size={24} />
              </button>
            )}

            {/* Central High-Res Image */}
            <div
              className={styles.lightboxImageWrapper}
              style={{ transform: `scale(${zoomLevel})` }}
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={activePhoto.fullUrl}
                alt={activePhoto.name}
                className={styles.lightboxImage}
              />
            </div>

            {/* Right Next Button */}
            {initialFiles.length > 1 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleNext();
                }}
                className={`${styles.navChevron} ${styles.navNext}`}
                title="Next photo (Right Arrow)"
              >
                <ChevronRight size={24} />
              </button>
            )}
          </div>

          {/* Bottom Bar: Instructions & Meta */}
          <div className={styles.lightboxBottomBar}>
            <span>
              {isTh
                ? "กดลูกศร ซ้าย/ขวา เพื่อเลื่อนภาพ • กด Esc เพื่อปิด"
                : "Use Left / Right arrow keys to navigate • Esc to exit"}
            </span>

            <span>
              {title} ({activity.eventDate})
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
