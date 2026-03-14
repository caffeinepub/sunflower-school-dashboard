# Sunflower Public School Dashboard

## Current State
New project. No existing code.

## Requested Changes (Diff)

### Add
- Single-page management dashboard for Sunflower Public School (Director: Kausar Parween)
- Matte Black / Deep Charcoal theme with Neon Cyan and Electric Blue accents, futuristic HUD glassmorphism style
- Staff Salary Module: table with Base Salary, Month Length, Days Present inputs; auto-calculates Final Salary = (Base Salary / Total Days) * Days Present; shows Deductions column
- Student Fee Ledger: searchable student database, Jan-Dec monthly payment grid per student, click to toggle Paid (neon green) / Unpaid (soft red)
- Miscellaneous Charges: log one-time fees (Uniforms, Books, etc.) with running monthly total
- PDF Export: generates professional summary of monthly payroll and fee status
- All data persisted to localStorage

### Modify
- N/A

### Remove
- N/A

## Implementation Plan
1. Backend: minimal Motoko backend (data stored in localStorage on frontend)
2. Frontend: single-page React app with tab navigation (Salary | Fee Ledger | Misc Charges)
3. Staff salary table with inline editing and auto-calculation
4. Student fee ledger with search and 12-month toggle grid
5. Misc charges section with add/delete and running total
6. PDF export using browser print or jsPDF
7. All state synced to localStorage
