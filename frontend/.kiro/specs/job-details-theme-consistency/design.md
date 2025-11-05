# Design Document

## Overview

This design document outlines the comprehensive visual redesign of the job details page (`/hr/jobs/[id]`) to achieve complete theme consistency with the home screen and overall application design system. The redesign focuses on implementing a cohesive dark theme with glass morphism effects, consistent typography using DM Sans font family, and standardized color palette throughout all components.

## Architecture

### Design System Foundation

The design will be built upon the existing theme system defined in `lib/theme/colors.ts` and `lib/theme/index.ts`, ensuring consistency across the application:

- **Primary Colors**: Blue-600 to Cyan-600 gradients for primary actions
- **Background**: Dark theme with `#0F0F0F` base and layered transparency
- **Typography**: DM Sans font family with consistent weight hierarchy
- **Glass Morphism**: Backdrop blur effects with subtle transparency
- **Component Patterns**: Consistent spacing, border radius, and interaction states

### Visual Hierarchy

1. **Background Layer**: Dark base (`#0F0F0F`) with subtle gradient overlays
2. **Content Layer**: Glass morphism cards with `bg-white/[0.04]` and backdrop blur
3. **Interactive Layer**: Buttons, tabs, and controls with gradient treatments
4. **Text Layer**: White primary text with gray secondary text hierarchy

## Components and Interfaces

### 1. Page Layout Structure

```typescript
interface PageLayoutProps {
  backgroundGradients: {
    primary: 'from-blue-900/20 via-gray-900/10 to-cyan-900/20'
    secondary: 'from-blue-600/5 via-transparent to-cyan-600/5'
  }
  navigation: NavigationComponent
  header: PageHeaderComponent
  content: TabContentComponent
}
```

**Design Specifications:**
- Fixed background with dual gradient overlays
- Sticky navigation with backdrop blur
- Consistent container max-width and padding
- Z-index layering for proper stacking

### 2. Navigation Component

```typescript
interface NavigationProps {
  background: 'bg-black/50 backdrop-blur-lg'
  border: 'border-b border-gray-800'
  userProfile: UserProfileDropdown
  notifications: NotificationBell
}
```

**Design Specifications:**
- Match home screen navigation exactly
- Logo with Brain.svg icon
- Centered navigation links
- Right-aligned user profile with gradient avatar
- Consistent hover states and transitions

### 3. Page Header Component

```typescript
interface PageHeaderProps {
  background: 'bg-black/30 backdrop-blur-sm'
  border: 'border-b border-gray-800'
  jobInfo: JobInfoDisplay
  actions: ActionButtons
}
```

**Design Specifications:**
- Job title with large, light font weight
- Metadata with consistent icon styling
- Primary action button with gradient background
- Secondary actions in dropdown menu

### 4. Tab Navigation System

```typescript
interface TabSystemProps {
  container: 'bg-gray-900/90 backdrop-blur-md border border-gray-700'
  activeTab: 'bg-gray-700 text-white'
  inactiveTab: 'text-gray-400 hover:text-white'
  content: TabContentArea
}
```

**Design Specifications:**
- Rounded tab container with glass morphism
- Smooth transitions between tabs
- Active state with subtle background highlight
- Consistent padding and typography

### 5. Card Components

```typescript
interface CardProps {
  background: 'bg-gray-900/90 backdrop-blur-md'
  border: 'border-gray-700'
  borderRadius: 'rounded-lg'
  padding: 'p-6'
  shadow: 'shadow-lg'
}
```

**Design Specifications:**
- Glass morphism treatment for all cards
- Consistent border radius and spacing
- Subtle shadow effects for depth
- Responsive padding and layout

### 6. Data Visualization Components

```typescript
interface VisualizationProps {
  pipeline: CandidatePipelineChart
  metrics: MetricsCards
  charts: AnalyticsCharts
  colorScheme: ThemeColorPalette
}
```

**Design Specifications:**
- Pipeline stages with gradient color coding
- Metric cards with large, light typography
- Charts using theme color palette
- Consistent spacing and alignment

## Data Models

### Theme Configuration

```typescript
interface ThemeConfig {
  colors: {
    primary: '#3b82f6' // Blue-600
    secondary: '#06b6d4' // Cyan-600
    background: '#0F0F0F' // Dark base
    surface: 'rgba(255, 255, 255, 0.04)' // Glass morphism
    border: 'rgba(255, 255, 255, 0.1)' // Subtle borders
    text: {
      primary: '#ffffff'
      secondary: '#e5e7eb'
      tertiary: '#9ca3af'
      quaternary: '#6b7280'
    }
  }
  gradients: {
    primary: 'from-blue-600 to-cyan-600'
    background: 'from-blue-900/20 via-gray-900/10 to-cyan-900/20'
  }
  typography: {
    fontFamily: 'DM Sans'
    weights: [400, 500, 600, 700]
  }
}
```

### Component Style Tokens

```typescript
interface StyleTokens {
  spacing: {
    container: 'px-6 lg:px-16'
    section: 'py-8'
    card: 'p-6'
  }
  borderRadius: {
    card: 'rounded-lg'
    button: 'rounded-lg'
    input: 'rounded-lg'
  }
  effects: {
    backdrop: 'backdrop-blur-md'
    shadow: 'shadow-lg'
    transition: 'transition-all duration-300'
  }
}
```

## Error Handling

### Theme Fallbacks

1. **Color Fallbacks**: If gradient classes fail, fallback to solid colors
2. **Font Fallbacks**: System fonts if DM Sans fails to load
3. **Effect Fallbacks**: Standard backgrounds if backdrop-blur is unsupported
4. **Responsive Fallbacks**: Mobile-first approach with progressive enhancement

### Accessibility Considerations

1. **Contrast Ratios**: Ensure WCAG AA compliance for all text
2. **Focus States**: Visible focus indicators for keyboard navigation
3. **Color Independence**: Don't rely solely on color for information
4. **Screen Reader Support**: Proper ARIA labels and semantic markup

## Testing Strategy

### Visual Regression Testing

1. **Component Screenshots**: Capture before/after states of all components
2. **Cross-browser Testing**: Ensure consistency across Chrome, Firefox, Safari
3. **Responsive Testing**: Verify layout at different screen sizes
4. **Theme Switching**: Test light/dark theme transitions (future-proofing)

### User Experience Testing

1. **Navigation Flow**: Ensure smooth transitions between pages
2. **Interactive Elements**: Test hover states, click feedback, loading states
3. **Performance**: Measure paint times and animation smoothness
4. **Accessibility**: Screen reader testing and keyboard navigation

### Implementation Phases

#### Phase 1: Foundation
- Update background and base layout
- Implement navigation consistency
- Apply typography standards

#### Phase 2: Components
- Redesign card components
- Update tab navigation system
- Implement button and form styling

#### Phase 3: Data Visualization
- Update pipeline visualization
- Redesign metric cards
- Apply theme to charts and graphs

#### Phase 4: Polish
- Add micro-interactions
- Optimize performance
- Final accessibility review

## Technical Implementation Notes

### CSS Custom Properties

Leverage existing CSS custom properties in `globals.css` for consistent theming:

```css
.job-details-page {
  background: hsl(var(--bg-primary));
  color: hsl(var(--text-primary));
}

.glass-card {
  background: rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}
```

### Tailwind Configuration

Ensure all custom colors and gradients are properly configured in the Tailwind theme extension to maintain consistency with the existing design system.

### Component Reusability

Create reusable styled components that can be used across other pages to maintain consistency:

- `GlassCard` component
- `GradientButton` component
- `ThemeTab` component
- `MetricCard` component