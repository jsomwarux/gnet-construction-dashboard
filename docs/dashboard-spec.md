# G-Net Construction Dashboard — UI/UX Specification

## 1. Overview

**What it is:** An AI-powered construction project tracking dashboard for G-Net, a multi-type NYC general contractor. It aggregates job status across hospital, school, tenant improvement, flood restoration, maintenance, and commercial project types.

**Purpose:** Give the G-Net team — and their owner Vincent — a single real-time view of every active job's health, blockers, and upcoming milestones without needing to open a spreadsheet.

---

## 2. Stats Row (KPI Cards)

Five cards in a responsive grid (2 cols mobile → 5 cols desktop):

| Card | Icon | Trigger |
|------|------|---------|
| Active Jobs | 🏗️ | Always shown |
| Blocked | 🔴 | Red background + border when count > 0 |
| At Risk | 🟠 | Orange background + border when count > 0 |
| Stalled | ⚠️ | Orange background + border when count > 0 |
| Permit Alerts | 📋 | Blue or red tint when count > 0 |

---

## 3. Pipeline by Job Type Grid

Six job type cards in a responsive grid (2 → 3 → 6 cols):

| Job Type | Color | Label |
|----------|-------|-------|
| `hospital` | Blue (`bg-blue-50 border-blue-300`) | Hospital |
| `school` | Purple (`bg-purple-50 border-purple-300`) | School |
| `tenant_improvement` | Teal (`bg-teal-50 border-teal-300`) | Tenant Improvement |
| `flood_restoration` | Yellow (`bg-yellow-50 border-yellow-400`) | Flood Restoration |
| `maintenance` | Gray (`bg-gray-50 border-gray-300`) | Maintenance |
| `commercial` | Orange (`bg-orange-50 border-orange-300`) | Commercial |

Each card shows the job count for that type (sourced from Pipeline sheet).

---

## 4. Alerts Panel

**Visibility:** Only shown when `blocked > 0 || stalled > 0 || permitAlerts > 0`.

Shows all jobs flagged with one of the following:
- `status === 'BLOCKED'` → red border + "Blocked: [reason]" text
- `stalled === 'yes'` → orange "⚠️ Stalled — no progress since last update"
- `permitAlert === 'yes'` → blue "📋 Permit action needed"

Each alert card shows: job site, job type badge, status emoji, and the relevant alert text.

---

## 5. Active Pipeline List

All non-completed jobs sorted by urgency (BLOCKED first, then AT_RISK, then ON_TRACK).

### Job Card Anatomy

```
┌─────────────────────────────────────────────────────────┐
│ [Job Site Name]  [Job Type Badge]  [Foreman]     [emoji]│
│ [Foreman/Client Summary or Next Milestone]              │
│ [███████░░░░] 72%  Next: [Next Milestone]      [Job ID] │
└─────────────────────────────────────────────────────────┘
```

**Fields per card:**
- **Job site** — bold text, primary identifier
- **Job type badge** — small pill, color-coded by type
- **Foreman** — gray text, right below job site
- **Progress bar** — blue fill, capped at 100%, next to percentage
- **Next milestone** — gray text, shows what's coming up
- **Status emoji** — 🟢 (on track) 🟠 (at risk) 🔴 (blocked)

---

## 6. Color System

### Status Colors
| Status | Background | Border | Text |
|--------|------------|--------|------|
| `BLOCKED` | `bg-red-100` | `border-red-400` | `text-red-900` |
| `AT_RISK` | `bg-orange-100` | `border-orange-400` | `text-orange-900` |
| `ON_TRACK` | `bg-green-100` | `border-green-400` | `text-green-900` |

### Job Type Colors
See Section 3 above.

---

## 7. Demo Mode

**Trigger:** No `GNET_SHEET_ID` or `GOOGLE_SHEETS_API_KEY` env vars set.

**Behavior:**
- Shows an amber banner: "⚠️ Demo mode — showing sample data."
- Renders with 6 hardcoded sample jobs across all job types
- Includes one blocked job (flood restoration), one at-risk (school), one stalled (school)
- Mimics the exact structure of live data so the layout is identical

---

## 8. Mobile Considerations

- Stats row: 2-column grid on mobile → 5 columns on desktop
- Pipeline grid: 2 → 3 → 6 columns as viewport grows
- Job cards: stack naturally, flex-wrap for badges
- Alert panel: full-width, scrollable if many alerts
- No horizontal scroll anywhere

---

## 9. Future Enhancements

### Permit Tracker Tab
Separate tab showing all open permit statuses per job, pulled from the Pipeline sheet `permitStatus` field. Shows: job site, permit type, issue date, expiry, and whether it's overdue.

### Compliance Calendar
Calendar view of upcoming compliance deadlines (inspections, renewals, flag reviews) from the Compliance Log sheet. Color-coded by job type.

### Report History
Full changelog of all Job Log updates — every status change, blocker addition, milestone completion — with timestamps and who submitted the update (foreman vs. owner).

### Job Detail Modal
Click a job card → slide-over modal showing full history, all notes, compliance flags, and photo thumbnails for that job.

### Client Portal View
Read-only view for clients showing only their jobs with simplified status. Accessed via a separate URL with a client-specific token.
