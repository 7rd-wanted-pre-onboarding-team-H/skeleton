# 원티드 1주차 소셜 미디어 통합 Feed 서비스

<p align="center" width="100%">
  <img alt="TypeScript"
    src="https://img.shields.io/badge/-TypeScript-%23007ACC?style=for-the-badge&logo=typescript&logoColor=white" />
  <img alt="Hono"
    src="https://img.shields.io/badge/hono-f0ffff.svg?style=for-the-badge&logo=data:image/svg%2bxml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPCFET0NUWVBFIHN2ZyBQVUJMSUMgIi0vL1czQy8vRFREIFNWRyAxLjEvL0VOIiAiaHR0cDovL3d3dy53My5vcmcvR3JhcGhpY3MvU1ZHLzEuMS9EVEQvc3ZnMTEuZHRkIj4KPHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZlcnNpb249IjEuMSIgd2lkdGg9IjUwMHB4IiBoZWlnaHQ9IjUwMHB4IiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+CjxnPjxwYXRoIHN0eWxlPSJvcGFjaXR5OjAuOTkzIiBmaWxsPSIjZmY1YjExIiBkPSJNIDI1Ny41LDAuNSBDIDI1OC44MjIsMC4zMzAwMzQgMjU5Ljk4OSwwLjY2MzM2OCAyNjEsMS41QyAyOTguMTkzLDQ2Ljg5MzYgMzMzLjE5Myw5My44OTM2IDM2NiwxNDIuNUMgMzkwLjI4OSwxNzkuMDY5IDQxMC45NTUsMjE3LjczNSA0MjgsMjU4LjVDIDQ1NS4yMjEsMzMxLjEwNCA0NDEuMDU0LDM5NC4yNzEgMzg1LjUsNDQ4QyAzMzYuODkyLDQ4OS4wODIgMjgwLjg5Miw1MDUuMDgyIDIxNy41LDQ5NkMgMTQxLjcyNyw0ODAuNTUxIDkwLjIyNjUsNDM2LjcxOCA2MywzNjQuNUMgNTUuOTA4MSwzNDAuOTg5IDUzLjU3NDgsMzE2Ljk4OSA1NiwyOTIuNUMgNjAuMDM4NCwyNTAuMzQ3IDcwLjAzODQsMjA5LjY4IDg2LDE3MC41QyA5Mi42NTA5LDE1NC41MTQgMTAxLjMxOCwxMzkuODQ4IDExMiwxMjYuNUMgMTIwLjcxNSwxMzYuODggMTI5LjA0OCwxNDcuNTQ3IDEzNywxNTguNUMgMTQwLjY4MiwxNjIuMzQ5IDE0NC41MTUsMTY2LjAxNiAxNDguNSwxNjkuNUMgMTc4LjkxNywxMDkuMTM2IDIxNS4yNTEsNTIuODAyOCAyNTcuNSwwLjUgWiIvPjwvZz4KPGc+PHBhdGggc3R5bGU9Im9wYWNpdHk6MSIgZmlsbD0iI2ZmOTc1OCIgZD0iTSAyNTAuNSw4MS41IEMgMjg3LjE5MywxMjQuMDYgMzIwLjM2LDE2OS4zOTMgMzUwLDIxNy41QyAzNTkuMjkzLDIzMy40MTggMzY2Ljk1OSwyNTAuMDg1IDM3MywyNjcuNUMgMzg1LjU4NCwzMTcuMDA4IDM3Mi4wODQsMzU3Ljg0MiAzMzIuNSwzOTBDIDI5NC4yMTYsNDE2LjkzOSAyNTIuMjE2LDQyNC45MzkgMjA2LjUsNDE0QyAxNTcuMjAxLDM5OC43MDIgMTI4LjcwMSwzNjUuNTM1IDEyMSwzMTQuNUMgMTE5LjEzMSwyOTguNDA5IDEyMC43OTgsMjgyLjc0MiAxMjYsMjY3LjVDIDEzMy40MTgsMjQ4LjY2MyAxNDIuNDE4LDIzMC42NjMgMTUzLDIxMy41QyAxNjMsMTk4LjgzMyAxNzMsMTg0LjE2NyAxODMsMTY5LjVDIDIwNS43MTYsMTQwLjI5IDIyOC4yMTYsMTEwLjk1NyAyNTAuNSw4MS41IFoiLz48L2c+Cjwvc3ZnPgo=" />
  <img alt="Deno" src="https://img.shields.io/badge/deno-000000.svg?style=for-the-badge&logo=deno&logoColor=white" />
  <img alt="Swagger"
    src="https://img.shields.io/badge/-Swagger-%23Clojure?style=for-the-badge&logo=swagger&logoColor=white" />
  <img alt="SQLite"
    src="https://img.shields.io/badge/sqlite-%2307405e.svg?style=for-the-badge&logo=sqlite&logoColor=white" />
</p>

여러 SNS 서비스의 피드를 통합하여 알림을 받을 수 있는 서비스입니다.

## 실행 방법

### [온라인 Swagger UI][deno-deploy-url]

[![Deno Deploy][deno-deploy-badge]][deno-deploy]

https://github.com/7rd-wanted-pre-onboarding-team-H/w1-social-feed/assets/54838975/ada43f88-38d1-4da2-a9ce-b98eec8eaca3

- [deno deploy][deno-deploy]에 배포된 Swagger UI를 통해 모든 API를 확인하고 실행할 수 있습니다.
- 서버는 `main` 브랜치의 최신 커밋으로 자동 배포됩니다.
- sqlite의 in-memory 모드를 사용하므로 배포시 모든 데이터가 초기화되나, 이용시 개인정보를 입력하지 말아주세요.

[deno-deploy]: https://deno.com/deploy
[deno-deploy-url]: https://wanted-w1-social-feed.deno.dev
[deno-deploy-badge]: https://img.shields.io/github/deployments/7rd-wanted-pre-onboarding-team-H/w1-social-feed/Production.svg?style=for-the-badge&logo=deno&label=Deno%20Deploy&labelColor=black

### 준비 사항

- 서버 실행을 위해 [deno 런타임][deno]이 필요합니다.
- wasm으로 컴파일 된 [sqlite][deno-sqlite] 패키지를 사용하므로 데이터베이스를 설치하실 필요는 없습니다.
- [vscode][deno-vscode] 확장 프로그램을 설치하면 타입 검사 및 다양한 기능을 사용할 수 있습니다.

[deno-vscode]: https://marketplace.visualstudio.com/items?itemName=denoland.vscode-deno
[deno]: https://docs.deno.com/runtime/manual/getting_started/installation
[deno-sqlite]: https://deno.land/x/sqlite@v3.8

### 개발 모드([`--watch`][watch-mode])로 실행

```sh
# 저장소를 클론합니다.
git clone https://github.com/7rd-wanted-pre-onboarding-team-H/w1-social-feed
cd w1-social-feed

# DB에 더미 데이터를 추가합니다. (생략 가능)
deno task db:seed

# 개발 모드로 실행합니다.
deno task dev
```

<http://localhost:8000/> 에서 Swagger UI를 통해 API 문서를 확인하고 실행할 수 있습니다.

[watch-mode]: https://docs.deno.com/runtime/manual/getting_started/command_line_interface#watch-mode

### 프로덕션 모드

```sh
deno task prod # 또는 deno run -A main.ts
```
