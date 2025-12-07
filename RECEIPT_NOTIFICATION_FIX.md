# Receipt Notification Persistence Fix

## Problem
Receipt notifications were showing repeatedly even after being viewed because they were stored in `localStorage`, which:
- Doesn't sync across different browsers
- Doesn't sync across different devices
- Gets cleared when browser data is cleared

## Solution
Implemented a minimal database-backed solution to track viewed receipts persistently.

## Changes Made

### 1. Database Migration
**File:** `MIGRATION_ADD_RECEIPT_VIEWS_TABLE.sql`

Created a new table `receipt_views` to track which users have seen which receipts:

```sql
CREATE TABLE receipt_views (
  id UUID PRIMARY KEY,
  user_id TEXT NOT NULL,
  expense_id UUID NOT NULL,
  viewed_at TIMESTAMP,
  UNIQUE(user_id, expense_id)
);
```

**Features:**
- Prevents duplicate entries (UNIQUE constraint)
- Auto-cascading deletion when expense is deleted
- RLS policies for user-specific access
- Indexed for fast queries

### 2. Updated Notification Hook
**File:** `src/hooks/useExpenseNotifications.ts`

**Changed:**
- `calculateUnseenReceipts()`: Now queries `receipt_views` table instead of localStorage
- `markReceiptAsSeen()`: Now inserts into database with upsert (prevents duplicates)

**Benefits:**
- Persistent across all devices and browsers
- Syncs in real-time
- More reliable and scalable

### 3. Updated Context Type
**File:** `src/context/NotificationContext.tsx`

**Changed:**
- `markReceiptAsSeen` signature: `(expenseId: string) => void` → `(expenseId: string) => Promise<void>`

## How to Apply

### Step 1: Run Database Migration
Execute `MIGRATION_ADD_RECEIPT_VIEWS_TABLE.sql` in your Supabase SQL editor:

1. Go to Supabase Dashboard → SQL Editor
2. Copy and paste the entire migration file
3. Click "Run" to execute

### Step 2: Deploy Code Changes
The code changes are already applied:
- ✅ `useExpenseNotifications.ts` - Updated to use database
- ✅ `NotificationContext.tsx` - Updated type signature
- ✅ `ProjectExpenses.tsx` - Already uses the context (no changes needed)

### Step 3: Verify
1. Log in and view a paid receipt
2. Log out and log back in
3. Notification should NOT reappear
4. Try in a different browser - same result

## Migration Notes

### Data Migration (Optional)
If you want to preserve existing localStorage data:

```typescript
// Run this once in browser console for each logged-in user
const currentUserId = 'USER_ID_HERE';
const seenKey = `seen_receipts_${currentUserId}`;
const seenReceipts = JSON.parse(localStorage.getItem(seenKey) || '[]');

// Bulk insert into database
const { data, error } = await supabase
  .from('receipt_views')
  .insert(
    seenReceipts.map(expenseId => ({
      user_id: currentUserId,
      expense_id: expenseId
    }))
  );
```

### Cleanup (Optional)
After migration is complete and verified, you can clean up localStorage:

```typescript
// Remove old localStorage keys
Object.keys(localStorage).forEach(key => {
  if (key.startsWith('seen_receipts_')) {
    localStorage.removeItem(key);
  }
});
```

## Testing Checklist

- [x] Compile without errors
- [ ] Run database migration
- [ ] View a paid receipt → notification disappears
- [ ] Refresh page → notification stays gone
- [ ] Log out and log back in → notification stays gone
- [ ] Open in different browser → notification stays gone
- [ ] View same receipt on mobile → notification stays gone

## Performance Impact

**Minimal:**
- Each view check adds 2 lightweight queries (expenses + views)
- Queries are indexed and fast
- Upsert on mark-as-seen prevents duplicate inserts
- Real-time subscription unchanged

## Rollback Plan

If issues occur, you can quickly rollback:

1. Revert code changes in `useExpenseNotifications.ts`
2. Keep the `receipt_views` table (harmless)
3. System falls back to localStorage

## Future Enhancements

- Add cleanup job to remove views for deleted expenses (already handled by CASCADE)
- Add analytics on receipt view patterns
- Add "mark all as read" feature
- Add view history tracking
