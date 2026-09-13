# Architecture Specification: Notion & Lark-Style Project Management System
*Archived for next development cycle*

## Executive Overview

This specification documents the architecture, database schema, user interface designs, and phased roadmap to build an advanced **Project Management System (Notion & Lark/Feishu Hybrid)** directly inside this Next.js + PostgreSQL + Prisma mono-project.

The system will empower Dr. Pichate K. and team to manage research grants, academic engineering projects, lab milestones, and personal tasks using flexible **block-based documentation (Notion style)** and **multi-dimensional project databases with Kanban, Gantt, and Table views (Lark/Feishu style)**.

---

## 🏗 System Architecture & Key Modules

```mermaid
graph TD
    subgraph Frontend [Next.js App Router]
        A[Workspace Navigator] --> B[Block-based Document Pages]
        A --> C[Project Database Hub]
        C --> D1[Kanban Board View]
        C --> D2[Interactive Table / Grid View]
        C --> D3[Gantt / Timeline View]
        C --> D4[Calendar Schedule View]
        C --> D5[Checklist View]
    end

    subgraph Backend [Server Actions & Route Handlers]
        API_BLOCKS[/api/workspace/blocks]
        API_TASKS[/api/workspace/tasks]
        API_VIEWS[/api/workspace/views]
        API_COLLAB[/api/workspace/realtime]
    end

    subgraph Storage [PostgreSQL + Prisma ORM]
        DB_WORKSPACE[(Workspace & Members)]
        DB_DOCS[(Pages & Block Tree)]
        DB_PROJECTS[(Projects & Tasks)]
        DB_VIEWS[(Custom Views & Filters)]
    end

    Frontend --> Backend
    Backend --> Storage
```

---

## 🌟 Core Features (Notion + Lark Hybrid)

### 1. Document & Knowledge Base (Notion Style)
- **Hierarchical Nested Pages**: Unlimited parent-child page structure with custom icons and cover banners.
- **Block-Based Rich Editor**:
  - Headings (H1, H2, H3), Paragraphs, Quotes, Callout banners with custom icons.
  - Interactive Task check-boxes.
  - Code blocks with syntax highlighting (Python, C++, TypeScript, SQL).
  - Formula/LaTeX blocks for academic research equations.
  - Drag-and-drop block reordering and keyboard slash commands (`/todo`, `/heading`, `/table`, `/callout`).

### 2. Multi-Dimensional Project Database (Lark / Feishu Style)
Every project can be visualized through 5 interchangeable, real-time synchronized views:
1. **Kanban Board View**:
   - Drag-and-drop task cards across customizable columns (e.g. *Backlog*, *In Progress*, *Testing / Verification*, *Completed*).
   - Card previews with priority badges, assignees, subtask progress bars, and due dates.
2. **Table / Grid View (Multi-Table Spreadsheet)**:
   - Inline cell editing for Status, Priority, Due Date, Assignees, Tags, Estimated Hours, and Cost/Budget.
   - Column sorting, multi-criteria filtering, and grouping.
3. **Gantt / Timeline View**:
   - Visual milestone timelines showing task durations and start-to-finish dependencies.
   - Zoom controls (Days, Weeks, Months, Quarters).
4. **Calendar View**:
   - Monthly and weekly calendar showing impending grant deadlines and project deliverables.
5. **List / Checklist View**:
   - Compact checklist for daily standups and quick progress review.

### 3. Portfolio Integration & Public vs. Internal Visibility
- **Public Showcase Toggle**: Any completed or ongoing research project can be marked as `"Public Showcase"`.
- Seamlessly synchronizes with the public CV section **"Project Management Experience"** so visitors can see live milestones, team sizes, and grant achievements.
- Unmarked projects remain strictly private within the authenticated team workspace.

---

## 🗄 Proposed Prisma Database Schema Extension

```prisma
model Workspace {
  id          String    @id @default(cuid())
  name        String    @default("Research & Engineering Lab")
  slug        String    @unique
  description String?
  projects    Project[]
  pages       DocPage[]
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

model DocPage {
  id          String     @id @default(cuid())
  workspaceId String
  workspace   Workspace  @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  parentId    String?
  parent      DocPage?   @relation("PageHierarchy", fields: [parentId], references: [id], onDelete: Cascade)
  children    DocPage[]  @relation("PageHierarchy")
  title       String     @default("Untitled Page")
  icon        String?    @default("📄")
  coverUrl    String?
  orderIndex  Int        @default(0)
  blocks      DocBlock[]
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
}

model DocBlock {
  id          String   @id @default(cuid())
  pageId      String
  page        DocPage  @relation(fields: [pageId], references: [id], onDelete: Cascade)
  type        String   // "paragraph" | "heading_1" | "heading_2" | "todo" | "callout" | "code"
  contentJson Json     // Rich content payload
  orderIndex  Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([pageId, orderIndex])
}

model Project {
  id          String      @id @default(cuid())
  workspaceId String
  workspace   Workspace   @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  title       String
  titleTh     String?
  description String?
  budget      String?     // e.g. "4.5M THB"
  startDate   DateTime?
  endDate     DateTime?
  isPublic    Boolean     @default(false) // Link to public portfolio
  tasks       Task[]
  views       TaskView[]
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
}

model Task {
  id          String    @id @default(cuid())
  projectId   String
  project     Project   @relation(fields: [projectId], references: [id], onDelete: Cascade)
  title       String
  description String?
  status      String    @default("BACKLOG") // BACKLOG | IN_PROGRESS | REVIEW | DONE
  priority    String    @default("MEDIUM")  // LOW | MEDIUM | HIGH | URGENT
  dueDate     DateTime?
  startDate   DateTime?
  assignee    String?
  tags        String?
  orderIndex  Int       @default(0)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@index([projectId, status, orderIndex])
}

model TaskView {
  id          String   @id @default(cuid())
  projectId   String
  project     Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  name        String   @default("Default View")
  viewType    String   // "KANBAN" | "TABLE" | "GANTT" | "CALENDAR" | "LIST"
  filterJson  Json?
  sortJson    Json?
  createdAt   DateTime @default(now())
}
```

---

## 🗓 Phased Development Roadmap

### Phase 1: Core Foundation & Navigation (Sprint 1)
- Add database models to `prisma/schema.prisma` and execute migrations.
- Create `/workspace` portal with sidebar navigator (Pages, Projects, Trash, Workspace Settings).
- Establish Breadcrumb navigation and workspace switcher.

### Phase 2: Lark-Style Project Databases (Sprint 2)
- **Kanban Board**: Drag-and-drop cards between Status columns using `@dnd-kit`.
- **Table / Grid View**: Inline editing spreadsheet with status dropdowns, date pickers, and priority badges.
- **Task Detail Drawer**: Slide-over panel to view task details, attachments, comments, and subtasks.

### Phase 3: Notion-Style Block Editor (Sprint 3)
- Integrate block-based editing engine with slash commands (`/`).
- Support nested sub-pages, callout boxes, code snippets, and checklist blocks.
- Real-time auto-saving with optimistic UI updates.

### Phase 4: Gantt Timeline & Calendar Views (Sprint 4)
- Interactive Gantt chart visualization showing task duration and progress.
- Calendar view displaying milestones and due dates.
- One-click export to PDF / CSV / Markdown.

### Phase 5: Public Portfolio Synchronization (Sprint 5)
- "Publish to Portfolio" toggle to automatically showcase selected research grants and project deliverables on the public site.
