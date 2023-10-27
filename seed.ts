import { fakerKO as faker } from "faker"
import { DB as Database } from "sqlite"
import { Kysely, ParseJSONResultsPlugin, sql } from "kysely"
import { DenoSqliteDialect } from "kysely_sqlite"
import { DB, Hashtag } from "./types.ts"
import { down, up } from "./migrate.ts"

export const seedUser = async (db: Kysely<DB>) => {
	const users = Array.from({ length: 10 }, () => ({
		name: faker.person.fullName(),
		email: faker.internet.email(),
		password: faker.internet.password(),
		created_at: faker.date.recent({ days: 30, refDate: new Date("2023-01-01") }).toISOString(),
		is_validated: Number(faker.datatype.boolean({ probability: 0.75 })),
	}))

	await db.insertInto("user").values(users).execute()
}

export const seedHashTag = async (db: Kysely<DB>) => {
	const hashtags = Array.from(
		{ length: 10 },
		() => ({
			content: faker.helpers.arrayElement([faker.hacker.adjective(), faker.hacker.noun()]),
		}),
	)

	await db.insertInto("hashtag").values(hashtags).execute()
}

export const seedPosting = async (db: Kysely<DB>) => {
	const userIds = await db.selectFrom("user").select("id").execute()

	const postings = Array.from(
		{ length: 10 },
		(_, i) => ({
			id: i + 1,
			type: faker.helpers.arrayElement(["facebook", "twitter", "instagram", "threads"] as const),
			title: faker.lorem.sentence({ min: 1, max: 3 }),
			content: faker.lorem.paragraph(1),
			content_id: faker.string.nanoid(),
			view_count: faker.number.int(10000),
			like_count: faker.number.int(1000),
			share_count: faker.number.int(1000),
			created_at: faker.date.recent({ days: 30, refDate: new Date("2023-02-01") }).toISOString(),
			updated_at: faker.date.recent({ days: 30, refDate: new Date("2023-03-01") }).toISOString(),
			user_id: faker.helpers.arrayElement(userIds).id,
		}),
	)

	await db.insertInto("posting").values(postings).execute()
}

export const seedPostingToHashTag = async (db: Kysely<DB>) => {
	const postingIds = await db.selectFrom("posting").select("id").execute()
	const hashtagIds = await db.selectFrom("hashtag").select("id").execute()

	const postingToHashtags = postingIds
		.flatMap((post) => (
			faker.helpers.arrayElements(hashtagIds, faker.number.int(hashtagIds.length / 2))
				.map((hashtag) => ({ posting_id: post.id, hashtag_id: hashtag.id }))
		))

	await db.insertInto("posting_to_hashtag").values(postingToHashtags).execute()
}

export const seed = async (db: Kysely<DB>) => {
	await seedUser(db)
	await seedHashTag(db)
	await seedPosting(db)
	await seedPostingToHashTag(db)
}

if (import.meta.main) {
	const url = Deno.args[0] ?? ":memory:"

	const sqlite = new Database(url)
	const db = new Kysely<DB>({
		dialect: new DenoSqliteDialect({ database: sqlite }),
		plugins: [new ParseJSONResultsPlugin()],
		log: (event) => {
			if (event.level === "query") {
				console.log("kysely:query", event.query.sql, JSON.stringify(event.query.parameters))
			} else {
				console.log(event.error)
			}
		},
	})

	try {
		await down(db as Kysely<unknown>)
	} catch (e) {
		void e
	}
	await up(db as Kysely<unknown>)
	await seed(db)

	// list all users
	const users = await db.selectFrom("user").selectAll().execute()
	console.table(users)

	const hashtags = await db.selectFrom("hashtag").selectAll().execute()
	console.table(hashtags)

	const postings = await db.selectFrom("posting").selectAll().execute()
	console.table(postings)

	const postingsWithHashtags = await db.selectFrom("posting")
		.leftJoin("posting_to_hashtag", "posting.id", "posting_to_hashtag.posting_id")
		.leftJoin("hashtag", "posting_to_hashtag.hashtag_id", "hashtag.id")
		.select((eb) => [
			"posting.id",
			"posting.title",
			eb.case()
				.when(eb.fn.count("hashtag.content"), "=", 0)
				.then(sql<Hashtag[]>`'[]'`)
				.else(eb.fn.coalesce(
					sql<
						Hashtag[]
					>`json_group_array(json_object('id', "hashtag"."id", 'content', "hashtag"."content")), '[]'`,
				))
				.end()
				.as("hashtags"),
		])
		.groupBy("posting.id")
		.execute()

	console.log(postingsWithHashtags)
}
