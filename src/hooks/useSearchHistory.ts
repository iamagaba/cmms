import { useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';

export interface SearchHistoryItem {
  query: string;
  timestamp: number;
  resultCount: number;
}

export interface SearchHistory {
  items: SearchHistoryItem[];
  maxItems: number;
  add: (query: string, resultCount: number) => void;
  clear: () => void;
  remove: (query: string) => void;
  getRecent: (limit?: number) => SearchHistoryItem[];
}

const SEARCH_HISTORY_KEY = 'workorder_search_history';
const MAX_HISTORY_ITEMS = 10;

export function useSearchHistory(): SearchHistory {
  const [historyItems, setHistoryItems] = useLocalStorage<SearchHistoryItem[]>(SEARCH_HISTORY_KEY, []);

  const add = useCallback((query: string, resultCount: number) => {
    if (!query.trim()) return;

    const normalizedQuery = query.trim().toLowerCase();
    const timestamp = Date.now();

    setHistoryItems(prevItems => {
      // Remove existing entry with same query (case-insensitive)
      const filteredItems = prevItems.filter(
        item => item.query.toLowerCase() !== normalizedQuery
      );

      // Add new entry at the beginning
      const newItem: SearchHistoryItem = {
        query: query.trim(),
        timestamp,
        resultCount
      };

      const updatedItems = [newItem, ...filteredItems];

      // Keep only the most recent MAX_HISTORY_ITEMS
      return updatedItems.slice(0, MAX_HISTORY_ITEMS);
    });
  }, [setHistoryItems]);

  const clear = useCallback(() => {
    setHistoryItems([]);
  }, [setHistoryItems]);

  const remove = useCallback((query: string) => {
    const normalizedQuery = query.toLowerCase();
    setHistoryItems(prevItems => 
      prevItems.filter(item => item.query.toLowerCase() !== normalizedQuery)
    );
  }, [setHistoryItems]);

  const getRecent = useCallback((limit: number = 5) => {
    return historyItems
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }, [historyItems]);

  // Clear search history on user logout (when localStorage is cleared)
  const clearOnLogout = useCallback(() => {
    // This will be called by the auth system when user logs out
    clear();
  }, [clear]);

  return {
    items: historyItems,
    maxItems: MAX_HISTORY_ITEMS,
    add,
    clear,
    remove,
    getRecent,
    // Export clearOnLogout for auth integration
    clearOnLogout
  } as SearchHistory & { clearOnLogout: () => void };
}