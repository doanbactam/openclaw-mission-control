# 🎨 OpenClaw Mission Control — Design System

> **Nguồn chân lý duy nhất (Single Source of Truth)** cho mọi quyết định thiết kế UI/UX trong dự án.
> Lấy cảm hứng từ **Apple Human Interface Guidelines (HIG)**, **Codex IDE** (OpenAI, Mac) và **Conductor IDE** (Melty Labs).

---

## Mục lục

1. [Triết lý thiết kế](#1-triết-lý-thiết-kế)
2. [Nguyên tắc cốt lõi](#2-nguyên-tắc-cốt-lõi)
3. [Bảng màu & Dark Mode](#3-bảng-màu--dark-mode)
4. [Typography](#4-typography)
5. [Spacing & Layout](#5-spacing--layout)
6. [Components](#6-components)
7. [Motion & Animation](#7-motion--animation)
8. [Iconography](#8-iconography)
9. [Patterns từ Codex IDE](#9-patterns-từ-codex-ide)
10. [Patterns từ Conductor IDE](#10-patterns-từ-conductor-ide)
11. [Accessibility](#11-accessibility)
12. [Responsive & Adaptive](#12-responsive--adaptive)
13. [Checklist cho mỗi Component mới](#13-checklist-cho-mỗi-component-mới)
14. [Anti-patterns](#14-anti-patterns)

---

## 1. Triết lý thiết kế

### 1.1. Aesthetic-Usability Effect
> Giao diện đẹp hơn được **cảm nhận** là dễ dùng hơn, ngay cả khi chức năng tương đương.

Mọi quyết định thiết kế đều phải phục vụ **ba mục tiêu**:
- **Clarity** — Mọi pixel đều có mục đích. Không noise, không decoration thừa.
- **Deference** — UI nhường chỗ cho content. Giao diện "biến mất" để người dùng tập trung vào công việc.
- **Depth** — Sử dụng layers, shadows và motion để tạo hierarchy rõ ràng.

### 1.2. Developer-First IDE Mindset
Đây là **công cụ cho developer**, không phải marketing page. Thiết kế phải:
- **Tĩnh, bình thản** — Không gây phân tâm khi đang theo dõi agent
- **Information-dense** — Hiển thị nhiều thông tin nhưng có tổ chức
- **Keyboard-first** — Mọi hành động quan trọng đều có phím tắt

### 1.3. Orchestration-Centric
Lấy cảm hứng từ Codex IDE và Conductor IDE — Mission Control là **trung tâm điều phối**:
- Nhìn tổng quan (overview) trước, chi tiết (detail) sau
- Parallel agent tracking — theo dõi nhiều agent cùng lúc
- Diff-first review model — thay đổi phải dễ review

---

## 2. Nguyên tắc cốt lõi

### 2.1. Từ Apple HIG

| Nguyên tắc | Áp dụng vào Mission Control |
|---|---|
| **Clarity** | Text rõ ràng, icons nhất quán, không ambiguity |
| **Consistency** | Dùng chung design tokens, không ad-hoc styling |
| **Deference** | UI mờ nhạt, content nổi bật. Background luôn tối, accent chỉ 4 màu |
| **Direct Manipulation** | Drag-drop task card, resize sidebar bằng chuột |
| **Feedback** | Mọi action đều có visual response trong < 100ms |
| **Metaphors** | Kanban board = bản đồ nhiệm vụ, Sidebar = radar agent |
| **User Control** | Người dùng luôn có thể Undo, luôn có escape hatch |

### 2.2. Từ Codex IDE

| Nguyên tắc | Áp dụng |
|---|---|
| **Command Center** | Một nơi duy nhất quản lý tất cả agents |
| **Parallel Execution View** | Hiển thị nhiều agent chạy song song, mỗi agent có lane riêng |
| **Skill Management** | Task categories rõ ràng, có thể tạo template |
| **Git-native Workflow** | Status tracking giống branch/commit flow |
| **Diff Review** | Task output hiển thị dạng diff khi có thay đổi |

### 2.3. Từ Conductor IDE

| Nguyên tắc | Áp dụng |
|---|---|
| **Native-feeling Interface** | Snappy, mượt, không giật — dùng CSS transitions thay JS animation |
| **Context-driven Development** | Hiển thị đủ context xung quanh mỗi task |
| **Workspace Organization** | Phân nhóm theo status: backlog, in progress, in review, done |
| **Frictionless Multi-track** | Switch giữa các agent view không mất context |
| **Beautiful & Minimal** | Cả Light lẫn Dark theme đều phải đẹp, nhưng Dark-first |

---

## 3. Bảng màu & Dark Mode

### 3.1. Dark-first Color Palette

Sử dụng **OKLCH** color space cho tính nhất quán về perception.

```
Background tiers (từ tối → sáng):
──────────────────────────────────
Tier 0 (deepest):   oklch(0.08 0 0)   — App background
Tier 1 (surface):   oklch(0.10 0 0)   — Sidebar background
Tier 2 (card):      oklch(0.12 0 0)   — Card, panel background
Tier 3 (elevated):  oklch(0.14 0 0)   — Popover, dropdown
Tier 4 (hover):     oklch(0.16 0 0)   — Hover state
Tier 5 (active):    oklch(0.18 0 0)   — Active state, muted
Tier 6 (highlight): oklch(0.22 0 0)   — Accent background
```

### 3.2. Semantic Color Tokens — Chỉ 4 accent

> **Quy tắc bất biến**: Không bao giờ thêm accent color mới. 4 màu là đủ.

| Token | OKLCH Value | Dùng cho |
|---|---|---|
| `--accent-green` | `oklch(0.72 0.18 155)` | Active, success, online, done |
| `--accent-blue` | `oklch(0.65 0.18 250)` | Running, in-progress, info, focus ring |
| `--accent-orange` | `oklch(0.75 0.16 65)` | Warning, blocked, needs attention |
| `--accent-red` | `oklch(0.65 0.2 25)` | Error, destructive, critical |

### 3.3. Text Colors

```
Primary text:     oklch(0.95 0 0)   — Tiêu đề, nội dung chính
Secondary text:   oklch(0.85 0 0)   — Label, subtitle
Muted text:       oklch(0.55 0 0)   — Timestamp, metadata, hint
Disabled text:    oklch(0.35 0 0)   — Disabled state
```

### 3.4. Dark Mode Rules (theo Apple HIG)

1. **KHÔNG dùng pure black (#000)** cho background — có thể gây OLED halo. Minimum `oklch(0.08 0 0)`.
2. **KHÔNG dùng pure white (#fff)** cho text — quá chói. Maximum `oklch(0.95 0 0)`.
3. **Semantic colors phải adaptive** — green/blue/orange/red dùng chroma thấp hơn trong dark mode.
4. **Borders phải subtle** — `oklch(0.2 0 0)`, không bao giờ solid white hoặc chroma border.
5. **Elevation = opacity thay shadow** — Ở dark mode, tăng lightness thay vì thêm shadow nặng.
6. **Test với "Increase Contrast" setting** — Contrast ratio text/background ≥ 4.5:1 cho body, ≥ 3:1 cho large text.

---

## 4. Typography

### 4.1. Font Stack

```css
--font-sans: "Outfit", system-ui, -apple-system, sans-serif;
--font-mono: "SF Mono", "Fira Code", monospace;
--font-serif: Georgia, serif; /* chỉ dùng cho quotes nếu cần */
```

> **Outfit** được chọn vì geometric sans-serif phù hợp với developer tools — rõ ràng, hiện đại, trung tính.

### 4.2. Type Scale — 8pt Grid

Lấy theo nguyên tắc Apple HIG với 8pt base grid:

| Role | Size | Weight | Line-height | Letter-spacing | Dùng cho |
|---|---|---|---|---|---|
| **Display** | 28px | 600 | 1.2 | -0.02em | Page title, hero |
| **Title 1** | 22px | 600 | 1.3 | -0.015em | Section heading |
| **Title 2** | 18px | 600 | 1.35 | -0.01em | Card title, modal title |
| **Title 3** | 16px | 500 | 1.4 | 0 | Subsection heading |
| **Body** | 14px | 400 | 1.5 | 0 | Default body text |
| **Body Small** | 13px | 400 | 1.5 | 0 | Secondary info |
| **Caption** | 12px | 400 | 1.4 | 0.01em | Metadata, timestamps |
| **Overline** | 11px | 500 | 1.3 | 0.06em | Label, category tag |
| **Mono** | 13px | 400 | 1.5 | 0 | Code, IDs, technical data |

### 4.3. Typography Rules

1. **Maximum 2 font weights trên mỗi component** — thường là Regular (400) và Semibold (600).
2. **Không dùng font-weight < 400** — Light/Thin khó đọc trên dark background.
3. **Negative letter-spacing cho heading** — tạo cảm giác compact và premium.
4. **Positive letter-spacing cho overline/label** — tăng readability ở kích thước nhỏ.
5. **Line-height giảm dần theo font-size tăng** — heading 1.2, body 1.5.
6. **Dùng `font-variant-numeric: tabular-nums`** cho bất kỳ số nào cần align.

---

## 5. Spacing & Layout

### 5.1. Spacing Scale — 4pt Base

Theo Apple HIG, dùng **8pt grid** nhưng cho phép chia nhỏ đến 4pt:

| Token | Value | Dùng cho |
|---|---|---|
| `--space-0` | 0 | Reset |
| `--space-1` | 4px | Inline gap nhỏ nhất |
| `--space-2` | 8px | Icon-text gap, tight padding |
| `--space-3` | 12px | Standard padding nhỏ |
| `--space-4` | 16px | Card padding, section gap |
| `--space-5` | 20px | Component gap |
| `--space-6` | 24px | Section padding |
| `--space-8` | 32px | Page section gap |
| `--space-10` | 40px | Large section separation |
| `--space-12` | 48px | Page-level padding |

### 5.2. Layout Structure

```
┌──────────────── Header (56px) ─────────────────┐
├──────────┬────────────────────────┬─────────────┤
│          │                        │             │
│  Left    │                        │   Right     │
│ Sidebar  │     Main Content       │  Sidebar    │
│ (240px)  │    (Mission Queue)     │  (280px)    │
│          │                        │             │
│  Agents  │     Kanban Board       │  Live Feed  │
│  Roster  │                        │  Activity   │
│          │                        │             │
├──────────┴────────────────────────┴─────────────┤
```

### 5.3. Layout Rules

1. **Sidebar widths cố định** — Left 240px, Right 280px. Không responsive-shrink, chỉ collapse/expand.
2. **Header height = 56px** — Match với MacOS window chrome height.
3. **Content area: full fluid** — Kanban columns tự fill.
4. **Padding bên trong card: 16px** — Nhất quán, không thay đổi theo breakpoint.
5. **Gap giữa kanban columns: 12px** — Tight nhưng đủ để phân biệt.
6. **Card vertical gap: 8px** — Compact, information-dense.

### 5.4. Z-Index Scale

Quản lý z-index có hệ thống, không ad-hoc:

| Layer | Z-Index | Dùng cho |
|---|---|---|
| Base content | 0 | Cards, sidebars |
| Sticky header | 10 | Header bar |
| Tray system | 30 | Document/conversation trays |
| Drawer backdrop | 40 | Mobile sidebar backdrop |
| Drawer | 50 | Mobile sidebar |
| Agent tray backdrop | 99 | Agent detail backdrop |
| Agent tray | 100 | Agent detail panel |
| Modal backdrop | 200 | Modal overlay |
| Modal | 210 | Modal content |
| Toast/notification | 300 | Toasts |
| Tooltip | 400 | Tooltips |

---

## 6. Components

### 6.1. Card (TaskCard)

```
Design spec:
────────────
Background:     var(--card)           oklch(0.12 0 0)
Border:         1px solid var(--border)   oklch(0.2 0 0)
Border-radius:  var(--radius)         0.5rem (8px)
Padding:        16px
Shadow:         none (dark mode: elevation = lightness)
Hover:          background → oklch(0.14 0 0)
Selected:       ring 2px var(--accent-blue)
Running state:  subtle pulse animation on border
```

**State mapping:**
| State | Visual cue |
|---|---|
| Default | Card bg, border subtle |
| Hover | Bg lightens 1 tier |
| Selected/Active | Blue ring (2px) |
| Running | Pulse animation on border, blue tint |
| Blocked | Orange left border accent (3px) |
| Error | Red left border accent (3px) |

### 6.2. Button Variants

| Variant | Background | Text | Border | Dùng cho |
|---|---|---|---|---|
| **Primary** | `oklch(0.95 0 0)` | `oklch(0.08 0 0)` | none | CTA chính |
| **Secondary** | `oklch(0.16 0 0)` | `oklch(0.85 0 0)` | `oklch(0.2 0 0)` | Actions phụ |
| **Ghost** | transparent | `oklch(0.55 0 0)` | none | Toolbar, inline |
| **Destructive** | `oklch(0.65 0.2 25)` | white | none | Delete, remove |
| **Outline** | transparent | `oklch(0.85 0 0)` | `oklch(0.25 0 0)` | Toggle, filter |

**Button sizes:**
| Size | Height | Padding-x | Font-size |
|---|---|---|---|
| sm | 28px | 12px | 12px |
| md | 36px | 16px | 14px |
| lg | 44px | 20px | 16px |

### 6.3. Sidebar Component

```
Left Sidebar (Agent Roster):
─────────────────────────────
Width:          240px fixed
Background:     var(--sidebar) oklch(0.10 0 0)
Border-right:   1px solid var(--sidebar-border)
Padding:        12px
Item height:    44px
Item hover bg:  oklch(0.14 0 0)
Item active bg: oklch(0.18 0 0)
Avatar size:    32px
Status dot:     8px, positioned bottom-right of avatar
```

### 6.4. Input Fields

```
Background:     var(--input) oklch(0.16 0 0)
Border:         1px solid var(--border)
Border-radius:  var(--radius)
Height:         36px (md)
Padding:        0 12px
Font-size:      14px
Focus ring:     2px solid var(--ring)
Placeholder:    oklch(0.4 0 0)
```

### 6.5. Badge / Tag

```
Background:     oklch(0.18 0 0)
Text:           oklch(0.7 0 0)
Font-size:      11px
Font-weight:    500
Letter-spacing: 0.04em
Padding:        2px 8px
Border-radius:  4px
Text-transform: uppercase
```

Với semantic badges (level):
| Badge | Background | Text |
|---|---|---|
| LEAD | `oklch(0.2 0.05 250)` | `oklch(0.8 0.1 250)` |
| INT | `oklch(0.2 0.04 155)` | `oklch(0.8 0.08 155)` |
| SPC | `oklch(0.2 0.03 65)` | `oklch(0.8 0.06 65)` |

### 6.6. Modal / Dialog

```
Backdrop:       rgba(0, 0, 0, 0.7) + backdrop-filter: blur(8px)
Container:      oklch(0.12 0 0)
Border:         1px solid oklch(0.2 0 0)
Border-radius:  12px
Shadow:         var(--shadow-2xl)
Max-width:      480px (small), 640px (medium), 800px (large)
Padding:        24px
Entry animation: scale(0.96) → scale(1), opacity 0 → 1, 200ms ease-out
Exit animation:  scale(1) → scale(0.98), opacity 1 → 0, 150ms ease-in
```

### 6.7. Tray (Sliding Panel)

Lấy theo pattern Codex IDE — panel trượt từ cạnh:

```
Width:          380px
Background:     var(--card)
Border-left:    1px solid var(--border)
Shadow:         var(--shadow-lg)
Transition:     transform 250ms cubic-bezier(0.4, 0, 0.2, 1)
```

---

## 7. Motion & Animation

### 7.1. Timing Tokens

Lấy nguyên tắc từ Apple HIG:

| Token | Duration | Easing | Dùng cho |
|---|---|---|---|
| `--transition-fast` | 100ms | ease-out | Hover, focus |
| `--transition-normal` | 200ms | ease-out | Expand, collapse |
| `--transition-smooth` | 250ms | cubic-bezier(0.4, 0, 0.2, 1) | Slide, tray |
| `--transition-slow` | 400ms | cubic-bezier(0.4, 0, 0.2, 1) | Page transition |

### 7.2. Motion Principles

1. **Purposeful** — Animation phải communicate something (hierarchy, state change, spatial relationship). Không animate vì đẹp.
2. **Fast** — Micro-interactions < 200ms. Người dùng không "đợi" animation.
3. **Natural** — Dùng spring-like easing. Không linear. Không bounce.
4. **Respectful** — Luôn honor `prefers-reduced-motion: reduce`.
5. **Consistent direction** — Tray luôn slide cùng hướng. Không jump.

### 7.3. Allowed Animations

| Animation | Where | Duration |
|---|---|---|
| Fade in/out | Toast, modal backdrop | 200ms |
| Slide left/right | Tray, sidebar drawer | 250ms |
| Scale up | Modal entry | 200ms |
| Pulse glow | Running task card | 2.5s infinite |
| Color transition | Hover state | 100ms |
| Status dot blink | Agent online | 2s infinite |

### 7.4. Forbidden Animations

❌ Bounce  
❌ Spin (ngoại trừ loading spinner)  
❌ Fly-in từ trên xuống  
❌ Parallax scrolling  
❌ Text typing animation  
❌ Skeleton loading shimmer quá sáng  

---

## 8. Iconography

### 8.1. Icon Style

- Dùng **Lucide React** icon set (consistent, minimal stroke).
- Stroke width: **1.5px** (default của Lucide).
- Size: **16px** (inline), **20px** (button), **24px** (header/nav).
- Color: inherit từ text color, không bao giờ hardcode.

### 8.2. Icon Rules

1. **Mọi icon đều phải có `aria-label`** nếu standalone (không có text).
2. **Icon + Text**: icon bên trái, gap 8px.
3. **Không dùng icon thay text** cho action quan trọng — luôn có label.
4. **Status indicators**: dùng filled circle (●) thay vì icon.

---

## 9. Patterns từ Codex IDE

### 9.1. Agent Orchestration View

Lấy cảm hứng từ cách Codex IDE hiển thị multiple agents:

```
┌─ Agent Lane ──────────────────────────────┐
│ 🟢 fury        │ ██████████░░ 3 tasks     │
│ 🔵 jarvis      │ ████░░░░░░░░ 1 task      │
│ 🟠 scout       │ ░░░░░░░░░░░░ blocked     │
│ ⚫ oracle      │ ░░░░░░░░░░░░ idle        │
└───────────────────────────────────────────┘
```

- Mỗi agent là một "lane" với progress bar
- Màu sắc = status (green/blue/orange/grey)
- Click vào agent → mở detail tray (không navigate away)

### 9.2. Skill-Template Pattern

Task creation (AddTaskModal) nên hỗ trợ templates giống Codex Skills:

```
Create Task:
├── Blank Task
├── From Template:
│   ├── 🔍 Research & Analysis
│   ├── 🛠️ Implementation
│   ├── 🧪 Testing & QA
│   ├── 📝 Documentation
│   └── 🔄 Refactoring
```

### 9.3. Review-First Output

Task output nên hiển thị dạng review-friendly:
- **Summary** — 1-2 dòng tóm tắt
- **Changes** — Diff view nếu có code changes
- **Conversation** — Full log của agent
- **Artifacts** — Files generated

---

## 10. Patterns từ Conductor IDE

### 10.1. Workspace Status Organization

Kanban columns mapping theo Conductor IDE's workspace statuses:

| Conductor Status | Mission Control Column | Color Indicator |
|---|---|---|
| Backlog | INBOX | Grey |
| In Progress | IN PROGRESS | Blue |
| In Review | REVIEW | Orange |
| Done | DONE | Green |

### 10.2. Context Panel

Khi mở task detail, hiển thị đủ context (lấy từ Conductor approach):

```
Task Detail Panel:
├── Header: Title + Status badge + Agent avatar
├── Meta: Created time, updated time, tags
├── Description: Full markdown content
├── Context Files: Related documents/resources
├── Agent Activity: Timeline of agent actions
├── Output: Results, artifacts, diffs
└── Actions: Move status, reassign, comment
```

### 10.3. Multi-Track Navigation

- **Không mất context khi switch view** — state persist
- **Breadcrumb-like trail** cho navigation depth
- **Quick-switch** giữa agents bằng keyboard shortcut

### 10.4. Tooltip & Error UX

Theo Conductor IDE's refined approach:
- Tooltip delay: **300ms** trước khi show
- Tooltip position: **trên** element (prefer top)
- Error messages: **inline** gần action gây lỗi, không toast
- Warning: **yellow/orange** banner ở top của relevant section

---

## 11. Accessibility

### 11.1. Core Requirements (theo Apple HIG)

1. **Color contrast**: ≥ 4.5:1 cho text, ≥ 3:1 cho graphical elements.
2. **Focus visible**: Mọi interactive element phải có focus ring rõ ràng.
3. **Keyboard navigation**: Tab order logic, Enter/Space activate, Escape close.
4. **Screen reader**: Semantic HTML, ARIA labels, live regions cho realtime updates.
5. **Reduced motion**: Honor `prefers-reduced-motion`.
6. **No color-only information**: Status indicators phải có text/icon bổ sung, không chỉ dựa vào color.

### 11.2. ARIA Patterns

| Component | ARIA Role | Notes |
|---|---|---|
| Kanban board | `role="region"` | `aria-label="Mission Queue"` |
| Column | `role="list"` | `aria-label="In Progress tasks"` |
| Task card | `role="listitem"` | Include status in label |
| Sidebar | `role="complementary"` | `aria-label="Agent Roster"` |
| Live feed | `role="log"` | `aria-live="polite"` |
| Modal | `role="dialog"` | `aria-modal="true"` |
| Tray | `role="complementary"` | `aria-label="Task Detail"` |

---

## 12. Responsive & Adaptive

### 12.1. Breakpoints

| Breakpoint | Width | Layout behavior |
|---|---|---|
| Desktop | > 1024px | Full 3-column layout |
| Tablet | 768–1024px | Collapsible sidebars |
| Mobile | < 768px | Single column, drawer sidebars |

### 12.2. Responsive Rules

1. **Desktop**: Sidebars always visible, trays overlay main content.
2. **Tablet**: Sidebars collapsible, tray takes 50% width.
3. **Mobile**: Sidebars = full-screen drawers, tray = full-screen.
4. **Touch targets**: ≥ 44px minimum trên mobile (theo Apple HIG).
5. **Swipe gestures**: Swipe left/right để mở sidebar trên mobile.
6. **No horizontal scroll**: Kanban columns stack vertically trên mobile.

---

## 13. Checklist cho mỗi Component mới

Trước khi merge bất kỳ component nào, kiểm tra:

### Design
- [ ] Sử dụng design tokens, không hardcode màu/spacing
- [ ] Chỉ dùng 4 accent colors (green, blue, orange, red)
- [ ] Typography theo type scale, max 2 weights per component
- [ ] Spacing theo 4pt/8pt grid
- [ ] Dark mode là default, test contrast ≥ 4.5:1

### Interaction
- [ ] Hover state defined
- [ ] Focus state visible (ring)
- [ ] Active/pressed state defined
- [ ] Disabled state muted
- [ ] Loading state nếu async
- [ ] Transition timing dùng design tokens

### Accessibility
- [ ] Keyboard navigable
- [ ] ARIA labels cho non-text elements
- [ ] `prefers-reduced-motion` honored
- [ ] Screen reader tested

### Consistency
- [ ] Match existing component patterns
- [ ] Unique ID cho mỗi interactive element
- [ ] Responsive tại 3 breakpoints
- [ ] Z-index theo scale đã define

---

## 14. Anti-patterns

### ❌ KHÔNG BAO GIỜ LÀM

| Anti-pattern | Tại sao sai | Làm gì thay thế |
|---|---|---|
| Dùng `#000000` background | Gây OLED halo | `oklch(0.08 0 0)` |
| Dùng `#ffffff` text | Quá chói | `oklch(0.95 0 0)` |
| Thêm accent color thứ 5 | Phá vỡ hệ thống | Dùng trong 4 màu hiện có |
| Hardcode px values cho spacing | Không maintain được | Dùng spacing tokens |
| Animation > 400ms | Cảm giác chậm | Max 250ms cho transitions |
| Box-shadow nặng trong dark mode | Không hiệu quả | Dùng border + lightness tier |
| Dùng `!important` | Override wars | Fix specificity |
| Font-weight < 400 | Khó đọc dark bg | Min weight = 400 |
| Color-only status | Accessibility fail | Thêm icon hoặc text |
| Inline styles | Không maintain | Dùng CSS classes + tokens |
| Z-index random (999, 9999) | Z-index war | Theo z-index scale |
| Scrollbar styling quá sáng | Gây phân tâm | 4px width, subtle color |

---

## Appendix: CSS Custom Properties Reference

```css
/* Copy vào root khi cần reference nhanh */
:root {
  /* Background tiers */
  --bg-tier-0: oklch(0.08 0 0);
  --bg-tier-1: oklch(0.10 0 0);
  --bg-tier-2: oklch(0.12 0 0);
  --bg-tier-3: oklch(0.14 0 0);
  --bg-tier-4: oklch(0.16 0 0);
  --bg-tier-5: oklch(0.18 0 0);
  --bg-tier-6: oklch(0.22 0 0);

  /* Text */
  --text-primary: oklch(0.95 0 0);
  --text-secondary: oklch(0.85 0 0);
  --text-muted: oklch(0.55 0 0);
  --text-disabled: oklch(0.35 0 0);

  /* Accents — THE ONLY 4 */
  --accent-green: oklch(0.72 0.18 155);
  --accent-blue: oklch(0.65 0.18 250);
  --accent-orange: oklch(0.75 0.16 65);
  --accent-red: oklch(0.65 0.2 25);

  /* Spacing */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;

  /* Transitions */
  --transition-fast: 100ms ease-out;
  --transition-normal: 200ms ease-out;
  --transition-smooth: 250ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-slow: 400ms cubic-bezier(0.4, 0, 0.2, 1);

  /* Border radius */
  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-lg: 8px;
  --radius-xl: 12px;
}
```

---

> **Cập nhật lần cuối**: 2026-02-10  
> **Maintainer**: OpenClaw Team  
> **Phiên bản**: 1.0.0
