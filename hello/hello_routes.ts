import { createRoute, z } from "hono_zod_openapi"
import { openApiJson } from "../utils.ts"

export const helloRoute = createRoute({
	method: "get",
	path: "/hello/{name}",
	tags: ["hello"],
	summary: "주어진 이름으로 인사합니다.",
	request: {
		params: z.object({
			name: z.string().min(1).openapi({
				param: { name: "name", in: "path", required: true },
				example: "world",
			}),
		}),
	},
	responses: {
		200: {
			description: "성공적으로 인사 완료",
			...openApiJson(z.object({
				message: z.string().openapi({
					example: "hello world",
				}),
			})),
		},
	},
})
