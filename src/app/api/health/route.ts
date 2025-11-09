import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import logger from "@/lib/logger";

/**
 * ============================================================
 * Signal-Lane — Health Check API
 * ============================================================
 *
 * GET /api/health
 * Verifies that the application and database are running properly.
 */

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json(
      { status: "ok", database: "connected", uptime: process.uptime() },
      { status: 200 }
    );
  } catch (error) {
    logger.error({ error }, "Health check failed.");
    return NextResponse.json(
      { status: "error", database: "disconnected" },
      { status: 500 }
    );
  }
}
