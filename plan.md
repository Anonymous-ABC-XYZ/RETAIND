# RETAIND - Full-Stack SaaS Application Implementation Plan

## Overview

Build a complete multi-tenant SaaS platform for workforce onboarding and retention risk tracking from scratch. The application will be built with React + TypeScript + Vite + Supabase, featuring **View-As role switching** and **auto-seed demo data** functionality.

## Tech Stack

**Frontend:**

- React 18.3.1 + TypeScript
- Vite (build tool)
- Tailwind CSS + shadcn/ui components
- React Router DOM 6.30.1
- TanStack React Query 5.83.0
- React Hook Form + Zod
- Framer Motion, Recharts, Sonner, Lucide React

**Backend:**

- Supabase (PostgreSQL + Auth + RLS)
- Row Level Security for multi-tenancy

## Implementation Phases

### Phase 1: Project Scaffolding (Foundation)

**Create new React app in `/app` directory:**

1. Run `npm create vite@latest app -- --template react-ts`
2. Install all dependencies (see dependency list below)
3. Configure Vite with `@/` path alias
4. Set up Tailwind CSS + PostCSS
5. Initialize shadcn/ui: `npx shadcn-ui@latest init`
6. Install core shadcn components: button, card, input, dropdown-menu, popover, dialog, toast, badge, table, tabs, avatar

**Dependencies to install:**

```bash
npm install react-router-dom @supabase/supabase-js @tanstack/react-query react-hook-form zod @hookform/resolvers framer-motion recharts sonner lucide-react date-fns clsx tailwind-merge
```

**Create `.env.local`:**

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_DEMO_ORG_ID=00000000-0000-0000-0000-000000000001
```

### Phase 2: Database Setup

**Create Supabase project and run migrations:**

**Migration 001: Core Auth & Organizations**

- Tables: `profiles`, `organisations`, `user_organisations`, `super_admins`
- Trigger: `handle_new_user()` on auth.users insert
- RLS policies for org-scoped access

**Migration 002: Workforce Structure**

- Tables: `regions`, `teams`, `workers`
- Enums: `worker_status`, `employment_type`
- RLS policies

**Migration 003: Onboarding System**

- Tables: `onboarding_templates`, `template_tasks`, `onboarding_assignments`, `assigned_tasks`
- Enums: `task_type`, `task_status`

**Migration 004: Issues & Training**

- Tables: `issues`, `cpd_records`, `mentor_notes`, `playbooks`
- Enums: `issue_type`, `issue_severity`, `issue_status`

**Migration 005: Org Invites**

- Table: `org_invites`

**Migration 006: Helper Functions**

- `calculate_worker_risk_score(worker_uuid UUID)`
- Auto-accept org invites in `handle_new_user()` trigger

**Seed demo organization:**

- Create "Northfield Mechanical & Electrical" org with ID `00000000-0000-0000-0000-000000000001`
- Create demo user: `demo@retaind.app` / `RetaindDemo2025!`
- Add org invite for demo user as ORG_ADMIN

### Phase 3: Core React Architecture

**File: `/app/src/lib/supabase.ts`**

- Create Supabase client with TypeScript types
- Generate types: `npx supabase gen types typescript --project-id PROJECT_ID > src/lib/database.types.ts`

**File: `/app/src/lib/queryClient.ts`**

- Configure TanStack Query client with 5-minute stale time

**File: `/app/src/contexts/AuthContext.tsx`**

- Manage auth state: user, session, profile
- Manage org memberships and current organization
- Methods: `signIn`, `signUp`, `signOut`, `signInAsDemo`
- **Auto-seed trigger**: On successful auth, check if org has workers. If count === 0, call `seedDemoData()`

**File: `/app/src/contexts/AccessControlContext.tsx`**

- Define 11 demo personas (Admin, Operative, Team Leader, Regional Manager, QS, Compliance Manager, H&S Manager, Training Manager, National Ops Manager, HR Manager, Director)
- Each persona has: name, role, email, region/team scope, permissions
- `currentPersona` state
- `switchPersona(personaId)` method
- `canAccess(resource, action)` permission check
- `getDataScope()` returns region/team filter for current persona

**File: `/app/src/hooks/useHybridData.ts`**

- Generic hook that tries live DB fetch first
- Falls back to hardcoded demo data if no live data
- Applies AccessControl scope filters to both live and demo data
- Returns: `{ data, isLoading, isUsingDemo }`

**File: `/app/src/main.tsx`**

- Wrap app in QueryClientProvider, AuthProvider, AccessControlProvider
- Add Toaster for toast notifications

### Phase 4: Routing & Layouts

**File: `/app/src/App.tsx`**

- BrowserRouter with routes:
  - `/` - Landing page (marketing site)
  - `/signin`, `/signup` - Auth pages
  - `/app/dashboard` - Main dashboard
  - `/app/people` - Worker list
  - `/app/people/:workerId` - Worker profile
  - `/app/templates` - Onboarding templates
  - `/app/issues` - Issues list
  - `/app/playbooks` - Playbooks
  - `/app/certificate` - Certificate generator
  - `/app/plans` - Plans & usage
  - `/app/settings` - Organization settings
  - `/app/account` - User account

**File: `/app/src/components/layouts/AuthLayout.tsx`**

- Centered card layout for auth pages
- Logo, sign in/sign up forms
- "Demo Login" button (calls `signInAsDemo()`)

**File: `/app/src/components/layouts/AppLayout.tsx`**

- Main app shell with Sidebar, TopBar, and content area
- Protected route wrapper (redirects to /signin if not authenticated)

**File: `/app/src/components/layouts/TopBar.tsx`**

- Organization switcher (if user has multiple orgs)
- **View-As Selector** (Popover with 11 demo personas)
- Current persona indicator badge
- User menu (Account, Sign Out)

**View-As Selector UI:**

```tsx
<Popover>
  <PopoverTrigger asChild>
    <Button variant="outline">
      <Eye className="h-4 w-4" />
      View as: {currentPersona.name}
      <Badge>{currentPersona.role}</Badge>
    </Button>
  </PopoverTrigger>
  <PopoverContent>
    <div className="space-y-2">
      <p className="font-medium">Switch Demo Account</p>
      {availablePersonas.map((persona) => (
        <button onClick={() => switchPersona(persona.id)}>
          <div className="font-medium">{persona.name}</div>
          <div className="text-xs text-muted-foreground">
            {persona.role} • {persona.region || persona.team || "All regions"}
          </div>
        </button>
      ))}
    </div>
  </PopoverContent>
</Popover>
```

**File: `/app/src/components/layouts/Sidebar.tsx`**

- Navigation links with Lucide icons
- Active state highlighting

### Phase 5: Core Features - Pages

**File: `/app/src/pages/Dashboard.tsx`**

- Metric cards: Total Workers, At Risk, Open Issues, In Onboarding
- Charts: Risk distribution (bar), Onboarding pipeline, Issues by type (pie)
- Recent activity feed
- Data filtered by AccessControl scope

**File: `/app/src/pages/People.tsx`**

- Searchable, filterable table of workers
- Columns: Name, Role, Team, Region, Status, Risk Level
- Filter by: Status, Team, Region, Risk Level
- Click row to navigate to Worker Profile
- Uses `useHybridData` for worker list

**File: `/app/src/pages/WorkerProfile.tsx`**

- Header: Name, photo, role, status, risk score
- Tabs:
  1. Overview: Basic info, employment details
  2. Onboarding: Progress bar, task checklist
  3. Portfolio: Evidence, certifications
  4. CPD & Training: Training history
  5. Issues: Open/resolved issues
- Action buttons: Add Issue, Add CPD, Add Note

**File: `/app/src/pages/Templates.tsx`**

- List of onboarding templates
- Template cards showing: name, role/trade, duration, task count
- Create/edit template (admin only)
- Assign template to worker dialog

**File: `/app/src/pages/Issues.tsx`**

- Filterable table: Status, Severity, Type, Worker, Date
- Create Issue dialog
- Click to view/edit issue details

**File: `/app/src/pages/Playbooks.tsx`**

- Grid of playbook cards
- Category filters, search
- View playbook content (markdown/rich text)

**File: `/app/src/pages/Certificate.tsx`**

- Worker selector
- Generate completion certificate for onboarding
- Print/download as PDF

**File: `/app/src/pages/Plans.tsx`**

- Current subscription plan display
- Usage stats (active workers, storage)
- Upgrade options

**File: `/app/src/pages/Settings.tsx`**

- Tabs: Organization, Regions & Teams, User Management, Integrations, Notifications

**File: `/app/src/pages/Account.tsx`**

- User profile edit
- Change password
- Notification preferences

### Phase 6: Demo Data & Auto-Seed

**File: `/app/src/data/demoData.ts`**

- Export constants:
  - `DEMO_WORKERS`: 40-50 worker objects
  - `DEMO_ISSUES`: Array of issues
  - `DEMO_CPD_RECORDS`: Training records
  - `DEMO_TEMPLATES`: Onboarding templates
  - `DEMO_REGIONS`: 4 regions (North West, South East, Midlands, London)
  - `DEMO_TEAMS`: 12 teams across regions
  - `DEMO_PERSONAS`: 11 demo account personas

**File: `/app/src/data/seedDemoData.ts`**

```typescript
export async function seedDemoData(orgId: string): Promise<void> {
  // 1. Check if org already has data
  const { count } = await supabase
    .from("workers")
    .select("*", { count: "exact", head: true })
    .eq("organisation_id", orgId);

  if (count && count > 0) return;

  // 2. Show toast notification
  toast.info("Setting up demo data...");

  // 3. Seed in order:
  //    - Regions
  //    - Teams
  //    - Workers
  //    - Templates & Tasks
  //    - Issues
  //    - CPD Records
  //    - Playbooks

  // 4. Show success toast
  toast.success("Demo data loaded successfully!");
}
```

**Auto-seed trigger in AuthContext:**

```typescript
useEffect(() => {
  if (currentOrganisation && user) {
    checkAndSeedDemoData();
  }
}, [currentOrganisation, user]);

async function checkAndSeedDemoData() {
  const { count } = await supabase
    .from("workers")
    .select("*", { count: "exact", head: true })
    .eq("organisation_id", currentOrganisation.id);

  if (count === 0) {
    await seedDemoData(currentOrganisation.id);
  }
}
```

### Phase 7: Risk Calculation & Polish

**File: `/app/src/lib/riskCalculator.ts`**

```typescript
export function calculateWorkerRisk(
  worker: Worker,
  context: {
    issues: Issue[];
    onboarding: OnboardingAssignment | null;
    overdueTaskCount: number;
  },
): { score: number; level: "low" | "medium" | "high" | "critical" } {
  let score = 0;

  // Open issues (5 points each)
  const openIssues = context.issues.filter((i) => i.status !== "resolved");
  score += openIssues.length * 5;

  // Critical issues (15 points each)
  const criticalIssues = openIssues.filter((i) => i.severity === "critical");
  score += criticalIssues.length * 15;

  // Onboarding progress (0-50 points)
  if (context.onboarding) {
    score += (100 - context.onboarding.progress_percentage) / 2;
  }

  // Overdue tasks (10 points each)
  score += context.overdueTaskCount * 10;

  score = Math.min(score, 100);

  const level =
    score >= 75
      ? "critical"
      : score >= 50
        ? "high"
        : score >= 25
          ? "medium"
          : "low";

  return { score, level };
}
```

**UI Polish:**

- Loading skeletons for tables and cards
- Empty states with illustrations
- Error boundaries for page errors
- Toast notifications for all actions
- Framer Motion animations for page transitions
- Responsive design (mobile, tablet, desktop)

## Critical Files (Build These First)

1. **`/app/src/contexts/AuthContext.tsx`** - Core authentication, org management, auto-seed trigger
2. **`/app/src/contexts/AccessControlContext.tsx`** - View-As system, permission checks, data filtering
3. **`/app/src/hooks/useHybridData.ts`** - Hybrid data pattern for live/demo fallback
4. **`/app/src/components/layouts/AppLayout.tsx`** - Main app shell with TopBar containing View-As selector
5. **`/app/src/data/seedDemoData.ts`** - Demo data population function

## File Structure

```
/home/abc/Programming/RETAIND/
├── app/                          # NEW: Main React app
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/              # shadcn components
│   │   │   ├── layouts/
│   │   │   │   ├── AppLayout.tsx
│   │   │   │   ├── TopBar.tsx
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   └── AuthLayout.tsx
│   │   │   └── features/
│   │   │       ├── workers/
│   │   │       ├── onboarding/
│   │   │       └── issues/
│   │   ├── contexts/
│   │   │   ├── AuthContext.tsx          # ⭐ Auto-seed trigger
│   │   │   └── AccessControlContext.tsx # ⭐ View-As system
│   │   ├── hooks/
│   │   │   ├── useHybridData.ts         # ⭐ Live/demo fallback
│   │   │   ├── useWorkers.ts
│   │   │   ├── useIssues.ts
│   │   │   └── useOnboarding.ts
│   │   ├── pages/
│   │   │   ├── Landing.tsx
│   │   │   ├── SignIn.tsx
│   │   │   ├── SignUp.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── People.tsx
│   │   │   ├── WorkerProfile.tsx
│   │   │   ├── Templates.tsx
│   │   │   ├── Issues.tsx
│   │   │   ├── Playbooks.tsx
│   │   │   ├── Certificate.tsx
│   │   │   ├── Plans.tsx
│   │   │   ├── Settings.tsx
│   │   │   └── Account.tsx
│   │   ├── data/
│   │   │   ├── demoData.ts
│   │   │   └── seedDemoData.ts          # ⭐ Auto-seed function
│   │   ├── lib/
│   │   │   ├── supabase.ts
│   │   │   ├── queryClient.ts
│   │   │   ├── database.types.ts
│   │   │   ├── utils.ts
│   │   │   └── riskCalculator.ts
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── public/
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── components.json
│   └── .env.local
├── supabase/
│   └── migrations/
│       ├── 001_core_auth_orgs.sql
│       ├── 002_regions_teams_workers.sql
│       ├── 003_onboarding_system.sql
│       ├── 004_issues_cpd_playbooks.sql
│       ├── 005_org_invites.sql
│       └── 006_helper_functions.sql
├── index.html                    # Keep: Marketing site
└── website-export/               # Keep: Static marketing pages
```

## Verification Steps

### Authentication

- [ ] Sign up creates new account
- [ ] Sign in works with email/password
- [ ] Demo login (demo@retaind.app) works instantly
- [ ] Sign out clears session

### View-As Functionality

- [ ] View-As selector appears in TopBar
- [ ] Shows current persona name and role badge
- [ ] Dropdown lists all 11 personas
- [ ] Switching persona updates context
- [ ] Data filters by role scope:
  - Admin sees all data
  - Operative sees only own data
  - Team Leader sees only their team
  - Regional Manager sees only their region
- [ ] Visual indicator shows active persona

### Auto-Seed Demo Data

- [ ] On first login to empty org, toast shows "Setting up demo data..."
- [ ] Demo data populates automatically:
  - 4 regions
  - 12 teams
  - 40+ workers
  - Onboarding templates
  - Issues
  - CPD records
  - Playbooks
- [ ] Toast shows "Demo data loaded successfully!"
- [ ] Second login does not re-seed

### Data Layer

- [ ] Live data fetches when available
- [ ] Falls back to demo data when DB is empty
- [ ] Hybrid indicator shows data source

### Pages

- [ ] Dashboard: metrics, charts render correctly
- [ ] People: list, search, filter work
- [ ] Worker Profile: all tabs load with data
- [ ] Templates: list shows templates
- [ ] Issues: create and filter work
- [ ] Playbooks: content displays
- [ ] Settings: org settings editable

### Responsive Design

- [ ] Mobile viewport: hamburger menu, card views
- [ ] Tablet viewport: responsive grid
- [ ] Desktop viewport: full layout

### Risk Calculation

- [ ] Risk scores calculate correctly
- [ ] Risk levels (low/medium/high/critical) display with correct colors
- [ ] Dashboard shows at-risk workers

## Implementation Notes

### Key Features

**View-As Selector:**

- Located in TopBar (top-right area)
- Popover component with list of 11 demo personas
- Current persona shown with name + role badge
- Switching updates AccessControlContext state
- All queries automatically filter by persona scope
- Visual indicator (e.g., colored border) when viewing as non-Admin

**Auto-Seed Demo Data:**

- Triggered in AuthContext after successful authentication
- Checks worker count for current org
- If count === 0, calls `seedDemoData(orgId)`
- Shows toast notifications (info at start, success at end)
- Idempotent: safe to call multiple times
- Seeds 8 entity types in order (regions → teams → workers → templates → tasks → issues → CPD → playbooks)

### Development Tips

1. **Start with scaffolding**: Get Vite + Tailwind + shadcn/ui working first
2. **Build foundation contexts**: AuthContext and AccessControlContext are critical
3. **Use hardcoded demo data early**: Don't wait for database to be perfect
4. **Component composition**: Build small, reusable components
5. **Test View-As frequently**: Switch personas often to catch scope bugs
6. **Use React Query DevTools**: Install for debugging queries

### Performance Considerations

- Lazy load routes with `React.lazy()`
- Memoize risk calculations with `useMemo`
- Debounce search inputs
- Virtual scrolling for large tables (react-virtual)
- Optimize images and assets

### Security

- All Supabase RLS policies enforced
- No sensitive data in demo data files
- API keys in `.env.local` (gitignored)
- Auth tokens stored in httpOnly cookies (Supabase default)

## Success Criteria

The MVP is complete when:

1. ✅ User can sign up, sign in, sign out
2. ✅ Demo login works instantly
3. ✅ Auto-seed populates demo data on first login
4. ✅ View-As selector switches between 11 personas
5. ✅ Data correctly filters by role scope
6. ✅ All 11 pages are navigable and functional
7. ✅ Dashboard shows metrics and charts
8. ✅ People page lists workers with search/filter
9. ✅ Worker Profile shows all data sections
10. ✅ Risk scores calculate and display correctly
11. ✅ Responsive design works on mobile
12. ✅ Toast notifications show for all actions

## Post-MVP Enhancements

Future features to consider:

- Real-time updates via Supabase subscriptions
- Advanced analytics and trend analysis
- Mobile companion app (React Native)
- FSM system integrations
- AI features (pattern detection, risk prediction)
- Custom playbook builder
- Automated email notifications
- File uploads for evidence
- Calendar integration
- Bulk import/export

---

**Estimated Timeline**: 4-6 weeks for full MVP with all features
**Primary Focus**: View-As role switching + Auto-seed demo data + Full 11-page SaaS application
