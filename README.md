# Dr. Pichate K. - Personal Site, Portfolio & CV Management System

A production-ready, dual-language (TH-EN) personal portfolio, CV management system, and digital business card platform built with **Next.js 14 (App Router)**, **TypeScript**, **PostgreSQL**, and **Prisma ORM**.

---

## 🔐 Important Access Credentials & Default Metadata

### Default Authentication Credentials
| Resource | Access URL | Default Username / Email | Default Password | Notes |
|---|---|---|---|---|
| **Admin Portal** | `/admin/login` | `pichate_k@rmutt.ac.th` | `password@pk` | Protected by HTTP-only JWT session cookie. Can be changed in Admin Dashboard. |
| **CV Download Key** | Public Download Modal | *Any visitor* | `pichate2025` | Required to extract CV in PDF or DOCX format. Can be updated/disabled in Admin. |
| **Local PostgreSQL** | `localhost:5432` | `postgres` | `postgres` | Default local database: `pichatek_db` |

### Key Metadata & System Constants
- **Framework**: Next.js 14.2 (App Router, Server Components & Route Handlers)
- **Database**: PostgreSQL with Prisma ORM
- **Color Palette**: Luxury Orange Theme (Dark Mode: `#0c0a09` / Light Mode: `#fffcf9`, Primary Accent: `#ea580c` / `#f97316`)
- **Dual Language**: English (EN) & Thai (TH) with simultaneous bilingual input blocks
- **Uploads Handling**:
  - Endpoint: `/api/upload` (multipart/form-data)
  - Storage Location: `public/uploads/`
  - Allowed File Types: JPEG (`.jpg`, `.jpeg`), PNG (`.png`), WebP (`.webp`), GIF (`.gif`), SVG (`.svg`)
  - Max Upload Size: 5MB
- **Digital E-Card**: `/card` or `/ecard` with dynamic NFC business card UI, live SVG QR Code, and 1-click vCard (`.vcf`) download

---

## ✨ Features Overview

1. **Bilingual Personal Information Management (TH-EN)**:
   - Full Name, Current Position, Workplace / Institutional Affiliation, Current Address.
   - Contact info: Email, Phone, Personal Website, LinkedIn, GitHub.
   - Profile Avatar image upload with live circular preview.
   - Executive summary and research vision in both English and Thai.

2. **Dynamic CV Sections & Entries**:
   - **Pre-configured Sections**:
     1. Educational Background
     2. Work Experience
     3. Areas of Expertise
     4. Academic Publications and Achievements
     5. Other Relevant Experience
     6. Training and Professional Development History
     7. Project Management Experience
   - **Custom Sections**: Create, reorder, show/hide, or delete custom sections.
   - **Content Entries**: Add, edit, delete, and reorder items with titles, dates, institutions, roles, tags, external links, and descriptions.
   - **Hyperlink Insertion**: Integrated "🔗 Insert Link" helper for both English and Thai descriptions, automatically parsed into styled, secure clickable links (`target="_blank"`).
   - **Certificate & Attachment Upload**: Upload proof images (certificates, awards, degrees) with an interactive, full-screen **Lightbox Modal** preview.

3. **Password-Protected CV Exports**:
   - **PDF Export**: Vector-formatted academic CV with header styling, embedded avatar image, and categorized sections.
   - **DOCX Export**: Clean Microsoft Word document with embedded avatar photo, structured tables, and typography.
   - **Access Gate**: Requires the CV access password before download commences.

4. **Digital E-Card (`/card` & `/ecard`)**:
   - Mobile-first digital business card with ambient orange glow and NFC indicator.
   - One-click `.vcf` vCard contact download formatted with UTF-8 for Thai and English.
   - Scannable QR code for instant mobile sharing.

5. **Notion & Lark Project Management Spec**:
   - Architectural plan and database schema for upcoming project management extensions archived in [`docs/PROJECT_MANAGEMENT_SPEC.md`](./docs/PROJECT_MANAGEMENT_SPEC.md).

---

## 🛠️ Local Development Setup

### 1. Prerequisites
- **Node.js**: v18.17+ or v20+ LTS
- **PostgreSQL**: v14+ running locally
- **npm** or **pnpm**

### 2. Environment Setup
Create a `.env` file in the root directory:
```env
# PostgreSQL Connection URL
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/pichatek_db?schema=public"

# Secret key for Admin JWT authentication (Use a 32+ char secure random string)
JWT_SECRET="pichatek_super_secure_jwt_secret_key_2025"

# Public App Base URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Install & Seed
```bash
# Install dependencies
npm install

# Push database schema
npx prisma db push

# Seed initial admin account, default profile, sections, and site settings
npm run db:seed
```

### 4. Run Locally
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) for the public site, [http://localhost:3000/admin](http://localhost:3000/admin) for the admin portal, and [http://localhost:3000/card](http://localhost:3000/card) for the E-Card.

---

## ☁️ Step-by-Step Deployment: Vercel

Vercel is the native platform for Next.js. Because Vercel functions are serverless, follow these steps:

### Step 1: Set Up a Hosted PostgreSQL Database
Choose a managed cloud PostgreSQL provider with connection pooling:
- **[Neon Serverless Postgres](https://neon.tech/)** (Recommended — generous free tier, built-in connection pooler)
- **[Supabase](https://supabase.com/)**
- **[Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres)**

Copy your **Pooled Connection String** (format: `postgresql://user:password@ep-xyz-pooler.region.neon.tech/neondb?sslmode=require`).

### Step 2: Push Your Code to GitHub
```bash
git add .
git commit -m "feat: complete personal portfolio and CV management site"
git push origin main
```

### Step 3: Import Project into Vercel
1. Log in to [Vercel Dashboard](https://vercel.com/).
2. Click **"Add New..."** > **"Project"**.
3. Select your GitHub repository (`PichateK-site`).
4. Framework Preset will automatically detect **Next.js**.

### Step 4: Configure Environment Variables in Vercel
Under the **Environment Variables** section, add:
| Variable Name | Value / Description |
|---|---|
| `DATABASE_URL` | Your Cloud PostgreSQL Pooled connection string |
| `DIRECT_URL` | *(Optional for Neon/Supabase)* Direct connection string for Prisma migrations |
| `JWT_SECRET` | A secure random string (e.g. `openssl rand -base64 32`) |
| `NEXT_PUBLIC_APP_URL` | Your production Vercel domain (e.g. `https://pichatek.vercel.app`) |

> [!NOTE]
> `package.json` already contains `"postinstall": "prisma generate"`. Vercel will automatically generate the Prisma Client on each deployment build.

### Step 5: Seed the Production Database (One-time)
From your local terminal, temporarily point to the production database and run the seed script:
```bash
# In your local project directory:
DATABASE_URL="postgresql://<user>:<password>@<neon-host>/neondb?sslmode=require" npx prisma db push
DATABASE_URL="postgresql://<user>:<password>@<neon-host>/neondb?sslmode=require" npm run db:seed
```

### Step 6: Deploy & Verify
Click **Deploy** in Vercel. Once finished:
1. Visit `https://your-app.vercel.app/`
2. Log in at `https://your-app.vercel.app/admin/login` using `admin@pichatek.com` / `admin123456`.
3. Test downloading the CV with password `pichate2025`.

---

## 🐧 Step-by-Step Deployment: Ubuntu Linux (VPS / Cloud VM)

This guide covers deploying on **Ubuntu 22.04 LTS or 24.04 LTS** (DigitalOcean Droplet, AWS EC2, Linode, Hetzner, or bare-metal server) using **Node.js**, **PostgreSQL**, **PM2**, **Nginx reverse proxy**, and **Let's Encrypt SSL**.

---

### Step 1: System Update & Essential Tools
Connect to your Ubuntu server via SSH:
```bash
ssh root@your_server_ip
```
Update packages and install basic utilities:
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git ufw build-essential
```

---

### Step 2: Install Node.js 20 LTS
Install Node.js 20 using the official NodeSource repository:
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify versions
node -v # Should be v20.x.x
npm -v  # Should be v10.x.x
```

---

### Step 3: Install & Configure PostgreSQL
```bash
sudo apt install -y postgresql postgresql-contrib

# Start and enable PostgreSQL service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Switch to the postgres user and launch psql
sudo -u postgres psql
```

Inside the `psql` shell, create the database user and database:
```sql
-- Create database user with a strong password
CREATE USER pichate_user WITH PASSWORD 'YourStrongDbPassword123!';

-- Create database
CREATE DATABASE pichatek_db OWNER pichate_user;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE pichatek_db TO pichate_user;

-- Exit psql
\q
```

---

### Step 4: Clone the Project Repository
Create a directory for web applications:
```bash
sudo mkdir -p /var/www/pichatek-site
sudo chown -R $USER:$USER /var/www/pichatek-site

# Clone repository
git clone https://github.com/PichateK/PichateK-site.git /var/www/pichatek-site
cd /var/www/pichatek-site
```

---

### Step 5: Configure Environment Variables
Create the production `.env` file:
```bash
nano .env
```
Paste the following configuration (replace with your actual server IP or domain and DB password):
```env
# Database Connection
DATABASE_URL="postgresql://pichate_user:YourStrongDbPassword123!@localhost:5432/pichatek_db?schema=public"

# Admin JWT Secret (Generate a unique 32+ char key)
JWT_SECRET="generate_a_very_long_secure_random_string_here"

# Domain URL
NEXT_PUBLIC_APP_URL="https://yourdomain.com"
```
Save and close nano (`Ctrl + O`, `Enter`, `Ctrl + X`).

---

### Step 6: Install Dependencies, Migrate Database & Build
```bash
cd /var/www/pichatek-site

# Install project dependencies
npm install

# Push Prisma schema to PostgreSQL
npx prisma db push

# Seed initial data (Admin user, default profile, sections)
npm run db:seed

# Ensure upload directory exists and has proper write permissions
mkdir -p public/uploads
chmod 775 public/uploads

# Build the Next.js production bundle
npm run build
```

---

### Step 7: Manage Application with PM2
Install PM2 globally to keep your Next.js application running indefinitely and restart on boot:
```bash
sudo npm install -g pm2

# Start Next.js with PM2
pm2 start npm --name "pichatek-site" -- start

# Save PM2 process list
pm2 save

# Setup PM2 startup script on system boot
pm2 startup
# (Run the command PM2 prints on your screen, if prompted)
```

Useful PM2 commands:
```bash
pm2 status                  # Check app status
pm2 logs pichatek-site      # View live application logs
pm2 restart pichatek-site   # Restart application
```

---

### Step 8: Configure Nginx as Reverse Proxy
Install Nginx:
```bash
sudo apt install -y nginx
```
Create an Nginx configuration file for your site:
```bash
sudo nano /etc/nginx/sites-available/pichatek-site
```
Paste the following configuration (replace `yourdomain.com` with your actual domain or server IP):
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Increase maximum allowed upload size for certificate and avatar images (e.g. 10MB)
    client_max_body_size 10M;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Cache static Next.js assets
    location /_next/static/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_cache_bypass $http_upgrade;
        expires 365d;
        access_log off;
    }

    # Serve user uploads efficiently
    location /uploads/ {
        alias /var/www/pichatek-site/public/uploads/;
        expires 30d;
        access_log off;
    }
}
```
Enable the site and verify Nginx syntax:
```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/pichatek-site /etc/nginx/sites-enabled/

# Remove default site if present
sudo rm -f /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

---

### Step 9: Configure Firewall (UFW)
```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

---

### Step 10: Secure with Free SSL Certificate (Certbot / Let's Encrypt)
If you have a domain pointing to your server IP:
```bash
sudo apt install -y certbot python3-certbot-nginx

# Obtain and configure SSL certificate automatically
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```
Follow the interactive prompts. Certbot will configure SSL renewal automatically via cron.

---

## 🔄 Routine Maintenance & Updates (Ubuntu)

To update your application when you push new code to GitHub:
```bash
cd /var/www/pichatek-site
git pull origin main
npm install
npx prisma db push
npm run build
pm2 restart pichatek-site
```

### PostgreSQL Database Backup
To back up your PostgreSQL database to a `.sql` dump:
```bash
pg_dump -U pichate_user -d pichatek_db -F c -b -v -f /var/www/pichatek_backup_$(date +%Y%m%d).dump
```

To restore:
```bash
pg_restore -U pichate_user -d pichatek_db -v /var/www/pichatek_backup_YYYYMMDD.dump
```

---

## 📁 Project Structure

```
├── prisma/
│   ├── schema.prisma          # Database schema (Admin, Profile, CvSection, CvItem, SiteSetting)
│   └── seed.ts                # Database seeding script with bilingual dummy data
├── public/
│   └── uploads/               # Stored user avatars and certificate images
├── src/
│   ├── app/
│   │   ├── admin/             # Admin portal (Tabs: Profile, Sections, Entries, Security)
│   │   ├── api/
│   │   │   ├── admin/         # REST endpoints for profile, sections, items, settings
│   │   │   ├── auth/          # Login, logout, session verification (/me)
│   │   │   ├── card/vcf/      # vCard generation (.vcf file download)
│   │   │   ├── cv/export/     # Password-gated PDF and DOCX generation
│   │   │   └── upload/        # Multipart file upload handler (JPEG, PNG, WebP, SVG)
│   │   ├── card/              # Digital E-Card NFC networking interface
│   │   ├── page.tsx           # Public homepage server component
│   │   └── layout.tsx         # Root HTML layout, font setup, theme provider
│   ├── components/
│   │   ├── Hero.tsx           # Hero intro with avatar, bio, quick contacts
│   │   ├── SectionCard.tsx    # Section entries, tags, rich-text links, certificate lightbox
│   │   ├── CvDownloadModal.tsx# Password modal for PDF/DOCX downloads
│   │   └── Navbar.tsx         # Responsive navigation & language switcher (EN/TH)
│   └── lib/
│       ├── auth.ts            # JWT cookie issuance and verification
│       ├── i18n.ts            # Thai and English dictionary translations
│       ├── prisma.ts          # Singleton PrismaClient instance
│       ├── renderRichText.tsx # Markdown link and URL parser for item descriptions
│       └── export/
│           ├── pdf.ts         # jsPDF document generator with embedded avatar
│           ├── docx.ts        # docx file generator with embedded avatar
│           └── imageHelper.ts # Universal image buffer loader and MIME detector
└── docs/
    └── PROJECT_MANAGEMENT_SPEC.md # Notion/Lark project management system spec
```

---

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).
