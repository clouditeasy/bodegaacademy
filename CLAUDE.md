# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is **Bodega Academy**, a React-based learning management system for employee training. It uses Vite, TypeScript, Tailwind CSS, and Supabase for the backend. The application supports three user roles: employees, HR staff, and admins.

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
- **Routing**: React Router DOM v7
- **Icons**: Lucide React

### Application Structure

**Authentication Flow**: The app uses a role-based system with automatic admin detection for `admin@bodega-academy.com`. Authentication state is managed via the `useAuth` hook (src/hooks/useAuth.ts).

**Component Organization**:
- `src/components/Auth/` - Login and signup forms
- `src/components/Admin/` - Admin dashboard, user management, analytics, module creation
- `src/components/Dashboard/` - Employee dashboard
- `src/components/Module/` - Module viewing and quiz functionality
- `src/components/Layout/` - Header and shared layout components

**Data Models** (defined in src/lib/supabase.ts):
- `UserProfile`: User data with roles (employee/admin/hr)
- `Module`: Training modules with content, video, PDF, and quiz questions
- `QuizQuestion`: Quiz structure with multiple choice answers
- `UserProgress`: Tracks user completion status and scores

### Database Schema
The Supabase database includes:
- `user_profiles` - User data and roles
- `modules` - Training content
- `user_progress` - Completion tracking and scores

### Key Features
- Role-based access control (employee/hr/admin)
- Module content delivery with video/PDF support
- Integrated quiz system with scoring
- Progress tracking and analytics
- User management for admins

## Configuration Files

- **TypeScript**: Uses project references with separate configs for app and build tools
- **ESLint**: Configured for React/TypeScript with recommended rules
- **Tailwind**: Standard configuration with PostCSS
- **Vite**: Optimized for React with lucide-react exclusion

## Environment Variables

Required Supabase environment variables for Bodega Academy:
- `VITE_SUPABASE_URL` - Your Bodega Academy Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Bodega Academy Supabase anonymous key

Copy `.env.example` to `.env` and update with your Bodega Academy database credentials.

## Database Setup

Create a new Supabase project for Bodega Academy with the following tables:
- `user_profiles` - User data and roles
- `modules` - Training content
- `user_progress` - Completion tracking and scores

The admin account uses: `admin@bodega-academy.com`