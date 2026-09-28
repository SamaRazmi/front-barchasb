import React, { useState, useRef, useEffect, useCallback } from "react";
import { getWalletTransactions, WalletTransaction } from "@/api/apiWallet";

interface Transaction {
  id: string;
  amount: number;
  date: string;
  time: string;
}

// (اختیاری) این فیلتر صرفاً نمونه است، در صورت نیاز فیلتر بر اساس تاریخ واقعی پیاده‌سازی شود.
const filterTransactionsByTime = (
  transactions: Transaction[],
  filter: "today" | "thisWeek" | "thisMonth" | "thisYear",
): Transaction[] => {
  if (filter === "today") return transactions.slice(0, 2);
  if (filter === "thisWeek") return transactions.slice(0, 3);
  if (filter === "thisMonth") return transactions;
  return transactions;
};

const TransactionsContent: React.FC = () => {
  const [page, setPage] = useState<"main" | "deposit" | "withdraw">("main");
  const [timeFilter, setTimeFilter] = useState<
    "today" | "thisWeek" | "thisMonth" | "thisYear"
  >("today");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [allTransactions, setAllTransactions] = useState<WalletTransaction[]>(
    [],
  );

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [dragOffset, setDragOffset] = useState(0);

  const mapApiTransaction = (tx: WalletTransaction): Transaction => {
    // اگر persianCreatedAt وجود نداشت، مقدار پیش‌فرض قرار بده
    const dateTime = tx.persianCreatedAt || " ";
    const [datePart, timePart] = dateTime.split(" ");
    return {
      id: tx.id,
      amount: tx.amount,
      date: datePart || "",
      time: timePart || "",
    };
  };

  const applyFilters = useCallback(() => {
    if (!allTransactions.length) {
      setTransactions([]);
      return;
    }

    let filteredByType = allTransactions;
    if (page === "deposit") {
      filteredByType = allTransactions.filter((tx) => tx.type === "deposit");
    } else if (page === "withdraw") {
      filteredByType = allTransactions.filter((tx) => tx.type === "withdraw");
    }

    const mapped = filteredByType.map(mapApiTransaction);
    const finalTransactions = filterTransactionsByTime(mapped, timeFilter);
    setTransactions(finalTransactions);
  }, [allTransactions, page, timeFilter]);

  const fetchTransactionsFromApi = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getWalletTransactions(1, 100);
      // بررسی ساختار پاسخ – فرض می‌کنیم response خودش آرایه items دارد
      if (response && Array.isArray(response.items)) {
        setAllTransactions(response.items);
      } else {
        // اگر ساختار غیرمنتظره بود، خطا ثبت کن
        console.error("Unexpected API response structure:", response);
        setError("پاسخ دریافتی از سرور نامعتبر است");
        setAllTransactions([]);
      }
    } catch (err: unknown) {
      // لاگ دقیق خطا
      let errorMessage = "خطا در دریافت تراکنش‌ها";
      let statusCode: number | undefined;
      let responseData: unknown;

      if (err && typeof err === "object") {
        // اگر ارور از نوع axios باشد (response وجود دارد)
        const axiosErr = err as any;
        if (axiosErr.response) {
          statusCode = axiosErr.response.status;
          responseData = axiosErr.response.data;
          errorMessage =
            axiosErr.response.data?.message ||
            axiosErr.response.data?.error ||
            axiosErr.message ||
            errorMessage;
        } else if (axiosErr.message) {
          errorMessage = axiosErr.message;
        }
      }

      console.error("Error fetching transactions:", {
        message: errorMessage,
        status: statusCode,
        data: responseData,
        originalError: err,
      });

      setError(errorMessage);
      setAllTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactionsFromApi();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!scrollContainerRef.current) return;
      const scrollAmount = 100;
      const pageScrollAmount = scrollContainerRef.current.clientHeight;
      switch (e.key) {
        case "ArrowDown":
          scrollContainerRef.current.scrollTop += scrollAmount;
          e.preventDefault();
          break;
        case "ArrowUp":
          scrollContainerRef.current.scrollTop -= scrollAmount;
          e.preventDefault();
          break;
        case "PageDown":
          scrollContainerRef.current.scrollTop += pageScrollAmount;
          e.preventDefault();
          break;
        case "PageUp":
          scrollContainerRef.current.scrollTop -= pageScrollAmount;
          e.preventDefault();
          break;
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleDrag = (e: MouseEvent) => {
    if (scrollContainerRef.current) {
      const delta = dragOffset - e.clientY;
      scrollContainerRef.current.scrollTop = Math.max(
        0,
        scrollContainerRef.current.scrollTop + delta,
      );
      setDragOffset(e.clientY);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setDragOffset(e.clientY);
    document.addEventListener("mousemove", handleDrag);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleMouseUp = () => {
    document.removeEventListener("mousemove", handleDrag);
    document.removeEventListener("mouseup", handleMouseUp);
  };

  const handleTouchStart = (e: React.TouchEvent) =>
    setDragOffset(e.touches[0].clientY);
  const handleTouchMove = (e: React.TouchEvent) => {
    if (scrollContainerRef.current) {
      const delta = dragOffset - e.touches[0].clientY;
      scrollContainerRef.current.scrollTop = Math.max(
        0,
        scrollContainerRef.current.scrollTop + delta,
      );
      setDragOffset(e.touches[0].clientY);
    }
  };
  const handleWheel = (e: React.WheelEvent) => {
    if (scrollContainerRef.current)
      scrollContainerRef.current.scrollTop += e.deltaY;
  };

  if (page === "main") {
    return (
      <div className="relative w-full h-full rounded-[20px] shadow-[1px_1px_8px_0px_#00000033] overflow-hidden flex items-center justify-center">
        <img
          src="/images/bg_wallet_billing.svg"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
        />
        <div className="relative flex flex-col items-center space-y-16">
          <button
            onClick={() => setPage("deposit")}
            className="bg-[#143A62E5] text-white font-bold text-lg sm:text-base md:text-lg py-3 px-8 rounded-xl w-full max-w-[180px] whitespace-nowrap"
          >
            تاریخچه واریز
          </button>
          <button
            onClick={() => setPage("withdraw")}
            className="bg-[#143A62E5] text-white font-bold text-lg sm:text-base md:text-lg py-3 px-8 rounded-xl w-full max-w-[180px] whitespace-nowrap"
          >
            تاریخچه برداشت
          </button>
        </div>
      </div>
    );
  }

  const pageTitle = page === "deposit" ? "تاریخچه واریز" : "تاریخچه برداشت";

  return (
    <div className="relative w-full h-full rounded-[20px] shadow-[1px_1px_8px_0px_#00000033] overflow-hidden flex flex-col">
      <img
        src="/images/bg_wallet_billing.svg"
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
        loading="lazy"
      />

      <div className="relative pt-4 pb-2 flex items-center justify-center">
        <button
          onClick={() => setPage("main")}
          className="absolute left-4 z-10 bg-gray-200 backdrop-blur-sm p-2 rounded-full shadow-md hover:bg-gray-300 transition"
          aria-label="بازگشت"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-white"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>
        <h2 className="text-center text-xl font-bold text-[#143A62] py-2 px-6 inline-block rounded-full">
          {pageTitle}
        </h2>
      </div>

      <div className="relative flex-1 h-[50vh] pt-[1%] px-[10%] pb-[5%]">
        <div className="w-full h-full bg-white/10 backdrop-blur-sm rounded-2xl shadow-[1px_1px_6px_0px_#00000033] flex flex-col overflow-hidden">
          {/* دکمه‌های فیلتر */}
          <div className="flex flex-row justify-center gap-3 p-4 border-b border-white/20">
            {(["today", "thisWeek", "thisMonth", "thisYear"] as const).map(
              (filter) => {
                const labels = {
                  today: "امروز",
                  thisWeek: "این هفته",
                  thisMonth: "این ماه",
                  thisYear: "امسال",
                };
                const isActive = timeFilter === filter;
                return (
                  <button
                    key={filter}
                    onClick={() => setTimeFilter(filter)}
                    className={`px-4 py-1.5 rounded-lg border text-sm font-medium transition-all ${
                      isActive
                        ? "bg-[#143A62] text-white border-[#143A62]"
                        : "bg-transparent text-[#143A62] border-[#143A62] hover:bg-[#143A62]/10"
                    }`}
                  >
                    {labels[filter]}
                  </button>
                );
              },
            )}
          </div>

          {/* لیست تراکنش‌ها */}
          <div
            ref={scrollContainerRef}
            className="flex-1 overflow-y-auto mx-[5%]"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            onMouseDown={handleMouseDown}
            onWheel={handleWheel}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
          >
            {(() => {
              if (loading) {
                return (
                  <div className="flex justify-center items-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
                  </div>
                );
              }
              if (error) {
                return (
                  <div className="text-center text-red-300 py-10">{error}</div>
                );
              }
              if (transactions.length === 0) {
                return (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-2xl md:text-3xl font-bold text-white/80 text-center">
                      هیچ تراکنشی موجود نیست
                    </p>
                  </div>
                );
              }
              return (
                <div className="space-y-3 py-3">
                  {transactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="bg-[#143A6266] shadow-[1px_2px_4px_0px_#00000026] rounded-xl p-4 flex justify-between items-center text-white"
                    >
                      <div className="text-lg font-bold">
                        {tx.amount.toLocaleString()} تومان
                      </div>
                      <div className="text-left">
                        <div className="text-sm">{tx.date}</div>
                        <div className="text-xs opacity-80">{tx.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>

          <div
            className="w-full h-[3vh] sticky bottom-0 left-0 pointer-events-none rounded-md"
            style={{
              background:
                "linear-gradient(180deg, rgba(17, 17, 17, 0) 0%, rgba(17, 17, 17, 0.6) 100%)",
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default TransactionsContent;
