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

### 2. Dark Mode — mandatory on every page
The app uses `darkMode: 'class'` (Tailwind). The `dark` class is toggled on `<html>` by `DarkModeSync.tsx`.

**Every element that has a light background/text must have a `dark:` counterpart.**

| Light | Dark equivalent |
|---|---|
| `bg-white` | `dark:bg-gray-800` or `dark:bg-gray-900` |
| `bg-gray-50` | `dark:bg-gray-900` |
| `bg-indigo-50` | `dark:bg-indigo-950` |
| `text-gray-800` | `dark:text-gray-100` or `dark:text-gray-50` |
| `text-gray-600` | `dark:text-gray-300` |
| `text-gray-500` | `dark:text-gray-400` |
| `text-gray-400` (labels) | `dark:text-gray-500` |
| `border-gray-200` | `dark:border-gray-700` |
| `border-violet-100` | `dark:border-violet-900` |

- **Page backgrounds**: never use bare `bg-white` or a hardcoded light CSS gradient as the root background without a dark counterpart. Use `dark:bg-gray-950` or a `.dark .class-name { }` CSS override.
- **CSS-in-JS gradients** (e.g. `kh-root`): add a `.dark .kh-root { background: ... }` selector since Tailwind `dark:` won't reach inside `style jsx` blocks.
- **Hero bottom fades**: if fading into the page background, always add `dark:from-gray-950` (or matching dark colour) alongside the light `from-[#f8faff]`.
- **Gradient tiles** (coloured with `from-X-500 to-Y-400`): these are self-contained and don't need dark variants.

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
- Avoid pure white card on pure white background — use a subtle border (`border border-gray-200 dark:border-gray-700`) or shadow.
