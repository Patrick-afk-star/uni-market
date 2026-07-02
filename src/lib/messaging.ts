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
 * POST /messaging/conversations/start/
 * Returns 200 (existing) or 201 (new) with the Conversation object.
 */
export async function startConversation(
  token: string,
  listingId: string
): Promise<Conversation> {
  const res = await fetch(getApiUrl('/messaging/conversations/start/'), {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ listing_id: listingId }),
  });
  return handleResponse<Conversation>(res);
}

/**
 * GET /messaging/conversations/?archived=false
 */
export async function listConversations(
  token: string,
  archived = false
): Promise<Conversation[]> {
  const res = await fetch(
    getApiUrl(`/messaging/conversations/?archived=${archived}`),
    { headers: authHeaders(token) }
  );
  return handleResponse<Conversation[]>(res);
}

/**
 * GET /messaging/conversations/{id}/
 * Also marks the other person's messages as read server-side.
 */
export async function getConversation(
  token: string,
  id: string
): Promise<Conversation> {
  const res = await fetch(getApiUrl(`/messaging/conversations/${id}/`), {
    headers: authHeaders(token),
  });
  return handleResponse<Conversation>(res);
}

/**
 * GET /messaging/conversations/{id}/messages/
 */
export async function listMessages(
  token: string,
  conversationId: string
): Promise<Message[]> {
  const res = await fetch(
    getApiUrl(`/messaging/conversations/${conversationId}/messages/`),
    { headers: authHeaders(token) }
  );
  return handleResponse<Message[]>(res);
}

/**
 * POST /messaging/conversations/{id}/messages/
 */
export async function sendMessage(
  token: string,
  conversationId: string,
  body: string
): Promise<Message> {
  const res = await fetch(
    getApiUrl(`/messaging/conversations/${conversationId}/messages/`),
    {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({ body }),
    }
  );
  return handleResponse<Message>(res);
}

/**
 * POST /messaging/conversations/{id}/archive/
 */
export async function archiveConversation(
  token: string,
  id: string
): Promise<void> {
  const res = await fetch(
    getApiUrl(`/messaging/conversations/${id}/archive/`),
    { method: 'POST', headers: authHeaders(token) }
  );
  return handleResponse<void>(res);
}

/**
 * DELETE /messaging/conversations/{id}/archive/
 */
export async function unarchiveConversation(
  token: string,
  id: string
): Promise<void> {
  const res = await fetch(
    getApiUrl(`/messaging/conversations/${id}/archive/`),
    { method: 'DELETE', headers: authHeaders(token) }
  );
  return handleResponse<void>(res);
}
