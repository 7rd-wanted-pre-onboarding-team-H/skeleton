import type { Kysely } from "kysely"
import type { DB } from "../types.ts"

export const getUserByName = (db: Kysely<DB>, name: string) =>
	db
		.selectFrom("user")
		.selectAll()
		.where("user.name", "=", name)
		.executeTakeFirst()
