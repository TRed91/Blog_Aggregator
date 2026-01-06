import { desc, eq, or } from "drizzle-orm";
import { db } from "..";
import { feedFollows, feeds, Post, posts, users } from "../schema";

export async function createPost(title: string, url: string, feedId: string, publishedAt: Date, description: string | null): Promise<Post> {
    const [result] = await db.insert(posts).values({url, title, feedId, publishedAt, description}).returning();

    return result;
}

export async function getPostsForUser(userId: string, limit: number): Promise<Post[]> {
    const result = await db.select({
        id: posts.id,
        createdAt: posts.createdAt,
        updatedAt: posts.updatedAt,
        title: posts.title,
        url: posts.url,
        description: posts.description,
        publishedAt: posts.publishedAt,
        feedId: posts.feedId
    })
        .from(posts)
        .innerJoin(feeds, eq(feeds.id, posts.feedId))
        .innerJoin(feedFollows, eq(feeds.id, feedFollows.feedId))
        .where(or(eq(feedFollows.userId, userId), eq(feeds.userId, userId)))
        .orderBy(desc(posts.publishedAt))
        .limit(limit)
    
    return result;
}