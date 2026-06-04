# Phase 64: Tenant Consent & Privacy Center

## Overview
As EduOS processes sensitive data (CRM, finance, Zalo chat), we must ensure strict compliance with tenant data privacy and consent before enabling real synchronization.

Phase 64 introduces a demo-ready Consent & Privacy Center designed to clearly communicate what data is processed and what remains in the sandbox.

## Key Principles
1. **No Data Without Consent:** Real connectors (Zalo, Facebook, Banking) cannot be enabled without explicit admin consent.
2. **Sandbox by Default:** All demo environments run on deterministic mock data. No real student or parent data is persisted.
3. **No Personal Scraping:** EduOS strictly prohibits scraping personal Zalo accounts or private groups.

## UI Components
The Safety Center now includes a "Consent & Privacy" tab:
- **Scope Cards:** Displays current vs future modes for Zalo import, CSV import, Finance import, and AI grading.
- **Privacy Checklist:** A verification list showing that phone numbers are masked, passwords aren't stored in plain text, and tenant opt-in is enforced.

## Status
- **Implemented:** Yes (Mock UI only)
- **Real Backend:** No (Deliberately bypassed to keep the demo safe)
- **Next Steps:** Implement real DB consent toggles in Phase 68/71 when transitioning to live pilot.
