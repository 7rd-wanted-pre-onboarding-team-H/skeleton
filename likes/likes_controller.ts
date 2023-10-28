import type { Kysely } from "kysely"
import type { DB } from "../types.ts"
import { OpenAPIHono } from "hono_zod_openapi"
import { likesRoute } from "./likes_routes.ts"
import { getPostLikes, updateLikes } from "./likes_data.ts"

import endpoints from "../endpoint.json" with { type: "json" }

export const likesController = (db: Kysely<DB>) =>
	new OpenAPIHono().openapi(likesRoute, async (c) => {
		try {
			const { id } = c.req.valid("param")

			// getPostlikes 함수로 좋아요 정보 가져오기
			const likes = await getPostLikes(db, id)

			if (likes) {
				const endpoint = endpoints[likes.type]
				const url = `${endpoint}/likes/${id}`

				const response = await fetch(url, { method: "POST" })
				await response.body?.cancel()
                const updatedLikes = likes.like_count + 1
                await updateLikes(db, id, updatedLikes)
                const message = response.status === 200 ? '진짜' : '가짜'

                return c.jsonT({ message: `좋아요 ${message} 성공`, like_count: updatedLikes })
			} else {
				// 게시글 없음
				return c.jsonT({ error: "게시물이 없습니다" }, 404)
			}
		} catch (error) {
			console.error("An error occurred:", error)
			return c.jsonT({ error: "Not Found 4" }, 404)
		}
	})
