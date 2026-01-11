# SPECGUARD Photo Analysis & Viewer Specifications

---

## 🔍 PART 1: AI Photo Analysis & OCR Recovery Tool

### Purpose
Analyze existing installation photos to extract IMEI, MAC, VIN, and other identifiers that were not captured during the original installation process.

---

### Process Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    AI PHOTO ANALYSIS TOOL                       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ 1. SELECT PHOTOS TO ANALYZE                                     │
│    ├─► All unprocessed installation photos                      │
│    ├─► Specific asset_id                                        │
│    └─► Date range filter                                        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ 2. AI VISION ANALYSIS                                           │
│    ├─► Load high-res photo from Supabase Storage                │
│    ├─► Send to Claude Vision API                                │
│    ├─► Prompt: "Identify and extract any visible:"              │
│    │   • IMEI numbers (15 digits)                               │
│    │   • MAC addresses (XX:XX:XX:XX:XX:XX)                       │
│    │   • VIN (17 characters)                                    │
│    │   • Model numbers                                          │
│    │   • Serial numbers                                         │
│    │   • QR codes / barcodes                                    │
│    └─► Return structured data with confidence scores            │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ 3. VALIDATION                                                   │
│    ├─► IMEI: Luhn algorithm check                               │
│    ├─► VIN: Checksum validation                                 │
│    ├─► MAC: Format validation                                   │
│    └─► Flag low-confidence extractions for review               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ 4. HUMAN REVIEW QUEUE                                           │
│    ├─► Show photo with AI-detected regions highlighted          │
│    ├─► Display extracted values with confidence %               │
│    ├─► Allow user to:                                           │
│    │   • Confirm extraction ✅                                  │
│    │   • Correct extraction ✏️                                  │
│    │   • Reject extraction ❌                                   │
│    │   • Zoom/pan to verify                                     │
│    └─► Save confirmed values                                    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ 5. UPDATE RECORDS                                               │
│    ├─► Update installation_logs with extracted data             │
│    ├─► Update trailers table with IMEI, VIN                     │
│    └─► Log extraction audit trail                               │
└─────────────────────────────────────────────────────────────────┘
```

---

### Database Schema for OCR Results

```sql
CREATE TABLE ocr_extractions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Source
  installation_log_id UUID REFERENCES installation_logs(id),
  asset_id TEXT REFERENCES trailers(asset_id),
  photo_url TEXT NOT NULL,
  photo_type TEXT NOT NULL, -- 'trailer_photo', 'gateway_mounting', etc.
  
  -- Extraction Results
  extracted_data JSONB NOT NULL,
  /*
  {
    "imei": {
      "value": "353456789012345",
      "confidence": 0.92,
      "bounding_box": {"x": 100, "y": 200, "width": 150, "height": 30},
      "validated": true
    },
    "mac": {
      "value": "AA:BB:CC:DD:EE:FF",
      "confidence": 0.88,
      "bounding_box": {...},
      "validated": true
    },
    "vin": {...},
    "model_numbers": [...],
    "raw_text": "Full OCR text..."
  }
  */
  
  -- AI Analysis Info
  ai_model TEXT DEFAULT 'claude-3-5-sonnet',
  ai_prompt_version TEXT,
  processing_time_ms INTEGER,
  
  -- Review Status
  review_status TEXT DEFAULT 'pending', 
  -- 'pending', 'confirmed', 'corrected', 'rejected'
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  reviewer_corrections JSONB, -- What was changed
  
  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_review_status CHECK (
    review_status IN ('pending', 'confirmed', 'corrected', 'rejected')
  )
);

CREATE INDEX idx_ocr_asset ON ocr_extractions(asset_id);
CREATE INDEX idx_ocr_status ON ocr_extractions(review_status);
```

---

### AI Vision Prompt Template

```typescript
const OCR_EXTRACTION_PROMPT = `
Analyze this installation photo and extract any visible device identifiers.

Look for and extract:

1. **IMEI Numbers** (15 digits, often on white stickers)
   - Format: 353456789012345
   - Usually starts with 35, 86, or 01

2. **MAC Addresses** (6 pairs of hex characters)
   - Format: AA:BB:CC:DD:EE:FF or AA-BB-CC-DD-EE-FF
   - May be labeled "MAC", "MAC Address", or "HW Address"

3. **VIN** (17 alphanumeric characters)
   - Usually on metal plate
   - No I, O, or Q characters
   - Format: 1HGBH41JXMN109186

4. **Model Numbers**
   - Often format like "77-7700" or "77-S108"
   - May be labeled "M/N", "Model", "Part Number"

5. **Serial Numbers**
   - May be labeled "S/N", "Serial", "SN"

For each found item, provide:
- The extracted value
- Your confidence level (0.0 to 1.0)
- The approximate location in the image (top-left, center, etc.)

If text is partially obscured or unclear, provide your best interpretation 
with a lower confidence score.

Respond in JSON format:
{
  "imei": {"value": "...", "confidence": 0.95, "location": "center-right"},
  "mac": {"value": "...", "confidence": 0.88, "location": "center"},
  "vin": {"value": "...", "confidence": 0.72, "location": "bottom-left"},
  "model_numbers": [{"value": "...", "confidence": 0.90}],
  "serial_numbers": [{"value": "...", "confidence": 0.85}],
  "other_text": ["any other relevant text found"],
  "image_quality": "good|fair|poor",
  "notes": "Any observations about the image or extraction"
}
`;
```

---

### Admin UI for OCR Review

```
┌─────────────────────────────────────────────────────────────────────────┐
│  OCR EXTRACTION REVIEW                               [Filter ▼] [Export]│
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Asset: W08360                    Status: ⏳ Pending Review              │
│  Branch: STOCKTON                 Photo: trailer_photo                  │
│  ─────────────────────────────────────────────────────────────────────  │
│                                                                         │
│  ┌─────────────────────────────────┐  ┌──────────────────────────────┐ │
│  │                                 │  │  EXTRACTED DATA              │ │
│  │                                 │  │  ────────────────────────    │ │
│  │     [INTERACTIVE PHOTO]        │  │                              │ │
│  │     - Pinch to zoom            │  │  IMEI: 353456789012345       │ │
│  │     - Drag to pan              │  │  Confidence: 92% ✅           │ │
│  │     - Tap to highlight         │  │  Luhn Check: ✅ Valid         │ │
│  │                                 │  │  [Edit] [Confirm]            │ │
│  │                                 │  │                              │ │
│  │   🔍 + | - | Reset             │  │  MAC: AA:BB:CC:DD:EE:FF      │ │
│  │                                 │  │  Confidence: 88% ✅           │ │
│  │                                 │  │  Format: ✅ Valid             │ │
│  └─────────────────────────────────┘  │  [Edit] [Confirm]            │ │
│                                        │                              │ │
│                                        │  VIN: Not detected ❌        │ │
│                                        │  [Enter Manually]            │ │
│                                        │                              │ │
│                                        │  Model: 77-7700              │ │
│                                        │  Confidence: 95% ✅           │ │
│                                        └──────────────────────────────┘ │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ [❌ Reject All] [✅ Confirm All] [➡️ Skip] [💾 Save & Next]     │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  Progress: 23 / 156 reviewed                    [◀ Prev] [Next ▶]      │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 📱 PART 2: Interactive Photo Viewer Component

### Requirements

| Feature | Description |
|---------|-------------|
| **Pinch to Zoom** | Two-finger pinch gesture on mobile |
| **Mouse Wheel Zoom** | Scroll to zoom on desktop |
| **Pan/Drag** | Drag to move around when zoomed |
| **Double-tap Zoom** | Quick zoom to 2x on tap location |
| **Zoom Controls** | +/- buttons for accessibility |
| **Reset View** | Return to original fit-to-screen |
| **Zoom Level Indicator** | Show current zoom % |
| **Smooth Animations** | 60fps transitions |
| **Keyboard Support** | Arrow keys to pan, +/- to zoom |

---

### React Component Implementation

```tsx
// src/components/ui/InteractivePhotoViewer.tsx

import React, { useState, useRef, useCallback, useEffect } from 'react';

interface PhotoViewerProps {
  src: string;
  alt: string;
  initialZoom?: number;
  minZoom?: number;
  maxZoom?: number;
  onClose?: () => void;
  showControls?: boolean;
  highlightRegions?: {
    x: number;
    y: number;
    width: number;
    height: number;
    label: string;
    color?: string;
  }[];
}

export function InteractivePhotoViewer({
  src,
  alt,
  initialZoom = 1,
  minZoom = 0.5,
  maxZoom = 5,
  onClose,
  showControls = true,
  highlightRegions = []
}: PhotoViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  
  const [zoom, setZoom] = useState(initialZoom);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  // Pinch zoom state
  const [lastPinchDistance, setLastPinchDistance] = useState<number | null>(null);

  // Handle mouse wheel zoom
  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoom(prev => Math.min(maxZoom, Math.max(minZoom, prev + delta)));
  }, [minZoom, maxZoom]);

  // Handle mouse drag
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Handle touch events for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      // Pinch start
      const distance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      setLastPinchDistance(distance);
    } else if (e.touches.length === 1 && zoom > 1) {
      // Pan start
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - position.x,
        y: e.touches[0].clientY - position.y
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && lastPinchDistance) {
      // Pinch zoom
      const distance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const scale = distance / lastPinchDistance;
      setZoom(prev => Math.min(maxZoom, Math.max(minZoom, prev * scale)));
      setLastPinchDistance(distance);
    } else if (e.touches.length === 1 && isDragging) {
      // Pan
      setPosition({
        x: e.touches[0].clientX - dragStart.x,
        y: e.touches[0].clientY - dragStart.y
      });
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    setLastPinchDistance(null);
  };

  // Double tap to zoom
  const [lastTap, setLastTap] = useState(0);
  const handleDoubleTap = (e: React.TouchEvent) => {
    const now = Date.now();
    if (now - lastTap < 300) {
      // Double tap detected
      if (zoom === 1) {
        setZoom(2);
        // Center on tap location
        const rect = containerRef.current?.getBoundingClientRect();
        if (rect) {
          const tapX = e.changedTouches[0].clientX - rect.left;
          const tapY = e.changedTouches[0].clientY - rect.top;
          setPosition({
            x: rect.width / 2 - tapX,
            y: rect.height / 2 - tapY
          });
        }
      } else {
        resetView();
      }
    }
    setLastTap(now);
  };

  // Reset view
  const resetView = () => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  // Zoom controls
  const zoomIn = () => setZoom(prev => Math.min(maxZoom, prev + 0.25));
  const zoomOut = () => setZoom(prev => Math.max(minZoom, prev - 0.25));

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case '+':
        case '=':
          zoomIn();
          break;
        case '-':
          zoomOut();
          break;
        case 'ArrowUp':
          setPosition(prev => ({ ...prev, y: prev.y + 50 }));
          break;
        case 'ArrowDown':
          setPosition(prev => ({ ...prev, y: prev.y - 50 }));
          break;
        case 'ArrowLeft':
          setPosition(prev => ({ ...prev, x: prev.x + 50 }));
          break;
        case 'ArrowRight':
          setPosition(prev => ({ ...prev, x: prev.x - 50 }));
          break;
        case 'Escape':
          onClose?.();
          break;
        case '0':
          resetView();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Attach wheel listener
  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
      return () => container.removeEventListener('wheel', handleWheel);
    }
  }, [handleWheel]);

  return (
    <div className="relative w-full h-full bg-gray-900 overflow-hidden select-none">
      {/* Photo Container */}
      <div
        ref={containerRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={(e) => { handleTouchEnd(); handleDoubleTap(e); }}
      >
        <img
          ref={imageRef}
          src={src}
          alt={alt}
          className="max-w-none transition-transform duration-100"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
            transformOrigin: 'center center'
          }}
          draggable={false}
        />
        
        {/* Highlight Regions (for OCR results) */}
        {highlightRegions.map((region, idx) => (
          <div
            key={idx}
            className="absolute border-2 pointer-events-none"
            style={{
              left: region.x * zoom + position.x,
              top: region.y * zoom + position.y,
              width: region.width * zoom,
              height: region.height * zoom,
              borderColor: region.color || '#00ff00',
              backgroundColor: `${region.color || '#00ff00'}20`
            }}
          >
            <span 
              className="absolute -top-6 left-0 text-xs px-1 rounded"
              style={{ backgroundColor: region.color || '#00ff00', color: '#000' }}
            >
              {region.label}
            </span>
          </div>
        ))}
      </div>

      {/* Zoom Controls */}
      {showControls && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 
                        flex items-center gap-2 bg-black/70 rounded-full px-4 py-2">
          <button
            onClick={zoomOut}
            className="w-8 h-8 flex items-center justify-center text-white 
                       hover:bg-white/20 rounded-full transition"
            aria-label="Zoom out"
          >
            −
          </button>
          
          <span className="text-white text-sm min-w-[60px] text-center">
            {Math.round(zoom * 100)}%
          </span>
          
          <button
            onClick={zoomIn}
            className="w-8 h-8 flex items-center justify-center text-white 
                       hover:bg-white/20 rounded-full transition"
            aria-label="Zoom in"
          >
            +
          </button>
          
          <div className="w-px h-6 bg-white/30 mx-2" />
          
          <button
            onClick={resetView}
            className="text-white text-sm hover:bg-white/20 px-2 py-1 
                       rounded transition"
            aria-label="Reset view"
          >
            Reset
          </button>
        </div>
      )}

      {/* Close Button */}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center 
                     bg-black/70 text-white rounded-full hover:bg-black/90 transition"
          aria-label="Close"
        >
          ✕
        </button>
      )}

      {/* Zoom indicator on pinch */}
      {zoom !== 1 && (
        <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-1 
                        rounded-full text-sm">
          🔍 {Math.round(zoom * 100)}%
        </div>
      )}
    </div>
  );
}
```

---

### Usage Examples

#### Basic Photo Viewer
```tsx
<InteractivePhotoViewer
  src="https://supabase.../photo.jpg"
  alt="Installation photo"
/>
```

#### In a Modal
```tsx
<Modal isOpen={showPhoto} onClose={() => setShowPhoto(false)}>
  <InteractivePhotoViewer
    src={selectedPhoto}
    alt="Installation photo"
    onClose={() => setShowPhoto(false)}
  />
</Modal>
```

#### With OCR Highlight Regions
```tsx
<InteractivePhotoViewer
  src={photo.url}
  alt="Installation stickers"
  highlightRegions={[
    { x: 100, y: 200, width: 150, height: 30, label: 'IMEI', color: '#00ff00' },
    { x: 100, y: 250, width: 180, height: 30, label: 'MAC', color: '#00aaff' }
  ]}
/>
```

---

### Mobile Gestures Summary

| Gesture | Action |
|---------|--------|
| **Pinch** | Zoom in/out |
| **Drag** | Pan (when zoomed) |
| **Double-tap** | Toggle 2x zoom |
| **Single tap** | (future: show/hide controls) |

### Desktop Controls

| Input | Action |
|-------|--------|
| **Scroll wheel** | Zoom in/out |
| **Click + drag** | Pan (when zoomed) |
| **+/- keys** | Zoom in/out |
| **Arrow keys** | Pan |
| **0 key** | Reset view |
| **Esc** | Close viewer |

---

## 🔄 n8n Workflow for Batch OCR Processing

```
Trigger: Manual or Scheduled
    │
    ▼
┌─────────────────────────────────────┐
│ Query: Get unprocessed photos       │
│ SELECT * FROM installation_logs    │
│ WHERE gateway_imei IS NULL          │
│ LIMIT 50                            │
└─────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────┐
│ Loop: For each record               │
│   1. Fetch photo from Supabase      │
│   2. Send to Claude Vision API      │
│   3. Parse response                 │
│   4. Validate extracted data        │
│   5. Insert to ocr_extractions      │
└─────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────┐
│ Notify: Send summary report         │
│ "Processed 50 photos, 42 extractions│
│  ready for review"                  │
└─────────────────────────────────────┘
```

---

## 📝 Implementation Priority

1. **InteractivePhotoViewer component** - Enables zoom/pan on all photos
2. **OCR extraction table** - Store AI results
3. **Claude Vision integration** - API call for extraction
4. **Review UI** - Admin tool to confirm/correct
5. **n8n batch workflow** - Process historical photos
6. **Auto-update triggers** - Sync confirmed data to trailers
