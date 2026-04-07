# G-Net Construction Dashboard — Build Brief

## Company

- **Name:** G-Net Construction Corp.
- **Contact:** Vincent S. Nativo, RA, AIA, LEED-AP (Principal)
- **Size:** 62 employees | $15–30M revenue
- **Type:** Multi-sector NYC general contractor

## Problem

G-Net runs 7 service lines simultaneously — hospital renovations, school projects, tenant improvements, flood restoration, and facility maintenance. Each has different client types, compliance requirements, and reporting cadences. Vincent personally manages permit and plan review as the licensed architect. Everything is tracked manually (or in a single spreadsheet). Emergency flood/fire jobs compete with scheduled projects for attention. The 65-year family business has deeply embedded manual patterns.

**Market signal:** At NYC Build 2026 (March 18–19), Turner Construction and Mancini Duffy confirmed: AI adoption in construction is held back by data quality and workflow integration gaps — not tool availability. Turner is already building custom Claude tools for schedule analysis. This is the gap G-Net needs filled.

## Solution: Construction Dashboard

A unified pipeline view that:
1. **Classifies each job by type** — hospital / school / tenant improvement / flood / maintenance / commercial
2. **Tags compliance requirements per job type** — automatically identifies which DOH, DOE, DOB, DEP, FDNY flags are active
3. **Tracks permit status** — Vincent's permits with expiry and next-action dates
4. **Detects stalled work** — flags jobs where % hasn't moved in 2+ updates
5. **Routes client reports by cadence** — daily (flood), weekly (hospital), bi-weekly (school), per-milestone (TI)
6. **Alerts Vincent on blocked/stalled/permit-triggering events** — so he can act before delays compound

## Architecture

```
Foreman Update (webhook)
    ↓
n8n Workflow
    ├── AI classification (job type + compliance flags + stalled detection)
    ├── Google Sheets (Job Log + Compliance Log + Pipeline)
    ├── Gmail (client reports + Vincent alerts)
    ↓
Next.js Dashboard ← reads Google Sheets
    ├── Pipeline board by job type + status
    ├── Stalled work panel
    ├── Compliance calendar
    └── Permit tracker (Vincent's view)
```

## Job Types (G-Net specific)

| Type | Client Examples | Compliance | Reporting |
|---|---|---|---|
| Hospital Renovation | Mount Sinai, NYU Langone | DOH, HIPAA zone, ICRA | Weekly |
| School Project | NYC DOE / SCA contracts | NYC DOE, SCA co-approval | Bi-weekly |
| Tenant Improvement | Law offices, retail | DOB, fire alarm, accessibility | Per milestone |
| Flood Restoration | Residential + commercial | Insurance docs, mold protocol, FDNY | Daily |
| Facility Maintenance | The Enclave (12 bldgs) | LL97, NFPA 110 | Monthly |
| Commercial Renovation | Office buildings | DOB, DEP, FDNY | Per milestone |

## Build Status

- [x] Enhanced n8n workflow (multi-type classification + compliance + stalled detection + owner alerts)
- [x] T2 reusable template
- [x] G-Net mock data (10 realistic jobs)
- [x] Next.js dashboard frontend (demo-ready with mock data)
- [ ] Google Sheets connection (requires Vincent's sheet credentials)
- [ ] Deploy to G-Net n8n instance
- [ ] Dashboard deployment (Vercel)

## Next Steps

1. Share this prototype with Vincent as a demo
2. Get Vincent's Google Sheet structure (or create one for him)
3. Configure the template with Vincent's credentials
4. Deploy to G-Net's n8n instance
5. Deploy dashboard to Vercel with Vincent's sheet API key
