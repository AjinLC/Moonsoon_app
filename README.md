# Moonsoon App — Quick Setup Guide

## Prerequisites

- **Node.js** ≥ 18
- **PNPM** — install globally if needed: `npm install -g pnpm`
- **Expo Go** app on your phone ([iOS](https://apps.apple.com/app/expo-go/id982107779) · [Android](https://play.google.com/store/apps/details?id=host.exp.exponent))

## 1. Clone & Install

```bash
git clone <your-repo-url>
cd moonsoon-app
pnpm install
```

## 2. Configure Environment Variables

Create a `.env` file at the project root (`moonsoon-app/.env`):

```env
EXPO_PUBLIC_SUPABASE_URL=https://<your-project-id>.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
```
> The anon key is safe for client-side use — it works with Row Level Security (RLS).

## 3. Start the Dev Server

```bash
pnpm start
```

This runs `npx expo start` and displays a **QR code** in your terminal add no-cache to clear the cache.



## 4. Run on Your Phone

1. Open the **Expo Go** app on your phone
2. Scan the QR code from your terminal (iOS: use the Camera app; Android: use Expo Go's scanner)
3. The app will bundle and load on your device

> Your phone and computer **must be on the same Wi-Fi network**.

## Available Scripts

| Command | Description |
|---|---|
| `pnpm start` | Start Expo dev server |
| `pnpm run ios` | Start on iOS simulator |
| `pnpm run android` | Start on Android emulator |
| `pnpm run web` | Start in browser |
| `pnpm run no-cache` | Start with cleared Metro cache |
| `pnpm run lint` | Run ESLint + Prettier check |
| `pnpm run format` | Auto-fix lint + formatting |

## Tech Stack

- **Expo SDK 54** + **Expo Router v6** (file-based routing)
- **React Native 0.81** + **TypeScript**
- **NativeWind** (Tailwind CSS for React Native)
- **Supabase** (auth + database)
- **expo-secure-store** (secure token storage on native)