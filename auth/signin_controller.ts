import { signInUser } from "./signin_routes.ts";
import { OpenAPIHono } from "hono_zod_openapi";
import { getUserByName } from "./signin_data.ts";
import { DB } from "../types.ts";
import { Kysely } from "kysely";
import { sign } from 'hono/jwt'
import { setCookie } from "hono/cookie";
import { config } from "https://deno.land/x/dotenv/mod.ts";

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
        const payload = {
            iat: Math.floor(Date.now() / 1000), // 1000 으로 나눠서 초 단위로 만들어줌
            sub: 'wanted social-feed user',
            exp: Math.floor((Date.now() / 1000)) + ( 60 * 60 * 24 * 1 ),  // 1 day
            userId: user.id,
        };
        const token = await sign(payload, config().SECRET_KEY);
        setCookie(c, 'access-token', token, { path: '/', maxAge: 60 * 60 * 24 * 1})
        return c.text("로그인 성공");
    });
}