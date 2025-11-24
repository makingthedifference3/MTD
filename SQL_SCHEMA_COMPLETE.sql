-- =====================================================================
-- MTD CSR MANAGEMENT PLATFORM - COMPLETE SUPABASE SQL SCHEMA
-- Production-Ready Schema for 5-Role System (Admin, Accountant, 
-- Project Manager, Team Member, Client)
-- Supports 29 Pages + Full Data Dictionary
-- =====================================================================

-- =====================================================================
-- 1. USERS TABLE
-- Purpose: Manages user accounts linked to Supabase auth
-- =====================================================================
CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  mobile_number VARCHAR(20),
  
  -- Address Information
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  pincode VARCHAR(10),
  
  -- Role & Access Control
  role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'accountant', 'project_manager', 'team_member', 'client')),
  
  -- Organization Structure
  department VARCHAR(100),
  team VARCHAR(100),
  designation VARCHAR(100),
  manager_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  reporting_to VARCHAR(255),
  cosmetic_employee_id VARCHAR(50) UNIQUE,
  
  -- Account Status
  is_active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMP WITH TIME ZONE,
  
  -- Customization
  preferences JSONB DEFAULT '{}',
  permissions JSONB DEFAULT '{}',
  
  -- Audit Trail
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES public.users(id),
  updated_by UUID REFERENCES public.users(id),
  
  CONSTRAINT valid_role CHECK (role IN ('admin', 'accountant', 'project_manager', 'team_member', 'client'))
);

CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_users_department ON public.users(department);
CREATE INDEX idx_users_manager_id ON public.users(manager_id);
CREATE INDEX idx_users_is_active ON public.users(is_active);

-- =====================================================================
-- 2. CSR_PARTNERS TABLE
-- Purpose: Corporate Social Responsibility partners/clients providing funding
-- =====================================================================
CREATE TABLE public.csr_partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Basic Information
  name VARCHAR(255) NOT NULL UNIQUE,
  company_name VARCHAR(255),
  registration_number VARCHAR(100),
  pan_number VARCHAR(10) UNIQUE,
  gst_number VARCHAR(15),
  
  -- Contact Information
  contact_person VARCHAR(255),
  designation VARCHAR(100),
  email VARCHAR(255),
  phone VARCHAR(20),
  alternate_phone VARCHAR(20),
  
  -- Address
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  pincode VARCHAR(10),
  
  -- Business Information
  website VARCHAR(500),
  logo_drive_link VARCHAR(500),
  mou_drive_link VARCHAR(500),
  
  -- Budget Tracking
  budget_allocated DECIMAL(15, 2),
  budget_utilized DECIMAL(15, 2) DEFAULT 0,
  budget_pending DECIMAL(15, 2) DEFAULT 0,
  fiscal_year VARCHAR(9),
  
  -- Agreement Details
  agreement_start_date DATE,
  agreement_end_date DATE,
  payment_terms TEXT,
  billing_cycle VARCHAR(50),
  
  -- Banking & Documents
  bank_details JSONB,
  contact_details JSONB,
  documents JSONB,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  
  -- Audit Trail
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES public.users(id),
  updated_by UUID REFERENCES public.users(id)
);

CREATE INDEX idx_csr_partners_name ON public.csr_partners(name);
CREATE INDEX idx_csr_partners_is_active ON public.csr_partners(is_active);
CREATE INDEX idx_csr_partners_email ON public.csr_partners(email);

-- =====================================================================
-- 3. PROJECTS TABLE
-- Purpose: Highly detailed project tracking with complete interconnections
-- =====================================================================
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Partner & Management
  csr_partner_id UUID NOT NULL REFERENCES public.csr_partners(id) ON DELETE CASCADE,
  project_manager_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  assistant_manager_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  
  -- Location Information
  location VARCHAR(255),
  state VARCHAR(100),
  district VARCHAR(100),
  city VARCHAR(100),
  block VARCHAR(100),
  village VARCHAR(100),
  pincode VARCHAR(10),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  
  -- Project Classification
  category VARCHAR(100),
  sub_category VARCHAR(100),
  project_type VARCHAR(50) CHECK (project_type IN ('one_time', 'ongoing', 'recurring')),
  focus_area TEXT[], -- Array of focus areas
  
  -- Status & Timeline
  status VARCHAR(50) CHECK (status IN ('planning', 'active', 'on_hold', 'completed', 'cancelled', 'archived')),
  start_date DATE,
  expected_end_date DATE,
  actual_end_date DATE,
  duration_months INT,
  
  -- Budget Information
  total_budget DECIMAL(15, 2),
  approved_budget DECIMAL(15, 2),
  utilized_budget DECIMAL(15, 2) DEFAULT 0,
  pending_budget DECIMAL(15, 2) DEFAULT 0,
  
  -- Beneficiary Information
  total_beneficiaries INT DEFAULT 0,
  direct_beneficiaries INT DEFAULT 0,
  indirect_beneficiaries INT DEFAULT 0,
  male_beneficiaries INT DEFAULT 0,
  female_beneficiaries INT DEFAULT 0,
  children_beneficiaries INT DEFAULT 0,
  beneficiaries_reached INT DEFAULT 0,
  
  -- Progress Tracking
  targets JSONB,
  achievements JSONB,
  completion_percentage INT DEFAULT 0,
  milestones_completed INT DEFAULT 0,
  total_milestones INT DEFAULT 0,
  
  -- Documentation (Google Drive Links)
  proposal_drive_link VARCHAR(500),
  approval_letter_drive_link VARCHAR(500),
  budget_sheet_drive_link VARCHAR(500),
  mou_drive_link VARCHAR(500),
  project_plan_drive_link VARCHAR(500),
  documents_folder_link VARCHAR(500),
  
  -- Status & Metadata
  is_active BOOLEAN DEFAULT true,
  tags TEXT[],
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  
  -- Audit Trail
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES public.users(id),
  updated_by UUID REFERENCES public.users(id)
);

CREATE INDEX idx_projects_project_code ON public.projects(project_code);
CREATE INDEX idx_projects_csr_partner_id ON public.projects(csr_partner_id);
CREATE INDEX idx_projects_project_manager_id ON public.projects(project_manager_id);
CREATE INDEX idx_projects_status ON public.projects(status);
CREATE INDEX idx_projects_is_active ON public.projects(is_active);

-- =====================================================================
-- 4. PROJECT_TEAM_MEMBERS TABLE
-- Purpose: Detailed team member assignments per project
-- =====================================================================
CREATE TABLE public.project_team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Role Information
  role VARCHAR(100),
  designation VARCHAR(100),
  responsibilities TEXT,
  
  -- Permissions
  is_lead BOOLEAN DEFAULT false,
  can_approve_expenses BOOLEAN DEFAULT false,
  can_assign_tasks BOOLEAN DEFAULT false,
  access_level VARCHAR(50) CHECK (access_level IN ('full', 'limited', 'view_only')),
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  
  -- Audit Trail
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES public.users(id),
  updated_by UUID REFERENCES public.users(id),
  
  UNIQUE(project_id, user_id)
);

CREATE INDEX idx_project_team_members_project_id ON public.project_team_members(project_id);
CREATE INDEX idx_project_team_members_user_id ON public.project_team_members(user_id);
CREATE INDEX idx_project_team_members_is_active ON public.project_team_members(is_active);

-- =====================================================================
-- 5. TIMELINES (MILESTONES) TABLE
-- Purpose: Project milestones and deliverables with dependencies
-- =====================================================================
CREATE TABLE public.timelines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES public.timelines(id) ON DELETE CASCADE,
  
  -- Identification
  milestone_code VARCHAR(50) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Classification
  category VARCHAR(100) CHECK (category IN ('Planning', 'Execution', 'Monitoring', 'Closure')),
  
  -- Timeline
  start_date DATE,
  end_date DATE,
  actual_start_date DATE,
  actual_end_date DATE,
  duration_days INT,
  
  -- Status & Progress
  status VARCHAR(50) CHECK (status IN ('not_started', 'in_progress', 'completed', 'on_priority', 'blocked', 'cancelled')),
  completion_percentage INT DEFAULT 0,
  order_index INT,
  priority VARCHAR(50),
  is_critical_path BOOLEAN DEFAULT false,
  
  -- Dependencies & Deliverables
  dependencies UUID[],
  deliverables TEXT[],
  success_criteria TEXT[],
  
  -- Ownership & Approval
  responsible_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  approved_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  approval_date DATE,
  
  -- Documentation
  attachments JSONB,
  notes TEXT,
  
  -- Audit Trail
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES public.users(id),
  updated_by UUID REFERENCES public.users(id)
);

CREATE INDEX idx_timelines_project_id ON public.timelines(project_id);
CREATE INDEX idx_timelines_milestone_code ON public.timelines(milestone_code);
CREATE INDEX idx_timelines_status ON public.timelines(status);

-- =====================================================================
-- 6. TASKS TABLE
-- Purpose: Highly detailed task management with complete tracking
-- =====================================================================
CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_code VARCHAR(50) UNIQUE NOT NULL,
  
  -- Relationships
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  timeline_id UUID REFERENCES public.timelines(id) ON DELETE SET NULL,
  parent_task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
  
  -- Task Information
  title VARCHAR(255) NOT NULL,
  description TEXT,
  task_type VARCHAR(100) CHECK (task_type IN ('Development', 'Research', 'Meeting', 'Review', 'Distribution', 'Event', 'Infrastructure', 'Education', 'Logistics', 'Finance')),
  category VARCHAR(100),
  
  -- Assignment
  assigned_to UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  assigned_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  department VARCHAR(100),
  
  -- Timeline & Priority
  due_date DATE,
  start_date DATE,
  completed_date DATE,
  status VARCHAR(50) CHECK (status IN ('not_started', 'in_progress', 'completed', 'on_priority', 'blocked', 'cancelled')),
  priority VARCHAR(50),
  
  -- Progress
  completion_percentage INT DEFAULT 0,
  actual_hours INT DEFAULT 0,
  
  -- Classification & Visibility
  tags TEXT[],
  dependencies UUID[],
  is_visible_to_client BOOLEAN DEFAULT false,
  is_from_client_timeline BOOLEAN DEFAULT false,
  
  -- Details
  checklist JSONB,
  attachments JSONB,
  comments_count INT DEFAULT 0,
  updates_count INT DEFAULT 0,
  
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  
  -- Audit Trail
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES public.users(id),
  updated_by UUID REFERENCES public.users(id)
);

CREATE INDEX idx_tasks_task_code ON public.tasks(task_code);
CREATE INDEX idx_tasks_project_id ON public.tasks(project_id);
CREATE INDEX idx_tasks_assigned_to ON public.tasks(assigned_to);
CREATE INDEX idx_tasks_status ON public.tasks(status);
CREATE INDEX idx_tasks_due_date ON public.tasks(due_date);

-- =====================================================================
-- 7. TASK_TIME_LOGS TABLE
-- Purpose: Detailed time tracking per task
-- =====================================================================
CREATE TABLE public.task_time_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Time Information
  start_time TIMESTAMP WITH TIME ZONE,
  end_time TIMESTAMP WITH TIME ZONE,
  duration_minutes INT,
  
  -- Details
  description TEXT,
  is_billable BOOLEAN DEFAULT false,
  
  -- Audit Trail
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_task_time_logs_task_id ON public.task_time_logs(task_id);
CREATE INDEX idx_task_time_logs_user_id ON public.task_time_logs(user_id);

-- =====================================================================
-- 8. REAL_TIME_UPDATES TABLE
-- Purpose: Project progress updates with media and location tracking
-- =====================================================================
CREATE TABLE public.real_time_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  update_code VARCHAR(50) UNIQUE NOT NULL,
  
  -- Relationships
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  task_id UUID REFERENCES public.tasks(id) ON DELETE SET NULL,
  timeline_id UUID REFERENCES public.timelines(id) ON DELETE SET NULL,
  
  -- Update Information
  title VARCHAR(255),
  description TEXT,
  update_type VARCHAR(50) CHECK (update_type IN ('Progress', 'Issue', 'Achievement', 'Milestone')),
  category VARCHAR(100),
  update_number INT,
  document_number VARCHAR(100),
  reference_number VARCHAR(100),
  
  -- Timestamp
  date DATE,
  time TIME,
  
  -- Location Information
  location_name VARCHAR(255),
  school_name VARCHAR(255),
  institution_name VARCHAR(255),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  
  -- Media & Attachments
  images JSONB,
  videos JSONB,
  documents JSONB,
  
  -- Participation & Impact
  participants UUID[],
  beneficiaries_count INT DEFAULT 0,
  attendees_count INT DEFAULT 0,
  impact_data JSONB,
  metrics JSONB,
  
  -- Visibility & Distribution
  is_public BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  is_sent_to_client BOOLEAN DEFAULT false,
  sent_date DATE,
  
  format_type VARCHAR(50),
  tags TEXT[],
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  
  -- Audit Trail
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES public.users(id),
  updated_by UUID REFERENCES public.users(id)
);

CREATE INDEX idx_real_time_updates_project_id ON public.real_time_updates(project_id);
CREATE INDEX idx_real_time_updates_update_code ON public.real_time_updates(update_code);
CREATE INDEX idx_real_time_updates_is_public ON public.real_time_updates(is_public);

-- =====================================================================
-- 9. MEDIA_ARTICLES TABLE
-- Purpose: Media library - ONLY Google Drive links stored (NO files in Supabase)
-- =====================================================================
CREATE TABLE public.media_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  media_code VARCHAR(50) UNIQUE NOT NULL,
  
  -- Relationships
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  task_id UUID REFERENCES public.tasks(id) ON DELETE SET NULL,
  update_id UUID REFERENCES public.real_time_updates(id) ON DELETE SET NULL,
  
  -- Content Information
  title VARCHAR(255) NOT NULL,
  description TEXT,
  media_type VARCHAR(50) CHECK (media_type IN ('photo', 'video', 'document', 'pdf', 'newspaper_cutting', 'certificate', 'report')),
  category VARCHAR(100),
  sub_category VARCHAR(100),
  
  -- Google Drive Storage (PRIMARY & ONLY STORAGE)
  drive_link VARCHAR(500),
  drive_folder_link VARCHAR(500),
  thumbnail_link VARCHAR(500),
  
  -- File Metadata (Reference Only)
  file_name VARCHAR(255),
  file_size_mb DECIMAL(10, 2),
  file_format VARCHAR(50),
  resolution VARCHAR(100),
  duration_seconds INT,
  
  -- Media Specific
  is_geo_tagged BOOLEAN DEFAULT false,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  captured_at TIMESTAMP WITH TIME ZONE,
  camera_details VARCHAR(255),
  
  -- News/Publication Information
  news_channel VARCHAR(255),
  publication_name VARCHAR(255),
  publication_date DATE,
  reporter_name VARCHAR(255),
  article_url VARCHAR(500),
  
  -- Dates
  date DATE,
  event_date DATE,
  location VARCHAR(255),
  
  -- Classification & Access
  tags TEXT[],
  keywords TEXT[],
  is_public BOOLEAN DEFAULT true,
  is_downloadable BOOLEAN DEFAULT true,
  access_level VARCHAR(50) CHECK (access_level IN ('public', 'client', 'internal', 'restricted')),
  
  -- Approval & Usage
  uploaded_by UUID REFERENCES public.users(id),
  approved_by UUID REFERENCES public.users(id),
  approval_date DATE,
  views_count INT DEFAULT 0,
  downloads_count INT DEFAULT 0,
  
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  
  -- Audit Trail
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES public.users(id)
);

CREATE INDEX idx_media_articles_project_id ON public.media_articles(project_id);
CREATE INDEX idx_media_articles_media_code ON public.media_articles(media_code);
CREATE INDEX idx_media_articles_media_type ON public.media_articles(media_type);
CREATE INDEX idx_media_articles_access_level ON public.media_articles(access_level);

-- =====================================================================
-- 10. EXPENSE_CATEGORIES TABLE
-- Purpose: Hierarchical expense classification
-- =====================================================================
CREATE TABLE public.expense_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL UNIQUE,
  code VARCHAR(50) NOT NULL UNIQUE,
  parent_category_id UUID REFERENCES public.expense_categories(id) ON DELETE CASCADE,
  
  description TEXT,
  budget_limit DECIMAL(15, 2),
  requires_approval BOOLEAN DEFAULT true,
  approval_limit DECIMAL(15, 2),
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_expense_categories_code ON public.expense_categories(code);
CREATE INDEX idx_expense_categories_is_active ON public.expense_categories(is_active);

-- =====================================================================
-- 11. PROJECT_EXPENSES TABLE
-- Purpose: Extremely detailed expense tracking with approval workflow
-- =====================================================================
CREATE TABLE public.project_expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expense_code VARCHAR(50) UNIQUE NOT NULL,
  
  -- Relationships
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.expense_categories(id) ON DELETE RESTRICT,
  task_id UUID REFERENCES public.tasks(id) ON DELETE SET NULL,
  
  -- Merchant Information
  merchant_name VARCHAR(255),
  merchant_contact VARCHAR(255),
  merchant_address TEXT,
  merchant_gstin VARCHAR(15),
  merchant_pan VARCHAR(10),
  
  -- Expense Details
  date DATE NOT NULL,
  category VARCHAR(100),
  sub_category VARCHAR(100),
  description TEXT,
  purpose TEXT,
  
  -- Amount Details
  base_amount DECIMAL(15, 2),
  tax_amount DECIMAL(15, 2) DEFAULT 0,
  gst_percentage DECIMAL(5, 2),
  cgst_amount DECIMAL(15, 2) DEFAULT 0,
  sgst_amount DECIMAL(15, 2) DEFAULT 0,
  igst_amount DECIMAL(15, 2) DEFAULT 0,
  other_charges DECIMAL(15, 2) DEFAULT 0,
  discount_amount DECIMAL(15, 2) DEFAULT 0,
  total_amount DECIMAL(15, 2) NOT NULL,
  
  -- Payment Information
  payment_method VARCHAR(50) CHECK (payment_method IN ('Cash', 'Cheque', 'Online', 'Card')),
  payment_reference VARCHAR(255),
  payment_date DATE,
  paid_to VARCHAR(255),
  bank_details JSONB,
  
  -- Documentation (Google Drive Links)
  bill_drive_link VARCHAR(500),
  invoice_drive_link VARCHAR(500),
  receipt_drive_link VARCHAR(500),
  supporting_docs JSONB,
  
  -- Status & Workflow
  status VARCHAR(50) CHECK (status IN ('draft', 'submitted', 'pending', 'approved', 'rejected', 'reimbursed')),
  submitted_by UUID REFERENCES public.users(id),
  submitted_date DATE,
  reviewed_by UUID REFERENCES public.users(id),
  reviewed_date DATE,
  approved_by UUID REFERENCES public.users(id),
  approved_date DATE,
  rejection_reason TEXT,
  reimbursed_date DATE,
  
  -- Accounting
  account_code VARCHAR(100),
  gl_code VARCHAR(100),
  cost_center VARCHAR(100),
  
  -- Reimbursement
  is_reimbursable BOOLEAN DEFAULT true,
  reimbursed_to VARCHAR(255),
  approval_chain JSONB,
  current_approver UUID REFERENCES public.users(id),
  
  -- Classification
  priority VARCHAR(50),
  tags TEXT[],
  notes TEXT,
  internal_notes TEXT,
  metadata JSONB DEFAULT '{}',
  
  -- Audit Trail
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES public.users(id),
  updated_by UUID REFERENCES public.users(id)
);

CREATE INDEX idx_project_expenses_project_id ON public.project_expenses(project_id);
CREATE INDEX idx_project_expenses_expense_code ON public.project_expenses(expense_code);
CREATE INDEX idx_project_expenses_status ON public.project_expenses(status);
CREATE INDEX idx_project_expenses_date ON public.project_expenses(date);

-- =====================================================================
-- 12. EXPENSE_APPROVALS TABLE
-- Purpose: Expense approval audit log
-- =====================================================================
CREATE TABLE public.expense_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expense_id UUID NOT NULL REFERENCES public.project_expenses(id) ON DELETE CASCADE,
  approver_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Approval Details
  action VARCHAR(50) CHECK (action IN ('submitted', 'approved', 'rejected', 'requested_changes')),
  previous_status VARCHAR(50),
  new_status VARCHAR(50),
  comments TEXT,
  attachments JSONB,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_expense_approvals_expense_id ON public.expense_approvals(expense_id);

-- =====================================================================
-- 13. BUDGET_ALLOCATION TABLE
-- Purpose: Detailed budget tracking by category
-- =====================================================================
CREATE TABLE public.budget_allocation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.expense_categories(id) ON DELETE RESTRICT,
  category_name VARCHAR(255),
  
  -- Budget Amounts
  allocated_amount DECIMAL(15, 2),
  utilized_amount DECIMAL(15, 2) DEFAULT 0,
  pending_amount DECIMAL(15, 2) DEFAULT 0,
  available_amount DECIMAL(15, 2),
  
  -- Time Period
  fiscal_year VARCHAR(9),
  quarter VARCHAR(2),
  month VARCHAR(2),
  
  notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_budget_allocation_project_id ON public.budget_allocation(project_id);

-- =====================================================================
-- 14. BUDGET_UTILIZATION TABLE
-- Purpose: Partner-wise CSR budget tracking
-- =====================================================================
CREATE TABLE public.budget_utilization (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  csr_partner_id UUID NOT NULL REFERENCES public.csr_partners(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  
  -- Time Period
  fiscal_year VARCHAR(9),
  quarter VARCHAR(2),
  month VARCHAR(2),
  
  -- Budget Amounts
  allocated_amount DECIMAL(15, 2),
  utilized_amount DECIMAL(15, 2) DEFAULT 0,
  committed_amount DECIMAL(15, 2) DEFAULT 0,
  pending_amount DECIMAL(15, 2) DEFAULT 0,
  available_amount DECIMAL(15, 2),
  utilization_percentage DECIMAL(5, 2),
  
  date DATE,
  description TEXT,
  notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES public.users(id),
  updated_by UUID REFERENCES public.users(id)
);

CREATE INDEX idx_budget_utilization_csr_partner_id ON public.budget_utilization(csr_partner_id);

-- =====================================================================
-- 15. UTILIZATION_CERTIFICATES TABLE
-- Purpose: Official utilization certificates for partners
-- =====================================================================
CREATE TABLE public.utilization_certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  certificate_code VARCHAR(50) UNIQUE NOT NULL,
  
  -- Relationships
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  csr_partner_id UUID NOT NULL REFERENCES public.csr_partners(id) ON DELETE CASCADE,
  
  -- Certificate Information
  certificate_heading VARCHAR(255),
  certificate_type VARCHAR(50) CHECK (certificate_type IN ('Quarterly', 'Annual', 'Project Completion')),
  period_from DATE,
  period_to DATE,
  fiscal_year VARCHAR(9),
  
  -- Amount Details
  total_amount DECIMAL(15, 2),
  utilized_amount DECIMAL(15, 2),
  
  -- Documentation (Google Drive)
  certificate_drive_link VARCHAR(500),
  annexure_drive_link VARCHAR(500),
  supporting_docs JSONB,
  
  format_type VARCHAR(50),
  
  -- Workflow
  issue_date DATE,
  prepared_by UUID REFERENCES public.users(id),
  reviewed_by UUID REFERENCES public.users(id),
  approved_by UUID REFERENCES public.users(id),
  status VARCHAR(50) CHECK (status IN ('draft', 'pending', 'approved')),
  
  -- Partner Communication
  sent_to_partner BOOLEAN DEFAULT false,
  sent_date DATE,
  acknowledged BOOLEAN DEFAULT false,
  acknowledgment_date DATE,
  
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  
  -- Audit Trail
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES public.users(id),
  updated_by UUID REFERENCES public.users(id)
);

CREATE INDEX idx_utilization_certificates_certificate_code ON public.utilization_certificates(certificate_code);
CREATE INDEX idx_utilization_certificates_csr_partner_id ON public.utilization_certificates(csr_partner_id);

-- =====================================================================
-- 16. BILLS TABLE
-- Purpose: Bill and invoice management
-- =====================================================================
CREATE TABLE public.bills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bill_code VARCHAR(50) UNIQUE NOT NULL,
  
  -- Relationships
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  expense_id UUID REFERENCES public.project_expenses(id) ON DELETE SET NULL,
  
  -- Bill Information
  bill_overview TEXT,
  bill_type VARCHAR(50) CHECK (bill_type IN ('Invoice', 'Receipt', 'Estimate')),
  bill_number VARCHAR(100),
  
  -- Vendor Information
  vendor_name VARCHAR(255),
  vendor_gstin VARCHAR(15),
  
  -- Timeline
  date DATE,
  due_date DATE,
  
  -- Amount Details
  subtotal DECIMAL(15, 2),
  tax_amount DECIMAL(15, 2),
  total_amount DECIMAL(15, 2),
  amount_paid DECIMAL(15, 2) DEFAULT 0,
  balance_amount DECIMAL(15, 2),
  
  -- Status
  status VARCHAR(50) CHECK (status IN ('pending', 'approved', 'paid')),
  
  -- Documentation (Google Drive)
  bill_drive_link VARCHAR(500),
  
  -- Terms & Payment
  payment_terms TEXT,
  payment_method VARCHAR(50),
  payment_reference VARCHAR(255),
  
  -- Workflow
  submitted_by UUID REFERENCES public.users(id),
  approved_by UUID REFERENCES public.users(id),
  paid_by UUID REFERENCES public.users(id),
  
  notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES public.users(id)
);

CREATE INDEX idx_bills_bill_code ON public.bills(bill_code);
CREATE INDEX idx_bills_project_id ON public.bills(project_id);

-- =====================================================================
-- 17. REPORTS TABLE
-- Purpose: Comprehensive report generation and management
-- =====================================================================
CREATE TABLE public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_code VARCHAR(50) UNIQUE NOT NULL,
  
  -- Relationships
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  
  -- Report Information
  title VARCHAR(255) NOT NULL,
  report_type VARCHAR(50) CHECK (report_type IN ('Project', 'Daily', 'Monthly', 'Quarterly', 'Annual', 'Impact', 'Financial')),
  category VARCHAR(100),
  description TEXT,
  summary TEXT,
  
  -- Time Period
  period_from DATE,
  period_to DATE,
  fiscal_year VARCHAR(9),
  
  -- Documentation (Google Drive)
  report_drive_link VARCHAR(500),
  presentation_drive_link VARCHAR(500),
  annexures_drive_link VARCHAR(500),
  
  -- Status & Workflow
  status VARCHAR(50) CHECK (status IN ('draft', 'in_review', 'submitted', 'approved', 'rejected')),
  generated_by UUID REFERENCES public.users(id),
  reviewed_by UUID REFERENCES public.users(id),
  approved_by UUID REFERENCES public.users(id),
  generated_date DATE,
  submitted_date DATE,
  approved_date DATE,
  
  -- Data & Analytics
  data JSONB,
  charts JSONB,
  metrics JSONB,
  
  -- Distribution
  is_public BOOLEAN DEFAULT false,
  is_sent_to_client BOOLEAN DEFAULT false,
  sent_date DATE,
  
  -- Versioning
  version VARCHAR(50),
  parent_report_id UUID REFERENCES public.reports(id),
  
  tags TEXT[],
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  
  -- Audit Trail
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES public.users(id),
  updated_by UUID REFERENCES public.users(id)
);

CREATE INDEX idx_reports_report_code ON public.reports(report_code);
CREATE INDEX idx_reports_project_id ON public.reports(project_id);

-- =====================================================================
-- 18. DAILY_REPORTS TABLE
-- Purpose: Field activity and daily work reports
-- =====================================================================
CREATE TABLE public.daily_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_code VARCHAR(50) UNIQUE NOT NULL,
  
  -- Relationships
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  
  -- Report Date
  date DATE NOT NULL,
  day_of_week VARCHAR(10),
  
  -- Report Content
  work_summary TEXT,
  activities TEXT[],
  locations_visited TEXT[],
  
  -- Task Summary
  tasks_completed INT DEFAULT 0,
  tasks_pending INT DEFAULT 0,
  tasks_started INT DEFAULT 0,
  task_details JSONB,
  
  -- Timing
  start_time TIME,
  end_time TIME,
  
  -- Media & Documentation
  photos JSONB,
  videos JSONB,
  documents JSONB,
  
  notes TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE,
  approved_by UUID REFERENCES public.users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_daily_reports_project_id ON public.daily_reports(project_id);
CREATE INDEX idx_daily_reports_user_id ON public.daily_reports(user_id);
CREATE INDEX idx_daily_reports_date ON public.daily_reports(date);

-- =====================================================================
-- 19. DATA_ENTRY_FORMS TABLE
-- Purpose: Survey, assessment, and data collection forms
-- =====================================================================
CREATE TABLE public.data_entry_forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_code VARCHAR(50) UNIQUE NOT NULL,
  
  -- Relationships
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  
  -- Form Information
  form_name VARCHAR(255),
  form_type VARCHAR(50) CHECK (form_type IN ('Survey', 'Assessment', 'Feedback', 'Registration')),
  template_id VARCHAR(100),
  
  -- Date
  date DATE NOT NULL,
  
  -- Location
  location VARCHAR(255),
  school_name VARCHAR(255),
  institution_name VARCHAR(255),
  
  -- Form Data
  pre_form_data JSONB,
  post_form_data JSONB,
  responses JSONB,
  
  -- Respondent Information
  respondent_name VARCHAR(255),
  respondent_type VARCHAR(100),
  respondent_count INT,
  
  -- Documentation (Google Drive)
  filled_form_drive_link VARCHAR(500),
  scanned_form_drive_link VARCHAR(500),
  
  -- Workflow
  submitted_by UUID REFERENCES public.users(id),
  verified_by UUID REFERENCES public.users(id),
  status VARCHAR(50) CHECK (status IN ('draft', 'submitted', 'verified')),
  
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES public.users(id)
);

CREATE INDEX idx_data_entry_forms_project_id ON public.data_entry_forms(project_id);
CREATE INDEX idx_data_entry_forms_form_code ON public.data_entry_forms(form_code);

-- =====================================================================
-- 20. CALENDAR_EVENTS TABLE
-- Purpose: Event and meeting scheduling with attendance tracking
-- =====================================================================
CREATE TABLE public.calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_code VARCHAR(50) UNIQUE NOT NULL,
  
  -- Relationships
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  task_id UUID REFERENCES public.tasks(id) ON DELETE SET NULL,
  
  -- Event Information
  title VARCHAR(255) NOT NULL,
  description TEXT,
  event_type VARCHAR(50) CHECK (event_type IN ('Meeting', 'Training', 'Workshop', 'Review', 'Field Visit')),
  category VARCHAR(100),
  
  -- Scheduling
  event_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  duration_minutes INT,
  is_all_day BOOLEAN DEFAULT false,
  
  -- Location
  location VARCHAR(255),
  venue VARCHAR(255),
  meeting_link VARCHAR(500),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  
  -- Organizer & Participants
  organizer_id UUID NOT NULL REFERENCES public.users(id),
  assigned_to UUID[],
  participants JSONB,
  expected_attendees INT,
  actual_attendees INT,
  
  -- Recurrence
  is_recurring BOOLEAN DEFAULT false,
  recurrence_pattern VARCHAR(100),
  recurrence_end_date DATE,
  
  -- Event Details
  reminders JSONB,
  status VARCHAR(50) CHECK (status IN ('scheduled', 'ongoing', 'completed', 'cancelled')),
  action_items JSONB,
  documents JSONB,
  
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES public.users(id),
  updated_by UUID REFERENCES public.users(id)
);

CREATE INDEX idx_calendar_events_event_code ON public.calendar_events(event_code);
CREATE INDEX idx_calendar_events_project_id ON public.calendar_events(project_id);
CREATE INDEX idx_calendar_events_event_date ON public.calendar_events(event_date);

-- =====================================================================
-- 21. EVENT_ATTENDANCE TABLE
-- Purpose: Track attendance for calendar events
-- =====================================================================
CREATE TABLE public.event_attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.calendar_events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Attendance Status
  status VARCHAR(50) CHECK (status IN ('invited', 'accepted', 'declined', 'attended', 'absent')),
  response_date DATE,
  
  -- Check-in Information
  check_in_time TIMESTAMP WITH TIME ZONE,
  check_out_time TIMESTAMP WITH TIME ZONE,
  
  notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(event_id, user_id)
);

CREATE INDEX idx_event_attendance_event_id ON public.event_attendance(event_id);
CREATE INDEX idx_event_attendance_user_id ON public.event_attendance(user_id);

-- =====================================================================
-- 22. NOTIFICATIONS TABLE
-- Purpose: In-app notifications and alerts
-- =====================================================================
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Content
  title VARCHAR(255),
  message TEXT,
  notification_type VARCHAR(50) CHECK (notification_type IN ('task', 'expense', 'project', 'system', 'alert')),
  category VARCHAR(100),
  priority VARCHAR(50),
  
  -- Reference
  reference_type VARCHAR(100),
  reference_id UUID,
  project_id UUID REFERENCES public.projects(id),
  
  -- Action
  action_url VARCHAR(500),
  action_text VARCHAR(100),
  requires_action BOOLEAN DEFAULT false,
  
  -- Distribution
  channels VARCHAR(50)[],
  
  -- Status
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,
  is_seen BOOLEAN DEFAULT false,
  seen_at TIMESTAMP WITH TIME ZONE,
  
  -- Scheduling
  scheduled_for TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES public.users(id)
);

CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_is_read ON public.notifications(is_read);

-- =====================================================================
-- 23. COMMUNICATIONS TABLE
-- Purpose: Complete communication history tracking
-- =====================================================================
CREATE TABLE public.communications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Relationships
  project_id UUID REFERENCES public.projects(id),
  task_id UUID REFERENCES public.tasks(id),
  event_id UUID REFERENCES public.calendar_events(id),
  
  -- Communication Type
  communication_type VARCHAR(50) CHECK (communication_type IN ('email', 'whatsapp', 'phone', 'meeting', 'system')),
  
  -- Participants
  from_user_id UUID NOT NULL REFERENCES public.users(id),
  to_user_id UUID REFERENCES public.users(id),
  
  -- Content
  subject VARCHAR(255),
  message TEXT,
  
  -- For Phone Calls
  call_duration_minutes INT,
  call_outcome VARCHAR(100),
  
  -- For Meetings
  attendees UUID[],
  attachments JSONB,
  
  -- Status
  status VARCHAR(50) CHECK (status IN ('sent', 'delivered', 'read', 'replied', 'failed')),
  sent_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  read_at TIMESTAMP WITH TIME ZONE,
  
  -- Classification
  is_internal BOOLEAN DEFAULT true,
  priority VARCHAR(50),
  
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES public.users(id)
);

CREATE INDEX idx_communications_from_user_id ON public.communications(from_user_id);
CREATE INDEX idx_communications_project_id ON public.communications(project_id);

-- =====================================================================
-- 24. EMAIL_TEMPLATES TABLE
-- Purpose: Reusable email templates for automated notifications
-- =====================================================================
CREATE TABLE public.email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL UNIQUE,
  
  -- Template Content
  subject VARCHAR(255),
  body TEXT,
  
  -- Classification
  category VARCHAR(100),
  variables JSONB,
  
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================================
-- 25. WHATSAPP_TEMPLATES TABLE
-- Purpose: Reusable WhatsApp message templates
-- =====================================================================
CREATE TABLE public.whatsapp_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL UNIQUE,
  
  -- Template Content
  message TEXT NOT NULL,
  
  -- Classification
  category VARCHAR(100),
  variables JSONB,
  
  -- Media
  media_url VARCHAR(500),
  
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================================
-- 26. ACTIVITY_LOGS TABLE
-- Purpose: Complete audit trail of all system activities
-- =====================================================================
CREATE TABLE public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- User Action
  user_id UUID NOT NULL REFERENCES public.users(id),
  action VARCHAR(50) CHECK (action IN ('INSERT', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT')),
  action_type VARCHAR(50) CHECK (action_type IN ('create', 'edit', 'delete', 'view', 'approve', 'reject')),
  
  -- Entity Information
  entity_type VARCHAR(100),
  entity_id UUID,
  entity_name VARCHAR(255),
  project_id UUID REFERENCES public.projects(id),
  
  -- Changes
  old_values JSONB,
  new_values JSONB,
  changed_fields TEXT[],
  
  description TEXT,
  
  -- Request Details
  ip_address VARCHAR(45),
  user_agent TEXT,
  location VARCHAR(255),
  device_info JSONB,
  
  -- Session
  session_id VARCHAR(255),
  request_id VARCHAR(255),
  duration_ms INT,
  
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_activity_logs_user_id ON public.activity_logs(user_id);
CREATE INDEX idx_activity_logs_entity_type ON public.activity_logs(entity_type);
CREATE INDEX idx_activity_logs_created_at ON public.activity_logs(created_at);

-- =====================================================================
-- 27. SYSTEM_LOGS TABLE
-- Purpose: System error and event logging
-- =====================================================================
CREATE TABLE public.system_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Log Information
  log_level VARCHAR(50) CHECK (log_level IN ('INFO', 'WARNING', 'ERROR', 'CRITICAL')),
  module VARCHAR(255),
  message TEXT,
  error_code VARCHAR(100),
  stack_trace TEXT,
  context JSONB,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_system_logs_log_level ON public.system_logs(log_level);
CREATE INDEX idx_system_logs_created_at ON public.system_logs(created_at);

-- =====================================================================
-- ROLE-BASED ACCESS CONTROL (RBAC) - VIEWS FOR EACH ROLE
-- =====================================================================

-- Admin View - Full Access
CREATE VIEW admin_dashboard AS
SELECT 
  p.id, p.project_code, p.name, p.status,
  cp.name as partner_name,
  p.total_budget, p.utilized_budget,
  (SELECT COUNT(*) FROM public.project_expenses WHERE project_id = p.id AND status = 'pending') as pending_expenses,
  (SELECT SUM(total_amount) FROM public.project_expenses WHERE project_id = p.id AND status = 'approved') as approved_total
FROM public.projects p
LEFT JOIN public.csr_partners cp ON p.csr_partner_id = cp.id
WHERE p.is_active = true;

-- Project Manager View
CREATE VIEW project_manager_dashboard AS
SELECT 
  p.id, p.project_code, p.name, p.status,
  p.total_budget, p.utilized_budget, p.completion_percentage,
  (SELECT COUNT(*) FROM public.tasks WHERE project_id = p.id AND status != 'completed') as pending_tasks,
  (SELECT COUNT(*) FROM public.real_time_updates WHERE project_id = p.id) as total_updates
FROM public.projects p
WHERE p.is_active = true;

-- Accountant View - Finance Focus
CREATE VIEW accountant_dashboard AS
SELECT 
  e.id, e.expense_code, e.project_id, e.category_id,
  e.total_amount, e.status, e.submitted_date, e.approved_date,
  u.full_name as submitted_by_name,
  p.name as project_name
FROM public.project_expenses e
LEFT JOIN public.users u ON e.submitted_by = u.id
LEFT JOIN public.projects p ON e.project_id = p.id
WHERE e.status IN ('pending', 'approved', 'submitted');

-- Team Member View - Task Focus
CREATE VIEW team_member_dashboard AS
SELECT 
  t.id, t.task_code, t.title, t.status, t.priority,
  t.due_date, t.completion_percentage,
  p.name as project_name,
  (SELECT COUNT(*) FROM public.task_time_logs WHERE task_id = t.id) as time_logs_count
FROM public.tasks t
LEFT JOIN public.projects p ON t.project_id = p.id
WHERE t.is_active = true;

-- Client View - Public/Read-Only Access
CREATE VIEW client_dashboard AS
SELECT 
  p.id, p.project_code, p.name, p.status,
  p.start_date, p.expected_end_date, p.completion_percentage,
  p.total_beneficiaries, p.beneficiaries_reached,
  ru.update_code, ru.title as update_title,
  COUNT(DISTINCT ru.id) as total_updates
FROM public.projects p
LEFT JOIN public.real_time_updates ru ON p.id = ru.project_id AND ru.is_sent_to_client = true
WHERE p.is_active = true
GROUP BY p.id, ru.update_code, ru.title;

-- =====================================================================
-- STORED PROCEDURES FOR AUTOMATIC CALCULATIONS
-- =====================================================================

-- Update Project Budget Calculations
CREATE OR REPLACE FUNCTION update_project_budget()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.projects
  SET 
    utilized_budget = COALESCE((
      SELECT SUM(total_amount) 
      FROM public.project_expenses 
      WHERE project_id = NEW.project_id AND status = 'approved'
    ), 0),
    pending_budget = COALESCE((
      SELECT SUM(total_amount) 
      FROM public.project_expenses 
      WHERE project_id = NEW.project_id AND status IN ('submitted', 'pending')
    ), 0),
    updated_at = CURRENT_TIMESTAMP
  WHERE id = NEW.project_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_project_budget
AFTER INSERT OR UPDATE ON public.project_expenses
FOR EACH ROW
EXECUTE FUNCTION update_project_budget();

-- Update Task Completion Percentage
CREATE OR REPLACE FUNCTION calculate_task_completion()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.tasks
  SET 
    completion_percentage = CASE 
      WHEN status = 'completed' THEN 100
      WHEN status = 'in_progress' THEN 50
      WHEN status = 'not_started' THEN 0
      ELSE completion_percentage
    END,
    updated_at = CURRENT_TIMESTAMP
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calculate_task_completion
AFTER UPDATE ON public.tasks
FOR EACH ROW
WHEN (OLD.status IS DISTINCT FROM NEW.status)
EXECUTE FUNCTION calculate_task_completion();

-- =====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.real_time_updates ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can see all data
CREATE POLICY admin_all ON public.projects
FOR ALL
USING ((SELECT role FROM public.users WHERE id = auth.uid()) = 'admin');

-- Policy: Project Managers can see their projects
CREATE POLICY project_manager_own_projects ON public.projects
FOR SELECT
USING (
  (SELECT role FROM public.users WHERE id = auth.uid()) = 'project_manager' 
  AND project_manager_id = auth.uid()
);

-- Policy: Team Members can see tasks assigned to them
CREATE POLICY team_member_own_tasks ON public.tasks
FOR SELECT
USING (
  (SELECT role FROM public.users WHERE id = auth.uid()) = 'team_member' 
  AND assigned_to = auth.uid()
);

-- Policy: Clients can only see public updates
CREATE POLICY client_public_updates ON public.real_time_updates
FOR SELECT
USING (
  (SELECT role FROM public.users WHERE id = auth.uid()) = 'client' 
  AND is_public = true
);

-- =====================================================================
-- INDEXES FOR PERFORMANCE OPTIMIZATION
-- =====================================================================

-- Composite Indexes
CREATE INDEX idx_project_expenses_project_status ON public.project_expenses(project_id, status);
CREATE INDEX idx_tasks_project_assigned ON public.tasks(project_id, assigned_to, status);
CREATE INDEX idx_users_role_department ON public.users(role, department);
CREATE INDEX idx_real_time_updates_project_public ON public.real_time_updates(project_id, is_public);

-- =====================================================================
-- SEED DATA FOR ROLES & CATEGORIES
-- =====================================================================

-- Insert Expense Categories
INSERT INTO public.expense_categories (name, code, description, budget_limit, requires_approval) VALUES
('Materials', 'MAT-001', 'Supplies and materials', 100000, true),
('Logistics', 'LOG-001', 'Transportation and logistics', 50000, true),
('Food & Supplies', 'FAS-001', 'Food items and provisions', 200000, true),
('Technology', 'TECH-001', 'Technology equipment and software', 150000, true),
('Educational Materials', 'EDM-001', 'Books and learning materials', 80000, true),
('Infrastructure', 'INF-001', 'Building and facility setup', 300000, true),
('Environment', 'ENV-001', 'Environment related expenses', 120000, true),
('Videography', 'VID-001', 'Video and photography services', 50000, true),
('Travel', 'TRV-001', 'Travel and accommodation', 40000, true),
('Marketing', 'MKT-001', 'Marketing and promotion', 60000, true),
('Social Media Expense', 'SOC-001', 'Social media advertising', 45000, true),
('Finance', 'FIN-001', 'Financial and administrative', 30000, true);

-- =====================================================================
-- STORED PROCEDURE FOR ROLE ASSIGNMENT
-- =====================================================================

CREATE OR REPLACE FUNCTION assign_user_role(
  user_id UUID,
  new_role VARCHAR
)
RETURNS void AS $$
BEGIN
  IF new_role NOT IN ('admin', 'accountant', 'project_manager', 'team_member', 'client') THEN
    RAISE EXCEPTION 'Invalid role: %', new_role;
  END IF;
  
  UPDATE public.users
  SET role = new_role, updated_at = CURRENT_TIMESTAMP
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================================
-- END OF SCHEMA DEFINITION
-- =====================================================================
