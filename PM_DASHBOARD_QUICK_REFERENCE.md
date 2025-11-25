# PM Dashboard - Quick Reference Guide

## What Was Built

A three-level hierarchical navigation system for PM Manager dashboard:

```
Partners View → Projects View → Project Details View
   (Level 1)      (Level 2)       (Level 3)
```

## Key Features

### 1. CSR Partner Listing
- View all active CSR partners
- See project count per partner
- Beautifully animated cards with hover effects
- Click to view partner's projects

### 2. Partner's Projects
- Auto-filtered by selected partner
- Color-coded by project type:
  - 🟢 **SHOONYA** (Zero Waste) - Emerald/Green
  - ❤️ **KILL HUNGER** (Food) - Red
  - 🎓 **GYANDAAN** (Education) - Blue
  - 🩸 **LAJJA** (Women's Health) - Pink
- Click to view full project details

### 3. Project Details
- Complete project information
- Beneficiary impact metrics:
  - Total people reached
  - Meals distributed
  - Pads given (LAJJA)
  - Students enrolled (GYANDAAN)
  - Trees planted (SHOONYA)
  - Schools renovated (GYANDAAN)
- Project location and budget
- Full project descriptions

## Navigation

### How to Access
1. Login as Project Manager / Admin / Accountant
2. Click "Dashboard" in sidebar
3. Start exploring partners and projects!

### Navigation Flow
```
Click Partner Card
    ↓
View Partner's Projects
    ↓
Click Project Card
    ↓
View Project Details
    ↓
Click "Go Back" to Previous Level
```

## Role-Based Access

| Feature | Admin | Accountant | PM Manager | Team Member |
|---------|-------|------------|------------|-------------|
| View Partners | ✅ | ✅ | ❌ | ❌ |
| View Projects | ✅ | ✅ | ✅ | ❌ |
| View Details | ✅ | ✅ | ✅ | ❌ |
| CSR Partners Menu | ✅ | ✅ | ❌ | ❌ |

## Project Types & Their Metrics

### SHOONYA (Zero Waste Management)
```
📊 Stats:
- Beneficiaries: 12,000+
- Trees Planted: 50,000+
- Focus: Environmental protection, waste segregation
```

### KILL HUNGER (Food Security)
```
📊 Stats:
- Beneficiaries: 25,000+
- Meals Served: 100,000+
- Focus: Hunger eradication, disaster relief
```

### GYANDAAN (Education)
```
📊 Stats:
- Beneficiaries: 8,000+
- Students Enrolled: 5,000+
- Schools Renovated: 15+
- Focus: Education access, skill development
```

### LAJJA (Women's Hygiene)
```
📊 Stats:
- Beneficiaries: 12,000+
- Pads Distributed: 11,000+
- Sessions: 120+
- Focus: Menstrual hygiene awareness
```

## Important Database Fields

### CSR Partners Table
```
- id: Partner ID
- name: Partner name ⭐
- description: Partner description ⭐ (NEW)
- company_name: Company name
- is_active: Active status
```

### Projects Table
```
- id: Project ID
- name: Project name ⭐
- csr_partner_id: Associated partner ⭐
- description: Project description
- budget: Project budget ⭐ (NEW)
- status: Project status
- location: Project location
- is_active: Active status
```

⭐ = Essential fields for functionality

## Files Changed

1. **src/pages/PMDashboard.tsx** - Complete rewrite
   - Old: Dashboard with charts
   - New: Three-level navigation with partner/project hierarchy

2. **src/services/filterService.ts** - Enhanced
   - Added `description` to CSRPartner
   - Added `budget` to Project
   - Updated all Supabase queries

3. **src/components/Sidebar.tsx** - Updated
   - CSR Partners menu restricted to admin/accountant only
   - PM Manager no longer sees this menu

## Commands

### Build Project
```bash
npm run build
```

### Run Development Server
```bash
npm run dev
```

### Check for Errors
```bash
npm run build  # Shows TypeScript errors
```

## Common Tasks

### To View CSR Partners (as PM Manager)
1. Go to Dashboard
2. You'll see all CSR partners on the page
3. Click any partner to see their projects

### To View Projects
1. Click on a CSR partner
2. See filtered list of their projects
3. Click any project for details

### To Go Back
Click the "Go Back" button at the top left
- From Details → Projects
- From Projects → Partners

### To Reset View
Click "Go Back" until you reach Partners view
(Navigation is hierarchical - always goes back one level)

## Design Features

✨ **Glassmorphism**: Frosted glass effect on cards
🎨 **Color Coding**: Each project type has distinct color
🎭 **Animations**: Smooth transitions and hover effects
📱 **Responsive**: Works on mobile, tablet, desktop
🔍 **Interactive**: Hover effects and visual feedback
⚡ **Performance**: Client-side filtering (instant results)

## Troubleshooting

### No Partners Showing?
→ Check Supabase database for `csr_partners` records
→ Ensure `is_active = true`

### No Projects for Partner?
→ Check `projects.csr_partner_id` matches partner
→ Verify project `is_active = true`

### Metrics Showing Zero?
→ Metrics are based on project name
→ Must match: SHOONYA, KILL HUNGER, GYANDAAN, LAJJA

### Build Fails?
→ Run `npm install` to update dependencies
→ Check Node.js version (v16+)
→ Clear `node_modules` and reinstall

## Next Steps

💡 **Potential Additions**:
- Add/Edit partner functionality
- Add/Edit project functionality
- Delete with confirmation dialogs
- Export as PDF/CSV
- Advanced filtering and search
- Beneficiary demographic breakdown
- Monthly impact trends
- Budget utilization charts

## URLs & Routes

```
/pm-dashboard          → PM Dashboard (main route)
/admin-dashboard       → Admin Dashboard
/accountant-dashboard  → Accountant Dashboard
/team-member-dashboard → Team Member Dashboard
```

## Keyboard Shortcuts

| Action | Key |
|--------|-----|
| Navigate (Browser) | Use Sidebar Menu |
| Go Back | Click "Go Back" Button |
| No Shortcuts Yet | (Can be added) |

## Questions?

Refer to: `PM_DASHBOARD_IMPLEMENTATION.md` for detailed documentation

---

**Version**: 1.0  
**Status**: ✅ Complete and Tested  
**Build**: ✅ Passing  
**Last Updated**: November 25, 2025
