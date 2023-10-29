import type { Kysely } from "kysely"
import type { DB } from "../types.ts"
import { OpenAPIHono } from "hono_zod_openapi"
import { postingListRoute, postingRoute, postingShareRoute } from "./posting_routes.ts"
import { getPostingList, getSinglePosting, updateShare, updateViewCount } from "./posting_data.ts"
import typeUrl from "./typeUrl.json" with { type: "json" }

export const postingController = (db: Kysely<DB>) =>
	new OpenAPIHono().openapi(postingRoute, async (c) => {
		const { id } = c.req.valid("param")
		const posting = await getSinglePosting(db, id)
		if (posting) {
			const _viewCount = posting.view_count + 1
			await updateViewCount(db, id, _viewCount)
			return c.jsonT(posting)
		} else {
			return c.jsonT({ error: "Not Found" }, 404)
		}
	})

export const postingListController = (db: Kysely<DB>) =>
	new OpenAPIHono().openapi(postingListRoute, async (c) => {
		const query = c.req.valid("query")

		// TODO: 유저 정보 넘겨받는 방법 (header?)에 따라 hastag default 값 정하기(계정 아이디)

		// 페이지 설정
		const pageOffset = query.page > 1 ? query.page_count * (query.page - 1) : 0

		const posting = await getPostingList(db, { ...query, pageOffset })

		// TODO: 날짜 format 맞춘다면 dayjs 사용
		return posting ? c.jsonT(posting) : c.jsonT({ error: "Not Found" }, 404)
	})

export const postingShareController = (db: Kysely<DB>) =>
	new OpenAPIHono().openapi(postingShareRoute, async (c) => {
		const { id } = c.req.valid("param")
		const posting = await getSinglePosting(db, id)

		if (posting) {
			const url = `${typeUrl[posting.type]}/${posting.id}`

			const response = await fetch(url, { method: "POST" })
			await response.body?.cancel()

			const updatedShareCount = posting.share_count + 1

			if (response.status === 200) {
				await updateShare(db, id, updatedShareCount)
			} else {
				// WARN: 추후 키 설정 이후에 정상동작(throw error)
				await updateShare(db, id, updatedShareCount)
			}

			return c.jsonT({ share_count: updatedShareCount })
		} else {
			return c.jsonT({ error: "게시물이 없습니다" }, 404)
		}
	})
