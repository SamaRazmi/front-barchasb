<div align="center">

# 🏷️ برچسب | Barchasb

**پلتفرم فریلنسری و آگهی‌های تخصصی — نسخه رسمی [barchasb.org](https://barchasb.org)**

[![Website](https://img.shields.io/badge/Website-barchasb.org-2563eb?style=for-the-badge&logo=googlechrome&logoColor=white)](https://barchasb.org)
[![GitHub](https://img.shields.io/badge/GitHub-SamaRazmi-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/SamaRazmi/front-barchasb)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](./LICENSE)
[![Status](https://img.shields.io/badge/Status-Active-success?style=for-the-badge)]()

</div>

---

## 📖 درباره پروژه

**برچسب** یک پلتفرم حرفه‌ای برای **آگهی‌گذاران** و **فریلنسرها** است که فرآیند ثبت، جستجو، فیلتر و مدیریت آگهی‌های تخصصی را به شکلی سریع، امن و هوشمند فراهم می‌کند.

نام «برچسب» برگرفته از مفهوم **برچسب‌گذاری هوشمند** آگهی‌ها است؛ به‌گونه‌ای که هر آگهی با مهارت‌ها، دسته‌بندی‌ها و تگ‌های مرتبط برچسب‌گذاری می‌شود تا جستجو و تطبیق بین آگهی‌گذار و فریلنسر دقیق‌تر و سریع‌تر انجام شود.

این ریپازیتوری شامل کدهای **Front-end** وب‌سایت رسمی [barchasb.org](https://barchasb.org) می‌باشد.

> 🌐 نسخه زنده و آنلاین: [barchasb.org](https://barchasb.org)

---

## ✨ امکانات کلیدی

### 👤 ثبت‌نام و احراز هویت
- ✅ **ثبت‌نام چند مرحله‌ای حرفه‌ای (Multi-Step Registration)** با Wizard مرحله‌به‌مرحله
- ✅ اعتبارسنجی لحظه‌ای هر مرحله با Form Validation پیشرفته
- ✅ تأیید شماره موبایل با OTP
- ✅ بازیابی رمز عبور و مدیریت نشست‌ها
- ✅ کنترل دسترسی نقش‌محور (Role-Based Access Control)

### 📢 بخش آگهی‌گذاران
- ✅ انتشار آگهی در چند مرحله با ذخیره‌ی پیش‌نویس خودکار (Auto-Save Draft)
- ✅ مدیریت آگهی‌ها: ویرایش، تمدید، بایگانی و حذف
- ✅ داشبورد اختصاصی آگهی‌گذار با آمار بازدید و درخواست‌ها
- ✅ آپلود تصاویر و فایل‌های ضمیمه
- ✅ **برچسب‌گذاری هوشمند آگهی‌ها** با مهارت‌ها و تگ‌های مرتبط

### 🔎 جستجو و فیلتر حرفه‌ای
- ✅ **فیلتر پیشرفته چندلایه (Advanced Multi-Filter)**
- ✅ فیلتر بر اساس دسته‌بندی، شهر، بازه قیمت، مهارت‌ها و امتیاز
- ✅ جستجوی زنده با Debounce و Query Params
- ✅ مرتب‌سازی هوشمند (جدیدترین، محبوب‌ترین، بهترین امتیاز)
- ✅ ذخیره فیلترهای پرکاربرد کاربر

### 💬 تعاملات
- ✅ سیستم پیام‌رسانی بین کاربران (Real-time Chat)
- ✅ نظرات، امتیازدهی و نشان‌گذاری (Bookmark)
- ✅ اعلان‌های درون‌برنامه‌ای (Notification Center)

### 🎨 تجربه کاربری
- 🌙 حالت تاریک / روشن
- 📱 طراحی Mobile-First و کاملاً Responsive
- ⚡ بارگذاری سریع با Lazy Loading و Code Splitting
- ♿ دسترس‌پذیری (a11y) و پشتیبانی RTL

---

## 🛠️ تکنولوژی‌های استفاده شده

### Front-end Core

| لایه | تکنولوژی |
|------|----------|
| Framework | **React / Next.js** |
| Language | **TypeScript** |
| Styling | **Tailwind CSS** + CSS Modules |
| UI Components | Custom Design System |

### State Management (چندلایه)

| ابزار | کاربرد |
|-------|--------|
| **Zustand** | مدیریت State سبک و ماژولار برای سبد فیلترها، Modalها و UI State |
| **Redux Toolkit** | مدیریت State پیچیده (احراز هویت، آگهی‌ها، پیام‌ها) |
| **React Context** | تأمین‌کننده‌های Theme، Locale و Auth Context |
| **RTK Query / TanStack Query** | مدیریت Data Fetching، Cache و Invalidation |

### لایه شبکه و Middleware

| ابزار | کاربرد |
|-------|--------|
| **Axios** | HTTP Client اصلی با Interceptor |
| **Custom Middleware** | مدیریت Refresh Token، Retry، Error Handling |
| **Proxy (Next.js Rewrites / API Proxy)** | هدایت امن درخواست‌ها به Backend و رفع CORS |
| **Redux Middleware** | Logger، Thunk و Side Effects |

### ابزارهای توسعه

- **ESLint + Prettier** — کیفیت و فرمت کد
- **Husky + lint-staged** — Git Hooks برای پیش از Commit
- **Jest + React Testing Library** — تست واحد
- **Playwright / Cypress** — تست End-to-End

---

## 🚀 راه‌اندازی پروژه

### پیش‌نیازها

- Node.js نسخه **18+**
- npm / yarn / pnpm

### مراحل نصب

```bash
# 1. کلون کردن ریپازیتوری
git clone https://github.com/SamaRazmi/front-barchasb.git

# 2. ورود به پوشه پروژه
cd front-barchasb

# 3. نصب پکیج‌ها
npm install

# 4. اجرای پروژه در حالت توسعه
npm run dev