import { ColumnDefinitionBuilder as CDB, Kysely, sql } from "kysely"
import { DB as Database } from "sqlite"
import { DenoSqliteDialect } from "kysely_sqlite"

const text = (name: string) => [name, "text", (col: CDB) => col.notNull()] as const
const uniqueText = (name: string) => [name, "text", (col: CDB) => col.notNull().unique()] as const

const primaryKey = (col: CDB) => col.notNull().primaryKey().autoIncrement()
const count = (name: string) => [name, "integer", (col: CDB) => col.notNull().defaultTo(0)] as const
const timestamp = (name: "created_at" | "updated_at") =>
	[name, "text", (col: CDB) => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`)] as const

const id = ["id", "integer", primaryKey] as const

export const tables = {
	user: "user",
	hashtag: "hashtag",
	posting: "posting",
	postingToHashtag: "posting_to_hashtag",
	otp: "otp",
} as const

export const upUser = (db: Kysely<unknown>) =>
	db.schema
		.createTable(tables.user)
		.addColumn(...id)
		.addColumn(...uniqueText("name"))
		.addColumn(...text("email"))
		.addColumn(...text("password"))
		.addColumn(...timestamp("created_at"))
		.addColumn("is_validated", "integer", (col) => col.notNull().defaultTo(false))

export const upHashTag = (db: Kysely<unknown>) =>
	db.schema
		.createTable(tables.hashtag)
		.addColumn(...id)
		.addColumn(...uniqueText("content"))

export const upPosting = (db: Kysely<unknown>) =>
	db.schema
		.createTable(tables.posting)
		.addColumn(...id)
		.addColumn("type", "text", (col) =>
			col.notNull()
				.check(sql`type IN ('facebook', 'twitter', 'instagram', 'threads')`))
		.addColumn(...text("title"))
		.addColumn(...text("content"))
		.addColumn(...text("content_id"))
		.addColumn(...count("view_count"))
		.addColumn(...count("like_count"))
		.addColumn(...count("share_count"))
		.addColumn(...timestamp("updated_at"))
		.addColumn(...timestamp("created_at"))
		.addColumn("user_id", "integer", (col) =>
			col.references(`${tables.user}.id`).notNull().onDelete("cascade"))

export const upOtp = (db: Kysely<unknown>) =>
	db.schema
		.createTable(tables.otp)
		.addColumn(...id)
		.addColumn(...text("code"))
		.addColumn("expires_at", "text", (col) => col.notNull())
		.addColumn("user_id", "integer", (col) =>
			col.references(`${tables.user}.id`).notNull().onDelete("cascade"))

export const upPostingHashTag = (db: Kysely<unknown>) =>
	db.schema
		.createTable(tables.postingToHashtag)
		.addColumn("posting_id", "integer", (col) => col.references(`${tables.user}.id`).notNull())
		.addColumn("hashtag_id", "integer", (col) => col.references(`${tables.hashtag}.id`).notNull())
		.addPrimaryKeyConstraint("primary_key", ["posting_id", "hashtag_id"])

export const up = async (db: Kysely<unknown>) => {
	await upUser(db).execute()
	await upHashTag(db).execute()
	await upPosting(db).execute()
	await upPostingHashTag(db).execute()
	await upOtp(db).execute()
}

export const down = async (db: Kysely<unknown>) => {
	await db.schema.dropTable(tables.postingToHashtag).execute()
	await db.schema.dropTable(tables.posting).execute()
	await db.schema.dropTable(tables.hashtag).execute()
	await db.schema.dropTable(tables.user).execute()
	await db.schema.dropTable(tables.otp).execute()
}

if (import.meta.main) {
	const sqlite = new Database(Deno.args[0] ?? "test.db")
	const db = new Kysely<unknown>({
		dialect: new DenoSqliteDialect({ database: sqlite }),
	})

	try {
		await down(db)
	} catch (e) {
		void e
	}
	await up(db)
}
