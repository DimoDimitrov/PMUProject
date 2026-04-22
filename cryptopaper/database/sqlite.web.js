export async function initializeDatabase() {
  // Web fallback: skip native SQLite init.
  // Native platforms (iOS/Android) use sqlite.js with expo-sqlite.
}

export async function getDatabase() {
  throw new Error(
    "SQLite database operations are currently enabled only on native platforms.",
  );
}
