import { assertEquals } from "https://deno.land/std@0.204.0/assert/assert_equals.ts"
import { tempAppFrom } from "../test_utils.ts"
import { helloController } from "./hello_controller.ts"

const { client } = await tempAppFrom(helloController as any)

Deno.test(`GET /hello/world`, async () => {
	const res = await (client as any).hello[":name"].$get({
		param: { name: "world" },
		cookie: {
			"access-token":
				"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.keH6T3x1z7mmhKL1T3r9sQdAxxdzB6siemGMr_6ZOwU",
		},
	})
	// console.log(res)
	const json = await res.json()
	// console.log(json)
	assertEquals(res.status, 200)
	assertEquals(json, { message: "hello world" })
})
