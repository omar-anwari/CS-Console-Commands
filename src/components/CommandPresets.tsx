'use client';
import React, { useState, useEffect } from 'react';
import { commandPresets, CommandPreset } from '../data/commandPresets';

interface CommandPresetsProps {
    isOpen: boolean;
    onClose: () => void;
}

const CommandPresets: React.FC<CommandPresetsProps> = ({ isOpen, onClose }) => {
    const [selectedPreset, setSelectedPreset] = useState<CommandPreset | null>(null);
    const [copiedCommands, setCopiedCommands] = useState<string>('');
    const [appliedPresets, setAppliedPresets] = useState<Set<string>>(new Set());
    const [mobileView, setMobileView] = useState<'list' | 'detail'>('list');
    const [selectedCommands, setSelectedCommands] = useState<Set<string>>(new Set());
    const [showExportOptions, setShowExportOptions] = useState(false);

    // Check if mobile
    useEffect(() => {
        const checkMobile = () => {
            if (window.innerWidth <= 768) {
                setMobileView('list');
            }
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Clear applied presets after a delay
    useEffect(() => {
        if (appliedPresets.size > 0) {
            const timer = setTimeout(() => {
                setAppliedPresets(new Set());
            }, 1500); // Clear after 1.5 seconds

            return () => clearTimeout(timer);
        }
    }, [appliedPresets]);

    if (!isOpen) return null;

    const handleCopyAllCommands = async (preset: CommandPreset) => {
        const commands = preset.commands
            .map(cmd => cmd.value ? `${cmd.command} ${cmd.value}` : cmd.command)
            .join('\n');
        
        try {
            await navigator.clipboard.writeText(commands);
            setCopiedCommands(preset.id);
            setTimeout(() => setCopiedCommands(''), 2000);
        } catch (err) {
            console.error('Failed to copy commands:', err);
        }
    };

    const handleCopyCommand = async (command: string, value?: string) => {
        const fullCommand = value ? `${command} ${value}` : command;
        try {
            await navigator.clipboard.writeText(fullCommand);
        } catch (err) {
            console.error('Failed to copy command:', err);
        }
    };

    const handleApplyPreset = (preset: CommandPreset) => {
        // Create a new Set with the preset id
        setAppliedPresets(new Set([preset.id]));
        handleCopyAllCommands(preset);
    };

    const handleSelectPreset = (preset: CommandPreset) => {
        setSelectedPreset(preset);
        // Auto-select all commands when preset is selected
        const newSelectedCommands = new Set<string>();
        preset.commands.forEach(cmd => {
            const cmdString = cmd.value ? `${cmd.command} ${cmd.value}` : cmd.command;
            newSelectedCommands.add(cmdString);
        });
        setSelectedCommands(newSelectedCommands);
        
        if (window.innerWidth <= 768) {
            setMobileView('detail');
        }
    };

    const handleBackToList = () => {
        setMobileView('list');
    };

    const toggleCommandSelection = (command: string, value?: string) => {
        const cmdString = value ? `${command} ${value}` : command;
        const newSelected = new Set(selectedCommands);
        if (newSelected.has(cmdString)) {
            newSelected.delete(cmdString);
        } else {
            newSelected.add(cmdString);
        }
        setSelectedCommands(newSelected);
    };

    const selectAllCommands = () => {
        if (!selectedPreset) return;
        const newSelected = new Set<string>();
        selectedPreset.commands.forEach(cmd => {
            const cmdString = cmd.value ? `${cmd.command} ${cmd.value}` : cmd.command;
            newSelected.add(cmdString);
        });
        setSelectedCommands(newSelected);
    };

    const deselectAllCommands = () => {
        setSelectedCommands(new Set());
    };

    const generateConfigFile = () => {
        if (!selectedPreset || selectedCommands.size === 0) return;

        // Generate config file content
        const configContent = [
            '// ====================================',
            `// CS2 Config - ${selectedPreset.name}`,
            `// Generated: ${new Date().toLocaleDateString()}`,
            `// Description: ${selectedPreset.description}`,
            '// ====================================',
            '',
            '// Clear any existing binds or settings that might conflict',
            'echo "Loading custom config...";',
            '',
            `// ${selectedPreset.name} Settings`,
            '// ------------------------------------',
            ''
        ];

        // Add selected commands with comments
        selectedPreset.commands.forEach(cmd => {
            const cmdString = cmd.value ? `${cmd.command} ${cmd.value}` : cmd.command;
            if (selectedCommands.has(cmdString)) {
                if (cmd.description) {
                    configContent.push(`// ${cmd.description}`);
                }
                configContent.push(`${cmdString};`);
                configContent.push('');
            }
        });

        // Add footer
        configContent.push('// ====================================');
        configContent.push('// End of Config');
        configContent.push('// ====================================');
        configContent.push('echo "Config loaded successfully!";');
        configContent.push('');
        configContent.push('// Instructions:');
        configContent.push('// 1. Save this file as autoexec.cfg');
        configContent.push('// 2. Place it in: Steam\\steamapps\\common\\Counter-Strike Global Offensive\\game\\csgo\\cfg\\');
        configContent.push('// 3. Add "+exec autoexec" to your launch options or type "exec autoexec" in console');

        // Create blob and download
        const blob = new Blob([configContent.join('\n')], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'autoexec.cfg';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        // Show success feedback
        setShowExportOptions(false);
    };

    const getCategoryColor = (category: string) => {
        const colors: Record<string, string> = {
            performance: '#22c55e',
            practice: '#f59e0b',
            video: '#ec4899',
            audio: '#3b82f6',
            network: '#8b5cf6',
            gameplay: '#ef4444'
        };
        return colors[category] || '#8b5cf6';
    };

    const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;

    return (
        <>
            {/* Backdrop */}
            <div 
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.7)',
                    backdropFilter: 'blur(5px)',
                    zIndex: 1000,
                    animation: 'fadeIn 0.2s ease-out'
                }}
                onClick={onClose}
            />

            {/* Modal */}
            <div className="modal-container" style={{
                position: 'fixed',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '90%',
                maxWidth: '900px',
                maxHeight: '85vh',
                background: '#1a1a2e',
                borderRadius: '16px',
                border: '2px solid rgba(139, 92, 246, 0.3)',
                zIndex: 1001,
                display: 'flex',
                flexDirection: 'column',
                animation: 'slideUp 0.3s ease-out',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
            }}>
                {/* Header */}
                <div className="modal-header" style={{
                    padding: '24px',
                    borderBottom: '1px solid rgba(139, 92, 246, 0.2)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <div style={{ flex: 1 }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px'
                        }}>
                            {isMobile && mobileView === 'detail' && (
                                <button
                                    onClick={handleBackToList}
                                    style={{
                                        background: 'rgba(139, 92, 246, 0.1)',
                                        border: '1px solid rgba(139, 92, 246, 0.3)',
                                        borderRadius: '6px',
                                        width: '32px',
                                        height: '32px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = 'rgba(139, 92, 246, 0.2)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = 'rgba(139, 92, 246, 0.1)';
                                    }}
                                >
                                    <span style={{ color: '#8b5cf6', fontSize: '18px' }}>←</span>
                                </button>
                            )}
                            <div>
                                <h2 className="modal-title" style={{
                                    fontSize: '24px',
                                    fontWeight: '700',
                                    color: '#ffffff',
                                    margin: 0,
                                    marginBottom: '8px'
                                }}>
                                    {isMobile && mobileView === 'detail' && selectedPreset 
                                        ? selectedPreset.name 
                                        : 'Command Presets'}
                                </h2>
                                <p className="modal-subtitle" style={{
                                    color: '#a1a1aa',
                                    fontSize: '14px',
                                    margin: 0
                                }}>
                                    {isMobile && mobileView === 'detail' && selectedPreset
                                        ? selectedPreset.description
                                        : 'Pre-configured command collections'}
                                </p>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            borderRadius: '8px',
                            width: '36px',
                            height: '36px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            flexShrink: 0
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
                            e.currentTarget.style.transform = 'scale(1.1)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                            e.currentTarget.style.transform = 'scale(1)';
                        }}
                    >
                        <span style={{ color: '#ef4444', fontSize: '20px' }}>✕</span>
                    </button>
                </div>

                {/* Content */}
                <div className="modal-content" style={{
                    display: 'flex',
                    flex: 1,
                    overflow: 'hidden'
                }}>
                    {/* Presets List */}
                    <div className="presets-list" style={{
                        width: isMobile ? '100%' : '350px',
                        borderRight: isMobile ? 'none' : '1px solid rgba(139, 92, 246, 0.2)',
                        overflowY: 'auto',
                        padding: '16px',
                        display: (!isMobile || mobileView === 'list') ? 'block' : 'none'
                    }}>
                        {commandPresets.map(preset => (
                            <div
                                key={preset.id}
                                onClick={() => handleSelectPreset(preset)}
                                className="preset-card"
                                style={{
                                    background: selectedPreset?.id === preset.id 
                                        ? 'rgba(139, 92, 246, 0.1)' 
                                        : 'rgba(42, 42, 62, 0.4)',
                                    border: `2px solid ${selectedPreset?.id === preset.id 
                                        ? 'rgba(139, 92, 246, 0.3)' 
                                        : 'transparent'}`,
                                    borderRadius: '12px',
                                    padding: '16px',
                                    marginBottom: '12px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    position: 'relative'
                                }}
                                onMouseEnter={(e) => {
                                    if (selectedPreset?.id !== preset.id) {
                                        e.currentTarget.style.background = 'rgba(42, 42, 62, 0.6)';
                                        e.currentTarget.style.transform = 'translateX(4px)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (selectedPreset?.id !== preset.id) {
                                        e.currentTarget.style.background = 'rgba(42, 42, 62, 0.4)';
                                        e.currentTarget.style.transform = 'translateX(0)';
                                    }
                                }}
                            >
                                {appliedPresets.has(preset.id) && (
                                    <div style={{
                                        position: 'absolute',
                                        top: '8px',
                                        right: '8px',
                                        background: 'rgba(34, 197, 94, 0.2)',
                                        borderRadius: '50%',
                                        width: '24px',
                                        height: '24px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        animation: 'fadeOut 1.5s ease-out forwards'
                                    }}>
                                        <span style={{ 
                                            color: '#22c55e', 
                                            fontSize: '12px',
                                            animation: 'fadeOut 1.5s ease-out forwards'
                                        }}>✓</span>
                                    </div>
                                )}
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    marginBottom: '8px'
                                }}>
                                    <span style={{ fontSize: '24px' }}>{preset.icon}</span>
                                    <div style={{ flex: 1 }}>
                                        <h3 className="preset-name" style={{
                                            fontSize: '16px',
                                            fontWeight: '600',
                                            color: '#ffffff',
                                            margin: 0
                                        }}>
                                            {preset.name}
                                        </h3>
                                        <span style={{
                                            fontSize: '11px',
                                            padding: '2px 8px',
                                            background: `${getCategoryColor(preset.category)}20`,
                                            color: getCategoryColor(preset.category),
                                            borderRadius: '4px',
                                            fontWeight: '500',
                                            textTransform: 'uppercase',
                                            display: 'inline-block',
                                            marginTop: '4px'
                                        }}>
                                            {preset.category}
                                        </span>
                                    </div>
                                    {isMobile && (
                                        <span style={{
                                            color: '#6b6b80',
                                            fontSize: '16px'
                                        }}>
                                            →
                                        </span>
                                    )}
                                </div>
                                <p className="preset-description" style={{
                                    color: '#a1a1aa',
                                    fontSize: '13px',
                                    margin: 0,
                                    lineHeight: '1.5'
                                }}>
                                    {preset.description}
                                </p>
                                <div style={{
                                    marginTop: '8px',
                                    color: '#6b6b80',
                                    fontSize: '12px'
                                }}>
                                    {preset.commands.length} commands
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Selected Preset Details */}
                    <div className="preset-details" style={{
                        flex: 1,
                        overflowY: 'auto',
                        padding: isMobile ? '16px' : '24px',
                        display: (!isMobile || mobileView === 'detail') ? 'block' : 'none'
                    }}>
                        {selectedPreset ? (
                            <>
                                {!isMobile && (
                                    <div style={{
                                        marginBottom: '24px'
                                    }}>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '16px',
                                            marginBottom: '16px'
                                        }}>
                                            <span style={{ fontSize: '32px' }}>{selectedPreset.icon}</span>
                                            <div>
                                                <h3 style={{
                                                    fontSize: '20px',
                                                    fontWeight: '600',
                                                    color: '#ffffff',
                                                    margin: 0
                                                }}>
                                                    {selectedPreset.name}
                                                </h3>
                                                <p style={{
                                                    color: '#a1a1aa',
                                                    fontSize: '14px',
                                                    margin: 0,
                                                    marginTop: '4px'
                                                }}>
                                                    {selectedPreset.description}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div style={{
                                    display: 'flex',
                                    gap: '12px',
                                    marginBottom: '20px',
                                    flexWrap: 'wrap'
                                }}>
                                    <button
                                        onClick={() => handleApplyPreset(selectedPreset)}
                                        className="copy-all-button"
                                        style={{
                                            padding: '10px 20px',
                                            background: copiedCommands === selectedPreset.id 
                                                ? 'rgba(34, 197, 94, 0.1)' 
                                                : 'rgba(139, 92, 246, 0.1)',
                                            border: `2px solid ${copiedCommands === selectedPreset.id 
                                                ? '#22c55e' 
                                                : 'rgba(139, 92, 246, 0.3)'}`,
                                            borderRadius: '8px',
                                            color: copiedCommands === selectedPreset.id 
                                                ? '#22c55e' 
                                                : '#8b5cf6',
                                            fontSize: '14px',
                                            fontWeight: '600',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            flex: isMobile ? '1' : 'initial'
                                        }}
                                        onMouseEnter={(e) => {
                                            if (copiedCommands !== selectedPreset.id) {
                                                e.currentTarget.style.background = 'rgba(139, 92, 246, 0.2)';
                                                e.currentTarget.style.transform = 'scale(1.05)';
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (copiedCommands !== selectedPreset.id) {
                                                e.currentTarget.style.background = 'rgba(139, 92, 246, 0.1)';
                                                e.currentTarget.style.transform = 'scale(1)';
                                            }
                                        }}
                                    >
                                        {copiedCommands === selectedPreset.id ? (
                                            <>
                                                <span>✓</span>
                                                Copied!
                                            </>
                                        ) : (
                                            <>
                                                <span>📋</span>
                                                Copy All
                                            </>
                                        )}
                                    </button>

                                    <button
                                        onClick={generateConfigFile}
                                        style={{
                                            padding: '10px 20px',
                                            background: 'rgba(34, 197, 94, 0.1)',
                                            border: '2px solid rgba(34, 197, 94, 0.3)',
                                            borderRadius: '8px',
                                            color: '#22c55e',
                                            fontSize: '14px',
                                            fontWeight: '600',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            flex: isMobile ? '1' : 'initial'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background = 'rgba(34, 197, 94, 0.2)';
                                            e.currentTarget.style.transform = 'scale(1.05)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background = 'rgba(34, 197, 94, 0.1)';
                                            e.currentTarget.style.transform = 'scale(1)';
                                        }}
                                    >
                                        <span>💾</span>
                                        Export as .cfg
                                    </button>
                                </div>

                                {/* Selection Controls */}
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginBottom: '12px',
                                    padding: '8px 12px',
                                    background: 'rgba(139, 92, 246, 0.05)',
                                    borderRadius: '6px',
                                    border: '1px solid rgba(139, 92, 246, 0.1)'
                                }}>
                                    <span style={{
                                        fontSize: '13px',
                                        color: '#a1a1aa'
                                    }}>
                                        {selectedCommands.size} of {selectedPreset.commands.length} selected
                                    </span>
                                    <div style={{
                                        display: 'flex',
                                        gap: '8px'
                                    }}>
                                        <button
                                            onClick={selectAllCommands}
                                            style={{
                                                padding: '4px 12px',
                                                background: 'transparent',
                                                border: '1px solid rgba(139, 92, 246, 0.3)',
                                                borderRadius: '4px',
                                                color: '#8b5cf6',
                                                fontSize: '12px',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.background = 'rgba(139, 92, 246, 0.1)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.background = 'transparent';
                                            }}
                                        >
                                            Select All
                                        </button>
                                        <button
                                            onClick={deselectAllCommands}
                                            style={{
                                                padding: '4px 12px',
                                                background: 'transparent',
                                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                                borderRadius: '4px',
                                                color: '#ef4444',
                                                fontSize: '12px',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.background = 'transparent';
                                            }}
                                        >
                                            Clear
                                        </button>
                                    </div>
                                </div>

                                <div style={{
                                    background: 'rgba(0, 0, 0, 0.2)',
                                    borderRadius: '8px',
                                    padding: isMobile ? '12px' : '16px',
                                    marginBottom: '16px'
                                }}>
                                    <h4 style={{
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        color: '#8b5cf6',
                                        margin: 0,
                                        marginBottom: '12px'
                                    }}>
                                        Commands ({selectedPreset.commands.length})
                                    </h4>
                                    
                                    {selectedPreset.commands.map((cmd, index) => {
                                        const cmdString = cmd.value ? `${cmd.command} ${cmd.value}` : cmd.command;
                                        const isSelected = selectedCommands.has(cmdString);
                                        
                                        return (
                                            <div
                                                key={index}
                                                className="command-item"
                                                style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    padding: '12px',
                                                    background: isSelected 
                                                        ? 'rgba(139, 92, 246, 0.1)' 
                                                        : 'rgba(42, 42, 62, 0.4)',
                                                    borderRadius: '6px',
                                                    marginBottom: '8px',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s',
                                                    flexWrap: isMobile ? 'wrap' : 'nowrap',
                                                    border: isSelected 
                                                        ? '1px solid rgba(139, 92, 246, 0.3)' 
                                                        : '1px solid transparent'
                                                }}
                                                onClick={() => toggleCommandSelection(cmd.command, cmd.value)}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.transform = 'translateX(4px)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.transform = 'translateX(0)';
                                                }}
                                            >
                                                <div style={{ 
                                                    display: 'flex', 
                                                    alignItems: 'center', 
                                                    gap: '12px',
                                                    flex: 1,
                                                    width: isMobile ? '100%' : 'auto'
                                                }}>
                                                    <input
                                                        type="checkbox"
                                                        checked={isSelected}
                                                        onChange={() => {}}
                                                        style={{
                                                            width: '18px',
                                                            height: '18px',
                                                            cursor: 'pointer',
                                                            accentColor: '#8b5cf6'
                                                        }}
                                                    />
                                                    <div style={{ flex: 1 }}>
                                                        <code style={{
                                                            fontFamily: 'monospace',
                                                            fontSize: isMobile ? '12px' : '14px',
                                                            color: '#8b5cf6',
                                                            fontWeight: '600',
                                                            wordBreak: 'break-all'
                                                        }}>
                                                            {cmd.command}
                                                            {cmd.value && (
                                                                <span style={{ color: '#22c55e', marginLeft: '8px' }}>
                                                                    {cmd.value}
                                                                </span>
                                                            )}
                                                        </code>
                                                        {cmd.description && (
                                                            <div style={{
                                                                color: '#a1a1aa',
                                                                fontSize: isMobile ? '11px' : '12px',
                                                                marginTop: '4px'
                                                            }}>
                                                                {cmd.description}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleCopyCommand(cmd.command, cmd.value);
                                                    }}
                                                    style={{
                                                        padding: '4px 8px',
                                                        background: 'transparent',
                                                        border: '1px solid rgba(139, 92, 246, 0.2)',
                                                        borderRadius: '4px',
                                                        color: '#8b5cf6',
                                                        fontSize: '11px',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.2s',
                                                        marginLeft: '12px'
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.background = 'rgba(139, 92, 246, 0.1)';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.background = 'transparent';
                                                    }}
                                                >
                                                    Copy
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div style={{
                                    background: 'rgba(245, 158, 11, 0.1)',
                                    border: '1px solid rgba(245, 158, 11, 0.2)',
                                    borderRadius: '8px',
                                    padding: '12px',
                                    marginTop: '16px'
                                }}>
                                    <p style={{
                                        color: '#f59e0b',
                                        fontSize: isMobile ? '12px' : '13px',
                                        margin: 0,
                                        lineHeight: '1.5'
                                    }}>
                                        <strong>💡 Tip:</strong> Select the commands you want, then click "Export as .cfg" to download a custom autoexec.cfg file. Place it in your CS2 cfg folder and add "+exec autoexec" to launch options.
                                    </p>
                                </div>
                            </>
                        ) : (
                            !isMobile && (
                                <div style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    height: '100%',
                                    color: '#6b6b80'
                                }}>
                                    <span style={{ fontSize: '48px', marginBottom: '16px' }}>📦</span>
                                    <p style={{ fontSize: '16px' }}>Select a preset to view commands</p>
                                </div>
                            )
                        )}
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                
                @keyframes slideUp {
                    from {
                        opacity: 0;
                        transform: translate(-50%, -45%);
                    }
                    to {
                        opacity: 1;
                        transform: translate(-50%, -50%);
                    }
                }

                @keyframes fadeOut {
                    0% {
                        opacity: 1;
                    }
                    70% {
                        opacity: 1;
                    }
                    100% {
                        opacity: 0;
                    }
                }

                @media (max-width: 768px) {
                    .modal-container {
                        width: 95% !important;
                        height: 90vh !important;
                        max-height: 90vh !important;
                        top: 50% !important;
                    }

                    .modal-header {
                        padding: 16px !important;
                    }

                    .modal-title {
                        font-size: 18px !important;
                    }

                    .modal-subtitle {
                        font-size: 12px !important;
                    }

                    .preset-card {
                        padding: 12px !important;
                    }

                    .preset-name {
                        font-size: 14px !important;
                    }

                    .preset-description {
                        font-size: 12px !important;
                    }

                    .copy-hint {
                        display: block !important;
                    }
                }

                @media (max-width: 480px) {
                    .modal-container {
                        width: 100% !important;
                        height: 100% !important;
                        max-height: 100% !important;
                        border-radius: 0 !important;
                        border: none !important;
                    }
                }
            `}</style>
        </>
    );
};

export default CommandPresets;