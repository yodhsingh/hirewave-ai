/**
 * Centralized Color System
 *
 * This color system is designed to work with both light and dark themes.
 * All colors are defined using semantic naming for easy theme switching.
 *
 * Usage:
 * - Import: import { colors } from '@/lib/theme/colors'
 * - Use: className={`bg-${colors.primary[500]}`} or use the helper functions
 */

export const colors = {
  
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',  
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
    950: '#172554',
  },

  
  secondary: {
    50: '#ecfeff',
    100: '#cffafe',
    200: '#a5f3fc',
    300: '#67e8f9',
    400: '#22d3ee',
    500: '#06b6d4',  
    600: '#0891b2',
    700: '#0e7490',
    800: '#155e75',
    900: '#164e63',
    950: '#083344',
  },

  
  accent: {
    50: '#fff7ed',
    100: '#ffedd5',
    200: '#fed7aa',
    300: '#fdba74',
    400: '#fb923c',
    500: '#f97316',  
    600: '#ea580c',
    700: '#c2410c',
    800: '#9a3412',
    900: '#7c2d12',
    950: '#431407',
  },

  
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    500: '#10b981',  
    600: '#059669',
    700: '#047857',
    900: '#064e3b',
  },

  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    500: '#f59e0b',  
    600: '#d97706',
    700: '#b45309',
    900: '#78350f',
  },

  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    500: '#ef4444',  
    600: '#dc2626',
    700: '#b91c1c',
    900: '#7f1d1d',
  },

  info: {
    50: '#eff6ff',
    100: '#dbeafe',
    500: '#3b82f6',  
    600: '#2563eb',
    700: '#1d4ed8',
    900: '#1e3a8a',
  },
} as const;

/**
 * Theme-specific color tokens
 * These colors adapt based on the current theme (light/dark)
 */
export const themeColors = {
  dark: {
    
    bg: {
      primary: '#000000',      
      secondary: '#0a0a0a',    
      tertiary: '#111827',     
      elevated: '#1f2937',     
      hover: '#374151',        
      active: '#4b5563',       
    },

    
    text: {
      primary: '#ffffff',      
      secondary: '#e5e7eb',    
      tertiary: '#9ca3af',     
      quaternary: '#6b7280',   
      inverse: '#000000',      
    },

    
    border: {
      primary: '#1f2937',      
      secondary: '#374151',    
      tertiary: '#4b5563',     
      focus: colors.primary[500], 
    },

    
    interactive: {
      default: colors.primary[600],
      hover: colors.primary[700],
      active: colors.primary[800],
      disabled: '#4b5563',
    },
  },

  light: {
    
    bg: {
      primary: '#ffffff',
      secondary: '#f9fafb',
      tertiary: '#f3f4f6',
      elevated: '#ffffff',
      hover: '#f3f4f6',
      active: '#e5e7eb',
    },

    
    text: {
      primary: '#111827',
      secondary: '#374151',
      tertiary: '#6b7280',
      quaternary: '#9ca3af',
      inverse: '#ffffff',
    },

    
    border: {
      primary: '#e5e7eb',
      secondary: '#d1d5db',
      tertiary: '#9ca3af',
      focus: colors.primary[500],
    },

    
    interactive: {
      default: colors.primary[600],
      hover: colors.primary[700],
      active: colors.primary[800],
      disabled: '#d1d5db',
    },
  },
} as const;

/**
 * Gradient definitions
 * Reusable gradient combinations for consistency
 */
export const gradients = {
  primary: 'from-blue-600 to-cyan-600',
  primaryHover: 'from-blue-700 to-cyan-700',
  accent: 'from-orange-500 to-orange-600',
  success: 'from-green-500 to-emerald-600',
  error: 'from-red-500 to-rose-600',

  
  bgPrimary: 'from-blue-900/20 via-gray-900/10 to-cyan-900/20',
  bgSecondary: 'from-blue-600/5 via-transparent to-cyan-600/5',

  
  cardHeader: 'from-blue-600/20 to-cyan-600/20',
  cardHeaderAlt: 'from-cyan-600/20 to-blue-600/20',
} as const;

/**
 * Shadow definitions
 */
export const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',

  
  glowBlue: '0 0 20px rgb(59 130 246 / 0.3)',
  glowCyan: '0 0 20px rgb(6 182 212 / 0.3)',
  glowOrange: '0 0 20px rgb(249 115 22 / 0.3)',
} as const;

/**
 * Helper function to get theme colors
 * This will be used with a theme context in the future
 */
export const getThemeColors = (theme: 'light' | 'dark' = 'dark') => {
  return themeColors[theme];
};

/**
 * Utility: Generate className string for gradients
 */
export const gradientClass = (gradient: keyof typeof gradients) => {
  return `bg-gradient-to-r ${gradients[gradient]}`;
};

/**
 * Utility: Generate className for themed backgrounds
 */
export const bgClass = (level: 'primary' | 'secondary' | 'tertiary' | 'elevated', theme: 'light' | 'dark' = 'dark') => {
  const bgColors = {
    dark: {
      primary: 'bg-black',
      secondary: 'bg-[#0a0a0a]',
      tertiary: 'bg-gray-900',
      elevated: 'bg-gray-800',
    },
    light: {
      primary: 'bg-white',
      secondary: 'bg-gray-50',
      tertiary: 'bg-gray-100',
      elevated: 'bg-white',
    },
  };
  return bgColors[theme][level];
};

/**
 * Utility: Generate className for themed text
 */
export const textClass = (level: 'primary' | 'secondary' | 'tertiary' | 'quaternary', theme: 'light' | 'dark' = 'dark') => {
  const textColors = {
    dark: {
      primary: 'text-white',
      secondary: 'text-gray-200',
      tertiary: 'text-gray-400',
      quaternary: 'text-gray-500',
    },
    light: {
      primary: 'text-gray-900',
      secondary: 'text-gray-700',
      tertiary: 'text-gray-600',
      quaternary: 'text-gray-400',
    },
  };
  return textColors[theme][level];
};

/**
 * Utility: Generate className for themed borders
 */
export const borderClass = (level: 'primary' | 'secondary' | 'tertiary', theme: 'light' | 'dark' = 'dark') => {
  const borderColors = {
    dark: {
      primary: 'border-gray-800',
      secondary: 'border-gray-700',
      tertiary: 'border-gray-600',
    },
    light: {
      primary: 'border-gray-200',
      secondary: 'border-gray-300',
      tertiary: 'border-gray-400',
    },
  };
  return borderColors[theme][level];
};

export default colors;
