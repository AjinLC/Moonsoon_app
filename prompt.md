# Moonsoon — Prompt Claude Code

Ce fichier décrit les modifications à implémenter dans l'ordre. Chaque tâche est autonome et testable séparément. Ne modifier que les fichiers indiqués. Ne jamais casser les comportements existants décrits dans `ETAT-DES-LIEUX.md`.

---

## Règles globales (à respecter sur toute la codebase)

- **Zéro coins arrondis** sauf les pill toggles 40×22 déjà en place
- **Pas d'emojis** dans l'UI
- **Grille 8px** — tous les spacings sont multiples de 4 ou 8
- **Padding horizontal 32px** (`px-8`) sur tous les écrans
- **Accent color** uniquement sur éléments actifs et CTA — jamais décoratif
- **Dividers 0.5px** en border color du thème
- **Fonts** : Pavot pour les headings, Inter (système) pour le body
- **Animations** 300–500ms, easing `ease-in-out`
- **TypeScript strict** — `npx tsc --noEmit` doit rester clean après chaque tâche

---

## TASK 1 — Système de seed déterministe

### Objectif

Chaque utilisateur reçoit un tirage tarot et un horoscope **stables pour la journée**. La seed change chaque jour et varie entre utilisateurs. Elle ne doit jamais changer lors d'une réouverture de l'app dans la même journée.

### Fichiers à créer

#### `moonsoon-app/utils/prng.ts`

Implémenter un générateur pseudo-aléatoire **Mulberry32** — reproductible, sans dépendance, 32 bits :

```ts
export function createPRNG(seed: number): { next: () => number } {
  let s = seed
  return {
    next() {
      s |= 0; s = s + 0x6D2B79F5 | 0
      let t = Math.imul(s ^ s >>> 15, 1 | s)
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t
      return ((t ^ t >>> 14) >>> 0) / 4294967296
    }
  }
}
```

#### `moonsoon-app/utils/seed.ts`

```ts
import AsyncStorage from '@react-native-async-storage/async-storage'

export type SeedSource = 'birth' | 'location' | 'random'

export interface SeedResult {
  seed: number
  source: SeedSource
}

export async function computeDailySeed(params: {
  userId: string
  today: string        // "YYYY-MM-DD"
  birthDate?: string   // "YYYY-MM-DD"
  birthTime?: string   // "HH:MM"
  birthPlace?: string
  lat?: number
  lng?: number
}): Promise<SeedResult>
```

Logique de priorité :

1. **Birth data complète** (`birthDate` + `birthTime` + `birthPlace` tous non-vides) → hash de `userId + today + birthDate + birthTime + birthPlace`, source = `'birth'`
2. **Localisation** (`lat` et `lng` non-null) → hash de `userId + today + lat.toFixed(2) + lng.toFixed(2)`, source = `'location'`
3. **Fallback random stable** → lire `AsyncStorage` clé `seed_fallback_{userId}_{today}`. Si absent, générer un `crypto.randomUUID()`, le stocker, puis hasher `userId + today + uuid`. Source = `'random'`

Hash à utiliser — **djb2**, zéro dépendance :
```ts
function djb2(str: string): number {
  let hash = 5381
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) ^ str.charCodeAt(i)
    hash = hash & hash
  }
  return Math.abs(hash)
}
```

#### `moonsoon-app/utils/tarot.ts`

Deck complet 78 cartes (22 Major + 56 Minor Arcana). Chaque carte :
```ts
interface TarotCard {
  id: string          // "major-00", "wands-01", etc.
  name: string
  arcana: 'major' | 'minor'
  suit?: 'wands' | 'cups' | 'swords' | 'pentacles'
  keywords: string[]  // 3 mots-clés positifs
  keywordsReversed: string[]  // 3 mots-clés renversés
  description: string  // 1 phrase, ton neutre
}
```

Fonction de tirage avec Fisher-Yates seedé :
```ts
export function drawCards(seed: number, n = 3, allowReversed = true): DrawnCard[]
```

`DrawnCard` étend `TarotCard` avec `{ reversed: boolean }`.

#### `moonsoon-app/utils/horoscope.ts`

Pools statiques :
- `MANTRAS_POOL` : 30 mantras courts (5–8 mots), ton introspectif, pas de spiritualité explicite
- `ASPECTS_POOL` : 20 aspects planétaires ("Moon trine Venus", "Mars square Saturn", etc.)

Fonction :
```ts
export function getDailyHoroscopeParams(seed: number, sunSign: string): {
  loveIntensity: number      // 0–100
  careerIntensity: number
  energyIntensity: number
  luckyNumber: number        // 1–99
  aspectIndex: number
  mantraIndex: number
}
```

Décaler le seed par signe pour éviter que tous les signes aient les mêmes valeurs le même jour :
```ts
const SIGN_OFFSETS: Record<string, number> = {
  aries: 1, taurus: 2, gemini: 3, cancer: 4,
  leo: 5, virgo: 6, libra: 7, scorpio: 8,
  sagittarius: 9, capricorn: 10, aquarius: 11, pisces: 12,
}
const rng = createPRNG(seed + (SIGN_OFFSETS[sunSign.toLowerCase()] ?? 0))
```

#### `moonsoon-app/context/SeedContext.tsx`

```ts
interface SeedContextType {
  seed: number | null
  seedSource: SeedSource | 'loading'
  refreshSeed: () => Promise<void>
}
```

Cycle de vie du provider :
1. Lire `today = new Date().toISOString().slice(0, 10)`
2. Récupérer birth data depuis `BirthDataContext`
3. Si birth data incomplète → tenter `expo-location` (`requestForegroundPermissionsAsync`). Si refus ou erreur → passer au fallback
4. Appeler `computeDailySeed` et stocker résultat
5. Écouter `AppState` : si l'app passe en foreground et que `today` a changé, recalculer

### Fichiers à modifier

**`moonsoon-app/app/_layout.tsx`**

Ajouter `SeedProvider` dans la hiérarchie, après `BirthDataProvider` :
```tsx
<AuthProvider>
  <BirthDataProvider>
    <ThemeProvider>
      <SeedProvider>
        <RootNavigator />
      </SeedProvider>
    </ThemeProvider>
  </BirthDataProvider>
</AuthProvider>
```

**`moonsoon-app/app/(tabs)/tarot.tsx`**

Remplacer le tirage hardcodé :
- Appeler `useSeed()` pour obtenir `seed`
- Si `seed` est null, afficher un `ActivityIndicator` à la place de la carte
- Appeler `drawCards(seed, 3)` pour les 3 cartes du tirage du jour
- Passer les cartes tirées à `[cardId]` via les search params d'Expo Router

**`moonsoon-app/app/tarot/[cardId].tsx`**

- Lire la carte depuis les params passés par le tirage seedé
- Conserver les 4 cartes hardcodées comme fallback si params absents

**`moonsoon-app/app/(tabs)/index.tsx`**

- Appeler `getDailyHoroscopeParams(seed, sunSign)` (sunSign depuis BirthDataContext, défaut `'aries'` si absent)
- Utiliser `loveIntensity`, `careerIntensity`, `energyIntensity` pour afficher une barre de progression ou une indication visuelle sous chaque catégorie horoscope (4px de hauteur, couleur accent, width = `${intensity}%`)
- Utiliser `MANTRAS_POOL[mantraIndex]` pour le mantra du jour

**`moonsoon-app/app/horoscope/[category].tsx`**

- Afficher `ASPECTS_POOL[aspectIndex]` dans la section "Astrological context"
- Afficher `luckyNumber` dans un champ "Lucky number"

**`moonsoon-app/app/(tabs)/profile.tsx` — section Settings**

Ajouter une ligne read-only dans la section Preferences :
```
Reading source     [birth chart / your location / randomised]
```
Valeur depuis `useSeed().seedSource`. Pas de chevron, pas d'action au tap.

### Dépendance à ajouter

```bash
pnpm add expo-location
```

Dans `app.json`, ajouter dans `plugins` :
```json
["expo-location", {
  "locationWhenInUsePermission": "Used to personalise your daily reading when birth data is unavailable."
}]
```

---

## TASK 2 — Dark mode avec détection automatique

### Objectif

Le thème suit le réglage système par défaut. L'utilisateur peut le forcer en `light` ou `dark` depuis Settings. Cette fonctionnalité est **accessible à tous les utilisateurs**, sans paywall.

### Logique de priorité

```
1. Préférence manuelle stockée dans profiles → appliquer
2. Pas de préférence → suivre le réglage système (défaut)
```

### Modifications

**`moonsoon-app/context/ThemeContext.tsx`**

- Ajouter `useColorScheme` de React Native pour détecter le thème système
- Ajouter un champ `themePreference: 'system' | 'light' | 'dark'` dans le state (persisté dans `profiles.theme_preference`, valeur initiale `'system'`)
- Exposer `effectiveMode: 'light' | 'dark'` calculé selon la priorité ci-dessus
- Exposer `setThemePreference(pref: 'system' | 'light' | 'dark')` — accessible sans condition à tout utilisateur connecté
- Écouter les changements du scheme système via `useColorScheme` — si `themePreference === 'system'`, mettre à jour `effectiveMode` en temps réel

**`moonsoon-app/supabase/migration.sql`**

Ajouter la colonne dans la table `profiles` :
```sql
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS theme_preference text
  CHECK (theme_preference IN ('system','light','dark'))
  DEFAULT 'system';
```

Fournir ce snippet comme **migration additive** séparée (ne pas écraser le fichier existant), dans `moonsoon-app/supabase/migration_002_theme.sql`.

**`moonsoon-app/app/(tabs)/profile.tsx` — section Settings**

Remplacer le toggle binaire "Theme" actuel par un **segmented control à 3 états** : `System / Light / Dark`.

Design du segmented control :
- Largeur totale, divisé en 3 segments égaux
- Hauteur 36px
- Border 0.5px en border color
- Segment actif : fond `surface` + border accent 0.5px en bas uniquement
- Segment inactif : fond transparent, texte `textSecondary`
- Transitions 200ms opacity sur le tap
- Tous les segments sont actifs pour tous les utilisateurs

**Tous les composants utilisant des couleurs**

Remplacer toute référence à `LightTheme` ou couleur hardcodée par `useTheme().colors`. Vérifier en particulier :
- `components/Container.tsx` — `bg-white` hardcodé → remplacer par couleur de fond du thème
- `app/(auth)/login.tsx`, `signup.tsx`, `forgot-password.tsx` — `bg-white` hardcodé
- Tous les écrans (tabs) — vérifier `bg-white` et `text-gray-*` hardcodés

> Ne pas modifier les fichiers auth si cela introduit des erreurs TypeScript. Annoter TODO si nécessaire.

---

## TASK 3 — Iconographie de fond

### Objectif

Ajouter une couche décorative subtile en arrière-plan sur les écrans principaux pour consolider l'identité visuelle de l'app (cosmique, mystique, minimaliste). Les icônes ne doivent jamais gêner la lecture du contenu.

### Composant : `moonsoon-app/components/BackgroundGlyphs.tsx`

```ts
interface BackgroundGlyphsProps {
  variant: 'home' | 'tarot' | 'horoscope' | 'planner' | 'profile'
  opacity?: number  // défaut : 0.04 en light, 0.07 en dark
}
```

Implémentation en SVG inline (pas de fichier image, pas de dépendance) via `react-native-svg` :

```bash
pnpm add react-native-svg
```

Chaque `variant` définit un set de 4–6 glyphes positionnés en absolu, rotatés et scalés de façon fixe (pas d'animation). Glyphes à utiliser selon le variant :

| Variant | Glyphes SVG |
|---|---|
| `home` | Croissant de lune, petite étoile 4 branches (×3 tailles différentes), cercle fin |
| `tarot` | Œil stylisé (triangle + cercle), étoile 6 branches, croix fine |
| `horoscope` | Saturne (cercle + anneau elliptique), étoile 8 branches, point cardinal |
| `planner` | Cercle concentrique (×2), losange fin, petit soleil (cercle + 8 traits) |
| `profile` | Constellation (5 points reliés par traits 0.5px), croissant, étoile filante |

Règles de positionnement :
- Jamais sur le contenu principal (zone safe area)
- Plutôt dans les coins et marges
- `position: absolute`, `pointerEvents: 'none'`
- `zIndex: 0`, contenu à `zIndex: 1`

Les glyphes utilisent `stroke` uniquement (pas de fill), `strokeWidth: 0.5`, couleur = accent color du thème courant.

### Intégration

Ajouter `<BackgroundGlyphs variant="home" />` dans :
- `app/(tabs)/index.tsx`
- `app/(tabs)/tarot.tsx`
- `app/horoscope/[category].tsx`
- `app/(tabs)/planner.tsx`
- `app/(tabs)/profile.tsx`

Le composant doit être le **premier enfant** du `View` racine de chaque écran, en `position: absolute` avec `w-full h-full`.

---

## TASK 4 — Animations de navigation

### Objectif

Transitions fluides entre les écrans. Utiliser **Reanimated 3** (déjà installé) et les options de transition d'Expo Router.

### 4a — Fade + slide horizontal pour la navigation principale

**`moonsoon-app/app/_layout.tsx`**

Configurer une animation custom sur le `Stack` racine :

```tsx
import { TransitionPresets } from '@react-navigation/stack'

// Dans le Stack principal :
<Stack
  screenOptions={{
    animation: 'fade_from_bottom', // baseline
    // Override par une animation custom :
    cardStyleInterpolator: ({ current, next, layouts }) => ({
      cardStyle: {
        opacity: current.progress,
        transform: [
          {
            translateX: current.progress.interpolate({
              inputRange: [0, 1],
              outputRange: [layouts.screen.width * 0.08, 0], // slide 8% de la largeur
            }),
          },
        ],
      },
      overlayStyle: {
        opacity: current.progress.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 0.15],
        }),
      },
    }),
  }}
>
```

> Direction : slide depuis la droite en push (`translateX` positif → 0), retour vers la droite en pop (0 → positif). Expo Router gère automatiquement le sens selon `push` ou `back`.

**`moonsoon-app/app/(tabs)/_layout.tsx`**

Pour la tab bar, ne pas animer le changement d'onglet (comportement natif standard, pas de slide entre tabs — seul le contenu de la page peut faire un fade).

**Durée** : 280ms, easing `Easing.out(Easing.cubic)`.

### 4b — Slide up pour le bouton Chat Tarot

Le bouton "Chat with your cards" (ou équivalent) dans `app/(tabs)/tarot.tsx` apparaît en **slide up** depuis le bas avec un fade après le flip de la carte.

Implémentation avec Reanimated :

```tsx
const chatButtonAnim = useSharedValue(0)

// Déclencher après le flip (après 400ms) :
const showChatButton = () => {
  chatButtonAnim.value = withDelay(
    420, // légèrement après la fin du flip
    withSpring(1, { damping: 18, stiffness: 120 })
  )
}

const chatButtonStyle = useAnimatedStyle(() => ({
  opacity: chatButtonAnim.value,
  transform: [{ translateY: interpolate(chatButtonAnim.value, [0, 1], [24, 0]) }],
}))
```

Le bouton est un `Animated.View` wrappant un `TouchableOpacity`. Il reste visible après apparition (pas de disparition). Si la carte n'est pas encore retournée, le bouton est `display: none` (pas seulement invisible — éviter l'espace fantôme).

---

## TASK 5 — AI Chatbot "Tarot Reading"

### Objectif

Un chat contextuel lié au tirage du jour. L'utilisateur peut poser des questions sur ses cartes et recevoir des interprétations. Le chat connaît les cartes tirées, leurs positions, et le contexte astrologique du jour.

### Provider API : Groq

Utiliser **Groq** avec le modèle `llama-3.3-70b-versatile` pour le meilleur rapport qualité/coût/vitesse.

- Vitesse : ~500 tokens/s (streaming quasi-instantané sur mobile)
- Coût : ~$0.59/M input + $0.79/M output
- Fallback si quota dépassé : `gemma2-9b-it` (même provider, même clé)

La clé API Groq passe par une **Supabase Edge Function** — jamais exposée côté client.

### Architecture

```
[React Native Chat Screen]
    │
    └── POST moonsoon-app/supabase/functions/tarot-chat/index.ts
              │
              ├── Vérifier JWT Supabase (Authorization header)
              ├── Construire system prompt avec les cartes seedées
              └── Stream Groq API → stream vers client
```

### Supabase Edge Function : `moonsoon-app/supabase/functions/tarot-chat/index.ts`

```ts
import { serve } from 'https://deno.land/std/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  // 1. Auth check
  const jwt = req.headers.get('Authorization')?.replace('Bearer ', '')
  // Valider le JWT avec Supabase Admin client

  // 2. Body
  const { messages, drawnCards, astroContext } = await req.json()
  // messages : historique de conversation { role, content }[]
  // drawnCards : DrawnCard[] depuis le tirage seedé
  // astroContext : { sunSign, aspect, mantra }

  // 3. System prompt
  const systemPrompt = buildSystemPrompt(drawnCards, astroContext)

  // 4. Groq API avec streaming
  const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('GROQ_API_KEY')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages,
      ],
      max_tokens: 400,
      stream: true,
      temperature: 0.75,
    }),
  })

  return new Response(groqRes.body, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Access-Control-Allow-Origin': '*',
    },
  })
})
```

**`buildSystemPrompt`** :
```
You are a knowledgeable and empathetic tarot reader.
Today's reading: [card 1 – past position], [card 2 – present position], [card 3 – future position].
Astrological context: [today's aspect]. User's sun sign: [sunSign].
Respond in [user language — French if lang=fr, English otherwise].
Be direct and concrete, 80–120 words per response.
Do not repeat the card names in every response. Adapt to the question asked.
```

Le champ `lang` est passé dans le body de la requête depuis le client (`i18next.language`).

### Internationalisation (i18n)

L'app détecte la langue système et adapte toutes les chaînes en conséquence. La langue par défaut (fallback) est **l'anglais**.

#### Langues supportées au lancement

| Code | Langue |
|---|---|
| `en` | English (fallback) |
| `fr` | Français |

Si la langue système n'est pas dans cette liste, l'app utilise `en`.

#### Dépendance

```bash
pnpm add expo-localization i18next react-i18next
```

#### Fichiers à créer

**`moonsoon-app/locales/en.json`** et **`moonsoon-app/locales/fr.json`**

Couvrir toutes les chaînes visibles dans l'app : labels de navigation, titres d'écrans, boutons, messages d'erreur, placeholders, messages du chat.

**`moonsoon-app/utils/i18n.ts`**

```ts
import * as Localization from 'expo-localization'
import i18next from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from '../locales/en.json'
import fr from '../locales/fr.json'

const deviceLang = Localization.getLocales()[0]?.languageCode ?? 'en'
const supportedLangs = ['en', 'fr']
const lng = supportedLangs.includes(deviceLang) ? deviceLang : 'en'

i18next.use(initReactI18next).init({
  resources: { en: { translation: en }, fr: { translation: fr } },
  lng,
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
})

export default i18next
```

Importer `utils/i18n.ts` en tête de `app/_layout.tsx` (avant tout render) pour initialiser i18next au démarrage.

Utiliser `useTranslation()` dans tous les composants :
```tsx
const { t } = useTranslation()
<Text>{t('tarot.chatButton')}</Text>
```

#### System prompt du chatbot — multilingue

Le system prompt envoyé à Groq doit inclure la langue de l'utilisateur :

```ts
const systemPrompt = buildSystemPrompt(drawnCards, astroContext, userLang)
// userLang = i18next.language  (passé dans le body de la requête Edge Function)
```

Dans le prompt :
```
Respond in ${userLang === 'fr' ? 'French' : 'English'}.
Be direct, concrete, 80–120 words per response.
```

**Variable d'environnement à ajouter dans Supabase** :
```
GROQ_API_KEY=gsk_...
```

### Écran chat : `moonsoon-app/app/tarot/chat.tsx`

Route accessible depuis le bouton "Chat with your cards" dans `tarot.tsx`.

**Layout** :
```
┌─────────────────────────────┐
│  ← Back    Chat Tarot        │  Header avec les 3 cartes en miniature (60×90)
├─────────────────────────────┤
│                             │
│   [bulles de messages]      │  ScrollView inversé (dernière bulle en bas)
│                             │
├─────────────────────────────┤
│  [TextInput]      [Envoyer] │  Safe area bottom
└─────────────────────────────┘
```

**Composants** :

- `MessageBubble` : fond `surface` pour l'assistant, fond `accent` (opacity 0.12) pour l'utilisateur. Coins à **0px**. Padding 12×16. Texte body.
- `TypingIndicator` : 3 points animés (fade séquentiel, boucle 800ms) pendant le streaming
- `CardMiniature` : dans le header, les 3 cartes du tirage, grayscale si renversée

**Streaming côté client** :
- Utiliser `fetch` avec lecture du `ReadableStream` body
- Parser les `data: {...}` du SSE
- Accumuler les delta `choices[0].delta.content` dans le state de la bulle en cours

**Contraintes UX** :
- **Maximum 30 messages par session** (voir calcul de rentabilité ci-dessous)
- Compteur visible en bas du header : `"12 / 30"`
- Si limite atteinte : afficher un bandeau `t('chat.limitReached')` ("Come back tomorrow for a new reading")
- Input disabled pendant la réponse du modèle
- Keyboard avoiding sur iOS et Android
- Pas de persistance en base pour cette task (historique en mémoire = perdu à la fermeture)

**Calcul de rentabilité — justification de la limite à 30**

```
Revenu par utilisateur premium : $7 / mois
Après commission App Store (30%) : $4.90 net
Infrastructure Supabase (free tier) : ~$0.30 / user
Budget disponible pour l'IA : ~$4.60 / user / mois

Coût Groq llama-3.3-70b par message (contexte croissant) :
  • Input moyen : ~800 tokens (system prompt + historique + message user)
  • Output moyen : ~200 tokens
  • Coût : (800 × $0.59 + 200 × $0.79) / 1 000 000 = $0.000630 / message

Session de 30 messages : 30 × $0.000630 = $0.019 / session

Scénario usage quotidien (30 sessions / mois) : $0.57 / mois  ✓ dans budget
Scénario usage intensif (3 sessions / jour) :   $1.71 / mois  ✓ dans budget
Marge restante (usage intensif) : $4.60 - $1.71 = $2.89 / user
```

La limite à 30 est donc confortable tout en restant généreuse pour l'UX (une lecture tarot typique = 10–15 échanges).

### Dépendances

```bash
pnpm add expo-localization i18next react-i18next
```

Aucune autre dépendance — le chat se fait en `fetch` natif + Supabase Edge Functions.

**Variable d'env client à ajouter dans `.env`** :
```
EXPO_PUBLIC_SUPABASE_FUNCTIONS_URL=https://<project-ref>.supabase.co/functions/v1
```

---

## Récapitulatif des fichiers touchés

### Nouveaux fichiers

| Fichier | Task |
|---|---|
| `utils/prng.ts` | 1 |
| `utils/seed.ts` | 1 |
| `utils/tarot.ts` | 1 |
| `utils/horoscope.ts` | 1 |
| `context/SeedContext.tsx` | 1 |
| `supabase/migration_002_theme.sql` | 2 |
| `utils/i18n.ts` | 2 |
| `locales/en.json` | 2 |
| `locales/fr.json` | 2 |
| `components/BackgroundGlyphs.tsx` | 3 |
| `app/tarot/chat.tsx` | 5 |
| `supabase/functions/tarot-chat/index.ts` | 5 |

### Fichiers modifiés

| Fichier | Tasks |
|---|---|
| `app/_layout.tsx` | 1, 4a |
| `context/ThemeContext.tsx` | 2 |
| `app/(tabs)/index.tsx` | 1, 3 |
| `app/(tabs)/tarot.tsx` | 1, 3, 4b |
| `app/(tabs)/planner.tsx` | 3 |
| `app/(tabs)/profile.tsx` | 1, 2, 3 |
| `app/horoscope/[category].tsx` | 1, 3 |
| `app/tarot/[cardId].tsx` | 1 |
| `components/Container.tsx` | 2 |
| `app.json` | 1 (expo-location) |
| `.env` | 5 |

---

## Ordre d'implémentation recommandé

```
TASK 1 (seed) → TASK 2 (dark mode + i18n) → TASK 3 (glyphs) → TASK 4 (animations) → TASK 5 (chat)
```

Les tasks 3, 4 et 5 sont indépendantes entre elles. Les tasks 1 et 2 doivent être faites en premier car d'autres tasks en dépendent (seed pour le tirage, ThemeContext pour les couleurs des glyphs et du chat, i18n pour toutes les chaînes de l'UI).

---

## Checklist de validation par task

### Task 1
- [ ] `npx tsc --noEmit` clean
- [ ] Ouvrir Tarot → noter les 3 cartes → forcer close → rouvrir → mêmes cartes
- [ ] Lendemain (ou changer manuellement `today` en dur) → cartes différentes
- [ ] Settings affiche "birth chart" si birth data complète
- [ ] Settings affiche "your location" si GPS accordé sans birth data
- [ ] Settings affiche "randomised" sinon
- [ ] Home affiche le mantra du MANTRAS_POOL (pas un lorem ipsum)

### Task 2
- [ ] Passer l'app en mode sombre système → l'app suit automatiquement
- [ ] Profile → Settings → segmented control `System / Light / Dark` affiché et fonctionnel pour tous
- [ ] Tap `Dark` → dark s'applique immédiatement
- [ ] Tap `System` → suit le réglage système en temps réel
- [ ] Préférence persistée dans `profiles.theme_preference`
- [ ] `bg-white` hardcodés remplacés sur tous les écrans principaux

### Task 3
- [ ] Glyphes visibles en fond sur chaque écran concerné
- [ ] Opacity très basse (ne gêne pas la lecture)
- [ ] `pointerEvents: 'none'` — les glyphes ne captent pas les taps
- [ ] Couleur suit l'accent color du thème

### Task 4
- [ ] Navigation push → slide depuis la droite + fade
- [ ] Navigation back → reverse
- [ ] Durée ~280ms, pas de jank
- [ ] Bouton chat tarot : invisible avant le flip, slide up + fade après le flip
- [ ] Bouton chat tarot ne laisse pas d'espace fantôme avant apparition

### Task 5
- [ ] Tap "Chat with your cards" → navigate vers `app/tarot/chat.tsx`
- [ ] Les 3 cartes du tirage apparaissent en miniature dans le header
- [ ] Envoyer un message → réponse streamée (texte qui s'écrit en temps réel)
- [ ] Indicateur de frappe visible pendant le stream
- [ ] Compteur messages visible (`X / 30`)
- [ ] À 30 messages → input disabled + bandeau
- [ ] Keyboard avoiding fonctionne (le champ ne se cache pas sous le clavier)
- [ ] App en français système → chat répond en français
- [ ] App en anglais système → chat répond en anglais
- [ ] App en langue non supportée → chat répond en anglais

### Task i18n
- [ ] Toutes les chaînes UI passent par `t()`
- [ ] Passer la langue système en `fr` → tous les labels en français
- [ ] Langue non supportée → fallback anglais propre (aucune clé manquante)