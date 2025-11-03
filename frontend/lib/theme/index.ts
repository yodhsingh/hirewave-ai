/**
 * Theme Configuration
 *
 * Central export for all theme-related utilities
 */

export {
  colors,
  themeColors,
  gradients,
  shadows,
  getThemeColors,
  gradientClass,
  bgClass,
  textClass,
  borderClass,
} from './colors';

export type { } from './colors';

/**
 * Theme type definition
 */
export type Theme = 'light' | 'dark';

/**
 * Default theme
 */
export const DEFAULT_THEME: Theme = 'dark';
