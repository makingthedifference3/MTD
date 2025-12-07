# Receipt Notification Troubleshooting Guide

## Issue 1: Notification Count Not Decreasing

### Root Cause
The RLS (Row Level Security) policies were using `current_setting('app.current_user_id')` instead of `auth.uid()`, preventing inserts from working.

### Fix Applied

**Run this SQL in Supabase:**
```sql
-- File: FIX_RECEIPT_VIEWS_RLS.sql
```

This will:
1. Drop the old incorrect policies
2. Create new policies using `auth.uid()::text`
3. Add service role bypass policy

### Verify the Fix

**Step 1: Check RLS Policies**
```sql
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'receipt_views';
```

You should see 4 policies using `auth.uid()::text`.

**Step 2: Test in Browser Console**

1. Open Project Expenses page
2. Open Browser DevTools (F12)
3. View a paid receipt
4. Check console logs - you should see:
   ```
   Marking receipt as seen: {expenseId: "...", userId: "..."}
   Receipt marked as seen successfully: [...]
   ```

**Step 3: Verify Database**
```sql
SELECT * FROM receipt_views WHERE user_id = 'YOUR_USER_ID';
```

You should see entries for viewed receipts.

### Still Not Working?

**Check Authentication:**
```javascript
// In browser console
const { data: { session } } = await supabase.auth.getSession();
console.log('Current user:', session?.user?.id);
```

**Manual Test Insert:**
```sql
-- Replace with your actual IDs
INSERT INTO receipt_views (user_id, expense_id)
VALUES ('your-user-id', 'some-expense-id');
```

If this fails, check:
- User is authenticated
- `auth.uid()` returns a value
- RLS policies are correct

## Issue 2: PDF Downloads Instead of Displaying

### Root Cause
PDF URLs need special parameters to display inline in iframe instead of downloading.

### Fix Applied
Added URL parameters:
```javascript
src={`${billUrl}#toolbar=0&navpanes=0&scrollbar=1`}
```

### Additional Notes

**If PDF still downloads:**
1. Check if URL is from Supabase Storage
2. Supabase Storage URLs should have proper CORS headers
3. May need to update storage bucket settings

**Storage Bucket Configuration:**
```sql
-- Check current settings
SELECT * FROM storage.buckets WHERE name = 'MTD_Bills';

-- Update if needed (in Supabase Dashboard > Storage > MTD_Bills > Settings)
-- Set "Public bucket" = true (if bills should be publicly viewable)
```

**Alternative: Use embed viewer**
```javascript
// If direct iframe doesn't work, use Google Docs Viewer
src={`https://docs.google.com/viewer?url=${encodeURIComponent(billUrl)}&embedded=true`}
```

## Testing Checklist

After running the fix:

- [ ] Run `FIX_RECEIPT_VIEWS_RLS.sql` in Supabase
- [ ] Clear browser cache and reload
- [ ] Open Project Expenses page
- [ ] Click on a paid receipt's "View Receipt"
- [ ] Check browser console for success logs
- [ ] Verify notification count decreases
- [ ] Refresh page - notification should stay decreased
- [ ] Try PDF receipt - should display in modal
- [ ] Try image receipt - should display in modal
- [ ] Log out and log back in - notification stays decreased

## Common Errors

### Error: "new row violates row-level security policy"
**Solution:** RLS policies are wrong. Run `FIX_RECEIPT_VIEWS_RLS.sql`

### Error: "relation receipt_views does not exist"
**Solution:** Run `MIGRATION_ADD_RECEIPT_VIEWS_TABLE.sql` first

### Error: "duplicate key value violates unique constraint"
**Solution:** This is expected and handled by `upsert`. If it shows as error, the insert still worked.

### PDF shows blank page
**Solution:** 
1. Check if URL is accessible in new tab
2. Check CORS headers on storage bucket
3. Try Google Docs Viewer alternative

## Debug SQL Queries

**Check all viewed receipts for a user:**
```sql
SELECT 
  rv.viewed_at,
  pe.expense_code,
  pe.merchant_name,
  pe.total_amount
FROM receipt_views rv
JOIN project_expenses pe ON pe.id = rv.expense_id
WHERE rv.user_id = 'YOUR_USER_ID'
ORDER BY rv.viewed_at DESC;
```

**Check unseen receipts for a user:**
```sql
SELECT 
  pe.id,
  pe.expense_code,
  pe.merchant_name,
  pe.total_amount,
  pe.receipt_drive_link
FROM project_expenses pe
WHERE pe.submitted_by = 'YOUR_USER_ID'
  AND pe.status = 'paid'
  AND pe.receipt_drive_link IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM receipt_views rv 
    WHERE rv.expense_id = pe.id 
    AND rv.user_id = 'YOUR_USER_ID'
  );
```

**Clear all views for testing:**
```sql
DELETE FROM receipt_views WHERE user_id = 'YOUR_USER_ID';
```
