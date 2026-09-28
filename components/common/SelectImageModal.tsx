"use client";

import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useFormStore, UserType } from "@/store/formStore";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface SelectImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (images: ImageItem[]) => void;
  parentRef: React.RefObject<HTMLDivElement | null>;
  userType: UserType;
  entityId?: string;
}

interface ImageItem {
  src: string;
  file?: File;
  fromApi?: boolean;
  isMain?: boolean;
}

const MAX_FILES = 9;
const MAX_SIZE_MB = 2;

const SelectImageModal: React.FC<SelectImageModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  parentRef,
  userType,
  entityId,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [images, setImages] = useState<ImageItem[]>([]);
  const dragIndex = useRef<number | null>(null);
  const [parentRect, setParentRect] = useState<DOMRect | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  const entityKey = entityId ?? "__temp__";

  const setField = useFormStore((state) => state.setField);
  const getFormData = useFormStore((state) => state.getFormData);

  // تشخیص موبایل
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // محاسبه موقعیت والد (فقط در دسکتاپ استفاده می‌شود)
  useEffect(() => {
    if (!isOpen || !parentRef.current || isMobile) return;

    const updateRect = () => {
      if (!parentRef.current) return;
      setParentRect(parentRef.current.getBoundingClientRect());
    };

    updateRect();

    const resizeObserver = new ResizeObserver(updateRect);
    resizeObserver.observe(parentRef.current);

    window.addEventListener("scroll", updateRect);
    window.addEventListener("resize", updateRect);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("scroll", updateRect);
      window.removeEventListener("resize", updateRect);
    };
  }, [isOpen, parentRef, isMobile]);

  // Helper: ذخیره در store با مدیریت isMain
  const updateStore = (updatedImages: ImageItem[]) => {
    // اولین عکس همیشه isMain = true
    const withMain = updatedImages.map((img, idx) => ({
      ...img,
      isMain: idx === 0,
    }));
    setImages(withMain);

    setField(userType, entityKey, {
      images: withMain.filter((i) => i.file).map((i) => i.file!),
      imagesFromApi: withMain
        .filter((i) => i.fromApi)
        .map((i) => ({ url: i.src, isMain: i.isMain })),
    });
  };

  // بارگذاری اولیه با entityKey
  useEffect(() => {
    if (!isOpen) return;

    const entityData = (getFormData(userType) as any)?.[entityKey] || {};

    const storedFiles = (entityData.images as File[]) || [];
    const storedApi = (entityData.imagesFromApi as any[]) || [];

    const apiImages: ImageItem[] = storedApi.map((img: any) => ({
      src: img.url,
      fromApi: true,
      isMain: img.isMain || false,
    }));

    const fileImages: ImageItem[] = storedFiles.map((file: File) => ({
      src: URL.createObjectURL(file),
      file,
    }));

    let combined = [...apiImages, ...fileImages].slice(0, MAX_FILES);
    // اگر هیچ عکسی isMain نداشت، اولین عکس را اصلی کن
    if (combined.length && !combined.some((img) => img.isMain)) {
      combined[0].isMain = true;
    }
    setImages(combined);
  }, [isOpen, userType, entityKey, getFormData]);

  // بستن modal هنگام کلیک خارج
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;
  // در دسکتاپ نیاز به parentRect داریم
  if (!isMobile && !parentRect) return null;

  const handleFiles = (files: FileList | null) => {
    if (!files) return;

    const newFiles: ImageItem[] = Array.from(files).map((file) => ({
      src: URL.createObjectURL(file),
      file,
    }));

    const tooLarge = newFiles.filter(
      (f) => f.file!.size > MAX_SIZE_MB * 1024 * 1024,
    );
    if (tooLarge.length) {
      toast.error("اندازه عکس(ها) بیش از حد مجاز (2 مگابایت) هستند!");
      return;
    }

    // اضافه کردن عکس‌های جدید به ابتدای آرایه (تا اصلی شوند)
    let combined = [...newFiles, ...images].slice(0, MAX_FILES);
    updateStore(combined);
  };

  const handleRemove = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    updateStore(newImages);
    dragIndex.current = null;
  };

  const handleConfirm = () => {
    onSelect(images);
    onClose();
  };

  const isUploadDisabled = images.length >= MAX_FILES;

  const displayImages = [...images];
  while (displayImages.length < MAX_FILES)
    displayImages.push({ src: "", file: undefined });

  // استایل‌های شرطی برای موبایل / دسکتاپ
  const backdropStyle: React.CSSProperties = isMobile
    ? {
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backdropFilter: "blur(4px)",
        backgroundColor: "rgba(0,0,0,0.1)",
        zIndex: 1000,
        pointerEvents: "auto",
      }
    : {
        position: "absolute",
        top: parentRect ? parentRect.top + window.scrollY : 0,
        left: parentRect ? parentRect.left + window.scrollX : 0,
        width: parentRect ? parentRect.width : 0,
        height: parentRect ? parentRect.height : 0,
        backdropFilter: "blur(4px)",
        backgroundColor: "rgba(0,0,0,0.1)",
        zIndex: 1000,
        pointerEvents: "auto",
        borderRadius: "20px",
      };

  const modalStyle: React.CSSProperties = isMobile
    ? {
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        zIndex: 1001,
        width: "90%",
        maxHeight: "90vh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "white/70",
        backdropFilter: "blur(12px)",
        borderRadius: "0.75rem",
        overflow: "hidden",
      }
    : {
        position: "absolute",
        top: parentRect
          ? parentRect.top + window.scrollY + parentRect.height / 2
          : 0,
        left: parentRect
          ? parentRect.left + window.scrollX + parentRect.width / 2
          : 0,
        transform: "translate(-50%, -50%)",
        zIndex: 1001,
        width: "60%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "white/70",
        backdropFilter: "blur(12px)",
        borderRadius: "0.75rem",
        overflow: "hidden",
        maxHeight: "90vh", // برای جلوگیری از سرریز
      };

  return createPortal(
    <>
      <div style={backdropStyle} />

      <div
        ref={modalRef}
        style={modalStyle}
        className="bg-white/70 backdrop-blur-md rounded-xl flex flex-col overflow-hidden"
      >
        <div className="relative bg-gray-200 px-4 py-2 flex justify-center items-center w-full flex-shrink-0">
          <button
            onClick={onClose}
            className="absolute left-2 w-6 h-6 flex items-center justify-center cursor-pointer"
          >
            ✕
          </button>
          <h2 className="text-[2vh] sm:text-[2.5vh] font-semibold">
            تصاویر آگهی
          </h2>
        </div>

        <div className="flex flex-col md:flex-row gap-4 p-4 overflow-auto flex-1">
          {/* Main preview */}
          <div className="w-[80%] h-[90%] mx-auto md:w-1/2 md:h-auto flex flex-col border border-gray-600 rounded-lg overflow-hidden max-h-full">
            {images.find((i) => i.isMain)?.src ? (
              <img
                src={images.find((i) => i.isMain)!.src}
                className="object-contain w-full h-full max-h-[45vh]"
                alt="پیش‌نمایش اصلی"
              />
            ) : (
              <span className="text-gray-400 flex-1 flex items-center justify-center">
                هیچ عکسی انتخاب نشده
              </span>
            )}
          </div>

          {/* Grid */}
          <div className="flex flex-col gap-2 w-full md:w-1/2">
            <div className="grid grid-cols-3 gap-1 justify-items-center">
              {displayImages.map((img, index) => (
                <div
                  key={img.src + index}
                  draggable={!!img.src}
                  onDragStart={() => (dragIndex.current = index)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => {
                    if (dragIndex.current === null) return;

                    const from = dragIndex.current;
                    const to = index;
                    if (from === to) return;

                    const updated = [...images];
                    const [movedItem] = updated.splice(from, 1);
                    updated.splice(to, 0, movedItem);

                    updateStore(updated);
                    dragIndex.current = null;
                  }}
                  className={`relative h-[10vh] w-[10vh] rounded-lg flex items-center justify-center overflow-hidden bg-gray-200 ${
                    img.src ? "cursor-move" : ""
                  }`}
                >
                  {img.src ? (
                    <>
                      <img
                        src={img.src}
                        className="w-full h-full object-cover"
                        alt="تصویر"
                      />
                      <button
                        onClick={() => handleRemove(index)}
                        className="absolute top-1 left-1 w-4 h-4 cursor-pointer"
                      >
                        ✕
                      </button>
                      {index === 0 && (
                        <div className="absolute bottom-1 right-1 px-1 py-0.5 text-xs text-white rounded bg-green-600">
                          اصلی
                        </div>
                      )}
                    </>
                  ) : (
                    <span
                      className={`text-[2vh] text-gray-400 cursor-pointer ${
                        isUploadDisabled ? "pointer-events-none opacity-50" : ""
                      }`}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      +
                    </span>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-4 flex gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadDisabled}
                className={`flex-1 py-2 text-[1.5vh] md:text-[1.8vh] bg-blue-500 text-white rounded-md ${
                  isUploadDisabled ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                بارگذاری عکس
              </button>
              <button
                onClick={handleConfirm}
                className="flex-1 py-2 text-[1.5vh] md:text-[1.8vh] bg-blue-900 text-white rounded-md"
              >
                تایید
              </button>
            </div>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      <ToastContainer />
    </>,
    document.body,
  );
};

export default SelectImageModal;
