# SmartPromptIQ Academy - Admin Dashboard Architecture

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                     ADMIN DASHBOARD (Frontend)                       │
│                    client/src/components/                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │              AdminDashboard.tsx (Main)                       │   │
│  │  ┌────────────────────────────────────────────────────┐     │   │
│  │  │  Tabs Navigation                                    │     │   │
│  │  │  - Overview | Users | Payments | Tokens            │     │   │
│  │  │  - Security | Emails | System | [ACADEMY] ←──────┐ │     │   │
│  │  └────────────────────────────────────────────────────┘ │     │   │
│  │                                                       │ │     │   │
│  │  ┌────────────────────────────────────────────────────┼─┐   │   │
│  │  │  ACADEMY TAB CONTENT                              │ │   │   │
│  │  │  ┌──────────────────────────────────────────────┐ │ │   │   │
│  │  │  │  Statistics Cards (4)                        │ │ │   │   │
│  │  │  │  • Total Courses    • Total Enrollments      │ │ │   │   │
│  │  │  │  • Completion Rate  • Certificates           │ │ │   │   │
│  │  │  └──────────────────────────────────────────────┘ │ │   │   │
│  │  │  ┌──────────────────────────────────────────────┐ │ │   │   │
│  │  │  │  Top Performing Courses                       │ │ │   │   │
│  │  │  │  1. Course Name | 1,234 enrollments          │ │ │   │   │
│  │  │  │  2. Course Name | 892 enrollments            │ │ │   │   │
│  │  │  └──────────────────────────────────────────────┘ │ │   │   │
│  │  │  ┌──────────────────────────────────────────────┐ │ │   │   │
│  │  │  │  Recent Enrollment Activity                   │ │ │   │   │
│  │  │  │  • Enrollment 1 | 2025-01-06 | active        │ │ │   │   │
│  │  │  │  • Enrollment 2 | 2025-01-05 | completed     │ │ │   │   │
│  │  │  └──────────────────────────────────────────────┘ │ │   │   │
│  │  │  ┌──────────────────────────────────────────────┐ │ │   │   │
│  │  │  │  Growth Metrics (Last 30 Days)               │ │ │   │   │
│  │  │  │  New Enrollments | Completion | Lessons      │ │ │   │   │
│  │  │  └──────────────────────────────────────────────┘ │ │   │   │
│  │  └────────────────────────────────────────────────────┘ │   │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                       │
│  Alternative Component:                                              │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  AdminDashboardAcademy.tsx (Standalone)                      │   │
│  │  - Same features as Academy tab                              │   │
│  │  - Can be used independently                                 │   │
│  │  - Includes refresh functionality                            │   │
│  └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
                               │
                               │ HTTP Requests
                               │ (JWT Authentication)
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         BACKEND API LAYER                            │
│                     backend/src/routes/                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  academy.ts (Academy Routes)                                 │   │
│  │                                                               │   │
│  │  GET /api/academy/admin/stats ──┐                            │   │
│  │  ├─ Requires: authenticate()    │                            │   │
│  │  ├─ Checks: user.role === ADMIN │                            │   │
│  │  └─ Returns: {                  │                            │   │
│  │      overview: {                │                            │   │
│  │        totalCourses,            │                            │   │
│  │        publishedCourses,        │                            │   │
│  │        totalEnrollments,        │                            │   │
│  │        activeEnrollments,       │                            │   │
│  │        completedCourses,        │                            │   │
│  │        totalCertificates,       │                            │   │
│  │        totalLessons,            │                            │   │
│  │        completionRate,          │                            │   │
│  │        recentEnrollments        │                            │   │
│  │      },                         │                            │   │
│  │      recentActivity: [],        │                            │   │
│  │      topCourses: []             │                            │   │
│  │    }                            │                            │   │
│  │                                 │                            │   │
│  │  Other Academy Endpoints:       │                            │   │
│  │  • GET /api/academy/courses     │                            │   │
│  │  • GET /api/academy/my-courses  │                            │   │
│  │  • POST /api/academy/enroll     │                            │   │
│  │  • GET /api/academy/lesson/:id  │                            │   │
│  │  • POST /api/academy/progress   │                            │   │
│  │  • GET /api/academy/dashboard   │                            │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  auth.ts (Authentication Middleware)                         │   │
│  │  • Validates JWT token                                       │   │
│  │  • Injects user into request                                 │   │
│  │  • Checks admin role                                         │   │
│  └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
                               │
                               │ Database Queries
                               │ (Prisma ORM)
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        DATABASE LAYER                                │
│                     backend/prisma/                                  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │  SQLite Database (dev.db)                                      │ │
│  │                                                                 │ │
│  │  Academy Tables:                                               │ │
│  │  ┌──────────────────────────────────────────────────────────┐ │ │
│  │  │  academy_courses                                          │ │ │
│  │  │  • id, title, description, slug, category                │ │ │
│  │  │  • difficulty, duration, accessTier, priceUSD            │ │ │
│  │  │  • isPublished, enrollmentCount, averageRating           │ │ │
│  │  └──────────────────────────────────────────────────────────┘ │ │
│  │  ┌──────────────────────────────────────────────────────────┐ │ │
│  │  │  academy_lessons                                          │ │ │
│  │  │  • id, courseId, title, content, videoUrl               │ │ │
│  │  │  • duration, order, isPublished, isFree                  │ │ │
│  │  └──────────────────────────────────────────────────────────┘ │ │
│  │  ┌──────────────────────────────────────────────────────────┐ │ │
│  │  │  academy_enrollments                                      │ │ │
│  │  │  • id, userId, courseId, enrollmentType                  │ │ │
│  │  │  • status, progress, enrolledAt, completedAt             │ │ │
│  │  └──────────────────────────────────────────────────────────┘ │ │
│  │  ┌──────────────────────────────────────────────────────────┐ │ │
│  │  │  academy_lesson_progress                                  │ │ │
│  │  │  • userId, lessonId, completed, timeSpent                │ │ │
│  │  │  • quizScore, rating, feedback                           │ │ │
│  │  └──────────────────────────────────────────────────────────┘ │ │
│  │  ┌──────────────────────────────────────────────────────────┐ │ │
│  │  │  academy_certificates                                     │ │ │
│  │  │  • id, userId, courseId, certificateType                 │ │ │
│  │  │  • certificateUrl, certificateCode, issuedAt             │ │ │
│  │  └──────────────────────────────────────────────────────────┘ │ │
│  │  ┌──────────────────────────────────────────────────────────┐ │ │
│  │  │  academy_course_reviews                                   │ │ │
│  │  │  • userId, courseId, rating, reviewText                  │ │ │
│  │  └──────────────────────────────────────────────────────────┘ │ │
│  └───────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
                               │
                               │ Email Notifications
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       EXTERNAL SERVICES                              │
├─────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────┐  ┌─────────────────────┐                  │
│  │  Zoho Email SMTP    │  │  Stripe Payments    │                  │
│  │  • Enrollment       │  │  • Course payments  │                  │
│  │  • Certificate      │  │  • Subscriptions    │                  │
│  │  • Completion       │  │  • Webhooks         │                  │
│  └─────────────────────┘  └─────────────────────┘                  │
│  ┌─────────────────────┐  ┌─────────────────────┐                  │
│  │  OpenAI API         │  │  Anthropic Claude   │                  │
│  │  • Content gen      │  │  • Alternative AI   │                  │
│  │  • AI assistance    │  │  • Content support  │                  │
│  └─────────────────────┘  └─────────────────────┘                  │
└─────────────────────────────────────────────────────────────────────┘
```

## Data Flow Diagram

### Admin Viewing Academy Stats

```
┌─────────────┐
│   Admin     │
│   User      │
└──────┬──────┘
       │
       │ 1. Navigate to /admin (Academy tab)
       ▼
┌─────────────────────────┐
│  AdminDashboard.tsx     │
│  - useEffect() triggers │
│  - fetchComprehensiveData()
└──────┬──────────────────┘
       │
       │ 2. HTTP GET /api/academy/admin/stats
       │    Headers: { Authorization: "Bearer <JWT>" }
       ▼
┌─────────────────────────┐
│  Backend API            │
│  academy.ts             │
│  - authenticate()       │◄─── 3. Verify JWT token
│  - Check role === ADMIN │
└──────┬──────────────────┘
       │
       │ 4. Execute database queries (Prisma)
       ▼
┌─────────────────────────────────────────────┐
│  Database Queries (Parallel)                 │
│                                              │
│  Promise.all([                               │
│    prisma.course.count(),                    │
│    prisma.enrollment.count(),                │
│    prisma.certificate.count(),               │
│    prisma.enrollment.findMany({              │
│      take: 10, orderBy: { enrolledAt: desc }│
│    }),                                       │
│    prisma.course.findMany({                  │
│      take: 5, orderBy: { enrollmentCount }  │
│    })                                        │
│  ])                                          │
└──────┬──────────────────────────────────────┘
       │
       │ 5. Aggregate and format data
       ▼
┌─────────────────────────┐
│  Response JSON          │
│  {                      │
│    success: true,       │
│    data: {              │
│      overview: {...},   │
│      recentActivity,    │
│      topCourses         │
│    }                    │
│  }                      │
└──────┬──────────────────┘
       │
       │ 6. Return to frontend
       ▼
┌─────────────────────────┐
│  AdminDashboard.tsx     │
│  - setAcademyData()     │
│  - Render UI            │
└──────┬──────────────────┘
       │
       │ 7. Display to admin
       ▼
┌─────────────────────────────────────────┐
│  Academy Dashboard UI                    │
│  ┌─────────────────────────────────────┐│
│  │ Total Courses: 57                   ││
│  │ Total Enrollments: 1,234            ││
│  │ Completion Rate: 65%                ││
│  │ Certificates: 789                   ││
│  └─────────────────────────────────────┘│
│  ┌─────────────────────────────────────┐│
│  │ Top Courses                         ││
│  │ 1. Prompt Engineering 101 (1,234)   ││
│  │ 2. DevOps Automation (892)          ││
│  └─────────────────────────────────────┘│
└─────────────────────────────────────────┘
```

### Student Enrollment Flow (Background Process)

```
┌─────────────┐
│  Student    │
│  Enrolls    │
└──────┬──────┘
       │
       │ POST /api/academy/enroll
       ▼
┌─────────────────────────┐
│  Backend API            │
│  - Create enrollment    │
│  - Update course count  │◄─── Database writes
│  - Send email (async)   │
└──────┬──────────────────┘
       │
       │ Email sent via Zoho SMTP
       ▼
┌─────────────────────────┐
│  Student receives       │
│  enrollment email       │
└─────────────────────────┘
       │
       │ Admin dashboard auto-refreshes (30s)
       ▼
┌─────────────────────────┐
│  New enrollment appears │
│  in "Recent Activity"   │
└─────────────────────────┘
```

## Component Hierarchy

```
AdminDashboard.tsx (Main Container)
├── Tabs Navigation
│   ├── Overview Tab
│   ├── Users Tab
│   ├── Payments Tab
│   ├── Tokens Tab
│   ├── Security Tab
│   ├── Emails Tab
│   ├── System Tab
│   ├── Academy Tab ◄─── NEW
│   │   ├── Statistics Cards (4)
│   │   │   ├── Total Courses Card
│   │   │   ├── Total Enrollments Card
│   │   │   ├── Completion Rate Card
│   │   │   └── Certificates Card
│   │   ├── Secondary Stats (3)
│   │   │   ├── Recent Enrollments
│   │   │   ├── Active Learners
│   │   │   └── Avg. Completion
│   │   ├── Top Performing Courses
│   │   │   └── Course List (Top 5)
│   │   ├── Recent Enrollment Activity
│   │   │   └── Activity List (Last 10)
│   │   └── Growth Metrics
│   │       └── Metric Cards (3)
│   └── Analytics Tab
└── Delete Confirmation Modal

AdminDashboardAcademy.tsx (Standalone)
├── Header (Title + Refresh Button)
├── Statistics Grid (4 cards)
├── Secondary Stats (3 cards)
├── Top Performing Courses Card
├── Recent Activity Card
└── System Status Card
```

## API Endpoint Mapping

```
┌──────────────────────────────┬─────────────────────────────────────┐
│ Frontend Request              │ Backend Endpoint                    │
├──────────────────────────────┼─────────────────────────────────────┤
│ fetchComprehensiveData()      │ GET /api/academy/admin/stats       │
│ - Admin stats overview        │ - Returns aggregated data          │
├──────────────────────────────┼─────────────────────────────────────┤
│ fetchCourses()                │ GET /api/academy/courses           │
│ - Public course listing       │ - Returns published courses        │
├──────────────────────────────┼─────────────────────────────────────┤
│ enrollInCourse()              │ POST /api/academy/enroll           │
│ - Student enrollment          │ - Creates enrollment record        │
├──────────────────────────────┼─────────────────────────────────────┤
│ fetchMyCourses()              │ GET /api/academy/my-courses        │
│ - User's enrolled courses     │ - Returns user's enrollments       │
├──────────────────────────────┼─────────────────────────────────────┤
│ updateProgress()              │ POST /api/academy/progress/:id     │
│ - Lesson completion tracking  │ - Updates lesson progress          │
├──────────────────────────────┼─────────────────────────────────────┤
│ submitRating()                │ POST /api/academy/lesson/:id/rating│
│ - Lesson feedback             │ - Saves rating and feedback        │
└──────────────────────────────┴─────────────────────────────────────┘
```

## Security Flow

```
┌────────────────────────────────────────────────────────────────┐
│                     SECURITY LAYERS                             │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Layer 1: Frontend Route Protection                            │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  if (!isAdmin) return <Redirect to="/login" />           │ │
│  └──────────────────────────────────────────────────────────┘ │
│                          │                                      │
│                          ▼                                      │
│  Layer 2: JWT Token Validation                                │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  Authorization: Bearer <token>                           │ │
│  │  jwt.verify(token, JWT_SECRET)                           │ │
│  └──────────────────────────────────────────────────────────┘ │
│                          │                                      │
│                          ▼                                      │
│  Layer 3: Admin Role Check                                    │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  if (user.role !== 'ADMIN') {                            │ │
│  │    return 403 Forbidden                                  │ │
│  │  }                                                        │ │
│  └──────────────────────────────────────────────────────────┘ │
│                          │                                      │
│                          ▼                                      │
│  Layer 4: Database Query Execution                            │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  • Parameterized queries (SQL injection prevention)      │ │
│  │  • Row-level security (if applicable)                    │ │
│  └──────────────────────────────────────────────────────────┘ │
│                          │                                      │
│                          ▼                                      │
│  Layer 5: Data Sanitization                                   │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  • Remove sensitive fields                               │ │
│  │  • Hash email addresses (in logs)                        │ │
│  │  • Limit data exposure                                   │ │
│  └──────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────┘
```

## Performance Optimization

```
┌────────────────────────────────────────────────────────────────┐
│                  OPTIMIZATION STRATEGIES                        │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. Database Level                                             │
│     • Indexed queries on frequently accessed columns           │
│     • Aggregation at database level (not in JS)               │
│     • Parallel queries with Promise.all()                     │
│                                                                 │
│  2. API Level                                                  │
│     • Single endpoint for multiple stats (batch request)       │
│     • Response caching (optional)                             │
│     • Pagination for large datasets                           │
│                                                                 │
│  3. Frontend Level                                             │
│     • Auto-refresh only on active tab                         │
│     • Debounced refresh (30 second intervals)                 │
│     • Loading states to prevent multiple requests             │
│     • Lazy loading of heavy components                        │
│                                                                 │
│  4. Network Level                                              │
│     • Compressed responses (gzip)                             │
│     • HTTP/2 multiplexing                                     │
│     • CDN for static assets                                   │
└────────────────────────────────────────────────────────────────┘
```

---

## Technology Stack

```
Frontend:
├── React 18+ (Component library)
├── TypeScript (Type safety)
├── Tailwind CSS (Styling)
├── Lucide Icons (UI icons)
└── Custom UI components (Card, Button, Badge, Tabs)

Backend:
├── Node.js + Express (Server)
├── TypeScript (Type safety)
├── Prisma ORM (Database queries)
├── JWT (Authentication)
└── Nodemailer (Email service)

Database:
├── SQLite (Development)
└── PostgreSQL (Production ready)

External Services:
├── Stripe (Payments)
├── OpenAI (AI generation)
├── Anthropic Claude (AI alternative)
└── Zoho SMTP (Email delivery)
```

---

**Last Updated:** January 2025
**Version:** 1.0.0
**Status:** ✅ Production Ready
