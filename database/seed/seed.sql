-- Clear existing data (fresh start)
TRUNCATE TABLE alerts CASCADE;
TRUNCATE TABLE face_embeddings CASCADE;
TRUNCATE TABLE employees CASCADE;
TRUNCATE TABLE cameras CASCADE;
TRUNCATE TABLE subscriptions CASCADE;
TRUNCATE TABLE users CASCADE;
TRUNCATE TABLE companies CASCADE;

-- Seed Companies
INSERT INTO companies 
  (id, name, plan, max_cameras, is_active)
VALUES
  (
    'c1111111-1111-1111-1111-111111111111',
    'TechFactory Pvt Ltd',
    'pro',
    10,
    true
  ),
  (
    'c2222222-2222-2222-2222-222222222222',
    'SmartOffice Solutions',
    'basic',
    2,
    true
  );

-- Seed Users (password: "Password@123")
-- bcrypt hash of "Password@123" with 12 rounds:
INSERT INTO users 
  (id, name, email, password, role, 
   company_id, is_active)
VALUES
  (
    'u1111111-1111-1111-1111-111111111111',
    'Arun Kumar',
    'admin@techfactory.com',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/lewdBaUkLtMRGGIK',
    'admin',
    'c1111111-1111-1111-1111-111111111111',
    true
  ),
  (
    'u2222222-2222-2222-2222-222222222222',
    'Rahul Singh',
    'operator1@techfactory.com',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/lewdBaUkLtMRGGIK',
    'operator',
    'c1111111-1111-1111-1111-111111111111',
    true
  ),
  (
    'u3333333-3333-3333-3333-333333333333',
    'Priya Sharma',
    'operator2@techfactory.com',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/lewdBaUkLtMRGGIK',
    'operator',
    'c1111111-1111-1111-1111-111111111111',
    true
  ),
  (
    'u4444444-4444-4444-4444-444444444444',
    'Vikram Patel',
    'admin@smartoffice.com',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/lewdBaUkLtMRGGIK',
    'admin',
    'c2222222-2222-2222-2222-222222222222',
    true
  );

-- Seed Cameras
INSERT INTO cameras 
  (id, name, rtsp_url, location, 
   status, operator_id, company_id)
VALUES
  (
    'cam1111-1111-1111-1111-111111111111',
    'Floor A - Camera 1',
    'rtsp://demo:demo@camera1.local/stream',
    'Production Floor A',
    'active',
    'u2222222-2222-2222-2222-222222222222',
    'c1111111-1111-1111-1111-111111111111'
  ),
  (
    'cam2222-2222-2222-2222-222222222222',
    'Floor B - Camera 2',
    'rtsp://demo:demo@camera2.local/stream',
    'Production Floor B',
    'active',
    'u2222222-2222-2222-2222-222222222222',
    'c1111111-1111-1111-1111-111111111111'
  ),
  (
    'cam3333-3333-3333-3333-333333333333',
    'Entry Gate Camera',
    'rtsp://demo:demo@camera3.local/stream',
    'Main Entry Gate',
    'inactive',
    'u3333333-3333-3333-3333-333333333333',
    'c1111111-1111-1111-1111-111111111111'
  ),
  (
    'cam4444-4444-4444-4444-444444444444',
    'Office Main Camera',
    'rtsp://demo:demo@camera4.local/stream',
    'Main Office Floor',
    'active',
    null,
    'c2222222-2222-2222-2222-222222222222'
  );

-- Seed Employees
INSERT INTO employees 
  (id, name, emp_id, department, 
   role, photo_url, status, company_id)
VALUES
  (
    'emp1111-1111-1111-1111-111111111111',
    'Suresh Kumar',
    'EMP001',
    'Production',
    'Machine Operator',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Suresh',
    'active',
    'c1111111-1111-1111-1111-111111111111'
  ),
  (
    'emp2222-2222-2222-2222-222222222222',
    'Anjali Verma',
    'EMP002',
    'Quality Control',
    'QC Inspector',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Anjali',
    'active',
    'c1111111-1111-1111-1111-111111111111'
  ),
  (
    'emp3333-3333-3333-3333-333333333333',
    'Mohammed Ali',
    'EMP003',
    'Maintenance',
    'Technician',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Mohammed',
    'active',
    'c1111111-1111-1111-1111-111111111111'
  ),
  (
    'emp4444-4444-4444-4444-444444444444',
    'Deepika Nair',
    'EMP004',
    'Production',
    'Line Supervisor',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Deepika',
    'active',
    'c1111111-1111-1111-1111-111111111111'
  ),
  (
    'emp5555-5555-5555-5555-555555555555',
    'Ravi Shankar',
    'EMP005',
    'Security',
    'Security Guard',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Ravi',
    'inactive',
    'c1111111-1111-1111-1111-111111111111'
  );

-- Seed Alerts (last 7 days)
INSERT INTO alerts 
  (id, camera_id, employee_id, company_id,
   type, screenshot_url, status, created_at)
VALUES
  (
    'alt1111-1111-1111-1111-111111111111',
    'cam1111-1111-1111-1111-111111111111',
    'emp1111-1111-1111-1111-111111111111',
    'c1111111-1111-1111-1111-111111111111',
    'sleeping',
    'https://placehold.co/400x300/1E293B/EF4444?text=Alert+Screenshot',
    'pending',
    NOW() - INTERVAL '2 hours'
  ),
  (
    'alt2222-2222-2222-2222-222222222222',
    'cam2222-2222-2222-2222-222222222222',
    'emp2222-2222-2222-2222-222222222222',
    'c1111111-1111-1111-1111-111111111111',
    'idle',
    'https://placehold.co/400x300/1E293B/F59E0B?text=Alert+Screenshot',
    'resolved',
    NOW() - INTERVAL '5 hours'
  ),
  (
    'alt3333-3333-3333-3333-333333333333',
    'cam1111-1111-1111-1111-111111111111',
    null,
    'c1111111-1111-1111-1111-111111111111',
    'unknown_person',
    'https://placehold.co/400x300/1E293B/EF4444?text=Unknown+Person',
    'pending',
    NOW() - INTERVAL '1 day'
  ),
  (
    'alt4444-4444-4444-4444-444444444444',
    'cam2222-2222-2222-2222-222222222222',
    'emp3333-3333-3333-3333-333333333333',
    'c1111111-1111-1111-1111-111111111111',
    'idle',
    'https://placehold.co/400x300/1E293B/F59E0B?text=Idle+Alert',
    'ignored',
    NOW() - INTERVAL '2 days'
  ),
  (
    'alt5555-5555-5555-5555-555555555555',
    'cam1111-1111-1111-1111-111111111111',
    'emp4444-4444-4444-4444-444444444444',
    'c1111111-1111-1111-1111-111111111111',
    'sleeping',
    'https://placehold.co/400x300/1E293B/EF4444?text=Sleeping+Alert',
    'resolved',
    NOW() - INTERVAL '3 days'
  ),
  (
    'alt6666-6666-6666-6666-666666666666',
    'cam2222-2222-2222-2222-222222222222',
    null,
    'c1111111-1111-1111-1111-111111111111',
    'unauthorized',
    'https://placehold.co/400x300/1E293B/7C3AED?text=Unauthorized',
    'pending',
    NOW() - INTERVAL '4 days'
  ),
  (
    'alt7777-7777-7777-7777-777777777777',
    'cam1111-1111-1111-1111-111111111111',
    'emp2222-2222-2222-2222-222222222222',
    'c1111111-1111-1111-1111-111111111111',
    'idle',
    'https://placehold.co/400x300/1E293B/F59E0B?text=Idle+Worker',
    'resolved',
    NOW() - INTERVAL '5 days'
  );

-- Seed Subscriptions
INSERT INTO subscriptions 
  (company_id, plan, amount, status,
   start_date, end_date)
VALUES
  (
    'c1111111-1111-1111-1111-111111111111',
    'pro',
    2999.00,
    'active',
    NOW() - INTERVAL '15 days',
    NOW() + INTERVAL '15 days'
  ),
  (
    'c2222222-2222-2222-2222-222222222222',
    'basic',
    999.00,
    'active',
    NOW() - INTERVAL '5 days',
    NOW() + INTERVAL '25 days'
  );
