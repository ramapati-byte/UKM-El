// components/ui/Tabs.tsx — Modern Segmented / Underline Tab Navigation

import React from "react";

export interface TabItem {
  id: string;
  label: string;
  icon?: string; // class Bootstrap Icons
  count?: number;
  disabled?: boolean;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
  variant?: "underline" | "pill";
}

export default function Tabs({
  tabs,
  activeTab,
  onChange,
  className = "",
  variant = "underline",
}: TabsProps) {
  if (variant === "pill") {
    return (
      <div
        className={`p-1 bg-slate-100/80 dark:bg-slate-800/80 rounded-2xl inline-flex items-center gap-1 overflow-x-auto scrollbar-hide ${className}`}
        role="tablist"
      >
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              disabled={tab.disabled}
              onClick={() => onChange(tab.id)}
              className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all duration-150 focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed ${
                isActive
                  ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              {tab.icon && (
                <i className={`bi ${tab.icon} text-sm`} aria-hidden="true" />
              )}
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-extrabold ${
                    isActive
                      ? "bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300"
                      : "bg-slate-200/80 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                  }`}
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

  return (
    <div
      className={`border-b border-slate-200/80 dark:border-slate-800 flex items-center gap-2 overflow-x-auto scrollbar-hide ${className}`}
      role="tablist"
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            disabled={tab.disabled}
            onClick={() => onChange(tab.id)}
            className={`group inline-flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-all focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed relative ${
              isActive
                ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700"
            }`}
          >
            {tab.icon && (
              <i
                className={`bi ${tab.icon} transition-colors ${
                  isActive ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400 group-hover:text-slate-600"
                }`}
                aria-hidden="true"
              />
            )}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                  isActive
                    ? "bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                }`}
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
