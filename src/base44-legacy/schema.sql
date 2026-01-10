-- SPECGUARD Supabase Schema Initializer

-- 1. Enable Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Profiles (Extend Supabase Auth)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  full_name TEXT,
  email TEXT UNIQUE,
  role TEXT CHECK (role IN ('admin', 'manager', 'technician'))
);

-- 3. Branch
CREATE TABLE branches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  code TEXT UNIQUE,
  address TEXT,
  manager_email TEXT,
  manager_name TEXT,
  daily_install_target INTEGER DEFAULT 0,
  status TEXT CHECK (status IN ('active', 'inactive')) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Trailer
CREATE TABLE trailers (
  asset_id TEXT PRIMARY KEY, -- unique, primary lookup key
  imei TEXT,
  phillips_status TEXT,
  model_year TEXT,
  trailer_type TEXT CHECK (trailer_type IN ('Van', 'Flatbed', 'REEF', 'Other')),
  length TEXT,
  nearest_branch TEXT,
  nearest_branch_distance_miles NUMERIC,
  current_lat NUMERIC,
  current_lon NUMERIC,
  device_type TEXT,
  cargo_status TEXT CHECK (cargo_status IN ('Loaded', 'Empty', 'Unknown')),
  door_type TEXT CHECK (door_type IN ('Swing', 'Rollup', 'Unknown')),
  utilization_status TEXT,
  last_report_date_time TIMESTAMP WITH TIME ZONE,
  days_dormant INTEGER,
  moving BOOLEAN DEFAULT FALSE,
  home_branch TEXT REFERENCES branches(code),
  status TEXT CHECK (status IN ('active', 'inactive')) DEFAULT 'active',
  last_scanned_at TIMESTAMP WITH TIME ZONE,
  install_completed BOOLEAN DEFAULT FALSE,
  install_completed_notes TEXT,
  last_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by TEXT
);

-- 5. ScanLog
CREATE TABLE scan_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trailer_id TEXT REFERENCES trailers(asset_id),
  asset_id TEXT,
  branch TEXT,
  scan_type TEXT CHECK (scan_type IN ('install', 'identify')),
  device_type TEXT,
  scanned_photo TEXT, -- URL
  scanned_by TEXT, -- user email
  scanned_by_name TEXT, -- user name
  scan_date_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completion_date_time TIMESTAMP WITH TIME ZONE,
  install_completed BOOLEAN DEFAULT FALSE,
  install_notes TEXT,
  status TEXT CHECK (status IN ('in_progress', 'completed', 'cancelled', 'id_only')) DEFAULT 'in_progress',
  reminder_sent BOOLEAN DEFAULT FALSE,
  elapsed_time_minutes INTEGER
);

-- 6. InstallationLog
CREATE TABLE installation_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  asset_id TEXT REFERENCES trailers(asset_id),
  installation_started_at TIMESTAMP WITH TIME ZONE,
  installation_completed_at TIMESTAMP WITH TIME ZONE,
  total_cycle_time_minutes INTEGER,
  trailer_photo_url TEXT,
  vin_plate_overall_url TEXT,
  vin_plate_closeup_url TEXT,
  gateway_mounting_url TEXT,
  abs_connection_url TEXT,
  door_sensor_url TEXT,
  camera_url TEXT,
  tech_assist_url TEXT,
  -- timestamps
  trailer_photo_timestamp TIMESTAMP WITH TIME ZONE,
  vin_plate_overall_timestamp TIMESTAMP WITH TIME ZONE,
  vin_plate_closeup_timestamp TIMESTAMP WITH TIME ZONE,
  gateway_mounting_timestamp TIMESTAMP WITH TIME ZONE,
  abs_connection_timestamp TIMESTAMP WITH TIME ZONE,
  door_sensor_timestamp TIMESTAMP WITH TIME ZONE,
  camera_timestamp TIMESTAMP WITH TIME ZONE,
  tech_assist_timestamp TIMESTAMP WITH TIME ZONE,
  qc_status TEXT CHECK (qc_status IN ('pending', 'passed', 'failed', 'needs_review')) DEFAULT 'pending',
  qc_results JSONB,
  installed_by TEXT,
  installed_by_name TEXT,
  branch TEXT,
  status TEXT CHECK (status IN ('in_progress', 'completed', 'cancelled')) DEFAULT 'in_progress',
  completion_notes JSONB,
  gateway_model_number TEXT,
  camera_model_number TEXT,
  door_sensor_model_number TEXT,
  trailer_device_type TEXT,
  validation_errors JSONB
);

-- 7. InstallationTimeEdit
CREATE TABLE installation_time_edits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  installation_log_id UUID REFERENCES installation_logs(id),
  asset_id TEXT,
  field_changed TEXT CHECK (field_changed IN ('installation_started_at', 'installation_completed_at')),
  old_value TIMESTAMP WITH TIME ZONE,
  new_value TIMESTAMP WITH TIME ZONE,
  reason TEXT,
  edited_by_email TEXT,
  edited_by_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Tasks
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  assigned_to_email TEXT,
  assigned_to_name TEXT,
  assigned_by_email TEXT,
  assigned_by_name TEXT,
  status TEXT CHECK (status IN ('pending', 'in_progress', 'completed')) DEFAULT 'pending',
  priority TEXT CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
  deadline DATE,
  branch TEXT,
  completed_date TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. EOSReport
CREATE TABLE eos_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_date DATE DEFAULT CURRENT_DATE,
  branch TEXT,
  manager_email TEXT,
  manager_name TEXT,
  total_trailers_installed INTEGER,
  average_cycle_time NUMERIC,
  device_type_breakdown JSONB,
  total_billable_hours NUMERIC,
  technician_reviews JSONB, -- Array of objects
  shift_notes TEXT,
  delays_explanation TEXT,
  consumable_inventory_status TEXT,
  equipment_tool_notes TEXT,
  safety_concerns TEXT,
  status TEXT CHECK (status IN ('draft', 'completed')) DEFAULT 'draft'
);

-- 10. EOSReportConfig
CREATE TABLE eos_report_configs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  branch TEXT,
  recipient_emails TEXT[],
  is_active BOOLEAN DEFAULT TRUE,
  include_kpi_summary BOOLEAN DEFAULT TRUE,
  include_cycle_time_breakdown BOOLEAN DEFAULT TRUE,
  include_target_comparison BOOLEAN DEFAULT TRUE,
  include_technician_reviews BOOLEAN DEFAULT TRUE,
  include_shift_notes BOOLEAN DEFAULT TRUE,
  include_delays BOOLEAN DEFAULT TRUE,
  include_inventory BOOLEAN DEFAULT TRUE,
  include_equipment BOOLEAN DEFAULT TRUE,
  include_safety BOOLEAN DEFAULT TRUE,
  include_ai_summary BOOLEAN DEFAULT TRUE
);

-- 11. ReportAutomation
CREATE TABLE report_automations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  automation_name TEXT,
  report_type TEXT CHECK (report_type IN ('installation', 'billable_hours', 'performance', 'qc_summary', 'eos')),
  frequency TEXT CHECK (frequency IN ('daily', 'weekly', 'biweekly', 'monthly')),
  send_time TEXT, -- HH:MM
  send_day TEXT, -- monday..sunday
  recipient_emails TEXT[],
  branches TEXT[],
  date_range_type TEXT CHECK (date_range_type IN ('daily', 'week_to_date', 'last_7_days', 'last_30_days')),
  report_config_id UUID,
  is_active BOOLEAN DEFAULT TRUE,
  last_sent_at TIMESTAMP WITH TIME ZONE,
  email_metrics JSONB
);

-- 12. InstallationReportConfig
CREATE TABLE installation_report_configs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  config_name TEXT,
  include_trailer_info BOOLEAN DEFAULT TRUE,
  include_timing_breakdown BOOLEAN DEFAULT TRUE,
  include_device_info BOOLEAN DEFAULT TRUE,
  include_photos BOOLEAN DEFAULT TRUE,
  include_qc_results BOOLEAN DEFAULT TRUE,
  include_location BOOLEAN DEFAULT TRUE,
  include_technician_notes BOOLEAN DEFAULT TRUE,
  include_skipped_steps BOOLEAN DEFAULT TRUE,
  is_active BOOLEAN DEFAULT TRUE
);

-- 13. InstallationPhaseConfig
CREATE TABLE installation_phase_configs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  branch_name TEXT,
  config_name TEXT,
  phase1_steps JSONB,
  phase2_steps JSONB,
  phase3_steps JSONB,
  is_active BOOLEAN DEFAULT TRUE
);

-- 14. QCPromptConfig
CREATE TABLE qc_prompt_configs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  step_name TEXT,
  display_name TEXT,
  qc_prompt TEXT,
  reference_documents JSONB,
  is_required BOOLEAN DEFAULT TRUE,
  quality_criteria TEXT[],
  is_active BOOLEAN DEFAULT TRUE
);

-- 15. RoleConfig
CREATE TABLE role_configs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  role TEXT CHECK (role IN ('technician', 'manager', 'admin')),
  page_access JSONB,
  feature_access JSONB,
  is_active BOOLEAN DEFAULT TRUE
);

-- 16. EOSConversationPrompt
CREATE TABLE eos_conversation_prompts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  prompt_name TEXT,
  system_prompt TEXT,
  instructions TEXT,
  is_active BOOLEAN DEFAULT TRUE
);

-- 17. InstallationIssue
CREATE TABLE installation_issues (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  issue_description TEXT,
  frequency INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE
);

-- 18. Jobs
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_type TEXT CHECK (job_type IN ('import_trailers', 'delete_all_trailers', 'mark_installed')),
  status TEXT CHECK (status IN ('pending', 'running', 'completed', 'failed')) DEFAULT 'pending',
  progress INTEGER DEFAULT 0,
  current_count INTEGER DEFAULT 0,
  total_count INTEGER DEFAULT 0,
  created_count INTEGER DEFAULT 0,
  updated_count INTEGER DEFAULT 0,
  skipped_count INTEGER DEFAULT 0,
  deleted_count INTEGER DEFAULT 0,
  error_message TEXT,
  file_url TEXT,
  mapping JSONB,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Basic RLS setup (Example: Profiles)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone." ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile." ON profiles FOR UPDATE USING (auth.uid() = id);
