import { CommandHandler, handlerLogin } from "./command_handler"

export type CommandsRegistry = Record<string, CommandHandler>;

export function registerCommand(registry: CommandsRegistry, cmdName: string, handler: CommandHandler): void{
    registry[cmdName] = handler;
}

export function runCommand(registry: CommandsRegistry, cmdName: string, ...args: string[]): void {
    if (cmdName in registry){
        const cmd = registry[cmdName];
        cmd(cmdName, ...args);
    } else {
        console.warn(`Command ${cmdName} doesn't exist.`);
    }
}