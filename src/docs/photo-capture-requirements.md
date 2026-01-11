# SPECGUARD Photo Capture Requirements
## Installation Workflow - Mandatory Photo Steps

---

## 🚨 PROBLEM TO FIX

The previous Base44 app had 3 photo types that were NEVER captured (0% fill rate):
- VIN Plate Overall
- VIN Plate Closeup  
- Camera Installation

This spec ensures ALL required photos have explicit capture buttons in the technician workflow.

---

## 📸 Required Photos by Phase

### Phase 1: Documentation (4 Photos Required)

| Step | Photo Field | Description | Required | OCR |
|------|-------------|-------------|----------|-----|
| 1.1 | `trailer_photo_url` | Overall trailer photo showing asset ID sticker | ✅ Yes | No |
| 1.2 | `installation_stickers_url` | Close-up of installation stickers (IMEI, MAC, M/N) | ✅ Yes | ✅ Yes |
| 1.3 | `vin_plate_closeup_url` | **Close-up of VIN plate for OCR reading** | ✅ Yes | ✅ Yes |
| 1.4 | `vin_plate_overall_url` | **Overall shot showing VIN plate location + stickers** | ✅ Yes | No |

### Phase 2: Undercarriage (4 Photos Required)

| Step | Photo Field | Description | Required | OCR |
|------|-------------|-------------|----------|-----|
| 2.1 | `gateway_mounting_url` | Gateway device mounted and connected | ✅ Yes | No |
| 2.2 | `abs_connection_url` | ABS Y-cable connection | ✅ Yes | No |
| 2.3 | `power_connection_url` | Turn signal marker / alternate power supply | ✅ Yes | No |
| 2.4 | `undercarriage_overall_url` | Overall undercarriage showing all components | ✅ Yes | No |

### Phase 3: External Components (3-4 Photos)

| Step | Photo Field | Description | Required | OCR |
|------|-------------|-------------|----------|-----|
| 3.1 | `camera_url` | **Camera installation (if equipped)** | Conditional* | No |
| 3.2 | `door_sensor_url` | Door sensor installation (if equipped) | Conditional* | No |
| 3.3 | `tech_assist_url` | Tech Assist screenshot showing connectivity | ✅ Yes | No |

*Conditional = Required if device type is StealthNet++ or trailer has that component

---

## 🎨 UI Requirements

### Each Photo Step Must Have:

```
┌─────────────────────────────────────────────────────┐
│  📸 VIN Plate Close-up                              │
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │                                             │   │
│  │     [Thumbnail Preview or Placeholder]      │   │
│  │                                             │   │
│  │                                             │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  [ 📷 Take Photo ]    [ 🔄 Retake ]                │
│                                                     │
│  ✅ Photo captured at 2:34 PM                       │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Component Requirements:

1. **Clear Label** - What photo is needed
2. **Helper Text** - Brief description of what to capture
3. **Large Tap Target** - "Take Photo" button (minimum 48x48px)
4. **Preview Thumbnail** - Show captured photo immediately
5. **Retake Option** - Allow re-capture if photo is poor
6. **Timestamp** - Show when photo was captured
7. **Status Indicator** - ✅ Captured / ⚠️ Required / ❌ Missing

---

## 📱 React Component Structure

```tsx
// src/components/installation/PhotoCaptureStep.tsx

interface PhotoCaptureStepProps {
  stepId: string;
  label: string;
  description: string;
  photoType: string;
  required: boolean;
  enableOCR?: boolean;
  onCapture: (photoData: CapturedPhoto) => void;
  existingPhoto?: string;
}

export function PhotoCaptureStep({
  stepId,
  label,
  description,
  photoType,
  required,
  enableOCR = false,
  onCapture,
  existingPhoto
}: PhotoCaptureStepProps) {
  // Component implementation
  // - Camera capture
  // - Preview display
  // - Retake functionality
  // - OCR trigger if enabled
  // - Save to IndexedDB
}
```

---

## 🔄 Installation Workflow Steps

### StealthNet Installation (10 photos minimum)

```
Phase 1: Documentation
  ├── 1.1 Trailer Photo ────────────── [📷 Take Photo]
  ├── 1.2 Installation Stickers ────── [📷 Take Photo] + OCR
  ├── 1.3 VIN Plate Close-up ───────── [📷 Take Photo] + OCR  ⚠️ WAS MISSING
  └── 1.4 VIN Plate Overall ────────── [📷 Take Photo]        ⚠️ WAS MISSING

Phase 2: Undercarriage  
  ├── 2.1 Gateway Mounting ─────────── [📷 Take Photo]
  ├── 2.2 ABS Connection ───────────── [📷 Take Photo]
  ├── 2.3 Power Connection ─────────── [📷 Take Photo]
  └── 2.4 Undercarriage Overall ────── [📷 Take Photo]

Phase 3: External & Verification
  ├── 3.1 Door Sensor ──────────────── [📷 Take Photo] (if equipped)
  └── 3.2 Tech Assist Screenshot ───── [📷 Take Photo]
```

### StealthNet++ Installation (11-12 photos)

Same as above, PLUS:
```
Phase 3: External & Verification
  ├── 3.1 Camera Installation ──────── [📷 Take Photo]        ⚠️ WAS MISSING
  ├── 3.2 Door Sensor ──────────────── [📷 Take Photo]
  └── 3.3 Tech Assist Screenshot ───── [📷 Take Photo]
```

---

## ✅ Validation Rules

### Before Completing Installation:

```typescript
function validatePhotoRequirements(
  installation: Installation,
  deviceType: 'StealthNet' | 'StealthNet++'
): ValidationResult {
  const errors: string[] = [];
  
  // Phase 1 - Always required
  if (!installation.trailer_photo_url) 
    errors.push('Trailer photo is required');
  if (!installation.installation_stickers_url) 
    errors.push('Installation stickers photo is required');
  if (!installation.vin_plate_closeup_url) 
    errors.push('VIN plate close-up is required');
  if (!installation.vin_plate_overall_url) 
    errors.push('VIN plate overall photo is required');
  
  // Phase 2 - Always required
  if (!installation.gateway_mounting_url) 
    errors.push('Gateway mounting photo is required');
  if (!installation.abs_connection_url) 
    errors.push('ABS connection photo is required');
  
  // Phase 3 - Conditional
  if (deviceType === 'StealthNet++' && !installation.camera_url) 
    errors.push('Camera installation photo is required for StealthNet++');
  
  // Tech Assist - Always required
  if (!installation.tech_assist_url) 
    errors.push('Tech Assist screenshot is required');
  
  return {
    valid: errors.length === 0,
    errors
  };
}
```

---

## 🚫 Prevent Submission Without Photos

The "Complete Installation" button should be **disabled** until all required photos are captured:

```tsx
<Button
  disabled={!allRequiredPhotosCaptured}
  onClick={handleCompleteInstallation}
>
  {allRequiredPhotosCaptured 
    ? '✅ Complete Installation' 
    : `📷 ${missingPhotoCount} photos required`}
</Button>
```

---

## 📊 Database Schema Update

Ensure the `installation_records` table has ALL photo columns:

```sql
-- Photo URL columns
trailer_photo_url TEXT,
installation_stickers_url TEXT,
vin_plate_closeup_url TEXT,        -- WAS NEVER CAPTURED
vin_plate_overall_url TEXT,        -- WAS NEVER CAPTURED
gateway_mounting_url TEXT,
abs_connection_url TEXT,
power_connection_url TEXT,
undercarriage_overall_url TEXT,
camera_url TEXT,                   -- WAS NEVER CAPTURED
door_sensor_url TEXT,
tech_assist_url TEXT,

-- Corresponding timestamps
trailer_photo_timestamp TIMESTAMPTZ,
installation_stickers_timestamp TIMESTAMPTZ,
vin_plate_closeup_timestamp TIMESTAMPTZ,
vin_plate_overall_timestamp TIMESTAMPTZ,
gateway_mounting_timestamp TIMESTAMPTZ,
abs_connection_timestamp TIMESTAMPTZ,
power_connection_timestamp TIMESTAMPTZ,
undercarriage_overall_timestamp TIMESTAMPTZ,
camera_timestamp TIMESTAMPTZ,
door_sensor_timestamp TIMESTAMPTZ,
tech_assist_timestamp TIMESTAMPTZ,
```

---

## 🎯 Summary of Fixes Needed

1. **Add VIN Plate Close-up step** with explicit photo capture button
2. **Add VIN Plate Overall step** with explicit photo capture button
3. **Add Camera Installation step** for StealthNet++ devices
4. **Make all Phase 1 photos mandatory** - cannot proceed without them
5. **Validate before completion** - block submission if photos missing
6. **Show clear status** - which photos are captured vs. missing

---

## 📝 Prompt for Antigravity Agent

Copy and paste this to the agent:

```
Please update the Installation Workflow to fix missing photo captures. 

PROBLEM: Three photo types were NEVER captured in the old app:
- VIN Plate Close-up (0% capture rate)
- VIN Plate Overall (0% capture rate)  
- Camera Installation (0% capture rate)

REQUIREMENTS:
1. Every photo step must have an explicit "Take Photo" button
2. Show thumbnail preview after capture with "Retake" option
3. Phase 1 requires 4 photos: Trailer, Stickers, VIN Close-up, VIN Overall
4. Phase 3 Camera step is required for StealthNet++ only
5. Block "Complete Installation" until all required photos captured
6. Show count of missing photos on the submit button

Please review src/docs/photo-capture-requirements.md for full specifications and implement the PhotoCaptureStep component and updated workflow.
```
