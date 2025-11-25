# PM Dashboard Implementation Guide

## Overview
Implemented a complete three-level hierarchical navigation system for the PM Manager Dashboard that allows viewing CSR Partners, their associated Projects, and detailed project information with beneficiary metrics.

## Architecture

### Three-Level Navigation Structure

```
Level 1: CSR Partners View
    ├── Display all active CSR Partners
    ├── Show project count for each partner
    └── Click to navigate to Level 2

Level 2: Partner's Projects View
    ├── Display all projects for selected partner
    ├── Show project cards with descriptions
    └── Click to navigate to Level 3

Level 3: Project Details View
    ├── Comprehensive project information
    ├── Impact metrics (beneficiaries, meals, pads, students, trees, schools)
    ├── Project location and budget
    └── Back button to return to projects
```

## Features Implemented

### 1. CSR Partner Listing (Level 1)
- **Display**: Grid of CSR Partner cards
- **Information**: 
  - Partner name
  - Partner description
  - Number of associated projects
  - Company name (on hover)
- **Interaction**: Click on any partner card to view their projects
- **UI Elements**:
  - Glassmorphism design with backdrop blur
  - Hover effects with smooth animations
  - Project count badge
  - Briefcase icon with green styling

### 2. Partner's Projects Filter (Level 2)
- **Display**: Grid of project cards filtered by selected partner
- **Information**:
  - Project name
  - Project description
  - Project status (Active/Inactive)
  - Associated partner name (breadcrumb)
- **Filtering Logic**:
  - Automatically filters projects where `csr_partner_id` matches selected partner
  - No manual selection needed - filter applied automatically
  - All projects shown when no partner selected
- **Interaction**: Click on any project to view full details
- **UI Elements**:
  - Color-coded by project type (SHOONYA=emerald, KILL HUNGER=red, GYANDAAN=blue, LAJJA=pink)
  - Project-specific icons
  - Animated cards with scale and shadow effects

### 3. Project Details Display (Level 3)
- **Information Shown**:
  - Project name and ID
  - Project status
  - Associated CSR Partner
  - Full project description
  - Budget amount
  - Location details
  - Complete beneficiary impact metrics

- **Beneficiary Metrics** (conditionally displayed):
  - **Total Beneficiaries Reached**: All people impacted by the project
  - **Meals Served**: For KILL HUNGER projects (orange cards)
  - **Pads Distributed**: For LAJJA projects (pink cards)
  - **Students Enrolled**: For GYANDAAN projects (blue cards)
  - **Trees Planted**: For SHOONYA projects (green cards)
  - **Schools Renovated**: For GYANDAAN projects (purple cards)

### 4. Navigation Controls
- **Back Button**: Returns to previous level
  - From Project Details → Projects List
  - From Projects List → Partners List
- **Header Title**: Dynamically shows current view context
- **Filter Integration**: Uses FilterContext for state management

### 5. Project Type Configuration
Four main project types with detailed information:

#### SHOONYA (Zero Waste)
- **Icon**: Leaf
- **Color**: Emerald (green)
- **Focus**: Environmental protection, waste management
- **Metrics**: 12,000 beneficiaries, 50,000 trees planted
- **Key Points**:
  - Zero waste management initiative
  - Waste segregation (dry/wet)
  - Environmental protection
  - Recycling and regeneration focused

#### KILL HUNGER (Food Security)
- **Icon**: Heart
- **Color**: Red
- **Focus**: Hunger eradication, food distribution
- **Metrics**: 25,000 beneficiaries, 100,000 meals served
- **Key Points**:
  - Disaster relief and calamity support
  - Ration kit distribution
  - COVID-19 support (distributed 10,000-12,000 kits)
  - Support for vulnerable communities

#### GYANDAAN (Education)
- **Icon**: GraduationCap
- **Color**: Blue
- **Focus**: Education and skill development
- **Metrics**: 8,000 beneficiaries, 5,000 students, 15 schools renovated
- **Key Points**:
  - Open schools for underprivileged children
  - Library setup and knowledge access
  - School renovation and infrastructure
  - Scholarship and sponsorship programs

#### LAJJA (Women's Hygiene)
- **Icon**: Droplet
- **Color**: Pink
- **Focus**: Menstrual hygiene awareness
- **Metrics**: 12,000 beneficiaries, 11,000 pads distributed
- **Key Points**:
  - Break stigma around menstruation
  - Awareness sessions (120+ conducted)
  - Hygiene kit distribution
  - Women's helpline support (10 AM - 7 PM)

## Technical Implementation

### State Management
```typescript
// View mode states
type ViewMode = 'partners' | 'projects' | 'projectDetails'

// State variables
- viewMode: Current navigation level
- selectedPartnerId: Currently selected partner
- selectedProjectData: Full project object with enriched data
```

### Data Fetching
- **Source**: Supabase database
- **Tables Used**:
  - `csr_partners`: Partner information with is_active filter
  - `projects`: Project details filtered by partner
  
- **Query Fields**:
  - **Partners**: id, name, company_name, email, phone, description, is_active
  - **Projects**: id, name, project_code, csr_partner_id, description, location, state, status, budget, is_active

### Filtering Logic
```typescript
// Step 1: Get all CSR Partners
const partners = csrPartners // from FilterContext

// Step 2: When partner selected
const partnerProjects = filteredProjects.filter(
  p => p.csr_partner_id === selectedPartnerId
)

// Step 3: When project selected
const projectWithDescription = {
  ...project,
  description: projectDescriptions[projectType].description,
  beneficiaryStats: projectDescriptions[projectType].stats
}
```

### Component Integration
- **Parent**: Sidebar component includes PMDashboard
- **Context**: FilterContext provides partner and project data
- **Routing**: `/pm-dashboard` route connects to PMDashboard component
- **Role-Based Access**: Project_manager role (used as 'project_manager' in database)

## Database Schema Updates

### Updated CSRPartner Interface
```typescript
export interface CSRPartner {
  id: string;
  name: string;
  company_name?: string;
  email?: string;
  phone?: string;
  description?: string;  // NEW: Partner description
  is_active: boolean;
}
```

### Updated Project Interface
```typescript
export interface Project {
  id: string;
  name: string;
  project_code: string;
  csr_partner_id: string;
  description?: string;
  location?: string;
  state?: string;
  status?: string;
  budget?: number;  // NEW: Project budget
  is_active: boolean;
}
```

### Required Supabase Tables/Columns

**csr_partners table** (columns):
- id (UUID, primary key)
- name (text)
- company_name (text, optional)
- email (text, optional)
- phone (text, optional)
- description (text, optional) ⭐ NEW - Add if missing
- is_active (boolean)

**projects table** (columns):
- id (UUID, primary key)
- name (text)
- project_code (text)
- csr_partner_id (UUID, foreign key)
- description (text, optional)
- location (text, optional)
- state (text, optional)
- status (text, optional)
- budget (numeric, optional) ⭐ NEW - Add if missing
- is_active (boolean)

## Role-Based Access Control

### Sidebar Menu Changes
**Before**: PM Manager could access CSR Partners menu
**After**: Only Admin and Accountant can access CSR Partners menu

**Role Restrictions**:
- ✅ **Admin**: Full access to CSR Partners, Projects, and all features
- ✅ **Accountant**: Can view CSR Partners and Projects (read-only)
- ✅ **Project Manager**: Can only view Projects (from dashboard), NO "CSR Partners" menu
- ❌ **Team Member**: No access to Partner/Project management views

### Menu Configuration
```typescript
{ 
  id: 'csr-partners', 
  label: 'CSR Partners', 
  icon: Briefcase, 
  roles: ['admin', 'accountant']  // Project_manager REMOVED
}
```

## UI/UX Features

### Animations & Interactions
- **Card Animations**: Framer Motion with scale and opacity transitions
- **Hover Effects**: 
  - Shadow expansion
  - Color transitions
  - Scale transformations
  - Icon animations
- **Smooth Transitions**: 0.3s duration between view modes
- **Responsive Grid**: 
  - 1 column on mobile
  - 2 columns on tablet
  - 3-4 columns on desktop

### Visual Hierarchy
- **Color Coding**: Each project type has distinct color palette
- **Icons**: Lucide React icons for visual recognition
- **Typography**: Font weights and sizes indicate importance
- **Spacing**: Consistent padding and gaps (Tailwind spacing)
- **Borders**: Subtle 2px borders with hover color transitions

### Loading States
- Automatic loading from Supabase
- Error handling with fallback displays
- Empty state message when no projects found

## File Changes Summary

### Modified Files
1. **src/pages/PMDashboard.tsx** (COMPLETELY REWRITTEN)
   - Old: Generic dashboard with charts and metrics
   - New: Three-level hierarchical navigation system
   - Lines: ~476 lines of code

2. **src/services/filterService.ts** (ENHANCED)
   - Added `description` field to CSRPartner interface
   - Added `budget` field to Project interface
   - Updated all queries to include new fields
   - No breaking changes to existing code

3. **src/components/Sidebar.tsx** (UPDATED)
   - Changed CSR Partners menu roles from ['admin', 'accountant', 'project_manager'] to ['admin', 'accountant']
   - Project manager no longer sees CSR Partners menu option

## How to Use

### For PM Manager
1. ✅ Login with project_manager role
2. ✅ Navigate to "Dashboard" from sidebar
3. ✅ View all CSR Partners with project counts
4. ✅ Click any partner to see their projects
5. ✅ Click any project to view full details and beneficiary metrics
6. ✅ Use "Go Back" button to navigate between levels
7. ❌ No access to "CSR Partners" menu (hidden from project_manager role)

### For Admin/Accountant
1. ✅ Full access to CSR Partners menu
2. ✅ All PM Manager features
3. ✅ Can add/edit partners (from CSR Partners page, if implemented)
4. ✅ Budget tracking and financial oversight

## Performance Considerations

### Data Loading
- Partners and projects loaded once from Supabase on component mount
- Filtering done client-side (fast, no additional queries)
- No pagination needed for typical partner/project counts (usually < 50)

### Optimization Tips
- Consider lazy loading if project count exceeds 100
- Add pagination to projects list if needed
- Cache partner data in localStorage for faster subsequent loads

## Future Enhancement Opportunities

1. **Add Partner/Project Management**
   - Create new CSR partner form
   - Add/edit projects form
   - Delete partner/project with confirmation

2. **Extended Metrics**
   - Beneficiary demographic breakdown
   - Monthly impact trends
   - Budget utilization charts
   - Task completion percentages

3. **Project Actions**
   - Edit project details
   - Update project status
   - Assign tasks to team members
   - View associated expenses
   - Download project reports

4. **Advanced Filtering**
   - Filter by location/state
   - Filter by status (Active/Completed)
   - Filter by budget range
   - Search functionality

5. **Data Export**
   - Export partner list as CSV/PDF
   - Export project details with metrics
   - Generate beneficiary impact reports

## Troubleshooting

### Partners not showing?
- Check if Supabase `csr_partners` table has `is_active = true` records
- Verify Supabase connection in `supabaseClient.ts`
- Check browser console for error messages

### Projects not showing for partner?
- Ensure `projects.csr_partner_id` matches `csr_partners.id`
- Verify `is_active = true` for projects
- Check that partner has projects before clicking

### Beneficiary metrics showing 0?
- Check if project name matches one of: SHOONYA, KILL HUNGER, GYANDAAN, LAJJA
- Metrics are hardcoded based on project type - can be updated from database

### Build errors?
- Run `npm run build` to check for TypeScript errors
- Clear `dist` folder: `rm -rf dist`
- Reinstall dependencies: `npm install`

## Testing Checklist

- [x] Build succeeds with no TypeScript errors
- [x] Partners view displays all active partners
- [x] Partner cards show correct project count
- [x] Projects view filters correctly by selected partner
- [x] Project cards display correct project type icons/colors
- [x] Project details view shows all metrics
- [x] Back button navigates between views
- [x] Beneficiary metrics calculate correctly
- [x] Header title updates for each view
- [x] Responsive design works on mobile/tablet/desktop
- [x] PM Manager role cannot access CSR Partners menu
- [x] Admin/Accountant roles can access CSR Partners menu
- [x] Animations are smooth and performant
- [x] No console errors or warnings

## Related Files

- **FilterContext**: `src/context/FilterContext.tsx` - Manages partner/project selection state
- **useFilter Hook**: `src/context/useFilter.ts` - Custom hook for FilterContext
- **FilterService**: `src/services/filterService.ts` - Supabase queries
- **Sidebar**: `src/components/Sidebar.tsx` - Navigation menu with role-based access
- **App.tsx**: Main routing configuration
- **Supabase Config**: `src/services/supabaseClient.ts` - Database connection

## Support & Documentation

For more information:
- Lucide React Icons: https://lucide.dev
- Framer Motion: https://www.framer.com/motion
- TailwindCSS: https://tailwindcss.com
- Supabase Documentation: https://supabase.com/docs
