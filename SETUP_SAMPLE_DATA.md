# Setup Sample Data - Step by Step

## Problem
After login, the Projects Dashboard shows "No Projects Yet" because the sample project data hasn't been added to the Supabase database yet.

## Solution
Run the `INSERT_SAMPLE_PROJECTS.sql` file in your Supabase SQL Editor.

## Steps

### 1. Open Supabase Dashboard
- Go to [Supabase](https://app.supabase.com)
- Select your MTD project
- Go to **SQL Editor** (left sidebar)

### 2. Create New Query
- Click **"+ New Query"** button
- OR click **"New"** and select **"SQL Query"**

### 3. Copy & Paste the SQL
- Open the file: `INSERT_SAMPLE_PROJECTS.sql` in your project root
- Copy **ALL** the content
- Paste it into the Supabase SQL editor

### 4. Execute the Query
- Click the **"▶️ Run"** button (or press `Ctrl+Enter`)
- Wait for the query to complete
- You should see a success message

### 5. Verify Data Was Added
- Go back to your React app (should be running on `http://localhost:5173`)
- Click **Logout** button
- Login again with credentials:
  - **Username:** `ravi.singh`
  - **Password:** `Manager@123`

### 6. Expected Result
After login, you should see 5 project cards displayed:
1. **EDU-2025-001** - Digital Literacy Program (Active)
2. **HLT-2025-002** - Community Health Awareness (Active)
3. **ENV-2025-003** - Tree Plantation (On Hold)
4. **WOM-2025-004** - Skill Development for Women (Active)
5. **DIS-2024-005** - Flood Relief & Rehabilitation (Completed)

---

## What Gets Added

### CSR Partners (3 total)
- TCS Foundation
- Infosys Foundation
- Wipro Foundation

### Projects (5 total)
All assigned to **Ravi Singh** as Project Manager

### Team Members (Assigned to each project)
- **Ravi Singh** - Project Manager (Lead)
- **Priya Patil** - Field Team Member
- **Meena Iyer** - Accountant
- **Amit Shah** - Data Analyst

---

## Troubleshooting

### Error: "column does not exist"
- **Solution:** Make sure your database schema matches the SQL_SCHEMA_COMPLETE_FIXED.sql that was already applied

### Error: "relation does not exist"
- **Solution:** Verify that the `project_team_members` table exists
- Run: `SELECT * FROM public.project_team_members LIMIT 1;` to check

### Still showing "No Projects Yet"
1. Verify the SQL executed successfully (check success message)
2. Check that you logged in as `ravi.singh`
3. Hard refresh the browser (Ctrl+F5)
4. Check browser console for errors (F12)

---

## Sample Login Credentials

After data is added, you can login as:

| Username | Password | Role | Projects |
|----------|----------|------|----------|
| ravi.singh | Manager@123 | Project Manager | All 5 |
| suresh.menon | Admin@123 | Admin | All 5 |
| meena.iyer | Account@123 | Accountant | 4 projects |
| priya.patil | Field@123 | Field Team | 4 projects |
| amit.shah | Data@123 | Data Analyst | 3 projects |
