# G-Net Construction — Workflow Documentation

## What This Workflow Does

An AI-powered multi-type job tracker for G-Net Construction Corp. Foreman updates are submitted via webhook, classified by job type using Claude, tagged with compliance flags per NYC construction requirements, logged to Google Sheets, and used to generate client reports and Vincent alerts — automatically.

## Triggers

**Trigger 1 — Foreman Update** (`POST /webhook/gnet-foreman-update`)
Foremen submit daily progress updates. Any format: direct JSON, Tally form output, Typeform, or custom app.

**Trigger 2 — New Job Created** (`POST /webhook/gnet-new-job`)
When a new project is added to the pipeline. AI classifies job type and compliance requirements.

## Step-by-Step Flow

### Foreman Update Path
1. **Webhook** receives foreman update (job site, %, blockers, notes, photo)
2. **Parse Foreman Update** normalizes all input formats (Tally, Typeform, direct JSON)
3. **AI Classify Job** (Claude) — determines job type, status (on_track/at_risk/blocked), compliance flags, permit alert, stalled detection, client summary, next milestone
4. **Build Canonical Record** — assembles all downstream data including email content
5. **Prep Job Log Row** → **Append Job Log** (Google Sheets)
6. **Prep Compliance Row** → **Append Compliance Log** (Google Sheets) — only if flags exist
7. **Prep Client Email** → **Send Client Report** (Gmail) — cadence based on job type
8. **Alert Needed?** — IF blocked OR stalled OR permit alert → Vincent alert path
9. **Dashboard Summary** — webhook response with full job status

### New Job Path
1. **Webhook** receives new job data
2. **Parse New Job Data** normalizes fields
3. **AI Classify New Job** (Claude) — job type, compliance tags, permits required, reporting cadence, Vincent alert flag
4. **Build New Job Record** assembles pipeline data
5. **Prep Pipeline Row** → **Add to Pipeline** (Google Sheets Pipeline tab)
6. **Vincent Alert?** — IF hospital/school/flood → Vincent notified via Gmail

## Inputs

**Foreman Update Fields:**
```json
{
  "job_id": "JOB-2026-001",
  "job_site": "Mount Sinai West — 5th Floor TI",
  "foreman_name": "Carlos Ruiz",
  "percent_complete": 62,
  "foreman_note": "Drywall complete. MEP rough-in in progress.",
  "blockers": "",
  "photo_url": "https://..."
}
```

**New Job Fields:**
```json
{
  "job_id": "JOB-2026-015",
  "job_site": "456 Broadway — Retail TI",
  "client": "Riverside Medical",
  "foreman": "Tony Messina",
  "start_date": "2026-04-15",
  "contract_value": "$450,000"
}
```

## Outputs

- **Google Sheets:** Job Log row, Compliance Log rows (if flags), Pipeline row (new jobs)
- **Gmail:** Client progress report (per job type cadence)
- **Gmail:** Vincent owner alert (blocked / stalled / permit alert / new hospital-school-flood job)
- **Webhook response:** JSON with full job status for dashboard consumption

## Integrations

- **Anthropic (Claude Sonnet):** Job classification, status determination, compliance flagging, stalled work detection, client and owner summary generation
- **Google Sheets:** Master job log + compliance log + pipeline tracker
- **Gmail:** Client progress reports + Vincent owner alerts

## Demo Test Command

```bash
curl -X POST http://localhost:5678/webhook/gnet-foreman-update \
  -H "Content-Type: application/json" \
  -d '{
    "job_id": "JOB-2026-001",
    "job_site": "Mount Sinai West — 5th Floor TI",
    "foreman_name": "Carlos Ruiz",
    "percent_complete": 62,
    "foreman_note": "Drywall framing complete. Medical gas pipe rough-in in progress. Negative pressure maintained. HVAC balancing scheduled for next week.",
    "blockers": "",
    "photo_url": ""
  }'
```

```bash
curl -X POST http://localhost:5678/webhook/gnet-new-job \
  -H "Content-Type: application/json" \
  -d '{
    "job_id": "JOB-2026-015",
    "job_site": "456 Broadway — 3rd Floor Medical Office TI",
    "client": "Brooklyn Medical Group",
    "foreman": "Tony Messina",
    "start_date": "2026-04-20",
    "contract_value": "$380,000"
  }'
```

## Credentials Needed Before Deploy

- **Anthropic API key:** `sk-ant-...` — for Claude classification
- **Google Sheets OAuth2:** n8n credential named "Google Sheets account"
- **Gmail OAuth2:** n8n credential named "Gmail account"
- **Sheet IDs:** Job Log sheet ID + Pipeline sheet ID (Vincent's Google Sheets)

## Open Questions / Assumptions

1. Vincent may not have an existing Google Sheet — may need to create one with the required tabs
2. Client email routing per job type — currently mapped by job type; ideally look up from Pipeline sheet in future iteration
3. No existing project management software (Procore, Buildertrend, etc.) — Google Sheets is the system of record
4. Foreman update frequency assumption: daily for active sites, weekly for maintenance contracts
5. Flood restoration jobs: currently uses generic compliance tags — could be enhanced with insurer-specific documentation requirements
