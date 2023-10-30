import type { Kysely } from "kysely"
import type { DB } from "../types.ts"
import { sql } from "kysely"
import type { SummationSqlOption } from "./summation_controller.ts"

const mapping = {
	postings: "id",
	views: "view_count",
	likes: "like_count",
	shares: "share_count",
} as const

export const getSummation = (
	db: Kysely<DB>,
	{ content, dateFormat, start, end, value }: SummationSqlOption,
) => {
	//base table
	const base = db.selectFrom("posting")
		.innerJoin("posting_to_hashtag as post2tag", "posting.id", "post2tag.posting_id")
		.innerJoin("hashtag", "post2tag.hashtag_id", "hashtag.id")
		.where(({ between }) =>
			between("posting.created_at", new Date(start).toISOString(), new Date(end).toISOString())
		)
		.where("hashtag.content", "=", content)

	//select column
	const column = mapping[value]
	if (!column) throw new Error("error")

	return base
		.select(({ fn: { count } }) => [
			sql<string>`strftime(${dateFormat}, posting.created_at)`.as("day"),
			count<number>(`posting.${column}`).as("count"),
		])
		.where("hashtag.content", "=", hashtag)
		.groupBy(sql<string>`strftime(${dateFormat}, posting.created_at)`)
		.orderBy(sql<string>`strftime(${dateFormat}, posting.created_at)`, "desc")
		.execute()
}
