/**
 * ============================================================
 * Signal-Lane — Utility Functions
 * ============================================================
 *
 * This module provides reusable helper utilities for the
 * Signal-Lane real-time chat application. These functions
 * encapsulate common logic such as message normalization,
 * timestamp formatting, input validation, and identifier
 * generation.
 *
 * All utilities are designed to be:
 *  - Type-safe
 *  - Pure (no side effects)
 *  - Framework-agnostic (usable on both server and client)
 */

import crypto from "crypto";

/**
 * Generates a unique identifier suitable for messages or users.
 * Uses Node's crypto API for secure, collision-resistant IDs.
 *
 * @param length - The desired length of the ID (default: 16).
 * @returns A randomly generated hexadecimal string.
 */
export function generateId(length: number = 16): string {
  return crypto.randomBytes(length).toString("hex").slice(0, length);
}

/**
 * Returns the current timestamp in ISO 8601 format.
 * This standard format ensures consistent time handling
 * between server and client regardless of timezone.
 *
 * @returns ISO-8601 formatted timestamp string.
 */
export function getTimestamp(): string {
  return new Date().toISOString();
}

/**
 * Validates a user's name input before allowing them to join the chat.
 * Ensures that names are non-empty, properly trimmed, and within length limits.
 *
 * @param name - The name input provided by the user.
 * @returns `true` if the name is valid, otherwise `false`.
 */
export function isValidName(name: string): boolean {
  if (!name) return false;
  const trimmed = name.trim();
  return trimmed.length >= 2 && trimmed.length <= 40;
}

/**
 * Validates a user's phone number input.
 * Allows digits, spaces, and '+' for international codes.
 * Can be adjusted depending on business rules.
 *
 * @param phone - The phone number provided by the user.
 * @returns `true` if the phone number matches the expected pattern.
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^[+]?[\d\s]{8,20}$/;
  return phoneRegex.test(phone.trim());
}

/**
 * Sanitizes message content before broadcasting or persisting.
 * Removes excessive whitespace and trims leading/trailing spaces.
 *
 * @param content - The message text.
 * @returns A clean, normalized string.
 */
export function sanitizeMessage(content: string): string {
  return content.replace(/\s+/g, " ").trim();
}

/**
 * Normalizes a message object before saving or emitting.
 * Adds a unique ID and timestamp if missing, and ensures
 * content is properly sanitized.
 *
 * @param message - Partial message object.
 * @returns Fully normalized message ready for transmission.
 */
export function normalizeMessage<T extends { id?: string; content: string; timestamp?: string }>(
  message: T
): T & { id: string; timestamp: string } {
  return {
    ...message,
    id: message.id || generateId(12),
    content: sanitizeMessage(message.content),
    timestamp: message.timestamp || getTimestamp(),
  };
}

/**
 * Delays execution asynchronously.
 * Useful for simulating latency or spacing sequential socket events.
 *
 * @param ms - Duration of delay in milliseconds.
 * @returns A Promise that resolves after the given delay.
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Masks a phone number for privacy when logging or displaying
 * in the UI. Example: "+919876543210" → "+91******3210"
 *
 * @param phone - The full phone number string.
 * @returns Masked phone number preserving last four digits.
 */
export function maskPhone(phone: string): string {
  const visibleDigits = 4;
  const prefixLength = Math.min(3, Math.max(0, phone.length - visibleDigits - 3));
  const prefix = phone.slice(0, prefixLength);
  const suffix = phone.slice(-visibleDigits);
  return `${prefix}${"*".repeat(phone.length - visibleDigits - prefixLength)}${suffix}`;
}

/**
 * Safely parses incoming JSON data from an API or socket event.
 * Prevents runtime exceptions from malformed payloads.
 *
 * @param input - The raw JSON string or object.
 * @returns Parsed JSON object, or `null` if parsing fails.
 */
export function safeParseJSON<T = any>(input: string | object): T | null {
  try {
    if (typeof input === "object") return input as T;
    return JSON.parse(input) as T;
  } catch {
    return null;
  }
}
