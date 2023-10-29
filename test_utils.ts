import { Kysely, KyselyConfig } from "kysely"
import { DB } from "./types.ts"
import { up } from "./migrate.ts"
import { seed } from "./seed.ts"
import { OpenAPIHono } from "hono_zod_openapi"
import { testClient } from "hono/testing"
import { kyselyFrom } from "./kysely_from.ts"

export const seeded = async (db: Kysely<DB>) => {
	await up(db as Kysely<unknown>)
	await seed(db)

	return db
}

/**
 * 테스트 파일마다 사용 가능한 독립된 앱을 생성합니다.
 */
export const tempAppFrom = async <const T extends OpenAPIHono>(
	withDB: (db: Kysely<DB>) => T,
	option?: Omit<KyselyConfig, "dialect">,
) => {
	const db = await seeded(kyselyFrom(":memory:", option))

	const app = withDB(db)
	return { db, app, client: testClient(app) }
}
