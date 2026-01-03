import fs from 'fs';
import os from 'os';
import path from 'path';

export type Config = {
    dbUrl: string,
    currentUserName: string
};

export function setUser(user: string): void{
    const config: Config = { dbUrl: "postgres://example", currentUserName: user };
    writeConfig(config);
}

export function readConfig(): Config {
    try {
        const rawConfig = fs.readFileSync(getConfigFilePath(), { encoding: "utf-8" });
        return validateConfig(rawConfig);
    } catch (ex: unknown) {
        if (ex instanceof Error){
            console.error(ex.message);
        } else {
            console.error("Unknown. error while reading config file.")
        }
        return { dbUrl: "", currentUserName: "" }
    }
}

function getConfigFilePath(): string {
    return  path.join(os.homedir(), "/.gatorconfig.json");
}

function writeConfig(cfg: Config): void {
    try{
        const jsonObject = {
            db_url: cfg.dbUrl,
            current_user_name: cfg.currentUserName
        }
        const jsonString = JSON.stringify(jsonObject);
        const path = getConfigFilePath()
        fs.writeFileSync(path, jsonString, { encoding: "utf-8"});
    }
    catch (ex: unknown){
        if (ex instanceof Error){
            console.error(ex.message);
        } else {
            console.error("Unkown error while writing to config file.")
        }
    }
}

function validateConfig(rawConfig: any): Config {
    const config = JSON.parse(rawConfig);
    let dbUrl: string = "";
    let currentUserName: string = "";

    if ("db_url" in config){
        dbUrl = config["db_url"];
    } else {
        console.warn("Missing 'db_url' in config file!");
    }
    
    if ("current_user_name" in config){
        currentUserName = config["current_user_name"];
    } else {
        console.warn("Missing 'current_user_name' in config file!");
    }

    return { dbUrl, currentUserName };
}