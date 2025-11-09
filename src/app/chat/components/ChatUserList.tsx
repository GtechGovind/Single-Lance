interface ChatUserListProps {
  connectedUsers: number;
}

export default function ChatUserList({ connectedUsers }: ChatUserListProps) {
  return (
    <div className="h-full flex flex-col">
      <div className="px-4 py-3 border-b border-slate-800 bg-slate-800/70">
        <h2 className="text-sm font-semibold text-slate-300">
          Connected Users
        </h2>
      </div>
      <div className="flex-1 p-4 text-sm text-slate-400">
        {connectedUsers > 0
          ? `Currently ${connectedUsers} user${connectedUsers > 1 ? "s" : ""} online`
          : "No users connected"}
      </div>
    </div>
  );
}
