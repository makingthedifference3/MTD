# Activity Task Assignment - Visual Guide

## Feature Location

```
Project Timeline Page → Activities View → Add Activity Button
```

## Before & After Comparison

### BEFORE (Old Form)
```
┌────────────────────────────────────┐
│ Add New Activity               [×] │
├────────────────────────────────────┤
│ Activity Title *                   │
│ Priority                           │
│ Description                        │
│ Task Items                         │
│ Start Date / End Date              │
│ Responsible Person                 │
│                                    │
│           [Cancel] [Create]        │
└────────────────────────────────────┘

Issue: Activity created but no automatic
task assignment for team members
```

### AFTER (New Enhanced Form)
```
┌────────────────────────────────────┐
│ Add New Activity               [×] │
├────────────────────────────────────┤
│ Activity Title *                   │
│ Priority                           │
│ Description                        │
│ Task Items                         │
│ Start Date / End Date              │
│ Responsible Person (Display)       │
│                                    │
├────────────────────────────────────┤
│ 🔔 Create Task Assignment          │
│ Assign this activity to a team     │
│ member and it will appear in       │
│ their task list                    │
├────────────────────────────────────┤
│ 👤 Assign Task To (Optional)       │
│ [Select team member ▼]             │
│                                    │
│ ⏰ Task Due Date * ← Appears when  │
│ [YYYY-MM-DD]        member selected│
│                                    │
│           [Cancel] [Create]        │
└────────────────────────────────────┘

✓ Activity + Task created in one action!
```

## Step-by-Step Visual Workflow

### Step 1: Navigate to Activities
```
Home
  └─ Project Timeline
      └─ Select CSR Partner (e.g., "Agarwal Foundation")
          └─ Select Toll/Subcompany (if applicable)
              └─ Select Project Folder (e.g., "Shoonya")
                  └─ Select Specific Project (e.g., "Shoonya (Kurnool)")
                      └─ Activities View ← You are here!
                          
┌──────────────────────────────────────────┐
│ 📊 Stats:                [+ Add Activity]│
│ Total: 5 | Completed: 2 | In Progress: 3│
├──────────────────────────────────────────┤
│ ☐ Procurement (High)                     │
│ ☑ Site Survey (Medium)                   │
│ ☐ Execution (High)                       │
└──────────────────────────────────────────┘
```

### Step 2: Click "Add Activity"
```
Button appears in top-right corner:

┌─────────────────────────┐
│ [+ Add Activity]        │ ← Click here
└─────────────────────────┘

Modal opens with form ↓
```

### Step 3: Fill Basic Activity Info
```
┌────────────────────────────────────────┐
│ Activity Title *                       │
│ [Equipment Purchase and Installation]  │ ← Type title
│                                        │
│ Priority                               │
│ [High ▼]                              │ ← Select priority
│                                        │
│ Description (Optional)                 │
│ [Purchase and install water           │
│  purification equipment for the        │ ← Add description
│  community center]                     │
│                                        │
│ Task Items (Checkable Points)          │
│ ☐ Get vendor quotations    [Edit] [×] │
│ ☐ Approve budget           [Edit] [×] │ ← Add items
│ ☐ Place order             [Edit] [×] │
│ [Add a task item...] [+]              │
└────────────────────────────────────────┘
```

### Step 4: Set Dates
```
┌────────────────────────────────────────┐
│ Start Date        End Date             │
│ [2025-12-10]      [2025-12-25]        │ ← Pick dates
└────────────────────────────────────────┘
```

### Step 5: Assign to Team Member (NEW!)
```
┌────────────────────────────────────────┐
│ ══════════════════════════════════════ │
│ 🔔 Create Task Assignment              │
│ Assign this activity to a team member  │
│ and it will appear in their task list  │
│ ══════════════════════════════════════ │
│                                        │
│ 👤 Assign Task To (Optional)           │
│ [Don't create a task ▼]               │
│   ↓ Click to see team members          │
│   ├─ Jane Smith : Developer            │
│   ├─ Bob Wilson : Designer             │ ← Select member
│   ├─ Alice Johnson : Engineer          │
│   └─ Mike Brown : Coordinator          │
└────────────────────────────────────────┘

After selecting a team member:

┌────────────────────────────────────────┐
│ 👤 Assign Task To (Optional)           │
│ [Jane Smith : Developer ▼]            │
│                                        │
│ ✓ A task will be created and assigned │ ← Confirmation
│   to this team member                  │
│                                        │
│ ⏰ Task Due Date *                      │ ← Due date appears!
│ [2025-12-20]                          │ ← Must set date
│ The assigned team member will receive  │
│ a notification about this task         │
└────────────────────────────────────────┘
```

### Step 6: Save Activity
```
┌────────────────────────────────────────┐
│                                        │
│        [Cancel]  [Create Activity]     │ ← Click Create
└────────────────────────────────────────┘

Processing...
├─ ✓ Activity created
├─ ✓ Task items saved
└─ ✓ Task assigned to Jane Smith

Success! Activity and task created.
```

## What the Assignee Sees

### In "My Tasks" Page
```
┌──────────────────────────────────────────────────────┐
│ My Tasks                                      Filter │
├──────────────────────────────────────────────────────┤
│ ┌──────────────────────────────────────────────────┐│
│ │ Equipment Purchase and Installation          NEW ││
│ │ High Priority | Due: Dec 20, 2025                ││
│ │ Project: Shoonya (Kurnool)                       ││
│ │ Assigned by: Current User                        ││
│ │                                                  ││
│ │ Description:                                     ││
│ │ Purchase and install water purification          ││
│ │ equipment for the community center               ││
│ │                                                  ││
│ │ Task Items:                                      ││
│ │ 1. Get vendor quotations                         ││
│ │ 2. Approve budget                                ││
│ │ 3. Place order                                   ││
│ │                                                  ││
│ │ [Mark In Progress] [View Details]                ││
│ └──────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────┘
```

### In "To-Do List" Page
```
┌──────────────────────────────────────────────────────┐
│ To-Do List                              [+ Add Task] │
├──────────────────────────────────────────────────────┤
│ Not Started (1)                                      │
│ ┌──────────────────────────────────────────────────┐│
│ │ ☐ Equipment Purchase and Installation            ││
│ │   High | Due: 12 days | Shoonya (Kurnool)       ││
│ └──────────────────────────────────────────────────┘│
│                                                      │
│ In Progress (0)                                      │
│ (empty)                                             │
│                                                      │
│ Completed (0)                                        │
│ (empty)                                             │
└──────────────────────────────────────────────────────┘
```

## Key UI Elements Explained

### 1. Section Divider
```
├────────────────────────────────────────┤
│ 🔔 Create Task Assignment              │
│ Assign this activity to a team member  │
│ and it will appear in their task list  │
├────────────────────────────────────────┤
```
- **Bell Icon (🔔)**: Indicates this section creates notifications/tasks
- **Blue Background**: Visually separates from activity details
- **Explanatory Text**: Tells users what this section does

### 2. Dropdown States
```
Not Selected:
┌────────────────────────┐
│ Don't create a task ▼  │
└────────────────────────┘

Selected:
┌────────────────────────┐
│ Jane Smith : Developer▼│
└────────────────────────┘
```

### 3. Conditional Field (Due Date)
```
Before Selection: (Hidden)

After Selection:
┌────────────────────────────────────┐
│ ⏰ Task Due Date *                  │
│ [2025-12-20]                      │
│ The assigned team member will      │
│ receive a notification about this  │
│ task                               │
└────────────────────────────────────┘
```

### 4. Confirmation Message
```
✓ A task will be created and assigned
  to this team member
  
✓ = Checkmark (success indicator)
Green text = Positive confirmation
```

## Color Coding

### Form Elements
- **Gray Borders**: Regular activity fields
- **Emerald/Green Borders**: Task assignment fields
- **Emerald Background**: Section headers
- **Green Text**: Confirmation messages
- **Amber Text**: Warning/info messages

### Priority Colors
- **Red**: Critical
- **Orange**: High
- **Blue**: Medium  
- **Green**: Low

### Status Colors
- **Gray**: Not Started
- **Blue**: In Progress
- **Green**: Completed
- **Amber**: On Priority
- **Red**: Blocked

## Responsive Design

### Desktop View (> 768px)
```
┌────────────────────────────────────────┐
│ Full width form with spacious layout   │
│ Side-by-side date fields               │
│ Wide dropdown menus                    │
└────────────────────────────────────────┘
```

### Mobile View (< 768px)
```
┌────────────────────┐
│ Stacked layout     │
│ Dates stack        │
│ vertically         │
│ Full-width buttons │
└────────────────────┘
```

## Accessibility Features

✓ **Keyboard Navigation**: Tab through all fields
✓ **Labels**: Clear labels for screen readers
✓ **Required Indicators**: Asterisk (*) on required fields
✓ **Color + Icons**: Not relying on color alone
✓ **Focus States**: Visible focus indicators
✓ **Helper Text**: Descriptive guidance text

## Pro Tips

💡 **Tip 1**: You can create activities without tasks - just leave "Assign Task To" as "Don't create a task"

💡 **Tip 2**: Task items from the activity are automatically included in the task description

💡 **Tip 3**: Priority level is inherited from activity to task automatically

💡 **Tip 4**: Use "Responsible Person" for display purposes, "Assign Task To" for actual task assignment

💡 **Tip 5**: Set realistic due dates - they can't be in the past!

---

**Need Help?** Check ACTIVITY_TASK_ASSIGNMENT_FEATURE.md for detailed documentation
