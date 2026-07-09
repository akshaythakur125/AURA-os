"use client";

import { getItem, setItem } from "@/lib/storage/localStore";

const SESSION_KEY = "auracheck:v1:session";
const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

export interface SessionData {
  sessionId: string;
  createdAt: string;
  lastActivityAt: string;
  pageViews: number;
}

export function getSession(): SessionData {
  if (typeof window === "undefined") {
    return { sessionId: "", createdAt: "", lastActivityAt: "", pageViews: 0 };
  }

  let session = getItem<SessionData | null>(SESSION_KEY, null);
  const now = new Date().toISOString();

  if (!session) {
    session = {
      sessionId: generateSessionId(),
      createdAt: now,
      lastActivityAt: now,
      pageViews: 1,
    };
    setItem(SESSION_KEY, session);
    return session;
  }

  // Check if session expired
  const lastActive = new Date(session.lastActivityAt).getTime();
  if (Date.now() - lastActive > SESSION_TIMEOUT_MS) {
    session = {
      sessionId: generateSessionId(),
      createdAt: now,
      lastActivityAt: now,
      pageViews: 1,
    };
    setItem(SESSION_KEY, session);
    return session;
  }

  // Update activity
  session.lastActivityAt = now;
  session.pageViews++;
  setItem(SESSION_KEY, session);
  return session;
}

export function getSessionId(): string {
  return getSession().sessionId;
}

export function touchSession(): void {
  const session = getSession();
  session.lastActivityAt = new Date().toISOString();
  session.pageViews++;
  setItem(SESSION_KEY, session);
}

function generateSessionId(): string {
  return `sess_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}
