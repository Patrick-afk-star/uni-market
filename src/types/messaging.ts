// ─── Messaging types ─────────────────────────────────────────────────────────

export interface ConversationParty {
  id: string;
  first_name: string;
  last_name: string;
  avatar: string | null;
}

export interface ConversationListing {
  id: string;
  title: string;
  price: string | number;
  thumbnail: string | null;
}

/** Shape returned by GET /api/messaging/conversations/ and the start endpoint */
export interface Conversation {
  id: string;
  listing: ConversationListing;
  other_party: ConversationParty;
  last_message_at: string | null;
  last_message_preview: string | null;
  unread_count: number;
  is_archived: boolean;
  created_at: string;
  // Present on the start endpoint only
  buyer?: string | number;
  seller?: string | number;
}

export interface MessageSender {
  id: string;
  first_name: string;
  last_name: string;
  avatar: string | null;
}

export interface Message {
  id: string;
  conversation: string;
  sender: MessageSender;
  body: string;
  created_at: string;
  read_at: string | null;
  is_mine: boolean;
}
