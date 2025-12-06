# Notification System - Global Implementation

## Changes Made

### ✅ Fixed Issues:
1. **Notification badge now shows on ALL pages** (not just when Project Expenses is active)
2. **Total notification count displayed in navbar** with bell icon
3. **Centralized notification management** using React Context

## Architecture

### New Files Created:

1. **`src/context/NotificationContext.tsx`**
   - Global notification state management
   - Provides notification counts to all components
   - Calculates total notifications across all types
   - Exports `useNotifications()` hook

### Modified Files:

1. **`src/components/Sidebar.tsx`**
   - Now uses `useNotifications()` hook instead of props
   - Removed `notificationCounts` prop requirement
   - Added `Bell` icon import
   - Notification badge shows on all pages now
   - Added total notification count in header with bell icon

2. **`src/App.tsx`**
   - Added `NotificationProvider` import
   - Wrapped app with `<NotificationProvider>` (inside AuthProvider, outside Filter/Project providers)
   - Provider structure:
     ```
     AuthProvider
       └── NotificationProvider
           └── FilterProvider
               └── ProjectProvider
     ```

3. **`src/wrappers/ProjectExpensesWrapper.tsx`**
   - Simplified - no longer needs to pass notification counts
   - Uses global context automatically

4. **`src/hooks/useExpenseNotifications.ts`**
   - Already existed, no changes needed
   - Used by NotificationContext

## How It Works Now

### Provider Hierarchy:
```
App
├── AuthProvider (authentication)
│   └── NotificationProvider (notifications - needs auth)
│       └── FilterProvider (filters)
│           └── ProjectProvider (projects)
│               └── AppRoutes (all pages)
```

### Notification Flow:

1. **User submits expense** → Expense stored in database
2. **Admin approves** → Status changes to 'approved'
3. **Accountant marks as paid + uploads receipt** → Status = 'paid', receipt_drive_link set
4. **Real-time subscription fires** → NotificationContext detects new receipt
5. **Notification count updates** → Badge appears on ALL pages
6. **User clicks "Project Expenses"** → Can see the badge
7. **User clicks "View Receipt"** → Receipt marked as seen, count decreases

### Display Logic:

#### Sidebar Menu Item:
- **Red badge** (e.g., `5`) when NOT on that page and has notifications
- **White badge** (e.g., `5`) when ON that page and has notifications
- **No badge** when no notifications

#### Header (Navbar):
- **Bell icon with red badge** showing total notifications
- **Only shows when totalNotifications > 0**
- Badge shows sum of all notification types

## Testing

### Test Scenario 1: Badge Always Visible
1. As PM: Submit an expense
2. As Admin: Approve it
3. As Accountant: Mark as paid + upload receipt
4. As PM: 
   - Go to Dashboard → Should see `Project Expenses (1)` in sidebar
   - Go to Calendar → Should STILL see `Project Expenses (1)` in sidebar
   - Go to any page → Should ALWAYS see the badge

### Test Scenario 2: Total Notification Count
1. Have 5 unseen receipts
2. Go to any page
3. Check header → Should see bell icon with `(5)`
4. Click "View Receipt" on one expense
5. Check header → Should now show `(4)`

### Test Scenario 3: Multiple Users
1. User A submits 2 expenses → Both get paid
2. User B submits 3 expenses → All get paid
3. User A logs in → Sees `(2)` notifications (only their receipts)
4. User B logs in → Sees `(3)` notifications (only their receipts)

## Future Enhancements

### Task Notifications (Coming Soon):
```typescript
// In NotificationContext.tsx, add:
const { unseenTasksCount } = useTaskNotifications();

const notificationCounts = {
  'project-expenses': unseenReceiptsCount,
  'tasks': unseenTasksCount, // 👈 Add this
};
```

### More Notification Types:
- Calendar event reminders
- Real-time update notifications
- Daily report approvals
- Budget alerts
- Deadline warnings

## API Reference

### `useNotifications()` Hook

Returns:
```typescript
{
  expenseNotifications: number;      // Count of unseen expense receipts
  totalNotifications: number;         // Total across all types
  notificationCounts: Record<string, number>; // Per-menu-item counts
  markReceiptAsSeen: (expenseId: string) => void; // Mark receipt as viewed
}
```

### Usage in Components:
```typescript
import { useNotifications } from '../context/NotificationContext';

function MyComponent() {
  const { totalNotifications, notificationCounts } = useNotifications();
  
  return (
    <div>
      Total: {totalNotifications}
      Expenses: {notificationCounts['project-expenses']}
    </div>
  );
}
```

## Troubleshooting

### Badge not showing on some pages?
- Check if NotificationProvider wraps those routes
- Verify AuthProvider is parent of NotificationProvider
- Check console for errors

### Total count wrong?
- Refresh the page
- Check localStorage: `localStorage.getItem('seen_receipts_' + userId)`
- Verify real-time subscription is active

### Badge shows but no receipts?
- Check database: receipts should have status='paid' AND receipt_drive_link
- Verify expense was submitted by current user
- Check if receipt was already marked as seen in localStorage
