import React, {
  useRef,
  useState,
  useEffect,
} from "react";
import CardContent from "./___components/CardContent";
import { DigitalAd } from "@/types/digitalTypes";
import {
  trackAdView as defaultTrackView,
} from "@/api/apiAdView";

interface ContentProps {
  ads: DigitalAd[];

  onTrackView?: (
    adId: string,
    adType: string,
  ) => Promise<any>;

  // Pagination
  hasMore?: boolean;
  loadingMore?: boolean;
  onLoadMore?: () => void;
  loading?: boolean;
}

const Content: React.FC<ContentProps> = ({
  ads,
  onTrackView = defaultTrackView,

  // Pagination
  hasMore = false,
  loadingMore = false,
  onLoadMore,
  loading = false,
}) => {
  const [dragOffset, setDragOffset] =
    useState(0);

  const containerRef =
    useRef<HTMLDivElement>(null);

  // =========================
  // Drag Scroll
  // =========================
  const handleDrag = (e: MouseEvent) => {
    if (containerRef.current) {
      const delta =
        dragOffset - e.clientY;

      containerRef.current.scrollTop =
        Math.max(
          0,
          containerRef.current.scrollTop +
            delta,
        );

      setDragOffset(e.clientY);
    }
  };

  const handleMouseDown = (
    e: React.MouseEvent,
  ) => {
    setDragOffset(e.clientY);

    document.addEventListener(
      "mousemove",
      handleDrag,
    );

    document.addEventListener(
      "mouseup",
      handleMouseUp,
    );
  };

  const handleMouseUp = () => {
    document.removeEventListener(
      "mousemove",
      handleDrag,
    );

    document.removeEventListener(
      "mouseup",
      handleMouseUp,
    );
  };

  // =========================
  // Wheel Scroll
  // =========================
  const handleWheel = (
    e: React.WheelEvent,
  ) => {
    if (containerRef.current) {
      containerRef.current.scrollTop +=
        e.deltaY;
    }
  };

  // =========================
  // Touch Scroll
  // =========================
  const handleTouchStart = (
    e: React.TouchEvent,
  ) => {
    setDragOffset(
      e.touches[0].clientY,
    );
  };

  const handleTouchMove = (
    e: React.TouchEvent,
  ) => {
    if (containerRef.current) {
      const delta =
        dragOffset -
        e.touches[0].clientY;

      containerRef.current.scrollTop =
        Math.max(
          0,
          containerRef.current.scrollTop +
            delta,
        );

      setDragOffset(
        e.touches[0].clientY,
      );
    }
  };

  // =========================
  // Keyboard Scroll
  // =========================
  useEffect(() => {
    const handleKeyDown = (
      e: KeyboardEvent,
    ) => {
      if (!containerRef.current) return;

      const scrollAmount = 100;

      const pageScrollAmount =
        containerRef.current.clientHeight;

      if (e.key === "ArrowDown") {
        e.preventDefault();

        containerRef.current.scrollTop +=
          scrollAmount;
      }

      if (e.key === "ArrowUp") {
        e.preventDefault();

        containerRef.current.scrollTop -=
          scrollAmount;
      }

      if (e.key === "PageDown") {
        e.preventDefault();

        containerRef.current.scrollTop +=
          pageScrollAmount;
      }

      if (e.key === "PageUp") {
        e.preventDefault();

        containerRef.current.scrollTop -=
          pageScrollAmount;
      }
    };

    document.addEventListener(
      "keydown",
      handleKeyDown,
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleKeyDown,
      );
    };
  }, []);

  return (
    <div
      className="w-full h-[90%] p-4 bg-[#F5F5F5] rounded-[10px] overflow-y-hidden"
      onMouseDown={handleMouseDown}
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
    >
      {/* =========================
          اسکرول
      ========================== */}
      <div
        ref={containerRef}
        className="overflow-y-auto h-full"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {/* مخفی کردن Scrollbar در Chrome / Safari / Edge */}
        <style>{`
          .overflow-y-auto::-webkit-scrollbar {
            display: none;
          }
        `}</style>

        {/* =========================
            Loading صفحه اول
        ========================== */}
        {loading ? (
          <div className="flex justify-center items-center h-full w-full">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-500" />
          </div>
        ) : (
          <CardContent
            ads={ads}
            onTrackView={onTrackView}

            // Pagination
            hasMore={hasMore}
            loadingMore={loadingMore}
            onLoadMore={onLoadMore}
          />
        )}
      </div>
    </div>
  );
};

export default Content;