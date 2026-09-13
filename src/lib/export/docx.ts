import {
  Document,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
  Packer,
  Table,
  TableRow,
  TableCell,
  WidthType,
  ImageRun,
} from "docx";
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

export async function generateCvDocx(
  profile: ProfileData,
  sections: CvSectionData[],
  lang: "en" | "th" = "en",
  options: CvExportOptions = {}
): Promise<Buffer> {
  const isTh = lang === "th";
  const { includeProfile = true, profileTemplate = "academic" } = options;
  const children: (Paragraph | Table)[] = [];

  const name = (isTh && profile.fullNameTh) || profile.fullName || "Curriculum Vitae";
  const position = (isTh && profile.currentPositionTh) || profile.currentPosition;
  const workplace = (isTh && profile.workplaceTh) || profile.workplace;
  const address = (isTh && profile.addressTh) || profile.address;
  const bio = (isTh && profile.bioTh) || profile.bio;

  // 1. RENDER PROFILE IF ENABLED
  if (includeProfile) {
    if (profileTemplate === "compact") {
      // COMPACT PROFILE: Space-saving single column without avatar
      children.push(
        new Paragraph({
          alignment: AlignmentType.LEFT,
          spacing: { after: 60 },
          children: [
            new TextRun({
              text: name,
              bold: true,
              size: 32,
              color: "1A365D",
              font: "Arial",
            }),
          ],
        })
      );

      const titleLine = [position, workplace].filter(Boolean).join("  |  ");
      if (titleLine) {
        children.push(
          new Paragraph({
            alignment: AlignmentType.LEFT,
            spacing: { after: 60 },
            children: [
              new TextRun({
                text: titleLine,
                size: 20,
                color: "4A5568",
                font: "Arial",
              }),
            ],
          })
        );
      }

      const contactParts: string[] = [];
      if (address) contactParts.push(address);
      if (profile.email) contactParts.push(profile.email);
      if (profile.phone) contactParts.push(profile.phone);
      if (profile.websiteUrl) contactParts.push(profile.websiteUrl);

      if (contactParts.length > 0) {
        children.push(
          new Paragraph({
            alignment: AlignmentType.LEFT,
            spacing: { after: 120 },
            children: [
              new TextRun({
                text: contactParts.join("   •   "),
                size: 18,
                color: "718096",
                font: "Arial",
              }),
            ],
          })
        );
      }
    } else {
      // ACADEMIC or MODERN (Centered header with avatar)
      const imgData = await getImageData(profile.avatarUrl);
      if (imgData) {
        try {
          children.push(
            new Paragraph({
              alignment: AlignmentType.CENTER,
              spacing: { after: 100 },
              children: [
                new ImageRun({
                  data: imgData.buffer,
                  transformation: { width: 80, height: 80 },
                  type: imgData.type,
                }),
              ],
            })
          );
        } catch (e) {
          console.warn("Could not insert image into DOCX:", e);
        }
      }

      // Title: Full Name
      children.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 80 },
          children: [
            new TextRun({
              text: name,
              bold: true,
              size: 36,
              color: profileTemplate === "modern" ? "0F172A" : "1A365D",
              font: "Arial",
            }),
          ],
        })
      );

      // Position & Workplace
      const positionLine = [position, workplace].filter(Boolean).join(" | ");
      if (positionLine) {
        children.push(
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 80 },
            children: [
              new TextRun({
                text: positionLine,
                bold: true,
                size: 22,
                color: "2D3748",
                font: "Arial",
              }),
            ],
          })
        );
      }

      // Address & Contacts Line
      const contactParts: string[] = [];
      if (address) contactParts.push(address);
      if (profile.email) contactParts.push(profile.email);
      if (profile.phone) contactParts.push(profile.phone);
      if (profile.websiteUrl) contactParts.push(profile.websiteUrl);

      if (contactParts.length > 0) {
        children.push(
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 140 },
            children: [
              new TextRun({
                text: contactParts.join(" • "),
                size: 19,
                color: "4A5568",
                font: "Arial",
              }),
            ],
          })
        );
      }
    }

    // Divider Line
    children.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: {
          bottom: { style: BorderStyle.SINGLE, size: 8, color: "CBD5E1" },
          top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
          left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
          right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
        },
        rows: [
          new TableRow({
            children: [
              new TableCell({
                children: [],
                borders: {
                  bottom: { style: BorderStyle.SINGLE, size: 8, color: "CBD5E1" },
                  top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                  left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                  right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                },
              }),
            ],
          }),
        ],
      })
    );

    // Professional Bio
    if (bio) {
      children.push(
        new Paragraph({
          spacing: { before: 180, after: 80 },
          heading: HeadingLevel.HEADING_2,
          children: [
            new TextRun({
              text: isTh ? "ประวัติโดยย่อ (PROFESSIONAL SUMMARY)" : "PROFESSIONAL SUMMARY",
              bold: true,
              size: 22,
              color: "1A365D",
              font: "Arial",
            }),
          ],
        })
      );

      children.push(
        new Paragraph({
          spacing: { after: 200 },
          children: [
            new TextRun({
              text: bio,
              size: 20,
              color: "2D3748",
              font: "Arial",
            }),
          ],
        })
      );
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

    const secTitle = (isTh && sec.titleTh) || sec.title;

    // Section Header
    children.push(
      new Paragraph({
        spacing: { before: 240, after: 120 },
        heading: HeadingLevel.HEADING_2,
        children: [
          new TextRun({
            text: secTitle.toUpperCase(),
            bold: true,
            size: 23,
            color: "1A365D",
            font: "Arial",
          }),
        ],
      })
    );

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

      const colWidthPercent = Math.floor(100 / colCount);

      // Header row
      const headerCells: TableCell[] = colTitles.map((title) =>
        new TableCell({
          width: { size: colWidthPercent, type: WidthType.PERCENTAGE },
          shading: { fill: "F1F5F9" },
          children: [
            new Paragraph({
              spacing: { before: 80, after: 80 },
              children: [
                new TextRun({
                  text: title,
                  bold: true,
                  size: 19,
                  color: "1E293B",
                  font: "Arial",
                }),
              ],
            }),
          ],
        })
      );

      const tableRows: TableRow[] = [
        new TableRow({
          tableHeader: true,
          children: headerCells,
        }),
      ];

      // Item rows
      for (const item of sec.items) {
        const itemFields = getItemFieldValues(item, customFields);
        const cellParagraphs: Paragraph[][] = Array.from({ length: colCount }, () => []);

        for (const { field, value } of itemFields) {
          if (!value) continue;
          if (exportConfig.hiddenFields && exportConfig.hiddenFields.includes(field.id)) {
            continue;
          }
          let targetCol = 0;

          if (exportConfig.columnMappings && exportConfig.columnMappings[field.id] !== undefined) {
            targetCol = Math.min(colCount - 1, Math.max(0, exportConfig.columnMappings[field.id]));
          } else {
            if (field.type === "year" || field.type === "year_range" || field.type === "date_range") {
              targetCol = 0;
            } else if (field.role === "header" || field.role === "sub_header" || field.type === "details") {
              targetCol = Math.min(1, colCount - 1);
            } else {
              targetCol = colCount - 1;
            }
          }

          if (field.role === "header") {
            cellParagraphs[targetCol].push(
              new Paragraph({
                spacing: { before: 40, after: 40 },
                children: [
                  new TextRun({
                    text: value,
                    bold: true,
                    size: 19,
                    color: "0F172A",
                    font: "Arial",
                  }),
                ],
              })
            );
          } else {
            const fLabel = (isTh && field.labelTh) || field.label;
            cellParagraphs[targetCol].push(
              new Paragraph({
                spacing: { before: 20, after: 20 },
                children: [
                  new TextRun({
                    text: fLabel ? `${fLabel}: ` : "",
                    bold: true,
                    size: 17,
                    color: "64748B",
                    font: "Arial",
                  }),
                  new TextRun({
                    text: value,
                    size: 17,
                    color: "334155",
                    font: "Arial",
                  }),
                ],
              })
            );
          }
        }

        // Fill empty cells if column had no content
        const rowCells: TableCell[] = cellParagraphs.map((paras) =>
          new TableCell({
            width: { size: colWidthPercent, type: WidthType.PERCENTAGE },
            children: paras.length > 0 ? paras : [new Paragraph({ children: [] })],
          })
        );

        tableRows.push(new TableRow({ children: rowCells }));
      }

      children.push(
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          borders: {
            top: { style: BorderStyle.SINGLE, size: 4, color: "CBD5E1" },
            bottom: { style: BorderStyle.SINGLE, size: 4, color: "CBD5E1" },
            left: { style: BorderStyle.SINGLE, size: 4, color: "CBD5E1" },
            right: { style: BorderStyle.SINGLE, size: 4, color: "CBD5E1" },
            insideHorizontal: { style: BorderStyle.SINGLE, size: 2, color: "E2E8F0" },
            insideVertical: { style: BorderStyle.SINGLE, size: 2, color: "E2E8F0" },
          },
          rows: tableRows,
        })
      );
    } else {
      // -------------------------------------------------------------
      // B. LIST LAYOUT (Bullet vs Number)
      // -------------------------------------------------------------
      const listStyle = exportConfig.listStyle || "bullet";
      let itemIndex = 1;

      for (const item of sec.items) {
        const rawItemFields = getItemFieldValues(item, customFields);
        const itemFields = rawItemFields.filter(
          (f) => !(exportConfig.hiddenFields && exportConfig.hiddenFields.includes(f.field.id))
        );

        if (itemFields.length === 0) continue;

        const isHeaderFieldHidden = rawItemFields.some(
          (f) => f.field.role === "header" && exportConfig.hiddenFields?.includes(f.field.id)
        );
        const headerField = isHeaderFieldHidden ? null : (itemFields.find((f) => f.field.role === "header") || itemFields[0]);
        const subHeaderField = itemFields.find((f) => f.field.role === "sub_header" && f !== headerField);
        const dateField = itemFields.find((f) => ["year", "year_range", "date_range"].includes(f.field.type) && f !== headerField);
        const otherFields = itemFields.filter((f) => f !== headerField && f !== subHeaderField && f !== dateField);

        const prefix = listStyle === "number" ? `${itemIndex}. ` : `• `;
        const headerTitle = headerField ? (prefix + (headerField.value || item.title || "Item")) : "";
        const dateStr = dateField?.value ? `  [${dateField.value}]` : "";

        if (headerTitle || dateStr) {
          const titleRuns: TextRun[] = [];
          if (headerTitle) {
            titleRuns.push(
              new TextRun({
                text: headerTitle,
                bold: true,
                size: 20,
                color: "1A202C",
                font: "Arial",
              })
            );
          }
          if (dateStr) {
            titleRuns.push(
              new TextRun({
                text: dateStr,
                italics: true,
                size: 18,
                color: "718096",
                font: "Arial",
              })
            );
          }

          children.push(
            new Paragraph({
              spacing: { before: 90, after: 40 },
              children: titleRuns,
            })
          );
        }

        if (headerTitle) itemIndex++;

        // Sub Header
        if (subHeaderField && subHeaderField.value) {
          children.push(
            new Paragraph({
              spacing: { after: 40 },
              indent: { left: 360 },
              children: [
                new TextRun({
                  text: subHeaderField.value,
                  italics: true,
                  size: 19,
                  color: "4A5568",
                  font: "Arial",
                }),
              ],
            })
          );
        }

        // Other fields
        for (const { field, value } of otherFields) {
          if (!value) continue;
          const fLabel = (isTh && field.labelTh) || field.label;
          children.push(
            new Paragraph({
              spacing: { after: 30 },
              indent: { left: 360 },
              children: [
                new TextRun({
                  text: `${fLabel}: `,
                  bold: true,
                  size: 18,
                  color: "64748B",
                  font: "Arial",
                }),
                new TextRun({
                  text: value,
                  size: 18,
                  color: field.type === "link" ? "2563EB" : "334155",
                  font: "Arial",
                }),
              ],
            })
          );
        }

        itemIndex++;
      }
    }
  }

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1000,
              right: 1000,
              bottom: 1000,
              left: 1000,
            },
          },
        },
        children,
      },
    ],
  });

  return await Packer.toBuffer(doc);
}
