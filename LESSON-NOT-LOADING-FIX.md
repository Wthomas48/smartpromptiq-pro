# Lesson Not Loading - Authentication Issue

## Problem Found

The lesson page shows "Lesson Not Found" because the API is returning **401 Unauthorized**.

### Backend Logs Show:
```
🔐 Auth check for GET /lesson/cmhl14uea0001n25jkvvqq7h8:
GET /api/academy/lesson/cmhl14uea0001n25jkvvqq7h8 401 0.479 ms - 51
```

## Root Cause

**Your JWT authentication token has expired!**

The Academy lesson viewer requires authentication (the `authenticate` middleware we added earlier). When your token expires, the API returns 401 Unauthorized, which causes the frontend to show "Lesson Not Found".

## How to Fix (User Action Required)

### Option 1: Sign Out and Sign In Again (Recommended)
1. Go to your profile menu (top right)
2. Click "Sign Out"
3. Sign in again with your credentials
4. Go back to the Academy and try opening a lesson

### Option 2: Clear LocalStorage and Sign In
1. Open browser console (F12)
2. Go to "Application" tab → "Local Storage"
3. Clear all items
4. Refresh page
5. Sign in again

### Option 3: Use the Reset Auth Tool
1. Open: `c:\SmartPromptiq-pro\client\public\reset-auth.html` in your browser
2. Click "Clear Authentication"
3. Sign in again

## Why This Happens

JWT tokens have an expiration time (usually 7 days). After that time, the token is no longer valid and you need to get a new one by signing in again.

## Test After Signing In

Once you sign in with a fresh token:

1. Go to `/academy/courses`
2. Click on any course
3. Expand a lesson
4. Click "Start Lesson"
5. **Lesson should load!** ✅

## Technical Details

The lesson API endpoint (`/api/academy/lesson/:id`) is protected with the `authenticate` middleware:

```typescript
router.get('/lesson/:lessonId', authenticate, async (req: Request, res: Response) => {
  // Middleware checks token BEFORE this code runs
  // If token invalid → returns 401
  // If token valid → continues to fetch lesson
});
```

When the frontend receives a 401 response:
- `result.success` = false or error is thrown
- `setData()` is never called
- `data` remains `null`
- Component shows "Lesson Not Found"

## Frontend Error Handling

The component already has code to handle token expiration:

```typescript
if (error.message?.includes('Authentication required')) {
  alert('Your session has expired. Please sign in again.');
  localStorage.clear();
  window.location.href = '/signin?redirect=' + window.location.pathname;
}
```

But the 401 error needs to be caught properly. Let me enhance the error handling...

## Quick Fix for Better Error Message

I'll update the component to show "Session Expired" instead of "Lesson Not Found" when it's a 401 error.
