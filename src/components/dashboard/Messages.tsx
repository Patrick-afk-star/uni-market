import { useState, useRef, useEffect } from 'react';
import gsap  from 'gsap';
import { Search, Send, MoreHorizontal, Phone, Image as ImageIcon, Smile, Check, CheckCheck, Paperclip, Star } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
// import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from './ui/scroll-area';

interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
  attachments?: { type: 'image'; url: string }[];
}

interface Conversation {
  id: string;
  user: {
    name: string;
    avatar: string;
    isOnline: boolean;
    isVerified: boolean;
  };
  lastMessage: string;
  timestamp: string;
  unread: number;
  itemTitle: string;
  itemPrice: string;
  itemImage: string;
}

const conversations: Conversation[] = [
  {
    id: '1',
    user: { name: 'Sarah M.', avatar: '/avatar_student.jpg', isOnline: true, isVerified: true },
    lastMessage: 'Is the laptop still available?',
    timestamp: '2m ago',
    unread: 2,
    itemTitle: 'MacBook Pro 2020 M1',
    itemPrice: 'RWF 450,000',
    itemImage: '/product_laptop.jpg',
  },
  {
    id: '2',
    user: { name: 'David K.', avatar: '/avatar_student.jpg', isOnline: false, isVerified: true },
    lastMessage: 'Would you take 20,000 for the textbook?',
    timestamp: '1h ago',
    unread: 0,
    itemTitle: 'Calculus Early Transcendentals',
    itemPrice: 'RWF 28,000',
    itemImage: '/product_textbook.jpg',
  },
  {
    id: '3',
    user: { name: 'Marie Claire', avatar: '/avatar_student.jpg', isOnline: true, isVerified: true },
    lastMessage: 'Can we meet tomorrow at 3pm?',
    timestamp: '3h ago',
    unread: 1,
    itemTitle: 'Sony WH-1000XM4 Headphones',
    itemPrice: 'RWF 85,000',
    itemImage: '/product_headphones.jpg',
  },
  {
    id: '4',
    user: { name: 'Jean Paul', avatar: '/avatar_student.jpg', isOnline: false, isVerified: false },
    lastMessage: 'Thanks for the quick response!',
    timestamp: '1d ago',
    unread: 0,
    itemTitle: 'Minimal LED Desk Lamp',
    itemPrice: 'RWF 15,000',
    itemImage: '/product_lamp.jpg',
  },
];

const messagesData: Record<string, Message[]> = {
  '1': [
    { id: '1', senderId: 'them', text: 'Hi! Is the laptop still available?', timestamp: '2:30 PM', status: 'read' },
    { id: '2', senderId: 'me', text: 'Yes, it is! Are you interested?', timestamp: '2:32 PM', status: 'read' },
    { id: '3', senderId: 'them', text: 'Great! What\'s the battery health like?', timestamp: '2:35 PM', status: 'read' },
    { id: '4', senderId: 'me', text: 'Battery health is at 95%. I\'ve only had it for about a year.', timestamp: '2:38 PM', status: 'read' },
    { id: '5', senderId: 'them', text: 'That sounds good. Would you be willing to negotiate on the price?', timestamp: '2:40 PM', status: 'delivered' },
  ],
  '2': [
    { id: '1', senderId: 'them', text: 'Hey, I\'m interested in the textbook', timestamp: '10:15 AM', status: 'read' },
    { id: '2', senderId: 'me', text: 'Hi! It\'s still available', timestamp: '10:20 AM', status: 'read' },
    { id: '3', senderId: 'them', text: 'Would you take 20,000 for it?', timestamp: '10:22 AM', status: 'read' },
  ],
};

export function Messages({ isVerified, onVerificationRequired, setBuySubView }: { isVerified: boolean; onVerificationRequired: () => void; setBuySubView: (view: 'browse') => void }) {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(conversations[0]);
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>(messagesData['1'] || []);
  const [searchQuery, setSearchQuery] = useState('');
  const titleRef = useRef<HTMLHeadingElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (titleRef.current) {
        gsap.fromTo(
          titleRef.current,
          { opacity: 0, y: 18 },
          { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
        );
      }

      if (sidebarRef.current) {
        const items = sidebarRef.current.querySelectorAll('.conversation-item');
        gsap.fromTo(
          items,
          { opacity: 0, x: -20 },
          { opacity: 1, x: 0, duration: 0.4, stagger: 0.05, ease: 'power2.out', delay: 0.2 }
        );
      }
    });

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      setMessages(messagesData[selectedConversation.id] || []);
    }
  }, [selectedConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (newMessage.trim()) {
      const newMsg: Message = {
        id: Date.now().toString(),
        senderId: 'me',
        text: newMessage,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'sent',
      };
      setMessages([...messages, newMsg]);
      setNewMessage('');

      // Simulate reply
      setTimeout(() => {
        const reply: Message = {
          id: (Date.now() + 1).toString(),
          senderId: 'them',
          text: 'Thanks for your message! I\'ll get back to you soon.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: 'read',
        };
        setMessages((prev) => [...prev, reply]);
      }, 2000);
    }
  };

  const filteredConversations = conversations.filter(
    (c) =>
      c.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.itemTitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full flex">
      {!isVerified ? (
        <div className="flex flex-col items-center justify-center w-full p-8">
          <div className="w-20 h-20 rounded-2xl bg-[#1a1a1a] flex items-center justify-center mb-6">
            <svg
              className="w-10 h-10 text-primary"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
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
      ) : (
        <>
          {/* Conversations Sidebar */}
          <div ref={sidebarRef} className="w-[360px] border-r border-white/[0.06] flex flex-col bg-[#121212]">
        {/* Header */}
        <div className="p-5 border-b border-white/[0.06]">
          <h1 ref={titleRef} className="text-xl font-bold text-foreground mb-4">
            Messages
          </h1>
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
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {filteredConversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setSelectedConversation(conv)}
                className={`conversation-item w-full flex items-start gap-3 p-3 rounded-xl transition-all duration-200 text-left ${
                  selectedConversation?.id === conv.id
                    ? 'bg-[#1a1a1a]'
                    : 'hover:bg-[#22debc]/5'
                }`}
              >
                <div className="relative flex-shrink-0">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={conv.user.avatar} alt={conv.user.name} />
                    <AvatarFallback>{conv.user.name[0]}</AvatarFallback>
                  </Avatar>
                  {conv.user.isOnline && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-background" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="font-medium text-foreground truncate">{conv.user.name}</span>
                      {conv.user.isVerified && (
                        <Badge className="h-4 px-1 bg-primary/20 text-primary text-[10px] border-0">
                          <Star className="w-2.5 h-2.5 mr-0.5 fill-current" />
                          Verified
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground flex-shrink-0">{conv.timestamp}</span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">{conv.itemTitle}</p>
                  <p className="text-sm text-muted-foreground truncate mt-1">{conv.lastMessage}</p>
                </div>
                {conv.unread > 0 && (
                  <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center flex-shrink-0 mt-1">
                    {conv.unread}
                  </span>
                )}
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Chat Area */}
      {selectedConversation ? (
        <div className="flex-1 flex flex-col bg-background">
          {/* Chat Header */}
          <div className="h-16 px-5 border-b border-white/[0.06] flex items-center justify-between bg-[#121212]">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={selectedConversation.user.avatar} alt={selectedConversation.user.name} />
                  <AvatarFallback>{selectedConversation.user.name[0]}</AvatarFallback>
                </Avatar>
                {selectedConversation.user.isOnline && (
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-background" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <p className="font-medium text-foreground">{selectedConversation.user.name}</p>
                  {selectedConversation.user.isVerified && (
                    <Badge className="h-4 px-1 bg-primary/20 text-primary text-[10px] border-0">
                      <Star className="w-2.5 h-2.5 mr-0.5 fill-current" />
                      Verified
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {selectedConversation.user.isOnline ? 'Online' : 'Offline'} • {selectedConversation.itemTitle}
                </p>
              </div>
            </div>

            {/* Item Preview */}
            <div className="hidden md:flex items-center gap-3 px-3 py-1.5 rounded-xl bg-[#1a1a1a]">
              <img
                src={selectedConversation.itemImage}
                alt={selectedConversation.itemTitle}
                className="w-8 h-8 rounded-lg object-cover"
              />
              <div>
                <p className="text-xs font-medium text-foreground truncate max-w-[120px]">{selectedConversation.itemTitle}</p>
                <p className="text-xs text-primary">{selectedConversation.itemPrice}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="w-9 h-9 rounded-xl hover:bg-[#22debc]/10">
                <Phone className="w-4 h-4" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="w-9 h-9 rounded-xl hover:bg-[#22debc]/10">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>View Profile</DropdownMenuItem>
                  <DropdownMenuItem>View Item</DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive">Block User</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-5">
            <div className="space-y-4">
              {messages.map((msg, index) => {
                const isMe = msg.senderId === 'me';
                const showAvatar = index === 0 || messages[index - 1].senderId !== msg.senderId;

                return (
                  <div
                    key={msg.id}
                    className={`flex ${isMe ? 'justify-end' : 'justify-start'} items-end gap-2`}
                  >
                    {!isMe && showAvatar && (
                      <Avatar className="w-7 h-7 flex-shrink-0">
                        <AvatarImage src={selectedConversation.user.avatar} />
                        <AvatarFallback>{selectedConversation.user.name[0]}</AvatarFallback>
                      </Avatar>
                    )}
                    {!isMe && !showAvatar && <div className="w-7" />}

                    <div
                      className={`max-w-[70%] px-4 py-2.5 rounded-2xl ${
                        isMe
                          ? 'bg-primary text-primary-foreground rounded-br-md'
                          : 'bg-secondary text-foreground rounded-bl-md'
                      }`}
                    >
                      <p className="text-sm">{msg.text}</p>
                      <div className={`flex items-center gap-1 mt-1 ${isMe ? 'justify-end' : ''}`}>
                        <span className={`text-[10px] ${isMe ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                          {msg.timestamp}
                        </span>
                        {isMe && (
                          <span className="text-primary-foreground/70">
                            {msg.status === 'read' ? (
                              <CheckCheck className="w-3 h-3" />
                            ) : msg.status === 'delivered' ? (
                              <Check className="w-3 h-3" />
                            ) : (
                              <Check className="w-3 h-3 opacity-50" />
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="p-4 border-t border-white/[0.06] bg-[#121212]">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="w-9 h-9 rounded-xl hover:bg-[#22debc]/10">
                <Paperclip className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="w-9 h-9 rounded-xl hover:bg-[#22debc]/10">
                <ImageIcon className="w-4 h-4" />
              </Button>
              <div className="flex-1 relative">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Type a message..."
                  className="h-11 pl-4 pr-10 rounded-xl bg-[#1a1a1a] border-[#1a1a1a] focus:border-[#22debc]/40 focus:ring-[#22debc]/20"
                />
                <button className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                  <Smile className="w-5 h-5" />
                </button>
              </div>
              <Button
                onClick={handleSend}
                size="icon"
                disabled={!newMessage.trim()}
                className="w-11 h-11 rounded-xl bg-primary hover:bg-primary/90 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-background">
          <div className="text-center">
            <div className="w-20 h-20 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-4">
              <Send className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Select a conversation</h3>
            <p className="text-sm text-muted-foreground">Choose a conversation to start messaging</p>
          </div>
        </div>
      )}
        </>
      )}
    </div>
  );
}
