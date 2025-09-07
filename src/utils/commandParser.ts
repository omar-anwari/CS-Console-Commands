import { CS2Command } from '../types/command';

export function parseCommandsFromCSV(csvText: string): CS2Command[] {
    const commands: CS2Command[] = [];
    const lines = csvText.split('\n').filter(line => line.trim());
    
    // Skip header if it exists
    let startIndex = 0;
    if (lines[0] && lines[0].toLowerCase().includes('name')) {
        startIndex = 1;
    }
    
    // Track seen command names to avoid duplicates
    const seenNames = new Set<string>();
    
    for (let i = startIndex; i < lines.length; i++) {
        const fields = parseCSVLine(lines[i]);
        
        if (fields.length >= 6) {
            const name = fields[0]?.trim();
            
            // Skip if name is empty or already processed
            if (!name || seenNames.has(name)) {
                continue;
            }
            
            seenNames.add(name);
            
            const command: CS2Command = {
                name: name,
                value: fields[1]?.trim() || '',
                defaultValue: fields[2]?.trim() || '',
                flags: fields[3] ? fields[3].split(' ').filter(f => f.trim()) : [],
                description: fields[4]?.trim() || '',
                example: fields[5]?.trim() || ''
            };
            
            commands.push(command);
        }
    }
    
    return commands;
}

function parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        const nextChar = line[i + 1];
        
        if (char === '"') {
            if (inQuotes && nextChar === '"') {
                // Escaped quote
                current += '"';
                i++; // Skip next quote
            } else {
                // Toggle quote state
                inQuotes = !inQuotes;
            }
        } else if (char === ',' && !inQuotes) {
            // End of field
            result.push(current);
            current = '';
        } else {
            current += char;
        }
    }
    
    // Add last field
    result.push(current);
    
    return result;
}

export function categorizeCommands(commands: CS2Command[]): Record<string, CS2Command[]> {
    const categories: Record<string, CS2Command[]> = {
        'Crosshair': [],
        'Movement': [],
        'Audio': [],
        'Video': [],
        'Network': [],
        'Bot': [],
        'Server': [],
        'Client': [],
        'Game': [],
        'Debug': [],
        'Other': []
    };
    
    commands.forEach(cmd => {
        const name = cmd.name.toLowerCase();
        
        if (name.includes('crosshair')) {
            categories['Crosshair'].push(cmd);
        } else if (name.includes('sv_') || name.includes('mp_')) {
            categories['Server'].push(cmd);
        } else if (name.includes('cl_')) {
            categories['Client'].push(cmd);
        } else if (name.includes('bot')) {
            categories['Bot'].push(cmd);
        } else if (name.includes('snd') || name.includes('voice') || name.includes('audio')) {
            categories['Audio'].push(cmd);
        } else if (name.includes('r_') || name.includes('mat_') || name.includes('fps')) {
            categories['Video'].push(cmd);
        } else if (name.includes('net_') || name.includes('rate')) {
            categories['Network'].push(cmd);
        } else if (name.includes('nav_') || name.includes('ent_') || name.includes('debug')) {
            categories['Debug'].push(cmd);
        } else if (name.includes('sv_') && (name.includes('jump') || name.includes('bunny') || name.includes('velocity'))) {
            categories['Movement'].push(cmd);
        } else {
            categories['Other'].push(cmd);
        }
    });
    
    // Remove empty categories
    Object.keys(categories).forEach(key => {
        if (categories[key].length === 0) {
            delete categories[key];
        }
    });
    
    return categories;
}