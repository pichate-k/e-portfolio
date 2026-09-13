export type StandardFieldType =
  | "details"
  | "dropdown"
  | "year"
  | "year_range"
  | "date_range"
  | "address"
  | "link"
  | "upload"
  | "text"
  | "textarea"
  | "file"
  | "date";

export interface DropdownOption {
  value: string;
  label: string; // English
  labelTh?: string; // Thai
}

export interface CustomFieldDef {
  id: string;
  label: string; // English label
  labelTh?: string; // Thai label
  type: StandardFieldType;
  role?: "header" | "sub_header" | "none";
  icon?: string;
  required?: boolean;
  options?: DropdownOption[]; // For dropdown fields
}

export interface SectionExportConfig {
  layout?: "table" | "list";
  listStyle?: "bullet" | "number";
  columnsCount?: number;
  columnTitles?: string[];
  columnMappings?: Record<string, number>;
  hiddenFields?: string[]; // IDs of fields hidden from the exported document
}


export const STANDARD_FIELD_TYPES: {
  id: StandardFieldType;
  label: string;
  defaultIcon: string;
  desc: string;
}[] = [
  { id: "details", label: "Details (รายละเอียด/ข้อความ)", defaultIcon: "📝", desc: "ข้อความหรือคำอธิบายแบบยาว" },
  { id: "dropdown", label: "Dropdown (ตัวเลือกรายการ)", defaultIcon: "🔽", desc: "รายการตัวเลือกให้เลือก 1 รายการ" },
  { id: "year", label: "Year (ระบุปี เช่น 2024 / 2567)", defaultIcon: "📅", desc: "ปี พ.ศ. หรือ ค.ศ." },
  { id: "year_range", label: "Year Range (ระบุช่วงปี เช่น 2020 - 2024)", defaultIcon: "⏳", desc: "ช่วงปีเริ่มต้น - สิ้นสุด" },
  { id: "date_range", label: "Date range (ช่วงเวลา เดือน ปี เช่น ม.ค. 2020 - ธ.ค. 2023)", defaultIcon: "🗓️", desc: "ช่วงเวลาเดือนและปี" },
  { id: "address", label: "Address (ที่อยู่ / สถานที่ / หน่วยงาน)", defaultIcon: "📍", desc: "สถานที่หรือที่ตั้ง" },
  { id: "link", label: "Link (ลิงก์ URL ผลงาน/เว็บไซต์)", defaultIcon: "🔗", desc: "ลิงก์เว็บไซต์หรือ DOI" },
  { id: "upload", label: "Upload (อัปโหลดไฟล์ / เกียรติบัตร / PDF)", defaultIcon: "📤", desc: "ไฟล์เอกสารแนบ" },
];

export const AVAILABLE_ICONS = [
  "📝", "🔽", "📅", "⏳", "🗓️", "📍", "🔗", "📤", "🎓", "🏢", "🏆", "💼", "📜", "🌐", "🔬", "🏷️", "💡", "⭐", "💻", "📑", "👥"
];

export const AVAILABLE_SECTION_ICONS = [
  "🎓", "💼", "🔬", "🏆", "📚", "💻", "📜", "🏢", "🎯", "💡",
  "📊", "🌐", "👥", "🛠️", "⭐", "📝", "🏛️", "📖", "📂", "🎨",
  "🏅", "🚀", "⚡", "🔍"
];

export const FIELD_PRESETS = [
  {
    name: "🎓 การศึกษา (Education)",
    fields: [
      { id: "f_degree", label: "Degree / Qualification", labelTh: "วุฒิการศึกษา", type: "details" as const, role: "header" as const, icon: "🎓" },
      { id: "f_school", label: "University / Institution", labelTh: "สถาบันการศึกษา", type: "address" as const, role: "sub_header" as const, icon: "🏢" },
      { id: "f_year", label: "Academic Years", labelTh: "ปีการศึกษา", type: "year_range" as const, role: "none" as const, icon: "⏳" },
      { id: "f_diploma", label: "Diploma File / PDF", labelTh: "เอกสารปริญญาบัตร / เกียรตินิยม", type: "upload" as const, role: "none" as const, icon: "📤" },
    ],
  },
  {
    name: "🏆 รางวัล & เกียรติบัตร (Awards)",
    fields: [
      { id: "f_award", label: "Award Name / Title", labelTh: "ชื่อรางวัล / เกียรติบัตร", type: "details" as const, role: "header" as const, icon: "🏆" },
      { id: "f_issuer", label: "Awarding Organization", labelTh: "สถาบันหรือองค์กรที่มอบ", type: "address" as const, role: "sub_header" as const, icon: "🏢" },
      { id: "f_year", label: "Year Received", labelTh: "ปีที่ได้รับรางวัล", type: "year" as const, role: "none" as const, icon: "📅" },
      { id: "f_cert", label: "Certificate File", labelTh: "ไฟล์เกียรติบัตร", type: "upload" as const, role: "none" as const, icon: "📤" },
      { id: "f_url", label: "Verification Link", labelTh: "ลิงก์ตรวจสอบผลงาน", type: "link" as const, role: "none" as const, icon: "🔗" },
    ],
  },
  {
    name: "🔬 งานวิจัย (Publications)",
    fields: [
      { id: "f_paper", label: "Paper Title", labelTh: "ชื่อบทความวิจัย", type: "details" as const, role: "header" as const, icon: "🔬" },
      { id: "f_journal", label: "Journal / Conference", labelTh: "วารสารวิชาการ / การประชุม", type: "address" as const, role: "sub_header" as const, icon: "🏢" },
      { id: "f_year", label: "Publication Year", labelTh: "ปีที่ตีพิมพ์", type: "year" as const, role: "none" as const, icon: "📅" },
      { id: "f_doi", label: "DOI or Paper URL", labelTh: "ลิงก์ผลงานวิจัย / DOI", type: "link" as const, role: "none" as const, icon: "🔗" },
      { id: "f_pdf", label: "Full Paper PDF", labelTh: "ไฟล์บทความวิจัยฉบับเต็ม (PDF)", type: "upload" as const, role: "none" as const, icon: "📤" },
      { id: "f_abstract", label: "Abstract", labelTh: "บทคัดย่อ", type: "details" as const, role: "none" as const, icon: "📝" },
    ],
  },
  {
    name: "💼 ประสบการณ์ทำงาน (Work Experience)",
    fields: [
      { id: "f_role", label: "Job Title / Position", labelTh: "ตำแหน่งงาน", type: "details" as const, role: "header" as const, icon: "💼" },
      { id: "f_company", label: "Company / Workplace", labelTh: "หน่วยงาน / บริษัท", type: "address" as const, role: "sub_header" as const, icon: "🏢" },
      { id: "f_period", label: "Employment Period", labelTh: "ช่วงเวลาทำงาน", type: "date_range" as const, role: "none" as const, icon: "🗓️" },
      { id: "f_desc", label: "Responsibilities & Achievements", labelTh: "รายละเอียดงานและหน้าที่", type: "details" as const, role: "none" as const, icon: "📝" },
      { id: "f_url", label: "Organization Website", labelTh: "เว็บไซต์หน่วยงาน", type: "link" as const, role: "none" as const, icon: "🔗" },
    ],
  },
];

export interface CvItemState {
  id: string;
  sectionId: string;
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

export interface CvSectionState {
  id: string;
  slug: string;
  title: string;
  titleTh?: string | null;
  description?: string | null;
  descriptionTh?: string | null;
  orderIndex: number;
  isSystem: boolean;
  isVisible: boolean;
  icon?: string | null;
  contentType?: string | null;
  customFields?: string | null;
  exportConfig?: string | null;
  items: CvItemState[];
}
