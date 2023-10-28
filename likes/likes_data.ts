import type { Kysely } from "kysely"
import type { DB } from "../types.ts"

export const getPostLikes = (db: Kysely<DB>, id: number) =>
	db
		.selectFrom("posting")
		.select(["type", "like_count"])
		.where("posting.id", "=", id)
		.executeTakeFirst()

export const updateLikes = (db: Kysely<DB>, id: number, _like: number) =>
	db
		.updateTable("posting")
		.set({ like_count: _like })
		.where("posting.id", "=", id)
		.execute()
