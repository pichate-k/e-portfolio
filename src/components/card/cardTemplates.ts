export interface CardTextColors {
  orgColor?: string;
  nameColor?: string;
  positionColor?: string;
  contactColor?: string;
  taglineColor?: string;
  subtitleColor?: string;
}

export interface NamecardData {
  id?: string;
  slug: string;
  title: string;
  template:
    | "executive"
    | "academic"
    | "modern"
    | "cyber"
    | "emerald"
    | "rosegold"
    | "titanium"
    | "ruby"
    | "champagne"
    | "amethyst"
    | string;
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
  textColors?: CardTextColors;
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
  {
    id: "rosegold",
    name: "Midnight Obsidian & Rose Gold",
    nameTh: "มิดไนท์ออบซิเดียน & พิ้งค์โกลด์หรูหรา",
    description: "Sleek matte obsidian backdrop with radiant rose gold metallic accents and refined typography.",
    previewBg: "linear-gradient(135deg, #271b24 0%, #120e15 100%)",
    defaultPrimary: "#fb7185",
    defaultAccent: "#fda4af",
    defaultBg: "#17101a",
    theme: "dark",
  },
  {
    id: "titanium",
    name: "Titanium Slate & Electric Ice",
    nameTh: "ไทเทเนียมสตีล & ไอซ์บลูล้ำสมัย",
    description: "High-tech brushed titanium steel with crisp arctic cyan highlights and industrial precision.",
    previewBg: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
    defaultPrimary: "#38bdf8",
    defaultAccent: "#94a3b8",
    defaultBg: "#0b1220",
    theme: "dark",
  },
  {
    id: "ruby",
    name: "Imperial Crimson & Gold",
    nameTh: "แดงทับทิมจักรพรรดิ & ทองคำราชสำนัก",
    description: "Regal deep velvet crimson with polished opulent gold foil borders and royal prestige.",
    previewBg: "linear-gradient(135deg, #58121a 0%, #2b080e 100%)",
    defaultPrimary: "#f59e0b",
    defaultAccent: "#fbbf24",
    defaultBg: "#22080d",
    theme: "dark",
  },
  {
    id: "champagne",
    name: "Champagne Ivory & Warm Bronze",
    nameTh: "แชมเปญไอวอรี & บรอนซ์อบอุ่นพรีเมียม",
    description: "Luxurious textured ivory fine-paper aesthetic with warm bronze metallic borders and dark slate typography.",
    previewBg: "linear-gradient(135deg, #fafaf9 0%, #f5f5f4 100%)",
    defaultPrimary: "#78350f",
    defaultAccent: "#b45309",
    defaultBg: "#fffdf9",
    theme: "light",
  },
  {
    id: "amethyst",
    name: "Royal Amethyst & Platinum",
    nameTh: "ม่วงอเมทิสต์หลวง & ซิลเวอร์แพลทินัม",
    description: "Mystic imperial violet nebula with radiant platinum silver glow and elevated elegance.",
    previewBg: "linear-gradient(135deg, #4c1d95 0%, #2e1065 100%)",
    defaultPrimary: "#c084fc",
    defaultAccent: "#e2e8f0",
    defaultBg: "#130926",
    theme: "dark",
  },
];

export function parseCardTextColors(card: NamecardData): CardTextColors {
  if (card.textColors) return card.textColors;
  if (!card.cardStyleJson) return {};
  try {
    const parsed = typeof card.cardStyleJson === "string" ? JSON.parse(card.cardStyleJson) : card.cardStyleJson;
    return parsed?.textColors || {};
  } catch {
    return {};
  }
}

export function encodeCardStyle(cardStyleJson?: string | null, textColors?: CardTextColors): string {
  try {
    const existing = cardStyleJson ? JSON.parse(cardStyleJson) : {};
    return JSON.stringify({ ...existing, textColors: textColors || {} });
  } catch {
    return JSON.stringify({ textColors: textColors || {} });
  }
}

