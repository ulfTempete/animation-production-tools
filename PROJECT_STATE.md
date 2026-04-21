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
- **Relation field filtering:** Notion cannot filter a relation field based on another relation field. No fix available — workflow convention only.
- **Property group label:** the "Property group" block label in Notion's layout builder cannot be renamed. It is fixed.
- **Relations group:** this is a distinct layout element separate from the Property group. It appears automatically when relation properties are set to display as "page section". It is NOT created via the + button. Needs further investigation before next attempt.

### Note types — exact values
The IPS Notes DB Type field has exactly these five options:
**General, Brief, Meeting, Announcement, Asset**
(Previously "Directive" — renamed to "Announcement" in Session 11)

### Task types — exact values
The IPS Tasks DB Type field has exactly these two options:
**Standard, Collection**
(Previously included "Approval" — removed in Session 11)

### Communication
- User has ADHD — deliver information one step at a time, not in long lists
- Do not suggest steps or options without being confident they are correct
- If something needs to be looked up first, say so and look it up before proceeding

### Notion UI — stop after two failed attempts
If a UI step fails twice, stop. Do not try further variations. State clearly what was attempted and what happened, and flag it as an outstanding item. Never claim to see the problem without a verified cause.

### CC / MCP — consider at session start
At the start of every IPS session, consider whether CC or MCP can be used before proceeding manually. Flag this proactively if relevant.

### End of session — CC update routine
At the end of every session:
1. Compile all changes made during the session
2. User opens Claude Code in Terminal: `cd "/Users/olesturm/Library/Mobile Documents/com~apple~CloudDocs/ESSENTIALS/MAC ESSENTIALS/Claude/Claude Access/animation-production-tools"` then `claude`
3. Instruct Claude Code to update `project_state.md` with the session notes
4. Claude Code commits and pushes to GitHub

---

## Overview
Production tracking system for Innit Productions. Initially built for a 30-video animation project, designed as a reusable system for all future projects.

**GitHub repo:** https://github.com/ulfTempete/animation-production-tools
**Notion workspace:** Innit Productions
**Local tools:** ~/notion-production-system/start.sh (runs CORS proxy on localhost:8080)
**CC launch command:** `cd "/Users/olesturm/Library/Mobile Documents/com~apple~CloudDocs/ESSENTIALS/MAC ESSENTIALS/Claude/Claude Access/animation-production-tools" && claude`

**iCloud folder structure:**
- `Claude/` — at /Users/olesturm/Library/Mobile Documents/com~apple~CloudDocs/ESSENTIALS/MAC ESSENTIALS/Claude
- `Claude/Claude Access/` — CC's working folder for all project repos
- `Claude/IPS/` — production files, assets, related docs (to be populated)

---

## Multi-Project Usage Patterns

Two distinct usage modes:

### Solo multi-project mode (default IPS)
- Ulf works across multiple projects simultaneously
- Tasks linked to Video Elements (always) and optionally to Project (for standalone videos)
- Sort by Project on Tasks Dashboard for cross-project overview
- Rule: always set Video Element on a task; set Project only for standalone video tasks

### Large team project mode (duplicated IPS)
- Duplicate entire IPS setup into isolated instance for the project
- The whole system IS the project — no Project property needed
- Freelancers granted access to that copy only
- In duplicated instance: rename "Video Elements" relation on Tasks to "Episode"
- Note: dashboards and linked views require manual reconnection after duplication

---

## Notion Databases

### IPS Video Elements DB
Core database. Episodes, Sequences and Shots all live here — differentiated by the Element field.

**Properties:**
- Name (title)
- Element (select: Episode, Sequence, Shot, Single)
- Parent (relation to same database — for hierarchy)
- Status (select: Not Started, Ready to Start, In Progress, Pending Review, Approved, On Hold, Omitted, Delivered)
- Status Note (rich text)
- Storyboard Status (select: same options as Status minus Delivered)
- Style Frames Status (select: same)
- Animation Status (select: same)
- Post Status (select: same)
- Assignee (people)
- Due Date (date)
- Start Date (date)
- Delivered Date (date)
- Description (rich text)
- Frame.io Link (url)
- Screenshot (Files & Media)
- Single (checkbox — marks a video as standalone rather than episode in a series)
- Created By (created_by — auto-populated, added Session 11)
- Tasks (reverse relation from IPS Tasks)
- Project (relation to IPS Projects DB)
- Open Tasks (rollup)
- Task Progress (rollup)
- Is Episode (formula — hidden helper)
- Open Tasks Count (formula — hidden helper)

**Status label colours:**
- Not Started — grey, Ready to Start — blue, In Progress — purple
- Pending Review — yellow, Approved — green, On Hold — red
- Omitted — brown, Delivered — green
- Same colours applied to Storyboard Status, Style Frames Status, Animation Status, Post Status

**Views:**
- Default view (table)
- All Episodes (Element = Episode)
- All Shots (Element = Shot)
- In Progress (Status = In Progress)
- Pending Review (Status = Pending Review)
- At Risk (Status = On Hold)

**Templates:**
- New Episode (created — green film icon, Element = Episode)
- New Sequence — still to create
- New Shot — still to create

**Outstanding layout work (manual):**
- Property visibility on record page layout still showing all properties — needs manual fix in Notion

---

### IPS Tasks DB
**Properties:**
- Name (title)
- Type (select: Standard, Collection)
- Status (select: Not Started, In Progress, Pending Review, Approved, On Hold, Done)
- Priority (select — added Session 12)
- Assignee (people)
- Due Date (date)
- Details (rich text — renamed from Description Session 11)
- Status Note (rich text)
- Video Elements (relation to IPS Video Elements DB — limited to 1 page, renamed to "Project Component" in some views — confirm)
- Project (relation to IPS Projects DB — added Session 11)
- Parent Task (relation to same database — for subtasks)
- Progress (number, percentage)
- Is Open Task (formula — hidden helper)

**Layout (Standard template — configured Session 13):**
- Structure: Tabbed
- Heading pinned: Status, Type, Assignee, Due Date
- Tabs: Content, Sub-item, Parent item, Project Component
- Property group shows: Details, Priority, Progress, Status Note
- Relation properties (Parent Task, Parent item, Project, Project Component, Sub-item) hidden from Property group
- Page discussions (comments) retained
- Applied to all pages
- Relations group: NOT YET RESOLVED — appears automatically in Thomas Frank's demo when switching to Tabbed layout; not appearing in IPS Tasks DB despite native Sub-items being enabled. Question posted to Thomas Frank community. Do not attempt further variations until response received.

**Views (Tasks Dashboard):**
- All Tasks Overview: shows Name, Status, Assignee, Due Date, Project, Video Elements, Type — sorted by Due Date
- My Tasks: shows Name, Status, Type, Due Date, Project, Video Elements — sorted by Due Date

**Templates:** Standard (partially configured Session 12), Collection — still to create

---

### IPS Notes DB v2
**Properties:**
- Name (title)
- Type (select: General, Brief, Meeting, Announcement, Asset)
  ← "Directive" renamed to "Announcement" Session 11
- Author (people)
- Date (date — manually entered)
- Body (rich text — page content, not visible inline in any view)
- Project (relation to IPS Projects)
- Video Elements (relation to IPS Video Elements DB)
- URL (url)
- Favourite (checkbox)
- Archived (checkbox)
- Status Note (rich text — added Session 11)

**Layout:**
- Structure: Tabbed
- Pinned: Type, Project, Date, Author
- Hidden: Archived

**Templates:**
- Meeting: [Date] — Agenda, Meeting Notes, Action Items sections
- Brief — Overview, Key Requirements, References & Links sections
- Announcement — Notice, Applies To, Effective From sections
- General — empty

**Views:**
- All Notes
- By Project
- By Episode
- Important Announcements (Type = Announcement)

---

### IPS Projects DB
**Properties:**
- Name (title)
- Type (select: Single Video, Series)
- Status (select: Active, On Hold, Delivered, Archived)
- Assignee (people — added Session 11)
- Owner (people — pre-existing; review whether both Assignee and Owner are needed)
- Video Link (url)
- Start Date (date)
- Due Date (date)
- Delivered Date (date)
- Revision Allowance (number)
- Revisions Used (number)
- Total Videos (rollup — count of linked Episodes; consider renaming to Total Episodes)
- Total Open Tasks (rollup)
- Status Note (rich text — added Session 11)
- Videos (relation to IPS Video Elements DB)
- Brief, Client Contacts, Key Dates, Instructions, Links (rich text — in page body)

**Layout:** Property group moved to panel, page discussions turned off. DB locked (unlock before MCP changes, re-lock after).
- Pinned: Status, Owner, Video Link, Total Open Tasks

**Template:** "New Project" — includes NAV toggle, Tasks section, Notes section (all filtered to current project).

**Outstanding:**
- Video Link property: consider moving to a summary section in the page body rather than a property (manual template change)
- Decide whether both Owner and Assignee are needed

**Test data:** "Broader Impacts" project record exists — to be deleted before real data entry.

---

## Dashboards

All dashboards use a synced callout nav block.

**Nav links:** Home | Projects Dashboard | Videos Dashboard | Tasks Dashboard | Notes Dashboard | Personal Dashboard

### Home (IPS Home)
Producer/admin overview. Sections: Active Projects, In Progress, Pending Review.
Note: Consider restricting visibility to producer only (deferred).

### Projects Dashboard
Views: Active, On Hold, Completed, Archived, All Projects, By Status.
**Outstanding:** Consider removing — may be redundant given IPS Home and Personal Dashboard.

### Videos Dashboard
Views: All Videos, Episodes Only, In Progress, Pending Review, At Risk, Visual Overview (gallery).

### Tasks Dashboard
Views: All Tasks Overview, My Tasks.
Both views show: Name, Status, Type, Due Date, Project, Video Elements.

### Notes Dashboard
Views: All Notes, By Project, By Episode, Important Announcements.

### Personal Dashboard
**Purpose:** Each team member's default startup page.
**Label change:** "Important Notes" renamed to "Important Announcements" (Session 11).
**Label change:** "All Projects" renamed to "My Projects" (Session 11).

**Sections:**
1. Important Announcements — IPS Notes DB, filtered Type = Announcement
2. My Tasks — IPS Tasks DB, filtered Assignee = Me
3. My Video Elements — IPS Video Elements DB, filtered Assignee = Me
4. My Notes — IPS Notes DB, filtered Author = Me
5. My Projects — IPS Projects DB (previously All Projects)

**Outstanding:**
- Producer vs Creative Dashboard split — producer has new project/episode buttons; creative does not. Notion page access can be restricted by person. Flag for dedicated session.
- Property visibility for sections 2–5 still needs configuring
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
Frame.io CSV converter. Drag-and-drop CSV, preview comments, select episode, create Collection task in IPS Tasks.
- Runs locally via start.sh (CORS proxy on localhost:8080)

### client-feedback.html
Client feedback form. Submits to IPS Tasks as Collection task via Cloudflare Worker.
- Innit branding, mobile responsive

### notion-proxy.js (Cloudflare Worker)
**Status: DEPLOYED** — https://notion-proxy.ole-1b2.workers.dev

---

## Key Design Decisions
- Single IPS Video Elements DB with Element field (Episode, Sequence, Shot, Single)
- Tasks always linked to a Video Element; Project relation used additionally for standalone video tasks only
- Sort by Project on Tasks Dashboard for cross-project overview
- Task Type simplified to Standard and Collection (Approval removed Session 11)
- Directive renamed to Announcement in Notes Type field (Session 11)
- IPS designed as duplicatable template for large team projects; in duplicated instance rename Video Elements relation to Episode and remove Project relation
- Innit branding: orange #E8511A, charcoal #1A1A1A

---

## Database IDs
- IPS Projects DB: 33119ff7-94ee-815d-b537-c658ccaf2982
- IPS Video Elements DB: 33119ff7-94ee-8110-8df4-fbc98620bf45
- IPS Tasks DB: 33119ff7-94ee-817a-b249-ccca6d2df580
- IPS Notes DB v2: 33519ff7-94ee-8167-b40c-ca4055f4bd56

---

## Outstanding Items
1. **Personal Dashboard** — add to synced nav block
2. **Personal Dashboard** — assign icon
3. **Personal Dashboard** — Producer vs Creative split with access controls (dedicated session)
4. **Personal Dashboard** — configure property visibility for sections 2–5
5. **Home dashboard** — consider restricting visibility to producer only (deferred)
6. **Bespoke icons at 280x280px** — Ulf designing
7. **IPS Video Elements DB templates** — Sequence and Shot still to create
8. **IPS Tasks DB templates** — Standard (partially done) and Collection still to complete
9. **IPS Guide / instruction manual** — build incrementally
10. **Delete test data** and enter real Broader Impacts project data; link episodes to Broader Impacts project manually in Notion
11. **Naming convention** for content records (flag when real data entry begins)
12. **Rename Notion integration** from "Animation Production System" to "Innit Production System"
13. **Admin nav** at bottom of Home dashboard
14. **Sidebar nav consideration** (Aram Atkinson two-column style)
15. **Rename "Name" title fields** in all IPS databases to "Title"
16. **Notion automation** — Archived checkbox on IPS Projects DB cascades to related Tasks and Notes (when real data entry begins)
17. **End-of-build review** — compare IPS against Thomas Frank UB and Humaniaq APMH findings
18. ~~**GitHub push from Mac Studio**~~ ✓ Done (Session 13 — gh installed, OAuth authenticated, repo moved to iCloud path, push confirmed)
19. **Combined Innit Admin dashboard** — spanning Client Comms + Dates DBs
20. **Delete "DELETE ME" view** from IPS Tasks DB (manual)
21. **My Tasks view** — manually add Assignee filter (Ole) in Notion
22. **Consider upgrading to Max plan** given heavy MCP usage
23. **IPS Projects DB** — decide whether both Owner and Assignee properties are needed; remove one if redundant
24. **Video Link property on Project Page** — consider moving to summary section in page body rather than a property (manual template change)
25. **Auto-assign Author when creating note from project page** — needs Notion automation
26. **Announcement section at top of Project Page** — add to New Project template (manual)
27. **Video Elements DB naming** — "Video Elements" may not suit non-video work (e.g. logo design); revisit
28. **Property visibility on Video Elements record page layout** — all properties still showing; fix manually in Notion
29. **Projects Dashboard** — consider removing (may be redundant)
30. **Total Videos rollup** — consider renaming to Total Episodes; revisit after testing task assignment flow
31. **Re-lock IPS Projects DB** after MCP changes this session
32. **IPS Tasks DB Standard template** — layout partially configured. Heading set correctly (Status, Assignee, Priority, Due Date). Sub-Tasks tab added. Relations group NOT YET RESOLVED. Next attempt: investigate whether relation properties (Project, Project Component/Video Elements) need to be set to "page section" display mode to trigger the Relations group element. Research this thoroughly before next attempt.
33. **Priority field** — added to IPS Tasks DB (Session 12). Confirm label colours set correctly.
34. **"Project Component"** — confirm whether this is the renamed Video Elements relation in IPS Tasks DB. Clarify and update property name if needed.
35. **Role-based filtering** (admin/producer/animator) to reduce information overload — flagged Session 11, deferred.
36. **Relations group in IPS Tasks DB Standard template** — not appearing despite native Sub-items enabled. Question posted to Thomas Frank community. Do not attempt further variations until response received.
37. **IPS/iCloud folder** — `Claude/IPS/` created; to be populated with production files, assets, and related docs.

---

## Session Log
- Session 1 (29-30 Mar): Designed system architecture, built all four Notion databases, built Frame.io CSV converter and client feedback form, pushed to GitHub
- Session 2 (31 Mar): Deployed Cloudflare Worker, fixed client feedback form
- Session 3 (31 Mar afternoon): Added gallery view, applied status label colours, started Video Elements DB templates
- Session 4 (2 Apr): Rebuilt IPS Notes DB as v2, created note templates, built Notes Dashboard, set IPS Content DB layout
- Session 5 (3 Apr): Installed Claude Code. Completed DB layouts. Renamed dashboards. Built Personal Dashboard.
- Session 8 (13 Apr): Renamed Frame.io Link → Video Link in Projects DB. Rebuilt New Project template. Confirmed Notion MCP working.
- Session 9 (14 Apr): Configured all dashboard views via MCP.
- Session 10 (14 Apr): Versioned IPS as v1.0. Renamed IPS Content DB → IPS Video Elements DB. Configured My Tasks view. Created Broader Impacts test data.
- Session 11 (17 Apr): Reviewed Ulf's notes. Added Project relation to IPS Tasks DB. Limited Video Elements relation to 1 page per task. Added Project and Video Elements to All Tasks Overview and My Tasks views on Tasks Dashboard. Added Created By to IPS Video Elements DB. Removed Approval from Task Type field (now Standard and Collection only). Renamed Directive → Announcement in Notes Type field. Discussed multi-project and large-team usage patterns. Created PreHapp team intro page in Notion. Multiple items flagged as outstanding.
- Session 12 (17 Apr): Worked through IPS Tasks DB Standard template layout. Heading configured correctly (Status, Assignee, Priority, Due Date). Sub-Tasks tab added. Priority field confirmed in Tasks DB. Attempted to create Relations group — could not resolve. Notion layout builder Relations group element appears to require relation properties set to "page section" display mode. Needs fresh research before next attempt. PROJECT_STATE.md was found truncated from Session 11 commit — reconstructed in full this session.
- Session 13 (21 Apr): Mac Studio setup completed — repo moved to iCloud path, gh installed and authenticated, merge conflict resolved, push confirmed (item 18 closed). iCloud folder structure established (Claude Access/, IPS/). CC launch command updated. IPS Tasks DB Standard template layout completed: Tabbed, pinned Status/Type/Assignee/Due Date, tabs Content/Sub-item/Parent item/Project Component, Property group shows Details/Priority/Progress/Status Note, relation properties hidden from Property group, discussions retained. Relations group still unresolved — question posted to Thomas Frank community. Added Notion UI stop-after-two-attempts rule and CC/MCP proactive suggestion rule to project instructions.
