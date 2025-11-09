import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isValidName, isValidPhone } from "@/lib/utils";
import logger from "@/lib/logger";

/**
 * ============================================================
 * Signal-Lane — User Registration API
 * ============================================================
 *
 * POST /api/users
 * Registers a user before they join the chat.
 * If the user already exists, their record is reused.
 */

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, phone } = body;

    // Input validation
    if (!isValidName(name) || !isValidPhone(phone)) {
      logger.warn({ name, phone }, "Invalid user registration attempt.");
      return NextResponse.json(
        { error: "Invalid name or phone number." },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existing = await prisma.user.findUnique({ where: { phone } });

    if (existing) {
      logger.info({ phone }, "Existing user joined chat.");
      return NextResponse.json(existing);
    }

    // Create a new user
    const user = await prisma.user.create({
      data: { name, phone },
    });

    logger.info({ userId: user.id }, "New user registered successfully.");
    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    logger.error({ error }, "Error during user registration.");
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
