#!/bin/bash
# CortexSim Vercel Deploy Script

echo "=== CortexSim Vercel Deploy ==="
echo ""
echo "Step 1: Install dependencies"
npm install

echo ""
echo "Step 2: Generate Prisma client"
npx prisma generate

echo ""
echo "Step 3: Create local database (for dev only)"
npx prisma migrate dev --name init --accept-data-loss 2>/dev/null || true

echo ""
echo "Step 4: Build"
npm run build

echo ""
echo "=== Done! ==="
echo "For Vercel: git push origin main"
echo "Vercel will auto-deploy with 'prisma generate && next build'"
