import type { Kysely } from "kysely"
import type { DB } from "../types.ts"
import { OpenAPIHono } from "hono_zod_openapi"
import { summationRoute } from "./summation_routes.ts"
import { getSummation } from "./summation_data.ts"
import dayjs from "dayjs"

export type SummationSqlOption = {
	content: string
	dateFormat: string
	start: string
	end: string
	value: string
}

export const summationController = (db: Kysely<DB>) =>
	new OpenAPIHono().openapi(summationRoute, async (c) => {
		const query = c.req.valid("query")

		const summationOption: SummationSqlOption = {
			content: query.content ? query.content : "userId",
			dateFormat: query.type === "hour" ? "%Y-%m-%d %H" : "%Y-%m-%d",
			start: query.start ? query.start : dayjs().subtract(7, "day").format("YYYY-MM-DD HH"),
			end: query.end ? query.end : dayjs().format("YYYY-MM-DD HH"),
			value: query.value ? query.value : "postings",
		}

		const endMinusStart = dayjs(summationOption.end, "YYYY-MM-DD").diff(
			dayjs(summationOption.start, "YYYY-MM-DD"),
			"day",
		)

		if (
			(query.type === "hour" && endMinusStart > 7) || (query.type === "date" && endMinusStart > 30)
		) {
			return c.jsonT({ error: "잘못된 요청, 유효하지 않은 날짜 범위" }, 400)
		}

		const data = await getSummation(db, summationOption)

		if (!data.length) return c.jsonT({ error: "No content" }, 404)

		return c.jsonT({ data }, 200)
	})
