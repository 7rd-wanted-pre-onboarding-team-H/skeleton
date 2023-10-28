import { assertEquals } from "https://deno.land/std@0.204.0/assert/assert_equals.ts"
import { assertObjectMatch } from "https://deno.land/std@0.204.0/assert/assert_object_match.ts"
import { tempAppFrom } from "../test_utils.ts"
import { postingShareController } from "./posting_controller.ts"

const { db, client } = await tempAppFrom(postingShareController)

Deno.test(`put /postings/share/{id}`, async (t) => {
	await t.step("존재하지 않는 글 요청", async () => {
		const res = await client.postings.share[":id"].$put({ param: { id: "0" } })
		assertEquals(res.status, 404)
	})
	await t.step("존재하는 글 요청", async () => {
    const { share_count } = await db.selectFrom("posting").select("share_count").where("id", "=", 1)
      .executeTakeFirstOrThrow()

		const res = await client.postings.share[":id"].$put({ param: { id: "1" } })
		const json = await res.json()

		assertEquals(res.status, 200)
		assertObjectMatch(json, { share_count: share_count + 1 })
	})
})