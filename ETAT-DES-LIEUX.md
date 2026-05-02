# État des lieux — Moonsoon App

Snapshot du projet à date. Récapitule le travail effectué à partir de `prompt.md`, ce qui fonctionne, ce qui reste en stub, et les étapes de setup encore nécessaires.

---

## 1. Travail effectué

### Fondations (transversal)

| Fichier | Rôle |
|---|---|
| `moonsoon-app/constants/theme.ts` | Tokens de couleurs : `LightTheme`, `DarkTheme`, `Accents` (Indigo / Sage / Dusty Rose / Amber), helper `getPalette` |
| `moonsoon-app/constants/fonts.ts` | Mapping Pavot → familles (`display`, `heading`, `headingSemi`, `body`, `bodyItalic`). SemiBold retombe sur Bold (pas de fichier dédié dans `assets/fonts/`) |
| `moonsoon-app/context/ThemeContext.tsx` | `mode` (light/dark) + `accent`, persistés dans la table `profiles`. Hydrate à la connexion |
| `moonsoon-app/context/BirthDataContext.tsx` | Champs de naissance + `onboarding_complete`, persistés dans `profiles`. Expose `save(patch)` et `refresh()` |
| `moonsoon-app/app/_layout.tsx` | Charge les fonts Pavot (`useFonts`), wrap `Auth → BirthData → Theme`. Redirection à 3 niveaux : auth → onboarding → tabs selon `session` et `onboarding_complete`. Stack avec `paywall` et `modal` en `presentation: 'modal'` |
| `moonsoon-app/supabase/migration.sql` | Table `profiles` + RLS + trigger `handle_new_user` qui crée la ligne profil au signup |

### Écrans (mapping prompt → fichier)

| Tâche | Écran | Fichier | État |
|---|---|---|---|
| TASK 1 | Tab bar | `app/(tabs)/_layout.tsx` | OK — 4 onglets, indicateur 2×40 accent en haut, surface, border 0.5px, icônes Feather 20px |
| TASK 2 | Onboarding Splash | `app/(onboarding)/splash.tsx` | OK — fond noir, croix fine 0.5px (V 120, H 100), auto-advance 2s ou tap |
| TASK 3 | Onboarding Birth Data | `app/(onboarding)/birth-data.tsx` | OK — date/time pickers natifs, champ ville texte simple |
| TASK 4 | Onboarding Preferences | `app/(onboarding)/preferences.tsx` | OK — grille 2 colonnes 6 focus, 2 toggles notifications (40×22 pill, le seul élément arrondi) |
| TASK 5 | Home | `app/(tabs)/index.tsx` | OK — 4 sections : header, mantra, tâches (checkboxes), 4 catégories horoscope |
| TASK 6 | Horoscope Detail | `app/horoscope/[category].tsx` | OK — readings hardcodés pour love/friends/family/career, aspects + mantra liée |
| TASK 7 | Planner — Calendar | `app/(tabs)/planner.tsx` (sous-onglet) | OK — week strip, grille horaire 08:00–18:00, blocs events avec barre accent gauche 3px, section "No set time" |
| TASK 8 | Planner — Goals | même fichier | OK — sous-onglets This week / month / year, progress bar 4px |
| TASK 9 | Tarot — Pre-reveal | `app/(tabs)/tarot.tsx` | OK — carte 200×320 face cachée, flip Reanimated rotateY 0→180 en 400ms, liste "Recent readings" |
| TASK 10 | Tarot — Revealed | `app/tarot/[cardId].tsx` | OK — 4 cartes hardcodées (The Moon, Star, Empress, Tower), sections Your reading / Astrological context / About this card |
| TASK 11 | Profile — Your Chart | `app/(tabs)/profile.tsx` (sous-onglet) | OK — birth details, Big Three (Sun/Moon/Rising), Houses & Placements |
| TASK 12 | Profile — Settings | même fichier | OK — Account (Name/Email/DOB/TOB/Place), Preferences (theme toggle fonctionnel), Subscription → paywall, Sign out, Delete account |
| TASK 13 | Paywall | `app/paywall.tsx` | OK — `BlurView` sur teaser, 4 features, tiles Monthly/Yearly (Yearly sélectionné par défaut), CTA |

### Dépendances ajoutées

- `expo-font` — chargement OTF Pavot
- `expo-blur` — `BlurView` du paywall
- `@react-native-community/datetimepicker` — pickers natifs date/heure de l'onboarding

---

## 2. Conformité aux règles design

| Règle prompt | Appliqué |
|---|---|
| Tous les coins à 0px | OK — seule exception : pill toggles (40×22, radius 11) |
| Dividers 0.5px en border color | OK partout |
| Grille 8px | OK — multiples de 4/8 utilisés |
| Pas d'emojis | OK |
| Padding horizontal 32px (`px-8`) | OK |
| Accent uniquement sur actif/CTA | OK — jamais en texte ni en fond décoratif |
| Pavot pour headings, Inter pour body | OK |
| Animations 300–500ms | OK — flip tarot 400ms |

---

## 3. Ce qui fonctionne de bout en bout

- Auth complète (login / signup / forgot password) — déjà présente avant
- Redirection automatique session → onboarding si `onboarding_complete = false`
- Sauvegarde de la date/heure/ville de naissance au passage de Birth Data
- Sauvegarde des focus areas + toggles notifs au passage de Preferences
- `onboarding_complete = true` posé en base à la sortie de Preferences
- Bascule light/dark depuis Settings (persistée en base)
- Modal paywall accessible depuis la ligne "Subscription"
- Sign out depuis Settings
- Navigation Home → Horoscope detail par catégorie
- Animation flip tarot puis navigation vers `[cardId]`

---

## 4. Stubs / non câblés

| Endroit | Manque |
|---|---|
| Settings → "Edit" | Pas de route — chaque champ ouvrirait une modale d'édition |
| Settings → Accent color / Daily notifications / Mantra reminders / Horoscope detail level | `>` non câblé |
| Settings → Delete account | Bouton sans handler |
| Planner → "+ Add task" et "+ Add a new goal" | Pas de modale de création |
| Planner → flèches mois ‹ › | Pas de navigation entre semaines |
| Birth Data → Place of birth | TextInput simple, autocomplete Google Places non câblé |
| Tarot → Recent readings | Liste hardcodée, draws non persistés |
| Horoscope / Tarot / Big Three | Contenu hardcodé. Le prompt précise : *"Do not add AI-generated horoscope content yet"* |
| Modal `app/modal.tsx` | Placeholder par défaut d'Expo Router, conservé tel quel |

---

## 5. Setup encore à faire

1. **Migration Supabase** — exécuter `moonsoon-app/supabase/migration.sql` dans le SQL Editor du projet Supabase. Sans cela :
   - le signup réussit mais aucune ligne `profiles` n'est créée
   - `BirthDataContext` lit `null` partout et l'utilisateur reste bloqué en onboarding à chaque cold start
2. **Variables d'env** — `moonsoon-app/.env` doit contenir :
   ```
   EXPO_PUBLIC_SUPABASE_URL=...
   EXPO_PUBLIC_SUPABASE_ANON_KEY=...
   ```
3. **Polices** — déjà en place (`assets/fonts/Pavot-*.otf`). Pas de SemiBold dédié, on retombe sur Bold (cohérent avec le rendu Figma sans installer de package Google Fonts).

---

## 6. État du tooling

- `npx tsc --noEmit` : clean (0 erreur)
- `pnpm lint` : 3 erreurs **pré-existantes** dans `(auth)/{login,signup,forgot-password}.tsx` (apostrophes non échappées) — présentes avant ce travail. 8 warnings dont la moitié pré-existante.
- Pas de tests configurés dans le projet.

---

## 7. Comment tester localement

```bash
cd moonsoon-app
pnpm start          # Expo Go via QR code
# ou
pnpm web            # navigateur (les date pickers ne s'affichent pas, le flip est dégradé)
pnpm ios            # simulateur iOS
pnpm android        # émulateur Android
pnpm no-cache       # si NativeWind / fonts ne s'appliquent pas après changement
```

Parcours de validation complet :
1. Signup d'un nouveau compte → splash onboarding
2. Birth Data → date + heure + ville → "Calculate my chart"
3. Preferences → focus + toggles → "Get started" → tabs
4. Home → cocher une tâche, taper sur une catégorie → horoscope detail → back
5. Tarot → tap carte → flip → revealed → back
6. Planner → switch Calendar / Goals, switch scope dans Goals
7. Profile → Settings → tap "Theme" (light↔dark) → "Subscription" → paywall modal → close
8. Sign out → retour login

---

## 8. Prochaines étapes suggérées (ordre de valeur)

1. Brancher l'édition des champs Settings (Account + Preferences)
2. Persister les tarot draws dans Supabase et alimenter "Recent readings"
3. Modale de création de tâche / goal dans Planner
4. Navigation entre semaines dans le calendrier
5. Autocomplete Google Places sur le champ ville
6. Génération AI des horoscopes (différée explicitement par le prompt)
