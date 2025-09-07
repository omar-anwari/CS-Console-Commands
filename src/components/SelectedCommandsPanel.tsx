'use client';
import React, { useState } from 'react';

interface SelectedCommand {
    command: string;
    value?: string;
    description?: string;
    category: string;
}

interface SelectedCommandsPanelProps {
    selectedCommands: Map<string, SelectedCommand>;
    onRemove: (command: string) => void;
    onClear: () => void;
    onExport: () => void;
}

const SelectedCommandsPanel: React.FC<SelectedCommandsPanelProps> = ({
    selectedCommands,
    onRemove,
    onClear,
    onExport
}) => {
    const [isExpanded, setIsExpanded] = useState(true);
    const [isMinimized, setIsMinimized] = useState(false);

    if (selectedCommands.size === 0) return null;

    const getCategoryColor = (category: string) => {
        const colors: Record<string, string> = {
            'Graphics': '#22c55e',
            'Gameplay': '#f59e0b',
            'Audio': '#ec4899',
            'Network': '#3b82f6',
            'HUD': '#8b5cf6',
            'Mouse': '#ef4444',
            'Binds': '#06b6d4',
            'Performance': '#84cc16',
            'Video': '#a855f7',
            'Crosshair': '#f97316',
            'Viewmodel': '#14b8a6',
            'Misc': '#6b7280'
        };
        return colors[category] || '#8b5cf6';
    };

    return (
        <div style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            width: isMinimized ? 'auto' : '380px',
            maxHeight: '60vh',
            background: '#1a1a2e',
            borderRadius: '12px',
            border: '2px solid rgba(139, 92, 246, 0.3)',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)',
            zIndex: 100,
            transition: 'all 0.3s ease',
            overflow: 'hidden'
        }}>
            {/* Header */}
            <div style={{
                padding: '12px 16px',
                background: 'rgba(139, 92, 246, 0.1)',
                borderBottom: '1px solid rgba(139, 92, 246, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer'
            }}
            onClick={() => setIsMinimized(!isMinimized)}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                }}>
                    <span style={{
                        background: 'rgba(139, 92, 246, 0.2)',
                        color: '#8b5cf6',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '600'
                    }}>
                        {selectedCommands.size}
                    </span>
                    <span style={{
                        color: '#ffffff',
                        fontSize: '14px',
                        fontWeight: '600'
                    }}>
                        Selected Commands
                    </span>
                </div>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsMinimized(!isMinimized);
                    }}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#8b5cf6',
                        fontSize: '18px',
                        cursor: 'pointer',
                        transform: isMinimized ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.3s'
                    }}
                >
                    {isMinimized ? '▲' : '▼'}
                </button>
            </div>

            {!isMinimized && (
                <>
                    {/* Action Buttons */}
                    <div style={{
                        padding: '12px 16px',
                        display: 'flex',
                        gap: '8px',
                        borderBottom: '1px solid rgba(139, 92, 246, 0.1)'
                    }}>
                        <button
                            onClick={onExport}
                            style={{
                                flex: 1,
                                padding: '8px 16px',
                                background: 'rgba(34, 197, 94, 0.1)',
                                border: '2px solid rgba(34, 197, 94, 0.3)',
                                borderRadius: '6px',
                                color: '#22c55e',
                                fontSize: '13px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '6px'
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
                            Export .cfg
                        </button>
                        <button
                            onClick={onClear}
                            style={{
                                padding: '8px 16px',
                                background: 'rgba(239, 68, 68, 0.1)',
                                border: '2px solid rgba(239, 68, 68, 0.3)',
                                borderRadius: '6px',
                                color: '#ef4444',
                                fontSize: '13px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                            }}
                        >
                            Clear All
                        </button>
                    </div>

                    {/* Commands List */}
                    <div style={{
                        maxHeight: '350px',
                        overflowY: 'auto',
                        padding: '12px'
                    }}>
                        {Array.from(selectedCommands.entries()).map(([key, cmd]) => (
                            <div
                                key={key}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '8px 12px',
                                    background: 'rgba(42, 42, 62, 0.4)',
                                    borderRadius: '6px',
                                    marginBottom: '8px',
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = 'rgba(42, 42, 62, 0.6)';
                                    e.currentTarget.style.transform = 'translateX(-4px)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'rgba(42, 42, 62, 0.4)';
                                    e.currentTarget.style.transform = 'translateX(0)';
                                }}
                            >
                                <div style={{ flex: 1 }}>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        marginBottom: '4px'
                                    }}>
                                        <code style={{
                                            fontFamily: 'monospace',
                                            fontSize: '12px',
                                            color: '#8b5cf6',
                                            fontWeight: '600'
                                        }}>
                                            {cmd.command}
                                            {cmd.value && (
                                                <span style={{ color: '#22c55e', marginLeft: '6px' }}>
                                                    {cmd.value}
                                                </span>
                                            )}
                                        </code>
                                    </div>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px'
                                    }}>
                                        <span style={{
                                            fontSize: '10px',
                                            padding: '2px 6px',
                                            background: `${getCategoryColor(cmd.category)}20`,
                                            color: getCategoryColor(cmd.category),
                                            borderRadius: '4px',
                                            fontWeight: '500'
                                        }}>
                                            {cmd.category}
                                        </span>
                                        {cmd.description && (
                                            <span style={{
                                                fontSize: '11px',
                                                color: '#6b6b80'
                                            }}>
                                                {cmd.description.substring(0, 30)}...
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <button
                                    onClick={() => onRemove(key)}
                                    style={{
                                        width: '24px',
                                        height: '24px',
                                        background: 'rgba(239, 68, 68, 0.1)',
                                        border: '1px solid rgba(239, 68, 68, 0.3)',
                                        borderRadius: '4px',
                                        color: '#ef4444',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '16px',
                                        transition: 'all 0.2s'
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
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Footer Info */}
                    <div style={{
                        padding: '12px 16px',
                        borderTop: '1px solid rgba(139, 92, 246, 0.1)',
                        background: 'rgba(139, 92, 246, 0.05)'
                    }}>
                        <p style={{
                            fontSize: '11px',
                            color: '#a1a1aa',
                            margin: 0,
                            lineHeight: '1.4'
                        }}>
                            💡 Click commands in the main list to add/remove. Export creates an autoexec.cfg file.
                        </p>
                    </div>
                </>
            )}
        </div>
    );
};

export default SelectedCommandsPanel;