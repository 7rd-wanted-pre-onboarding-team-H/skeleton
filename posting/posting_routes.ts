import { createRoute, z } from "hono_zod_openapi"
import { errorJson, idSchema, openApiJson } from "../utils.ts"
import { postingSchema } from "../schemas.ts"

export const postingRoute = createRoute({
	method: "get",
	path: "/postings/{id}",
	tags: ["postings"],
	summary: "게시물 하나를 조회합니다.",
	request: {
		params: z.object({
			id: idSchema.openapi({
				param: { name: "id", in: "path", required: true },
				minimum: 1,
				example: 1,
			}),
		}),
	},
	responses: {
		200: {
			description: "성공적으로 게시물 조회 완료",
			...openApiJson(postingSchema.openapi({
				example: {
					id: 1,
					type: "facebook",
					title: "안녕하세요",
					content: "예시 컨텐츠 내용",
					content_id: "_wm_hiQF0lF5FSpZY8Afb",
					view_count: 1832,
					like_count: 363,
					share_count: 4,
					updated_at: "2023-02-11T11:58:16.080Z",
					created_at: "2023-01-28T18:05:35.518Z",
					user_id: 2,
				},
			})),
		},
		404: {
			description: "해당 게시물이 존재하지 않습니다.",
			...errorJson(z.string().openapi({ example: "Not Found" })),
		},
	},
})
