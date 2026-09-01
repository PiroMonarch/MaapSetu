# MaapSetu — NAWI Test Report Automation Platform

**SIH Problem Statement PS-26035 · Ministry of Consumer Affairs, Food & Public Distribution**

A rule-driven digital platform that transforms OIML R-76 NAWI testing from manual data entry and calculation into an automated, validated, traceable and standardised compliance workflow.

---

## What It Does

MaapSetu digitises the entire NAWI (Non-Automatic Weighing Instrument) type evaluation workflow as required under the **Legal Metrology Act, 2009** and **OIML Recommendation R 76-1 (2006)**.

| Manual Today | MaapSetu |
|---|---|
| Paper forms & spreadsheets | Structured 5-step digital wizard |
| Manual MPE calculations | Server-side OIML engine with auto calculation |
| Ad-hoc pass/fail decisions | Rule-based compliance determination |
| Word/PDF templates | One-click PDF report generation |
| Filing cabinets | Searchable digital repository |

---

## Key Features

### 1. Structured 5-Step Evaluation Wizard
1. **General** — Application no., date, purpose, applicant/manufacturer details, inspector
2. **Specs** — Instrument metrological parameters with auto-generated MPE thresholds
3. **Conditions** — Environmental conditions (temperature, humidity, pressure) + applicability matrix
4. **Tests** — OIML R 76 test workspace with live pass/fail determination
5. **Review** — Document preview, compliance determination, PDF export

### 2. OIML R 76-1 Compliance Engine (`server/oiml-engine.ts`)
All calculations are derived from the authoritative OIML R 76-1 text:

| Test | Clause | Formula |
|---|---|---|
| Weighing Performance | T.3.2 | P = I + 0.5e − ΔL; Ec = E − E₀; |Ec| ≤ MPE |
| Repeatability | T.3.3 | Range = max − min ≤ 0.5e |
| Eccentricity | T.3.4 | max(I) − min(I) ≤ MPE(testLoad) |
| Discrimination | T.3.5 | ΔI ≥ 1d when 0.1e added |
| Tare Weighing | T.4.1 | |I after tare| ≤ 0.25e |

MPE table per OIML R 76-1 Table 1 (all four accuracy classes: I, II, III, IIII).

### 3. Versioned OIML Rule Library
Rules stored in MongoDB as versioned records (`OimlRule` model). When the standard is updated, only the rule library needs to change — not the application logic.

### 4. AI-Assisted Reporting (Gemini 2.0 Flash)
- **AI Test Summary** — Generates professional technical summaries for each test result
- **AI Compliance Advice** — Provides corrective action recommendations when tests fail

### 5. Dashboard with Analytics
- Stat cards (total, draft, in-progress, completed, failed)
- Monthly bar chart (passed vs failed)
- Status breakdown pie chart (Recharts)

### 6. Role-Based Users
| Role | Description |
|---|---|
| `admin` | Full system access |
| `lab_manager` | Manage reports, instruments, users |
| `test_officer` | Create and run evaluations |
| `reviewer` | Review and approve completed reports |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Tailwind CSS v4, Framer Motion, Recharts |
| Backend | Express.js (Node/TypeScript) |
| Database | MongoDB (via Mongoose; in-memory for dev) |
| AI | Google Gemini 2.0 Flash (`@google/genai`) |
| PDF | PDFKit |
| State | Zustand |
| Router | React Router v7 (HashRouter) |

---

## Running Locally

**Prerequisites:** Node.js 18+

```bash
# 1. Install dependencies
npm install

# 2. Set up environment (optional — AI features require this)
cp .env.example .env
# Add your GEMINI_API_KEY to .env

# 3. Start the dev server (Vite + Express together)
npm run dev
```

App runs at `http://localhost:5173`

**Demo credentials:**
- `inspector@maapsetu.com` / `password123` — Test Officer
- `manager@maapsetu.com`  / `password123` — Lab Manager
- `admin@maapsetu.com`    / `admin123`    — Admin

---

## Project Structure

```
├── server/
│   ├── oiml-engine.ts     # OIML R 76-1 calculation & compliance engine
│   ├── models.ts          # Mongoose schemas (Instrument, Report, TestResult, OimlRule, User)
│   ├── routes.ts          # API routes + PDF generation
│   ├── seed.ts            # Initial data (instruments, users, OIML rules)
│   └── db.ts              # MongoDB connection
├── src/
│   ├── pages/
│   │   ├── Dashboard.tsx           # Stats + charts + recent reports
│   │   ├── ReportRepository.tsx    # Filterable report list
│   │   ├── Instruments.tsx         # Equipment registry
│   │   ├── OimlRules.tsx           # Versioned rule library viewer
│   │   └── CreateReport/           # 5-step wizard
│   ├── layouts/
│   │   └── DashboardLayout.tsx     # App shell with navigation
│   ├── components/ui/              # Design system components
│   └── lib/
│       ├── store.ts                # Zustand global state
│       └── utils.ts                # cn() utility
└── server.ts                       # Entry point (Vite + Express)
```

---

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/login` | Authenticate user |
| GET/POST | `/api/instruments` | List / register instruments |
| GET/POST/PUT | `/api/reports` | CRUD for evaluation reports |
| POST | `/api/reports/:id/tests` | Save test result |
| POST | `/api/reports/:id/finalize` | Determine overall compliance |
| GET | `/api/reports/:id/pdf` | Generate PDF report |
| POST | `/api/oiml/weighing` | Evaluate weighing performance |
| POST | `/api/oiml/repeatability` | Evaluate repeatability |
| POST | `/api/oiml/eccentricity` | Evaluate eccentricity |
| POST | `/api/oiml/discrimination` | Evaluate discrimination |
| POST | `/api/oiml/tare` | Evaluate tare weighing |
| POST | `/api/ai/test-summary` | AI-generated test summary |
| POST | `/api/ai/compliance-advice` | AI compliance recommendations |
| GET | `/api/dashboard/stats` | Dashboard statistics + monthly data |
| GET | `/api/oiml-rules` | List all OIML rule records |

---

## One-Line Pitch

> "A rule-driven digital platform that transforms OIML R-76 NAWI testing from manual data entry and calculation into an automated, validated, traceable and standardised compliance workflow."
