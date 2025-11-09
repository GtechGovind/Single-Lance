/**
 * ============================================================
 * Signal-Lane — Prisma Client Initialization
 * ============================================================
 *
 * This module exports a singleton instance of PrismaClient used
 * throughout the Signal-Lane application. It ensures efficient
 * database connection management across development and production.
 *
 * Features:
 * - Singleton pattern to prevent multiple instances during hot reloads
 * - Safe integration with Next.js 14 App Router
 * - Environment-aware initialization (development vs production)
 * - Integrated error logging
 */

import { PrismaClient } from "@prisma/client";
import logger from "@/lib/logger";

/**
 * PrismaClient is attached to the global scope in development to avoid
 * exhausting database connections due to Next.js hot reloading.
 *
 * In production, a new instance is created normally for each serverless
 * function or container instance.
 */

// Define an extended global type for TypeScript
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

/**
 * Initializes or retrieves an existing Prisma client.
 *
 * The logic is environment-specific:
 * - In development: stores a reference on the global object
 * - In production: always creates a new client instance
 */
export const prisma: PrismaClient =
  globalThis.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

/**
 * Attaches Prisma to the global object in development mode
 * to prevent multiple client instances across hot reloads.
 */
if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = prisma;
  logger.debug("Prisma client attached to global scope (development mode).");
}

/**
 * Graceful shutdown handler for Prisma connections.
 * Useful when deploying in environments like Docker or Kubernetes.
 */
export async function disconnectPrisma(): Promise<void> {
  try {
    await prisma.$disconnect();
    logger.info("Prisma connection closed successfully.");
  } catch (error) {
    logger.error({ error }, "Failed to close Prisma connection gracefully.");
  }
}
