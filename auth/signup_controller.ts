import { OpenAPIHono } from "hono_zod_openapi"
import { signUpRoute } from "./signup_routes.ts"
import { Kysely } from "kysely"
import { DB } from "../types.ts"
import { otpFromEmail } from "./otp.ts"

export const signupController = (db: Kysely<DB>) =>
	new OpenAPIHono().openapi(signUpRoute, async (c) => {
		const { name, email, password } = c.req.valid("json")

		await db.insertInto("user")
			.values({ name, email, password }).execute()
		const otp = await otpFromEmail(email)

		return c.jsonT({ otp }, 201)
	})
