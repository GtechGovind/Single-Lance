"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import ChatHeader from "./ChatHeader";
import ChatMessages from "./ChatMessages";
import ChatInput from "./ChatInput";
import ChatUserList from "./ChatUserList";
import useChat from "../hooks/useChat";
import logger from "@/lib/logger";

/**
 * ============================================================
 * Component: ChatPageInner
 * ============================================================
 *
 * The actual chat page logic that reads query parameters
 * and initializes the chat interface.
 * Wrapped in <Suspense> by the parent ChatPage.
 */
export default function ChatPageInner() {
  const params = useSearchParams();
  const [name, setName] = useState<string | null>(null);
  const [phone, setPhone] = useState<string | null>(null);

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

  return <ChatRoom name={name} phone={phone} />;
}

/**
 * ============================================================
 * Component: ChatRoom
 * ============================================================
 */
function ChatRoom({ name, phone }: { name: string; phone: string }) {
  const { messages, typingUser, connectedUsers, sendMessage, typing } = useChat({
    name,
    phone,
  });

  return (
    <div className="flex flex-col md:flex-row h-screen bg-slate-900 text-slate-50">
      <aside className="hidden md:flex flex-col w-64 border-r border-slate-800 bg-slate-800/40 p-5 space-y-3">
        <h2 className="text-lg font-semibold text-slate-200 border-b border-slate-700 pb-2">
          Active Users
        </h2>
        <ChatUserList connectedUsers={connectedUsers} />
      </aside>

      <section className="flex flex-col flex-1 h-full">
        <ChatHeader connectedUsers={connectedUsers} />
        <div className="flex-1 overflow-y-auto bg-slate-900 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-800 px-4 py-3">
          <ChatMessages messages={messages} typingUser={typingUser} />
        </div>
        <div className="border-t border-slate-800 bg-slate-800/60 backdrop-blur-md p-3">
          <ChatInput onSend={sendMessage} onTyping={typing} />
        </div>
      </section>
    </div>
  );
}
