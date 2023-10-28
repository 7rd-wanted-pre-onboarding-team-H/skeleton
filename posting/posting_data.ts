import { Kysely, sql } from "kysely"
import type { DB } from "../types.ts"

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

export const getPostingList = async (db: Kysely<DB>, query) => {
	const { 
		hashtag,
		type,
		orderBy,
		sort,
		searchBy,
		search,
		pageCount,
		pageOffset
	 } = query;

	let sqlQuery = db
		.selectFrom("posting as p")
		.innerJoin("posting_to_hashtag as ph_all", "ph_all.posting_id", "p.id")
		.innerJoin("hashtag as h_all", "h_all.id", "ph_all.hashtag_id")
		.select((eb) => [
			"p.id as posting_id",
			"p.type as type",
			sql<string[]>`substr(p.title, 1, 10) || '...'`.as("title"),
			sql<string[]>`substr(p.content, 1, 20) || '...'`.as("content"),
			"p.view_count as view_count",
			"p.like_count as like_count",
			"p.created_at as created_at",
			"p.updated_at as updated_at",
			sql<string[]>`json_group_array(${eb.ref("h_all.content")})`.as("hashtags"),
		])
		.limit(`${pageCount}`)
		.offset(`${pageOffset}`)
		.where("p.id", "in", (eb) =>
			eb
				.selectFrom("posting as p_inner")
				.select("p_inner.id").distinct()
				.innerJoin("posting_to_hashtag as ph_inner", "ph_inner.posting_id", "p_inner.id")
				.innerJoin("hashtag as h_inner", "h_inner.id", "ph_inner.hashtag_id")
				.where("h_inner.content", "=", hashtag))
		.groupBy("p.id")
		.orderBy(orderBy, sort)

		if (type != '') {
			sqlQuery = sqlQuery.where("p.type", "=", type);
		}

		if (searchBy.split(',').length > 1) {
			sqlQuery = sqlQuery.where(({ eb, ref }) =>
				eb(sql`(${ref("p.title")} || ${ref("p.content")})`, "like", `%${search}%`)
			)
		} else {
			sqlQuery = sqlQuery.where(`p.${searchBy}`, "like", `%${search}%`);
		}

		const postingList = await sqlQuery.execute();

	return postingList
}

export const updateShare = async (db: Kysely<DB>, id: number, count) =>
	await db
		.updateTable("posting")
		.set({ share_count: count })
		.where("posting.id", "=", id)
		.execute()