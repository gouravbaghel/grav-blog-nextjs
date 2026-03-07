const LEGACY_SSL_MODE_ALIASES = new Set(["prefer", "require", "verify-ca"]);

export function normalizeDatabaseUrl(connectionString: string): string {
  try {
    const url = new URL(connectionString);
    const sslmode = url.searchParams.get("sslmode")?.toLowerCase();
    const useLibpqCompat =
      url.searchParams.get("uselibpqcompat")?.toLowerCase() === "true";

    // Keep today's effective behavior, but make it explicit so pg stops warning.
    if (!useLibpqCompat && sslmode && LEGACY_SSL_MODE_ALIASES.has(sslmode)) {
      url.searchParams.set("sslmode", "verify-full");
      return url.toString();
    }
  } catch {
    return connectionString;
  }

  return connectionString;
}

export function getDatabaseUrl(): string {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not set.");
  }

  return normalizeDatabaseUrl(databaseUrl);
}
