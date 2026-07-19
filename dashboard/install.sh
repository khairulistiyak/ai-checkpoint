#!/bin/bash
cd "$(dirname "$0")"

echo "📦 Installing Dashboard Dependencies..."
npm install

echo "✅ Dependencies installed!"
echo "🚀 Starting Dashboard Server..."
npm run dev
