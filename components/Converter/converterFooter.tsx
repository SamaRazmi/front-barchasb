import Image from "next/image";
import FooterLogo from "./footerLogo";

export default function ConverterFooter() {
  return (
    <div className="relative w-full overflow-x-hidden">
      {/* تصویر فوتر با عرض کامل و ارتفاع خودکار */}
      <Image
        src="/images/footerr2.svg"
        alt="footer"
        width={1920}
        height={400}
        className="w-full h-auto"
        priority
      />

      {/* لوگو در مرکز با موقعیت absolute */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <FooterLogo />
      </div>
    </div>
  );
}
