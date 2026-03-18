# BetterDay v2 — Product Idea

## One Liner

Every day a clean sheet of paper. Write what you want, drag where you like, move on.

## Problem

Traditional task management tools add cognitive burden: categories, priorities, due dates, projects... For people with scattered attention, the "management" itself becomes the obstacle. They need a place to quickly dump thoughts and tasks without thinking about structure.

## Core Philosophy

> Every day a clean sheet of paper. Write it down, done or not, turn the page. What's truly important, you'll remember to write again.

- No carry-over pile-up — each day starts fresh
- No forced structure — position IS organization
- No management overhead — just write and drag
- Forgetting is a feature — unfinished tasks disappearing = natural prioritization

## MVP: 4 Concepts

| Concept | Description |
|---------|-------------|
| **Calendar** | Each day = a fixed-size whiteboard |
| **Card** | One universal type. Can have text, checklist, or both. Free drag-and-drop positioning |
| **Pin** | Pinned cards appear on the whiteboard every day at the same position. Manually unpin to remove |
| **Tag** | Cards can have tags. Filter by tag to see a cross-day timeline |

### Card

One universal card type — content determines what it is:

- Text only → journal / mood / note
- Checklist only → task list
- Text + checklist → project notes with action items
- Any card can be pinned (📌) to appear daily
- Any card can have tags for cross-day filtering

### Pin

For things you want to see every day: ongoing projects, recurring goals, future plans.

- User-initiated, not system-imposed
- Appears at the same position every day
- Unpin anytime to remove from daily view

### Tag

The only way to organize and retrieve across days.

- Click a tag → see all cards with that tag across all days, reverse chronological
- Click a card in the tag view → jump to that day's whiteboard

## MVP: 1 Screen

Everything is the whiteboard. Calendar and tags are modal overlays.

```
┌─────────────────────────────────────────────────┐
│  ◀ ▶  3/17 Tue                     🏷  📅  [ + ]│
├─────────────────────────────────────────────────┤
│                                                 │
│   ┌──────────┐                                  │
│   │ Project A 📌│        ┌──────────┐           │
│   │ □ Design   │        │ Feeling ok  │          │
│   │ ☑ Research │        │ Energy 7/10 │          │
│   └──────────┘          └──────────┘           │
│                                                 │
│              ┌──────────┐                       │
│              │ □ Groceries│                      │
│              └──────────┘                       │
│                                                 │
│                          ┌──────────┐           │
│                          │ Random    │           │
│                          │ thought.. │           │
│                          └──────────┘           │
│                                                 │
└─────────────────────────────────────────────────┘
```

**Top bar:**
- ◀ ▶ — switch to previous/next day
- 📅 — calendar modal (monthly view, dots under dates showing card count)
- 🏷 — tag modal (list all tags, click to see cross-day timeline)
- [ + ] — create new card

**Calendar modal:**

```
┌─────────────────────────────────────────────────┐
│  ◀  2026-03  ▶                          🏷  ✕   │
├─────────────────────────────────────────────────┤
│  Mon   Tue   Wed   Thu   Fri   Sat   Sun        │
│                                                 │
│  2     3     4     5     6     7     8           │
│  ·     ··    ·           ····  ··                │
│                                                 │
│  9     10    11    12    13    14    15           │
│  ···         ·     ··    ·     ····  ··          │
│                                                 │
│  16   [17]   18    19    20    21    22           │
│  ··    ···                                      │
└─────────────────────────────────────────────────┘
```

**Tag timeline modal:**

```
┌─────────────────────────────────────────────────┐
│  ← Back                  🏷 #ProjectA            │
├─────────────────────────────────────────────────┤
│                                                 │
│  Mar 17                                         │
│  ┌──────────────────────────────────┐           │
│  │ Project A  □ Design  ☑ Research  │           │
│  └──────────────────────────────────┘           │
│                                                 │
│  Mar 15                                         │
│  ┌──────────────────────────────────┐           │
│  │ Client wants changes to the plan │           │
│  └──────────────────────────────────┘           │
│                                                 │
│  Mar 12                                         │
│  ┌──────────────────────────────────┐           │
│  │ Project A kickoff, start research│           │
│  └──────────────────────────────────┘           │
│                                                 │
└─────────────────────────────────────────────────┘
```

## Design Principles

1. **Zero config** — Open the app, start writing
2. **Finite space** — A day is a day, you can't fit everything, and that's ok
3. **Position is structure** — No folders, no categories, drag to where it feels right
4. **Forgetting is a feature** — Unfinished tasks disappearing = natural prioritization
5. **User agency** — Pin what YOU decide matters, not what the system thinks

## Future Ideas (NOT MVP)

- Sidebar navigation
- AI daily/weekly summary from activity logs
- Mood / energy tracking and trends
- Card templates
- Search across all days
- Automatic suggestions based on patterns
- All operations logged for AI analysis
