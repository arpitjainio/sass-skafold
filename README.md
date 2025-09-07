# SaaS Skafold - Complete SaaS Starter Template

A production-ready, full-stack SaaS starter template built with modern technologies. Jumpstart your SaaS application with authentication, subscription management, user roles, and a beautiful dashboard - all configured and ready to deploy.

## 🚀 What's Included

### Core Features
- **🔐 Complete Authentication System** - JWT-based auth with secure password hashing
- **💳 Stripe Integration** - Ready-to-use subscription management with webhooks
- **👥 User Management** - Role-based access control (RBAC) system
- **📊 Admin Dashboard** - Comprehensive admin panel for user and subscription management
- **🎨 Modern UI/UX** - Beautiful, responsive design with Tailwind CSS and Radix UI
- **📱 Mobile-First Design** - Optimized for all device sizes
- **🔒 Security First** - Built-in security best practices and validation

### Applications & Packages

#### Apps
- **`web`** - Next.js 15 frontend application with React 19
- **`api`** - NestJS backend API with TypeScript

#### Packages
- **`@repo/ui`** - Reusable UI component library with Radix UI primitives
- **`@repo/design-system`** - Design tokens and styling system
- **`@repo/utils`** - Shared utility functions
- **`@repo/config-eslint`** - ESLint configurations for the monorepo
- **`@repo/config-typescript`** - TypeScript configurations

## 🛠 Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **React 19** - Latest React with concurrent features
- **TypeScript** - Type-safe development
- **Tailwind CSS 4** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **Lucide React** - Beautiful icons

### Backend
- **NestJS** - Scalable Node.js server framework
- **Prisma** - Modern database ORM
- **PostgreSQL** - Robust relational database
- **JWT** - Secure authentication tokens
- **Stripe** - Payment processing and subscriptions
- **Winston** - Logging system

### Development & Deployment
- **Turborepo** - High-performance monorepo build system
- **pnpm** - Fast, disk space efficient package manager
- **ESLint & Prettier** - Code quality and formatting
- **Jest** - Testing framework

## 🏗 Project Structure

```
saas-skafold/
├── apps/
│   ├── api/                 # NestJS backend API
│   │   ├── src/
│   │   │   ├── auth/        # Authentication module
│   │   │   ├── user/        # User management
│   │   │   ├── subscription/ # Subscription handling
│   │   │   ├── admin/       # Admin functionality
│   │   │   └── common/      # Shared utilities
│   │   └── package.json
│   └── web/                 # Next.js frontend
│       ├── src/
│       │   ├── app/         # App Router pages
│       │   ├── components/  # React components
│       │   ├── lib/         # Utilities and hooks
│       │   └── contexts/    # React contexts
│       └── package.json
├── packages/
│   ├── ui/                  # UI component library
│   ├── design-system/       # Design tokens
│   ├── utils/               # Shared utilities
│   └── config-*/            # Shared configurations
├── prisma/
│   └── schema.prisma        # Database schema
└── package.json
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** >= 18
- **pnpm** (recommended) or npm/yarn
- **PostgreSQL** database
- **Stripe** account (for payments)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd saas-skafold
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   # Copy the example environment file
   cp apps/api/env.example apps/api/.env
   
   # Edit the .env file with your configuration
   nano apps/api/.env
   ```

4. **Configure your environment variables**
   ```env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/saas_skafold"
   
   # JWT
   JWT_SECRET="your-super-secret-jwt-key"
   
   # Stripe
   STRIPE_SECRET_KEY="sk_test_..."
   STRIPE_WEBHOOK_SECRET="whsec_..."
   
   # App
   NODE_ENV="development"
   PORT=3001
   ```

5. **Set up the database**
   ```bash
   # Generate Prisma client
   pnpm prisma generate
   
   # Run database migrations
   pnpm prisma migrate dev
   
   # (Optional) Seed the database
   pnpm --filter api setup
   ```

6. **Start the development servers**
   ```bash
   # Start all applications
   pnpm dev
   
   # Or start individually
   pnpm --filter web dev    # Frontend on http://localhost:3000
   pnpm --filter api dev    # Backend on http://localhost:3001
   ```

### First Steps

1. **Visit the application** at `http://localhost:3000`
2. **Create an admin user** using the setup script or registration
3. **Configure Stripe** webhooks for subscription events
4. **Customize** the branding and styling to match your brand

## 📋 Available Scripts

### Root Level
```bash
pnpm dev          # Start all applications in development
pnpm build        # Build all applications
pnpm lint         # Lint all packages
pnpm format       # Format code with Prettier
pnpm check-types  # Type check all packages
```

### Individual Applications
```bash
# API (Backend)
pnpm --filter api dev        # Start API server
pnpm --filter api build      # Build API
pnpm --filter api setup      # Run database setup

# Web (Frontend)
pnpm --filter web dev        # Start Next.js dev server
pnpm --filter web build      # Build Next.js app
pnpm --filter web lint       # Lint frontend code
```

## 🎯 Key Features Explained

### Authentication System
- Secure JWT-based authentication
- Password hashing with bcrypt
- Protected routes and API endpoints
- Role-based access control

### Subscription Management
- Stripe integration for payments
- Multiple subscription tiers
- Webhook handling for real-time updates
- Subscription status tracking

### User Management
- Complete CRUD operations for users
- Role assignment and management
- User profile management
- Admin dashboard for user oversight

### Modern UI/UX
- Responsive design that works on all devices
- Accessible components with Radix UI
- Consistent design system
- Dark/light mode support (configurable)

## 🚀 Deployment

### Environment Setup
1. Set up a PostgreSQL database (recommended: Supabase, Railway, or Neon)
2. Configure environment variables for production
3. Set up Stripe webhooks for your production domain
4. Deploy to your preferred platform

### Recommended Platforms
- **Frontend**: Vercel, Netlify, or AWS Amplify
- **Backend**: Railway, Render, or AWS
- **Database**: Supabase, Railway, or Neon

### Build for Production
```bash
# Build all applications
pnpm build

# The built applications will be in:
# - apps/web/.next/ (Next.js build)
# - apps/api/dist/ (NestJS build)
```

## 💡 Benefits

### For Developers
- **⚡ Rapid Development** - Start building features immediately, not infrastructure
- **🔧 Production Ready** - Battle-tested patterns and security practices
- **📚 Well Documented** - Comprehensive documentation and examples
- **🎨 Modern Stack** - Latest technologies and best practices
- **🔒 Security First** - Built-in security measures and validation

### For Businesses
- **💰 Faster Time to Market** - Launch your SaaS in weeks, not months
- **📈 Scalable Architecture** - Built to handle growth from day one
- **💳 Revenue Ready** - Subscription billing integrated from the start
- **👥 User Management** - Complete user and admin functionality
- **🎯 Focus on Value** - Spend time on your unique features, not boilerplate

### For Teams
- **🔄 Monorepo Benefits** - Shared code and consistent tooling
- **📦 Component Library** - Reusable UI components across projects
- **🛠 Developer Experience** - Hot reload, type safety, and great tooling
- **📊 Admin Tools** - Built-in admin dashboard for user management

## 📄 License & Usage

This project is licensed under a **Commercial License**. See the [LICENSE](LICENSE) file for details.

### Usage Terms
- ✅ **Single Project Use** - Use for one commercial project
- ✅ **Modification Allowed** - Customize and extend as needed
- ✅ **Commercial Use** - Use in commercial applications
- ❌ **Resale Prohibited** - Cannot resell or redistribute the template
- ❌ **Multiple Projects** - Requires separate license for each project

### Support
- 📧 Email support for setup and configuration
- 📚 Comprehensive documentation
- 🔄 Regular updates and improvements

## 🤝 Contributing

While this is a commercial product, we welcome feedback and suggestions. Please contact us through our support channels.

## 📞 Support

Need help getting started? Have questions about customization?

- 📧 **Email**: Contact us at [i-ayana@outlook.com](mailto:i-ayana@outlook.com)
- 💬 **Discord**: Join our Discord [server](https://discord.gg/wFFndB6D)
- 📖 **Documentation**: [Coming soon]

---

**Ready to launch your SaaS?** Get started with SaaS Skafold today and focus on what makes your product unique! 🚀
