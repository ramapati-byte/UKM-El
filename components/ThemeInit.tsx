"use client";

import { useEffect } from "react";

export default function ThemeInit() {
  useEffect(() => {
    try {
      const t =
        localStorage.getItem("app-theme") ||
        localStorage.getItem("lte-theme") ||
        "light";
      const d =
        t === "auto"
          ? window.matchMedia("(prefers-color-scheme: dark)").matches
            ? "dark"
            : "light"
          : t;
      if (d === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
      document.documentElement.setAttribute("data-theme", d);
      document.documentElement.setAttribute("data-bs-theme", d);
    } catch {
      // Abaikan jika localStorage tidak tersedia
    }
  }, []);

  return null;
}
