"use client";

import { Suspense } from "react";
import ChatPageInner from "./components/ChatPageInner";

/**
 * ============================================================
 * Signal-Lane — Chat Page (Suspense-safe Wrapper)
 * ============================================================
 *
 * Why this pattern:
 * - Next.js `useSearchParams()` uses React Suspense.
 * - To avoid hydration warnings, wrap the component that calls it
 *   inside a <Suspense> boundary.
 * - Keeps all other logic (socket setup, UI) unchanged.
 */

export default function ChatPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center h-screen bg-slate-900 text-slate-400">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-slate-500 mb-4" />
          <p className="text-lg font-medium">Loading chat interface...</p>
        </div>
      }
    >
      <ChatPageInner />
    </Suspense>
  );
}
