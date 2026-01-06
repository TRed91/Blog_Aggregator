import { fetchFeed } from "./fetch_feed";
import { getNextFeedToFetch, markFeedFetched } from "./lib/db/queries/feeds";

export async function scrapeFeeds(){
    try {
        const nextFeed = await getNextFeedToFetch();
        await markFeedFetched(nextFeed.id);
        const rssFeed = await fetchFeed(nextFeed.url);

        for (const item of rssFeed.channel.item){
            console.log(item.title);
        }
    } catch (ex: unknown){
        if (ex instanceof Error){
            throw ex;
        } else {
            throw new Error(`Unknown Error while scraping feeds!`);
        }
    }
}