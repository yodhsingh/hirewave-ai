# Design Document

## Overview

This design creates six new pages (About, Pricing, Features, Privacy, Terms, Contact) that seamlessly integrate with the existing HireWave.ai website. The design maintains visual consistency with the home page while providing unique, relevant content for each page type. All pages will use the same dark theme (#0F0F0F background), typography (DM Sans), and visual elements established by the home page.

## Architecture

### Page Structure
Each new page follows a consistent layout pattern:
- **Header**: Identical navigation bar with logo, centered navigation links, and Sign in button
- **Main Content**: Page-specific content with consistent spacing and typography
- **Footer**: New footer component with company links and legal pages
- **Background**: Same Background.svg element and styling as home page

### Navigation Enhancement
- Convert existing navigation buttons from non-functional to proper Next.js Link components
- Add active state highlighting for current page
- Maintain responsive mobile hamburger menu functionality

### Footer Addition
- Create new footer component with dark theme styling
- Include company information and legal page links
- Position footer at bottom of all pages

## Components and Interfaces

### New Components

#### 1. Footer Component (`components/layout/Footer.tsx`)
```typescript
interface FooterProps {
  className?: string;
}
```
- Dark background with subtle border
- Company branding and description
- Links to Privacy, Terms, Contact pages
- Copyright information
- Responsive grid layout

#### 2. Page Layout Component (`components/layout/PageLayout.tsx`)
```typescript
interface PageLayoutProps {
  children: React.ReactNode;
  currentPage?: string;
  className?: string;
}
```
- Wraps header, main content, and footer
- Handles background styling and responsive layout
- Manages active navigation state

### Enhanced Components

#### 1. Navigation Component (`components/layout/Navigation.tsx`)
- Extract navigation from home page into reusable component
- Add Link components for proper routing
- Include active state logic
- Maintain existing styling and responsive behavior

## Data Models

### Page Content Structure
```typescript
interface PageContent {
  title: string;
  subtitle?: string;
  sections: PageSection[];
}

interface PageSection {
  id: string;
  title: string;
  content: string | React.ReactNode;
  className?: string;
}
```

### Navigation Item
```typescript
interface NavigationItem {
  label: string;
  href: string;
  isActive?: boolean;
}
```

## Error Handling

### 404 Handling
- All new routes properly configured in Next.js app router
- Fallback to custom 404 page if needed

### Loading States
- Implement proper loading states for page transitions
- Maintain smooth navigation experience

### Responsive Breakpoints
- Ensure all pages work across mobile, tablet, and desktop
- Test navigation and footer on all screen sizes

## Testing Strategy

### Visual Consistency Testing
- Compare new pages against home page design system
- Verify typography, spacing, and color usage
- Test responsive behavior across devices

### Navigation Testing
- Verify all navigation links work correctly
- Test active state highlighting
- Confirm mobile menu functionality

### Content Testing
- Ensure all pages have appropriate, professional content
- Verify legal pages contain standard privacy/terms language
- Test contact page has proper contact information placeholders

## Page-Specific Design Details

### About Page (`/about`)
**Content Structure:**
- Hero section with company mission and vision
- Team/company story section
- Key statistics and achievements
- Call-to-action section

**Visual Elements:**
- Same background styling as home page
- Large typography for headings (72px on desktop)
- Cards with subtle borders and backdrop blur
- Motion animations for scroll-triggered content

### Pricing Page (`/pricing`)
**Content Structure:**
- Hero section with pricing overview
- Pricing tiers in card layout (Free, Pro, Enterprise)
- Feature comparison table
- FAQ section
- Contact sales CTA

**Visual Elements:**
- Pricing cards with gradient borders
- Feature checkmarks with brand colors
- Highlighted "Popular" tier
- Interactive hover states

### Features Page (`/features`)
**Content Structure:**
- Hero section highlighting key features
- Feature showcase with icons and descriptions
- Benefits section with statistics
- Integration/compatibility section

**Visual Elements:**
- Feature cards similar to home page insights section
- Icon integration with consistent styling
- Progressive disclosure of feature details
- Video/demo placeholders

### Privacy Policy Page (`/privacy`)
**Content Structure:**
- Standard privacy policy sections
- Information collection and usage
- Data protection measures
- Contact information for privacy concerns

**Visual Elements:**
- Clean, readable typography
- Proper heading hierarchy
- Subtle section dividers
- Legal document formatting

### Terms of Service Page (`/terms`)
**Content Structure:**
- Standard terms and conditions
- Service usage guidelines
- Limitation of liability
- Governing law information

**Visual Elements:**
- Similar to privacy page styling
- Clear section numbering
- Consistent spacing and typography
- Professional legal document appearance

### Contact Page (`/contact`)
**Content Structure:**
- Contact form with validation
- Company contact information
- Office locations (if applicable)
- Social media links

**Visual Elements:**
- Form styling consistent with existing UI components
- Contact cards with company information
- Map placeholder or location information
- Interactive form elements with proper focus states