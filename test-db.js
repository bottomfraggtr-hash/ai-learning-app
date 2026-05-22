async function main() {
  let pool;
  let prisma;

  try {
    await import("dotenv/config");
    const [{ Pool }, { PrismaPg }, { PrismaClient }] = await Promise.all([
      import("pg"),
      import("@prisma/adapter-pg"),
      import("@prisma/client"),
    ]);

    pool = new Pool({ connectionString: process.env.DATABASE_URL });
    prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

    await prisma.$connect();
    const count = await prisma.user.count();
    console.log(`Connected to DB successfully! Users count: ${count}`);
  } catch (e) {
    console.error("DB Connection failed:", e);
    if (e && e.code === "EACCES" && process.env.DATABASE_URL?.includes(".supabase.co:5432")) {
      console.error("This Supabase direct URL is resolving to IPv6. Use the Supavisor session pooler URL if your network only supports IPv4.");
    }
  } finally {
    await prisma?.$disconnect();
    await pool?.end();
  }
}

main();
