# Plan: Phase 36 — Personal Branding Campaign (Software Developer & AI Engineer)

> Create high-engagement, humble, authentic, and multi-platform personal branding marketing content in dedicated platform folders (`facebook/`, `linkedin/`, `x_twitter/`, `instagram/`) with dual language (Bengali & English), relatable storytelling, tension-climax-resolution arcs, and dedicated AI-generated photos.

---

## Step 36.1 — Create folder structure & master growth guide
- **File:** `marketing/personal-branding/README.md`
- **Action:** CREATE
- **Content:**
  Create the folder tree for `marketing/personal-branding/` (`facebook/`, `linkedin/`, `x_twitter/`, `instagram/` + `images/` subfolders). Write `README.md` detailing the posting playbook, audience psychology, algorithm tips, and humble, ego-free communication philosophy.
- **Done-check:** `test -f marketing/personal-branding/README.md && echo OK`
- **Depends:** None

---

## Step 36.2 — Generate & save dedicated platform visual assets
- **File:** `marketing/personal-branding/facebook/images/fb_developer_workspace.png`
- **Action:** CREATE
- **Content:**
  Generate high-quality, aesthetic, non-distracting developer studio & system architecture visuals tailored for Facebook, LinkedIn, X/Twitter, and Instagram feeds.
- **Done-check:** `test -f marketing/personal-branding/facebook/images/fb_developer_workspace.png && echo OK`
- **Depends:** 36.1

---

## Step 36.3 — Create Facebook natural storytelling posts (Dual Language)
- **File:** `marketing/personal-branding/facebook/post-1-ai-developer-mindset.md`
- **Action:** CREATE
- **Content:**
  Write `post-1-ai-developer-mindset.md` and `post-2-senior-engineering-reality.md` in `marketing/personal-branding/facebook/`. Include natural conversational Bengali (Bengali/Banglish mix) + crisp English version, honest vulnerability, funny relatable 3 AM dev struggles, tension-climax arc, and magnetic comment triggers.
- **Done-check:** `test -f marketing/personal-branding/facebook/post-1-ai-developer-mindset.md && test -f marketing/personal-branding/facebook/post-2-senior-engineering-reality.md && echo OK`
- **Depends:** 36.2

---

## Step 36.4 — Create LinkedIn engineering leadership posts (Dual Language)
- **File:** `marketing/personal-branding/linkedin/post-1-ai-engineering-architecture.md`
- **Action:** CREATE
- **Content:**
  Write `post-1-ai-engineering-architecture.md` and `post-2-atomic-execution-philosophy.md` in `marketing/personal-branding/linkedin/`. Include both Bengali and English versions with professional humility, architectural depth, practical code examples, and discussion triggers.
- **Done-check:** `test -f marketing/personal-branding/linkedin/post-1-ai-engineering-architecture.md && test -f marketing/personal-branding/linkedin/post-2-atomic-execution-philosophy.md && echo OK`
- **Depends:** 36.3

---

## Step 36.5 — Create X / Twitter suspense threads (Dual Language)
- **File:** `marketing/personal-branding/x_twitter/thread-1-why-prompting-fails.md`
- **Action:** CREATE
- **Content:**
  Write `thread-1-why-prompting-fails.md` and `thread-2-atomic-code-rule.md` in `marketing/personal-branding/x_twitter/`. Include punchy, bookmark-worthy tweet-by-tweet threads in both Bengali and English.
- **Done-check:** `test -f marketing/personal-branding/x_twitter/thread-1-why-prompting-fails.md && test -f marketing/personal-branding/x_twitter/thread-2-atomic-code-rule.md && echo OK`
- **Depends:** 36.4

---

## Step 36.6 — Create Instagram visual carousel content (Dual Language)
- **File:** `marketing/personal-branding/instagram/carousel-1-ai-developer-reality.md`
- **Action:** CREATE
- **Content:**
  Write `carousel-1-ai-developer-reality.md` and `carousel-2-senior-vs-junior-code.md` in `marketing/personal-branding/instagram/`. Include Slide 1 to 5 breakdown, visual design cues, authentic humble captions, and reach hashtags in both Bengali and English.
- **Done-check:** `test -f marketing/personal-branding/instagram/carousel-1-ai-developer-reality.md && test -f marketing/personal-branding/instagram/carousel-2-senior-vs-junior-code.md && echo OK`
- **Depends:** 36.5
