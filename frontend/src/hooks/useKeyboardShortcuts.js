/**
 * useKeyboardShortcuts Hook
 * Registers global keyboard shortcuts with proper handling for:
 * - Modifier keys (⌘/Ctrl, Shift, Alt)
 * - Input field conflicts (ignores when typing in inputs)
 * - Cross-platform support (Mac ⌘ = Windows Ctrl)
 */

import { useEffect, useCallback } from 'react';

/**
 * Check if the current element is an input-like element
 */
function isInputElement(element) {
    if (!element) return false;

    const tagName = element.tagName?.toLowerCase();
    const isInput = tagName === 'input' || tagName === 'textarea' || tagName === 'select';
    const isContentEditable = element.isContentEditable;

    return isInput || isContentEditable;
}

/**
 * Normalize keyboard event to handle cross-platform modifier keys
 */
function matchesShortcut(event, shortcut) {
    // Check key match (case-insensitive)
    const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();
    if (!keyMatch) return false;

    // Check modifier keys
    // Meta (⌘ on Mac) or Ctrl (on Windows/Linux)
    const metaMatch = shortcut.meta
        ? (event.metaKey || event.ctrlKey)
        : (!event.metaKey && !event.ctrlKey);

    const shiftMatch = shortcut.shift ? event.shiftKey : !event.shiftKey;
    const altMatch = shortcut.alt ? event.altKey : !event.altKey;

    return metaMatch && shiftMatch && altMatch;
}

/**
 * @typedef {Object} Shortcut
 * @property {string} key - The key to listen for (e.g., 'k', 'Enter', 'Escape')
 * @property {boolean} [meta] - Require ⌘/Ctrl key
 * @property {boolean} [shift] - Require Shift key
 * @property {boolean} [alt] - Require Alt/Option key
 * @property {Function} handler - Callback when shortcut is triggered
 * @property {boolean} [disabled] - Whether the shortcut is disabled
 * @property {boolean} [preventDefault] - Prevent default browser behavior (default: true)
 * @property {boolean} [allowInInput] - Allow shortcut even when focused on input (default: false)
 */

/**
 * Hook to register keyboard shortcuts
 * @param {Shortcut[]} shortcuts - Array of shortcut definitions
 */
export function useKeyboardShortcuts(shortcuts) {
    const handleKeyDown = useCallback((event) => {
        // Skip if shortcuts array is empty
        if (!shortcuts || shortcuts.length === 0) return;

        for (const shortcut of shortcuts) {
            // Skip disabled shortcuts
            if (shortcut.disabled) continue;

            // Check if shortcut matches
            if (!matchesShortcut(event, shortcut)) continue;

            // Skip if in input element (unless explicitly allowed)
            if (!shortcut.allowInInput && isInputElement(event.target)) continue;

            // Prevent default unless explicitly set to false
            if (shortcut.preventDefault !== false) {
                event.preventDefault();
            }

            // Execute handler
            shortcut.handler(event);

            // Only trigger one shortcut per keypress
            break;
        }
    }, [shortcuts]);

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);
}

export default useKeyboardShortcuts;
