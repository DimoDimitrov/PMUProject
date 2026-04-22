import { hashPassword, verifyPassword } from "./password";

const USERS_STORAGE_KEY = "cryptopaper_users";
const PORTFOLIOS_STORAGE_KEY = "cryptopaper_portfolios";
const DEFAULT_ADMIN_ACCOUNT = {
  role: "admin",
  fundsUsd: 100000,
  email: "dimo.admin@cryptopaper.local",
  username: "DimoAdmin",
  password: "Admin12345!",
  profilePicture: null,
};

function readJsonArray(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeJsonArray(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function nextId(items) {
  if (!items.length) {
    return 1;
  }

  return Math.max(...items.map((item) => item.id ?? 0)) + 1;
}

function nowIso() {
  return new Date().toISOString();
}

export async function createUser({
  role = "customer",
  fundsUsd = 0,
  email,
  username,
  password,
  profilePicture = null,
}) {
  const users = readJsonArray(USERS_STORAGE_KEY);
  const alreadyExists = users.some(
    (user) => user.email === email || user.username === username,
  );

  if (alreadyExists) {
    throw new Error("User with this email or username already exists.");
  }

  const passwordHash = await hashPassword(password);
  const createdAt = nowIso();

  const newUser = {
    id: nextId(users),
    role,
    funds_usd: fundsUsd,
    email,
    username,
    password_hash: passwordHash,
    profile_picture: profilePicture,
    created_at: createdAt,
    updated_at: createdAt,
  };

  users.push(newUser);
  writeJsonArray(USERS_STORAGE_KEY, users);

  return getUserById(newUser.id);
}

export async function getUserById(userId) {
  const users = readJsonArray(USERS_STORAGE_KEY);
  const user = users.find((item) => item.id === userId);
  if (!user) {
    return null;
  }

  const { password_hash: _passwordHash, ...safeUser } = user;
  return safeUser;
}

export async function getUserByEmail(email) {
  const users = readJsonArray(USERS_STORAGE_KEY);
  const user = users.find((item) => item.email === email);
  if (!user) {
    return null;
  }

  const { password_hash: _passwordHash, ...safeUser } = user;
  return safeUser;
}

export async function listUsers() {
  const users = readJsonArray(USERS_STORAGE_KEY);
  return users
    .slice()
    .sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)))
    .map(({ password_hash: _passwordHash, ...safeUser }) => safeUser);
}

export async function updateUser(userId, updates) {
  const users = readJsonArray(USERS_STORAGE_KEY);
  const userIndex = users.findIndex((item) => item.id === userId);
  if (userIndex < 0) {
    return null;
  }

  const nextUser = { ...users[userIndex] };
  if (updates.role !== undefined) nextUser.role = updates.role;
  if (updates.fundsUsd !== undefined) nextUser.funds_usd = updates.fundsUsd;
  if (updates.email !== undefined) nextUser.email = updates.email;
  if (updates.username !== undefined) nextUser.username = updates.username;
  if (updates.profilePicture !== undefined)
    nextUser.profile_picture = updates.profilePicture;
  if (updates.password !== undefined)
    nextUser.password_hash = await hashPassword(updates.password);
  nextUser.updated_at = nowIso();

  users[userIndex] = nextUser;
  writeJsonArray(USERS_STORAGE_KEY, users);
  return getUserById(userId);
}

export async function changeUsername(userId, nextUsername) {
  const trimmedUsername = String(nextUsername ?? "").trim();
  if (!trimmedUsername) {
    throw new Error("Username cannot be empty.");
  }

  const users = readJsonArray(USERS_STORAGE_KEY);
  const userIndex = users.findIndex((item) => item.id === userId);
  if (userIndex < 0) {
    throw new Error("User not found.");
  }

  const alreadyExists = users.some(
    (item) =>
      item.id !== userId &&
      String(item.username ?? "").toLowerCase() === trimmedUsername.toLowerCase(),
  );
  if (alreadyExists) {
    throw new Error("This username is already taken.");
  }

  users[userIndex] = {
    ...users[userIndex],
    username: trimmedUsername,
    updated_at: nowIso(),
  };
  writeJsonArray(USERS_STORAGE_KEY, users);
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

  const users = readJsonArray(USERS_STORAGE_KEY);
  const userIndex = users.findIndex((item) => item.id === userId);
  if (userIndex < 0) {
    throw new Error("User not found.");
  }

  const isValidCurrentPassword = await verifyPassword(current, users[userIndex].password_hash);
  if (!isValidCurrentPassword) {
    throw new Error("Current password is incorrect.");
  }

  users[userIndex] = {
    ...users[userIndex],
    password_hash: await hashPassword(next),
    updated_at: nowIso(),
  };
  writeJsonArray(USERS_STORAGE_KEY, users);
}

export async function deleteUser(userId) {
  const users = readJsonArray(USERS_STORAGE_KEY).filter((item) => item.id !== userId);
  writeJsonArray(USERS_STORAGE_KEY, users);

  const portfolios = readJsonArray(PORTFOLIOS_STORAGE_KEY).filter(
    (item) => item.user_id !== userId,
  );
  writeJsonArray(PORTFOLIOS_STORAGE_KEY, portfolios);
}

export async function adminSetUserPassword(actorUserId, targetUserId, nextPassword) {
  const next = String(nextPassword ?? "").trim();
  if (!next) {
    throw new Error("New password is required.");
  }
  if (next.length < 8) {
    throw new Error("New password must be at least 8 characters.");
  }

  const users = readJsonArray(USERS_STORAGE_KEY);
  const actor = users.find((item) => item.id === actorUserId);
  if (!actor || actor.role !== "admin") {
    throw new Error("Only administrators can change user passwords.");
  }

  const targetIndex = users.findIndex((item) => item.id === targetUserId);
  if (targetIndex < 0) {
    throw new Error("Target user not found.");
  }

  users[targetIndex] = {
    ...users[targetIndex],
    password_hash: await hashPassword(next),
    updated_at: nowIso(),
  };
  writeJsonArray(USERS_STORAGE_KEY, users);
}

export async function adminDeleteUser(actorUserId, targetUserId) {
  const users = readJsonArray(USERS_STORAGE_KEY);
  const actor = users.find((item) => item.id === actorUserId);
  if (!actor || actor.role !== "admin") {
    throw new Error("Only administrators can delete users.");
  }

  const target = users.find((item) => item.id === targetUserId);
  if (!target) {
    throw new Error("Target user not found.");
  }
  if (target.role === "admin") {
    throw new Error("Administrator accounts cannot be deleted.");
  }

  writeJsonArray(
    USERS_STORAGE_KEY,
    users.filter((item) => item.id !== targetUserId),
  );
  writeJsonArray(
    PORTFOLIOS_STORAGE_KEY,
    readJsonArray(PORTFOLIOS_STORAGE_KEY).filter((item) => item.user_id !== targetUserId),
  );
}

export async function authenticateUser(email, plainPassword) {
  const users = readJsonArray(USERS_STORAGE_KEY);
  const user = users.find((item) => item.email === email);

  if (!user) {
    return null;
  }

  const isValid = await verifyPassword(plainPassword, user.password_hash);
  if (!isValid) {
    return null;
  }

  return {
    id: user.id,
    role: user.role,
    funds_usd: user.funds_usd,
    email: user.email,
    username: user.username,
    profile_picture: user.profile_picture,
  };
}

export async function createPortfolioEntry({ userId, cryptoTitle, price, quantity }) {
  const entries = readJsonArray(PORTFOLIOS_STORAGE_KEY);
  const createdAt = nowIso();
  const newEntry = {
    id: nextId(entries),
    user_id: userId,
    crypto_title: cryptoTitle,
    price,
    quantity,
    created_at: createdAt,
    updated_at: createdAt,
  };

  entries.push(newEntry);
  writeJsonArray(PORTFOLIOS_STORAGE_KEY, entries);
  return getPortfolioEntryById(newEntry.id);
}

export async function getPortfolioEntryById(portfolioId) {
  const entries = readJsonArray(PORTFOLIOS_STORAGE_KEY);
  return entries.find((item) => item.id === portfolioId) ?? null;
}

export async function listPortfolioByUserId(userId) {
  const entries = readJsonArray(PORTFOLIOS_STORAGE_KEY);
  return entries
    .filter((item) => item.user_id === userId)
    .sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)));
}

export async function listAllPortfolioEntries() {
  const entries = readJsonArray(PORTFOLIOS_STORAGE_KEY)
    .slice()
    .sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)));
  const users = readJsonArray(USERS_STORAGE_KEY);

  return entries
    .map((entry) => {
      const owner = users.find((user) => user.id === entry.user_id);
      if (!owner) {
        return null;
      }

      return {
        ...entry,
        username: owner.username,
        email: owner.email,
      };
    })
    .filter(Boolean);
}

export async function updatePortfolioEntry(portfolioId, updates) {
  const entries = readJsonArray(PORTFOLIOS_STORAGE_KEY);
  const entryIndex = entries.findIndex((item) => item.id === portfolioId);
  if (entryIndex < 0) {
    return null;
  }

  const nextEntry = { ...entries[entryIndex] };
  if (updates.cryptoTitle !== undefined) nextEntry.crypto_title = updates.cryptoTitle;
  if (updates.price !== undefined) nextEntry.price = updates.price;
  if (updates.quantity !== undefined) nextEntry.quantity = updates.quantity;
  nextEntry.updated_at = nowIso();

  entries[entryIndex] = nextEntry;
  writeJsonArray(PORTFOLIOS_STORAGE_KEY, entries);
  return getPortfolioEntryById(portfolioId);
}

export async function deletePortfolioEntry(portfolioId) {
  const entries = readJsonArray(PORTFOLIOS_STORAGE_KEY).filter(
    (item) => item.id !== portfolioId,
  );
  writeJsonArray(PORTFOLIOS_STORAGE_KEY, entries);
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
