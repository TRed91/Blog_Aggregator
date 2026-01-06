import { and, eq, sql } from "drizzle-orm";
import { db } from "..";
import { feedFollows, feeds, Feed, FeedFollow, users, User } from "../schema";
import { RSSFeed } from "src/fetch_feed";

export async function createFeed(name: string, url: string,userId: string): Promise<Feed> {
    const [result] = await db.insert(feeds)
        .values({name: name, url: url, userId: userId})
        .returning();
    return result;
};

export async function getFeeds(): Promise<Feed[]> {
    const result = await db.select().from(feeds);
    return result;
}

export async function getFeedByUrl(url: string): Promise<Feed> {
    const [result] = await db.select().from(feeds).where(eq(feeds.url, url));
    return result;
}

export async function createFeedFollow(userId: string, feedId: string) {
    const [newFeedFollow] = await db.insert(feedFollows)
        .values({userId, feedId})
        .returning(); 

    const [result] = await db.select({
            feedFollowId: feedFollows.id, 
            createdAt: feedFollows.createdAt, 
            updatedAt: feedFollows.updatedAt, 
            feed: feeds.name, 
            user: users.name})
        .from(feedFollows)
        .where(eq(feedFollows.id, newFeedFollow.id))
        .innerJoin(users, eq(users.id, newFeedFollow.userId))
        .innerJoin(feeds, eq(feeds.id, newFeedFollow.feedId))

    return result;
}

export async function getFeedFollowsForUser(userId: string) {
    const result = await db.select({
            id: feedFollows.id,
            createtAt: feedFollows.createdAt,
            updatedAt: feedFollows.updatedAt, 
            feed: feeds.name, 
            user: users.name
        })
        .from(feedFollows)
        .where(eq(feedFollows.userId, userId))
        .innerJoin(feeds, eq(feeds.id, feedFollows.feedId))
        .innerJoin(users, eq(users.id, feeds.userId));
    
    return result;
}

export async function deleteFeedFollow(userId: string, feedId: string): Promise<FeedFollow> {
    const [result] = await db.delete(feedFollows)
        .where(and(
            eq(feedFollows.feedId, feedId), 
            eq(feedFollows.userId, userId)))
        .returning();
    
    return result;
}

export async function markFeedFetched(feedId: string): Promise<Feed> {
    const timestamp = new Date();
    const [result] = await db.update(feeds).set({
        createdAt: timestamp,
        lastFetchedAt: timestamp
    }) .where(eq(feeds.id, feedId))
        .returning()
    
    return result;
}

export async function getNextFeedToFetch() : Promise<Feed> {
    const [result] = await db.execute(sql<Feed>`select * from ${feeds} order by ${feeds.lastFetchedAt} asc nulls first limit 1`);

    const feed = validateFeed(result);

    return feed;
}

function validateFeed(feed: Record<string, unknown>): Feed{
    if ("id" in feed &&         typeof (feed.id) === "string" && 
        "name" in feed &&       typeof (feed.name) === "string" &&
        "created_at" in feed && typeof (feed.created_at) === "string" &&
        "updated_at" in feed && typeof (feed.updated_at) === "string" &&
        "last_fetched_at" in feed && (feed.last_fetched_at === null || typeof(feed.last_fetched_at) === "string") &&
        "url" in feed &&        typeof (feed.url) === "string" &&
        "userId" in feed &&     typeof (feed.userId) === "string") {
            return {
                id: feed.id,
                name: feed.name,
                createdAt: new Date(feed.created_at),
                updatedAt: new Date(feed.updated_at),
                lastFetchedAt: feed.last_fetched_at === null ? null : new Date(feed.last_fetched_at),
                url: feed.url,
                userId: feed.userId
            }
        }
    throw new Error(`Invalid feed data received from db:\n${feed}`)
}