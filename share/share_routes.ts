import { createRoute, z } from "hono_zod_openapi"
import { errorJson, idSchema, openApiJson } from "../utils.ts"

export const shareRoute = createRoute({
	method: "put",
	path: "/share/{id}",
	tags: ["share"],
	summary: "게시글에 공유수를 증가시킵니다.",
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
			description: "공유 성공",
			...openApiJson(z.object({
				share_count: z.number().openapi({ example: 3 }),
				message: z.string().openapi({ example: "공유 진짜 성공" }),
			})),
		},
		404: {
			description: "해당 게시물이 존재하지 않습니다.",
			...errorJson(z.string().openapi({ example: "Not Found" })),
		},
	},
})
