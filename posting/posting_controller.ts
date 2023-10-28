import type { Kysely } from "kysely"
import type { DB } from "../types.ts"
import { OpenAPIHono } from "hono_zod_openapi"
import { postingListRoute, postingRoute, postingShareRoute } from "./posting_routes.ts"
import { getPostingList, getSinglePosting, updateShare } from "./posting_data.ts"
import typeUrl from "./typeUrl.json" with { type: "json" };

export const postingController = (db: Kysely<DB>) =>
	new OpenAPIHono().openapi(postingRoute, async (c) => {
		const { id } = c.req.valid("param")
		const posting = await getSinglePosting(db, id)

		return posting ? c.jsonT(posting) : c.jsonT({ error: "Not Found" }, 404)
	})

export const postingListController = (db: Kysely<DB>) =>
	new OpenAPIHono().openapi(postingListRoute, async (c) => {
		const query = c.req.valid("query");

		// TODO: 유저 정보 넘겨받는 방법 (header?)에 따라 hastag default 값 정하기(계정 아이디)
		query.hashtag = query.hashtag ? query.hashtag : '';

		// 페이지 설정
		let pageLimit = query.pageCount;
		query.pageOffset = query.page > 1 ? pageLimit * (query.page - 1) : 0;

		const posting = await getPostingList(db, query);

		// 데이터 가공(관리id 등 삭제)
		posting.map(data => {
			delete data.posting_id;
			data.hashtags = JSON.parse(data.hashtags);

			// TODO: 날짜 format 맞춘다면 dayjs 사용
		})
	
		return posting ? c.jsonT(posting) : c.jsonT({ error: "Not Found" }, 404);
	})

export const postingShareController = (db: Kysely<DB>) =>
	new OpenAPIHono().openapi(postingShareRoute, async (c) => {
		const { id } = c.req.valid("param");
		const posting = await getSinglePosting(db, id);

		if (posting) {
			const url = `${typeUrl[posting.type]}/${posting.id}`;

			const response = await fetch(url, { method: "POST" });
			await response.body?.cancel()
			
			if (response.status === 200) {
				await updateShare(db, id, posting.share_count + 1);
			} else {
				// WARN: 추후 키 설정 이후에 정상동작(throw error)
				await updateShare(db, id, posting.share_count + 1);
			}
	
			return c.jsonT({ share_count: posting.share_count + 1 });
		} else {
			return c.jsonT({ error: "게시물이 없습니다" }, 404);
		} 
	})