# Phase 79: Advanced Clean Architecture Scaffold Engine & Boundary Leak Detector

> অ্যাডভান্সড ক্লিন আর্কিটেকচার স্ক্যাফোল্ড ইঞ্জিন (Domain, Use-Cases, DTOs, Adapters) এবং ডিপেনডেন্সি বাউন্ডারি লিক ডিটেক্টর তৈরি করা।
> (AI Tier: Small — Granular, step-by-step instructions with full code blocks)

---

## Phase 79: Advanced Clean Architecture Scaffold Engine & Boundary Leak Detector

### Step 79.1 — Create Clean Architecture Scaffolder Engine (`packages/core/clean-arch-scaffold.js`)
- **File:** `packages/core/clean-arch-scaffold.js`
- **Action:** CREATE
- **Depends:** None

**কী করতে হবে:**
1. `packages/core/clean-arch-scaffold.js` তৈরি করো যা প্রজেক্টে ১-ক্লিকে ক্লিন আর্কিটেকচার ফোল্ডার ও মাইক্রো-ফাইল স্ক্যাফোল্ড করবে:
   - `src/domain/entities/`
   - `src/domain/use-cases/`
   - `src/domain/dtos/`
   - `src/adapters/repositories/`
   - `src/adapters/controllers/`
2. প্রতিটি তৈরি করা স্টার্টার ফাইল সর্বোচ্চ ৪০ লাইনের মধ্যে পিওর ফাংশনাল ও টেস্টেবল হবে।
3. CommonJS ব্যবহার করো এবং ১৫০ লাইনের নিচে রাখো (Rule 0)।

- **Done-check:** `test -f packages/core/clean-arch-scaffold.js`

---

### Step 79.2 — Create Inward Dependency Boundary Leak Scanner (`packages/core/boundary-scanner.js`)
- **File:** `packages/core/boundary-scanner.js`
- **Action:** CREATE
- **Depends:** None

**কী করতে হবে:**
1. `packages/core/boundary-scanner.js` তৈরি করো যা কোডবেস স্ক্যান করে নিশ্চিত করবে যে `domain/` বা `core/` ফাইলগুলো যাতে কোনো এক্সটার্নাল ফ্রেমওয়ার্ক বা ডাটাবেস লাইব্রেরি ইমপোর্ট না করে।
2. `scanBoundaryLeaks(projectPath)` ফাংশন এক্সপোর্ট করো যা বাউন্ডারি লিক ডিটেক্ট করে রিপোর্ট দিবে।
3. CommonJS ব্যবহার করো এবং ১৫০ লাইনের নিচে রাখো (Rule 0)।

- **Done-check:** `test -f packages/core/boundary-scanner.js`

---

### Step 79.3 — Mount Clean Architecture API Routes in Dashboard Server (`dashboard/src/server/clean-arch-routes.js`)
- **File:** `dashboard/src/server/clean-arch-routes.js`
- **Action:** CREATE
- **Depends:** Step 79.1, Step 79.2

**কী করতে হবে:**
1. `dashboard/src/server/clean-arch-routes.js` তৈরি করো যাতে থাকবে:
   - `POST /api/projects/:id/scaffold-clean-arch`
   - `GET /api/projects/:id/boundary-leaks`
2. `projects.js`-এ এই হ্যান্ডলারগুলো মাউন্ট করো।
3. ESM ব্যবহার করো এবং ১৫০ লাইনের নিচে রাখো (Rule 0)।

- **Done-check:** `test -f dashboard/src/server/clean-arch-routes.js`

---

### Step 79.4 — Create Clean Architecture Scaffolder & Leak Monitor UI (`dashboard/src/components/config/CleanArchScaffoldModal.jsx`)
- **File:** `dashboard/src/components/config/CleanArchScaffoldModal.jsx`
- **Action:** CREATE
- **Depends:** Step 79.3

**কী করতে হবে:**
1. `CleanArchScaffoldModal.jsx` তৈরি করো যাতে থাকবে:
   - ১-ক্লিকে "Scaffold Clean Architecture Structure" বাটন
   - লাইভ Boundary Leak মনিটর ব্যাজ
   - লেয়ার হায়ারার্কি গাইড ও চেকলিস্ট
2. সম্পূর্ণ Apple Studio Monochrome স্টাইলে তৈরি করো (০টি ইমোজি, ক্লিন SVG আইকন)।
3. ১৫০ লাইনের নিচে রাখো (Rule 0)।

- **Done-check:** `test -f dashboard/src/components/config/CleanArchScaffoldModal.jsx`

---

### Step 79.5 — Full Verification & Build Suite (`.agents/PROGRESS.md`)
- **File:** `.agents/PROGRESS.md`
- **Action:** VERIFY
- **Depends:** Step 79.1, Step 79.2, Step 79.3, Step 79.4

**কী করতে হবে:**
```bash
find . -name "._*" -delete 2>/dev/null || true
./l v
./l health
npm --prefix dashboard run build
```

- **Done-check:** exit code 0 for all validation commands
