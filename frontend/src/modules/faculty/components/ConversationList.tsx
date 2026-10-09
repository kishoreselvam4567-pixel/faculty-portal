import React, { useState } from 'react';
import {
  MessageSquare,
  Plus,
  Search,
  Trash2,
  Edit2,
  Check,
  X,
  Clock,
  Sparkles,
} from 'lucide-react';
import { ChatConversationSummary } from '../types/faculty.types';

interface ConversationListProps {
  conversations: ChatConversationSummary[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  onRenameConversation: (id: string, newTitle: string) => Promise<void>;
  onDeleteConversation: (id: string) => Promise<void>;
  loading?: boolean;
}

export const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewConversation,
  onRenameConversation,
  onDeleteConversation,
  loading = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filteredConversations = conversations.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleStartRename = (c: ChatConversationSummary, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(c.id);
    setEditTitle(c.title);
  };

  const handleSaveRename = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (editTitle.trim()) {
      await onRenameConversation(id, editTitle.trim());
    }
    setEditingId(null);
  };

  const handleCancelRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(null);
  };

  const handleConfirmDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await onDeleteConversation(id);
    setDeletingId(null);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50/70 border-r border-slate-200 w-full sm:w-64 lg:w-72 shrink-0 select-none">
      {/* Top Action Area: New Chat */}
      <div className="p-3 border-b border-slate-200 bg-white">
        <button
          type="button"
          onClick={onNewConversation}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-all shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>New Conversation</span>
        </button>

        {/* Search input */}
        <div className="mt-2.5 relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search conversations..."
            className="w-full pl-8 pr-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-800 placeholder-slate-400 transition-colors"
          />
        </div>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {loading ? (
          <div className="p-4 space-y-2 text-center text-xs text-slate-400">
            <Clock className="w-5 h-5 mx-auto animate-spin text-blue-500" />
            <p>Loading history...</p>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-400 space-y-1.5">
            <MessageSquare className="w-6 h-6 mx-auto text-slate-300" />
            <p className="font-medium text-slate-600">No conversations found</p>
            <p className="text-[11px] text-slate-400">
              {searchQuery ? 'Try another search term' : 'Start your first conversation with the Faculty AI'}
            </p>
          </div>
        ) : (
          filteredConversations.map((c) => {
            const isActive = c.id === activeConversationId;
            const isEditing = c.id === editingId;
            const isDeleting = c.id === deletingId;

            return (
              <div
                key={c.id}
                onClick={() => !isEditing && !isDeleting && onSelectConversation(c.id)}
                className={`group relative flex items-center justify-between px-3 py-2 rounded-xl text-xs cursor-pointer transition-all border ${
                  isActive
                    ? 'bg-blue-50/80 border-blue-200 text-blue-900 font-semibold shadow-2xs'
                    : 'bg-white hover:bg-slate-100/80 border-transparent text-slate-700'
                }`}
              >
                {isEditing ? (
                  <div className="flex items-center gap-1.5 w-full" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveRename(c.id, e as any);
                        if (e.key === 'Escape') setEditingId(null);
                      }}
                      autoFocus
                      className="flex-1 px-1.5 py-0.5 text-xs bg-white border border-blue-400 rounded focus:outline-hidden"
                    />
                    <button
                      type="button"
                      onClick={(e) => handleSaveRename(c.id, e)}
                      className="p-1 text-emerald-600 hover:text-emerald-700"
                      title="Save"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelRename}
                      className="p-1 text-slate-400 hover:text-slate-600"
                      title="Cancel"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : isDeleting ? (
                  <div className="flex items-center justify-between w-full" onClick={(e) => e.stopPropagation()}>
                    <span className="text-[11px] text-rose-600 font-medium">Delete chat?</span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={(e) => handleConfirmDelete(c.id, e)}
                        className="px-2 py-0.5 rounded bg-rose-600 text-white text-[10px] font-bold"
                      >
                        Yes
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeletingId(null);
                        }}
                        className="px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 text-[10px]"
                      >
                        No
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2 min-w-0 flex-1 pr-1">
                      <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                      <span className="truncate">{c.title}</span>
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={(e) => handleStartRename(c, e)}
                        className="p-1 text-slate-400 hover:text-blue-600 rounded transition-colors"
                        title="Rename conversation"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeletingId(c.id);
                        }}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                        title="Delete conversation"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Footer info banner */}
      <div className="p-2.5 border-t border-slate-200 bg-white/80 text-[10px] text-slate-500 flex items-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-blue-600 shrink-0" />
        <span>Grounding enabled on College Syllabus &amp; Regulations</span>
      </div>
    </div>
  );
};

export default ConversationList;
