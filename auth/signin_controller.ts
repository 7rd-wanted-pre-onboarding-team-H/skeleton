import { signInUser } from "./signin_routes.ts"
import { OpenAPIHono } from "hono_zod_openapi"
import { getUserByName } from "./signin_data.ts"
import { DB } from "../types.ts"
import { Kysely } from "kysely"
import { sign } from "hono/jwt"
import { setCookie } from "hono/cookie"
import { config } from "https://deno.land/x/dotenv@v3.2.2/mod.ts"
import * as bcrypt from "https://deno.land/x/bcrypt@v0.4.1/mod.ts"

export type JwtPayload = {
	iat: number
	sub: string
	exp: number
	userId: number
	username: string
	validated: boolean
}

export const signInController = (db: Kysely<DB>) => {
	return new OpenAPIHono().openapi(signInUser, async (c) => {
		const { name, password } = c.req.valid("json")

		console.log(name, password)
		const user = await getUserByName(db, name)
		if (!user) {
			return c.jsonT({ error: "로그인 실패. 존재하지 않는 이름" }, 401)
		}
		if (!await bcrypt.compare(password, user.password)) {
			return c.jsonT({ error: "로그인 실패" }, 401)
		}
		const payload: JwtPayload = {
			iat: Date.now() / 1000, // 1000 으로 나눠서 초 단위로 만들어줌
			sub: "wanted social-feed user",
			exp: Date.now() / 1000 + (60 * 60 * 24 * 1),
			userId: user.id,
			username: user.name,
			validated: Boolean(user.is_validated),
		}
		const token = await sign(payload, config().SECRET_KEY)
		setCookie(c, "access-token", token, { path: "/", maxAge: 60 * 60 * 24 * 1 })
		return c.jsonT({ message: "로그인 성공" })
	})
}
