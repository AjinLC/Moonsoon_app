# CLAUDE.md

Guidance for Claude Code when working with this repository.

## Repository layout

```
/
├── CLAUDE.md
├── moonsoon-app/          ← all app code lives here
│   ├── app/
│   │   ├── _layout.tsx            # Root layout + auth redirect logic
│   │   ├── modal.tsx
│   │   ├── +not-found.tsx
│   │   ├── (auth)/
│   │   │   ├── _layout.tsx        # Headerless Stack
│   │   │   ├── login.tsx
│   │   │   ├── signup.tsx
│   │   │   └── forgot-password.tsx
│   │   └── (tabs)/
│   │       ├── _layout.tsx        # Tab bar (Home + Profile)
│   │       ├── index.tsx          # Home tab
│   │       └── profile.tsx        # Profile tab
│   ├── components/
│   │   ├── Button.tsx
│   │   ├── Container.tsx
│   │   ├── EditScreenInfo.tsx
│   │   ├── HeaderButton.tsx
│   │   ├── ScreenContent.tsx
│   │   └── TabBarIcon.tsx
│   ├── context/
│   │   └── AuthContext.tsx        # Session state + useSession() hook
│   ├── utils/
│   │   └── supabase.ts            # Supabase client (platform-conditional storage)
│   ├── global.css                 # Tailwind entry point
│   ├── app.json
│   ├── babel.config.js
│   ├── metro.config.js
│   ├── tailwind.config.js
│   └── package.json
```

**All commands must be run from `moonsoon-app/`.** The repo root only holds the project folder and `todo.docx`.

---

## Commands

Package manager: **pnpm** — always use `pnpm`, never `npm` or `yarn`.

```bash
pnpm install           # install deps
pnpm start             # Expo dev server (Metro)
pnpm no-cache          # expo start --clear  ← use when Metro/NativeWind cache is stale
pnpm ios               # iOS simulator
pnpm android           # Android emulator
pnpm web               # web target via Metro
pnpm prebuild          # generate native ios/ android/ folders (gitignored)

pnpm lint              # eslint + prettier --check
pnpm format            # eslint --fix + prettier --write
```

There is **no test runner** configured.

---

## Environment variables

Create `moonsoon-app/.env` (gitignored). The `EXPO_PUBLIC_` prefix is required — Expo only inlines vars with that prefix into the client bundle.

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

---

## Architecture

### Auth-gated routing

The redirect logic lives in **`app/_layout.tsx`** inside `RootNavigator`, which reads `useSession()` and `useSegments()`:

| State | Destination |
|---|---|
| `!session` and not in `(auth)` | `/(auth)/login` |
| `session` and in `(auth)` | `/(tabs)` |
| `loading === true` | `ActivityIndicator` (no redirect) |

**Never short-circuit the loading branch.** Without it, the redirect fires before SecureStore rehydrates the session, bouncing a logged-in user to login on cold start.

**Auth screens do not call `router.replace` after success.** They call the Supabase method; `onAuthStateChange` updates the session in `AuthContext`, which re-triggers the effect in `RootNavigator`, which redirects. Don't add navigation calls inside auth handlers.

### AuthContext (`context/AuthContext.tsx`)

Provides `{ session, user, loading, signOut }` via `useSession()` hook. Hydrates from storage once on mount (`getSession`), then listens for changes via `onAuthStateChange`. Must wrap the entire app — it's applied in `RootLayout` wrapping `RootNavigator`.

### Supabase client (`utils/supabase.ts`)

Uses a **platform-conditional storage adapter**:
- **Native** → `expo-secure-store` (`getItemAsync` / `setItemAsync` / `deleteItemAsync`)
- **Web** → `localStorage`

This split is intentional — SecureStore doesn't exist on web and localStorage doesn't exist on native. Do **not** replace with a single `AsyncStorage` adapter without preserving both branches.

`detectSessionInUrl: false` is set deliberately for native — do not change it.

### Styling: NativeWind v4

Use `className` on React Native components. Avoid `StyleSheet.create` in new code (project migrated away from it).

Three config files must stay in sync:

| File | Role |
|---|---|
| `babel.config.js` | `jsxImportSource: 'nativewind'` + `nativewind/babel` preset |
| `metro.config.js` | `withNativeWind(config, { input: './global.css' })` |
| `global.css` | `@tailwind base/components/utilities` — imported at top of `app/_layout.tsx` |

Tailwind only scans `./app/**` and `./components/**` (see `tailwind.config.js`). Classes in files outside those paths won't be extracted.

If classes stop applying → run `pnpm no-cache`. Metro caches NativeWind's transform output aggressively.

### Key dependencies & versions

| Package | Version | Notes |
|---|---|---|
| `expo` | `^54.0.0` | Managed workflow |
| `react-native` | `0.81.5` | |
| `expo-router` | `~6.0.10` | File-based routing |
| `nativewind` | `latest` (v4) | Tailwind for RN |
| `@supabase/supabase-js` | `^2.97.0` | Auth + DB client |
| `react-native-reanimated` | `~4.1.1` | Requires worklets plugin |
| `react-native-worklets` | `0.5.1` | Babel plugin in `babel.config.js` |
| `expo-secure-store` | `~15.0.8` | Native auth token storage |

### Other config notes

- `app.json` enables `experiments.typedRoutes` — route strings are type-checked. Use typed href values (e.g. `/(auth)/login`) rather than plain strings where possible.
- `experiments.tsconfigPaths` enables the `@/*` alias (maps to repo root) configured in `tsconfig.json`.
- `ios/` and `android/` are gitignored — this is a **managed Expo workflow**. Run `pnpm prebuild` only if you need to eject into native code.
- `react-native-worklets/plugin` must stay in `babel.config.js` for Reanimated 4 to work.

---

## Current screen status

| Screen | File | Notes |
|---|---|---|
| Login | `(auth)/login.tsx` | ✅ Complete |
| Sign Up | `(auth)/signup.tsx` | ✅ Complete |
| Forgot Password | `(auth)/forgot-password.tsx` | ✅ Complete |
| Home tab | `(tabs)/index.tsx` | 🚧 Placeholder |
| Profile tab | `(tabs)/profile.tsx` | 🚧 Placeholder |
| Modal | `modal.tsx` | 🚧 Placeholder |

Both tab screens import `supabase` but don't use it yet — safe to remove that import or start building out their data fetching.

The `TabBarIcon` in both tabs currently uses `name="code"` (a placeholder icon). Update these when you know the intended icons.