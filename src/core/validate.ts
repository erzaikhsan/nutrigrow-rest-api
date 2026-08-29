import type { Request } from "express";
import type { ZodType, ZodTypeDef } from "zod";

export function parseBody<T>(req: Request, schema: ZodType<T, ZodTypeDef, unknown>): T {
  return schema.parse(req.body);
}

export function parseQuery<T>(req: Request, schema: ZodType<T, ZodTypeDef, unknown>): T {
  return schema.parse(req.query);
}

export function parseParams<T>(req: Request, schema: ZodType<T, ZodTypeDef, unknown>): T {
  return schema.parse(req.params);
}
