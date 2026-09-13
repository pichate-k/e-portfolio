import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { ECardClient } from "./ECardClient";
import { NamecardData } from "@/components/card/cardTemplates";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Digital Business Cards | Dr. Pichate K.",
  description:
    "Digital Business E-Cards of Dr. Pichate K. - Assistant Professor, AI & Embedded Systems Researcher.",
};

export default async function ECardPage({
  searchParams,
}: {
  searchParams?: { id?: string; card?: string };
}) {
  let cards: NamecardData[] = [];

  try {
    const dbCards = await prisma.namecard.findMany({
      orderBy: [{ isDefault: "desc" }, { orderIndex: "asc" }, { createdAt: "asc" }],
    });

    if (dbCards.length > 0) {
      cards = dbCards as unknown as NamecardData[];
    }
  } catch (err) {
    console.warn("Could not query namecards, falling back to Profile:", err);
  }

  // If no cards exist in database yet, generate a default one from profile
  if (cards.length === 0) {
    let profile = null;
    try {
      profile = await prisma.profile.findFirst();
    } catch {}

    cards = [
      {
        slug: "academic",
        title: "Academic & Research Card",
        template: "academic",
        isDefault: true,
        fullName: profile?.fullName || "Dr. Pichate K.",
        fullNameTh: profile?.fullNameTh || "ดร. พิเชษฐ์ เค.",
        position: profile?.currentPosition || "Assistant Professor & Lead AI Researcher",
        positionTh: profile?.currentPositionTh || "ผู้ช่วยศาสตราจารย์ และหัวหน้าทีมนักวิจัย AI",
        organization:
          profile?.workplace ||
          "Faculty of Engineering, Rajamangala University of Technology Thanyaburi",
        organizationTh:
          profile?.workplaceTh ||
          "คณะวิศวกรรมศาสตร์ มหาวิทยาลัยเทคโนโลยีราชมงคลธัญบุรี",
        department: "Department of Computer and Control Engineering",
        departmentTh: "ภาควิชาวิศวกรรมคอมพิวเตอร์และการควบคุม",
        email: profile?.email || "pichate.k@rmutt.ac.th",
        phone: profile?.phone || "+66 (0) 2-549-3400",
        websiteUrl: profile?.websiteUrl || "https://pichatek.com",
        address: profile?.address || "Pathum Thani, Thailand",
        addressTh: profile?.addressTh || "จ.ปทุมธานี ประเทศไทย",
        avatarUrl: profile?.avatarUrl || null,
        linkedinUrl: profile?.linkedinUrl || "https://linkedin.com/in/pichatek",
        githubUrl: profile?.githubUrl || "https://github.com/pichatek",
        lineId: null,
        backTagline: "Innovating AI & Embedded Systems Education",
        backTaglineTh: "สร้างสรรค์นวัตกรรม AI และระบบสมองกลฝังตัว",
        backSubtitle: "Research • Academic • Consulting",
        qrType: "card_url",
        primaryColor: "#1e3a8a",
        accentColor: "#d97706",
        backgroundColor: "#0b1329",
      },
    ];
  }

  const requestedCard = searchParams?.id || searchParams?.card;
  let initialCard = cards[0];
  if (requestedCard) {
    const found = cards.find(
      (c) => c.slug === requestedCard || c.id === requestedCard
    );
    if (found) initialCard = found;
  }

  return <ECardClient initialCards={[initialCard]} activeSlug={initialCard.slug} />;
}
