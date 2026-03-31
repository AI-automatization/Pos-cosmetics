---
description: Next.js frontend rules for RAOS Admin Panel
paths:
  - "apps/web/**"
---

# Next.js Admin Panel Rules

## Stack
- Next.js 15 + React 19 + Tailwind 4
- React Query (TanStack) for data fetching
- Zustand for client state
- React Hook Form + Zod for forms
- Recharts for charts

## Conventions
- App Router (not Pages Router)
- Server Components by default — `"use client"` faqat interaktiv component uchun
- API calls: `axios` instance with base URL from `NEXT_PUBLIC_API_URL`
- Port: 3001 (dev), env configurable

## Styling
- Tailwind classes — inline styles TAQIQLANGAN
- `clsx` + `tailwind-merge` for conditional classes
- Responsive: mobile-first breakpoints

## Error handling
- Error Boundary for UI crashes
- API interceptor: 5xx → client error endpoint
- Toast notifications: `sonner`

## Performance
- Image optimization: next/image
- Dynamic imports for heavy components
- React Query cache: staleTime, gcTime tuning
