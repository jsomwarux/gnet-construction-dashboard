# Construction Dashboard Agent — SPEC

## What This Is

An AI-powered construction project management dashboard built for multi-type GCs like G-Net Construction Corp. — GCs running hospital renovations, school projects, tenant improvements, flood restoration, and facility maintenance simultaneously, each with different compliance requirements and client reporting cadences.

**Market signal:** NYC Build 2026 (March 18–19) — construction executives confirmed AI data integration is the bottleneck, not tool availability. Turner Construction already building custom Claude-powered schedule analysis tools. The gap: no off-the-shelf solution handles multi-type compliance classification + stalled work detection + client-type reporting in one pipeline.

## Architecture

```
Foreman Update (Webhook)
    ↓
n8n Workflow (this agent)
    ├── AI Classification (Claude) → job type + compliance flags
    ├── Permit Status Tracker (Vincent's RA workflow)
    ├── Stalled Work Detector (schedule compare)
    ├── Google Sheets (master job log + compliance log)
    ├── Client-Type Report Generator (per job type cadence)
    └── Owner Alert (blocked jobs → Vincent)
    ↓
Next.js Dashboard ← reads Google Sheets
    ├── Pipeline Board (all jobs by type + status)
    ├── Stalled Work Panel (at_risk + blocked)
    ├── Compliance Tracker (per job type)
    └── Client Report History
```

## File Structure

```
construction-dashboard-agent/
├── CLAUDE.md              ← this file
├── workflows/
│   ├── gnet-construction-dashboard.json   ← G-Net specific build
│   └── construction-dashboard-template.json ← T2 reusable template
├── mock_data/
│   └── gnet-jobs.json     ← G-Net realistic job data
├── dashboard/
│   ├── app/page.tsx        ← dashboard UI
│   ├── components/         ← dashboard components
│   └── lib/sheets.ts       ← Google Sheets API client
└── docs/
    ├── gnet-brief.md       ← G-Net build spec
    └── dashboard-spec.md   ← UI/UX spec
```

## G-Net Specifics (from brief.json)

| Field | Value |
|---|---|
| Company | G-Net Construction Corp. |
| Contact | Vincent S. Nativo, RA, AIA, LEED-AP (Principal) |
| Employees | 62 |
| Revenue | $15–30M |
| Job Types | Hospital, School, Tenant Improvement, Flood Restoration, Facility Maintenance |
| Key Pain | 7 service lines × different compliance reqs × one manual tracking system |
| Critical Feature | Vincent personally tracks permits — needs permit status in dashboard |

## Job Types → Compliance Mapping

| Job Type | Client Reporting Cadence | Compliance Tags | Report Recipients |
|---|---|---|---|
| Hospital Renovation | Weekly + incident | DOH compliance, HIPAA adjacent, infection control | Hospital facilities director |
| School Project | Bi-weekly + milestone | NYC DOE approval, safety clearances | School admin, DOE liaison |
| Tenant Improvement | Per milestone | Local permits, DOB sign-offs | Landlord/property manager |
| Flood Restoration | Daily + emergency | Insurance documentation, rapid permit | Insurance adjuster, property owner |
| Facility Maintenance | Monthly schedule | Contract scope verification | Property manager |
| Commercial Renovation | Per milestone | DOB, DEP, FDNY approvals | Property owner, tenant |

## AI Classification Prompt (Claude)

Each foreman update is classified with:
1. **Job Type** — hospital / school / tenant-improv / flood / maintenance / commercial
2. **Status** — on_track / at_risk / blocked
3. **Compliance Flags** — which compliance items are triggered this week
4. **Permit Alert** — if this job type + week combination typically needs permit action
5. **Client Summary** — plain English for property owner (no internal jargon)
6. **Stalled Detection** — if % hasn't moved >5pts in 2 updates, flag at_risk

## Dashboard Components

1. **Pipeline Board** — Kanban-style by job type, colored by status
2. **Stalled Work Panel** — jobs with no % movement or explicit blocker
3. **Compliance Calendar** — upcoming compliance deadlines by job type
4. **Report History** — last sent client reports by job
5. **Permit Tracker** — Vincent's permits (DOB, DEP, DOH) with status + expiry
6. **Weekly Digest** — automated summary emailed to Vincent every Friday

## Integration Points

- **Webhook:** `POST /webhook/gnet-foreman-update` — foreman submits daily update
- **Google Sheets:** Job Log (master) + Compliance Log + Permit Tracker sheets
- **Gmail:** Client reports sent on cadence + owner alerts for blocked jobs
- **Dashboard:** Next.js reads Sheets via Service Account OAuth

## Build Status

- [x] CLAUDE.md (this file)
- [ ] workflows/gnet-construction-dashboard.json
- [ ] workflows/construction-dashboard-template.json
- [ ] mock_data/gnet-jobs.json
- [ ] dashboard/ (Next.js — Phase 2)
- [ ] docs/gnet-brief.md
- [ ] docs/dashboard-spec.md
