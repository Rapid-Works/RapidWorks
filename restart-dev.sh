#!/bin/bash

echo "🛑 Stopping Next.js dev server..."
pkill -f "next dev" 2>/dev/null || echo "No running server found"

echo "🧹 Clearing Next.js cache..."
rm -rf .next

echo "🚀 Starting Next.js dev server..."
npm run dev
