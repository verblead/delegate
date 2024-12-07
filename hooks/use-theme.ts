'use client';

import { useTheme as useNextTheme } from 'next-themes';

export function useTheme() {
  const { theme, setTheme, themes, systemTheme } = useNextTheme();
  
  return {
    theme,
    setTheme,
    themes,
    systemTheme,
    isDark: theme === 'dark' || (theme === 'system' && systemTheme === 'dark'),
  };
}