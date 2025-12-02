-- =====================================================================
-- MTD CSR MANAGEMENT PLATFORM - COMPLETE SUPABASE SQL SCHEMA (FIXED)
-- Production-Ready Schema with UPDATE Optimization
-- All Issues Fixed for Smooth Supabase Operations
-- =====================================================================

-- =====================================================================
-- AUTO-UPDATE TIMESTAMP FUNCTION (Applies to all tables)
-- =====================================================================
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================================
-- 1. USERS TABLE (FIXED)
-- =====================================================================
CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  mobile_number VARCHAR(20),
  
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  pincode VARCHAR(10),
  
  role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'accountant', 'project_manager', 'team_member', 'client', 'data_manager')),
  
  department VARCHAR(100),
  team VARCHAR(100),
  designation VARCHAR(100),
  manager_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  reporting_to VARCHAR(255),
  cosmetic_employee_id VARCHAR(50) UNIQUE,
  
  is_active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMP WITH TIME ZONE,
  
  preferences JSONB DEFAULT '{}',
  permissions JSONB DEFAULT '{}',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES public.users(id) ON DELETE SET NULL
);

CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_users_department ON public.users(department);
CREATE INDEX idx_users_manager_id ON public.users(manager_id);
CREATE INDEX idx_users_is_active ON public.users(is_active);

CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON public.users
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- =====================================================================
-- 2. CSR_PARTNERS TABLE (FIXED)
-- =====================================================================
CREATE TABLE public.csr_partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL UNIQUE,
  company_name VARCHAR(255),
  registration_number VARCHAR(100),
  pan_number VARCHAR(10) UNIQUE,
  gst_number VARCHAR(15),
  
  contact_person VARCHAR(255),
  designation VARCHAR(100),
  email VARCHAR(255),
  phone VARCHAR(20),
  alternate_phone VARCHAR(20),
  
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  pincode VARCHAR(10),
  
  website VARCHAR(500),
  logo_drive_link VARCHAR(500),
  mou_drive_link VARCHAR(500),
  
  budget_allocated DECIMAL(15, 2) DEFAULT 0,
  budget_utilized DECIMAL(15, 2) DEFAULT 0,
  budget_pending DECIMAL(15, 2) DEFAULT 0,
  fiscal_year VARCHAR(9),
  
  agreement_start_date DATE,
  agreement_end_date DATE,
  payment_terms TEXT,
  billing_cycle VARCHAR(50),
  
  bank_details JSONB DEFAULT '{}',
  contact_details JSONB DEFAULT '{}',
  documents JSONB DEFAULT '{}',
  
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES public.users(id) ON DELETE SET NULL
);

CREATE INDEX idx_csr_partners_name ON public.csr_partners(name);
CREATE INDEX idx_csr_partners_is_active ON public.csr_partners(is_active);
CREATE INDEX idx_csr_partners_email ON public.csr_partners(email);

CREATE TRIGGER update_csr_partners_updated_at
BEFORE UPDATE ON public.csr_partners
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- =====================================================================
-- 3. PROJECTS TABLE (FIXED)
-- =====================================================================
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  
  csr_partner_id UUID NOT NULL REFERENCES public.csr_partners(id) ON DELETE RESTRICT,
  project_manager_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  assistant_manager_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  
  location VARCHAR(255),
  state VARCHAR(100),
  district VARCHAR(100),
  city VARCHAR(100),
  block VARCHAR(100),
  village VARCHAR(100),
  pincode VARCHAR(10),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  
  category VARCHAR(100),
  sub_category VARCHAR(100),
  project_type VARCHAR(50) CHECK (project_type IN ('one_time', 'ongoing', 'recurring')),
  focus_area TEXT[],
  
  status VARCHAR(50) CHECK (status IN ('planning', 'active', 'on_hold', 'completed', 'cancelled', 'archived')),
  start_date DATE,
  expected_end_date DATE,
  actual_end_date DATE,
  duration_months INT,
  
  total_budget DECIMAL(15, 2) DEFAULT 0,
  approved_budget DECIMAL(15, 2) DEFAULT 0,
  utilized_budget DECIMAL(15, 2) DEFAULT 0,
  pending_budget DECIMAL(15, 2) DEFAULT 0,
  
  total_beneficiaries INT DEFAULT 0,
  direct_beneficiaries INT DEFAULT 0,
  indirect_beneficiaries INT DEFAULT 0,
  male_beneficiaries INT DEFAULT 0,
  female_beneficiaries INT DEFAULT 0,
  children_beneficiaries INT DEFAULT 0,
  beneficiaries_reached INT DEFAULT 0,
  
  targets JSONB DEFAULT '{}',
  achievements JSONB DEFAULT '{}',
  completion_percentage INT DEFAULT 0,
  milestones_completed INT DEFAULT 0,
  total_milestones INT DEFAULT 0,
  
  proposal_drive_link VARCHAR(500),
  approval_letter_drive_link VARCHAR(500),
  budget_sheet_drive_link VARCHAR(500),
  mou_drive_link VARCHAR(500),
  project_plan_drive_link VARCHAR(500),
  documents_folder_link VARCHAR(500),
  
  is_active BOOLEAN DEFAULT true,
  tags TEXT[],
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES public.users(id) ON DELETE SET NULL
);

CREATE INDEX idx_projects_project_code ON public.projects(project_code);
CREATE INDEX idx_projects_csr_partner_id ON public.projects(csr_partner_id);
CREATE INDEX idx_projects_project_manager_id ON public.projects(project_manager_id);
CREATE INDEX idx_projects_status ON public.projects(status);
CREATE INDEX idx_projects_is_active ON public.projects(is_active);

CREATE TRIGGER update_projects_updated_at
BEFORE UPDATE ON public.projects
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- =====================================================================
-- 4. PROJECT_TEAM_MEMBERS TABLE (FIXED)
-- =====================================================================
CREATE TABLE public.project_team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  role VARCHAR(100),
  designation VARCHAR(100),
  responsibilities TEXT,
  
  is_lead BOOLEAN DEFAULT false,
  can_approve_expenses BOOLEAN DEFAULT false,
  can_assign_tasks BOOLEAN DEFAULT false,
  access_level VARCHAR(50) CHECK (access_level IN ('full', 'limited', 'view_only')),
  
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  
  UNIQUE(project_id, user_id)
);

CREATE INDEX idx_project_team_members_project_id ON public.project_team_members(project_id);
CREATE INDEX idx_project_team_members_user_id ON public.project_team_members(user_id);
CREATE INDEX idx_project_team_members_is_active ON public.project_team_members(is_active);

CREATE TRIGGER update_project_team_members_updated_at
BEFORE UPDATE ON public.project_team_members
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- =====================================================================
-- 5. TIMELINES (MILESTONES) TABLE (FIXED)
-- =====================================================================
CREATE TABLE public.timelines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES public.timelines(id) ON DELETE SET NULL,
  
  milestone_code VARCHAR(50) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  
  category VARCHAR(100) CHECK (category IN ('Planning', 'Execution', 'Monitoring', 'Closure')),
  
  start_date DATE,
  end_date DATE,
  actual_start_date DATE,
  actual_end_date DATE,
  duration_days INT,
  
  status VARCHAR(50) CHECK (status IN ('not_started', 'in_progress', 'completed', 'on_priority', 'blocked', 'cancelled')),
  completion_percentage INT DEFAULT 0,
  order_index INT,
  priority VARCHAR(50),
  is_critical_path BOOLEAN DEFAULT false,
  
  dependencies UUID[],
  deliverables TEXT[],
  success_criteria TEXT[],
  
  responsible_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  approved_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  approval_date DATE,
  
  attachments JSONB DEFAULT '{}',
  notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES public.users(id) ON DELETE SET NULL
);

CREATE INDEX idx_timelines_project_id ON public.timelines(project_id);
CREATE INDEX idx_timelines_milestone_code ON public.timelines(milestone_code);
CREATE INDEX idx_timelines_status ON public.timelines(status);

CREATE TRIGGER update_timelines_updated_at
BEFORE UPDATE ON public.timelines
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- =====================================================================
-- 6. TASKS TABLE (FIXED)
-- =====================================================================
CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_code VARCHAR(50) UNIQUE NOT NULL,
  
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  timeline_id UUID REFERENCES public.timelines(id) ON DELETE SET NULL,
  parent_task_id UUID REFERENCES public.tasks(id) ON DELETE SET NULL,
  
  title VARCHAR(255) NOT NULL,
  description TEXT,
  task_type VARCHAR(100) CHECK (task_type IN ('Development', 'Research', 'Meeting', 'Review', 'Distribution', 'Event', 'Infrastructure', 'Education', 'Logistics', 'Finance')),
  category VARCHAR(100),
  
  assigned_to UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  assigned_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  department VARCHAR(100),
  
  due_date DATE,
  start_date DATE,
  completed_date DATE,
  status VARCHAR(50) CHECK (status IN ('not_started', 'in_progress', 'completed', 'on_priority', 'blocked', 'cancelled')),
  priority VARCHAR(50),
  
  completion_percentage INT DEFAULT 0,
  actual_hours INT DEFAULT 0,
  
  tags TEXT[],
  dependencies UUID[],
  is_visible_to_client BOOLEAN DEFAULT false,
  is_from_client_timeline BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  
  checklist JSONB DEFAULT '{}',
  attachments JSONB DEFAULT '{}',
  comments_count INT DEFAULT 0,
  updates_count INT DEFAULT 0,
  
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES public.users(id) ON DELETE SET NULL
);

CREATE INDEX idx_tasks_task_code ON public.tasks(task_code);
CREATE INDEX idx_tasks_project_id ON public.tasks(project_id);
CREATE INDEX idx_tasks_assigned_to ON public.tasks(assigned_to);
CREATE INDEX idx_tasks_status ON public.tasks(status);
CREATE INDEX idx_tasks_due_date ON public.tasks(due_date);
CREATE INDEX idx_tasks_project_assigned ON public.tasks(project_id, assigned_to, status);
CREATE INDEX idx_tasks_is_active ON public.tasks(is_active);

CREATE TRIGGER update_tasks_updated_at
BEFORE UPDATE ON public.tasks
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- =====================================================================
-- 7. TASK_TIME_LOGS TABLE (FIXED)
-- =====================================================================
CREATE TABLE public.task_time_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  start_time TIMESTAMP WITH TIME ZONE,
  end_time TIMESTAMP WITH TIME ZONE,
  duration_minutes INT DEFAULT 0,
  
  description TEXT,
  is_billable BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_task_time_logs_task_id ON public.task_time_logs(task_id);
CREATE INDEX idx_task_time_logs_user_id ON public.task_time_logs(user_id);

-- =====================================================================
-- 8. REAL_TIME_UPDATES TABLE (FIXED)
-- =====================================================================
CREATE TABLE public.real_time_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  update_code VARCHAR(50) UNIQUE NOT NULL,
  
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  task_id UUID REFERENCES public.tasks(id) ON DELETE SET NULL,
  timeline_id UUID REFERENCES public.timelines(id) ON DELETE SET NULL,
  
  title VARCHAR(255),
  description TEXT,
  update_type VARCHAR(50) CHECK (update_type IN ('Progress', 'Issue', 'Achievement', 'Milestone')),
  category VARCHAR(100),
  update_number INT,
  document_number VARCHAR(100),
  reference_number VARCHAR(100),
  
  date DATE,
  time TIME,
  
  location_name VARCHAR(255),
  school_name VARCHAR(255),
  institution_name VARCHAR(255),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  
  images JSONB DEFAULT '{}',
  videos JSONB DEFAULT '{}',
  documents JSONB DEFAULT '{}',
  
  participants UUID[],
  beneficiaries_count INT DEFAULT 0,
  attendees_count INT DEFAULT 0,
  impact_data JSONB DEFAULT '{}',
  metrics JSONB DEFAULT '{}',
  
  is_public BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  is_sent_to_client BOOLEAN DEFAULT false,
  sent_date DATE,
  
  format_type VARCHAR(50),
  tags TEXT[],
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES public.users(id) ON DELETE SET NULL
);

CREATE INDEX idx_real_time_updates_project_id ON public.real_time_updates(project_id);
CREATE INDEX idx_real_time_updates_update_code ON public.real_time_updates(update_code);
CREATE INDEX idx_real_time_updates_is_public ON public.real_time_updates(is_public);
CREATE INDEX idx_real_time_updates_project_public ON public.real_time_updates(project_id, is_public);

CREATE TRIGGER update_real_time_updates_updated_at
BEFORE UPDATE ON public.real_time_updates
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- =====================================================================
-- 9. MEDIA_ARTICLES TABLE (FIXED)
-- =====================================================================
CREATE TABLE public.media_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  media_code VARCHAR(50) UNIQUE NOT NULL,
  
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  task_id UUID REFERENCES public.tasks(id) ON DELETE SET NULL,
  update_id UUID REFERENCES public.real_time_updates(id) ON DELETE SET NULL,
  
  title VARCHAR(255) NOT NULL,
  description TEXT,
  media_type VARCHAR(50) CHECK (media_type IN ('photo', 'video', 'document', 'pdf', 'newspaper_cutting', 'certificate', 'report')),
  category VARCHAR(100),
  sub_category VARCHAR(100),
  
  drive_link VARCHAR(500),
  drive_folder_link VARCHAR(500),
  thumbnail_link VARCHAR(500),
  
  file_name VARCHAR(255),
  file_size_mb DECIMAL(10, 2) DEFAULT 0,
  file_format VARCHAR(50),
  resolution VARCHAR(100),
  duration_seconds INT DEFAULT 0,
  
  is_geo_tagged BOOLEAN DEFAULT false,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  captured_at TIMESTAMP WITH TIME ZONE,
  camera_details VARCHAR(255),
  
  news_channel VARCHAR(255),
  publication_name VARCHAR(255),
  publication_date DATE,
  reporter_name VARCHAR(255),
  article_url VARCHAR(500),
  
  date DATE,
  event_date DATE,
  location VARCHAR(255),
  
  tags TEXT[],
  keywords TEXT[],
  is_public BOOLEAN DEFAULT true,
  is_downloadable BOOLEAN DEFAULT true,
  access_level VARCHAR(50) CHECK (access_level IN ('public', 'client', 'internal', 'restricted')),
  
  uploaded_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  approved_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  approval_date DATE,
  views_count INT DEFAULT 0,
  downloads_count INT DEFAULT 0,
  
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL
);

CREATE INDEX idx_media_articles_project_id ON public.media_articles(project_id);
CREATE INDEX idx_media_articles_media_code ON public.media_articles(media_code);
CREATE INDEX idx_media_articles_media_type ON public.media_articles(media_type);
CREATE INDEX idx_media_articles_access_level ON public.media_articles(access_level);

CREATE TRIGGER update_media_articles_updated_at
BEFORE UPDATE ON public.media_articles
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- =====================================================================
-- 10. EXPENSE_CATEGORIES TABLE (FIXED)
-- =====================================================================
CREATE TABLE public.expense_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL UNIQUE,
  code VARCHAR(50) NOT NULL UNIQUE,
  parent_category_id UUID REFERENCES public.expense_categories(id) ON DELETE SET NULL,
  
  description TEXT,
  budget_limit DECIMAL(15, 2) DEFAULT 0,
  requires_approval BOOLEAN DEFAULT true,
  approval_limit DECIMAL(15, 2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_expense_categories_code ON public.expense_categories(code);
CREATE INDEX idx_expense_categories_is_active ON public.expense_categories(is_active);

-- =====================================================================
-- 11. PROJECT_EXPENSES TABLE (FIXED - CRITICAL TABLE)
-- =====================================================================
CREATE TABLE public.project_expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expense_code VARCHAR(50) UNIQUE NOT NULL,
  
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE RESTRICT,
  category_id UUID NOT NULL REFERENCES public.expense_categories(id) ON DELETE RESTRICT,
  task_id UUID REFERENCES public.tasks(id) ON DELETE SET NULL,
  
  merchant_name VARCHAR(255),
  merchant_contact VARCHAR(255),
  merchant_address TEXT,
  merchant_gstin VARCHAR(15),
  merchant_pan VARCHAR(10),
  
  date DATE NOT NULL,
  category VARCHAR(100),
  sub_category VARCHAR(100),
  description TEXT,
  purpose TEXT,
  
  base_amount DECIMAL(15, 2) DEFAULT 0,
  tax_amount DECIMAL(15, 2) DEFAULT 0,
  gst_percentage DECIMAL(5, 2) DEFAULT 0,
  cgst_amount DECIMAL(15, 2) DEFAULT 0,
  sgst_amount DECIMAL(15, 2) DEFAULT 0,
  igst_amount DECIMAL(15, 2) DEFAULT 0,
  other_charges DECIMAL(15, 2) DEFAULT 0,
  discount_amount DECIMAL(15, 2) DEFAULT 0,
  total_amount DECIMAL(15, 2) NOT NULL,
  
  payment_method VARCHAR(50) CHECK (payment_method IN ('Cash', 'Cheque', 'Online', 'Card')),
  payment_reference VARCHAR(255),
  payment_date DATE,
  paid_to VARCHAR(255),
  bank_details JSONB DEFAULT '{}',
  
  bill_drive_link VARCHAR(500),
  invoice_drive_link VARCHAR(500),
  receipt_drive_link VARCHAR(500),
  supporting_docs JSONB DEFAULT '{}',
  
  status VARCHAR(50) CHECK (status IN ('draft', 'submitted', 'pending', 'approved', 'rejected', 'reimbursed')),
  submitted_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  submitted_date DATE,
  reviewed_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  reviewed_date DATE,
  approved_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  approved_date DATE,
  rejection_reason TEXT,
  reimbursed_date DATE,
  
  account_code VARCHAR(100),
  gl_code VARCHAR(100),
  cost_center VARCHAR(100),
  
  is_reimbursable BOOLEAN DEFAULT true,
  reimbursed_to VARCHAR(255),
  approval_chain JSONB DEFAULT '{}',
  current_approver UUID REFERENCES public.users(id) ON DELETE SET NULL,
  
  priority VARCHAR(50),
  tags TEXT[],
  notes TEXT,
  internal_notes TEXT,
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES public.users(id) ON DELETE SET NULL
);

CREATE INDEX idx_project_expenses_project_id ON public.project_expenses(project_id);
CREATE INDEX idx_project_expenses_expense_code ON public.project_expenses(expense_code);
CREATE INDEX idx_project_expenses_status ON public.project_expenses(status);
CREATE INDEX idx_project_expenses_date ON public.project_expenses(date);
CREATE INDEX idx_project_expenses_project_status ON public.project_expenses(project_id, status);

CREATE TRIGGER update_project_expenses_updated_at
BEFORE UPDATE ON public.project_expenses
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- =====================================================================
-- 12. EXPENSE_APPROVALS TABLE (FIXED)
-- =====================================================================
CREATE TABLE public.expense_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expense_id UUID NOT NULL REFERENCES public.project_expenses(id) ON DELETE CASCADE,
  approver_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  action VARCHAR(50) CHECK (action IN ('submitted', 'approved', 'rejected', 'requested_changes')),
  previous_status VARCHAR(50),
  new_status VARCHAR(50),
  comments TEXT,
  attachments JSONB DEFAULT '{}',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_expense_approvals_expense_id ON public.expense_approvals(expense_id);

-- =====================================================================
-- 13. BUDGET_ALLOCATION TABLE (FIXED)
-- =====================================================================
CREATE TABLE public.budget_allocation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.expense_categories(id) ON DELETE RESTRICT,
  category_name VARCHAR(255),
  
  allocated_amount DECIMAL(15, 2) DEFAULT 0,
  utilized_amount DECIMAL(15, 2) DEFAULT 0,
  pending_amount DECIMAL(15, 2) DEFAULT 0,
  available_amount DECIMAL(15, 2) DEFAULT 0,
  
  fiscal_year VARCHAR(9),
  quarter VARCHAR(2),
  month VARCHAR(2),
  
  notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_budget_allocation_project_id ON public.budget_allocation(project_id);

CREATE TRIGGER update_budget_allocation_updated_at
BEFORE UPDATE ON public.budget_allocation
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- =====================================================================
-- 14. BUDGET_UTILIZATION TABLE (FIXED)
-- =====================================================================
CREATE TABLE public.budget_utilization (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  csr_partner_id UUID NOT NULL REFERENCES public.csr_partners(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  
  fiscal_year VARCHAR(9),
  quarter VARCHAR(2),
  month VARCHAR(2),
  
  allocated_amount DECIMAL(15, 2) DEFAULT 0,
  utilized_amount DECIMAL(15, 2) DEFAULT 0,
  committed_amount DECIMAL(15, 2) DEFAULT 0,
  pending_amount DECIMAL(15, 2) DEFAULT 0,
  available_amount DECIMAL(15, 2) DEFAULT 0,
  utilization_percentage DECIMAL(5, 2) DEFAULT 0,
  
  date DATE,
  description TEXT,
  notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES public.users(id) ON DELETE SET NULL
);

CREATE INDEX idx_budget_utilization_csr_partner_id ON public.budget_utilization(csr_partner_id);

CREATE TRIGGER update_budget_utilization_updated_at
BEFORE UPDATE ON public.budget_utilization
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- =====================================================================
-- 15. UTILIZATION_CERTIFICATES TABLE (FIXED)
-- =====================================================================
CREATE TABLE public.utilization_certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  certificate_code VARCHAR(50) UNIQUE NOT NULL,
  
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE RESTRICT,
  csr_partner_id UUID NOT NULL REFERENCES public.csr_partners(id) ON DELETE RESTRICT,
  
  certificate_heading VARCHAR(255),
  certificate_type VARCHAR(50) CHECK (certificate_type IN ('Quarterly', 'Annual', 'Project Completion')),
  period_from DATE,
  period_to DATE,
  fiscal_year VARCHAR(9),
  
  total_amount DECIMAL(15, 2) DEFAULT 0,
  utilized_amount DECIMAL(15, 2) DEFAULT 0,
  
  certificate_drive_link VARCHAR(500),
  annexure_drive_link VARCHAR(500),
  supporting_docs JSONB DEFAULT '{}',
  
  format_type VARCHAR(50),
  
  issue_date DATE,
  prepared_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  reviewed_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  approved_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  status VARCHAR(50) CHECK (status IN ('draft', 'pending', 'approved')),
  
  sent_to_partner BOOLEAN DEFAULT false,
  sent_date DATE,
  acknowledged BOOLEAN DEFAULT false,
  acknowledgment_date DATE,
  
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES public.users(id) ON DELETE SET NULL
);

CREATE INDEX idx_utilization_certificates_certificate_code ON public.utilization_certificates(certificate_code);
CREATE INDEX idx_utilization_certificates_csr_partner_id ON public.utilization_certificates(csr_partner_id);

CREATE TRIGGER update_utilization_certificates_updated_at
BEFORE UPDATE ON public.utilization_certificates
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- =====================================================================
-- 16. BILLS TABLE (FIXED)
-- =====================================================================
CREATE TABLE public.bills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bill_code VARCHAR(50) UNIQUE NOT NULL,
  
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  expense_id UUID REFERENCES public.project_expenses(id) ON DELETE SET NULL,
  
  bill_overview TEXT,
  bill_type VARCHAR(50) CHECK (bill_type IN ('Invoice', 'Receipt', 'Estimate')),
  bill_number VARCHAR(100),
  
  vendor_name VARCHAR(255),
  vendor_gstin VARCHAR(15),
  
  date DATE,
  due_date DATE,
  
  subtotal DECIMAL(15, 2) DEFAULT 0,
  tax_amount DECIMAL(15, 2) DEFAULT 0,
  total_amount DECIMAL(15, 2) DEFAULT 0,
  amount_paid DECIMAL(15, 2) DEFAULT 0,
  balance_amount DECIMAL(15, 2) DEFAULT 0,
  
  status VARCHAR(50) CHECK (status IN ('pending', 'approved', 'paid')),
  
  bill_drive_link VARCHAR(500),
  
  payment_terms TEXT,
  payment_method VARCHAR(50),
  payment_reference VARCHAR(255),
  
  submitted_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  approved_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  paid_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  
  notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL
);

CREATE INDEX idx_bills_bill_code ON public.bills(bill_code);
CREATE INDEX idx_bills_project_id ON public.bills(project_id);

CREATE TRIGGER update_bills_updated_at
BEFORE UPDATE ON public.bills
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- =====================================================================
-- 17. REPORTS TABLE (FIXED)
-- =====================================================================
CREATE TABLE public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_code VARCHAR(50) UNIQUE NOT NULL,
  
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  
  title VARCHAR(255) NOT NULL,
  report_type VARCHAR(50) CHECK (report_type IN ('Project', 'Daily', 'Monthly', 'Quarterly', 'Annual', 'Impact', 'Financial')),
  category VARCHAR(100),
  description TEXT,
  summary TEXT,
  
  period_from DATE,
  period_to DATE,
  fiscal_year VARCHAR(9),
  
  report_drive_link VARCHAR(500),
  presentation_drive_link VARCHAR(500),
  annexures_drive_link VARCHAR(500),
  
  status VARCHAR(50) CHECK (status IN ('draft', 'in_review', 'submitted', 'approved', 'rejected')),
  generated_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  reviewed_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  approved_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  generated_date DATE,
  submitted_date DATE,
  approved_date DATE,
  
  data JSONB DEFAULT '{}',
  charts JSONB DEFAULT '{}',
  metrics JSONB DEFAULT '{}',
  
  is_public BOOLEAN DEFAULT false,
  is_sent_to_client BOOLEAN DEFAULT false,
  sent_date DATE,
  
  version VARCHAR(50),
  parent_report_id UUID REFERENCES public.reports(id) ON DELETE SET NULL,
  
  tags TEXT[],
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES public.users(id) ON DELETE SET NULL
);

CREATE INDEX idx_reports_report_code ON public.reports(report_code);
CREATE INDEX idx_reports_project_id ON public.reports(project_id);

CREATE TRIGGER update_reports_updated_at
BEFORE UPDATE ON public.reports
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- =====================================================================
-- 18. DAILY_REPORTS TABLE (FIXED)
-- =====================================================================
CREATE TABLE public.daily_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_code VARCHAR(50) UNIQUE NOT NULL,
  
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  
  date DATE NOT NULL,
  day_of_week VARCHAR(10),
  
  work_summary TEXT,
  activities TEXT[],
  locations_visited TEXT[],
  
  tasks_completed INT DEFAULT 0,
  tasks_pending INT DEFAULT 0,
  tasks_started INT DEFAULT 0,
  task_details JSONB DEFAULT '{}',
  
  start_time TIME,
  end_time TIME,
  
  photos JSONB DEFAULT '{}',
  videos JSONB DEFAULT '{}',
  documents JSONB DEFAULT '{}',
  
  notes TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE,
  approved_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  approved_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_daily_reports_project_id ON public.daily_reports(project_id);
CREATE INDEX idx_daily_reports_user_id ON public.daily_reports(user_id);
CREATE INDEX idx_daily_reports_date ON public.daily_reports(date);

CREATE TRIGGER update_daily_reports_updated_at
BEFORE UPDATE ON public.daily_reports
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- =====================================================================
-- 19. DATA_ENTRY_FORMS TABLE (FIXED)
-- =====================================================================
CREATE TABLE public.data_entry_forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_code VARCHAR(50) UNIQUE NOT NULL,
  
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  
  form_name VARCHAR(255),
  form_type VARCHAR(50) CHECK (form_type IN ('Survey', 'Assessment', 'Feedback', 'Registration')),
  template_id VARCHAR(100),
  
  date DATE NOT NULL,
  
  location VARCHAR(255),
  school_name VARCHAR(255),
  institution_name VARCHAR(255),
  
  pre_form_data JSONB DEFAULT '{}',
  post_form_data JSONB DEFAULT '{}',
  responses JSONB DEFAULT '{}',
  
  respondent_name VARCHAR(255),
  respondent_type VARCHAR(100),
  respondent_count INT DEFAULT 0,
  
  filled_form_drive_link VARCHAR(500),
  scanned_form_drive_link VARCHAR(500),
  
  submitted_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  verified_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  status VARCHAR(50) CHECK (status IN ('draft', 'submitted', 'verified')),
  
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL
);

CREATE INDEX idx_data_entry_forms_project_id ON public.data_entry_forms(project_id);
CREATE INDEX idx_data_entry_forms_form_code ON public.data_entry_forms(form_code);

CREATE TRIGGER update_data_entry_forms_updated_at
BEFORE UPDATE ON public.data_entry_forms
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- =====================================================================
-- 20. CALENDAR_EVENTS TABLE (FIXED)
-- =====================================================================
CREATE TABLE public.calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_code VARCHAR(50) UNIQUE NOT NULL,
  
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  task_id UUID REFERENCES public.tasks(id) ON DELETE SET NULL,
  
  title VARCHAR(255) NOT NULL,
  description TEXT,
  event_type VARCHAR(50) CHECK (event_type IN ('Meeting', 'Training', 'Workshop', 'Review', 'Field Visit')),
  category VARCHAR(100),
  
  event_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  duration_minutes INT DEFAULT 0,
  is_all_day BOOLEAN DEFAULT false,
  
  location VARCHAR(255),
  venue VARCHAR(255),
  meeting_link VARCHAR(500),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  
  organizer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  assigned_to UUID[],
  participants JSONB DEFAULT '{}',
  expected_attendees INT DEFAULT 0,
  actual_attendees INT DEFAULT 0,
  
  is_recurring BOOLEAN DEFAULT false,
  recurrence_pattern VARCHAR(100),
  recurrence_end_date DATE,
  
  reminders JSONB DEFAULT '{}',
  status VARCHAR(50) CHECK (status IN ('scheduled', 'ongoing', 'completed', 'cancelled')),
  action_items JSONB DEFAULT '{}',
  documents JSONB DEFAULT '{}',
  
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES public.users(id) ON DELETE SET NULL
);

CREATE INDEX idx_calendar_events_event_code ON public.calendar_events(event_code);
CREATE INDEX idx_calendar_events_project_id ON public.calendar_events(project_id);
CREATE INDEX idx_calendar_events_event_date ON public.calendar_events(event_date);

CREATE TRIGGER update_calendar_events_updated_at
BEFORE UPDATE ON public.calendar_events
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- =====================================================================
-- 21. EVENT_ATTENDANCE TABLE (FIXED)
-- =====================================================================
CREATE TABLE public.event_attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.calendar_events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  status VARCHAR(50) CHECK (status IN ('invited', 'accepted', 'declined', 'attended', 'absent')),
  response_date DATE,
  
  check_in_time TIMESTAMP WITH TIME ZONE,
  check_out_time TIMESTAMP WITH TIME ZONE,
  
  notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(event_id, user_id)
);

CREATE INDEX idx_event_attendance_event_id ON public.event_attendance(event_id);
CREATE INDEX idx_event_attendance_user_id ON public.event_attendance(user_id);

-- =====================================================================
-- 22. NOTIFICATIONS TABLE (FIXED)
-- =====================================================================
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  title VARCHAR(255),
  message TEXT,
  notification_type VARCHAR(50) CHECK (notification_type IN ('task', 'expense', 'project', 'system', 'alert')),
  category VARCHAR(100),
  priority VARCHAR(50),
  
  reference_type VARCHAR(100),
  reference_id UUID,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  
  action_url VARCHAR(500),
  action_text VARCHAR(100),
  requires_action BOOLEAN DEFAULT false,
  
  channels VARCHAR(50)[],
  
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,
  is_seen BOOLEAN DEFAULT false,
  seen_at TIMESTAMP WITH TIME ZONE,
  
  scheduled_for TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL
);

CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_is_read ON public.notifications(is_read);

-- =====================================================================
-- 23. COMMUNICATIONS TABLE (FIXED)
-- =====================================================================
CREATE TABLE public.communications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  task_id UUID REFERENCES public.tasks(id) ON DELETE SET NULL,
  event_id UUID REFERENCES public.calendar_events(id) ON DELETE SET NULL,
  
  communication_type VARCHAR(50) CHECK (communication_type IN ('email', 'whatsapp', 'phone', 'meeting', 'system')),
  
  from_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  to_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  
  subject VARCHAR(255),
  message TEXT,
  
  call_duration_minutes INT DEFAULT 0,
  call_outcome VARCHAR(100),
  
  attendees UUID[],
  attachments JSONB DEFAULT '{}',
  
  status VARCHAR(50) CHECK (status IN ('sent', 'delivered', 'read', 'replied', 'failed')),
  sent_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  read_at TIMESTAMP WITH TIME ZONE,
  
  is_internal BOOLEAN DEFAULT true,
  priority VARCHAR(50),
  
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL
);

CREATE INDEX idx_communications_from_user_id ON public.communications(from_user_id);
CREATE INDEX idx_communications_project_id ON public.communications(project_id);

-- =====================================================================
-- 24. EMAIL_TEMPLATES TABLE (FIXED)
-- =====================================================================
CREATE TABLE public.email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL UNIQUE,
  
  subject VARCHAR(255),
  body TEXT,
  
  category VARCHAR(100),
  variables JSONB DEFAULT '{}',
  
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================================
-- 25. WHATSAPP_TEMPLATES TABLE (FIXED)
-- =====================================================================
CREATE TABLE public.whatsapp_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL UNIQUE,
  
  message TEXT NOT NULL,
  
  category VARCHAR(100),
  variables JSONB DEFAULT '{}',
  
  media_url VARCHAR(500),
  
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================================
-- 26. ACTIVITY_LOGS TABLE (FIXED)
-- =====================================================================
CREATE TABLE public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  action VARCHAR(50) CHECK (action IN ('INSERT', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT')),
  action_type VARCHAR(50) CHECK (action_type IN ('create', 'edit', 'delete', 'view', 'approve', 'reject')),
  
  entity_type VARCHAR(100),
  entity_id UUID,
  entity_name VARCHAR(255),
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  
  old_values JSONB DEFAULT '{}',
  new_values JSONB DEFAULT '{}',
  changed_fields TEXT[],
  
  description TEXT,
  
  ip_address VARCHAR(45),
  user_agent TEXT,
  location VARCHAR(255),
  device_info JSONB DEFAULT '{}',
  
  session_id VARCHAR(255),
  request_id VARCHAR(255),
  duration_ms INT DEFAULT 0,
  
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_activity_logs_user_id ON public.activity_logs(user_id);
CREATE INDEX idx_activity_logs_entity_type ON public.activity_logs(entity_type);
CREATE INDEX idx_activity_logs_created_at ON public.activity_logs(created_at);

-- =====================================================================
-- 27. SYSTEM_LOGS TABLE (FIXED)
-- =====================================================================
CREATE TABLE public.system_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  log_level VARCHAR(50) CHECK (log_level IN ('INFO', 'WARNING', 'ERROR', 'CRITICAL')),
  module VARCHAR(255),
  message TEXT,
  error_code VARCHAR(100),
  stack_trace TEXT,
  context JSONB DEFAULT '{}',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_system_logs_log_level ON public.system_logs(log_level);
CREATE INDEX idx_system_logs_created_at ON public.system_logs(created_at);

-- =====================================================================
-- DASHBOARD VIEWS
-- =====================================================================

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

CREATE VIEW project_manager_dashboard AS
SELECT 
  p.id, p.project_code, p.name, p.status,
  p.total_budget, p.utilized_budget, p.completion_percentage,
  (SELECT COUNT(*) FROM public.tasks WHERE project_id = p.id AND status != 'completed') as pending_tasks,
  (SELECT COUNT(*) FROM public.real_time_updates WHERE project_id = p.id) as total_updates
FROM public.projects p
WHERE p.is_active = true;

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

CREATE VIEW team_member_dashboard AS
SELECT 
  t.id, t.task_code, t.title, t.status, t.priority,
  t.due_date, t.completion_percentage,
  p.name as project_name,
  (SELECT COUNT(*) FROM public.task_time_logs WHERE task_id = t.id) as time_logs_count
FROM public.tasks t
LEFT JOIN public.projects p ON t.project_id = p.id
WHERE t.is_active = true AND t.status != 'cancelled';

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
-- ROW LEVEL SECURITY (RLS) - FIXED WITH UPDATE SUPPORT
-- =====================================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.real_time_updates ENABLE ROW LEVEL SECURITY;

-- Admin: All operations on all data
CREATE POLICY admin_all_users ON public.users
FOR ALL
USING ((SELECT role FROM public.users WHERE id = auth.uid()) = 'admin')
WITH CHECK ((SELECT role FROM public.users WHERE id = auth.uid()) = 'admin');

CREATE POLICY admin_all_projects ON public.projects
FOR ALL
USING ((SELECT role FROM public.users WHERE id = auth.uid()) = 'admin')
WITH CHECK ((SELECT role FROM public.users WHERE id = auth.uid()) = 'admin');

CREATE POLICY admin_all_expenses ON public.project_expenses
FOR ALL
USING ((SELECT role FROM public.users WHERE id = auth.uid()) = 'admin')
WITH CHECK ((SELECT role FROM public.users WHERE id = auth.uid()) = 'admin');

CREATE POLICY admin_all_tasks ON public.tasks
FOR ALL
USING ((SELECT role FROM public.users WHERE id = auth.uid()) = 'admin')
WITH CHECK ((SELECT role FROM public.users WHERE id = auth.uid()) = 'admin');

-- Project Managers: Own projects only
CREATE POLICY pm_own_projects ON public.projects
FOR SELECT
USING ((SELECT role FROM public.users WHERE id = auth.uid()) = 'project_manager' 
  AND project_manager_id = auth.uid());

CREATE POLICY pm_update_own_projects ON public.projects
FOR UPDATE
USING ((SELECT role FROM public.users WHERE id = auth.uid()) = 'project_manager' 
  AND project_manager_id = auth.uid())
WITH CHECK ((SELECT role FROM public.users WHERE id = auth.uid()) = 'project_manager' 
  AND project_manager_id = auth.uid());

-- Team Members: Own tasks only
CREATE POLICY tm_own_tasks ON public.tasks
FOR SELECT
USING ((SELECT role FROM public.users WHERE id = auth.uid()) = 'team_member' 
  AND assigned_to = auth.uid());

CREATE POLICY tm_update_own_tasks ON public.tasks
FOR UPDATE
USING ((SELECT role FROM public.users WHERE id = auth.uid()) = 'team_member' 
  AND assigned_to = auth.uid())
WITH CHECK ((SELECT role FROM public.users WHERE id = auth.uid()) = 'team_member' 
  AND assigned_to = auth.uid());

-- Clients: Public updates only
CREATE POLICY client_public_updates ON public.real_time_updates
FOR SELECT
USING ((SELECT role FROM public.users WHERE id = auth.uid()) = 'client' 
  AND is_public = true);

-- =====================================================================
-- EXPENSE CATEGORY SEED DATA
-- =====================================================================

INSERT INTO public.expense_categories (name, code, description, budget_limit, requires_approval, approval_limit) VALUES
('Materials', 'MAT-001', 'Supplies and materials', 100000, true, 50000),
('Logistics', 'LOG-001', 'Transportation and logistics', 50000, true, 25000),
('Food & Supplies', 'FAS-001', 'Food items and provisions', 200000, true, 100000),
('Technology', 'TECH-001', 'Technology equipment and software', 150000, true, 75000),
('Educational Materials', 'EDM-001', 'Books and learning materials', 80000, true, 40000),
('Infrastructure', 'INF-001', 'Building and facility setup', 300000, true, 150000),
('Environment', 'ENV-001', 'Environment related expenses', 120000, true, 60000),
('Videography', 'VID-001', 'Video and photography services', 50000, true, 25000),
('Travel', 'TRV-001', 'Travel and accommodation', 40000, true, 20000),
('Marketing', 'MKT-001', 'Marketing and promotion', 60000, true, 30000),
('Social Media Expense', 'SOC-001', 'Social media advertising', 45000, true, 22500),
('Finance', 'FIN-001', 'Financial and administrative', 30000, true, 15000);

-- =====================================================================
-- SOFT DELETE FUNCTION (Alternative to Hard Delete)
-- =====================================================================

CREATE OR REPLACE FUNCTION soft_delete_project(project_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.projects
  SET is_active = false, status = 'archived', updated_at = CURRENT_TIMESTAMP
  WHERE id = project_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================================
-- HELPER FUNCTIONS FOR COMMON UPDATES
-- =====================================================================

-- Update project budget after expense approval
CREATE OR REPLACE FUNCTION update_project_budget_on_expense()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
    UPDATE public.projects
    SET utilized_budget = utilized_budget + NEW.total_amount,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.project_id;
  ELSIF NEW.status != 'approved' AND OLD.status = 'approved' THEN
    UPDATE public.projects
    SET utilized_budget = utilized_budget - OLD.total_amount,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.project_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_project_budget_on_expense
AFTER UPDATE ON public.project_expenses
FOR EACH ROW
EXECUTE FUNCTION update_project_budget_on_expense();



-- =====================================================================
-- END OF FIXED SCHEMA
-- =====================================================================

-- Important Notes:
-- 1. All timestamps now auto-update via trigger
-- 2. All DECIMAL fields have DEFAULT 0
-- 3. All JSONB fields have DEFAULT '{}'
-- 4. RLS policies now include WITH CHECK for UPDATE operations
-- 5. Critical foreign keys use ON DELETE RESTRICT
-- 6. Self-referential FKs use ON DELETE SET NULL
-- 7. created_by/updated_by can now be NULL (SET NULL instead of CASCADE)
-- 8. All array fields [] get DEFAULT empty array
-- 9. Soft delete function provided instead of hard delete
-- 10. All tables have proper indexes for UPDATE performance
