import { HTTPException } from "hono/http-exception"
import { JwtPayload } from "./auth/signin_controller.ts"
import { MiddlewareHandler } from "hono"

export const emailValidation: MiddlewareHandler = async (c, next) => {
	const { validated } = c.get("jwtPayload") as JwtPayload
	console.log({ validated })
	if (!validated) throw new HTTPException(401, { message: "이메일 인증이 필요합니다." })
	await next()
}
