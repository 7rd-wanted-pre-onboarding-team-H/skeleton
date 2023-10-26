// https://transform.tools/typescript-to-zod으로 생성함
import { z } from "zod"

export const hashtagSchema = z.object({
	content: z.string(),
	id: z.number(),
})

export const postingSchema = z.object({
	content: z.string(),
	content_id: z.string(),
	created_at: z.string(),
	id: z.number(),
	like_count: z.number(),
	share_count: z.number(),
	title: z.string(),
	type: z.string(),
	updated_at: z.string(),
	user_id: z.number(),
	view_count: z.number(),
})

export const postingToHashtagSchema = z.object({
	hashtag_id: z.number(),
	posting_id: z.number(),
})

export const userSchema = z.object({
	created_at: z.string(),
	email: z.string(),
	id: z.number(),
	password: z.string(),
})

export const dbSchema = z.object({
	hashtag: hashtagSchema,
	posting: postingSchema,
	posting_to_hashtag: postingToHashtagSchema,
	user: userSchema,
})
