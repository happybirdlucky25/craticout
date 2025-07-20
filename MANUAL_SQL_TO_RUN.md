# Manual SQL Commands to Run in Supabase Dashboard

To fix the tracking functionality, please run these SQL commands in your Supabase Dashboard (SQL Editor):

## 1. Disable RLS on Tracking Tables (Development Only)

```sql
-- Temporarily disable RLS on tracking tables for development
ALTER TABLE public.tracked_bills DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tracked_legislators DISABLE ROW LEVEL SECURITY;
```

## 2. Test Tracking Functionality

After running the above SQL, the tracking system should work. You can test by:

1. Going to `/search` page
2. Searching for bills
3. Clicking the "Track" button on any bill
4. Going to `/tracked` page to see tracked bills

## 3. Re-enable RLS Later (When Implementing Full Auth)

When you implement proper authentication, re-enable RLS with:

```sql
-- Re-enable RLS when implementing proper authentication
ALTER TABLE public.tracked_bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tracked_legislators ENABLE ROW LEVEL SECURITY;
```

## Steps to Run:

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste the commands from section 1
4. Click "Run" to execute
5. Test the tracking functionality in your app

**Note:** This is a temporary development solution. In production, you should implement proper authentication and keep RLS enabled.