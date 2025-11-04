# Requirements Document

## Introduction

The job details page at `/hr/jobs/[id]` currently has inconsistent styling, theme, font, and color scheme compared to the home screen and overall application design. This feature aims to standardize the visual design language across the application by updating the job details page to match the home screen's modern, clean aesthetic with consistent typography, color palette, and component styling.

## Requirements

### Requirement 1

**User Story:** As an HR manager, I want the job details page to have consistent visual styling with the home screen, so that the application feels cohesive and professional.

#### Acceptance Criteria

1. WHEN I navigate to the job details page THEN the background SHALL use the same dark theme (#0F0F0F) as the home screen
2. WHEN I view the page THEN the typography SHALL match the home screen's font weights and sizes
3. WHEN I see navigation elements THEN they SHALL use the same styling patterns as the home screen
4. WHEN I view cards and components THEN they SHALL use consistent border radius, backdrop blur, and transparency effects
5. WHEN I interact with buttons THEN they SHALL use the same gradient and hover effects as the home screen

### Requirement 2

**User Story:** As an HR manager, I want the tab navigation (Overview, Candidates, Questions, Analytics) to follow the application's design system, so that it feels integrated with the overall user experience.

#### Acceptance Criteria

1. WHEN I view the tab navigation THEN it SHALL use consistent spacing, typography, and color scheme
2. WHEN I click on tabs THEN the active state SHALL use the application's primary gradient colors
3. WHEN I hover over tabs THEN they SHALL show appropriate hover states with smooth transitions
4. WHEN I view tab content THEN it SHALL maintain consistent padding and layout patterns

### Requirement 3

**User Story:** As an HR manager, I want all cards and panels on the job details page to use the application's glass morphism design pattern, so that the visual hierarchy is clear and modern.

#### Acceptance Criteria

1. WHEN I view cards THEN they SHALL use `bg-white/[0.04]` background with backdrop blur effects
2. WHEN I see borders THEN they SHALL use `border-white/10` for subtle definition
3. WHEN I view elevated elements THEN they SHALL use appropriate shadow and glow effects
4. WHEN I see the candidate pipeline visualization THEN it SHALL use consistent rounded corners and transparency

### Requirement 4

**User Story:** As an HR manager, I want the color scheme to match the home screen's palette, so that the branding is consistent throughout the application.

#### Acceptance Criteria

1. WHEN I view text elements THEN primary text SHALL be white, secondary text SHALL be gray-300/400
2. WHEN I see status badges THEN they SHALL use the defined color system for different states
3. WHEN I view buttons THEN they SHALL use the primary gradient (blue-600 to cyan-600) for primary actions
4. WHEN I see interactive elements THEN they SHALL use consistent hover and active states

### Requirement 5

**User Story:** As an HR manager, I want the page header and navigation to match the home screen's layout and styling, so that navigation feels seamless.

#### Acceptance Criteria

1. WHEN I view the page header THEN it SHALL use the same background treatment as the home screen
2. WHEN I see the breadcrumb navigation THEN it SHALL follow the home screen's navigation patterns
3. WHEN I view user profile elements THEN they SHALL match the home screen's profile dropdown styling
4. WHEN I see notification elements THEN they SHALL use consistent icon styling and positioning

### Requirement 6

**User Story:** As an HR manager, I want the data visualization elements (charts, progress bars, metrics) to use the application's color palette, so that they integrate seamlessly with the overall design.

#### Acceptance Criteria

1. WHEN I view progress bars THEN they SHALL use the primary gradient colors
2. WHEN I see charts and graphs THEN they SHALL use the defined color system for data representation
3. WHEN I view metric cards THEN they SHALL follow the glass morphism design pattern
4. WHEN I see status indicators THEN they SHALL use semantic colors from the theme system