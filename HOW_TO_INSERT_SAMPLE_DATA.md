# How to Insert Sample Data into PM Dashboard

## Quick Steps

### Option 1: Using Supabase UI (Easiest)

1. **Open Supabase Dashboard**
   - Go to: https://supabase.com
   - Login to your project
   - Navigate to SQL Editor

2. **Create New Query**
   - Click "New Query"
   - Copy ALL the INSERT statements from `INSERT_SAMPLE_DATA_PM_DASHBOARD.sql`
   - Paste into the SQL editor

3. **Run the Query**
   - Click "Run" button
   - Wait for completion
   - You should see "Rows affected: 16" (4 partners + 12 projects)

4. **Verify Data**
   - Go to "csr_partners" table → You should see 4 partners
   - Go to "projects" table → You should see 12 projects
   - Filters working? ✅

### Option 2: Using psql (Command Line)

```bash
# Connect to your Supabase database
psql -h db.xxxxx.supabase.co -U postgres -d postgres

# When prompted, enter your Supabase password

# Then run:
\i /path/to/INSERT_SAMPLE_DATA_PM_DASHBOARD.sql

# Verify:
SELECT COUNT(*) FROM csr_partners;
SELECT COUNT(*) FROM projects;
```

### Option 3: Copy-Paste Individual Sections

If you prefer to run sections one by one:

1. **Insert Partners First** (Run STEP 1)
2. **Insert SHOONYA Projects** (Run STEP 2)
3. **Insert KILL HUNGER Projects** (Run STEP 3)
4. **Insert GYANDAAN Projects** (Run STEP 4)
5. **Insert LAJJA Projects** (Run STEP 5)
6. **Run Verification Queries** (Run verification section)

---

## What Data Will Be Added

### 4 CSR Partners
```
1. Interise Foundation
2. TCS (Tata Consultancy Services)
3. HDFC Bank
4. Amazon India
```

### 12 Projects (3 per partner, 3 per project type)
```
SHOONYA (Zero Waste) - 3 projects
├─ SHOONYA-1 (Mumbai) - Interise
├─ SHOONYA-2 (Bangalore) - TCS
└─ SHOONYA-3 (Delhi) - HDFC

KILL HUNGER (Food) - 3 projects
├─ KILL HUNGER-1 (Lucknow) - Interise
├─ KILL HUNGER-2 (Varanasi) - TCS
└─ KILL HUNGER-3 (Indore) - Amazon

GYANDAAN (Education) - 3 projects
├─ GYANDAAN-1 (Mumbai) - TCS
├─ GYANDAAN-2 (Kanpur) - HDFC
└─ GYANDAAN-3 (Pune) - Amazon

LAJJA (Women's Health) - 3 projects
├─ LAJJA-1 (Varanasi) - Interise
├─ LAJJA-2 (Barabanki) - HDFC
└─ LAJJA-3 (Lucknow) - TCS
```

### Budget Allocation
- **Total Budget**: ₹7,545,000
- **Per Partner**: ~₹1,885,000
- **Per Project Type**: ~₹1,885,000

---

## After Insertion - Test the Dashboard

### 1. Navigate to PM Dashboard
- Login as: **Project Manager**
- Click: **Dashboard**
- You should see: **Filter Bar with Dropdowns** (NOT the card grid)

### 2. Test Partner Filter
```
CSR Partner Dropdown:
├─ Overall (All Partners) ← Selected by default
├─ Interise
├─ TCS
├─ HDFC
└─ Amazon
```

### 3. Select a Partner
- Click dropdown → Select "Interise"
- Projects dropdown should now show:
  ```
  ├─ SHOONYA-1
  ├─ KILL HUNGER-1
  └─ LAJJA-1
  ```

### 4. Select a Project
- Click on "SHOONYA-1"
- The dashboard below should filter and show data for that project

### 5. Reset Filters
- Click "Reset Filters" button
- Goes back to showing all partners

---

## Verification Queries

If you want to check what data was inserted, run these queries:

### Check Partners
```sql
SELECT name, company_name, is_active FROM csr_partners ORDER BY name;
```

### Check Projects
```sql
SELECT name, location, budget, is_active FROM projects ORDER BY name;
```

### Check Partner-Project Mapping
```sql
SELECT cp.name as partner, p.name as project, p.location 
FROM csr_partners cp 
JOIN projects p ON cp.id = p.csr_partner_id 
WHERE cp.is_active = true AND p.is_active = true
ORDER BY cp.name, p.name;
```

### Count by Project Type
```sql
SELECT 
  SUBSTRING(name, 1, POSITION('-' IN name)-1) as project_type,
  COUNT(*) as count
FROM projects 
WHERE is_active = true
GROUP BY SUBSTRING(name, 1, POSITION('-' IN name)-1)
ORDER BY project_type;
```

---

## Troubleshooting

### Query fails with "relation does not exist"
→ Tables `csr_partners` or `projects` don't exist
→ Solution: Create tables first using SQL schema

### No data shows in dashboard dropdowns
→ Check if `is_active = true` in database
→ Check FilterBar component is loading data
→ Open browser console to check for errors

### Projects not filtering by partner
→ Check if `csr_partner_id` foreign key relationship exists
→ Verify project's `csr_partner_id` matches partner's `id`

### Only seeing "Overall (All Partners)" in dropdown
→ Partners might have `is_active = false`
→ Check query: `SELECT * FROM csr_partners WHERE is_active = true;`

---

## Next Steps

1. ✅ Run INSERT queries
2. ✅ Verify data in Supabase tables
3. ✅ Test dashboard filters
4. ✅ Select different partners and see projects
5. ✅ Explore the hierarchical PM Dashboard

---

## File Location
📍 **SQL File**: `INSERT_SAMPLE_DATA_PM_DASHBOARD.sql`
📍 **This Guide**: Current document

## Need Help?
- Check database connection in `src/services/supabaseClient.ts`
- Check FilterBar component in `src/components/FilterBar.tsx`
- Check FilterContext in `src/context/FilterContext.tsx`
