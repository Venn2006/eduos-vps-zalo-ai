import { PrismaClient } from "@prisma/client";

export async function clearDatabase(prisma: PrismaClient) {
  // Use sequential deletion to avoid foreign key constraints issues
  const tablenames = await prisma.$queryRaw<
    Array<{ tablename: string }>
  >`SELECT tablename FROM pg_tables WHERE schemaname='public'`;

  const tables = tablenames
    .map(({ tablename }) => tablename)
    .filter((name) => name !== "_prisma_migrations")
    .map((name) => `"public"."${name}"`)
    .join(", ");

  try {
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${tables} CASCADE;`);
  } catch (error) {
    console.log({ error });
  }
}

export function generateDates(daysDiff: number) {
  const d = new Date();
  d.setDate(d.getDate() + daysDiff);
  return d;
}
