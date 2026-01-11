# SPECGUARD Installation Data Capture Specification
## Complete Redesign - January 2025

---

## 🚨 PROBLEMS WITH PREVIOUS SYSTEM

### Data Never Captured:
| Field | Issue | Impact |
|-------|-------|--------|
| IMEI | No field in schema | Can't identify device |
| MAC Address | No field in schema | Can't verify connectivity |
| VIN | Photos never taken (0%) | Can't verify trailer identity |
| Serial Numbers | No field in schema | Can't track inventory |
| Per-Tech Timing | Single timestamp only | Can't measure team performance |
| Phase Times | Not stored separately | Can't identify bottlenecks |

### Photos Never Captured:
- VIN Plate Close-up: 0%
- VIN Plate Overall: 0%
- Camera Installation: 0%
- Installation Stickers (IMEI/MAC): Not tracked separately

---

## ✅ NEW DATA MODEL

### Table: `installation_records` (Replaces installation_logs)

```sql
CREATE TABLE installation_records (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- ===== TRAILER IDENTIFICATION =====
  asset_id VARCHAR(50) NOT NULL REFERENCES trailers(asset_id),
  vin VARCHAR(17),                    -- NEW: Captured/OCR'd VIN
  vin_verified BOOLEAN DEFAULT FALSE, -- NEW: VIN checksum validated
  
  -- ===== DEVICE IDENTIFIERS (CRITICAL - WAS MISSING) =====
  gateway_imei VARCHAR(20),           -- NEW: 15-digit IMEI
  gateway_imei_verified BOOLEAN DEFAULT FALSE,  -- Luhn check passed
  gateway_mac VARCHAR(20),            -- NEW: MAC address XX:XX:XX:XX:XX:XX
  gateway_serial VARCHAR(50),         -- NEW: Device serial number
  gateway_model VARCHAR(50),          -- Model number (was captured)
  
  camera_imei VARCHAR(20),            -- NEW: Camera IMEI if applicable
  camera_mac VARCHAR(20),             -- NEW: Camera MAC
  camera_serial VARCHAR(50),          -- NEW: Camera serial
  camera_model VARCHAR(50),           -- Model number
  
  door_sensor_imei VARCHAR(20),       -- NEW: Door sensor IMEI
  door_sensor_mac VARCHAR(20),        -- NEW: Door sensor MAC
  door_sensor_serial VARCHAR(50),     -- NEW: Door sensor serial
  door_sensor_model VARCHAR(50),      -- Model number
  
  -- ===== INSTALLATION TYPE =====
  device_type VARCHAR(20) NOT NULL,   -- 'StealthNet' or 'StealthNet++'
  installation_type VARCHAR(10) NOT NULL DEFAULT 'solo', -- 'solo' or 'team'
  installation_group_id UUID,         -- Links team install records
  
  -- ===== TECHNICIAN TRACKING (CRITICAL - WAS MISSING) =====
  technician_id UUID REFERENCES profiles(id),
  technician_email VARCHAR(255) NOT NULL,
  technician_name VARCHAR(100) NOT NULL,
  branch VARCHAR(100) NOT NULL,
  
  -- ===== TIMING - OVERALL =====
  installation_started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  installation_completed_at TIMESTAMPTZ,
  total_cycle_time_minutes INTEGER GENERATED ALWAYS AS (
    CASE WHEN installation_completed_at IS NOT NULL 
      THEN EXTRACT(EPOCH FROM (installation_completed_at - installation_started_at))::INTEGER / 60
      ELSE NULL
    END
  ) STORED,
  
  -- ===== TIMING - PER PHASE (NEW - WAS MISSING) =====
  phase1_started_at TIMESTAMPTZ,      -- Documentation phase
  phase1_completed_at TIMESTAMPTZ,
  phase1_duration_minutes INTEGER,
  
  phase2_started_at TIMESTAMPTZ,      -- Undercarriage phase
  phase2_completed_at TIMESTAMPTZ,
  phase2_duration_minutes INTEGER,
  
  phase3_started_at TIMESTAMPTZ,      -- External components phase
  phase3_completed_at TIMESTAMPTZ,
  phase3_duration_minutes INTEGER,
  
  -- ===== WORK PERFORMED (FOR TEAM INSTALLS) =====
  work_selected JSONB,                -- What this tech selected to do
  steps_completed JSONB,              -- What was actually completed
  is_final_closeout BOOLEAN DEFAULT FALSE, -- Did this tech do Tech Assist?
  
  -- ===== PHOTOS - PHASE 1: DOCUMENTATION =====
  trailer_photo_url TEXT,
  trailer_photo_at TIMESTAMPTZ,
  
  installation_stickers_url TEXT,     -- NEW: Close-up of IMEI/MAC stickers
  installation_stickers_at TIMESTAMPTZ,
  installation_stickers_ocr JSONB,    -- NEW: OCR results {imei, mac, model}
  
  vin_closeup_url TEXT,               -- NEW: Was never captured!
  vin_closeup_at TIMESTAMPTZ,
  vin_closeup_ocr TEXT,               -- NEW: OCR'd VIN text
  
  vin_overall_url TEXT,               -- NEW: Was never captured!
  vin_overall_at TIMESTAMPTZ,
  
  -- ===== PHOTOS - PHASE 2: UNDERCARRIAGE =====
  gateway_mounting_url TEXT,
  gateway_mounting_at TIMESTAMPTZ,
  
  abs_connection_url TEXT,
  abs_connection_at TIMESTAMPTZ,
  
  power_connection_url TEXT,          -- NEW: Turn signal/alt power
  power_connection_at TIMESTAMPTZ,
  
  undercarriage_overall_url TEXT,     -- NEW: Overall undercarriage shot
  undercarriage_overall_at TIMESTAMPTZ,
  
  -- ===== PHOTOS - PHASE 3: EXTERNAL =====
  camera_url TEXT,                    -- Was never captured (0%)!
  camera_at TIMESTAMPTZ,
  
  door_sensor_url TEXT,
  door_sensor_at TIMESTAMPTZ,
  
  tech_assist_url TEXT,               -- Screenshot of Tech Assist app
  tech_assist_at TIMESTAMPTZ,
  
  -- ===== VERIFICATION (FOR TEAM INSTALLS) =====
  verification_scan JSONB,            -- {photos, ocr_results, cross_check}
  verification_passed BOOLEAN,
  verification_discrepancies JSONB,   -- Any mismatches found
  
  -- ===== QUALITY CONTROL =====
  qc_status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'passed', 'failed', 'review'
  qc_results JSONB,                   -- AI analysis results
  qc_reviewed_by UUID,
  qc_reviewed_at TIMESTAMPTZ,
  qc_notes TEXT,
  
  -- ===== STATUS & NOTES =====
  status VARCHAR(20) NOT NULL DEFAULT 'in_progress',
  -- 'in_progress', 'partial', 'completed', 'cancelled', 'failed'
  
  completion_notes TEXT,
  delay_reason VARCHAR(100),          -- NEW: Categorized delay
  delay_notes TEXT,                   -- NEW: Free text explanation
  
  -- ===== VALIDATION =====
  validation_errors JSONB,            -- Any validation issues
  validation_warnings JSONB,          -- Non-blocking warnings
  
  -- ===== METADATA =====
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  synced_from_offline BOOLEAN DEFAULT FALSE,
  offline_created_at TIMESTAMPTZ,
  
  -- ===== CONSTRAINTS =====
  CONSTRAINT valid_status CHECK (status IN ('in_progress', 'partial', 'completed', 'cancelled', 'failed')),
  CONSTRAINT valid_install_type CHECK (installation_type IN ('solo', 'team')),
  CONSTRAINT valid_qc_status CHECK (qc_status IN ('pending', 'passed', 'failed', 'review'))
);

-- Indexes for performance
CREATE INDEX idx_install_asset ON installation_records(asset_id);
CREATE INDEX idx_install_tech ON installation_records(technician_id);
CREATE INDEX idx_install_branch ON installation_records(branch);
CREATE INDEX idx_install_status ON installation_records(status);
CREATE INDEX idx_install_date ON installation_records(installation_completed_at);
CREATE INDEX idx_install_group ON installation_records(installation_group_id);
```

---

## 📸 PHOTO CAPTURE REQUIREMENTS

### Phase 1: Documentation (4 Required Photos)

| Step | Photo | OCR Required | Data Extracted |
|------|-------|--------------|----------------|
| 1.1 | Trailer Overall | No | Visual confirmation of asset |
| 1.2 | Installation Stickers Close-up | ✅ YES | IMEI, MAC, Model Number |
| 1.3 | VIN Plate Close-up | ✅ YES | 17-character VIN |
| 1.4 | VIN Plate + Stickers Overall | No | Documentation shot |

### Phase 2: Undercarriage (4 Required Photos)

| Step | Photo | Notes |
|------|-------|-------|
| 2.1 | Gateway Mounting | Show device secured |
| 2.2 | ABS Connection | Show Y-cable connected |
| 2.3 | Power Connection | Turn signal / alt power |
| 2.4 | Undercarriage Overall | All components visible |

### Phase 3: External (2-4 Photos)

| Step | Photo | Required For |
|------|-------|--------------|
| 3.1 | Camera Installation | StealthNet++ only |
| 3.2 | Door Sensor | If equipped |
| 3.3 | Tech Assist Screenshot | ALL installations |

---

## 🔍 OCR DATA EXTRACTION

### Installation Stickers Photo → Auto-Extract:

```typescript
interface StickersOCRResult {
  imei: {
    value: string;        // "353456789012345"
    confidence: number;   // 0.95
    validated: boolean;   // Luhn check passed
  };
  mac: {
    value: string;        // "AA:BB:CC:DD:EE:FF"
    confidence: number;
    validated: boolean;   // Format check passed
  };
  model: {
    value: string;        // "77-7700"
    confidence: number;
  };
  raw_text: string;       // Full OCR text for debugging
}
```

### VIN Close-up Photo → Auto-Extract:

```typescript
interface VINOCRResult {
  vin: {
    value: string;        // "1HGBH41JXMN109186"
    confidence: number;
    checksum_valid: boolean;
    decoded: {
      year: number;
      make: string;
      model: string;
      // ... VIN decode data
    };
  };
  raw_text: string;
}
```

---

## 👥 TEAM INSTALLATION TRACKING

### Each Tech Gets Their Own Record:

```
Installation Group: abc-123-def
├── Record 1 (Tech: John)
│   ├── work_selected: {phases: ["1"]}
│   ├── phase1_started_at: 10:00 AM
│   ├── phase1_completed_at: 10:15 AM
│   └── is_final_closeout: false
│
├── Record 2 (Tech: Maria)  
│   ├── work_selected: {phases: ["2"]}
│   ├── phase2_started_at: 10:05 AM
│   ├── phase2_completed_at: 10:35 AM
│   └── is_final_closeout: false
│
└── Record 3 (Tech: John)
    ├── work_selected: {phases: ["3"]}
    ├── phase3_started_at: 10:35 AM
    ├── phase3_completed_at: 10:45 AM
    ├── is_final_closeout: true
    └── tech_assist_url: "..."
```

### Aggregated View for Reporting:

```sql
-- Get complete installation summary
SELECT 
  asset_id,
  MIN(installation_started_at) as install_started,
  MAX(installation_completed_at) as install_completed,
  EXTRACT(EPOCH FROM (MAX(installation_completed_at) - MIN(installation_started_at)))/60 as total_minutes,
  COUNT(DISTINCT technician_id) as tech_count,
  ARRAY_AGG(DISTINCT technician_name) as technicians
FROM installation_records
WHERE installation_group_id = 'abc-123-def'
GROUP BY asset_id;
```

---

## ✅ VALIDATION REQUIREMENTS

### Before Photo Capture:
- Camera permission granted
- Sufficient lighting detected
- Device orientation correct

### After OCR Extraction:
| Field | Validation | Action if Fails |
|-------|------------|-----------------|
| IMEI | 15 digits + Luhn check | Show warning, allow manual entry |
| MAC | XX:XX:XX:XX:XX:XX format | Show warning, allow manual entry |
| VIN | 17 chars + checksum | Show warning, allow manual entry |

### Before Installation Complete:
- [ ] All required photos captured
- [ ] IMEI extracted or manually entered
- [ ] MAC extracted or manually entered
- [ ] VIN extracted or manually entered
- [ ] Tech Assist screenshot captured
- [ ] All validations pass (or warnings acknowledged)

---

## 📊 DATA FLOW

```
┌─────────────────────────────────────────────────────────────────┐
│                     TECHNICIAN WORKFLOW                         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ 1. SCAN TRAILER                                                 │
│    └─► Asset ID lookup → Load trailer info                      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ 2. SELECT INSTALLATION TYPE                                     │
│    └─► Solo: All phases                                         │
│    └─► Team: Select specific phases/steps                       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ 3. PHASE 1: DOCUMENTATION                                       │
│    ├─► 📷 Trailer Photo                                         │
│    ├─► 📷 Installation Stickers → OCR → IMEI, MAC, Model        │
│    ├─► 📷 VIN Close-up → OCR → VIN (validated)                  │
│    └─► 📷 VIN + Stickers Overall                                │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ 4. PHASE 2: UNDERCARRIAGE                                       │
│    ├─► 📷 Gateway Mounting                                      │
│    ├─► 📷 ABS Connection                                        │
│    ├─► 📷 Power Connection                                      │
│    └─► 📷 Undercarriage Overall                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ 5. PHASE 3: EXTERNAL                                            │
│    ├─► 📷 Camera (StealthNet++ only)                            │
│    ├─► 📷 Door Sensor (if equipped)                             │
│    └─► 📷 Tech Assist Screenshot                                │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ 6. VALIDATION & COMPLETE                                        │
│    ├─► Validate all required data present                       │
│    ├─► Cross-check OCR vs manual entry                          │
│    ├─► Team: Verification scan if not first tech                │
│    └─► Submit → Sync to server                                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ 7. UPDATE TRAILER RECORD                                        │
│    └─► trailers.imei = installation_records.gateway_imei        │
│    └─► trailers.install_completed = true                        │
│    └─► trailers.last_updated_at = NOW()                         │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 SYNC TO TRAILERS TABLE

After installation completes, update the trailer record:

```sql
-- Trigger function to update trailer after installation
CREATE OR REPLACE FUNCTION update_trailer_from_installation()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' THEN
    UPDATE trailers SET
      imei = COALESCE(NEW.gateway_imei, imei),
      vin = COALESCE(NEW.vin, vin),
      install_completed = TRUE,
      last_updated_at = NOW(),
      updated_by = NEW.technician_email
    WHERE asset_id = NEW.asset_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sync_installation_to_trailer
  AFTER UPDATE ON installation_records
  FOR EACH ROW
  WHEN (NEW.status = 'completed' AND OLD.status != 'completed')
  EXECUTE FUNCTION update_trailer_from_installation();
```

---

## 📱 UI REQUIREMENTS

### Photo Capture Component:

```
┌─────────────────────────────────────────────────┐
│  📷 Installation Stickers                       │
│  ─────────────────────────────────────────────  │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │                                         │   │
│  │         [Photo Preview]                 │   │
│  │              or                         │   │
│  │      📷 Tap to Capture                  │   │
│  │                                         │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │ IMEI: [353456789012345    ] ✅ Valid    │   │
│  │ MAC:  [AA:BB:CC:DD:EE:FF  ] ✅ Valid    │   │
│  │ Model:[77-7700            ]             │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  [ 🔄 Retake Photo ]  [ ✏️ Edit Manually ]     │
│                                                 │
│          [ ✅ Confirm & Continue ]              │
└─────────────────────────────────────────────────┘
```

### Validation Feedback:

```
✅ IMEI: 353456789012345 (Luhn check passed)
⚠️ MAC: AA:BB:CC:DD:EE:GG (Invalid character 'G')
❌ VIN: Missing - Photo required
```

---

## 🎯 SUMMARY OF CHANGES

### NEW Data Captured:
1. ✅ IMEI (gateway, camera, door sensor)
2. ✅ MAC Address (gateway, camera, door sensor)
3. ✅ Serial Numbers
4. ✅ VIN (OCR + validated)
5. ✅ Per-phase timing
6. ✅ Per-technician tracking for team installs
7. ✅ Verification scan for team installs
8. ✅ OCR confidence scores
9. ✅ Validation results

### NEW Photos Required:
1. ✅ Installation Stickers Close-up (for OCR)
2. ✅ VIN Plate Close-up (for OCR)
3. ✅ VIN Plate Overall
4. ✅ Power Connection
5. ✅ Undercarriage Overall
6. ✅ Camera Installation (StealthNet++)

### Validation Added:
1. ✅ IMEI Luhn algorithm check
2. ✅ MAC address format validation
3. ✅ VIN checksum validation
4. ✅ Required photo enforcement
5. ✅ Cross-check OCR vs existing data
