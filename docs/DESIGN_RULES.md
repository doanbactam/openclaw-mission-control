# 🚦 Design Rules — Quick Reference

> Quy tắc bắt buộc khi viết UI/UX cho OpenClaw Mission Control.
> Đọc [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) để hiểu chi tiết đầy đủ.

---

## Nguồn cảm hứng

Thiết kế lấy cảm hứng từ 3 nguồn:

1. **[Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)** — Clarity, Consistency, Deference
2. **[Codex IDE](https://openai.com/codex)** (OpenAI, Mac) — Command center, parallel agent orchestration, skill management
3. **[Conductor IDE](https://conductor.build)** (Melty Labs) — Native-feeling, context-driven, workspace organization

---

## ✅ PHẢI LÀM

### Colors
- [x] Dark-first: `oklch(0.08 0 0)` background
- [x] Chỉ 4 accent: green, blue, orange, red
- [x] Text primary ≤ `oklch(0.95 0 0)`, không pure white
- [x] Contrast ratio ≥ 4.5:1 cho body text

### Typography
- [x] Font: Outfit (sans), SF Mono/Fira Code (mono)
- [x] Max 2 font-weights per component
- [x] Min font-weight: 400 (Regular)
- [x] Heading: negative letter-spacing
- [x] Tabular nums cho số liệu

### Spacing
- [x] 4pt/8pt grid
- [x] Dùng spacing tokens, không hardcode
- [x] Card padding: 16px
- [x] Gap giữa cards: 8px
- [x] Gap giữa kanban columns: 12px

### Motion
- [x] Transitions ≤ 250ms cho UI, ≤ 400ms cho page
- [x] Dùng `cubic-bezier(0.4, 0, 0.2, 1)` cho slide
- [x] Honor `prefers-reduced-motion: reduce`
- [x] Hover: 100ms

### Layout
- [x] Header: 56px
- [x] Left sidebar: 240px
- [x] Right sidebar: 280px
- [x] Z-index theo scale (10, 30, 40, 50, 100, 200, 300, 400)
- [x] Mobile: drawer pattern, ≥ 44px touch targets

### Components
- [x] Card hover = bg lighten 1 tier
- [x] Card selected = blue ring 2px
- [x] Buttons: 4 variants (primary, secondary, ghost, destructive)
- [x] Modal: blur backdrop + scale entry animation
- [x] Tray: slide from edge, 380px width

### Accessibility
- [x] Keyboard navigable
- [x] ARIA labels
- [x] Focus ring visible
- [x] No color-only status indicators

---

## ❌ KHÔNG ĐƯỢC LÀM

- ❌ Pure black `#000000` / pure white `#ffffff`
- ❌ Thêm accent color thứ 5
- ❌ Hardcode pixel values cho spacing
- ❌ Font-weight < 400 (Light, Thin)
- ❌ Animation > 400ms
- ❌ Heavy box-shadow trong dark mode
- ❌ `!important` (sửa specificity thay vì override)
- ❌ Inline styles
- ❌ Z-index random (999, 9999)
- ❌ Color-only status (phải có icon/text kèm)
- ❌ Bounce, parallax, typing animation
- ❌ Skeleton shimmer quá sáng

---

## 📋 Component Checklist

Copy checklist này khi tạo component mới:

```
### [Component Name] Design Review
- [ ] Design tokens (no hardcoded colors/spacing)
- [ ] Max 4 accent colors
- [ ] Max 2 font weights
- [ ] 4pt/8pt spacing grid
- [ ] Contrast ≥ 4.5:1
- [ ] Hover, focus, active, disabled states
- [ ] Keyboard accessible
- [ ] ARIA labels
- [ ] prefers-reduced-motion
- [ ] Responsive (desktop, tablet, mobile)
- [ ] Z-index follows scale
- [ ] Unique IDs for interactive elements
```

---

## 🎯 IDE-Inspired Patterns

### Từ Codex IDE
- **Command center layout** — một view quản lý tất cả
- **Parallel agent lanes** — mỗi agent có progress track
- **Skill templates** — task creation có templates
- **Diff review** — output dạng review-friendly

### Từ Conductor IDE
- **Workspace status columns** — Backlog → In Progress → In Review → Done
- **Context panel** — task detail hiển thị đủ context
- **Multi-track navigation** — không mất state khi switch
- **Native-feeling** — snappy transitions, no jank

### Từ Apple HIG
- **Clarity** — mỗi element có purpose rõ ràng
- **Deference** — UI nhường chỗ cho content
- **Adaptive colors** — semantic, automatic dark/light
- **8pt grid** — spacing có hệ thống
- **SF-style typography** — clear hierarchy, proper weights
