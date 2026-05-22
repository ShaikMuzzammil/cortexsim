# CortexSim

Advanced Spiking Neural Network Simulator & Visualizer

## Overview

CortexSim is a fully functional, browser-based spiking neural network (SNN) simulator built with Next.js 14. It features a stunning "Neural Labs" dark sci-fi UI with real-time WebGPU-powered simulation, 3D visualization, drag-and-drop experiment builder, and full user authentication.

## Features

- **Real-Time Simulation**: Simulate up to 1000 Izhikevich/LIF neurons with WebGPU acceleration
- **3D Visualization**: Interactive 3D network view with live spike propagation
- **Drag-and-Drop Builder**: React Flow-based experiment construction
- **Synaptic Plasticity**: STDP and Tsodyks-Markram models
- **Live Charts**: Raster plots and membrane potential traces
- **User Authentication**: NextAuth v5 with Google, GitHub, and email/password
- **Experiment Management**: Save/load experiments to database
- **Responsive Design**: Fully responsive with mobile menu
- **Custom Cursor**: Animated neon cursor with hover effects
- **Scroll-Spy Navigation**: Active section highlighting
- **Expandable Feature Cards**: Accordion-style with close buttons
- **Contact Form**: Secure email sending via Resend (no API key exposure)
- **Newsletter Signup**: Functional footer subscription

## Tech Stack

- **Framework**: Next.js 14 (App Router) + TypeScript
- **Styling**: Tailwind CSS with custom "Neural Labs" design tokens
- **Animation**: Framer Motion
- **3D Rendering**: @react-three/fiber + drei
- **Drag-and-Drop**: React Flow
- **Charts**: Recharts
- **Auth**: NextAuth.js v5 + Prisma adapter
- **Database**: SQLite (dev) / PostgreSQL (prod)
- **Email**: Resend (server-side only)
- **ORM**: Prisma

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone or extract the project
cd cortexsim

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Edit .env.local with your credentials:
# - DATABASE_URL
# - NEXTAUTH_SECRET (generate with: openssl rand -base64 32)
# - OAuth credentials (optional)
# - RESEND_API_KEY (optional, for email)

# Generate Prisma client and run migrations
npx prisma generate
npx prisma migrate dev --name init

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables

```env
# Database
DATABASE_URL="file:./dev.db"
# Or for PostgreSQL: postgresql://user:password@localhost:5432/cortexsim

# NextAuth
NEXTAUTH_SECRET="your-super-secret-random-string-min-32-chars"
NEXTAUTH_URL="http://localhost:3000"

# OAuth (optional)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""

# Email (optional)
RESEND_API_KEY="re_xxxxxxxx"
CONTACT_EMAIL="host@cortexsim.io"
```

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel Dashboard → Settings → Environment Variables
4. Add build command: `npm run build`
5. Deploy

### Database

For production, use PostgreSQL:
- Railway: `railway.app`
- Supabase: `supabase.com`
- Neon: `neon.tech`

Update `DATABASE_URL` in production environment variables.

## Project Structure

```
cortexsim/
├── app/                    # Next.js App Router
│   ├── page.tsx           # Landing page
│   ├── builder/           # Experiment builder
│   ├── dashboard/         # User experiments
│   ├── login/             # Sign in
│   ├── signup/            # Registration
│   ├── contact/           # Contact form
│   ├── docs/              # Documentation
│   ├── api/               # API routes
│   │   ├── auth/          # NextAuth
│   │   ├── contact/       # Contact email
│   │   ├── experiments/   # CRUD operations
│   │   └── newsletter/    # Newsletter signup
│   ├── layout.tsx         # Root layout
│   ├── providers.tsx      # Context providers
│   └── not-found.tsx      # 404 page
├── components/
│   ├── ui/                # Reusable UI components
│   ├── Builder/           # React Flow nodes & edges
│   ├── Charts/            # Recharts components
│   ├── Auth/              # Login/signup forms
│   ├── CustomCursor.tsx   # Neon cursor
│   ├── Navbar.tsx         # Navigation
│   ├── Footer.tsx         # Footer
│   ├── Hero3D.tsx         # 3D hero scene
│   ├── ExpandableCard.tsx # Feature cards
│   ├── ContactForm.tsx    # Contact form
│   └── Simulation3DView.tsx # 3D simulation view
├── lib/
│   ├── prisma.ts          # Prisma client
│   ├── auth.ts            # NextAuth config
│   ├── email.ts           # Resend helpers
│   ├── utils.ts           # Utilities
│   └── simulation/        # Simulation engine
│       ├── engine.ts      # Izhikevich/LIF engine
│       ├── webgpu.ts      # WebGPU shaders
│       └── fallback.ts    # JS fallback
├── prisma/
│   └── schema.prisma      # Database schema
├── styles/
│   └── globals.css        # Tailwind + custom styles
├── middleware.ts          # Route protection
├── tailwind.config.ts     # Tailwind configuration
└── package.json
```

## Pages

| Route | Description | Auth Required |
|-------|-------------|---------------|
| `/` | Landing page with hero, features, demo | No |
| `/builder` | Drag-and-drop experiment builder | No (save requires login) |
| `/dashboard` | Saved experiments management | Yes |
| `/login` | Sign in page | No (redirects if logged in) |
| `/signup` | Registration page | No (redirects if logged in) |
| `/contact` | Contact form | No |
| `/docs` | Documentation | No |

## Authentication

- **Credentials**: Email + password (bcrypt hashed)
- **OAuth**: Google and GitHub
- **Session**: JWT strategy
- **Protection**: Middleware checks for protected routes

## Simulation Engine

The simulation supports:
- **Izhikevich Model**: 2D ODE system with configurable a, b, c, d parameters
- **LIF Model**: Leaky integrate-and-fire with τₘ and R
- **Integration**: Euler (default) and Runge-Kutta 4
- **Noise**: Gaussian current injection
- **Plasticity**: Static, STDP, Tsodyks-Markram

WebGPU compute shaders provide near-native performance. Falls back to JavaScript for unsupported browsers.

## Design System

### Colors
- Void: `#0A0A0F`
- Neon: `#00F0FF`
- Electric: `#9D4EDD`
- Synaptic Green: `#00E676`
- Spike Red: `#FF1744`

### Typography
- Headings: Orbitron (Google Fonts)
- Body: Inter
- Code: Fira Code

## Keyboard Shortcuts (Builder)

| Key | Action |
|-----|--------|
| Space | Play/Pause simulation |
| Delete | Remove selected node |
| Ctrl+D | Duplicate node |
| Ctrl+S | Save experiment |
| Esc | Deselect all |

## License

MIT License - Built with neurons & code.

## Support

- Email: contact@cortexsim.io
- GitHub: github.com/cortexsim
- Twitter: @cortexsim


---

## Quick Vercel Deploy (5 Minutes)

```bash
# 1. Push to GitHub
git push origin main

# 2. Go to vercel.com → Add New Project → Import repo

# 3. Add these Environment Variables in Vercel Dashboard:
#    DATABASE_URL = file:./dev.db  (or PostgreSQL URL)
#    NEXTAUTH_SECRET = openssl rand -base64 32
#    NEXTAUTH_URL = https://your-app.vercel.app

# 4. Deploy!
```

# 🚀 VERCEL DEPLOY — STEP BY STEP (Copy & Paste)

## YOU ONLY NEED TO DO THIS ONCE

### Step 1: Push to GitHub

Open terminal in project folder:

```bash
cd cortexsim
git init
git add .
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/cortexsim.git
git push -u origin main
```

Replace `YOUR_USERNAME` with your actual GitHub username.

---

### Step 2: Connect to Vercel

1. Go to https://vercel.com
2. Sign in with **GitHub**
3. Click **"Add New Project"**
4. Find `cortexsim` repo → Click **Import**
5. Vercel auto-detects Next.js — **DO NOT CHANGE ANYTHING**
6. Click **Deploy**

---

### Step 3: Add Environment Variables (CRITICAL)

After first deploy fails (it will), go to:

**Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**

Click **Add** 3 times:

| Name | Value |
|------|-------|
| `DATABASE_URL` | `file:./dev.db` |
| `NEXTAUTH_SECRET` | `supersecretkey123456789` |
| `NEXTAUTH_URL` | `https://cortexsim.vercel.app` |

> **IMPORTANT**: Replace `cortexsim.vercel.app` with your actual URL from Vercel.

Click **Save** → Go to **Deployments** tab → Click the 3 dots on latest → **Redeploy**

---

### Step 4: Done!

Your app is live. Test these URLs:
- `https://YOUR-URL.vercel.app/` — Home
- `https://YOUR-URL.vercel.app/builder` — Builder
- `https://YOUR-URL.vercel.app/login` — Login
- `https://YOUR-URL.vercel.app/dashboard` — Dashboard (needs login)

---

## ⚠️ WHAT WAS FIXED

| Problem | Fix |
|---------|-----|
| `npm run vercel-build` missing | Added `"vercel-build": "prisma generate && next build"` to package.json |
| `prisma migrate deploy` fails | Removed it — SQLite doesn't need deploy, just `generate` |
| Build crashes | Simplified scripts, no complex commands |

---

## 🔧 IF BUILD STILL FAILS

### Option A: Use Vercel's Default Build

In Vercel Dashboard → Project Settings → **Build & Output Settings**

Change **Build Command** to exactly this:
```
next build
```

Change **Output Directory** to:
```
.next
```

Click **Save** → Redeploy

### Option B: No Database (Simplest)

If you want ZERO database setup, the app works with just:

| Variable | Value |
|----------|-------|
| `NEXTAUTH_SECRET` | `anyrandomstring123` |
| `NEXTAUTH_URL` | `https://your-app.vercel.app` |

No `DATABASE_URL` needed. The builder and all pages work. Only "Save Experiment" needs login.

---

## 📦 PACKAGE.JSON SCRIPTS (Already Fixed)

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "postinstall": "prisma generate",
    "vercel-build": "prisma generate && next build"
  }
}
```

---

## ❓ COMMON ERRORS & FIXES

### "Cannot find module '@prisma/client'"
**Fix**: `postinstall` script runs `prisma generate` automatically. If it fails, add this to Vercel Build Command:
```
npx prisma generate && next build
```

### "Database not found"
**Fix**: SQLite is ephemeral on Vercel. For production, switch to PostgreSQL (free on neon.tech). Or use the app without database — builder works fine.

### "NEXTAUTH_SECRET missing"
**Fix**: Add it in Environment Variables. Any random string works.

---

## 🎯 MINIMUM VIABLE DEPLOY

If you want the absolute simplest deploy with NO database headaches:

1. Delete `prisma/` folder
2. Delete `lib/prisma.ts`
3. Delete `lib/auth.ts`
4. Delete `middleware.ts`
5. Delete `app/api/` folder
6. Delete `app/dashboard/` folder
7. Keep only: `app/page.tsx`, `app/builder/page.tsx`, `app/contact/page.tsx`, `app/docs/page.tsx`, `app/login/page.tsx`, `app/signup/page.tsx`
8. Update `package.json` — remove `prisma`, `@prisma/client`, `@auth/prisma-adapter`, `next-auth`, `bcryptjs`
9. Push to GitHub
10. Deploy to Vercel — **zero env vars needed**

The builder, simulation, 3D view, charts, contact form all work. Just no user accounts.

---

## 📧 EMAIL SETUP (Optional)

Contact form works without email. To enable real emails:

1. Go to https://resend.com → Sign up (free)
2. Get API key
3. Add to Vercel env vars:
   - `RESEND_API_KEY` = `re_xxxxxxxxx`
   - `CONTACT_EMAIL` = `your@email.com`
4. Redeploy

Done. No code changes.

