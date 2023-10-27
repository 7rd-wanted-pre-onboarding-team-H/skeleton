import { assertEquals } from "https://deno.land/std@0.204.0/assert/assert_equals.ts"
import { tempAppFrom } from "../test_utils.ts"
import { likesController } from "./likes_controller.ts"

const { client } = await tempAppFrom(likesController)

Deno.test(`put /likes/{id}`, async (t) => {
	await t.step("존재하지 않는 글 요청", async () => {
		const res = await client.likes[":id"].$put({ param: { id: "0" } })
		assertEquals(res.status, 404)
	})
	await t.step("존재하는 글 요청", async () => {
		const res = await client.likes[":id"].$put({ param: { id: "1" } })
		const json = await res.json()

		assertEquals(res.status, 200)
		assertEquals(json, { message: "좋아요 진짜 성공 :895" })
	})
})
