import type { Kysely } from "kysely"
import type { DB } from "../types.ts"
import { sql } from "kysely"
import dayjs from "dayjs"

export type SummationRequestQuery = {
	content?: string
	type: "hour" | "date" | string
	start?: string
	end?: string
	value?: "postings" | "views" | "likes" | "shares"
}

export type SummationSqlOption = {
	content: string
	dateFormat: string
	start: string
	end: string
	value: "postings" | "views" | "likes" | "shares"
}

export const getSummation = async (
	db: Kysely<DB>,
	{ content, dateFormat, start, end, value }: SummationSqlOption,
) => {
	const summation = await db.selectFrom("posting")
		.innerJoin("posting_to_hashtag as post2tag", "posting.id", "post2tag.posting_id")
		.innerJoin("hashtag", "post2tag.hashtag_id", "hashtag.id")
		.where(({ between }) => between("posting.created_at", start, end))
		.where("hashtag.content", "=", content)
		.select(({ fn: { count, sum } }) => [
			sql<string[]>`strftime(${dateFormat}, posting.created_at)`.as("day"),
			count("posting.id").as("postings"),
			sum("posting.view_count").as("views"),
			sum("posting.like_count").as("likes"),
			sum("posting.share_count").as("shares"),
		])
		.groupBy(sql<string[]>`strftime(${dateFormat}, posting.created_at)`)
		.orderBy(sql<string[]>`strftime(${dateFormat}, posting.created_at)`, "desc")
		.execute()

	if (!summation.length) throw new Error("No content")

	const dataOfValue = summation.map((val) => {
		return {
			day: val.day,
			value: val[`${value}`],
		}
	})
	return {
		content: content,
		value: value,
		data: dataOfValue,
	}
}

export const isVaildDate = ({ type, start, end }: SummationRequestQuery) => {
	const endMinusStart = dayjs(end, "YYYY-MM-DD").diff(dayjs(start, "YYYY-MM-DD"), "day")
	if ((type === "hour" && endMinusStart > 7) || (type === "date" && endMinusStart > 30)) {
		return false
	}
	return true
}

export const summationSqlOption = (
	{ content, type, start, end, value }: SummationRequestQuery,
): SummationSqlOption => {
	return {
		content: content ? content : "userId",
		dateFormat: type === "date" ? "%Y-%m-%d" : "%Y-%m-%d %H",
		start: start ? start : dayjs().subtract(7, "day").format("YYYY-MM-DD HH"),
		end: end ? end : dayjs().format("YYYY-MM-DD HH"),
		value: value ? value : "postings",
	}
}
