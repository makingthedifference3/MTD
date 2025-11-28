# Project Context Filtering Implementation Guide

## Overview
When a user clicks "Open Project" from the Projects Dashboard and is routed to a role-specific dashboard (Accountant, Project Manager, or Team Member), the selected project and CSR partner are automatically pre-loaded and can be used to initialize filters.

**Note:** Admin users are NOT affected by this filtering - they always see all projects.

---

## Architecture

### New Context Files Created

#### 1. **ProjectContext.tsx**
Stores the selected project and CSR partner information across navigation.

**Stored Data:**
```typescript
{
  projectId: string | null,
  projectName: string | null,
  csrPartnerId: string | null,
  csrPartnerName: string | null,
  projectRole: string | null
}
```

**Methods:**
- `setSelectedProject(projectId, projectName, csrPartnerId, csrPartnerName, projectRole)`
- `clearSelectedProject()`

**Storage:**
- Data persists in localStorage
- Survives page refresh
- Auto-loaded on app startup

#### 2. **useSelectedProject.ts**
Custom hook to access ProjectContext.

```typescript
const { projectId, projectName, csrPartnerId, csrPartnerName, projectRole, setSelectedProject, clearSelectedProject } = useSelectedProject();
```

#### 3. **useProjectContext.ts**
Helper hook for dashboards to get pre-filled filter data.

```typescript
const { projectId, csrPartnerId, isProjectSelected } = useProjectContext();
```

---

## Data Flow

```
ProjectsDashboardPage
        ↓ (User clicks project)
handleProjectSelect()
        ↓ (Stores in ProjectContext)
setSelectedProject(id, name, csrId, csrName, role)
        ↓ (Also stores in localStorage)
Route to role-specific dashboard
        ↓
Dashboard Component
        ↓ (Mounted)
useProjectContext()
        ↓ (Retrieves pre-selected values)
Initialize filters with project & CSR partner
        ↓
User can change filters or proceed with pre-filled values
```

---

## Implementation in Dashboards

### For AccountantDashboard.tsx

```typescript
import { useProjectContext } from '../context/useProjectContext';
import { useContext } from 'react';
import { FilterContext } from '../context/FilterContext';

export default function AccountantDashboard() {
  const { projectId, csrPartnerId, projectName, csrPartnerName, isProjectSelected } = useProjectContext();
  const { setSelectedPartner, setSelectedProject } = useContext(FilterContext);

  useEffect(() => {
    if (isProjectSelected && csrPartnerId && projectId) {
      // Auto-set filters when coming from projects dashboard
      setSelectedPartner(csrPartnerId);
      setSelectedProject(projectId);
      console.log(`Pre-filled filters: Project: ${projectName}, CSR Partner: ${csrPartnerName}`);
    }
  }, [isProjectSelected, csrPartnerId, projectId, projectName, csrPartnerName]);

  // Rest of component...
  // Now all queries, filters, and modals will use the pre-selected values
}
```

### For PMDashboard.tsx

```typescript
import { useProjectContext } from '../context/useProjectContext';

export default function PMDashboard() {
  const { projectId, csrPartnerId, isProjectSelected } = useProjectContext();
  
  useEffect(() => {
    if (isProjectSelected) {
      // Initialize with selected project and CSR partner
      initializeFilters(csrPartnerId, projectId);
    }
  }, [isProjectSelected]);

  // Rest of component...
}
```

### For TeamMemberDashboard.tsx

```typescript
import { useProjectContext } from '../context/useProjectContext';

export default function TeamMemberDashboard() {
  const { projectId, csrPartnerId, projectRole, isProjectSelected } = useProjectContext();
  
  useEffect(() => {
    if (isProjectSelected) {
      // Use project context to filter data
      fetchTeamMemberTasks(projectId, csrPartnerId);
    }
  }, [isProjectSelected]);

  // Rest of component...
}
```

---

## Filter Behavior

### When Project is Selected (Coming from Projects Dashboard)

**Initial State:**
- CSR Partner filter: Pre-filled with selected CSR partner ✅
- Project filter: Pre-filled with selected project ✅
- All data queries: Filtered to this project only ✅
- All modals/forms: CSR Partner and Project fields locked to pre-selected values ✅

**User Can:**
- View data specific to the selected project
- Change filters to other projects/CSR partners (filter becomes flexible)
- Reset and go back to projects dashboard
- All forms pre-fill with the selected project context

### When Project is NOT Selected (Direct Navigation)

**Initial State:**
- CSR Partner filter: Empty or show all ⚪
- Project filter: Empty or show all ⚪
- All data queries: Show all projects ⚪
- User can select any project/CSR partner ⚪

---

## Updated App.tsx Structure

```
<Router>
  <AuthProvider>
    <FilterProvider>
      <ProjectProvider>  ← NEW
        <AppRoutes />
      </ProjectProvider>
    </FilterProvider>
  </AuthProvider>
</Router>
```

---

## LocalStorage Keys

```javascript
// Stored when user clicks project
localStorage.setItem('selectedProjectId', projectId);
localStorage.setItem('selectedProjectName', projectName);
localStorage.setItem('selectedCSRPartnerId', csrPartnerId);
localStorage.setItem('selectedCSRPartnerName', csrPartnerName);
localStorage.setItem('selectedProjectRole', projectRole);

// Cleared when user explicitly clears selection or logs out
localStorage.removeItem('selectedProjectId');
localStorage.removeItem('selectedProjectName');
localStorage.removeItem('selectedCSRPartnerId');
localStorage.removeItem('selectedCSRPartnerName');
localStorage.removeItem('selectedProjectRole');
```

---

## Database Queries Updated

### ProjectsDashboardPage - Supabase Query

Now includes `csr_partner_id`:

```typescript
const { data } = await supabase
  .from('project_team_members')
  .select(`
    role,
    projects (
      id,
      project_code,
      name,
      status,
      start_date,
      expected_end_date,
      total_budget,
      csr_partner_id,  ← NEW
      csr_partners (
        company_name
      )
    )
  `)
  .eq('user_id', currentUser.id)
  .eq('is_active', true);
```

**Why:** To capture the CSR Partner ID when storing in context.

---

## API Endpoints to Update

For each dashboard that needs to respect the pre-selected filters:

1. **AccountantDashboard**
   - Project Expenses: Filter by selected project + CSR partner
   - Bills: Filter by selected project
   - Budget reports: Filter by selected project + CSR partner

2. **PMDashboard**
   - Tasks: Filter by selected project
   - Team members: Filter by selected project
   - Timeline: Filter by selected project

3. **TeamMemberDashboard**
   - Daily reports: Filter by selected project
   - Tasks assigned: Filter by selected project
   - Real-time updates: Filter by selected project

---

## Feature: Flexible Filtering

After initial navigation with pre-filled filters:

**User Can:**
1. Click on CSR Partner filter → Change to different partner (expands view)
2. Click on Project filter → Change to different project (expands view)
3. Click "Reset Filters" → Goes back to showing all projects
4. Click "Back to Projects" → Returns to projects dashboard (clears context)

**Important:**
- Once user changes a filter, they leave the "project-focused" mode
- To get back to a single project, they must select it again from projects dashboard
- Or they can manually re-select the same filters

---

## Example: Complete AccountantDashboard Implementation

```typescript
import { useEffect, useState, useContext } from 'react';
import { useProjectContext } from '../context/useProjectContext';
import { FilterContext } from '../context/FilterContext';

export default function AccountantDashboard() {
  const { projectId, csrPartnerId, projectName, csrPartnerName, isProjectSelected } = useProjectContext();
  const { setSelectedPartner, setSelectedProject } = useContext(FilterContext);
  const [showProjectInfo, setShowProjectInfo] = useState(isProjectSelected);

  useEffect(() => {
    if (isProjectSelected && csrPartnerId && projectId) {
      // Auto-set filters
      setSelectedPartner(csrPartnerId);
      setSelectedProject(projectId);
      setShowProjectInfo(true);
    } else {
      setShowProjectInfo(false);
    }
  }, [isProjectSelected, csrPartnerId, projectId]);

  return (
    <div>
      {/* Show info banner when project is pre-selected */}
      {showProjectInfo && (
        <div className="bg-emerald-50 border border-emerald-200 p-4 mb-4 rounded">
          <p className="text-emerald-800">
            📌 Currently viewing <strong>{projectName}</strong> ({csrPartnerName})
          </p>
        </div>
      )}
      
      {/* Rest of dashboard content uses pre-filled filters */}
      {/* All queries will automatically filter by projectId and csrPartnerId */}
    </div>
  );
}
```

---

## Testing Checklist

- [ ] Login as Project Manager (not admin)
- [ ] Go to Projects Dashboard
- [ ] Click "Open Project" on any project
- [ ] Should route to PM Dashboard
- [ ] Verify filters are pre-filled with selected project + CSR partner
- [ ] Verify all data shown is for that project only
- [ ] Change CSR Partner filter - verify data updates
- [ ] Change Project filter - verify data updates
- [ ] Logout and login again - verify context persists (if using localStorage)
- [ ] Login as Accountant
- [ ] Repeat steps above

- [ ] Login as Admin
- [ ] Go to Admin Dashboard directly
- [ ] Verify NO project pre-filtering (shows all projects)
- [ ] Verify admin can see and access everything

---

## Admin Dashboard - No Changes

Admin users:
- Do NOT use ProjectContext
- Do NOT see pre-filled filters
- Do NOT see project-specific data
- Continue to have access to all projects/CSR partners/data
- Unaffected by this implementation

---

## Storage Strategy

| Scenario | Storage | Behavior |
|----------|---------|----------|
| User clicks project from dashboard | localStorage + Context | Pre-filled filters in dashboard |
| User refreshes page | localStorage | Context reloaded from localStorage |
| User clears selection | localStorage cleared | Resets to normal view |
| User logs out | localStorage cleared | All context lost |
| User directly navigates to dashboard | No storage | Normal view (no pre-filters) |

---

## Summary of Changes

### Files Created:
1. ✅ `src/context/ProjectContext.tsx` - Context for project selection
2. ✅ `src/context/useSelectedProject.ts` - Hook to use ProjectContext
3. ✅ `src/context/useProjectContext.ts` - Helper hook for dashboards

### Files Modified:
1. ✅ `src/App.tsx` - Added ProjectProvider wrapper
2. ✅ `src/pages/ProjectsDashboardPage.tsx` - Updated to store project context
   - Added `csr_partner_id` to Supabase query
   - Updated `handleProjectSelect()` to use new context
   - Passes full project object instead of just ID and role

### Next Steps for Dashboard Integration:
- [ ] Update `AccountantDashboard.tsx` to use `useProjectContext()`
- [ ] Update `PMDashboard.tsx` to use `useProjectContext()`
- [ ] Update `TeamMemberDashboard.tsx` to use `useProjectContext()`
- [ ] Test complete flow from projects dashboard to each role-specific dashboard

---

**Status:** ✅ Context Infrastructure Complete - Ready for Dashboard Integration
