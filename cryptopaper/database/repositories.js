import { hashPassword, verifyPassword } from "./password";
import { getDatabase } from "./sqlite";

const DEFAULT_ADMIN_ACCOUNT = {
  role: "admin",
  fundsUsd: 100000,
  email: "dimo.admin@cryptopaper.local",
  username: "DimoAdmin",
  password: "Admin12345!",
  profilePicture: null,
};

export async function createUser({
  role = "customer",
  fundsUsd = 0,
  email,
  username,
  password,
  profilePicture = null,
}) {
  const db = await getDatabase();
  const passwordHash = await hashPassword(password);

  const result = await db.runAsync(
    `INSERT INTO users (role, funds_usd, email, username, password_hash, profile_picture)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [role, fundsUsd, email, username, passwordHash, profilePicture],
  );

  return getUserById(result.lastInsertRowId);
}

export async function getUserById(userId) {
  const db = await getDatabase();
  return db.getFirstAsync(
    `SELECT id, role, funds_usd, email, username, profile_picture, created_at, updated_at
     FROM users
     WHERE id = ?`,
    [userId],
  );
}

export async function getUserByEmail(email) {
  const db = await getDatabase();
  return db.getFirstAsync(
    `SELECT id, role, funds_usd, email, username, profile_picture, created_at, updated_at
     FROM users
     WHERE email = ?`,
    [email],
  );
}

export async function listUsers() {
  const db = await getDatabase();
  return db.getAllAsync(
    `SELECT id, role, funds_usd, email, username, profile_picture, created_at, updated_at
     FROM users
     ORDER BY created_at DESC`,
  );
}

export async function updateUser(userId, updates) {
  const fields = [];
  const params = [];

  if (updates.role !== undefined) {
    fields.push("role = ?");
    params.push(updates.role);
  }
  if (updates.fundsUsd !== undefined) {
    fields.push("funds_usd = ?");
    params.push(updates.fundsUsd);
  }
  if (updates.email !== undefined) {
    fields.push("email = ?");
    params.push(updates.email);
  }
  if (updates.username !== undefined) {
    fields.push("username = ?");
    params.push(updates.username);
  }
  if (updates.profilePicture !== undefined) {
    fields.push("profile_picture = ?");
    params.push(updates.profilePicture);
  }
  if (updates.password !== undefined) {
    fields.push("password_hash = ?");
    params.push(await hashPassword(updates.password));
  }

  if (!fields.length) {
    return getUserById(userId);
  }

  const db = await getDatabase();
  fields.push("updated_at = datetime('now')");
  params.push(userId);

  await db.runAsync(`UPDATE users SET ${fields.join(", ")} WHERE id = ?`, params);
  return getUserById(userId);
}

export async function changeUsername(userId, nextUsername) {
  const trimmedUsername = String(nextUsername ?? "").trim();
  if (!trimmedUsername) {
    throw new Error("Username cannot be empty.");
  }

  const db = await getDatabase();
  const existing = await db.getFirstAsync(
    "SELECT id FROM users WHERE lower(username) = lower(?) AND id != ?",
    [trimmedUsername, userId],
  );
  if (existing) {
    throw new Error("This username is already taken.");
  }

  await db.runAsync(
    `UPDATE users
     SET username = ?, updated_at = datetime('now')
     WHERE id = ?`,
    [trimmedUsername, userId],
  );
  return getUserById(userId);
}

export async function changePassword(userId, currentPassword, nextPassword) {
  const current = String(currentPassword ?? "").trim();
  const next = String(nextPassword ?? "").trim();

  if (!current || !next) {
    throw new Error("Current and new password are required.");
  }

  if (next.length < 8) {
    throw new Error("New password must be at least 8 characters.");
  }

  const db = await getDatabase();
  const userWithHash = await db.getFirstAsync(
    "SELECT id, password_hash FROM users WHERE id = ?",
    [userId],
  );
  if (!userWithHash) {
    throw new Error("User not found.");
  }

  const isValidCurrentPassword = await verifyPassword(current, userWithHash.password_hash);
  if (!isValidCurrentPassword) {
    throw new Error("Current password is incorrect.");
  }

  await db.runAsync(
    `UPDATE users
     SET password_hash = ?, updated_at = datetime('now')
     WHERE id = ?`,
    [await hashPassword(next), userId],
  );
}

export async function deleteUser(userId) {
  const db = await getDatabase();
  await db.runAsync("DELETE FROM users WHERE id = ?", [userId]);
}

export async function adminSetUserPassword(actorUserId, targetUserId, nextPassword) {
  const next = String(nextPassword ?? "").trim();
  if (!next) {
    throw new Error("New password is required.");
  }
  if (next.length < 8) {
    throw new Error("New password must be at least 8 characters.");
  }

  const db = await getDatabase();
  const actor = await db.getFirstAsync("SELECT id, role FROM users WHERE id = ?", [actorUserId]);
  if (!actor || actor.role !== "admin") {
    throw new Error("Only administrators can change user passwords.");
  }

  const target = await db.getFirstAsync("SELECT id FROM users WHERE id = ?", [targetUserId]);
  if (!target) {
    throw new Error("Target user not found.");
  }

  await db.runAsync(
    `UPDATE users
     SET password_hash = ?, updated_at = datetime('now')
     WHERE id = ?`,
    [await hashPassword(next), targetUserId],
  );
}

export async function adminDeleteUser(actorUserId, targetUserId) {
  const db = await getDatabase();
  const actor = await db.getFirstAsync("SELECT id, role FROM users WHERE id = ?", [actorUserId]);
  if (!actor || actor.role !== "admin") {
    throw new Error("Only administrators can delete users.");
  }

  const target = await db.getFirstAsync("SELECT id, role FROM users WHERE id = ?", [targetUserId]);
  if (!target) {
    throw new Error("Target user not found.");
  }
  if (target.role === "admin") {
    throw new Error("Administrator accounts cannot be deleted.");
  }

  await db.runAsync("DELETE FROM users WHERE id = ?", [targetUserId]);
}

export async function authenticateUser(email, plainPassword) {
  const db = await getDatabase();
  const userWithHash = await db.getFirstAsync(
    `SELECT id, role, funds_usd, email, username, profile_picture, password_hash
     FROM users
     WHERE email = ?`,
    [email],
  );

  if (!userWithHash) {
    return null;
  }

  const isValid = await verifyPassword(plainPassword, userWithHash.password_hash);
  if (!isValid) {
    return null;
  }

  return {
    id: userWithHash.id,
    role: userWithHash.role,
    funds_usd: userWithHash.funds_usd,
    email: userWithHash.email,
    username: userWithHash.username,
    profile_picture: userWithHash.profile_picture,
  };
}

export async function createPortfolioEntry({ userId, cryptoTitle, price, quantity }) {
  const db = await getDatabase();
  const result = await db.runAsync(
    `INSERT INTO portfolios (user_id, crypto_title, price, quantity)
     VALUES (?, ?, ?, ?)`,
    [userId, cryptoTitle, price, quantity],
  );

  return getPortfolioEntryById(result.lastInsertRowId);
}

export async function getPortfolioEntryById(portfolioId) {
  const db = await getDatabase();
  return db.getFirstAsync(
    `SELECT id, user_id, crypto_title, price, quantity, created_at, updated_at
     FROM portfolios
     WHERE id = ?`,
    [portfolioId],
  );
}

export async function listPortfolioByUserId(userId) {
  const db = await getDatabase();
  return db.getAllAsync(
    `SELECT id, user_id, crypto_title, price, quantity, created_at, updated_at
     FROM portfolios
     WHERE user_id = ?
     ORDER BY created_at DESC`,
    [userId],
  );
}

export async function listAllPortfolioEntries() {
  const db = await getDatabase();
  return db.getAllAsync(
    `SELECT
       p.id,
       p.user_id,
       p.crypto_title,
       p.price,
       p.quantity,
       p.created_at,
       p.updated_at,
       u.username,
       u.email
     FROM portfolios p
     JOIN users u ON u.id = p.user_id
     ORDER BY p.created_at DESC`,
  );
}

export async function updatePortfolioEntry(portfolioId, updates) {
  const fields = [];
  const params = [];

  if (updates.cryptoTitle !== undefined) {
    fields.push("crypto_title = ?");
    params.push(updates.cryptoTitle);
  }
  if (updates.price !== undefined) {
    fields.push("price = ?");
    params.push(updates.price);
  }
  if (updates.quantity !== undefined) {
    fields.push("quantity = ?");
    params.push(updates.quantity);
  }

  if (!fields.length) {
    return getPortfolioEntryById(portfolioId);
  }

  fields.push("updated_at = datetime('now')");
  params.push(portfolioId);

  const db = await getDatabase();
  await db.runAsync(
    `UPDATE portfolios
     SET ${fields.join(", ")}
     WHERE id = ?`,
    params,
  );

  return getPortfolioEntryById(portfolioId);
}

export async function deletePortfolioEntry(portfolioId) {
  const db = await getDatabase();
  await db.runAsync("DELETE FROM portfolios WHERE id = ?", [portfolioId]);
}

export async function ensureDefaultAdminAccount() {
  const existing = await getUserByEmail(DEFAULT_ADMIN_ACCOUNT.email);

  if (!existing) {
    await createUser(DEFAULT_ADMIN_ACCOUNT);
    return;
  }

  if (existing.role !== "admin") {
    await updateUser(existing.id, { role: "admin" });
  }
}
