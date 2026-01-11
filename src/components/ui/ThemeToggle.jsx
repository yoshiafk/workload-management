import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { Button } from './button';

export const ThemeToggle = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="h-9 w-9 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-all duration-300 relative overflow-hidden group"
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
            <div className="relative h-5 w-5">
                <Sun
                    className={`h-5 w-5 absolute transition-all duration-500 transform ${theme === 'dark' ? 'translate-y-10 rotate-90 opacity-0' : 'translate-y-0 rotate-0 opacity-100'
                        }`}
                />
                <Moon
                    className={`h-5 w-5 absolute transition-all duration-500 transform ${theme === 'light' ? '-translate-y-10 -rotate-90 opacity-0' : 'translate-y-0 rotate-0 opacity-100'
                        }`}
                />
            </div>
        </Button>
    );
};
