import React from 'react';
import { BookOpen, ExternalLink, FileText, CheckCircle2 } from 'lucide-react';
import { KnowledgeSourceCitation } from '../types/faculty.types';

interface ChatSourcesDrawerProps {
  sources: KnowledgeSourceCitation[];
}

export const ChatSourcesDrawer: React.FC<ChatSourcesDrawerProps> = ({ sources }) => {
  if (!sources || sources.length === 0) return null;

  return (
    <div className="mt-2.5 pt-2 border-t border-slate-200/80">
      <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700 mb-1.5">
        <BookOpen className="w-3.5 h-3.5 text-blue-600" />
        <span>Referenced Institutional Sources ({sources.length})</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {sources.map((src, idx) => (
          <div
            key={src.id || idx}
            className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-left hover:bg-slate-100/70 transition-colors"
          >
            <div className="flex items-center justify-between gap-1 mb-1">
              <span className="font-semibold text-xs text-slate-800 truncate flex items-center gap-1">
                <FileText className="w-3 h-3 text-slate-500 shrink-0" />
                {src.title || src.documentName}
              </span>
              <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-blue-100/70 text-blue-800 shrink-0">
                {src.category || 'ACADEMIC'}
              </span>
            </div>
            <p className="text-[11px] text-slate-600 line-clamp-2 italic leading-relaxed">
              &ldquo;{src.snippet}&rdquo;
            </p>
            {src.score && (
              <div className="mt-1 flex items-center justify-between text-[9.5px] text-slate-500">
                <span className="truncate text-slate-500 font-mono">{src.documentName}</span>
                <span className="font-semibold text-emerald-600">
                  {Math.round(src.score * 100)}% match
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChatSourcesDrawer;
