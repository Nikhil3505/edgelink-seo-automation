# EdgeLink Technology - SEO Automation Dashboard

Full-stack SEO audit platform designed to automate website crawling, technical and on-page signal extraction, AI-driven recommendations via Claude API, and automated PDF report distribution.

---

## Architecture Overview

The system consists of:
1. **Frontend Presentation Layer**: Built with Next.js 14 App Router and Tailwind CSS, featuring an Internal Admin Portal (`/admin`) for queue monitoring and audit dispatch, alongside a Client Dashboard (`/client`) for executive metrics visualization.
2. **Asynchronous Job Queue**: Powered by BullMQ and Redis (`seo-audit-jobs` queue) with real-time step progress reporting.
3. **Headless Crawler Engine**: Serverless-compatible Fetch + Cheerio pipeline extracting HTML, meta tags, heading hierarchies, images alt text, and Schema.org JSON-LD structures.
4. **Integration Layer**: Configurable live and mock drivers for Google PageSpeed Insights, Google Search Console, DataForSEO SERP rankings, and Twilio WhatsApp delivery.
5. **AI Recommendation Engine**: Anthropic Claude API executing domain-tailored SEO audits using a parameterized master prompt and structured JSON schema.
6. **Data Persistence**: Prisma ORM with Supabase / Neon PostgreSQL support, and local fallback storage for development environments.
7. **Report Generation**: Vector PDF generator producing multi-page executive audit reports with health grades and falsifiability validation criteria.

---

## Audit Pipeline Sequence

Audits follow a strict 7-step sequence before generating reports and dispatching alerts:

```
[Trigger] Admin On-Demand Click / External Cron Endpoint (/api/cron)
   │
   ▼
[BullMQ Queue] "seo-audit-jobs" (Redis)
   │
   ▼
[Worker Execution]
   ├── Step 1: Headless crawl via Fetch + Cheerio
   ├── Step 2: Core Web Vitals & PageSpeed metrics
   ├── Step 3: Google Search Console query impressions & clicks
   ├── Step 4: Schema.org structured data validation
   ├── Step 5: On-page SEO factor analysis (titles, metas, headings, alt tags)
   ├── Step 6: robots.txt directives and sitemap.xml validation
   └── Step 7: DataForSEO organic SERP rank tracking
   │
   ▼
[Claude Analysis] Synthesizes signals into structured JSON recommendations
   │
   ▼
[Database Persistence] Stores overall score, factor breakdown, and action items in PostgreSQL
   │
   ▼
[PDF Generation] Compiles executive audit report into public/reports/
   │
   ▼
[Twilio Delivery] Triggers WhatsApp alert with health score and report link
```

---

## Directory Structure

```
.
├── src/
│   ├── mocks/                          # Mock integration drivers
│   │   ├── index.js                    # USE_MOCKS environment toggle
│   │   ├── pagespeed.mock.js           # PageSpeed Insights mock dataset
│   │   ├── gsc.mock.js                 # Search Console performance dataset
│   │   ├── dataforseo.mock.js          # SERP rankings mock dataset
│   │   └── twilio.mock.js              # WhatsApp dispatch mock handler
│   ├── crawlers/
│   │   ├── cheerio-crawler.js          # Step 1: Fetch + Cheerio crawler
│   │   ├── pagespeed.js                # Step 2: PageSpeed Insights driver
│   │   ├── gsc.js                      # Step 3: Google Search Console driver
│   │   ├── schema-validator.js         # Step 4: Schema.org JSON-LD validator
│   │   ├── onpage-analyzer.js          # Step 5: On-page technical heuristics
│   │   ├── robots-sitemap.js           # Step 6: robots.txt and sitemap.xml validator
│   │   └── dataforseo.js               # Step 7: DataForSEO rank tracking driver
│   ├── ai/
│   │   └── claude.js                   # Anthropic Claude API client & prompt builder
│   ├── queue/
│   │   ├── queue.js                    # BullMQ queue producer with fallback
│   │   └── worker.js                   # Background audit job worker
│   ├── reports/
│   │   └── pdf-generator.js            # PDF report compiler
│   ├── delivery/
│   │   └── twilio.js                   # WhatsApp delivery driver
│   ├── lib/
│   │   └── db.js                       # Prisma DB layer with resilient fallback
│   ├── cli/
│   │   └── run-audit.js                # CLI testing script
│   └── app/                            # Next.js 14 App Router
│       ├── layout.jsx                  # Root layout
│       ├── page.js                     # Landing view & pipeline overview
│       ├── admin/page.js               # Internal Admin Portal
│       ├── client/page.js              # Client SEO Dashboard
│       └── api/                        # API routes
│           ├── audits/route.js         # Audit dispatch and list endpoint
│           ├── audits/[id]/route.js    # Audit status polling endpoint
│           ├── clients/route.js        # Client management endpoint
│           ├── cron/route.js           # Cron trigger route
│           └── reports/[id]/route.js   # PDF report file stream
├── prisma/
│   └── schema.prisma                   # PostgreSQL schema definition
├── public/
│   └── reports/                        # Compiled PDF reports
├── .env.example
├── package.json
└── README.md
```

---

## Setup & Installation

### Requirements
- Node.js 18.x or 20.x
- npm 9.x or later

### 1. Clone & Install Dependencies
```bash
git clone <repository-url>
cd Edgelink_ai-developer
npm install
```

### 2. Environment Configuration
Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

Key environment variables:
- `USE_MOCKS`: Set to `true` (default) to run on mock data without external API costs, or `false` to enable live external APIs.
- `DATABASE_URL`: PostgreSQL connection string (Supabase or Neon).
- `UPSTASH_REDIS_URL` / `REDIS_URL`: Redis connection string for BullMQ.
- `ANTHROPIC_API_KEY`: Anthropic API key for Claude 3.5 Sonnet queries.
- `PORT`: Development server port (default `3000`).

### 3. Database Migration
To sync the Prisma schema with Supabase or Neon:
```bash
npx prisma generate
npx prisma db push
```

### 4. Running the Development Server
```bash
npm run dev
```

Access the interfaces:
- Portal Home: `http://localhost:3000`
- Admin Portal: `http://localhost:3000/admin`
- Client Dashboard: `http://localhost:3000/client`

---

## Running the Pipeline

### Via the Admin Portal UI
1. Navigate to `http://localhost:3000/admin`.
2. Select a client or enter a website URL (default: `https://example-dental-clinic.com`).
3. Click **Run Full Audit Pipeline**.
4. The BullMQ worker executes each step sequentially, updating the progress bar and checklist in real time.
5. On completion, click **Download PDF** to inspect the report or navigate to the Client Dashboard.

### Via Command-Line Interface
To test the pipeline directly from the terminal:
```bash
npm run audit:cli
```

### Standalone BullMQ Worker
When using an external Redis instance:
```bash
npm run worker
```

---

## Submission Details

- **Target Position**: AI Developer & Automation Engineer
- **Recipient**: hr@edgelinktechnology.com
- **Subject**: Technical Assessment - AI Developer - [Your Full Name]
- **Deliverables**:
  1. GitHub repository URL (including all source code, README.md, and .env.example).
  2. 3 to 5-minute screen recording demonstrating:
     - Job enqueue in BullMQ
     - Real-time progress updates in the Admin Portal
     - Claude JSON response structure
     - Database persistence
     - Generated PDF report download
