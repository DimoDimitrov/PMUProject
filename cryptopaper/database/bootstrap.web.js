import { ensureDefaultAdminAccount } from "./repositories";

export async function bootstrapDatabase() {
  await ensureDefaultAdminAccount();
}
