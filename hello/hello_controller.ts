import { OpenAPIHono } from "hono_zod_openapi"
import { helloRoute } from "./hello_routes.ts"

export const helloController = () =>
	new OpenAPIHono().openapi(helloRoute, (c) => {
		const { name } = c.req.valid("param")
		const { userId } = c.get("jwtPayload")
		console.log(userId)
		return c.jsonT({ message: `hello ${name}` })
	})
