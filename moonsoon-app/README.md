# Moonsoon 🌙

> **The Spiritual Alignment Engine.**
> Bridging the gap between metaphysical introspection (Astrology, Tarot) and concrete life aspirations.

![Status](https://img.shields.io/badge/Status-In%20Development-yellow)
![Stack](https://img.shields.io/badge/Stack-Turborepo%20%7C%20NestJS%20%7C%20Expo%20%7C%20Postgres-blue)

## 📖 The Vision

Moonsoon is not just a tarot app. It is a **psychological scaffolding tool** that uses spiritual archetypes to help users navigate their daily lives and achieve their highest aspirations.

**Core Objectives:**
1.  **Contextualize the Mystical:** AI synthesizes static spiritual data (Astrology/Tarot) with dynamic user contexts (Current goals/Mood).
2.  **Operationalize Intuition:** Transforms abstract symbols into actionable micro-tasks.
3.  **The "Ritual of Focus":** A daily alignment check where users review their aspirations through the lens of a spiritual draw.

---

## 🏗 Architecture & Stack

This project is a **Monorepo** managed by [Turborepo](https://turbo.build/).

### The Tech Stack
* **Mobile App:** React Native (via **Expo**), NativeWind (Tailwind), Reanimated.
* **Backend API:** Node.js (**NestJS**), TypeScript.
* **Database:** **PostgreSQL** (Data), **Redis** (Cache/Rate Limiting).
* **ORM:** **Prisma** (Single source of truth for schema).
* **Infrastructure:** Docker Compose (Local development).

### Repository Structure
```text
.
├── apps/
│   ├── api/            # NestJS Backend (Business Logic, AI Integration)
│   └── mobile/         # Expo React Native App (iOS/Android)
├── packages/
│   ├── database/       # Shared Prisma Schema & Client
│   ├── dto/            # Shared Zod Schemas & TypeScript Types
│   ├── config/         # Shared ESLint/TSConfig configurations
│   └── ui/             # (Optional) Shared UI components
└── docker-compose.yml  # Local infrastructure (Postgres + Redis)