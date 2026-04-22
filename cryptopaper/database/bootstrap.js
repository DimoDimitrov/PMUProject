import { ensureDefaultAdminAccount } from "./repositories";
import { initializeDatabase } from "./sqlite";

export async function bootstrapDatabase() {
  await initializeDatabase();
  await ensureDefaultAdminAccount();
}
