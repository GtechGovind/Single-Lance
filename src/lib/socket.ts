import { Server as IOServer } from "socket.io";
import type { Server as HTTPServer } from "http";
import logger from "@/lib/logger";
import type { ServerToClientEvents, ClientToServerEvents } from "@/types";

/**
 * ============================================================
 * Signal-Lane — Socket.IO Server (Final Type-Safe Version)
 * ============================================================
 *
 * Overview:
 * ----------
 * Initializes and manages a single instance of a Socket.IO server
 * attached to the Next.js HTTP server. This implementation:
 *
 *  - Prevents multiple instances and duplicate event handlers
 *  - Ensures the sender does not receive their own message twice
 *  - Handles typing indicators and connection lifecycle
 *  - Is fully compatible with Next.js Pages Router
 *  - Supports WebSocket-only connections for performance
 *
 * Design Goals:
 *  - Singleton pattern for the Socket.IO instance
 *  - Type-safe events using shared event interfaces
 *  - Hot reload safety during Next.js development
 *  - Structured logging for observability
 */

/**
 * Global instance of Socket.IO.
 * Declared outside the function to persist across reloads.
 */
let io: IOServer<ClientToServerEvents, ServerToClientEvents> | null = null;

/**
 * Indicates whether event listeners have already been attached.
 * Prevents duplicate registration when the server reloads.
 */
let isInitialized = false;

/**
 * Initializes and attaches Socket.IO to the provided Node.js HTTP server.
 *
 * @param server - The Next.js internal Node.js HTTP server.
 * @returns The initialized Socket.IO server instance.
 */
export function initSocket(
  server: HTTPServer
): IOServer<ClientToServerEvents, ServerToClientEvents> {
  /**
   * Step 1 — Reuse existing instance if available.
   * Prevents multiple Socket.IO servers from being created during
   * hot reloads or repeated API route calls.
   */
  if (io) {
    logger.debug("Reusing existing Socket.IO instance.");
    return io;
  }

  /**
   * Step 2 — Create a new Socket.IO server.
   * The server shares the same underlying HTTP server as Next.js.
   */
  io = new IOServer<ClientToServerEvents, ServerToClientEvents>(server, {
    path: "/api/socket",
    cors: {
      origin: "*", // In production, replace with your domain for security.
      methods: ["GET", "POST"],
    },
    transports: ["websocket"],
  });

  /**
   * Step 3 — Register event handlers once.
   * This guard ensures that we only attach event listeners a single time.
   */
  if (!isInitialized) {
    isInitialized = true;

    io.on("connection", (socket) => {
      logger.info({ socketId: socket.id }, "Client connected to Signal-Lane");

      // Update connected user count immediately
      io!.emit("serverInfo", { connectedUsers: io!.engine.clientsCount });

      /**
       * Message event
       * Received from a client, broadcast to all other clients.
       * Using `socket.broadcast.emit` prevents sending the message
       * back to the original sender, avoiding duplication.
       */
      socket.on("message", (msg) => {
        logger.debug({ from: msg.name, content: msg.content }, "Message received from client");
        socket.broadcast.emit("message", msg);
      });

      /**
       * Typing event
       * Broadcasts typing indicators to all connected clients except the sender.
       */
      socket.on("typing", (payload) => {
        socket.broadcast.emit("typing", payload);
      });

      /**
       * Disconnect event
       * Triggered when a client disconnects (either manually or due to network loss).
       * Updates all clients with the new connected user count.
       */
      socket.on("disconnect", (reason) => {
        logger.warn({ socketId: socket.id, reason }, "Client disconnected");
        io!.emit("serverInfo", { connectedUsers: io!.engine.clientsCount });
      });
    });

    logger.info("Socket.IO server successfully initialized and event handlers attached.");
  } else {
    logger.debug("Socket.IO already initialized, skipping duplicate setup.");
  }

  /**
   * Step 4 — Hot reload safety for development mode.
   * In Next.js development, modules are reloaded frequently.
   * We store the instance globally to persist across reloads.
   */
  if (process.env.NODE_ENV === "development") {
    // @ts-ignore - store instance globally for reuse in dev mode
    if (!global._signalLaneIO) {
      // @ts-ignore
      global._signalLaneIO = io;
    } else {
      // @ts-ignore
      io = global._signalLaneIO;
    }
  }

  /**
   * Step 5 — Return the Socket.IO instance.
   * The non-null assertion ensures type safety, as io is guaranteed
   * to be initialized before returning.
   */
  return io!;
}
