# Assets Module - Duplicate Import Fix

## Issue

**Error:** `SyntaxError: Identifier 'snakeToCamelCase' has already been declared`

**Cause:** Duplicate import statement in `src/components/AssetFormDialog.tsx`

---

## Root Cause

During the bulk color replacement using PowerShell, the import statement was accidentally duplicated:

```tsx
// ❌ BEFORE (Duplicate import)
import { snakeToCamelCase } from '@/utils/data-helpers';
import { snakeToCamelCase } from '@/utils/data-helpers';  // Duplicate!
```

This caused a JavaScript syntax error preventing the application from loading.

---

## Fix Applied

**File:** `src/components/AssetFormDialog.tsx`

**Change:** Removed duplicate import statement

```tsx
// ✅ AFTER (Fixed)
import { snakeToCamelCase } from '@/utils/data-helpers';
```

---

## Verification

- ✅ No TypeScript errors
- ✅ File compiles successfully
- ✅ Application should load without errors

---

## Lesson Learned

When using automated text replacement tools (like PowerShell's `-replace`), be careful with:
1. Import statements
2. Function declarations
3. Variable declarations

These should be reviewed manually after bulk replacements to avoid duplicates.

---

**Fix Date:** January 20, 2026  
**Status:** Resolved ✅
