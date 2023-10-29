import type { Kysely } from "kysely"
import type { DB } from "../types.ts"
import { sql } from "kysely"
import type { SummationSqlOption } from "./summation_controller.ts"

export const getSummation = (
	db: Kysely<DB>,
	{ content, dateFormat, start, end }: SummationSqlOption,
) => {
	return db.selectFrom("posting")
		.innerJoin("posting_to_hashtag as post2tag", "posting.id", "post2tag.posting_id")
		.innerJoin("hashtag", "post2tag.hashtag_id", "hashtag.id")
		.where(({ between }) => between("posting.created_at", start, end))
		.where("hashtag.content", "=", content)
		.select(({ fn: { count, sum } }) => [
			sql<string>`strftime(${dateFormat}, posting.created_at)`.as("day"),
			count<number>("posting.id").as("postings"),
			sum<number>("posting.view_count").as("views"),
			sum<number>("posting.like_count").as("likes"),
			sum<number>("posting.share_count").as("shares"),
		])
		.groupBy(sql<string>`strftime(${dateFormat}, posting.created_at)`)
		.orderBy(sql<string>`strftime(${dateFormat}, posting.created_at)`, "desc")
		.execute()
}
