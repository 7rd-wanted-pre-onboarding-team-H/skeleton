import { logger } from "hono/logger"
import { prettyJSON } from "hono/pretty-json"
import { OpenAPIHono } from "hono_zod_openapi"
import { serveOpenapi } from "./swagger.ts"
import { helloController } from "./hello/mod.ts"
import { postingController } from "./posting/mod.ts"
import { likesController } from "./likes/mod.ts"
import { signInController } from "./auth/signin_controller.ts"
import { kyselyFrom } from "./kysely_from.ts"

const db = kyselyFrom(Deno.args[0] ?? "test.db")

const app = new OpenAPIHono()
	.use("*", logger(), prettyJSON())
	.route("", helloController())
	.route("", postingController(db))
	.route("", likesController(db))
	.route("", signInController(db))
	
serveOpenapi(app as OpenAPIHono)

Deno.serve({ port: 3000 }, app.fetch)

app.showRoutes()
