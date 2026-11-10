// hooks/usePagination.ts — Hook pagination generik

"use client";

import { useState } from "react";

export interface PaginationState {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export function usePagination(initialLimit = 10) {
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    limit: initialLimit,
    total: 0,
    totalPages: 0,
  });

  const setPage = (page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  };

  const setTotal = (total: number) => {
    setPagination((prev) => ({
      ...prev,
      total,
      totalPages: Math.ceil(total / prev.limit),
    }));
  };

  return { pagination, setPage, setTotal };
}