export interface CS2Command {
    name: string;
    value: string;
    defaultValue: string;
    flags: string[];
    description: string;
}

export interface CommandCategory {
    name: string;
    commands: CS2Command[];
}