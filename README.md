# HackKro - Platform Source Code

India's Premier Hackathon & Opportunity Platform built with **Next.js 14 (App Router)**, **React 18**, **Tailwind CSS**, **Shadcn UI**, and **MongoDB (Mongoose)**.

---

## 📁 Project Architecture

```
├── app/                      # Next.js App Router (Pages, Layouts & APIs)
│   ├── (public pages)        # Home, About, Events, Blog, Contact, Gallery, Feedback
│   ├── test/                 # Online candidate assessment portal
│   └── api/                  # Backend REST API Endpoints
│       ├── contact/          # Public contact form submission & notifications
│       ├── events/           # Events listing & real-time registration counts
│       ├── events/register/  # Event registration with ticket ID generation & email
│       ├── subscribe/        # Newsletter subscription handler
│       ├── unsubscribe/      # Newsletter unsubscribe handler
│       ├── linkedin/posts/   # Public community updates feed
│       └── test/             # Assessment APIs (login, details, timer start, auto-evaluator)
├── components/               # Reusable UI Components & Primitives (Shadcn UI)
├── hooks/                    # Custom React hooks (use-toast, use-mobile)
├── lib/                      # Backend & Frontend Utilities
│   ├── mongoose.ts           # Cached Mongoose connection (uses env variable)
│   ├── test-evaluator.ts     # Automated test evaluation & scoring engine
│   ├── test-library.ts       # Assessment questions repository & defaults
│   ├── events-data.ts        # Fallback static event dataset
│   └── utils.ts              # Styling helpers (clsx + tailwind-merge)
├── models/                   # Mongoose Database Schemas
│   ├── event-registration.ts # Participant registrations
│   ├── subscriber.ts         # Newsletter subscribers
│   ├── feedback.ts           # Feedback submissions
│   ├── test.ts               # Assessment test configurations
│   ├── test-candidate.ts     # Candidate profiles & scores
│   └── task.ts               # Task definitions
└── public/                   # Static media, icons, and placeholder assets
```

---

## 🔒 Privacy & Security Notice
- **No Production Secrets**: Hardcoded database credentials, private company email passwords, and JWT keys have been removed.
- **Private Data Protection**: Internal admin data-exporting APIs have been separated to protect applicant PII and privacy.
- **Local Testing**: Set your own local or test credentials using `.env.local` as described below.

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
# or
pnpm install
```

### 2. Configure Environment Variables
Copy the template `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
Update `.env.local` with your MongoDB connection string (e.g., local MongoDB `mongodb://localhost:27017/hackkro`) and other settings.

### 3. Run the Development Server
```bash
npm run dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 🛠️ Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS, PostCSS
- **UI Components**: Shadcn UI, Radix UI, Lucide Icons
- **Database**: MongoDB with Mongoose ODM
- **Email**: Nodemailer (SMTP)
