import { assertThrows } from "https://deno.land/std@0.204.0/assert/assert_throws.ts"
import { assertEquals } from "https://deno.land/std@0.204.0/assert/assert_equals.ts"
import { passwordSchema } from "./password_rules.ts"
import { faker } from "faker"

Deno.test("숫자로만 이루어진 비밀번호 사용 불가", () => {
	const numberOnlyPw = Array.from(
		{ length: faker.number.int({ min: 10, max: 20 }) },
		() => faker.number.int({ min: 0, max: 9 }),
	).join("")

	assertThrows(() => passwordSchema.parse(numberOnlyPw))
})

Deno.test("연속된 문자 사용 불가", () => {
	assertThrows(() => passwordSchema.parse("aaaaabbbbb"))
})

const cases = ["a1bcdefghijklmnop", "a!bcdefghijklmnop", "1!234567890"]
cases.forEach((x) => {
	Deno.test(`문자, 숫자, 특수문자 중 2가지 이상 포함: ${x}`, () => {
		assertEquals(passwordSchema.parse(x), x)
	})
})
