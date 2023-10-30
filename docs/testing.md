# 테스트

## 코드 컨벤션 및 스타일 준수

- 코드 스타일: [deno 내장 포매터](https://docs.deno.com/runtime/manual/tools/formatter) 사용
- 코드 컨벤션: [deno 내장 린터](https://deno.land/manual/tools/linter) 사용

```sh
# formatter
deno fmt

# lint
deno lint
```

## 테스트 실행

https://github.com/7rd-wanted-pre-onboarding-team-H/w1-social-feed/assets/54838975/0d179706-62a9-40a9-aadc-f5e1a781c608

```sh
# 타입 검사를 포함해 각 엔드포인트를 테스트합니다.
deno task test

# 타입 검사를 생략하고 파일에 변화가 생길 때마다 다시 테스트합니다.
deno task test:no-check
```

## 테스트 작성

- [Deno.test](https://docs.deno.com/runtime/manual/basics/testing/)

```ts
import { assertEquals } from "https://deno.land/std@0.204.0/assert/assert_equals.ts" // 두 값을 깊게 비교합니다.
import { tempAppFrom } from "../test_utils.ts" // 테스트를 위한 임시 앱을 생성합니다. 컨트롤러를 인자로 받습니다.
import { helloController } from "./hello_controller.ts" // 테스트할 컨트롤러입니다.

// 테스트에 사용할 임시 앱을 생성합니다.
// in-memory DB를 사용하므로, 테스트 실행이 DB에 영향을 주지 않습니다.
const { client } = await tempAppFrom(helloController)

Deno.test(`GET /hello/world`, async () => {
	// 각 엔드포인트와 메서드별로 요청을 보냅니다.
	// 반환값은 Response 객체입니다.
	const res = await client.hello[":name"].$get({ param: { name: "world" } })
	const json = await res.json()

	// assertEquals를 통해 두 값을 비교합니다.
	assertEquals(res.status, 200)
	assertEquals(json, { message: "hello world" })
})
```

## 배포

[deno deploy](https://deno.com/deploy)를 통해 main 브랜치에 커밋될 때마다 자동으로 [swagger UI](https://wanted-w1-social-feed.deno.dev)가 배포됩니다.

### PR에서 배포 확인

![image](https://github.com/7rd-wanted-pre-onboarding-team-H/w1-social-feed/assets/54838975/7ffb7c39-39a7-4369-a9df-997340894a10)

PR에서도 실시간으로 배포된 API와 Swagger UI를 확인할 수 있습니다.

- `Deno/wanted-w1-social-feed`: 현재 커밋이 배포된 API 링크입니다.
- `Deno/wanted-w1-social-feed/wanted-w1-social-feed--<브랜치명>.deno.dev`: PR 최신 커밋에서 배포된 API입니다.
