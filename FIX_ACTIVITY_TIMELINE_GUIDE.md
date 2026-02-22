# Fix Activity Timeline - User Names Not Showing

## Problem
The activity timeline shows "Unknown" instead of user names because:
1. The profiles table doesn't have records for all users
2. The profiles table is missing `full_name` and `email` columns
3. Existing profile records have null/empty `full_name` values

## Solution - Quick Fix (3 Steps)

### Step 1: Run the Migration

**Option A: Using Supabase Dashboard (Recommended)**

1. Open your Supabase Dashboard at https://supabase.com/dashboard
2. Select your project
3. Go to **SQL Editor** (in the left sidebar)
4. Click **New Query**
5. Copy the entire contents of `supabase/migrations/20260219000001_create_profile_trigger.sql`
6. Paste into the SQL Editor
7. Click **Run** (or press Ctrl+Enter)
8. You should see "Success. No rows returned" - this is normal!

**Option B: Using Supabase CLI**

If you have Supabase CLI installed:

```bash
supabase db push
```

### Step 2: Verify the Migration Worked

1. In Supabase Dashboard, go to **SQL Editor**
2. Copy the contents of `scripts/verify-profiles.sql`
3. Paste and click **Run**
4. Check the results:
   - "Users without profiles" should show **0**
   - "Profiles with missing full_name" should show **0**
   - You should see your profile listed with your email

### Step 3: Refresh Your Application

1. Go back to your CMMS application
2. **Hard refresh** the page (Ctrl+Shift+R or Cmd+Shift+R)
3. Open a work order
4. Check the Activity Timeline - you should now see your email or name instead of "Unknown"

## What This Migration Does

1. **Adds Missing Columns**: Adds `full_name`, `email`, and `role` columns to the profiles table (if they don't exist)
2. **Creates Profiles for All Users**: Finds all users in `auth.users` who don't have a profile and creates one
3. **Populates Data**: 
   - Sets `email` from `auth.users`
   - Sets `full_name` from user metadata or email
4. **Sets Up Auto-Creation**: Creates a trigger so new users automatically get a profile when they sign up

## Optional: Set Your Display Name

If you want to show a proper name instead of your email:

```sql
-- Update your own profile (run this while logged in)
UPDATE profiles
SET full_name = 'Your Full Name'
WHERE id = auth.uid();
```

Or update via the Supabase Dashboard:
1. Go to **Table Editor** → **profiles**
2. Find your row (search by email)
3. Edit the `full_name` field
4. Save

## Troubleshooting

### Still showing "Unknown"?

1. **Check if the migration ran successfully**:
   - Run `scripts/verify-profiles.sql` in SQL Editor
   - Make sure "Users without profiles" shows 0

2. **Check browser console for errors**:
   - Open Developer Tools (F12)
   - Look for any red errors related to profiles
   - Check the console warning: "Activity log contains user IDs not found in profiles"

3. **Clear cache and hard refresh**:
   - Press Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)

4. **Check your user ID**:
   ```sql
   -- Find your user ID
   SELECT id, email FROM auth.users WHERE email = 'your-email@example.com';
   
   -- Check if you have a profile
   SELECT * FROM profiles WHERE id = 'your-user-id-here';
   ```

### Migration fails?

If you get an error like "column already exists":
- The migration is safe to run multiple times
- It checks for existing columns before adding them
- If it fails, copy the error message and we can debug

## What Changed in the Code

The code has been updated to use the correct profile fields:

1. **Profile Type** (`src/types/supabase.ts` & `src/types/supabase-generated.ts`):
   - Now includes `full_name`, `email`, and `role` fields
   - Kept `first_name`/`last_name` for backward compatibility

2. **Profile Queries** (multiple files):
   - Updated to fetch `full_name` and `email`
   - Fallback chain: `full_name` → `email` → "Unknown User"

3. **Database**:
   - Trigger auto-creates profiles on user signup
   - Backfilled all existing users
   - Populated missing data from `auth.users`
