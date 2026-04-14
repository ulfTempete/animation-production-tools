## RULES
- Check first, then answer. Verify ALL factual claims against primary sources before responding — plan requirements, feature availability, UI behaviour, API capabilities. No exceptions.

---

# Animation Production System — Project State (IPS v1.0)

---

## ⚠️ RULES — READ BEFORE EVERY SESSION

These rules exist because of repeated mistakes. Follow them without exception.

### Notion API limitations
The Notion API **cannot** do any of the following — never suggest it for these:
- Set page layouts (Tabbed, pinned properties, hidden properties)
- Create or configure views (filters, sorts, grouping, property visibility)
- Set label colours on select fields
- Set icons or cover images on database pages
- Apply templates to existing records

**All UI and layout work must be done manually in Notion.**

### Notion UI — check before advising
Never advise on Notion UI behaviour from memory. If uncertain about how any Notion feature works — list view properties, conditional visibility, filter options, date fields, layout options, anything — **search the Notion help docs before answering.** Guessing wastes the user's time.

### Known Notion constraints (confirmed)
- **List view:** properties do display inline at the far right, but only if they contain data. Empty fields won't show. Confirm data exists before troubleshooting visibility.
- **Conditional property visibility:** not possible in Notion. Properties cannot be shown/hidden based on the value of another field.
- **Date vs Created Time:** Date is a manually entered field. Created Time is an automatic system property. These are different — do not conflate them.
- **Layout order:** always set Tabbed structure first, then pin properties, then set visibility. Confirm this order before walking through steps.
- **Page body content:** rich text body content (e.g. Notes Body field) is never visible inline in any database view type. Users must click to open the record.

### Note types — exact values
The IPS Notes DB Type field has exactly these five options:
**General, Brief, Meeting, Directive, Asset**
There is no "Notice" type. Directives are Type = Directive.

### Communication
- User has ADHD — deliver information one step at a time, not in long lists
- Do not suggest steps or options without being confident they are correct
- If something needs to be looked up first, say so and look it up before proceeding

### End of session — CC update routine
At the end of every session:
1. Compile all changes made during the session
2. User opens Claude Code in Terminal: `cd /Users/olesturm/animation-production-tools` then `claude`
3. Instruct Claude Code to update `project_state.md` with the session notes
4. Claude Code commits and pushes to GitHub

---

## Overview
Production tracking system for Innit Productions. Initially built for a 30-video animation project, designed as a reusable system for all future projects.

**GitHub repo:** https://github.com/ulfTempete/animation-production-tools  
**Notion workspace:** Innit Productions  
**Local tools:** ~/notion-production-system/start.sh (runs CORS proxy on localhost:8080)

---

## Notion Databases

### IPS Video Elements DB
*(Renamed from IPS Content DB in Session 10)*
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
- Screenshot (Files & Media)
- Tasks (reverse relation from IPS Tasks)
- Notes (reverse relation from IPS Notes)
- Project (reverse relation from IPS Projects)
- Open Tasks (rollup — count of linked tasks not Done or Approved)
- Task Progress (rollup — average Progress % across linked tasks)
- Is Episode (formula — hidden helper for rollups)
- Open Tasks Count (formula — hidden helper for rollups)

**Layout:**
- Structure: Tabbed
- Pinned: Status, Level, Assignee, Due Date
- Visible: Animation Status, Description, Frame.io Link, Open Tasks, Parent, Post Status, Screenshot, Start Date, Status Note, Storyboard Status, Style Frames Status
- Hidden: Is Episode, Open Tasks Count, Task Progress, Tasks, Project

**Status label colours:**
- Not Started — grey, Ready to Start — blue, In Progress — purple
- Pending Review — yellow, Approved — green, On Hold — red
- Omitted — brown, Delivered — green
- Same colours applied to Storyboard Status, Style Frames Status, Animation Status, Post Status

**Views:**
- Default view (table)
- All Episodes (Level = Episode)
- All Shots (Level = Shot)
- In Progress (Status = In Progress)
- Pending Review (Status = Pending Review)
- At Risk (Status = On Hold)

**Templates:**
- New Episode (created — green film icon, Level = Episode)
- New Sequence — still to create
- New Shot — still to create

---

### IPS Tasks DB
**Properties:**
- Name (title)
- Type (select: Standard, Revision Round, Approval)
- Status (select: Not Started, In Progress, Pending Review, Approved, On Hold, Done)
- Assignee (people)
- Due Date (date)
- Description (rich text)
- Video Elements (relation to IPS Video Elements DB, formerly "Content")
- Parent Task (relation to same database — for subtasks)
- Progress (number, percentage — used for revision round completion)
- Is Open Task (formula — hidden helper)

**Layout:**
- Structure: Tabbed
- Pinned: Status, Type, Assignee, Due Date
- Hidden: Is Open Task

**Views:**
- Default view (table)
- All Tasks
- My Tasks (Assignee = Me) — shows Name, Status, Type, Due Date, Video Elements (configured Session 10)
- Revision Rounds (Type = Revision Round)

**Templates:** Standard, Revision Round, Approval — still to create

---

### IPS Notes DB v2
**Properties:**
- Name (title)
- Type (select: General, Brief, Meeting, Directive, Asset) ← exact values, no others
- Author (people)
- Date (date — manually entered)
- Body (rich text — page content, not visible inline in any view)
- Project (relation to IPS Projects)
- Video Elements (relation to IPS Video Elements DB, formerly "Content")
- URL (url)
- Favourite (checkbox)
- Archived (checkbox)

**Layout:**
- Structure: Tabbed
- Pinned: Type, Project, Date, Author
- Hidden: Archived

**Templates:**
- Meeting: [Date] — Agenda, Meeting Notes, Action Items sections
- Brief — Overview, Key Requirements, References & Links sections
- Notice — Notice, Applies To, Effective From sections
- General — empty

**Views:**
- All Notes
- By Project
- By Episode
- Important Notices (Type = Directive)

---

### IPS Projects DB
**Properties:**
- Name (title)
- Status (select: Active, On Hold, Complete, Archived)
- Video Link (url)
- Revision Allowance (number — agreed revision rounds)
- Revisions Used (number — rounds used so far)
- Total Videos (rollup — count of linked Episodes)
- Total Open Tasks (rollup — sum of open tasks across linked content)
- Videos (relation to IPS Content)
- Brief, Client Contacts, Key Dates, Instructions, Links (rich text — in page body)

**Layout (set Session 8):** Property group moved to panel, page discussions turned off. DB locked.
- Pinned: Status, Owner, Video Link, Total Open Tasks

**Template:** "New Project" template (default) — rebuilt Session 8. Includes:
- NAV toggle (collapsed by default): hyperlinks to Projects Dashboard and Personal Dashboard, block links to Tasks and Notes sections within the page
- Tasks section: linked IPS Tasks DB with List, Board, and Calendar views; filtered to current project; grouped by Status; visible properties: Status, Due Date, Assignee; database title hidden on all views
- Notes section: linked IPS Notes DB with List view; filtered to current project; visible properties: Type, Created Time, Author; database title hidden

**Test data:** "Broader Impacts" project record exists — test data to be deleted before real data entry.

---

## Dashboards

All dashboards use a synced callout nav block. Any update to the nav propagates to all dashboards automatically.

**Nav links:** Home | Projects Dashboard | Videos Dashboard | Tasks Dashboard | Notes Dashboard | Personal Dashboard

### Home (formerly IPS Home)
Producer-level overview. Sections: Active Projects, In Progress, Pending Review.
Note: Consider restricting visibility to producer only (deferred).

### Projects Dashboard
Views: Active, On Hold, Completed, Archived.

### Videos Dashboard
Views: All Videos, Episodes Only, In Progress, Pending Review, At Risk, Visual Overview (gallery — Screenshot as card cover).

### Tasks Dashboard
Views: All Tasks, My Tasks, Revision Rounds, Not Started.

### Notes Dashboard
Views: All Notes, By Project, By Episode, Important Notices.

### Personal Dashboard
**Purpose:** Each team member's default startup page. Single filtered dashboard — not per-person pages — for scalability across projects.

**To set as startup page:** Settings → My notifications & settings → Open on startup.

**Sections:**
1. **Important Notes** — IPS Notes DB, filtered Type = Directive, list view
   - Body content is NOT visible inline — users must click to read full directive (this is a Notion constraint, not a config issue)
   - Date display: outstanding decision — add Created Time property, or require manual Date entry when creating a directive
   - Instruction manual note: directive titles must be descriptive; users must click to read full content
2. **My Tasks** — IPS Tasks DB, filtered Assignee = Me. Property visibility not yet configured.
3. **My Video Elements** — IPS Video Elements DB, filtered Assignee = Me. Property visibility not yet configured.
4. **My Notes** — IPS Notes DB, filtered Author = Me. Property visibility not yet configured.
5. **All Notes** — IPS Notes DB, unfiltered, grouped by Content. Property visibility not yet configured.

**Still to do:**
- Resolve directive date display (Created Time vs manual Date)
- Configure property visibility for sections 2–5
- Add Personal Dashboard to synced nav block
- Assign icon to Personal Dashboard

---

## Icon & Colour System
- Home: house, orange
- Projects Dashboard: folder, blue
- Videos Dashboard: film grid, green
- Tasks Dashboard: checklist, purple
- Notes Dashboard: page, grey
- Personal Dashboard: TBC
- Databases: stack, red

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
**Status: DEPLOYED** — https://notion-proxy.ole-1b2.workers.dev

---

## Key Design Decisions
- Single IPS Content database with Level field (not separate databases per level)
- Per-stage status columns inspired by ShotGrid pipeline step view
- Eight-value status list — "Ready to Start" distinguishes clear-to-begin from waiting; "Omitted" for cut shots
- Status Note field for context when status alone isn't enough
- Task Type field (Standard / Revision Round / Approval) enables reporting on revision round count
- Built fresh rather than inheriting Ultimate Brain complexity — borrowed only the Parent Task / Sub-Tasks relation pattern
- IPS prefix kept on databases; removed from dashboard page names for cleaner navigation
- Innit branding: orange #E8511A, charcoal #1A1A1A
- Personal Dashboard: single page filtered to current user, not per-person pages — scales across projects

---

## Database IDs
- IPS Projects DB: 33119ff7-94ee-815d-b537-c658ccaf2982
- IPS Content DB: 33119ff7-94ee-8110-8df4-fbc98620bf45
- IPS Tasks DB: 33119ff7-94ee-817a-b249-ccca6d2df580
- IPS Notes DB v2: 33519ff7-94ee-8167-b40c-ca4055f4bd56

---

## IPS Guide / Instruction Manual Notes
*(To be built incrementally)*
- Directive titles must be descriptive — the title is the only thing visible in the Personal Dashboard without clicking
- Users must click a Directive to read the full content
- Each team member should set Personal Dashboard as their startup page via Settings → My notifications & settings → Open on startup

---

## Outstanding Items
1. ~~**Personal Dashboard** — resolve directive date display~~ ✓ Done (Created Time and Date both added and configured as visible in Important Notes section)
2. ~~**Personal Dashboard** — configure property visibility for My Tasks~~ ✓ Done (My Tasks view configured Session 10 — shows Name, Status, Type, Due Date, Video Elements). My Video Elements, My Notes, All Notes sections still outstanding.
3. **Personal Dashboard** — add to synced nav block
4. **Personal Dashboard** — assign icon
5. **Home dashboard** — consider restricting visibility to producer only (deferred)
6. **Bespoke icons at 280x280px** — Ulf designing (Episode, Sequence, Shot, Task types, Note)
7. **IPS Content DB templates** — Sequence and Shot still to create
8. **IPS Tasks DB templates** — Standard, Revision Round, Approval still to create
9. **IPS Guide / instruction manual** — build incrementally
10. **Delete test data** and enter real Broader Impacts project data
11. **Naming convention** for content records (flag when real data entry begins)
12. **Rename Notion integration** from "Animation Production System" to "Innit Production System"
13. **Admin nav** at bottom of Home dashboard
14. **Sidebar nav consideration** (Aram Atkinson two-column style)
15. **Rename "Name" title fields** in all IPS databases to "Title" *(also rename "My Content" section on Personal Dashboard to "My Video Elements" — done Session 10)*
16. **Notion automation** — Archived checkbox on IPS Projects DB cascades to related Tasks and Notes (when real data entry begins)
17. **End-of-build review** — compare IPS against Thomas Frank UB and Humaniaq APMH findings (reference PDF compiled)
18. **GitHub push from Mac Studio** — credentials not yet configured
19. **Combined Innit Admin dashboard** — spanning Client Comms + Dates DBs
20. **Delete "DELETE ME" view** from IPS Tasks DB (manual — MCP cannot delete views)
21. **Personal Dashboard views** — still need configuring (next session)
22. **My Tasks view** — manually add Assignee filter (Ole) in Notion (Filter → Assignee → Ole)
23. **Consider upgrading to Max plan** or enabling extra usage given heavy MCP usage pattern

---

## Session 8 continued (13 Apr afternoon)

### Notion MCP
- Notion MCP confirmed working in Claude for Mac — already connected via OAuth (was pre-configured)
- Test view created and deleted successfully on IPS Tasks DB via MCP
- MCP can create views with filters, sorts, grouping, and visible properties configured automatically
- **This changes our approach:** use MCP first for all remaining view and database configuration
- Note: MCP cannot delete views — any cleanup of unwanted views must be done manually in Notion
- "DELETE ME" test view left in IPS Tasks DB — needs manual deletion

---

## Session 10 additions (14 Apr)

### IPS versioned at v1.0
System formally versioned as IPS v1.0 this session.

### Database and property renames
- IPS Content DB renamed to **IPS Video Elements DB**
- `Content` relation property in IPS Tasks DB renamed to **Video Elements**
- `Content` relation property in IPS Notes DB renamed to **Video Elements**
- `My Content` section on Personal Dashboard renamed to **My Video Elements**

### My Tasks view (IPS Tasks DB)
Updated via MCP: now shows Name, Status, Type, Due Date, Video Elements.

### Test data created for Broader Impacts project
- 1 project record: Broader Impacts (Active, 3 revision rounds)
- 3 episodes: EP01 The Carbon Cycle (In Progress), EP02 Renewable Energy Sources (Storyboard pending review), EP03 Ocean Acidification (Ready to Start)
- 5 tasks across all three episodes (mix of Standard, Approval, Revision Round types)
- 3 notes: Directive, Brief, Meeting note

**Manual step outstanding:** MCP could not resolve cross-DB relation linking. Episodes are NOT yet linked to the Broader Impacts project record. Must be done manually in Notion — open each episode, set Project field to Broader Impacts.

---

## Session 9 additions (14 Apr)

### Dashboard views configured via MCP

**Tasks Dashboard**
- All Tasks: sorted by Due Date; shows Status, Type, Assignee, Due Date, Project
- My Tasks: sorted by Due Date; Assignee filter needs manual setup in Notion (Filter → Assignee → Ole)
- Revision Rounds: filtered to Type = Revision Round
- Not Started: filtered to Status = Not Started

**Projects Dashboard**
- Fixed On Hold and Archived filters (both were incorrectly filtering for Active)
- Added By Status list view (grouped by Status)

**Notes Dashboard**
- All views updated with correct filters and visible properties (Type, Created Time, Author, Project)
- Important Notices filter fixed

**Videos Dashboard**
- Episodes: Level = Episode
- Active: Status = In Progress
- Review: Status = Pending Review
- At Risk: Status = On Hold
- Deleted unnamed broken view (manually)

**IPS Home**
- Active Projects, In Progress Videos, Pending Review — filters and visible properties tidied
- In Progress and Pending Review filtered to Episode level only
- Confirmed IPS Home = admin/producer view; Personal Dashboard = individual team member view

### MCP usage note
MCP calls are token-heavy. Start fresh sessions rather than continuing long ones to conserve usage allowance.

---

## Session Log
- Session 1 (29-30 Mar): Designed system architecture, built all four Notion databases via API, built Frame.io CSV converter, built client feedback form, pushed all tools to GitHub
- Session 2 (31 Mar): Deployed Cloudflare Worker, fixed client feedback form (logo removed, comment field fixed to textarea, timecode auto-pad on blur, instructions updated), tested form end to end
- Session 3 (31 Mar afternoon): Added gallery view to Videos Dashboard, applied status label colour scheme to all status fields, started IPS Content DB templates (New Episode created)
- Session 4 (2 Apr): Rebuilt IPS Notes DB as v2, created note templates, built Notes Dashboard, updated synced nav, researched Notion layout system, set IPS Content DB layout
- Session 4 continued (2 Apr afternoon): Fully researched Notion layout system, set IPS Content DB layout (Tabbed, pinned properties, hidden helpers)
- Session 5 (3 Apr): Installed Claude Code on MacPro. Completed DB layouts for IPS Tasks DB, IPS Notes DB, IPS Projects DB (all Tabbed, properties pinned and hidden). Renamed dashboards — IPS prefix removed. Built Personal Dashboard with five sections; Important Notes section configured (list view, Type = Directive). Property visibility for sections 2–5 outstanding.
- Session 8 (13 Apr): Renamed Frame.io Link → Video Link in IPS Projects DB. Rebuilt New Project template (NAV toggle, Tasks section with List/Board/Calendar views, Notes section with List view, all filtered to current project, DB titles hidden). Updated layout (property group moved to panel, discussions off). Locked IPS Projects DB. Compiled Thomas Frank UB reference PDF. Confirmed Notion MCP working in Claude for Mac (OAuth, pre-configured) — can create views with filters/sorts/grouping/properties; MCP to be used for all remaining view/DB configuration.
- Session 10 (14 Apr): Versioned IPS as v1.0. Renamed IPS Content DB → IPS Video Elements DB; renamed Content relation properties in Tasks and Notes DBs; renamed My Content → My Video Elements on Personal Dashboard. Configured My Tasks view via MCP (Name, Status, Type, Due Date, Video Elements). Created test data for Broader Impacts (1 project, 3 episodes, 5 tasks, 3 notes). Manual step outstanding: link episodes to Broader Impacts project in Notion. Confirmed directive date display resolved (items 1 and 2 closed).
- Session 9 (14 Apr): Used MCP throughout to configure all dashboard views. Tasks Dashboard (All Tasks, My Tasks, Revision Rounds, Not Started), Projects Dashboard (fixed On Hold/Archived filters, added By Status list view), Notes Dashboard (all views with correct filters/properties), Videos Dashboard (Episodes, Active, Review, At Risk — deleted broken unnamed view manually), IPS Home (Active Projects, In Progress Videos, Pending Review — In Progress and Pending Review filtered to Episode level). Confirmed IPS Home = producer view, Personal Dashboard = individual view. Note: MCP calls are token-heavy — start fresh sessions for heavy MCP work.
