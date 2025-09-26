# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is **Bodega Academy**, a React-based learning management system for employee training. It uses Vite, TypeScript, Tailwind CSS, Azure Blob Storage, and Supabase for the backend. The application supports three user roles: employees, HR staff, and admins with comprehensive training path management.

## Development Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build locally

## Architecture

### Core Technologies
- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **File Storage**: Azure Blob Storage for video and presentation uploads
- **Rich Text**: Quill.js for content editing
- **Routing**: React Router DOM v7
- **Icons**: Lucide React

### Application Structure

**Authentication Flow**: The app uses a role-based system with automatic admin detection for `admin@bodega.ma`. Authentication state is managed via the `useAuth` hook (src/hooks/useAuth.ts) with support for onboarding flow.

**Component Organization**:
- `src/components/Auth/` - Login and signup forms
- `src/components/Admin/` - Admin dashboard, user management, analytics, module creation, category management
- `src/components/Dashboard/` - Employee dashboard with category-based module browsing
- `src/components/Module/` - Module viewing, quiz functionality, video/presentation viewers
- `src/components/Layout/` - Header, main layout and shared layout components
- `src/components/Onboarding/` - Role-based onboarding flow for new employees

**Configuration & Services**:
- `src/config/` - Training paths and module categories configuration
- `src/services/` - Category and training path services
- `src/utils/` - Video embedding utilities and database migrations
- `src/lib/` - Supabase client and Azure storage integration

**Data Models** (defined in src/lib/supabase.ts):
- `UserProfile`: User data with roles, job roles, departments, and onboarding status
- `Module`: Training modules with content, video, PDF, presentations, and quiz questions
- `QuizQuestion`: Quiz structure with multiple choice answers
- `UserProgress`: Tracks user completion status and scores
- `TrainingPath`: Training path definitions with categories and ordering
- `TrainingPathQuiz`: End-of-path assessments
- `ModuleCategory`: Category system for organizing modules

### Database Schema
The Supabase database includes:
- `user_profiles` - User data, roles, job roles, departments, onboarding status
- `modules` - Training content with video/presentation support and category assignment
- `user_progress` - Completion tracking and scores
- `training_paths` - Training path definitions and categories
- `training_path_progress` - User progress through training paths
- `training_path_quizzes` - End-of-path assessments

### Key Features
- **Role-based access control** (employee/hr/admin) with job role filtering
- **Category-based module organization** with training paths
- **Rich content delivery** with video, PDF, and PowerPoint presentation support
- **Azure video upload** with progress tracking
- **Integrated quiz system** with scoring and training path assessments
- **Progress tracking and analytics** with detailed reporting
- **User management** for admins with role assignment
- **Onboarding flow** for new employees with job role selection
- **Database migration tools** for admins
- **Mobile-responsive design** with touch-optimized interface

### Job Roles & Departments (Bodega Academy Context)
**Store Operations**:
- Store Manager, Supervisor, Cashier, Sales Associate, Customer Service

**Warehouse Operations**:
- Warehouse Manager, Inventory Specialist, Picker/Packer, Receiving Clerk, Shipping Clerk

**Corporate Functions**:
- HR, Administration, Finance, Marketing, IT Support

## Configuration Files

- **TypeScript**: Uses project references with separate configs for app and build tools
- **ESLint**: Configured for React/TypeScript with recommended rules
- **Tailwind**: Standard configuration with PostCSS and line-clamp utilities
- **Vite**: Optimized for React with lucide-react exclusion

## Environment Variables

Required environment variables for Bodega Academy:
- `VITE_SUPABASE_URL` - Your Bodega Academy Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Bodega Academy Supabase anonymous key
- `VITE_AZURE_STORAGE_ACCOUNT` - Azure Storage account name (optional for video uploads)
- `VITE_AZURE_SAS_TOKEN` - Azure Storage SAS token (optional for video uploads)

Copy `.env.example` to `.env` and update with your Bodega Academy credentials.

## Database Setup

Create a new Supabase project for Bodega Academy and run the migration files in the `migrations/` folder:
- `categories_migration.sql` - Create training path categories
- `add_onboarding_columns.sql` - Add onboarding support
- `create_training_paths.sql` - Create training path system

The admin account uses: `admin@bodega.ma`