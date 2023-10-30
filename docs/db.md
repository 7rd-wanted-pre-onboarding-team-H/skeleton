# DB

## SQLite

### [스키마 구조 확인](https://sqlite.org/cli.html#changing_output_formats#querying_the_database_schema)

```sql
sqlite> .schema --indent
CREATE TABLE IF NOT EXISTS "user"(
  "id" integer not null primary key autoincrement,
  "email" text not null,
  "password" text not null,
  "created_at" text default CURRENT_TIMESTAMP not null
);
-- ...
```

### [쿼리 컬럼을 행으로 출력](https://sqlite.org/cli.html#changing_output_formats)

```
sqlite> .mode line
sqlite> -- 쿼리...

       type = twitter
      title = 보호한다. 신체의 ...
    content = 모든 구성하지 정하는 무상으로 처벌받...
 view_count = 6256
 like_count = 802
 created_at = 2023-01-20T07:30:45.384Z
 updated_at = 2023-02-14T17:09:05.698Z
share_count = 29
   hashtags = ["online","interface"]
```

## 쿼리 빌더

타입 안전한 쿼리 빌더인 [kysely](https://kysely.dev) 라이브러리를 사용합니다.

### 단일 행 조회

```sql
SELECT * FROM "posting" WHERE "posting"."id" = 1;
```

```ts
db
	.selectFrom("posting")
	.selectAll()
	.where("posting.id", "=", 1)
	.executeTakeFirst()
```

### 여러 행 조회

```sql
SELECT "type", "title" FROM "posting";
```

```ts
db
	.selectFrom("posting")
	.select(["type", "title"])
	.executeTakeFirst()
```

### 행 추가

```sql
INSERT INTO "hashtag" ("content") values ('dani');
```

```ts
db
	.insertInto("hashtag")
	.values({ content: "dani" })
	.execute()
```

### 행 업데이트

```sql
UPDATE "hashtag" SET "content" = 'test' WHERE "hashtag"."id" = 1;
```

```ts
db
	.updateTable("hashtag")
	.set({ content: "test" })
	.where("hashtag.id", "=", 1)
```

### 게시물과 해시태그 목록 조회

```sql
SELECT
  "p"."type",
  substr("p"."title", 1, 10) || '...' as "title",
  substr("p"."content", 1, 20) || '...' as "content",
  "p"."view_count",
  "p"."like_count",
  "p"."created_at",
  "p"."updated_at",
  "p"."share_count",
  json_group_array("h_all"."content") as "hashtags"
FROM "posting" as "p"
INNER JOIN "posting_to_hashtag" as "ph_all" ON "ph_all"."posting_id" = "p"."id"
INNER JOIN "hashtag" as "h_all" ON "h_all"."id" = "ph_all"."hashtag_id"
GROUP BY "p"."id";
```

```ts
db
	.selectFrom("posting as p")
	.innerJoin("posting_to_hashtag as ph_all", "ph_all.posting_id", "p.id")
	.innerJoin("hashtag as h_all", "h_all.id", "ph_all.hashtag_id")
	.select(({ ref }) => [
		"p.type",
		sql<string>`substr(${ref("p.title")}, 1, 10) || '...'`.as("title"),
		sql<string>`substr(${ref("p.content")}, 1, 20) || '...'`.as("content"),
		"p.view_count",
		"p.like_count",
		"p.created_at",
		"p.updated_at",
		"p.share_count",
		sql<string[]>`json_group_array(${ref("h_all.content")})`.as("hashtags"),
	])
	.groupBy("p.id")
```
