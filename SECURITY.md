# Security Policy

## 🔒 Environment Variables & Secrets Management

### **CRITICAL: Never Commit Secrets to Git**

This project uses environment variables to store sensitive configuration. **NEVER** commit files containing actual API keys, tokens, or credentials.

### Environment Files Structure

```
.env                    # Template with placeholder values (committed)
.env.local              # Your actual secrets (NEVER commit)
.env.example            # Template for reference (committed)
```

### Setup Instructions

1. **Desktop Web App (Vite)**
   ```bash
   cp .env .env.local
   # Edit .env.local with your actual values
   ```

2. **Mobile Web App (Next.js)**
   ```bash
   cd mobile-web
   cp .env.example .env.local
   # Edit .env.local with your actual values
   ```

3. **Native Mobile App (React Native/Expo)**
   ```bash
   cd mobile
   cp .env.example .env
   # Edit .env with your actual values
   ```

### Required Environment Variables

#### Desktop Web (`.env.local`)
```env
VITE_APP_MAPBOX_API_KEY=your_mapbox_api_key
VITE_VAPID_PUBLIC_KEY=your_vapid_public_key
VAPID_PRIVATE_KEY=your_vapid_private_key
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
```

#### Mobile Web (`.env.local`)
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
```

#### Native Mobile (`.env`)
```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
```

## 🚨 What to Do If Secrets Are Exposed

If you accidentally commit secrets to Git:

1. **Immediately Rotate All Exposed Credentials**
   - Regenerate API keys in their respective services
   - Update your local `.env.local` files
   - Never reuse exposed credentials

2. **Remove from Git History**
   ```bash
   # Remove sensitive file from git history
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch .env" \
     --prune-empty --tag-name-filter cat -- --all
   
   # Force push (WARNING: This rewrites history)
   git push origin --force --all
   ```

3. **Verify Removal**
   ```bash
   git log --all --full-history -- .env
   ```

## 🛡️ Security Best Practices

### API Keys & Tokens
- ✅ Store in environment variables
- ✅ Use different keys for development/production
- ✅ Rotate keys regularly
- ❌ Never hardcode in source files
- ❌ Never commit to version control
- ❌ Never share in chat/email

### Supabase Security
- Use Row Level Security (RLS) policies
- Use `anon` key for client-side (safe to expose)
- Keep `service_role` key server-side only
- Enable email verification
- Configure proper CORS settings

### Code Review Checklist
Before committing, verify:
- [ ] No hardcoded API keys or tokens
- [ ] No actual credentials in `.env` files
- [ ] `.env.local` is in `.gitignore`
- [ ] Only `.env.example` files are committed
- [ ] All secrets use environment variables

## 📋 .gitignore Configuration

Ensure your `.gitignore` includes:
```gitignore
# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
.env.*.local
**/.env
**/.env.local
```

## 🔍 Audit Commands

Check for accidentally committed secrets:
```bash
# Search for potential API keys
git log -p | grep -i "api[_-]key\|secret\|token\|password"

# Check what's tracked
git ls-files | grep -i "\.env"

# Verify .gitignore is working
git check-ignore -v .env.local
```

## 📞 Reporting Security Issues

If you discover a security vulnerability:
1. **DO NOT** open a public issue
2. Email security concerns to: [your-security-email]
3. Include detailed description and steps to reproduce
4. Allow time for fix before public disclosure

## 🔄 Regular Security Maintenance

- [ ] Rotate API keys every 90 days
- [ ] Review access logs monthly
- [ ] Update dependencies regularly
- [ ] Audit environment variables quarterly
- [ ] Review RLS policies with each schema change

## 📚 Additional Resources

- [OWASP API Security Top 10](https://owasp.org/www-project-api-security/)
- [Supabase Security Best Practices](https://supabase.com/docs/guides/auth/security)
- [GitHub Secret Scanning](https://docs.github.com/en/code-security/secret-scanning)
