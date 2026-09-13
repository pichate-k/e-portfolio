"use client";

import React from "react";
import Link from "next/link";
import {
  MapPin,
  Mail,
  Phone,
  Globe,
  Linkedin,
  Github,
  GraduationCap,
  Download,
  Building,
  Briefcase,
  ArrowDown,
} from "lucide-react";
import { Language, translations } from "@/lib/i18n";
import styles from "./Hero.module.css";

interface ProfileProps {
  fullName: string;
  fullNameTh?: string | null;
  currentPosition: string;
  currentPositionTh?: string | null;
  workplace: string;
  workplaceTh?: string | null;
  address: string;
  addressTh?: string | null;
  email: string;
  phone?: string | null;
  websiteUrl?: string | null;
  linkedinUrl?: string | null;
  githubUrl?: string | null;
  googleScholarUrl?: string | null;
  avatarUrl?: string | null;
  bio?: string | null;
  bioTh?: string | null;
}

interface HeroProps {
  profile: ProfileProps;
  lang: Language;
  onOpenDownloadModal: () => void;
}

export const Hero: React.FC<HeroProps> = ({ profile, lang, onOpenDownloadModal }) => {
  const t = translations[lang];

  const name = (lang === "th" && profile.fullNameTh) || profile.fullName;
  const position = (lang === "th" && profile.currentPositionTh) || profile.currentPosition;
  const workplace = (lang === "th" && profile.workplaceTh) || profile.workplace;
  const address = (lang === "th" && profile.addressTh) || profile.address;
  const bio = (lang === "th" && profile.bioTh) || profile.bio;

  return (
    <section className={styles.hero}>
      <div className={styles.heroGlow} />
      <div className={styles.heroGlowLeft} />

      <div className={`container ${styles.heroContent}`}>
        <div className={styles.heroTop}>
          {profile.avatarUrl && (
            <div className={styles.avatarWrapper}>
              <img
                src={profile.avatarUrl}
                alt={name}
                className={styles.avatarImage}
              />
            </div>
          )}

          <div className={styles.heroIntro}>
            <div className={styles.badgeRow}>
              {position && (
                <span className={styles.positionBadge}>
                  <Briefcase size={15} />
                  {position}
                </span>
              )}
              {workplace && (
                <span className={styles.workplaceBadge}>
                  <Building size={15} />
                  {workplace}
                </span>
              )}
            </div>

            <h1 className={styles.title}>
              {lang === "th" ? (
                <>
                  <span className="gradient-text">{name}</span>
                </>
              ) : (
                <>
                  <span className="gradient-text">{name}</span>
                </>
              )}
            </h1>
          </div>
        </div>

        {address && (
          <div className={styles.locationBar}>
            <MapPin size={18} color="var(--primary)" />
            <span>{address}</span>
          </div>
        )}

        {bio && <p className={styles.bio}>{bio}</p>}

        <div className={styles.contactsGrid}>
          {profile.email && (
            <a href={`mailto:${profile.email}`} className={styles.contactPill}>
              <Mail size={16} />
              <span>{profile.email}</span>
            </a>
          )}
          {profile.phone && (
            <a href={`tel:${profile.phone}`} className={styles.contactPill}>
              <Phone size={16} />
              <span>{profile.phone}</span>
            </a>
          )}
          {profile.websiteUrl && (
            <a
              href={profile.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.contactPill}
            >
              <Globe size={16} />
              <span>{t.website}</span>
            </a>
          )}
          {profile.linkedinUrl && (
            <a
              href={profile.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.contactPill}
            >
              <Linkedin size={16} />
              <span>{t.linkedin}</span>
            </a>
          )}
          {profile.githubUrl && (
            <a
              href={profile.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.contactPill}
            >
              <Github size={16} />
              <span>{t.github}</span>
            </a>
          )}
          {profile.googleScholarUrl && (
            <a
              href={profile.googleScholarUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.contactPill}
            >
              <GraduationCap size={16} />
              <span>{t.googleScholar}</span>
            </a>
          )}
        </div>

        <div className={styles.actionsRow}>
          <button onClick={onOpenDownloadModal} className={styles.primaryCta}>
            <Download size={18} />
            <span>{t.downloadCvFull}</span>
          </button>
          <Link href="/card" className={styles.secondaryCta}>
            <span>💳 {lang === "th" ? "นามบัตรดิจิทัล" : "Digital E-Card"}</span>
          </Link>
          <a href="#sections-content" className={styles.secondaryCta}>
            <span>{t.viewPortfolio}</span>
            <ArrowDown size={17} />
          </a>
        </div>
      </div>
    </section>
  );
};
