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
- [Database Schemas](#database-schemas)

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
npm ci
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

---

## Database Schemas

> These tables must be created in your Supabase project. Go to the **SQL Editor** in your Supabase dashboard, paste each `CREATE TABLE` statement, and run it. Then insert seed data and retrieve your connection keys from **Project Settings → API**.

The database consists of **10 tables** in the `public` schema:

| Table | Purpose |
|---|---|
| [`profiles`](#1-profiles) | User accounts (clients, vendors, admins) |
| [`services`](#2-services) | Services offered by vendors |
| [`vendor_services`](#3-vendor_services) | Vendor-specific service listings |
| [`contracts`](#4-contracts) | Service contracts between clients and vendors |
| [`issues`](#5-issues) | Issues raised by clients against a contract |
| [`service_requests`](#6-service_requests) | Service requests linked to contracts |
| [`activity_log`](#7-activity_log) | Audit log of actions on service requests |
| [`performance`](#8-performance) | Vendor performance metrics per request |
| [`invoices`](#9-invoices) | Billing invoices for contracts |
| [`vendor_ratings`](#10-vendor_ratings) | Aggregated rating and SLA stats per vendor |

---

### 1. `profiles`

Stores user profile data for all roles (client, vendor, admin). Linked 1-to-1 with Supabase Auth users.

| Column | Type | Default | Description |
|---|---|---|---|
| `id` | `uuid` | — | Primary key; references `auth.users(id)` |
| `full_name` | `text` | — | User's full name |
| `company_name` | `text` | — | Company the user belongs to |
| `email` | `text` | — | **Required.** User's email address |
| `avatar_url` | `text` | — | Profile picture URL |
| `role` | `user_role` | `'client'` | Enum: `client`, `vendor`, `admin` |
| `company_size` | `text` | `'medium'` | Size of the company |
| `company_type` | `company_type` | `'service'` | Enum: type of company |
| `rating` | `numeric` | `5.00` | Vendor rating score |
| `total_issues_handled` | `integer` | `0` | Total issues handled (vendors) |
| `sla_success_rate` | `numeric` | `100.00` | SLA compliance percentage |
| `is_flagged` | `boolean` | `false` | Whether the vendor is flagged |
| `created_at` | `timestamptz` | `now()` | Record creation time |
| `updated_at` | `timestamptz` | `now()` | Last update time |

<details>
<summary>SQL</summary>

```sql
CREATE TABLE public.profiles (
  id uuid NOT NULL,
  full_name text,
  company_name text,
  email text NOT NULL,
  avatar_url text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  role USER-DEFINED DEFAULT 'client'::user_role,
  company_size text DEFAULT 'medium'::text,
  company_type USER-DEFINED DEFAULT 'service'::company_type,
  rating numeric DEFAULT 5.00,
  total_issues_handled integer DEFAULT 0,
  sla_success_rate numeric DEFAULT 100.00,
  is_flagged boolean DEFAULT false,
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
```

</details>

---

### 2. `services`

Catalogue of services that vendors offer, with tiered pricing.

| Column | Type | Default | Description |
|---|---|---|---|
| `id` | `uuid` | `gen_random_uuid()` | Primary key |
| `vendor_id` | `uuid` | — | **Required.** References `profiles(id)` |
| `name` | `text` | — | **Required.** Service name |
| `description` | `text` | — | Service description |
| `category` | `text` | — | **Required.** Service category |
| `price` | `numeric` | — | Base price |
| `price_small` | `numeric` | `1000.00` | Price for small company tier |
| `price_medium` | `numeric` | `2500.00` | Price for medium company tier |
| `price_large` | `numeric` | `5000.00` | Price for large company tier |
| `is_active` | `boolean` | `true` | Whether the service is active |
| `created_at` | `timestamptz` | `now()` | Record creation time |
| `updated_at` | `timestamptz` | `now()` | Last update time |

<details>
<summary>SQL</summary>

```sql
CREATE TABLE public.services (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  vendor_id uuid NOT NULL,
  name text NOT NULL,
  description text,
  category text NOT NULL,
  price numeric,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  price_small numeric DEFAULT 1000.00,
  price_medium numeric DEFAULT 2500.00,
  price_large numeric DEFAULT 5000.00,
  CONSTRAINT services_pkey PRIMARY KEY (id),
  CONSTRAINT services_vendor_id_fkey FOREIGN KEY (vendor_id) REFERENCES public.profiles(id)
);
```

</details>

---

### 3. `vendor_services`

Vendor-specific service offerings with monthly pricing.

| Column | Type | Default | Description |
|---|---|---|---|
| `id` | `uuid` | `gen_random_uuid()` | Primary key |
| `vendor_id` | `uuid` | — | **Required.** References `profiles(id)` |
| `service_name` | `USER-DEFINED` | — | **Required.** Enum service name |
| `description` | `text` | — | Service description |
| `price_per_month` | `numeric` | — | Monthly price |
| `created_at` | `timestamptz` | `now()` | Record creation time |

<details>
<summary>SQL</summary>

```sql
CREATE TABLE public.vendor_services (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  vendor_id uuid NOT NULL,
  service_name USER-DEFINED NOT NULL,
  description text,
  price_per_month numeric,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT vendor_services_pkey PRIMARY KEY (id),
  CONSTRAINT vendor_services_vendor_id_fkey FOREIGN KEY (vendor_id) REFERENCES public.profiles(id)
);
```

</details>

---

### 4. `contracts`

Service contracts agreed between a client and a vendor for a specific service.

| Column | Type | Default | Description |
|---|---|---|---|
| `id` | `uuid` | `gen_random_uuid()` | Primary key |
| `client_id` | `uuid` | — | **Required.** References `profiles(id)` |
| `vendor_id` | `uuid` | — | **Required.** References `profiles(id)` |
| `service_id` | `uuid` | — | **Required.** References `services(id)` |
| `status` | `contract_status` | `'pending'` | Enum: `pending`, `active`, `expired`, etc. |
| `duration_months` | `integer` | — | **Required.** Contract duration in months |
| `cost` | `numeric` | — | **Required.** Total contract cost |
| `start_date` | `date` | — | Contract start date |
| `end_date` | `date` | — | Contract end date |
| `created_at` | `timestamptz` | `now()` | Record creation time |
| `updated_at` | `timestamptz` | `now()` | Last update time |

<details>
<summary>SQL</summary>

```sql
CREATE TABLE public.contracts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL,
  vendor_id uuid NOT NULL,
  service_id uuid NOT NULL,
  status USER-DEFINED DEFAULT 'pending'::contract_status,
  duration_months integer NOT NULL,
  cost numeric NOT NULL,
  start_date date,
  end_date date,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT contracts_pkey PRIMARY KEY (id),
  CONSTRAINT contracts_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.profiles(id),
  CONSTRAINT contracts_vendor_id_fkey FOREIGN KEY (vendor_id) REFERENCES public.profiles(id),
  CONSTRAINT contracts_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.services(id)
);
```

</details>

---

### 5. `issues`

Issues raised by clients under a contract, with AI-generated and actual SLA times.

| Column | Type | Default | Description |
|---|---|---|---|
| `id` | `uuid` | `gen_random_uuid()` | Primary key |
| `contract_id` | `uuid` | — | **Required.** References `contracts(id)` |
| `client_id` | `uuid` | — | **Required.** References `profiles(id)` |
| `vendor_id` | `uuid` | — | **Required.** References `profiles(id)` |
| `title` | `text` | — | **Required.** Issue title |
| `description` | `text` | — | **Required.** Issue description |
| `priority` | `issue_priority` | `'medium'` | Enum: `low`, `medium`, `high`, `critical` |
| `status` | `issue_status` | `'raised'` | Enum: `raised`, `accepted`, `in_progress`, `resolved`, `completed`, `reopened` |
| `service_type` | `text` | — | Type of service related to the issue |
| `ai_response_time_minutes` | `integer` | — | AI-recommended response time (minutes) |
| `ai_resolution_time_minutes` | `integer` | — | AI-recommended resolution time (minutes) |
| `actual_response_time_minutes` | `integer` | — | Actual time to first response (minutes) |
| `actual_resolution_time_minutes` | `integer` | — | Actual time to resolution (minutes) |
| `raised_at` | `timestamptz` | `now()` | When the issue was raised |
| `accepted_at` | `timestamptz` | — | When vendor accepted the issue |
| `started_at` | `timestamptz` | — | When work started |
| `resolved_at` | `timestamptz` | — | When issue was resolved |
| `completed_at` | `timestamptz` | — | When client confirmed completion |
| `reopened_at` | `timestamptz` | — | When issue was reopened |
| `vendor_notes` | `text` | — | Notes from the vendor |
| `client_feedback` | `text` | — | Feedback from the client |
| `sla_violated` | `boolean` | `false` | Whether SLA was breached |
| `risk_level` | `text` | `'low'` | Risk level: `low`, `medium`, `high` |
| `risk_analysis` | `text` | — | AI-generated risk analysis text |
| `created_at` | `timestamptz` | `now()` | Record creation time |
| `updated_at` | `timestamptz` | `now()` | Last update time |

<details>
<summary>SQL</summary>

```sql
CREATE TABLE public.issues (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  contract_id uuid NOT NULL,
  client_id uuid NOT NULL,
  vendor_id uuid NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  priority USER-DEFINED DEFAULT 'medium'::issue_priority,
  status USER-DEFINED DEFAULT 'raised'::issue_status,
  service_type text,
  ai_response_time_minutes integer,
  ai_resolution_time_minutes integer,
  actual_response_time_minutes integer,
  actual_resolution_time_minutes integer,
  raised_at timestamp with time zone DEFAULT now(),
  accepted_at timestamp with time zone,
  started_at timestamp with time zone,
  resolved_at timestamp with time zone,
  completed_at timestamp with time zone,
  reopened_at timestamp with time zone,
  vendor_notes text,
  client_feedback text,
  sla_violated boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  risk_level text DEFAULT 'low'::text,
  risk_analysis text,
  CONSTRAINT issues_pkey PRIMARY KEY (id),
  CONSTRAINT issues_contract_id_fkey FOREIGN KEY (contract_id) REFERENCES public.contracts(id),
  CONSTRAINT issues_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.profiles(id),
  CONSTRAINT issues_vendor_id_fkey FOREIGN KEY (vendor_id) REFERENCES public.profiles(id)
);
```

</details>

---

### 6. `service_requests`

Formal service requests raised by clients under a contract (similar to issues but used for request tracking).

| Column | Type | Default | Description |
|---|---|---|---|
| `id` | `uuid` | `gen_random_uuid()` | Primary key |
| `contract_id` | `uuid` | — | **Required.** References `contracts(id)` |
| `client_id` | `uuid` | — | **Required.** References `profiles(id)` |
| `vendor_id` | `uuid` | — | **Required.** References `profiles(id)` |
| `title` | `text` | — | **Required.** Request title |
| `issue_description` | `text` | — | **Required.** Detailed description |
| `service_type` | `USER-DEFINED` | — | **Required.** Enum service type |
| `ai_response_time` | `integer` | — | AI-recommended response time (minutes) |
| `ai_resolution_time` | `integer` | — | AI-recommended resolution time (minutes) |
| `raised_at` | `timestamptz` | `now()` | When the request was raised |
| `accepted_at` | `timestamptz` | — | When vendor accepted |
| `in_progress_at` | `timestamptz` | — | When work began |
| `resolved_at` | `timestamptz` | — | When resolved |
| `completed_at` | `timestamptz` | — | When client confirmed completion |
| `client_feedback` | `text` | — | Client's feedback |
| `vendor_notes` | `text` | — | Vendor's notes |
| `client_rating` | `numeric` | — | Client rating (1–5) |
| `created_at` | `timestamptz` | `now()` | Record creation time |
| `updated_at` | `timestamptz` | `now()` | Last update time |

<details>
<summary>SQL</summary>

```sql
CREATE TABLE public.service_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  contract_id uuid NOT NULL,
  client_id uuid NOT NULL,
  vendor_id uuid NOT NULL,
  issue_description text NOT NULL,
  service_type USER-DEFINED NOT NULL,
  ai_response_time integer,
  ai_resolution_time integer,
  raised_at timestamp with time zone DEFAULT now(),
  accepted_at timestamp with time zone,
  in_progress_at timestamp with time zone,
  resolved_at timestamp with time zone,
  completed_at timestamp with time zone,
  client_feedback text,
  vendor_notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  client_rating numeric CHECK (client_rating >= 1::numeric AND client_rating <= 5::numeric),
  title text NOT NULL,
  CONSTRAINT service_requests_pkey PRIMARY KEY (id),
  CONSTRAINT service_requests_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.profiles(id),
  CONSTRAINT service_requests_vendor_id_fkey FOREIGN KEY (vendor_id) REFERENCES public.profiles(id)
);
```

</details>

---

### 7. `activity_log`

Audit trail of all actions performed on service requests.

| Column | Type | Default | Description |
|---|---|---|---|
| `id` | `uuid` | `gen_random_uuid()` | Primary key |
| `request_id` | `uuid` | — | References `service_requests(id)` |
| `actor_id` | `uuid` | — | References `profiles(id)` — who performed the action |
| `action` | `text` | — | **Required.** Description of the action taken |
| `created_at` | `timestamptz` | `now()` | When the action occurred |

<details>
<summary>SQL</summary>

```sql
CREATE TABLE public.activity_log (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  request_id uuid,
  actor_id uuid,
  action text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT activity_log_pkey PRIMARY KEY (id),
  CONSTRAINT activity_log_request_id_fkey FOREIGN KEY (request_id) REFERENCES public.service_requests(id),
  CONSTRAINT activity_log_actor_id_fkey FOREIGN KEY (actor_id) REFERENCES public.profiles(id)
);
```

</details>

---

### 8. `performance`

Records vendor performance metrics for each service request, including SLA outcomes and penalties.

| Column | Type | Default | Description |
|---|---|---|---|
| `id` | `uuid` | `gen_random_uuid()` | Primary key |
| `request_id` | `uuid` | — | **Required.** References `service_requests(id)` |
| `vendor_id` | `uuid` | — | **Required.** References `profiles(id)` |
| `actual_response_time` | `integer` | — | Actual response time (minutes) |
| `actual_resolution_time` | `integer` | — | Actual resolution time (minutes) |
| `sla_response_met` | `boolean` | — | Whether response SLA was met |
| `sla_resolution_met` | `boolean` | — | Whether resolution SLA was met |
| `penalty_applied` | `boolean` | `false` | Whether a penalty was applied |
| `penalty_level` | `text` | — | Penalty severity level |
| `remarks` | `text` | — | Additional remarks |
| `created_at` | `timestamptz` | `now()` | Record creation time |

<details>
<summary>SQL</summary>

```sql
CREATE TABLE public.performance (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL,
  vendor_id uuid NOT NULL,
  actual_response_time integer,
  actual_resolution_time integer,
  sla_response_met boolean,
  sla_resolution_met boolean,
  penalty_applied boolean DEFAULT false,
  penalty_level text,
  remarks text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT performance_pkey PRIMARY KEY (id),
  CONSTRAINT performance_request_id_fkey FOREIGN KEY (request_id) REFERENCES public.service_requests(id),
  CONSTRAINT performance_vendor_id_fkey FOREIGN KEY (vendor_id) REFERENCES public.profiles(id)
);
```

</details>

---

### 9. `invoices`

Billing invoices generated for contracts, tracking payment status.

| Column | Type | Default | Description |
|---|---|---|---|
| `id` | `uuid` | `gen_random_uuid()` | Primary key |
| `contract_id` | `uuid` | — | **Required.** References `contracts(id)` |
| `client_id` | `uuid` | — | **Required.** References `profiles(id)` |
| `vendor_id` | `uuid` | — | **Required.** References `profiles(id)` |
| `amount` | `numeric` | — | **Required.** Invoice amount |
| `status` | `text` | `'pending'` | Payment status: `pending`, `paid`, `overdue` |
| `due_date` | `date` | — | Payment due date |
| `paid_at` | `timestamptz` | — | When the invoice was paid |
| `created_at` | `timestamptz` | `now()` | Record creation time |

<details>
<summary>SQL</summary>

```sql
CREATE TABLE public.invoices (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  contract_id uuid NOT NULL,
  client_id uuid NOT NULL,
  vendor_id uuid NOT NULL,
  amount numeric NOT NULL,
  status text DEFAULT 'pending'::text,
  due_date date,
  paid_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT invoices_pkey PRIMARY KEY (id),
  CONSTRAINT invoices_contract_id_fkey FOREIGN KEY (contract_id) REFERENCES public.contracts(id),
  CONSTRAINT invoices_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.profiles(id),
  CONSTRAINT invoices_vendor_id_fkey FOREIGN KEY (vendor_id) REFERENCES public.profiles(id)
);
```

</details>

---

### 10. `vendor_ratings`

Aggregated performance and rating summary for each vendor.

| Column | Type | Default | Description |
|---|---|---|---|
| `id` | `uuid` | `gen_random_uuid()` | Primary key |
| `vendor_id` | `uuid` | — | **Required.** References `profiles(id)` |
| `rating` | `numeric` | `5.00` | Overall rating score |
| `total_issues` | `integer` | `0` | Total issues assigned |
| `resolved_issues` | `integer` | `0` | Total issues resolved |
| `sla_success_rate` | `numeric` | `100.00` | SLA compliance percentage |
| `warnings` | `integer` | `0` | Number of warnings issued |
| `penalties` | `integer` | `0` | Number of penalties applied |
| `is_flagged` | `boolean` | `false` | Whether the vendor is flagged |
| `updated_at` | `timestamptz` | `now()` | Last update time |

<details>
<summary>SQL</summary>

```sql
CREATE TABLE public.vendor_ratings (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  vendor_id uuid NOT NULL,
  rating numeric DEFAULT 5.00,
  total_issues integer DEFAULT 0,
  resolved_issues integer DEFAULT 0,
  sla_success_rate numeric DEFAULT 100.00,
  warnings integer DEFAULT 0,
  penalties integer DEFAULT 0,
  is_flagged boolean DEFAULT false,
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT vendor_ratings_pkey PRIMARY KEY (id),
  CONSTRAINT vendor_ratings_vendor_id_fkey FOREIGN KEY (vendor_id) REFERENCES public.profiles(id)
);
```

</details>
