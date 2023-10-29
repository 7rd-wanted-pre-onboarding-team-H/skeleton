import { OpenAPIHono } from "hono_zod_openapi"
import { signUpRoute, verifyEmailRoute } from "./signup_routes.ts"
import { Kysely } from "kysely"
import { DB } from "../types.ts"
import { createOtp } from "./otp.ts"
import * as bcrypt from "https://deno.land/x/bcrypt@v0.4.1/mod.ts"

export const expireAge = 1000 * 60 * 5

export const signupController = (db: Kysely<DB>) =>
	new OpenAPIHono()
		.openapi(signUpRoute, async (c) => {
			const { name, email, password: rawPassword } = c.req.valid("json")

			const otp = createOtp()
			const expireDate = new Date(Date.now() + expireAge).toISOString()

			return await db.transaction().execute(async (trx) => {
				// 트랜잭션 안에서 db를 사용해서는 안됩니다.
				// deno-lint-ignore no-unused-vars
				const db = null as never

				const existing = await trx.selectFrom("user")
					.select(["id"])
					.where("name", "=", name)
					.executeTakeFirst()

				if (existing) {
					return c.jsonT({ error: "이미 존재하는 사용자입니다." }, 409)
				}

				const password = bcrypt.hashSync(rawPassword)

				const { insertId } = await trx.insertInto("user")
					.values({ name, email, password }).executeTakeFirstOrThrow()

				await trx.insertInto("otp")
					.values({ user_id: Number(insertId!), code: otp, expires_at: expireDate })
					.executeTakeFirstOrThrow()

				return c.jsonT({ otp }, 201)
			})
		})
		.openapi(verifyEmailRoute, async (c) => {
			const { name, email, otp } = c.req.valid("json")

			return await db.transaction().execute(async (trx) => {
				// 트랜잭션 안에서 db를 사용해서는 안됩니다.
				// deno-lint-ignore no-unused-vars
				const db = null as never

				const userQuery = await trx.selectFrom("user")
					.select(["id", "name", "email"])
					.where("name", "=", name)
					.where("email", "=", email)
					.executeTakeFirstOrThrow()

				const { id, ...user } = userQuery
				const otpQuery = await trx.selectFrom("otp")
					.select(["code", "expires_at"])
					.where("user_id", "=", id)
					.executeTakeFirstOrThrow()

				const { code, expires_at } = otpQuery
				if (expires_at < new Date().toISOString()) {
					await trx.deleteFrom("otp").where("user_id", "=", id)
						.executeTakeFirstOrThrow()

					return c.jsonT({ error: "인증정보가 만료되었습니다." }, 400)
				}
				if (otp !== code) {
					return c.jsonT({ error: "인증정보가 일치하지 않습니다." }, 400)
				}
				return c.jsonT(user, 200)
			})
		})
