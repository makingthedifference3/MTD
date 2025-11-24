-- =====================================================================
-- ADD USER ACTIVITY AND GROWTH TRACKING TABLES
-- These tables support the AdminDashboard with user activity logs
-- and daily user growth metrics
-- =====================================================================

-- User Activity Logs Table
CREATE TABLE public.user_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  action VARCHAR(100) NOT NULL,  -- 'login', 'create_project', 'update_budget', etc.
  resource_type VARCHAR(50),     -- 'project', 'expense', 'budget', etc.
  resource_id UUID,              -- ID of the resource being acted upon
  
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  is_active BOOLEAN DEFAULT true
);

-- Create indexes for performance
CREATE INDEX idx_user_activity_logs_user_id ON public.user_activity_logs(user_id);
CREATE INDEX idx_user_activity_logs_action ON public.user_activity_logs(action);
CREATE INDEX idx_user_activity_logs_timestamp ON public.user_activity_logs(timestamp);
CREATE INDEX idx_user_activity_logs_resource_type ON public.user_activity_logs(resource_type);

-- User Growth Metrics Table (for dashboard analytics)
CREATE TABLE public.user_growth_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  date DATE NOT NULL UNIQUE,
  total_users INT DEFAULT 0,
  active_users INT DEFAULT 0,
  new_users_count INT DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_user_growth_metrics_date ON public.user_growth_metrics(date);

-- Add trigger for updated_at timestamp
CREATE TRIGGER update_user_growth_metrics_updated_at
BEFORE UPDATE ON public.user_growth_metrics
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- =====================================================================
-- HELPER VIEW FOR USER STATISTICS
-- =====================================================================

CREATE OR REPLACE VIEW user_statistics AS
SELECT
  DATE(created_at)::DATE as date,
  COUNT(*) as total_created,
  COUNT(CASE WHEN is_active = true THEN 1 END) as active_count,
  COUNT(DISTINCT role) as role_count,
  role
FROM users
GROUP BY DATE(created_at), role
ORDER BY date DESC;

-- =====================================================================
-- HELPER VIEW FOR ADMIN DASHBOARD
-- =====================================================================

CREATE OR REPLACE VIEW admin_dashboard_stats AS
SELECT
  (SELECT COUNT(*) FROM users WHERE is_active = true) as total_active_users,
  (SELECT COUNT(*) FROM projects WHERE status = 'active') as total_active_projects,
  (SELECT COUNT(*) FROM project_expenses WHERE status = 'approved') as approved_expenses,
  (SELECT COUNT(*) FROM user_activity_logs WHERE DATE(timestamp) = CURRENT_DATE) as todays_activity,
  (SELECT COUNT(*) FROM users WHERE is_active = true AND role = 'admin') as admin_count,
  (SELECT COUNT(*) FROM users WHERE is_active = true AND role = 'project_manager') as pm_count,
  (SELECT COUNT(*) FROM users WHERE is_active = true AND role = 'accountant') as accountant_count,
  (SELECT COUNT(*) FROM users WHERE is_active = true AND role = 'team_member') as team_member_count;
