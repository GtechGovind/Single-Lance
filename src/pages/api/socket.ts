import type { NextApiRequest } from "next";
import type { NextApiResponseServerIO } from "@/types/socket";
import { initSocket } from "@/lib/socket";
import logger from "@/lib/logger";

/**
 * ============================================================
 * Signal-Lane — Socket.IO API Route
 * ============================================================
 *
 * Purpose:
 * ----------
 * This API route initializes and attaches a single shared
 * Socket.IO server instance to the underlying Next.js HTTP server.
 *
 * Why this file must live under `/pages/api`:
 *  - Only the Pages Router runs in a Node.js environment.
 *  - The App Router (app/api/...) runs in Edge or serverless mode,
 *    which does NOT support WebSocket upgrades.
 *
 * Once initialized, the Socket.IO instance is reused for all
 * subsequent requests — avoiding multiple server bindings.
 *
 * Example:
 *  - Client calls `fetch("/api/socket")` to “wake up” this route.
 *  - Then connects via `io({ path: "/api/socket" })`.
 */

export default function handler(
  req: NextApiRequest,
  res: NextApiResponseServerIO
) {
  try {
    /**
     * ------------------------------------------------------------
     * Step 1 — Validate HTTP Method
     * ------------------------------------------------------------
     * Only `GET` is allowed since this route is used for
     * initializing the socket connection, not handling data.
     */
    if (req.method !== "GET") {
      logger.warn(
        { method: req.method },
        "Rejected non-GET request on /api/socket"
      );
      return res.status(405).json({ error: "Method not allowed" });
    }

    /**
     * ------------------------------------------------------------
     * Step 2 — Attach Socket.IO Server if not already present
     * ------------------------------------------------------------
     * `res.socket.server` refers to the underlying Node HTTP server
     * created by Next.js during development or runtime.
     *
     * The socket instance is stored on `res.socket.server.io` to
     * persist across hot reloads and multiple API calls.
     */
    if (!res.socket?.server?.io) {
      logger.info("Initializing new Socket.IO server instance...");
      initSocket(res.socket.server);
    } else {
      logger.debug("Reusing existing Socket.IO instance (already active).");
    }

    /**
     * ------------------------------------------------------------
     * Step 3 — End the response
     * ------------------------------------------------------------
     * The client doesn’t expect a JSON payload — this route
     * simply ensures the server is ready to accept WebSocket upgrades.
     */
    res.end();
  } catch (err) {
    /**
     * ------------------------------------------------------------
     * Step 4 — Error Handling
     * ------------------------------------------------------------
     * Any unexpected issue (e.g., res.socket is undefined)
     * will be logged and reported to the client as a 500 error.
     */
    logger.error({ err }, "Socket route initialization failed");
    res.status(500).end();
  }
}
