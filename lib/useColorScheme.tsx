import { useColorScheme as useRNColorScheme } from 'react-native';

const NAV_THEME = {
  light: {
    primary: '#0286FF',
    grey: '#858585',
    root: '#FFFFFF',
    foreground: '#0B1528',
    background: '#FFFFFF',
    card: '#FFFFFF',
    text: '#0B1528',
    border: '#EEEEEE',
    notification: '#EF4444',
  },
  dark: {
    primary: '#0286FF',
    grey: '#9CA3AF',
    root: '#000000',
    foreground: '#FFFFFF',
    background: '#000000',
    card: '#1F2937',
    text: '#FFFFFF',
    border: '#374151',
    notification: '#EF4444',
  },
};

export const COLORS = {
  white: '#FFFFFF',
  black: '#000000',
  light: {
    grey: '#858585',
    grey2: '#EEEEEE',
    grey3: '#E5E7EB',
    grey4: '#D1D5DB',
    grey5: '#9CA3AF',
    grey6: '#6B7280',
  },
  dark: {
    grey: '#9CA3AF',
    grey2: '#374151',
    grey3: '#4B5563',
    grey4: '#6B7280',
    grey5: '#9CA3AF',
    grey6: '#D1D5DB',
  },
};

export function useColorScheme() {
  const colorScheme = useRNColorScheme() ?? 'light';
  const isDarkColorScheme = colorScheme === 'dark';
  return {
    colorScheme,
    isDarkColorScheme,
    colors: isDarkColorScheme ? NAV_THEME.dark : NAV_THEME.light,
    setColorScheme: () => {},
    toggleColorScheme: () => {},
  };
}
