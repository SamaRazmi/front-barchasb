"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import ChatMessagesContent from "./[adType]/[adId]/[receiverId]/ChatMessagesContent";
import TopBar from "@/components/common/TopBar";

interface Conversation {
  _id: string;
  participants: { id: string; name: string }[];
  adId: string;
  adType: string;
  lastMessage: string;
  adImage?: string;
  adTitle?: string;
  ownerName?: string; // ✅ اضافه شد
}

const BASE_URL = "/api";

const ChatWrapper: React.FC = () => {
  const { user } = useUser();
  const router = useRouter();
  const params = useParams();

  const adType = (params as any)?.adType;
  const adId = (params as any)?.adId;
  const receiverId = (params as any)?.receiverId;

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dragOffset, setDragOffset] = useState(0);

  useEffect(() => {
    if (!user?.id) return;

    const fetchConversations = async () => {
      try {
        const res = await fetch(`${BASE_URL}/chat/conversations/${user.id}`, {
          credentials: "include",
        });
        const data = await res.json();
        if (!data.success) {
          setConversations([]);
          return;
        }
        let list: Conversation[] = data.conversations || [];
        if (adType && adId) {
          list = list.filter((c) => c.adType === adType && c.adId === adId);
        }
        setConversations(list);

        const convsWithDetails = await Promise.all(
          list.map(async (conv) => {
            if (!conv.adId) return conv;
            let url = "";
            if (conv.adType === "EmployerAd")
              url = `${BASE_URL}/ads/employer/${conv.adId}`;
            else if (conv.adType === "JobSeekerAd")
              url = `${BASE_URL}/ads/jobseeker/${conv.adId}`;
            else if (conv.adType === "SellerAd")
              url = `${BASE_URL}/ads/seller/${conv.adId}`;
            else return conv;

            try {
              const adRes = await fetch(url, { credentials: "include" });
              const adData = await adRes.json();
              let adTitle = "";
              let adImage: string | undefined = undefined;
              let ownerName = "";

              if (conv.adType === "EmployerAd")
                adTitle = adData.title || adData.jobTitle || "";
              else if (conv.adType === "JobSeekerAd")
                adTitle = adData.title || adData.jobTitle || "";
              else if (conv.adType === "SellerAd")
                adTitle = adData.title || adData.productName || "";

              // ✅ استخراج نام مالک از owner
              if (adData.owner) {
                ownerName = adData.owner.fullName || adData.owner.name || "";
              }

              if (
                conv.adType === "EmployerAd" ||
                conv.adType === "JobSeekerAd"
              ) {
                const mainUrl = adData.images?.[0];
                if (mainUrl) {
                  if (
                    typeof mainUrl === "object" &&
                    "url" in mainUrl &&
                    mainUrl.url
                  ) {
                    adImage = mainUrl.url.startsWith("http")
                      ? mainUrl.url
                      : `${BASE_URL}/${mainUrl.url}`;
                  } else if (typeof mainUrl === "string") {
                    adImage = mainUrl.startsWith("http")
                      ? mainUrl
                      : `${BASE_URL}/${mainUrl}`;
                  }
                }
              } else if (conv.adType === "SellerAd") {
                const mainIndex = adData.mainImageIndex ?? 0;
                const mainUrl = adData.images?.[mainIndex];
                if (mainUrl) {
                  if (
                    typeof mainUrl === "object" &&
                    "url" in mainUrl &&
                    mainUrl.url
                  ) {
                    adImage = mainUrl.url.startsWith("http")
                      ? mainUrl.url
                      : `${BASE_URL}/${mainUrl.url}`;
                  } else if (typeof mainUrl === "string") {
                    adImage = mainUrl.startsWith("http")
                      ? mainUrl
                      : `${BASE_URL}/${mainUrl}`;
                  }
                }
              }

              return { ...conv, adTitle, adImage, ownerName };
            } catch (err) {
              console.error(`Error fetching ad details for ${conv.adId}:`, err);
              return conv;
            }
          }),
        );
        setConversations(convsWithDetails);
      } catch (err) {
        console.error("Error fetching conversations:", err);
        setConversations([]);
      }
    };

    fetchConversations();
  }, [user?.id, adType, adId]);

  const handleConversationClick = (conv: Conversation) => {
    const otherUser = conv.participants.find((p) => p.id !== user?.id);
    if (!otherUser) return;
    router.push(`/dashboard/chat/${conv.adType}/${conv.adId}/${otherUser.id}`);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!containerRef.current) return;
      const scrollAmount = 80;
      const pageScrollAmount = containerRef.current.clientHeight;
      switch (e.key) {
        case "ArrowDown":
          containerRef.current.scrollTop += scrollAmount;
          e.preventDefault();
          break;
        case "ArrowUp":
          containerRef.current.scrollTop -= scrollAmount;
          e.preventDefault();
          break;
        case "PageDown":
          containerRef.current.scrollTop += pageScrollAmount;
          e.preventDefault();
          break;
        case "PageUp":
          containerRef.current.scrollTop -= pageScrollAmount;
          e.preventDefault();
          break;
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleDrag = (e: MouseEvent) => {
    if (containerRef.current) {
      const delta = dragOffset - e.clientY;
      containerRef.current.scrollTop = Math.max(
        0,
        containerRef.current.scrollTop + delta,
      );
      setDragOffset(e.clientY);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (window.innerWidth >= 768) {
      setDragOffset(e.clientY);
      document.addEventListener("mousemove", handleDrag);
      document.addEventListener("mouseup", handleMouseUp);
    }
  };

  const handleMouseUp = () => {
    document.removeEventListener("mousemove", handleDrag);
    document.removeEventListener("mouseup", handleMouseUp);
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (containerRef.current) {
      containerRef.current.scrollTop += e.deltaY;
    }
  };

  if (user?.id && adType && adId && receiverId) {
    return (
      <ChatMessagesContent
        currentUserId={user.id}
        receiverId={receiverId}
        adId={adId}
        adType={adType}
      />
    );
  }

  return (
    <div className="flex flex-col h-full w-full overflow-hidden">
      <div className="hidden md:block w-full my-[1vh]">
        <TopBar />
      </div>

      <div
        className="flex flex-col w-full h-full bg-[#F5F5F5] overflow-hidden rounded-lg p-2 md:p-3"
        onMouseDown={handleMouseDown}
        onWheel={handleWheel}
      >
        <div
          ref={containerRef}
          className="overflow-y-auto h-full custom-scroll"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {conversations.length === 0 ? (
            <div className="text-right pt-4 pr-4 text-gray-500 text-sm md:text-base">
              هیچ مکالمه‌ای وجود ندارد.
            </div>
          ) : (
            conversations.map((conv) => {
              const otherUser = conv.participants.find(
                (p) => p.id !== user?.id,
              );
              // ✅ اگر نام کاربر مقابل موجود نبود یا "ناشناس" بود، از ownerName استفاده کن
              const displayName =
                otherUser?.name && otherUser.name !== "ناشناس"
                  ? otherUser.name
                  : conv.ownerName || "کاربر مقابل";

              const adTitle = conv.adTitle || "در حال بارگیری...";
              const adImage = conv.adImage;

              return (
                <div
                  key={conv._id}
                  className="cursor-pointer border rounded-xl p-4 mb-3 bg-white hover:bg-gray-100 active:bg-gray-200 transition-colors flex items-center gap-3"
                  onClick={() => handleConversationClick(conv)}
                >
                  {adImage ? (
                    <img
                      src={adImage}
                      alt={adTitle}
                      className="w-12 h-12 object-cover rounded-lg flex-shrink-0"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-200 rounded-lg flex-shrink-0 flex items-center justify-center text-gray-400 text-xs">
                      بدون عکس
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-base md:text-lg flex flex-wrap items-baseline gap-2">
                      <span>{displayName}</span>
                      <span className="text-xs text-gray-500 font-normal bg-gray-100 px-2 py-0.5 rounded-full">
                        {adTitle}
                      </span>
                    </div>
                    <div className="text-gray-600 truncate text-sm md:text-base">
                      {conv.lastMessage}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatWrapper;
