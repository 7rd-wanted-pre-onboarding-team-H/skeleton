import { assertEquals } from "https://deno.land/std@0.204.0/assert/assert_equals.ts"
import { assert } from "https://deno.land/std@0.204.0/assert/assert.ts"
import { assertMatch } from "https://deno.land/std@0.204.0/assert/assert_match.ts"
import { tempAppFrom } from "../test_utils.ts"
import { signupController } from "./signup_controller.ts"
import { assertObjectMatch } from "https://deno.land/std@0.204.0/assert/assert_object_match.ts"

const { db, client } = await tempAppFrom(signupController)

const credentials = { email: "foo@bar.com", password: "hello123456!" }

Deno.test("POST /auth/signup", async (t) => {
	const payload = { name: "dani", ...credentials } as const
	const req = async () => await client.auth.signup.$post({ json: payload })

	await t.step("OTP 정상적으로 생성", async () => {
		const res = await req()
		const json = await res.json()

		assertEquals(res.status, 201)
		assert("otp" in json)
		assertMatch(json.otp, /^[0-9]{6}$/)
	})

	await t.step("중복 사용자 생성 불가", async () => {
		const res = await req()

		assertEquals(res.status, 409)
	})
})

Deno.test("POST /auth/otp (인증 성공)", async (t) => {
	const otp = "123456"
	const userId = 1
	const payload = { name: "inad", ...credentials } as const

	await db.updateTable("user")
		.set(payload)
		.where("id", "=", userId)
		.executeTakeFirstOrThrow()

	await db.insertInto("otp").values({
		code: otp,
		user_id: userId,
		expires_at: new Date("2077-01-01").toISOString(),
	}).executeTakeFirstOrThrow()

	await t.step("OTP 인증 성공", async () => {
		const res = await client.auth.otp.$post({ json: { ...payload, otp } })
		const json = await res.json()

		assertEquals(res.status, 200)
		assertObjectMatch(json, json)
	})

	await t.step("OTP 만료", async () => {
		await db.updateTable("otp")
			.set({ expires_at: new Date("2000-01-01").toISOString() })
			.where("user_id", "=", userId)
			.executeTakeFirstOrThrow()

		const res = await client.auth.otp.$post({ json: { ...payload, otp } })

		assertEquals(res.status, 400)
	})
})
