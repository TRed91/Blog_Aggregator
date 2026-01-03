import { setUser } from "./config";

export type CommandHandler = (cmd: string, ...args:string[]) => void;

export function handlerLogin(cmdName: string, ...args: string[]): void {
    if (args.length == 0) {
        throw new Error("username argument missing!"); 
    }

    setUser(args[0]);
    console.log(`Username set to ${args[0]}`);
}