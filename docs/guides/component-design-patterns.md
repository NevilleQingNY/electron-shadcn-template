# Component Design Patterns: Controlled vs Self-Contained

> 调研日期: 2026-03-04
> 目的: 为 Item 组件重构（TaskItem / HabitItem / MomentItem）奠定理论基础

## 结论

给 Item 组件各抽一个 headless hook（`useTaskActions`、`useHabitActions`、`useMomentActions`），把交互逻辑 + API 调用 + 副作用全部内聚到 hook 里。组件消费 hook，父组件只传 `data` + `onMutated`。

```tsx
// Before: 父组件绑定 8 个 callback（每个使用点重复一遍）
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

// After: 父组件只关心"数据变了要刷新"
<HabitItem habit={habit} todayLog={logMap.get(habit.id)} todayStr={todayStr} onMutated={reload} />
```

核心原因：这些 Item 在所有使用场景（tasks 页、area-detail 页、project-detail 页）的行为完全一致，没有任何理由让父组件重复编排相同的逻辑。

---

## 一、组件自治光谱

React 官方的 controlled/uncontrolled 是针对表单元素的狭义定义。业务组件需要一个更完整的光谱：

```
Self-Contained → Control Props → Partially Controlled → State Reducer → Headless
  最易用                                                              最灵活
  最不灵活                                                            最难用
```

选择标准不是"哪个更高级"，而是"当前需要多少灵活性"。

Kent C. Dodds 的核心原则：**从简单（self-contained）开始，有具体需求时再加灵活性。**

> "You can create a simple convenience API on top of a flexible base pattern without sacrificing flexibility, but reversing this is nearly impossible."

### 各层级定义

**Self-Contained（自治）**: 组件管理自己所有状态和副作用。最易用，最不灵活。适合行为固定的业务实体。

**Control Props（双模式）**: 组件默认自治，但接受 `value` + `onChange` 时交出控制权。Chakra UI、Radix UI、React Aria 都收敛到 `useControllableState` 这个 hook 模式。

**Partially Controlled（选择性控制）**: 复杂组件暴露多个独立的状态切片，每个切片可独立受控或自治。适合树、数据表格等复杂组件。

**State Reducer（完全反转控制）**: 消费者可以拦截和修改任何状态转换。内部状态结构成为公开 API。适合高度可复用的库组件（如 downshift）。

**Headless（纯逻辑）**: 纯 hook/context 提供逻辑，不包含任何渲染。完全反转控制。Radix UI、React Aria、Headless UI 用这个模式。

---

## 二、关键原则（来自文献共识）

### 1. State Colocation — 状态放在最近使用处

> "Place code as close to where it's relevant as possible."
> — Kent C. Dodds, [Colocation](https://kentcdodds.com/blog/colocation)

决策树：
1. 状态只有一个组件用 → 放那个组件里
2. 兄弟组件共享 → 提升到共同父级
3. Prop drilling 严重 → 用 Context，但尽量放在低层级

### 2. Hooks 替代 Container/Presentational

Dan Abramov 2019 年收回了 Smart/Dumb 组件分类：

> "Hooks let me do the same thing without an arbitrary division."
> — Dan Abramov, [Presentational and Container Components (2019 retraction)](https://medium.com/@dan_abramov/smart-and-dumb-components-7ca2f9a7c7d0)

不需要严格区分"容器组件"和"展示组件"。用 hook 分离逻辑，组件本身可以同时持有逻辑和 UI。

### 3. Apropcalypse — Prop 爆炸的反模式

> 需求来了 → 加一个 prop → 又来需求 → 再加一个 prop → 组件 API 变成 monster
> — Kent C. Dodds, [Soul-Crushing Components](https://www.epicreact.dev/soul-crushing-components)

解法有两种（视场景选择）：
- **库组件**: 用组合替代配置（Compound Components）
- **业务组件**: 用 headless hook 内聚逻辑

### 4. Headless Component — 逻辑与 UI 分离

> "A Headless Component is a design pattern in React where a component — normally implemented as React hooks — is responsible solely for logic and state management without prescribing any specific UI."
> — Juntao Qiu, [Headless Component (martinfowler.com)](https://martinfowler.com/articles/headless-component.html)

### 5. 不提前抽象

> "The idea isn't necessarily to encourage that every component be implemented this way."
> — Kent C. Dodds, [Mixing Component Patterns](https://kentcdodds.com/blog/mixing-component-patterns)

只在有具体需求时才加灵活性。业务组件不需要库级别的通用性。

---

## 三、当前 Codebase 问题诊断

### 现状：责任割裂的 Smart 组件

当前 Item 组件（TaskItem、HabitItem、MomentItem）处于尴尬的中间地带：

| 责任 | 归属 |
|------|------|
| Display（怎么渲染） | 组件自己 |
| Interaction（modal 编排） | 组件自己（直接访问 4+ global stores） |
| Data/Effect（API 调用） | 父组件通过 callbacks 传入 |

组件"知道"怎么交互（编排 modal），但不"拥有"执行权（mutation 交给 callback）。两种模式混用。

### 具体痛点

**Prop 爆炸**: HabitItem 接收 8 个 callbacks，TaskItem 接收 7 个。

**重复绑定**: TaskItem 在 3 个地方（tasks.tsx、area-detail.tsx、project-detail-content.tsx）使用，每处写一遍完全相同的 callback 绑定。

**隐式依赖**: 组件直接访问 `usePromptStore`、`useConfirmStore`、`useDatePickerStore`、`usePinnedStore`，但这些依赖在 props 中不可见。

---

## 四、建议方案：Headless Hook + Self-Contained Item

### 组件分层

| 层级 | 模式 | 例子 | 依据 |
|------|------|------|------|
| 视觉原语 | Pure Display, 无状态 | TaskCheckbox, HabitCheckbox, ProjectStatusRing | React docs |
| UI 基础设施 | 非受控 + ref（`defaultValue` + `getValue/setValue`） | TimePicker, DurationPicker, TaskDateTimePicker, RichTextEditor | React uncontrolled pattern（详见第六节） |
| 业务实体 | Self-Contained + Headless Hook | TaskItem + useTaskActions | state colocation + headless pattern |
| Detail 视图 | Hook-Driven（现有模式） | TaskDetailContent + useTaskDetail | hooks 替代 container |
| 页面 | Orchestrator | TasksPage, AreaDetailPage | Bulletproof React |

### 具体实现模式

#### Headless Hook（逻辑层）

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

#### Self-Contained Item（消费 hook）

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

#### 父组件（极简）

```tsx
// routes/tasks.tsx
{tasks.map(task => (
  <TaskItem key={task.id} task={task} onMutated={reloadTasks} />
))}
```

### 与现有 useTaskDetail 的关系

`useTaskDetail` 已经是一个准 headless hook，模式正确。`useTaskActions` 可以被 `useTaskDetail` 复用，避免重复实现相同的 rename / delete / setDate 逻辑。

---

## 五、决策原则速查

1. **默认 self-contained** — 从简单开始（Kent: "start simple"）
2. **用 hook 分离逻辑** — 不用 container 组件（Dan Abramov 2019）
3. **状态放在最近使用处** — 只有 TaskItem 用的逻辑就放 TaskItem 里（Kent: state colocation）
4. **遇到 prop 爆炸，优先内聚逻辑** — 不是拆更多组件（Kent: apropcalypse）
5. **不提前抽象** — 只在有具体需求时才加灵活性（YAGNI）
6. **行为一致就该内聚** — 同一行为在所有场景一致 = 属于组件自己（Bulletproof React: colocation）

---

## 六、UI 基础设施层 — 非受控复杂输入组件

> 补充日期: 2026-03-05
> 目的: 记录业务组件四层模型之外的一类重要组件模式

### 问题：四层模型的盲区

第四节的组件分层（视觉原语 → 业务实体 → Detail 视图 → 页面）覆盖了所有**业务组件**，但遗漏了一类重要组件：**内部状态复杂的输入控件**。

这类组件不属于任何业务层级——它们是被业务层消费的 UI 基础设施，类似 `<Input>` / `<Textarea>` 的复杂版本。

### 当前实例

| 组件 | 内部状态 | ref 接口 | 消费者 |
|------|---------|---------|--------|
| `TaskDateTimePicker` | 日期 + 时间 + 时长（组合 3 个子 picker） | `getValue() / setValue()` | `GlobalDatePickerDialog` |
| `TimePicker` | 时间字符串 + popover + 输入解析 | `getValue() / setValue() / focus()` | `TaskDateTimePicker` |
| `DurationPicker` | 分钟数 + popover + 自定义输入展开 | `getValue() / setValue() / focus()` | `TaskDateTimePicker` |
| `RichTextEditor`（待加） | EditorState + 选区 + 历史 + 菜单 | `getValue() / setValue() / focus()` | `TaskDetailContent` 等 |

### 模式：非受控 + ref + 可选 onChange 通知

```tsx
// 接口约定
interface ComplexInputProps {
  defaultValue?: T | null       // 仅用于初始化，不持续同步
  onChange?: (value: T) => void  // 可选通知回调（不控制组件状态）
  // ...其他配置 props
}

interface ComplexInputRef {
  getValue: () => T             // 命令式取当前值
  setValue: (value: T | null) => void  // 命令式设值
  focus?: () => void            // 可选
}
```

关键特征：

1. **`defaultValue` 只读一次** — `useState(defaultValue)` 初始化，无 `useEffect` 同步后续 prop 变化
2. **`onChange` 是通知，不是控制** — 父组件收到通知后不回写 value，组件继续自治
3. **`ref.getValue()` 是取值手段** — 父组件在特定时机（Confirm 点击 / debounce / blur）命令式取值
4. **`forwardRef` + `useImperativeHandle`** — 标准 React 非受控 ref 模式

### 与受控模式的选择标准

同一领域（日期选择）中两种模式共存：

| | `DatePicker`（受控） | `TimePicker` 等（非受控） |
|---|---|---|
| 接口 | `value` + `onChange` | `defaultValue` + `ref.getValue()` |
| 内部状态 | 无（父组件持有 `useState`） | 有（自己管多个 `useState`） |
| 适用条件 | 状态简单（一个 `Date`） | 状态复杂（解析 + 子组件组合 + popover + 编辑器引擎） |
| 使用场景 | 表单字段 | 组合选择器、富文本编辑器 |

**决策规则**：父组件能用一个 `useState` 管好的 → 受控。内部有复杂交互状态、子组件组合、或第三方引擎（Tiptap/ProseMirror）的 → 非受控 + ref。

### 组合模式

非受控组件可以嵌套组合，父组件通过 ref 聚合子组件的值：

```
TaskDateTimePicker (ref: getValue → 聚合下面三个)
  ├─ Calendar        ← 内部 useState 管日期
  ├─ TimePicker      ← ref: getValue 返回时间
  └─ DurationPicker  ← ref: getValue 返回时长
```

`TaskDateTimePicker.getValue()` 内部调用 `timePickerRef.current?.getValue()` 和 `durationPickerRef.current?.getValue()`，组合成最终的 `TaskDateTimeValue`。

### 与业务层的边界

非受控输入组件**不知道自己在编辑什么**（task? project? document?）。保存时机、保存目标、错误处理全部由消费者（Fat Hook / Dialog）决定：

```
Fat Hook (useTaskDetail)          ← 决定何时保存、保存到哪
    ↓ 消费
非受控输入 (RichTextEditor)       ← 只管编辑体验，不管持久化
    ↓ 内部用
引擎 (Tiptap/ProseMirror)        ← 纯 UI 状态管理
```

---

## 七、页面组合层 — 组合优先，禁止上下文判断

> 补充日期: 2026-03-10
> 目的: 解决"万能组件"反模式，明确页面级组件的拆分和组合原则

### 问题：万能组件 (God Component)

第四节的分层覆盖了视觉原语 → 业务实体 → Detail → 页面，但未回答一个关键问题：**当多个页面需要相似但不同的 UI 时，该怎么组织？**

错误做法是创建一个"万能组件"，通过 mode/context props 内部分支：

```tsx
// ❌ 反模式：万能组件
<ContentView
  areaId={id}           // 模式检测：有 areaId → area 模式
  dateScope="today"     // 行为开关：决定数据过滤方式
  showHabitsTab={false} // 布尔开关：切换渲染路径
/>
```

此模式的代价：
- **修改一个页面的行为，需要在共享组件里加 if/else，风险影响所有页面**
- 产生 adapter hook（存在的唯一目的是桥接组件到不同上下文）
- 组件内部越来越多的 `if (areaId)` / `if (dateScope)` / `if (showX)`，测试需要覆盖所有组合

Kent C. Dodds 称之为 **"Soul-Crushing Components"**：

> "I need it to do this differently, so I'll accept a new prop for that" leads to nothing but pain and frustration.

### 正确做法：乐高式组合

页面是 **orchestrator**，自己调 hook 获取数据，组合原子 UI 组件：

```tsx
// ✅ 正确模式：页面组合原子组件
function AreaDetailPage() {
  const areaView = useAreaThingsViewStore()    // 页面直接用自己的 store
  const projects = allProjects.filter(...)     // 页面自己过滤数据
  const activeGroups = buildFilteredGroups(...) // 页面自己调工具函数

  return (
    <ContentTabs
      filterSlot={
        <ContentFilterPopover              // 原子组件，纯 props 驱动
          groupBy={areaView.groupBy}
          onGroupByChange={areaView.setGroupBy}
          groupByOptions={AREA_GROUP_OPTIONS}
          ...
        />
      }
      activeContent={
        <GroupedItemList                    // 原子组件，不知道自己在哪个页面
          groups={activeGroups}
          groupHeaderAction={...}
        />
      }
    />
  )
}
```

### 四条禁令

#### 1. 禁止组件检测自身上下文

组件不应该知道"我在哪个页面"。如果需要不同行为，由页面通过 props 传入。

```tsx
// ❌ 组件内部检测上下文
function ContentFilterPopover() {
  const viewState = useContentViewState() // adapter hook 检测 areaId/dateScope
  if (viewState.hasGroupBy) { ... }       // 内部分支
}

// ✅ 页面传入 props，组件不需要知道上下文
function ContentFilterPopover({ groupBy, onGroupByChange, ... }: Props) {
  // 有 groupBy prop → 显示分组区块，没有 → 不显示
  // 不需要 if/else，props 的有无本身就是配置
}
```

#### 2. 禁止 adapter hook

如果一个 hook 的唯一作用是"判断当前在哪个页面，然后返回对应的 store/数据"，它不应该存在。每个页面直接调自己的 store。

```tsx
// ❌ Adapter hook
function useContentViewState(areaId?: string, dateScope?: string) {
  if (dateScope) return useTodayStore()
  if (areaId) return useAreaStore()
  return useThingsStore()
}

// ✅ 页面直接用自己的 store
// things.tsx:  const viewStore = useThingsViewStore()
// today.tsx:   const todayView = useTodayContentViewStore()
// area.tsx:    const areaView = useAreaThingsViewStore()
```

#### 3. 禁止 mode/boolean props 切换行为路径

如果删掉一个 prop 需要删超过几行代码，说明它实际上是两个组件。

```tsx
// ❌ Mode props
<ContentView mode="area" />
<ContentView mode="today" />
<List showAreaName={false} showGroupHeaders={true} showReschedule={false} />

// ✅ 各页面组合不同的组件或传不同的 render prop
<GroupedItemList
  groupHeaderAction={group =>
    group.key === 'overdue' ? <Reschedule /> : <PlusButton />
  }
/>
```

#### 4. 禁止为"减少重复"而合并不同页面的逻辑

多个页面有相似的 10 行数据处理代码，这是**可接受的重复**。提取共享 hook 会重新引入上下文判断。

> 三行相似代码优于一个过早抽象。

### 何时提取组件 vs 保留在页面

| 提取为共享组件 | 保留在页面 |
|---|---|
| 完全相同的视觉元素在 2+ 处使用，props 接口一致 | 只在一个地方使用 |
| 组件自包含，不需要知道父级上下文 | 需要 mode props 才能在不同上下文工作 |
| 有清晰、自描述的名字 | 名字需要带 "Multi"/"Universal"/"Shared" |

### 实际案例：ContentView 拆分

**Before**: `ContentView` 一个组件服务 Things / Area / Today 三个页面，内部通过 `areaId` / `dateScope` 判断上下文。

**After**: 拆成三个原子组件 + 页面自己组合：

| 原子组件 | 职责 | 页面如何使用 |
|---|---|---|
| `ContentTabs` | Tab shell（Active/Completed/Habits） | 三个页面都用，通过 slot props 传内容 |
| `GroupedItemList` | 渲染分组列表 | 三个页面传不同的 groups + groupHeaderAction |
| `ContentFilterPopover` | 筛选弹窗 | Things/Area 传全部 props，Today 只传 importantFilter |

每个组件都是纯 props 驱动，不知道自己在哪个页面。页面之间的差异（数据过滤、分组方式、显示哪些筛选项）全部在页面层处理。

---

## 参考文献

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
