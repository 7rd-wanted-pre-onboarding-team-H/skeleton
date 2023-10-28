import { signInUser } from "./signin_routes.ts";
import { OpenAPIHono } from "hono_zod_openapi";
import { getUserByName } from "./signin_data.ts";
import { DB } from "../types.ts";
import { Kysely } from "kysely";
import { sign } from 'hono/jwt'

import { config } from "https://deno.land/x/dotenv/mod.ts"

export const signInController = (db: Kysely<DB>) => {
    return new OpenAPIHono().openapi(signInUser, async (c) => {
        const { name, password } = c.req.valid("json")
        
        const envFileObject = config()

        console.log(name, password)
        const user = await getUserByName(db, name);
        if (!user) {
            return c.jsonT({ error: "로그인 실패. 닉네임 없음" }, 401);
        }
        console.log(user.password, password)
        if (user.password !== password) {
            return c.jsonT({ error: "로그인 실패" }, 401);
        }
        const payload = {
            iat: Date.now(),
            sub: 'wanted social-feed user',
            // 1 day
            exp: Date.now() + 1000 * 60 * 60 * 24 * 1,
            userId: user.id,
        };
        const token = await sign(payload, envFileObject.SECRET_KEY);
        c.res.headers.set("Set-Cookie", `access_token=${token};`)
        return c.text("로그인 성공");
    });
}