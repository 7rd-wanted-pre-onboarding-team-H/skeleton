import type { Kysely } from "kysely"
import type { DB } from "../types.ts"
import { OpenAPIHono } from "hono_zod_openapi"
import { shareRoute } from "./share_routes.ts"
import { getPostShare, updateShare } from "./share_data.ts"

import endpoints from "../endpoint.json" with { type: "json" }

export const shareController = (db: Kysely<DB>) => 
	new OpenAPIHono().openapi(shareRoute, async (c) => {
		const { id } = c.req.valid("param")

		// getPostShare 함수로 좋아요 정보 가져오기
		const share = await getPostShare(db, id)

		if (!share) {
			return c.jsonT({ error: "게시물이 없습니다" }, 404)
		}

		const endpoint = endpoints[share.type]
		const url = `${endpoint}/share/${id}`

		const response = await fetch(url, { method: "POST" })
		await response.body?.cancel()

		const updatedShare = share.share_count + 1
		const message = response.status === 200 ? "진짜" : "가짜"

		await updateShare(db, id, updatedShare)

		return c.jsonT({ message: `좋아요 ${message} 성공`, Share_count: updatedShare })
	})
