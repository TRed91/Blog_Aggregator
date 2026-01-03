import { setUser, readConfig } from "./config";
import { createUser, deleteUsers, getUser, getUsers } from "./lib/db/queries/users";

export type CommandHandler = (cmd: string, ...args:string[]) => Promise<void>;

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