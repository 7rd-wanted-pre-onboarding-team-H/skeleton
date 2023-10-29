/// <reference lib="deno.ns" />
import { html } from "hono/html"
import { OpenAPIHono } from "hono_zod_openapi"

export const info = {
	title: "소셜 미디어 통합 Feed 서비스",
	version: "0.0.0-alpha",
	description: "원티드 프리온보딩 백엔드 인턴십 7차 H조의 1주차 과제입니다.",
}

const id = "swagger-ui"
const swaggerUi = "https://unpkg.com/swagger-ui-dist"

type SwaggerOption = {
	path: string | URL
	info: Record<"title" | "description", string> // TODO: InfoObject 객체 사용
	version?: string
}

export const swaggerUiByUrl = (
	{ info: { title, description }, path, version = "5.0.0" }: SwaggerOption,
) =>
	html`
        <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <title>${title}</title>
                <meta property="og:title" content="${title}" />
                <meta property="og:type" content="website" />
                <meta property="og:image" content="https://raw.githubusercontent.com/denolib/animated-deno-logo/master/deno-rect-24fps.gif" />
                <meta property="og:image:type" content="image/gif" />
                <meta property="og:image:alt" content="An animated Deno logo" />
                <meta name="description" content="${description}" />
                <meta property="og:description" content="${description}" />
                <link rel="icon" href="https://raw.githubusercontent.com/denolib/high-res-deno-logo/master/deno_hr_circle.svg" />
                <link rel="stylesheet" href="${swaggerUi}@${version}/swagger-ui.css" />
            </head>
            <body>
                <div id="${id}"></div>
                <script src="${swaggerUi}@${version}/swagger-ui-bundle.js" crossorigin></script>
                <script>
                    window.onload = () => {
                        window.ui = SwaggerUIBundle({ url: "${path}", dom_id: "#${id}" })
                    }
                </script>
            </body>
        </html>
    `

type Option = { pageUrl: string; jsonUrl: string }
const baseOption: Option = { pageUrl: "/openapi", jsonUrl: "/openapi.json" }

export const serveOpenapi = (app: OpenAPIHono, option?: Partial<Option>) => {
	const { pageUrl, jsonUrl } = { ...baseOption, ...option }
	app.doc31(jsonUrl, { openapi: "3.1.0", info })
	app.get(pageUrl, (c) => c.html(swaggerUiByUrl({ info, path: jsonUrl })))
}
