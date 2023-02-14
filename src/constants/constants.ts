import { z } from "zod";

export const ORDER = z.enum(["asc", "desc"] as const);

export const ORDER_BY_KEYS = z.enum(["id", "content"] as const);
