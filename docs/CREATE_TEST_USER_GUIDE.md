# Creating a Test User for Automated Testing

This guide explains how to create a test user for your CMMS application to enable automated testing with TestSprite.

---

## Quick Start (Recommended)

### Method 1: Supabase Dashboard (Easiest - 2 minutes)

1. **Open Supabase Dashboard:**
   ```
   https://supabase.com/dashboard
   ```

2. **Navigate to Authentication:**
   - Select your project
   - Click "Authentication" in left sidebar
   - Click "Users" tab

3. **Create New User:**
   - Click "Add user" → "Create new user"
   - Fill in:
     - **Email:** `example@gmail.com`
     - **Password:** `password123`
     - **Auto Confirm User:** ✅ **CHECK THIS BOX** (important!)
   - Click "Create user"

4. **Test Login:**
   - Open http://localhost:8080/login
   - Login with: `example@gmail.com` / `password123`
   - Should redirect to dashboard ✅

---

## Method 2: Automated Script (Recommended for CI/CD)

### Prerequisites

1. **Get Service Role Key:**
   - Go to Supabase Dashboard
   - Settings → API
   - Copy "service_role" key (NOT the anon key!)

2. **Add to .env file:**
   ```bash
   # Add this line to your .env file
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   ```

   ⚠️ **IMPORTANT:** Never commit this key to git! It's already in .gitignore.

### Run the Script

```bash
# Install dependencies (if not already installed)
npm install

# Create test user
npm run create-test-user
```

**Expected Output:**
```
🚀 Creating test user...

📝 Creating auth user...
✅ Auth user created successfully
   User ID: abc123...
   Email: example@gmail.com

📝 Creating profile record...
✅ Profile record created

🔐 Testing sign-in...
✅ Sign-in test successful

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ TEST USER CREATED SUCCESSFULLY!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 Test Credentials:
   Email:    example@gmail.com
   Password: password123
   User ID:  abc123...
   Role:     dispatcher

🎯 Next Steps:
   1. Try logging in at http://localhost:8080/login
   2. Re-run TestSprite tests
   3. Expect much higher pass rate!
```

---

## Method 3: SQL Script (For Database Admins)

### Step 1: Create Auth User (Supabase Dashboard)

You must create the auth user via Supabase Dashboard first (see Method 1 above).

### Step 2: Run SQL Script

After creating the auth user, run this in Supabase SQL Editor:

```sql
-- Insert profile data
INSERT INTO profiles (id, email, full_name, role, created_at, updated_at)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'example@gmail.com'),
  'example@gmail.com',
  'Test User',
  'dispatcher',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE
SET 
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  updated_at = NOW();

-- Verify creation
SELECT 
  u.id,
  u.email,
  u.email_confirmed_at,
  p.full_name,
  p.role
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE u.email = 'example@gmail.com';
```

---

## Troubleshooting

### Issue: "User already exists"

**Solution:** Update the existing user's password:

1. **Via Dashboard:**
   - Go to Authentication → Users
   - Find `example@gmail.com`
   - Click on user → "Reset Password"
   - Set new password: `password123`

2. **Via Script:**
   - The script automatically handles this
   - Just run `npm run create-test-user` again

### Issue: "Invalid login credentials"

**Possible causes:**

1. **Email not confirmed:**
   - Go to Supabase Dashboard → Authentication → Users
   - Find user → Check "Email Confirmed" column
   - If not confirmed, click user → "Confirm email"

2. **Wrong password:**
   - Reset password via dashboard
   - Or run script again to update

3. **RLS policies blocking:**
   - Check your Row Level Security policies
   - Ensure test user has appropriate permissions

### Issue: "Service role key not found"

**Solution:**

1. Get key from Supabase Dashboard → Settings → API
2. Add to `.env` file:
   ```bash
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
   ```
3. Restart your terminal/IDE
4. Run script again

### Issue: "Profile table doesn't exist"

**Solution:**

Your app might not have a profiles table. Check your database schema:

```sql
-- Check if profiles table exists
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'profiles';
```

If it doesn't exist, you may need to:
- Create the profiles table
- Or skip profile creation (auth user is enough for login)

---

## Verify Test User Works

### 1. Manual Login Test

```bash
# Start dev server
npm run dev

# Open browser
# Navigate to: http://localhost:8080/login
# Login with: example@gmail.com / password123
# Should see dashboard ✅
```

### 2. Re-run TestSprite Tests

```bash
# TestSprite will automatically use the test credentials
# Expect much higher pass rate (70-80%)
```

---

## Test User Credentials

**For Automated Testing:**
```
Email:    example@gmail.com
Password: password123
Role:     dispatcher (or admin)
```

**Security Notes:**
- ⚠️ Only use in development/testing environments
- ⚠️ Never use these credentials in production
- ⚠️ Change password if deploying to staging/production
- ⚠️ Service role key should never be committed to git

---

## Creating Multiple Test Users

You can modify the script to create multiple test users:

```javascript
// In scripts/create-test-user.js
const testUsers = [
  { email: 'admin@test.com', password: 'admin123', role: 'admin' },
  { email: 'tech@test.com', password: 'tech123', role: 'technician' },
  { email: 'dispatcher@test.com', password: 'dispatch123', role: 'dispatcher' }
];

// Loop through and create each user
for (const user of testUsers) {
  await createUser(user);
}
```

---

## Next Steps After Creating Test User

1. ✅ **Verify login works manually**
2. ✅ **Re-run TestSprite tests**
3. ✅ **Check test report for improved pass rate**
4. ✅ **Fix any remaining issues**
5. ✅ **Set up CI/CD with automated testing**

---

## Need Help?

- Check Supabase docs: https://supabase.com/docs/guides/auth
- Review test report: `testsprite_tests/testsprite-mcp-test-report.md`
- Check application logs for authentication errors
- Verify environment variables are set correctly

---

**Last Updated:** February 9, 2026
