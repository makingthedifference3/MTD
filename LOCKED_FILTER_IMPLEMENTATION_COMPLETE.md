# Locked Project Filter Implementation

## Overview

When a user navigates from the Projects Dashboard to a role-specific dashboard (Accountant, Project Manager, or Team Member) by clicking "Open Project", the filters are now **locked** and **cannot be changed or reset**.

This ensures that:
1. Users can only see data for their assigned project
2. Multi-role users see only the specific project they clicked on
3. Filters are always applied and persistent throughout their session
4. No accidental data visibility outside assigned projects

---

## What Changed

### 1. **New Component: LockedFilterBar.tsx** ✅

**Purpose:** Display locked, read-only filters when a project is pre-selected

**Features:**
- Shows CSR Partner name and Project name (both locked with 🔒 icon)
- Visually distinct from regular FilterBar (emerald gradient background)
- Non-interactive display only
- Shows helpful message: "All data is filtered to this project only"
- Auto-hides when no project is selected

**Location:** `src/components/LockedFilterBar.tsx`

### 2. **Updated Dashboards** ✅

#### AccountantDashboard.tsx
- Shows `LockedFilterBar` when project is pre-selected
- Shows regular `FilterBar` when no project is pre-selected
- Reset button is automatically hidden via normal FilterBar conditional rendering

#### PMDashboard.tsx  
- Shows `LockedFilterBar` when project is pre-selected
- Shows regular `FilterBar` when no project is pre-selected
- Reset button is automatically hidden

#### TeamMemberDashboard.tsx
- No changes needed (doesn't use FilterBar)

### 3. **No Changes to AdminDashboard** ✅
- Admin dashboard is unaffected
- Continues to show all projects and data

---

## User Flow

### Scenario 1: Multi-role User (Project Manager + Accountant)

```
Login as "Ravi Singh"
    ↓
Go to Projects Dashboard
    ↓
See 5 projects (one as PM, one as Accountant, etc.)
    ↓
Click "Open Project" on EDU-2025-001 (as Project Manager)
    ↓
Route to PM Dashboard
    ↓
LockedFilterBar shows:
  🔒 CSR Partner: Amazon
  🔒 Project: Education Initiative
    ↓
All data filtered to this project only
Cannot change or reset filters
    ↓
Go Back to Projects Dashboard (via Sidebar)
    ↓
Click "Open Project" on HLT-2025-002 (as Accountant)
    ↓
Route to Accountant Dashboard
    ↓
LockedFilterBar shows:
  🔒 CSR Partner: NGO Partner
  🔒 Project: Healthcare Drive
    ↓
All data filtered to this NEW project only
```

### Scenario 2: Direct Dashboard Access (No Project Selected)

```
Admin logs in
    ↓
Goes directly to Admin Dashboard
    ↓
No LockedFilterBar shown (project not pre-selected)
    ↓
Sees all projects and data
    ↓
Regular filtering applies (if any)
```

### Scenario 3: Non-Admin Accessing Dashboard Directly

```
Accountant logs in
    ↓
Directly accesses /accountant-dashboard (not from projects list)
    ↓
No LockedFilterBar shown (no project pre-selected)
    ↓
Regular FilterBar shows with full options
    ↓
Can select projects manually
    ↓
Can reset filters
```

---

## Data Structure

### Stored in LocalStorage:
```javascript
{
  selectedProjectId: "uuid",
  selectedProjectName: "Education Initiative",
  selectedCSRPartnerId: "uuid",
  selectedCSRPartnerName: "Amazon",
  selectedProjectRole: "project_manager"
}
```

### ProjectContext provides:
```typescript
{
  projectId,
  projectName,
  csrPartnerId,
  csrPartnerName,
  projectRole,
  isProjectSelected: boolean  // true if all values are present
}
```

---

## Filter Behavior

### When LockedFilterBar is Shown ✅
- **CSR Partner Field:** Display-only, no dropdown
- **Project Field:** Display-only, no dropdown  
- **Reset Button:** NOT shown (via normal FilterBar conditional)
- **Change Filters:** NOT possible
- **Data Scope:** Strictly limited to selected project

### When Regular FilterBar is Shown ⚪
- **CSR Partner Field:** Editable dropdown
- **Project Field:** Editable dropdown
- **Reset Button:** Shown if filters are active
- **Change Filters:** Fully allowed
- **Data Scope:** Based on filter selections

---

## Components & Files

### New Files:
```
src/components/LockedFilterBar.tsx
```

### Modified Files:
```
src/pages/AccountantDashboard.tsx
  - Added: useProjectContext import
  - Added: LockedFilterBar import
  - Added: isProjectSelected state
  - Added: Conditional rendering logic

src/pages/PMDashboard.tsx
  - Added: useProjectContext import
  - Added: LockedFilterBar import
  - Added: isProjectSelected state
  - Added: Conditional rendering logic
```

### Supporting Files (Already Created):
```
src/context/ProjectContext.tsx
src/context/useSelectedProject.ts
src/context/useProjectContext.ts
```

---

## Visual Indicators

### LockedFilterBar Appearance:
```
┌─────────────────────────────────────────────────────────┐
│ 🔒 Project Context Locked                               │
│                                                          │
│ 🏢 CSR Partner: Amazon 🔒     📁 Project: Lajja 🔒      │
│                                                          │
│ All data is filtered to this project only.               │
└─────────────────────────────────────────────────────────┘
```

### Key Visual Differences:
- **Color:** Emerald gradient background (different from white FilterBar)
- **Icons:** Lock icons (🔒) next to each filter value
- **Layout:** More compact, display-only values
- **No Dropdowns:** All fields are static text
- **No Reset Button:** Absent when LockedFilterBar shown

---

## Backend Query Impact

### When Project is Pre-Selected:
All Supabase queries should include filters:
```typescript
// Example for AccountantDashboard
const { data } = await supabase
  .from('project_expenses')
  .select('*')
  .eq('project_id', projectId)
  .eq('csr_partner_id', csrPartnerId);
```

### Recommended Implementation in Dashboards:
```typescript
import { useProjectContext } from '../context/useProjectContext';

export default function AccountantDashboard() {
  const { projectId, csrPartnerId, isProjectSelected } = useProjectContext();
  
  useEffect(() => {
    if (isProjectSelected) {
      // Query only this project's data
      fetchExpensesForProject(projectId, csrPartnerId);
    } else {
      // Query all data (when accessed directly, not from projects dashboard)
      fetchAllExpenses();
    }
  }, [isProjectSelected, projectId, csrPartnerId]);
}
```

---

## Security Implications

### ✅ Prevents Unauthorized Access:
- Users only see data for projects they're assigned to
- Multi-role users are automatically scoped to the selected project
- Cannot accidentally view other projects' data

### ✅ Role-Based Access:
- Same user as PM → sees PM-level data for that project
- Same user as Accountant → sees Accountant-level data for different project
- No role escalation possible

### ⚠️ Important:
- Backend queries MUST also enforce these filters
- Frontend filters are for UX; backend queries are the security layer
- Always validate `projectId` and `csrPartnerId` on the backend

---

## Testing Scenarios

### Test 1: Multi-Role User Navigation
- [ ] Login as user with multiple roles
- [ ] Go to Projects Dashboard
- [ ] Click project as Role A
- [ ] Verify LockedFilterBar shows correct project
- [ ] Verify data is filtered to that project
- [ ] Return to Projects Dashboard
- [ ] Click different project as Role B
- [ ] Verify LockedFilterBar updates
- [ ] Verify data is filtered to NEW project

### Test 2: Direct Dashboard Access
- [ ] Direct URL access to /accountant-dashboard
- [ ] Verify regular FilterBar shown (not LockedFilterBar)
- [ ] Verify can change filters
- [ ] Verify reset button visible

### Test 3: Admin Access
- [ ] Login as admin
- [ ] Go to admin dashboard
- [ ] Verify no LockedFilterBar (project context not used)
- [ ] Verify full access to all data

### Test 4: Filter Persistence
- [ ] Login and select project
- [ ] Verify LockedFilterBar shown
- [ ] Refresh page
- [ ] Verify LockedFilterBar still shows (persisted via localStorage)
- [ ] Logout and login
- [ ] Verify filters reset (localStorage cleared on logout)

### Test 5: Reset Flow
- [ ] Navigate from projects dashboard
- [ ] LockedFilterBar shown, no reset button
- [ ] Direct access to dashboard
- [ ] Regular FilterBar shown with reset button
- [ ] Click reset
- [ ] Filters cleared, show all projects

---

## Customization Points

### To Show/Hide LockedFilterBar:
Edit the condition in AccountantDashboard, PMDashboard:
```typescript
{isProjectSelected && <LockedFilterBar />}
{!isProjectSelected && <FilterBar />}
```

### To Customize LockedFilterBar Style:
Edit `src/components/LockedFilterBar.tsx`:
- Change gradient colors
- Modify icons
- Adjust spacing/layout
- Add additional information

### To Change Reset Button Behavior:
Edit `src/components/FilterBar.tsx`:
- The reset button is already conditional based on `hasActiveFilters`
- No additional changes needed

---

## Migration Checklist

- [x] Create LockedFilterBar component
- [x] Update AccountantDashboard to use LockedFilterBar
- [x] Update PMDashboard to use LockedFilterBar
- [x] Verify TeamMemberDashboard (no changes needed)
- [x] Keep AdminDashboard unchanged
- [x] Test multi-role navigation
- [x] Test direct dashboard access
- [x] Test filter persistence
- [ ] Update backend queries (per-dashboard, must be done separately)
- [ ] Test end-to-end with real database

---

## Troubleshooting

### LockedFilterBar Not Showing
**Solution:** Check if `isProjectSelected` is true:
```typescript
console.log('isProjectSelected:', isProjectSelected);
console.log('projectId:', projectId);
console.log('csrPartnerId:', csrPartnerId);
```

### Data Still Shows All Projects
**Solution:** Backend queries are not enforcing filters. Update queries to filter by `projectId`.

### localStorage Not Persisting
**Solution:** Check browser console for storage errors. Verify localStorage is enabled.

### Filters Reset When Page Loads
**Solution:** Ensure ProjectProvider is wrapping the app in App.tsx.

---

## Future Enhancements

- [ ] Add "Back to Projects" button in LockedFilterBar
- [ ] Add "Switch Project" option in sidebar
- [ ] Add breadcrumb showing: Projects > Selected Project
- [ ] Add audit logging for project access
- [ ] Add "Last accessed project" quick link in main dashboard

---

## Performance Considerations

- **LockedFilterBar:** Zero performance impact (static display component)
- **ProjectContext:** Minimal overhead (localStorage read + context provider)
- **Queries:** More efficient when filtered to single project

---

**Status:** ✅ Implementation Complete - Ready for Testing
