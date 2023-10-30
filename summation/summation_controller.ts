import type { Kysely } from "kysely"
import type { DB } from "../types.ts"
import { OpenAPIHono } from "hono_zod_openapi"
import { summationRoute } from "./summation_routes.ts"
import { getSummation } from "./summation_data.ts"
import dayjs from "dayjs"
import { JwtPayload } from "../auth/signin_controller.ts"

type ReqestQuery = {
	content?: string
	type: string
	start?: string
	end?: string
	value?: string
}

export type SummationSqlOption = {
	content: string
	dateFormat: "%Y-%m-%d %H" | "%Y-%m-%d"
	start: string
	end: string
	value: "postings" | "views" | "likes" | "shares"
}

export const summationController = (db: Kysely<DB>) =>
	new OpenAPIHono().openapi(summationRoute, async (c) => {
		const query = c.req.valid("query")
		// FIXME: 계정명도 해시태그로 취급해야함
		const { username } = c.get("jwtPayload") as JwtPayload
		const content = query.content || username

		try {
			const summationOption = convertQueryToOption({ ...query, content })

			const endMinusStart = dayjs(summationOption.end, "YYYY-MM-DD").diff(
				dayjs(summationOption.start, "YYYY-MM-DD"),
				"day",
			)

			if (
				(query.type === "hour" && endMinusStart > 7) ||
				(query.type === "date" && endMinusStart > 30)
			) {
				return c.jsonT({ error: "잘못된 요청, 유효하지 않은 날짜 범위" }, 400)
			}

			const data = await getSummation(db, summationOption)
			if (!data.length) return c.jsonT({ error: "No content" }, 404)

			return c.jsonT(
				{ content: summationOption.content, value: summationOption.value, data: data },
				200,
			)
		} catch {
			return c.jsonT({ error: "Error" }, 404)
		}
	})

const convertQueryToOption = (
	{ content, type, start, end, value }: ReqestQuery,
): SummationSqlOption => {
	const setContent = content ? content : "userId"
	const dateFormat = type === "hour" ? "%Y-%m-%d %H" : type === "date" ? "%Y-%m-%d" : "e"
	const setStart = start ? start : dayjs().subtract(7, "day").format("YYYY-MM-DD HH")
	const setEnd = end ? end : dayjs().format("YYYY-MM-DD HH")
	const setValue = value === "views"
		? "views"
		: value === "likes"
		? "likes"
		: value === "shares"
		? "shares"
		: "postings"
	if (dateFormat === "e") throw new Error("Invalid Request")
	return {
		content: setContent,
		dateFormat: dateFormat,
		start: setStart,
		end: setEnd,
		value: setValue,
	}
}
