# Project Expenses Notification System

## Overview
A notification system that alerts users when their submitted expenses have been paid and receipts are uploaded by the accountant.

## Features

### 1. **Receipt Notification Badge**
- Shows a red badge with count on "Project Expenses" menu item in sidebar
- Example: `Project Expenses (2)` indicates 2 unseen receipts
- Badge appears only when there are new receipts to view

### 2. **Automatic Tracking**
- Tracks which receipts each user has viewed using localStorage
- Real-time updates when new receipts are uploaded
- Separate tracking per user (multi-user safe)

### 3. **Mark as Seen**
- Receipt automatically marked as "seen" when user clicks "View Receipt"
- Notification count decreases immediately
- Seen status persists across browser sessions

## How It Works

### For Project Managers/Users:
1. Submit expense through Project Expenses page
2. Wait for Admin → Accountant approval chain
3. When Accountant marks as paid and uploads receipt:
   - Notification badge appears on sidebar: `Project Expenses (1)`
4. Click on "Project Expenses" menu
5. Click "Paid" status card to see paid expenses
6. Click "View Receipt" on any expense
7. Notification count decreases by 1

### Technical Implementation:

#### Files Created/Modified:

1. **`src/hooks/useExpenseNotifications.ts`** (NEW)
   - Custom React hook for managing notifications
   - Real-time subscription to expense updates
   - localStorage integration for persistence

2. **`src/wrappers/ProjectExpensesWrapper.tsx`** (NEW)
   - Wrapper component that combines Sidebar + ProjectExpenses
   - Passes notification counts to Sidebar

3. **`src/components/Sidebar.tsx`** (MODIFIED)
   - Added `notificationCounts` prop
   - Displays red badge with count next to menu items
   - Badge styling: active = white background, inactive = red background

4. **`src/pages/ProjectExpenses.tsx`** (MODIFIED)
   - Imports and uses `useExpenseNotifications` hook
   - Calls `markReceiptAsSeen()` when viewing receipts
   - Added timestamp to bill upload filenames

5. **`src/App.tsx`** (MODIFIED)
   - Uses `ProjectExpensesWrapper` instead of direct component

## Data Storage

### localStorage Key Format:
```
seen_receipts_{userId}
```

### Value Format:
```json
["expense-id-1", "expense-id-2", "expense-id-3"]
```

## Real-time Updates

The system uses Supabase real-time subscriptions to instantly update notification counts when:
- An expense status changes to "paid"
- A receipt is uploaded

## Future Enhancements

### Tasks Notification (Coming Soon)
Same notification system will be implemented for tasks:
- Show notification when task is assigned
- Show notification when task is updated
- Badge format: `My Tasks (3)`

## Testing

To test the notification system:

1. **As Project Manager:**
   - Submit an expense
   
2. **As Admin:**
   - Approve the expense
   
3. **As Accountant:**
   - Mark as paid and upload receipt
   
4. **As Project Manager (again):**
   - Check sidebar → should see `Project Expenses (1)`
   - Click on Project Expenses
   - Click "Paid" status card
   - Click "View Receipt"
   - Badge should disappear

## Troubleshooting

### Badge not appearing?
- Check if expense status is "paid"
- Check if receipt_drive_link exists
- Check if expense was submitted by current user
- Clear localStorage and refresh

### Badge not disappearing?
- Ensure you clicked "View Receipt" (not just "View Bill")
- Check browser console for errors
- Check localStorage for the seen_receipts key

### Count is wrong?
- Refresh the page
- Clear localStorage: `localStorage.removeItem('seen_receipts_' + userId)`
