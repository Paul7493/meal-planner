import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Safely sets an item in localStorage with quota error handling
 * @param key - The localStorage key
 * @param value - The value to store (will be JSON stringified)
 * @returns boolean - true if successful, false if quota exceeded
 */
export function safeSetLocalStorage(key: string, value: any): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (e: any) {
    // QUOTA_EXCEEDED_ERR typically has code 22, but this may vary by browser
    if (e instanceof DOMException && (e.code === 22 || e.name === 'QuotaExceededError')) {
      console.error(`LocalStorage quota exceeded while setting key '${key}'.`, e);
      return false;
    }
    throw e; // rethrow if it's another error
  }
}

/**
 * Safely gets an item from localStorage with error handling
 * @param key - The localStorage key
 * @returns the parsed value or null if not found/error
 */
export function safeGetLocalStorage(key: string): any {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (e) {
    console.error(`Error reading from localStorage key '${key}':`, e);
    return null;
  }
}

/**
 * Safely removes an item from localStorage
 * @param key - The localStorage key to remove
 */
export function safeRemoveLocalStorage(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (e) {
    console.error(`Error removing localStorage key '${key}':`, e);
  }
}

/**
 * Clears all localStorage data with confirmation
 * @param confirm - Set to true to actually clear the storage
 */
export function clearLocalStorageData(confirm: boolean = false): boolean {
  if (!confirm) {
    console.warn('clearLocalStorageData called without confirmation. Set confirm=true to actually clear.');
    return false;
  }
  
  try {
    localStorage.clear();
    console.log('LocalStorage cleared successfully');
    return true;
  } catch (e) {
    console.error('Error clearing localStorage:', e);
    return false;
  }
}

/**
 * Gets the approximate size of localStorage usage
 * @returns object with used space info
 */
export function getLocalStorageUsage(): { used: number; available: number; percentage: number } {
  let used = 0;
  
  try {
    // Check if we're in a browser environment
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return { used: 0, available: 5 * 1024 * 1024, percentage: 0 };
    }
    
    // Calculate current usage
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        used += localStorage[key].length + key.length;
      }
    }
    
    // Estimate available space (typical limit is 5-10MB, we'll use 5MB as conservative estimate)
    const estimatedLimit = 5 * 1024 * 1024; // 5MB in bytes
    const available = Math.max(0, estimatedLimit - used);
    const percentage = (used / estimatedLimit) * 100;
    
    return {
      used,
      available,
      percentage: Math.min(100, percentage)
    };
  } catch (e) {
    console.error('Error calculating localStorage usage:', e);
    return { used: 0, available: 5 * 1024 * 1024, percentage: 0 };
  }
}
