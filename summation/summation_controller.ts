import type { Kysely } from "kysely"
import type { DB } from "../types.ts"
import { OpenAPIHono } from "hono_zod_openapi"
import { summationRoute } from "./summation_routes.ts"
import { getSummation, isVaildDate, summationSqlOption } from "./summation_data.ts"
import type { SummationRequestQuery } from "./summation_data.ts"

export const summationController = (db: Kysely<DB>) =>
	new OpenAPIHono().openapi(summationRoute, async (c) => {
		const query: SummationRequestQuery = c.req.valid("query")

		if (!isVaildDate(query)) {
			return c.jsonT({ message: "잘못된 요청, 유효하지 않은 날짜 범위" }, 400)
		}

		const summationOption = summationSqlOption(query)

		try {
			const summation = await getSummation(db, summationOption)
			return c.jsonT({ message: `${summationOption.value} 통계 조회 성공`, data: summation }, 200)
		} catch {
			return c.jsonT({ message: "No content" }, 400)
		}
	})
