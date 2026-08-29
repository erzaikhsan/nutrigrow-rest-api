import type { Response } from "express";

export interface Envelope<T> {
  success: boolean;
  message: string;
  data: T;
}

export function ok<T>(res: Response, message: string, data: T): void {
  res.status(200).json({ success: true, message, data } satisfies Envelope<T>);
}

export function created<T>(res: Response, message: string, data: T): void {
  res.status(201).json({ success: true, message, data } satisfies Envelope<T>);
}

export const DEFAULT_PAGE_SIZE = 50;
export const MAX_PAGE_SIZE = 200;
export const LIST_SAFETY_CAP = 1000;

export interface ListParams {
  skip?: number;
  take: number;
}

export function toListParams(
  page: number | undefined,
  size: number | undefined,
): ListParams {
  if (page === undefined) {
    const take = size
      ? Math.min(LIST_SAFETY_CAP, Math.max(1, size))
      : LIST_SAFETY_CAP;
    return { take };
  }

  const safePage = Math.max(1, page);
  const safeSize = Math.min(
    MAX_PAGE_SIZE,
    Math.max(1, size ?? DEFAULT_PAGE_SIZE),
  );

  return { skip: (safePage - 1) * safeSize, take: safeSize };
}
