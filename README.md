# ServiceSphere

> **AI-Powered SLA & Vendor Performance Management Platform**

ServiceSphere is a full-stack web application that streamlines Service Level Agreement (SLA) management between clients and vendors. It leverages Google Gemini AI to automatically generate optimal SLA parameters whenever an issue is raised, and provides real-time dashboards for tracking vendor performance, contracts, and issue resolution.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Environment Variables](#environment-variables)
- [Getting Started](#getting-started)
  - [Clone the Repository](#clone-the-repository)
  - [Install Dependencies](#install-dependencies)
  - [Run the Development Server](#run-the-development-server)
- [Available Scripts](#available-scripts)
- [Roles & Portals](#roles--portals)

---

## Features

- 🤖 **AI-Based SLA Generation** – Automatically generates optimal SLA parameters (response time, resolution time, penalties) for every issue using Google Gemini AI.
- 📡 **Real-Time Issue Tracking** – Instant synchronisation of issue status between clients and vendors.
- 📊 **Vendor Performance Analytics** – Dashboards showing response times, resolution rates, and SLA compliance metrics.
- ⭐ **Automated Rating System** – Vendor ratings calculated automatically based on issue handling, SLA compliance, and client feedback.
- 🔒 **Role-Based Access Control** – Separate portals for Clients, Vendors, and Admins.
- 📋 **Contract Management** – Create, manage, and track service contracts between clients and vendors.
- 💳 **Payments & Billing** – Integrated billing and penalty management for SLA breaches.
- 🔔 **Notifications** – In-app notifications for issue updates, contract changes, and SLA alerts.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 16](https://nextjs.org/) (App Router) |
| Language | TypeScript 5.7 |
| Styling | Tailwind CSS v4, Radix UI, shadcn/ui |
| Animations | Framer Motion |
| Backend / Auth | [Supabase](https://supabase.com/) (PostgreSQL + Auth + Realtime) |
| AI | [Google Gemini AI](https://ai.google.dev/) (`@google/generative-ai`) |
| Forms | React Hook Form + Zod |
| Charts | Recharts |
| Analytics | Vercel Analytics |
| Package Manager | pnpm / npm |

---

## Project Structure

```
service_sphere/
├── app/
│   ├── admin/          # Admin console
│   ├── api/            # API routes (contracts, issues, ratings, SLA, services, cron)
│   ├── auth/           # Auth pages (login, sign-up, callback, error)
│   ├── client/         # Client portal (dashboard, contracts, issues, services, notifications)
│   └── vendor/         # Vendor portal (dashboard, contracts, issues, billing, payments, penalties, performance)
├── components/         # Shared UI components (shadcn/ui + custom)
├── hooks/              # Custom React hooks
├── lib/                # Utility functions and Supabase clients
├── public/             # Static assets
├── scripts/            # Utility scripts
├── styles/             # Global styles
├── middleware.ts        # Next.js middleware (auth guards)
├── next.config.mjs
├── package.json
└── tsconfig.json
```

---

## Prerequisites

- **Node.js** v18 or higher
- **npm** v9+ or **pnpm** v9+
- A [Supabase](https://supabase.com/) project (free tier works)
- A [Google AI Studio](https://aistudio.google.com/) API key for Gemini

---

## Environment Variables

Create a `.env` file in the project root with the following variables:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Google Gemini AI
GOOGLE_GEMINI_API_KEY=your_google_gemini_api_key
```

---

## Getting Started

### Clone the Repository

```bash
git clone https://github.com/Hasini31/service_sphere.git
cd service_sphere
```

### Install Dependencies

Using **npm**:
```bash
npm install
```

Or using **pnpm**:
```bash
pnpm install
```

### Run the Development Server

```bash
npm run dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Build the application for production |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint |

---

## Roles & Portals

| Role | Portal URL | Description |
|---|---|---|
| **Client** | `/client/dashboard` | Manage contracts, raise issues, view vendor performance |
| **Vendor** | `/vendor/dashboard` | Handle issues, manage services, view billing & penalties |
| **Admin** | `/admin/console` | Platform-wide oversight and management |