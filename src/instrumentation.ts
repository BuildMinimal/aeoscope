export async function register() {
  // Only run in the Node.js server runtime.
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  // Apply pending migrations before anything touches the database.
  const { runMigrations } = await import("./lib/db/migrate");
  await runMigrations().catch((err) => {
    console.error(
      "[aeoscope] could not reach the database to apply migrations.\n" +
        "  Start it with `docker compose up -d`, or point DATABASE_URL at your Postgres.\n" +
        `  DATABASE_URL: ${process.env.DATABASE_URL ?? "not set"}`,
    );
    throw err;
  });

  // Start the built-in cron scheduler unless it is disabled
  // (e.g. when an external cron hits /api/cron instead).
  if (process.env.AEOSCOPE_SCHEDULER === "off") return;
  const { scheduleAll } = await import("./lib/scheduler");
  await scheduleAll().catch((err) =>
    console.error("[scheduler] failed to load schedules:", err),
  );
}
