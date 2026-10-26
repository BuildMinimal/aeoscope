export async function register() {
  // Only run in the Node.js server runtime, and allow opting out with
  // AEOSCOPE_SCHEDULER=off (e.g. when an external cron hits /api/cron instead).
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  if (process.env.AEOSCOPE_SCHEDULER === "off") return;
  const { scheduleAll } = await import("./lib/scheduler");
  await scheduleAll().catch((err) =>
    console.error("[scheduler] failed to load schedules:", err),
  );
}
