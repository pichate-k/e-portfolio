import { prisma } from "./prisma";
import { hashPassword } from "./auth";

let tablesEnsured = false;

export async function ensureTablesExist() {
  if (tablesEnsured || !process.env.DATABASE_URL) return;

  const statements = [
    // 1. User table
    `CREATE TABLE IF NOT EXISTS "User" (
      "id" TEXT PRIMARY KEY,
      "email" TEXT UNIQUE NOT NULL,
      "passwordHash" TEXT NOT NULL,
      "name" TEXT NOT NULL,
      "role" TEXT NOT NULL DEFAULT 'ADMIN',
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`,

    // 2. SiteSetting table
    `CREATE TABLE IF NOT EXISTS "SiteSetting" (
      "id" TEXT PRIMARY KEY,
      "siteTitle" TEXT NOT NULL DEFAULT 'Academic & Professional Portfolio',
      "bioTagline" TEXT DEFAULT 'Researcher, Educator & Software Engineer',
      "downloadPasswordHash" TEXT NOT NULL,
      "requireCvPassword" BOOLEAN NOT NULL DEFAULT true,
      "themePreference" TEXT NOT NULL DEFAULT 'system',
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`,

    // 3. Profile table
    `CREATE TABLE IF NOT EXISTS "Profile" (
      "id" TEXT PRIMARY KEY,
      "fullName" TEXT NOT NULL DEFAULT 'User Name',
      "fullNameTh" TEXT DEFAULT 'ผู้ใช้งานระบบ',
      "currentPosition" TEXT NOT NULL DEFAULT 'Researcher & Software Engineer',
      "currentPositionTh" TEXT DEFAULT 'นักวิจัยและวิศวกรซอฟต์แวร์',
      "workplace" TEXT NOT NULL DEFAULT 'Faculty of Engineering, University',
      "workplaceTh" TEXT DEFAULT 'คณะวิศวกรรมศาสตร์ มหาวิทยาลัย',
      "address" TEXT NOT NULL DEFAULT 'Bangkok, Thailand',
      "addressTh" TEXT DEFAULT 'กรุงเทพมหานคร ประเทศไทย',
      "email" TEXT NOT NULL DEFAULT 'user@example.com',
      "phone" TEXT DEFAULT '+66 (0) 2-000-0000',
      "websiteUrl" TEXT,
      "linkedinUrl" TEXT,
      "githubUrl" TEXT,
      "googleScholarUrl" TEXT,
      "avatarUrl" TEXT,
      "bio" TEXT,
      "bioTh" TEXT,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`,

    // 4. CvSection table
    `CREATE TABLE IF NOT EXISTS "CvSection" (
      "id" TEXT PRIMARY KEY,
      "slug" TEXT UNIQUE NOT NULL,
      "title" TEXT NOT NULL,
      "titleTh" TEXT,
      "description" TEXT,
      "descriptionTh" TEXT,
      "orderIndex" INTEGER NOT NULL DEFAULT 0,
      "isSystem" BOOLEAN NOT NULL DEFAULT false,
      "isVisible" BOOLEAN NOT NULL DEFAULT true,
      "icon" TEXT,
      "contentType" TEXT DEFAULT 'text',
      "customFields" TEXT DEFAULT '[]',
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`,

    // 5. CvItem table
    `CREATE TABLE IF NOT EXISTS "CvItem" (
      "id" TEXT PRIMARY KEY,
      "sectionId" TEXT NOT NULL REFERENCES "CvSection"("id") ON DELETE CASCADE ON UPDATE CASCADE,
      "title" TEXT NOT NULL,
      "titleTh" TEXT,
      "subtitle" TEXT,
      "subtitleTh" TEXT,
      "organization" TEXT,
      "organizationTh" TEXT,
      "location" TEXT,
      "locationTh" TEXT,
      "startDate" TEXT,
      "endDate" TEXT,
      "isCurrent" BOOLEAN NOT NULL DEFAULT false,
      "description" TEXT,
      "descriptionTh" TEXT,
      "url" TEXT,
      "imageUrl" TEXT,
      "customData" TEXT DEFAULT '{}',
      "tags" TEXT,
      "orderIndex" INTEGER NOT NULL DEFAULT 0,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`,

    // Indexes
    `CREATE INDEX IF NOT EXISTS "CvSection_orderIndex_idx" ON "CvSection"("orderIndex")`,
    `CREATE INDEX IF NOT EXISTS "CvItem_sectionId_orderIndex_idx" ON "CvItem"("sectionId", "orderIndex")`,

    // Column additions if tables already existed without recent fields
    `ALTER TABLE "Profile" ADD COLUMN IF NOT EXISTS "fullNameTh" TEXT`,
    `ALTER TABLE "Profile" ADD COLUMN IF NOT EXISTS "currentPositionTh" TEXT`,
    `ALTER TABLE "Profile" ADD COLUMN IF NOT EXISTS "workplaceTh" TEXT`,
    `ALTER TABLE "Profile" ADD COLUMN IF NOT EXISTS "addressTh" TEXT`,
    `ALTER TABLE "Profile" ADD COLUMN IF NOT EXISTS "avatarUrl" TEXT`,
    `ALTER TABLE "Profile" ADD COLUMN IF NOT EXISTS "googleScholarUrl" TEXT`,
    `ALTER TABLE "Profile" ADD COLUMN IF NOT EXISTS "bioTh" TEXT`,
    `ALTER TABLE "CvSection" ADD COLUMN IF NOT EXISTS "titleTh" TEXT`,
    `ALTER TABLE "CvSection" ADD COLUMN IF NOT EXISTS "descriptionTh" TEXT`,
    `ALTER TABLE "CvSection" ADD COLUMN IF NOT EXISTS "contentType" TEXT DEFAULT 'text'`,
    `ALTER TABLE "CvSection" ADD COLUMN IF NOT EXISTS "customFields" TEXT DEFAULT '[]'`,
    `ALTER TABLE "CvSection" ADD COLUMN IF NOT EXISTS "exportConfig" TEXT DEFAULT '{}'`,
    `ALTER TABLE "SiteSetting" ADD COLUMN IF NOT EXISTS "exportSettings" TEXT DEFAULT '{}'`,
    `ALTER TABLE "SiteSetting" ADD COLUMN IF NOT EXISTS "googleDriveSettings" TEXT DEFAULT '{}'`,
    `ALTER TABLE "CvItem" ADD COLUMN IF NOT EXISTS "titleTh" TEXT`,
    `ALTER TABLE "CvItem" ADD COLUMN IF NOT EXISTS "subtitleTh" TEXT`,
    `ALTER TABLE "CvItem" ADD COLUMN IF NOT EXISTS "organizationTh" TEXT`,
    `ALTER TABLE "CvItem" ADD COLUMN IF NOT EXISTS "location" TEXT`,
    `ALTER TABLE "CvItem" ADD COLUMN IF NOT EXISTS "locationTh" TEXT`,
    `ALTER TABLE "CvItem" ADD COLUMN IF NOT EXISTS "descriptionTh" TEXT`,
    `ALTER TABLE "CvItem" ADD COLUMN IF NOT EXISTS "imageUrl" TEXT`,
    `ALTER TABLE "CvItem" ADD COLUMN IF NOT EXISTS "customData" TEXT DEFAULT '{}'`,
    `ALTER TABLE "CvItem" ADD COLUMN IF NOT EXISTS "tags" TEXT`,

    // 6. Namecard table
    `CREATE TABLE IF NOT EXISTS "Namecard" (
      "id" TEXT PRIMARY KEY,
      "slug" TEXT UNIQUE NOT NULL,
      "title" TEXT NOT NULL,
      "template" TEXT NOT NULL DEFAULT 'executive',
      "isDefault" BOOLEAN NOT NULL DEFAULT false,
      "fullName" TEXT NOT NULL,
      "fullNameTh" TEXT,
      "position" TEXT NOT NULL,
      "positionTh" TEXT,
      "organization" TEXT,
      "organizationTh" TEXT,
      "department" TEXT,
      "departmentTh" TEXT,
      "email" TEXT,
      "phone" TEXT,
      "websiteUrl" TEXT,
      "address" TEXT,
      "addressTh" TEXT,
      "avatarUrl" TEXT,
      "logoUrl" TEXT,
      "linkedinUrl" TEXT,
      "githubUrl" TEXT,
      "googleScholarUrl" TEXT,
      "lineId" TEXT,
      "bio" TEXT,
      "bioTh" TEXT,
      "backTagline" TEXT,
      "backTaglineTh" TEXT,
      "backSubtitle" TEXT,
      "qrType" TEXT NOT NULL DEFAULT 'card_url',
      "customQrUrl" TEXT,
      "primaryColor" TEXT DEFAULT '#ea580c',
      "accentColor" TEXT DEFAULT '#f97316',
      "backgroundColor" TEXT DEFAULT '#0f172a',
      "textColor" TEXT DEFAULT '#ffffff',
      "cardStyleJson" TEXT DEFAULT '{}',
      "orderIndex" INTEGER NOT NULL DEFAULT 0,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE INDEX IF NOT EXISTS "Namecard_orderIndex_idx" ON "Namecard"("orderIndex")`,
    `ALTER TABLE "Namecard" ADD COLUMN IF NOT EXISTS "googleScholarUrl" TEXT`,
    `ALTER TABLE "Namecard" ADD COLUMN IF NOT EXISTS "bio" TEXT`,
    `ALTER TABLE "Namecard" ADD COLUMN IF NOT EXISTS "bioTh" TEXT`,

    // 7. GalleryActivity table
    `CREATE TABLE IF NOT EXISTS "GalleryActivity" (
      "id" TEXT PRIMARY KEY,
      "slug" TEXT UNIQUE NOT NULL,
      "title" TEXT NOT NULL,
      "titleTh" TEXT,
      "description" TEXT,
      "descriptionTh" TEXT,
      "eventDate" TEXT NOT NULL,
      "location" TEXT,
      "locationTh" TEXT,
      "category" TEXT DEFAULT 'Workshop',
      "coverImageUrl" TEXT,
      "driveFolderId" TEXT NOT NULL,
      "photoCount" INTEGER DEFAULT 0,
      "isVisible" BOOLEAN NOT NULL DEFAULT true,
      "orderIndex" INTEGER NOT NULL DEFAULT 0,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE INDEX IF NOT EXISTS "GalleryActivity_orderIndex_eventDate_idx" ON "GalleryActivity"("orderIndex", "eventDate")`
  ];

  for (const sql of statements) {
    try {
      await prisma.$executeRawUnsafe(sql);
    } catch (e: any) {
      // Non-fatal if table/column/index already exists or provider differences
      console.warn("DB table creation warning (non-fatal):", e?.message);
    }
  }

  tablesEnsured = true;
}

export async function checkAdminExists(): Promise<boolean> {
  if (!process.env.DATABASE_URL) return false;
  try {
    await ensureTablesExist();
    const count = await prisma.user.count({
      where: { role: "ADMIN" },
    });
    return count > 0;
  } catch (e) {
    console.warn("Error checking admin existence:", e);
    return false;
  }
}

export async function ensureDefaultAdminAndData() {
  if (!process.env.DATABASE_URL) return;
  try {
    await ensureTablesExist();

    // 2. Ensure Site Settings
    const existingSetting = await prisma.siteSetting.findFirst();
    if (!existingSetting) {
      const downloadPasswordHash = await hashPassword("download123");
      await prisma.siteSetting.create({
        data: {
          siteTitle: "Academic & Professional Portfolio",
          bioTagline: "Researcher, Educator & Software Engineer",
          downloadPasswordHash,
          requireCvPassword: true,
          themePreference: "system",
        },
      });
    }

    // 3. Ensure Profile
    const existingProfile = await prisma.profile.findFirst();
    if (!existingProfile) {
      await prisma.profile.create({
        data: {
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
          avatarUrl: "",
          bio: "Academic researcher and software engineer dedicated to scientific innovation and high-impact engineering solutions.",
          bioTh: "นักวิจัยและวิศวกรซอฟต์แวร์ มุ่งเน้นการพัฒนานวัตกรรมทางวิทยาการคอมพิวเตอร์และงานวิศวกรรมที่สร้างผลกระทบเชิงบวก",
        },
      });
    }

    // 4. Ensure Default Sections
    const sectionCount = await prisma.cvSection.count();
    if (sectionCount === 0) {
      const defaultSections = [
        {
          slug: "education",
          title: "Educational Background",
          titleTh: "ประวัติการศึกษา",
          description: "Academic degrees and formal qualifications.",
          descriptionTh: "คุณวุฒิทางการศึกษาและปริญญาบัตร",
          orderIndex: 1,
          isSystem: true,
          icon: "GraduationCap",
          items: [
            {
              title: "Ph.D. in Computer Engineering",
              titleTh: "วิศวกรรมศาสตรดุษฎีบัณฑิต (วิศวกรรมคอมพิวเตอร์)",
              subtitle: "Dissertation on Autonomous Embedded Edge Intelligence",
              subtitleTh: "วิทยานิพนธ์: สถาปัตยกรรมปัญญาประดิษฐ์ระดับขอบสำหรับระบบสมองกลฝังตัว",
              organization: "Chulalongkorn University",
              organizationTh: "จุฬาลงกรณ์มหาวิทยาลัย",
              location: "Bangkok, Thailand",
              locationTh: "กรุงเทพมหานคร",
              startDate: "2015",
              endDate: "2019",
              isCurrent: false,
              description: "Conducted advanced research in distributed real-time computing and deep neural network optimization for edge hardware.",
              descriptionTh: "วิจัยขั้นสูงด้านการประมวลผลแบบกระจายศูนย์ และการเพิ่มประสิทธิภาพโครงข่ายประสาทเทียมสำหรับฮาร์ดแวร์ระดับขอบ",
              orderIndex: 1,
            },
            {
              title: "M.Eng. in Electrical & Information Engineering",
              titleTh: "วิศวกรรมศาสตรมหาบัณฑิต (วิศวกรรมไฟฟ้าและสารสนเทศ)",
              subtitle: "Graduated with High Honors",
              subtitleTh: "สำเร็จการศึกษาด้วยผลการเรียนดีเด่น",
              organization: "King Mongkut's Institute of Technology Ladkrabang",
              organizationTh: "สถาบันเทคโนโลยีพระจอมเกล้าเจ้าคุณทหารลาดกระบัง",
              location: "Bangkok, Thailand",
              locationTh: "กรุงเทพมหานคร",
              startDate: "2011",
              endDate: "2014",
              isCurrent: false,
              description: "Focused on embedded signal processing and adaptive control algorithms.",
              descriptionTh: "มุ่งเน้นการประมวลผลสัญญาณสมองกลฝังตัว และอัลกอริทึมการควบคุมแบบปรับตัวได้",
              orderIndex: 2,
            },
          ],
        },
        {
          slug: "experience",
          title: "Work Experience",
          titleTh: "ประสบการณ์การทำงาน",
          description: "Professional academic appointments, industry consulting, and laboratory leadership.",
          descriptionTh: "ตำแหน่งทางวิชาการ การให้คำปรึกษาภาคอุตสาหกรรม และการบริหารห้องปฏิบัติการ",
          orderIndex: 2,
          isSystem: true,
          icon: "Briefcase",
          items: [
            {
              title: "Assistant Professor & Lead AI Researcher",
              titleTh: "ผู้ช่วยศาสตราจารย์ และหัวหน้าทีมนักวิจัย AI",
              subtitle: "Department of Computer Engineering",
              subtitleTh: "ภาควิชาวิศวกรรมคอมพิวเตอร์",
              organization: "Rajamangala University of Technology Thanyaburi",
              organizationTh: "มหาวิทยาลัยเทคโนโลยีราชมงคลธัญบุรี",
              location: "Pathum Thani, Thailand",
              locationTh: "จ.ปทุมธานี",
              startDate: "2020",
              endDate: null,
              isCurrent: true,
              description: "Directing the Intelligent Edge Systems Laboratory. Mentoring postgraduate researchers and publishing in top-tier IEEE/ACM venues.",
              descriptionTh: "บริหารห้องปฏิบัติการระบบอัจฉริยะระดับขอบ ดูแลนักวิจัยระดับบัณฑิตศึกษา และตีพิมพ์ผลงานในวารสารชั้นนำระดับสากล",
              orderIndex: 1,
            },
          ],
        },
        {
          slug: "expertise",
          title: "Areas of Expertise",
          titleTh: "ความเชี่ยวชาญเฉพาะทาง",
          description: "Core technical domains, algorithmic competencies, and research methodologies.",
          descriptionTh: "ความเชี่ยวชาญเชิงเทคนิค อัลกอริทึม และระเบียบวิธีวิจัย",
          orderIndex: 3,
          isSystem: true,
          icon: "Cpu",
          items: [
            {
              title: "Edge AI & Embedded Machine Learning",
              titleTh: "ปัญญาประดิษฐ์ระดับขอบ และการเรียนรู้ของเครื่องในระบบฝังตัว",
              subtitle: "Model Quantization, TinyML, FPGA/ASIC Acceleration",
              subtitleTh: "การลดรูปโมเดล, TinyML, การเร่งความเร็วด้วย FPGA/ASIC",
              organization: "RMUTT Advanced Computing Lab",
              organizationTh: "ห้องปฏิบัติการคอมพิวเตอร์ขั้นสูง มทร.ธัญบุรี",
              startDate: "2018",
              endDate: null,
              isCurrent: true,
              description: "Deploying high-efficiency deep learning models on resource-constrained microcontrollers.",
              descriptionTh: "การติดตั้งโมเดลการเรียนรู้เชิงลึกประสิทธิภาพสูงบนไมโครคอนโทรลเลอร์ที่มีทรัพยากรจำกัด",
              orderIndex: 1,
            },
          ],
        },
      ];

      for (const s of defaultSections) {
        const created = await prisma.cvSection.create({
          data: {
            slug: s.slug,
            title: s.title,
            titleTh: s.titleTh,
            description: s.description,
            descriptionTh: s.descriptionTh,
            orderIndex: s.orderIndex,
            isSystem: s.isSystem,
            icon: s.icon,
            isVisible: true,
          },
        });

        for (const it of s.items) {
          await prisma.cvItem.create({
            data: {
              sectionId: created.id,
              title: it.title,
              titleTh: it.titleTh,
              subtitle: it.subtitle,
              subtitleTh: it.subtitleTh,
              organization: it.organization,
              organizationTh: it.organizationTh,
              location: (it as any).location || null,
              locationTh: (it as any).locationTh || null,
              startDate: it.startDate,
              endDate: it.endDate,
              isCurrent: it.isCurrent,
              description: it.description,
              descriptionTh: it.descriptionTh,
              orderIndex: it.orderIndex,
            },
          });
        }
      }
    }

    // 5. Ensure Default Gallery Activities
    const activityCount = await (prisma as any).galleryActivity.count();
    if (activityCount === 0) {
      await (prisma as any).galleryActivity.createMany({
        data: [
          {
            slug: "ai-embedded-systems-workshop-2025",
            title: "Advanced Edge AI & Embedded Systems Workshop 2025",
            titleTh: "การอบรมเชิงปฏิบัติการระบบปัญญาประดิษฐ์ระดับขอบและสมองกลฝังตัวขั้นสูง 2568",
            description: "Hands-on engineering workshop training students and researchers on deploying quantized deep learning models on microcontroller edge devices.",
            descriptionTh: "การอบรมเชิงวิศวกรรมปฏิบัติการจริงในการติดตั้งโมเดลการเรียนรู้เชิงลึกบนไมโครคอนโทรลเลอร์ระดับขอบสำหรับนักศึกษาและนักวิจัย",
            eventDate: "15-17 มกราคม 2568",
            location: "Faculty of Engineering, RMUTT",
            locationTh: "คณะวิศวกรรมศาสตร์ มหาวิทยาลัยเทคโนโลยีราชมงคลธัญบุรี",
            category: "Workshop",
            coverImageUrl: "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=80",
            driveFolderId: "1sample-folder-ai-workshop",
            photoCount: 18,
            orderIndex: 0,
            isVisible: true,
          },
          {
            slug: "international-conference-robotics-automation-2024",
            title: "IEEE International Conference on Robotics & Automation (ICRA)",
            titleTh: "การนำเสนอผลงานวิจัยระดับนานาชาติ IEEE ด้านหุ่นยนต์และระบบอัตโนมัติ",
            description: "Paper presentation and scientific demonstration of autonomous mobile robotics with real-time sensory perception.",
            descriptionTh: "การนำเสนอผลงานวิจัยวิชาการและสาธิตเทคโนโลยีหุ่นยนต์เคลื่อนที่อัตโนมัติพร้อมระบบตรวจจับสัญญาณประสาทสัมผัสแบบเรียลไทม์",
            eventDate: "22-25 พฤศจิกายน 2567",
            location: "BITEC Bangna, Bangkok",
            locationTh: "ศูนย์นิทรรศการและการประชุมไบเทค บางนา กรุงเทพฯ",
            category: "Conference",
            coverImageUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80",
            driveFolderId: "1sample-folder-ieee-conference",
            photoCount: 24,
            orderIndex: 1,
            isVisible: true,
          },
        ],
      });
    }
  } catch (err) {
    console.warn("Auto-seeding encountered non-fatal error:", err);
  }
}
