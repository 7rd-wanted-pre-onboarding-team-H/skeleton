import { Kysely } from "kysely"
import { DenoSqliteDialect } from "kysely_sqlite"
import { DB } from "./types.ts"
import { DB as SQLite } from "sqlite"

/**
 * {@link Kysely} 인스턴스를 생성합니다.
 *
 * @param path - SQLite 데이터베이스 파일 경로, `:memory:` 를 사용하면 메모리에 저장됩니다.
 */
export const kyselyFrom = (path: string) => {
	const database = new SQLite(path)
	const dialect = new DenoSqliteDialect({ database })
	const db = new Kysely<DB>({ dialect })

	return db
}
