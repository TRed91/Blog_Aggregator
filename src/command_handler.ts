import { setUser, readConfig } from "./config";
import { createUser, deleteUsers, getUser, getUserById, getUsers } from "./lib/db/queries/users";
import { fetchFeed, RSSFeed } from "./fetch_feed";
import { createFeed, createFeedFollow, deleteFeedFollow, getFeedByUrl, getFeedFollowsForUser, getFeeds, getNextFeedToFetch } from "./lib/db/queries/feeds";
import { User, Feed } from "./lib/db/schema";
import { scrapeFeeds } from "./scrape_feeds";
import { getPostsForUser } from "./lib/db/queries/posts";

export type CommandHandler = (cmd: string, ...args:string[]) => Promise<void>;
export type UserCommandHandler = (cmdName: string, user: User, ...args: string[]) => Promise<void>;

type Duration = {
    time: number,
    unit: string,
    timeInMs: number
}

export async function handlerLogin(cmdName: string, ...args: string[]): Promise<void> {
    if (args.length == 0) {
        throw new Error("username argument missing!"); 
    }

    try{
        const user = await getUser(args[0]);
        if (!user){
            throw new Error(`User ${args[0]} doesn't exist!`);
        }

        setUser(user.name);
        console.log(`Username set to ${user.name}`);

    } catch (ex: unknown) {
        if (ex instanceof Error){
            throw ex;
        } else {
            throw new Error(`Unknown error while trying to login user ${args[0]}.`);
        }
    }
}

export async function handlerRegister(cmdName: string, ...args: string[]): Promise<void> {
    if (args.length == 0) {
        throw new Error("username argument missing!"); 
    }

    try{
        const existingUser = await getUser(args[0]);
        if (existingUser){
            throw new Error(`User ${args[0]} already exists.`);
        }
        const user = await createUser(args[0]);
        setUser(user.name);

        console.log(`User ${user.name} registered!`);
        console.table(user);

    } catch (ex: unknown) {
        if (ex instanceof Error){
            throw ex;
        } else {
            throw new Error(`Unknown error while trying to register user ${args[0]}.`);
        }
    }
}

export async function handleGetUsers(cmdName: string, ...args: string[]): Promise<void> {
    try {

        const users = await getUsers();

        for (const user of users){
            if (readConfig().currentUserName == user.name) {
                console.log(`* ${user.name} (current)`)
            } else {
                console.log(`* ${user.name}`)
            }
        }

    } catch (ex: unknown) {
        if (ex instanceof Error){
            throw ex;
        } else {
            throw new Error("Unknown error while trying to fetch users.");
        }
    }
}

export async function handlerReset(cmdName: string, ...args: string[]): Promise<void> {
    try {
        await deleteUsers();
        setUser("");
        console.log("Users table reset.")
    } catch (ex: unknown) {
        if (ex instanceof Error){
            throw ex;
        } else {
            throw new Error("Unknown error while resetting users table");
        }
    }
    
}

export async function handlerAggregate(cmdName: string, ...args: string[]): Promise<void> {

    if (args.length == 0) {
        throw new Error("time_betweem_reqs argument missing!"); 
    }

    try {
        const timeBetweenReqs = parseDuration(args[0]);

        console.log(`Collecting feeds every ${timeBetweenReqs.time}${timeBetweenReqs.unit}...`);

        scrapeFeeds().catch(throwScrapeError);

        const interval = setInterval(() => {
            console.log("fetching...");
            scrapeFeeds().catch(throwScrapeError);
        }, timeBetweenReqs.timeInMs)

        await new Promise<void>((resolve) => {
            process.on("SIGINT", () => {
                console.log("Shutting down feed aggregator...");
                clearInterval(interval);
                resolve();
            });
        });

    } catch (ex: unknown) {
        if (ex instanceof Error){
            throw ex;
        } else {
            throw new Error(`Unknown error while scraping.`);
        }
    }
}

function throwScrapeError(e: any){
    if (e instanceof Error) {
        throw e;
    } else {
        throw new Error("Unkown Error during scraping!");
    }
}

function parseDuration(durationStr: string): Duration {
    const regex = /^(\d+)(ms|s|m|h)$/;
    const match = durationStr.match(regex);
    if (match){
        
        const num = parseInt(match[1]);
        let unit = match[2];
        let timeInMs = 0;

        switch(unit){
            case 's': timeInMs = num * 1000; break;
            case 'm': timeInMs = num * 60000; break;
            case 'h': timeInMs = num * 1000 * 60 * 60; break;
            default: timeInMs = num; unit = 'ms'; break;
        }
        return {
            time: num,
            unit: unit,
            timeInMs: timeInMs
        };
    }
    throw new Error("Invalid time input!");
}

export async function hanlderAddFeed(cmdName: string, user: User, ...args: string[]): Promise<void> {
    if (args.length < 2){
        throw new Error("Missing arguments!");
    }
    
    try {
        const feed = await createFeed(args[0], args[1], user.id);
        const followResult = await createFeedFollow(user.id, feed.id);

        printFeed(feed, user);

    } catch (ex: unknown) {
        if (ex instanceof Error){
            throw ex;
        } else {
            throw new Error(`Unknown error while creating feed for name: '${args[0]}', url: '${args[1]}'.`);
        }
    }
}

function printFeed(feed: Feed, user: User): void {
    console.log("Feed for user " + user.name);
    console.table(feed);
}

export async function handlerFeeds(cmdName: string, ...args: string[]): Promise<void>  {
    try{

        const feeds = await getFeeds();
        if (!feeds || feeds.length == 0){
            console.log("No feeds in database!");
            return;
        }
        for (const feed of feeds){
            console.log("Feed Data:");
            console.log("- Feed Name:\t" + feed.name);
            console.log("- Url:      \t" + feed.url);
            console.log("- Username: \t" + (await getUserById(feed.userId)).name);
        }

    } catch (ex: unknown) {
        if (ex instanceof Error){
            throw ex;
        } else {
            throw new Error("Unknown Error while fetching feeds.");
        }
    }
}

export async function handlerFollow(cmdName: string, user: User, ...args: string[]): Promise<void> {
    if (args.length == 0){
        throw new Error("url argument missing!");
    }
  
    const url = args[0];

    try {

        const feed = await getFeedByUrl(url);
        if (!feed){
            throw new Error(`Feed for url ${url} doesn't exist!`);
        }

        const result = await createFeedFollow(user.id, feed.id);

        console.log("New Feed Follow created!");
        console.table(result);

    } catch (ex: unknown) {
        if (ex instanceof Error){
            throw ex;
        } else {
            throw new Error(`Unknown Error creating feed follow for user '${user.name}' and url '${url}'.`);
        }
    }
}

export async function handlerFollowing(cmdName: string, user: User, ...args: string[]): Promise<void> {

    try {

        const feeds = await getFeedFollowsForUser(user.id);
        if (!feeds || feeds.length == 0){
            console.log(`No feeds followed by user '${user.name}'.`);
            return;
        }


        console.log(`${user.name} is currently following these feeds:`)
        for (const feedFollow of feeds) {
            console.log("\t- " + feedFollow.feed);
        }

    } catch (ex: unknown) {
        if (ex instanceof Error){
            throw ex;
        } else {
            throw new Error(`Unknown Error while fetching following feeds for '${user.name}'.`);
        }
    }
}

export async function hanlerUnfollow(cmdName: string, user: User, ...args: string[]): Promise<void>  {
    if (args.length == 0){
        throw new Error("url argument missing!");
    }

    try {

        const feed = await getFeedByUrl(args[0]);
        await deleteFeedFollow(user.id, feed.id);

        console.log(`User ${user.name} unfollowed ${args[0]}`);

    } catch (ex: unknown) {
        if (ex instanceof Error){
            throw ex;
        } else {
            throw new Error(`Unknown Error while trying to unfollow '${args[0]}'.`);
        }
    }
}

export async function handlerBrowse(cmdName: string, user: User, ...args: string[]): Promise<void> {
    const limit: number = args.length > 0 ? parseInt(args[0]) : 2;

    try {

        const posts = await getPostsForUser(user.id, limit);

        if (!posts || posts.length == 0){
            console.log(`No posts for user ${user.name}.`);
            return;
        }

        console.log(`\nPrint posts for user ${user.name}:\n`);

        for (const post of posts){
            console.table(post);
        }

    } catch (ex: unknown) {
        if (ex instanceof Error){
            throw ex;
        } else {
            throw new Error(`Unknown Error while trying to fetch posts.`);
        }
    }
}