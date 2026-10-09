import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Send,
  Square,
  RotateCw,
  MessageSquare,
  Bot,
  User,
  AlertCircle,
  HelpCircle,
  Calendar,
  ClipboardCheck,
  BookOpen,
  Mail,
  GraduationCap,
  PanelLeftClose,
  PanelLeftOpen,
  CheckCircle2,
} from 'lucide-react';
import { facultyApi } from '../api/facultyApi';
import {
  ChatMessage,
  ChatConversationSummary,
  ToolCallExecution,
} from '../types/faculty.types';
import { ChatMarkdown } from '../components/ChatMarkdown';
import { ToolExecutionBadge } from '../components/ToolExecutionBadge';
import { ChatSourcesDrawer } from '../components/ChatSourcesDrawer';
import { ConversationList } from '../components/ConversationList';

const SUGGESTED_PROMPTS = [
  {
    category: 'Class Incharge & Classes',
    icon: GraduationCap,
    prompt: 'What are my assigned classes and my Class Incharge responsibilities?',
  },
  {
    category: 'Attendance & Schedule',
    icon: ClipboardCheck,
    prompt: "Show today's teaching schedule and any classes with pending attendance.",
  },
  {
    category: 'Tasks & Reminders',
    icon: Calendar,
    prompt: 'What are my pending academic tasks and reminders for this week?',
  },
  {
    category: 'Syllabus & Courses',
    icon: BookOpen,
    prompt: 'What are the syllabus topics and credit allocation for CS701 Cloud Computing?',
  },
  {
    category: 'Email & Communication',
    icon: Mail,
    prompt: 'Draft an email notice to B.Sc AI & ML students regarding tomorrow’s project review.',
  },
];

export const FacultyAssistantPage: React.FC = () => {
  const [conversations, setConversations] = useState<ChatConversationSummary[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [abortController, setAbortController] = useState<AbortController | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (activeConversationId) {
      loadMessages(activeConversationId);
    } else {
      setMessages([]);
    }
  }, [activeConversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const loadConversations = async () => {
    setLoadingHistory(true);
    try {
      const list = await facultyApi.getConversations();
      setConversations(list);
      if (list.length > 0 && !activeConversationId) {
        setActiveConversationId(list[0].id);
      }
    } catch (err: any) {
      console.warn('Could not load conversations from server:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      const msgList = await facultyApi.getConversationMessages(conversationId);
      setMessages(msgList);
    } catch (err: any) {
      console.warn('Could not load conversation messages:', err);
    }
  };

  const handleNewConversation = async () => {
    try {
      const newConv = await facultyApi.createConversation('New Conversation');
      setConversations((prev) => [newConv, ...prev]);
      setActiveConversationId(newConv.id);
      setMessages([]);
      setErrorMessage(null);
      if (inputRef.current) inputRef.current.focus();
    } catch (err: any) {
      console.error('Failed to create new conversation:', err);
    }
  };

  const handleRenameConversation = async (id: string, newTitle: string) => {
    try {
      const updated = await facultyApi.renameConversation(id, newTitle);
      setConversations((prev) =>
        prev.map((c) => (c.id === id ? { ...c, title: updated.title } : c))
      );
    } catch (err: any) {
      console.error('Failed to rename conversation:', err);
    }
  };

  const handleDeleteConversation = async (id: string) => {
    try {
      await facultyApi.deleteConversation(id);
      setConversations((prev) => prev.filter((c) => c.id !== id));
      if (activeConversationId === id) {
        const remaining = conversations.filter((c) => c.id !== id);
        setActiveConversationId(remaining.length > 0 ? remaining[0].id : null);
      }
    } catch (err: any) {
      console.error('Failed to delete conversation:', err);
    }
  };

  const handleSendMessage = async (textToSend?: string, confirmationPayload?: { toolName: string; args: Record<string, any>; confirmed: boolean }) => {
    const messageContent = (textToSend !== undefined ? textToSend : inputText).trim();
    if (!messageContent && !confirmationPayload) return;

    setErrorMessage(null);
    setInputText('');

    let currentConvId = activeConversationId;
    if (!currentConvId) {
      try {
        const newConv = await facultyApi.createConversation(
          messageContent.slice(0, 36) || 'New Conversation'
        );
        setConversations((prev) => [newConv, ...prev]);
        setActiveConversationId(newConv.id);
        currentConvId = newConv.id;
      } catch (err: any) {
        setErrorMessage('Failed to initiate conversation session.');
        return;
      }
    }

    const optimisticUserMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      conversationId: currentConvId || 'temp',
      role: 'user',
      content: confirmationPayload
        ? `[Confirmed Action: ${confirmationPayload.toolName}]`
        : messageContent,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimisticUserMsg]);
    setLoading(true);

    const controller = new AbortController();
    setAbortController(controller);

    try {
      const response = await facultyApi.sendChatMessage({
        message: messageContent,
        conversationId: currentConvId || undefined,
        actionConfirmation: confirmationPayload,
      });

      if (response && response.message) {
        setMessages((prev) => [...prev, response.message]);

        // Update conversation title if this was the first message
        setConversations((prev) =>
          prev.map((c) => {
            if (c.id === currentConvId && (c.title === 'New Conversation' || !c.lastMessageSnippet)) {
              return {
                ...c,
                title: messageContent.slice(0, 36),
                lastMessageSnippet: response.message.content.slice(0, 50),
              };
            }
            return c;
          })
        );
      }
    } catch (err: any) {
      if (err.name === 'AbortError' || err.message === 'canceled') {
        setErrorMessage('Generation stopped by user.');
      } else {
        const errDetail = err.response?.data?.error || err.message || 'AI request failed. Please check network connection and try again.';
        setErrorMessage(errDetail);
        const errorAssistantMsg: ChatMessage = {
          id: `err-${Date.now()}`,
          conversationId: currentConvId || 'temp',
          role: 'assistant',
          content: `⚠️ **Unable to complete request:** ${errDetail}`,
          status: 'error',
          error: errDetail,
          createdAt: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, errorAssistantMsg]);
      }
    } finally {
      setLoading(false);
      setAbortController(null);
    }
  };

  const handleStopGeneration = () => {
    if (abortController) {
      abortController.abort();
      setAbortController(null);
      setLoading(false);
    }
  };

  const handleRetryLastMessage = () => {
    const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user');
    if (lastUserMsg) {
      handleSendMessage(lastUserMsg.content);
    }
  };

  const handleToolConfirmation = (toolName: string, args: Record<string, any>) => {
    handleSendMessage(`Confirm execution of ${toolName}`, {
      toolName,
      args,
      confirmed: true,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-5.5rem)] bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden relative">
      {/* Top Banner / Assistant Bar */}
      <div className="px-4 py-3 border-b border-slate-200 bg-gradient-to-r from-[#0B132B] via-[#15203D] to-[#1E293B] text-white flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 transition-colors"
            title={sidebarOpen ? 'Hide conversation history' : 'Show conversation history'}
          >
            {sidebarOpen ? (
              <PanelLeftClose className="w-4 h-4" />
            ) : (
              <PanelLeftOpen className="w-4 h-4" />
            )}
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xs sm:text-sm font-bold tracking-tight text-white leading-tight">
                  Faculty AI Assistant
                </h1>
                <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30 tracking-wider">
                  PRODUCTION AI
                </span>
              </div>
              <p className="text-[10px] text-slate-300">
                Grounded academic intelligence, class rosters, attendance insights, and daily reminders
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-medium bg-emerald-950/60 border border-emerald-800/80 px-2 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Active
          </span>
        </div>
      </div>

      {/* Main Split Layout: Sidebar History + Chat Window */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Sidebar History Drawer */}
        {sidebarOpen && (
          <ConversationList
            conversations={conversations}
            activeConversationId={activeConversationId}
            onSelectConversation={(id) => setActiveConversationId(id)}
            onNewConversation={handleNewConversation}
            onRenameConversation={handleRenameConversation}
            onDeleteConversation={handleDeleteConversation}
            loading={loadingHistory}
          />
        )}

        {/* Chat Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-slate-50/50">
          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-4">
            {messages.length === 0 ? (
              /* Empty state with suggested prompt chips */
              <div className="h-full flex flex-col justify-center items-center max-w-2xl mx-auto text-center px-4 py-8">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center mb-3 shadow-xs">
                  <Bot className="w-6 h-6" />
                </div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                  How can I assist your academic work today?
                </h2>
                <p className="text-xs text-slate-500 max-w-md mt-1 mb-6">
                  Query class rosters, review student attendance summaries, manage daily reminders, inspect syllabus topics, or prepare draft communications.
                </p>

                {/* Suggested Prompts Grid */}
                <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
                  {SUGGESTED_PROMPTS.map((item, idx) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSendMessage(item.prompt)}
                        className="p-3 rounded-xl bg-white border border-slate-200 hover:border-blue-400 hover:shadow-xs transition-all text-left flex flex-col justify-between group"
                      >
                        <div className="flex items-center gap-2 mb-1.5 text-slate-500 group-hover:text-blue-600 transition-colors">
                          <Icon className="w-3.5 h-3.5 shrink-0" />
                          <span className="text-[10px] font-bold uppercase tracking-wider">
                            {item.category}
                          </span>
                        </div>
                        <p className="text-xs text-slate-700 font-medium group-hover:text-slate-900 leading-snug">
                          {item.prompt}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* Message Thread */
              messages.map((msg) => {
                const isUser = msg.role === 'user';
                return (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-3 max-w-4xl ${
                      isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'
                    }`}
                  >
                    {/* Avatar */}
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 shadow-2xs ${
                        isUser
                          ? 'bg-blue-600 text-white'
                          : 'bg-[#0B132B] text-blue-400 border border-slate-700'
                      }`}
                    >
                      {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                    </div>

                    {/* Bubble */}
                    <div
                      className={`rounded-2xl px-4 py-3 text-xs sm:text-sm max-w-[88%] sm:max-w-[80%] shadow-2xs border ${
                        isUser
                          ? 'bg-blue-600 text-white border-blue-600 rounded-tr-xs'
                          : 'bg-white text-slate-800 border-slate-200 rounded-tl-xs'
                      }`}
                    >
                      {/* Render Tool Executions if present */}
                      {!isUser && msg.toolCalls && msg.toolCalls.length > 0 && (
                        <div className="mb-2 space-y-1">
                          {msg.toolCalls.map((tool) => (
                            <ToolExecutionBadge
                              key={tool.id}
                              tool={tool}
                              onConfirm={handleToolConfirmation}
                            />
                          ))}
                        </div>
                      )}

                      {/* Main Message Content */}
                      {isUser ? (
                        <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                      ) : (
                        <ChatMarkdown content={msg.content} />
                      )}

                      {/* Render Sources Citation Drawer if present */}
                      {!isUser && msg.sources && msg.sources.length > 0 && (
                        <ChatSourcesDrawer sources={msg.sources} />
                      )}

                      {/* Timestamp & Status */}
                      <div
                        className={`text-[9.5px] mt-1.5 flex items-center justify-end gap-1 ${
                          isUser ? 'text-blue-100' : 'text-slate-400'
                        }`}
                      >
                        <span>
                          {new Date(msg.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}

            {/* Loading / Typing indicator */}
            {loading && (
              <div className="flex items-start gap-3 max-w-xl mr-auto">
                <div className="w-7 h-7 rounded-lg bg-[#0B132B] text-blue-400 border border-slate-700 flex items-center justify-center shrink-0">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-xs px-4 py-3 shadow-2xs">
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <span className="font-semibold text-blue-600">Assistant is analyzing...</span>
                    <div className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce" />
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce [animation-delay:0.2s]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Error Banner with Retry */}
          {errorMessage && (
            <div className="mx-4 mb-2 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between gap-2 shadow-2xs">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
              <button
                type="button"
                onClick={handleRetryLastMessage}
                className="px-2 py-1 rounded bg-rose-600 hover:bg-rose-700 text-white font-semibold text-[10px] flex items-center gap-1 shrink-0"
              >
                <RotateCw className="w-3 h-3" />
                Retry
              </button>
            </div>
          )}

          {/* Bottom Chat Input Bar */}
          <div className="p-3 sm:p-4 bg-white border-t border-slate-200">
            <div className="max-w-4xl mx-auto flex flex-col gap-2">
              <div className="relative flex items-end gap-2 bg-slate-50 border border-slate-300 rounded-2xl p-2 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                <textarea
                  ref={inputRef}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask a question about classes, students, tasks, syllabus, or draft an email... (Enter to send, Shift+Enter for newline)"
                  rows={2}
                  disabled={loading}
                  className="w-full resize-none bg-transparent border-0 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden p-1 leading-normal"
                />

                <div className="flex items-center gap-1.5 shrink-0">
                  {loading ? (
                    <button
                      type="button"
                      onClick={handleStopGeneration}
                      className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs flex items-center gap-1 shadow-2xs transition-colors"
                      title="Stop generation"
                    >
                      <Square className="w-3 h-3 text-rose-400 fill-rose-400" />
                      <span>Stop</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSendMessage()}
                      disabled={!inputText.trim()}
                      className={`p-2 rounded-xl text-white transition-all shadow-xs ${
                        inputText.trim()
                          ? 'bg-blue-600 hover:bg-blue-700 cursor-pointer'
                          : 'bg-slate-300 cursor-not-allowed text-slate-400'
                      }`}
                      title="Send message"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Input Footer Note */}
              <div className="flex items-center justify-between text-[10px] text-slate-400 px-1">
                <span>
                  Press <kbd className="px-1 py-0.5 rounded bg-slate-100 text-slate-600 font-mono">Enter</kbd> to send,{' '}
                  <kbd className="px-1 py-0.5 rounded bg-slate-100 text-slate-600 font-mono">Shift+Enter</kbd> for new line
                </span>
                <span>Protected by Faculty Scoped Authorization</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacultyAssistantPage;
