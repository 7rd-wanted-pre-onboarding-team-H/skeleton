import { createRoute, z } from "hono_zod_openapi"
import { errorJson, openApiJson } from "../utils.ts"
import { passwordSchema } from "./password_rules.ts"

const nameSchema = z.string().min(1).openapi({
	description: "계정명입니다. 중복 생성이 불가합니다.",
	example: "dani",
})
const emailSchema = z.string().email().openapi({
	description: "이메일 주소입니다. 중복 생성이 가능합니다.",
	example: "wanted@gmail.com",
})
const userSchema = z.object({ name: nameSchema, email: emailSchema })
const otpSchema = z.object({
	otp: z.string().length(6).regex(/^[0-9]+$/).openapi({ example: "123456" }),
})

const otpResponse = {
	description: "회원가입 인증용 OTP를 발송합니다.",
	...openApiJson(otpSchema),
}

export const signUpRoute = createRoute({
	method: "post",
	path: "/auth/signup",
	tags: ["auth"],
	summary: "신규 회원가입을 요청합니다.",
	request: {
		body: {
			description: "회원가입 요청을 위한 정보를 입력합니다.",
			...openApiJson(userSchema.extend({ password: passwordSchema })),
		},
	},
	responses: {
		201: otpResponse,
		409: {
			description: "이미 존재하는 사용자입니다.",
			...errorJson(z.string().openapi({ example: "이미 존재하는 사용자입니다." })),
		},
	},
})

export const getOtpRoute = createRoute({
	method: "get",
	path: "/auth/otp",
	tags: ["auth"],
	summary: "이메일 인증 OTP를 발송합니다.",
	request: {
		headers: z.object({
			Authorization: z.string()
				.transform((value) => value.replace("Bearer ", "")),
		}),
	},
	responses: { 200: otpResponse },
})

export const verifyEmailRoute = createRoute({
	method: "post",
	path: "/auth/otp",
	tags: ["auth"],
	summary: "이메일로 발송된 회원가입 인증 OTP를 검증합니다.",
	request: {
		body: {
			description: "회원가입 인증용 OTP를 입력합니다.",
			...openApiJson(otpSchema.merge(userSchema)),
		},
	},
	responses: {
		200: {
			description: "회원가입이 완료되었습니다.",
			...openApiJson(userSchema),
		},
		404: {
			description: "인증정보를 찾을 수 없습니다.",
			...errorJson(z.string().openapi({ example: "인증정보를 찾을 수 없습니다." })),
		},
		400: {
			description: "인증정보가 일치하지 않습니다.",
			...errorJson(z.string().openapi({ example: "OTP가 일치하지 않습니다." })),
		},
	},
})
