# 🚀 Cloudflare-এ ডিপ্লয় করার গাইড (GitHub Actions দিয়ে অটো-ডিপ্লয়)

এই প্রজেক্টে **একবার সেটআপ করলে** পরে শুধু GitHub-এ `git push` করলেই সাইট অটোমেটিক Cloudflare-এ ডিপ্লয় হয়ে যাবে।

- **সাইটের লিংক হবে:** `https://mdsalahuddin.pages.dev`
- **Admin প্যানেল:** সাইটের Navbar-এ **Admin** বাটনে ক্লিক → লগইন
  - ডিফল্ট ইউজারনেম: `admin`
  - ডিফল্ট পাসওয়ার্ড: `admin123`
  - ⚠️ **প্রথম লগইনের পরই Admin → Account সেকশন থেকে পাসওয়ার্ড বদলে ফেলুন!**
- Admin প্যানেল থেকে যেকোনো পরিবর্তন (লেখা, ছবি, রঙ, প্রজেক্ট — সবকিছু) **সাথে সাথে** D1 ডাটাবেসে সেভ হয়, দয়া করে আবার ডিপ্লয় করার দরকার নেই।

---

## 📦 কীভাবে কাজ করে (এক নজরে)

| অংশ | কী |
|---|---|
| Frontend | Next.js (স্ট্যাটিক এক্সপোর্ট) — পুরো অ্যানিমেটেড পোর্টফলিও + Admin SPA |
| Backend | Cloudflare **Pages Functions** (`functions/api/**`) |
| ডাটাবেস | Cloudflare **D1** (SQLite) — `portfolio-db` নামে অটো তৈরি হয় |
| ডিপ্লয় | GitHub Actions (`.github/workflows/deploy.yml`) — push করলেই চলে |

---

## 🛠️ একবারই করতে হবে (৫-১০ মিনিট)

### ধাপ ১ — GitHub-এ রিপো বানানো

1. GitHub-এ লগইন করে **New repository** ক্লিক করুন
2. নাম দিন (যেমন `my-portfolio`), **Private** রাখুন (পাবলিকও চলবে)
3. এই প্রজেক্টের সব ফাইল push করুন:

```bash
git init
git add .
git commit -m "Portfolio with admin CMS + Cloudflare deploy"
git branch -M main
git remote add origin https://github.com/<আপনার-ইউজারনেম>/my-portfolio.git
git push -u origin main
```

> Windows-এ Git Bash বা WSL ব্যবহার করলে সবচেয়ে ভালো হয়।

### ধাপ ২ — Cloudflare API Token বানানো

1. https://dash.cloudflare.com → উপরের ডানে **My Profile** → **API Tokens** → **Create Token**
2. নিচে **Custom token** → **Get started** ক্লিক করুন
3. Token-এর নাম দিন: `portfolio-deploy`
4. **Permissions** ঠিক এভাবে সেট করুন (৩টি লাইন):

   | ধরন | কোনটা | Permission |
   |---|---|---|
   | Account | **Cloudflare Pages** | Edit |
   | Account | **D1** | Edit |
   | Account | **Account Settings** | Read |

5. **Continue to summary** → **Create Token**
6. যে টোকেনটা দেখাবে সেটা **কপি করে রাখুন** (আর দেখাবে না!)

### ধাপ ৩ — Account ID কপি করা

- Cloudflare Dashboard-এর যেকোনো পেজের ডান পাশের সাইডবারে **Account ID** দেখা যায় — কপি করুন
- (অথবা URL-এ: `dash.cloudflare.com/<এই-অংশটাই-Account-ID>`)

### ধাপ ৪ — GitHub Secrets যোগ করা

1. আপনার GitHub রিপোতে যান → **Settings** → বাম পাশে **Secrets and variables** → **Actions**
2. **New repository secret** বাটনে দুবার করে দুটো secret যোগ করুন:

   | Name | Value |
   |---|---|
   | `CLOUDFLARE_API_TOKEN` | ধাপ ২-এর টোকেন |
   | `CLOUDFLARE_ACCOUNT_ID` | ধাপ ৩-এর Account ID |

### ধাপ ৫ — প্রথম ডিপ্লয় চালানো

1. রিপোর **Actions** ট্যাবে যান
2. বাম পাশে **Deploy to Cloudflare Pages** ওয়ার্কফ্লো পাবেন
3. ডান পাশে **Run workflow** বাটন → **Run workflow** ক্লিক
4. ২-৩ মিনিট অপেক্ষা করুন — সব স্টেপ সবুজ টিক দিলেই শেষ! ✅

**প্রথম ডিপ্লয়ে অটোমেটিক যা হয়:**
- D1 ডাটাবেস `portfolio-db` তৈরি হয়
- সব টেবিল তৈরি হয় (`sql/0000_init.sql`)
- ডেমো কনটেন্ট + Admin অ্যাকাউন্ট সিড হয় (`sql/seed.sql`)
- Pages প্রজেক্ট `mdsalahuddin` তৈরি হয়
- সাইট লাইভ হয় → **https://mdsalahuddin.pages.dev**

---

## 🔄 তারপর থেকে (চিরকালের জন্য)

```bash
git add .
git commit -m "কোনো পরিবর্তন"
git push
```

push করার ২-৩ মিনিটের মধ্যেই সাইট আপডেট হয়ে যাবে। ব্যাস!

> 💡 **মনে রাখবেন:** Admin প্যানেল থেকে করা পরিবর্তন (কনটেন্ট/ছবি/রঙ) সরাসরি ডাটাবেসে সেভ হয় — এগুলোর জন্য push/deploy লাগে **না**। Push লাগে শুধু কোড/ফিচার বদলালে।

---

## 💻 লোকাল ডেভেলপমেন্ট (ঐচ্ছিক)

```bash
bun install          # dependencies
bun run db:setup     # db/portfolio.db বানায় (schema + demo seed)
bun run dev          # http://localhost:3000
```

- লোকাল API routes (`src/app/api/**`) `node:sqlite` ব্যবহার করে — Node 22.5+ লাগবে
- Production কোড (`functions/api/**`) D1 ব্যবহার করে — দুটোই একই `src/lib/server/*` লজিক শেয়ার করে

---

## 🧯 সমস্যা হলে (Troubleshooting)

| সমস্যা | সমাধান |
|---|---|
| Actions ফেইল: `Authentication error` | Token বা Account ID ভুল — Secrets আবার চেক করুন |
| Actions ফেইল: `project name already exists` | `mdsalahuddin.pages.dev` নামটা অন্য কেউ নিয়ে রেখেছে। `wrangler.toml`-এ `name` বদলান (যেমন `mdsalahuddin-dev`) + workflow-এর `pages project create` ও Summary-র URL-ও বদলান, তারপর push |
| সাইট খুলছে কিন্তু ডাটা আসছে না | Actions লগে "Apply database schema" ও "Seed database" স্টেপ সফল হয়েছে কিনা দেখুন |
| Admin লগইন কাজ করছে না | ডিফল্ট `admin / admin123` — পাসওয়ার্ড আগে বদলালে থেকে গেছে, ডাটাবেস রিসিড করতে চাইলে Cloudflare D1-এ `portfolio-db` ডিলিট করে আবার push করুন |
| ছবি সেভ হচ্ছে না / খুব বড় | ছবি base64 আকারে D1-এ থাকে — Admin-এর ImageField নিজেই ছবি কমপ্রেস করে; D1 ফ্রি টিয়ারে ৫GB পর্যন্ত জায়গা |

### ⚠️ সবচেয়ে জরুরি: Cloudflare ড্যাশবোর্ড থেকে "Connect to Git" করবেন না!

এই রিপো **GitHub Actions দিয়ে** ডিপ্লয় হওয়ার জন্যই বানানো। Cloudflare ড্যাশবোর্ডে Workers & Pages → Create → Pages → **Connect to Git** দিয়ে রিপো কানেক্ট করলে ডিপ্লয় ফেইল হবে — কারণ ড্যাশবোর্ড বিল্ড D1 ডাটাবেস বানায় না, schema/seed চালায় না, আর সঠিক বিল্ড কমান্ড (`BUILD_EXPORT=1`) সেট করা থাকে না।

যদি ইতিমধ্যে কানেক্ট করে থাকেন: Cloudflare ড্যাশবোর্ড → **Workers & Pages** → ওই প্রজেক্টে যান → **Settings** → স্ক্রল করে **Delete** করে দিন। তারপর GitHub Secrets দুটো যোগ করে Actions থেকে ডিপ্লয় চালান — `mdsalahuddin` প্রজেক্ট Actions নিজেই বানিয়ে নেবে।

মনে রাখবেন: **Secrets যোগ করার আগে প্রতিটা push-এ Actions লাল (failed) দেখাবে — এটা স্বাভাবিক।** Secrets যোগ করে workflow re-run করলেই সবুজ হয়ে যাবে।

---

## 🔑 নিরাপত্তা নোট

- Admin পাসওয়ার্ড PBKDF2 (100,000 iterations) দিয়ে হ্যাশ করে রাখা হয়
- সেশন ৭ দিন পরে নিজে থেকেই শেষ হয়ে যায় (httpOnly cookie)
- রিপো পাবলিক হলে **প্রথম লগইনের পরই পাসওয়ার্ড বদলানো বাধ্যতামূলক** — কারণ ডিফল্ট পাসওয়ার্ডের হ্যাশ seed ফাইলে আছে (সল্টেড PBKDF2, তবুও সাবধান)
