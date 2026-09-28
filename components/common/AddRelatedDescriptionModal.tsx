"use client";

import React, { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import FloatingInput from "./FloatingInput";
import { Button } from "@mui/material";
import { useFormStore } from "@/store/formStore";

export type UserType = "employer" | "jobSeeker" | "advertiser" | "digital";

interface AddRelatedDescriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  parentRef: React.RefObject<HTMLDivElement | null>;
  titleModal: string;
  titleAdd: string;
  titleAddHolder: string;
  titleDescription: string;
  userType: UserType | null;
  onSave?: (value: string) => void;
}

interface Item {
  id: number;
  name: string;
  description: string;
}

const AddRelatedDescriptionModal: React.FC<AddRelatedDescriptionModalProps> = ({
  isOpen,
  onClose,
  parentRef,
  titleModal,
  titleAdd,
  titleAddHolder,
  titleDescription,
  userType,
  onSave,
}) => {
  const [parentRect, setParentRect] = useState<DOMRect | null>(null);
  const [nameInput, setNameInput] = useState("");
  const [descInput, setDescInput] = useState("");
  const [items, setItems] = useState<Item[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [modalDesc, setModalDesc] = useState("");
  const [offsetY, setOffsetY] = useState(0);
  const [dragStart, setDragStart] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  const toPersianNumber = (num: number) => {
    const persianDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
    return num
      .toString()
      .split("")
      .map((d) => persianDigits[parseInt(d)])
      .join("");
  };

  // تشخیص موبایل (عرض کمتر از ۷۶۸px)
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // محاسبه موقعیت والد (فقط برای دسکتاپ)
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

  const handleAddOrEdit = () => {
    if (!nameInput.trim()) return;

    if (editingId !== null) {
      setItems((prev) =>
        prev.map((item) =>
          item.id === editingId
            ? { ...item, name: nameInput, description: descInput }
            : item,
        ),
      );
      setEditingId(null);
    } else {
      setItems((prev) => [
        ...prev,
        { id: Date.now(), name: nameInput, description: descInput },
      ]);
    }

    setNameInput("");
    setDescInput("");
    setSelectedItemId(null);
  };

  const handleDelete = (id: number) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    if (selectedItemId === id || editingId === id) {
      setNameInput("");
      setDescInput("");
    }

    if (selectedItemId === id) setSelectedItemId(null);
    if (editingId === id) setEditingId(null);
  };

  const setField = useFormStore((state) => state.setField);
  const shouldSaveToStore =
    titleModal === "توضیحات موقعیت شغلی" ||
    titleModal === "سوابق شغلی" ||
    titleModal === "معرفی شرکت" ||
    titleModal === "توضیحات پروژه";

  const handleItemClick = (item: Item) => {
    setNameInput(item.name);
    setDescInput(item.description);
    setSelectedItemId(item.id);
    setEditingId(null);
  };

  const handleEditClick = (item: Item) => {
    setNameInput(item.name);
    setDescInput(item.description);
    setEditingId(item.id);
    setSelectedItemId(null);
  };

  const getLimits = () => {
    if (!containerRef.current || !contentRef.current) return { min: 0, max: 0 };

    const containerHeight = containerRef.current.clientHeight;
    const contentHeight = contentRef.current.scrollHeight;

    const min = Math.min(0, containerHeight - contentHeight);
    return { min, max: 0 };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setDragStart(e.clientY);

    const handleMouseMove = (ev: MouseEvent) => {
      if (dragStart === null) return;

      const delta = ev.clientY - dragStart;
      const { min, max } = getLimits();

      setOffsetY((prev) => {
        const next = prev + delta;
        return Math.max(min, Math.min(max, next));
      });

      setDragStart(ev.clientY);
    };

    const handleMouseUp = () => {
      setDragStart(null);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setDragStart(e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (dragStart === null) return;

    const delta = e.touches[0].clientY - dragStart;
    const { min, max } = getLimits();

    setOffsetY((prev) => {
      const next = prev + delta;
      return Math.max(min, Math.min(max, next));
    });

    setDragStart(e.touches[0].clientY);
  };

  const getSummaryText = () => {
    if (items.length === 0) {
      if (titleModal === "توضیحات موقعیت شغلی")
        return "هیچ موقعیت شغلی ثبت نشده";
      if (titleModal === "سوابق شغلی") return "هیچ سابقه شغلی ثبت نشده";
      if (titleModal === "معرفی شرکت") return "هیچ توضیحی ثبت نشده";
      if (titleModal === "توضیحات پروژه")
        return "هیچ توضیحی برای آگهی اضافه نشده";
      return "موردی اضافه نشده";
    }

    let itemText = "";
    if (titleModal === "توضیحات موقعیت شغلی") {
      itemText = `${toPersianNumber(items.length)} موقعیت شغلی`;
    } else if (titleModal === "معرفی شرکت") {
      itemText = `${toPersianNumber(items.length)} توضیح شرکت`;
    } else if (titleModal === "توضیحات پروژه") {
      itemText = `${toPersianNumber(items.length)} توضیح آگهی`;
    } else {
      itemText = `${toPersianNumber(items.length)} مورد`;
    }

    return itemText;
  };

  const handleCloseAndSave = () => {
    if (!userType || !shouldSaveToStore) {
      onClose();
      return;
    }

    if (userType === "employer" && titleModal === "توضیحات موقعیت شغلی") {
      setField(
        userType,
        "positionName",
        items.map((item) => item.name),
      );
      setField(
        userType,
        "positionDescription",
        items.map((item) => item.description),
      );
      setField(userType, "additionalInfo", modalDesc);
      setField(userType, "counterPosition", items.length);
    }
    if (userType === "digital" && titleModal === "توضیحات پروژه") {
      setField(
        userType,
        "projectName",
        items.map((item) => item.name),
      );
      setField(
        userType,
        "projectDescription",
        items.map((item) => item.description),
      );
      setField(userType, "additionalInfo", modalDesc);
      setField(userType, "counterProject", items.length);
    }
    if (userType === "jobSeeker" && titleModal === "سوابق شغلی") {
      setField(
        userType,
        "experiencePosition",
        items.map((item) => item.name),
      );
      setField(
        userType,
        "experienceDescription",
        items.map((item) => item.description),
      );
      setField(userType, "counterExperience", items.length);
      setField(userType, "userDesc", modalDesc);
    }

    console.log("Saved Array Description:", {
      userType,
      titleModal,
      items,
      modalDesc,
    });

    if (onSave) {
      onSave(getSummaryText());
    }

    onClose();
  };

  // بارگذاری داده‌های ذخیره‌شده هنگام باز شدن مودال
  useEffect(() => {
    if (!isOpen || !userType) return;

    const data = useFormStore.getState().fields[userType];

    if (userType === "digital" && titleModal === "توضیحات پروژه") {
      const projectNames = data.projectName || [];
      const projectDescriptions = data.projectDescription || [];

      setItems(
        projectNames.map((name: string, idx: number) => ({
          id: Date.now() + idx,
          name,
          description: projectDescriptions[idx] || "",
        })),
      );

      setModalDesc(data.additionalInfo || "");
    }

    if (userType === "employer" && titleModal === "توضیحات موقعیت شغلی") {
      const positionNames = data.positionName || [];
      const positionDescriptions = data.positionDescription || [];

      setItems(
        positionNames.map((name: string, idx: number) => ({
          id: Date.now() + idx,
          name,
          description: positionDescriptions[idx] || "",
        })),
      );

      setModalDesc(data.additionalInfo || "");
    }

    if (userType === "jobSeeker" && titleModal === "سوابق شغلی") {
      const experienceNames = data.experiencePosition || [];
      const experienceDescriptions = data.experienceDescription || [];

      setItems(
        experienceNames.map((name: string, idx: number) => ({
          id: Date.now() + idx,
          name,
          description: experienceDescriptions[idx] || "",
        })),
      );

      setModalDesc("");
    }

    setNameInput("");
    setDescInput("");
    setSelectedItemId(null);
    setEditingId(null);
  }, [isOpen, userType, titleModal]);

  if (!isOpen) return null;

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
      };

  // در دسکتاپ اگر parentRect موجود نباشد، چیزی نمایش نده
  if (!isMobile && !parentRect) return null;

  const modalStyle: React.CSSProperties = isMobile
    ? {
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        borderRadius: "10px",
        width: "90%",
        maxHeight: "90vh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "white",
        overflow: "hidden", // برای جلوگیری از سرریز در حاشیه‌ها
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
        borderRadius: "10px",
        width: "75%",
        height: "74%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "white",
        maxWidth: "800px", // محدودیت برای دسکتاپ
      };

  return createPortal(
    <>
      {/* Backdrop */}
      <div style={backdropStyle} />

      {/* Modal Container */}
      <div style={modalStyle} className="z-[1001] pointer-events-auto">
        {/* Header */}
        <div className="bg-gray-100 w-full flex justify-center items-center relative p-[1.5vh] sm:px-[1.5vh] sm:py-[1.5vh] rounded-t-[10px] flex-shrink-0">
          <h2 className="text-center text-[#143A62] text-[2vh] sm:text-[2.2vh] md:text-[2.6vh] font-semibold w-full">
            {titleModal}
          </h2>
          <button
            onClick={handleCloseAndSave}
            className="absolute left-3 w-6 h-6 flex items-center justify-center"
          >
            <img
              src="/images/close-icon.svg"
              alt="close"
              className="w-6 h-6 cursor-pointer"
            />
          </button>
        </div>

        {/* Body - scrollable */}
        <div className="flex-1 overflow-y-auto px-[4vh] p-[0.2vh] sm:pt-[2.2vh] sm:pb-[1.6vh]">
          <h3 className="text-[1.6vh] md:text-[2vh] font-medium mb-[2vh] md:mb-[2.6vh] mr-[-0.4vh]">
            {titleAdd}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-[1vh] md:gap-[3vh]">
            {/* Input Section */}
            <div>
              <FloatingInput
                placeholder={titleAddHolder}
                value={nameInput}
                onChange={setNameInput}
                variant="input"
                defaultBgColor="#F3F4F6"
                activeLabelBg="#FFFFFF"
                width="90%"
              />
              <FloatingInput
                placeholder="توضیحات"
                value={descInput}
                onChange={setDescInput}
                variant="textarea"
                textareaHeight="14vh"
                defaultBgColor="#F3F4F6"
                activeLabelBg="#FFFFFF"
                width="90%"
              />
              <Button
                variant="contained"
                sx={{
                  backgroundColor: "#143A62",
                  color: "#FFFFFF",
                  fontSize: "2vh",
                  paddingX: "2.5vh",
                  paddingY: "1vh",
                  textTransform: "none",
                  "&:hover": { backgroundColor: "#0F2D52" },
                }}
                onClick={handleAddOrEdit}
                disabled={selectedItemId !== null}
              >
                {editingId !== null
                  ? "ویرایش"
                  : selectedItemId !== null
                    ? "نمایش"
                    : "افزودن"}
              </Button>
            </div>

            {/* Display Section */}
            <div
              ref={containerRef}
              className="
                border border-dashed border-gray-300
                bg-[#F3F4F6]
                h-[12vh] sm:h-[32vh]
                rounded-[10px]
                p-2
                overflow-hidden
                select-none
              "
              onMouseDown={handleMouseDown}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
            >
              <div
                ref={contentRef}
                style={{
                  transform: `translateY(${offsetY}px)`,
                  transition: dragStart ? "none" : "transform 0.15s ease-out",
                }}
                className="flex flex-col gap-2"
              >
                {items.length === 0 ? (
                  <div className="text-gray-500 text-center py-4">
                    {titleModal === "توضیحات موقعیت شغلی"
                      ? "هیچ موقعیت شغلی ثبت نشده"
                      : titleModal === "سوابق شغلی"
                        ? "هیچ سابقه شغلی موجود نیست"
                        : "هیچ موردی ثبت نشده"}
                  </div>
                ) : (
                  items.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white rounded-lg p-2 flex justify-between items-start cursor-pointer hover:bg-gray-50"
                      onClick={() => handleItemClick(item)}
                    >
                      <div>
                        <div className="font-semibold">{item.name}</div>
                        <div className="text-sm truncate max-w-[200px]">
                          {item.description}
                        </div>
                      </div>

                      <div className="flex gap-1 sm:gap-2 items-center">
                        <button
                          className="w-[2vh] h-[2vh] bg-gray-200 rounded-full flex items-center justify-center"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditClick(item);
                          }}
                        >
                          <img
                            src="/images/edit-icon.svg"
                            alt="edit"
                            className="w-[1.4vh] h-[1.4vh]"
                          />
                        </button>

                        <button
                          className="w-[2vh] h-[2vh] bg-gray-200 rounded-full flex items-center justify-center"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(item.id);
                          }}
                        >
                          <img
                            src="/images/delete-icon.svg"
                            alt="delete"
                            className="w-[1.4vh] h-[1.4vh]"
                          />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="mt-[1vh] sm:mt-[2vh]">
            <h3 className="text-[1.6vh] sm:text-[2vh] font-medium mb-[0.5vh] sm:mb-[2.6vh] mr-[-0.4vh]">
              {titleDescription}
            </h3>
            <FloatingInput
              placeholder="توضیحات (اختیاری)"
              value={modalDesc}
              onChange={(val) => setModalDesc(val)}
              variant="textarea"
              textareaHeight="15vh"
              width="100%"
              defaultBgColor="#F3F4F6"
              activeLabelBg="#FFFFFF"
            />
          </div>
        </div>
      </div>
    </>,
    document.body,
  );
};

export default AddRelatedDescriptionModal;
