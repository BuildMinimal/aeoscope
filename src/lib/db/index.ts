import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// postgres() is lazy: it never connects until the first query, so importing
// this module is safe at build time even without a reachable database.
const connectionString =
  process.env.DATABASE_URL ?? "postgresql://localhost:5432/aeoscope";

const client = postgres(connectionString, { prepare: false });

export const db = drizzle(client, { schema });
export { schema };
