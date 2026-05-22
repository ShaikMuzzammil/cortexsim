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

For detailed deployment instructions, see [VERCEL_DEPLOY.md](./VERCEL_DEPLOY.md).
