import { assertEquals } from "https://deno.land/std@0.204.0/assert/assert_equals.ts"
import { tempAppFrom } from "../test_utils.ts"
import { summationController } from "./summation_controller.ts"

const { client } = await tempAppFrom(summationController)

Deno.test(`get /summations`, async (t) => {
	await t.step("존재하지 게시물의 통계 요청", async () => {
		const res = await client.summations.$get({
			query: {
				content: "test",
				type: "date",
				start: "2023-01-01",
				end: "2023-01-15",
				value: "postings",
			},
		})
		assertEquals(res.status, 404)
	})

	await t.step("잘못된 요청, 유효하지 않은 날짜 범위(date, 30일 초과)", async () => {
		const res = await client.summations.$get({
			query: {
				content: "test",
				type: "date",
				start: "2023-01-01",
				end: "2023-02-05",
				value: "postings",
			},
		})
		assertEquals(res.status, 400)
	})

	await t.step("잘못된 요청, 유효하지 않은 날짜 범위(hour, 7일 초과)", async () => {
		const res = await client.summations.$get({
			query: {
				content: "test",
				type: "hour",
				start: "2023-01-01",
				end: "2023-01-15",
				value: "postings",
			},
		})
		assertEquals(res.status, 400)
	})
})
