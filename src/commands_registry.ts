import { CommandHandler, handlerLogin } from "./command_handler"

export type CommandsRegistry = Record<string, CommandHandler>;

export function registerCommand(registry: CommandsRegistry, cmdName: string, handler: CommandHandler): void{
    registry[cmdName] = handler;
}

export async function runCommand(registry: CommandsRegistry, cmdName: string, ...args: string[]): Promise<void> {
    if (cmdName in registry){
        const cmd = registry[cmdName];
        try{
            await cmd(cmdName, ...args);
        } catch (ex: unknown){
            if (ex instanceof Error){
                throw ex;
            }
            throw new Error("Unknown Error!");
        }
        
    } else {
        console.warn(`Command ${cmdName} doesn't exist.`);
    }
}