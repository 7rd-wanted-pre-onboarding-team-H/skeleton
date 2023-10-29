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
			content: z.string().optional().openapi({
				param: { name: "content", in: "path", required: false },
				example: "hashtag",
			}),
			type: z.string().openapi({
				param: { name: "type", in: "path", required: true },
				example: "hour | date",
			}),
			start: z.string().optional().openapi({
				param: { name: "start", in: "path", required: false },
				example: "2023-10-29 | 2023-10-29 18",
			}),
			end: z.string().optional().openapi({
				param: { name: "end", in: "path", required: false },
				example: "2023-10-29 | 2023-10-29 18",
			}),
			value: z.string().optional().openapi({
				param: { name: "value", in: "path", required: false },
				example: "postings | views | likes | shares",
			}),
		}),
	},
	responses: {
		200: {
			description: "게시물 통계 조회 완료",
			...openApiJson(summationSchema.openapi({
				example: {
					content: "hashtag",
					value: "postings",
					data: {
						day: "2023-10-29",
						value: 33,
					},
				},
			})),
		},
		404: {
			description: "게시물 통계가 존재하지 않습니다.",
			...errorJson(z.string().openapi({ example: "Not Found" })),
		},
	},
})
