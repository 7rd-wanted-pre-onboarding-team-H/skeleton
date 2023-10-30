import { OpenAPIHono } from "hono_zod_openapi"
import { helloRoute } from "./hello_routes.ts"
import { config } from "https://deno.land/x/dotenv@v3.2.2/mod.ts"
import { jwt } from "hono/jwt"

export const helloController = () =>
	(new OpenAPIHono()
		.use(
			"/hello/*",
			jwt({ secret: config().SECRET_KEY, cookie: "access-token" }),
		) as unknown as OpenAPIHono<{ Variables: { jwtPayload: { userId: number } } }>)
		.openapi(helloRoute, (c) => {
			const { name } = c.req.valid("param")
			console.log(c.var.jwtPayload)
			const { userId } = c.var.jwtPayload

			console.log(userId)
			return c.jsonT({ message: `hello ${name}` })
		})
