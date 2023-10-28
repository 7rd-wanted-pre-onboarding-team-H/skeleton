import { signInUser } from "./signin_routes.ts";
import { OpenAPIHono } from "hono_zod_openapi";
import { getUserByName } from "./signin_data.ts";
import { DB } from "../types.ts";
import { Kysely } from "kysely";

export const signInController = (db: Kysely<DB>) => {
    return new OpenAPIHono().openapi(signInUser, async (c) => {
        const { name, password } = c.req.valid("json")

        console.log(name, password)
        const user = await getUserByName(db, name);
        if (!user) {
            return c.jsonT({ error: "로그인 실패. 닉네임 없음" }, 401);
        }
        console.log(user.password, password)
        if (user.password !== password) {
            return c.jsonT({ error: "로그인 실패" }, 401);
        }
        // jwt 로 변경 예정
        c.res.headers.set("Set-Cookie", `access_token=${user.id, user.name};`)
        return c.text("로그인 성공");
    });
}