import { eq } from "drizzle-orm";
import { db } from "..";
import { feeds } from "../schema";
import { RSSFeed } from "src/fetch_feed";

export async function createFeed(name: string, url: string,userId: string) {
    const [result] = await db.insert(feeds)
        .values({name: name, url: url, userId: userId})
        .returning();
    return result;
};

export async function getFeeds() {
    const result = await db.select().from(feeds);
    return result;
}