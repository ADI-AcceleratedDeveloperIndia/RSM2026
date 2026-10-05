# RSM 2027 — Government Upgrade Blueprint

## National Road Safety Action & Impact Platform

**Document Version:** 1.0
**Date:** 2026-10-05
**Baseline:** RSM2026-main (Telangana Road Safety Month 2026)
**Target:** RSM 2027 — Government Edition

---

## TABLE OF CONTENTS

1. [Existing Architecture Summary](#1-existing-architecture-summary)
2. [Complete Reusability Map](#2-complete-reusability-map)
3. [New Architecture Design](#3-new-architecture-design)
4. [Database Changes](#4-database-changes)
5. [New Modules & Pages](#5-new-modules--pages)
6. [New API Endpoints](#6-new-api-endpoints)
7. [Roles & Permissions System](#7-roles--permissions-system)
8. [Government Mission Control Design](#8-government-mission-control-design)
9. [Workflows](#9-workflows)
10. [Reporting Engine](#10-reporting-engine)
11. [Implementation Order](#11-implementation-order)
12. [What NOT to Touch](#12-what-not-to-touch)
13. [What Can Be Reused Immediately](#13-what-can-be-reused-immediately)
14. [Technical Debt & Risks](#14-technical-debt--risks)

---

## 1. Existing Architecture Summary

### 1.1 Tech Stack
| Layer | Technology |
|---|---|
| Framework | Next.js 16.1.1 (App Router, TypeScript) |
| UI | React 18.2, Tailwind CSS v4, Radix UI, Lucide Icons, CVA |
| Database | MongoDB + Mongoose 8.x |
| File Storage | MongoDB GridFS (`eventPhotos` bucket) |
| Auth | NextAuth 4.x (CredentialsProvider, JWT strategy) — **currently disabled** |
| PDF Generation | Puppeteer-core + @sparticuz/chromium (serverless headless) |
| Certificate Security | HMAC-signed JWT download URLs (jose, HS256, 15-min expiry) |
| Client PDF | html2canvas + jsPDF (client-side fallback) |
| i18n | i18next + react-i18next (English + Telugu) |
| TTS | Web Speech API (en-IN, te-IN) |
| Validation | Zod |
| Forms | react-hook-form |
| Analytics | Google Analytics (gtag.js) |
| Deployment | Vercel (with cron job for daily reports) |
| Rate Limiting | In-memory per-IP (Map-based) |
| Caching | In-memory key-value (Map-based, 60s TTL) |

### 1.2 Existing Models (11 total)

| Model | Fields | Purpose | Records Approx. |
|---|---|---|---|
| `AdminUser` | email, passwordHash, role | Admin portal access | Few |
| `Certificate` | certificateId, certificateNumber, type, fullName, institution, eventReferenceId, eventTitle, organizerReferenceId, activityType, score, total, participationContext, eventType, district, userEmail, userIpHash, appreciationOptIn, appreciationText, createdAt | **Core output** — tracks all issued certificates | High volume |
| `Club` | institutionName, district, pointOfContact, organizerId, createdAt | School/institution road safety club registrations | Medium |
| `DailyReport` | date, events[], participants[], organizers[], stats{}, createdAt | Daily snapshot aggregation for audits | ~30/month |
| `Event` | referenceId, eventNumber, title, organizerId, organizerName, institution, date, location, eventType, eventContext, district, approved, photos, groupPhoto, youtubeVideos, createdAt, approvedAt, approvedBy | Campaign events (online/offline, statewide/regional) | Medium |
| `Organizer` | temporaryId, finalId, fullName, email, phone, institution, designation, status, approvedBy, approvedAt, createdAt, updatedAt | Organizer lifecycle (pending→approved→active) | Medium |
| `ParentsPledge` | childName, institutionName, parentName, district, createdAt | Parent road safety pledges | Medium |
| `QuizAttempt` | referenceId, certificateType, fullName, institution, score, passed, createdAt | Individual quiz attempt tracking | High volume |
| `SignatureMap` | regionCode, rtaName, signatureUrl | Maps region codes to officer signatures | Static/few |
| `SimStat` | referenceId, sceneId, category, success, attempts, seconds, createdAt | Simulation telemetry | High volume |
| `SimulationPlay` | type, createdAt | Simple play counter by vehicle category | High volume |

### 1.3 Existing API Endpoints (37 total)

**Admin APIs (13):**
- `GET /api/admin/appreciations/export` — CSV export of participant feedback
- `GET /api/admin/appreciations/list` — JSON list of appreciation messages
- `GET /api/admin/club/list` — Paginated club registrations
- `POST /api/admin/daily-report/collect` — Trigger daily report generation
- `POST /api/admin/daily-report/cron` — Vercel cron (23:59 daily)
- `GET /api/admin/daily-report/download` — CSV download by date
- `GET /api/admin/daily-report/list` — List all daily reports
- `GET /api/admin/events/list` — List events (with optional pending)
- `GET /api/admin/events/participants` — Participants for a specific event
- `POST /api/admin/organizers/approve` — Approve/reject organizer
- `GET /api/admin/organizers/list` — List organizers (filter by status)
- `GET /api/admin/parents-pledge/list` — Paginated pledges
- `GET /api/admin/participants/list` — Paginated certificates (with filters)

**Auth (1):**
- `GET|POST /api/auth/[...nextauth]` — **Disabled** (returns 501)

**Certificate APIs (4):**
- `POST /api/certificates/appreciation` — Submit appreciation text
- `POST /api/certificates/create` — Issue new certificate (rate limited: 10/hr/IP)
- `GET /api/certificates/download` — HMAC-verified PDF download
- `GET /api/certificates/get` — Fetch certificate + fresh signature

**Club (1):**
- `POST /api/club/join` — Register institution club (rate limited: 3/hr/IP)

**Event APIs (8):**
- `GET /api/events/[eventId]` — Event detail by reference ID
- `POST /api/events/create` — Create event (rate limited: 5/hr/IP)
- `DELETE /api/events/delete-photo` — Delete group photo (organizer-verified)
- `GET /api/events/get-by-id` — Event lookup by query param
- `GET /api/events/get-photo` — Serve GridFS photo (1-year cache)
- `GET /api/events/list` — Public approved events (60s cache)
- `POST /api/events/update-videos` — Add YouTube links (organizer-verified)
- `POST /api/events/upload-photo` — Upload group photo ≤1MB (organizer-verified)

**Organizer APIs (3):**
- `GET /api/organizer/events` — Events by organizer ID
- `POST /api/organizer/register` — Self-register (returns temp ID)
- `GET /api/organizer/status` — Check approval status

**Other APIs (7):**
- `POST /api/parents-pledge/submit` — Submit pledge (rate limited: 5/hr/IP)
- `GET /api/quiz/submit` — Fetch 15 localized questions
- `POST /api/quiz/submit` — Grade quiz answers
- `POST /api/sim/complete` — Log simulation completion
- `POST /api/sim/start` — Heartbeat placeholder
- `GET /api/sim/stats` — Aggregated simulation analytics
- `POST /api/simulation/play` — Log play by category

### 1.4 Existing Pages (18 routes)

| Route | Purpose | Key Features |
|---|---|---|
| `/` | Homepage | Hero video, leadership cards, CTAs, anthem, poster, pledge modal, minister video carousel |
| `/admin` | Admin portal | Sign-in gate → AdminDashboard (metrics, organizers, events, reports, appreciations, pledges, clubs) |
| `/admin/login` | Login redirect | Redirects to `/admin` |
| `/basics` | Road Signs Learning | 87 Indian road signs (Learn + Quiz modes), 3 categories |
| `/certificates` | Offline Certificate Gen | Generate certificates for offline events |
| `/certificates/generate` | Online Certificate Gen | Central issuance portal, reads sessionStorage scores |
| `/certificates/preview` | Certificate Preview | Visual preview + PDF export + appreciation |
| `/certificates/regional` | Regional Certificates | Karimnagar-specific regional authority certificates |
| `/club` | Road Safety Club | Institution registration form |
| `/events` | Events Directory | Browse approved events + create events (organizers) |
| `/events/[eventId]` | Event Detail | Media management (photo upload, YouTube videos) |
| `/guides` | Safety Guides | 4-domain habit reinforcement + quiz |
| `/organizer` | Organizer Portal | Register → Check status → View event IDs |
| `/prevention` | Prevention Habits | Checklist + quiz |
| `/quiz` | Safety Quiz | 15-question gamified quiz with TTS + sound effects |
| `/rules` | Traffic Rules | Helmet, Seatbelt, Speed, Pedestrian rules display |
| `/simulation` | Simulation Lab | 4 drag-and-drop interactive scenarios |
| `/special` | Accessibility | Indian Sign Language road safety videos |

### 1.5 Existing Components (19)

**Core Components (9):** Nav, SiteFooter, AdminDashboard, AdminSignIn, AudioGuide, I18nProvider, MinisterMessageModal, MobileWarning, ParentsPledgeModal, Certificate

**UI Primitives (9):** Badge, Button, Card, Checkbox, Dialog, Input, Label, Tabs, Textarea

### 1.6 Existing Libraries (9)

| Library | Purpose |
|---|---|
| `lib/auth.ts` | NextAuth configuration (CredentialsProvider + bcrypt) |
| `lib/cache.ts` | In-memory cache (Map, 60s TTL, 5-min GC) |
| `lib/db.ts` | Mongoose singleton connection (pool: 5-50) |
| `lib/hmac.ts` | JWT sign/verify for certificate URLs (15-min expiry) |
| `lib/i18n.ts` | i18next init (en/te, 3 namespaces) |
| `lib/rateLimit.ts` | In-memory IP rate limiter (with cleanup) |
| `lib/reference.ts` | **Critical** — All reference ID generation (33 district codes, event/cert/organizer ID formats) |
| `lib/regional.ts` | Regional authority directory (currently: Karimnagar only) |
| `lib/utils.ts` | cn() class helper + IP hasher |

### 1.7 Key Assets
- Road signs: 87 signs across 3 categories (mandatory, cautionary, informatory) with verified JSON data
- State-specific assets: Telangana emblem, minister photos/signatures for Andhra Pradesh, Karnataka, Telangana
- Study materials: Road Safety PDF book, presentation slides
- Media: Background video, simulation videos (sober driving, two-person riding)
- Localization: English + Telugu (common, content, quiz namespaces)

---

## 2. Complete Reusability Map

### ✅ REUSE AS-IS (Do Not Touch)

| Component | Why |
|---|---|
| All 9 UI primitives (`components/ui/*`) | Standard design system, fully modular |
| `lib/db.ts` | Solid Mongoose singleton pattern |
| `lib/hmac.ts` | Certificate URL security — proven |
| `lib/utils.ts` | Standard utilities |
| `lib/i18n.ts` | i18n infrastructure |
| `utils/certificateExport.ts` | Robust client-side PDF with fallback retries |
| `utils/tts.ts` | TTS engine for Indian English/Telugu |
| `components/AudioGuide.tsx` | Drop-in audio component |
| `components/I18nProvider.tsx` | Client i18n initializer |
| `components/MobileWarning.tsx` | Responsive warning |
| `components/certificates/Certificate.tsx` | Certificate rendering component |
| `components/MinisterMessageModal.tsx` | Minister message video carousel |
| `components/ParentsPledgeModal.tsx` | Pledge submission + PNG download |
| All simulation files (`app/simulation/*`) | 17 scenarios + engine + prototypes |
| `app/basics/page.tsx` | 87 road signs module |
| `app/quiz/page.tsx` | Gamified quiz with TTS |
| `app/guides/page.tsx` | Safety guides with quiz |
| `app/prevention/page.tsx` | Prevention habits with quiz |
| `app/rules/page.tsx` | Traffic rules display |
| `app/special/page.tsx` | Sign language accessibility |
| `app/certificates/preview/page.tsx` | Certificate preview + PDF |
| `app/certificates/generate/page.tsx` | Certificate generation portal |
| `app/certificates/regional/page.tsx` | Regional certificate issuance |
| `app/certificates/page.tsx` | Offline certificate generator |
| `app/club/page.tsx` | Club registration |
| `app/events/page.tsx` | Events directory + creation |
| `app/events/[eventId]/page.tsx` | Event detail + media |
| `app/organizer/page.tsx` | Organizer lifecycle |
| All certificate APIs | Certificate CRUD + HMAC |
| All event APIs | Event CRUD + media |
| All organizer APIs | Registration + approval |
| All simulation APIs | Telemetry + stats |
| Quiz API | Question fetch + grading |
| Parents pledge API | Pledge submission |
| Club API | Club join |
| Daily report APIs | Report collection + download |
| All existing models | Core data structures |
| Road sign assets + JSON | Learning content |
| State-specific assets | Visual identity |
| Localization files | en/te translations |

### 🔧 MODIFY (Extend, Don't Rewrite)

| Component | What Changes | Why |
|---|---|---|
| `lib/reference.ts` | Add national scope (all states, not just Telangana 33 districts); add new ID generators for Actions, Hazards, Institutions, Government Reports | Currently hardcoded to `TGSG`/Telangana. Needs national expansion + new entity IDs |
| `lib/regional.ts` | Expand from 1 authority (Karimnagar) to full national directory | Currently only has Karimnagar |
| `lib/auth.ts` | **Re-enable NextAuth**, add role-based auth (government, district_admin, institution, citizen), add proper session management | Currently disabled (501). Government layer needs real RBAC |
| `lib/rateLimit.ts` | Add Redis adapter option for production scaling | In-memory won't work across serverless instances |
| `lib/cache.ts` | Add Redis adapter option | Same as rate limiter |
| `models/AdminUser.ts` | Extend with `district`, `state`, `permissions[]`, `role` enum (superadmin, state_admin, district_admin, verifier) | Currently just email + role="admin" |
| `models/Certificate.ts` | Add `fourECategory` field, `actionId` reference, `institutionId` reference, `verified` boolean | Connect certificates to 4E classification and action tracking |
| `models/Event.ts` | Add `fourECategory`, `institutionId`, `impactMetrics{}`, `actionIds[]` | Connect events to government intelligence |
| `models/Organizer.ts` | Add `institutionId` reference, `districtId` reference | Link organizers to the institution/district hierarchy |
| `models/Club.ts` | Add `institutionId` reference, `status`, `verifiedBy`, `memberCount` | Connect clubs to institutions, add verification |
| `components/Nav.tsx` | Add government portal links (Mission Control, Action Tracker), conditional nav based on role | Currently citizen-only navigation |
| `components/SiteFooter.tsx` | Add government portal links, update branding to "National Road Safety Action & Impact Platform" |  |
| `components/AdminDashboard.tsx` | **Major extension** — becomes the foundation for Government Mission Control. Add district filtering, 4E view, action tracking, scorecard tabs | Currently a flat metrics dashboard |
| `app/admin/page.tsx` | Upgrade auth from demo to real NextAuth session check | Currently uses client-side `isAuthenticated` state toggle |
| `app/layout.tsx` | Update metadata, add role-based layout switching | Branding update |
| `app/page.tsx` | Add Action Tracker CTA, Government Portal link, update branding | Homepage CTAs |
| `app/api/stats/overview/route.ts` | Add district-level breakdowns, 4E category breakdowns, action completion stats | Currently only global totals |
| `app/api/auth/[...nextauth]/route.ts` | **Re-enable** with full role-based authentication | Currently returns 501 |

### ❌ MISSING (Must Build New)

| Component | What It Does |
|---|---|
| **Institution model + CRUD** | Track schools, colleges, organizations as first-class entities |
| **District hierarchy model** | State → District → Sub-district structure |
| **Action model + tracker** | Citizens/institutions commit to and complete safety actions |
| **Hazard model + reporting** | Geolocated hazard reports with photos + verification |
| **SafetyObservation model** | Field observations with evidence |
| **Intervention model** | Government/institutional responses to hazards |
| **Evidence model** | Photos, documents, before/after records |
| **Verification model** | Verification workflow for actions, hazards, evidence |
| **4E Category classification** | Education/Engineering/Enforcement/Emergency taxonomy |
| **GovernmentReport model** | Generated district/state/national reports |
| **DistrictScorecard model** | Computed scorecards per district |
| **Government Mission Control page** | Real-time command center for government officials |
| **Action Tracker page** | Public-facing action commitment and tracking |
| **4E Intelligence Dashboard** | Analytics by Education/Engineering/Enforcement/Emergency |
| **District Scorecards page** | Comparative district performance |
| **Hazard Reporting page** | Citizen hazard submission with geolocation + photos |
| **Impact Reporting page** | Auto-generated impact narratives |
| **Government Report Generator** | One-click PDF/Excel reports with evidence annexures |
| **Institution Portal page** | Institution-level dashboard |
| **Verification Workflow page** | Verifier interface for reviewing evidence |
| **Middleware for RBAC** | Route protection based on user roles |
| **Districts shared constant** | Consolidate 33+ district arrays scattered across components |

---

## 3. New Architecture Design

```text
                    RSM 2027 — NATIONAL ROAD SAFETY ACTION & IMPACT PLATFORM
                                          │
                ┌─────────────────────────┼─────────────────────────┐
                │                         │                         │
        CITIZEN & PARTICIPANT      INSTITUTION /              GOVERNMENT
            PORTAL                ORGANIZER PORTAL          MISSION CONTROL
                │                         │                         │
        ┌───────┼───────┐          ┌──────┼──────┐          ┌───────┼───────┐
        │       │       │          │      │      │          │       │       │
     Learn    Engage   Certs    Manage  Track  Report     4E Intel  District  Impact
     Quiz     Events   QR      Events  Actions  Club      Dashboard Scores   Reports
     Sim      Train            Media   Hazards            │       │         │
     Guides   Pledge                                      │       │         │
     Rules                                               Action   State    National
     Special                                             Tracker  Summary  Reports
                                                           │       │         │
                                                           └───────┴─────────┘
                                                                   │
                                                            VERIFIED IMPACT
                                                          (Evidence-Based)
```

### Portal Structure

| Portal | URL Prefix | Who Uses It |
|---|---|---|
| Citizen & Participant | `/` (existing) | Public citizens, students, parents |
| Institution / Organizer | `/organizer`, `/club`, `/events` (existing) + `/institution` (new) | Schools, colleges, NGOs, organizers |
| Government Mission Control | `/gov` (new) | State admins, district admins, verifiers |
| Action Tracker | `/actions` (new) | Citizens + institutions + government |

---

## 4. Database Changes

### 4.1 New Models

#### `Institution`
```typescript
{
  institutionId: String,         // e.g., "INST-TGSG-HYDR-00001"
  name: String,                  // required
  type: String,                  // enum: ["school", "college", "university", "ngo", "corporate", "government", "other"]
  district: String,              // required
  state: String,                 // required, default: "Telangana"
  address: String,
  pincode: String,
  contactPerson: String,
  contactEmail: String,
  contactPhone: String,
  organizerIds: [String],        // linked organizer finalIds
  status: String,                // enum: ["active", "inactive", "verified"]
  verifiedBy: String,            // admin who verified
  verifiedAt: Date,
  totalParticipants: Number,     // denormalized count
  totalEvents: Number,           // denormalized count
  totalActions: Number,          // denormalized count
  createdAt: Date,
  updatedAt: Date
}
// Indexes: { institutionId: 1 } unique, { district: 1 }, { state: 1 }, { type: 1 }
```

#### `District`
```typescript
{
  code: String,                  // e.g., "HYDR", "KRMR" — matches DISTRICT_CODE_MAP
  name: String,                  // e.g., "Hyderabad", "Karimnagar"
  state: String,                 // e.g., "Telangana"
  stateCode: String,             // e.g., "TG"
  population: Number,            // optional, for per-capita calculations
  area: Number,                  // optional, sq km
  headquarters: String,          // district HQ city
  districtCollector: String,     // name of current collector
  transportOfficer: String,      // name of RTO
  totalInstitutions: Number,     // denormalized
  totalParticipants: Number,     // denormalized
  totalEvents: Number,           // denormalized
  totalActions: Number,          // denormalized
  totalHazards: Number,          // denormalized
  scorecardData: {               // latest computed scorecard
    score: Number,               // 0-100
    rank: Number,
    grade: String,               // A+, A, B, C, D
    computedAt: Date
  },
  createdAt: Date,
  updatedAt: Date
}
// Indexes: { code: 1 } unique, { state: 1 }, { stateCode: 1 }
```

#### `Action`
```typescript
{
  actionId: String,              // e.g., "ACT-KRMR-2027-00001"
  title: String,                 // required
  description: String,
  fourECategory: String,         // enum: ["education", "engineering", "enforcement", "emergency"]
  actionType: String,            // enum: ["individual", "institutional", "government"]
  status: String,                // enum: ["committed", "in_progress", "completed", "verified", "rejected"]
  priority: String,              // enum: ["low", "medium", "high", "critical"]
  
  // Who
  submittedBy: String,           // userId or name
  submittedByRole: String,       // citizen, institution, government
  institutionId: String,         // optional
  district: String,              // required
  state: String,
  
  // What
  targetDate: Date,
  completedDate: Date,
  evidence: [{                   // embedded evidence records
    type: String,                // enum: ["photo", "document", "video", "link"]
    url: String,
    description: String,
    uploadedAt: Date
  }],
  beforePhotos: [String],        // GridFS IDs
  afterPhotos: [String],         // GridFS IDs
  
  // Verification
  verifiedBy: String,
  verifiedAt: Date,
  verificationNotes: String,
  
  // Metrics
  estimatedBeneficiaries: Number,
  actualBeneficiaries: Number,
  impactScore: Number,           // 0-100, computed
  
  // Linked entities
  eventReferenceId: String,      // optional link to Event
  hazardId: String,              // optional link to Hazard
  
  createdAt: Date,
  updatedAt: Date
}
// Indexes: { actionId: 1 } unique, { district: 1 }, { fourECategory: 1 }, 
//          { status: 1 }, { institutionId: 1 }, { createdAt: -1 }
```

#### `Hazard`
```typescript
{
  hazardId: String,              // e.g., "HZD-KRMR-2027-00001"
  title: String,                 // required
  description: String,           // required
  category: String,              // enum: ["pothole", "missing_sign", "broken_signal", "poor_visibility",
                                 //        "dangerous_curve", "no_footpath", "no_divider", "flooding",
                                 //        "encroachment", "other"]
  severity: String,              // enum: ["low", "medium", "high", "critical"]
  status: String,                // enum: ["reported", "verified", "assigned", "in_progress", 
                                 //        "resolved", "rejected"]
  
  // Location
  district: String,              // required
  state: String,
  location: String,              // address/landmark description
  latitude: Number,              // GPS
  longitude: Number,             // GPS
  
  // Reporter
  reportedBy: String,            // name
  reporterContact: String,       // phone/email
  reporterIpHash: String,        // privacy
  
  // Evidence
  photos: [String],              // GridFS IDs
  beforePhotos: [String],
  afterPhotos: [String],
  
  // Verification & Resolution
  verifiedBy: String,
  verifiedAt: Date,
  assignedTo: String,            // department/authority
  resolvedBy: String,
  resolvedAt: Date,
  resolutionNotes: String,
  
  // Linked
  interventionId: String,        // link to Intervention
  actionId: String,              // link to Action taken
  
  createdAt: Date,
  updatedAt: Date
}
// Indexes: { hazardId: 1 } unique, { district: 1 }, { category: 1 },
//          { status: 1 }, { severity: 1 }, { createdAt: -1 }
```

#### `Intervention`
```typescript
{
  interventionId: String,        // e.g., "INT-KRMR-2027-00001"
  title: String,
  description: String,
  type: String,                  // enum: ["repair", "installation", "enforcement_drive", 
                                 //        "awareness_campaign", "infrastructure", "policy", "other"]
  fourECategory: String,         // enum: ["education", "engineering", "enforcement", "emergency"]
  status: String,                // enum: ["planned", "in_progress", "completed", "verified"]
  
  // Context
  district: String,
  state: String,
  department: String,            // responsible department
  
  // Linked
  hazardIds: [String],           // hazards addressed
  actionIds: [String],           // actions involved
  
  // Evidence
  beforePhotos: [String],
  afterPhotos: [String],
  documents: [String],
  
  // Metrics
  budgetAllocated: Number,
  budgetSpent: Number,
  beneficiaries: Number,
  
  // Verification
  verifiedBy: String,
  verifiedAt: Date,
  
  startDate: Date,
  completedDate: Date,
  createdAt: Date,
  updatedAt: Date
}
// Indexes: { interventionId: 1 } unique, { district: 1 }, { fourECategory: 1 },
//          { status: 1 }
```

#### `GovernmentReport`
```typescript
{
  reportId: String,              // e.g., "RPT-KRMR-2027-001"
  title: String,
  type: String,                  // enum: ["district", "state", "national", "custom"]
  scope: String,                 // district name, state name, or "national"
  period: {
    from: Date,
    to: Date
  },
  
  // Content
  summary: String,               // executive summary text
  sections: [{
    title: String,
    content: String,
    metrics: Object,             // flexible key-value metrics
    charts: [String]             // chart config references
  }],
  
  // Aggregated metrics snapshot
  metrics: {
    totalParticipants: Number,
    totalEvents: Number,
    totalActions: Number,
    actionsCompleted: Number,
    totalHazards: Number,
    hazardsResolved: Number,
    totalInstitutions: Number,
    certificatesIssued: Number,
    fourEBreakdown: {
      education: Number,
      engineering: Number,
      enforcement: Number,
      emergency: Number
    },
    topDistricts: [{ code: String, score: Number }],
    impactIndicators: Object
  },
  
  // Generated files
  pdfUrl: String,                // GridFS or external URL
  excelUrl: String,
  
  generatedBy: String,           // admin who triggered
  generatedAt: Date,
  status: String,                // enum: ["generating", "ready", "archived"]
  
  createdAt: Date
}
// Indexes: { reportId: 1 } unique, { type: 1 }, { scope: 1 }, { generatedAt: -1 }
```

#### `DistrictScorecard`
```typescript
{
  district: String,              // required, district code
  districtName: String,
  state: String,
  period: {
    from: Date,
    to: Date
  },
  
  // Scoring dimensions (each 0-100)
  scores: {
    participation: Number,       // based on per-capita participation
    eventDensity: Number,        // events per institution
    actionCompletion: Number,    // % actions completed
    hazardResolution: Number,    // % hazards resolved
    institutionalCoverage: Number, // % institutions participating
    quizPerformance: Number,     // avg quiz scores
    fourEBalance: Number,        // evenness across 4E categories
  },
  
  overallScore: Number,          // weighted average (0-100)
  rank: Number,                  // among all districts
  grade: String,                 // A+, A, B, C, D, F
  trend: String,                 // "improving", "stable", "declining"
  previousScore: Number,         // for trend calculation
  
  // Raw counts
  rawCounts: {
    participants: Number,
    events: Number,
    actions: Number,
    actionsCompleted: Number,
    hazards: Number,
    hazardsResolved: Number,
    institutions: Number,
    certificates: Number,
    clubs: Number,
    pledges: Number,
    quizAttempts: Number,
    simulationPlays: Number
  },
  
  computedAt: Date,
  computedBy: String,            // "system" or admin
  
  createdAt: Date
}
// Indexes: { district: 1, period.from: 1, period.to: 1 } compound unique,
//          { overallScore: -1 }, { rank: 1 }
```

### 4.2 Modifications to Existing Models

> [!IMPORTANT]
> All modifications are **additive only** — new optional fields. No existing fields are removed or renamed.

#### Certificate — Add fields:
```typescript
{
  // NEW FIELDS (all optional, backward compatible)
  fourECategory: String,         // enum: ["education", "engineering", "enforcement", "emergency"]
  actionId: String,              // link to Action
  institutionId: String,         // link to Institution
  verified: Boolean,             // default: false
  verifiedBy: String,
  verifiedAt: Date
}
```

#### Event — Add fields:
```typescript
{
  // NEW FIELDS (all optional, backward compatible)
  fourECategory: String,         // enum: ["education", "engineering", "enforcement", "emergency"]
  institutionId: String,         // link to Institution
  impactMetrics: {
    attendees: Number,
    beneficiaries: Number,
    mediaReach: Number
  },
  actionIds: [String]            // linked actions
}
```

#### Organizer — Add fields:
```typescript
{
  // NEW FIELDS (all optional, backward compatible)
  institutionId: String,         // link to Institution
  districtCode: String           // link to District.code
}
```

#### Club — Add fields:
```typescript
{
  // NEW FIELDS (all optional, backward compatible)
  institutionId: String,         // link to Institution
  status: String,                // enum: ["active", "inactive", "verified"], default: "active"
  verifiedBy: String,
  memberCount: Number
}
```

#### AdminUser — Add fields:
```typescript
{
  // NEW FIELDS (all optional, backward compatible)
  fullName: String,
  district: String,              // for district admins
  state: String,                 // for state admins
  permissions: [String],         // granular permissions array
  role: String                   // CHANGE default from "admin" to enum:
                                 // ["superadmin", "state_admin", "district_admin", "verifier", "admin"]
}
```

---

## 5. New Modules & Pages

### 5.1 Government Mission Control (`/gov`)

| Route | Purpose |
|---|---|
| `/gov` | Mission Control overview — real-time KPIs, maps, alerts |
| `/gov/login` | Government login (role-based) |
| `/gov/districts` | All districts list with scorecards |
| `/gov/districts/[code]` | Single district deep-dive |
| `/gov/4e` | 4E Intelligence Dashboard |
| `/gov/actions` | Action management & verification queue |
| `/gov/hazards` | Hazard management & assignment |
| `/gov/institutions` | Institution directory & performance |
| `/gov/reports` | Report generation center |
| `/gov/reports/[reportId]` | View generated report |
| `/gov/settings` | Admin user management, role assignment |

### 5.2 Action Tracker (`/actions`)

| Route | Purpose |
|---|---|
| `/actions` | Browse + commit to actions (public) |
| `/actions/submit` | Submit new action with evidence |
| `/actions/[actionId]` | Action detail + progress updates |
| `/actions/my` | My committed/completed actions |

### 5.3 Hazard Reporting (`/hazards`)

| Route | Purpose |
|---|---|
| `/hazards` | Browse reported hazards on map |
| `/hazards/report` | Submit new hazard with geolocation + photos |
| `/hazards/[hazardId]` | Hazard detail + resolution status |

### 5.4 Institution Portal (`/institution`)

| Route | Purpose |
|---|---|
| `/institution` | Institution dashboard (events, members, actions, scores) |
| `/institution/register` | Register new institution |
| `/institution/[id]` | Institution public profile |

---

## 6. New API Endpoints

### 6.1 Government APIs (`/api/gov/`)

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/gov/dashboard` | GET | Mission Control KPIs (filterable by district, date range, 4E) |
| `/api/gov/districts` | GET | All districts with scorecard summaries |
| `/api/gov/districts/[code]` | GET | Single district deep-dive data |
| `/api/gov/districts/[code]/scorecard` | GET | Computed scorecard for district |
| `/api/gov/4e/summary` | GET | 4E category breakdown (national/state/district) |
| `/api/gov/4e/[category]` | GET | Drill-down into specific 4E category |
| `/api/gov/users` | GET/POST | List/create government users |
| `/api/gov/users/[id]` | PUT/DELETE | Update/remove government user |

### 6.2 Action APIs (`/api/actions/`)

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/actions/list` | GET | Browse actions (filter by district, status, 4E, type) |
| `/api/actions/create` | POST | Submit new action commitment |
| `/api/actions/[actionId]` | GET | Action detail |
| `/api/actions/[actionId]/update` | PUT | Update action status + add evidence |
| `/api/actions/[actionId]/verify` | POST | Verify/approve action (gov only) |
| `/api/actions/[actionId]/evidence` | POST | Upload evidence (photos/docs) |
| `/api/actions/stats` | GET | Action completion analytics |

### 6.3 Hazard APIs (`/api/hazards/`)

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/hazards/list` | GET | Browse hazards (filter by district, category, status, severity) |
| `/api/hazards/report` | POST | Submit hazard report with geolocation + photos |
| `/api/hazards/[hazardId]` | GET | Hazard detail |
| `/api/hazards/[hazardId]/assign` | POST | Assign hazard to department (gov only) |
| `/api/hazards/[hazardId]/resolve` | POST | Mark hazard resolved with evidence (gov only) |
| `/api/hazards/[hazardId]/verify` | POST | Verify resolution (gov only) |
| `/api/hazards/stats` | GET | Hazard analytics by district/category |

### 6.4 Institution APIs (`/api/institutions/`)

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/institutions/register` | POST | Register new institution |
| `/api/institutions/list` | GET | Browse institutions (filter by district, type, status) |
| `/api/institutions/[id]` | GET | Institution detail + metrics |
| `/api/institutions/[id]/verify` | POST | Verify institution (gov only) |
| `/api/institutions/[id]/stats` | GET | Institution-level analytics |

### 6.5 Report APIs (`/api/reports/`)

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/reports/generate` | POST | Trigger report generation (district/state/national) |
| `/api/reports/list` | GET | List generated reports |
| `/api/reports/[reportId]` | GET | Fetch report data |
| `/api/reports/[reportId]/pdf` | GET | Download PDF |
| `/api/reports/[reportId]/excel` | GET | Download Excel |

### 6.6 Scorecard APIs (`/api/scorecards/`)

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/scorecards/compute` | POST | Trigger scorecard computation (gov only) |
| `/api/scorecards/list` | GET | All district scorecards for period |
| `/api/scorecards/[districtCode]` | GET | Single district scorecard |
| `/api/scorecards/rankings` | GET | District rankings |

---

## 7. Roles & Permissions System

### 7.1 Role Hierarchy

```text
superadmin
  └── state_admin
        └── district_admin
              └── verifier
                    └── institution_admin
                          └── organizer (existing)
                                └── citizen (public)
```

### 7.2 Permission Matrix

| Permission | superadmin | state_admin | district_admin | verifier | institution_admin | organizer | citizen |
|---|---|---|---|---|---|---|---|
| View all districts | ✅ | ✅ | Own district | ❌ | ❌ | ❌ | ❌ |
| View 4E dashboard | ✅ | ✅ | ✅ (own) | ✅ (own) | ❌ | ❌ | ❌ |
| Approve organizers | ✅ | ✅ | ✅ (own) | ❌ | ❌ | ❌ | ❌ |
| Verify actions | ✅ | ✅ | ✅ (own) | ✅ (own) | ❌ | ❌ | ❌ |
| Verify hazards | ✅ | ✅ | ✅ (own) | ✅ (own) | ❌ | ❌ | ❌ |
| Assign hazards | ✅ | ✅ | ✅ (own) | ❌ | ❌ | ❌ | ❌ |
| Generate reports | ✅ | ✅ | ✅ (own) | ❌ | ❌ | ❌ | ❌ |
| Manage gov users | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Verify institutions | ✅ | ✅ | ✅ (own) | ✅ (own) | ❌ | ❌ | ❌ |
| Create events | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Submit actions | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Report hazards | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Take quiz/sim | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| View scorecards | ✅ | ✅ | ✅ (own) | ✅ (own) | ✅ (own) | ❌ | ❌ |

### 7.3 Implementation: Middleware

```typescript
// middleware.ts (new file at project root)
// Protects /gov/* routes requiring authentication
// Checks JWT session for role
// Enforces district scope for district_admin and verifier roles
```

---

## 8. Government Mission Control Design

### 8.1 Main Dashboard (`/gov`)

```text
┌──────────────────────────────────────────────────────────────────┐
│  🏛️  GOVERNMENT MISSION CONTROL    [District: All ▾] [Period ▾] │
├──────┬───────┬───────┬───────┬───────┬───────┬──────────────────┤
│ 📊   │ 🎯    │ ⚠️    │ 🏫    │ 📜    │ 🏆    │                 │
│Total │Actions│Hazards│Instit-│Certs  │Events │    Trend         │
│Partic│Compl. │Report-│utions │Issued │Conduc-│    Sparklines    │
│ipants│       │ed     │Active │       │ted    │                 │
│12,450│2,340  │189    │456    │8,920  │312    │                 │
├──────┴───────┴───────┴───────┴───────┴───────┴──────────────────┤
│                                                                  │
│  ┌─────────────────────┐  ┌─────────────────────┐               │
│  │  4E BREAKDOWN       │  │  DISTRICT MAP       │               │
│  │  ████ Education 45% │  │  [Heat map of       │               │
│  │  ██░░ Engineering 22│  │   activity by       │               │
│  │  ███░ Enforcement 25│  │   district]         │               │
│  │  █░░░ Emergency 8%  │  │                     │               │
│  └─────────────────────┘  └─────────────────────┘               │
│                                                                  │
│  ┌──────────────────────────────────────────────────┐           │
│  │  PENDING ACTIONS                                  │           │
│  │  ┌─ Verify: 23 actions  ──── [Review] ─────┐    │           │
│  │  ├─ Assign: 12 hazards  ──── [Assign] ─────┤    │           │
│  │  └─ Approve: 5 organizers── [Approve] ─────┘    │           │
│  └──────────────────────────────────────────────────┘           │
│                                                                  │
│  ┌────────────────────┐  ┌────────────────────────┐             │
│  │ TOP 5 DISTRICTS    │  │ RECENT ACTIVITY        │             │
│  │ 1. Hyderabad  92/A+│  │ • New hazard: Pothole..│             │
│  │ 2. Karimnagar 87/A │  │ • Action verified: ...  │             │
│  │ 3. Warangal   81/A │  │ • 3 new organizers...   │             │
│  │ 4. Nizamabad  76/B │  │ • Report generated...   │             │
│  │ 5. Adilabad   71/B │  │                        │             │
│  └────────────────────┘  └────────────────────────┘             │
└──────────────────────────────────────────────────────────────────┘
```

### 8.2 Tab Structure

| Tab | Content |
|---|---|
| **Overview** | KPI cards + 4E breakdown + district map + pending queue + recent activity |
| **Districts** | District table with sortable scores, clickable to drill-down |
| **Actions** | Filterable action list + verification queue |
| **Hazards** | Hazard map + list + assignment queue |
| **Institutions** | Institution directory + verification queue |
| **Reports** | Report generation + history |
| **Settings** | User management (superadmin/state_admin only) |

---

## 9. Workflows

### 9.1 Action Lifecycle

```text
Citizen/Institution submits action commitment
              │
              ▼
        ┌──────────┐
        │ COMMITTED │
        └────┬─────┘
             │  (user starts working)
             ▼
       ┌───────────┐
       │IN_PROGRESS │
       └─────┬─────┘
             │  (user uploads evidence)
             ▼
       ┌───────────┐
       │ COMPLETED  │
       └─────┬─────┘
             │  (verifier reviews)
             ├─────────────┐
             ▼             ▼
       ┌──────────┐  ┌──────────┐
       │ VERIFIED  │  │ REJECTED │
       └──────────┘  └──────────┘
```

### 9.2 Hazard Lifecycle

```text
Citizen reports hazard (with location + photos)
              │
              ▼
        ┌──────────┐
        │ REPORTED  │
        └────┬─────┘
             │  (verifier confirms)
             ▼
        ┌──────────┐
        │ VERIFIED  │
        └────┬─────┘
             │  (admin assigns to department)
             ▼
        ┌──────────┐
        │ ASSIGNED  │
        └────┬─────┘
             │  (work begins)
             ▼
       ┌───────────┐
       │IN_PROGRESS │
       └─────┬─────┘
             │  (department reports resolution + after photos)
             ▼
        ┌──────────┐
        │ RESOLVED  │  ← with before/after evidence
        └──────────┘
```

### 9.3 Institution Onboarding

```text
Institution self-registers
        │
        ▼
   ┌──────────┐
   │ ACTIVE    │  (basic registration, unverified)
   └────┬─────┘
        │  (gov verifies)
        ▼
   ┌──────────┐
   │ VERIFIED  │  (officially recognized, appears in reports)
   └──────────┘
```

### 9.4 Report Generation

```text
Admin clicks "Generate Report"
        │
        ├── Select scope: District / State / National
        ├── Select period: Date range
        │
        ▼
   ┌────────────┐
   │ GENERATING  │  (backend aggregates all data)
   └──────┬─────┘
          │  (PDF + Excel produced)
          ▼
   ┌────────────┐
   │   READY     │  (download links available)
   └────────────┘
```

---

## 10. Reporting Engine

### 10.1 Impact Report Structure

**"What happened during Road Safety Month?"**

```text
EXECUTIVE SUMMARY
├── Total participation across [N] districts
├── [N] actions completed with [N] verified
├── [N] hazards identified, [N]% resolved
├── [N] institutions actively participating
└── Key impact indicators

SECTION 1: PARTICIPATION
├── Total participants by district (table + chart)
├── Online vs offline breakdown
├── Quiz performance analytics
├── Simulation engagement metrics
└── Certificate distribution

SECTION 2: ACTIONS TAKEN (4E Framework)
├── Education actions (count, completion rate, evidence)
├── Engineering actions (infrastructure improvements)
├── Enforcement actions (compliance drives)
├── Emergency actions (preparedness drills)
└── Before/after evidence gallery

SECTION 3: GROUND INTELLIGENCE
├── Hazards reported by category
├── Geographic distribution (map)
├── Resolution rate by district
├── Average resolution time
└── Critical unresolved hazards

SECTION 4: INSTITUTIONAL ENGAGEMENT
├── Schools/colleges participating
├── Clubs formed
├── Parent pledges collected
├── Events conducted
└── Top-performing institutions

SECTION 5: DISTRICT SCORECARDS
├── Ranking table (all districts)
├── Score breakdown by dimension
├── Trend analysis
└── Districts needing attention

SECTION 6: EVIDENCE ANNEXURES
├── Action evidence gallery
├── Hazard resolution evidence
├── Event photographs
└── Certificates issued (sample)

SECTION 7: RECOMMENDATIONS
├── Areas requiring attention
├── Resource allocation suggestions
├── Districts needing support
└── Next steps
```

### 10.2 Export Formats
- **PDF** — A4, professional government report layout using Puppeteer
- **Excel** — Multi-sheet workbook (Summary, Districts, Actions, Hazards, Institutions, Raw Data)
- **CSV** — Flat data exports for each entity type

---

## 11. Implementation Order

### PHASE 1 — Foundation (Week 1-2)
> **Goal:** Government can log in, see districts, and view existing data through government lens.

| # | Task | Files/Changes |
|---|---|---|
| 1.1 | Create shared districts constant | `lib/districts.ts` — single source of truth for all 33+ districts (consolidate from 4+ duplicated arrays) |
| 1.2 | Create `District` model | `models/District.ts` + seed script for 33 Telangana districts |
| 1.3 | Create `Institution` model | `models/Institution.ts` |
| 1.4 | Extend `AdminUser` model | Add role, district, state, permissions, fullName fields |
| 1.5 | Re-enable NextAuth | `app/api/auth/[...nextauth]/route.ts` — implement real credential auth with role support |
| 1.6 | Create auth middleware | `middleware.ts` — protect `/gov/*` routes, enforce RBAC |
| 1.7 | Create gov layout | `app/gov/layout.tsx` — government portal shell with sidebar nav |
| 1.8 | Create gov login | `app/gov/login/page.tsx` |
| 1.9 | Create Mission Control overview | `app/gov/page.tsx` — KPI cards pulling from existing data |
| 1.10 | Create district listing | `app/gov/districts/page.tsx` + `GET /api/gov/districts` |
| 1.11 | Extend `lib/reference.ts` | Add Action, Hazard, Institution, Intervention ID generators |
| 1.12 | Extend `lib/regional.ts` | Add all state/district authorities |
| 1.13 | Update Nav | Add conditional government links |
| 1.14 | Update branding | Layout metadata → "National Road Safety Action & Impact Platform" |
| 1.15 | Create 4E category constants | `lib/fourE.ts` — Education, Engineering, Enforcement, Emergency definitions |

### PHASE 2 — Action Engine (Week 3-4)
> **Goal:** Citizens and institutions can commit to and track safety actions.

| # | Task |
|---|---|
| 2.1 | Create `Action` model |
| 2.2 | Create action APIs (list, create, update, verify, evidence) |
| 2.3 | Create public action tracker page (`/actions`) |
| 2.4 | Create action submission form (`/actions/submit`) |
| 2.5 | Create action detail page (`/actions/[actionId]`) |
| 2.6 | Create government action management tab in Mission Control |
| 2.7 | Create verification queue UI |
| 2.8 | Add evidence upload (GridFS bucket `actionEvidence`) |
| 2.9 | Add 4E classification to action submission |
| 2.10 | Connect actions to existing events (optional linkage) |
| 2.11 | Create institution registration flow (`/institution/register`) |
| 2.12 | Create institution APIs |
| 2.13 | Add `fourECategory` field to existing Certificate and Event models |

### PHASE 3 — Ground Intelligence (Week 5-6)
> **Goal:** Hazard reporting with geolocation, photos, and verification workflow.

| # | Task |
|---|---|
| 3.1 | Create `Hazard` model |
| 3.2 | Create `Intervention` model |
| 3.3 | Create hazard APIs (report, list, assign, resolve, verify) |
| 3.4 | Create hazard reporting page (`/hazards/report`) with geolocation + photo upload |
| 3.5 | Create hazard map view (`/hazards`) |
| 3.6 | Create hazard detail page (`/hazards/[hazardId]`) |
| 3.7 | Create government hazard management tab in Mission Control |
| 3.8 | Create hazard assignment workflow |
| 3.9 | Create before/after photo comparison UI |
| 3.10 | Create intervention tracking linked to hazards |
| 3.11 | Create hazard analytics API (`/api/hazards/stats`) |
| 3.12 | Add evidence upload (GridFS bucket `hazardEvidence`) |

### PHASE 4 — Measurement (Week 7-8)
> **Goal:** District scorecards, 4E analytics, and participation analytics.

| # | Task |
|---|---|
| 4.1 | Create `DistrictScorecard` model |
| 4.2 | Create scorecard computation engine (aggregation pipeline) |
| 4.3 | Create scorecard APIs (compute, list, rankings) |
| 4.4 | Create district scorecard page (`/gov/districts/[code]`) |
| 4.5 | Create 4E Intelligence Dashboard (`/gov/4e`) |
| 4.6 | Create institution performance view (`/gov/institutions`) |
| 4.7 | Enhance `/api/stats/overview` with district + 4E breakdowns |
| 4.8 | Create district comparison charts |
| 4.9 | Add trend calculation (vs previous period) |
| 4.10 | Create institution portal page (`/institution`) with self-service analytics |

### PHASE 5 — Government Reporting (Week 9-10)
> **Goal:** One-click report generation with PDF/Excel exports and evidence annexures.

| # | Task |
|---|---|
| 5.1 | Create `GovernmentReport` model |
| 5.2 | Create report generation engine |
| 5.3 | Create report APIs (generate, list, PDF, Excel) |
| 5.4 | Create report center page (`/gov/reports`) |
| 5.5 | Create report viewer (`/gov/reports/[reportId]`) |
| 5.6 | Build PDF report template (A4 professional layout via Puppeteer) |
| 5.7 | Build Excel export (multi-sheet workbook) |
| 5.8 | Create evidence annexure assembly |
| 5.9 | Create executive summary auto-generation |
| 5.10 | Create impact narrative builder (templated text from metrics) |

### PHASE 6 — Advanced Intelligence (Week 11-12)
> **Goal:** AI-assisted classification, anomaly detection, and recommendations. **AI comes last, not first.**

| # | Task |
|---|---|
| 6.1 | AI-assisted hazard classification from photos |
| 6.2 | Intelligent 4E categorization suggestions |
| 6.3 | Anomaly detection in participation patterns |
| 6.4 | Automated recommendation engine for district improvements |
| 6.5 | Trend analysis and forecasting |
| 6.6 | Natural language impact summary generation |

---

## 12. What NOT to Touch

> [!CAUTION]
> These components are stable and working. Do not modify them unless there is a critical bug.

| Component | Why Leave It Alone |
|---|---|
| `app/quiz/page.tsx` | Complex TTS + audio + gamification, fully functional |
| `app/simulation/*` (all 8 files) | Drag-and-drop engine with collision detection, 17 scenarios |
| `app/basics/page.tsx` | 87 road signs with learn + quiz modes, stable |
| `app/guides/page.tsx` | 16-step habit reinforcement, working |
| `app/prevention/page.tsx` | Checklist + quiz, working |
| `app/rules/page.tsx` | Static rules display, stable |
| `app/special/page.tsx` | Accessibility page, don't break |
| `utils/certificateExport.ts` | Complex html2canvas + jsPDF with retry logic |
| `utils/tts.ts` | TTS with Indian voice preferences |
| `lib/hmac.ts` | Security-critical, tested |
| `lib/db.ts` | Database singleton, don't touch |
| `components/certificates/Certificate.tsx` | Complex rendering with regional authority logic |
| `components/MinisterMessageModal.tsx` | Video carousel, working |
| `components/ParentsPledgeModal.tsx` | Pledge + PNG download, working |
| All `components/ui/*` | Standard primitives |
| Road sign image assets | 87 × 3 sets = 261 images |
| Localization files (`locales/*`) | en/te translations |
| Certificate download API (`/api/certificates/download`) | Puppeteer PDF gen with serverless chromium |

---

## 13. What Can Be Reused Immediately

| Existing Asset | How It Helps the Government Layer |
|---|---|
| **Certificate system** | Already tracks participation, scores, activity types, districts, events — direct input to district scorecards |
| **Event system** | Already has referenceId, district, eventType, organizer linking — direct input to institutional tracking |
| **Organizer system** | Already has approval workflow — extend for institutional hierarchy |
| **DailyReport system** | Already aggregates daily metrics — extend for government reporting |
| **Quiz/Sim statistics** | Already tracked in QuizAttempt + SimStat — direct input to 4E Education metrics |
| **Club registrations** | Already tracks institutions + districts — seed data for Institution model |
| **Parents' pledges** | Already tracks by district — input to participation metrics |
| **Reference ID system** | Already has district codes for all 33 Telangana districts — extend for new entity types |
| **Rate limiting** | Already implemented — apply to new APIs |
| **GridFS photo storage** | Already working for event photos — reuse for hazard/action evidence |
| **PDF generation** | Already has Puppeteer + chromium — reuse for government reports |
| **HMAC signing** | Already secures certificates — can secure government report URLs |
| **Admin dashboard component** | Already renders metrics, tables, approval workflows — extend as foundation for Mission Control |

---

## 14. Technical Debt & Risks

### 14.1 Issues to Address During Upgrade

| Issue | Severity | Resolution |
|---|---|---|
| **Auth is disabled** (`/api/auth/[...nextauth]` returns 501) | 🔴 Critical | Re-enable with proper RBAC before government layer |
| **Admin auth is client-side only** (`AdminSignIn.tsx` checks non-empty strings) | 🔴 Critical | Replace with server-side JWT session validation |
| **Admin APIs have no auth checks** (all 13 admin routes are unprotected) | 🔴 Critical | Add middleware auth for all `/api/admin/*` and `/api/gov/*` |
| **In-memory rate limit + cache** won't survive serverless scaling | 🟡 Medium | Add Redis adapter (Upstash recommended for Vercel) |
| **33-district array duplicated** in 4+ files | 🟡 Medium | Consolidate to `lib/districts.ts` in Phase 1.1 |
| **`CERT_HMAC_SECRET` has insecure fallback** (`"default-secret-change-me"`) | 🟡 Medium | Enforce env var requirement |
| **`CRON_SECRET` auth is skipped if unset** | 🟡 Medium | Enforce env var requirement |
| **No input sanitization** on some admin routes | 🟡 Medium | Add consistent validation |
| **Certificate numbers use random** (not sequential) to avoid race conditions | 🟢 Low | Acceptable trade-off, but monitor for collisions at scale |
| **IP hashing uses non-cryptographic hash** (`(hash << 5) - hash + char`) | 🟢 Low | Consider SHA-256 for production |

### 14.2 Scaling Considerations

| Concern | Current | Recommended |
|---|---|---|
| Database | MongoDB Atlas (assumed) | Add indexes for new models, consider read replicas |
| File Storage | GridFS | Consider S3/Cloudflare R2 for evidence at scale |
| Caching | In-memory Map | Upstash Redis for distributed cache |
| Rate Limiting | In-memory Map | Upstash Redis for distributed rate limiting |
| PDF Generation | Puppeteer serverless | Consider queue-based generation for reports |
| Search | MongoDB text queries | Consider MongoDB Atlas Search for hazard/action text search |

---

> [!IMPORTANT]
> ## Summary Decision: Existing project → Major upgrade → Government Edition
> 
> **NOT a new project.** The existing RSM2026 platform contains a fully functional engagement engine with certificates, events, organizers, quizzes, simulations, and daily reporting. The government layer is **additive** — 7 new models, ~30 new API endpoints, ~15 new pages — all wired to the existing data through shared district codes, reference IDs, and event linkages.
>
> **Rule:** Existing functionality remains stable. New government capabilities are additive.

