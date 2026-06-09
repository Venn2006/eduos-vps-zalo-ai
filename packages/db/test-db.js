const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

async function main() {
  try {
    await prisma.$connect();
    console.log("Connected successfully using DATABASE_URL");
    const count = await prisma.user.count();
    console.log("Users count:", count);
  } catch (e) {
    console.error("Failed with DATABASE_URL:", e.message);
    try {
      console.log("\nTrying DIRECT_URL instead...");
      const prismaDirect = new PrismaClient({
        datasources: {
          db: {
            url: process.env.DIRECT_URL
          }
        }
      });
      await prismaDirect.$connect();
      console.log("Connected successfully using DIRECT_URL!");
    } catch (e2) {
      console.error("Failed with DIRECT_URL:", e2.message);
    }
  } finally {
    process.exit(0);
  }
}
main();
