"use client";

import { useSearchParams } from "next/navigation";
import SearchResults from "./SearchResults";
import { Suspense } from "react";

// کامپوننت جستجو که از useSearchParams استفاده می‌کند
function SearchContent() {
  const searchParams = useSearchParams();

  // استخراج پارامترها از URL
  const filters = {
    q: searchParams.get("q") || undefined,
    state: searchParams.get("state") || undefined,
    type: searchParams.get("type") || undefined,
  };

  console.log("🔍 [page] فیلترهای استخراج‌شده از URL:", filters);

  return <SearchResults filters={filters} />;
}

// صفحه اصلی با Suspense (اجباری برای useSearchParams)
export default function SearchAdsPage() {
  return (
    <Suspense
      fallback={<div className="p-4 text-center">در حال بارگذاری...</div>}
    >
      <SearchContent />
    </Suspense>
  );
}
