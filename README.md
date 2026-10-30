# GadgetBdg.com

GadgetBdg.com is a SaaS platform designed for second-hand phone stores and gadget businesses. It allows each store to have its own storefront, manage catalog products, handle trade-in leads, configure subscriptions, and operate with a multi-tenant architecture supporting custom domains and branch-based sales flows.

This project is built with Next.js, TypeScript, Prisma, and PostgreSQL, and is designed to support both the public storefront and the internal admin dashboard.

## Overview

The platform is built around a multi-store business model where each merchant can:

- create and manage a branded online store
- publish products with stock and pricing information
- manage store branches and staff access
- accept trade-in and sell-only leads
- run a subscription-based SaaS plan
- use custom domains and subdomain routing for storefront deployment

The repository includes routing logic for store subdomains, admin routes, custom domains, and middleware-based tenant resolution.

## Key Features

- Multi-tenant SaaS architecture for gadget stores
- Store and branch management
- Product catalog with pricing, conditions, stock status, and media gallery
- Trade-in offer and lead tracking
- User roles and authorization flows
- Subscription plans and payment records
- Platform-level settings and admin management
- Subdomain and custom-domain storefront routing
- WhatsApp integration support for store communication
- Docker support for local and production deployment

## Tech Stack

- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Prisma ORM
- PostgreSQL
- Docker
- Node.js

## Project Structure

```bash
.
├── prisma/
│   ├── schema.prisma
│   ├── seed-production.js
│   └── ...
├── public/
├── scripts/
├── src/
│   ├── app/
│   ├── components/
│   ├── lib/
│   ├── types/
│   ├── middleware.ts
│   └── ...
├── .env.example
├── .env.production.example
├── docker-compose.yml
├── Dockerfile
├── next.config.js
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── tsconfig.json
└── README.md
```

## Core Domain Models

The data model is centered around store operations and merchant management, including:

- Store
- Branch
- Product
- User
- SubscriptionPlan
- SubscriptionPayment
- TradeInOffer
- TradeInLead
- StoreReview
- SalesCommission
- SalesPartner

This allows the platform to handle both business operations and storefront content in a unified way.

## Prerequisites

Before starting the project, make sure you have:

- Node.js 18 or newer
- PostgreSQL database
- npm or yarn
- Docker (optional, for containerized deployment)

## Environment Configuration

Copy the example environment file:

```bash
cp .env.example .env
```

Then configure the required values, especially:

```env
DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:5432/gadgetbdg?schema=public"
NEXT_PUBLIC_MAIN_DOMAIN="gadgetbdg.com"
NEXTAUTH_SECRET="your_secret_here"
```

A production example file is also included:

```bash
cp .env.production.example .env.production
```

## Installation

Install dependencies:

```bash
npm install
```

Generate the Prisma client:

```bash
npx prisma generate
```

Push the schema to the database:

```bash
npx prisma db push
```

If you want to seed demo or production data:

```bash
npm run db:seed
```

## Running the Application

Development mode:

```bash
npm run dev
```

The app runs on port 3001 by default according to the project scripts.

Production build:

```bash
npm run build
npm run start
```

## Useful Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run db:generate
npm run db:push
npm run db:migrate
npm run db:studio
npm run db:seed
npm run db:clean-reset
```

## Docker Setup

The repository includes Docker and docker-compose configuration for deployment and local orchestration.

```bash
docker-compose up --build
```

This project also mounts directories for uploads and backups, which are relevant for production image handling and file storage.

## Deployment Notes

This application is designed to support:

- root domain landing pages
- store-specific subdomains
- custom domain resolution
- admin and sales interfaces
- branch-based storefront routing

The middleware layer is responsible for detecting hostnames, mapping them to tenant stores, and redirecting or rewriting requests appropriately.

## Security and Authorization

The project uses middleware-level route protection for internal admin paths and supports distinct role-based access such as:

- SUPER_ADMIN
- ADMIN_SAAS
- SALES
- SALES_AGENT
- STORE_OWNER
- STORE_STAFF

## License

This project does not include a license file in the repository yet. Please check with the repository owner for licensing details before commercial use or redistribution.

## Contributing

Contributions are welcome. If you are improving the platform, please follow the existing project conventions and test database and app changes before deployment.

## Contact

For support or business-related questions, use the project support contact configured in the application environment settings.

---

Built for digital storefront management in the second-hand phone and gadget retail industry.
