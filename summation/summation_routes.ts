import { createRoute, z } from "hono_zod_openapi"
import { errorJson, openApiJson } from "../utils.ts"
import { summationSchema } from "../schemas.ts"

export const summationRoute = createRoute({
	method: "get",
	path: "/summations",
	tags: ["summations"],
	summary: "해당 해시태그 게시물의 통계를 조회합니다.",
	request: {
		query: z.object({
			content: z.string().optional().openapi({ example: "dani" }),
			type: z.enum(["hour", "date"]).openapi({ example: "hour" }),
			start: z.string().optional().openapi({ example: "2023-10-25" }),
			end: z.string().optional().openapi({ example: "2023-10-26" }),
			value: z.enum(["postings", "views", "likes", "shares"]).default("postings"),
		}),
	},
	responses: {
		200: {
			description: "게시물 통계 조회 완료",
			...openApiJson(summationSchema.openapi({
				example: {
					content: "hashtag",
					value: "postings",
					data: [{
						day: "2023-10-25",
						count: 33,
					}],
				},
			})),
		},
		400: {
			description: "유효하지 않은 요청",
			...errorJson(z.string().openapi({ example: "Invalid request" })),
		},
		404: {
			description: "게시물 통계가 존재하지 않습니다.",
			...errorJson(z.string().openapi({ example: "Not Found" })),
		},
	},
})
