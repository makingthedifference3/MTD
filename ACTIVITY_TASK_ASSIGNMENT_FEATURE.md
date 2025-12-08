# Activity Task Assignment Feature

## Overview
This feature allows you to assign activities to team members directly from the Project Timeline page. When an activity is assigned, a task is automatically created in the tasks table and will appear in the assignee's "My Tasks" and "To-Do List" sections.

## Key Features

### 1. **Assign Activity to Team Member**
- Select a team member from the project's team to assign the activity as a task
- Only active team members of the selected project are shown
- Optional feature - you can create activities without assignments

### 2. **Task Due Date**
- Set a specific due date for the task
- Required when assigning to a team member
- Minimum date is today (prevents setting past dates)

### 3. **Task Creation**
- Automatically creates a task in the `tasks` table
- Task inherits:
  - **Title** from activity title
  - **Description** from activity description + all task items
  - **Priority** from activity priority
  - **Start Date** from activity start date (if provided)
  - **Due Date** from task due date field
  - **Assigned To** from selected team member
  - **Assigned By** automatically set to current user
  - **Project** from current project context

### 4. **Visibility**
- Tasks appear in assignee's **My Tasks** page (`/my-tasks`)
- Tasks appear in **To-Do List** page (`/todo`)
- Real-time updates when new tasks are created

## User Interface

### Modal Form Layout
```
┌─────────────────────────────────────────────────────┐
│  Add/Edit Activity                              [X] │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Activity Title *                                   │
│  [________________________________]                 │
│                                                     │
│  Priority                                           │
│  [Medium ▼]                                         │
│                                                     │
│  Description (Optional)                             │
│  [________________________________]                 │
│  [________________________________]                 │
│                                                     │
│  Task Items (Checkable Points)                      │
│  ☐ Item 1                              [Edit] [×]   │
│  ☑ Item 2 (completed)                  [Edit] [×]   │
│  [Add new item...] [+]                              │
│                                                     │
│  Start Date        End Date                         │
│  [__________]      [__________]                     │
│                                                     │
│  Responsible Person (Display Only)                  │
│  [John Doe : Project Manager ▼]                    │
│                                                     │
├─────────────────────────────────────────────────────┤
│  🔔 Create Task Assignment                          │
│  Assign this activity to a team member and it will  │
│  appear in their task list                          │
├─────────────────────────────────────────────────────┤
│                                                     │
│  👤 Assign Task To (Optional)                       │
│  [Don't create a task ▼]                           │
│  Options:                                           │
│  - Jane Smith : Developer                           │
│  - Bob Wilson : Designer                            │
│                                                     │
│  ✓ A task will be created and assigned to this     │
│    team member                                      │
│                                                     │
│  ⏰ Task Due Date *                                  │
│  [2025-12-15]                                       │
│  The assigned team member will receive a            │
│  notification about this task                       │
│                                                     │
├─────────────────────────────────────────────────────┤
│                         [Cancel] [Create Activity]  │
└─────────────────────────────────────────────────────┘
```

## Workflow

### Creating an Activity with Task Assignment

1. **Navigate to Project Timeline**
   - Select CSR Partner → Toll (if applicable) → Project Folder → Specific Project
   - Click "Activities" view

2. **Click "Add Activity" Button**
   - Located in the top-right corner of the Activities view

3. **Fill Activity Details**
   - Enter Activity Title (required)
   - Select Priority (Low, Medium, High, Critical)
   - Add Description (optional)
   - Add Task Items as checkable points (optional)
   - Set Start Date and End Date (optional)
   - Select Responsible Person for display (optional)

4. **Assign to Team Member (Optional)**
   - Scroll down to "Create Task Assignment" section
   - Select a team member from "Assign Task To" dropdown
   - Set "Task Due Date" (required when assigning)
   - A green checkmark message appears confirming task creation

5. **Save Activity**
   - Click "Create Activity" button
   - Activity is created in project_activities table
   - Task is created in tasks table (if assigned)
   - Assignee can now see the task in their task list

### What Happens Behind the Scenes

```
User Creates Activity with Assignment
           ↓
Activity Saved to project_activities table
           ↓
Task Items Saved to project_activity_items table
           ↓
Task Created in tasks table
  - task_code: Auto-generated unique code
  - project_id: Current project
  - title: From activity
  - description: Activity description + task items
  - assigned_to: Selected team member ID
  - assigned_by: Current user ID
  - due_date: From task due date field
  - status: 'not_started'
  - priority: From activity priority
           ↓
Task Appears in Assignee's Task Lists
  - My Tasks page (/my-tasks)
  - To-Do List page (/todo)
```

## Technical Implementation

### Files Modified
- **src/pages/ProjectTimelinePage.tsx**
  - Added imports: `createTask`, `useAuth`, `UserPlus`, `Bell` icons
  - Added form fields: `assigned_to`, `task_due_date`
  - Updated `handleAddActivity()` to reset new fields
  - Updated `handleEditActivity()` to include assignment fields
  - Updated `handleSubmit()` to create task when assigned
  - Added UI components for task assignment section

### Database Tables Used
1. **project_activities** - Stores the activity information
2. **project_activity_items** - Stores checkable task items
3. **tasks** - Stores the created task for the assignee

### Service Functions Used
- `createTask()` from `tasksService.ts` - Creates new task
- `createActivity()` from `projectActivitiesService.ts` - Creates activity
- `createActivityItem()` from `projectActivitiesService.ts` - Creates task items

## Benefits

✅ **No Duplicate Entry** - Create activity and task in one action
✅ **Better Tracking** - Activities tracked in timeline, tasks tracked in task lists
✅ **Team Visibility** - Assigned members see tasks immediately
✅ **Clear Responsibility** - Both display responsibility and task assignment
✅ **Audit Trail** - Track who assigned what to whom
✅ **Flexible** - Can create activities without tasks
✅ **User Friendly** - Clear UI with helpful prompts and confirmations

## UI/UX Enhancements

### Visual Indicators
- 🔔 **Bell Icon** - Indicates task assignment section
- 👤 **UserPlus Icon** - Shows assign to member field
- ⏰ **Clock Icon** - Indicates due date field
- ✓ **Checkmark Message** - Confirms task will be created
- **Emerald Borders** - Highlight assignment fields vs regular fields
- **Conditional Display** - Due date only shows when member is selected

### User Guidance
- Section header explains task assignment purpose
- Placeholder text: "Don't create a task" for optional assignment
- Helper text: "The assigned team member will receive a notification"
- Success message with checkmark when member is selected
- Required indicator (*) on due date when assignment is active

## Error Handling

- ✅ Activity creation succeeds even if task creation fails
- ✅ User is alerted if task creation fails separately
- ✅ Prevents empty task items from being saved
- ✅ Validates due date is not in the past
- ✅ Requires due date only when assignment is made

## Future Enhancements

- [ ] Send email/in-app notification to assignee
- [ ] Allow editing task assignment after activity creation
- [ ] Bulk assign multiple activities to team members
- [ ] Task templates for common activity types
- [ ] Integration with project timeline Gantt chart
- [ ] Task dependency visualization
- [ ] Recurring task creation for periodic activities

## Testing Checklist

- [ ] Create activity without assignment (should work as before)
- [ ] Create activity with assignment (task should appear in My Tasks)
- [ ] Verify task appears in assignee's To-Do List
- [ ] Verify task contains activity description + items
- [ ] Verify task priority matches activity priority
- [ ] Test with team member who has multiple roles
- [ ] Test error handling when task creation fails
- [ ] Verify assigned_by is set to current user
- [ ] Test date validation (no past dates)
- [ ] Verify due date is required when assignment is selected

## Support

For questions or issues:
1. Check console for error messages
2. Verify team members are assigned to the project
3. Ensure user has permission to create activities and tasks
4. Check database for created tasks using task_code

---

**Version:** 1.0  
**Last Updated:** December 8, 2025  
**Author:** Development Team
