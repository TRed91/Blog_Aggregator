import { fetchFeed } from "./fetch_feed";
import { getNextFeedToFetch, markFeedFetched } from "./lib/db/queries/feeds";
import { createPost } from "./lib/db/queries/posts";

export async function scrapeFeeds(){
    try {
        const feed = await getNextFeedToFetch();
        await markFeedFetched(feed.id);
        const rssFeed = await fetchFeed(feed.url);

        for (const item of rssFeed.channel.item){
            await createPost(item.title, item.link, feed.id, new Date(item.pubDate), item.description);
        }
    } catch (ex: unknown){
        if (ex instanceof Error){
            throw ex;
        } else {
            throw new Error(`Unknown Error while scraping feeds!`);
        }
    }
}