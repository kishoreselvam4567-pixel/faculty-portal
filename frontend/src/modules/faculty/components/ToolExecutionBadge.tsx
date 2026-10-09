import React, { useState } from 'react';
import {
  Wrench,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
  Send,
} from 'lucide-react';
import { ToolCallExecution } from '../types/faculty.types';

interface ToolExecutionBadgeProps {
  tool: ToolCallExecution;
  onConfirm?: (toolName: string, args: Record<string, any>) => void;
}

export const ToolExecutionBadge: React.FC<ToolExecutionBadgeProps> = ({
  tool,
  onConfirm,
}) => {
  const [expanded, setExpanded] = useState(false);

  const getStatusIcon = () => {
    switch (tool.status) {
      case 'success':
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />;
      case 'failed':
        return <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />;
      case 'requires_confirmation':
        return <ShieldAlert className="w-3.5 h-3.5 text-amber-500 animate-pulse" />;
      default:
        return <Clock className="w-3.5 h-3.5 text-blue-500 animate-spin" />;
    }
  };

  const getStatusBadge = () => {
    switch (tool.status) {
      case 'success':
        return <span className="text-[9.5px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">Executed</span>;
      case 'failed':
        return <span className="text-[9.5px] font-semibold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">Failed</span>;
      case 'requires_confirmation':
        return <span className="text-[9.5px] font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">Confirmation Required</span>;
      default:
        return <span className="text-[9.5px] font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">Running...</span>;
    }
  };

  return (
    <div className="my-1.5 rounded-lg border border-slate-200 bg-slate-50/80 overflow-hidden text-xs transition-all">
      <div className="flex items-center justify-between px-2.5 py-1.5 gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <Wrench className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <span className="font-semibold text-slate-800 truncate">
            {tool.displayName || tool.name}
          </span>
          {getStatusBadge()}
        </div>

        <div className="flex items-center gap-1">
          {tool.status === 'requires_confirmation' && onConfirm && (
            <button
              type="button"
              onClick={() => onConfirm(tool.name, tool.args)}
              className="px-2 py-0.5 rounded bg-blue-600 hover:bg-blue-700 text-white font-semibold text-[10px] flex items-center gap-1 shadow-2xs"
            >
              <Send className="w-2.5 h-2.5" />
              Confirm Action
            </button>
          )}
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="p-1 text-slate-400 hover:text-slate-600 rounded transition-colors"
            title={expanded ? 'Collapse details' : 'Show details'}
          >
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {tool.confirmationPrompt && tool.status === 'requires_confirmation' && (
        <div className="px-2.5 py-1.5 bg-amber-50 border-t border-amber-200/80 text-[11px] text-amber-800 flex items-start gap-1.5">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">{tool.confirmationPrompt}</p>
            <p className="text-[10px] text-amber-700 mt-0.5">
              Click &quot;Confirm Action&quot; to authorize this operation.
            </p>
          </div>
        </div>
      )}

      {expanded && (
        <div className="px-3 py-2 border-t border-slate-200 bg-white space-y-1.5 font-mono text-[10.5px]">
          <div>
            <span className="text-slate-500 block mb-0.5 text-[9.5px] uppercase font-bold">Arguments:</span>
            <pre className="bg-slate-100 p-2 rounded text-slate-700 overflow-x-auto max-h-32">
              {JSON.stringify(tool.args, null, 2)}
            </pre>
          </div>
          {tool.result && (
            <div>
              <span className="text-slate-500 block mb-0.5 text-[9.5px] uppercase font-bold">Execution Result:</span>
              <pre className="bg-slate-100 p-2 rounded text-slate-700 overflow-x-auto max-h-40">
                {typeof tool.result === 'string' ? tool.result : JSON.stringify(tool.result, null, 2)}
              </pre>
            </div>
          )}
          {tool.error && (
            <div className="text-rose-600 font-sans text-xs">
              <span className="font-bold">Error:</span> {tool.error}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ToolExecutionBadge;
