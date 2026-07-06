import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Search,
  Send,
  MoreHorizontal,
  Check,
  CheckCheck,
  Shield,
  Archive,
  ArchiveRestore,
  Loader2,
  ChevronLeft,
  MessageSquare,
  Trash2,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
// import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/context/AuthContext';
import {
  listConversations,
  getConversation,
  listMessages,
  sendMessage,
  deleteMessage,
  archiveConversation,
  unarchiveConversation,
} from '@/lib/messaging';
import type { Conversation, Message } from '@/types/messaging';
import { toast } from 'sonner';
import { getApiUrl } from '@/lib/api';

// ─── helpers ─────────────────────────────────────────────────────────────────

function formatTime(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60_000);
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatMessageTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function partyInitials(conv: Conversation): string {
  const { first_name, last_name } = conv.other_party;
  return `${first_name?.[0] ?? ''}${last_name?.[0] ?? ''}`.toUpperCase() || '?';
}

function resolveAvatar(url: string | null): string {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  const base = getApiUrl('/').replace(/\/$/, '');
  return `${base}${url.startsWith('/') ? url : `/${url}`}`;
}

// ─── component ────────────────────────────────────────────────────────────────

interface MessagesProps {
  isVerified: boolean;
  onVerificationRequired: () => void;
  setBuySubView: (view: 'browse') => void;
  /** If provided, open this conversation immediately on mount */
  initialConversationId?: string | null;
}

export function Messages({
  isVerified,
  onVerificationRequired,
  setBuySubView,
  initialConversationId,
}: MessagesProps) {
  const { accessToken } = useAuth();

  // ── inbox state ────────────────────────────────────────────────────────────
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [inboxLoading, setInboxLoading] = useState(true);
  const [showArchived, setShowArchived] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // ── thread state ───────────────────────────────────────────────────────────
  const [selectedConvId, setSelectedConvId] = useState<string | null>(
    initialConversationId ?? null
  );
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [threadLoading, setThreadLoading] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);

  // ── delete-message state ───────────────────────────────────────────────────
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deletingMsgId, setDeletingMsgId] = useState<string | null>(null);
  const [hoveredMsgId, setHoveredMsgId] = useState<string | null>(null);

  // ── mobile layout ──────────────────────────────────────────────────────────
  // On small screens we show either the list OR the thread, not both.
  const [mobileShowThread, setMobileShowThread] = useState(
    !!initialConversationId
  );

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // ── load inbox ─────────────────────────────────────────────────────────────
  const loadInbox = useCallback(async () => {
    if (!accessToken) return;
    try {
      const data = await listConversations(accessToken, showArchived);
      setConversations(data);
    } catch (err: any) {
      console.error('Failed to load conversations:', err);
    } finally {
      setInboxLoading(false);
    }
  }, [accessToken, showArchived]);

  useEffect(() => {
    setInboxLoading(true);
    loadInbox();
  }, [loadInbox]);

  // ── auto-select initial conversation ──────────────────────────────────────
  useEffect(() => {
    if (initialConversationId) {
      openConversation(initialConversationId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialConversationId]);

  // ── open a conversation thread ─────────────────────────────────────────────
  const openConversation = useCallback(
    async (id: string) => {
      if (!accessToken) return;
      setSelectedConvId(id);
      setMobileShowThread(true);
      setThreadLoading(true);
      setMessages([]);
      try {
        const [conv, msgs] = await Promise.all([
          getConversation(accessToken, id),
          listMessages(accessToken, id),
        ]);
        setSelectedConv(conv);
        setMessages(msgs);
        // Refresh unread count in inbox
        setConversations((prev) =>
          prev.map((c) => (c.id === id ? { ...c, unread_count: 0 } : c))
        );
      } catch (err: any) {
        toast.error(err.message ?? 'Could not open conversation.');
        setSelectedConvId(null);
        setMobileShowThread(false);
      } finally {
        setThreadLoading(false);
      }
    },
    [accessToken]
  );

  // ── scroll to bottom when messages change ──────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ── focus input when thread opens ─────────────────────────────────────────
  useEffect(() => {
    if (selectedConvId && !threadLoading) {
      inputRef.current?.focus();
    }
  }, [selectedConvId, threadLoading]);

  // ── polling: refresh messages every 10s while a thread is open ────────────
  useEffect(() => {
    if (!selectedConvId || !accessToken) return;
    const interval = setInterval(async () => {
      try {
        const msgs = await listMessages(accessToken, selectedConvId);
        setMessages(msgs);
      } catch {
        // silently ignore polling errors
      }
    }, 10_000);
    return () => clearInterval(interval);
  }, [selectedConvId, accessToken]);

  // ── send a message ─────────────────────────────────────────────────────────
  const handleSend = async () => {
    if (!newMessage.trim() || !selectedConvId || !accessToken || sending) return;
    const body = newMessage.trim();
    setNewMessage('');
    setSending(true);
    try {
      const msg = await sendMessage(accessToken, selectedConvId, body);
      setMessages((prev) => [...prev, msg]);
      // Update last preview in inbox
      setConversations((prev) =>
        prev.map((c) =>
          c.id === selectedConvId
            ? {
              ...c,
              last_message_preview: body,
              last_message_at: msg.created_at,
            }
            : c
        )
      );
    } catch (err: any) {
      toast.error(err.message ?? 'Failed to send message.');
      setNewMessage(body); // restore so user can retry
    } finally {
      setSending(false);
    }
  };

  // ── delete a single message ────────────────────────────────────────────────
  const handleDeleteMessage = async (msgId: string) => {
    if (!accessToken || !selectedConvId || deletingMsgId) return;
    setDeletingMsgId(msgId);
    setConfirmDeleteId(null);
    // Optimistic removal
    setMessages((prev) => prev.filter((m) => m.id !== msgId));
    try {
      await deleteMessage(accessToken, selectedConvId, msgId);
    } catch (err: any) {
      // Rollback on failure by re-fetching
      toast.error(err.message ?? 'Could not delete message.');
      try {
        const msgs = await listMessages(accessToken, selectedConvId);
        setMessages(msgs);
      } catch {
        // ignore
      }
    } finally {
      setDeletingMsgId(null);
    }
  };

  // ── archive / unarchive ────────────────────────────────────────────────────
  const handleArchiveToggle = async (conv: Conversation) => {
    if (!accessToken) return;
    const wasArchived = conv.is_archived;
    try {
      if (wasArchived) {
        await unarchiveConversation(accessToken, conv.id);
        toast.success('Conversation unarchived.');
      } else {
        await archiveConversation(accessToken, conv.id);
        toast.success('Conversation archived.');
      }
      // Reload inbox to reflect change
      await loadInbox();
      // If the archived/unarchived conv was selected, close it
      if (selectedConvId === conv.id) {
        setSelectedConvId(null);
        setSelectedConv(null);
        setMessages([]);
        setMobileShowThread(false);
      }
    } catch (err: any) {
      toast.error(err.message ?? 'Could not update archive status.');
    }
  };

  // ── filtered conversations ─────────────────────────────────────────────────
  const filteredConversations = conversations.filter((c) => {
    const q = searchQuery.toLowerCase();
    if (!q) return true;
    const name = `${c.other_party.first_name} ${c.other_party.last_name}`.toLowerCase();
    const title = c.listing.title.toLowerCase();
    return name.includes(q) || title.includes(q);
  });

  // ─── Verification gate ───────────────────────────────────────────────────
  if (!isVerified) {
    return (
      <div className="flex flex-col items-center justify-center w-full p-8">
        <div className="w-20 h-20 rounded-2xl bg-[#1a1a1a] flex items-center justify-center mb-6">
          <MessageSquare className="w-10 h-10 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-3">Verification Required</h2>
        <p className="text-center max-w-md mb-6 text-[#959595]">
          To message sellers and ensure secure transactions, please verify your account first.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onVerificationRequired}
            className="cursor-pointer px-6 py-3 rounded-xl bg-[#20e0b7] text-black hover:bg-primary/90 font-medium transition-all duration-200"
          >
            Verify Now
          </button>
          <button
            onClick={() => setBuySubView('browse')}
            className="cursor-pointer px-6 py-3 rounded-xl bg-[#1a1a1a] hover:bg-secondary/80 text-foreground font-medium transition-all duration-200"
          >
            Back to Browse
          </button>
        </div>
      </div>
    );
  }

  // ─── Main layout ──────────────────────────────────────────────────────────
  return (
    <div className="flex h-full min-h-0 overflow-hidden">
      {/* ── Conversation Sidebar ───────────────────────────────────────────── */}
      <div
        className={`
          ${mobileShowThread ? 'hidden md:flex' : 'flex'}
          w-full md:w-[340px] lg:w-[380px] border-r border-white/[0.06]
          flex-col bg-[#0a0a0a] overflow-hidden flex-shrink-0
        `}
      >
        {/* Header */}
        <div className="p-5 border-b border-white/[0.06] flex-shrink-0 bg-[#0a0a0a]">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-foreground">Messages</h1>
            <button
              onClick={() => setShowArchived((p) => !p)}
              className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${showArchived
                  ? 'bg-primary/20 text-primary'
                  : 'bg-[#1a1a1a] text-muted-foreground hover:text-foreground'
                }`}
            >
              {showArchived ? 'Active' : 'Archived'}
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10 rounded-xl bg-[#121212] border-[#121212] focus:border-[#22debc]/40 focus:ring-[#22debc]/20"
            />
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden bg-[#0a0a0a]">
          {inboxLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 text-primary animate-spin" />
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
              <div className="w-14 h-14 rounded-2xl bg-[#1a1a1a] flex items-center justify-center mb-4">
                <MessageSquare className="w-7 h-7 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">
                {searchQuery
                  ? 'No conversations match your search.'
                  : showArchived
                    ? 'No archived conversations.'
                    : 'No conversations yet. Message a seller to get started!'}
              </p>
            </div>
          ) : (
            <div className="p-2 space-y-1">
              {filteredConversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => openConversation(conv.id)}
                  className={`w-full flex items-start gap-3 p-3 rounded-xl transition-all duration-200 text-left group ${selectedConvId === conv.id
                      ? 'bg-[#1a1a1a]'
                      : 'hover:bg-[#22debc]/5 cursor-pointer'
                    }`}
                >
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <Avatar className="w-12 h-12">
                      <AvatarImage
                        src={resolveAvatar(conv.other_party.avatar)}
                        alt={conv.other_party.first_name}
                      />
                      <AvatarFallback className="bg-[#1a1a1a] text-foreground text-sm font-semibold">
                        {partyInitials(conv)}
                      </AvatarFallback>
                    </Avatar>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium text-foreground truncate text-sm">
                        {conv.other_party.first_name} {conv.other_party.last_name}
                      </span>
                      <span className="text-xs text-[#a0a0a0] flex-shrink-0">
                        {formatTime(conv.last_message_at)}
                      </span>
                    </div>
                    <p className="text-xs text-[#a0a0a0] truncate mt-0.5">
                      {conv.listing.title}
                    </p>
                    <p className="text-sm text-[#a0a0a0] truncate mt-1">
                      {conv.last_message_preview ?? 'No messages yet'}
                    </p>
                  </div>

                  {/* Unread badge */}
                  {conv.unread_count > 0 && (
                    <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center flex-shrink-0 mt-1 font-semibold">
                      {conv.unread_count > 9 ? '9+' : conv.unread_count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Thread / Empty State ──────────────────────────────────────────────── */}
      {selectedConvId && mobileShowThread ? (
        <div
          className={`
            ${mobileShowThread ? 'flex' : 'hidden md:flex'}
            flex-1 flex-col bg-background overflow-hidden
          `}
        >
          {threadLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
          ) : selectedConv ? (
            <>
              {/* Chat Header */}
              <div className="h-16 px-4 border-b border-white/[0.06] flex items-center justify-between bg-[#121212] flex-shrink-0">
                <div className="flex items-center gap-3">
                  {/* Mobile back button */}
                  <button
                    className="md:hidden text-muted-foreground hover:text-foreground mr-1"
                    onClick={() => {
                      setMobileShowThread(false);
                      setSelectedConvId(null);
                    }}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  <Avatar className="w-9 h-9 flex-shrink-0">
                    <AvatarImage
                      src={resolveAvatar(selectedConv.other_party.avatar)}
                      alt={selectedConv.other_party.first_name}
                    />
                    <AvatarFallback className="bg-[#1a1a1a] text-foreground text-xs font-semibold">
                      {partyInitials(selectedConv)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-foreground text-sm leading-tight">
                      {selectedConv.other_party.first_name}{' '}
                      {selectedConv.other_party.last_name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate max-w-[180px]">
                      {selectedConv.listing.title}
                    </p>
                  </div>
                </div>

                {/* Listing mini-card */}
                <div className="hidden md:flex items-center gap-3 px-3 py-1.5 rounded-xl bg-[#1a1a1a] mr-2">
                  {selectedConv.listing.thumbnail && (
                    <img
                      src={resolveAvatar(selectedConv.listing.thumbnail)}
                      alt={selectedConv.listing.title}
                      className="w-8 h-8 rounded-lg object-cover"
                    />
                  )}
                  <div>
                    <p className="text-xs font-medium text-foreground truncate max-w-[120px]">
                      {selectedConv.listing.title}
                    </p>
                    <p className="text-xs text-primary">
                      RWF{' '}
                      {Number(selectedConv.listing.price).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-9 h-9 rounded-xl hover:bg-[#22debc]/10"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-[#121212] border-white/[0.08]">
                    <DropdownMenuItem
                      onClick={() => handleArchiveToggle(selectedConv)}
                      className="cursor-pointer hover:bg-[#1a1a1a] gap-2"
                    >
                      {selectedConv.is_archived ? (
                        <>
                          <ArchiveRestore className="w-4 h-4" />
                          Unarchive
                        </>
                      ) : (
                        <>
                          <Archive className="w-4 h-4" />
                          Archive
                        </>
                      )}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto overflow-x-hidden">
                <div className="p-5 space-y-4">
                  {/* Listing context banner */}
                  <div className="flex justify-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#1a1a1a] border border-white/[0.06] text-xs text-muted-foreground">
                      <Shield className="w-3 h-3 text-primary flex-shrink-0" />
                      Conversation about{' '}
                      <span className="font-medium text-foreground truncate max-w-[160px]">
                        {selectedConv.listing.title}
                      </span>
                    </div>
                  </div>

                  {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <p className="text-sm text-muted-foreground">
                        No messages yet. Say hello!
                      </p>
                    </div>
                  ) : (
                    messages.map((msg, index) => {
                      const showAvatar =
                        index === 0 ||
                        messages[index - 1].is_mine !== msg.is_mine;
                      const isConfirming = confirmDeleteId === msg.id;
                      const isDeleting = deletingMsgId === msg.id;
                      const isHovered = hoveredMsgId === msg.id;
                      return (
                        <div
                          key={msg.id}
                          onMouseEnter={() => msg.is_mine && setHoveredMsgId(msg.id)}
                          onMouseLeave={() => setHoveredMsgId(null)}
                        >
                          {/* Inline delete-confirmation bar */}
                          {isConfirming && (
                            <div className="flex justify-end items-center gap-2 mb-1.5 pr-1">
                              <span className="text-xs text-[#a0a0a0]">Delete this message?</span>
                              <button
                                onClick={() => setConfirmDeleteId(null)}
                                className="text-xs px-2.5 py-1 rounded-lg bg-[#1a1a1a] text-muted-foreground hover:text-foreground transition-colors"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleDeleteMessage(msg.id)}
                                className="text-xs px-2.5 py-1 rounded-lg bg-red-500/15 text-red-400 hover:bg-red-500/25 font-medium transition-colors"
                              >
                                Delete
                              </button>
                            </div>
                          )}

                          <div
                            className={`flex ${
                              msg.is_mine ? 'justify-end' : 'justify-start'
                            } items-end gap-2`}
                          >
                            {!msg.is_mine && showAvatar && (
                              <Avatar className="w-7 h-7 flex-shrink-0">
                                <AvatarImage src={resolveAvatar(msg.sender.avatar)} />
                                <AvatarFallback className="text-[10px] bg-[#1a1a1a]">
                                  {`${msg.sender.first_name?.[0] ?? ''}${
                                    msg.sender.last_name?.[0] ?? ''
                                  }`.toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                            )}
                            {!msg.is_mine && !showAvatar && <div className="w-7" />}

                            {/* Trash button – only for own messages, shown on hover */}
                            {msg.is_mine && (
                              <button
                                onClick={() =>
                                  setConfirmDeleteId(isConfirming ? null : msg.id)
                                }
                                disabled={!!isDeleting}
                                style={{ opacity: isHovered || isConfirming || isDeleting ? 1 : 0 }}
                                className="transition-opacity duration-150 p-1.5 rounded-lg hover:bg-red-500/15 text-[#777] hover:text-red-400 flex-shrink-0 self-center"
                                title="Delete message"
                              >
                                {isDeleting ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <Trash2 className="w-3.5 h-3.5" />
                                )}
                              </button>
                            )}

                            <div
                              className={`max-w-[70%] px-4 py-2.5 rounded-2xl ${
                                msg.is_mine
                                  ? 'bg-[#20e0bb] text-black rounded-br-md'
                                  : 'bg-[#1a1a1a] text-foreground rounded-bl-md'
                              } ${isDeleting ? 'opacity-40' : ''} transition-opacity`}
                            >
                              <p className="text-sm whitespace-pre-wrap break-words">
                                {msg.body}
                              </p>
                              <div
                                className={`flex items-center gap-1 mt-1 ${
                                  msg.is_mine ? 'justify-end' : ''
                                }`}
                              >
                                <span
                                  className={`text-[10px] ${
                                    msg.is_mine ? 'text-black/60' : 'text-muted-foreground'
                                  }`}
                                >
                                  {formatMessageTime(msg.created_at)}
                                </span>
                                {msg.is_mine && (
                                  <span className="text-black/60">
                                    {msg.read_at ? (
                                      <CheckCheck className="w-3 h-3" />
                                    ) : (
                                      <Check className="w-3 h-3 opacity-50" />
                                    )}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Input Area */}
              <div className="p-4 border-t border-white/[0.06] bg-[#121212] flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="flex-1 relative">
                    <Input
                      ref={inputRef}
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSend();
                        }
                      }}
                      placeholder="Type a message..."
                      className="h-11 pl-4 pr-4 rounded-xl bg-[#1a1a1a] border-[#1a1a1a] focus:border-[#22debc]/40 focus:ring-[#22debc]/20"
                      disabled={sending}
                    />
                  </div>
                  <Button
                    onClick={handleSend}
                    size="icon"
                    disabled={!newMessage.trim() || sending}
                    className="w-11 h-11 rounded-xl bg-primary hover:bg-primary/90 disabled:opacity-50 flex-shrink-0"
                  >
                    {sending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            </>
          ) : null}
        </div>
      ) : (
        /* Empty state – only visible on md+ when no conversation is selected */
        <div className="hidden md:flex flex-1 flex-col items-center justify-center bg-background">
          <div className="text-center">
            <div className="w-20 h-20 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Select a conversation
            </h3>
            <p className="text-sm text-[#8f8f8f]">
              Choose a conversation from the list to start messaging
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
