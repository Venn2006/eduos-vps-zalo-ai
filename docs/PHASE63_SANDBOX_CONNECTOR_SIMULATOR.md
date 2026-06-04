# Phase 63: Sandbox Connector Simulator

## Goal
Simulate the end-to-end safe data pipeline outlined in Phase 59 without writing or running any actual background workers, queues, or webhooks.

## Features
- **Scenario Selector**: Simulates incoming events like a Fanpage lead, a Zalo tuition question, or a Bank mock intent.
- **Pipeline Visualization**: Shows how raw inputs pass through Consent, Normalization, PII Masking, Context Building, and Approval Gates.
- **Policy Outcomes**: Demonstrates how specific scenarios map to explicit `AutomationMode` strings (`ADMIN_APPROVAL_REQUIRED`, `DRAFT_ONLY`, `AUTO_LOW_RISK`).
- **Mock Audit Log**: Renders a JSON code block demonstrating what an immutable audit record would look like. No actual database writes occur.
