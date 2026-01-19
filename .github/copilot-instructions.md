# Game Tracker - AI Coding Agent Instructions

## Core Principles

**CLEAN CODE IS PARAMOUNT**: Every change must prioritize code quality, maintainability, and adherence to established patterns. Code should be self-documenting, easy to understand, and ready for change.

**MODULARITY**: Keep logic isolated and reusable. Each component, function, and module should have a single, clear responsibility.

**CONSISTENCY**: Follow existing patterns religiously. If a pattern exists, use it. Don't reinvent wheels or create isolated solutions.

**UI COHESION**: The entire application must feel like a unified, professional product. Colors, spacing, typography, and component behavior must be consistent across all pages and features.

## Architecture Overview

**React + TypeScript + Vite** SPA for tracking board game events, player stats, and leaderboards. Backend: **Firebase** (Firestore, Auth, Storage). Styling: **Tailwind CSS v4** via Vite plugin (not PostCSS).

**Feature-based structure**: Domain-driven folders (`features/players`, `features/games`, `features/events`, `features/stats`, `features/leaderboard`, `features/dashboard`, `features/users`) + shared utilities in `common/`.

**Routing**: React Router v7 (from `react-router` package) routes defined inline in [src/main.tsx](src/main.tsx). All forms/modals are JSX components, not separate routes.

**Form validation**: Uses `react-hook-form` + `zod` schemas + `@hookform/resolvers` for type-safe form handling.

**Notifications**: `react-hot-toast` via `ToastProvider` for success/error messages.

## Critical Context Provider Pattern

**Nested provider architecture** with strict ordering (see `src/main.tsx`):

```tsx
<ErrorBoundary>
  <AuthProvider>
    <UsersProvider>
      <PlayersProvider>
        <GamesProvider>
          <EventsProvider>
            <ResultsProvider>
              <UIProvider>
                <ModalProvider>
                  <ToastProvider>
                    <ReadyGate>{/* app content */}</ReadyGate>
```

**Key behaviors:**

- Each provider uses Firebase `onSnapshot` for real-time sync
- Data flows: providers → context → hooks (one-way)
- `ReadyGate` blocks rendering until all providers load (`useAppReady` checks `loading` flags)
- All providers expose: `loading` boolean, data arrays, `*ById` Maps, CRUD methods
- **Provider-to-Map pattern**: Use `createMapBy()` helper for O(1) lookups (e.g., `playerById.get(id)`)
- **Year filtering**: `UIProvider` manages global `selectedYear` state, initialized to most recent year on load (see [common/utils/yearFilter.ts](common/utils/yearFilter.ts))
- **Theme management**: `UIProvider` handles dark/light mode via `theme` state, persisted in localStorage, applied to `document.documentElement.classList`

## Data Model

**Core entities** (Firestore collections):

- **Users** (`IUser`): `email`, `role` ("admin" | "user"), `linkedPlayerId`, `createdAt`
- **Players** (`IPlayer`): `firstName`, `lastName`, `preferredName`, `pictureUrl`, `color`, `linkedUserId`
- **Games** (`IGame`): `name`, `points` (base value), `type` ("board" | "video")
- **Events** (`IEvent`): `location`, `date` (ISO string), `gameIds[]`, `playerIds[]`
- **Results** (`IResult`): `eventId`, `gameId`, `order`, `playerResults[]`
    - `IPlayerResult`: `playerId`, `rank`, `isWinner`, `isLoser` (all nullable except `playerId`)

**User-Player Relationship**:

- Users and Players are separate entities with optional bidirectional linking
- Users = app accounts with authentication and permissions (email, role only)
- Players = game participants with profile data (names, photos, colors)
- Link via `linkedPlayerId` on User and `linkedUserId` on Player
- Admins manage linking via Users page
- Users edit their profile via `/profile` page, which updates their linked player data directly

**Winner logic** (`common/utils/gameHelpers.ts`):

```typescript
isPlayerWinner = (result) => result.isWinner || result.rank === 1;
```

## Import Path Convention

**Use absolute imports from `src/`** (via `vite-tsconfig-paths` plugin):

```typescript
import { usePlayers } from "features/players/context/PlayersContext"; // ✅
import { usePlayers } from "../../../features/players/context/PlayersContext"; // ❌
```

## Context Access Pattern

**Each feature has its own context hooks** (e.g., `usePlayers()`, `useGames()`, `useEvents()`). All providers expose both array and Map for O(1) lookups:

```typescript
const { players, playerById, addPlayer, editPlayer, deletePlayer } = usePlayers();
// Use createMapBy() helper from common/utils/helpers.ts for custom Maps
```

## Authentication & Authorization

**Role-based access control** via `useAuth()`: `{ authUser, user, isAdmin, canEdit, currentUserPlayerId }`

**Permissions**: Unauthenticated (read-only) | Users (edit linked player) | Admins (full CRUD)

**UI pattern**: `{isAdmin && <Button onClick={handleEdit}>Edit</Button>}`

**First admin setup**: See [AUTH_SETUP.md](../AUTH_SETUP.md).

## Modal System & Notifications

**Modal**: Global modal via `ModalProvider`. Forms render as modal content, not separate routes.
**Toast**: Use `useToast()` hook for success/error messages.

```typescript
const { openModal, closeModal } = useModal();
const toast = useToast();
openModal(<PlayerForm onSubmit={handleSubmit} />);
toast.success("Player added successfully");
```

## Year Filtering Pattern

**Global year filter via `UIProvider`**. Utilities in [common/utils/yearFilter.ts](common/utils/yearFilter.ts): `filterEventsByYear()`, `filterResultsByYear()`, `getAvailableYears()`.

```typescript
const { selectedYear, setSelectedYear, availableYears } = useUI();
```

## Stats & Aggregation

**Player stats computed on-the-fly** in [features/players/utils/stats.ts](features/players/utils/stats.ts): `getPlayerData()`, `getPlayerAggregates()`, `getHeadToHeadRecord()`.

**Always filter results by player/game** before aggregating to avoid full-table scans.

## UI Design System & Consistency

**Tailwind CSS v4** via Vite plugin. Colors defined as CSS variables in [src/index.css](src/index.css). Player colors are hex strings applied via inline styles.

**CRITICAL**: All UI components must follow these exact design tokens for consistency. Never introduce new spacing, sizing, or color values without updating the system.

### Color System

**Always use CSS custom properties for colors** - never hardcode colors except for player-specific colors:

```typescript
// ✅ Correct - Uses design system
className = "bg-[var(--color-surface)] text-[var(--color-text)]";

// ❌ Wrong - Hardcoded colors
className = "bg-gray-100 text-black";
```

**Color Variables** (defined in [src/index.css](src/index.css)):

- **Primary/Secondary**: `--color-primary`, `--color-secondary` (+ `*-contrast` variants)
- **Backgrounds**: `--color-bg` (page), `--color-surface` (cards), `--color-hover`
- **Text**: `--color-text`, `--color-text-secondary`, `--color-text-muted`
- **Borders**: `--color-border`, `--color-border-strong`
- **Semantic**: `--color-success`, `--color-danger`, `--color-warning`, `--color-info` (+ `*-contrast` variants)
- **Rankings**: `--color-gold`, `--color-silver`, `--color-bronze` (+ `*-contrast` variants)

### Typography Scale

**Font sizes** - Use these exact classes consistently:

- `text-xs` (12px) - Labels, metadata, helper text
- `text-sm` (14px) - Body text, form inputs, buttons
- `text-base` (16px) - Headings in cards, important labels
- `text-lg` (18px) - Page titles (mobile)
- `text-xl` (20px) - Page titles (desktop), section headings
- `text-2xl` (24px) - Large stats, hero numbers
- `text-3xl`+ - Reserved for special emphasis only

**Font weights**:

- `font-normal` (400) - Default body text
- `font-medium` (500) - Subtle emphasis, labels
- `font-semibold` (600) - Subheadings, important values
- `font-bold` (700) - Page titles, primary headings

**Font families**:

- `font-sans` (Inter) - Default for all UI
- `font-display` (Righteous) - Currently unused, reserved for special branding

### Spacing System

**Use these spacing values consistently**:

- **Gaps between elements**: `gap-1` (4px), `gap-2` (8px), `gap-3` (12px), `gap-4` (16px), `gap-6` (24px)
- **Padding**: `p-3` (12px), `p-4` (16px), `p-6` (24px) - Cards typically use `p-4 sm:p-6`
- **Margins**: `mb-3`, `mb-4` (12px/16px) - Section spacing, `mt-6` (24px) - Large section breaks
- **Responsive**: Use `sm:`, `md:`, `lg:` prefixes to adjust spacing at breakpoints

**Common patterns**: Cards use `p-4 sm:p-6`, grids use `gap-4`, sections use `mb-4 sm:mb-6`.

### Component Patterns

**Reusable components** (from [common/components/](common/components/)):

1. **Button** - `variant`: "primary" | "secondary" | "ghost" | "danger", `size`: "sm" | "md" | "lg"
2. **Card** - `variant`: "default" | "interactive" | "empty"
3. **Badge** - `variant`: "default" | "primary" | "secondary" | "success" | "warning" | "danger" | "info"
4. **Input** - Standardized form input with error states
5. **Select** - Dropdown with consistent styling
6. **PageHeader** - Icon + title + count + optional action button
7. **EmptyState** - Icon + message for empty lists
8. **Modal** - Global modal via `ModalProvider`

**Always use these components instead of creating custom variants**. If a component needs modification, update the base component or discuss whether a new variant is needed.

### Layout Patterns

**Page structure**: Use `PageHeader` + responsive grid (`grid gap-4 md:grid-cols-2 lg:grid-cols-3`).
**Forms**: Use `m-0 flex flex-col gap-4 p-0` for consistent field spacing.

### Responsive Design

**Mobile-first approach**. Always define mobile styles first, then use breakpoints:

- `sm:` (640px+) - Tablets
- `md:` (768px+) - Small laptops
- `lg:` (1024px+) - Desktops

**Common patterns**: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`, `text-sm md:text-base`, `p-4 sm:p-6`, `gap-4 sm:gap-6`

### Dark Mode

Handled automatically by CSS custom properties. The `UIProvider` toggles `.dark` class on `document.documentElement`, which updates all `--color-*` variables.

**Never use dark: prefix in Tailwind** - colors automatically adapt via custom properties.

## Firebase Integration

**Config**: [src/firebase.ts](src/firebase.ts) exports `db`, `auth`, `storage`.

**Real-time listeners**: Use `onSnapshot()` for live sync. Always update `loading` state. Image uploads use Firebase Storage with cache control headers.

## Development Workflow

**Commands**: `npm run dev` (port 5173), `npm run build`, `npm run lint`, `npm run preview`

**Deployment**: AWS S3 + CloudFront via CodeBuild. Husky + lint-staged runs Prettier/ESLint on commit.

## Code Organization & File Structure

**Feature Structure** - Each feature follows this exact pattern:

```
features/{feature-name}/
  ├── components/       # Feature-specific UI components
  ├── context/          # Feature context and provider
  ├── pages/            # Feature pages/views
  ├── utils/            # Feature-specific utilities
  │   ├── helpers.ts    # Utility functions
  │   ├── stats.ts      # Statistical calculations (if applicable)
  │   ├── hooks.ts      # Custom hooks (if applicable)
  │   └── calculations/ # Complex calculations (if needed)
  └── types.d.ts        # TypeScript interfaces/types
```

**Common Structure** - Shared/reusable code:

```
common/
  ├── components/       # Reusable UI components (Button, Card, Modal, etc.)
  │   └── index.ts      # Centralized exports
  ├── context/          # Global contexts (Auth, UI, Modal, Toast)
  ├── utils/            # Shared utilities
  │   ├── constants.ts  # App-wide constants and thresholds
  │   ├── helpers.ts    # General utility functions
  │   ├── dateFormatters.ts
  │   ├── gameHelpers.ts
  │   ├── sorting.ts
  │   ├── validation.ts
  │   ├── yearFilter.ts
  │   └── hooks.ts      # Shared custom hooks
  └── types/            # Global type definitions
```

**File Placement Rules**:

1. **Component belongs to a feature?** → Put it in `features/{feature}/components/`
2. **Component used in 2+ features?** → Move to `common/components/` and add to index.ts
3. **Utility function specific to a feature?** → `features/{feature}/utils/helpers.ts`
4. **Utility function used across features?** → `common/utils/helpers.ts`
5. **Type used only in one feature?** → `features/{feature}/types.d.ts`
6. **Type used globally?** → `common/types/` or appropriate feature type file with export

**Never duplicate code**. If logic exists elsewhere, import and reuse it.

## Common Patterns to Follow

1. **Display names**: Use `getDisplayName(player)` (from [features/players/utils/helpers.ts](features/players/utils/helpers.ts)) - prefers `preferredName` over `firstName`
2. **Icons**: Use `lucide-react` for all icons
3. **Animations**: Use `framer-motion` for modal transitions (see [common/components/Modal.tsx](common/components/Modal.tsx))
4. **Date handling**: Use `date-fns` library (already in dependencies)
5. **Charts**: Use `recharts` for all data visualizations (see [features/stats/components/](features/stats/components/))
6. **Form validation**: Use `react-hook-form` with `zodResolver` from `@hookform/resolvers/zod` for schema validation
7. **Error handling**: All components wrapped in `ErrorBoundary` (see [common/components/ErrorBoundary.tsx](common/components/ErrorBoundary.tsx))
8. **Percentage formatting**: Use `formatPct()` from [common/utils/helpers.ts](common/utils/helpers.ts) (rounds to whole number)

## Code Quality Standards

### Component Structure

**Standard pattern**: Import dependencies → types → props interface → component with hooks → handlers → effects → JSX. Use `React.FC<Props>` for all components.

### TypeScript Best Practices

1. **Always define interfaces for props** - No inline prop types
2. **Use type imports**: `import type { IPlayer } from "..."`
3. **Prefix interfaces with `I`** for data models: `IPlayer`, `IGame`, `IEvent`
4. **Export types from feature `types.d.ts` files**
5. **Use `React.FC<Props>` for function components**
6. **Avoid `any`** - Use proper types or `unknown` with type guards

### Function Naming

- **Event handlers**: `handleActionName` (e.g., `handleAddPlayer`, `handleEdit`)
- **Boolean functions**: `isCondition` or `hasCondition` (e.g., `isPlayerWinner`, `hasPermission`)
- **Data transformers**: `getDataName` or `calculateValue` (e.g., `getPlayerData`, `calculateWinRate`)
- **Filters**: `filterByCondition` (e.g., `filterEventsByYear`)

### State Management

1. **Context for shared state** - Each feature has its own provider
2. **Local state for UI** - Form inputs, modal visibility, etc.
3. **No prop drilling** - Use context if passing props more than 2 levels deep
4. **Computed values** - Use `useMemo` for expensive calculations only

### Error Handling

```typescript
// ✅ Correct - Proper error handling with user feedback
try {
	await addPlayer(player);
	toast.success("Player added successfully");
	closeModal();
} catch (error) {
	toast.error("Failed to add player");
	throw error; // Re-throw if parent needs to know
}

// ❌ Wrong - Silent failures
await addPlayer(player);
closeModal();
```

### Performance Considerations

1. **Use Map for lookups** - All providers expose `*ById` Maps (e.g., `playerById.get(id)`)
2. **Filter before aggregating** - Don't process full result sets unnecessarily
3. **Memoize expensive calculations** - Use `useMemo` for complex stats
4. **Lazy load heavy components** - Charts, images, etc.
5. **Debounce user input** - Search boxes, filters

### Testing Checklist

Before committing any code, verify:

- ✅ TypeScript compiles without errors (`npm run build`)
- ✅ ESLint passes (`npm run lint`)
- ✅ Component renders correctly at mobile, tablet, desktop sizes
- ✅ Dark mode works correctly
- ✅ Loading states handled
- ✅ Empty states handled
- ✅ Error states handled
- ✅ Accessibility (keyboard navigation, ARIA labels where needed)
- ✅ No console errors/warnings
- ✅ Matches existing UI patterns and spacing

## Key Files Reference

- **Provider setup**: [src/main.tsx](src/main.tsx)
- **Type definitions**: `src/features/*/types.d.ts`
- **Stat calculations**: `src/features/*/utils/stats.ts`
- **Reusable components**: [src/common/components/](src/common/components/)
- **Routing**: All routes defined in [src/main.tsx](src/main.tsx) (no separate router config)
