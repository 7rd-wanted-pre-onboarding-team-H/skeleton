import type { Kysely } from "kysely"
import type { DB } from "../types.ts"
import { OpenAPIHono } from "hono_zod_openapi"
import { postingRoute } from "./posting_routes.ts"
import { getSinglePosting } from "./posting_data.ts"

export const postingController = (db: Kysely<DB>) =>
	new OpenAPIHono().openapi(postingRoute, async (c) => {
		const { id } = c.req.valid("param")
		const posting = await getSinglePosting(db, id)

		return posting ? c.jsonT(posting) : c.jsonT({ error: "Not Found" }, 404)
	})
