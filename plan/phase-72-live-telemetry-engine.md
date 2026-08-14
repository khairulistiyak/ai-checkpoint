# Phase 72: Hyper-Attractive Real-Time CLI Telemetry Stream Engine

> টার্মিনালে সার্বক্ষণিক লাইভ কাজ দেখার জন্য ২৪-বিট ট্রু-কালার আরজিবি নিওন গ্রেডিয়েন্ট, লাইভ অ্যাক্টিভিটি স্পার্কলাইন গ্রাফ, ইন-মেমোরি AST ভ্যালিডেশন ব্যাজ এবং ইন্টারঅ্যাক্টিভ ফিল্টার সহ একটি আল্ট্রা-অ্যাট্রাক্টিভ স্ট্যান্ডঅ্যালন টেলিমেট্রি স্ট্রিমার তৈরি করা।
> (AI Tier: Small — Granular, step-by-step instructions with full code blocks)

---

## Phase 72: Hyper-Attractive Real-Time CLI Telemetry Stream Engine

### Step 72.1 — Implement TrueColor Palette & Live Activity Sparklines (`scripts/live-hud.cjs`)
- **File:** `scripts/live-hud.cjs`
- **Action:** MODIFY
- **Depends:** None

**কী করতে হবে:**
`scripts/live-hud.cjs` ফাইলে ২৪-বিট ট্রু-কালার আরজিবি কোড (`\x1b[38;2;R;G;Bm`), মিনি স্পার্কলাইন ভেলোসিটি মিটার (`  ▂▃▅▆▇█`) এবং লাইভ নোড মেমরি গেজ ইমপ্লিমেন্ট করো।

- **Done-check:** `test -f scripts/live-hud.cjs`

---

### Step 72.2 — Implement In-Memory AST Integrity Scanner & Interactive Filters (`scripts/live-hud.cjs`)
- **File:** `scripts/live-hud.cjs`
- **Action:** MODIFY
- **Depends:** Step 72.1

**কী করতে হবে:**
ফাইল ম্যুটেশন ইভেন্টে <1ms ইন-মেমোরি সিনট্যাক্স চেক (`vm.Script`), হট-কিস (`1`=All, `2`=Files, `3`=Ledger, `s`=Scan, `c`=Clear) এবং লাইভ রিয়েল-টাইম স্ক্রলিং স্ট্রিম যুক্ত করো। রুল ০ অনুযায়ী ফাইল ১৫০ লাইনের নিচে থাকবে।

- **Done-check:** `test -f scripts/live-hud.cjs && node -c scripts/live-hud.cjs`

---

### Step 72.3 — Full Verification Suite (`.agents/PROGRESS.md`)
- **File:** `.agents/PROGRESS.md`
- **Action:** VERIFY
- **Depends:** Step 72.1, Step 72.2

**কী করতে হবে:**
```bash
find . -name "._*" -delete 2>/dev/null || true
./l v
./l health
./l quality
npm test
```

- **Done-check:** exit code 0 for all validation commands
