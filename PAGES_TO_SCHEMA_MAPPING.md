-- =====================================================================
-- MTD CSR PLATFORM - PAGES TO SCHEMA MAPPING
-- Complete guide for all 29 pages and their database requirements
-- =====================================================================

## **5-ROLE SYSTEM OVERVIEW**

```
1. ADMIN - Full system access (all data, all operations, all reports)
2. ACCOUNTANT - Financial management (expenses, bills, budgets, certificates)
3. PROJECT_MANAGER - Project oversight (projects, teams, progress, tasks)
4. TEAM_MEMBER - Execution tasks (assigned tasks, time logs, daily reports)
5. CLIENT - Read-only external access (public updates, public reports)
```

---

## **PAGES MAPPING (29 PAGES TOTAL)**

---

### **1. ADMIN DASHBOARD PAGE**
**Table Dependencies:** `users`, `projects`, `csr_partners`, `project_expenses`, `tasks`

**Data Required:**
- Total projects count
- Total budget vs. utilized
- Pending expenses
- Active team members
- Project status overview

**SQL Query:**
```sql
SELECT 
  COUNT(DISTINCT p.id) as total_projects,
  SUM(p.total_budget) as total_budget,
  SUM(p.utilized_budget) as total_utilized,
  COUNT(DISTINCT t.id) as total_team_members,
  COUNT(DISTINCT pe.id) as pending_expenses
FROM projects p
LEFT JOIN users t ON t.role = 'team_member'
LEFT JOIN project_expenses pe ON pe.status = 'pending';
```

---

### **2. ACCOUNTANT DASHBOARD PAGE**
**Table Dependencies:** `project_expenses`, `bills`, `budget_allocation`, `budget_utilization`, `users`

**Data Required:**
- Pending expense claims
- Approved expenses (last 30 days)
- Bills status summary
- Budget vs. utilized per project
- Approval pending items

**Primary Queries:**
```sql
SELECT * FROM project_expenses WHERE status IN ('pending', 'submitted') ORDER BY date DESC;
SELECT * FROM bills WHERE status != 'paid' ORDER BY due_date;
SELECT * FROM budget_allocation ORDER BY fiscal_year DESC;
```

---

### **3. PROJECT MANAGER DASHBOARD PAGE**
**Table Dependencies:** `projects`, `tasks`, `real_time_updates`, `calendar_events`, `project_team_members`

**Data Required:**
- Projects assigned
- Task completion status
- Recent updates
- Team member performance
- Milestone progress

---

### **4. TEAM MEMBER DASHBOARD PAGE**
**Table Dependencies:** `tasks`, `task_time_logs`, `daily_reports`, `projects`

**Data Required:**
- Assigned tasks (priority-wise)
- Tasks due this week
- Time logged today
- Recent updates on assigned tasks
- Projects involvement

---

### **5. LOGINPAGE PAGE**
**Table Dependencies:** `users`, `auth.users` (Supabase Auth)

**Features:**
- Email/password authentication (Supabase)
- Role verification
- Last login tracking
- 2FA support (optional)

**SQL after login:**
```sql
UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = auth.uid();
```

---

### **6. SIDEBAR PAGE**
**Table Dependencies:** `users`, `projects`

**Data Required:**
- User profile info
- Assigned projects (2-3 recent)
- Pending notifications count
- User role display

---

### **7. FILTERBAR PAGE**
**Table Dependencies:** `projects`, `csr_partners`, `users`, `tasks`

**Features:**
- Filter by project
- Filter by partner
- Filter by status
- Filter by date range
- Filter by user/team member
- Filter by category

---

### **8. PROJECTSPAGE PAGE**
**Table Dependencies:** `projects`, `csr_partners`, `project_team_members`, `users`

**Data Required:**
- List of all projects
- Project details card (name, partner, status, budget, completion%)
- Search & filtering
- Project statistics
- Team count per project

**SQL Query:**
```sql
SELECT p.*, 
  cp.name as partner_name,
  (SELECT COUNT(*) FROM project_team_members WHERE project_id = p.id) as team_count
FROM projects p
LEFT JOIN csr_partners cp ON p.csr_partner_id = cp.id
WHERE p.is_active = true
ORDER BY p.created_at DESC;
```

---

### **9. CSR_PARTNERSPAGE PAGE**
**Table Dependencies:** `csr_partners`, `projects`, `budget_utilization`

**Data Required:**
- Partner list with details
- Budget allocated vs. utilized
- Active projects per partner
- Contact information
- Document links (MOU, etc.)

---

### **10. BILLS PAGE**
**Table Dependencies:** `bills`, `project_expenses`, `projects`, `users`

**Data Required:**
- Bill list (pending, approved, paid)
- Bill details (vendor, amount, date)
- Payment status
- Attached documents (Google Drive)
- Action history

**SQL Query:**
```sql
SELECT b.*, p.name as project_name, u.full_name as submitted_by_name
FROM bills b
LEFT JOIN projects p ON b.project_id = p.id
LEFT JOIN users u ON b.submitted_by = u.id
ORDER BY b.date DESC;
```

---

### **11. EXPENSE CLAIMPAGE PAGE**
**Table Dependencies:** `project_expenses`, `expense_categories`, `projects`, `users`

**Data Required:**
- Expense form (category, amount, date, merchant)
- Receipt upload area (Google Drive link)
- Approval workflow display
- Approval history
- Status tracker

**Workflow:**
```
Draft → Submitted → Pending → Approved/Rejected → Reimbursed
```

---

### **12. UTILIZATIONCERTIFICATEPAGE PAGE**
**Table Dependencies:** `utilization_certificates`, `projects`, `csr_partners`, `budget_utilization`

**Data Required:**
- UC list (quarterly, annual, completion)
- Generated reports (PDF from Google Drive)
- Approval status
- Partner acknowledgment status
- Fiscal year breakdown

**SQL Query:**
```sql
SELECT uc.*, cp.name as partner_name, p.name as project_name
FROM utilization_certificates uc
LEFT JOIN csr_partners cp ON uc.csr_partner_id = cp.id
LEFT JOIN projects p ON uc.project_id = p.id
ORDER BY uc.issue_date DESC;
```

---

### **13. ANALYSIS REPORTPAGE PAGE**
**Table Dependencies:** `reports`, `projects`, `project_expenses`, `tasks`, `real_time_updates`

**Data Required:**
- Report types: Project, Daily, Monthly, Quarterly, Annual, Impact, Financial
- Charts: Beneficiaries by project, expense distribution, progress
- Key metrics (KPIs)
- Summary statistics
- Downloadable reports (Google Drive)

**SQL Query:**
```sql
SELECT r.*, p.name as project_name
FROM reports r
LEFT JOIN projects p ON r.project_id = p.id
WHERE r.status = 'approved'
ORDER BY r.generated_date DESC;
```

---

### **14. ARTICLE PAGE & ARTICLESPAGE PAGE**
**Table Dependencies:** `media_articles`, `projects`, `real_time_updates`, `tasks`

**Data Required:**
- Media list (photos, videos, articles, certificates)
- Filter by type (photo/video/document/newspaper)
- Projects associated
- Publication details (for news)
- Drive link (primary storage)
- View count, download count
- Tags and keywords

**SQL Query:**
```sql
SELECT ma.*, p.name as project_name, COUNT(*) as total_count
FROM media_articles ma
LEFT JOIN projects p ON ma.project_id = p.id
WHERE ma.is_public = true OR ma.access_level = 'client'
GROUP BY ma.id, p.name
ORDER BY ma.created_at DESC;
```

---

### **15. CALENDAR PAGE & CALENDARPAGES PAGE**
**Table Dependencies:** `calendar_events`, `event_attendance`, `tasks`, `projects`, `users`

**Data Required:**
- Calendar view (month, week, day)
- Events list
- Event details (date, time, location, attendees)
- Meeting links
- Attendance status
- Action items

**SQL Query:**
```sql
SELECT ce.*, 
  (SELECT COUNT(*) FROM event_attendance WHERE event_id = ce.id AND status = 'accepted') as confirmed_attendees
FROM calendar_events ce
ORDER BY ce.event_date ASC;
```

---

### **16. DAILY REPORTPAGE PAGE**
**Table Dependencies:** `daily_reports`, `tasks`, `projects`, `users`

**Data Required:**
- Daily task list
- Completion status
- Photos/videos from field
- Work summary
- Activities logged
- Time tracking
- Approval status

**SQL Query:**
```sql
SELECT dr.*, p.name as project_name, u.full_name as user_name
FROM daily_reports dr
LEFT JOIN projects p ON dr.project_id = p.id
LEFT JOIN users u ON dr.user_id = u.id
WHERE dr.date = CURRENT_DATE
ORDER BY dr.created_at DESC;
```

---

### **17. DASHBOARD FORMSPAGE PAGE**
**Table Dependencies:** `data_entry_forms`, `projects`, `users`

**Data Required:**
- Form list (Survey, Assessment, Feedback, Registration)
- Pre/Post form data
- Respondent details
- Form completion status
- Uploaded documents
- Approval workflow

**SQL Query:**
```sql
SELECT def.*, p.name as project_name
FROM data_entry_forms def
LEFT JOIN projects p ON def.project_id = p.id
ORDER BY def.date DESC;
```

---

### **18. DATA ENTRYPAGE PAGE**
**Table Dependencies:** `data_entry_forms`, `projects`, `users`

**Data Required:**
- Form filling interface
- Dynamic field generation
- Pre/Post assessment tracking
- Respondent info
- Document upload (Google Drive)
- Submission status

---

### **19. CSRBUDGETPAGE PAGE**
**Table Dependencies:** `budget_allocation`, `projects`, `budget_utilization`, `csr_partners`

**Data Required:**
- Budget by category
- Allocated vs. utilized
- Quarter-wise breakdown
- Partner-wise budget
- Budget vs. spending chart

**SQL Query:**
```sql
SELECT ba.*, p.name as project_name
FROM budget_allocation ba
LEFT JOIN projects p ON ba.project_id = p.id
ORDER BY ba.fiscal_year DESC, ba.quarter DESC;
```

---

### **20. REALTIME UPDATEPAGE PAGE**
**Table Dependencies:** `real_time_updates`, `projects`, `media_articles`, `users`

**Data Required:**
- Update list (recent first)
- Update details (description, location, impact)
- Images gallery (Google Drive)
- Participant list
- Beneficiaries count
- Status (public/client/private)

**SQL Query:**
```sql
SELECT ru.*, p.name as project_name
FROM real_time_updates ru
LEFT JOIN projects p ON ru.project_id = p.id
WHERE ru.is_public = true OR ru.is_sent_to_client = true
ORDER BY ru.date DESC;
```

---

### **21. MEDIAPAGE PAGE**
**Table Dependencies:** `media_articles`, `projects`, `users`

**Data Required:**
- Media gallery
- Filter by type (photo/video/article/document)
- Project filter
- Date range filter
- Thumbnail preview
- Download/view counts

---

### **22. TO-DO LIST PAGE / TASKSPAGE PAGE**
**Table Dependencies:** `tasks`, `projects`, `users`, `task_time_logs`

**Data Required:**
- Task list (assigned to user)
- Priority sorting
- Status filtering (Not Started, In Progress, Completed)
- Due date highlighting
- Time logs
- Task details on click

**SQL Query:**
```sql
SELECT t.*, p.name as project_name,
  (SELECT SUM(duration_minutes) FROM task_time_logs WHERE task_id = t.id) as total_hours_logged
FROM tasks t
LEFT JOIN projects p ON t.project_id = p.id
WHERE t.assigned_to = auth.uid()
ORDER BY t.due_date ASC;
```

---

### **23. UPCOMING EXPENSESPAGE PAGE**
**Table Dependencies:** `project_expenses`, `budget_allocation`, `projects`

**Data Required:**
- Expenses due in next 30 days
- Category-wise breakdown
- Project allocation
- Budget vs. planned expenses
- Alert for budget exceed

**SQL Query:**
```sql
SELECT pe.*, p.name as project_name, ec.name as category_name
FROM project_expenses pe
LEFT JOIN projects p ON pe.project_id = p.id
LEFT JOIN expense_categories ec ON pe.category_id = ec.id
WHERE pe.status IN ('draft', 'submitted', 'pending')
AND pe.date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days'
ORDER BY pe.date ASC;
```

---

### **24. USER ASSIGNMENTPAGE PAGE**
**Table Dependencies:** `project_team_members`, `users`, `projects`, `tasks`

**Data Required:**
- Team member assignment form
- Project selection
- Role assignment (lead, approver, viewer)
- Permissions assignment
- Current team list
- Remove member option

---

### **25. TEAM MEMBERSPAGE PAGE**
**Table Dependencies:** `users`, `project_team_members`, `projects`

**Data Required:**
- Team member list
- Department/role info
- Projects assigned
- Contact details
- Manager hierarchy
- Status (active/inactive)

**SQL Query:**
```sql
SELECT u.*, 
  (SELECT COUNT(*) FROM project_team_members WHERE user_id = u.id AND is_active = true) as active_projects,
  (SELECT COUNT(*) FROM tasks WHERE assigned_to = u.id AND status != 'completed') as pending_tasks
FROM users u
WHERE u.role IN ('team_member', 'project_manager')
ORDER BY u.full_name;
```

---

### **26. TEAM MEMBER DASHBOARDPAGE PAGE**
**Table Dependencies:** `users`, `tasks`, `task_time_logs`, `daily_reports`, `projects`

**Data Required:**
- Individual team member profile
- Performance metrics
- Tasks assigned vs. completed
- Hours logged
- Daily reports submitted
- Project involvement

---

### **27. SWITCH USERSPAGE PAGE**
**Table Dependencies:** `users`, `auth.users`

**Features:**
- Admin-only feature
- Switch to test as different role
- Session management
- Audit logging

---

### **28. MEDIA UPLOADPAGE (implicit in MediaPage)**
**Table Dependencies:** `media_articles`, `projects`

**Data Required:**
- File upload form (to Google Drive)
- Metadata entry (title, description, category)
- Project selection
- Tags & keywords
- Media type selection
- Drive link storage

---

### **29. NOTIFICATIONS / ALERTS (implicit)**
**Table Dependencies:** `notifications`, `communications`, `users`

**Data Required:**
- Notification list
- In-app alerts
- Email template system
- WhatsApp template system
- Read/unread status
- Action on notification

---

---

## **ENTITY RELATIONSHIP DIAGRAM (ERD) SUMMARY**

```
┌─────────────────┐
│   USERS         │ (5 Roles)
└────────┬────────┘
         │ (created_by, updated_by)
         │ (manager_id, reporting_to)
         │ (assigned_to, responsible_user_id)
         │
    ┌────┴──────────────────────────────────┐
    │                                        │
┌───▼──────────┐                  ┌────────▼──────┐
│  PROJECTS    │◄─────────────────│  CSR_PARTNERS │
│              │  (csr_partner_id)│              │
└──────┬───────┘                  └───────────────┘
       │
       ├──► PROJECT_TEAM_MEMBERS
       │    ├──► tasks
       │    ├──► real_time_updates
       │    └──► media_articles
       │
       ├──► TASKS
       │    ├──► task_time_logs
       │    └──► timelines (milestones)
       │
       ├──► PROJECT_EXPENSES
       │    ├──► expense_categories
       │    └──► expense_approvals
       │
       ├──► BUDGET_ALLOCATION
       │
       ├──► CALENDAR_EVENTS
       │    └──► event_attendance
       │
       ├──► DAILY_REPORTS
       │
       ├──► DATA_ENTRY_FORMS
       │
       └──► REPORTS
            ├──► utilization_certificates
            └──► bills

COMMON TABLES:
├── NOTIFICATIONS (user notifications)
├── COMMUNICATIONS (email, whatsapp, phone logs)
├── ACTIVITY_LOGS (audit trail)
└── SYSTEM_LOGS (error tracking)
```

---

## **ROLE-WISE DATA ACCESS MATRIX**

| Page | Admin | Accountant | PM | Team Member | Client |
|------|-------|------------|----|-------------|--------|
| Admin Dashboard | ✓ | ✗ | ✗ | ✗ | ✗ |
| Accountant Dashboard | ✓ | ✓ | ✗ | ✗ | ✗ |
| Project Manager Dashboard | ✓ | ✗ | ✓ | ✗ | ✗ |
| Team Member Dashboard | ✓ | ✗ | ✓ | ✓ | ✗ |
| Projects Page | ✓ | ✓ | ✓ | ✓ | ✓ (Public) |
| CSR Partners Page | ✓ | ✓ | ✓ | ✗ | ✗ |
| Bills | ✓ | ✓ | ✓ | ✗ | ✗ |
| Expense Claim | ✓ | ✓ | ✓ | ✓ | ✗ |
| Tasks/To-Do | ✓ | ✗ | ✓ | ✓ | ✗ |
| Calendar | ✓ | ✗ | ✓ | ✓ | ✓ (Public Events) |
| Media/Articles | ✓ | ✗ | ✓ | ✓ | ✓ (Public) |
| Real-Time Updates | ✓ | ✗ | ✓ | ✓ | ✓ (Sent Updates) |
| Daily Reports | ✓ | ✗ | ✓ | ✓ | ✗ |
| Data Entry Forms | ✓ | ✗ | ✓ | ✓ | ✗ |
| Budget Pages | ✓ | ✓ | ✓ | ✗ | ✗ |
| Utilization Certificate | ✓ | ✓ | ✓ | ✗ | ✓ (Sent) |
| Analysis Reports | ✓ | ✓ | ✓ | ✗ | ✓ (Public) |
| Team Members | ✓ | ✗ | ✓ | ✗ | ✗ |
| Switch Users | ✓ | ✗ | ✗ | ✗ | ✗ |

---

## **DATA FLOW BY OPERATION**

### **Expense Approval Workflow**
```
Team Member submits expense → 
Accountant reviews (pending) → 
Accountant/Admin approves → 
Status: approved → 
Bill generated → 
Payment processed
```

**Tables Involved:**
- project_expenses
- expense_approvals
- bills
- budget_allocation (auto-updated)
- activity_logs (audit)

### **Project Update Workflow**
```
Team Member submits daily report/update → 
PM reviews & approves → 
Update published → 
Sent to client (if public) → 
Notification generated
```

**Tables Involved:**
- daily_reports OR real_time_updates
- media_articles (for photos/videos)
- notifications
- communications

### **Budget Allocation Workflow**
```
Admin sets project budget → 
Expenses submitted → 
Auto-calculate utilized/pending → 
Generate UC → 
Partner acknowledgment
```

**Tables Involved:**
- projects (total_budget)
- budget_allocation
- project_expenses (status tracking)
- utilization_certificates
- budget_utilization

---

## **KEY INDEXES FOR PERFORMANCE**

✓ project_id (on most transaction tables)
✓ user_id (on assignments, logs, notifications)
✓ status (on expenses, tasks, projects)
✓ created_at (for filtering by date)
✓ is_active (for visibility filtering)
✓ project_id + status (composite for queries)

---

## **MIGRATION FROM MOCKDATA.TS TO SUPABASE**

Your mockData.ts contains:
- 10 users ✓ → users table
- 4 CSR Partners ✓ → csr_partners table
- 12 projects ✓ → projects table (supports all 4 projects × 3 partners)
- 28 tasks ✓ → tasks table
- 14 real-time updates ✓ → real_time_updates table
- 21 media articles ✓ → media_articles table
- 27 expenses ✓ → project_expenses table
- 40 budgets ✓ → budget_allocation table
- 12 utilization certificates ✓ → utilization_certificates table
- 15 bills ✓ → bills table
- 16 data entries ✓ → data_entry_forms table
- 18 daily reports ✓ → daily_reports table

**✓ All data structures are fully supported!**

---

## **NEXT STEPS**

1. **Create Supabase project**
2. **Copy SQL schema** → Supabase SQL Editor
3. **Enable RLS** (Row Level Security) as defined
4. **Create seed data** for initial roles & categories
5. **Setup Auth** (Email/Password with Supabase)
6. **Create React hooks** to query from Supabase
7. **Implement role-based routing** using user roles
8. **Setup real-time subscriptions** for updates
9. **Test permissions** via different roles
10. **Deploy to production**

---

## **PERFORMANCE CONSIDERATIONS**

- **Materialized Views** for dashboards (cache calculations)
- **Connection pooling** for concurrent users
- **Pagination** on large lists (bills, expenses, media)
- **Incremental loading** for real-time updates
- **Archive old data** (expenses > 2 years)
- **Indexes** on frequently filtered columns

---

