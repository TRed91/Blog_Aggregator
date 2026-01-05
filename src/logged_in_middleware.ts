import { CommandHandler, UserCommandHandler } from "./command_handler";
import { readConfig } from "./config";
import { getUser } from "./lib/db/queries/users";
import { User } from "./lib/db/schema";

export type MiddlewareLoggedIn = (handler: UserCommandHandler) => CommandHandler;

export function middlewareLoggedIn(handler: UserCommandHandler): CommandHandler {

    return async (cmd: string, ...args: string[]) => {
        const userName = readConfig().currentUserName;
        const user = await getUser(userName);
        if (!user){
            throw new Error(`User '${userName}' not found!`);
        }
        await handler(cmd, user, ...args);
    }
}