import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * ============================================================
 * Signal-Lane — Statistics API
 * ============================================================
 *
 * GET /api/stats
 * Returns system-level statistics (total users, messages, uptime).
 */

export async function GET() {
  try {
    const [users, messages] = await Promise.all([
      prisma.user.count(),
      prisma.message.count(),
    ]);

    return NextResponse.json(
      {
        users,
        messages,
        uptime: `${Math.round(process.uptime())}s`,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch system stats" },
      { status: 500 }
    );
  }
}
