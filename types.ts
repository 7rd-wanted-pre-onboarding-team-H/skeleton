import type { ColumnType } from "kysely"

export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
	? ColumnType<S, I | undefined, U>
	: ColumnType<T, T | undefined, T>

export interface Hashtag {
	content: string
	id: Generated<number>
}

export interface Posting {
	content: string
	content_id: string
	created_at: Generated<string>
	id: Generated<number>
	like_count: Generated<number>
	share_count: Generated<number>
	title: string
	type: string
	updated_at: Generated<string>
	user_id: number
	view_count: Generated<number>
}

export interface PostingToHashtag {
	hashtag_id: number
	posting_id: number
}

export interface User {
	created_at: Generated<string>
	email: string
	id: Generated<number>
	password: string
	name: string
}

export interface DB {
	hashtag: Hashtag
	posting: Posting
	posting_to_hashtag: PostingToHashtag
	user: User
}
