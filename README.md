# SPECGUARD - Xtra Lease Installation Management Platform

![Status](https://img.shields.io/badge/Status-In%20Development-yellow)
![Platform](https://img.shields.io/badge/Platform-Web%20%7C%20Mobile%20PWA-blue)
![License](https://img.shields.io/badge/License-Proprietary-red)

## 🎯 Project Overview

SPECGUARD is a comprehensive installation management platform designed for Mobile Installation Solutions (MIS) to manage and track Phillips Connect Technologies (PCT) device installations on commercial trailers for Xtra Lease.

### Key Objectives
- **Efficient Installation Tracking** - Streamline technician workflows with mobile-first, offline-capable tools
- **Data Integrity** - Robust validation to ensure accurate capture of VINs, IMEIs, MAC addresses, and asset IDs
- **Real-time Visibility** - Dashboards and reports for MIS, PCT, and Xtra Lease stakeholders
- **Quality Control** - AI-powered photo analysis and installation verification

---

## 👥 User Roles

| Role | Description |
|------|-------------|
| **Technician** | Field installers performing device installations, capturing photos, reporting delays |
| **Manager** | Branch supervisors overseeing operations, generating EOS reports, managing tasks |
| **PCT** | Phillips Connect Technologies users - QC analysis, installation reports, data uploads |
| **Xtra Lease** | End customer portal - installation status, asset tracking, compliance reports |
| **Admin** | System configuration, user management, advanced reporting, testing tools |

---

## 🔧 Tech Stack

### Frontend
- **Google Antigravity IDE** - Agent-first development platform
- **React** - UI framework
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Styling
- **PWA** - Offline-first mobile experience

### Backend
- **Supabase** - PostgreSQL database, authentication, storage, real-time subscriptions
- **Supabase Edge Functions** - Server-side validation and business logic

### Automation & Integration
- **n8n** - Workflow automation, scheduled reports, data sync
- **Resend** - Transactional email
- **PostHog** - Product analytics
- **Sentry** - Error tracking

### External Services
- **VIN Decoder API** - Vehicle verification
- **OCR Service** - Sticker/label reading
- **PCT Data Integration** - Trailer and device inventory sync

---

## 📱 Core Features

### Installation Management
- [ ] Multi-phase installation workflow
- [ ] Device-specific templates (Stealthnet, Camera, Door Sensor)
- [ ] Photo capture with quality validation
- [ ] Offline mode with background sync
- [ ] OCR for VIN plates, device labels, asset stickers

### Data Validation
- [ ] VIN checksum validation + decode verification
- [ ] IMEI Luhn algorithm check
- [ ] MAC address format validation
- [ ] Asset ID pattern matching
- [ ] Duplicate detection
- [ ] Photo blur/quality detection

### Reporting & Analytics
- [ ] Real-time installation dashboards
- [ ] End-of-Shift (EOS) reports
- [ ] Performance KPIs by technician/branch
- [ ] Scheduled automated reports
- [ ] Custom date range filtering

### Quality Control
- [ ] AI-powered photo analysis
- [ ] QC prompt configuration
- [ ] Pass/fail tracking with remediation workflows

### Inventory Management (Phase 2 - Amazon)
- [ ] Receiving inventory tracking
- [ ] Auto-decrement on installation
- [ ] Branch-level stock visibility
- [ ] Low inventory alerts

---

## 🏗️ Project Structure

```
specguard-xtra/
├── src/
│   ├── components/          # Reusable UI components
│   ├── pages/               # Route pages by role
│   │   ├── technician/
│   │   ├── manager/
│   │   ├── pct/
│   │   ├── xtra-lease/
│   │   └── admin/
│   ├── hooks/               # Custom React hooks
│   ├── lib/                 # Utilities and helpers
│   ├── stores/              # State management
│   ├── types/               # TypeScript definitions
│   └── i18n/                # Internationalization
├── supabase/
│   ├── migrations/          # Database migrations
│   ├── functions/           # Edge functions
│   └── seed/                # Test data
├── n8n/
│   └── workflows/           # Exported workflow JSONs
├── docs/
│   ├── api/                 # API documentation
│   ├── user-guides/         # Role-specific guides
│   └── architecture/        # System design docs
└── tests/
    ├── unit/
    ├── integration/
    └── e2e/
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account
- Google Antigravity IDE

### Installation

```bash
# Clone the repository
git clone https://github.com/ffdm2025/SPECGUARD---XTRA.git

# Navigate to project directory
cd SPECGUARD---XTRA

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Start development server
npm run dev
```

### Environment Variables

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_SENTRY_DSN=your_sentry_dsn
VITE_POSTHOG_KEY=your_posthog_key
```

---

## 📊 Database Schema (Core Entities)

| Entity | Description |
|--------|-------------|
| `users` | User accounts with role assignments |
| `branches` | Installation locations/sites |
| `trailers` | Asset records from PCT |
| `installation_logs` | Installation records with photos and timestamps |
| `installation_phases` | Step-by-step installation tracking |
| `devices` | Stealthnet, Camera, Door Sensor inventory |
| `scan_logs` | Trailer scan history |
| `production_delays` | UTI (Unable to Install) records |
| `qc_results` | Quality control analysis results |
| `eos_reports` | End-of-shift summaries |
| `tasks` | Assigned technician tasks |

---

## 🔐 Security

- Row Level Security (RLS) on all tables
- Role-based access control
- JWT authentication via Supabase Auth
- Auto-logout after 4 hours of inactivity
- Input sanitization and validation
- Secure file upload handling

---

## 🌐 Multi-Language Support

The application supports multiple languages for technician interfaces:
- English (default)
- Spanish
- Additional languages configurable per deployment

---

## 📈 Roadmap

### Phase 1: Xtra Lease (Current)
- Core installation workflow
- PCT and Xtra Lease portals
- Basic reporting

### Phase 2: Amazon Integration
- Work order management
- Advanced inventory management
- Automated receiving workflows

### Phase 3: Platform Expansion
- Additional customer portals
- White-label capabilities
- Advanced analytics

---

## 👨‍💻 Development Team

**Mobile Installation Solutions (MIS)**

### AI Agent Team (Antigravity)
- Project Architect Agent
- Frontend Engineer Agent
- Database Administrator Agent
- n8n Automation Agent
- Installation Domain Expert Agent
- QA/Data Guard Agent

---

## 📝 Contributing

This is a private repository. Contact the project administrator for access and contribution guidelines.

---

## 📄 License

Proprietary - All rights reserved by Mobile Installation Solutions.

---

## 📞 Support

For technical support or questions, contact the MIS development team.

---

*Last Updated: January 2026*
