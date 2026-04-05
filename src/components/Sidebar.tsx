import { Plus, MessageSquare, Trash2, BookOpen } from 'lucide-react';
import { ChatSession } from '../types';
import { cn } from '../lib/utils';

interface SidebarProps {
  sessions: ChatSession[];
  currentSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  onDeleteSession: (id: string) => void;
}

export const Sidebar = ({ 
  sessions, 
  currentSessionId, 
  onSelectSession, 
  onNewChat, 
  onDeleteSession 
}: SidebarProps) => {
  return (
    <div className="w-72 bg-slate-900 text-slate-300 flex flex-col h-full border-r border-slate-800">
      <div className="p-4 flex items-center gap-3 border-b border-slate-800">
        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
          <BookOpen className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Lumen</h1>
          <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Academic Coach</p>
        </div>
      </div>

      <div className="p-4">
        <button
          onClick={onNewChat}
          className="w-full flex items-center justify-center gap-2 p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all font-medium shadow-lg shadow-indigo-900/20"
        >
          <Plus className="w-5 h-5" />
          New Session
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-2 space-y-1">
        <div className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Recent Sessions
        </div>
        {sessions.map((session) => (
          <div
            key={session.id}
            className={cn(
              "group flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all",
              currentSessionId === session.id 
                ? "bg-slate-800 text-white" 
                : "hover:bg-slate-800/50"
            )}
            onClick={() => onSelectSession(session.id)}
          >
            <MessageSquare className={cn(
              "w-4 h-4 flex-shrink-0",
              currentSessionId === session.id ? "text-indigo-400" : "text-slate-500"
            )} />
            <span className="flex-1 truncate text-sm font-medium">
              {session.title || "New Chat"}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteSession(session.id);
              }}
              className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 transition-opacity"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-slate-800 mt-auto">
        <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
          <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-xs">
            RK
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate">Royan Kujur</p>
            <p className="text-[10px] text-slate-500 truncate">Student Account</p>
          </div>
        </div>
      </div>
    </div>
  );
};
