# Phase 74: Instant Sidebar Navigation & Drag Gesture Decoupling

> Side Navigation-এ এক প্রজেক্ট থেকে অন্য প্রজেক্টে যাওয়ার সময় যে ল্যাগ বা ক্লিক মিস হতো, তা পুরোপুরি দূর করতে ড্র্যাগ জেসচার ডিকাপলিং (`useDragControls`), সিঙ্গেল ক্লিক টার্গেট রো এবং সিনক্রোনাস রাউটিং নিশ্চিত করা।
> (AI Tier: Small — Granular, step-by-step instructions with full code blocks)

---

## Phase 74: Instant Sidebar Navigation & Drag Gesture Decoupling

### Step 74.1 — Decouple Drag Gesture & Unblock Clicks in SidebarItem (`dashboard/src/components/SidebarItem.jsx`)
- **File:** `dashboard/src/components/SidebarItem.jsx`
- **Action:** MODIFY
- **Depends:** None

**কী করতে হবে:**
1. `framer-motion` থেকে `useDragControls` ইমপোর্ট করো এবং ইনস্ট্যান্ট করো: `const controls = useDragControls();`
2. `<Reorder.Item>`-এ `dragListener={false}` এবং `dragControls={controls}` দাও যাতে পুরো রো ড্র্যাগ ইভেন্ট ক্যাপচার না করে।
3. শুধুমাত্র ড্র্যাগ গ্রিপ আইকনটিতে `onPointerDown={(e) => controls.start(e)}` যুক্ত করো।
4. পুরো প্রজেক্ট রো-কে একটি সিঙ্গেল, ক্লিয়ার ক্লিক কন্টেইনারে পরিণত করো যার যেকোনো অংশে (নাম, আইকন, প্রগ্রেস পারসেন্টেজ) ক্লিক করলেই তাৎক্ষণিকভাবে `onSelect(p.id)` কল হয়।
5. নিশ্চিত করো ফাইলটি ১৫০ লাইনের নিচে থাকে (Rule 0)।

- **Done-check:** `test -f dashboard/src/components/SidebarItem.jsx`

---

### Step 74.2 — Synchronous Zero-Latency Hash Navigation (`dashboard/src/hooks/useHashRoute.js`)
- **File:** `dashboard/src/hooks/useHashRoute.js`
- **Action:** MODIFY
- **Depends:** Step 74.1

**কী করতে হবে:**
1. `useHashRoute.js`-এর `navigate` মেথডে `window.location.hash` সেট করার সাথে সাথে তাৎক্ষণিকভাবে সিনক্রোনাসভাবে `setRouteInfo(parseHash(target))` আপডেট করো।
2. এর ফলে ব্রাউজারের অ্যাসিনক্রোনাস `hashchange` ইভেন্টের জন্য অপেক্ষা না করে জিরো-ল্যাটেন্সিতে সাথে সাথে রাউট স্টেট পরিবর্তিত হবে।
3. ফাইলটি ১৫০ লাইনের নিচে রাখো।

- **Done-check:** `test -f dashboard/src/hooks/useHashRoute.js`

---

### Step 74.3 — Direct State Synchronization in App Navigation (`dashboard/src/App.jsx`)
- **File:** `dashboard/src/App.jsx`
- **Action:** MODIFY
- **Depends:** Step 74.2

**কী করতে হবে:**
1. `App.jsx`-এ `handleSelectSidebar` হ্যান্ডলারে তাৎক্ষণিক নেভিগেশন নিশ্চিত করো যাতে কোনো রেন্ডার ব্লকিং না থাকে।
2. নিশ্চিত করো ফাইলটি ১৫০ লাইনের নিচে থাকে।

- **Done-check:** `test -f dashboard/src/App.jsx`

---

### Step 74.4 — Verification & Build Suite (`.agents/PROGRESS.md`)
- **File:** `.agents/PROGRESS.md`
- **Action:** VERIFY
- **Depends:** Step 74.1, Step 74.2, Step 74.3

**কী করতে হবে:**
```bash
find . -name "._*" -delete 2>/dev/null || true
./l v
./l health
./l quality
npm test
npm --prefix dashboard run build
```

- **Done-check:** exit code 0 for all validation commands
