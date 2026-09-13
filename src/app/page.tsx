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
      fullName: "Pichate Kunakornvong",
      fullNameTh: "พิเชฐ  คุณากรวงศื",
      currentPosition: "Assistant Professor & Lead AI Researcher",
      currentPositionTh: "ผู้ช่วยศาสตราจารย์ และหัวหน้าทีมนักวิจัย AI",
      workplace: "Faculty of Science and Technology, Rajamangala University of Technology Thanyaburi",
      workplaceTh: "คณะวิทยาศาสตร์และเทคโนโลยี มหาวิทยาลัยเทคโนโลยีราชมงคลธัญบุรี",
      address: "Pathum Thani, Thailand",
      addressTh: "จ.ปทุมธานี ประเทศไทย",
      email: "pichate.k@rmutt.ac.th",
      phone: "+66 (0) 89-113-9530",
      websiteUrl: "https://pichate-k-site-vercel.app",
      linkedinUrl: "https://linkedin.com/in/pichatek",
      githubUrl: "https://github.com/pichatek",
      googleScholarUrl: null,
      avatarUrl: null,
      bio: "Academic researcher and engineering educator specializing in Machine Learning, Embedded Systems, Artificail Intelligent, and Data Engineering.",
      bioTh: "นักวิจัยและอาจารย์ผู้เชี่ยวชาญด้านการเรียนรู้ของเครื่อง ปัญญาประดิษฐ์ ระบบสมองกลฝังตัว และวิศวกรรมข้อมูล",
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
