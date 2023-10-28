import type { Kysely } from "kysely"
import type { DB } from "../types.ts"

export const getPostShare = (db: Kysely<DB>, id: number) =>
	db
		.selectFrom("posting")
		.select(["type", "share_count"])
		.where("posting.id", "=", id)
		.executeTakeFirst()

export const updateShare = (db: Kysely<DB>, id: number, _share: number) =>
	db
		.updateTable("posting")
		.set({ share_count: _share })
		.where("posting.id", "=", id)
		.executeTakeFirst()
