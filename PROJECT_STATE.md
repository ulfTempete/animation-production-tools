# Animation Production System — Project State

## Overview
Production tracking system for Innit Productions. Initially built for a 30-video animation project, designed as a reusable system for all future projects.

**GitHub repo:** https://github.com/ulfTempete/animation-production-tools  
**Notion workspace:** Innit Productions  
**Local tools:** ~/notion-production-system/start.sh (runs CORS proxy on localhost:8080)

---

## Notion Databases (all prefixed APS)

### IPS Content
Core database. Episodes, Sequences and Shots all live here — differentiated by the Level field.

**Properties:**
- Name (title)
- Level (select: Episode, Sequence, Shot)
- Parent (relation to same database — for hierarchy)
- Status (select: Not Started, Ready to Start, In Progress, Pending Review, Approved, On Hold, Omitted, Delivered)
- Status Note (rich text — short context note explaining the status when needed)
- Storyboard Status (select: same options as Status minus Delivered)
- Style Frames Status (select: same)
- Animation Status (select: same)
- Post Status (select: same)
- Assignee (people)
- Due Date (date)
- Description (rich text)
- Frame.io Link (url)
- Tasks (reverse relation from IPS Tasks)
- Notes (reverse relation from IPS Notes)
- Project (reverse relation from IPS Projects)
- Open Tasks (rollup — count of linked tasks not Done or Approved)
- Task Progress (rollup — average Progress % across linked tasks)
- Is Episode (formula — hidden helper for rollups)
- Open Tasks Count (formula — hidden helper for rollups)

**Views set up:**
- Default view (table)
- All Episodes (Level = Episode)
- All Shots (Level = Shot)
- In Progress (Status = In Progress)
- Pending Review (Status = Pending Review)
- At Risk (Status = On Hold)

### IPS Tasks
**Properties:**
- Name (title)
- Type (select: Standard, Revision Round, Approval)
- Status (select: Not Started, In Progress, Pending Review, Approved, On Hold, Done)
- Assignee (people)
- Due Date (date)
- Description (rich text)
- Content (relation to IPS Content)
- Parent Task (relation to same database — for subtasks)
- Progress (number, percentage — used for revision round completion)
- Is Open Task (formula — hidden helper)

**Views set up:**
- Default view (table)
- All Tasks
- My Tasks (Assignee = me)
- Revision Rounds (Type = Revision Round)

### IPS Notes
**Properties:**
- Name (title)
- Author (people)
- Date (date)
- Body (rich text)
- Content (relation to IPS Content)

### IPS Projects
**Properties:**
- Name (title)
- Status (select: Active, On Hold, Complete, Archived)
- Frame.io Link (url)
- Revision Allowance (number — agreed revision rounds)
- Revisions Used (number — rounds used so far)
- Total Videos (rollup — count of linked Episodes)
- Total Open Tasks (rollup — sum of open tasks across linked content)
- Videos (relation to IPS Content)
- Brief, Client Contacts, Key Dates, Instructions, Links (rich text — hidden from properties, used in page body)

**Template:** "New Project" template set as default — includes page body with Client Contacts, Brief, Key Dates, Instructions, Links headings plus linked Videos view.

**Test data:** "30 Video Animation Project" record exists with Episodes linked.

---

## Client-Facing Tools

### frameio-to-notion.html
Frame.io CSV converter. Drag-and-drop CSV, preview comments with replies nested, select episode, create Revision Round task in IPS Tasks.  
- Runs locally via start.sh (CORS proxy on localhost:8080)
- Timecodes shown as H3 headings, comments as checkbox items, replies with ↳

### client-feedback.html
Client feedback form. Clients submit timecoded feedback without logging in.  
- URL params: ?video=EpisodeName&project=ProjectName&contentId=NOTION_PAGE_ID
- Timecode auto-formats as digits are typed
- Save button: stores to localStorage + offers mailto link to resume on another device
- Review step before submission
- Submits to IPS Tasks as Revision Round task via Cloudflare Worker
- Innit branding applied (orange #E8511A, charcoal #1A1A1A, logo embedded as base64)
- Mobile responsive

### notion-proxy.js (Cloudflare Worker)
Proxies Notion API calls from client-feedback.html. NOTION_API_KEY stored as secret.  
**Status: NOT YET DEPLOYED** — WORKER_URL placeholder still in client-feedback.html

---

## Key Design Decisions
- Single IPS Content database with Level field (not separate databases per level)
- Per-stage status columns inspired by ShotGrid pipeline step view
- Eight-value status list — "Ready to Start" distinguishes clear-to-begin from waiting; "Omitted" for cut shots
- Status Note field for context when status alone isn't enough
- Task Type field (Standard / Revision Round / Approval) enables reporting on revision round count
- Built fresh rather than inheriting Ultimate Brain complexity — borrowed only the Parent Task / Sub-Tasks relation pattern
- IPS prefix keeps production databases distinct in the workspace
- Innit branding: orange #E8511A, charcoal #1A1A1A

---

## Database IDs
- IPS Tasks: 33119ff7-94ee-817a-b249-ccca6d2df580
- IPS Content: 33119ff7-94ee-8110-8df4-fbc98620bf45

---

## Outstanding Items
1. **Deploy Cloudflare Worker** — notion-proxy.js is written, needs deploying at cloudflare.com, then WORKER_URL updated in client-feedback.html
2. **End-to-end test** of client feedback form once Worker is live
3. **Notion views** — column visibility not yet optimised in most views
4. **Episode template** — new Episode records don't yet have a standard page layout with embedded Tasks/Notes views (Notion API can't create views; needs manual setup)
5. **Team presentation** — system not yet shown to team; being tested by Ulf first
6. **Image attachments** in client feedback form — deferred, build if clients request it

---

## Session Log
- Session 1 (29-30 Mar): Designed system architecture, built all four Notion databases via API, built Frame.io CSV converter, built client feedback form, pushed all tools to GitHub
- Session 2 (31 Mar): Deployed Cloudflare Worker, fixed client feedback form (logo removed, comment field fixed to textarea, timecode auto-pad on blur, instructions updated), tested form end to end — feedback appears correctly in IPS Tasks

---

## Session 2 additions (31 Mar)

### Dashboards built
- IPS Home — Active Projects, In Progress, Pending Review sections
- IPS Dashboard — Projects — Active, On Hold, Completed, Archived views
- IPS Dashboard — Videos — All Videos, Episodes Only, In Progress, Pending Review, At Risk views
- IPS Dashboard — Tasks — All Tasks, My Tasks, Revision Rounds, Not Started views

### Navigation
- Callout nav block on all four dashboard pages: IPS Home | Projects | Videos | Tasks

### Icon & colour system
- Home: house, orange
- Projects: folder, blue
- Videos: film grid, green
- Tasks: checklist, purple
- Databases: stack, red (all DB pages)

### Naming
- Databases renamed from APS to IPS prefix
- Databases suffixed with "DB" (e.g. IPS Tasks DB)
- Databases moved into "Innit Databases" page inside "Innit Production System"

### Still to do
- Admin nav at bottom of IPS Home (links to Innit Databases)
- Record-level icons (purple for tasks, colour by level for content)
- Naming convention for content records (flag when real data entry begins)
- Label colour consistency (flag same time)
- Delete test data and enter real project data
- Link Broader Impacts episodes to Broader Impacts project record
- Review where templates should be used (content records, task types, project pages)
