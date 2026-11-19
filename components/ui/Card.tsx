// components/ui/Card.tsx — Modern Clean Surface Card

import React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  outline?: boolean;
  outlineColor?: "primary" | "success" | "warning" | "danger" | "info";
  hoverable?: boolean;
}

const ACCENT_STRIP_MAP = {
  primary: "before:bg-indigo-600",
  success: "before:bg-emerald-500",
  warning: "before:bg-amber-500",
  danger: "before:bg-red-500",
  info: "before:bg-sky-500",
};

export function Card({
  children,
  outline = false,
  outlineColor = "primary",
  hoverable = false,
  className = "",
  ...props
}: CardProps) {
  const accentClass = outline
    ? `relative before:absolute before:top-0 before:left-0 before:right-0 before:h-1 ${ACCENT_STRIP_MAP[outlineColor]}`
    : "";

  return (
    <div
      className={`bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-xs overflow-hidden transition-all duration-200 ${
        hoverable ? "hover:shadow-md hover:-translate-y-0.5" : ""
      } ${accentClass} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  children,
  className = "",
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`px-6 py-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-4 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardTitle({
  children,
  icon,
  className = "",
  ...props
}: React.HTMLAttributes<HTMLHeadingElement> & { icon?: string }) {
  return (
    <h3
      className={`text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2.5 m-0 leading-tight ${className}`}
      {...props}
    >
      {icon && (
        <span className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 text-sm">
          <i className={`bi ${icon}`} aria-hidden="true" />
        </span>
      )}
      <span>{children}</span>
    </h3>
  );
}

export function CardTools({
  children,
  className = "",
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`flex items-center gap-2 shrink-0 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardBody({
  children,
  className = "",
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`p-6 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({
  children,
  className = "",
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`px-6 py-3.5 bg-slate-50/60 dark:bg-slate-850/60 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export default Card;
