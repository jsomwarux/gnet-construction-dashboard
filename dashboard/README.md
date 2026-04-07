# G-Net Construction Dashboard

AI-powered multi-type construction project tracker for G-Net NYC.

## Quick Start

```bash
cd dashboard
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Demo Mode

Runs out of the box with no configuration. Shows 6 sample jobs across hospital, school, tenant improvement, flood restoration, and maintenance project types.

To switch to live data, see [Google Sheets Setup](#google-sheets-setup) below.

## Google Sheets Setup

### What to Create

Create a Google Spreadsheet (or spreadsheets) with these tabs:

**1. Job Log** — one row per job update (append-only log)

| Column | Field |
|--------|-------|
| A | Date |
| B | Job ID |
| C | Job Site |
| D | Job Type (`hospital`, `school`, `tenant_improvement`, `flood_restoration`, `maintenance`, `commercial`) |
| E | Foreman |
| F | % Complete (number) |
| G | Status (`ON_TRACK`, `AT_RISK`, `BLOCKED`) |
| H | Status Emoji (`🟢`, `🟠`, `🔴`) |
| I | Foreman Summary |
| J | Client Summary |
| K | Blockers |
| L | Compliance Flags (comma-separated) |
| M | Permit Alert (`yes`/`no`) |
| N | Stalled (`yes`/`no`) |
| O | Next Milestone |
| P | Client Notified (`yes`/`no`) |
| Q | Owner Alert |
| R | Photo URL |

**2. Pipeline** (optional — for job type counts) — one row per job

| Column | Field |
|--------|-------|
| A | Job ID |
| B | Job Site |
| C | Job Type |
| D | Client |
| E | Foreman |
| F | Contract Value |
| G | Start Date |
| H | Target End Date |
| I | Permit Status |
| J | Permits Required (comma-separated) |
| K | Compliance Tags |
| L | Reporting Cadence |
| M | Client Email |
| N | Vincent Alert |
| O | Current Status |
| P | % Complete |

**3. Compliance Log** (optional — for compliance calendar)

| Column | Field |
|--------|-------|
| A | Date |
| B | Job ID |
| C | Job Site |
| D | Job Type |
| E | Compliance Flag |
| F | Status |
| G | Reported |

### Environment Variables

Copy `.env.local.example` to `.env.local` and fill in:

```bash
GNET_SHEET_ID=your_job_log_spreadsheet_id
GNET_PIPELINE_SHEET_ID=your_pipeline_spreadsheet_id  # optional
GOOGLE_SHEETS_API_KEY=your_api_key
```

Find your Spreadsheet ID in the URL: `docs.google.com/spreadsheets/d/[THIS-PART]/edit`

For the API key, create one at [console.cloud.google.com](https://console.cloud.google.com) with the **Sheets API** enabled (or use a Service Account key for production).

## Tech Stack

- **Next.js 15** (App Router, Server Components)
- **React 18**
- **Tailwind CSS v4**
- **Google Sheets API v4**
- **n8n** for data ingestion automation
