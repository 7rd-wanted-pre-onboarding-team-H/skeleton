import type { Kysely } from "kysely"
import type { DB } from "../types.ts"
import { sql } from "kysely"
import type { SummationSqlOption } from "./summation_controller.ts"

export const getSummation = (
	db: Kysely<DB>,
	{ content, dateFormat, start, end, value }: SummationSqlOption,
) => {
	//base table
	const base = db.selectFrom("posting")
		.innerJoin("posting_to_hashtag as post2tag", "posting.id", "post2tag.posting_id")
		.innerJoin("hashtag", "post2tag.hashtag_id", "hashtag.id")
		.where(({ between }) => between("posting.created_at", start, end))
		.where("hashtag.content", "=", content)

	//select column
	if (value === "postings") {
		return base.select(({ fn: { count } }) => [
			sql<string>`strftime(${dateFormat}, posting.created_at)`.as("day"),
			count<number>("posting.id").as("count"),
		])
			.groupBy(sql<string>`strftime(${dateFormat}, posting.created_at)`)
			.orderBy(sql<string>`strftime(${dateFormat}, posting.created_at)`, "desc")
			.execute()
	} else if (value === "views") {
		return base.select(({ fn: { sum } }) => [
			sql<string>`strftime(${dateFormat}, posting.created_at)`.as("day"),
			sum<number>("posting.view_count").as("count"),
		])
			.groupBy(sql<string>`strftime(${dateFormat}, posting.created_at)`)
			.orderBy(sql<string>`strftime(${dateFormat}, posting.created_at)`, "desc")
			.execute()
	} else if (value === "likes") {
		return base.select(({ fn: { sum } }) => [
			sql<string>`strftime(${dateFormat}, posting.created_at)`.as("day"),
			sum<number>("posting.like_count").as("count"),
		])
			.groupBy(sql<string>`strftime(${dateFormat}, posting.created_at)`)
			.orderBy(sql<string>`strftime(${dateFormat}, posting.created_at)`, "desc")
			.execute()
	} else if (value === "shares") {
		return base.select(({ fn: { sum } }) => [
			sql<string>`strftime(${dateFormat}, posting.created_at)`.as("day"),
			sum<number>("posting.share_count").as("count"),
		])
			.groupBy(sql<string>`strftime(${dateFormat}, posting.created_at)`)
			.orderBy(sql<string>`strftime(${dateFormat}, posting.created_at)`, "desc")
			.execute()
	} else throw new Error("error")
}
