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
				const url = `${endpoint}${id}`

				const response = await fetch(url, { method: "POST" })
                await response.body?.cancel()

				if (response.status == 200) {
					// 좋아요 성공
					// note : sns서버 또는 게시물의 좋아요를 가지고 와야 하지만 임시로 좋아요 수만 증가하게 개발 추후 수정 필요
					await updateLikes(db, id, likes.like_count + 1)
					return c.jsonT({ message: `좋아요 진짜 성공 :${likes.like_count}` })
				} else {
					// 실패 처리
					// note : 임시로 sns서버에 좋아요를 가지고 오지 못했을 때도 성공으로 하여 기능 구현함, 추후 수정 필요
					await updateLikes(db, id, likes.like_count + 1)
					return c.jsonT({ message: `좋아요 가짜 성공 :${likes.like_count}` })
				}
			} else {
				// 게시글 없음
				return c.jsonT({ error: "게시물이 없습니다" }, 404)
			}
		} catch (error) {
			console.error("An error occurred:", error)
			return c.jsonT({ error: "Not Found 4" }, 404)
		}
	})
