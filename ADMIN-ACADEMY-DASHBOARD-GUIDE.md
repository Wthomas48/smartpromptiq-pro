# Admin Dashboard - SmartPromptIQ Academy Guide

## Overview
The Admin Dashboard now includes comprehensive monitoring and management features for **SmartPromptIQ Academy**, your platform's learning management system.

## Accessing the Academy Dashboard

1. **Login as Admin**
   - Navigate to `/admin/login`
   - Use your admin credentials
   - You must have `role: "ADMIN"` in the database

2. **Navigate to Academy Tab**
   - Click on the "Academy" tab in the admin dashboard
   - Or use keyboard shortcut: `Ctrl+Alt+9` (if configured)

---

## Academy Dashboard Features

### 📊 Overview Statistics

The Academy dashboard displays key metrics in real-time:

#### **Total Courses**
- Total number of courses in the system
- Published vs draft courses
- 🎨 Visual: Purple gradient card

#### **Total Enrollments**
- All-time enrollment count
- Active vs completed enrollments
- 🎨 Visual: Blue gradient card

#### **Completion Rate**
- Percentage of courses completed
- Number of completed courses
- 🎨 Visual: Green gradient card

#### **Certificates Issued**
- Total certificates awarded
- Total lessons across all courses
- 🎨 Visual: Amber gradient card

---

## Monitoring Course Operations

### 🏆 Top Performing Courses

**What it shows:**
- Courses ranked by enrollment count
- Course details: category, difficulty level
- Enrollment numbers
- Average ratings (if available)

**How to use:**
- Identify most popular courses
- Understand which topics resonate with learners
- Plan future course development
- Allocate resources to high-demand areas

**Example View:**
```
1. Prompt Engineering 101
   Category: prompt-engineering | Difficulty: beginner
   Enrollments: 1,234

2. DevOps Automation with AI
   Category: devops | Difficulty: intermediate
   Enrollments: 892
```

### 📈 Recent Enrollment Activity

**What it shows:**
- Latest course enrollments (last 10)
- Enrollment date
- Enrollment type (free, paid, pro_subscription)
- Status (active, completed, dropped)

**How to use:**
- Monitor enrollment trends
- Track user engagement
- Identify peak enrollment periods
- Spot any unusual patterns

### 📅 Growth Metrics (Last 30 Days)

**Key Indicators:**
1. **New Enrollments** - Recent growth
2. **Completion Rate** - Student success
3. **Total Lessons** - Content availability

---

## API Integration & Live Data

### ✅ Connected APIs

The Academy dashboard connects to these live endpoints:

#### **1. Academy Statistics**
```
GET /api/academy/admin/stats
```
**Returns:**
- Overview statistics
- Recent activity
- Top courses
- System health

**Authentication:** Requires admin JWT token

#### **2. Course Data**
```
GET /api/academy/courses
```
**Returns:**
- All published courses
- Enrollment counts
- Reviews and ratings

---

## Environment Configuration

### Current API Keys (Configured)

✅ **Stripe API** - Payment processing
- Secret Key: `sk_test_51RZ3AdK...` (Test mode)
- Publishable Key: `pk_test_51RZ3AdK...` (Test mode)
- Webhook Secret: Configured

✅ **OpenAI API** - AI content generation
- API Key: Configured and active

✅ **Anthropic Claude API** - Alternative AI provider
- API Key: Configured and active

### Switching to Production Keys

When ready to go live, update these in your `.env` files:

```bash
# Backend: backend/.env
STRIPE_SECRET_KEY=sk_live_your_live_key_here
STRIPE_PUBLISHABLE_KEY=pk_live_your_live_key_here

# Frontend: .env
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your_live_key_here
```

⚠️ **Important:** Never commit API keys to version control!

---

## Database Schema - Academy Tables

### Courses Table
```sql
academy_courses
- id: Unique identifier
- title: Course name
- description: Course description
- slug: URL-friendly identifier
- category: Course category
- difficulty: beginner | intermediate | advanced
- duration: Minutes to complete
- accessTier: free | pro | certification
- priceUSD: Price in cents
- isPublished: Visibility status
- enrollmentCount: Total enrollments
- averageRating: User ratings
```

### Enrollments Table
```sql
academy_enrollments
- id: Unique identifier
- userId: Student ID
- courseId: Course ID
- enrollmentType: free | paid | pro_subscription
- status: active | completed | dropped
- progress: Completion percentage (0-100)
- enrolledAt: Enrollment date
- completedAt: Completion date (if applicable)
```

### Certificates Table
```sql
academy_certificates
- id: Unique identifier
- userId: Student ID
- courseId: Course ID (nullable)
- certificateType: course_completion | certification_exam
- certificateUrl: PDF link
- certificateCode: Verification code
- issuedAt: Issue date
```

### Lesson Progress Table
```sql
academy_lesson_progress
- userId: Student ID
- lessonId: Lesson ID
- completed: Boolean
- timeSpent: Seconds
- quizScore: Percentage
- rating: 1-5 stars
- feedback: Text feedback
```

---

## Common Admin Tasks

### 1. Check Overall Academy Health

**What to monitor:**
- ✅ Total enrollments trending upward
- ✅ Completion rate above 50%
- ✅ Recent enrollments steady
- ✅ System status: All green

**Red Flags:**
- 🚨 Completion rate below 30%
- 🚨 Zero enrollments for 7+ days
- 🚨 Spike in dropped enrollments
- 🚨 System status warnings

### 2. Identify Popular Content

**Steps:**
1. Check "Top Performing Courses" section
2. Note enrollment numbers
3. Review course categories
4. Plan similar content

### 3. Monitor Student Engagement

**Metrics to track:**
- Active enrollments
- Average time to completion
- Lesson progress
- Quiz scores (if available)

### 4. Issue Certificates

**Automatic Process:**
- Certificates auto-issue upon course completion
- Students receive email notification
- Certificate stored in database
- Downloadable PDF generated

**Manual Review:**
- Check certificate count
- Verify completion status
- Audit certificate codes

---

## Troubleshooting

### Academy Data Not Loading

**Possible Causes:**
1. Not logged in as admin
2. Backend server not running
3. Database connection issue
4. API endpoint error

**Solution:**
```bash
# 1. Verify admin role in database
npm run check-admin

# 2. Restart backend server
cd backend
npm run dev

# 3. Check database connection
npm run db:check

# 4. View server logs
# Check console for errors
```

### Enrollment Count Mismatch

**Check:**
1. Database sync status
2. Enrollment status filters
3. Date range filters
4. Soft-deleted records

**Fix:**
```bash
# Recalculate enrollment counts
npm run db:seed -- --update-counts
```

### Course Not Appearing

**Verify:**
- `isPublished: true` in database
- Course has lessons
- Lessons are published
- No errors in course data

---

## Performance Optimization

### Dashboard Load Time

**Current optimizations:**
- Parallel API requests
- Cached statistics
- Indexed database queries
- Efficient data aggregation

**Expected load time:** < 2 seconds

### Auto-Refresh

- Dashboard refreshes every 30 seconds
- Only when tab is active
- Only when user is authenticated
- Can be triggered manually with "Refresh" button

---

## Security Considerations

### Access Control
- ✅ Admin-only endpoints protected
- ✅ JWT token required
- ✅ Role verification on server
- ✅ SQL injection prevention

### Data Privacy
- Student email addresses hashed in logs
- Personal data not exposed in API responses
- GDPR compliance for European users
- Data retention policies enforced

---

## Future Enhancements

Planned features for Academy Dashboard:

1. **Revenue Analytics**
   - Course sales tracking
   - Payment breakdown
   - Refund monitoring

2. **Student Analytics**
   - Learning patterns
   - Drop-off points
   - Engagement heatmaps

3. **Content Management**
   - Bulk course operations
   - Lesson editor
   - Quiz builder

4. **Marketing Tools**
   - Discount code management
   - Email campaigns
   - Affiliate tracking

5. **Advanced Reporting**
   - Custom date ranges
   - Export to CSV/PDF
   - Scheduled reports

---

## Support & Resources

### Documentation
- [Backend API Docs](./ACADEMY-COMPLETE-57-COURSES.md)
- [Frontend Components](./ACADEMY-AWESOME-PAGES-PREVIEW.md)
- [Database Schema](./backend/prisma/schema.prisma)

### Getting Help
- Check server logs: `npm run dev`
- Database tools: `npx prisma studio`
- API testing: Use Postman or Thunder Client

### Contact
- Admin Email: admin@smartpromptiq.com
- Support: support@smartpromptiq.com

---

## Quick Reference

### Keyboard Shortcuts (Admin Dashboard)
- `Ctrl+Alt+1` - Overview tab
- `Ctrl+Alt+2` - Users tab
- `Ctrl+Alt+3` - Payments tab
- `Ctrl+Alt+9` - Academy tab (if configured)
- `Ctrl+Alt+R` - Refresh data
- `Ctrl+Alt+C` - Fetch comprehensive data

### API Endpoints
```
GET  /api/academy/admin/stats          - Get academy statistics
GET  /api/academy/courses              - List all courses
GET  /api/academy/courses/:slug        - Get course details
POST /api/academy/enroll               - Enroll student
GET  /api/academy/my-courses           - User's courses
GET  /api/academy/dashboard            - Student dashboard
```

### Database Commands
```bash
# Open Prisma Studio
npx prisma studio

# Run migrations
npx prisma migrate dev

# Seed academy data
npm run seed:academy

# Check enrollment stats
npm run check:enrollments
```

---

## Monitoring Checklist

Use this daily checklist to monitor Academy health:

- [ ] Check total enrollment count (trending up?)
- [ ] Review completion rate (> 50%?)
- [ ] Verify new enrollments in last 24h
- [ ] Check top 3 courses for anomalies
- [ ] Review recent activity for errors
- [ ] Confirm system status all green
- [ ] Check certificate issuance rate
- [ ] Review any error logs
- [ ] Verify API response times
- [ ] Confirm email notifications sent

---

## Conclusion

The SmartPromptIQ Academy Admin Dashboard provides comprehensive monitoring and management capabilities for your learning platform. With real-time data, live API integration, and intuitive visualizations, you can effectively oversee course operations and ensure optimal student experience.

For questions or issues, refer to the troubleshooting section or contact the development team.

**Last Updated:** January 2025
**Version:** 1.0.0
**API Status:** ✅ Live and Operational
