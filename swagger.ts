/// <reference lib="deno.ns" />
import { html } from "hono/html"
import { OpenAPIHono } from "hono_zod_openapi"

export const info = {
	title: "Feed API",
	version: "0.0.0-alpha",
	description: "소셜 미디어 통합 Feed 서비스",
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
                <meta name="description" content="${description}" />
                <meta name="og:description" content="${description}" />
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
