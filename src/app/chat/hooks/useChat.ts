"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { io, type Socket } from "socket.io-client";
import logger from "@/lib/logger";
import type {
  SignalMessage,
  ClientToServerEvents,
  ServerToClientEvents,
} from "@/types";

/**
 * ============================================================
 * Signal-Lane — useChat Hook (Final Optimized Version)
 * ============================================================
 *
 * Responsibilities:
 *  - Manage Socket.IO lifecycle (connect / reconnect / cleanup)
 *  - Fetch and persist messages via /api/messages (Prisma backend)
 *  - Maintain real-time chat state:
 *     • messages
 *     • typing indicator
 *     • connected user count
 *  - Prevent message duplication and echo loops
 *  - Emit user identity to the server for accurate online tracking
 *
 * Technical:
 *  - Socket.IO client path: /api/socket
 *  - REST endpoints:
 *      • GET /api/messages — fetch chat history
 *      • POST /api/messages — persist new messages
 *  - Works seamlessly with Next.js App Router.
 */

type ClientSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

interface UseChatOptions {
  /** User display name */
  name: string | null;

  /** Unique phone identifier */
  phone: string | null;
}

/**
 * ============================================================
 * Hook: useChat
 * ============================================================
 * @param options - Contains user's name and phone
 * @returns Reactive chat state + methods (send, typing)
 */
export default function useChat({ name, phone }: UseChatOptions) {
  /**
   * ----------------------------------------------------------------
   * Reactive Chat State
   * ----------------------------------------------------------------
   */
  const [messages, setMessages] = useState<SignalMessage[]>([]);
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const [connectedUsers, setConnectedUsers] = useState<number>(0);

  /**
   * Reference to the active Socket.IO client instance.
   * Using a ref avoids re-creating the socket across re-renders.
   */
  const socketRef = useRef<ClientSocket | null>(null);

  /**
   * ----------------------------------------------------------------
   * Load historical chat messages (via Prisma REST API)
   * ----------------------------------------------------------------
   */
  const loadMessages = useCallback(async () => {
    try {
      const res = await fetch("/api/messages");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: SignalMessage[] = await res.json();
      setMessages(data);
      logger.info(`Loaded ${data.length} previous messages from history.`);
    } catch (err) {
      logger.error({ err }, "Failed to load previous chat messages.");
    }
  }, []);

  /**
   * ----------------------------------------------------------------
   * Initialize and Manage Socket.IO Connection
   * ----------------------------------------------------------------
   */
  useEffect(() => {
    // Guard clause: Wait until identity is known
    if (!name || !phone) {
      logger.warn("Skipping socket initialization — missing user identity.");
      return;
    }

    const connectSocket = async () => {
      try {
        /**
         * Step 1 — Warm up the backend socket endpoint.
         * This ensures the Socket.IO server is attached in Next.js.
         */
        const res = await fetch("/api/socket");
        if (!res.ok) {
          logger.error(
            { status: res.status, statusText: res.statusText },
            "Failed to initialize Socket.IO route."
          );
          return;
        }

        /**
         * Step 2 — Create and configure Socket.IO client.
         */
        const socket: ClientSocket = io({
          path: "/api/socket",
          transports: ["websocket"], // Always use WebSocket (no HTTP fallback)
          reconnection: true,
          reconnectionAttempts: 10,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
          timeout: 10000,
        });

        socketRef.current = socket;

        /**
         * Step 3 — Register event handlers
         */
        socket.on("connect", () => {
          logger.info({ id: socket.id }, "Socket connected to Signal-Lane.");

          // Identify user on server to enable unique count tracking
          socket.emit("identify", { phone });

          // Load persisted chat history on initial connect
          loadMessages();
        });

        socket.on("disconnect", (reason) => {
          logger.warn({ reason }, "Socket disconnected.");
        });

        socket.on("connect_error", (err) => {
          logger.error({ error: err.message }, "Socket connection error.");
        });

        /**
         * Step 4 — Handle real-time messages from server
         *
         * To prevent duplicates, ignore messages where sender phone
         * matches the current user's phone number.
         */
        socket.on("message", (msg: SignalMessage) => {
          if (msg.phone === phone) return;
          setMessages((prev) => [...prev, msg]);
        });

        /**
         * Step 5 — Typing event handler
         */
        socket.on("typing", ({ name, typing }) => {
          setTypingUser(typing ? name : null);
        });

        /**
         * Step 6 — Connected user info handler
         */
        socket.on("serverInfo", (info) => {
          setConnectedUsers(info.connectedUsers);
        });

        // Step 7 — Finally, connect the socket
        socket.connect();
      } catch (err) {
        logger.error({ err }, "Socket initialization failed.");
      }
    };

    connectSocket();

    /**
     * Step 8 — Cleanup on unmount or dependency change
     */
    return () => {
      const s = socketRef.current;
      if (s) {
        logger.debug("Cleaning up socket listeners and disconnecting...");
        s.removeAllListeners();
        s.disconnect();
        socketRef.current = null;
      }
    };
  }, [name, phone, loadMessages]);

  /**
   * ----------------------------------------------------------------
   * Send a new message (with optimistic UI and DB persistence)
   * ----------------------------------------------------------------
   */
  const sendMessage = useCallback(
    async (content: string) => {
      if (!name || !phone || !content.trim()) {
        logger.warn("Attempted to send empty or invalid message.");
        return;
      }

      const s = socketRef.current;
      if (!s || s.disconnected) {
        logger.warn("Socket not connected — message not sent.");
        return;
      }

      const newMsg: SignalMessage = {
        id: crypto.randomUUID(),
        name: "You",
        phone,
        content,
        timestamp: new Date().toISOString(),
      };

      // Optimistic UI update (adds message locally)
      setMessages((prev) => [...prev, newMsg]);

      // Emit message to other connected clients
      s.emit("message", { name, phone, content });

      // Persist to the database via REST API
      try {
        const res = await fetch("/api/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, phone, content }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        logger.debug("Message successfully persisted to DB.");
      } catch (err) {
        logger.error({ err }, "Failed to persist message to database.");
      }
    },
    [name, phone]
  );

  /**
   * ----------------------------------------------------------------
   * Emit typing status (start / stop typing)
   * ----------------------------------------------------------------
   */
  const typing = useCallback(
    (isTyping: boolean) => {
      const s = socketRef.current;
      if (!s || s.disconnected || !name) return;
      s.emit("typing", { name, typing: isTyping });
    },
    [name]
  );

  /**
   * ----------------------------------------------------------------
   * Return Public API
   * ----------------------------------------------------------------
   */
  return {
    /** Array of all chat messages (reactive) */
    messages,

    /** Currently typing user (if any) */
    typingUser,

    /** Total connected users (unique count from server) */
    connectedUsers,

    /** Sends a new message through the socket + persists to DB */
    sendMessage,

    /** Emits typing status (start/stop) */
    typing,
  };
}
