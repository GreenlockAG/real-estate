import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";

export function getRiskDatabase() {
  const sql = neon(process.env.DATABASE_URL!);
  return drizzle(sql);
}
