# Road Safety Month 2027 — National Road Safety Action & Impact Platform
## Session Handoff & State Summary

**Workspace Path:** `/Users/nandagiriaditya/Downloads/RSM2027`  
**Git Branch:** `main`  
**Dev Server:** Running on port `4000` (`npm run dev`)

---

### 1. Project Architecture & Delivered Capabilities

The existing citizen engagement platform has been transformed into **RSM 2027 — Government Edition v2**, adding a comprehensive public-sector intelligence and action layer without breaking existing citizen workflows:

```text
                           ROAD SAFETY MONTH 2027
                   National Road Safety Action & Impact Platform
                                      │
            ┌─────────────────────────┴─────────────────────────┐
            ▼                                                   ▼
     CITIZEN & PARTICIPANT PORTAL                        GOVERNMENT MISSION CONTROL
  (Preserved & Extended Foundation)                     (Additive Public-Sector Layer)
            │                                                   │
  ┌─────────┼──────────┬──────────┐            ┌────────┬───────┼────────┬───────┐
  │         │          │          │            │        │       │        │       │
Basics    Quiz       Events     Certificates  4E      Districts Actions  Hazards Reports
Guides  Simulation  Pledges     Validation    Radar   Scores   Triage   Dispatch Dossiers
                                               │        │       │        │       │
                                               └────────┴───────┼────────┴───────┘
                                                                ▼
                                                   VERIFIABLE GROUND IMPACT
```

---

### 2. Completed Phases Overview

| Phase | Description | Key Modules & Files |
|---|---|---|
| **Phase 1: Foundation** | Districts, 4E standards, RBAC auth, ID generators, foundational models | `lib/districts.ts`, `lib/fourE.ts`, `lib/govAuth.ts`, `lib/reference.ts`, `models/District.ts`, `models/Institution.ts`, `models/Action.ts`, `models/Hazard.ts`, `models/AdminUser.ts`, `app/gov/layout.tsx`, `app/gov/page.tsx` |
| **Phase 2: Action Engine** | Public action commitments, institutional onboarding, verification audit | `app/actions/*`, `app/institution/*`, `app/gov/actions/page.tsx`, `app/gov/institutions/page.tsx`, `app/api/actions/*`, `app/api/institutions/*` |
| **Phase 3: Ground Intelligence** | GPS-tagged road hazards, photo evidence, department assignment & repair workflows | `app/hazards/*`, `app/gov/hazards/page.tsx`, `models/Intervention.ts`, `app/api/hazards/*` |
| **Phase 4: Measurement & 4E** | Automated 0-100 composite scoring across Education, Engineering, Enforcement, Emergency | `models/DistrictScorecard.ts`, `app/api/scorecards/compute/route.ts`, `app/gov/districts/page.tsx`, `app/gov/districts/[code]/page.tsx`, `app/gov/4e/page.tsx`, `app/api/gov/4e/summary/route.ts` |
| **Phase 5: Gov Reporting** | One-click official state & district dossiers, print styles, and CSV downloads | `models/GovernmentReport.ts`, `app/gov/reports/page.tsx`, `app/gov/reports/[reportId]/page.tsx`, `app/api/reports/generate/route.ts`, `app/api/reports/[reportId]/download/route.ts` |
| **Phase 6: Advanced Intelligence** | AI anomaly radar, hotspot clustering, policy directives, and officer management | `lib/intelligence.ts`, `app/api/gov/intelligence/route.ts`, `app/gov/settings/page.tsx`, `app/api/gov/users/route.ts`, updated `components/Nav.tsx` |

---

### 3. Application Routes & URLs

#### Citizen Portal
- Public Homepage: `http://localhost:4000/`
- Road Safety Basics: `http://localhost:4000/basics`
- Simulation Experience: `http://localhost:4000/simulation`
- Safety Quiz: `http://localhost:4000/quiz`
- Events & Drives: `http://localhost:4000/events`
- Certificate Verification: `http://localhost:4000/certificates`
- **Action Tracker:** `http://localhost:4000/actions`
- **Submit Action:** `http://localhost:4000/actions/submit`
- **Hazard Reporting:** `http://localhost:4000/hazards/report`
- **Hazard Feed:** `http://localhost:4000/hazards`
- **Institution Directory:** `http://localhost:4000/institution`
- **Register Institution:** `http://localhost:4000/institution/register`

#### Government Mission Control
- Mission Control Overview & AI Radar: `http://localhost:4000/gov`
- Government Login: `http://localhost:4000/gov/login`
- 33 Districts Performance Matrix: `http://localhost:4000/gov/districts`
- District Drill-down (e.g. Hyderabad): `http://localhost:4000/gov/districts/HYDR`
- 4E Intelligence & Pillar Analysis: `http://localhost:4000/gov/4e`
- Action Verification Console: `http://localhost:4000/gov/actions`
- Ground Hazard Triage & Dispatch: `http://localhost:4000/gov/hazards`
- Institutional Affiliation Approval: `http://localhost:4000/gov/institutions`
- Statutory Impact Dossiers: `http://localhost:4000/gov/reports`
- Platform Administration & RBAC: `http://localhost:4000/gov/settings`

---

### 4. Default Government Admin Credentials

Created via seed script and available for testing:
- **Email:** `admin@rsm2027.gov.in`
- **Password:** `RSM2027@admin`
- **Role:** `superadmin`

---

### 5. Running the Project Locally

```bash
cd /Users/nandagiriaditya/Downloads/RSM2027
npm run dev
# The application runs on port 4000 (configured in .env.local)
```

TypeScript verification:
```bash
npx tsc --noEmit
# Currently passes with 0 errors
```

---

### 6. Suggested Roadmap for the Next Session
1. **Live Database Synchronization**: Link an active MongoDB instance or local MongoDB replica if real-time document persistence across all collections is required.
2. **Interactive Map Visualizer**: Add Leaflet/Mapbox vector tiles to `/gov/hazards` and `/gov/districts` for GIS geospatial heatmaps.
3. **Automated WhatsApp / SMS Citizen Alerts**: Integrate Twilio or CDAC SMS gateway for instant citizen notifications when their reported hazard is resolved with before/after photos.
