"use client";

import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import QRCode from "qrcode";
import {
  Phone,
  Mail,
  Globe,
  MapPin,
  Linkedin,
  Github,
  RotateCw,
  Sparkles,
} from "lucide-react";
import { NamecardData, CARD_TEMPLATES } from "./cardTemplates";
import styles from "./NamecardVisual.module.css";

export interface NamecardVisualRef {
  frontElement: HTMLDivElement | null;
  backElement: HTMLDivElement | null;
}

interface NamecardVisualProps {
  card: NamecardData;
  lang?: "en" | "th";
  showFlipButton?: boolean;
  activeSide?: "front" | "back";
  onFlipChange?: (side: "front" | "back") => void;
  className?: string;
  cardBaseUrl?: string; // e.g. https://...
}

export const NamecardVisual = forwardRef<NamecardVisualRef, NamecardVisualProps>(
  (
    {
      card,
      lang = "en",
      showFlipButton = true,
      activeSide: controlledSide,
      onFlipChange,
      className = "",
      cardBaseUrl,
    },
    ref
  ) => {
    const [uncontrolledSide, setUncontrolledSide] = useState<"front" | "back">("front");
    const [qrDataUrl, setQrDataUrl] = useState<string>("");

    const frontRef = useRef<HTMLDivElement>(null);
    const backRef = useRef<HTMLDivElement>(null);

    useImperativeHandle(ref, () => ({
      frontElement: frontRef.current,
      backElement: backRef.current,
    }));

    const isFlipped = controlledSide !== undefined ? controlledSide === "back" : uncontrolledSide === "back";

    const handleFlip = () => {
      const nextSide = isFlipped ? "front" : "back";
      if (controlledSide === undefined) {
        setUncontrolledSide(nextSide);
      }
      onFlipChange?.(nextSide);
    };

    const isTh = lang === "th";
    const name = (isTh && card.fullNameTh) || card.fullName || "Your Name";
    const position = (isTh && card.positionTh) || card.position || "Professional Title";
    const organization = (isTh && card.organizationTh) || card.organization || "University / Organization";
    const department = (isTh && card.departmentTh) || card.department || "";
    const address = (isTh && card.addressTh) || card.address || "";
    const tagline = (isTh && card.backTaglineTh) || card.backTagline || "Inspiring Innovation & Academic Leadership";
    const subtitle = card.backSubtitle || "Academic • Research • Innovation";

    // Template selection
    const tmplDef = CARD_TEMPLATES.find((t) => t.id === card.template) || CARD_TEMPLATES[0];
    const primaryColor = card.primaryColor || tmplDef.defaultPrimary;
    const accentColor = card.accentColor || tmplDef.defaultAccent;
    const bgColor = card.backgroundColor || tmplDef.defaultBg;

    // Determine QR Code content
    useEffect(() => {
      let qrContent = "";
      const base = cardBaseUrl || (typeof window !== "undefined" ? window.location.origin : "");

      if (card.qrType === "custom" && card.customQrUrl) {
        qrContent = card.customQrUrl;
      } else if (card.qrType === "vcf") {
        qrContent = `${base}/api/card/vcf?id=${card.slug || card.id || ""}&lang=${lang}`;
      } else {
        // default: link to e-card page
        qrContent = `${base}/card/${card.slug || ""}`;
      }

      QRCode.toDataURL(qrContent, {
        width: 300,
        margin: 1,
        color: {
          dark: tmplDef.theme === "light" ? "#0f172a" : "#09090b",
          light: "#ffffff",
        },
        errorCorrectionLevel: "M",
      })
        .then((url) => setQrDataUrl(url))
        .catch((err) => console.error("Failed to generate QR code", err));
    }, [card.qrType, card.customQrUrl, card.slug, card.id, lang, cardBaseUrl, tmplDef.theme]);

    const initials = name
      .split(" ")
      .map((w) => w[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "PK";

    const templateClass =
      card.template === "academic"
        ? styles.tmplAcademic
        : card.template === "modern"
        ? styles.tmplModern
        : card.template === "cyber"
        ? styles.tmplCyber
        : card.template === "emerald"
        ? styles.tmplEmerald
        : styles.tmplExecutive;

    const styleVars = {
      "--card-primary": primaryColor,
      "--card-accent": accentColor,
      "--card-bg": bgColor,
    } as React.CSSProperties;

    return (
      <div className={`${styles.flipCardWrapper} ${className}`} style={styleVars}>
        <div
          className={`${styles.flipCardInner} ${isFlipped ? styles.flipped : ""}`}
          onClick={handleFlip}
          style={{ cursor: "pointer" }}
          title={isFlipped ? "Click to flip front" : "Click to flip back"}
        >
          {/* ==================== FRONT SIDE ==================== */}
          <div
            ref={frontRef}
            className={`${styles.cardFace} ${styles.cardFront} ${templateClass}`}
          >
            {card.template === "executive" && <div className={styles.goldAccentLine} />}
            {card.template === "academic" && <div className={styles.academicBorder} />}
            {card.template === "modern" && <div className={styles.modernStripe} />}
            {card.template === "cyber" && <div className={styles.cyberGrid} />}

            <div className={styles.frontContainer}>
              {/* Header: Organization & Crest / SmartChip */}
              <div className={styles.frontHeader}>
                <div className={styles.orgBlock}>
                  <h3 className={styles.orgTitle}>{organization}</h3>
                  {department && <p className={styles.deptTitle}>{department}</p>}
                </div>

                <div className={styles.crestOrChip}>
                  {card.logoUrl ? (
                    <img src={card.logoUrl} alt="Logo" className={styles.logoImg} />
                  ) : card.template === "cyber" ? (
                    <div className={styles.crestOrChip}>
                      <Sparkles size={20} color={accentColor} />
                    </div>
                  ) : (
                    <div className={styles.smartChip} />
                  )}
                </div>
              </div>

              {/* Persona info: Avatar & Name */}
              <div className={styles.personaBlock}>
                <div className={styles.avatarWrapper}>
                  {card.avatarUrl ? (
                    <img src={card.avatarUrl} alt={name} className={styles.avatarImg} />
                  ) : (
                    <div className={styles.avatarInitials}>{initials}</div>
                  )}
                </div>

                <div className={styles.personaText}>
                  <h2 className={styles.personName}>{name}</h2>
                  <p className={styles.personPosition}>{position}</p>
                </div>
              </div>

              {/* Footer: Quick Contacts */}
              <div className={styles.frontFooter}>
                {card.email && (
                  <div className={styles.contactItem} title={card.email}>
                    <Mail size={12} color={accentColor} />
                    <span>{card.email}</span>
                  </div>
                )}
                {card.phone && (
                  <div className={styles.contactItem} title={card.phone}>
                    <Phone size={12} color={accentColor} />
                    <span>{card.phone}</span>
                  </div>
                )}
                {card.websiteUrl && (
                  <div className={styles.contactItem} title={card.websiteUrl}>
                    <Globe size={12} color={accentColor} />
                    <span>{card.websiteUrl.replace(/^https?:\/\//, "")}</span>
                  </div>
                )}
                {address && (
                  <div className={styles.contactItem} title={address}>
                    <MapPin size={12} color={accentColor} />
                    <span>{address}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ==================== BACK SIDE ==================== */}
          <div
            ref={backRef}
            className={`${styles.cardFace} ${styles.cardBack} ${templateClass}`}
          >
            {card.template === "academic" && <div className={styles.academicBorder} />}
            {card.template === "cyber" && <div className={styles.cyberGrid} />}

            <div className={styles.backContainer}>
              <div className={styles.backLeft}>
                <div className={styles.monogramCrest}>
                  {card.logoUrl ? (
                    <img src={card.logoUrl} alt="Logo" className={styles.logoImg} />
                  ) : (
                    <span>{initials}</span>
                  )}
                </div>

                <h3 className={styles.backTagline}>{tagline}</h3>
                {subtitle && <p className={styles.backSubtitle}>{subtitle}</p>}

                {card.websiteUrl && (
                  <div className={styles.backUrlPill}>
                    <Globe size={11} color={accentColor} />
                    <span>{card.websiteUrl.replace(/^https?:\/\//, "")}</span>
                  </div>
                )}
              </div>

              <div className={styles.backRight}>
                <div className={styles.qrFrame}>
                  {qrDataUrl ? (
                    <img src={qrDataUrl} alt="QR Code" className={styles.qrImage} />
                  ) : (
                    <div style={{ width: 112, height: 112, background: "#eee" }} />
                  )}
                </div>
                <span className={styles.qrHint}>
                  {isTh ? "สแกนเพื่อเปิดนามบัตร" : "Scan to Connect"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Optional Flip Toggle Button */}
        {showFlipButton && (
          <div className={styles.flipButtonRow}>
            <button
              type="button"
              className={styles.flipBtn}
              onClick={(e) => {
                e.stopPropagation();
                handleFlip();
              }}
            >
              <RotateCw size={14} />
              <span>
                {isFlipped
                  ? isTh
                    ? "พลิกดูด้านหน้า (Front Side)"
                    : "Flip to Front"
                  : isTh
                  ? "พลิกดูด้านหลัง (Back Side)"
                  : "Flip to Back"}
              </span>
            </button>
          </div>
        )}
      </div>
    );
  }
);

NamecardVisual.displayName = "NamecardVisual";
