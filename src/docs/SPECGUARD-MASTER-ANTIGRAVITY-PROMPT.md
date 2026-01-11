# SPECGUARD - XTRA LEASE
## Master Antigravity Project Prompt
### Version 1.0 - January 2025

---

# 🎯 PROJECT MISSION

Build a comprehensive, production-ready installation management platform for Mobile Installation Solutions (MIS) to manage Phillips Connect Technologies (PCT) device installations on commercial trailers for Xtra Lease.

**Primary Goal:** Enable field technicians to efficiently capture installation data with bulletproof validation, full offline capability, and seamless sync - while providing rich reporting for MIS, PCT, and Xtra Lease stakeholders.

**Critical Success Factors:**
1. **Zero workflow interruption** - Technicians must never be blocked by connectivity issues
2. **Data integrity** - Validate all inputs to prevent downstream data poisoning
3. **Customer-ready photos** - Auto-enhance all images for optimal quality
4. **Flexible team installations** - Support both solo and multi-technician workflows
5. **Comprehensive reporting** - Real-time dashboards and scheduled reports for all stakeholders

---

# 📚 REFERENCE MATERIALS

## GitHub Repository
**URL:** https://github.com/ffdm2025/SPECGUARD---XTRA

## Legacy Code Reference
**Location:** `src/base44-legacy/`

The following Base44 files contain existing business logic to reference during migration:

### Entity/Data Model Files:
- `SPECGUARD_Branch.html` - Branch/location management
- `SPECGUARD_Trailer.html` - Core trailer/asset entity
- `SPECGUARD_ScanLog.html` - Trailer scan history
- `SPECGUARD_Task.html` - Technician task management
- `SPECGUARD_RoleConfig.html` - Role-based access control
- `SPECGUARD_TechnicianScreenConfig.html` - UI configuration
- `SPECGUARD_EOSReport.html` - End-of-shift reports
- `SPECGUARD_EOSReportConfig.html` - EOS configuration
- `SPECGUARD_EOSConversationPrompt.html` - AI prompts for EOS
- `SPECGUARD_QCPromptConfig.html` - QC AI prompts
- `SPECGUARD_InstallationIssue.html` - Installation problems
- `SPECGUARD_Job.html` - Background job tracking

### Backend Function Files:
- `SPECGUARD_vinLookup.html` - VIN decoder integration
- `SPECGUARD_runQCAnalysis.html` - AI quality control
- `SPECGUARD_importTrailers.html` - Data import
- `SPECGUARD_manualPhillipsImport.html` - PCT data import
- `SPECGUARD_processJob.html` - Background job processor
- `SPECGUARD_convertHeicPhotos.html` - iOS photo conversion
- `SPECGUARD_convertHeicToJpg.html` - HEIC to JPEG
- `SPECGUARD_syncTrailerInstalls.html` - Sync installation data
- `SPECGUARD_sendEOSReport.html` - Email EOS reports
- `SPECGUARD_sendProductionReport.html` - Production reports
- `schema.sql` - Database schema reference

## Supabase Project
**Project Name:** SPECGUARD
**Status:** Tables created, RLS needs to be enabled

### Existing Tables:
- branches, trailers, profiles
- installation_logs, installation_phase_configs, installation_issues
- installation_report_configs, installation_time_edits
- scan_logs, tasks, jobs
- eos_reports, eos_report_configs, eos_conversation_prompts
- qc_prompt_configs, report_automations, role_configs

---

# 🤖 AGENT TEAM STRUCTURE

## Agent 1: Project Architect
**Role:** System design, architecture decisions, integration planning

**Responsibilities:**
- Overall system architecture and component design
- API design and data flow architecture
- Integration patterns for external services (VIN decoder, OCR, etc.)
- Security architecture and authentication flow
- Performance optimization strategies
- Code review for architectural compliance

**Key Decisions to Make:**
- State management approach (Zustand recommended)
- Routing structure by user role
- API layer abstraction
- Error handling patterns
- Logging and monitoring strategy

---

## Agent 2: Frontend Engineer
**Role:** React/TypeScript UI development, PWA implementation

**Responsibilities:**
- React component architecture with TypeScript
- Tailwind CSS styling and responsive design
- PWA configuration for offline-first experience
- IndexedDB implementation for local storage
- Service Worker setup for background sync
- Camera integration and photo capture
- Multi-language (i18n) implementation
- Accessibility compliance

**Technology Stack:**
- React 18+ with TypeScript
- Tailwind CSS for styling
- Workbox for Service Worker management
- Dexie.js for IndexedDB abstraction
- React Router for navigation
- Zustand for state management
- React Hook Form for form handling
- i18next for internationalization

**Key UI Components to Build:**
- Installation workflow wizard (multi-phase)
- Photo capture with preview
- Offline status indicator
- Sync queue dashboard
- Team installation phase selector
- Connectivity test interface
- Role-based navigation
- Data validation feedback

---

## Agent 3: Database Administrator
**Role:** Supabase schema design, optimization, security

**Responsibilities:**
- PostgreSQL schema design and migrations
- Row Level Security (RLS) policy implementation
- Database indexing and query optimization
- Supabase Edge Functions development
- Real-time subscriptions configuration
- Backup and recovery planning
- Data integrity constraints

**Critical Tasks:**
1. Enable RLS on ALL tables (currently disabled - security risk!)
2. Design `installation_records` table for team installs
3. Create photo processing Edge Function
4. Implement HEIC to JPEG conversion on backend
5. Create validation trigger functions
6. Design efficient indexes for reporting queries
7. Set up database functions for cycle time calculations

**Schema Priorities:**
- installation_records (NEW - supports team installs)
- installation_photos (NEW - with enhancement metadata)
- sync_queue (NEW - for offline sync tracking)
- Update trailers table for computed install status

---

## Agent 4: n8n Automation Specialist
**Role:** Workflow automation, scheduled tasks, integrations

**Responsibilities:**
- Scheduled report generation and distribution
- Data sync workflows with PCT systems
- Alert and notification workflows
- Inventory sync automation (Phase 2)
- Email automation via Resend
- Webhook handlers for external integrations
- Error alerting and monitoring workflows

**Key Workflows to Build:**
1. **Daily Installation Report** - Send to PCT and Xtra Lease
2. **End-of-Shift Report Generator** - Triggered by manager
3. **Low Inventory Alert** - When stock falls below threshold
4. **Sync Failure Alert** - When tech has pending uploads > 24 hours
5. **QC Failure Notification** - When AI detects quality issues
6. **Scheduled Data Backup** - Daily export to secure storage
7. **PCT Data Import** - Process uploaded Excel files

---

## Agent 5: Installation Domain Expert
**Role:** Business logic, workflow rules, field operations knowledge

**Responsibilities:**
- Installation workflow logic and phase definitions
- Validation rules for field data (VIN, IMEI, MAC, Asset ID)
- KPI definitions and cycle time calculations
- QC criteria and photo requirements
- Device-specific installation templates (StealthNet, StealthNet++, Camera, Door Sensor)
- Production delay categorization
- Team installation workflow rules

**Domain Knowledge to Implement:**

### Installation Phases (Default Template):
**Phase 1 - Documentation:**
- Step 1.1: Asset ID Confirmation
- Step 1.2: Installation Stickers Photo (IMEI, MAC, M/N via OCR)
- Step 1.3: VIN Close-up Photo (OCR + checksum validation)
- Step 1.4: Overall VIN Plate + Stickers Photo

**Phase 2 - Undercarriage:**
- Step 2.1: Gateway Installation
- Step 2.2: ABS Connection
- Step 2.3: Alternate Power Supply (Turn Signal Marker)
- Step 2.4: Undercarriage Documentation Photos

**Phase 3 - External Components:**
- Step 3.1: Camera Installation
- Step 3.2: Door Sensor Installation
- Step 3.3: Tech Assist Screenshot (connectivity verification)
- Step 3.4: Delay Notes Entry

### Validation Rules:
- **VIN:** 17 characters, checksum validation, decode verification
- **IMEI:** 15 digits, Luhn algorithm check
- **MAC Address:** XX:XX:XX:XX:XX:XX format
- **Asset ID:** Customer-specific pattern matching

### Team Installation Rules:
- Techs can select ANY combination of phases/steps
- Each tech's contribution stored as separate record
- Verification scan REQUIRED at every team closeout
- OCR cross-check compares against existing DB records
- Installation complete ONLY when all steps done + Tech Assist captured
- Phases CAN be done out of order
- Total cycle time = first tech start → last tech complete

---

## Agent 6: QA/Data Guard
**Role:** Testing, validation, data integrity protection

**Responsibilities:**
- Input validation implementation
- Unit and integration test development
- End-to-end test scenarios
- Data sanitization rules
- Error handling and user feedback
- Edge case identification
- Security testing
- Performance testing

**Validation Implementation:**

```typescript
// VIN Validation
function validateVIN(vin: string): ValidationResult {
  // Length check
  if (vin.length !== 17) {
    return { valid: false, error: 'VIN must be exactly 17 characters' };
  }
  
  // Invalid characters check (no I, O, Q)
  if (/[IOQ]/i.test(vin)) {
    return { valid: false, error: 'VIN cannot contain I, O, or Q' };
  }
  
  // Checksum validation (position 9)
  const checkDigit = calculateVINCheckDigit(vin);
  if (vin[8] !== checkDigit) {
    return { valid: false, error: 'VIN checksum invalid' };
  }
  
  return { valid: true };
}

// IMEI Validation (Luhn Algorithm)
function validateIMEI(imei: string): ValidationResult {
  if (!/^\d{15}$/.test(imei)) {
    return { valid: false, error: 'IMEI must be exactly 15 digits' };
  }
  
  if (!luhnCheck(imei)) {
    return { valid: false, error: 'IMEI checksum invalid' };
  }
  
  return { valid: true };
}

// MAC Address Validation
function validateMAC(mac: string): ValidationResult {
  const macRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
  if (!macRegex.test(mac)) {
    return { valid: false, error: 'Invalid MAC address format' };
  }
  
  return { valid: true };
}
```

**Test Scenarios to Cover:**
1. Solo installation happy path
2. Team installation with 2 techs
3. Team installation with 3 techs (out of order phases)
4. Offline installation with sync on reconnect
5. Photo capture with HEIC conversion
6. OCR extraction and validation
7. Failed sync retry logic
8. Logout with pending uploads
9. Cross-check verification failure
10. KPI threshold violations

---

# 🏗️ PROJECT STRUCTURE

```
specguard-xtra/
├── src/
│   ├── components/
│   │   ├── common/           # Shared UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── PhotoCapture.tsx
│   │   │   ├── OfflineIndicator.tsx
│   │   │   ├── SyncStatus.tsx
│   │   │   └── ValidationFeedback.tsx
│   │   ├── installation/     # Installation workflow components
│   │   │   ├── InstallationWizard.tsx
│   │   │   ├── PhaseSelector.tsx
│   │   │   ├── StepCard.tsx
│   │   │   ├── TeamInstallSelector.tsx
│   │   │   ├── VerificationScan.tsx
│   │   │   └── TechAssistCapture.tsx
│   │   ├── reports/          # Reporting components
│   │   └── layout/           # Layout components
│   │       ├── Header.tsx
│   │       ├── Sidebar.tsx
│   │       └── RoleBasedNav.tsx
│   │
│   ├── pages/
│   │   ├── auth/
│   │   │   ├── Login.tsx
│   │   │   └── ForgotPassword.tsx
│   │   ├── technician/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── PerformInstallation.tsx
│   │   │   ├── MyTasks.tsx
│   │   │   ├── AssetResearch.tsx
│   │   │   └── Settings.tsx
│   │   ├── manager/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── EOSReport.tsx
│   │   │   ├── TeamPerformance.tsx
│   │   │   └── TaskManagement.tsx
│   │   ├── pct/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── QCAnalysis.tsx
│   │   │   ├── InstallationReports.tsx
│   │   │   ├── DataUpload.tsx
│   │   │   └── AssetResearch.tsx
│   │   ├── xtra-lease/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── InstallationStatus.tsx
│   │   │   └── ComplianceReports.tsx
│   │   └── admin/
│   │       ├── Dashboard.tsx
│   │       ├── UserManagement.tsx
│   │       ├── BranchManagement.tsx
│   │       ├── SystemConfig.tsx
│   │       └── TestTools.tsx
│   │
│   ├── hooks/
│   │   ├── useOfflineSync.ts
│   │   ├── useInstallation.ts
│   │   ├── usePhotoCapture.ts
│   │   ├── useValidation.ts
│   │   ├── useConnectivity.ts
│   │   └── useAuth.ts
│   │
│   ├── lib/
│   │   ├── supabase.ts       # Supabase client
│   │   ├── validation.ts     # Validation functions
│   │   ├── ocr.ts            # OCR utilities
│   │   ├── offline/
│   │   │   ├── db.ts         # IndexedDB setup (Dexie)
│   │   │   ├── syncQueue.ts  # Sync queue manager
│   │   │   └── cache.ts      # Data caching logic
│   │   └── utils/
│   │       ├── formatters.ts
│   │       ├── cycleTime.ts
│   │       └── kpi.ts
│   │
│   ├── stores/
│   │   ├── authStore.ts
│   │   ├── installationStore.ts
│   │   ├── syncStore.ts
│   │   └── uiStore.ts
│   │
│   ├── types/
│   │   ├── installation.ts
│   │   ├── trailer.ts
│   │   ├── user.ts
│   │   └── api.ts
│   │
│   └── i18n/
│       ├── en.json
│       ├── es.json
│       └── i18n.ts
│
├── supabase/
│   ├── migrations/
│   │   ├── 001_initial_schema.sql
│   │   ├── 002_installation_records.sql
│   │   ├── 003_enable_rls.sql
│   │   └── 004_photo_enhancements.sql
│   ├── functions/
│   │   ├── process-photo/
│   │   ├── validate-vin/
│   │   ├── connectivity-test/
│   │   └── run-qc-analysis/
│   └── seed/
│       └── test_data.sql
│
├── n8n/
│   └── workflows/
│       ├── daily-installation-report.json
│       ├── eos-report-generator.json
│       ├── sync-failure-alert.json
│       └── pct-data-import.json
│
├── public/
│   ├── manifest.json         # PWA manifest
│   ├── sw.js                 # Service worker
│   └── icons/
│
├── docs/
│   ├── installation-workflow-v2.1.md
│   ├── offline-architecture.md
│   ├── photo-enhancement.md
│   └── api-reference.md
│
└── tests/
    ├── unit/
    ├── integration/
    └── e2e/
```

---

# ⚙️ TECH STACK CONFIGURATION

## Frontend Dependencies

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "typescript": "^5.3.0",
    "@supabase/supabase-js": "^2.39.0",
    "zustand": "^4.4.7",
    "dexie": "^3.2.4",
    "dexie-react-hooks": "^1.1.6",
    "react-hook-form": "^7.48.0",
    "@hookform/resolvers": "^3.3.2",
    "zod": "^3.22.4",
    "i18next": "^23.7.0",
    "react-i18next": "^13.5.0",
    "tailwindcss": "^3.3.6",
    "workbox-webpack-plugin": "^7.0.0",
    "workbox-window": "^7.0.0",
    "@tanstack/react-query": "^5.8.0",
    "date-fns": "^2.30.0",
    "lucide-react": "^0.294.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@testing-library/react": "^14.1.0",
    "vitest": "^1.0.0",
    "playwright": "^1.40.0",
    "@sentry/react": "^7.85.0",
    "posthog-js": "^1.96.0"
  }
}
```

## Environment Variables

```env
# Supabase
VITE_SUPABASE_URL=https://qojjakgcqgewmnlvdmzu.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key

# External Services
VITE_VIN_DECODER_API_KEY=your_vin_api_key
VITE_OCR_SERVICE_URL=your_ocr_endpoint

# Monitoring
VITE_SENTRY_DSN=your_sentry_dsn
VITE_POSTHOG_KEY=your_posthog_key

# Feature Flags
VITE_ENABLE_OFFLINE_MODE=true
VITE_ENABLE_PHOTO_ENHANCEMENT=true
VITE_ENABLE_TEAM_INSTALLS=true
```
# SPECGUARD - Master Antigravity Prompt (Part 2)
## Feature Specifications & Implementation Details

---

# 📱 FEATURE SPECIFICATION: OFFLINE-FIRST ARCHITECTURE

## Core Principle
**The technician's workflow must NEVER be interrupted or slowed down due to connectivity issues.**

## Login & Initial Sync

```typescript
// On successful authentication
async function handleLoginSuccess(user: User) {
  // 1. Check connectivity
  const connectivity = await testConnectivity();
  
  // 2. Sync site data
  if (connectivity.status !== 'offline') {
    await syncSiteData(user.branch_id);
  }
  
  // 3. Initialize offline storage
  await initializeOfflineDB();
  
  // 4. Load cached data if sync failed
  if (!hasFreshData()) {
    await loadCachedData();
    showCachedModeWarning();
  }
  
  // 5. Start background sync listener
  startSyncQueueProcessor();
}
```

## Data to Cache on Login

```typescript
interface CachedSiteData {
  trailers: Trailer[];           // All trailers for this branch
  installationTemplates: Template[]; // Phase/step configurations
  validationRules: ValidationRule[]; // IMEI, MAC, VIN patterns
  deviceInventory: Device[];     // Available devices
  pendingInstalls: Installation[]; // Resume capability
  userProfile: UserProfile;      // Preferences, language
  lastSyncTimestamp: string;
}
```

## IndexedDB Schema (Dexie.js)

```typescript
// src/lib/offline/db.ts
import Dexie, { Table } from 'dexie';

interface PendingInstallation {
  local_id: string;
  asset_id: string;
  installation_type: 'solo' | 'team';
  work_selected: object;
  steps_completed: object;
  started_at: string;
  status: 'in_progress' | 'ready_to_sync' | 'syncing' | 'synced' | 'failed';
  sync_attempts: number;
  last_sync_attempt?: string;
  error_message?: string;
}

interface PendingPhoto {
  local_id: string;
  installation_local_id: string;
  step_id: string;
  photo_type: string;
  blob: Blob;
  thumbnail_blob: Blob;
  original_format: string;
  captured_at: string;
  upload_status: 'pending' | 'uploading' | 'uploaded' | 'failed';
  upload_attempts: number;
}

class SpecguardDB extends Dexie {
  trailers!: Table<Trailer>;
  pendingInstallations!: Table<PendingInstallation>;
  pendingPhotos!: Table<PendingPhoto>;
  syncStatus!: Table<SyncStatus>;
  validationRules!: Table<ValidationRule>;
  templates!: Table<Template>;

  constructor() {
    super('specguard_offline_db');
    this.version(1).stores({
      trailers: 'asset_id, branch_id, status, device_type',
      pendingInstallations: 'local_id, asset_id, status, created_at',
      pendingPhotos: 'local_id, installation_local_id, step_id, upload_status',
      syncStatus: 'id',
      validationRules: 'rule_type',
      templates: 'template_id'
    });
  }
}

export const db = new SpecguardDB();
```

## Background Sync Queue Manager

```typescript
// src/lib/offline/syncQueue.ts
class SyncQueueManager {
  private isProcessing = false;
  private retryDelays = [1000, 5000, 15000, 60000, 300000]; // Exponential backoff

  constructor() {
    // Listen for online/offline events
    window.addEventListener('online', () => this.processQueue());
    
    // Periodic check every 30 seconds
    setInterval(() => this.processQueue(), 30000);
    
    // Idle detection for 2-hour auto-sync
    this.setupIdleDetection();
  }

  async enqueue(item: SyncItem): Promise<void> {
    await db.pendingInstallations.add(item);
    this.processQueue();
  }

  async processQueue(): Promise<void> {
    if (this.isProcessing || !navigator.onLine) return;
    
    this.isProcessing = true;
    
    try {
      // Sync installations first (priority 1)
      const pendingInstalls = await db.pendingInstallations
        .where('status')
        .equals('ready_to_sync')
        .toArray();
      
      for (const install of pendingInstalls) {
        await this.syncInstallation(install);
      }
      
      // Then sync photos (priority 2)
      const pendingPhotos = await db.pendingPhotos
        .where('upload_status')
        .equals('pending')
        .toArray();
      
      for (const photo of pendingPhotos) {
        await this.syncPhoto(photo);
      }
      
    } finally {
      this.isProcessing = false;
    }
  }

  private setupIdleDetection(): void {
    let lastActivity = Date.now();
    const idleThreshold = 2 * 60 * 60 * 1000; // 2 hours

    ['click', 'touch', 'keypress', 'scroll'].forEach(event => {
      document.addEventListener(event, () => {
        lastActivity = Date.now();
      });
    });

    setInterval(async () => {
      if (Date.now() - lastActivity >= idleThreshold) {
        const pendingCount = await this.getPendingCount();
        if (pendingCount > 0 && navigator.onLine) {
          console.log('Idle sync triggered');
          await this.processQueue();
        }
      }
    }, 5 * 60 * 1000); // Check every 5 minutes
  }
}

export const syncQueue = new SyncQueueManager();
```

## Connectivity Test Function

```typescript
// src/lib/connectivity.ts
interface ConnectivityResult {
  status: 'good' | 'fair' | 'poor' | 'offline';
  latency_ms: number;
  download_mbps: number;
  upload_mbps: number;
  recommended_mode: 'online' | 'cached';
  warnings: string[];
}

export async function runConnectivityTest(): Promise<ConnectivityResult> {
  const result: ConnectivityResult = {
    status: 'offline',
    latency_ms: 0,
    download_mbps: 0,
    upload_mbps: 0,
    recommended_mode: 'cached',
    warnings: []
  };

  if (!navigator.onLine) {
    result.warnings.push('Device is offline');
    return result;
  }

  try {
    // Latency test
    const pingStart = performance.now();
    await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/`, { method: 'HEAD' });
    result.latency_ms = Math.round(performance.now() - pingStart);

    // Download test (100KB file)
    const downloadStart = performance.now();
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/test/speed-test.bin`);
    const blob = await response.blob();
    const downloadTime = (performance.now() - downloadStart) / 1000;
    result.download_mbps = Math.round((blob.size * 8 / 1000000) / downloadTime * 100) / 100;

    // Evaluate
    if (result.latency_ms < 200 && result.download_mbps > 1) {
      result.status = 'good';
      result.recommended_mode = 'online';
    } else if (result.latency_ms < 500 && result.download_mbps > 0.5) {
      result.status = 'fair';
      result.recommended_mode = 'online';
      result.warnings.push('Connection is slow - photos may take longer to upload');
    } else {
      result.status = 'poor';
      result.recommended_mode = 'cached';
      result.warnings.push('Poor connection - working in cached mode');
    }

  } catch (error) {
    result.status = 'offline';
    result.warnings.push('Could not connect to server');
  }

  return result;
}
```

## Logout Sync Check

```typescript
// src/hooks/useAuth.ts
async function handleLogout(): Promise<void> {
  const pendingInstalls = await db.pendingInstallations
    .where('status')
    .anyOf(['in_progress', 'ready_to_sync'])
    .count();
  
  const pendingPhotos = await db.pendingPhotos
    .where('upload_status')
    .equals('pending')
    .count();

  const totalPending = pendingInstalls + pendingPhotos;

  if (totalPending > 0) {
    const action = await showDialog({
      title: '⚠️ Pending Uploads',
      message: `You have ${totalPending} items waiting to sync:\n` +
               `• ${pendingInstalls} installation records\n` +
               `• ${pendingPhotos} photos\n\n` +
               `These may be lost if you log out now.`,
      actions: [
        { label: 'Try Sync Now', value: 'sync', primary: true },
        { label: 'Logout Anyway', value: 'logout', danger: true },
        { label: 'Cancel', value: 'cancel' }
      ]
    });

    if (action === 'sync') {
      await syncQueue.processQueue();
      // Re-check and show results
      return handleLogout();
    } else if (action === 'logout') {
      // Preserve data for next session
      await preserveSessionData();
      await performLogout();
    }
    // Cancel - do nothing
  } else {
    await performLogout();
  }
}
```

---

# 📸 FEATURE SPECIFICATION: PHOTO HANDLING & ENHANCEMENT

## Photo Capture (No Real-Time Upload)

```typescript
// src/hooks/usePhotoCapture.ts
export function usePhotoCapture() {
  const capturePhoto = async (
    stepId: string,
    photoType: string,
    installationLocalId: string
  ): Promise<PhotoCaptureResult> => {
    
    // 1. Capture from camera
    const blob = await captureFromCamera();
    
    // 2. Generate thumbnail for UI display
    const thumbnailBlob = await generateThumbnail(blob, 200);
    
    // 3. Store in IndexedDB (NOT uploaded yet)
    const photoRecord: PendingPhoto = {
      local_id: generateUUID(),
      installation_local_id: installationLocalId,
      step_id: stepId,
      photo_type: photoType,
      blob: blob,
      thumbnail_blob: thumbnailBlob,
      original_format: detectFormat(blob), // 'HEIC' or 'JPEG'
      captured_at: new Date().toISOString(),
      upload_status: 'pending',
      upload_attempts: 0
    };
    
    await db.pendingPhotos.add(photoRecord);
    
    // 4. Return thumbnail URL for immediate display
    return {
      localId: photoRecord.local_id,
      thumbnailUrl: URL.createObjectURL(thumbnailBlob),
      status: 'captured'
    };
  };

  return { capturePhoto };
}
```

## Backend Photo Processing (Supabase Edge Function)

```typescript
// supabase/functions/process-photo/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import sharp from 'npm:sharp';

serve(async (req) => {
  const formData = await req.formData();
  const file = formData.get('photo') as File;
  const photoType = formData.get('photo_type') as string;
  
  let buffer = Buffer.from(await file.arrayBuffer());
  const enhancements: string[] = [];
  const warnings: string[] = [];

  // 1. Convert HEIC if needed
  if (file.name.toLowerCase().includes('.heic') || file.type === 'image/heic') {
    buffer = await convertHeicToJpeg(buffer);
    enhancements.push('heic_converted');
  }

  // 2. Analyze image quality
  const metrics = await analyzeImage(buffer);

  // 3. Apply auto-enhancements
  let processor = sharp(buffer);

  // Brightness correction
  if (metrics.brightness < 40) {
    processor = processor.modulate({ brightness: 1.5 });
    enhancements.push('brightness_high');
  } else if (metrics.brightness < 70) {
    processor = processor.modulate({ brightness: 1.25 });
    enhancements.push('brightness_moderate');
  }

  // Contrast enhancement
  if (metrics.contrast < 50) {
    processor = processor.normalize();
    enhancements.push('contrast_enhanced');
  }

  // Sharpening (especially for OCR photos)
  const ocrTypes = ['vin', 'sticker', 'imei', 'mac', 'label'];
  if (ocrTypes.includes(photoType)) {
    if (metrics.sharpness < 100) {
      processor = processor.sharpen({ sigma: 2 });
      enhancements.push('sharpen_high');
      warnings.push('Image was blurry - OCR accuracy may be affected');
    } else if (metrics.sharpness < 200) {
      processor = processor.sharpen({ sigma: 1.5 });
      enhancements.push('sharpen_moderate');
    }
  }

  // 4. Output optimized JPEG
  const enhanced = await processor
    .jpeg({ quality: 85, mozjpeg: true })
    .toBuffer();

  // 5. Generate thumbnail
  const thumbnail = await sharp(enhanced)
    .resize(200, 200, { fit: 'cover' })
    .jpeg({ quality: 70 })
    .toBuffer();

  // 6. Upload to storage
  const timestamp = Date.now();
  const enhancedPath = `enhanced/${timestamp}.jpg`;
  const thumbnailPath = `thumbnails/${timestamp}.jpg`;
  
  // ... upload to Supabase Storage ...

  return new Response(JSON.stringify({
    success: true,
    enhanced_url: enhancedUrl,
    thumbnail_url: thumbnailUrl,
    enhancements_applied: enhancements,
    quality_metrics: metrics,
    warnings
  }));
});
```

---

# 👥 FEATURE SPECIFICATION: TEAM INSTALLATION WORKFLOW

## Installation Type Selection

```typescript
// src/components/installation/InstallTypeSelector.tsx
interface InstallTypeProps {
  trailer: Trailer;
  onSelect: (type: 'solo' | 'team') => void;
}

export function InstallTypeSelector({ trailer, onSelect }: InstallTypeProps) {
  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-xl font-bold">{trailer.asset_id}</h2>
        <p className="text-gray-500">Device: {trailer.device_type}</p>
      </div>

      <button
        onClick={() => onSelect('solo')}
        className="w-full p-6 border-2 rounded-lg hover:border-blue-500"
      >
        <h3 className="text-lg font-semibold">Solo Installation</h3>
        <p className="text-sm text-gray-500">I'm doing all phases myself</p>
      </button>

      <button
        onClick={() => onSelect('team')}
        className="w-full p-6 border-2 rounded-lg hover:border-blue-500"
      >
        <h3 className="text-lg font-semibold">Team Installation</h3>
        <p className="text-sm text-gray-500">Multiple techs working together</p>
      </button>
    </div>
  );
}
```

## Phase/Step Selection for Team Install

```typescript
// src/components/installation/TeamWorkSelector.tsx
interface WorkSelectorProps {
  trailer: Trailer;
  existingProgress: InstallationProgress;
  onStartWork: (selectedWork: SelectedWork) => void;
}

export function TeamWorkSelector({ trailer, existingProgress, onStartWork }: WorkSelectorProps) {
  const [selectedSteps, setSelectedSteps] = useState<string[]>([]);
  const phases = useInstallationTemplate(trailer.device_type);

  const toggleStep = (stepId: string) => {
    if (existingProgress.completedSteps.includes(stepId)) {
      return; // Already done by another tech
    }
    setSelectedSteps(prev => 
      prev.includes(stepId) 
        ? prev.filter(s => s !== stepId)
        : [...prev, stepId]
    );
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Select Your Work</h2>
      
      {phases.map(phase => (
        <div key={phase.id} className="border rounded-lg p-4">
          <h3 className="font-semibold flex items-center gap-2">
            <ChevronDown size={20} />
            Phase {phase.number}: {phase.name}
          </h3>
          
          <div className="ml-6 mt-2 space-y-2">
            {phase.steps.map(step => {
              const isDone = existingProgress.completedSteps.includes(step.id);
              const doneBy = existingProgress.stepAssignments[step.id];
              
              return (
                <label 
                  key={step.id}
                  className={`flex items-center gap-3 p-2 rounded ${
                    isDone ? 'bg-gray-100 text-gray-400' : 'hover:bg-blue-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedSteps.includes(step.id) || isDone}
                    disabled={isDone}
                    onChange={() => toggleStep(step.id)}
                  />
                  <span>{step.id} {step.name}</span>
                  {isDone && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                      ✓ {doneBy}
                    </span>
                  )}
                </label>
              );
            })}
          </div>
        </div>
      ))}

      <button
        onClick={() => onStartWork({ type: 'steps', steps: selectedSteps })}
        disabled={selectedSteps.length === 0}
        className="w-full py-4 bg-blue-600 text-white rounded-lg font-semibold disabled:opacity-50"
      >
        Start Selected Work ({selectedSteps.length} items)
      </button>
    </div>
  );
}
```

## Verification Scan (Required for Team Closeout)

```typescript
// src/components/installation/VerificationScan.tsx
export function VerificationScan({ 
  installationId, 
  existingData,
  onComplete 
}: VerificationScanProps) {
  const [photos, setPhotos] = useState<VerificationPhotos>({
    labels: null,
    vin_closeup: null,
    overall: null
  });
  const [crossCheckResult, setCrossCheckResult] = useState<CrossCheckResult | null>(null);

  const handleCapture = async (type: keyof VerificationPhotos) => {
    const result = await capturePhoto();
    setPhotos(prev => ({ ...prev, [type]: result }));
  };

  const runCrossCheck = async () => {
    // OCR the captured photos
    const ocrResults = await runOCR(photos);
    
    // Compare against existing DB record
    const discrepancies: Discrepancy[] = [];
    
    if (normalize(ocrResults.imei) !== normalize(existingData.imei)) {
      discrepancies.push({
        field: 'IMEI',
        scanned: ocrResults.imei,
        existing: existingData.imei,
        severity: 'high'
      });
    }
    
    if (normalize(ocrResults.mac) !== normalize(existingData.mac)) {
      discrepancies.push({
        field: 'MAC',
        scanned: ocrResults.mac,
        existing: existingData.mac,
        severity: 'high'
      });
    }
    
    if (normalize(ocrResults.vin) !== normalize(existingData.vin)) {
      discrepancies.push({
        field: 'VIN',
        scanned: ocrResults.vin,
        existing: existingData.vin,
        severity: 'critical'
      });
    }

    setCrossCheckResult({
      passed: discrepancies.length === 0,
      discrepancies,
      timestamp: new Date().toISOString()
    });

    if (discrepancies.length === 0) {
      onComplete({ photos, crossCheck: crossCheckResult });
    }
  };

  const allPhotosCaptured = photos.labels && photos.vin_closeup && photos.overall;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Verification Scan Required</h2>
      <p className="text-gray-600">
        Before closing out, capture verification photos to confirm installation data.
      </p>

      <div className="grid grid-cols-2 gap-4">
        <PhotoCaptureButton
          label="Labels Close-up"
          captured={!!photos.labels}
          onCapture={() => handleCapture('labels')}
        />
        <PhotoCaptureButton
          label="VIN Close-up"
          captured={!!photos.vin_closeup}
          onCapture={() => handleCapture('vin_closeup')}
        />
        <div className="col-span-2">
          <PhotoCaptureButton
            label="Overall VIN Plate + Stickers"
            captured={!!photos.overall}
            onCapture={() => handleCapture('overall')}
          />
        </div>
      </div>

      {crossCheckResult && !crossCheckResult.passed && (
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
          <h3 className="font-semibold text-yellow-800">⚠️ Data Discrepancy Detected</h3>
          <ul className="mt-2 space-y-1">
            {crossCheckResult.discrepancies.map((d, i) => (
              <li key={i} className="text-sm">
                <strong>{d.field}:</strong> Scanned "{d.scanned}" vs Expected "{d.existing}"
              </li>
            ))}
          </ul>
          <p className="mt-2 text-sm">
            You can proceed, but this will be flagged for QC review.
          </p>
        </div>
      )}

      <button
        onClick={runCrossCheck}
        disabled={!allPhotosCaptured}
        className="w-full py-4 bg-blue-600 text-white rounded-lg font-semibold disabled:opacity-50"
      >
        Verify & Continue
      </button>
    </div>
  );
}
```

## Installation Completion Logic

```typescript
// src/lib/installation.ts
export async function checkInstallationComplete(
  assetId: string
): Promise<{ complete: boolean; missingSteps: string[] }> {
  
  const requiredSteps = [
    '1.1', '1.2', '1.3', '1.4',  // Phase 1
    '2.1', '2.2', '2.3', '2.4',  // Phase 2
    '3.1', '3.2'                  // Phase 3 (3.3 is Tech Assist, 3.4 is optional)
  ];

  // Get all installation records for this asset
  const { data: records } = await supabase
    .from('installation_records')
    .select('steps_completed, tech_assist_photo_url')
    .eq('asset_id', assetId);

  // Aggregate all completed steps
  const completedSteps = new Set<string>();
  let hasTechAssist = false;

  records?.forEach(record => {
    record.steps_completed?.forEach((step: string) => {
      completedSteps.add(step);
    });
    if (record.tech_assist_photo_url) {
      hasTechAssist = true;
    }
  });

  const missingSteps = requiredSteps.filter(step => !completedSteps.has(step));
  
  if (!hasTechAssist) {
    missingSteps.push('Tech Assist Screenshot');
  }

  return {
    complete: missingSteps.length === 0,
    missingSteps
  };
}
```

---

# ⏱️ FEATURE SPECIFICATION: CYCLE TIME & KPI TRACKING

## Cycle Time Calculations

```typescript
// src/lib/utils/cycleTime.ts

// For reporting on a specific trailer
export async function getTrailerCycleTime(assetId: string): Promise<TrailerCycleTime> {
  const { data: records } = await supabase
    .from('installation_records')
    .select('*')
    .eq('asset_id', assetId)
    .order('started_at', { ascending: true });

  if (!records || records.length === 0) {
    return null;
  }

  const firstStart = new Date(records[0].started_at);
  const lastComplete = new Date(records[records.length - 1].completed_at);
  const totalMinutes = (lastComplete.getTime() - firstStart.getTime()) / 60000;

  const techBreakdown = records.map(r => ({
    technician_id: r.technician_id,
    technician_name: r.technician_name,
    work_performed: r.work_selected,
    cycle_time_minutes: r.cycle_time_seconds / 60,
    started_at: r.started_at,
    completed_at: r.completed_at
  }));

  return {
    asset_id: assetId,
    total_cycle_minutes: totalMinutes,
    installation_type: records.length === 1 ? 'solo' : `team (${records.length} techs)`,
    technician_breakdown: techBreakdown,
    started_at: firstStart.toISOString(),
    completed_at: lastComplete.toISOString()
  };
}

// For reporting on a specific technician
export async function getTechnicianPerformance(
  technicianId: string,
  dateRange: DateRange
): Promise<TechnicianPerformance> {
  const { data: records } = await supabase
    .from('installation_records')
    .select('*')
    .eq('technician_id', technicianId)
    .gte('completed_at', dateRange.start)
    .lte('completed_at', dateRange.end);

  const soloInstalls = records?.filter(r => r.installation_type === 'solo') || [];
  const teamContributions = records?.filter(r => r.installation_type === 'team') || [];

  // Calculate average times by work type
  const workTypeStats = new Map<string, { count: number; totalTime: number }>();
  
  records?.forEach(r => {
    const workType = categorizeWork(r.work_selected);
    const existing = workTypeStats.get(workType) || { count: 0, totalTime: 0 };
    workTypeStats.set(workType, {
      count: existing.count + 1,
      totalTime: existing.totalTime + (r.cycle_time_seconds / 60)
    });
  });

  return {
    technician_id: technicianId,
    period: dateRange,
    solo_installs: {
      count: soloInstalls.length,
      avg_minutes: average(soloInstalls.map(r => r.cycle_time_seconds / 60))
    },
    team_contributions: {
      count: teamContributions.length,
      avg_minutes: average(teamContributions.map(r => r.cycle_time_seconds / 60))
    },
    work_type_breakdown: Object.fromEntries(workTypeStats)
  };
}
```

## KPI Configuration

```sql
-- supabase/migrations/005_kpi_config.sql
CREATE TABLE installation_kpis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kpi_name VARCHAR(100) NOT NULL,
  kpi_type VARCHAR(50) NOT NULL, -- 'solo_total', 'team_total', 'phase', 'step'
  target_minutes INTEGER NOT NULL,
  warning_minutes INTEGER,
  critical_minutes INTEGER,
  applies_to JSONB, -- {"phases": ["1","2","3"]} or {"steps": ["3.1", "3.2"]}
  branch_id UUID REFERENCES branches(id), -- NULL = all branches
  device_type VARCHAR(50), -- NULL = all devices
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Default KPIs
INSERT INTO installation_kpis (kpi_name, kpi_type, target_minutes, warning_minutes, critical_minutes, applies_to) VALUES
('Solo Full Install', 'solo_total', 45, 50, 60, '{"phases": ["1","2","3"]}'),
('Team Full Install', 'team_total', 35, 40, 50, '{"phases": ["1","2","3"]}'),
('Documentation Phase', 'phase', 10, 12, 15, '{"phases": ["1"]}'),
('Undercarriage Phase', 'phase', 20, 25, 30, '{"phases": ["2"]}'),
('External Components', 'phase', 15, 18, 22, '{"phases": ["3"]}');
```

---

# 🔐 FEATURE SPECIFICATION: ROW LEVEL SECURITY

## CRITICAL: Enable RLS on All Tables

```sql
-- supabase/migrations/003_enable_rls.sql

-- Enable RLS
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE trailers ENABLE ROW LEVEL SECURITY;
ALTER TABLE installation_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE installation_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE scan_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE eos_reports ENABLE ROW LEVEL SECURITY;
-- ... all other tables

-- Technician policies
CREATE POLICY "Technicians can view trailers at their branch"
  ON trailers FOR SELECT
  USING (branch_id IN (
    SELECT branch_id FROM profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Technicians can create installation records"
  ON installation_records FOR INSERT
  WITH CHECK (technician_id = auth.uid());

CREATE POLICY "Technicians can view own installation records"
  ON installation_records FOR SELECT
  USING (
    technician_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('manager', 'admin', 'pct')
    )
  );

-- Manager policies
CREATE POLICY "Managers can view branch data"
  ON installation_records FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      JOIN branches b ON b.manager_id = p.id
      WHERE p.id = auth.uid()
      AND installation_records.branch_id = b.id
    )
  );

-- PCT policies (read-only access to all installation data)
CREATE POLICY "PCT can view all installations"
  ON installation_records FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'pct'
    )
  );

-- Admin policies (full access)
CREATE POLICY "Admins have full access"
  ON installation_records FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

---

# 🌐 FEATURE SPECIFICATION: MULTI-LANGUAGE SUPPORT

## i18n Configuration

```typescript
// src/i18n/i18n.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './en.json';
import es from './es.json';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      es: { translation: es }
    },
    lng: 'en', // Default
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
```

```json
// src/i18n/en.json
{
  "common": {
    "submit": "Submit",
    "cancel": "Cancel",
    "save": "Save",
    "next": "Next",
    "back": "Back",
    "loading": "Loading...",
    "error": "Error",
    "success": "Success"
  },
  "installation": {
    "title": "Perform Installation",
    "solo": "Solo Installation",
    "team": "Team Installation",
    "soloDesc": "I'm doing all phases myself",
    "teamDesc": "Multiple techs working together",
    "phase1": "Phase 1: Documentation",
    "phase2": "Phase 2: Undercarriage",
    "phase3": "Phase 3: External Components",
    "selectWork": "Select Your Work",
    "startWork": "Start Selected Work",
    "verificationRequired": "Verification Scan Required",
    "techAssist": "Tech Assist Screenshot",
    "delayNotes": "Delay Notes"
  },
  "sync": {
    "status": "Sync Status",
    "pending": "Pending",
    "syncing": "Syncing...",
    "synced": "All Synced",
    "offline": "Offline Mode",
    "lastSync": "Last sync"
  },
  "validation": {
    "vinInvalid": "Invalid VIN format",
    "imeiInvalid": "Invalid IMEI format",
    "macInvalid": "Invalid MAC address format",
    "photoRequired": "Photo is required"
  }
}
```

```json
// src/i18n/es.json
{
  "common": {
    "submit": "Enviar",
    "cancel": "Cancelar",
    "save": "Guardar",
    "next": "Siguiente",
    "back": "Atrás",
    "loading": "Cargando...",
    "error": "Error",
    "success": "Éxito"
  },
  "installation": {
    "title": "Realizar Instalación",
    "solo": "Instalación Individual",
    "team": "Instalación en Equipo",
    "soloDesc": "Estoy haciendo todas las fases yo mismo",
    "teamDesc": "Múltiples técnicos trabajando juntos",
    "phase1": "Fase 1: Documentación",
    "phase2": "Fase 2: Debajo del Remolque",
    "phase3": "Fase 3: Componentes Externos",
    "selectWork": "Seleccione Su Trabajo",
    "startWork": "Iniciar Trabajo Seleccionado",
    "verificationRequired": "Escaneo de Verificación Requerido",
    "techAssist": "Captura de Tech Assist",
    "delayNotes": "Notas de Retraso"
  },
  "sync": {
    "status": "Estado de Sincronización",
    "pending": "Pendiente",
    "syncing": "Sincronizando...",
    "synced": "Todo Sincronizado",
    "offline": "Modo Sin Conexión",
    "lastSync": "Última sincronización"
  },
  "validation": {
    "vinInvalid": "Formato de VIN inválido",
    "imeiInvalid": "Formato de IMEI inválido",
    "macInvalid": "Formato de dirección MAC inválido",
    "photoRequired": "Se requiere foto"
  }
}
```
# SPECGUARD - Master Antigravity Prompt (Part 3)
## Database Schema, Automation & Implementation Priorities

---

# 🗄️ DATABASE SCHEMA

## Core Tables (New/Updated)

### installation_records (NEW - Supports Team Installs)

```sql
-- supabase/migrations/002_installation_records.sql

CREATE TABLE installation_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Trailer Reference
  asset_id VARCHAR(50) NOT NULL,
  trailer_id UUID REFERENCES trailers(id),
  branch_id UUID REFERENCES branches(id) NOT NULL,
  
  -- Installation Classification
  installation_type VARCHAR(10) NOT NULL CHECK (installation_type IN ('solo', 'team')),
  installation_group_id UUID, -- Links all records for same trailer install session
  
  -- Technician Info
  technician_id UUID REFERENCES profiles(id) NOT NULL,
  technician_name VARCHAR(100),
  
  -- Work Selection
  work_selected JSONB NOT NULL,
  -- Examples:
  -- Solo: {"type": "full", "phases": ["1", "2", "3"]}
  -- Team: {"type": "partial", "steps": ["1.1", "1.2", "2.1", "2.2"]}
  
  steps_completed JSONB DEFAULT '[]'::jsonb,
  
  -- Timing (NO visible timer - tracked in background)
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  cycle_time_seconds INTEGER GENERATED ALWAYS AS (
    CASE WHEN completed_at IS NOT NULL 
      THEN EXTRACT(EPOCH FROM (completed_at - started_at))::INTEGER
      ELSE NULL
    END
  ) STORED,
  
  -- Status
  status VARCHAR(20) DEFAULT 'in_progress' CHECK (
    status IN ('in_progress', 'partial', 'complete', 'cancelled')
  ),
  
  -- Verification Scan (REQUIRED for team installs)
  verification_scan JSONB,
  -- Structure:
  -- {
  --   "labels_photo_url": "...",
  --   "vin_closeup_url": "...",
  --   "overall_photo_url": "...",
  --   "ocr_results": {
  --     "imei": "...",
  --     "mac": "...",
  --     "vin": "..."
  --   },
  --   "cross_check": {
  --     "passed": true/false,
  --     "discrepancies": [],
  --     "timestamp": "..."
  --   }
  -- }
  
  -- Tech Assist (only for final closeout)
  is_final_closeout BOOLEAN DEFAULT FALSE,
  tech_assist_photo_url TEXT,
  
  -- Delay Documentation
  delay_notes TEXT,
  
  -- Device Info (captured during install)
  device_imei VARCHAR(20),
  device_mac VARCHAR(20),
  device_model VARCHAR(50),
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  synced_from_offline BOOLEAN DEFAULT FALSE,
  offline_created_at TIMESTAMPTZ,
  
  -- Constraints
  CONSTRAINT team_closeout_requires_verification CHECK (
    installation_type = 'solo' 
    OR status = 'in_progress'
    OR verification_scan IS NOT NULL
  )
);

-- Indexes for performance
CREATE INDEX idx_records_asset ON installation_records(asset_id);
CREATE INDEX idx_records_group ON installation_records(installation_group_id);
CREATE INDEX idx_records_tech ON installation_records(technician_id);
CREATE INDEX idx_records_branch ON installation_records(branch_id);
CREATE INDEX idx_records_status ON installation_records(status);
CREATE INDEX idx_records_date ON installation_records(completed_at);

-- Trigger to update timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER installation_records_updated
  BEFORE UPDATE ON installation_records
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

### installation_photos (NEW - With Enhancement Metadata)

```sql
CREATE TABLE installation_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  installation_record_id UUID REFERENCES installation_records(id) ON DELETE CASCADE,
  step_id VARCHAR(10) NOT NULL,
  photo_type VARCHAR(50) NOT NULL,
  
  -- URLs
  original_url TEXT,
  enhanced_url TEXT NOT NULL,
  thumbnail_url TEXT,
  
  -- Quality Metrics
  original_brightness DECIMAL(5,2),
  original_contrast DECIMAL(5,2),
  original_sharpness DECIMAL(8,2),
  final_brightness DECIMAL(5,2),
  final_contrast DECIMAL(5,2),
  final_sharpness DECIMAL(8,2),
  
  -- Enhancement Tracking
  enhancements_applied TEXT[],
  processing_warnings TEXT[],
  
  -- OCR Results (if applicable)
  ocr_extracted_text TEXT,
  ocr_confidence DECIMAL(5,2),
  ocr_fields JSONB, -- {"imei": "...", "mac": "...", "vin": "..."}
  
  -- Metadata
  original_format VARCHAR(10),
  original_file_size INTEGER,
  enhanced_file_size INTEGER,
  captured_at TIMESTAMPTZ,
  processed_at TIMESTAMPTZ DEFAULT NOW(),
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_photos_record ON installation_photos(installation_record_id);
CREATE INDEX idx_photos_type ON installation_photos(photo_type);
```

### sync_queue (NEW - Offline Sync Tracking)

```sql
CREATE TABLE sync_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) NOT NULL,
  
  -- Item Details
  item_type VARCHAR(50) NOT NULL, -- 'installation', 'photo', 'scan_log'
  local_id VARCHAR(100) NOT NULL,
  payload JSONB NOT NULL,
  
  -- Status
  status VARCHAR(20) DEFAULT 'pending' CHECK (
    status IN ('pending', 'processing', 'completed', 'failed')
  ),
  
  -- Retry Tracking
  attempts INTEGER DEFAULT 0,
  last_attempt_at TIMESTAMPTZ,
  next_retry_at TIMESTAMPTZ,
  error_message TEXT,
  
  -- Priority
  priority INTEGER DEFAULT 5, -- 1 = highest, 10 = lowest
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX idx_sync_queue_user ON sync_queue(user_id);
CREATE INDEX idx_sync_queue_status ON sync_queue(status);
CREATE INDEX idx_sync_queue_priority ON sync_queue(priority, created_at);
```

### Update trailers Table

```sql
-- Add computed installation status
ALTER TABLE trailers ADD COLUMN IF NOT EXISTS 
  install_status VARCHAR(20) DEFAULT 'not_started' CHECK (
    install_status IN ('not_started', 'partial', 'complete')
  );

ALTER TABLE trailers ADD COLUMN IF NOT EXISTS 
  install_completed_at TIMESTAMPTZ;

ALTER TABLE trailers ADD COLUMN IF NOT EXISTS 
  install_tech_count INTEGER DEFAULT 0;

-- Function to update trailer status based on installation records
CREATE OR REPLACE FUNCTION update_trailer_install_status()
RETURNS TRIGGER AS $$
DECLARE
  completed_steps TEXT[];
  required_steps TEXT[] := ARRAY[
    '1.1', '1.2', '1.3', '1.4',
    '2.1', '2.2', '2.3', '2.4',
    '3.1', '3.2'
  ];
  has_tech_assist BOOLEAN;
  tech_count INTEGER;
BEGIN
  -- Get all completed steps for this trailer
  SELECT 
    array_agg(DISTINCT step),
    bool_or(tech_assist_photo_url IS NOT NULL),
    COUNT(DISTINCT technician_id)
  INTO completed_steps, has_tech_assist, tech_count
  FROM installation_records,
       jsonb_array_elements_text(steps_completed) AS step
  WHERE asset_id = NEW.asset_id
    AND status IN ('partial', 'complete');
  
  -- Update trailer status
  IF completed_steps @> required_steps AND has_tech_assist THEN
    UPDATE trailers SET 
      install_status = 'complete',
      install_completed_at = NOW(),
      install_tech_count = tech_count
    WHERE asset_id = NEW.asset_id;
  ELSIF array_length(completed_steps, 1) > 0 THEN
    UPDATE trailers SET 
      install_status = 'partial',
      install_tech_count = tech_count
    WHERE asset_id = NEW.asset_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_trailer_status_on_install
  AFTER INSERT OR UPDATE ON installation_records
  FOR EACH ROW EXECUTE FUNCTION update_trailer_install_status();
```

---

# 🔄 N8N WORKFLOW SPECIFICATIONS

## Workflow 1: Daily Installation Report

**Trigger:** Schedule - Daily at 6:00 AM
**Recipients:** PCT, Xtra Lease stakeholders

```json
{
  "name": "Daily Installation Report",
  "trigger": {
    "type": "schedule",
    "cron": "0 6 * * *"
  },
  "steps": [
    {
      "name": "Query Yesterday's Installations",
      "type": "supabase",
      "action": "select",
      "query": "SELECT ... FROM installation_records WHERE completed_at >= yesterday"
    },
    {
      "name": "Calculate Metrics",
      "type": "function",
      "code": "calculateDailyMetrics(installations)"
    },
    {
      "name": "Generate Report HTML",
      "type": "template",
      "template": "daily-report-template.html"
    },
    {
      "name": "Send via Resend",
      "type": "resend",
      "to": ["pct@phillipsconnect.com", "reports@xtralease.com"],
      "subject": "Daily Installation Report - {{date}}"
    }
  ]
}
```

## Workflow 2: Sync Failure Alert

**Trigger:** Schedule - Every hour
**Recipients:** MIS Admin

```json
{
  "name": "Sync Failure Alert",
  "trigger": {
    "type": "schedule",
    "cron": "0 * * * *"
  },
  "steps": [
    {
      "name": "Check for Stale Pending Items",
      "type": "supabase",
      "query": "SELECT * FROM sync_queue WHERE status = 'pending' AND created_at < NOW() - INTERVAL '24 hours'"
    },
    {
      "name": "If Items Found",
      "type": "condition",
      "condition": "items.length > 0"
    },
    {
      "name": "Send Alert",
      "type": "resend",
      "to": ["admin@mis-solutions.com"],
      "subject": "⚠️ SPECGUARD: {{count}} items stuck in sync queue",
      "urgency": "high"
    }
  ]
}
```

## Workflow 3: End-of-Shift Report Generator

**Trigger:** Webhook (triggered by manager)
**Recipients:** Branch manager, MIS management

```json
{
  "name": "EOS Report Generator",
  "trigger": {
    "type": "webhook",
    "path": "/generate-eos-report"
  },
  "steps": [
    {
      "name": "Get Shift Data",
      "type": "supabase",
      "query": "Get installations, delays, scan logs for branch and date"
    },
    {
      "name": "Calculate Performance Metrics",
      "type": "function",
      "code": "calculateEOSMetrics(data)"
    },
    {
      "name": "AI Summary Generation",
      "type": "openai",
      "prompt": "Generate EOS summary from: {{metrics}}"
    },
    {
      "name": "Save Report",
      "type": "supabase",
      "action": "insert",
      "table": "eos_reports"
    },
    {
      "name": "Send Report",
      "type": "resend",
      "to": ["{{manager_email}}", "operations@mis-solutions.com"]
    }
  ]
}
```

## Workflow 4: PCT Data Import

**Trigger:** Webhook (file upload from PCT portal)

```json
{
  "name": "PCT Data Import",
  "trigger": {
    "type": "webhook",
    "path": "/pct-data-import"
  },
  "steps": [
    {
      "name": "Parse Excel File",
      "type": "spreadsheet",
      "action": "parse"
    },
    {
      "name": "Validate Data",
      "type": "function",
      "code": "validateTrailerData(rows)"
    },
    {
      "name": "Create Import Job",
      "type": "supabase",
      "action": "insert",
      "table": "jobs",
      "data": { "type": "import_trailers", "status": "pending" }
    },
    {
      "name": "Process in Batches",
      "type": "loop",
      "batchSize": 100,
      "action": "upsertTrailers"
    },
    {
      "name": "Update Job Status",
      "type": "supabase",
      "action": "update",
      "table": "jobs"
    },
    {
      "name": "Send Completion Notification",
      "type": "resend",
      "to": ["{{uploader_email}}"],
      "subject": "Data Import Complete - {{created}} created, {{updated}} updated"
    }
  ]
}
```

## Workflow 5: QC Failure Notification

**Trigger:** Database trigger (on QC fail)

```json
{
  "name": "QC Failure Notification",
  "trigger": {
    "type": "supabase_trigger",
    "table": "installation_records",
    "event": "UPDATE",
    "condition": "NEW.qc_status = 'failed'"
  },
  "steps": [
    {
      "name": "Get Installation Details",
      "type": "supabase",
      "query": "Get full installation with photos"
    },
    {
      "name": "Determine Severity",
      "type": "function",
      "code": "categorizeQCFailure(installation)"
    },
    {
      "name": "Send Alert",
      "type": "resend",
      "to": ["qc@phillipsconnect.com", "{{branch_manager}}"],
      "subject": "QC Alert: {{severity}} - Asset {{asset_id}}"
    },
    {
      "name": "Create Task for Remediation",
      "type": "supabase",
      "action": "insert",
      "table": "tasks",
      "data": {
        "title": "QC Remediation Required",
        "asset_id": "{{asset_id}}",
        "priority": "high"
      }
    }
  ]
}
```

---

# 📋 IMPLEMENTATION PRIORITIES

## Phase 1: Core Foundation (Week 1-2)

### P0 - Critical Path
1. **Database Schema Migration**
   - Create `installation_records` table
   - Create `installation_photos` table
   - Enable RLS on ALL tables
   - Set up indexes

2. **Authentication & Authorization**
   - Supabase Auth integration
   - Role-based routing
   - Auto-logout after 4 hours

3. **Basic Technician Flow**
   - Login → Dashboard → Scan Trailer → View Details
   - No installation workflow yet

### P1 - High Priority
4. **Offline Foundation**
   - IndexedDB setup with Dexie
   - Trailer cache on login
   - Online/offline status indicator

5. **Basic UI Components**
   - Layout with role-based navigation
   - Common form components
   - Photo capture component

---

## Phase 2: Installation Workflow (Week 3-4)

### P0 - Critical Path
1. **Solo Installation Flow**
   - Full 3-phase workflow
   - Photo capture at each step
   - Local storage of progress
   - Basic validation

2. **Photo Processing Pipeline**
   - Supabase Edge Function for enhancement
   - HEIC → JPEG conversion
   - Auto-brightness/contrast
   - Thumbnail generation

3. **Background Sync**
   - Sync queue manager
   - Retry logic with backoff
   - Sync status display

### P1 - High Priority
4. **Team Installation Flow**
   - Solo/Team selection
   - Phase/step selector
   - Verification scan requirement
   - Partial status tracking

5. **Validation Implementation**
   - VIN checksum validation
   - IMEI Luhn check
   - MAC format validation
   - OCR cross-check

---

## Phase 3: Reporting & Customer Portals (Week 5-6)

### P0 - Critical Path
1. **PCT Portal**
   - Dashboard with metrics
   - Installation reports
   - QC analysis view
   - Data upload interface

2. **Manager Portal**
   - Branch dashboard
   - EOS report generation
   - Task management
   - Performance reports

### P1 - High Priority
3. **Xtra Lease Portal**
   - Installation status view
   - Asset search
   - Compliance reports

4. **n8n Workflows**
   - Daily report automation
   - Sync failure alerts
   - EOS report generation

---

## Phase 4: Polish & Optimization (Week 7-8)

### P1 - High Priority
1. **Connectivity Test Function**
2. **Logout sync verification**
3. **2-hour idle auto-sync**
4. **Multi-language (Spanish)**

### P2 - Nice to Have
5. **KPI configuration UI**
6. **Advanced analytics**
7. **Push notifications**
8. **Photo export to device**

---

# ✅ ACCEPTANCE CRITERIA

## For MVP Launch

### Technician Experience
- [ ] Can log in and see assigned branch trailers
- [ ] Can perform solo installation with all 3 phases
- [ ] Can perform team installation with phase selection
- [ ] Installation works fully offline
- [ ] Photos sync in background when connected
- [ ] Receives warning before logout if sync pending
- [ ] Can switch language to Spanish

### Data Integrity
- [ ] All VINs validated with checksum
- [ ] All IMEIs validated with Luhn algorithm
- [ ] All MACs validated for format
- [ ] Photos auto-enhanced before storage
- [ ] Team installs require verification scan
- [ ] OCR cross-check catches discrepancies

### Reporting
- [ ] PCT can view installation reports
- [ ] Xtra Lease can view asset status
- [ ] Managers can generate EOS reports
- [ ] Daily reports sent automatically
- [ ] Cycle times tracked accurately

### Security
- [ ] RLS enabled on all tables
- [ ] Role-based access enforced
- [ ] Auto-logout after 4 hours
- [ ] Secure file uploads

---

# 🚀 GETTING STARTED

## For Antigravity Agents

1. **Read this entire prompt** to understand the full scope
2. **Review Base44 legacy code** in `src/base44-legacy/`
3. **Start with database migrations** - enable RLS first!
4. **Build offline foundation** before features
5. **Test on actual mobile devices** early and often
6. **Coordinate on shared components** to avoid duplication

## First Tasks by Agent

| Agent | First Task |
|-------|------------|
| **Project Architect** | Set up project structure, configure build tools |
| **Frontend Engineer** | Create base layout, routing, and auth flow |
| **Database Admin** | Run migrations, enable RLS, create Edge Functions |
| **n8n Specialist** | Set up n8n instance, create first workflow |
| **Domain Expert** | Review Base44 logic, document validation rules |
| **QA/Data Guard** | Set up testing framework, write first tests |

---

# 📞 CONTACTS & RESOURCES

## Project Owner
- **Company:** Mobile Installation Solutions (MIS)
- **Primary Contact:** Tom (Project Lead)

## External Services
- **Supabase Project:** qojjakgcqgewmnlvdmzu
- **GitHub Repo:** https://github.com/ffdm2025/SPECGUARD---XTRA

## Documentation
- `installation-workflow-v2.1.md` - Complete workflow spec
- `offline-architecture.md` - Offline-first implementation
- `photo-enhancement.md` - Image processing pipeline

---

*Master Prompt Version: 1.0*
*Created: January 2025*
*For: Google Antigravity IDE*
