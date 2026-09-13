"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import {
  Phone,
  Mail,
  Globe,
  Linkedin,
  Github,
  MapPin,
  Share2,
  ArrowLeft,
  UserPlus,
  Radio,
  Check,
  FileText,
  Download,
  CreditCard,
  Sparkles,
  MessageCircle,
} from "lucide-react";
import { Language } from "@/lib/i18n";
import { NamecardData } from "@/components/card/cardTemplates";
import { NamecardVisual, NamecardVisualRef } from "@/components/card/NamecardVisual";
import { downloadCardImage, downloadBothSides } from "@/lib/cardExport";
import styles from "./card.module.css";

interface ECardClientProps {
  initialCards?: NamecardData[];
  activeSlug?: string;
  profile?: any; // backwards compatibility fallback
}

export const ECardClient: React.FC<ECardClientProps> = ({
  initialCards = [],
  activeSlug,
  profile,
}) => {
  const [lang, setLang] = useState<Language>("en");
  const [copied, setCopied] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [activeSide, setActiveSide] = useState<"front" | "back">("front");

  const visualRef = useRef<NamecardVisualRef>(null);

  // Normalize cards list
  const cards: NamecardData[] =
    initialCards.length > 0
      ? initialCards
      : profile
      ? [
          {
            slug: "academic",
            title: "Academic & Research Card",
            template: "academic",
            isDefault: true,
            fullName: profile.fullName || "User Name",
            fullNameTh: profile.fullNameTh || "ผู้ใช้งานระบบ",
            position: profile.currentPosition || "Researcher",
            positionTh: profile.currentPositionTh || "นักวิจัย",
            organization: profile.workplace || "Faculty of Engineering",
            organizationTh: profile.workplaceTh || "คณะวิศวกรรมศาสตร์",
            email: profile.email || "",
            phone: profile.phone || "",
            websiteUrl: profile.websiteUrl || "",
            address: profile.address || "",
            addressTh: profile.addressTh || "",
            avatarUrl: profile.avatarUrl || null,
            linkedinUrl: profile.linkedinUrl || null,
            githubUrl: profile.githubUrl || null,
            backTagline: "Innovating Intelligent Systems",
            backTaglineTh: "สร้างสรรค์นวัตกรรมระบบอัจฉริยะ",
            backSubtitle: "Research • Academic • Development",
            qrType: "card_url",
          },
        ]
      : [];

  const [currentSlug, setCurrentSlug] = useState<string>(
    activeSlug || cards[0]?.slug || "card"
  );

  const activeCard =
    cards.find((c) => c.slug === currentSlug || c.id === currentSlug) ||
    cards[0] ||
    ({
      slug: "default",
      title: "Digital E-Card",
      template: "executive",
      fullName: "User Name",
      position: "Researcher",
    } as NamecardData);

  const isTh = lang === "th";
  const name = (isTh && activeCard.fullNameTh) || activeCard.fullName;
  const position = (isTh && activeCard.positionTh) || activeCard.position;
  const organization = (isTh && activeCard.organizationTh) || activeCard.organization;
  const address = (isTh && activeCard.addressTh) || activeCard.address;

  // Share action
  const handleShare = async () => {
    if (typeof window === "undefined") return;
    const url = `${window.location.origin}/card/${activeCard.slug}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `${name} | Digital E-Card`,
          text: `${name} - ${position}${organization ? ` at ${organization}` : ""}`,
          url,
        });
        return;
      } catch {
        // Fallback to clipboard
      }
    }

    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  // vCard download
  const handleSaveContact = () => {
    window.location.href = `/api/card/vcf?id=${activeCard.slug || activeCard.id || ""}&lang=${lang}`;
  };

  // High-res Image Downloads
  const handleDownloadFront = async () => {
    if (!visualRef.current?.frontElement) return;
    try {
      setExporting(true);
      await downloadCardImage({
        element: visualRef.current.frontElement,
        filename: `${activeCard.slug}-front`,
      });
    } finally {
      setExporting(false);
    }
  };

  const handleDownloadBack = async () => {
    if (!visualRef.current?.backElement) return;
    try {
      setExporting(true);
      await downloadCardImage({
        element: visualRef.current.backElement,
        filename: `${activeCard.slug}-back`,
      });
    } finally {
      setExporting(false);
    }
  };

  const handleDownloadBoth = async () => {
    if (!visualRef.current?.frontElement || !visualRef.current?.backElement) return;
    try {
      setExporting(true);
      await downloadBothSides(
        visualRef.current.frontElement,
        visualRef.current.backElement,
        activeCard.slug
      );
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className={styles.cardPage} lang={lang} data-lang={lang}>
      <div className={styles.glowSphere} />
      <div className={styles.glowSphereBottom} />

      <div className={styles.container}>
        {/* Top Control Bar */}
        <div className={styles.topBar}>
          <Link href="/" className={styles.backBtn}>
            <ArrowLeft size={16} />
            <span>{isTh ? "หน้าหลักผลงาน" : "Portfolio Home"}</span>
          </Link>

          <div className={styles.langToggle}>
            <button
              onClick={() => setLang("en")}
              className={`${styles.langBtn} ${lang === "en" ? styles.langBtnActive : ""}`}
            >
              EN
            </button>
            <button
              onClick={() => setLang("th")}
              className={`${styles.langBtn} ${lang === "th" ? styles.langBtnActive : ""}`}
            >
              TH
            </button>
          </div>
        </div>

        {/* Interactive 3D Flip 2-Sided Business Card */}
        <div style={{ marginBottom: "1.5rem" }}>
          <NamecardVisual
            ref={visualRef}
            card={activeCard}
            lang={lang}
            activeSide={activeSide}
            onFlipChange={setActiveSide}
            showFlipButton={true}
          />
        </div>

        {/* Action Panel Container */}
        <div className={styles.cardFrame}>
          {/* NFC / Digital Indicator */}
          <div className={styles.cardBadgeNfc}>
            <Radio size={12} />
            <span>Digital Smart Card</span>
          </div>

          {/* Quick Identity Summary */}
          <div className={styles.profileSection} style={{ marginBottom: "1rem" }}>
            <h1 className={styles.cardName}>{name}</h1>
            <p className={styles.cardPosition}>{position}</p>
            {organization && <p className={styles.cardWorkplace}>{organization}</p>}
            {address && (
              <span className={styles.cardAddress}>
                <MapPin size={13} color="var(--primary)" />
                <span>{address}</span>
              </span>
            )}
          </div>

          {/* Save Contact (vCard) Action */}
          <button onClick={handleSaveContact} className={styles.saveContactBtn}>
            <UserPlus size={18} />
            <span>{isTh ? "บันทึกรายชื่อลงโทรศัพท์ (.vcf)" : "Save Contact to Phone (.vcf)"}</span>
          </button>

          {/* High-Resolution Card Image Download Bar */}
          <div className={styles.downloadBar}>
            <button
              type="button"
              onClick={handleDownloadFront}
              disabled={exporting}
              className={styles.downloadSubBtn}
              title="Download Front Side as PNG (300 DPI)"
            >
              <Download size={13} />
              <span>{isTh ? "รูปด้านหน้า" : "Front PNG"}</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadBack}
              disabled={exporting}
              className={styles.downloadSubBtn}
              title="Download Back Side as PNG (300 DPI)"
            >
              <Download size={13} />
              <span>{isTh ? "รูปด้านหลัง" : "Back PNG"}</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadBoth}
              disabled={exporting}
              className={`${styles.downloadSubBtn} ${styles.downloadAllBtn}`}
              title="Download Both Sides (Front & Back)"
            >
              <Sparkles size={13} />
              <span>{isTh ? "บันทึกทั้ง 2 ด้าน" : "Both Sides (300 DPI)"}</span>
            </button>
          </div>

          {/* Direct Communication Quick Actions */}
          <div className={styles.quickActionsGrid} style={{ marginTop: "1.25rem" }}>
            {activeCard.phone && (
              <a href={`tel:${activeCard.phone}`} className={styles.actionPill}>
                <Phone size={18} color="var(--primary)" />
                <span>{isTh ? "โทรศัพท์" : "Call"}</span>
              </a>
            )}

            {activeCard.email && (
              <a href={`mailto:${activeCard.email}`} className={styles.actionPill}>
                <Mail size={18} color="var(--primary)" />
                <span>{isTh ? "อีเมล" : "Email"}</span>
              </a>
            )}

            {activeCard.websiteUrl && (
              <a
                href={activeCard.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.actionPill}
              >
                <Globe size={18} color="var(--primary)" />
                <span>{isTh ? "เว็บ" : "Web"}</span>
              </a>
            )}

            {activeCard.linkedinUrl && (
              <a
                href={activeCard.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.actionPill}
              >
                <Linkedin size={18} color="var(--primary)" />
                <span>LinkedIn</span>
              </a>
            )}

            {activeCard.githubUrl && (
              <a
                href={activeCard.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.actionPill}
              >
                <Github size={18} color="var(--primary)" />
                <span>GitHub</span>
              </a>
            )}

            {activeCard.lineId && (
              <a
                href={
                  activeCard.lineId.startsWith("http")
                    ? activeCard.lineId
                    : `https://line.me/ti/p/~${activeCard.lineId.replace("@", "")}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className={styles.actionPill}
              >
                <MessageCircle size={18} color="var(--primary)" />
                <span>LINE</span>
              </a>
            )}
          </div>

          {/* Secondary Footer Actions */}
          <div className={styles.secondaryRow} style={{ marginTop: "1.5rem" }}>
            <Link
              href={`/?profile=${encodeURIComponent(activeCard.slug)}`}
              className={styles.linkButton}
            >
              <FileText size={16} />
              <span>{isTh ? "ดูประวัติและผลงานวิชาการฉบับเต็ม" : "View Full CV & Portfolio"}</span>
            </Link>

            <button onClick={handleShare} className={styles.linkButton}>
              <Share2 size={16} />
              <span>{isTh ? "แชร์นามบัตรดิจิทัลนี้" : "Share This E-Card"}</span>
            </button>
          </div>
        </div>
      </div>

      {copied && (
        <div className={styles.shareToast}>
          <Check size={16} />
          <span>{isTh ? "คัดลอกลิงก์นามบัตรแล้ว!" : "E-Card link copied to clipboard!"}</span>
        </div>
      )}
    </div>
  );
};
