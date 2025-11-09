/**
 * ============================================================
 * Signal-Lane — Global Chat Type Definitions (Final Version)
 * ============================================================
 *
 * Overview:
 * ----------
 * This module defines the complete, strongly-typed schema for all
 * real-time communications in the Signal-Lane chat application.
 *
 * It enforces consistency between the client and server by defining
 * all Socket.IO events, message structures, and user data contracts.
 *
 * Benefits:
 * ----------
 *  - Guarantees type safety for all socket events
 *  - Prevents runtime errors caused by inconsistent payloads
 *  - Enables full IntelliSense autocompletion
 *  - Makes scaling across multiple servers easier with inter-server types
 *
 * Example Import:
 * ```ts
 * import type {
 *   SignalMessage,
 *   SignalUser,
 *   ClientToServerEvents,
 *   ServerToClientEvents,
 *   TypedIOServer,
 *   TypedSocket
 * } from "@/types/signal-lane.types";
 * ```
 */

import type { Server as IOServer, Socket as IOSocket } from "socket.io";

/* ============================================================
 * Core Message Schema
 * ============================================================
 */

/**
 * Represents a single chat message in the Signal-Lane ecosystem.
 */
export interface SignalMessage {
  /** Unique identifier for this message (usually database-generated). */
  id?: string;

  /** Display name of the sender. */
  name: string;

  /** Phone number of the sender (used for identification). */
  phone: string;

  /** Message content (UTF-8 text). */
  content: string;

  /** ISO-8601 timestamp when message was sent. */
  timestamp?: string;
}

/* ============================================================
 * User Representation
 * ============================================================
 */

/**
 * Represents a user connected to the global Signal-Lane chat.
 */
export interface SignalUser {
  /** The unique Socket.IO connection ID for this user. */
  socketId: string;

  /** The display name of the connected user. */
  name: string;

  /** The phone number of the connected user (unique identifier). */
  phone: string;

  /** True if the user is actively typing, false otherwise. */
  typing?: boolean;

  /** The UTC timestamp (ISO-8601) of when this user joined. */
  joinedAt?: string;
}

/* ============================================================
 * Client → Server Events
 * ============================================================
 */

export interface ClientToServerEvents {
  /**
   * Fired when a client sends a new chat message.
   * The payload contains the full message object.
   */
  message: (data: SignalMessage) => void;

  /**
   * Emitted when the client’s typing state changes.
   * Allows other clients to show typing indicators.
   */
  typing: (data: { name: string; typing: boolean }) => void;

  /**
   * Fired immediately after a socket connects.
   * Identifies the user by phone number so the server can
   * manage unique user tracking and accurate online counts.
   */
  identify: (data: { name?: string; phone: string }) => void;

  /**
   * Optional: Used for latency/health check testing.
   */
  ping?: () => void;
}

/* ============================================================
 * Server → Client Events
 * ============================================================
 */

export interface ServerToClientEvents {
  /**
   * Broadcasts a message from any client to all others.
   */
  message: (data: SignalMessage) => void;

  /**
   * Notifies clients when someone starts/stops typing.
   */
  typing: (data: { name: string; typing: boolean }) => void;

  /**
   * Sends updated information about server state:
   *  - Total connected unique users
   *  - Optionally, a list of connected users
   */
  serverInfo: (info: {
    connectedUsers: number;
    users?: SignalUser[];
  }) => void;

  /**
   * Server's response to a ping event (for health checks).
   */
  pong?: () => void;
}

/* ============================================================
 * Inter-Server Events (for Scaling / Redis Adapter)
 * ============================================================
 */

export interface InterServerEvents {
  /** Used for health checks between clustered nodes. */
  ping: () => void;

  /**
   * Optional cross-node log event.
   * Enables centralized debugging or message propagation
   * in distributed chat setups.
   */
  log?: (msg: string) => void;

  /**
   * Broadcast unique user count updates across nodes.
   */
  userSync?: (data: { phone: string; connected: boolean }) => void;
}

/* ============================================================
 * Socket Metadata
 * ============================================================
 */

/**
 * Per-socket data stored server-side.
 * Used for maintaining quick references to user state.
 */
export interface SocketData {
  /** User display name (optional) */
  name?: string;

  /** User phone number (required for unique tracking) */
  phone?: string;

  /** Timestamp of when this socket joined */
  joinedAt?: string;
}

/* ============================================================
 * Typed Socket.IO Instances
 * ============================================================
 */

/**
 * Strongly-typed Socket.IO server for Signal-Lane.
 * Includes all event contracts and socket metadata.
 */
export type TypedIOServer = IOServer<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;

/**
 * Strongly-typed Socket.IO client socket.
 * Guarantees event safety in both emission and reception.
 */
export type TypedSocket = IOSocket<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;
