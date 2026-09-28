// api/apiMessages.ts

import { get, post, patch } from "@/api/apiClient";

export interface Conversation {
  id: string;
  participants: { id: string; name: string }[];
  adId: string;
  adType: string;
  lastMessage: string;
  adImage?: string;
  adTitle?: string;
  unreadCount?: number;
}

export interface DeviceSession {
  id: string;
  deviceInfo?: {
    deviceType: string;
    browser: string;
    ip: string;
    userAgent?: string;
  };
  deviceType?: string;
  browser?: string;
  ip?: string;
  lastActiveAt: string;
  createdAt: string;
  isActive: boolean;
  isRead?: boolean;
}

// -------------------- Chat --------------------

export async function fetchConversations(
  userId: string,
): Promise<{ success: boolean; conversations: Conversation[] }> {
  try {
    const data = await get<{ success: boolean; conversations: Conversation[] }>(
      `/chat/conversations/${userId}`,
    );
    return data;
  } catch (error) {
    console.error("❌ خطا در fetchConversations:", error);
    throw error;
  }
}

export async function fetchUnreadCounts(
  userId: string,
): Promise<{ karjo: number; karfarma: number; agahi: number }> {
  try {
    const data = await get<{
      success: boolean;
      data: { karjo: number; karfarma: number; agahi: number };
    }>(`/chat/unread-count/${userId}`);

    if (data.success && data.data) {
      return data.data;
    }
    return { karjo: 0, karfarma: 0, agahi: 0 };
  } catch (error) {
    console.error("❌ خطا در fetchUnreadCounts:", error);
    throw error;
  }
}

export async function fetchUnreadDetails(
  userId: string,
): Promise<Record<string, number>> {
  try {
    const data = await get<{
      success: boolean;
      data: Record<string, number>;
    }>(`/chat/unread-details/${userId}`);

    if (data.success && data.data) {
      return data.data;
    }
    return {};
  } catch (error) {
    console.error("❌ خطا در fetchUnreadDetails:", error);
    throw error;
  }
}

export async function markConversationAsRead(
  userId: string,
  conversationId: string,
): Promise<{ success: boolean; message: string }> {
  try {
    const data = await post<{ success: boolean; message: string }>(
      `/chat/mark-read`,
      { userId, conversationId },
    );
    return data;
  } catch (error) {
    console.error("❌ خطا در markConversationAsRead:", error);
    throw error;
  }
}

// -------------------- Devices --------------------

export async function getDevices(): Promise<{
  sessions: DeviceSession[];
  unreadCount: number;
}> {
  try {
    const data = await get<{
      sessions: DeviceSession[];
      unreadCount: number;
    }>("/sessions");
    return data;
  } catch (error) {
    console.error("❌ خطا در getDevices:", error);
    throw error;
  }
}

export async function markSessionAsRead(
  sessionId: string,
): Promise<{ success: boolean }> {
  try {
    const data = await patch<{ success: boolean }>(
      `/sessions/${sessionId}/read`,
    );
    return data;
  } catch (error) {
    console.error("❌ خطا در markSessionAsRead:", error);
    throw error;
  }
}
