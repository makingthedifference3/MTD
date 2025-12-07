# My Tasks - Quick Start Guide

## 1. Run Database Migration

Open **Supabase Dashboard** → **SQL Editor** → **New Query**

Copy and paste the entire contents of `MIGRATION_ADD_TASK_VIEWS_TABLE.sql` and click **Run**.

## 2. Verify Migration

Run this query to verify the table was created:

```sql
-- Check table exists
SELECT * FROM task_views LIMIT 1;

-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'task_views';
```

You should see 4 policies.

## 3. Test the Feature

### As Accountant:
1. Login as accountant user
2. Look at header bell icon - should show: **Expense Notifications + Task Notifications**
3. Click "My Tasks" in sidebar - should show badge if there are unseen tasks
4. View tasks assigned to you
5. Click on any task card - notification count should decrease

### As Project Manager/Team Member:
1. Login as PM or team member
2. Look at header bell icon - should show: **Task Notifications only** (no expenses)
3. Click "My Tasks" in sidebar
4. View and interact with tasks

### As Admin:
1. Login as admin
2. "My Tasks" menu item should NOT appear
3. Header bell icon should NOT show any notifications

## 4. Features Available

### Filters:
- **CSR Partner**: Filter by company funding the project
- **Toll/Subcompany**: Filter by toll/subcompany (if applicable)
- **Project**: Filter by specific project
- **Due Date**: Filter by due date range (All, Overdue, Today, This Week, This Month)

### Task Information:
- Task title and code
- Status badge (Not Started, In Progress, Priority, Completed, Blocked)
- Project format: "Project Name - Toll/Partner - Location"
- Priority level (color-coded)
- Due date
- Overdue warnings (red badge)
- Due soon warnings (yellow/orange badge)

### Statistics Cards:
- Total Tasks
- Not Started
- In Progress
- Priority
- Completed

## 5. Notification Behavior

### New Task Assigned:
- Notification count increases automatically
- Badge appears on "My Tasks" menu item
- Badge appears on header bell icon

### Task Viewed:
- Click on task card
- Notification count decreases immediately
- Persists across:
  - Page refreshes
  - Browser restarts
  - Different devices
  - Different sessions

### Role-Based Display:
- **Admin**: No task notifications
- **Accountant**: Expense notifications + Task notifications
- **Project Manager**: Task notifications only
- **Team Member**: Task notifications only
- **Data Manager**: Task notifications only

## 6. Troubleshooting

### Notifications not decreasing?
1. Open browser DevTools (F12)
2. Go to Console tab
3. Click on a task
4. Look for:
   - "Marking task as seen: { taskId: ..., userId: ... }"
   - "Task marked as seen successfully: [...]"
5. If you see errors, check:
   - Migration was run successfully
   - RLS policies use `auth.uid()::text`
   - User is logged in

### Tasks not showing?
1. Verify tasks are assigned to your user ID
2. Check database:
   ```sql
   SELECT * FROM tasks WHERE assigned_to = 'your-user-id';
   ```
3. Make sure `is_active = true` on tasks

### Filters not working?
1. Check console for errors
2. Verify data exists for selected filters
3. Try selecting "All" in all dropdowns first

## 7. Database Queries for Testing

### Check your unseen tasks:
```sql
SELECT t.* 
FROM tasks t
LEFT JOIN task_views tv ON t.id = tv.task_id AND tv.user_id = 'your-user-id'
WHERE t.assigned_to = 'your-user-id' 
  AND tv.id IS NULL
  AND t.is_active = true;
```

### Check your viewed tasks:
```sql
SELECT t.*, tv.viewed_at
FROM tasks t
INNER JOIN task_views tv ON t.id = tv.task_id
WHERE tv.user_id = 'your-user-id'
ORDER BY tv.viewed_at DESC;
```

### Clear all viewed tasks (for testing):
```sql
DELETE FROM task_views WHERE user_id = 'your-user-id';
```

## 8. Next Steps

After running the migration and testing:

1. ✅ Verify notifications work correctly
2. ✅ Test with different user roles
3. ✅ Test filters and sorting
4. ✅ Verify persistence across sessions
5. ✅ Check real-time updates when new tasks assigned

**Everything should be working!** If you encounter issues, check the console logs and database queries above.
