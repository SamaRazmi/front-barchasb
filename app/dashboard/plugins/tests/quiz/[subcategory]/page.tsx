"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { fetchWithAuth } from "@/lib/api";
import QuizClient from "@/components/tests/quizClient";
import TestFooter from "@/components/tests/testFooter";

type Option = {
  id: string;
  text: string;
};

export type Question = {
  id: string;
  text: string;
  options: Option[];
};

type StartQuizResponse = {
  sessionId: string;
  questions: {
    id: string; // ✅ تغییر: _id → id
    questionText?: string;
    text?: string;
    options?: {
      id: string; // ✅ تغییر: _id → id
      text?: string;
    }[];
  }[];
};

export default function QuizPage() {
  const params = useParams();
  const searchParams = useSearchParams();

  const typeId = params?.subcategory as string;

  const quizTitle = searchParams.get("title") ?? "آزمون";
  const quizDesc = searchParams.get("desc") ?? "";

  const timeLimitParam = searchParams.get("timeLimit");
  const timeLimitSeconds = timeLimitParam ? Number(timeLimitParam) * 60 : null;

  // ✅ این مقدار باید از کانتکست کاربر گرفته شود، اما فعلاً به‌عنوان placeholder نگه داشته شده
  const userId = "699412d02b085af77322ab98";

  const [questions, setQuestions] = useState<Question[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function startQuiz() {
      try {
        // ✅ استفاده از fetchWithAuth که به‌طور خودکار توکن را مدیریت می‌کند و مسیر /api را می‌زند
        const res = await fetchWithAuth("/api/tests/start", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ typeId, userId }),
        });

        const data = await res.json();

        if (!res.ok) throw new Error("شروع آزمون ناموفق");

        setSessionId(data.sessionId);

        // ✅ تغییر: استفاده از id به جای _id در هر دو سطح سوال و گزینه‌ها
        const formattedQuestions: Question[] = (data.questions || []).map(
          (q: any) => ({
            id: q.id, // ✅ تغییر
            text: q.questionText || q.text || "بدون متن",
            options: (q.options || []).map((o: any) => ({
              id: o.id, // ✅ تغییر
              text: o.text || "",
            })),
          }),
        );

        setQuestions(formattedQuestions);
      } catch (err) {
        console.error("quiz error:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    if (typeId) startQuiz();
  }, [typeId, userId]);

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900 mx-auto" />
          <p className="mt-4 text-gray-600">در حال دریافت اطلاعات...</p>
        </div>
      </div>
    );

  if (error || !questions.length)
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-red-600">خطا در دریافت اطلاعات</p>
      </div>
    );

  return (
    <main className="h-screen relative pt-8">
      <div className="flex flex-col gap-3 justify-center items-center px-5 text-center">
        <p className="text-[32px] font-bold">تست {quizTitle}</p>

        {quizDesc && <p className="text-gray-600 text-[18px]">{quizDesc}</p>}

        {sessionId && (
          <QuizClient
            questions={questions}
            timeLimit={timeLimitSeconds ?? undefined}
            sessionId={sessionId}
            subcategory={typeId}
          />
        )}
      </div>

      <div className="absolute bottom-0 w-full">
        <TestFooter />
      </div>
    </main>
  );
}
