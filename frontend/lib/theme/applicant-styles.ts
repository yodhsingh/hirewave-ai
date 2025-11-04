/**
 * Applicant Portal Styling Utilities
 * Consistent bright colors for dark theme
 */

export const applicantStyles = {
  // Cards
  card: {
    primary: 'bg-gradient-to-br from-blue-600/30 to-cyan-600/30 border border-blue-500/50 backdrop-blur-xl',
    secondary: 'bg-gradient-to-br from-gray-900 to-gray-800 backdrop-blur-xl border border-gray-700',
    accent: 'bg-gradient-to-br from-orange-600/30 to-amber-600/30 border border-orange-500/50 backdrop-blur-xl',
    success: 'bg-gradient-to-br from-green-600/30 to-emerald-600/30 border border-green-500/50 backdrop-blur-xl',
    warning: 'bg-gradient-to-br from-amber-600/20 to-yellow-600/20 border border-amber-500/50',
    error: 'bg-gradient-to-br from-red-600/30 to-rose-600/30 border border-red-500/50 backdrop-blur-xl',
  },

  // Buttons
  button: {
    primary: 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold shadow-lg shadow-blue-500/25',
    secondary: 'bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500 text-white',
    accent: 'bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-semibold shadow-lg shadow-orange-500/25',
    outline: 'border-2 border-gray-600 bg-gray-800/50 hover:bg-gray-700/50 text-white',
    ghost: 'hover:bg-gray-700/50 text-gray-300 hover:text-white',
  },

  // Badges
  badge: {
    primary: 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white border-0',
    secondary: 'bg-gray-700 text-gray-200 border border-gray-600',
    success: 'bg-green-500/20 text-green-300 border border-green-500/50',
    warning: 'bg-amber-500/20 text-amber-300 border border-amber-500/50',
    error: 'bg-red-500/20 text-red-300 border border-red-500/50',
    info: 'bg-blue-500/20 text-blue-300 border border-blue-500/50',
  },

  // Text
  text: {
    heading: 'text-white',
    subheading: 'text-gray-200',
    body: 'text-gray-300',
    muted: 'text-gray-400',
    accent: 'text-cyan-400',
    success: 'text-green-400',
    warning: 'text-amber-400',
    error: 'text-red-400',
  },

  // Selection Cards
  selectionCard: {
    selected: 'border-2 border-cyan-500 bg-gradient-to-br from-cyan-600/20 to-blue-600/20 shadow-lg shadow-cyan-500/20',
    unselected: 'border-2 border-gray-600 bg-gray-800/50 hover:bg-gray-700/50',
  },

  // Input Fields
  input: {
    default: 'bg-gray-800/50 border border-gray-600 text-white placeholder:text-gray-500 focus:border-cyan-500 focus:ring-cyan-500/20',
    error: 'bg-gray-800/50 border border-red-500 text-white placeholder:text-gray-500 focus:border-red-500 focus:ring-red-500/20',
  },

  // Progress
  progress: {
    bar: 'bg-gradient-to-r from-blue-600 to-cyan-600',
    track: 'bg-gray-700',
  },

  // Alerts
  alert: {
    info: 'bg-gradient-to-br from-blue-600/20 to-cyan-600/20 border border-blue-500/50',
    success: 'bg-gradient-to-br from-green-600/20 to-emerald-600/20 border border-green-500/50',
    warning: 'bg-gradient-to-br from-amber-600/20 to-yellow-600/20 border border-amber-500/50',
    error: 'bg-gradient-to-br from-red-600/20 to-rose-600/20 border border-red-500/50',
  },

  // Icons
  iconColor: {
    primary: 'text-cyan-400',
    secondary: 'text-gray-400',
    success: 'text-green-400',
    warning: 'text-amber-400',
    error: 'text-red-400',
    accent: 'text-orange-400',
  },
};

export const gradientText = {
  primary: 'bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent',
  accent: 'bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent',
  success: 'bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent',
};