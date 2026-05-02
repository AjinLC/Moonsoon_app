# prompt.md — Moonsoon App Build Instructions

This file is for Claude Code. Read it fully before writing a single line of code.
Reference: https://www.figma.com/design/SS0JEdwGJUluCuZ7BMwlnX/Moonsoon-%E2%80%93-UI-Design-System---Screens

---

## What we are building

**Moonsoon** is a minimal, editorial astrology and wellness app. It gives users a daily horoscope, a planner tied to astrological energy, a daily tarot card, and their full birth chart. The UI is inspired by print editorial design — high whitespace, Pavot headings, sharp corners everywhere, and a single accent color the user picks.

---

## Design system (extract from Figma `🎨 Design System` page)

### Colors

**Light theme (default)**

| Token | Hex |
|---|---|
| Background | `#F7F7F7` |
| Surface | `#F8F8F8` |
| Border | `#E5E5E5` |
| Text Primary | `#000000` |
| Text Secondary | `#666666` |
| Text Tertiary | `#999999` |

**Dark theme**

| Token | Hex |
|---|---|
| Background | `#0A0A0A` |
| Surface | `#141414` |
| Border | `#2A2A2A` |
| Text Primary | `#FFFFFF` |
| Text Secondary | `#999999` |
| Text Tertiary | `#666666` |

**Accent (user-selectable, default Indigo)**

| Name | Hex |
|---|---|
| Indigo (default) | `#4F46E5` |
| Sage | `#6B8F71` |
| Dusty Rose | `#C4727F` |
| Amber | `#D4A843` |

The accent color is used **only** for: active tab indicator, progress bars, primary CTA buttons, and toggle-on states. Nowhere else.

### Typography

**Pavot** is a custom local font stored in `moonsoon-app/assets/fonts/`. It is used for all headings. **Inter** (system font, via NativeWind) is used for all body text. Do **not** install any Google Fonts package — the font is already in the repo.

| Scale | Font | Size | Weight |
|---|---|---|---|
| Display | Pavot | 32px | Bold |
| H2 | Pavot | 24px | Bold |
| H3 | Pavot | 18px | SemiBold |
| Body | Inter | 15px | Regular |
| Body Small | Inter | 13px | Regular |
| Caption | Inter | 11px | Medium |

**Pavot weight → file mapping** — before writing any font code, run `ls moonsoon-app/assets/fonts/` to confirm the exact filenames. The naming convention is `Pavot-{Weight}.otf`. Map weights to files like this (adjust if filenames differ):

| Weight needed | Expected filename |
|---|---|
| Bold (Display, H2) | `Pavot-Bold.otf` |
| SemiBold (H3) | `Pavot-SemiBold.otf` or `Pavot-Medium.otf` |
| Regular | `Pavot-Regular.otf` or `Pavot-Light.otf` |
| Italic | `Pavot-Italic.otf` or `Pavot-LightItalic.otf` |

If a weight doesn't have a dedicated file, use the nearest available weight and note it in a code comment.

### Design rules — these are non-negotiable

- **All corners: 0px radius** — sharp everywhere, no `rounded-` classes except on toggle/pill controls
- **Dividers: 0.5px lines** using border color — use `border-b` with `border-[0.5px]` and `borderColor`
- **Spacing: 8px grid** — use multiples of 2 in Tailwind (`p-2`, `p-4`, `p-6`, `p-8`)
- **No emojis** — use thin-line icon text or Expo vector icons only
- **High whitespace** — generous vertical padding between sections, never feel cramped
- **Transitions: 300–500ms ease** — all opacity and scale animations use this timing
- **Accent only on active/CTA** — do not use accent for text, backgrounds, or decorative use
- **Horizontal padding: 32px** from screen edge — use `px-8` consistently

---

## App architecture

### Route structure to implement

```
app/
├── _layout.tsx            # already done — auth redirect
├── (auth)/
│   ├── _layout.tsx        # already done
│   ├── login.tsx          # already done
│   ├── signup.tsx         # already done
│   └── forgot-password.tsx # already done
├── (onboarding)/
│   ├── _layout.tsx        # NEW — headerless Stack
│   ├── splash.tsx         # NEW
│   ├── birth-data.tsx     # NEW
│   └── preferences.tsx    # NEW
├── (tabs)/
│   ├── _layout.tsx        # UPDATE — new tab bar + icons
│   ├── index.tsx          # UPDATE — full Home screen
│   ├── planner.tsx        # NEW — rename from profile for now
│   ├── tarot.tsx          # NEW
│   └── profile.tsx        # UPDATE — full Profile screen
└── horoscope/[category].tsx  # NEW — detail view
```

### Auth + onboarding flow

After first sign-up, redirect to `/(onboarding)/splash` instead of `/(tabs)`. Track whether onboarding is complete in Supabase (a `profiles` table with `onboarding_complete: boolean`). If `onboarding_complete = true`, skip onboarding. Update `_layout.tsx` to check this.

### State management

Use React Context for:
- `ThemeContext` — light/dark + accent color, persisted to Supabase `profiles`
- `BirthDataContext` — date/time/place of birth, fetched from Supabase `profiles`

---

## Supabase schema

Create this table in Supabase before writing any data-fetching code:

```sql
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  name text,
  date_of_birth date,
  time_of_birth time,
  place_of_birth text,
  onboarding_complete boolean default false,
  accent_color text default 'indigo',
  theme text default 'light',
  focus_areas text[] default '{}',
  notifications_mantra boolean default true,
  notifications_horoscope boolean default true,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;
create policy "Users can read/write own profile"
  on public.profiles for all
  using (auth.uid() = id)
  with check (auth.uid() = id);
```

Create a trigger to auto-insert a profile row on new sign-up:

```sql
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id)
  values (new.id);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

---

## Screen-by-screen build instructions

Work in this order. Each section is a separate task.

---

### TASK 1 — Tab bar (`app/(tabs)/_layout.tsx`)

Replace the current placeholder tab layout with the real one.

**4 tabs:**

| Tab | Route | Label | Icon |
|---|---|---|---|
| Home | `index` | Home | `Feather: home` |
| Planner | `planner` | Planner | `Feather: calendar` |
| Tarot | `tarot` | Tarot | `Feather: layers` |
| Profile | `profile` | Profile | `Feather: user` |

**Tab bar styling:**
- Background: Surface color
- Top border: 0.5px, Border color
- No shadow/elevation
- Tab labels: Caption scale (11px Medium), all lowercase
- Active indicator: 2px wide, 40px wide, accent color, sits at top of tab bar (not bottom)
- Active label color: accent. Inactive: Text Tertiary
- No tab bar icons in the Figma — use text labels only, or very minimal Feather icons at 20px if needed

```tsx
// Key styling for tab bar
tabBarStyle: {
  borderTopWidth: 0.5,
  borderTopColor: '#E5E5E5',
  elevation: 0,
  shadowOpacity: 0,
  height: 70,
  paddingBottom: 0,
}
```

---

### TASK 2 — Onboarding: Splash (`app/(onboarding)/splash.tsx`)

**Design (Figma node `37:2`):**
- Full-screen, dark background (`#000` or very near-black)
- Centered content
- A thin cross/plus symbol (two 0.5px rectangles, one vertical 120px tall, one horizontal 100px wide, both centered)
- App name "moonsoon" — Display scale, Pavot, centered
- Tagline "align with the stars" — Body scale, Inter, Text Secondary color, centered
- No buttons — auto-advance after 2 seconds or tap anywhere

**Behavior:** After the splash auto-advances, navigate to `/(onboarding)/birth-data`.

---

### TASK 3 — Onboarding: Birth Data (`app/(onboarding)/birth-data.tsx`)

**Design (Figma node `37:8`):**

Three field groups, each with this pattern:
1. 11px caption label above field
2. 0.5px divider above group
3. 48px tall input box (0px radius, border color border, surface background)
4. Body Small helper text below in Text Tertiary

Fields:
- **Date of birth** — placeholder `DD / MM / YYYY` — use a date picker (DateTimePicker from `expo`) on tap
- **Time of birth** — placeholder `HH : MM` — time picker on tap, with note: "Check your birth certificate if you can."
- **Place of birth** — placeholder `City, Country` — text input with autocomplete (use a simple TextInput for now, wire up Google Places later)

Bottom of screen:
- Primary CTA button: "Calculate my chart" — full width, 48px tall, **accent color** background, 0px radius
- Text link below: "Skip for now" — Text Secondary, centered

On submit: save to Supabase `profiles`, navigate to `/(onboarding)/preferences`.

---

### TASK 4 — Onboarding: Preferences (`app/(onboarding)/preferences.tsx`)

**Design (Figma node `37:32`):**

**Focus areas** section — 2-column grid of toggle tiles:
- Health & Wellness, Career & Finance, Spiritual Growth, Love & Relationships, Creativity, Learning
- Each tile: 155px wide, 56px tall, 0px radius, Border color border
- Selected state: Border color becomes accent, label becomes accent
- Multi-select allowed

**Notifications** section — 11px section header "NOTIFICATIONS" in Text Tertiary uppercase
- Two toggle rows: "Daily mantra reminders" and "Horoscope updates"
- Each row: label in Body, description in Body Small (Text Tertiary), custom toggle on the right
- Toggle: 40×22px pill (this is the only rounded shape in the app — 11px radius). Off = Border color. On = Accent color. White 18×18 circle inside.

Bottom CTA: "Get started" — same style as Birth Data CTA.

On submit: set `onboarding_complete = true` in Supabase, navigate to `/(tabs)`.

---

### TASK 5 — Home screen (`app/(tabs)/index.tsx`)

**Design (Figma node `31:2`):** Full scrollable screen.

**Section 1 — Header**
- Small caption at top: day + date (e.g., "Tuesday, March 18") in Text Tertiary, Caption scale
- Display heading: today's reading headline (e.g., "The stars lean in your favor today.") — Pavot, 32px bold
- Body text: 4–5 sentence horoscope paragraph — Inter 15px

**Section 2 — Today's Mantra**
- No section label. Directly after a 0.5px divider.
- Mantra text: H2 scale, Pavot italic, Text Primary
- Explanation below in Body, Text Secondary

**Section 3 — Today's tasks**
- H3 label "Today's tasks" + Body Small count (e.g., "3 of 5 completed") below it
- Task list items:
  - 18×18 checkbox (0px radius, border = Border color). Checked state: accent fill, white checkmark.
  - Task name in Body, Text Primary. Completed = Text Tertiary + strikethrough line (a 0.5px horizontal rectangle over the text, same width as text).
  - Time subtitle in Body Small, Text Tertiary
  - 0.5px separator between each task

**Section 4 — Your horoscope today**
- H3 label
- Four categories: Love, Friends, Family, Career
- Each row: category name in H3 (Pavot 18px SemiBold), 2–3 sentence excerpt in Body below, `>` text link on the right
- 0.5px separator above each category
- Tapping `>` navigates to `app/horoscope/[category]`

---

### TASK 6 — Horoscope detail (`app/horoscope/[category].tsx`)

**Design (Figma node `32:2` — "Horoscope Detail – Love"):**

- `< Back` text link at top left (not a button, just `Text` + `router.back()`)
- Category title: Display scale, Pavot
- Date in Caption, Text Tertiary, uppercase
- 0.5px divider
- Long-form reading text in Body, Text Primary — 2–4 paragraphs
- 0.5px divider
- Section header "WHERE THIS COMES FROM" — Caption, uppercase, Text Tertiary
- Intro sentence in Body Small
- Then 2–3 "aspects" — each has:
  - Aspect name in H3 (e.g., "Venus trine Moon")
  - 2–3 paragraph explanation in Body
  - 0.5px divider between aspects
- Section header "LINKED MANTRA" — Caption, uppercase
- Mantra text in H2, Pavot

---

### TASK 7 — Planner: Calendar tab (`app/(tabs)/planner.tsx`)

**Design (Figma node `33:2`):**

**Two sub-tabs at top:**
- "Calendar" and "Goals" rendered as text labels, not `<Tabs>`
- Active underline: 2px tall, 70px wide, accent color, sits directly below active label
- Implemented as local `useState` toggling between two views

**Calendar sub-tab:**

*Week strip:*
- Month + nav arrows: `< March 2025 >` — H3, Text Primary
- Day headers row: M T W T F S S — Caption, Text Tertiary
- Date row: just the numbers — Body Small, Text Primary
- Selected date: 24×24 accent-colored background, white text, 0px radius
- Dots below dates that have events: 4×4 accent-colored square (0px radius)

*Time grid (below selected day label):*
- Left column: hour labels in Caption, Text Tertiary, right-aligned
- 0.5px horizontal lines at each hour
- Event blocks: full-width rectangles (0px radius), Surface background, border color border, with a 3px left accent-color bar
- Event title in Body weight 500, event duration in Body Small, Text Tertiary

*"No set time" section:*
- Divider + label "No set time" in H3
- Helper text in Body Small, Text Tertiary
- Unscheduled tasks listed: each prefixed with `=` symbol (drag handle placeholder) in Text Tertiary, task name in Body

*"+ Add task" text link:* Body, accent color

**Goals sub-tab:**

See TASK 8.

---

### TASK 8 — Planner: Goals tab

**Design (Figma node `33:112`):**

**Time scope sub-tabs:** "This week", "This month", "This year" — same pattern as Calendar/Goals tabs above.

**Goal items** (within selected time scope):
- Goal text: H3, Pavot — the goal statement in quotes-style prose
- Supporting context: Body Small, Text Tertiary — 2–3 sentences of coaching text
- Progress bar: 280px wide, 4px tall, 0px radius. Background = Border color. Fill = accent color. Width set by progress ratio.
- Progress count on the right: Body Small, Text Secondary (e.g., "5/7")
- Linked task below: Caption "Today: [task name]" in Text Tertiary
- 0.5px divider between goals

`+ Add a new goal` text link at the bottom.

---

### TASK 9 — Tarot: Pre-reveal (`app/(tabs)/tarot.tsx`)

**Design (Figma node `35:2`):**

**Card area:**
- 200×320 card face-down: Border color rectangle, 0px radius
- Inside: inner rectangle (172×292) with a thin cross symbol (same 0.5px lines as splash)
- Centered text below card: "Draw today's card" — H3, Text Secondary

**Tap interaction:**
- When user taps the card, animate it flipping (use `react-native-reanimated` rotateY 0→180deg, 400ms ease)
- After flip, navigate to the Revealed state (or render it inline below)

**Recent readings list:**
- Section header: "Recent readings" H3 + "Your past draws and what they revealed." Body Small
- Each row: card name (Body, Text Primary), keywords subtitle (Body Small, Text Tertiary), date on right (Body Small, Text Tertiary), `>` link
- 0.5px dividers between rows

---

### TASK 10 — Tarot: Revealed (`app/tarot/[cardId].tsx` or inline state)

**Design (Figma node `35:46`):**

- `< Back` text link
- 200×300 card revealed: filled rectangle, accent color background, card title centered in white
  - Roman numeral at top (e.g., "XVIII") — Caption
  - Circular symbol in center (two ellipses)
  - Card name centered below (e.g., "The Moon") — H2, white
  - Keywords below (e.g., "Intuition / Illusion / Subconscious") — Body Small, white at 70% opacity
- Section header "YOUR READING" — Caption, Text Tertiary, uppercase, after a 0.5px divider
- Long reading in Body (3–4 paragraphs)
- Section header "ASTROLOGICAL CONTEXT" — same pattern, with long body text
- Section header "ABOUT THIS CARD" — same pattern
- "Share reading" text link — Body, accent color, right-aligned

---

### TASK 11 — Profile: Your Chart tab (`app/(tabs)/profile.tsx`)

**Design (Figma node `36:2`):**

**Two sub-tabs:** "Your chart" and "Settings" — same pattern as Planner

**Your chart sub-tab:**

- 0.5px divider under tabs
- Section header "YOUR BIRTH CHART" — Caption, uppercase, Text Tertiary
- Birth details (e.g., "Born March 12, 1996 at 3:45 AM in Paris, France.") — Body, Text Primary
- 0.5px divider
- Section header "THE BIG THREE" — Caption, uppercase
- Three items (Sun, Moon, Rising):
  - Sign title: H2, Pavot (e.g., "Sun in Pisces")
  - Long explanation: Body, Text Primary — 3–4 paragraphs of real astrological description
  - 0.5px divider between items
- Section header "HOUSES & PLACEMENTS" — Caption, uppercase
- Intro sentence in Body Small
- House items: each has house title (Body 500 weight, e.g., "1st House — Leo") + description (Body Small, Text Tertiary)
- 0.5px divider between house items

---

### TASK 12 — Profile: Settings tab

**Design (Figma node `36:45`):**

**Section: ACCOUNT** (Caption, uppercase)
- Each row: label (Caption, Text Tertiary above), current value (Body, Text Primary), "Edit" text link (Body Small, accent color) right-aligned
- Fields: Name, Email, Date of birth, Time of birth, Place of birth
- 0.5px divider between rows

**Section: PREFERENCES** (Caption, uppercase)
- Each row: label (Body, Text Primary), current value (Body Small, Text Tertiary), `>` right arrow
- Settings: Accent color, Theme, Daily notifications, Mantra reminders (time), Horoscope detail level
- Each taps into a sub-screen or modal

**Subscription row:**
- Label "Subscription", value "Free plan", `>` arrow
- Tapping → Paywall screen

**Danger zone rows:**
- "Sign out" — Body, Text Primary. Calls `supabase.auth.signOut()`
- "Delete account" — Body, Text Primary (do not color red in the design — the design keeps it neutral)
- 0.5px dividers after each

---

### TASK 13 — Paywall (`app/paywall.tsx`, presented as modal)

**Design (Figma node `39:2`):**

- `X` close button top right (Body, Text Primary)
- "PREMIUM" — Caption, uppercase, Text Tertiary, centered
- Headline: "Unlock your full alignment." — Display scale, Pavot, centered
- Subtext: Body, Text Secondary, centered
- 0.5px divider
- **Teaser reading section:** blurred/faded body text with a frosted overlay — use `expo-blur` `BlurView` over a body text block. This previews a premium reading.
- 0.5px divider
- "What you get" — H3
- 4 feature rows, each: `— Feature title` in Body 500 weight, then description in Body Small Text Tertiary, indented 20px
- 0.5px divider
- **Pricing tiles (2 side by side):**
  - "Monthly" + "$4.99 / month" — each tile: 155px wide, 76px tall, 0px radius
  - "Yearly — save 40%" + "$2.99 / month"
  - Selected tile: accent color border (1px). Unselected: Border color.
  - Default: Yearly selected
- Primary CTA: "Start free trial" — full width, 48px, accent background, 0px radius
- Caption below: "7-day free trial, cancel anytime" — Caption, Text Tertiary, centered

---

## Coding conventions

### NativeWind / Tailwind classes to know

```tsx
// Sharp corners — always use this, never rounded-*
className="rounded-none"

// 0.5px divider line
<View className="h-[0.5px] bg-[#E5E5E5]" />

// Accent color button (use inline style for dynamic accent)
<TouchableOpacity style={{ backgroundColor: accentColor }} className="py-3 items-center">

// Caption uppercase
className="text-[11px] font-medium tracking-widest uppercase text-[#999999]"

// Pavot heading — use inline style, not className, for custom fonts
style={{ fontFamily: 'Pavot-Bold', fontSize: 32 }}

// Body text
className="text-[15px] leading-6 text-[#000000]"

// Body Small
className="text-[13px] leading-5 text-[#666666]"

// Left accent bar on calendar events
<View style={{ backgroundColor: accentColor }} className="w-[3px] h-full absolute left-0" />
```

### Font setup — Pavot (local OTF)

`expo-font` is already a dependency. Load Pavot in `app/_layout.tsx` using `useFonts`:

```tsx
import { useFonts } from 'expo-font';

// Inside RootLayout (before return):
const [fontsLoaded] = useFonts({
  'Pavot-Bold': require('../assets/fonts/Pavot-Bold.otf'),
  'Pavot-SemiBold': require('../assets/fonts/Pavot-SemiBold.otf'), // use Medium if SemiBold doesn't exist
  'Pavot-Regular': require('../assets/fonts/Pavot-Regular.otf'),   // use Light if Regular doesn't exist
  'Pavot-Italic': require('../assets/fonts/Pavot-Italic.otf'),     // use LightItalic if needed
});

if (!fontsLoaded) {
  return null; // or a SplashScreen — do not render until fonts are ready
}
```

**Important:** Run `ls moonsoon-app/assets/fonts/` first and adjust the filenames above to match exactly what exists. Font names in `require()` are case-sensitive on Android.

Do **not** install `@expo-google-fonts/playfair-display` or any other font package.

Create a `constants/fonts.ts` file to keep font family strings DRY:

```ts
// moonsoon-app/constants/fonts.ts
export const Fonts = {
  display: 'Pavot-Bold',
  heading: 'Pavot-Bold',
  headingSemi: 'Pavot-SemiBold',
  bodyItalic: 'Pavot-Italic',
  // Inter variants are handled by NativeWind font-weight classes
} as const;
```

Use like this in components:

```tsx
import { Fonts } from '@/constants/fonts';

// Display heading
<Text style={{ fontFamily: Fonts.display, fontSize: 32 }}>
  The stars lean in your favor today.
</Text>

// H2
<Text style={{ fontFamily: Fonts.heading, fontSize: 24 }}>
  Your daily alignment
</Text>

// H3
<Text style={{ fontFamily: Fonts.headingSemi, fontSize: 18 }}>
  Love, Friends, Family, Career
</Text>
```

Never use Pavot for body text, captions, labels, or UI chrome — those stay on Inter via NativeWind.

### Reanimated for card flip (Tarot)

```tsx
// 400ms card flip using react-native-reanimated v4
const rotation = useSharedValue(0);
const animatedStyle = useAnimatedStyle(() => ({
  transform: [{ rotateY: `${rotation.value}deg` }],
}));
const flip = () => {
  rotation.value = withTiming(180, { duration: 400, easing: Easing.out(Easing.ease) });
};
```

### Data fetching pattern

Use a thin wrapper around Supabase for all data. Keep it co-located next to the screen that uses it for now — don't over-engineer a service layer until there are 3+ screens using the same data.

```tsx
// Example — fetch today's horoscope from profiles table
const { data, error } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', session.user.id)
  .single();
```

---

## Build order summary

Start with the highest-leverage, most visible items first:

1. Supabase schema + trigger (15 min)
2. Tab bar layout with correct labels + active indicator (TASK 1)
3. Home screen (TASK 5) — this is what users see first every day
4. Onboarding: Splash → Birth Data → Preferences (TASKS 2–4)
5. Profile: Your Chart + Settings (TASKS 11–12)
6. Planner (TASKS 7–8)
7. Tarot (TASKS 9–10)
8. Horoscope detail (TASK 6)
9. Paywall (TASK 13)

Do not add AI-generated horoscope content yet — use hardcoded sample text matching the Figma exactly. That feature comes after the UI is locked.

---

## Figma reference

Full file: https://www.figma.com/design/SS0JEdwGJUluCuZ7BMwlnX/Moonsoon-%E2%80%93-UI-Design-System---Screens

| Page | Node IDs to inspect |
|---|---|
| Design System | `0:1` |
| Onboarding | `37:2` (Splash), `37:8` (Birth Data), `37:32` (Preferences) |
| Home | `31:2` (Home), `32:2` (Horoscope Detail) |
| Planner | `33:2` (Calendar), `33:112` (Goals) |
| Tarot | `35:2` (Pre-Reveal), `35:46` (Revealed) |
| Profile | `36:2` (Your Chart), `36:45` (Settings) |
| Paywall | `39:2` |