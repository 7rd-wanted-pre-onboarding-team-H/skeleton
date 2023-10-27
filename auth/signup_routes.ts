import { createRoute, z } from "hono_zod_openapi"
import { openApiJson } from "../utils.ts"
import { postingSchema } from "../schemas.ts"
import { passwordSchema } from "./password_rules.ts"

export const signUpRoute = createRoute({
	method: "post",
	path: "/auth/signup",
	tags: ["auth"],
	summary: "신규 회원가입을 요청합니다.",
	request: {
		body: {
			description: "회원가입 요청을 위한 정보를 입력합니다.",
			content: {
				"application/json": {
					schema: z.object({
						name: z.string().min(1).openapi({ example: "dani" }),
						email: z.string().email().openapi({ example: "wanted@gmail.com" }),
						password: passwordSchema.openapi({ example: "password123!" }),
					}),
				},
			},
		},
	},
	responses: {
		201: {
			description: "회원가입 인증용 OTP를 발송합니다.",
			...openApiJson(z.object({
				otp: z.string().length(6).regex(/^[0-9]+$/).openapi({ example: "123456" }),
			})),
		},
		400: {
			description: "요청이 잘못되었습니다.",
		},
	},
})
