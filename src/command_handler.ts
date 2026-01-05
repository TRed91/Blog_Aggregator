import { setUser, readConfig } from "./config";
import { createUser, deleteUsers, getUser, getUserById, getUsers } from "./lib/db/queries/users";
import { fetchFeed, RSSFeed } from "./fetch_feed";
import { createFeed, createFeedFollow, deleteFeedFollow, getFeedByUrl, getFeedFollowsForUser, getFeeds } from "./lib/db/queries/feeds";
import { User, Feed } from "./lib/db/schema";

export type CommandHandler = (cmd: string, ...args:string[]) => Promise<void>;
export type UserCommandHandler = (cmdName: string, user: User, ...args: string[]) => Promise<void>;

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

    const url = "https://www.wagslane.dev/index.xml";

    try {
        const feed = await fetchFeed(url);
        console.table(feed);
        for (const item of feed.channel.item){
            console.table(item);
        }

    } catch (ex: unknown) {
        if (ex instanceof Error){
            throw ex;
        } else {
            throw new Error(`Unknown error while fetching feed for '${url}'`);
        }
    }
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