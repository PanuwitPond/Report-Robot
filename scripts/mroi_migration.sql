-- MROI Database Migration Scripts
-- Run these SQL commands to setup MROI tables in PostgreSQL

-- ========================================
-- 1. CREATE CAMERAS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS public.iv_cameras (
    iv_camera_uuid VARCHAR(255) PRIMARY KEY,
    rtsp VARCHAR(255) NOT NULL,
    camera_name VARCHAR(255),
    camera_name_display VARCHAR(255),
    camera_type VARCHAR(255),
    device_id VARCHAR(255),
    reference_id VARCHAR(255),
    metthier_ai_config JSONB,          -- Stores ROI configuration: { "rule": [...] }
    docker_info JSONB,                  -- SSH connection details
    camera_site VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    domain VARCHAR(50) DEFAULT 'default-domain',
    is_active BOOLEAN DEFAULT true
);

-- Add comments
COMMENT ON TABLE public.iv_cameras IS 'RTSP Camera devices for MROI system';
COMMENT ON COLUMN public.iv_cameras.iv_camera_uuid IS 'Unique camera identifier (UUID)';
COMMENT ON COLUMN public.iv_cameras.rtsp IS 'RTSP stream URL (rtsp://...)';
COMMENT ON COLUMN public.iv_cameras.metthier_ai_config IS 'JSON object containing ROI rules: {rule: [...]}';
COMMENT ON COLUMN public.iv_cameras.docker_info IS 'SSH connection info for remote execution';
COMMENT ON COLUMN public.iv_cameras.domain IS 'Multi-tenant domain for data isolation';

-- ========================================
-- 2. CREATE ROIS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS public.iv_camera_rois (
    id SERIAL PRIMARY KEY,
    iv_camera_uuid VARCHAR(255) NOT NULL REFERENCES public.iv_cameras(iv_camera_uuid) ON DELETE CASCADE,
    roi_name VARCHAR(255) NOT NULL,
    roi_type VARCHAR(50) NOT NULL,     -- 'intrusion' | 'tripwire' | 'density' | 'zoom'
    coordinates JSONB NOT NULL,         -- { "points": [{x, y}, ...], "width": 1280, "height": 720 }
    roi_settings JSONB,                 -- { "sensitivity": 80, "threshold": 90, "color": "#FF0000" }
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_by VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    domain VARCHAR(50) DEFAULT 'default-domain'
);

-- Add comments
COMMENT ON TABLE public.iv_camera_rois IS 'Regions of Interest (ROI) definitions per camera';
COMMENT ON COLUMN public.iv_camera_rois.roi_type IS 'Type of ROI: intrusion detection, tripwire, density monitoring, zoom region';
COMMENT ON COLUMN public.iv_camera_rois.coordinates IS 'Canvas coordinates of the ROI polygon/line from Konva.js drawing';
COMMENT ON COLUMN public.iv_camera_rois.roi_settings IS 'Settings like sensitivity level, threshold, color for visualization';

-- ========================================
-- 3. CREATE SCHEDULES TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS public.iv_camera_schedules (
    id SERIAL PRIMARY KEY,
    iv_camera_uuid VARCHAR(255) NOT NULL REFERENCES public.iv_cameras(iv_camera_uuid) ON DELETE CASCADE,
    schedule_name VARCHAR(255) NOT NULL,
    start_time TIME,                    -- HH:mm format
    end_time TIME,                      -- HH:mm format
    days_of_week VARCHAR(100),          -- 'MON,TUE,WED,THU,FRI,SAT,SUN' or comma-separated
    actions JSONB,                      -- { "enableROIs": [...], "disableROIs": [...], "recordVideo": true, "sendAlert": true }
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_by VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    domain VARCHAR(50) DEFAULT 'default-domain'
);

-- Add comments
COMMENT ON TABLE public.iv_camera_schedules IS 'Time-based schedules for automated ROI activation/deactivation';
COMMENT ON COLUMN public.iv_camera_schedules.actions IS 'Actions to perform: enable/disable ROIs, record video, send alerts';

-- ========================================
-- 4. CREATE SNAPSHOTS TABLE (Optional)
-- ========================================
CREATE TABLE IF NOT EXISTS public.iv_camera_snapshots (
    id SERIAL PRIMARY KEY,
    iv_camera_uuid VARCHAR(255) NOT NULL REFERENCES public.iv_cameras(iv_camera_uuid) ON DELETE CASCADE,
    snapshot_path VARCHAR(500),         -- File path: /var/mroi/snapshots/cam001/20231215_143000.jpg
    snapshot_timestamp TIMESTAMP NOT NULL,
    snapshot_size INTEGER,              -- File size in bytes
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add comment
COMMENT ON TABLE public.iv_camera_snapshots IS 'Stores information about captured snapshots for archival';
COMMENT ON COLUMN public.iv_camera_snapshots.snapshot_path IS 'Local file path where snapshot is stored';

-- ========================================
-- 5. CREATE INDEXES
-- ========================================
-- For better query performance
CREATE INDEX IF NOT EXISTS idx_iv_cameras_site ON public.iv_cameras(camera_site);
CREATE INDEX IF NOT EXISTS idx_iv_cameras_domain ON public.iv_cameras(domain);
CREATE INDEX IF NOT EXISTS idx_iv_cameras_active ON public.iv_cameras(is_active);

CREATE INDEX IF NOT EXISTS idx_iv_rois_uuid ON public.iv_camera_rois(iv_camera_uuid);
CREATE INDEX IF NOT EXISTS idx_iv_rois_type ON public.iv_camera_rois(roi_type);
CREATE INDEX IF NOT EXISTS idx_iv_rois_active ON public.iv_camera_rois(is_active);
CREATE INDEX IF NOT EXISTS idx_iv_rois_domain ON public.iv_camera_rois(domain);

CREATE INDEX IF NOT EXISTS idx_iv_schedules_uuid ON public.iv_camera_schedules(iv_camera_uuid);
CREATE INDEX IF NOT EXISTS idx_iv_schedules_active ON public.iv_camera_schedules(is_active);
CREATE INDEX IF NOT EXISTS idx_iv_schedules_domain ON public.iv_camera_schedules(domain);

CREATE INDEX IF NOT EXISTS idx_iv_snapshots_uuid ON public.iv_camera_snapshots(iv_camera_uuid);
CREATE INDEX IF NOT EXISTS idx_iv_snapshots_timestamp ON public.iv_camera_snapshots(snapshot_timestamp);

-- ========================================
-- 6. SAMPLE DATA (Optional - for testing)
-- ========================================
-- Insert a test camera
INSERT INTO public.iv_cameras (
    iv_camera_uuid,
    rtsp,
    camera_name,
    camera_name_display,
    camera_type,
    camera_site,
    domain
) VALUES (
    'cam-001-uuid-test',
    'rtsp://admin:admin123@192.168.1.100:554/stream1',
    'front_door',
    'Front Door Camera',
    'Hikvision DS-2CD2143G0-I',
    'Building A',
    'default-domain'
) ON CONFLICT (iv_camera_uuid) DO NOTHING;

-- Insert sample ROI
INSERT INTO public.iv_camera_rois (
    iv_camera_uuid,
    roi_name,
    roi_type,
    coordinates,
    roi_settings,
    domain
) VALUES (
    'cam-001-uuid-test',
    'Entrance Zone',
    'intrusion',
    '{"points": [{"x": 100, "y": 100}, {"x": 300, "y": 100}, {"x": 300, "y": 300}, {"x": 100, "y": 300}], "width": 1280, "height": 720}',
    '{"sensitivity": 80, "threshold": 90, "color": "#FF0000"}',
    'default-domain'
) ON CONFLICT DO NOTHING;

-- Insert sample schedule
INSERT INTO public.iv_camera_schedules (
    iv_camera_uuid,
    schedule_name,
    start_time,
    end_time,
    days_of_week,
    actions,
    domain
) VALUES (
    'cam-001-uuid-test',
    'Business Hours',
    '08:00',
    '18:00',
    'MON,TUE,WED,THU,FRI',
    '{"enableROIs": ["Entrance Zone"], "recordVideo": true, "sendAlert": true}',
    'default-domain'
) ON CONFLICT DO NOTHING;

-- ========================================
-- 7. VIEW CREATION (Optional - for easy querying)
-- ========================================
CREATE OR REPLACE VIEW public.v_mroi_summary AS
SELECT 
    c.iv_camera_uuid,
    c.camera_name,
    c.camera_name_display,
    c.camera_site,
    c.is_active,
    COUNT(DISTINCT r.id) as roi_count,
    COUNT(DISTINCT s.id) as schedule_count,
    MAX(c.updated_at) as last_updated
FROM public.iv_cameras c
LEFT JOIN public.iv_camera_rois r ON c.iv_camera_uuid = r.iv_camera_uuid
LEFT JOIN public.iv_camera_schedules s ON c.iv_camera_uuid = s.iv_camera_uuid
GROUP BY c.iv_camera_uuid, c.camera_name, c.camera_name_display, c.camera_site, c.is_active
ORDER BY c.camera_name;

-- ========================================
-- 8. VERIFY INSTALLATION
-- ========================================
-- Run these queries to verify tables were created:
/*
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'iv_%';

SELECT COUNT(*) FROM public.iv_cameras;
SELECT COUNT(*) FROM public.iv_camera_rois;
SELECT COUNT(*) FROM public.iv_camera_schedules;

SELECT * FROM public.v_mroi_summary;
*/

-- ========================================
-- 9. BACKUP & RESTORE COMMANDS
-- ========================================
-- Backup MROI tables only:
-- pg_dump -U postgres -d report_robot_db -t iv_cameras -t iv_camera_rois -t iv_camera_schedules > mroi_backup.sql

-- Restore from backup:
-- psql -U postgres -d report_robot_db < mroi_backup.sql

-- ========================================
-- END OF MIGRATION SCRIPT
-- ========================================
