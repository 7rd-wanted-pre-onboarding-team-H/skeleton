import type { Kysely } from "kysely"
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
