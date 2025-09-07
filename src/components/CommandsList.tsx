'use client';
import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { CS2Command } from '../types/command';
import { categorizeCommands } from '../utils/commandParser';
import { useFavorites } from '../hooks/useFavorites';
import CommandPresets from './CommandPresets';
import SelectedCommandsPanel from './SelectedCommandsPanel';

interface FavoriteCommand {
    name: string;
    value?: string;
    description: string;
    category?: string;
}

interface CommandsListProps {
    commands: CS2Command[];
}

const CommandsList: React.FC<CommandsListProps> = ({ commands }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('All');
    const [copiedCommand, setCopiedCommand] = useState<string>('');
    const [expandedCommand, setExpandedCommand] = useState<string>('');
    const [visibleRange, setVisibleRange] = useState({ start: 0, end: 50 });
    const [selectedCommands, setSelectedCommands] = useState<Set<string>>(new Set());
    const [showPresetsModal, setShowPresetsModal] = useState(false);
    const [showFavorites, setShowFavorites] = useState(false);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const itemHeight = 200; // Approximate height of each command card
    const buffer = 5; // Number of items to render outside viewport

    const { favorites, toggleFavorite, isFavorite } = useFavorites();

    const categorizedCommands = useMemo(() => categorizeCommands(commands), [commands]);
    const categories = ['All', ...Object.keys(categorizedCommands)];

    // Debounce search term
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 300);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    const filteredCommands = useMemo(() => {
        let filtered = commands;

        // Filter by favorites if enabled
        if (showFavorites) {
            filtered = commands.filter(cmd => 
                isFavorite(cmd.name, cmd.value)
            );
        }

        // Filter by category
        if (selectedCategory !== 'All' && !showFavorites) {
            filtered = categorizedCommands[selectedCategory] || [];
        }

        // Filter by debounced search term
        if (debouncedSearchTerm) {
            filtered = filtered.filter(cmd =>
                cmd.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
                cmd.description.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
            );
        }

        return filtered;
    }, [commands, debouncedSearchTerm, selectedCategory, categorizedCommands, showFavorites, favorites]);

    // Handle scroll for virtualization
    const handleScroll = useCallback(() => {
        if (!scrollContainerRef.current) return;

        const container = scrollContainerRef.current;
        const scrollTop = container.scrollTop;
        const containerHeight = container.clientHeight;

        const start = Math.max(0, Math.floor(scrollTop / itemHeight) - buffer);
        const visibleCount = Math.ceil(containerHeight / itemHeight);
        const end = Math.min(filteredCommands.length, start + visibleCount + buffer * 2);

        setVisibleRange({ start, end });
    }, [filteredCommands.length]);

    // Reset visible range when filtered commands change
    useEffect(() => {
        setVisibleRange({ start: 0, end: Math.min(50, filteredCommands.length) });
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTop = 0;
        }
    }, [filteredCommands]);

    // Add scroll listener
    useEffect(() => {
        const container = scrollContainerRef.current;
        if (!container) return;

        container.addEventListener('scroll', handleScroll);
        return () => container.removeEventListener('scroll', handleScroll);
    }, [handleScroll]);

    const handleCopyCommand = async (command: CS2Command, event?: React.MouseEvent) => {
        const commandText = command.value ? `${command.name} ${command.value}` : command.name;
        
        try {
            await navigator.clipboard.writeText(commandText);
            setCopiedCommand(command.name);
            
            // Create ripple effect at click position
            if (event && event.currentTarget) {
                const button = event.currentTarget as HTMLElement;
                if (button) {
                    const rect = button.getBoundingClientRect();
                    const ripple = document.createElement('span');
                    const size = Math.max(rect.width, rect.height);
                    const x = event.clientX - rect.left - size / 2;
                    const y = event.clientY - rect.top - size / 2;
                    
                    ripple.style.cssText = `
                        position: absolute;
                        width: ${size}px;
                        height: ${size}px;
                        border-radius: 50%;
                        background: rgba(34, 197, 94, 0.5);
                        left: ${x}px;
                        top: ${y}px;
                        pointer-events: none;
                        transform: scale(0);
                        animation: ripple 0.6s ease-out;
                    `;
                    
                    button.style.position = 'relative';
                    button.style.overflow = 'hidden';
                    button.appendChild(ripple);
                    
                    setTimeout(() => {
                        if (ripple && ripple.parentNode) {
                            ripple.remove();
                        }
                    }, 600);
                }
            }
            
            setTimeout(() => setCopiedCommand(''), 2000);
        } catch (err) {
            console.error('Failed to copy command:', err);
        }
    };

    const handleToggleExpand = (commandName: string) => {
        requestAnimationFrame(() => {
            setExpandedCommand(expandedCommand === commandName ? '' : commandName);
        });
    };

    // Helper to get category for a command
    const getCommandCategory = (commandName: string): string => {
        for (const [category, commands] of Object.entries(categorizedCommands)) {
            if (commands.some(cmd => cmd.name === commandName)) {
                return category;
            }
        }
        return 'Other';
    };

    // Selection functions
    const toggleCommandSelection = (commandName: string) => {
        setSelectedCommands(prev => {
            const newSelection = new Set(prev);
            if (newSelection.has(commandName)) {
                newSelection.delete(commandName);
            } else {
                newSelection.add(commandName);
            }
            return newSelection;
        });
    };

    const clearSelectedCommands = () => {
        setSelectedCommands(new Set());
    };

    const removeSelectedCommand = (commandName: string) => {
        setSelectedCommands(prev => {
            const newSelection = new Set(prev);
            newSelection.delete(commandName);
            return newSelection;
        });
    };

    const exportSelectedCommands = () => {
        const selectedCommandsData = commands.filter(cmd => selectedCommands.has(cmd.name));
        
        // Create header section matching CommandPresets format
        const header = `// CS2 Console Commands - Custom Selection
// Generated on: ${new Date().toLocaleDateString()}
// Total Commands: ${selectedCommandsData.length}

echo "=====================================";
echo "Loading custom CS2 configuration...";
echo "=====================================";

`;

        // Group commands by category
        const commandsByCategory = selectedCommandsData.reduce((acc, cmd) => {
            const category = getCommandCategory(cmd.name);
            if (!acc[category]) {
                acc[category] = [];
            }
            acc[category].push(cmd);
            return acc;
        }, {} as Record<string, CS2Command[]>);

        // Build the config content with categories
        let configContent = header;
        
        Object.entries(commandsByCategory).forEach(([category, cmds]) => {
            configContent += `// === ${category} ===\n`;
            cmds.forEach(cmd => {
                // Add description as comment
                if (cmd.description) {
                    const descLines = cmd.description.match(/.{1,70}/g) || [];
                    descLines.forEach(line => {
                        configContent += `// ${line}\n`;
                    });
                }
                
                // Add the command
                if (cmd.value) {
                    configContent += `${cmd.name} "${cmd.value}";\n`;
                } else {
                    configContent += `${cmd.name};\n`;
                }
                configContent += '\n';
            });
        });

        // Add footer
        configContent += `echo "=====================================";
echo "Configuration loaded successfully!";
echo "Total commands applied: ${selectedCommandsData.length}";
echo "=====================================";

host_writeconfig;`;

        // Create and download the file
        const blob = new Blob([configContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'autoexec.cfg';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const exportFavorites = () => {
        const favoriteCommands = Array.from(favorites.values());
        
        // Create header section
        const header = `// CS2 Console Commands - My Favorites
// Generated on: ${new Date().toLocaleDateString()}
// Total Commands: ${favoriteCommands.length}

echo "=====================================";
echo "Loading favorite CS2 commands...";
echo "=====================================";

`;

        // Group commands by category
        const commandsByCategory = favoriteCommands.reduce((acc, cmd) => {
            const category = cmd.category || 'Other';
            if (!acc[category]) {
                acc[category] = [];
            }
            acc[category].push(cmd);
            return acc;
        }, {} as Record<string, FavoriteCommand[]>);

        // Build the config content with categories
        let configContent = header;
        
        Object.entries(commandsByCategory).forEach(([category, cmds]) => {
            configContent += `// === ${category} ===\n`;
            cmds.forEach(cmd => {
                // Add description as comment
                if (cmd.description) {
                    const descLines = cmd.description.match(/.{1,70}/g) || [];
                    descLines.forEach((line: string) => {
                        configContent += `// ${line}\n`;
                    });
                }
                
                // Add the command
                if (cmd.value) {
                    configContent += `${cmd.name} "${cmd.value}";\n`;
                } else {
                    configContent += `${cmd.name};\n`;
                }
                configContent += '\n';
            });
        });

        // Add footer
        configContent += `echo "=====================================";
echo "Favorite commands loaded successfully!";
echo "Total commands applied: ${favoriteCommands.length}";
echo "=====================================";

host_writeconfig;`;

        // Create and download the file
        const blob = new Blob([configContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'favorites-autoexec.cfg';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    // Helper function to format flag names
    const formatFlag = (flag: string) => {
        const flagDescriptions: Record<string, string> = {
            'game': 'Game',
            'client': 'Client-side',
            'cheat': 'Cheat Protected',
            'replicated': 'Replicated',
            'archive': 'Saved',
            'notify': 'Notifies when changed',
            'per_user': 'Different for each user',
            'userinfo': 'User Info',
            'clientcmd_can_execute': 'Client Executable',
            'server': 'Server',
            'sv': 'Server Variable',
            'cl': 'Client Variable',
            'protected': 'Protected',
            'hidden': 'Hidden',
            'release': 'Release',
            'devonly': 'Dev Only'
        };
        return flagDescriptions[flag.toLowerCase()] || flag;
    };

    // Helper to get flag tooltip
    const getFlagTooltip = (flag: string) => {
        const tooltips: Record<string, string> = {
            'game': 'This command affects game state',
            'client': 'Runs on the client side',
            'cheat': 'Requires sv_cheats 1 to use',
            'replicated': 'Synced between server and client',
            'archive': 'Saved to config file',
            'notify': 'Notifies when changed',
            'per_user': 'Different for each user',
            'userinfo': 'Part of user information',
            'clientcmd_can_execute': 'Can be executed from client console',
            'server': 'Server-side command',
            'protected': 'Protected from unauthorized changes',
            'hidden': 'Hidden from normal view',
            'release': 'Available in release builds',
            'devonly': 'Developer only command'
        };
        return tooltips[flag.toLowerCase()] || 'Command flag';
    };

    // Syntax highlighting for command examples
    const highlightCommandSyntax = (commandStr: string) => {
        if (!commandStr) return null;
        
        const parts = commandStr.split(' ');
        const commandName = parts[0];
        const args = parts.slice(1).join(' ');
        
        return (
            <>
                {/* Command name */}
                <span style={{ 
                    color: '#8b5cf6', 
                    fontWeight: '600' 
                }}>
                    {commandName}
                </span>
                {args && (
                    <>
                        <span style={{ color: '#6b6b80' }}> </span>
                        {/* Parse and highlight arguments */}
                        {highlightArguments(args)}
                    </>
                )}
            </>
        );
    };

    // Helper to highlight different types of arguments
    const highlightArguments = (args: string) => {
        // Split by spaces but keep quoted strings together
        const regex = /(".*?"|'.*?'|\S+)/g;
        const tokens = args.match(regex) || [];
        
        return tokens.map((token, index) => {
            // Numbers
            if (/^-?\d+\.?\d*$/.test(token)) {
                return (
                    <span key={index} style={{ 
                        color: '#22c55e', 
                        fontWeight: '500' 
                    }}>
                        {token}
                    </span>
                );
            }
            // Strings in quotes
            else if (/^["'].*["']$/.test(token)) {
                return (
                    <span key={index} style={{ 
                        color: '#f59e0b' 
                    }}>
                        {token}
                    </span>
                );
            }
            // Boolean values
            else if (/^(true|false|TRUE|FALSE|on|off|yes|no|1|0)$/i.test(token)) {
                return (
                    <span key={index} style={{ 
                        color: '#3b82f6', 
                        fontWeight: '500' 
                    }}>
                        {token}
                    </span>
                );
            }
            // Operators and special characters
            else if (/^[=<>!+\-*/|&]$/.test(token)) {
                return (
                    <span key={index} style={{ 
                        color: '#ec4899', 
                        fontWeight: '600' 
                    }}>
                        {token}
                    </span>
                );
            }
            // Default (parameters, flags, etc.)
            else {
                return (
                    <span key={index} style={{ 
                        color: '#60a5fa' 
                    }}>
                        {token}
                    </span>
                );
            }
        }).reduce((prev, curr, index) => {
            if (index === 0) return [curr];
            return [...prev, <span key={`space-${index}`} style={{ color: '#6b6b80' }}> </span>, curr];
        }, [] as React.ReactNode[]);
    };

    // Get visible commands for virtualization
    const visibleCommands = filteredCommands.slice(visibleRange.start, visibleRange.end);
    const spacerHeight = visibleRange.start * itemHeight;
    const totalHeight = filteredCommands.length * itemHeight;

    return (
        <div className="main-container" style={{
            maxWidth: '1400px',
            margin: '0 auto',
            padding: '20px'
        }}>
            <style jsx>{`
                @keyframes pulse {
                    0%, 100% {
                        opacity: 1;
                    }
                    50% {
                        opacity: 0.5;
                    }
                }
                
                @keyframes ripple {
                    to {
                        transform: scale(4);
                        opacity: 0;
                    }
                }
                
                @keyframes checkmark {
                    0% {
                        stroke-dashoffset: 50;
                    }
                    100% {
                        stroke-dashoffset: 0;
                    }
                }
                
                /* Custom Checkbox Styling */
                input[type="checkbox"] {
                    appearance: none;
                    -webkit-appearance: none;
                    width: 18px;
                    height: 18px;
                    border: 2px solid #3a3a4e;
                    border-radius: 4px;
                    background: #2a2a3e;
                    cursor: pointer;
                    position: relative;
                    transition: all 0.2s ease;
                    margin-right: 8px;
                }
                
                input[type="checkbox"]:hover {
                    border-color: #8b5cf6;
                    background: #323248;
                }
                
                input[type="checkbox"]:checked {
                    background: #8b5cf6;
                    border-color: #8b5cf6;
                }
                
                input[type="checkbox"]:checked::after {
                    content: '';
                    position: absolute;
                    left: 5px;
                    top: 2px;
                    width: 4px;
                    height: 8px;
                    border: solid white;
                    border-width: 0 2px 2px 0;
                    transform: rotate(45deg);
                }
                
                @media (max-width: 640px) {
                    .main-container {
                        padding: 10px !important;
                    }
                    .header-title {
                        font-size: 32px !important;
                    }
                    .header-subtitle {
                        font-size: 14px !important;
                    }
                    .search-filter-container {
                        flex-direction: column !important;
                    }
                    .search-input {
                        min-width: 100% !important;
                        width: 100% !important;
                    }
                    .category-select {
                        width: 100% !important;
                    }
                    .commands-container {
                        height: 60vh !important;
                        min-height: 400px !important;
                    }
                    .command-card {
                        padding: 12px !important;
                    }
                    .command-name {
                        font-size: 16px !important;
                    }
                    .command-values {
                        flex-direction: column !important;
                        width: 100% !important;
                    }
                    .value-box {
                        width: 100% !important;
                    }
                    .copy-button {
                        padding: 6px 12px !important;
                        font-size: 11px !important;
                    }
                    .scrollable-content {
                        padding: 12px !important;
                    }
                    .presets-button {
                        width: 100% !important;
                    }
                }
                
                @media (min-width: 641px) and (max-width: 1024px) {
                    .main-container {
                        padding: 15px !important;
                    }
                    .header-title {
                        font-size: 40px !important;
                    }
                    .commands-container {
                        height: 65vh !important;
                    }
                    .command-card {
                        padding: 16px !important;
                    }
                }
                
                div::-webkit-scrollbar {
                    width: 8px;
                }
                div::-webkit-scrollbar-track {
                    background: #2a2a3e;
                    border-radius: 4px;
                }
                div::-webkit-scrollbar-thumb {
                    background: #8b5cf6;
                    border-radius: 4px;
                    transition: background 0.2s;
                }
                div::-webkit-scrollbar-thumb:hover {
                    background: #9f7aea;
                }
            `}</style>

            {/* Header */}
            <div style={{
                textAlign: 'center',
                marginBottom: '40px',
                position: 'relative'
            }}>
                <h1 className="header-title" style={{
                    fontSize: '48px',
                    fontWeight: '800',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    marginBottom: '10px',
                    lineHeight: '1.2'
                }}>
                    CS2 Console Commands
                </h1>
                <p className="header-subtitle" style={{
                    color: '#a1a1aa',
                    fontSize: '16px',
                    padding: '0 10px'
                }}>
                    Complete list of Counter-Strike 2 console commands with detailed information
                </p>
            </div>

            {/* Quick Guide Section */}
            <div style={{
                background: 'rgba(139, 92, 246, 0.05)',
                border: '1px solid rgba(139, 92, 246, 0.2)',
                borderRadius: '12px',
                padding: '20px',
                marginBottom: '30px',
                position: 'relative'
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    marginBottom: '15px'
                }}>
                    <div style={{
                        width: '8px',
                        height: '8px',
                        background: '#8b5cf6',
                        borderRadius: '50%',
                        animation: 'pulse 2s infinite'
                    }}></div>
                    <h3 style={{
                        fontSize: '16px',
                        fontWeight: '600',
                        color: '#8b5cf6',
                        margin: 0
                    }}>
                        How To Use The Console Commands
                    </h3>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '20px',
                    color: '#a1a1aa',
                    fontSize: '14px',
                    lineHeight: '1.6'
                }}>
                    <div>
                        <div style={{
                            fontWeight: '600',
                            color: '#d4d4d8',
                            marginBottom: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}>
                            <span style={{ color: '#8b5cf6' }}>1.</span>
                            Enabling the Console
                        </div>
                        <div style={{ paddingLeft: '16px' }}>
                            First, go to Settings then click on Game, under Enable Developer Console, select Yes.
                        </div>
                    </div>

                    <div>
                        <div style={{
                            fontWeight: '600',
                            color: '#d4d4d8',
                            marginBottom: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}>
                            <span style={{ color: '#8b5cf6' }}>2.</span>
                            Opening the Console
                        </div>
                        <div style={{ paddingLeft: '16px' }}>
                            Press the <code style={{
                                background: 'rgba(0, 0, 0, 0.3)',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                color: '#8b5cf6',
                                fontFamily: 'monospace'
                            }}>~</code> (tilde) or <code style={{
                                background: 'rgba(0, 0, 0, 0.3)',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                color: '#8b5cf6',
                                fontFamily: 'monospace'
                            }}>`</code> key on your keyboard in-game to open the console.
                        </div>
                    </div>

                    <div>
                        <div style={{
                            fontWeight: '600',
                            color: '#d4d4d8',
                            marginBottom: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}>
                            <span style={{ color: '#8b5cf6' }}>3.</span>
                            Enter Commands
                        </div>
                        <div style={{ paddingLeft: '16px' }}>
                            Type/paste the command and press Enter. <br /> 
                            Example: <code style={{
                                background: 'rgba(0, 0, 0, 0.3)',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                fontFamily: 'monospace'
                            }}>
                                {highlightCommandSyntax('fps_max 300')}
                            </code>
                        </div>
                    </div>
                </div>

                <div style={{
                    marginTop: '16px',
                    paddingTop: '16px',
                    borderTop: '1px solid rgba(139, 92, 246, 0.1)',
                    fontSize: '13px',
                    color: '#6b6b80'
                }}>
                    <strong style={{ color: '#f59e0b' }}>Note:</strong> Commands with the "cheat" flag require <code style={{
                        background: 'rgba(0, 0, 0, 0.3)',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontFamily: 'monospace',
                        fontSize: '12px'
                    }}>
                        {highlightCommandSyntax('sv_cheats 1')}
                    </code> to be enabled on local/private servers only.
                </div>
            </div>

            {/* Search and Filters */}
            <div style={{
                position: 'sticky',
                top: '0',
                zIndex: 10,
                paddingTop: '20px',
                paddingBottom: '20px',
                marginBottom: '10px',
                marginTop: '-20px',
                background: 'linear-gradient(180deg, #1a1a2e 0%, #1a1a2e 90%, transparent 100%)'
            }}>
                <div className="search-filter-container" style={{
                    display: 'flex',
                    gap: '20px',
                    flexWrap: 'wrap',
                    alignItems: 'center'
                }}>
                    {/* Search Bar */}
                    <input
                        className="search-input"
                        type="text"
                        placeholder="Search commands..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            flex: '1',
                            minWidth: '250px',
                            padding: '12px 16px',
                            background: '#2a2a3e',
                            border: '2px solid #3a3a4e',
                            borderRadius: '8px',
                            color: '#ffffff',
                            fontSize: '14px',
                            outline: 'none',
                            transition: 'all 0.2s'
                        }}
                        onFocus={(e) => {
                            e.currentTarget.style.borderColor = '#8b5cf6';
                            e.currentTarget.style.background = '#323248';
                        }}
                        onBlur={(e) => {
                            e.currentTarget.style.borderColor = '#3a3a4e';
                            e.currentTarget.style.background = '#2a2a3e';
                        }}
                    />

                    {/* Category Filter */}
                    <select
                        className="category-select"
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        style={{
                            padding: '12px 16px',
                            background: '#2a2a3e',
                            border: '2px solid #3a3a4e',
                            borderRadius: '8px',
                            color: '#ffffff',
                            fontSize: '14px',
                            outline: 'none',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            minWidth: '150px'
                        }}
                        onFocus={(e) => {
                            e.currentTarget.style.borderColor = '#8b5cf6';
                            e.currentTarget.style.background = '#323248';
                        }}
                        onBlur={(e) => {
                            e.currentTarget.style.borderColor = '#3a3a4e';
                            e.currentTarget.style.background = '#2a2a3e';
                        }}
                    >
                        {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>

                    {/* Presets Button */}
                    <button
                        className="presets-button"
                        onClick={() => setShowPresetsModal(true)}
                        style={{
                            padding: '12px 20px',
                            background: '#2a2e3e',
                            border: '2px solid #3a3a4e',
                            borderRadius: '8px',
                            color: '#8b5cf6',
                            fontSize: '14px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            whiteSpace: 'nowrap'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = '#8b5cf6';
                            e.currentTarget.style.background = '#323248';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(139, 92, 246, 0.2)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = '#3a3a4e';
                            e.currentTarget.style.background = '#2a2e3e';
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = 'none';
                        }}
                        onFocus={(e) => {
                            e.currentTarget.style.borderColor = '#8b5cf6';
                            e.currentTarget.style.background = '#323248';
                        }}
                        onBlur={(e) => {
                            e.currentTarget.style.borderColor = '#3a3a4e';
                            e.currentTarget.style.background = '#2a2e3e';
                        }}
                    >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M2 3h12M2 8h12M2 13h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                            <circle cx="4" cy="3" r="1" fill="currentColor"/>
                            <circle cx="4" cy="8" r="1" fill="currentColor"/>
                            <circle cx="4" cy="13" r="1" fill="currentColor"/>
                        </svg>
                        Command Presets
                    </button>

                    {/* Add Favorites Toggle Button */}
                    <button
                        onClick={() => setShowFavorites(!showFavorites)}
                        style={{
                            padding: '12px 20px',
                            background: showFavorites ? '#8b5cf6' : '#2a2a3e',
                            border: '2px solid #3a3a4e',
                            borderRadius: '8px',
                            color: showFavorites ? 'white' : '#8b5cf6',
                            fontSize: '14px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            whiteSpace: 'nowrap',
                            position: 'relative'
                        }}
                        onMouseEnter={(e) => {
                            if (!showFavorites) {
                                e.currentTarget.style.borderColor = '#8b5cf6';
                                e.currentTarget.style.background = '#323248';
                            }
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(139, 92, 246, 0.2)';
                        }}
                        onMouseLeave={(e) => {
                            if (!showFavorites) {
                                e.currentTarget.style.borderColor = '#3a3a4e';
                                e.currentTarget.style.background = '#2a2e3e';
                            }
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = 'none';
                        }}
                    >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path 
                                d="M8 1.5l2.09 4.23 4.68.68-3.39 3.3.8 4.66L8 12.15l-4.18 2.2.8-4.66L1.23 6.41l4.68-.68L8 1.5z" 
                                stroke="currentColor" 
                                strokeWidth="1.5"
                                fill={showFavorites ? "currentColor" : "none"}
                            />
                        </svg>
                        Favorites
                        {favorites.size > 0 && (
                            <span style={{
                                position: 'absolute',
                                top: '-8px',
                                right: '-8px',
                                background: '#ef4444',
                                color: 'white',
                                fontSize: '11px',
                                fontWeight: '700',
                                padding: '2px 6px',
                                borderRadius: '10px',
                                minWidth: '18px',
                                textAlign: 'center'
                            }}>
                                {favorites.size}
                            </span>
                        )}
                    </button>
                </div>

                {/* Results Count */}
                <div style={{
                    marginTop: '15px',
                    color: '#a1a1aa',
                    fontSize: '14px'
                }}>
                    Showing {filteredCommands.length} commands
                    {searchTerm !== debouncedSearchTerm && (
                        <span style={{ color: '#8b5cf6', marginLeft: '10px' }}>
                            Searching...
                        </span>
                    )}
                </div>
            </div>

            {/* Commands Container with Scroll */}
            <div className="commands-container" style={{
                position: 'relative',
                height: '70vh',
                maxHeight: '800px',
                minHeight: '500px',
                background: 'rgba(42, 42, 62, 0.4)',
                borderRadius: '16px',
                border: '1px solid rgba(139, 92, 246, 0.2)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
            }}>
                {/* Top Fade Mask */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '20px',
                    background: 'linear-gradient(180deg, rgba(42, 42, 62, 0.9) 0%, rgba(42, 42, 62, 0.6) 50%, transparent 100%)',
                    borderTopLeftRadius: '16px',
                    borderTopRightRadius: '16px',
                    pointerEvents: 'none',
                    zIndex: 2
                }} />

                {/* Bottom Fade Mask */}
                <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: '20px',
                    background: 'linear-gradient(0deg, rgba(42, 42, 62, 0.9) 0%, rgba(42, 42, 62, 0.6) 50%, transparent 100%)',
                    borderBottomLeftRadius: '16px',
                    borderBottomRightRadius: '16px',
                    pointerEvents: 'none',
                    zIndex: 2
                }} />

                {/* Scrollable Content with Virtualization */}
                <div 
                    ref={scrollContainerRef}
                    className="scrollable-content" 
                    style={{
                        height: '100%',
                        overflowY: 'auto',
                        overflowX: 'hidden',
                        padding: '20px',
                        scrollbarWidth: 'thin',
                        scrollbarColor: '#8b5cf6 #2a2a3e'
                    }}
                >
                    {/* Virtual List Container */}
                    <div style={{
                        position: 'relative',
                        height: totalHeight + 'px'
                    }}>
                        {/* Spacer for scrolled items */}
                        <div style={{ height: spacerHeight + 'px' }} />
                        
                        {/* Commands List - Only render visible items */}
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '16px'
                        }}>
                            {visibleCommands.map((command, index) => {
                                const actualIndex = visibleRange.start + index;
                                return (
                                    <div
                                        key={`${command.name}-${actualIndex}`}
                                        className="command-card"
                                        style={{
                                            background: '#2a2e3e',
                                            border: '2px solid #3a3a4e',
                                            borderRadius: '12px',
                                            padding: '20px',
                                            cursor: 'pointer',
                                            transition: expandedCommand === command.name ? 'none' : 'border-color 0.15s, background 0.15s, transform 0.15s, box-shadow 0.15s'
                                        }}
                                        onClick={() => {
                                            handleToggleExpand(command.name);
                                        }}
                                        onMouseEnter={(e) => {
                                            if (expandedCommand !== command.name) {
                                                e.currentTarget.style.borderColor = '#4a4a5e';
                                                e.currentTarget.style.background = '#323248';
                                                e.currentTarget.style.transform = 'translateY(-2px)';
                                                e.currentTarget.style.boxShadow = '0 10px 30px rgba(139, 92, 246, 0.15)';
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (expandedCommand !== command.name) {
                                                e.currentTarget.style.borderColor = '#3a3a4e';
                                                e.currentTarget.style.background = '#2a2e3e';
                                                e.currentTarget.style.transform = 'translateY(0)';
                                                e.currentTarget.style.boxShadow = 'none';
                                            }
                                        }}
                                    >
                                        {/* Command Header */}
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'flex-start',
                                            marginBottom: '16px',
                                            flexWrap: 'wrap',
                                            gap: '10px'
                                        }}>
                                            <div style={{
                                                flex: '1',
                                                minWidth: '0'
                                            }}>
                                                {/* Command Name */}
                                                <div style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '12px',
                                                    marginBottom: '12px',
                                                    flexWrap: 'wrap'
                                                }}>
                                                    {/* Selection Checkbox */}
                                                    <label style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        cursor: 'pointer',
                                                        userSelect: 'none'
                                                    }}>
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedCommands.has(command.name)}
                                                            onChange={(e) => {
                                                                e.stopPropagation();
                                                                toggleCommandSelection(command.name);
                                                            }}
                                                            onClick={(e) => e.stopPropagation()}
                                                        />
                                                    </label>

                                                    <h3 className="command-name" style={{
                                                        fontFamily: 'monospace',
                                                        fontSize: '18px',
                                                        fontWeight: '700',
                                                        color: '#8b5cf6',
                                                        margin: 0,
                                                        wordBreak: 'break-word'
                                                    }}>
                                                        {command.name}
                                                    </h3>

                                                    {/* Favorites Button */}
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            toggleFavorite({
                                                                name: command.name,
                                                                value: command.value,
                                                                description: command.description,
                                                                category: getCommandCategory(command.name)
                                                            });
                                                        }}
                                                        style={{
                                                            background: 'none',
                                                            border: 'none',
                                                            cursor: 'pointer',
                                                            padding: '4px',
                                                            borderRadius: '4px',
                                                            transition: 'all 0.2s',
                                                            color: isFavorite(command.name, command.value) ? '#f59e0b' : '#6b6b80'
                                                        }}
                                                        onMouseEnter={(e) => {
                                                            e.currentTarget.style.background = 'rgba(139, 92, 246, 0.1)';
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            e.currentTarget.style.background = 'none';
                                                        }}
                                                        title={isFavorite(command.name, command.value) ? 'Remove from favorites' : 'Add to favorites'}
                                                    >
                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill={isFavorite(command.name, command.value) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                                                            <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"></polygon>
                                                        </svg>
                                                    </button>

                                                    {/* Expand/Collapse Indicator */}
                                                    <span style={{
                                                        color: '#6b6b80',
                                                        fontSize: '12px',
                                                        opacity: 0.7,
                                                        transition: 'transform 0.2s',
                                                        transform: expandedCommand === command.name ? 'rotate(90deg)' : 'rotate(0)'
                                                    }}>
                                                        ▶
                                                    </span>
                                                </div>

                                                {/* Command Values Section */}
                                                <div className="command-values" style={{
                                                    display: 'flex',
                                                    gap: '12px',
                                                    marginBottom: '12px',
                                                    flexWrap: 'wrap'
                                                }}>
                                                    {/* Current Value */}
                                                    {command.value && (
                                                        <div className="value-box" style={{
                                                            background: 'rgba(34, 197, 94, 0.1)',
                                                            border: '1px solid rgba(34, 197, 94, 0.2)',
                                                            borderRadius: '6px',
                                                            padding: '8px 12px',
                                                            minWidth: 'fit-content',
                                                            flex: '1 1 auto'
                                                        }}>
                                                            <div style={{
                                                                fontSize: '11px',
                                                                color: '#10b981',
                                                                marginBottom: '4px',
                                                                fontWeight: '600',
                                                                textTransform: 'uppercase',
                                                                letterSpacing: '0.5px'
                                                            }}>
                                                                Current Value
                                                            </div>
                                                            <div style={{
                                                                fontFamily: 'monospace',
                                                                fontSize: '14px',
                                                                fontWeight: '600',
                                                                wordBreak: 'break-all'
                                                            }}>
                                                                {highlightArguments(command.value === '' ? '(empty)' : command.value)}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Default Value */}
                                                    {command.defaultValue && (
                                                        <div className="value-box" style={{
                                                            background: 'rgba(59, 130, 246, 0.1)',
                                                            border: '1px solid rgba(59, 130, 246, 0.2)',
                                                            borderRadius: '6px',
                                                            padding: '8px 12px',
                                                            minWidth: 'fit-content',
                                                            flex: '1 1 auto'
                                                        }}>
                                                            <div style={{
                                                                fontSize: '11px',
                                                                color: '#3b82f6',
                                                                marginBottom: '4px',
                                                                fontWeight: '600',
                                                                textTransform: 'uppercase',
                                                                letterSpacing: '0.5px'
                                                            }}>
                                                                Default Value
                                                            </div>
                                                            <div style={{
                                                                fontFamily: 'monospace',
                                                                fontSize: '14px',
                                                                fontWeight: '600',
                                                                wordBreak: 'break-all'
                                                            }}>
                                                                {highlightArguments(command.defaultValue === '' ? '(empty)' : command.defaultValue)}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Flags Section */}
                                                {command.flags.length > 0 && (
                                                    <div style={{
                                                        marginBottom: '12px'
                                                    }}>
                                                        <div style={{
                                                            fontSize: '11px',
                                                            color: '#6b6b80',
                                                            marginBottom: '8px',
                                                            fontWeight: '600',
                                                            textTransform: 'uppercase',
                                                            letterSpacing: '0.5px'
                                                        }}>
                                                            Properties & Flags
                                                        </div>
                                                        <div style={{
                                                            display: 'flex',
                                                            gap: '8px',
                                                            flexWrap: 'wrap'
                                                        }}>
                                                            {command.flags.map((flag, flagIndex) => (
                                                                <span
                                                                    key={flagIndex}
                                                                    title={getFlagTooltip(flag)}
                                                                    style={{
                                                                        fontSize: '12px',
                                                                        padding: '4px 10px',
                                                                        background: 'rgba(139, 92, 246, 0.1)',
                                                                        border: '1px solid rgba(139, 92, 246, 0.2)',
                                                                        color: '#a78bfa',
                                                                        borderRadius: '6px',
                                                                        fontWeight: '500',
                                                                        cursor: 'help',
                                                                        transition: 'all 0.2s'
                                                                    }}
                                                                    onMouseEnter={(e) => {
                                                                        e.currentTarget.style.background = 'rgba(139, 92, 246, 0.2)';
                                                                        e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.3)';
                                                                    }}
                                                                    onMouseLeave={(e) => {
                                                                        e.currentTarget.style.background = 'rgba(139, 92, 246, 0.1)';
                                                                        e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.2)';
                                                                    }}
                                                                >
                                                                    {formatFlag(flag)}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Description */}
                                                <div>
                                                    <div style={{
                                                        fontSize: '11px',
                                                        color: '#6b6b80',
                                                        marginBottom: '8px',
                                                        fontWeight: '600',
                                                        textTransform: 'uppercase',
                                                        letterSpacing: '0.5px'
                                                    }}>
                                                        Description
                                                    </div>
                                                    <p style={{
                                                        color: '#a1a1aa',
                                                        fontSize: '14px',
                                                        margin: '0',
                                                        lineHeight: '1.6',
                                                        display: expandedCommand === command.name ? 'block' : '-webkit-box',
                                                        WebkitLineClamp: expandedCommand === command.name ? 'unset' : 2,
                                                        WebkitBoxOrient: 'vertical',
                                                        overflow: 'hidden',
                                                        wordBreak: 'break-word'
                                                    }}>
                                                        {command.description || 'No description available for this command.'}
                                                    </p>
                                                </div>

                                                {/* Usage Example (when expanded) */}
                                                {expandedCommand === command.name && command.example && (
                                                    <div style={{
                                                        marginTop: '16px',
                                                        padding: '12px',
                                                        background: 'rgba(0, 0, 0, 0.3)',
                                                        borderRadius: '6px',
                                                        border: '1px solid rgba(139, 92, 246, 0.1)'
                                                    }}>
                                                        <div style={{
                                                            fontSize: '11px',
                                                            color: '#6b6b80',
                                                            marginBottom: '8px',
                                                            fontWeight: '600',
                                                            textTransform: 'uppercase',
                                                            letterSpacing: '0.5px'
                                                        }}>
                                                            Console Example
                                                        </div>
                                                        <code style={{
                                                            fontFamily: 'monospace',
                                                            fontSize: '13px',
                                                            display: 'block',
                                                            wordBreak: 'break-all'
                                                        }}>
                                                            {highlightCommandSyntax(command.example)}
                                                        </code>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Action Buttons */}
                                            <div style={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: '8px',
                                                flexShrink: 0
                                            }}>
                                                <button
                                                    className="copy-button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleCopyCommand(command, e);
                                                    }}
                                                    style={{
                                                        padding: '8px 16px',
                                                        background: copiedCommand === command.name ? 'rgba(34, 197, 94, 0.1)' : 'rgba(139, 92, 246, 0.1)',
                                                        border: `1px solid ${copiedCommand === command.name ? '#22c55e' : 'rgba(139, 92, 246, 0.3)'}`,
                                                        borderRadius: '6px',
                                                        color: copiedCommand === command.name ? '#22c55e' : '#8b5cf6',
                                                        fontSize: '12px',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.2s ease',
                                                        fontWeight: '500',
                                                        whiteSpace: 'nowrap',
                                                        position: 'relative',
                                                        overflow: 'hidden',
                                                        transform: copiedCommand === command.name ? 'scale(0.95)' : 'scale(1)'
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        if (copiedCommand !== command.name) {
                                                            e.currentTarget.style.background = 'rgba(139, 92, 246, 0.2)';
                                                            e.currentTarget.style.transform = 'scale(1.05)';
                                                        }
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        if (copiedCommand !== command.name) {
                                                            e.currentTarget.style.background = 'rgba(139, 92, 246, 0.1)';
                                                            e.currentTarget.style.transform = 'scale(1)';
                                                        }
                                                    }}
                                                >
                                                    <span style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '6px',
                                                        justifyContent: 'center'
                                                    }}>
                                                        {copiedCommand === command.name ? (
                                                            <>
                                                                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                                                                    <path 
                                                                        d="M3 8L6 11L13 4" 
                                                                        stroke="currentColor" 
                                                                        strokeWidth="2" 
                                                                        strokeLinecap="round" 
                                                                        strokeLinejoin="round"
                                                                        style={{
                                                                            strokeDasharray: '50',
                                                                            animation: 'checkmark 0.3s ease-out forwards'
                                                                        }}
                                                                    />
                                                                </svg>
                                                                Copied
                                                            </>
                                                        ) : (
                                                            <>
                                                                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                                                                    <rect x="4" y="4" width="8" height="10" rx="1" stroke="currentColor" strokeWidth="1.5"/>
                                                                    <path d="M8 2H11C11.5523 2 12 2.44772 12 3V6" stroke="currentColor" strokeWidth="1.5"/>
                                                                </svg>
                                                                Copy
                                                            </>
                                                        )}
                                                    </span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* No Results */}
                    {filteredCommands.length === 0 && (
                        <div style={{
                            textAlign: 'center',
                            color: '#6b6b80',
                            fontSize: '14px',
                            padding: '40px 20px',
                            background: '#2a2a3e',
                            borderRadius: '12px',
                            border: '2px solid #3a3a4e'
                        }}>
                            <div style={{
                                fontSize: '16px',
                                fontWeight: '600',
                                marginBottom: '16px',
                                color: '#8b5cf6'
                            }}>
                                No commands found
                            </div>
                            <div>
                                Try adjusting your search or filter criteria
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Selected Commands Panel */}
            {selectedCommands.size > 0 && (
                <SelectedCommandsPanel
                    selectedCommands={new Map(Array.from(selectedCommands).map(name => {
                        const command = commands.find(cmd => cmd.name === name)!;
                        return [name, {
                            command: command.name,
                            value: command.value,
                            description: command.description,
                            category: getCommandCategory(command.name)
                        }];
                    }))}
                    onRemove={removeSelectedCommand}
                    onClear={clearSelectedCommands}
                    onExport={exportSelectedCommands}
                />
            )}

            {/* Command Presets Modal */}
            {showPresetsModal && (
                <CommandPresets
                    isOpen={showPresetsModal}
                    onClose={() => setShowPresetsModal(false)}
                />
            )}

            {/* Export Favorites Button - Shown only when favorites are visible */}
            {showFavorites && favorites.size > 0 && (
                <div style={{
                    marginTop: '20px',
                    textAlign: 'center'
                }}>
                    <button
                        onClick={exportFavorites}
                        style={{
                            padding: '12px 20px',
                            background: '#2a2e3e',
                            border: '2px solid #3a3a4e',
                            borderRadius: '8px',
                            color: '#22c55e',
                            fontSize: '14px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            whiteSpace: 'nowrap',
                            position: 'relative'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = '#22c55e';
                            e.currentTarget.style.background = '#323248';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(34, 197, 94, 0.2)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = '#3a3a4e';
                            e.currentTarget.style.background = '#2a2e3e';
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = 'none';
                        }}
                    >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M3 13h10M8 1v10m0 0l3-3m-3 3L5 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Export Favorites
                    </button>
                </div>
            )}
        </div>
    );
};

export default CommandsList;