import { Kysely, sql } from "kysely"
import type { DB } from "../types.ts"
import { postingListRoute, PostingResponse } from "./posting_routes.ts"
import { z } from "hono_zod_openapi"

export const getSinglePosting = (db: Kysely<DB>, id: number) =>
	db
		.selectFrom("posting")
		.selectAll()
		.where("posting.id", "=", id)
		.executeTakeFirst()

export const updateHashtag = (db: Kysely<DB>, id: number) =>
	db
		.updateTable("hashtag")
		.set({ content: "test" })
		.where("hashtag.id", "=", id)

type Query = z.infer<(typeof postingListRoute)["request"]["query"]> & { pageOffset: number }

const getAllPostings = (db: Kysely<DB>) =>
	db
		.selectFrom("posting as p")
		.innerJoin("posting_to_hashtag as ph_all", "ph_all.posting_id", "p.id")
		.innerJoin("hashtag as h_all", "h_all.id", "ph_all.hashtag_id")
		.select(({ ref }) => [
			"p.type",
			sql<string>`substr(${ref("p.title")}, 1, 10) || '...'`.as("title"),
			sql<string>`substr(${ref("p.content")}, 1, 20) || '...'`.as("content"),
			"p.view_count",
			"p.like_count",
			"p.created_at",
			"p.updated_at",
			"p.share_count",
			sql<string[]>`json_group_array(${ref("h_all.content")})`.as("hashtags"),
		])
		.groupBy("p.id")

export const getPostingList = async (db: Kysely<DB>, query: Query): Promise<PostingResponse[]> => {
	const {
		hashtag,
		type,
		order_by,
		sort,
		search_by,
		search,
		page_count,
		pageOffset,
	} = query

	let sqlQuery = getAllPostings(db)
		.orderBy(order_by, sort)
		.limit(page_count)
		.offset(pageOffset)

	if (hashtag) {
		sqlQuery = sqlQuery.where("p.id", "in", (eb) =>
			eb
				.selectFrom("posting as p_inner")
				.select("p_inner.id").distinct()
				.innerJoin("posting_to_hashtag as ph_inner", "ph_inner.posting_id", "p_inner.id")
				.innerJoin("hashtag as h_inner", "h_inner.id", "ph_inner.hashtag_id")
				.where("h_inner.content", "=", hashtag))
	}

	if (type !== undefined) {
		sqlQuery = sqlQuery.where("p.type", "=", type)
	}

	if (search) {
		sqlQuery = sqlQuery.where(({ eb, ref }) => {
			const searchOn = search_by === "title,content"
				? sql<string>`(${ref("p.title")} || ${ref("p.content")})`
				: `p.${search_by}` as const

			return eb(searchOn, "like", `%${search}%`)
		})
	}

	const postingList = await sqlQuery.execute()
	return postingList
}

export const updateShare = async (db: Kysely<DB>, id: number, count: number) =>
	await db
		.updateTable("posting")
		.set({ share_count: count })
		.where("posting.id", "=", id)
		.execute()
