"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import ChatHeader from "./components/ChatHeader";
import ChatMessages from "./components/ChatMessages";
import ChatInput from "./components/ChatInput";
import ChatUserList from "./components/ChatUserList";
import useChat from "./hooks/useChat";
import logger from "@/lib/logger";

/**
 * ============================================================
 * Signal-Lane — Chat Page (Improved UI + Accurate Online Count)
 * ============================================================
 *
 * Responsibilities:
 *  - Extract user identity (name, phone) from query parameters.
 *  - Wait until identity is ready before initializing the socket.
 *  - Render a WhatsApp-like chat interface with real-time updates.
 *  - Display accurate online user count based on unique connections.
 *
 * Why this structure:
 *  - Prevents socket initialization before identity is available.
 *  - Keeps UI rendering isolated from socket logic.
 *  - Ensures hydration-safe and consistent hook execution order.
 *
 * Example URL:
 *   http://localhost:3000/chat?name=Govind&phone=9999999999
 */

export default function ChatPage() {
  const params = useSearchParams();
  const [name, setName] = useState<string | null>(null);
  const [phone, setPhone] = useState<string | null>(null);

  /**
   * ------------------------------------------------------------
   * Step 1 — Extract identity from URL (runs once on mount)
   * ------------------------------------------------------------
   */
  useEffect(() => {
    try {
      const userName = params?.get("name");
      const userPhone = params?.get("phone");

      if (userName && userPhone) {
        setName(userName);
        setPhone(userPhone);
        logger.info({ userName, userPhone }, "✅ User identity loaded from URL");
      } else {
        logger.warn("⚠️ Missing name or phone in query parameters.");
      }
    } catch (err) {
      logger.error({ err }, "Failed to extract user identity from URL.");
    }
  }, [params]);

  /**
   * ------------------------------------------------------------
   * Step 2 — Show loader until both values are available
   * ------------------------------------------------------------
   */
  if (!name || !phone) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-900 text-slate-400">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-slate-500 mb-4" />
        <p className="text-lg font-medium">Initializing your chat session...</p>
        <p className="text-sm text-slate-500 mt-1">
          Ensure <code>?name=&lt;yourName&gt;&phone=&lt;yourPhone&gt;</code> are in the URL.
        </p>
      </div>
    );
  }

  /**
   * ------------------------------------------------------------
   * Step 3 — Render ChatRoom once identity is known
   * ------------------------------------------------------------
   */
  return <ChatRoom name={name} phone={phone} />;
}

/**
 * ============================================================
 * Component: ChatRoom
 * ============================================================
 *
 * Responsibilities:
 *  - Establish socket connection with useChat().
 *  - Display connected user count.
 *  - Render modern WhatsApp-style chat interface.
 *  - Manage message list, typing status, and message input.
 */
function ChatRoom({ name, phone }: { name: string; phone: string }) {
  /**
   * Initialize the socket connection and chat logic.
   */
  const { messages, typingUser, connectedUsers, sendMessage, typing } = useChat({
    name,
    phone,
  });

  return (
    <div className="flex flex-col md:flex-row h-screen bg-slate-900 text-slate-50">
      {/* ============================================================
       * Sidebar (Connected Users)
       * ============================================================ */}
      <aside className="hidden md:flex flex-col w-64 border-r border-slate-800 bg-slate-800/40 p-5 space-y-3">
        <h2 className="text-lg font-semibold text-slate-200 border-b border-slate-700 pb-2">
          Active Users
        </h2>
        <ChatUserList connectedUsers={connectedUsers} />
      </aside>

      {/* ============================================================
       * Main Chat Section
       * ============================================================ */}
      <section className="flex flex-col flex-1 h-full">
        {/* Header with online count */}
        <ChatHeader connectedUsers={connectedUsers} />

        {/* Scrollable messages area */}
        <div className="flex-1 overflow-y-auto bg-slate-900 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-800 px-4 py-3">
          <ChatMessages messages={messages} typingUser={typingUser} />
        </div>

        {/* Input bar */}
        <div className="border-t border-slate-800 bg-slate-800/60 backdrop-blur-md p-3">
          <ChatInput onSend={sendMessage} onTyping={typing} />
        </div>
      </section>
    </div>
  );
}
