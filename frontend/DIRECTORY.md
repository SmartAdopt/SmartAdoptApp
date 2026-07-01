# Frontend Directory Structure

```text
frontend/ - Root directory for the web application frontend
├── .gitignore - Specifies intentionally untracked files to ignore in Git
├── .storybook/ - Configuration files for Storybook UI components explorer
│   ├── main.ts
│   └── preview.ts
├── dist/ - Compiled and minified production build files
├── node_modules/ - Installed project dependencies and libraries
├── storybook-static/ - Static build of the Storybook documentation
├── Dockerfile - Instructions for building the Docker container
├── README.md - Main project documentation file
├── db.json - Mock database file for local development
├── debug-storybook.log - Log file for Storybook debugging
├── eslint.config.js - Configuration for ESLint code linter
├── index.html - Main HTML template for the application
├── nginx.conf - Nginx web server configuration
├── package-lock.json - Exact dependency versions tree
├── package.json - Project metadata, scripts, and dependencies list
├── public/ - Static assets served directly to the browser
│   ├── adopt.svg
│   ├── apple.svg
│   ├── apple_g.svg
│   ├── cat.svg
│   ├── dog.svg
│   ├── facebook.svg
│   ├── favicon.svg
│   ├── google.svg
│   ├── heart.svg
│   ├── home.svg
│   ├── icons.svg
│   └── logo.svg
├── readmi.md
├── src/ - Main source code directory for the application
│   ├── App.tsx - Main application component wrapping the app
│   ├── assets/ - Static files like images, icons, and fonts
│   │   ├── hero.png
│   │   ├── placeholders/
│   │   │   ├── article.svg
│   │   │   ├── cat.svg
│   │   │   └── dog.svg
│   │   ├── react.svg
│   │   └── vite.svg
│   ├── components/ - Reusable UI components
│   │   ├── atoms/
│   │   │   ├── Logo.stories.tsx
│   │   │   ├── Logo.tsx
│   │   │   ├── QuickActionButton.tsx
│   │   │   ├── SidebarItem.tsx
│   │   │   ├── SocialButton.tsx
│   │   │   └── StatCard.tsx
│   │   ├── molecules/
│   │   │   ├── AdminActionCard.tsx
│   │   │   ├── AdminSummaryCard.tsx
│   │   │   ├── ArticleCard.tsx
│   │   │   ├── AuthToggle.tsx
│   │   │   ├── CategoryButton.tsx
│   │   │   ├── EventCard.tsx
│   │   │   ├── FeatureInfoCard.tsx
│   │   │   ├── NotificationItem.tsx
│   │   │   ├── PetCard.tsx
│   │   │   ├── PetSearchFilter.tsx
│   │   │   ├── ProfileMenu.tsx
│   │   │   ├── SocialLoginGroup.tsx
│   │   │   ├── SwipeablePetCard.css
│   │   │   └── SwipeablePetCard.tsx
│   │   ├── organisms/
│   │   │   ├── AdminNavbar.stories.tsx
│   │   │   ├── AdminNavbar.tsx
│   │   │   ├── AdminWelcomeBanner.stories.tsx
│   │   │   ├── AdminWelcomeBanner.tsx
│   │   │   ├── AdopterSidebar.stories.tsx
│   │   │   ├── AdopterSidebar.tsx
│   │   │   ├── ArticlesSection.stories.tsx
│   │   │   ├── ArticlesSection.tsx
│   │   │   ├── CommunityImpact.stories.tsx
│   │   │   ├── CommunityImpact.tsx
│   │   │   ├── DonationPanel.stories.tsx
│   │   │   ├── DonationPanel.tsx
│   │   │   ├── EventsPanel.stories.tsx
│   │   │   ├── EventsPanel.tsx
│   │   │   ├── FeaturedPetsSection.stories.tsx
│   │   │   ├── FeaturedPetsSection.tsx
│   │   │   ├── Footer.stories.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── HeroSection.stories.tsx
│   │   │   ├── HeroSection.tsx
│   │   │   ├── HowItWorksSection.stories.tsx
│   │   │   ├── HowItWorksSection.tsx
│   │   │   ├── ImpactSection.stories.tsx
│   │   │   ├── ImpactSection.tsx
│   │   │   ├── LeftAuthSidebar.stories.tsx
│   │   │   ├── LeftAuthSidebar.tsx
│   │   │   ├── LoginForm.stories.tsx
│   │   │   ├── LoginForm.tsx
│   │   │   ├── Navbar.stories.tsx
│   │   │   ├── Navbar.tsx
│   │   │   ├── NotificationsPanel.stories.tsx
│   │   │   ├── NotificationsPanel.tsx
│   │   │   ├── PetGrid.stories.tsx
│   │   │   ├── PetGrid.tsx
│   │   │   ├── PreferencesForm.stories.tsx
│   │   │   ├── PreferencesForm.tsx
│   │   │   ├── QuickActionsPanel.stories.tsx
│   │   │   ├── QuickActionsPanel.tsx
│   │   │   ├── RegisterForm.stories.tsx
│   │   │   ├── RegisterForm.tsx
│   │   │   ├── SharePanel.stories.tsx
│   │   │   ├── SharePanel.tsx
│   │   │   ├── SuitabilitySurvey.stories.tsx
│   │   │   └── SuitabilitySurvey.tsx
│   │   └── templates/
│   │       ├── AdminLayout.tsx
│   │       ├── AdopterLayout.tsx
│   │       ├── AuthTemplate.tsx
│   │       └── MainLayout.tsx
│   ├── context/ - React Context providers for global state
│   │   ├── AuthContext.tsx
│   │   └── PetContext.tsx
│   ├── hooks/ - Custom React hooks for shared logic
│   │   ├── useAuth.ts
│   │   └── useImagePreloader.ts
│   ├── index.css - Global CSS styles for the application
│   ├── main.tsx - Entry point for rendering the app to the DOM
│   ├── pages/ - Top-level components representing application views
│   │   ├── HomePage.tsx
│   │   ├── InfoPage.tsx
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   ├── admin/
│   │   │   ├── AdminAddPetPage.tsx
│   │   │   ├── AdminDashboard.tsx
│   │   │   └── AdminPetListPage.tsx
│   │   └── adopter/
│   │       ├── AdopterDashboard.tsx
│   │       ├── AdopterExplore.tsx
│   │       ├── AdopterFavorites.tsx
│   │       ├── AdopterProfile.tsx
│   │       ├── AdopterRequests.tsx
│   │       ├── AdopterSuitability.tsx
│   │       ├── AdopterSuitabilitySurveyPage.tsx
│   │       ├── ArticlePage.tsx
│   │       └── PetProfilePage.tsx
│   ├── routes/ - Application routing configuration
│   │   ├── AppRouter.tsx
│   │   └── guards/
│   │       └── ProtectedRoute.tsx
│   ├── services/ - API communication and external service integrations
│   │   ├── apiClient.ts
│   │   ├── auth.service.ts
│   │   ├── dashboard.service.ts
│   │   └── pets.service.ts
│   ├── theme/ - Styling, colors, and UI theme configuration
│   │   └── theme.ts
│   ├── types/ - TypeScript type definitions and interfaces
│   │   ├── auth.types.ts
│   │   ├── dashboard.types.ts
│   │   ├── pets.types.ts
│   │   └── suitability.types.ts
│   └── utils/ - Helper functions and common utilities
│       ├── auth.adapters.ts
│       ├── helpers.ts
│       ├── logger.ts
│       └── pets.adapters.ts
├── tests/ - Automated tests for the application
│   ├── basic.test.ts
│   └── setup.ts
├── tsconfig.app.json - TypeScript configuration for application code
├── tsconfig.json - Base TypeScript compiler options
├── tsconfig.node.json - TypeScript configuration for Node environments
└── vite.config.ts - Configuration for Vite build tool and dev server
```
