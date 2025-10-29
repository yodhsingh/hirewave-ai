# AI-Powered Interview Screening Platform 🚀

An innovative platform that automates technical screening through AI-powered phone interviews, helping HR teams manage high-volume recruitment efficiently.

## 🌟 Features

### Core Features
- **AI Phone Interviews**: Automated voice-based technical screening calls
- **Multi-Step Job Creation**: Intuitive wizard for creating job postings
- **Candidate Pipeline**: Visual tracking of candidates through interview stages
- **Real-time Analytics**: AI scoring and performance metrics
- **Bulk Invitations**: Send interview invites to multiple candidates
- **Dark Theme UI**: Modern, professional interface with glass morphism effects

### Key Components
- **HR Dashboard**: Manage active jobs and view key metrics
- **Job Details Page**: Comprehensive job management with candidate pipeline
- **Candidate Review**: Detailed view with AI transcripts and scoring
- **Question Builder**: Create custom interview questions with AI suggestions

## 🛠️ Tech Stack

- **Frontend Framework**: Next.js 15 (App Router)
- **React Version**: React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS v3.4
- **UI Components**: shadcn/ui with Radix UI
- **State Management**: Zustand
- **Forms**: React Hook Form with Zod validation
- **Data Fetching**: TanStack Query (React Query)
- **Animations**: Framer Motion
- **Icons**: Lucide React

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js**: Version 18.0 or higher ([Download](https://nodejs.org/))
- **npm**: Version 9.0 or higher (comes with Node.js)
- **Git**: For version control ([Download](https://git-scm.com/))

## 🚀 Getting Started

### 1. Clone the Repository

```bash
# Clone the repository
git clone https://github.com/your-org/soft-engg-project-sept-2025-se-SEP-15.git

# Navigate to the frontend directory
cd soft-engg-project-sept-2025-se-SEP-15/frontend
```

### 2. Install Dependencies

```bash
# Install all required packages
npm install

# If you encounter any issues, try:
npm install --legacy-peer-deps
```

### 3. Run the Development Server

```bash
# Start the development server
npm run dev

# The application will be available at:
# http://localhost:3000
```

### 4. Build for Production

```bash
# Create an optimized production build
npm run build

# Run the production build locally
npm start
```

## 📁 Project Structure

```
frontend/
├── app/                    # Next.js App Router pages
│   ├── hr/                # HR portal pages
│   │   ├── dashboard/     # HR dashboard
│   │   ├── jobs/         # Job management
│   │   └── candidates/   # Candidate review
│   └── api/              # API routes (mock endpoints)
├── components/           # React components
│   ├── ui/              # Reusable UI components
│   └── hr/              # HR-specific components
├── lib/                 # Utility functions and services
│   ├── api/            # API client
│   ├── mock/           # Mock data and store
│   └── schemas/        # Validation schemas
├── types/              # TypeScript type definitions
└── public/            # Static assets
```

## 🎯 Key Pages & Navigation

### Landing Page (`/`)
- Modern landing page with animated hero section
- Feature highlights and call-to-action

### HR Dashboard (`/hr/dashboard`)
- View active jobs with candidate counts
- Real-time metrics and statistics
- Quick access to job management

### Create New Job (`/hr/jobs/new`)
- 3-step wizard: Job Details → Questions → Review
- AI-powered question generation
- Support for phone, video, text, and code questions

### Job Details (`/hr/jobs/[id]`)
- Candidate pipeline visualization
- Invite candidates functionality
- Interview questions overview
- Analytics and metrics

### Candidate Review (`/hr/candidates/[id]`)
- AI phone interview transcripts
- Audio playback simulation
- AI scoring breakdown
- Interview responses

## 🎨 UI Features

### Dark Theme
The entire application uses a dark theme with:
- Black backgrounds with gradient overlays
- Glass morphism effects
- Purple-blue gradient accents
- High contrast for readability

### Responsive Design
- Mobile-first approach
- Adaptive layouts for all screen sizes
- Touch-friendly interactions

## 👥 Mock Data

The application uses mock data including:

### Core Team Members (IIT Madras)
- Hiya Syal
- Parmeet Singh
- Shubham Tiwari
- Akshit Mittal
- Ravina
- Sidhaarth Shree
- Dalyodh Singh
- Akash Kumar

### Job Titles
- Data Scientist
- Senior Software Engineer
- Machine Learning Engineer
- DevOps Engineer
- Product Manager - AI/ML
- And more tech-focused roles

### Locations
- New Delhi
- Mumbai
- Bangalore
- Chennai
- Hyderabad
- Remote

## 🧪 Available Scripts

```bash
# Development
npm run dev          # Start development server

# Building
npm run build        # Create production build
npm start           # Run production build

# Code Quality
npm run lint        # Run ESLint
npm run lint:fix    # Fix ESLint issues
npm run type-check  # Run TypeScript checks

# Testing (if configured)
npm test           # Run tests
```

## 🔧 Configuration Files

- `next.config.mjs` - Next.js configuration
- `tailwind.config.ts` - Tailwind CSS configuration
- `tsconfig.json` - TypeScript configuration
- `.eslintrc.json` - ESLint rules
- `package.json` - Dependencies and scripts

## 📦 Key Dependencies

### Core
- `next`: 15.0.0 - React framework
- `react`: 19.0.0-rc - UI library
- `typescript`: ^5 - Type safety

### UI/UX
- `tailwindcss`: 3.4.0 - Utility-first CSS
- `framer-motion`: ^11 - Animations
- `lucide-react`: ^0.344.0 - Icons
- `@radix-ui/*`: UI primitives

### Forms & Validation
- `react-hook-form`: ^7.49.3 - Form handling
- `zod`: ^3.22.4 - Schema validation
- `@hookform/resolvers`: ^3.3.4 - Validation resolvers

### State & Data
- `zustand`: ^4.5.0 - State management
- `@tanstack/react-query`: ^5.20.2 - Data fetching
- `@faker-js/faker`: ^8.4.0 - Mock data generation

## 🐛 Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Kill process on port 3000
   npx kill-port 3000
   # Or use a different port
   npm run dev -- -p 3001
   ```

2. **Module Not Found Errors**
   ```bash
   # Clear cache and reinstall
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **TypeScript Errors**
   ```bash
   # Check for type errors
   npx tsc --noEmit
   ```

4. **Build Failures**
   ```bash
   # Clear Next.js cache
   rm -rf .next
   npm run build
   ```

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Run lint and type checks
4. Submit a pull request

## 📝 Environment Variables

Currently, the application uses mock data and doesn't require environment variables. For production deployment, you may need:

```env
# .env.local (create this file)
NEXT_PUBLIC_API_URL=your-api-url
NEXT_PUBLIC_APP_URL=your-app-url
```

## 🚦 Development Workflow

1. **Start Development**: `npm run dev`
2. **Make Changes**: Edit files in `app/`, `components/`, etc.
3. **Check Lint**: `npm run lint`
4. **Test Build**: `npm run build`
5. **Commit Changes**: Use Git

## 📱 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 🎯 Main User Flows

### HR User Journey
1. Land on homepage → Click "Get Started"
2. Navigate to HR Dashboard
3. Click "Create New Job"
4. Fill job details → Add questions → Review & Publish
5. View job in Active Jobs
6. Click job to see details
7. Invite candidates via email
8. Review candidate responses and AI scores

### Key Features to Explore
- **Create a Job**: Try the 3-step wizard
- **View Candidates**: Check the pipeline visualization
- **Review Responses**: See AI transcripts and scoring
- **Invite Candidates**: Test bulk invitation feature

## 💡 Tips for New React Developers

1. **Component Structure**: Components are in `/components` folder
2. **Pages**: Each file in `/app` becomes a route
3. **State Management**: Zustand stores are in `/lib/store`
4. **Styling**: Uses Tailwind CSS classes (e.g., `className="bg-black text-white"`)
5. **Mock Data**: Check `/lib/mock/data.ts` for data structure

## 📞 Support

For issues or questions:
- Check existing issues on GitHub
- Review the documentation
- Contact the development team

## 📄 License

This project is part of the IIT Madras Software Engineering course.

---

**Built with ❤️ by the IIT Madras Team**