import { and, eq, ne } from "drizzle-orm";
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

export async function deleteFeedFollow(userId: string, feedId: string) {
    const result = await db.delete(feedFollows)
        .where(and(
            eq(feedFollows.feedId, feedId), 
            eq(feedFollows.userId, userId)))
    .returning();
    
    return result;
}