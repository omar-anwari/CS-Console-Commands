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
        setExpandedCommand(expandedCommand === commandName ? '' : commandName);
    };

    // Helper function to format flag names
    const formatFlag = (flag: string) => {
        const flagDescriptions: Record<string, string> = {
            'game': 'Game',
            'client': 'Client-side',
            'cheat': 'Cheat Protected',
            'replicated': 'Replicated',
            'archive': 'Saved',
            'notify': 'Notify',
            'per_user': 'Per User',
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
        <div style={{
            maxWidth: '1400px',
            margin: '0 auto',
            padding: '20px'
        }}>
            {/* Header */}
            <div style={{
                textAlign: 'center',
                marginBottom: '40px'
            }}>
                <h1 style={{
                    fontSize: '48px',
                    fontWeight: '800',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    marginBottom: '10px'
                }}>
                    CS2 Console Commands
                </h1>
                <p style={{
                    color: '#a1a1aa',
                    fontSize: '16px'
                }}>
                    Complete list of Counter-Strike 2 console commands with detailed information
                </p>
            </div>

            {/* Search and Filters */}
            <div style={{
                display: 'flex',
                gap: '20px',
                marginBottom: '30px',
                flexWrap: 'wrap'
            }}>
                {/* Search Bar */}
                <input
                    type="text"
                    placeholder="Search commands or descriptions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                        flex: '1',
                        minWidth: '300px',
                        padding: '12px 16px',
                        background: '#1e1e2e',
                        border: '2px solid #2a2a3a',
                        borderRadius: '8px',
                        color: '#ffffff',
                        fontSize: '14px',
                        outline: 'none',
                        transition: 'all 0.2s'
                    }}
                    onFocus={(e) => {
                        e.currentTarget.style.borderColor = '#8b5cf6';
                        e.currentTarget.style.background = '#252538';
                    }}
                    onBlur={(e) => {
                        e.currentTarget.style.borderColor = '#2a2a3a';
                        e.currentTarget.style.background = '#1e1e2e';
                    }}
                />

                {/* Category Filter */}
                <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    style={{
                        padding: '12px 16px',
                        background: '#1e1e2e',
                        border: '2px solid #2a2a3a',
                        borderRadius: '8px',
                        color: '#ffffff',
                        fontSize: '14px',
                        outline: 'none',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                    }}
                    onFocus={(e) => {
                        e.currentTarget.style.borderColor = '#8b5cf6';
                        e.currentTarget.style.background = '#252538';
                    }}
                    onBlur={(e) => {
                        e.currentTarget.style.borderColor = '#2a2a3a';
                        e.currentTarget.style.background = '#1e1e2e';
                    }}
                >
                    {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                </select>
            </div>

            {/* Results Count */}
            <div style={{
                marginBottom: '20px',
                color: '#a1a1aa',
                fontSize: '14px'
            }}>
                Showing {filteredCommands.length} commands
            </div>

            {/* Commands List */}
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
            }}>
                {filteredCommands.map((command, index) => (
                    <div
                        key={`${command.name}-${index}`}  // Use both name and index for uniqueness
                        style={{
                            background: '#1e1e2e',
                            border: '2px solid #2a2a3a',
                            borderRadius: '12px',
                            padding: '20px',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            cursor: 'pointer'
                        }}
                        onClick={() => handleToggleExpand(command.name)}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = '#3a3a4a';
                            e.currentTarget.style.background = '#252538';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 10px 30px rgba(139, 92, 246, 0.1)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = '#2a2a3a';
                            e.currentTarget.style.background = '#1e1e2e';
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = 'none';
                        }}
                    >
                        {/* Command Header */}
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            marginBottom: '16px'
                        }}>
                            <div style={{ flex: '1' }}>
                                {/* Command Name */}
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    marginBottom: '12px'
                                }}>
                                    <h3 style={{
                                        fontFamily: 'monospace',
                                        fontSize: '18px',
                                        fontWeight: '700',
                                        color: '#8b5cf6',
                                        margin: 0
                                    }}>
                                        {command.name}
                                    </h3>
                                    
                                    {/* Expand/Collapse Indicator */}
                                    <span style={{
                                        color: '#6b6b80',
                                        fontSize: '12px',
                                        opacity: 0.7
                                    }}>
                                        {expandedCommand === command.name ? '▼' : '▶'}
                                    </span>
                                </div>

                                {/* Command Values Section - Now with consistent widths */}
                                <div style={{
                                    display: 'inline-flex',
                                    gap: '12px',
                                    marginBottom: '12px',
                                    flexWrap: 'wrap'
                                }}>
                                    {/* Current Value */}
                                    {command.value && (
                                        <div style={{
                                            background: 'rgba(34, 197, 94, 0.1)',
                                            border: '1px solid rgba(34, 197, 94, 0.2)',
                                            borderRadius: '6px',
                                            padding: '8px 12px',
                                            minWidth: 'fit-content',
                                            display: 'inline-block'
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
                                                fontWeight: '600'
                                            }}>
                                                {command.value === '' ? '(empty)' : command.value}
                                            </div>
                                        </div>
                                    )}
                                    
                                    {/* Default Value */}
                                    {command.defaultValue && (
                                        <div style={{
                                            background: 'rgba(59, 130, 246, 0.1)',
                                            border: '1px solid rgba(59, 130, 246, 0.2)',
                                            borderRadius: '6px',
                                            padding: '8px 12px',
                                            minWidth: 'fit-content',
                                            display: 'inline-block'
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
                                                fontWeight: '600'
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
                                            {command.flags.map((flag, index) => (
                                                <span
                                                    key={index}
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
                                        overflow: 'hidden'
                                    }}>
                                        {command.description || 'No description available for this command.'}
                                    </p>
                                </div>

                                {/* Usage Example (when expanded) - Updated to show actual value */}
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
                                            display: 'block'
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
                                                    display: 'block'
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
                                marginLeft: '16px'
                            }}>
                                <button
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
                    padding: '60px 20px',
                    background: '#1e1e2e',
                    borderRadius: '12px',
                    border: '2px solid #2a2a3a'
                }}>
                    <div style={{
                        fontSize: '48px',
                        marginBottom: '16px',
                        opacity: 0.5
                    }}>
                        🔍
                    </div>
                    <div style={{
                        fontSize: '16px',
                        fontWeight: '600',
                        marginBottom: '8px',
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
    );
};

export default CommandsList;