export interface CommandPreset {
    id: string;
    name: string;
    description: string;
    icon: string;
    category: 'performance' | 'practice' | 'images';
    commands: {
        command: string;
        value?: string;
        description?: string;
    }[];
}

export const commandPresets: CommandPreset[] = [
    {
        id: 'fps-boost',
        name: 'FPS Boost',
        description: 'Optimize game settings for maximum FPS',
        icon: '⚡',
        category: 'performance',
        commands: [
            { command: 'fps_max', value: '0', description: 'Uncap FPS limit' },
        ]
    },
    {
        id: 'practice-config',
        name: 'Practice Config',
        description: 'Perfect setup for practicing smokes, flashes, and movement',
        icon: '🎯',
        category: 'practice',
        commands: [
            { command: 'sv_cheats', value: '1', description: 'Enable cheats' },
        ]
    },
    {
        id: 'video-quality',
        name: 'Screenshot Config',
        description: 'Best visual settings for screenshots',
        icon: '🎬',
        category: 'images',
        commands: [
            { command: 'fps_max', value: '300', description: 'Cap FPS for consistency' },
        ]
    },
];