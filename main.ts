import { logger } from "hono/logger"
import { prettyJSON } from "hono/pretty-json"
import { OpenAPIHono } from "hono_zod_openapi"
import { serveOpenapi } from "./swagger.ts"
import { helloController } from "./hello/mod.ts"
import { postingController, postingListController, postingShareController } from "./posting/mod.ts"
import { likesController } from "./likes/mod.ts"
import { signInController, signupController } from "./auth/mod.ts"
import { summationController } from "./summation/mod.ts"
import { kyselyFrom } from "./kysely_from.ts"
import { ParseJSONResultsPlugin } from "kysely"
import { seeded } from "./test_utils.ts"
import { config } from "https://deno.land/x/dotenv@v3.2.2/mod.ts"
import { jwt, verify } from "hono/jwt"
import { JwtPayload } from "./auth/signin_controller.ts"
import { emailValidation } from "./emailValidation.ts"

const dbPath = Deno.env.get("DB_PATH") ?? Deno.args[0] ?? "test.db"

console.log("DB_PATH", dbPath)

const rawDb = kyselyFrom(dbPath, { plugins: [new ParseJSONResultsPlugin()], log: ["query"] })
const db = dbPath === ":memory:" ? await seeded(rawDb) : rawDb

const authedApp = new OpenAPIHono<{ Variables: JwtPayload }>()
	.use(
		"/*/*",
		async (c, next) => {
			const jwt = c.req.cookie("access-token") as string
			console.log(jwt, await verify(jwt, config().SECRET_KEY))
			await next()
		},
		jwt({ secret: config().SECRET_KEY, cookie: "access-token" }),
		emailValidation,
	)
	.use(
		"/summations",
		jwt({ secret: config().SECRET_KEY, cookie: "access-token" }),
		emailValidation,
	)
	.route("", likesController(db))
	.route("", summationController(db))
	.route("", postingController(db))
	.route("", postingListController(db))
	.route("", postingShareController(db))

const app = new OpenAPIHono()
	.use("*", logger(), prettyJSON())
	.route("", helloController())
	.route("", signupController(db))
	.route("", signInController(db))
	.route("", authedApp)

serveOpenapi(app as OpenAPIHono, { pageUrl: "/", jsonUrl: "/openapi.json" })

Deno.serve(app.fetch)

app.showRoutes()
