/**
 * ============================================================
 * Signal-Lane — ChatMessages Component (Refined UI Version)
 * ============================================================
 *
 * Purpose:
 *  - Render chat messages in a modern WhatsApp-inspired style.
 *  - Distinguish user vs. other messages (alignment, color, style).
 *  - Display timestamps cleanly inside bubbles without overlap.
 *  - Handle real-time updates safely (hydration-safe).
 *  - Auto-scroll to latest message on update.
 *
 * Key Improvements:
 *  - Compact, right-aligned timestamps that never overlap text.
 *  - Clean layout with balanced padding and spacing.
 *  - Smooth transitions and shadows for message bubbles.
 *  - Typing indicator styled for readability and motion feedback.
 */

"use client";

import { useEffect, useRef, useState } from "react";
import type { SignalMessage } from "@/types";

/** Props definition */
interface ChatMessagesProps {
  messages: SignalMessage[];
  typingUser: string | null;
}

/**
 * ============================================================
 * Component: ChatMessages
 * ============================================================
 * Renders a scrollable chat feed with messages, timestamps,
 * and a typing indicator. Layout resembles WhatsApp.
 */
export default function ChatMessages({ messages, typingUser }: ChatMessagesProps) {
  const [isClient, setIsClient] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  /** Enable rendering after hydration */
  useEffect(() => {
    setIsClient(true);
  }, []);

  /** Auto-scroll to bottom on message updates */
  useEffect(() => {
    if (isClient && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isClient]);

  /** Render safely after hydration */
  const safeMessages = isClient ? messages : [];

  return (
    <main
      ref={scrollRef}
      className="flex-1 overflow-y-auto bg-slate-900 px-4 py-4 space-y-4 scroll-smooth"
      aria-label="Chat messages"
    >
      {/* ============================================================
       * Messages Renderer
       * ============================================================ */}
      {safeMessages.length === 0 && !isClient ? (
        <div className="text-slate-500 text-sm text-center">Loading chat...</div>
      ) : (
        safeMessages.map((msg, index) => {
          const key = msg.id || `${msg.phone}-${msg.timestamp || index}`;
          const isOwn = msg.name === "You";

          return (
            <div
              key={key}
              className={`flex flex-col w-full ${
                isOwn ? "items-end" : "items-start"
              }`}
            >
              {/* Sender name (only for others) */}
              {!isOwn && (
                <span className="text-xs text-slate-400 mb-1 ml-2 tracking-wide">
                  {msg.name}
                </span>
              )}

              {/* Message bubble */}
              <div
                className={`relative group max-w-[80%] px-3 py-2 rounded-2xl text-sm leading-relaxed shadow-sm break-words select-text
                  ${
                    isOwn
                      ? "bg-blue-600 text-white rounded-br-none"
                      : "bg-slate-800 text-slate-100 border border-slate-700 rounded-bl-none"
                  }
                  transition-transform duration-150 hover:scale-[1.01]
                `}
              >
                <span className="block pr-10">{msg.content}</span>

                {/* Timestamp */}
                {msg.timestamp && (
                  <span
                    className={`absolute bottom-[2px] right-2 text-[0.65rem] ${
                      isOwn ? "text-blue-100 opacity-70" : "text-slate-400 opacity-70"
                    }`}
                  >
                    {formatTime(msg.timestamp)}
                  </span>
                )}
              </div>
            </div>
          );
        })
      )}

      {/* ============================================================
       * Typing Indicator
       * ============================================================ */}
      {isClient && typingUser && (
        <div
          key="typing-indicator"
          className="text-sm text-slate-400 italic animate-pulse px-2 mt-2"
          aria-live="polite"
        >
          {typingUser} is typing...
        </div>
      )}
    </main>
  );
}

/**
 * ============================================================
 * Utility: formatTime
 * ============================================================
 * Converts ISO timestamp into HH:MM (UTC) 24-hour format.
 * Keeps consistent results between SSR and CSR renders.
 */
function formatTime(timestamp?: string): string {
  if (!timestamp) return "";
  const d = new Date(timestamp);
  const hours = d.getUTCHours().toString().padStart(2, "0");
  const minutes = d.getUTCMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
}
