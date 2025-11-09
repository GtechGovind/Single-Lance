interface ChatHeaderProps {
  connectedUsers: number;
}

export default function ChatHeader({ connectedUsers }: ChatHeaderProps) {
  return (
    <header className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-800/60 backdrop-blur">
      <h1 className="text-lg font-semibold tracking-tight">Signal-Lane</h1>
      <span className="text-sm text-slate-400">
        Online: {connectedUsers ?? 0}
      </span>
    </header>
  );
}
