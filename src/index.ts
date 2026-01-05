import { readConfig, setUser } from "./config";
import { handleGetUsers, handlerAggregate, handlerFeeds, handlerFollow, handlerFollowing, handlerLogin, handlerRegister, handlerReset, hanlderAddFeed, hanlerUnfollow } from "./command_handler";
import { CommandsRegistry, registerCommand, runCommand } from "./commands_registry";
import { middlewareLoggedIn } from "./logged_in_middleware";

async function main(){
    const registry: CommandsRegistry = {};
    registerCommand(registry, "login", handlerLogin);
    registerCommand(registry, "register", handlerRegister);
    registerCommand(registry, "reset", handlerReset);
    registerCommand(registry, "users", handleGetUsers);
    registerCommand(registry, "agg", handlerAggregate);
    registerCommand(registry, "addfeed", middlewareLoggedIn(hanlderAddFeed));
    registerCommand(registry, "feeds", handlerFeeds);
    registerCommand(registry, "follow", middlewareLoggedIn(handlerFollow));
    registerCommand(registry, "following", middlewareLoggedIn(handlerFollowing));
    registerCommand(registry, "unfollow", middlewareLoggedIn(hanlerUnfollow));

    const args = sanitizedArgs(process.argv);
    
    if (args.length == 0){
        console.error("Missing command or arguments!");
        process.exit(1);
    }

    const cmd = args[0];
    const cmdArgs = args.slice(1);

    try{
        await runCommand(registry, cmd, ...cmdArgs);
    } catch (ex: unknown) {
        if (ex instanceof Error){
            console.error(ex.message);
        } else {
            console.error("An Unkown Error occured");
        }
        process.exit(1);
    }

    process.exit(0);
}

function sanitizedArgs(args: string[]): string[] {
    const sanitizedArgs: string[] = [];

    args = args.slice(2);

    for (const arg of args){
        const sanitized = arg.trim();
        if (sanitized.length > 0){
            sanitizedArgs.push(sanitized);
        }
    }

    return sanitizedArgs;
}

main();