import { createRoute, z } from "hono_zod_openapi"
import { openApiJson } from "../utils.ts"
import { postingSchema } from "../schemas.ts"

export const signInUser = createRoute({
	method: "post",
	path: "/auth/signin",
	tags: ["auth"],
	summary: "로그인을 요청합니다.",
	request: {
		body: {
			description: "로그인 요청을 위한 정보를 입력합니다.",
			content: {
				"application/json": {
					schema: z.object({
						name: z.string().openapi({ example: "jimin"}),
						password: z.string().openapi({ example: "password123!" }),
					}),
				},
			},
		},
	},
	responses: {
		200: {
			description: "로그인에 성공했습니다.",
			Headers: {
				"Set-Cookie": {
					schema: z.string(),
					description: "로그인에 성공했을 경우, 쿠키에 토큰을 저장합니다.",
				},
			},
			content: {
				"application/json": {
					schema: z.string().openapi({ example: "로그인에 성공했습니다." }),
				}
			}
		},
		400: {
			description: "요청이 잘못되었습니다.",
			content: {
				"application/json": {
					schema: z.object({
						error: z.string().openapi({ example: "Not Found" }),
					}),
				},
			}
		},
		401: {
			description: "로그인에 실패했습니다.",
			content: {
				"application/json": {
					schema: z.object({
						error: z.string().openapi({ example: "Not Found" }),
					}),
				},
			}
		},
	},
})