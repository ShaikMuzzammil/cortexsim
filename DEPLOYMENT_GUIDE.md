# CortexSim Studio - Complete Deployment Guide

## 🚀 Quick Start - No Login Required Platform

CortexSim Studio is now a **fully functional, no-login-required** spiking neural network simulation platform. Users can immediately access all features without registration.

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Local Development](#local-development)
3. [Vercel Deployment (Recommended)](#vercel-deployment-recommended)
4. [Docker Deployment](#docker-deployment)
5. [Self-Hosted Server (Node.js)](#self-hosted-server-nodejs)
6. [Static Export](#static-export)
7. [Environment Variables](#environment-variables)
8. [Platform Features](#platform-features)
9. [Troubleshooting](#troubleshooting)

---

## Prerequisites

- **Node.js** 18.x or higher
- **npm** 9.x or higher (comes with Node.js)
- **Git** (for cloning)

### Check your versions:
```bash
node --version  # Should be v18.x or higher
npm --version   # Should be 9.x or higher
```

---

## Local Development

### 1. Clone or Extract the Project
```bash
# If you have the ZIP file:
unzip cortexsim-complete.zip
cd cortexsim-complete

# Or clone from repository:
git clone <repository-url>
cd cortexsim
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run Development Server
```bash
npm run dev
```

The application will be available at: **http://localhost:3000**

### 4. Build for Production
```bash
npm run build
npm start
```

---

## Vercel Deployment (Recommended) ⭐

Vercel is the easiest way to deploy Next.js applications with zero configuration.

### Option A: Using Vercel CLI

1. **Install Vercel CLI:**
```bash
npm i -g vercel
```

2. **Login to Vercel:**
```bash
vercel login
```

3. **Deploy:**
```bash
cd cortexsim-complete
vercel
```

4. **Follow the prompts:**
- Set project name: `cortexsim-studio`
- Build settings: Use defaults (Next.js auto-detected)
- Deploy!

### Option B: Using Vercel Dashboard (Git Integration)

1. Push your code to GitHub/GitLab/Bitbucket
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import your repository
5. Vercel auto-detects Next.js - click "Deploy"
6. Your app is live in 2-3 minutes!

### Vercel Configuration File (`vercel.json`)
The project includes a pre-configured `vercel.json` for optimal deployment:

```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "regions": ["iad1"],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-XSS-Protection", "value": "1; mode=block" }
      ]
    }
  ]
}
```

---

## Docker Deployment

### Dockerfile (Included in Project)

```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Production image, copy all files and run nextjs
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
```

### Build and Run with Docker

1. **Build the Docker image:**
```bash
docker build -t cortexsim-studio .
```

2. **Run the container:**
```bash
docker run -p 3000:3000 cortexsim-studio
```

3. **Access the application:**
Open http://localhost:3000

### Docker Compose (Optional)

Create `docker-compose.yml`:

```yaml
version: '3.8'
services:
  cortexsim:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    restart: unless-stopped
```

Run with:
```bash
docker-compose up -d
```

---

## Self-Hosted Server (Node.js)

### 1. Build the Application
```bash
npm run build
```

### 2. Start Production Server
```bash
npm start
```

Default port: **3000**

### 3. Use PM2 for Process Management (Recommended)

```bash
# Install PM2 globally
npm install -g pm2

# Start the application
pm2 start npm --name "cortexsim" -- start

# View logs
pm2 logs cortexsim

# Restart on changes
pm2 restart cortexsim

# Setup startup script
pm2 startup
pm2 save
```

### 4. Configure Reverse Proxy (Nginx)

Example Nginx configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Enable gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
}
```

### 5. SSL Certificate with Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

---

## Static Export

For hosting on static platforms like GitHub Pages, Netlify, or Cloudflare Pages:

### 1. Update `next.config.mjs`
Add static export configuration:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
};
export default nextConfig;
```

### 2. Export Static Files
```bash
npm run build
```

Output will be in the `out` directory.

### 3. Deploy to Static Hosting

**Netlify:**
```bash
# Drag and drop the 'out' folder to netlify.com/drop
# Or use Netlify CLI:
npm install -g netlify-cli
netlify deploy --dir=out --prod
```

**GitHub Pages:**
```bash
# Add to your workflow or push 'out' folder to gh-pages branch
```

---

## Environment Variables

Create a `.env.local` file for local development:

```env
# Optional: MongoDB connection (for persistent storage)
MONGODB_URI=mongodb://localhost:27017/cortexsim

# Optional: Session secret
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000

# Optional: Analytics
NEXT_PUBLIC_ANALYTICS_ID=your-analytics-id
```

For production, set these in your hosting platform's dashboard.

---

## Platform Features ✨

### What's Included:

#### 🏠 Landing Page (Home)
- Full-screen hero with animated neural particles
- Feature highlights and platform overview
- Quick start guide for new users
- Direct access buttons (No Login Required badge)

#### 🧠 Neural Simulator Studio
- **35+ Interactive Modules** across 6 categories:
  - Visualization (3D networks, spike rasters, phase planes)
  - Analysis (ISI histograms, CV calculations, spectra)
  - Dynamics & Learning (STDP, parameter sweeps, plasticity)
  - Connectivity (small-world, feedforward, recurrent)
  - Performance & Systems (benchmarking, optimization)
  - Data & Protocols (import/export, formats)

#### 📊 Dashboard
- Real-time workspace statistics
- Recent projects and simulations
- Quick action cards
- Activity sparklines
- Getting started guide

#### 📁 Projects Management
- Create/edit/delete projects
- Grid and list views
- Star/favorite system
- Tag-based organization
- Search and filter
- Demo data for guest users

#### 📈 Datasets
- Upload CSV, JSON, Text data
- Preview and download datasets
- Tag organization
- Format icons and metadata
- Local storage support

#### 📤 Export Center
- **12+ Export Formats:**
  - Tabular: CSV, TSV
  - Code: JSON, Python dict
  - Visualization: PNG, SVG
  - Scientific: MAT, NPZ, HDF5
  - Reports: Markdown, TXT
- Demo data generator
- Batch export functionality

#### 💡 Insights & Analytics
- Workspace usage statistics
- Hourly/weekly activity charts
- Top projects by runs/spikes
- Tag cloud visualization
- Dataset format distribution
- Action frequency analysis

#### ⚙️ Settings
- Profile management (Guest mode support)
- API token generation
- Data export options
- Application preferences
- Theme information

#### 📚 Learning Resources
- Interactive tutorials
- Documentation pages
- Glossary of terms
- Practice exercises
- Mind map navigation

---

## Troubleshooting

### Common Issues

**Issue: Port 3000 already in use**
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
PORT=3001 npm run dev
```

**Issue: Build fails with memory error**
```bash
# Increase Node.js memory limit
NODE_OPTIONS="--max-old-space-size=4096" npm run build
```

**Issue: Module not found errors**
```bash
# Clear cache and reinstall
rm -rf node_modules .next
npm install
npm run build
```

**Issue: Styles not loading correctly**
```bash
# Ensure Tailwind CSS is properly configured
# Check tailwind.config.ts exists
# Restart dev server
```

### Performance Optimization

1. **Enable production mode:** Always use `npm run build` + `npm start` for production
2. **Use CDN:** Serve static assets through CDN
3. **Enable compression:** Gzip/Brotli on your server
4. **Optimize images:** Use WebP format where possible

---

## Support & Contributing

- 📖 Documentation: `/docs`
- 💡 Tips: `/tips`
- 🗺️ Learning Map: `/learn/map`
- 🔄 Changelog: `/app/changelog`

---

## License

CortexSim Studio - Open Source Neural Simulation Platform

Built with ❤️ using Next.js, React, Three.js, Framer Motion, and Tailwind CSS.

---

**Last Updated:** July 2026  
**Version:** 6.0.0  
**Status:** Production Ready ✅
