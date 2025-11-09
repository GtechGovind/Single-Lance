import { useState } from "react";

interface ChatInputProps {
  onSend: (content: string) => void;
  onTyping: (isTyping: boolean) => void;
}

export default function ChatInput({ onSend, onTyping }: ChatInputProps) {
  const [content, setContent] = useState("");

  const handleSend = () => {
    if (!content.trim()) return;
    onSend(content);
    setContent("");
  };

  return (
    <div className="flex items-center px-4 py-3 border-t border-slate-800 bg-slate-800/60 backdrop-blur">
      <input
        type="text"
        value={content}
        onChange={(e) => {
          setContent(e.target.value);
          onTyping(e.target.value.length > 0);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleSend();
        }}
        placeholder="Type your message..."
        className="flex-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
      />
      <button
        onClick={handleSend}
        className="ml-3 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition"
      >
        Send
      </button>
    </div>
  );
}
