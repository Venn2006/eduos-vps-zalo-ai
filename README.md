# EduOS VPS Zalo AI

## Setup

1. Copy `.env.example` to `.env` and fill the variables.
2. Run `npm install` to install monorepo dependencies.
3. Start the database and Redis:
   ```bash
   docker-compose up -d
   ```
4. Generate Prisma client and seed DB:
   ```bash
   npm run db:generate
   npm run db:migrate
   npm run db:seed
   ```
5. Start development servers:
   ```bash
   npm run web:dev
   npm run api:dev
   npm run worker:dev
   npm run zalo-connector:dev
   ```

## Structure
- `apps/web`: Next.js frontend
- `apps/api`: Fastify API backend
- `apps/worker`: BullMQ workers
- `apps/zalo-vps-connector`: Mock Zalo connector
- `packages/*`: Shared logic, models, and interfaces
