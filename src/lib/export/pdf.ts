import { jsPDF } from "jspdf";
import { getImageData } from "./imageHelper";

export interface ProfileData {
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

export interface CvItemData {
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
}

export interface SectionExportConfig {
  layout?: "table" | "list";
  listStyle?: "bullet" | "number";
  columnsCount?: number;
  columnTitles?: string[];
  columnMappings?: Record<string, number>;
  hiddenFields?: string[];
}

export interface CustomFieldDef {
  id: string;
  label: string;
  labelTh?: string;
  type: string;
  role?: "header" | "sub_header" | "none";
  icon?: string;
  options?: { value?: string; label: string; labelTh?: string }[];
}

export interface CvSectionData {
  id: string;
  title: string;
  titleTh?: string | null;
  description?: string | null;
  descriptionTh?: string | null;
  contentType?: string | null;
  customFields?: string | null;
  exportConfig?: string | null;
  items: CvItemData[];
}

export interface CvExportOptions {
  includeProfile?: boolean;
  profileTemplate?: "academic" | "modern" | "compact";
}

export async function generateCvPdf(
  profile: ProfileData,
  sections: CvSectionData[],
  lang: "en" | "th" = "en",
  options: CvExportOptions = {}
): Promise<Buffer> {
  const isTh = lang === "th";
  const { includeProfile = true, profileTemplate = "academic" } = options;

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 18;
  const contentWidth = pageWidth - margin * 2;
  let cursorY = margin;

  const checkPageBreak = (neededHeight: number): boolean => {
    if (cursorY + neededHeight > pageHeight - margin) {
      doc.addPage();
      cursorY = margin;
      return true;
    }
    return false;
  };

  const name = (isTh && profile.fullNameTh) || profile.fullName || "Curriculum Vitae";
  const position = (isTh && profile.currentPositionTh) || profile.currentPosition;
  const workplace = (isTh && profile.workplaceTh) || profile.workplace;
  const address = (isTh && profile.addressTh) || profile.address;
  const bio = (isTh && profile.bioTh) || profile.bio;

  // 1. RENDER PROFILE IF ENABLED
  if (includeProfile) {
    if (profileTemplate === "compact") {
      // COMPACT PROFILE: Space efficient, minimal header, no avatar
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.setTextColor(26, 43, 76);
      doc.text(name, margin, cursorY);
      cursorY += 5.5;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      doc.setTextColor(71, 85, 105);
      const titleLine = [position, workplace].filter(Boolean).join("  |  ");
      if (titleLine) {
        doc.text(titleLine, margin, cursorY);
        cursorY += 4.5;
      }

      const contacts: string[] = [];
      if (address) contacts.push(address);
      if (profile.email) contacts.push(profile.email);
      if (profile.phone) contacts.push(profile.phone);
      if (profile.websiteUrl) contacts.push(profile.websiteUrl);

      if (contacts.length > 0) {
        doc.setFontSize(8.5);
        doc.setTextColor(100, 116, 139);
        const contactStr = contacts.join("   •   ");
        const wrappedContacts = doc.splitTextToSize(contactStr, contentWidth);
        doc.text(wrappedContacts, margin, cursorY);
        cursorY += wrappedContacts.length * 4 + 3;
      }

      doc.setDrawColor(200, 215, 235);
      doc.setLineWidth(0.5);
      doc.line(margin, cursorY, margin + contentWidth, cursorY);
      cursorY += 5;
    } else if (profileTemplate === "modern") {
      // MODERN EXECUTIVE: Stylish header banner with subtle gradient effect
      doc.setFillColor(15, 23, 42); // Slate 900
      doc.rect(0, 0, pageWidth, 42, "F");

      let textStartX = margin;
      const imgData = await getImageData(profile.avatarUrl);
      if (imgData) {
        try {
          const format = imgData.type === "png" ? "PNG" : "JPEG";
          doc.addImage(imgData.base64DataUrl, format, margin, 7, 28, 28);
          textStartX = margin + 33;
        } catch (e) {
          console.warn("Could not insert avatar into PDF:", e);
        }
      }

      doc.setFont("helvetica", "bold");
      doc.setFontSize(19);
      doc.setTextColor(255, 255, 255);
      doc.text(name, textStartX, 17);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(148, 163, 184);
      if (position) doc.text(position, textStartX, 24);
      if (workplace) {
        doc.setFontSize(9);
        doc.setTextColor(203, 213, 225);
        doc.text(workplace, textStartX, 30);
      }

      cursorY = 48;
      // Modern Contact Box
      const contacts: string[] = [];
      if (address) contacts.push(address);
      if (profile.email) contacts.push(profile.email);
      if (profile.phone) contacts.push(profile.phone);
      if (profile.websiteUrl) contacts.push(profile.websiteUrl);

      if (contacts.length > 0) {
        doc.setFontSize(8.5);
        doc.setTextColor(71, 85, 105);
        const contactStr = contacts.join("   •   ");
        const wrappedContacts = doc.splitTextToSize(contactStr, contentWidth);
        doc.text(wrappedContacts, margin, cursorY);
        cursorY += wrappedContacts.length * 4.5 + 4;
      }
    } else {
      // ACADEMIC / CLASSIC (Default)
      doc.setFillColor(26, 43, 76);
      doc.rect(0, 0, pageWidth, 36, "F");

      let textStartX = margin;
      const imgData = await getImageData(profile.avatarUrl);
      if (imgData) {
        try {
          const format = imgData.type === "png" ? "PNG" : "JPEG";
          doc.addImage(imgData.base64DataUrl, format, margin, 6, 24, 24);
          textStartX = margin + 28;
        } catch (e) {
          console.warn("Could not insert avatar into PDF:", e);
        }
      }

      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.setTextColor(255, 255, 255);
      doc.text(name, textStartX, 16);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(220, 230, 245);
      const positionLine = [position, workplace].filter(Boolean).join("  |  ");
      if (positionLine) {
        doc.text(positionLine, textStartX, 24);
      }

      cursorY = 42;
      doc.setFontSize(8.5);
      doc.setTextColor(80, 90, 105);
      const contacts: string[] = [];
      if (address) contacts.push(address);
      if (profile.email) contacts.push(profile.email);
      if (profile.phone) contacts.push(profile.phone);
      if (profile.websiteUrl) contacts.push(profile.websiteUrl);

      if (contacts.length > 0) {
        const contactStr = contacts.join("   •   ");
        const wrappedContacts = doc.splitTextToSize(contactStr, contentWidth);
        doc.text(wrappedContacts, margin, cursorY);
        cursorY += wrappedContacts.length * 4.5 + 4;
      }
    }

    // Professional Summary / Bio
    if (bio) {
      checkPageBreak(25);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(26, 43, 76);
      doc.text(isTh ? "ประวัติโดยย่อ (PROFESSIONAL SUMMARY)" : "PROFESSIONAL SUMMARY", margin, cursorY);
      cursorY += 2;

      doc.setDrawColor(200, 215, 235);
      doc.setLineWidth(0.5);
      doc.line(margin, cursorY, margin + contentWidth, cursorY);
      cursorY += 5;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(50, 60, 75);
      const bioLines = doc.splitTextToSize(bio, contentWidth);
      doc.text(bioLines, margin, cursorY);
      cursorY += bioLines.length * 4.2 + 6;
    }
  }

  // Helper to extract item values with fallback
  const getItemFieldValues = (item: CvItemData, customFields: CustomFieldDef[]) => {
    let customDataObj: Record<string, string> = {};
    if (item.customData) {
      try {
        customDataObj = JSON.parse(item.customData);
      } catch (e) {
        customDataObj = {};
      }
    }

    // If customFields are defined, build structured map
    const fieldMap: { field: CustomFieldDef; value: string }[] = [];

    if (customFields && customFields.length > 0) {
      for (const f of customFields) {
        const isDateType = ["year", "year_range", "date_range", "date"].includes(f.type);
        let val = isDateType
          ? (customDataObj[f.id] || customDataObj[`${f.id}_th`] || "")
          : ((isTh && customDataObj[`${f.id}_th`])
            ? customDataObj[`${f.id}_th`]
            : (customDataObj[f.id] || customDataObj[`${f.id}_th`] || ""));
        if (!val) {
          if (f.role === "header") val = (isTh && item.titleTh) || item.title || "";
          else if (f.role === "sub_header") val = (isTh && item.subtitleTh) || item.subtitle || item.organization || "";
          else if (f.type === "year" || f.type === "year_range" || f.type === "date_range") {
            val = item.startDate ? (item.endDate ? `${item.startDate} - ${item.endDate}` : item.startDate) : "";
          } else if (f.type === "address") val = (isTh && item.locationTh) || item.location || "";
          else if (f.type === "link") val = item.url || "";
          else if (f.type === "details") val = (isTh && item.descriptionTh) || item.description || "";
        }
        if (f.type === "dropdown" && val && f.options && f.options.length > 0) {
          const matched = f.options.find(
            (o) => o.value === val || o.label === val || o.labelTh === val
          );
          if (matched) {
            val = (isTh ? (matched.labelTh || matched.label) : (matched.label || matched.labelTh)) || val;
          }
        }
        fieldMap.push({ field: f, value: val });
      }
    } else {
      // Standard fields fallback for backward compatibility
      const itemTitle = (isTh && item.titleTh) || item.title;
      const itemSubtitle = (isTh && item.subtitleTh) || item.subtitle;
      const itemOrg = (isTh && item.organizationTh) || item.organization;
      const itemLoc = (isTh && item.locationTh) || item.location;
      const itemDesc = (isTh && item.descriptionTh) || item.description;

      let dateRange = "";
      if (item.startDate) {
        dateRange = item.isCurrent
          ? `${item.startDate} - Present`
          : item.endDate
          ? `${item.startDate} - ${item.endDate}`
          : item.startDate;
      }

      fieldMap.push({
        field: { id: "f_title", label: "Title", type: "text", role: "header" },
        value: itemTitle,
      });
      if (dateRange) {
        fieldMap.push({
          field: { id: "f_date", label: "Year/Period", type: "date_range", role: "none" },
          value: dateRange,
        });
      }
      const sub = [itemSubtitle, itemOrg, itemLoc].filter(Boolean).join(" | ");
      if (sub) {
        fieldMap.push({
          field: { id: "f_sub", label: "Subtitle", type: "address", role: "sub_header" },
          value: sub,
        });
      }
      if (itemDesc) {
        fieldMap.push({
          field: { id: "f_desc", label: "Details", type: "details", role: "none" },
          value: itemDesc,
        });
      }
      if (item.url) {
        fieldMap.push({
          field: { id: "f_url", label: "Link", type: "link", role: "none" },
          value: item.url,
        });
      }
    }

    return fieldMap;
  };

  // 2. RENDER SECTIONS
  for (const sec of sections) {
    if (!sec.items || sec.items.length === 0) continue;

    checkPageBreak(22);

    const secTitle = (isTh && sec.titleTh) || sec.title;

    // Section Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11.5);
    doc.setTextColor(26, 43, 76);
    doc.text(secTitle.toUpperCase(), margin, cursorY);
    cursorY += 2.5;

    doc.setDrawColor(26, 43, 76);
    doc.setLineWidth(0.6);
    doc.line(margin, cursorY, margin + contentWidth, cursorY);
    cursorY += 5;

    // Parse section customFields and exportConfig
    let customFields: CustomFieldDef[] = [];
    if (sec.customFields) {
      try {
        customFields = JSON.parse(sec.customFields);
      } catch (e) {
        customFields = [];
      }
    }

    let exportConfig: SectionExportConfig = {};
    if (sec.exportConfig) {
      try {
        exportConfig = JSON.parse(sec.exportConfig);
      } catch (e) {
        exportConfig = {};
      }
    }

    const layout = exportConfig.layout || "list";

    // -------------------------------------------------------------
    // A. TABLE LAYOUT
    // -------------------------------------------------------------
    if (layout === "table") {
      const colCount = Math.max(2, Math.min(4, exportConfig.columnsCount || 3));
      const colTitles = exportConfig.columnTitles && exportConfig.columnTitles.length === colCount
        ? exportConfig.columnTitles
        : colCount === 2
        ? [isTh ? "ปี / ช่วงเวลา" : "Year / Period", isTh ? "หัวข้อ & รายละเอียด" : "Title & Details"]
        : colCount === 3
        ? [isTh ? "ปี / ช่วงเวลา" : "Year / Period", isTh ? "หัวข้อ & รายละเอียด" : "Title & Details", isTh ? "สถานที่ / ลิงก์" : "Location / Links"]
        : [isTh ? "ปี" : "Year", isTh ? "หัวข้อ" : "Title", isTh ? "รายละเอียด" : "Details", isTh ? "หมายเหตุ" : "Notes"];

      // Column widths (distribute across contentWidth)
      let colWidths: number[] = [];
      if (colCount === 2) {
        colWidths = [45, contentWidth - 45];
      } else if (colCount === 3) {
        colWidths = [38, contentWidth - 38 - 46, 46];
      } else {
        colWidths = [28, 62, contentWidth - 28 - 62 - 38, 38];
      }

      // Draw Table Header
      checkPageBreak(16);
      doc.setFillColor(241, 245, 249); // slate-100
      doc.rect(margin, cursorY, contentWidth, 7, "F");
      doc.setDrawColor(203, 213, 225); // slate-300
      doc.setLineWidth(0.3);
      doc.rect(margin, cursorY, contentWidth, 7, "S");

      let currentX = margin;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(30, 41, 59);

      for (let i = 0; i < colCount; i++) {
        doc.text(colTitles[i] || `Col ${i + 1}`, currentX + 2.5, cursorY + 4.8);
        currentX += colWidths[i];
        if (i < colCount - 1) {
          doc.line(currentX, cursorY, currentX, cursorY + 7);
        }
      }
      cursorY += 7;

      // Table Rows
      for (const item of sec.items) {
        const itemFields = getItemFieldValues(item, customFields);

        // Map fields to columns
        const cellContents: string[][] = Array.from({ length: colCount }, () => []);

        for (const { field, value } of itemFields) {
          if (!value) continue;
          if (exportConfig.hiddenFields && exportConfig.hiddenFields.includes(field.id)) {
            continue;
          }
          let targetCol = 0;

          if (exportConfig.columnMappings && exportConfig.columnMappings[field.id] !== undefined) {
            targetCol = Math.min(colCount - 1, Math.max(0, exportConfig.columnMappings[field.id]));
          } else {
            // Intelligent fallback mapping
            if (field.type === "year" || field.type === "year_range" || field.type === "date_range") {
              targetCol = 0;
            } else if (field.role === "header" || field.role === "sub_header" || field.type === "details") {
              targetCol = Math.min(1, colCount - 1);
            } else {
              targetCol = colCount - 1;
            }
          }

          const fLabel = (isTh && field.labelTh) || field.label;
          if (field.role === "header") {
            cellContents[targetCol].push(`[H]${value}`);
          } else {
            cellContents[targetCol].push(fLabel ? `${fLabel}: ${value}` : value);
          }
        }

        // Calculate height needed for this row
        const cellLinesArr: { lines: string[]; isHeader: boolean }[][] = [];
        let maxRowHeight = 8; // min row height

        for (let c = 0; c < colCount; c++) {
          const linesForCol: { lines: string[]; isHeader: boolean }[] = [];
          const availWidth = colWidths[c] - 5;
          let colHeight = 3;

          for (const rawText of cellContents[c]) {
            const isH = rawText.startsWith("[H]");
            const textToWrap = isH ? rawText.slice(3) : rawText;
            doc.setFont("helvetica", isH ? "bold" : "normal");
            doc.setFontSize(isH ? 8.5 : 8);
            const wrapped = doc.splitTextToSize(textToWrap, availWidth);
            linesForCol.push({ lines: wrapped, isHeader: isH });
            colHeight += wrapped.length * 3.8 + 1.2;
          }

          cellLinesArr.push(linesForCol);
          if (colHeight > maxRowHeight) maxRowHeight = colHeight;
        }

        checkPageBreak(maxRowHeight + 2);

        // Draw Row border & content
        doc.setDrawColor(226, 232, 240); // slate-200
        doc.setLineWidth(0.2);
        doc.rect(margin, cursorY, contentWidth, maxRowHeight, "S");

        currentX = margin;
        for (let c = 0; c < colCount; c++) {
          let textY = cursorY + 4;
          for (const itemLine of cellLinesArr[c]) {
            doc.setFont("helvetica", itemLine.isHeader ? "bold" : "normal");
            doc.setFontSize(itemLine.isHeader ? 8.5 : 8);
            doc.setTextColor(itemLine.isHeader ? 15 : 51, itemLine.isHeader ? 23 : 65, itemLine.isHeader ? 42 : 85);
            doc.text(itemLine.lines, currentX + 2.5, textY);
            textY += itemLine.lines.length * 3.8 + 1.2;
          }

          currentX += colWidths[c];
          if (c < colCount - 1) {
            doc.line(currentX, cursorY, currentX, cursorY + maxRowHeight);
          }
        }

        cursorY += maxRowHeight;
      }

      cursorY += 5;
    } else {
      // -------------------------------------------------------------
      // B. LIST LAYOUT (Bullet vs Number)
      // -------------------------------------------------------------
      const listStyle = exportConfig.listStyle || "bullet";
      let itemIndex = 1;

      for (const item of sec.items) {
        checkPageBreak(18);

        const rawItemFields = getItemFieldValues(item, customFields);
        const itemFields = rawItemFields.filter(
          (f) => !(exportConfig.hiddenFields && exportConfig.hiddenFields.includes(f.field.id))
        );

        if (itemFields.length === 0) continue;

        // Separate header, sub_header, date, and others
        const isHeaderFieldHidden = rawItemFields.some(
          (f) => f.field.role === "header" && exportConfig.hiddenFields?.includes(f.field.id)
        );
        const headerField = isHeaderFieldHidden ? null : (itemFields.find((f) => f.field.role === "header") || itemFields[0]);
        const subHeaderField = itemFields.find((f) => f.field.role === "sub_header" && f !== headerField);
        const dateField = itemFields.find((f) => ["year", "year_range", "date_range"].includes(f.field.type) && f !== headerField);
        const otherFields = itemFields.filter((f) => f !== headerField && f !== subHeaderField && f !== dateField);

        const headerPrefix = listStyle === "number" ? `${itemIndex}. ` : `• `;
        const headerTitle = headerField ? (headerPrefix + (headerField.value || item.title || "Item")) : "";
        const dateStr = dateField?.value || "";

        doc.setFont("helvetica", "bold");
        doc.setFontSize(9.5);
        doc.setTextColor(30, 41, 59);

        if (headerTitle) {
          if (dateStr) {
            const dateWidth = doc.getTextWidth(dateStr);
            doc.setFont("helvetica", "normal");
            doc.setFontSize(8.5);
            doc.setTextColor(100, 116, 139);
            doc.text(dateStr, margin + contentWidth - dateWidth, cursorY);

            doc.setFont("helvetica", "bold");
            doc.setFontSize(9.5);
            doc.setTextColor(30, 41, 59);
            const availWidth = contentWidth - dateWidth - 5;
            const lines = doc.splitTextToSize(headerTitle, availWidth);
            doc.text(lines, margin, cursorY);
            cursorY += lines.length * 4.2;
          } else {
            const lines = doc.splitTextToSize(headerTitle, contentWidth);
            doc.text(lines, margin, cursorY);
            cursorY += lines.length * 4.2;
          }
        } else if (dateStr) {
          doc.setFont("helvetica", "normal");
          doc.setFontSize(8.5);
          doc.setTextColor(100, 116, 139);
          doc.text(dateStr, margin, cursorY);
          cursorY += 4.5;
        }

        if (headerTitle) itemIndex++;

        // Sub Header
        if (subHeaderField && subHeaderField.value) {
          doc.setFont("helvetica", "italic");
          doc.setFontSize(8.5);
          doc.setTextColor(71, 85, 105);
          const subLines = doc.splitTextToSize(subHeaderField.value, contentWidth - 6);
          doc.text(subLines, margin + 4, cursorY);
          cursorY += subLines.length * 4 + 1;
        }

        // Other fields
        for (const { field, value } of otherFields) {
          if (!value) continue;
          const fLabel = (isTh && field.labelTh) || field.label;
          if (field.type === "details") {
            doc.setFont("helvetica", "normal");
            doc.setFontSize(8.5);
            doc.setTextColor(51, 65, 85);
            const descLines = doc.splitTextToSize(value, contentWidth - 6);
            doc.text(descLines, margin + 4, cursorY);
            cursorY += descLines.length * 3.9 + 1;
          } else if (field.type === "link") {
            doc.setFont("helvetica", "normal");
            doc.setFontSize(8);
            doc.setTextColor(37, 99, 235);
            const linkText = `${fLabel}: ${value}`;
            const linkLines = doc.splitTextToSize(linkText, contentWidth - 6);
            doc.text(linkLines, margin + 4, cursorY);
            cursorY += linkLines.length * 3.8 + 1;
          } else {
            doc.setFont("helvetica", "normal");
            doc.setFontSize(8.5);
            doc.setTextColor(71, 85, 105);
            const valText = `${fLabel}: ${value}`;
            const valLines = doc.splitTextToSize(valText, contentWidth - 6);
            doc.text(valLines, margin + 4, cursorY);
            cursorY += valLines.length * 3.8 + 1;
          }
        }

        cursorY += 2.5;
        itemIndex++;
      }

      cursorY += 3;
    }
  }

  // 3. PAGE NUMBERS
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Curriculum Vitae — ${name} | Page ${i} of ${totalPages}`,
      pageWidth / 2,
      pageHeight - 8,
      { align: "center" }
    );
  }

  const arrayBuffer = doc.output("arraybuffer");
  return Buffer.from(arrayBuffer);
}
