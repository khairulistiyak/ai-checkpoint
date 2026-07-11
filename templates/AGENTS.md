# ⚠️ MANDATORY RULES — যেকোনো Agent/Model এই Rules মানবে

---

## 🔴 STEP 0: কাজ শুরুর আগে — MANDATORY Reading Order

**যেকোনো কাজ করার আগে, নিচের files এই exact order এ পড়ো:**

1. **FIRST** → `plan/PROGRESS.md` পড়ো
   - বুঝো কোন steps DONE ✅ আর কোনটা PENDING 🔴
   - `👉 NEXT:` marker দেখো — সেটাই তোমার next কাজ

2. **THEN** → `plan/RULES.md` পড়ো
   - Project-specific coding conventions বুঝো

3. **THEN** → `plan/steps/` এর relevant plan file পড়ো
   - Next pending step এর exact details পাবে

4. **তারপর** কাজ শুরু করো

> ⚠️ **NEVER** skip এই reading step।

---

## 📋 কাজ করার Rules

### Rule 1: একটা Step এ একটা কাজ
- **1 step = 1 file** — একটা step শেষ করো, তারপর পরের step

### Rule 2: Start Command দিয়ে কাজ শুরু করো
```bash
./l start <step_number>
```

### Rule 3: PROGRESS.md Update করো CLI দিয়ে
```bash
./l c <step_number> "<completion_comment>"
```

### Rule 4: Phase Complete হলে
- `npm run dev` বা `npm run build` রান করে নিশ্চিত হও কোনো error নেই

### Rule 5: সব কাজ শেষ হলে
- PROGRESS.md এর top header কে change করো: `# ✅ TASK COMPLETE ALL`

### Rule 6: Skip/Redo করো না
- ❌ কোনো step skip করো না
- ❌ Already `[x]` marked step আবার করো না
- ✅ শুধু next `[ ]` step থেকে শুরু করো

---

## 🚨 Error Recovery Protocol

1. **Build Error** → Same step এ fix করো
2. **Dependency Missing** → আগে dependency step করো
3. **Unclear Instructions** → plan detail পড়ো → still unclear → user কে জিজ্ঞেস করো
4. **File Already Exists** → Content check → match → complete with note

---

## ⚡ Quick Decision Table

| Situation | Action |
|-----------|--------|
| নতুন session শুরু | STEP 0 follow করো |
| Step শুরু করতে চাও | `./l start X.Y` |
| Step শেষ হলো | `./l c X.Y "note"` |
| Phase শেষ হলো | Build test করো |
| Error পেলে | Same step এ fix করো |
| সব শেষ | `# ✅ TASK COMPLETE ALL` |
