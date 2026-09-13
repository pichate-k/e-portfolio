import { prisma } from "@/lib/prisma";
import { PortfolioView } from "@/components/PortfolioView";

export const dynamic = "force-dynamic";

export default async function HomePage({
  searchParams,
}: {
  searchParams?: { profile?: string; card?: string };
}) {
  let profile: any = null;
  let sections: any[] = [];
  let requireCvPassword = true;

  const requestedProfileSlug = searchParams?.profile || searchParams?.card;

  try {
    const setting = await prisma.siteSetting.findFirst();
    if (setting) requireCvPassword = setting.requireCvPassword;

    // 1. Try to load specific card/profile if requested via query param
    if (requestedProfileSlug) {
      const matchedCard = await prisma.namecard.findFirst({
        where: {
          OR: [{ slug: requestedProfileSlug }, { id: requestedProfileSlug }],
        },
      });

      if (matchedCard) {
        profile = {
          id: matchedCard.id,
          fullName: matchedCard.fullName,
          fullNameTh: matchedCard.fullNameTh,
          currentPosition: matchedCard.position,
          currentPositionTh: matchedCard.positionTh,
          workplace: matchedCard.organization || "",
          workplaceTh: matchedCard.organizationTh || "",
          address: matchedCard.address || "",
          addressTh: matchedCard.addressTh || "",
          email: matchedCard.email || "",
          phone: matchedCard.phone || "",
          websiteUrl: matchedCard.websiteUrl || "",
          linkedinUrl: matchedCard.linkedinUrl || "",
          githubUrl: matchedCard.githubUrl || "",
          googleScholarUrl: (matchedCard as any).googleScholarUrl || "",
          avatarUrl: matchedCard.avatarUrl || "",
          bio: (matchedCard as any).bio || "",
          bioTh: (matchedCard as any).bioTh || "",
          updatedAt: matchedCard.updatedAt,
        };
      }
    }

    // 2. If no specific card requested or not found, try loading the default card
    if (!profile) {
      const defaultCard = await prisma.namecard.findFirst({
        where: { isDefault: true },
      });

      if (defaultCard) {
        profile = {
          id: defaultCard.id,
          fullName: defaultCard.fullName,
          fullNameTh: defaultCard.fullNameTh,
          currentPosition: defaultCard.position,
          currentPositionTh: defaultCard.positionTh,
          workplace: defaultCard.organization || "",
          workplaceTh: defaultCard.organizationTh || "",
          address: defaultCard.address || "",
          addressTh: defaultCard.addressTh || "",
          email: defaultCard.email || "",
          phone: defaultCard.phone || "",
          websiteUrl: defaultCard.websiteUrl || "",
          linkedinUrl: defaultCard.linkedinUrl || "",
          githubUrl: defaultCard.githubUrl || "",
          googleScholarUrl: (defaultCard as any).googleScholarUrl || "",
          avatarUrl: defaultCard.avatarUrl || "",
          bio: (defaultCard as any).bio || "",
          bioTh: (defaultCard as any).bioTh || "",
          updatedAt: defaultCard.updatedAt,
        };
      }
    }

    // 3. Fallback to Profile table
    if (!profile) {
      profile = await prisma.profile.findFirst();
    }

    sections = await prisma.cvSection.findMany({
      where: { isVisible: true },
      orderBy: { orderIndex: "asc" },
      include: {
        items: {
          orderBy: { orderIndex: "asc" },
        },
      },
    });
  } catch (err) {
    console.warn("Database connection issue, loading default portfolio fallback:", err);
  }

  if (!profile) {
    profile = {
      id: "default",
      fullName: "User Name",
      fullNameTh: "ผู้ใช้งานระบบ",
      currentPosition: "Researcher & Software Engineer",
      currentPositionTh: "นักวิจัยและวิศวกรซอฟต์แวร์",
      workplace: "Faculty of Engineering, University",
      workplaceTh: "คณะวิศวกรรมศาสตร์ มหาวิทยาลัย",
      address: "Bangkok, Thailand",
      addressTh: "กรุงเทพมหานคร ประเทศไทย",
      email: "user@example.com",
      phone: "+66 (0) 2-000-0000",
      websiteUrl: "https://example.com",
      linkedinUrl: "https://linkedin.com",
      githubUrl: "https://github.com",
      googleScholarUrl: null,
      avatarUrl: null,
      bio: "Academic researcher and software engineer specializing in Intelligent Systems, Cloud Computing, and Data Engineering.",
      bioTh: "นักวิจัยและวิศวกรซอฟต์แวร์ มุ่งเน้นการพัฒนาระบบอัจฉริยะ คลาวด์คอมพิวติ้ง และวิศวกรรมข้อมูล",
      updatedAt: new Date(),
    };
  }

  return (
    <PortfolioView
      profile={profile}
      sections={sections}
      requireCvPassword={requireCvPassword}
    />
  );
}
