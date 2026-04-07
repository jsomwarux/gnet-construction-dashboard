# Construction Dashboard Template — Configuration Guide

## Overview

The `construction-dashboard-template.json` is a T2 reusable template for multi-type construction GCs. It replaces the basic `construction-job-tracker.json` with: job-type classification, per-type compliance tagging, stalled work detection, permit alerts, and Vincent-style owner alerts.

## Config Map

| Field | Placeholder | Replace With |
|---|---|---|
| Anthropic API key | `sk-ant-CONFIGURE-YOUR-ANTHROPIC-KEY-HERE` | Your Anthropic API key |
| Job Log Sheet ID | `CONFIGURE-SHEET-ID` | Google Sheet ID for Job Log + Compliance Log |
| Pipeline Sheet ID | `CONFIGURE-PIPELINE-SHEET-ID` | Separate pipeline tracking sheet (can be same as Job Log) |
| Webhook path (foreman) | `CONFIGURE-PATH` | e.g., `acme-construction-updates` |
| Webhook ID (foreman) | `CONFIGURE-WEBHOOK-ID` | Unique ID for foreman webhook |
| Webhook path (new job) | `CONFIGURE-PATH-NEW` | e.g., `acme-new-job` |
| Webhook ID (new job) | `CONFIGURE-WEBHOOK-ID-NEW` | Unique ID for new job webhook |
| Client email | `CONFIGURE-CLIENT-EMAIL` | Default client email (overridden per job from pipeline sheet) |
| Owner email | `CONFIGURE-OWNER-EMAIL` | Owner/PM email (Vincent or equivalent) |
| Gmail OAuth | `CONFIGURE_ME` | Your n8n Gmail credential |
| Google Sheets OAuth | `CONFIGURE_ME` | Your n8n Google Sheets credential |

## Google Sheet Setup

Create a Google Sheet with these tabs:

### Tab 1: "Job Log"
Headers: `Date | Job ID | Job Site | Job Type | Foreman | Percent Complete | Status | Status Emoji | Foreman Summary | Client Summary | Blockers | Compliance Flags | Permit Alert | Stalled | Next Milestone | Client Notified | Owner Alert | Photo URL`

### Tab 2: "Compliance Log"
Headers: `Date | Job ID | Job Site | Job Type | Compliance Flag | Status | Reported`

### Tab 3: "Pipeline"
Headers: `Job ID | Job Site | Job Type | Client | Foreman | Contract Value | Start Date | Target End Date | Permit Status | Permits Required | Compliance Tags | Reporting Cadence | Client Email | Vincent Alert | Current Status | Percent Complete`

## Test Commands

```bash
# Foreman update
curl -X POST http://localhost:5678/webhook/YOUR-PATH \
  -H "Content-Type: application/json" \
  -d '{
    "job_id": "JOB-2026-001",
    "job_site": "123 Main St — Hospital TI",
    "foreman_name": "Carlos Ruiz",
    "percent_complete": 62,
    "foreman_note": "Drywall complete. MEP rough-in in progress. Negative pressure maintained.",
    "blockers": "",
    "photo_url": ""
  }'

# New job creation
curl -X POST http://localhost:5678/webhook/YOUR-PATH-NEW \
  -H "Content-Type: application/json" \
  -d '{
    "job_id": "JOB-2026-015",
    "job_site": "456 Broadway — Retail TI",
    "client": "Riverside Medical",
    "foreman": "Tony Messina",
    "start_date": "2026-04-15"
  }'
```

## Job Type → Compliance Mapping

| Job Type | Compliance Flags (auto-tagged) | Permit Types | Reporting |
|---|---|---|---|
| hospital | DOH Hospital Construction, HIPAA Zone, ICRA Negative Pressure | DOB + DOH | Weekly |
| school | NYC DOE Approval, School Safety Plan, Lead Paint Assessment | SCA + DOB | Bi-weekly |
| tenant_improvement | NYC Building Code, Fire Alarm, Accessibility Review | DOB | Per milestone |
| flood_restoration | Insurance Documentation, Mold Protocol, FDNY Report | Emergency permit | Daily |
| maintenance | Contract Scope, LL97 | None | Monthly |
| commercial | DOB, DEP, FDNY | DOB + DEP | Per milestone |

## Owner Alert Triggers

Vincent (or equivalent owner/PM) is alerted when:
1. **Status = blocked** — explicit blocker reported by foreman
2. **Stalled = yes** — % hasn't moved >5pts in 2 consecutive updates
3. **Permit alert = yes** — DOB/DOH/DEP/FDNY action typically needed this period

## Vincent Alert on New Jobs

For hospital, school, or flood restoration jobs: Vincent is automatically alerted when a new job is added to the pipeline.
