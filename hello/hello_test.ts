import { assertEquals } from "https://deno.land/std@0.204.0/assert/assert_equals.ts"
import { tempAppFrom } from "../test_utils.ts"
import { helloController } from "./hello_controller.ts"

const { client } = await tempAppFrom(helloController)

Deno.test(`GET /hello/world`, async () => {
	const res = await client.hello[":name"].$get({ param: { name: "world" } })
	const json = await res.json()

	assertEquals(res.status, 200)
	assertEquals(json, { message: "hello world" })
})
