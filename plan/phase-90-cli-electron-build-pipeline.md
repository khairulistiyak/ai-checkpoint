# Phase 90: CLI Engine, Electron & Build Pipeline Update
**Status**: NOT STARTED
**Description**: CLI ইঞ্জিনের paths.js আপডেট (গ্লোবাল স্টোর), ইলেক্ট্রন tray.js আপডেট, electron-builder.yml এ asar: true করা, এবং build-desktop.sh এ কোড অবফাস্কেশন পাইপলাইন যোগ। setup.sh আপডেট।

---

## Technical Context

**ডিপেন্ডেন্সি:** Phase 88 ও Phase 89 সম্পূর্ণ হতে হবে।

**গুরুত্বপূর্ণ:** 
- `packages/` ফোল্ডার = CommonJS (`require`/`module.exports`)
- `electron/` ফোল্ডার = CommonJS (`require`/`module.exports`)
- `dashboard/` ফোল্ডার = ESM (`import`/`export`)
- **কখনো মেশাবে না!**

---

## Step-by-Step Implementation Plan

### Step 90.1: Update CLI paths.js
**File**: `packages/cli/paths.js`
- `const os = require('os');` যোগ করো
- গ্লোবাল স্টোর থেকে প্রজেক্ট আইডি ডিটেক্ট করার ফাংশন যোগ করো:
  ```javascript
  function detectProjectId() {
    try {
      const settingsPath = path.join(os.homedir(), '.ai-checkpoint-dashboard', 'settings.json');
      const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
      const cwd = process.cwd();
      const project = settings.projects.find(p => p.path === cwd);
      return project ? project.id : null;
    } catch { return null; }
  }
  ```
- `AGENTS_DIR` আপডেট করো:
  ```javascript
  const PROJECT_ID = detectProjectId();
  const AGENTS_DIR = PROJECT_ID
    ? path.join(os.homedir(), '.ai-checkpoint', 'projects', PROJECT_ID)
    : path.join(process.cwd(), '.agents');  // ফলব্যাক
  ```
- বাকি সব পাথ (`PROGRESS_PATH`, `PLAN_DIR`, `DRAFTS_DIR`) আগের মতোই

### Step 90.2: Update CLI doctor.js
**File**: `packages/cli/doctor.js`
- হেলথ চেক আইটেম আপডেট:
  - `.agents directory` → `Project Data Directory` (গ্লোবাল স্টোরে চেক)
  - `.agents/PROGRESS.md` → গ্লোবাল স্টোরে PROGRESS.md চেক
  - `.agents/scripts/ledger.cjs` চেক — **সরাও** (আর দরকার নেই)
  - `Global Engine` চেক যোগ করো → `~/.ai-checkpoint/engine.bin.js` আছে কি না

### Step 90.3: Update Electron tray.js
**File**: `electron/tray.js`
- `const os = require('os');` যোগ করো
- `const globalEnginePath = path.join(os.homedir(), '.ai-checkpoint', 'engine.bin.js');` যোগ করো
- সব জায়গায় `.agents/scripts/ledger.cjs` → `globalEnginePath` রিপ্লেস:
  - `execFile('node', ['.agents/scripts/ledger.cjs', 'doctor'], ...)` → `execFile('node', [globalEnginePath, 'doctor'], ...)`
  - `execFile('node', ['.agents/scripts/ledger.cjs', 'status'], ...)` → `execFile('node', [globalEnginePath, 'status'], ...)`

### Step 90.4: Update electron-builder.yml
**File**: `electron-builder.yml`
- `asar: false` → `asar: true` পরিবর্তন করো
- `files` সেকশনে:
  - `assets/engine.bin.js` যোগ করো
  - `packages/**` — **সরাও**
  - `scripts/**` — **সরাও**
- বাকি সব (electron/**, dashboard/dist/**, templates/** ইত্যাদি) আগের মতোই

### Step 90.5: Update build-desktop.sh — Obfuscation Pipeline
**File**: `scripts/build-desktop.sh`
- Dashboard ফ্রন্টএন্ড বিল্ডের পরে, Electron Builder এর আগে যোগ করো:
  ```bash
  # ইঞ্জিন বিল্ড
  echo "🔧 Building encrypted engine..."
  npm run build:engine

  # ব্যাকআপ (অরিজিনাল সোর্স সেভ)
  echo "📦 Backing up source for obfuscation..."
  cp -r dashboard/src/server dashboard/src/server.bak
  cp dashboard/server.js dashboard/server.js.bak
  cp -r electron electron.bak

  # অবফাস্কেট
  echo "🔒 Obfuscating backend code..."
  npx javascript-obfuscator dashboard/server.js --output dashboard/server.js --compact true --string-array true
  for f in dashboard/src/server/*.js; do
    npx javascript-obfuscator "$f" --output "$f" --compact true --string-array true
  done
  for f in electron/*.js; do
    npx javascript-obfuscator "$f" --output "$f" --compact true --string-array true
  done
  ```
- Electron Builder চালানোর **পরে** যোগ করো:
  ```bash
  # অরিজিনাল রিস্টোর
  echo "🔄 Restoring original source..."
  rm -rf dashboard/src/server && mv dashboard/src/server.bak dashboard/src/server
  mv dashboard/server.js.bak dashboard/server.js
  rm -rf electron && mv electron.bak electron
  echo "✅ Source restored successfully"
  ```

### Step 90.6: Update setup.sh
**File**: `setup.sh`
- packages কপি করার কোড **সম্পূর্ণ সরাও** (for loop যেটা cli/ ও core/ কপি করে)
- scripts/ কপি করার কোড **সরাও**
- `./l` ফাইল তৈরি করার কোড **সরাও**
- নতুন লজিক যোগ করো:
  ```bash
  # গ্লোবাল ইঞ্জিন ডিপ্লয়
  GLOBAL_DIR="$HOME/.ai-checkpoint"
  mkdir -p "$GLOBAL_DIR"
  if [ -f "assets/engine.bin.js" ]; then
    cp "assets/engine.bin.js" "$GLOBAL_DIR/engine.bin.js"
  fi

  # প্রজেক্টে শুধু কনফিগ ফাইল
  mkdir -p "$PROJECT_DIR/.agents"
  mkdir -p "$PROJECT_DIR/plan"
  # templates/ থেকে RULES.md, SYSTEM_GUIDE.md → .agents/
  # templates/ থেকে AGENTS.md → প্রজেক্ট রুট
  ```

### Step 90.7: Full Build Test
- `bash scripts/build-desktop.sh` চালাও
- চেক করো:
  - `.deb`/`.AppImage` ফাইল তৈরি হয়েছে
  - বিল্ড শেষে অরিজিনাল সোর্স কোড রিস্টোর হয়েছে (ডেভ এনভায়রনমেন্ট ঠিক আছে)
  - `.deb` ইন্সটল করে সোর্স কোড খুঁজে পাওয়া যায় না (`asar` এনক্রিপ্টেড)
  - ইন্সটল করা অ্যাপ থেকে প্রজেক্ট ইনিশিয়ালাইজ কাজ করছে
  - `.agents/` তে শুধু RULES.md ও SYSTEM_GUIDE.md আছে, packages/ নেই
