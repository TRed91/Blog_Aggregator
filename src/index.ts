import { readConfig, setUser } from "./config";
import { handlerLogin } from "./command_handler";
import { CommandsRegistry, registerCommand, runCommand } from "./commands_registry";

function main(){
    const registry: CommandsRegistry = {};
    registerCommand(registry, "login", handlerLogin);

    const args = sanitizedArgs(process.argv);
    
    if (args.length == 0){
        console.error("Missing command or arguments!");
        process.exit(1);
    }

    const cmd = args[0];
    const cmdArgs = args.slice(1);

    try{
        runCommand(registry, cmd, ...cmdArgs);
    } catch (ex: unknown) {
        if (ex instanceof Error){
            console.error(ex.message);
        } else {
            console.error("An Unkown Error occured");
        }
        process.exit(1);
    }

    const config = readConfig();
    console.log(config);
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