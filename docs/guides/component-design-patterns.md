# Component Design Patterns: Controlled vs Self-Contained

> Research date: 2026-03-04
> Purpose: Theoretical foundation for Item component refactoring patterns

## Conclusion

Extract a headless hook for each Item component (`useItemActions`), encapsulating interaction logic + API calls + side effects. Components consume the hook; parent components only pass `data` + `onMutated`.

```tsx
// Before: parent binds 8 callbacks (repeated at every usage site)
<HabitItem
  habit={habit}
  todayLog={logMap.get(habit.id)}
  onCheckIn={() => checkIn(habit.id, todayStr, 'completed')}
  onSkip={() => checkIn(habit.id, todayStr, 'skipped')}
  onUncheckIn={() => uncheckIn(habit.id, todayStr)}
  onDelete={() => deleteHabit(habit.id)}
  onToggle={() => toggleHabit(habit.id)}
  onUpdate={input => updateHabit(habit.id, input)}
/>

// After: parent only cares about "data changed, refresh"
<HabitItem habit={habit} todayLog={logMap.get(habit.id)} todayStr={todayStr} onMutated={reload} />
```

Core reasoning: these Items behave identically across all usage contexts (tasks page, area-detail page, project-detail page) — there's no reason for parents to repeatedly orchestrate the same logic.

---

## 1. Component Autonomy Spectrum

React's official controlled/uncontrolled is a narrow definition for form elements. Business components need a fuller spectrum:

```
Self-Contained → Control Props → Partially Controlled → State Reducer → Headless
  Easiest to use                                                       Most flexible
  Least flexible                                                       Hardest to use
```

The choice isn't "which is more advanced" but "how much flexibility do you currently need."

Kent C. Dodds' core principle: **Start simple (self-contained), add flexibility only when there's a concrete need.**

> "You can create a simple convenience API on top of a flexible base pattern without sacrificing flexibility, but reversing this is nearly impossible."

### Level Definitions

**Self-Contained**: Component manages all its own state and side effects. Easiest to use, least flexible. Suited for business entities with fixed behavior.

**Control Props (dual mode)**: Component is self-contained by default, but hands over control when given `value` + `onChange`. Chakra UI, Radix UI, and React Aria all converge on the `useControllableState` hook pattern.

**Partially Controlled**: Complex components expose multiple independent state slices, each independently controllable or autonomous. Suited for trees, data tables, and other complex components.

**State Reducer (full inversion of control)**: Consumer can intercept and modify any state transition. Internal state structure becomes public API. Suited for highly reusable library components (e.g., downshift).

**Headless (pure logic)**: Pure hook/context providing logic with no rendering. Full inversion of control. Used by Radix UI, React Aria, Headless UI.

---

## 2. Key Principles (Literature Consensus)

### 1. State Colocation — Place State Closest to Where It's Used

> "Place code as close to where it's relevant as possible."
> — Kent C. Dodds, [Colocation](https://kentcdodds.com/blog/colocation)

Decision tree:
1. State used by only one component → put it in that component
2. Shared by siblings → lift to common parent
3. Severe prop drilling → use Context, but keep it at the lowest possible level

### 2. Hooks Replace Container/Presentational

Dan Abramov retracted the Smart/Dumb component split in 2019:

> "Hooks let me do the same thing without an arbitrary division."
> — Dan Abramov, [Presentational and Container Components (2019 retraction)](https://medium.com/@dan_abramov/smart-and-dumb-components-7ca2f9a7c7d0)

No need to strictly separate "container components" and "presentational components." Use hooks to separate logic; a component can hold both logic and UI.

### 3. Apropcalypse — The Prop Explosion Anti-pattern

> New requirement → add a prop → another requirement → add another prop → component API becomes a monster
> — Kent C. Dodds, [Soul-Crushing Components](https://www.epicreact.dev/soul-crushing-components)

Two solutions (choose based on context):
- **Library components**: Use composition over configuration (Compound Components)
- **Business components**: Use headless hooks to encapsulate logic

### 4. Headless Component — Logic/UI Separation

> "A Headless Component is a design pattern in React where a component — normally implemented as React hooks — is responsible solely for logic and state management without prescribing any specific UI."
> — Juntao Qiu, [Headless Component (martinfowler.com)](https://martinfowler.com/articles/headless-component.html)

### 5. Don't Abstract Prematurely

> "The idea isn't necessarily to encourage that every component be implemented this way."
> — Kent C. Dodds, [Mixing Component Patterns](https://kentcdodds.com/blog/mixing-component-patterns)

Only add flexibility when there's a concrete need. Business components don't need library-level generality.

---

## 3. Problem Diagnosis

### Current State: Split-Responsibility Smart Components

Item components (TaskItem, HabitItem, MomentItem) sit in an awkward middle ground:

| Responsibility | Owner |
|---------------|-------|
| Display (how to render) | Component itself |
| Interaction (modal orchestration) | Component itself (directly accesses 4+ global stores) |
| Data/Effect (API calls) | Parent component via callbacks |

The component "knows" how to interact (orchestrate modals) but doesn't "own" execution (mutations delegated to callbacks). Two patterns mixed together.

### Specific Pain Points

**Prop explosion**: HabitItem takes 8 callbacks, TaskItem takes 7.

**Repeated binding**: TaskItem is used in 3 places (tasks.tsx, area-detail.tsx, project-detail-content.tsx), each writing identical callback bindings.

**Implicit dependencies**: Components directly access `usePromptStore`, `useConfirmStore`, `useDatePickerStore`, `usePinnedStore`, but these dependencies aren't visible in props.

---

## 4. Recommended Pattern: Headless Hook + Self-Contained Item

### Component Layering

| Layer | Pattern | Example | Rationale |
|-------|---------|---------|-----------|
| Visual primitive | Pure Display, stateless | TaskCheckbox, HabitCheckbox, ProjectStatusRing | React docs |
| UI infrastructure | Uncontrolled + ref (`defaultValue` + `getValue/setValue`) | TimePicker, DurationPicker, RichTextEditor | React uncontrolled pattern (see Section 6) |
| Business entity | Self-Contained + Headless Hook | TaskItem + useTaskActions | State colocation + headless pattern |
| Detail view | Hook-Driven (existing pattern) | TaskDetailContent + useTaskDetail | Hooks replace containers |
| Page | Orchestrator | TasksPage, AreaDetailPage | Bulletproof React |

### Implementation Pattern

#### Headless Hook (Logic Layer)

```tsx
// features/things/use-task-actions.ts
function useTaskActions(task: Task, onMutated?: () => void) {
  const handleToggle = async () => {
    await window.api.task.toggle(task.id)
    onMutated?.()
  }

  const handleRename = async () => {
    const value = await usePromptStore.getState().prompt({
      title: 'Rename',
      defaultValue: task.name,
    })
    if (value?.trim()) {
      await window.api.task.update(task.id, { name: value.trim() })
      onMutated?.()
    }
  }

  const handleDelete = async () => {
    const confirmed = await useConfirmStore.getState().confirm({ ... })
    if (confirmed) {
      await window.api.task.delete(task.id)
      usePinnedStore.getState().load()
      onMutated?.()
    }
  }

  // ... setDate, setDueDate, moveTo, togglePin

  return { handleToggle, handleRename, handleDelete, ... }
}
```

#### Self-Contained Item (Consumes Hook)

```tsx
// features/things/task-item.tsx
function TaskItem({ task, onMutated }: { task: Task; onMutated?: () => void }) {
  const actions = useTaskActions(task, onMutated)

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div>
          <TaskCheckbox checked={task.status === 'done'} onClick={actions.handleToggle} />
          <span>{task.name}</span>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onClick={actions.handleRename}>Rename</ContextMenuItem>
        <ContextMenuItem onClick={actions.handleDelete}>Delete</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}
```

#### Parent Component (Minimal)

```tsx
// routes/tasks.tsx
{tasks.map(task => (
  <TaskItem key={task.id} task={task} onMutated={reloadTasks} />
))}
```

### Relationship with useTaskDetail

`useTaskDetail` is already a quasi-headless hook — the pattern is correct. `useTaskActions` can be reused by `useTaskDetail` to avoid duplicating rename / delete / setDate logic.

---

## 5. Decision Principles Quick Reference

1. **Default to self-contained** — Start simple (Kent: "start simple")
2. **Use hooks to separate logic** — Not container components (Dan Abramov 2019)
3. **Place state closest to where it's used** — Logic only used by TaskItem belongs in TaskItem (Kent: state colocation)
4. **When facing prop explosion, encapsulate logic first** — Don't split into more components (Kent: apropcalypse)
5. **Don't abstract prematurely** — Only add flexibility for concrete needs (YAGNI)
6. **Consistent behavior should be encapsulated** — Same behavior across all contexts = belongs to the component itself (Bulletproof React: colocation)

---

## 6. UI Infrastructure Layer — Uncontrolled Complex Input Components

> Supplemented: 2026-03-05
> Purpose: Document an important component pattern outside the four-layer business model

### Problem: Blind Spot in the Four-Layer Model

Section 4's layering (visual primitive → business entity → detail view → page) covers all **business components**, but misses an important category: **input controls with complex internal state**.

These components don't belong to any business layer — they're UI infrastructure consumed by business layers, like complex versions of `<Input>` / `<Textarea>`.

### Current Examples

| Component | Internal State | Ref Interface | Consumer |
|-----------|---------------|---------------|----------|
| `TaskDateTimePicker` | Date + time + duration (combines 3 sub-pickers) | `getValue() / setValue()` | `GlobalDatePickerDialog` |
| `TimePicker` | Time string + popover + input parsing | `getValue() / setValue() / focus()` | `TaskDateTimePicker` |
| `DurationPicker` | Minutes + popover + custom input expansion | `getValue() / setValue() / focus()` | `TaskDateTimePicker` |
| `RichTextEditor` (future) | EditorState + selection + history + menus | `getValue() / setValue() / focus()` | `TaskDetailContent` etc. |

### Pattern: Uncontrolled + ref + Optional onChange Notification

```tsx
// Interface contract
interface ComplexInputProps {
  defaultValue?: T | null       // Only used for initialization, no continuous sync
  onChange?: (value: T) => void  // Optional notification callback (doesn't control component state)
  // ...other config props
}

interface ComplexInputRef {
  getValue: () => T             // Imperative value retrieval
  setValue: (value: T | null) => void  // Imperative value setting
  focus?: () => void            // Optional
}
```

Key characteristics:

1. **`defaultValue` is read once** — `useState(defaultValue)` for initialization, no `useEffect` syncing subsequent prop changes
2. **`onChange` is notification, not control** — Parent receives notification but doesn't write back value; component stays autonomous
3. **`ref.getValue()` is the retrieval method** — Parent imperatively gets value at specific moments (Confirm click / debounce / blur)
4. **`forwardRef` + `useImperativeHandle`** — Standard React uncontrolled ref pattern

### Choosing Between Controlled and Uncontrolled

Both patterns coexist in the same domain (date selection):

| | `DatePicker` (controlled) | `TimePicker` etc. (uncontrolled) |
|---|---|---|
| Interface | `value` + `onChange` | `defaultValue` + `ref.getValue()` |
| Internal state | None (parent holds `useState`) | Yes (manages multiple `useState`) |
| When to use | Simple state (a single `Date`) | Complex state (parsing + sub-component composition + popover + editor engine) |
| Use case | Form fields | Composite pickers, rich text editors |

**Decision rule**: Can the parent manage it with a single `useState`? → Controlled. Has complex interaction state, sub-component composition, or third-party engine (Tiptap/ProseMirror)? → Uncontrolled + ref.

### Composition Pattern

Uncontrolled components can nest, with parents aggregating child values via ref:

```
TaskDateTimePicker (ref: getValue → aggregates the three below)
  ├─ Calendar        ← internal useState for date
  ├─ TimePicker      ← ref: getValue returns time
  └─ DurationPicker  ← ref: getValue returns duration
```

`TaskDateTimePicker.getValue()` internally calls `timePickerRef.current?.getValue()` and `durationPickerRef.current?.getValue()`, composing the final `TaskDateTimeValue`.

### Boundary with Business Layer

Uncontrolled input components **don't know what they're editing** (task? project? document?). Save timing, save target, and error handling are all decided by the consumer (Fat Hook / Dialog):

```
Fat Hook (useTaskDetail)          ← Decides when and where to save
    ↓ consumes
Uncontrolled Input (RichTextEditor) ← Only manages editing experience, not persistence
    ↓ uses internally
Engine (Tiptap/ProseMirror)        ← Pure UI state management
```

---

## 7. Page Composition Layer — Composition Over Context Detection

> Supplemented: 2026-03-10
> Purpose: Address the "god component" anti-pattern, clarify page-level component splitting and composition principles

### Problem: God Component

Section 4's layering covers visual primitive → business entity → detail → page, but doesn't answer a key question: **When multiple pages need similar but different UI, how should you organize it?**

The wrong approach is creating a "god component" that branches internally via mode/context props:

```tsx
// ❌ Anti-pattern: god component
<ContentView
  areaId={id}           // Context detection: has areaId → area mode
  dateScope="today"     // Behavior switch: determines data filtering
  showHabitsTab={false} // Boolean toggle: switches render path
/>
```

The cost of this pattern:
- **Modifying one page's behavior requires adding if/else in the shared component, risking all pages**
- Creates adapter hooks (whose only purpose is bridging the component to different contexts)
- Growing `if (areaId)` / `if (dateScope)` / `if (showX)` inside the component; tests must cover all combinations

Kent C. Dodds calls this **"Soul-Crushing Components"**:

> "I need it to do this differently, so I'll accept a new prop for that" leads to nothing but pain and frustration.

### Correct Approach: Lego-Style Composition

Pages are **orchestrators** — they call hooks for data and compose atomic UI components:

```tsx
// ✅ Correct pattern: page composes atomic components
function AreaDetailPage() {
  const areaView = useAreaThingsViewStore()    // Page uses its own store directly
  const projects = allProjects.filter(...)     // Page filters data itself
  const activeGroups = buildFilteredGroups(...) // Page calls utility functions

  return (
    <ContentTabs
      filterSlot={
        <ContentFilterPopover              // Atomic component, pure props-driven
          groupBy={areaView.groupBy}
          onGroupByChange={areaView.setGroupBy}
          groupByOptions={AREA_GROUP_OPTIONS}
          ...
        />
      }
      activeContent={
        <GroupedItemList                    // Atomic component, doesn't know which page it's in
          groups={activeGroups}
          groupHeaderAction={...}
        />
      }
    />
  )
}
```

### Four Prohibitions

#### 1. Components Must Not Detect Their Own Context

Components shouldn't know "which page am I on." If different behavior is needed, the page passes it via props.

```tsx
// ❌ Component detects context internally
function ContentFilterPopover() {
  const viewState = useContentViewState() // adapter hook detects areaId/dateScope
  if (viewState.hasGroupBy) { ... }       // internal branching
}

// ✅ Page passes props, component doesn't need to know context
function ContentFilterPopover({ groupBy, onGroupByChange, ... }: Props) {
  // Has groupBy prop → show grouping section, doesn't have it → don't show
  // No if/else needed — presence/absence of props is the configuration
}
```

#### 2. No Adapter Hooks

If a hook's sole purpose is "determine which page we're on, then return the corresponding store/data," it shouldn't exist. Each page directly calls its own store.

```tsx
// ❌ Adapter hook
function useContentViewState(areaId?: string, dateScope?: string) {
  if (dateScope) return useTodayStore()
  if (areaId) return useAreaStore()
  return useThingsStore()
}

// ✅ Page directly uses its own store
// things.tsx:  const viewStore = useThingsViewStore()
// today.tsx:   const todayView = useTodayContentViewStore()
// area.tsx:    const areaView = useAreaThingsViewStore()
```

#### 3. No mode/boolean Props That Switch Behavior Paths

If removing a prop requires deleting more than a few lines of code, it's actually two components.

```tsx
// ❌ Mode props
<ContentView mode="area" />
<ContentView mode="today" />
<List showAreaName={false} showGroupHeaders={true} showReschedule={false} />

// ✅ Each page composes different components or passes different render props
<GroupedItemList
  groupHeaderAction={group =>
    group.key === 'overdue' ? <Reschedule /> : <PlusButton />
  }
/>
```

#### 4. Don't Merge Different Pages' Logic to "Reduce Duplication"

Multiple pages having similar 10-line data processing code is **acceptable duplication**. Extracting a shared hook will reintroduce context detection.

> Three similar lines of code is better than a premature abstraction.

### When to Extract Components vs Keep in Page

| Extract as shared component | Keep in page |
|---|---|
| Identical visual element used in 2+ places, same props interface | Only used in one place |
| Component is self-contained, doesn't need parent context | Needs mode props to work in different contexts |
| Has a clear, self-describing name | Name needs "Multi"/"Universal"/"Shared" prefix |

### Real-World Example: ContentView Decomposition

**Before**: `ContentView` — one component serving Things / Area / Today pages, internally detecting context via `areaId` / `dateScope`.

**After**: Split into three atomic components + page-level composition:

| Atomic Component | Responsibility | How Pages Use It |
|---|---|---|
| `ContentTabs` | Tab shell (Active/Completed/Habits) | All three pages use it, passing content via slot props |
| `GroupedItemList` | Render grouped lists | Three pages pass different groups + groupHeaderAction |
| `ContentFilterPopover` | Filter popover | Things/Area pass all props, Today only passes importantFilter |

Each component is purely props-driven, unaware of which page it's in. Differences between pages (data filtering, grouping, which filter options to show) are all handled at the page layer.

---

## References

- [Sharing State Between Components — React Official](https://react.dev/learn/sharing-state-between-components)
- [Inversion of Control — Kent C. Dodds](https://kentcdodds.com/blog/inversion-of-control)
- [Compound Components — Kent C. Dodds](https://kentcdodds.com/blog/compound-components-with-react-hooks)
- [Soul-Crushing Components — Epic React](https://www.epicreact.dev/soul-crushing-components)
- [Control Props — Epic React](https://www.epicreact.dev/control-props-give-your-react-components-superpowers-xitiw)
- [State Reducer Pattern — Kent C. Dodds](https://kentcdodds.com/blog/the-state-reducer-pattern-with-react-hooks)
- [Colocation — Kent C. Dodds](https://kentcdodds.com/blog/colocation)
- [State Colocation — Kent C. Dodds](https://kentcdodds.com/blog/state-colocation-will-make-your-react-app-faster)
- [Mixing Component Patterns — Kent C. Dodds](https://kentcdodds.com/blog/mixing-component-patterns)
- [Presentational and Container Components — Dan Abramov (2019 retraction)](https://medium.com/@dan_abramov/smart-and-dumb-components-7ca2f9a7c7d0)
- [Container/Presentational Pattern — patterns.dev](https://www.patterns.dev/react/presentational-container-pattern/)
- [Headless Component — Martin Fowler (Juntao Qiu)](https://martinfowler.com/articles/headless-component.html)
- [Bulletproof React — alan2207](https://github.com/alan2207/bulletproof-react)
- [Partially Controlled Components — James Kerr](https://www.jameskerr.blog/posts/partially-controlled-react-components/)
- [useControllableState — Chakra UI](https://v2.chakra-ui.com/docs/hooks/use-controllable)
- [10 Component Commandments — selbekk](https://dev.to/selbekk/the-10-component-commandments-2a7f)
- [Configuration vs Composition — Ryan Muller Kennedy](https://www.rmkennedy.com/posts/config-vs-compose)
- [React Components Composition — Nadia Makarevich (developerway.com)](https://www.developerway.com/posts/components-composition-how-to-get-it-right)
- [How to Avoid the Boolean Trap — SpiceFactory](https://spicefactory.co/blog/2019/03/26/how-to-avoid-the-boolean-trap-when-designing-react-components/)
- [One React Mistake That's Slowing You Down — Kent C. Dodds](https://www.epicreact.dev/one-react-mistake-thats-slowing-you-down)
