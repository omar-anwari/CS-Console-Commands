import { useState, useEffect } from 'react';

interface FavoriteCommand {
    name: string;
    value?: string;
    description: string;
    category?: string;
}

export const useFavorites = () => {
    const [favorites, setFavorites] = useState<Map<string, FavoriteCommand>>(new Map());
    const STORAGE_KEY = 'cs2-command-favorites';

    // Load favorites from localStorage on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                const favoritesMap = new Map<string, FavoriteCommand>(parsed);
                setFavorites(favoritesMap);
            }
        } catch (error) {
            console.error('Error loading favorites:', error);
        }
    }, []);

    // Save favorites to localStorage whenever they change
    useEffect(() => {
        try {
            const serialized = JSON.stringify(Array.from(favorites.entries()));
            localStorage.setItem(STORAGE_KEY, serialized);
        } catch (error) {
            console.error('Error saving favorites:', error);
        }
    }, [favorites]);

    const toggleFavorite = (command: FavoriteCommand) => {
        setFavorites(prev => {
            const newFavorites = new Map(prev);
            const key = command.value ? `${command.name} ${command.value}` : command.name;
            
            if (newFavorites.has(key)) {
                newFavorites.delete(key);
            } else {
                newFavorites.set(key, command);
            }
            
            return newFavorites;
        });
    };

    const isFavorite = (commandName: string, value?: string): boolean => {
        const key = value ? `${commandName} ${value}` : commandName;
        return favorites.has(key);
    };

    const clearFavorites = () => {
        setFavorites(new Map());
    };

    return {
        favorites,
        toggleFavorite,
        isFavorite,
        clearFavorites,
        favoritesCount: favorites.size
    };
};