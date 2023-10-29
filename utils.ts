import { z } from "hono_zod_openapi"

export const openApiJson = <const T extends z.ZodTypeAny>(schema: T) => ({
	content: { "application/json": { schema } },
})

export const errorJson = <const T extends z.ZodTypeAny>(error: T) =>
	openApiJson(z.object({ error }))

export const idSchema = z.string().refine((x) => /^\d+$/.test(x)).transform(Number)
