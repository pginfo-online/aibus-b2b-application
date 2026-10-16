"use client";

import React, { createContext, useContext } from "react";
import { cn } from "@/lib/utils";

interface TabsContextValue {
  value: string;
  onValueChange: (val: string) => void;
}

const TabsContext = createContext<TabsContextValue | null>(null);

export interface TabItem {
  id: string;
  label: string;
  count?: number;
  icon?: React.ReactNode;
}

export interface TabsProps {
  tabs?: TabItem[];
  activeTab?: string;
  onChange?: (tabId: string) => void;
  value?: string;
  onValueChange?: (val: string) => void;
  children?: React.ReactNode;
  className?: string;
}

export function Tabs({
  tabs,
  activeTab,
  onChange,
  value,
  onValueChange,
  children,
  className,
}: TabsProps) {
  // If compound children are provided:
  if (children) {
    const currentVal = value ?? activeTab ?? "";
    const handleValChange = onValueChange ?? onChange ?? (() => {});

    return (
      <TabsContext.Provider value={{ value: currentVal, onValueChange: handleValChange }}>
        <div className={cn("w-full", className)}>{children}</div>
      </TabsContext.Provider>
    );
  }

  // Otherwise, render array-based tabs
  if (!tabs) return null;
  const currentTab = activeTab ?? value ?? tabs[0]?.id;
  const handleTabChange = onChange ?? onValueChange ?? (() => {});

  return (
    <div
      role="tablist"
      className={cn(
        "flex items-center gap-1 p-1 bg-slate-100 rounded-xl dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60",
        className
      )}
    >
      {tabs.map((tab) => {
        const isActive = currentTab === tab.id;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => handleTabChange(tab.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all focus:outline-none",
              isActive
                ? "bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-slate-100"
                : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
            )}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={cn(
                  "px-1.5 py-0.2 rounded-full text-[10px] font-bold",
                  isActive
                    ? "bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400"
                    : "bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300"
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export function TabsList({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      role="tablist"
      className={cn(
        "flex items-center gap-1 p-1 bg-slate-100 rounded-xl dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60",
        className
      )}
    >
      {children}
    </div>
  );
}

export function TabsTrigger({
  value,
  children,
  className,
}: {
  value: string;
  children: React.ReactNode;
  className?: string;
}) {
  const ctx = useContext(TabsContext);
  const isActive = ctx?.value === value;

  return (
    <button
      role="tab"
      aria-selected={isActive}
      onClick={() => ctx?.onValueChange(value)}
      className={cn(
        "flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all focus:outline-none",
        isActive
          ? "bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-slate-100"
          : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200",
        className
      )}
    >
      {children}
    </button>
  );
}

export function TabsContent({
  value,
  children,
  className,
}: {
  value: string;
  children: React.ReactNode;
  className?: string;
}) {
  const ctx = useContext(TabsContext);
  if (ctx?.value !== value) return null;

  return (
    <div role="tabpanel" className={cn("mt-4", className)}>
      {children}
    </div>
  );
}
