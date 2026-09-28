// types/digitalTypes.ts
export interface DigitalAd {
  id: string;
  owner: string;
  title: string;
  description: string;
  digitalTotalDesc?: string;
  projectNames: string[];
  projectDescriptions: string[];
  minBudget?: string;
  maxBudget?: string;
  requiredSkills: { name: string }[];
  person: "self" | "other";
  remote: boolean;
  thursdayHalf: boolean;
  verifyCode?: string;
  paymentMethod: string;
  adStatus: string;
  requestType?: "requester" | "provider"; // جدید
  durationUnit?: "minute" | "hour" | "day" | "month" | "year"; // جدید
  durationAmount?: string; // جدید
  createdAt: string;
  images: { url: string; isMain: boolean }[];
  province?: string;
  city?: string;
  phoneOther?: string;
  adType?: string; // برای استفاده در کارت
}
