---
name: event-creator
description: Use whenever the user wants to create/add a brand-new event for JSG SPARSH Pune - e.g. "create a new event", "add an event for X", "set up registration for <event>", "we're doing a new tournament/party/outing, build it out". Scaffolds the public event page, the Supabase registrations table, the entry on the events2027 listing page, and the admin dashboard, end-to-end.
---

# New Event Creation Workflow

Goal: turn "we're running a new event" into a working public registration page + database table +
listing entry + admin dashboard, in one guided pass, resumable if interrupted. This skill was
refined while building the "Sparsh Box Cricket Mini Tournament" event — the patterns below (payment
methods, photo upload, tile theming, section structure, verification) reflect real back-and-forth
from that build, not just a first guess.

## A note on this mount before doing anything else

This repo's working copy is a mounted/synced folder with a confirmed caching bug (see the
`commit-and-push` skill for the git-lock version of this). The same bug affects plain filesystem
directory listings and even `Read`/reads of individual files: `ls`/`find`/`Read` on a path can
return **empty or stale** results even though the path has real, git-tracked content, or `git
status`/`git diff` can falsely report "clean" after a real edit. **Never trust these alone.**

- Enumerate existing events/migrations/dashboards via git, not `ls`/`find`:
  ```bash
  git ls-tree HEAD --name-only app/events/            # existing event folders
  git ls-tree -r HEAD --name-only supabase/migrations/ # existing migrations, to find the next number
  git ls-tree HEAD --name-only app/admin/              # existing admin dashboard folders
  ```
- Before trusting file content (via `Read`, `git status`, `git diff`), refresh the stat cache:
  `git ls-files -z | xargs -0 touch`. If something still looks wrong, fall back to
  `git show HEAD:<path>` (reads from git's object store, bypassing the working-tree cache entirely)
  to get ground truth.

## Step 0: Check for an in-progress event first ("continue from where you left off")

Progress for each in-flight event lives at:
`.claude/skills/event-creator/state/<slug>.json`
(git-ignored - see "State file format" below; add `.claude/skills/event-creator/state/` to
`.gitignore` the first time this skill runs, if it isn't there yet.)

1. List that directory. If there is exactly one state file whose `steps` aren't all `true`, resume
   it automatically: print a short status line, e.g.
   `Resuming "Diwali Mela" - page ✅, migration ✅, API ⬜, listing ⬜, dashboard ⬜`
   and jump straight to the first incomplete step. **Do not re-ask the setup questions.**
2. If there's more than one incomplete state file, list them by event name and ask which to resume.
3. If there are none, this is a brand-new event - proceed to Step 1.

## Step 1: Ask the setup questions, all at once

Before touching any files, ask this in one message (use `AskUserQuestion` for the genuinely
categorical ones, plain text for open-ended ones — don't force free-form answers like Event Name
into multiple-choice):

- **Event Name** — open text.
- **Theme** — open text.
- **Category** — Sports / Outing / Party / Fun Event.
- **Registration form reference** — clone an existing event as-is, or clone + modify. To offer real
  choices, run `git ls-tree HEAD --name-only app/events/` and skip non-event utility folders
  (`page.tsx`, `upcoming`, `tournament`, `find-your-team`, `khelotsav` [legacy, superseded by
  `khelotsav-2026`]). Present the remaining folders as candidates, briefly describing each, and
  recommend **khelotsav-2026** or the **sparsh-cricket-championship** folder as the default/most-
  complete templates unless the event clearly matches a lighter one (e.g. free/no-payment →
  `orchestra-night` or `adventure-escape-2026`).
- If "clone + modify": ask **what specifically changes** (fields to add/remove, fee, format,
  eligibility) before scaffolding — don't guess. In practice this conversation surfaces several
  follow-up specifics; don't be afraid to ask a second round of clarifying questions once the
  reference is picked (this is normal, not a failure to plan upfront):
  - **Payment method(s)**: cash only, online only, or both? If cash is accepted, get the exact list
    of names/labels for a "Paid To" dropdown. If online, confirm there's a QR code image to use
    (ask for its path if not already in `public/images/`) and whether OCR transaction-ID
    auto-detection is wanted (it usually is, if the reference template had it).
  - **Player/participant photo**: does registration need a photo upload (common for auction-style
    or ID-badge events)? If yes, it reuses the shared `registration-photos` bucket (see Step 3.5) —
    no new bucket needed.
  - **Slot cap: never a validation, only ever copy.** No event should count registrations to
    decide whether to accept more — no remaining-count display, no capacity-check query, no
    "registration will auto-close once full" wording anywhere (form, API, DB constraint, or FAQ
    text). If a number is mentioned at all, it's soft marketing copy only (e.g. "40+ players"), and
    it may not match reality since the actual number can grow based on response. If registrations
    need to stop, that's a manual decision made via the Registration-status control (Step 4.5) —
    never a count-based rule baked into the page or API.
  - **Highlights/inclusions style**: a grid of colored icon tiles, or a pill-chip list inside a
    single gradient card (like `app/events/hurda-party/page.tsx`'s "Event Highlights" section)? The
    pill-chip style has proven more popular — lean toward it as the default unless told otherwise.

Wait for real answers before doing anything else. Once you have them, compute a kebab-case `slug`
from the event name (adding a year suffix if the name doesn't already include one - match the
`<name>-2026` convention used by recent events), then immediately write the initial state file
(see below) before starting Step 2, so an interruption after this point is resumable.

## State file format

```json
{
  "eventName": "Diwali Mela",
  "slug": "diwali-mela-2026",
  "theme": "Festival of lights celebration",
  "category": "Party",
  "referenceEvent": "khelotsav-2026",
  "cloneMode": "clone+modify",
  "modifications": {
    "payment": { "methods": ["cash", "online"], "cashPaidToOptions": ["...", "..."], "onlineQrImage": "/images/....jpg" },
    "photoRequired": true,
    "slotCap": 42,
    "highlightsStyle": "pill-chip"
  },
  "steps": {
    "page": false, "migration": false, "api": false, "registrationStatusGating": false,
    "listing": false, "dashboard": false, "upcomingButtonOffered": false
  }
}
```
Update the relevant `steps.<x>` to `true` immediately after finishing that step, not all at the end -
that's what makes resuming reliable.

## Step 2: Scaffold the public event page — `app/events/<slug>/`

Base it on the reference event chosen in Step 1. Typical file set (adapt to what the reference
actually has):
```
app/events/<slug>/
  page.tsx                  # form UI + state + validation call + submit
  constants.ts              # EVENT_NAME (+ split LINE1/LINE2 if the hero needs two font sizes),
                             # EVENT_SEASON, EVENT_SPONSOR_LINE, FEE_AMOUNT, SLOT_CAP,
                             # REGISTRATION_CLOSED_STATUS, TILE_THEME palette, tournamentDetails,
                             # inclusions, faqItems
  schema.ts                 # Zod schema for the form (use .superRefine for conditional
                             # requiredness, e.g. cash vs online payment fields)
  types.ts                  # FormValues / Payload / FormErrors types
  utils.ts                  # OCR helper if needed — duplicate from an existing event folder
                             # rather than cross-importing (keeps folders self-contained); worth
                             # promoting to lib/ocr.ts once a third event needs it
  components/SuccessModal.tsx
```
Key decisions, settled from experience:
- **Submission mechanism: always a server API route** (project decision, overriding whatever the
  reference event does) — `page.tsx` submits via `fetch('/api/events/<slug>/register', { method:
  'POST', body: JSON.stringify(payload) })`, never a direct client-side `supabase.from(...).insert`.
- **Styling: light mode only**, per CLAUDE.md. Strip any `dark:` classes present in the cloned
  reference — do not carry them over, even though older events have them. Keep the page background
  plain (`bg-white`) rather than a tinted gradient — pale blue/emerald gradient washes read as an
  unwanted "greenish" cast in practice; save color for individual tiles/accents, not the whole page.
- **Section/border alignment**: every content block must follow the same two-layer structure so
  borders line up visually down the page:
  ```jsx
  <section className="mx-auto mt-6 w-full max-w-4xl px-4 sm:px-6">
    <div className="rounded-2xl border ... p-4 sm:p-6 ...">
      {/* content */}
    </div>
  </section>
  ```
  Putting the border directly on the outer `<section>` (skipping the `px-4 sm:px-6` wrapper layer)
  will make that block's edges sit at a different horizontal inset than every other block — a real
  bug hit while building this.
- **Hero structure** (adapt to what's provided): sponsor/logo image (if any) → "presents" (small,
  centered) → Event Name, split into two `<span>`s if the name is long and needs two font sizes
  (e.g. a bigger first line, smaller second line) → season/subtitle → one-line intro, all
  center-aligned. If the sponsor supplies a logo as a PDF rather than an image, convert it:
  ```bash
  which pdftoppm pdftocairo convert   # check tools are available first
  pdftoppm -png -r 300 public/images/<Sponsor>.pdf /tmp/sponsor_convert
  convert /tmp/sponsor_convert-1.png -trim +repage /tmp/sponsor_trimmed.png   # crop whitespace
  convert /tmp/sponsor_trimmed.png -resize 1200x /tmp/sponsor_final.png       # reasonable web size
  cp /tmp/sponsor_final.png public/images/<Sponsor>.png
  ```
  Keep the logo modest in size (e.g. `max-w-[160px]`) relative to the event name — a full-width
  logo will visually outweigh the event title.
- **Tile theming — make it vibrant, not uniform**: define a small `TILE_THEME` palette in
  constants.ts (8-10 distinct colors: orange, purple, pink, teal, indigo, amber, rose, cyan,
  fuchsia, yellow are a good spread) and assign each stat tile / inclusion a *different* color, e.g.:
  ```ts
  export const TILE_THEME: Record<TileColor, { bg: string; border: string; iconBg: string; iconText: string; labelText: string }> = {
    orange: { bg: 'bg-orange-50', border: 'border-orange-200', iconBg: 'bg-orange-100', iconText: 'text-orange-600', labelText: 'text-orange-700' },
    // ...repeat per color
  }
  ```
  A single repeated blue/emerald pale wash across every tile reads as flat — distinct colors per
  tile is what "vibrant and dynamic" means in practice here.
- **Highlights/inclusions**: if `highlightsStyle` is `pill-chip`, use this structure (modeled on
  `app/events/hurda-party/page.tsx`'s "Event Highlights" section) instead of a plain tile grid:
  ```jsx
  <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-emerald-50 p-4 sm:p-6 md:p-8 shadow-lg">
    <div className="mb-4 flex items-center gap-3">
      <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-gradient-to-br from-blue-600 to-emerald-600 flex items-center justify-center text-white shadow-md">🏏</div>
      <h2 className="bg-gradient-to-r from-blue-700 via-sky-700 to-emerald-700 bg-clip-text text-transparent font-extrabold tracking-wide">What's Included</h2>
    </div>
    <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3 text-sm font-medium text-gray-700">
      {/* each <li> = icon + label pill: bg-white/80 border rounded-lg px-3 py-2 shadow-sm */}
    </ul>
  </div>
  ```
- **Photo upload** (if `photoRequired`): a separate upload block from the payment screenshot, using
  `uploadPhoto(file, uploadId)` from `lib/supabase.ts` (bucket: `registration-photos`, already
  provisioned — see Step 3.5). Add a FAQ item telling users to upload a recent, HD photo.
- **FAQ section**: always include one (accordion with `expandedFaqIndex` state, `ChevronDown` icon
  toggle). Cover: eligibility, how teams are decided (if auction-based), payment proof requirement,
  photo requirement (if applicable), OCR-correction note (if online + OCR), and cancellation/refund
  policy. If a slot number comes up at all, phrase it softly ("registration may close depending on
  response") — never a hard count or "closes automatically once full" claim, since nothing enforces
  that (see Step 1). Once the FAQ exists, don't *also* keep separate standalone notice boxes
  repeating the same eligibility/cancellation text above the form — that's redundant; fold it into
  the FAQ instead.
- **Optional page-load flourish** (only if asked for, e.g. "add some animation"): keep it subtle and
  one-time, not a permanent distraction. A decorative element flying across/through the page should
  live in a `fixed inset-0 z-40 pointer-events-none overflow-hidden` wrapper (not nested inside a
  section with an opaque background, or it'll visually hide behind that card), animated at reduced
  opacity (~0.3) with a `prefers-reduced-motion` off-switch, defined in `app/globals.css` alongside
  the existing keyframe utilities there (don't invent a separate styling mechanism). Prefer a fade/
  glow-in over continuous up-down motion for static elements like a sponsor logo — glow/pulse reads
  as "alive" without the vertical bobbing some people find distracting.
- Follow existing conventions: mobile-first (`px-4 sm:px-6 lg:px-8`), `rounded-2xl` cards, the
  typography scale in CLAUDE.md section 5, `'use client'` at the top since this page has form state.
- After writing/editing any `.tsx` file here, strip null bytes per CLAUDE.md section 3:
  `tr -d '\0' < file.tsx > /tmp/clean && cp /tmp/clean file.tsx`.
- Mark `steps.page = true` in the state file.

## Step 3: Create the Supabase migration

1. Find the next migration number: `git ls-tree -r HEAD --name-only supabase/migrations/ | sort`,
   take the highest `0NN_` prefix, add 1, zero-pad to 3 digits (ignore the one legacy unnumbered
   `add_gender_column.sql` file).
2. Create `supabase/migrations/0NN_create_<slug>_registrations.sql` naming the table
   `sparsh_<slug>_registrations` (underscore form of the slug), matching the established pattern:
   - `id UUID DEFAULT gen_random_uuid() PRIMARY KEY`
   - `created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()`
   - Core fields based on what the cloned reference collects, plus this event's modifications.
   - `photo_url TEXT NOT NULL` if a photo upload is required.
   - Enum-like fields as `TEXT ... CHECK (col IN (...))` rather than native Postgres enums.
   - **Multiple payment methods**: don't just add nullable columns for every method — enforce
     mutual exclusivity with a named CHECK constraint, e.g.:
     ```sql
     payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'online')),
     cash_paid_to TEXT CHECK (cash_paid_to IS NULL OR cash_paid_to IN ('Name One', 'Name Two')),
     transaction_reference_number TEXT,
     payment_screenshot_url TEXT,
     CONSTRAINT chk_<slug>_payment_details CHECK (
       (payment_method = 'cash' AND cash_paid_to IS NOT NULL AND transaction_reference_number IS NULL AND payment_screenshot_url IS NULL)
       OR
       (payment_method = 'online' AND cash_paid_to IS NULL AND transaction_reference_number IS NOT NULL AND payment_screenshot_url IS NOT NULL)
     )
     ```
   - Single-method fee (no cash option): the simpler existing pattern is fine —
     `fee_amount INTEGER NOT NULL DEFAULT <fee> CHECK (fee_amount = <fee>)`, plus required
     `transaction_id`/`payment_screenshot_url`.
   - Two indexes: one on `created_at`, one on the mobile column.
   - **Duplicate-prevention unique index** (standard on every event, not optional): same name
     (case-insensitive) + same mobile number should only be registerable once —
     `CREATE UNIQUE INDEX IF NOT EXISTS idx_<slug>_name_mobile_unique ON
     sparsh_<slug>_registrations (LOWER(TRIM(name)), mobile_number);`. This is a data-integrity
     backstop for the API route's own pre-check (Step 4) — not to be confused with a slot-cap
     check, which should never exist (see Step 1).
   - `ALTER TABLE ... ENABLE ROW LEVEL SECURITY;` followed by the idempotent policy blocks used
     everywhere else in this repo:
     ```sql
     DO $$
     BEGIN
       IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'sparsh_<slug>_registrations' AND policyname = 'Allow insert for <slug>') THEN
         CREATE POLICY "Allow insert for <slug>" ON sparsh_<slug>_registrations FOR INSERT WITH CHECK (true);
       END IF;
       IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'sparsh_<slug>_registrations' AND policyname = 'Allow select for <slug>') THEN
         CREATE POLICY "Allow select for <slug>" ON sparsh_<slug>_registrations FOR SELECT USING (true);
       END IF;
     END $$;
     ```
3. This skill cannot execute the migration against the live Supabase project — present the finished
   `.sql` file to the user (e.g. via `present_files`) and tell them to run it in the Supabase SQL
   editor before the new page/API route will actually work end-to-end.
4. Mark `steps.migration = true`.

**Gotcha — auto-named constraints silently truncate at 63 characters.** Postgres identifiers
(including auto-generated constraint names like `<table>_<column>_check`) are silently truncated
to 63 bytes. If you ever need to `DROP CONSTRAINT` on an auto-named constraint later (e.g. to widen
an allowed-values list), a `DROP CONSTRAINT IF EXISTS <full untruncated name>` will silently no-op
if the real name got truncated — the old constraint stays in effect and new rows get rejected with
a confusing error. Always read the *actual* constraint name from the Postgres error message (or
`\d <table>` / `information_schema.check_constraints`) rather than assuming it matches what you
typed, and prefer giving mutable/likely-to-change constraints (payment recipient lists, enum-like
columns) a short, explicit name (`CONSTRAINT chk_<slug>_<column>`) up front so this can't happen.

**Gotcha — backfill existing rows before tightening a CHECK constraint.** When adding a new column
that becomes part of a stricter CHECK (e.g. a second payment-recipient option added to an existing
mutual-exclusivity constraint), rows inserted before that column existed will violate the new
constraint. Always backfill the new column for existing rows first (e.g.
`UPDATE <table> SET new_col = '<default>' WHERE <predicate> AND new_col IS NULL;`) in the same
script, before the `ALTER TABLE ... ADD CONSTRAINT`.

## Step 3.5: Storage buckets — check before assuming new setup is needed

Uploads (photo, payment screenshot) almost always reuse **existing shared buckets** rather than
needing a new one:
- Player/profile photo → `uploadPhoto()` in `lib/supabase.ts` → bucket `registration-photos`.
- Payment screenshot → `uploadRegistrationTransactionScreenshot()` in `lib/supabase.ts` → bucket
  `membership-fees-ss`.

Both are already used by multiple *live* events (the membership registration flow, Khelotsav,
Sparsh Cricket Championship), so if this event's uploads use those same helper functions, **no new
bucket work is needed** — say so explicitly when wrapping up, since it's a natural question
("what about the storage bucket?") after running a table-creation migration. Only if a genuinely new
upload type/bucket is introduced, generate an `INSERT INTO storage.buckets (...) ... ON CONFLICT`
plus `CREATE POLICY` pair modeled on `supabase/fix-bucket-policies.sql`, and call out clearly that
this is new (unlike the table migration, it's a one-time manual step too).

## Step 4: Create the API route — `app/api/events/<slug>/register/route.ts`

- Use a fresh `createClient(SUPABASE_URL, SERVICE_ROLE_KEY)` (service role), mirroring
  `app/api/goa-interest/route.ts`: a `validate(body)` function checking every required field
  (including conditional payment-method fields), then `insert(...)`. Return 400 with a `details`
  array on validation failure, 500 with the Supabase error otherwise, 200/201 with the inserted row
  on success.
- **Duplicate registration check**: same name (case-insensitive) + same mobile number should only
  be allowed once. Before inserting, pre-check with an `.ilike('name', trimmedName).eq
  ('mobile_number', trimmedMobile)` query and return 409 with a friendly message if a row already
  matches. Back this with a DB-level unique index in the migration (Step 3) as a safety net for
  concurrent submissions, and also catch `code === '23505'` on the insert itself with the same
  friendly message (belt-and-suspenders, since the pre-check has a race window).
- **Never add a capacity/slot-count check here, under any circumstances** — no `SELECT count(*)`
  re-check, no rejecting once some number is reached. See Step 1's "Slot cap" note: closing
  registration is always a manual admin action (Step 4.5), never a validation rule.
- Mark `steps.api = true`.

## Step 4.5: Registration-status gating — two configurable pop-ups on every event page

Every event page must be able to show one of two blocking pop-ups depending on where the event is
in its lifecycle, controlled live from that event's own admin dashboard — **no code change or
redeploy needed** to open/close registration. This supersedes the older hardcoded
`REGISTRATION_CLOSED_STATUS: 'YES' | 'NO'` constant pattern (still present in earlier events like
Box Cricket) — don't add that constant to new events; wire up this DB-driven version instead.

**States:** `not_open` → "Registration will be opened shortly", `closed` → "Registration for this
event is now closed", `open` → no pop-up, form renders normally (this is the default when nothing
has been configured yet, so events behave normally if the admin never touches the control).

**Shared infrastructure — check whether it already exists before creating anything:**
- Reuses the existing `app_navigation_settings` table (`setting_key TEXT PRIMARY KEY,
  setting_value TEXT NOT NULL`, already live — same table the "Upcoming Event" button target uses)
  with a per-event key: `registration_status_<slug>`. No new migration needed for this table itself.
- Shared API route `app/api/events/registration-status/route.ts` (create once, on the first event
  that needs it — check `git ls-tree HEAD --name-only app/api/events/` first):
  - `GET  ?slug=<slug>` → reads `registration_status_<slug>`, returns `{ status }`, **defaulting to
    `'open'`** if no row exists yet.
  - `POST { slug, status }` → upserts the row (same select-then-update-or-insert pattern as
    `app/api/admin/upcoming-event-target/route.ts`). Validate `status` is one of the three allowed
    values.
  - `no-store` cache headers, mirroring `upcoming-event-target/route.ts`.
- Shared modal component `app/components/RegistrationStatusModal.tsx` (create once, reuse after):
  props `{ status: 'not_open' | 'closed'; eventName: string }`, renders a centered overlay card
  with the matching headline copy above — light mode only. The only way out is an "Okay" button
  that navigates to the home page (`router.push('/')`) — no backdrop-click/X dismiss that would
  reveal the page underneath, since the form itself should stay unmounted/hidden while status
  isn't `open`.

**Per-event wiring:**
- On the public page, fetch `/api/events/registration-status?slug=<slug>` on mount (alongside any
  other initial load) and render `<RegistrationStatusModal>` instead of the form when status is
  `not_open` or `closed`; render the form normally when `open`.
- On that event's admin dashboard (Step 6), add a small "Registration Status" card: three
  options (Not Open Yet / Open / Closed), GET the current value on load, POST on change — modeled
  directly on the "Upcoming Button Navigation" card in `app/admin/admin-config/page.tsx`.
- Mark `steps.registrationStatusGating = true`.

## Step 5: Add the entry to the events2027 listing — `app/events2027/page.tsx`

Append a new object to the hardcoded `events` array (do not touch the page's overall structure or
styling otherwise — it currently has no dark-mode classes, which is now correct under the updated
light-only rule, so nothing needs stripping here):
```ts
{
  id: <next integer id in the array>,
  title: '<Event Name>',
  date: '<YYYY-MM-DD>',
  time: '<start> – <end>',
  venue: '<venue>',
  description: '<theme-driven one-liner>',
  attendees: '<placeholder until known, e.g. "Details coming soon">',
  highlights: ['<3-4 short highlight strings>'],
  category: '<Sports|Outing|Party|Fun Event>',   // stored field only, no visible badge/filter UI
  pageUrl: '/events/<slug>',
}
```
Ask the user for date/time/venue if not already given during setup — don't invent specifics beyond
what they've told you. Mark `steps.listing = true`.

## Step 6: Create the admin dashboard

1. `app/admin/<slug>/page.tsx` — base this closely on `app/admin/khelotsav-2026/page.tsx`:
   fetch all rows from `sparsh_<slug>_registrations` ordered by `created_at desc`, compute summary
   stats via `useMemo` (total registrations, revenue if there's a fee, payment-method breakdown if
   multiple methods, category breakdowns relevant to this event, one tile per named cash recipient
   if cash payment has a fixed "paid to" list — **never a "slots remaining" tile**, since there's no
   enforced cap to count against, see Step 1), a sortable `<table>` of all fields, and a client-side
   CSV export. For any image field (photo, payment screenshot), show a plain "View" link (`LinkIcon`
   + text, opens in a new tab) rather than an inline thumbnail — rendering thumbnails for every row
   costs bandwidth for images nobody's looking at yet. **Light mode only** — do not carry over the
   reference dashboard's `dark:` classes.
2. Add the "Registration Status" control card described in Step 4.5 to this same dashboard page
   (Not Open Yet / Open / Closed, GET on load, POST on change against
   `/api/events/registration-status` with this event's `slug`).
3. Register it in `app/admin/dashboards.config.ts`: add a `DashboardDef` entry —
   `slug`, `href: '/admin/<slug>'`, `label`, `description`, an unused-recently `color` from the
   existing enum, `archivable: true`, `tables: ['sparsh_<slug>_registrations']`.
4. Mark `steps.dashboard = true`.

## Step 6.5: Offer to point the home page "Upcoming Event" button at this event

The Hero section's "Upcoming Event" button target is **not hardcoded** — it's read live from the
same `app_navigation_settings` table (key `upcoming_event_target`), defaulting to `/events/khelotsav`
if unset, and editable via the "Upcoming Button Navigation" card on `/admin/admin-config`
(`app/admin/admin-config/page.tsx` → `app/api/admin/upcoming-event-target/route.ts`).

This skill has no way to call the live production API/DB directly (same limitation as the migration
step — no deployed environment to reach from here), so **ask** whether this new event should become
the current "upcoming" target rather than silently changing it (it would be premature for an event
that isn't ready to accept registrations yet). If yes, give the user both options and let them pick:
- **UI**: go to `/admin/admin-config` → "Upcoming Button Navigation" → Custom URL → `/events/<slug>`
  → Save.
- **SQL** (Supabase SQL editor), if they'd rather not use the UI:
  ```sql
  INSERT INTO app_navigation_settings (setting_key, setting_value)
  VALUES ('upcoming_event_target', '/events/<slug>')
  ON CONFLICT (setting_key) DO UPDATE SET setting_value = EXCLUDED.setting_value, updated_at = NOW();
  ```
Mark `steps.upcomingButtonOffered = true` once asked, regardless of their answer (this step tracks
that the question was asked, not that the button was necessarily changed).

## Step 7: Verify — don't just eyeball it

1. Strip null bytes from every `.tsx`/`.ts` file touched (per file, not just at the very end):
   `tr -d '\0' < file.tsx > /tmp/clean && cp /tmp/clean file.tsx`.
2. Run a real type-check before declaring anything done — this catches missing imports, dropped
   fields after a "remove X" edit, and mismatched types far more reliably than reading the diff:
   ```bash
   test -d node_modules && timeout 120 npx tsc --noEmit -p tsconfig.json
   ```
   If `node_modules` doesn't exist, say so rather than skipping verification silently. Fix any
   errors before moving on — don't report success with unresolved type errors.
3. Whenever content changes based on user feedback ("remove field X", "add field Y"), grep for
   leftover references across *all* touched files (page, types, schema, migration, API route,
   dashboard) — it's easy to remove a form field but forget the matching migration column or API
   validation line.
4. Confirm the registration-status gating actually gates: the page must not render the form (not
   just visually hide it) while status is `not_open`/`closed`, and the admin dashboard's status
   control must round-trip (GET reflects what was just POSTed).

## Step 8: Wrap up

- Confirm every step in the state file is `true`. Summarize what was created: the page path, the
  migration file (remind them it still needs to be applied to Supabase — present the `.sql` file so
  they can copy it), whether any storage bucket needs new setup (usually not — see Step 3.5), the
  API route, the registration-status gating (and that it defaults to `open` until touched), the
  events2027 entry, the admin dashboard path (including its Registration Status control), and
  whether they want the home page "Upcoming Event" button pointed at it (Step 6.5).
- Do not run `npm run build`, start a dev server, or apply the migration yourself unless asked.
- Ask if they'd like to run the `commit-and-push` skill now to commit everything — don't duplicate
  that skill's logic here, just hand off to it.
- Leave the completed state file in place (harmless, git-ignored) rather than deleting it - it
  doubles as a record of what was auto-generated for this event.
- Expect a round of visual/UX feedback after the first build (screenshots, "make X bigger", "align Y
  with Z", "I don't like this animation") — that's normal iteration, not a sign the plan was wrong.
  Apply each change directly rather than re-litigating the whole design.
