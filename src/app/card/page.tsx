import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { ECardClient } from "./ECardClient";
import { NamecardData } from "@/components/card/cardTemplates";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Digital Business Cards | User Portfolio",
  description:
    "Digital Business E-Cards - Academic & Professional Portfolio.",
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

    if (dbCards && dbCards.length > 0) {
      cards = dbCards as unknown as NamecardData[];
    }
  } catch (err) {
    console.warn("Could not query namecards, using fallback:", err);
  }

  // Fallback default card if database table is empty
  if (cards.length === 0) {
    const profile = await prisma.profile.findFirst().catch(() => null);

    cards = [
      {
        slug: "academic",
        title: "Academic & Research Card",
        template: "academic",
        isDefault: true,
        fullName: profile?.fullName || "User Name",
        fullNameTh: profile?.fullNameTh || "ผู้ใช้งานระบบ",
        position: profile?.currentPosition || "Researcher & Software Engineer",
        positionTh: profile?.currentPositionTh || "นักวิจัยและวิศวกรซอฟต์แวร์",
        organization:
          profile?.workplace ||
          "Faculty of Engineering, University",
        organizationTh:
          profile?.workplaceTh ||
          "คณะวิศวกรรมศาสตร์ มหาวิทยาลัย",
        department: "Department of Computer Engineering",
        departmentTh: "ภาควิชาวิศวกรรมคอมพิวเตอร์",
        email: profile?.email || "user@example.com",
        phone: profile?.phone || "+66 (0) 2-000-0000",
        websiteUrl: profile?.websiteUrl || "https://example.com",
        address: profile?.address || "Bangkok, Thailand",
        addressTh: profile?.addressTh || "กรุงเทพมหานคร ประเทศไทย",
        avatarUrl: profile?.avatarUrl || null,
        linkedinUrl: profile?.linkedinUrl || "https://linkedin.com",
        githubUrl: profile?.githubUrl || "https://github.com",
        lineId: null,
        backTagline: "Innovating Intelligent Systems & Software",
        backTaglineTh: "สร้างสรรค์นวัตกรรมระบบอัจฉริยะและซอฟต์แวร์",
        backSubtitle: "Research • Academic • Development",
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
