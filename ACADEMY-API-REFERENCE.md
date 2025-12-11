# Academy API Reference - Complete Documentation

**Date**: 2025-11-17
**Status**: ✅ **ALL ACADEMY APIs ACTIVE AND WORKING**
**Base URL**: `http://localhost:5000/api/academy`

---

## ✅ API STATUS: FULLY OPERATIONAL

**Backend Server**: ✅ Running at http://localhost:5000
**Database**: ✅ SQLite with 57 courses, 555 lessons
**Routes Registered**: ✅ All Academy routes active
**Authentication**: ✅ JWT-based auth working

---

## 📚 AVAILABLE ENDPOINTS

### Public Endpoints (No Auth Required)

#### 1. Get All Courses
```
GET /api/academy/courses
```

**Description**: Fetch all published Academy courses

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "cmi3fkzsb00002yh5dhacrci4",
      "title": "Prompt Writing 101",
      "description": "Master the fundamentals of prompt engineering...",
      "slug": "prompt-writing-101",
      "category": "prompt-engineering",
      "difficulty": "beginner",
      "duration": 180,
      "accessTier": "free",
      "priceUSD": 0,
      "thumbnailUrl": null,
      "videoUrl": null,
      "syllabus": null,
      "isPublished": true,
      "order": 1,
      "instructor": "Dr. Sarah Chen",
      "tags": "fundamentals,beginner,free",
      "enrollmentCount": 5432,
      "averageRating": 4.9,
      "reviewCount": 1234,
      "createdAt": "2025-11-17T17:41:04.427Z",
      "updatedAt": "2025-11-17T17:41:04.427Z",
      "_count": {
        "lessons": 11,
        "enrollments": 0,
        "reviews": 0
      }
    }
    // ... 56 more courses
  ]
}
```

**Features**:
- ✅ Returns all 57 courses
- ✅ Includes lesson count
- ✅ Shows enrollment stats
- ✅ Displays ratings
- ✅ No authentication required

**Test**:
```bash
curl http://localhost:5000/api/academy/courses
```

---

#### 2. Get Single Course
```
GET /api/academy/courses/:slug
```

**Description**: Fetch detailed information about a specific course including all lessons

**Parameters**:
- `slug` (path) - Course slug (e.g., "prompt-writing-101")

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "cmi3fkzsb00002yh5dhacrci4",
    "title": "Prompt Writing 101",
    "description": "Master the fundamentals of prompt engineering...",
    "slug": "prompt-writing-101",
    "category": "prompt-engineering",
    "difficulty": "beginner",
    "duration": 180,
    "accessTier": "free",
    "priceUSD": 0,
    "instructor": "Dr. Sarah Chen",
    "lessons": [
      {
        "id": "cmi3g8vut0001cs94u9lqz1pq",
        "title": "Introduction and Overview",
        "description": "Get started with the fundamentals...",
        "duration": 15,
        "order": 1,
        "isFree": true
      }
      // ... 10 more lessons
    ],
    "_count": {
      "enrollments": 0,
      "reviews": 0
    }
  }
}
```

**Features**:
- ✅ Full course details
- ✅ Complete lesson list
- ✅ Lesson metadata (duration, order, free status)
- ✅ No authentication required

**Test**:
```bash
curl http://localhost:5000/api/academy/courses/prompt-writing-101
```

---

#### 3. Get Single Lesson
```
GET /api/academy/lesson/:lessonId
```

**Description**: Fetch detailed lesson content including markdown, playground examples, and metadata

**Parameters**:
- `lessonId` (path) - Lesson ID

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "cmi3g8vut0001cs94u9lqz1pq",
    "title": "Introduction and Overview",
    "description": "Get started with the fundamentals...",
    "content": "# Introduction and Overview\n\nWelcome to this lesson...\n\n## Learning Objectives\n...",
    "duration": 15,
    "order": 1,
    "isFree": true,
    "videoUrl": null,
    "playgroundExamples": "[{\"title\":\"Simple Question Prompt\",\"prompt\":\"What are the key principles...\",\"expectedOutput\":\"...\",\"tips\":[...]}]",
    "courseId": "cmi3fkzsb00002yh5dhacrci4",
    "course": {
      "id": "cmi3fkzsb00002yh5dhacrci4",
      "title": "Prompt Writing 101",
      "slug": "prompt-writing-101"
    }
  }
}
```

**Features**:
- ✅ Full lesson content (markdown)
- ✅ Playground examples (JSON)
- ✅ Course information
- ✅ Video URL (if available)
- ✅ No authentication required for free lessons

**Test**:
```bash
curl http://localhost:5000/api/academy/lesson/[lesson-id]
```

---

### Authenticated Endpoints (Auth Required)

#### 4. Get My Enrolled Courses
```
GET /api/academy/my-courses
Authentication: Required
```

**Description**: Fetch all courses the authenticated user is enrolled in

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "enrollment-id",
      "enrolledAt": "2025-11-17T10:00:00.000Z",
      "progress": 45,
      "lastAccessedAt": "2025-11-17T12:00:00.000Z",
      "course": {
        "id": "course-id",
        "title": "Prompt Writing 101",
        "slug": "prompt-writing-101",
        "description": "...",
        "difficulty": "beginner",
        "instructor": "Dr. Sarah Chen",
        "_count": {
          "lessons": 11
        }
      },
      "courseId": "course-id"
    }
  ]
}
```

**Features**:
- ✅ Shows enrollment date
- ✅ Progress percentage
- ✅ Last accessed time
- ✅ Full course details
- ✅ Lesson count

**Test**:
```bash
curl http://localhost:5000/api/academy/my-courses \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

#### 5. Enroll in Course
```
POST /api/academy/enroll
Authentication: Required
```

**Description**: Enroll the authenticated user in a course

**Headers**:
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "courseId": "cmi3fkzsb00002yh5dhacrci4"
}
```

**Response (Success)**:
```json
{
  "success": true,
  "message": "Successfully enrolled in Prompt Writing 101",
  "data": {
    "id": "enrollment-id",
    "userId": "user-id",
    "courseId": "course-id",
    "enrolledAt": "2025-11-17T10:00:00.000Z",
    "progress": 0,
    "completedLessons": 0,
    "totalLessons": 11
  }
}
```

**Response (Already Enrolled)**:
```json
{
  "success": false,
  "message": "You are already enrolled in this course"
}
```

**Response (Access Denied)**:
```json
{
  "success": false,
  "message": "This course requires a subscription. Please upgrade your plan.",
  "requiredTier": "pro",
  "currentTier": "free"
}
```

**Features**:
- ✅ Checks user access tier
- ✅ Prevents duplicate enrollments
- ✅ Sends enrollment email (if configured)
- ✅ Returns enrollment details

**Test**:
```bash
curl -X POST http://localhost:5000/api/academy/enroll \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"courseId":"cmi3fkzsb00002yh5dhacrci4"}'
```

---

#### 6. Update Lesson Progress
```
POST /api/academy/progress/:lessonId
Authentication: Required
```

**Description**: Mark a lesson as completed and update progress

**Headers**:
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Parameters**:
- `lessonId` (path) - Lesson ID

**Request Body**:
```json
{
  "completed": true,
  "timeSpent": 900
}
```

**Response**:
```json
{
  "success": true,
  "message": "Progress updated successfully",
  "data": {
    "lessonProgress": {
      "id": "progress-id",
      "lessonId": "lesson-id",
      "userId": "user-id",
      "completed": true,
      "completedAt": "2025-11-17T10:15:00.000Z",
      "timeSpent": 900
    },
    "enrollmentProgress": {
      "progress": 18,
      "completedLessons": 2,
      "totalLessons": 11
    }
  }
}
```

**Features**:
- ✅ Tracks lesson completion
- ✅ Records time spent
- ✅ Updates overall course progress
- ✅ Calculates percentage completion

**Test**:
```bash
curl -X POST http://localhost:5000/api/academy/progress/[lesson-id] \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"completed":true,"timeSpent":900}'
```

---

#### 7. Rate Lesson
```
POST /api/academy/lesson/:lessonId/rating
Authentication: Required
```

**Description**: Submit a rating for a lesson

**Headers**:
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Parameters**:
- `lessonId` (path) - Lesson ID

**Request Body**:
```json
{
  "rating": 5,
  "feedback": "Excellent lesson! Very clear explanations."
}
```

**Response**:
```json
{
  "success": true,
  "message": "Thank you for your feedback!",
  "data": {
    "rating": 5,
    "feedback": "Excellent lesson! Very clear explanations.",
    "lessonId": "lesson-id",
    "userId": "user-id",
    "createdAt": "2025-11-17T10:30:00.000Z"
  }
}
```

**Validation**:
- Rating must be 1-5
- Feedback is optional
- One rating per user per lesson

**Features**:
- ✅ Star rating system (1-5)
- ✅ Optional text feedback
- ✅ Updates lesson average rating
- ✅ Prevents duplicate ratings

**Test**:
```bash
curl -X POST http://localhost:5000/api/academy/lesson/[lesson-id]/rating \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"rating":5,"feedback":"Great lesson!"}'
```

---

#### 8. Get Dashboard Data
```
GET /api/academy/dashboard
Authentication: Required
```

**Description**: Get personalized dashboard data for authenticated user

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**Response**:
```json
{
  "success": true,
  "data": {
    "enrolledCourses": [
      {
        "id": "enrollment-id",
        "progress": 45,
        "completedLessons": 5,
        "totalLessons": 11,
        "lastAccessedAt": "2025-11-17T12:00:00.000Z",
        "course": {
          "title": "Prompt Writing 101",
          "slug": "prompt-writing-101",
          "instructor": "Dr. Sarah Chen"
        }
      }
    ],
    "stats": {
      "totalCoursesEnrolled": 3,
      "totalLessonsCompleted": 15,
      "totalTimeSpent": 7200,
      "averageProgress": 52
    },
    "recentActivity": [
      {
        "type": "lesson_completed",
        "lessonTitle": "Core Concepts",
        "courseTitle": "Prompt Writing 101",
        "timestamp": "2025-11-17T11:00:00.000Z"
      }
    ],
    "recommendations": [
      {
        "id": "course-id",
        "title": "Advanced Prompt Patterns",
        "reason": "Based on your progress in Prompt Writing 101"
      }
    ]
  }
}
```

**Features**:
- ✅ Enrolled courses with progress
- ✅ Learning statistics
- ✅ Recent activity feed
- ✅ Course recommendations
- ✅ Personalized insights

**Test**:
```bash
curl http://localhost:5000/api/academy/dashboard \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

#### 9. Get Admin Statistics (Admin Only)
```
GET /api/academy/admin/stats
Authentication: Required (Admin role)
```

**Description**: Get platform-wide Academy statistics

**Headers**:
```
Authorization: Bearer <admin_jwt_token>
```

**Response**:
```json
{
  "success": true,
  "data": {
    "courses": {
      "total": 57,
      "published": 57,
      "draft": 0,
      "byCategory": {
        "prompt-engineering": 14,
        "development": 7,
        "design": 2,
        "marketing": 2
      }
    },
    "lessons": {
      "total": 555,
      "withPlaygrounds": 555,
      "averagePerCourse": 9.7
    },
    "enrollments": {
      "total": 1234,
      "thisMonth": 123,
      "thisWeek": 23
    },
    "users": {
      "totalStudents": 567,
      "activeThisWeek": 89,
      "byTier": {
        "free": 400,
        "academy": 100,
        "pro": 50,
        "enterprise": 17
      }
    },
    "engagement": {
      "averageProgress": 35,
      "completionRate": 12,
      "averageRating": 4.7
    }
  }
}
```

**Features**:
- ✅ Platform-wide metrics
- ✅ Enrollment trends
- ✅ User distribution
- ✅ Engagement analytics
- ✅ Admin-only access

**Test**:
```bash
curl http://localhost:5000/api/academy/admin/stats \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

---

## 🔐 Authentication

### Getting a Token

**1. Register**:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email":"student@example.com",
    "password":"Student123!",
    "firstName":"John",
    "lastName":"Doe"
  }'
```

**2. Login**:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email":"student@example.com",
    "password":"Student123!"
  }'
```

**Response**:
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "user-id",
      "email": "student@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "USER",
      "subscriptionTier": "free"
    }
  }
}
```

**3. Use Token**:
```bash
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

curl http://localhost:5000/api/academy/my-courses \
  -H "Authorization: Bearer $TOKEN"
```

---

## 🎯 Access Control

### Tier-Based Access

**Free Tier** (`subscriptionTier: "free"`):
- ✅ View all courses
- ✅ Enroll in FREE courses only
- ✅ Access free lessons
- ❌ Cannot enroll in paid courses
- ❌ Limited to trial content

**Academy Tier** (`subscriptionTier: "academy"`):
- ✅ All free tier access
- ✅ Enroll in ALL Academy courses
- ✅ Access all Academy lessons
- ✅ Full playground access
- ✅ Certificate generation
- ❌ No main platform tools access

**Pro Tier** (`subscriptionTier: "pro"`):
- ✅ All Academy tier access
- ✅ Full platform tools access
- ✅ Priority support
- ✅ Advanced features

**Enterprise Tier** (`subscriptionTier: "enterprise"`):
- ✅ Everything
- ✅ Custom training
- ✅ Dedicated support

### Course Access Tiers

Courses have `accessTier` field:
- `free` - Anyone can enroll
- `academy` - Requires Academy subscription or higher
- `pro` - Requires Pro subscription or higher
- `enterprise` - Requires Enterprise subscription

**Enrollment Check**:
```typescript
// Backend automatically checks:
if (course.accessTier === 'academy' && user.subscriptionTier === 'free') {
  return error("Upgrade required");
}
```

---

## 🧪 Complete Test Suite

### Test All Public Endpoints
```bash
# 1. Get all courses
curl http://localhost:5000/api/academy/courses

# 2. Get single course
curl http://localhost:5000/api/academy/courses/prompt-writing-101

# 3. Get lesson
curl http://localhost:5000/api/academy/lesson/[lesson-id]
```

### Test Authenticated Flow
```bash
# 1. Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!","firstName":"Test"}'

# 2. Login and get token
TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!"}' \
  | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

# 3. View enrolled courses (should be empty)
curl http://localhost:5000/api/academy/my-courses \
  -H "Authorization: Bearer $TOKEN"

# 4. Enroll in free course
curl -X POST http://localhost:5000/api/academy/enroll \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"courseId":"[free-course-id]"}'

# 5. View enrolled courses (should show 1)
curl http://localhost:5000/api/academy/my-courses \
  -H "Authorization: Bearer $TOKEN"

# 6. Mark lesson as complete
curl -X POST http://localhost:5000/api/academy/progress/[lesson-id] \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"completed":true,"timeSpent":600}'

# 7. Rate lesson
curl -X POST http://localhost:5000/api/academy/lesson/[lesson-id]/rating \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"rating":5,"feedback":"Great!"}'

# 8. View dashboard
curl http://localhost:5000/api/academy/dashboard \
  -H "Authorization: Bearer $TOKEN"
```

---

## 📊 API Summary

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/api/academy/courses` | GET | No | List all courses |
| `/api/academy/courses/:slug` | GET | No | Get course details |
| `/api/academy/lesson/:lessonId` | GET | No* | Get lesson content |
| `/api/academy/my-courses` | GET | Yes | My enrollments |
| `/api/academy/enroll` | POST | Yes | Enroll in course |
| `/api/academy/progress/:lessonId` | POST | Yes | Update progress |
| `/api/academy/lesson/:lessonId/rating` | POST | Yes | Rate lesson |
| `/api/academy/dashboard` | GET | Yes | Dashboard data |
| `/api/academy/admin/stats` | GET | Admin | Platform stats |

\* Free lessons don't require auth, paid lessons do

---

## ✅ Status Check

**All Academy APIs are ACTIVE and WORKING** ✅

**Verification**:
```bash
# Health check
curl http://localhost:5000/api/health

# Course count
curl -s http://localhost:5000/api/academy/courses | grep -o '"success":true'
# Should output: "success":true

# Backend status
# Should see: ✅ Database connected successfully
```

**Current State**:
- ✅ Backend server running
- ✅ 57 courses in database
- ✅ 555 lessons with content
- ✅ All 555 lessons have playground examples
- ✅ All API endpoints responding
- ✅ Authentication working
- ✅ Enrollment system functional
- ✅ Progress tracking active
- ✅ Rating system operational

---

**Last Updated**: 2025-11-17
**API Version**: v1.0
**Base URL**: http://localhost:5000/api/academy
**Status**: ✅ Fully Operational
