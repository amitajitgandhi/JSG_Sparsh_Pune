// Central registry of admin dashboards.
//
// Routes and table names are inherently code-bound, so this list lives in code.
// Only the *archived* state is dynamic — it is stored in Supabase
// (app_navigation_settings → key `admin_archived_dashboards`, a JSON array of slugs)
// and read at runtime to decide which tiles to render on /admin.
//
// Lifecycle: while an event is live its tile shows here; once it's over an admin
// clicks "Archive" on the tile and either removes the tile only, or removes the
// tile AND deletes that event's Supabase data (the `tables` below drive cleanup).

export type DashboardColor =
  | 'blue' | 'emerald' | 'violet' | 'orange' | 'sky' | 'rose' | 'amber' | 'teal'

export interface DashboardDef {
  slug: string
  href: string
  label: string
  description: string
  color: DashboardColor
  /** false = permanent shared tool (cannot be archived), e.g. Tournament Management */
  archivable: boolean
  /** Supabase tables owned by this event — wiped only on "tile + delete data". */
  tables: string[]
}

export const DASHBOARDS: DashboardDef[] = [
  {
    slug: 'admin-config',
    href: '/admin/admin-config',
    label: 'Admin Config',
    description: 'Only for Administrators',
    color: 'blue',
    archivable: false,
    tables: [],
  },
  {
    slug: 'tournament',
    href: '/admin/tournament',
    label: 'Tournament Management',
    description: '',
    color: 'orange',
    archivable: false,
    tables: [],
  },
  {
    slug: 'khelotsav-2026',
    href: '/admin/khelotsav-2026',
    label: 'Khelotsav 2026 Dashboard',
    description: 'View SPARSH KHELOTSAV 2026 registrations, selected sports, ratings, and payment status.',
    color: 'emerald',
    archivable: true,
    tables: ['sparsh_khelotsav_registrations'],
  },
  {
    slug: 'k26-stats',
    href: '/admin/k26-stats',
    label: 'K26 Stats',
    description: 'Sport-wise charts, age & jersey analytics, and per-sport player lists with export.',
    color: 'violet',
    archivable: true,
    tables: [], // read-only view over sparsh_khelotsav_registrations — owns no tables
  },
  {
    slug: 'khelotsav-players',
    href: '/admin/khelotsav-players',
    label: 'Khelotsav Players',
    description: 'Upload team-wise player data via CSV for the public teams page.',
    color: 'violet',
    archivable: true,
    tables: ['khelotsav_players'],
  },
  {
    slug: 'adventure-escape-dashboard',
    href: '/admin/adventure-escape-dashboard',
    label: 'Adventure Escape Dashboard',
    description: 'View Adventure Escape 2026 registrations, rafting add-ons, and export participant data.',
    color: 'sky',
    archivable: true,
    tables: ['adventure_escape_interest'],
  },
  {
    slug: 'hurda-dashboard',
    href: '/admin/hurda-dashboard',
    label: 'Hurda Party Dashboard',
    description: 'View Hurda Party registrations and export participant data.',
    color: 'amber',
    archivable: true,
    tables: ['hurda_registrations'],
  },
  {
    slug: 'double-cross',
    href: '/admin/double-cross',
    label: 'Double Cross Dashboard',
    description: 'View Double Cross registrations and export participant data.',
    color: 'rose',
    archivable: true,
    tables: ['double_cross_registrations'],
  },
  {
    slug: 'scc-dashboard',
    href: '/admin/scc-dashboard',
    label: 'Sparsh Cricket Dashboard',
    description: 'View Sparsh Cricket Championship registrations and export participant data.',
    color: 'teal',
    archivable: true,
    tables: ['sparsh_cricket_registrations'],
  },
]

/** Slug → table allow-list, used server-side to guard data deletion. */
export const DASHBOARD_TABLES: Record<string, string[]> = Object.fromEntries(
  DASHBOARDS.map(d => [d.slug, d.tables]),
)
