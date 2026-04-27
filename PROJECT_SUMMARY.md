# DuvSos - Project Summary

## Overview
Personal productivity application built with Next.js 16, React 19, TypeScript, Tailwind CSS, Prisma, and PostgreSQL.

## Tech Stack
- **Framework:** Next.js 16.1.6 (App Router)
- **UI:** React 19.2.3, Tailwind CSS 4
- **Database:** PostgreSQL with Prisma 7.4.0
- **Auth:** jose (JWT), bcryptjs
- **Testing:** vitest, jsdom, @testing-library
- **Language:** TypeScript

## Database Schema (Prisma)
Models: User, Habit, Completion, Checklist, ChecklistItem, ChecklistCategory, Todo, TodoCategory, Reminder

## Pages/Routes
- `/` - Dashboard
- `/habits` - Habit tracking
- `/todos` - Todo management
- `/checklists` - Checklist management
- `/reminders` - Reminders
- `/settings` - User settings
- `/support` - Support page
- `/login` - Authentication

## Key Features
- Habit tracking with daily completions
- Todo management with categories, priorities, due dates, subtasks
- Checklist management with items and categories
- Reminders with due dates and priorities
- User settings (theme, checklist alerts)

## Configuration
- Database: PostgreSQL (configured via Prisma)
- Scripts: `npm run dev`, `npm run build`, `npm run db:sync`, `npm run db:migrate`, `npm run test`