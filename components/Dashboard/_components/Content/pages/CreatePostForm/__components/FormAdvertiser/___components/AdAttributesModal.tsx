"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useQuery } from "@tanstack/react-query";
import FloatingInput from "@/components/common/FloatingInput";
import { useFormStore } from "@/store/formStore";
import { fetchCategoryAttributes } from "@/api/apiCategories";

interface AdAttributesModalProps {
  categoryName: string;
  parentRef: React.RefObject<HTMLDivElement | null>;
  onClose: () => void;
}

const AdAttributesModal: React.FC<AdAttributesModalProps> = ({
  categoryName,
  parentRef,
  onClose,
}) => {
  const { getFormData, setField } = useFormStore();
  const [values, setValues] = useState<Record<string, any>>({});
  const [parentRect, setParentRect] = useState<DOMRect | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["ad-category-attributes", categoryName],
    queryFn: () => fetchCategoryAttributes(categoryName),
    enabled: Boolean(categoryName),
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const advertiserData = getFormData("advertiser") as Record<string, any>;
    if (advertiserData?.attributesCategory !== categoryName) {
      setValues({});
    } else if (advertiserData?.attributes) {
      try {
        const savedAttributes = JSON.parse(advertiserData.attributes);
        setValues(savedAttributes);
      } catch {
        setValues({});
      }
    }
  }, [categoryName, getFormData]);

  useEffect(() => {
    if (!parentRef.current || isMobile) return;

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
  }, [parentRef, isMobile]);

  const handleChange = (fieldName: string, value: string) => {
    setValues((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
  };

  const handleClose = () => {
    setField("advertiser", "attributes", JSON.stringify(values));
    setField("advertiser", "attributesCategory", categoryName);
    onClose();
  };

  if (isLoading || isError || !data) return null;
  if (!isMobile && !parentRect) return null;

  const backdropStyle: React.CSSProperties = isMobile
    ? {
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backdropFilter: "blur(4px)",
        backgroundColor: "rgba(0,0,0,0.2)",
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
        backgroundColor: "rgba(0,0,0,0.2)",
        zIndex: 1000,
        pointerEvents: "auto",
        borderRadius: "16px",
      };

  const modalStyle: React.CSSProperties = isMobile
    ? {
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        zIndex: 1001,
        width: "90%",
        maxHeight: "80vh",
        backgroundColor: "white",
        borderRadius: "0.75rem",
        overflowY: "auto",
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
        width: "30%",
        maxHeight: "80vh",
        backgroundColor: "white",
        borderRadius: "0.75rem",
        overflowY: "auto",
      };

  return createPortal(
    <>
      <div style={backdropStyle} onClick={handleClose} />

      <div style={modalStyle} className="bg-white rounded-xl overflow-y-auto">
        <div className="relative flex items-center justify-center px-4 py-3 bg-gray-200 rounded-t-xl">
          <span className="font-bold text-lg" style={{ color: "#143A62" }}>
            مشخصات {data.categoryName}
          </span>
          <button onClick={handleClose} className="absolute left-4">
            <img src="/images/close-icon.svg" alt="close" className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col gap-[1.6vh] p-4">
          {data.fields.map((field) => (
            <FloatingInput
              key={field.name}
              placeholder={field.label}
              value={values[field.name] ?? ""}
              onChange={(val) => handleChange(field.name, val)}
              width="100%"
              height="6vh"
              activeLabelBg="white"
            />
          ))}
        </div>
      </div>
    </>,
    document.body,
  );
};

export default AdAttributesModal;
