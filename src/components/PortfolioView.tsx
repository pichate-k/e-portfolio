"use client";

import React, { useState } from "react";
import { Navbar } from "./Navbar";
import { Hero } from "./Hero";
import { SectionCard } from "./SectionCard";
import { CvDownloadModal } from "./CvDownloadModal";
import { Footer } from "./Footer";
import { Language } from "@/lib/i18n";

interface ProfileData {
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

interface CvItemData {
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

interface CvSectionData {
  id: string;
  slug: string;
  title: string;
  titleTh?: string | null;
  description?: string | null;
  descriptionTh?: string | null;
  icon?: string | null;
  contentType?: string | null;
  customFields?: string | null;
  items: CvItemData[];
}

interface PortfolioViewProps {
  profile: ProfileData;
  sections: CvSectionData[];
  requireCvPassword?: boolean;
}

export const PortfolioView: React.FC<PortfolioViewProps> = ({
  profile,
  sections,
  requireCvPassword = true,
}) => {
  const [lang, setLang] = useState<Language>("en");
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);

  return (
    <div
      style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}
      lang={lang}
      data-lang={lang}
    >
      <Navbar
        fullName={profile.fullName}
        fullNameTh={profile.fullNameTh}
        currentPosition={profile.currentPosition}
        currentPositionTh={profile.currentPositionTh}
        sections={sections}
        lang={lang}
        onToggleLang={setLang}
        onOpenDownloadModal={() => setIsDownloadModalOpen(true)}
      />

      <main style={{ flex: 1 }}>
        <Hero
          profile={profile}
          lang={lang}
          onOpenDownloadModal={() => setIsDownloadModalOpen(true)}
        />

        <div id="sections-content" className="container" style={{ paddingTop: "1rem" }}>
          {sections.map((section) => (
            <SectionCard key={section.id} section={section} lang={lang} />
          ))}
        </div>
      </main>

      <Footer
        fullName={profile.fullName}
        fullNameTh={profile.fullNameTh}
        workplace={profile.workplace}
        workplaceTh={profile.workplaceTh}
        lang={lang}
      />

      <CvDownloadModal
        isOpen={isDownloadModalOpen}
        onClose={() => setIsDownloadModalOpen(false)}
        requirePassword={requireCvPassword}
        currentLang={lang}
      />
    </div>
  );
};
