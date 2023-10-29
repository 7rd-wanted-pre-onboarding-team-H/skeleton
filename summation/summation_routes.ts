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
			content: z.string().optional(),
			type: z.string(),
			start: z.string().optional(),
			end: z.string().optional(),
			value: z.string().optional(),
		}),
	},
	responses: {
		200: {
			description: "게시물 통계 조회 완료",
			...openApiJson(summationSchema.openapi({
				example: {
					data: [{
						day: "2023-10-29",
						postings: 33,
						views: 100,
						likes: 550,
						shares: 1,
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
