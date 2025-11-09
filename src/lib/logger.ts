/**
 * ============================================================
 * Signal-Lane — Minimal Universal Logger
 * ============================================================
 *
 * A zero-dependency, environment-agnostic wrapper around the
 * native console API.
 *
 * Features:
 *  - Consistent, timestamped log messages
 *  - Type-safe interface (`info`, `warn`, `error`, `debug`)
 *  - Works in both browser and Node.js
 *  - Production-safe (skips debug logs in production)
 *  - Never throws — completely safe for use anywhere
 *
 * Use this logger for application-wide diagnostics and
 * event tracing without external dependencies.
 */

type LogLevel = "info" | "warn" | "error" | "debug";


/**
 * Returns an ISO-8601 timestamp for log consistency.
 */
function formatTime(): string {
  return new Date().toISOString();
}

/**
 * Core unified logging function.
 * Wraps console methods and guarantees consistent structure.
 */
function log(level: LogLevel, ...args: unknown[]): void {
  try {
    
    const prefix = `[${level.toUpperCase()}] ${formatTime()}`;
    const consoleMethod =
      level === "info"
        ? console.info
        : level === "warn"
        ? console.warn
        : level === "error"
        ? console.error
        : console.log; // debug fallback

    // Server and client both use plain console output
    consoleMethod(prefix, ...args);
  } catch {
    // Ultimate fallback — prevent any crash during logging
    try {
      console.log(`[FALLBACK-LOGGER] ${formatTime()} ${level.toUpperCase()}`, ...args);
    } catch {
      // swallow silently; nothing else to do
    }
  }
}

/**
 * ============================================================
 * Exported Logger API
 * ============================================================
 *
 * Provides a uniform interface for logging across the app.
 */
export const logger = {
  /** Log informational messages (app flow, status, etc.) */
  info: (...args: unknown[]) => log("info", ...args),

  /** Log warnings about non-critical but notable conditions. */
  warn: (...args: unknown[]) => log("warn", ...args),

  /** Log errors and critical failures that need attention. */
  error: (...args: unknown[]) => log("error", ...args),

  /** Log verbose development-only details (suppressed in prod). */
  debug: (...args: unknown[]) => log("debug", ...args),
};

/** Named exports for convenience. */
export const { info, warn, error, debug } = logger;

export default logger;
