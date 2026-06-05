# Phase 81: Pilot Tenant Data Model Proposal

## 1. Executive Summary
This document outlines the proposed strategy for mapping a pilot language center's manual data (Excel/CSV) into EduOS's multi-tenant database architecture. The goal is to ensure a smooth, secure, and isolated onboarding process for the first real pilot tenant without writing custom code for every import, while strictly adhering to privacy boundaries.

## 2. Core Entities to Import
To successfully launch a pilot, we need to map the center's existing operational data into the following core EduOS entities:

### 2.1. Organization & Roles (`Tenant`, `TenantMember`, `User`)
- **Tenant**: A single record representing the language center (e.g., "Hanoi English Center").
- **Users & Members**: Owner, Managers, Teachers, and Sales staff.
- *Mapping Strategy*: Create the `Tenant` manually. Center provides a CSV of staff emails and roles. EduOS sends secure invite links to create `User` accounts and link them via `TenantMember`.

### 2.2. Academics (`Course`, `Class`, `Teacher`)
- **Courses**: The curriculum programs (e.g., "IELTS Foundation", "Kids Starter").
- **Classes**: Active class instances mapped to courses (e.g., "IE-F-01").
- **Teachers**: Instructors assigned to classes.
- *Mapping Strategy*: Center provides `courses.csv` and `classes.csv` (with `teacher_name` and `course_name`). Import script resolves relations by name or unique center ID.

### 2.3. CRM & Enrollment (`Lead`, `Student`, `Guardian`, `Enrollment`)
- **Leads**: Prospective students currently in the pipeline.
- **Students**: Active learners enrolled in classes.
- **Guardians**: Parents/caregivers linked to students.
- **Enrollments**: The link between `Student` and `Class`.
- *Mapping Strategy*: 
  - `leads.csv`: Map to `Lead` model (Name, Phone, Stage, Temperature, Assigned Sale).
  - `students.csv`: Must contain Guardian info. Creates `Guardian`, `Student`, and maps to `Enrollment` if an active class is specified.

### 2.4. Finance (`Invoice`, `Payment`, `InvoiceItem`)
- **Invoices**: Historical or active tuition bills.
- **Payments**: Recorded cash/transfer transactions.
- *Mapping Strategy*: `tuition_debt.csv`. We will import only active/unpaid or partially paid invoices to track debt in the Finance Workspace. We will not backfill years of fully paid historical data to minimize risk during the pilot.

## 3. Data Sanitization & Privacy Rules
Before any CSV touches the EduOS staging or production database, the following rules apply:
1. **Consent Check**: Center must confirm they have the right to store this data in a SaaS platform.
2. **Phone Number Masking**: The import script will not alter phone numbers in the DB, but the UI must enforce masking rules based on `Role` (e.g., Teachers only see the last 4 digits of a parent's phone).
3. **No External Triggers**: The import script must explicitly bypass any database triggers or application logic that might accidentally send "Welcome" SMS/Zalo messages during import.

## 4. Import Workflow (Safe Path)
1. **Template Delivery**: EduOS provides 4 strictly formatted CSV templates (Staff, Academic, CRM, Finance).
2. **Data Cleansing**: Center fills templates. EduOS team manually reviews for formatting errors (e.g., invalid phone numbers, duplicate emails).
3. **Dry Run**: Run the import script locally pointing to a sandbox DB tenant. Verify referential integrity (e.g., all students in a class actually exist).
4. **Staging Import**: Execute the import into the Pilot Staging environment.
5. **Tenant Validation**: The Center Owner logs in and verifies data accuracy before training staff.

## 5. Risk Mitigation & Tenant Isolation
- **Row-Level Security (RLS)**: Ensure Prisma queries or Supabase RLS policies are strictly enforcing `tenantId = currentTenantId` on all imported rows.
- **Data Deletion**: Ensure a cascade delete path exists so that if the pilot fails, we can execute a script to wipe the specific `tenantId` completely from the database without leaving orphan records.

## 6. Next Actions
- Develop the 4 CSV templates based on the Prisma schema.
- Write the secure Node.js CLI import script.
- Conduct a dry run with dummy data.

## 7. Next Recommended Phase
- Phase 82 — Staging Environment Setup Plan
