import { getApiUrl } from '@/lib/api';
import type { Conversation, Message } from '@/types/messaging';

// ─── helpers ─────────────────────────────────────────────────────────────────

function authHeaders(token: string): HeadersInit {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const msg = err?.detail ?? `Request failed with status ${res.status}`;
    throw new Error(msg);
  }
  // 204 No Content
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

// ─── API functions ────────────────────────────────────────────────────────────

/**
 * POST /conversation/start/
 * Returns 200 (existing) or 201 (new) with the Conversation object.
 */
export async function startConversation(
  token: string,
  listingId: string
): Promise<Conversation> {
  const res = await fetch(getApiUrl('/conversation/start/'), {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ listing_id: listingId }),
  });
  return handleResponse<Conversation>(res);
}

/**
 * GET /conversation/?archived=false
 */
export async function listConversations(
  token: string,
  archived = false
): Promise<Conversation[]> {
  const res = await fetch(
    getApiUrl(`/conversation/?archived=${archived}`),
    { headers: authHeaders(token) }
  );
  return handleResponse<Conversation[]>(res);
}

/**
 * GET /conversation/{id}/
 * Also marks the other person's messages as read server-side.
 */
export async function getConversation(
  token: string,
  id: string
): Promise<Conversation> {
  const res = await fetch(getApiUrl(`/conversation/${id}/`), {
    headers: authHeaders(token),
  });
  return handleResponse<Conversation>(res);
}

/**
 * GET /conversation/{id}/messages/
 */
export async function listMessages(
  token: string,
  conversationId: string
): Promise<Message[]> {
  const res = await fetch(
    getApiUrl(`/conversation/${conversationId}/messages/`),
    { headers: authHeaders(token) }
  );
  return handleResponse<Message[]>(res);
}

/**
 * POST /conversation/{id}/messages/
 */
export async function sendMessage(
  token: string,
  conversationId: string,
  body: string
): Promise<Message> {
  const res = await fetch(
    getApiUrl(`/conversation/${conversationId}/messages/`),
    {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({ body }),
    }
  );
  return handleResponse<Message>(res);
}

/**
 * DELETE /conversation/{conversationId}/messages/{messageId}/
 */
export async function deleteMessage(
  token: string,
  conversationId: string,
  messageId: string
): Promise<void> {
  const res = await fetch(
    getApiUrl(`/conversation/${conversationId}/messages/${messageId}/`),
    { method: 'DELETE', headers: authHeaders(token) }
  );
  return handleResponse<void>(res);
}

/**
 * POST /conversation/{id}/archive/
 */
export async function archiveConversation(
  token: string,
  id: string
): Promise<void> {
  const res = await fetch(
    getApiUrl(`/conversation/${id}/archive/`),
    { method: 'POST', headers: authHeaders(token) }
  );
  return handleResponse<void>(res);
}

/**
 * DELETE /conversation/{id}/archive/
 */
export async function unarchiveConversation(
  token: string,
  id: string
): Promise<void> {
  const res = await fetch(
    getApiUrl(`/conversation/${id}/archive/`),
    { method: 'DELETE', headers: authHeaders(token) }
  );
  return handleResponse<void>(res);
}
