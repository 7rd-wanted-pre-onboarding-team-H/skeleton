import { Kysely } from "kysely"
import { DB } from "./types.ts"
import { up } from "./migrate.ts"
import { seed } from "./seed.ts"
import { OpenAPIHono } from "hono_zod_openapi"
import { testClient } from "hono/testing"
import { kyselyFrom } from "./kysely_from.ts"

/** in-memory DB에 연결된 Kysely 인스턴스를 반환합니다. */
export const tempKysely = async () => {
	const db = kyselyFrom(":memory:")

	await up(db as Kysely<unknown>)
	await seed(db)

	return db
}

/**
 * 테스트 파일마다 사용 가능한 독립된 앱을 생성합니다.
 */
export const tempAppFrom = async <const T extends OpenAPIHono>(withDB: (db: Kysely<DB>) => T) => {
	const db = await tempKysely()

	const app = withDB(db)
	return { app, client: testClient(app) }
}
