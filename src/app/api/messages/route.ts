import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import logger from "@/lib/logger";

const prisma = new PrismaClient();

/**
 * ============================================================
 * POST /api/messages
 * ============================================================
 * Save a new chat message in the database.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, phone, content } = body;

    if (!name || !phone || !content)
      return NextResponse.json({ error: "Invalid message payload" }, { status: 400 });

    const message = await prisma.message.create({
      data: { name, phone, content },
    });

    logger.info({ id: message.id, phone }, "💾 Message persisted to DB");
    return NextResponse.json(message);
  } catch (err) {
    logger.error({ err }, "Failed to persist message");
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * ============================================================
 * GET /api/messages
 * ============================================================
 * Fetch recent chat history (latest 50 messages)
 */
export async function GET() {
  try {
    const messages = await prisma.message.findMany({
      orderBy: { timestamp: "asc" },
      take: 50,
    });
    return NextResponse.json(messages);
  } catch (err) {
    logger.error({ err }, "Failed to load message history");
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
