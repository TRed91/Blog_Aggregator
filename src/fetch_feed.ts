import { XMLParser } from "fast-xml-parser";

export async function fetchFeed(feedUrl: string): Promise<RSSFeed> {
    const response = await fetch(feedUrl, {
        method: "get",
        mode: "cors",
        headers: {
            "Content-Type": "application/json",
            "User-Agent": "gator",
        }
    });

    if (response.status > 299){
        throw new Error("Failed to fetch: " + feedUrl);
    }

    const xml = await response.text();

    const parser = new XMLParser();
    const data = parser.parse(xml);

    if (!validateXml(data)){
        throw new Error("Invalid xml data in response!");
    }
    const feed = data.rss;

    return {
        channel: {
            title: feed.channel.title,
            link: feed.channel.link,
            description: feed.channel.description,
            item: extractItems(feed)
        }
    }

}

function validateXml(feed: any): boolean {
    return "rss" in feed && 
        "channel" in feed.rss && 
        "title" in feed.rss.channel && 
        "link" in feed.rss.channel && 
        "description" in feed.rss.channel &&
        typeof(feed.rss.channel.title) === "string" &&
        typeof(feed.rss.channel.link) === "string" &&
        typeof(feed.rss.channel.description) === "string"
}

function extractItems(feed: any): RSSItem[] {
    let items = [];
    const validatedItems : RSSItem[] = [];
    if ("item" in feed.channel && Array.isArray(feed.channel.item)){
        items = feed.channel.item;
    }

    if (items.length > 0){
        for (const item of items){
            if (validateItem(item)){
                validatedItems.push({
                    title: item.title,
                    link: item.link,
                    description: item.description,
                    pubDate: item.pubDate
                });
            }
        }
    }

    return validatedItems;
}

function validateItem(item: any): boolean {
    return "title" in item && 
        "link" in item && 
        "description" in item &&
        "pubDate" in item &&
        typeof(item.title) === "string" &&
        typeof(item.link) === "string" &&
        typeof(item.description) === "string" &&
        typeof(item.pubDate) === "string"
}

export type RSSFeed = {
    channel: {
        title: string;
        link: string;
        description: string;
        item: RSSItem[];
    };
};

export type RSSItem = {
    title: string;
    link: string;
    description: string;
    pubDate: string;
};