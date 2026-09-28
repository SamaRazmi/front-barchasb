"use client";
import React from "react";
import { useUser } from "@/context/UserContext";
import Navigation from "./Navigation";
import Profile from "./Profile";
import { TabKeys } from "@/types/types";

interface SidebarProps {
  selectedTab: TabKeys;
  onTabChange?: (tab: TabKeys) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ selectedTab, onTabChange }) => {
  const { user } = useUser();
  const isLoggedIn = !!user;

  // اگر کاربر لاگین نباشد، هیچ چیزی نمایش نده
  if (!isLoggedIn) {
    return null;
  }

  return (
    <div className="hidden w-[1/4] bg-[#143A62] h-full p-6 pl-0 md:flex md:flex-col">
      {/* پروفایل */}
      <div className="h-[30%] w-[90%]">
        <Profile />
      </div>

      {/* منو */}
      <div className="h-[70%] w-[90%]">
        <Navigation
          activeId={selectedTab}
          onItemClick={(id) => {
            const validTabs: TabKeys[] = [
              "home",
              "ads",
              "messages",
              "plugins",
              "projects",
              "billing",
              "support",
              "chat",
            ];

            if (validTabs.includes(id as TabKeys)) {
              onTabChange?.(id as TabKeys);
            }
          }}
        />
      </div>
    </div>
  );
};

export default Sidebar;
