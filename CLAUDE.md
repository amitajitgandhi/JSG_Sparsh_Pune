before heavy usage of tokens - please confirm

before destructive changes - please confirm

---

## UI / Design Rules (read before writing any page or component)

### 1. Mobile-First
- Design for a ~390px wide screen first. Desktop is secondary.
- Use `px-4 sm:px-6 lg:px-8` for horizontal padding — never let content touch the screen edge.
- Prefer `grid-cols-2` on mobile; expand to `sm:grid-cols-3` or `sm:grid-cols-4` only where it makes sense.
- Touch targets must be at least 44×44px (buttons, links, interactive tiles).
- Text: minimum `text-sm` for body copy; `text-xs` only for labels/captions.
- Always test mentally: "would a thumb reach this? Does it wrap cleanly at 390px?"

### 2. Light Mode Only — mandatory on every page (supersedes the old dark-mode rule)
As of 2026-07-14, every page must render in light/white mode only, regardless of the device's or
OS's dark-mode setting. Do not add `dark:` Tailwind variants, `.dark .foo {}` CSS overrides, or any
other dark-theme branching to new or edited pages/components.

- Use plain light-mode classes only: `bg-white`, `bg-gray-50`, `text-gray-800`, `border-gray-200`,
  etc. — with no `dark:` counterpart.
- If a component previously read the app's dark-mode state (e.g. via `DarkModeSync.tsx` or a
  `dark` class on `<html>`), new/edited code should not depend on that state to change appearance.
- **Existing pages that already have full `dark:` styling are not required to be stripped
  immediately** — that cleanup is deferred and can happen incrementally later. This rule governs
  new pages and any page you are already substantially editing for another reason.
- If you are touching a page that currently has dark-mode classes as part of unrelated work, leave
  them as-is unless the task at hand is specifically to migrate that page to light-only.

### 3. Null Bytes
After writing or editing any `.tsx` file, strip null bytes before committing:
```bash
tr -d '\0' < file.tsx > /tmp/clean && cp /tmp/clean file.tsx
```
Null bytes cause Vercel TypeScript build errors (`Invalid character`).

### 4. Component conventions
- New pages under `/app/events/khelotsav/*` should reuse `<KhelotsavHero />` (from `app/events/khelotsav/KhelotsavHero.tsx`) for the hero + ticker + animations.
- Add `'use client'` only when the component uses hooks or browser APIs.
- Server components (no `'use client'`) are preferred for static/data pages.
- Static CSV files in `/public` must be fetched with `?v=${Date.now()}` to bypass browser caching.

### 5. Typography hierarchy (mobile)
- Page title / hero: `text-3xl font-black` (sm: `text-4xl` or `text-5xl`)
- Section heading: `text-base font-black uppercase tracking-widest` (sm: `text-lg`)
- Card title: `text-sm font-extrabold`
- Body / description: `text-sm leading-relaxed`
- Label / caption: `text-xs font-bold uppercase tracking-widest` or `text-[11px]`

### 6. Cards & surfaces
- Rounded corners: `rounded-2xl` for cards; `rounded-xl` for inner elements.
- Shadow: `shadow-sm` default; `shadow-md` on hover or emphasis.
- Avoid pure white card on pure white background — use a subtle border (`border border-gray-200`) or shadow.
