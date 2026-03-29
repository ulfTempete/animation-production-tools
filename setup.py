#!/usr/bin/env python3
"""
Notion Animation Production System Builder
Creates a parent page + 4 databases for tracking a 30-video animation project.
"""

import os
import sys
import json
import requests
import warnings
warnings.filterwarnings("ignore")  # suppress urllib3/OpenSSL warning

NOTION_API_KEY = os.environ.get("NOTION_API_KEY")
if not NOTION_API_KEY:
    print("ERROR: NOTION_API_KEY environment variable not set.")
    sys.exit(1)

NOTION_PARENT_PAGE_ID = os.environ.get("NOTION_PARENT_PAGE_ID")

NOTION_VERSION = "2022-06-28"
BASE_URL = "https://api.notion.com/v1"

HEADERS = {
    "Authorization": f"Bearer {NOTION_API_KEY}",
    "Content-Type": "application/json",
    "Notion-Version": NOTION_VERSION,
}


# ---------------------------------------------------------------------------
# API helpers
# ---------------------------------------------------------------------------

def api(method: str, endpoint: str, data: dict = None) -> dict:
    url = f"{BASE_URL}/{endpoint}"
    resp = getattr(requests, method)(url, headers=HEADERS, json=data)
    result = resp.json()
    if resp.status_code not in (200, 201):
        print(f"\nERROR {resp.status_code} on {method.upper()} /{endpoint}:")
        print(json.dumps(result, indent=2))
        sys.exit(1)
    return result


# ---------------------------------------------------------------------------
# Property builders
# ---------------------------------------------------------------------------

def select_prop(*options):
    return {"type": "select", "select": {"options": [{"name": o} for o in options]}}

def rich_text_prop():
    return {"type": "rich_text", "rich_text": {}}

def people_prop():
    return {"type": "people", "people": {}}

def date_prop():
    return {"type": "date", "date": {}}

def url_prop():
    return {"type": "url", "url": {}}

def number_prop():
    return {"type": "number", "number": {"format": "number"}}

def relation_prop(database_id: str):
    return {
        "type": "relation",
        "relation": {
            "database_id": database_id,
            "type": "single_property",
            "single_property": {},
        },
    }


# ---------------------------------------------------------------------------
# Shared option sets
# ---------------------------------------------------------------------------

PROD_STATUSES = [
    "Not Started", "Ready to Start", "In Progress",
    "Pending Review", "Approved", "On Hold",
]
CONTENT_STATUSES = PROD_STATUSES + ["Omitted", "Delivered"]


# ---------------------------------------------------------------------------
# Step 1 — Resolve parent page
# ---------------------------------------------------------------------------

if NOTION_PARENT_PAGE_ID:
    # Normalize: strip hyphens and any URL prefix, then re-format as UUID
    raw = NOTION_PARENT_PAGE_ID.strip().split("-")[-1] if "/" in NOTION_PARENT_PAGE_ID else NOTION_PARENT_PAGE_ID.replace("-", "")
    # Extract last 32-char hex segment from a URL like notion.so/Title-<id>
    import re
    match = re.search(r"([0-9a-f]{32})$", NOTION_PARENT_PAGE_ID.replace("-", "").lower())
    if match:
        raw = match.group(1)
    parent_id = f"{raw[0:8]}-{raw[8:12]}-{raw[12:16]}-{raw[16:20]}-{raw[20:32]}"
    parent_url = f"https://notion.so/{raw}"
    print(f"Using existing parent page: {parent_url}")
else:
    print("Creating parent page: Animation Production System...")
    parent = api("post", "pages", {
        "parent": {"type": "workspace", "workspace": True},
        "icon": {"type": "emoji", "emoji": "🎬"},
        "properties": {
            "title": [{"type": "text", "text": {"content": "Animation Production System"}}]
        },
    })
    parent_id = parent["id"]
    parent_url = f"https://notion.so/{parent_id.replace('-', '')}"
    print(f"  ✓ Page created  →  {parent_url}")


# ---------------------------------------------------------------------------
# Step 2 — Content database (self-referential relation added after creation)
# ---------------------------------------------------------------------------

print("\nCreating Content database...")
content_db = api("post", "databases", {
    "parent": {"type": "page_id", "page_id": parent_id},
    "icon": {"type": "emoji", "emoji": "🎞️"},
    "title": [{"type": "text", "text": {"content": "Content"}}],
    "properties": {
        "Name":                 {"title": {}},
        "Level":                select_prop("Episode", "Sequence", "Shot"),
        "Status":               select_prop(*CONTENT_STATUSES),
        "Status Note":          rich_text_prop(),
        "Storyboard Status":    select_prop(*PROD_STATUSES),
        "Style Frames Status":  select_prop(*PROD_STATUSES),
        "Animation Status":     select_prop(*PROD_STATUSES),
        "Post Status":          select_prop(*PROD_STATUSES),
        "Assignee":             people_prop(),
        "Due Date":             date_prop(),
        "Description":          rich_text_prop(),
        "Frame.io Link":        url_prop(),
    },
})
content_id = content_db["id"]
print(f"  ✓ Content DB created  →  {content_id}")

# Self-referential Parent relation
print("  Adding Parent (self-relation)...")
api("patch", f"databases/{content_id}", {
    "properties": {"Parent": relation_prop(content_id)}
})
print("  ✓ Parent relation added")


# ---------------------------------------------------------------------------
# Step 3 — Tasks database
# ---------------------------------------------------------------------------

print("\nCreating Tasks database...")
tasks_db = api("post", "databases", {
    "parent": {"type": "page_id", "page_id": parent_id},
    "icon": {"type": "emoji", "emoji": "✅"},
    "title": [{"type": "text", "text": {"content": "Tasks"}}],
    "properties": {
        "Name":        {"title": {}},
        "Type":        select_prop("Standard", "Revision Round", "Approval"),
        "Status":      select_prop("Not Started", "In Progress", "Pending Review",
                                   "Approved", "On Hold", "Done"),
        "Assignee":    people_prop(),
        "Due Date":    date_prop(),
        "Description": rich_text_prop(),
        "Content":     relation_prop(content_id),
    },
})
tasks_id = tasks_db["id"]
print(f"  ✓ Tasks DB created  →  {tasks_id}")

# Self-referential Parent Task relation
print("  Adding Parent Task (self-relation)...")
api("patch", f"databases/{tasks_id}", {
    "properties": {"Parent Task": relation_prop(tasks_id)}
})
print("  ✓ Parent Task relation added")


# ---------------------------------------------------------------------------
# Step 4 — Notes database
# ---------------------------------------------------------------------------

print("\nCreating Notes database...")
notes_db = api("post", "databases", {
    "parent": {"type": "page_id", "page_id": parent_id},
    "icon": {"type": "emoji", "emoji": "📝"},
    "title": [{"type": "text", "text": {"content": "Notes"}}],
    "properties": {
        "Name":    {"title": {}},
        "Author":  people_prop(),
        "Date":    date_prop(),
        "Body":    rich_text_prop(),
        "Content": relation_prop(content_id),
    },
})
notes_id = notes_db["id"]
print(f"  ✓ Notes DB created  →  {notes_id}")


# ---------------------------------------------------------------------------
# Step 5 — Projects database
# ---------------------------------------------------------------------------

print("\nCreating Projects database...")
projects_db = api("post", "databases", {
    "parent": {"type": "page_id", "page_id": parent_id},
    "icon": {"type": "emoji", "emoji": "📁"},
    "title": [{"type": "text", "text": {"content": "Projects"}}],
    "properties": {
        "Name":                    {"title": {}},
        "Status":                  select_prop("Active", "On Hold", "Complete", "Archived"),
        "Client Contacts":         rich_text_prop(),
        "Brief":                   rich_text_prop(),
        "Key Dates":               rich_text_prop(),
        "Instructions":            rich_text_prop(),
        "Links":                   rich_text_prop(),
        "Revision Budget Agreed":  number_prop(),
        "Revision Budget Used":    number_prop(),
        "Frame.io Link":           url_prop(),
    },
})
projects_id = projects_db["id"]
print(f"  ✓ Projects DB created  →  {projects_id}")


# ---------------------------------------------------------------------------
# Summary
# ---------------------------------------------------------------------------

print("\n" + "=" * 62)
print("  Animation Production System — setup complete!")
print("=" * 62)
print(f"\n  Parent page:   {parent_url}")
print(f"\n  Database IDs (for use in API calls):")
print(f"    Content:     {content_id}")
print(f"    Tasks:       {tasks_id}")
print(f"    Notes:       {notes_id}")
print(f"    Projects:    {projects_id}")
print()
