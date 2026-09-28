"use client";

export type AuthorizeRequest = {
  actions: ("CREATE_AD" | "SPECIAL_AD" | "LADDER")[];
  adType: string;
  categoryId: string;
  meta: {
    adId?: string;
    source: string;
    package: "premium-bundle" | "free";
  };
};

export type AuthorizeError = {
  action: string;
  reason: string;
};

// ⭐ نوع موفقیت – حتماً شامل reservationId باشد
export type AuthorizeSuccess = {
  success: true;
  reservationId: string;
  status: string;
  expiresAt: string;
  decisions: any[];
};

// با توجه به اینکه این API مربوط به سرویس جداگانه است، از آدرس کامل استفاده می‌کنیم
// اما با credentials: 'include' کوکی ارسال می‌شود
const AUTHORIZE_URL =
  process.env.NEXT_PUBLIC_ORCHESTRATOR_URL ||
  "https://barchasb-server-admin.liara.run/orchestrator/authorize";

const ATTACH_AD_URL =
  process.env.NEXT_PUBLIC_ORCHESTRATOR_URL ||
  "https://barchasb-server-admin.liara.run/ad-action-reservation/attach-ad";

// ==================== بررسی مجوز ====================
export async function checkAuthorization(
  req: AuthorizeRequest,
): Promise<AuthorizeSuccess | { success: false; error: AuthorizeError }> {
  const response = await fetch(AUTHORIZE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include", // ارسال کوکی accessToken
    body: JSON.stringify(req),
  });

  let responseBody: any = null;
  const contentType = response.headers.get("content-type");
  if (contentType?.includes("application/json")) {
    responseBody = await response.json();
  } else {
    responseBody = await response.text();
  }

  if (response.status === 201) {
    return { success: true, ...responseBody };
  }

  if (response.status === 409) {
    return { success: false, error: responseBody as AuthorizeError };
  }

  const errorMessage =
    typeof responseBody === "object"
      ? JSON.stringify(responseBody)
      : responseBody || "بدون توضیحات";
  throw new Error(
    `Authorization failed with status ${response.status}: ${errorMessage}`,
  );
}

// ==================== چسباندن آگهی به رزرو ====================
export async function attachAdToReservation(
  reservationId: string,
  adId: string,
): Promise<any> {
  const response = await fetch(ATTACH_AD_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include", // ارسال کوکی accessToken
    body: JSON.stringify({ reservationId, adId }),
  });

  let responseBody: any = null;
  const contentType = response.headers.get("content-type");
  if (contentType?.includes("application/json")) {
    responseBody = await response.json();
  } else {
    responseBody = await response.text();
  }

  if (!response.ok) {
    const errorMessage =
      typeof responseBody === "object"
        ? JSON.stringify(responseBody)
        : responseBody || "بدون توضیحات";
    throw new Error(
      `Attach failed with status ${response.status}: ${errorMessage}`,
    );
  }
  return responseBody;
}
