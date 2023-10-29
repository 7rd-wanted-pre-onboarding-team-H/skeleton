import { logger } from "hono/logger"
import { prettyJSON } from "hono/pretty-json"
import { OpenAPIHono } from "hono_zod_openapi"
import { serveOpenapi } from "./swagger.ts"
import { helloController } from "./hello/mod.ts"
import { postingController, postingListController, postingShareController } from "./posting/mod.ts"
import { likesController } from "./likes/mod.ts"
import { signupController } from "./auth/mod.ts"
import { summationController } from "./summation/mod.ts"
import { kyselyFrom } from "./kysely_from.ts"
import { ParseJSONResultsPlugin } from "kysely"
import { seeded } from "./test_utils.ts"

const dbPath = Deno.env.get("DB_PATH") ?? Deno.args[0] ?? "test.db"

console.log("DB_PATH", dbPath)

const rawDb = kyselyFrom(dbPath, { plugins: [new ParseJSONResultsPlugin()] })
const db = dbPath === ":memory:" ? await seeded(rawDb) : rawDb

const app = new OpenAPIHono()
	.use("*", logger(), prettyJSON())
	.route("", signupController(db))
	.route("", helloController())
	.route("", likesController(db))
	.route("", summationController(db))
	.route("", postingController(db))
	.route("", postingListController(db))
	.route("", postingShareController(db))

serveOpenapi(app as OpenAPIHono, { pageUrl: "/", jsonUrl: "/openapi.json" })

Deno.serve(app.fetch)

app.showRoutes()
