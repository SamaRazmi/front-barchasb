// -------- مپ‌های ترجمه برای فیلدهای رایج --------

export const genderMap: Record<string, string> = {
  male: "مرد",
  female: "زن",
};

export const maritalStatusMap: Record<string, string> = {
  single: "مجرد",
  married: "متأهل",
  divorced: "مطلقه",
  widowed: "بیوه",
};

export const militaryStatusMap: Record<string, string> = {
  done: "پایان خدمت",
  exempt: "معاف",
  pending: "در حال خدمت",
  none: "ندارد",
  completed: "پایان خدمت",
  serving: "در حال خدمت",
  subject: "مشمول",
};

export const cooperationTypeMap: Record<string, string> = {
  full_time: "تمام‌وقت",
  part_time: "پاره‌وقت",
  remote: "دورکاری",
  project_based: "پروژه‌ای",
  internship: "کارآموزی",
  contract: "پروژه‌ای", // معادل مناسب
};

export const experienceMap: Record<string, string> = {
  none: "بدون سابقه",
  "1-3": "۱ تا ۳ سال",
  "3-5": "۳ تا ۵ سال",
  "5+": "بیش از ۵ سال",
};

export const paymentMethodMap: Record<string, string> = {
  monthly: "ماهانه",
  hourly: "ساعتی",
  commission: "پورسانتی",
  negotiable: "توافقی",
};

export const educationMap: Record<string, string> = {
  below_diploma: "زیر دیپلم",
  diploma: "دیپلم",
  associate: "کاردانی",
  bachelor: "کارشناسی",
  master: "کارشناسی ارشد",
  doctoral: "دکتری",
};

export const companyTypeMap: Record<string, string> = {
  private: "خصوصی",
  public: "دولتی",
  cooperative: "تعاونی",
};

export const adStatusMap: Record<string, string> = {
  pending: "در انتظار تأیید",
  approved: "تأیید شده",
  rejected: "رد شده",
  expired: "منقضی شده",
};

export const adPaymentMethodMap: Record<string, string> = {
  Subscription: "اشتراک",
  Wallet: "کیف پول",
  Bank_card: "کارت بانکی",
};

// -------- مپ مهارت‌ها --------
export const skillMap: Record<string, string> = {
  content_creation: "تولید محتوا",
  graphic_design: "طراحی گرافیک",
  web_development: "توسعه وب",
  mobile_development: "توسعه موبایل",
  data_analysis: "تحلیل داده",
  digital_marketing: "بازاریابی دیجیتال",
  seo: "سئو",
  social_media: "رسانه‌های اجتماعی",
  copywriting: "متن‌نویسی",
  video_editing: "تدوین ویدیو",
  photography: "عکاسی",
  illustration: "تصویرسازی",
  ui_ux: "یوآی/یوایکس",
  project_management: "مدیریت پروژه",
  accounting: "حسابداری",
  // می‌توانید هر تعداد که نیاز دارید اضافه کنید
};

// -------- مپ وضعیت آگهی فروشنده --------
export const sellerStatusMap: Record<string, string> = {
  new: "نو",
  used: "کارکرده / دست دوم",
  sealed: "آکبند",
  refurbished: "بازسازی شده",
  damaged: "معیوب / نیاز به تعمیر",
  vintage: "قدیمی / کلکسیونی",
};

// -------- مپ کاربرد آگهی فروشنده --------
export const sellerUsageMap: Record<string, string> = {
  personal: "شخصی",
  commercial: "تجاری / کسب‌وکار",
  educational: "آموزشی / یادگیری",
  gift: "هدیه",
  industrial: "صنعتی",
};

// ===== اضافات جدید بر اساس تغییرات فرم‌ها =====

// مپ برای گزینه‌های حقوق (حداقل و حداکثر)
// توجه: اعداد به صورت خودکار نمایش داده می‌شوند و فقط "توافقی" و "بیشتر" نیاز به ترجمه دارند
export const salaryOptionMap: Record<string, string> = {
  negotiable: "توافقی",
  more: "بیشتر از ۱۰۰ میلیون",
  // برای اعداد نیازی به ترجمه نیست، اما می‌توانید در صورت نیاز اضافه کنید
};

// مپ برای گزینه‌های ساعت شروع و پایان
export const timeOptionMap: Record<string, string> = {
  negotiable: "توافقی",
  // اعداد نیازی به ترجمه ندارند
};

// مپ برای گزینه‌های قیمت‌گذاری در آگهی فروشنده (قیمت مقطوع، معاوضه، واگذار)
export const priceOptionMap: Record<string, string> = {
  fixedPrice: "قیمت مقطوع",
  swap: "معاوضه می‌کنم",
  transfer: "واگذار می‌شود",
};

// مپ برای گزینه‌های اضافی (گارانتی، ارسال)
export const additionalOptionMap: Record<string, string> = {
  warranty: "گارانتی دارد",
  shipping: "امکان ارسال دارد",
};

// مپ برای ویژگی‌های دورکاری و پنج‌شنبه (در صورت نیاز)
export const workOptionMap: Record<string, string> = {
  remote: "دورکاری",
  thursdayHalf: "پنج‌شنبه‌ها تا ظهر",
};

// مپ برای مزایا (در صورت نیاز به ترجمه مقادیر ذخیره‌شده)
export const benefitMap: Record<string, string> = {
  insurance: "بیمه",
  supplementary_insurance: "بیمه تکمیلی",
  bonus: "پاداش",
  lunch: "ناهار",
  transportation: "ایاب و ذهاب",
  accommodation: "اسکان",
  flexible_hours: "ساعات کاری شناور",
  training: "آموزش",
  remote_work: "امکان دورکاری",
  overtime: "اضافه‌کاری",
};

// مپ دسته‌بندی شغلی (در صورت نیاز)
export const jobCategoryMap: Record<string, string> = {
  modeling: "مدلینگ و استایلینگ",
  administrative_services: "خدمات اداری و پشتیبانی",
  marketing: "بازاریابی و تبلیغات",
  sales: "فروش",
  accounting: "حسابداری",
  graphic_design: "طراحی گرافیک",
  programming: "برنامه‌نویسی",
};

// -------- تابع کمکی ترجمه (بدون تغییر) --------
export const translate = (
  value: string | string[] | undefined | null,
  map: Record<string, string>,
): string => {
  if (!value) return "";

  // اگر آرایه باشد
  if (Array.isArray(value)) {
    return value.map((item) => map[item.trim()] || item.trim()).join("، ");
  }

  // اگر رشته شامل کاما باشد
  if (value.includes(",")) {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean)
      .map((item) => map[item] || item)
      .join("، ");
  }

  // مقدار تکی
  return map[value.trim()] || value.trim();
};
