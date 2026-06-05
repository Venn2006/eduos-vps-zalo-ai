# Phase 83: Customer Onboarding Forms and Consent Pack

## 1. Executive Summary
Before EduOS ingests any real student data, connects to a center's live Facebook Fanpage, or integrates with a Zalo Official Account (OA), we must establish a clear legal and operational boundary. This document outlines the mandatory consent forms and agreements that a Pilot Customer must review and sign prior to onboarding.

The goal is to protect EduOS from liability regarding data privacy (e.g., sharing student phone numbers), AI hallucinations (e.g., an AI agent giving the wrong tuition price), and social media platform bans (e.g., Zalo blocking the OA for spam).

## 2. Form 1: Data Processing & Confidentiality Agreement (DPA)
**Purpose**: Ensure the center has the right to share data with EduOS and that EduOS commits to securing it.

**Key Clauses**:
- **Right to Share**: The Center explicitly confirms they have obtained consent from parents/students to store their personal information (Name, Phone, Academic Records) in a third-party CRM.
- **EduOS Commitment**: EduOS acts solely as a Data Processor. We will not sell, share, or market directly to the Center's leads/students.
- **Data Deletion**: Upon termination of the pilot, the Center has the right to request a complete purge of their `tenantId` data within 30 days.

## 3. Form 2: AI & Automation Consent
**Purpose**: Manage expectations regarding the capabilities and risks of Large Language Models (LLMs) answering customer queries.

**Key Clauses**:
- **Beta Nature of AI**: The Center acknowledges that the AI "Auto-Reply" features are experimental. AI models can occasionally hallucinate or provide inaccurate information regarding pricing or schedules.
- **Human Oversight Required**: The Center agrees to assign staff to monitor the "Team Inbox" and intervene when necessary.
- **Liability Waiver**: EduOS is not financially liable if an AI agent offers a non-existent discount or causes a parent to become frustrated.

## 4. Form 3: Social Media Connector Authorization
**Purpose**: Establish rules for granting EduOS technical access to the Center's social assets.

**Key Clauses**:
- **Access Level**: The Center agrees to grant "Editor" or "Admin" access to their Facebook Fanpage and Zalo OA to the EduOS integration accounts.
- **Personal Zalo VPS Disclaimer**: If the Center opts to use the "Personal Zalo VPS Connector", they acknowledge that this relies on an unofficial automation method (web scraping via VPS) and carries a risk of the personal Zalo account being temporarily or permanently restricted by VNG. EduOS is not liable for lost Zalo accounts.

## 5. Form 4: Communication & Anti-Spam Policy
**Purpose**: Protect the EduOS platform infrastructure from being flagged for spam by telecom providers or social networks.

**Key Clauses**:
- **Strict Opt-in**: The Center agrees to only send bulk broadcast messages (via Zalo OA or SMS) to users who have explicitly opted in.
- **Platform Rules**: The Center agrees to abide by Zalo ZNS and Meta's 24-hour messaging window policies.
- **Suspension Rights**: EduOS reserves the right to instantly disable the Center's Outbox if unusual spam activity, harassment, or severe platform violations are detected.

## 6. Implementation Checklist for Onboarding
- [ ] Convert these 4 forms into a digital PDF or Docusign packet.
- [ ] Send to the Center Owner during the "Kick-off Call".
- [ ] Store a countersigned copy in the EduOS internal drive before executing the Phase 81 Data Import script.

## 7. Next Recommended Phase
- With the Data Model (81), Staging (82), and Consent Pack (83) finalized, Bundle P (Pilot Preparation) is complete. The next phases will move towards execution (importing the actual data, running the staging test, and conducting the live pilot).
