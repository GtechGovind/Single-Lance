"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { isValidName, isValidPhone } from "@/lib/utils";

/**
 * ============================================================
 * Signal-Lane — Entry Page (User Registration)
 * ============================================================
 *
 * Collects name and phone, saves to DB via API, then redirects
 * to the chat page.
 */

export default function HomePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleJoin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Client-side validation
    if (!isValidName(name)) {
      setError("Please enter a valid name (2–40 characters).");
      setLoading(false);
      return;
    }

    if (!isValidPhone(phone)) {
      setError("Please enter a valid phone number.");
      setLoading(false);
      return;
    }

    try {
      // Save user to the database
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to register user.");
      }

      const user = await res.json();

      // Navigate to chat page
      router.push(`/chat?name=${encodeURIComponent(user.name)}&phone=${encodeURIComponent(user.phone)}`);
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-900 px-4 text-slate-50">
      <div className="w-full max-w-md rounded-2xl bg-slate-800 border border-slate-700 p-8 shadow-lg">
        <h1 className="mb-6 text-center text-2xl font-semibold tracking-tight">
          Welcome to Signal-Lane
        </h1>

        <form onSubmit={handleJoin} className="space-y-4">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-slate-300"
            >
              Display Name
            </label>
            <input
              id="name"
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-slate-300"
            >
              Phone Number
            </label>
            <input
              id="phone"
              type="tel"
              placeholder="+91 9876543210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
            />
          </div>

          {error && (
            <p className="text-sm text-red-500 bg-red-500/10 px-3 py-2 rounded-md">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 py-2 text-sm font-medium text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50"
          >
            {loading ? "Joining..." : "Join Chat"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-500">
          By joining, you agree to follow community guidelines.
        </p>
      </div>
    </div>
  );
}
