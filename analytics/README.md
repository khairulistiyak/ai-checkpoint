# 🌍 Pulse Live Analytics — Standalone Telemetry System

A lightweight, privacy-focused, zero-DB real-time analytics system built with Node.js, Express, React, and Framer Motion.

---

## ⚡ Quick Start

### 1. Install Dependencies
```bash
cd analytics
npm run install:all
```

### 2. Launch Server & Dashboard
```bash
npm start
```
- **Analytics Server**: Running at `http://localhost:4100`
- **Live Dashboard**: Running at `http://localhost:4200`

---

## 📌 Embedding in Any Website / Web App

Add this single tag to the `<head>` of your website or web application:

```html
<script src="http://localhost:4100/api/embed-script"></script>
```

---

## 📊 Features
- 🗺️ **Precision World Map**: Latitude & Longitude projected live pulsing nodes on SVG map.
- ⚡ **Zero Database Overhead**: High-performance SSE (Server-Sent Events) streaming.
- 🛡️ **Privacy First**: No third-party cookies or intrusive tracking.
- 📱 **Device & Geo Resolution**: Automatic device, browser, and country detection.
