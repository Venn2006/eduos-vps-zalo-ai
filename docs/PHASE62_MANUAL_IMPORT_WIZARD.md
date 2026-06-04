# Phase 62: Manual Import Wizard

## Goal
Demonstrate how a language center can import legacy leads and financial data safely, without actually writing it to the database during the demo.

## Features
- **Data Type Selection**: Leads, Students, Finance, Homework.
- **Deterministic Mock Data**: Uses predefined string templates representing CSV data instead of allowing actual file uploads.
- **Client-side Parsing**: Parses the mock CSV in local component state.
- **Safe Previews**: Renders the table on the UI with strict warnings that the data is not persisted.
- **No DB Action**: There are no API calls or Prisma commands involved in the simulated import.
