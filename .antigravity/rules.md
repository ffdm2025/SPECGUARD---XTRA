# SPECGUARD Project Rules - Antigravity Agent Guidelines
# Place this file at: .antigravity/rules.md

## Project Context
This is a commercial installation management platform for tracking telematic device installations on trailers. The primary users are field technicians who work in challenging conditions with unreliable connectivity.

## Technology Constraints

### Frontend
- Use React 18+ with TypeScript (strict mode)
- Use Tailwind CSS for styling (no CSS modules)
- Use Zustand for state management
- Use Dexie.js for IndexedDB access
- Use react-i18next for internationalization
- Build with Vite
- Must be PWA-capable with Workbox

### Backend
- Use Supabase for all backend services
- PostgreSQL via Supabase
- Supabase Auth for authentication
- Supabase Storage for file uploads
- Supabase Edge Functions (Deno) for server-side processing
- Use Sharp.js for image processing in Edge Functions

### Automation
- Use n8n for workflow automation
- Use Resend for transactional emails

## Code Style Rules

### TypeScript
- Always use strict TypeScript
- Define interfaces for all data structures
- Use `type` for unions, `interface` for objects
- Avoid `any` - use `unknown` if type is truly unknown
- Use async/await, never raw Promises with .then()

### React
- Use functional components only
- Use custom hooks for reusable logic
- Prefix hooks with `use` (e.g., `useOfflineStorage`)
- Keep components under 200 lines
- Extract complex logic to hooks or utilities

### File Naming
- Components: PascalCase (e.g., `TrailerScanner.tsx`)
- Hooks: camelCase with use prefix (e.g., `useInstallation.ts`)
- Utilities: camelCase (e.g., `validation.ts`)
- Types: PascalCase (e.g., `Installation.ts`)

### Folder Structure
- Keep related files together
- Pages go in `src/pages/{role}/`
- Shared components go in `src/components/`
- Business logic goes in `src/lib/`

## Critical Business Rules

### Offline-First (NON-NEGOTIABLE)
- ALL data must be stored locally in IndexedDB FIRST
- NEVER make network calls that block the user workflow
- ALWAYS provide feedback about sync status
- Photos are NEVER uploaded in real-time during capture

### Data Validation (NON-NEGOTIABLE)
- VIN must pass checksum validation
- IMEI must pass Luhn algorithm check
- MAC addresses must be properly formatted
- Asset IDs must match expected patterns
- ALWAYS normalize data before storage (uppercase, trim, etc.)

### Photo Handling
- Store original photos locally
- Upload in background when connected
- HEIC conversion happens on the server (Edge Function)
- Auto-enhance dark/low-contrast photos on server
- Keep both original and enhanced versions

### Team Installations
- Each technician's work is stored as a separate record
- Verification scan is REQUIRED for team install closeout
- Tech Assist photo is REQUIRED for final closeout
- Installation is only "complete" when ALL phases done + Tech Assist captured

### Security
- Enable RLS on ALL Supabase tables
- Never expose service role key to frontend
- Validate all inputs on both client and server
- Sanitize data before database operations

## UI/UX Guidelines

### Mobile-First
- Design for phone screens first
- Touch targets minimum 44x44px
- Avoid hover states (use tap/click)
- Large, clear buttons for field use

### Technician Experience
- Minimize typing - use scanning where possible
- Clear visual feedback for all actions
- Progress indicators for multi-step flows
- NO visible timer during installation (tracked in background)
- Simple language - avoid technical jargon

### Error Handling
- Show user-friendly error messages
- Provide actionable guidance
- Never show raw error codes to technicians
- Log errors for debugging (Sentry)

## Testing Requirements

### Before Committing
- TypeScript must compile without errors
- ESLint must pass
- All validation functions must have tests
- Test offline scenarios

### Critical Test Cases
- VIN validation with valid/invalid checksums
- IMEI validation with Luhn check
- Offline installation complete flow
- Sync queue processing
- Photo upload with enhancement
- Team installation with multiple techs

## Database Rules

### Naming Conventions
- Tables: snake_case plural (e.g., `installation_records`)
- Columns: snake_case (e.g., `created_at`)
- Primary keys: `id` (UUID)
- Foreign keys: `{table}_id` (e.g., `trailer_id`)
- Timestamps: `created_at`, `updated_at`

### Required Columns
Every table must have:
- `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- `created_at TIMESTAMPTZ DEFAULT NOW()`

### Indexing
- Index all foreign keys
- Index columns used in WHERE clauses
- Index columns used in ORDER BY

## API/Edge Function Rules

### Response Format
Always return consistent JSON:
```json
{
  "success": true,
  "data": {},
  "error": null
}
```

Or on error:
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message"
  }
}
```

### Error Codes
Use descriptive error codes:
- `VALIDATION_ERROR` - Input validation failed
- `NOT_FOUND` - Resource not found
- `UNAUTHORIZED` - Authentication required
- `FORBIDDEN` - Not allowed for this user
- `PROCESSING_ERROR` - Server-side processing failed

## Git Workflow

### Branch Naming
- `feature/` - New features
- `fix/` - Bug fixes
- `refactor/` - Code refactoring
- `docs/` - Documentation updates

### Commit Messages
Use conventional commits:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation
- `style:` - Formatting
- `refactor:` - Code restructuring
- `test:` - Adding tests
- `chore:` - Maintenance

## Reference Materials

### Legacy Code
Review `src/base44-legacy/` for:
- Existing validation logic
- Business rule implementations
- UI patterns to maintain

### Specification Documents
- `docs/installation-workflow-v2.1.md` - Installation workflow
- `docs/offline-architecture.md` - Offline-first patterns
- `docs/photo-enhancement.md` - Photo processing requirements

## Questions to Ask

Before implementing, clarify:
1. Does this work offline?
2. What happens if the network fails mid-operation?
3. Is the data validated at both client and server?
4. Does this affect cycle time tracking?
5. Will this work for both solo and team installations?

