import { migrate } from "drizzle-orm/postgres-js/migrator";
import { db } from "./index";

/** Applies pending SQL migrations from ./drizzle at server startup. */
export async function runMigrations() {
  await migrate(db, { migrationsFolder: "./drizzle" });
}
