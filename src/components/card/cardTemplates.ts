export interface NamecardData {
  id?: string;
  slug: string;
  title: string;
  template: "executive" | "academic" | "modern" | "cyber" | "emerald" | string;
  isDefault?: boolean;
  
  // Front details
  fullName: string;
  fullNameTh?: string | null;
  position: string;
  positionTh?: string | null;
  organization?: string | null;
  organizationTh?: string | null;
  department?: string | null;
  departmentTh?: string | null;
  email?: string | null;
  phone?: string | null;
  websiteUrl?: string | null;
  address?: string | null;
  addressTh?: string | null;
  avatarUrl?: string | null;
  logoUrl?: string | null;
  
  // Social / Links
  linkedinUrl?: string | null;
  githubUrl?: string | null;
  googleScholarUrl?: string | null;
  lineId?: string | null;

  // Bio
  bio?: string | null;
  bioTh?: string | null;
  
  // Back details
  backTagline?: string | null;
  backTaglineTh?: string | null;
  backSubtitle?: string | null;
  qrType?: "card_url" | "vcf" | "custom" | string;
  customQrUrl?: string | null;
  
  // Styling
  primaryColor?: string | null;
  accentColor?: string | null;
  backgroundColor?: string | null;
  textColor?: string | null;
  cardStyleJson?: string | null;
}

export interface CardTemplateDef {
  id: string;
  name: string;
  nameTh: string;
  description: string;
  previewBg: string;
  defaultPrimary: string;
  defaultAccent: string;
  defaultBg: string;
  theme: "dark" | "light";
}

export const CARD_TEMPLATES: CardTemplateDef[] = [
  {
    id: "executive",
    name: "Executive Charcoal & Gold",
    nameTh: "เอ็กเซกคิวทีฟ สีดำชาร์โคล & ทองคำพรีเมียม",
    description: "Ultra-luxury obsidian carbon card with brushed gold foil typography and metallic accents.",
    previewBg: "linear-gradient(135deg, #18181b 0%, #09090b 100%)",
    defaultPrimary: "#d4af37",
    defaultAccent: "#f59e0b",
    defaultBg: "#0f1117",
    theme: "dark",
  },
  {
    id: "academic",
    name: "Royal Academic Navy",
    nameTh: "วิชาการชั้นสูง สีน้ำเงินรอยัลเนวี & ตราสถาบัน",
    description: "Prestigious sapphire navy with institutional crest styling, clean academic hierarchy.",
    previewBg: "linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%)",
    defaultPrimary: "#3b82f6",
    defaultAccent: "#fbbf24",
    defaultBg: "#0b1329",
    theme: "dark",
  },
  {
    id: "modern",
    name: "Modern Minimalist Slate",
    nameTh: "มินิมอลร่วมสมัย คลีนสเลต & ขอบเรียบหรู",
    description: "Architectural clean aesthetic with crisp typography, subtle hairline borders, modern light/slate feel.",
    previewBg: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
    defaultPrimary: "#0f172a",
    defaultAccent: "#ea580c",
    defaultBg: "#ffffff",
    theme: "light",
  },
  {
    id: "cyber",
    name: "Cyber AI Tech Gradient",
    nameTh: "ไซเบอร์เทค AI นีออนเกรเดียนท์ล้ำสมัย",
    description: "Futuristic dark tech aesthetic with vibrant glowing mesh gradient and glassmorphism.",
    previewBg: "linear-gradient(135deg, #4c1d95 0%, #0e7490 100%)",
    defaultPrimary: "#8b5cf6",
    defaultAccent: "#06b6d4",
    defaultBg: "#0a0a16",
    theme: "dark",
  },
  {
    id: "emerald",
    name: "Emerald Executive & Brass",
    nameTh: "มรกตผู้บริหาร สีเขียวเอเมอรัลด์ & ทองเหลือง",
    description: "Deep imperial forest emerald with warm brass typography and polished executive refinement.",
    previewBg: "linear-gradient(135deg, #064e3b 0%, #022c22 100%)",
    defaultPrimary: "#10b981",
    defaultAccent: "#d97706",
    defaultBg: "#042017",
    theme: "dark",
  },
];
