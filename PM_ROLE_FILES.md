# PM Role Files - Complete Documentation

## Role Definition
- **Role Name:** `project_manager`
- **Role ID:** `project_manager`
- **Display Name:** Project Manager / PM

---

## Main Dashboard
### 1. **PMDashboard.tsx**
- **Path:** `src/pages/PMDashboard.tsx`
- **Route:** `/pm-dashboard`
- **Purpose:** Main PM dashboard with dual-view (Analytics & Hierarchy)
- **Key Features:**
  - Analytics View: Dashboard with stat cards, charts, impact metrics
  - Hierarchy View: Project tree structure with filtering
  - Toggle between Analytics (chart icon) and Projects (grid icon)
  - Status distribution pie chart
  - Top partners bar chart
  - Impact metrics grid (Beneficiaries, Budget, Pads, Meals, Trees, Schools)
- **Size:** 797 lines
- **Dependencies:**
  - `useFilter` context
  - `recharts` for charts
  - `framer-motion` for animations
  - `FilterBar` component

---

## Navigation & Authentication
### 2. **AuthContext.tsx**
- **Path:** `src/context/AuthContext.tsx`
- **Purpose:** Authentication and role management
- **PM Role:** Defined as `'project_manager'`
- **Available Roles:**
  - admin
  - accountant
  - project_manager ✅
  - team_member
  - client
- **Key Methods:** `login()`, `logout()`, `setSelectedRole()`

### 3. **Sidebar.tsx**
- **Path:** `src/components/Sidebar.tsx`
- **Purpose:** Navigation sidebar with role-based menu filtering
- **PM Menu Items:**
  - Dashboard → `/pm-dashboard`
  - Projects → `/projects`
  - To-Do List Assignment → `/todo`
  - Real Time Update → `/real-time-update`
  - Media → `/media`
  - Article → `/article`
  - Team Members → `/team-members`
  - Dashboard Forms → `/dashboard-forms`
  - Calendar → `/calendar`
  - Project Expenses → `/project-expenses`
  - Daily Report → `/daily-report`
  - Data Entry → `/data-entry`
  - Upcoming Expenses → `/upcoming-expenses`
  - Bills → `/bills`
  - Analysis Report → `/analysis-report`
  - *(14 total PM menu items)*

### 4. **App.tsx**
- **Path:** `src/App.tsx`
- **Purpose:** Route definitions and role-based access control
- **PM Routes:**
  - `/pm-dashboard` - Protected, shows PMDashboard
  - Uses `ProtectedRoute` wrapper
  - Sidebar wrapping with `currentPage="dashboard"`

---

## Data & Services
### 5. **FilterContext & FilterService**
- **Path:** `src/context/useFilter.ts` / `src/services/filterService.ts`
- **Purpose:** Project filtering and data management
- **PM Usage:**
  - Fetches all projects via `fetchAllProjects()`
  - Filters by selected partner
  - Provides: `projects`, `filteredProjects`, `csrPartners`
- **Fields Returned:**
  - Project: id, name, status, csr_partner_id, total_budget, direct_beneficiaries, pads_distributed, etc.
  - CSR Partners: id, name, company_name, is_active

### 6. **Project-Related Services**
- **projectExpensesService.ts** - Expense tracking for projects (accessible by PM)
- **filterService.ts** - Core data fetching service

---

## Data Models
### 7. **Interfaces & Types**

#### Project Interface
```typescript
interface Project {
  id: string;
  name: string;
  project_code: string;
  csr_partner_id: string;
  description?: string;
  location?: string;
  state?: string;
  status?: 'active' | 'completed';
  total_budget?: number;
  utilized_budget?: number;
  direct_beneficiaries?: number;
  indirect_beneficiaries?: number;
  meals_served?: number;
  pads_distributed?: number;
  students_enrolled?: number;
  trees_planted?: number;
  schools_renovated?: number;
  display_color?: string;
  display_icon?: string;
}
```

#### CSR Partner Interface
```typescript
interface CSRPartner {
  id: string;
  name: string;
  company_name?: string;
  is_active: boolean;
}
```

---

## PM-Accessible Pages

### Direct PM Pages
1. **PM Dashboard** - `/pm-dashboard` → `PMDashboard.tsx`

### Shared Pages (PM has access)
2. **Projects** - `/projects` → `ProjectsPage.tsx`
3. **To-Do List** - `/todo` → `ToDoList.tsx`
4. **Real Time Update** - `/real-time-update` → `RealTimeUpdate.tsx`
5. **Media** - `/media` → `Media.tsx` & `MediaPage.tsx`
6. **Article** - `/article` → `Article.tsx` & `ArticlePage.tsx`
7. **Team Members** - `/team-members` → `TeamMembers.tsx` & `TeamMembersPage.tsx`
8. **Dashboard Forms** - `/dashboard-forms` → `DashboardFormsPage.tsx`
9. **Calendar** - `/calendar` → `Calendar.tsx` & `CalendarPage.tsx`
10. **Project Expenses** - `/project-expenses` → `ProjectExpenses.tsx`
11. **Daily Report** - `/daily-report` → `DailyReportPage.tsx`
12. **Data Entry** - `/data-entry` → `DataEntryPage.tsx`
13. **Upcoming Expenses** - `/upcoming-expenses` → `UpcomingExpensesPage.tsx`
14. **Bills** - `/bills` → `Bills.tsx`
15. **Analysis Report** - `/analysis-report` → `AnalysisReport.tsx`

### **Total Pages Accessible by PM: 15+**

---

## Database Tables

### Primary Tables
1. **csr_partners**
   - Columns: id, name, company_name, email, phone, website, primary_color, is_active, created_at

2. **projects**
   - Columns: id, project_code, name, description, csr_partner_id, location, state, status, start_date, expected_end_date, total_budget, utilized_budget, direct_beneficiaries, indirect_beneficiaries, meals_served, pads_distributed, students_enrolled, trees_planted, schools_renovated, display_color, display_icon, is_active, created_at
   - Status Values: `'active'` | `'completed'` (lowercase)
   - **Foreign Key:** csr_partner_id → csr_partners.id

3. **project_expenses** (accessible by PM)
   - Tracks expense data for PM dashboard

---

## Configuration Files

### Supabase Integration
- **File:** `src/services/supabaseClient.ts`
- **Purpose:** Supabase connection and authentication

### Type Configuration
- **File:** `tsconfig.app.json` / `tsconfig.json`
- **Purpose:** TypeScript configuration for strict type checking

---

## Key Features Available to PM

✅ **Analytics Dashboard** - View aggregated project metrics across all partners
✅ **Project Hierarchy** - Browse projects in tree structure by partner
✅ **Filtering** - Filter projects by CSR Partner
✅ **Budget Tracking** - View total budget, utilized budget per project
✅ **Impact Metrics** - See beneficiaries, pads distributed, meals served, trees planted, etc.
✅ **Team Management** - Manage team members and their assignments
✅ **Project Expenses** - Track and manage project expenses
✅ **Report Generation** - Create and view analysis reports
✅ **Task Management** - Assign and track to-do items
✅ **Calendar View** - Calendar with project schedules

---

## File Access Summary

| File | Purpose | Role Access |
|------|---------|------------|
| PMDashboard.tsx | PM main dashboard | `project_manager` ✅ |
| AuthContext.tsx | Role management | All roles |
| Sidebar.tsx | Navigation menu | All roles |
| App.tsx | Route definitions | All roles |
| filterService.ts | Data fetching | All roles |
| useFilter.ts | Filter context | All roles |
| FilterBar.tsx | Filter UI component | All roles |

---

## PM Analytics View Details

### Stat Cards (4)
1. **Active Projects** - Count of projects with status='active'
2. **Total Beneficiaries** - Sum of direct_beneficiaries
3. **Total Budget** - Sum of total_budget (displayed in Cr)
4. **Completed Projects** - Count of projects with status='completed'

### Charts (2)
1. **Project Status Distribution** - Pie chart showing active vs completed split
2. **Top Partners by Projects** - Bar chart of top 8 CSR partners by project count

### Impact Metrics Grid (6)
1. Total Beneficiaries
2. Meals Served
3. Pads Distributed
4. Students Enrolled
5. Trees Planted
6. Schools Renovated

---

## How to Use This Documentation

### For PM Features:
- Primary file: **PMDashboard.tsx**
- Navigation: **Sidebar.tsx** (role='project_manager')
- Data: **filterService.ts** + **useFilter.ts**

### For Adding New PM Features:
1. Add menu item to `Sidebar.tsx` with role `'project_manager'`
2. Create route in `App.tsx` with PM role protection
3. Create component file in `src/pages/`
4. Import and use `useFilter()` hook for data

### For Debugging PM Issues:
- Check `AuthContext.tsx` for role assignment
- Verify `currentRole === 'project_manager'` in console
- Check browser console for data loading logs
- Verify Supabase connection and data

---

## Last Updated
November 26, 2025

## Related Sessions
- Analytics dashboard implementation
- Empty metrics debugging
- Status constraint fixes (lowercase 'active'/'completed')
- Budget field addition to queries
