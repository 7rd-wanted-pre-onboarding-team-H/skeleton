# 개발 가이드

## 프로젝트 구조

```
.
├── hello
│   ├── hello_controller.ts
│   ├── hello_routes.ts
│   ├── hello_test.ts
│   └── mod.ts
├── posting
│   ├── mod.ts
│   ├── posting_controller.ts
│   ├── posting_repo.ts
│   ├── posting_routes.ts
│   └── posting_test.ts
└── main.ts
```

- `mod.ts` 모듈(module) 파일로, node의 `index.ts`와 같은 역할을 합니다. 디렉터리 내 필요한 항목들을 `export`합니다.
- `*_controller.ts`: 각 엔드포인트별로 요청을 처리합니다.
- `*_routes.ts`: [zod 스키마][hono-zod-openapi-route]로 OpenAPI 스펙에 따라 각 엔드포인트의 경로를 정의합니다.
- `*_test`: 개별 컨트롤러 동작을 테스트합니다.

[hono-zod-openapi-route]: https://github.com/honojs/middleware/tree/main/packages/zod-openapi#basic-usage

## OpenAPI 엔드포인트 정의

- [zod 스키마 정의법](https://zod.dev)
- [Hono-Zod-OpenAPI 엔드포인트 정리법](https://github.com/honojs/middleware/tree/main/packages/zod-openapi#setting-up-your-application)

`*_routes.ts`에 OpenAPI 스펙에 따라 엔드포인트를 정의합니다.

```ts
import { createRoute, z } from "hono_zod_openapi"
import { openApiJson } from "../utils.ts"

export const helloRoute = createRoute({
	method: "post", // HTTP 메서드
	path: "/hello/{name}", // {}로 감싼 부분은 URL 파라미터입니다.

	tags: ["hello"], // Swagger UI에서 태그별로 엔드포인트를 그룹화합니다.
	summary: "주어진 이름으로 인사합니다.", // Swagger UI에서 엔드포인트를 설명합니다.

	// 요청 스키마. params, query, body, headers, cookies를 정의합니다.
	request: {
		// path에서 정의된 URL 파라미터를 검사합니다.
		params: z.object({
			name: z.string().min(1).openapi({
				param: { name: "name", in: "path", required: true },
				example: "world", // Swagger UI에서 예시를 보여줍니다.
			}),
		}),
		// query string에서 검사할 스키마를 정의합니다.
		query: z.object({
			age: z.coerce.number().int().positive().openapi({
				param: { name: "age", in: "query", required: false },
				example: 20,
			}),
		}),
		// JSON body에서 검사할 스키마를 정의합니다.
		body: {
			description: "JSON 형태의 body를 입력으로 받습니다.",
			...openApiJson(z.object({ test: z.string() })),
		},
	},

	// HTTP 응답 스키마. 200, 400, 500 등의 HTTP 상태 코드별로 정의합니다.
	responses: {
		200: {
			description: "성공적으로 인사 완료", // Swagger UI에서 응답을 설명합니다.

			// { message: "hello world" } 형식의 JSON 응답을 정의합니다.
			...openApiJson(z.object({
				message: z.string().openapi({
					example: "hello world",
				}),
			})),
		},
	},
})
```

## 컨트롤러 정의

```ts
// 데이터베이스를 사용하기 위한 Kysely와 DB 타입을 가져옵니다.
import type { Kysely } from "kysely"
import type { DB } from "../types.ts"

import { OpenAPIHono } from "hono_zod_openapi" // OpenAPIHono 클래스를 가져옵니다.
import { helloRoute } from "./hello_routes.ts" // 정의한 엔드포인트를 가져옵니다.

// helloRoute에 정의된 스키마를 기반으로 컨트롤러를 정의합니다.
export const helloController = () =>
	// 각 루트 경로 (예: /hello/) 컨트롤러를 정의합니다.
	new OpenAPIHono()
		// .openapi 메서드를 체이닝하여 엔드포인트를 정의합니다.
		.openapi(helloRoute, (c) => {
			// c는 컨텍스트 객체로, 요청과 응답을 다룹니다.
			// helloRoute에서 이미 스키마에 따라 HTTP 요청을 파싱했으므로, `c.req.valid` 메서드를 통해 검사된 값을 가져올 수 있습니다.
			const { name } = c.req.valid("param")

			// Response 객체를 반환합니다.
			return c.jsonT({ message: `hello ${name}` })
		})
```

## 컨트롤러 등록

```ts
import { logger } from "hono/logger"
import { prettyJSON } from "hono/pretty-json"
import { OpenAPIHono } from "hono_zod_openapi"
import { serveOpenapi } from "./swagger.ts"
import { helloController } from "./hello/mod.ts"
import { postingController } from "./posting/mod.ts"
import { kyselyFrom } from "./kysely_from.ts"

// SQLite DB를 사용합니다.
const db = kyselyFrom(Deno.args[0] ?? "test.db")

// Hono 앱을 생성합니다.
const app = new OpenAPIHono()
	// 미들웨어를 등록합니다.
	.use("*", logger(), prettyJSON())
	// 루트 경로에 컨트롤러를 등록합니다.
	.route("", helloController())
	// posting 경로에 컨트롤러를 등록하고, DB를 인자로 넘깁니다.
	.route("", postingController(db))

// Swagger UI를 사용합니다. (경로: "/openapi")
serveOpenapi(app as OpenAPIHono)

Deno.serve(app.fetch)

app.showRoutes()
```
