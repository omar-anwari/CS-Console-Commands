'use client';
import React, { useState, useMemo } from 'react';
import { CS2Command } from '../types/command';
import { categorizeCommands } from '../utils/commandParser';

interface CommandsListProps {
    commands: CS2Command[];
}

const CommandsList: React.FC<CommandsListProps> = ({ commands }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('All');
    const [copiedCommand, setCopiedCommand] = useState<string>('');
    const [expandedCommand, setExpandedCommand] = useState<string>('');

    const categorizedCommands = useMemo(() => categorizeCommands(commands), [commands]);
    const categories = ['All', ...Object.keys(categorizedCommands)];

    const filteredCommands = useMemo(() => {
        let filtered = commands;
        
        // Filter by category
        if (selectedCategory !== 'All') {
            filtered = categorizedCommands[selectedCategory] || [];
        }
        
        // Filter by search term
        if (searchTerm) {
            filtered = filtered.filter(cmd => 
                cmd.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                cmd.description.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        
        return filtered;
    }, [commands, searchTerm, selectedCategory, categorizedCommands]);

    const handleCopyCommand = (command: CS2Command) => {
        const commandText = command.value ? `${command.name} ${command.value}` : command.name;
        navigator.clipboard.writeText(commandText);
        setCopiedCommand(command.name);
        setTimeout(() => setCopiedCommand(''), 2000);
    };

    const handleToggleExpand = (commandName: string) => {
        requestAnimationFrame(() => {
            setExpandedCommand(expandedCommand === commandName ? '' : commandName);
        });
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

    return (
        <div className="main-container" style={{
            maxWidth: '1400px',
            margin: '0 auto',
            padding: '20px'
        }}>
            <style jsx>{`
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
                marginBottom: '40px'
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

            {/* Search and Filters */}
            <div style={{
                position: 'sticky',
                top: '0',
                zIndex: 10,
                paddingTop: '20px',
                paddingBottom: '20px',
                marginBottom: '10px',
                marginTop: '-20px'
            }}>
                <div className="search-filter-container" style={{
                    display: 'flex',
                    gap: '20px',
                    flexWrap: 'wrap'
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
                </div>

                {/* Results Count */}
                <div style={{
                    marginTop: '15px',
                    color: '#a1a1aa',
                    fontSize: '14px'
                }}>
                    Showing {filteredCommands.length} commands
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

                {/* Scrollable Content */}
                <div className="scrollable-content" style={{
                    height: '100%',
                    overflowY: 'auto',
                    overflowX: 'hidden',
                    padding: '20px',
                    scrollbarWidth: 'thin',
                    scrollbarColor: '#8b5cf6 #2a2a3e'
                }}>
                    {/* Commands List */}
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '16px'
                    }}>
                        {filteredCommands.map((command, index) => (
                            <div
                                key={`${command.name}-${index}`}
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
                                            
                                            {/* Expand/Collapse Indicator */}
                                            <span style={{
                                                color: '#6b6b80',
                                                fontSize: '12px',
                                                opacity: 0.7,
                                                transition: 'none'
                                            }}>
                                                {expandedCommand === command.name ? '▼' : '▶'}
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
                                                        color: '#22c55e',
                                                        fontWeight: '600',
                                                        wordBreak: 'break-all'
                                                    }}>
                                                        {command.value === '' ? '(empty)' : command.value}
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
                                                        color: '#60a5fa',
                                                        fontWeight: '600',
                                                        wordBreak: 'break-all'
                                                    }}>
                                                        {command.defaultValue === '' ? '(empty)' : command.defaultValue}
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
                                        {expandedCommand === command.name && (
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
                                                    color: '#8b5cf6',
                                                    display: 'block',
                                                    wordBreak: 'break-all'
                                                }}>
                                                    {command.value || command.defaultValue ? 
                                                        `${command.name} ${command.value || command.defaultValue}` : 
                                                        command.name
                                                    }
                                                </code>
                                                {command.value && command.defaultValue && command.value !== command.defaultValue && (
                                                    <div style={{
                                                        marginTop: '8px',
                                                        paddingTop: '8px',
                                                        borderTop: '1px solid rgba(139, 92, 246, 0.1)'
                                                    }}>
                                                        <div style={{
                                                            fontSize: '11px',
                                                            color: '#6b6b80',
                                                            marginBottom: '4px'
                                                        }}>
                                                            To reset to default:
                                                        </div>
                                                        <code style={{
                                                            fontFamily: 'monospace',
                                                            fontSize: '13px',
                                                            color: '#60a5fa',
                                                            display: 'block',
                                                            wordBreak: 'break-all'
                                                        }}>
                                                            {command.name} {command.defaultValue}
                                                        </code>
                                                    </div>
                                                )}
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
                                                handleCopyCommand(command);
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
                                                whiteSpace: 'nowrap'
                                            }}
                                            onMouseEnter={(e) => {
                                                if (copiedCommand !== command.name) {
                                                    e.currentTarget.style.background = 'rgba(139, 92, 246, 0.2)';
                                                }
                                            }}
                                            onMouseLeave={(e) => {
                                                if (copiedCommand !== command.name) {
                                                    e.currentTarget.style.background = 'rgba(139, 92, 246, 0.1)';
                                                }
                                            }}
                                        >
                                            {copiedCommand === command.name ? '✓ Copied' : 'Copy'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
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
        </div>
    );
};

export default CommandsList;