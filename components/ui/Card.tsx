// components/ui/Card.tsx — Komponen Card kanonik AdminLTE 4
// Struktur: Card > CardHeader (CardTitle + CardTools) + CardBody + CardFooter

import React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  outline?: boolean;
  outlineColor?: "primary" | "success" | "warning" | "danger" | "info";
}

const OUTLINE_MAP = {
  primary: "border-t-4 border-t-indigo-600",
  success: "border-t-4 border-t-emerald-600",
  warning: "border-t-4 border-t-amber-500",
  danger: "border-t-4 border-t-red-600",
  info: "border-t-4 border-t-sky-600",
};

export function Card({
  children,
  outline = false,
  outlineColor = "primary",
  className = "",
  ...props
}: CardProps) {
  const outlineClass = outline ? OUTLINE_MAP[outlineColor] : "";

  return (
    <div
      className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs overflow-hidden transition-colors ${outlineClass} ${className}`}
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
      className={`px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4 ${className}`}
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
      className={`text-base font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2 m-0 ${className}`}
      {...props}
    >
      {icon && <i className={`bi ${icon} text-indigo-600 dark:text-indigo-400`} aria-hidden="true" />}
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
    <div className={`p-5 ${className}`} {...props}>
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
      className={`px-5 py-3.5 bg-slate-50/70 dark:bg-slate-900/60 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export default Card;
