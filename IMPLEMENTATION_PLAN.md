# Implementation Plan for Expense Management Enhancements

## Changes Required:

### 1. ProjectExpenses.tsx - New Expense Modal
- [ ] Add "Others" option to CSR Partner dropdown
- [ ] Add "Others" option to Project dropdown  
- [ ] Add Budget Category dropdown (after project selection)
- [ ] Add Budget Subcategory dropdown (hierarchical based on parent)
- [ ] Add custom input fields when "Others" is selected
- [ ] Fetch budget categories for selected project

### 2. AdminExpensesPage.tsx
- [ ] Keep approved expenses visible in table (don't filter them out)
- [ ] Update stats cards after approval action
- [ ] Add "Bulk Approve" button above table
- [ ] Implement bulk approve functionality with confirmation
- [ ] Show checkboxes for expense selection

### 3. AccountantExpensesPage.tsx - Modal Enhancements
- [ ] Detect if CSR Partner/Project/Toll is "Others"
- [ ] Show dropdown + custom input for editing these fields
- [ ] Fetch and display budget categories
- [ ] Show budget category hierarchy (parent → child → subchild)
- [ ] Add budget category filters (parent, child, subchild levels)
- [ ] Allow accountant to change/update these fields before accepting

## Database Schema Notes:
- budget_categories table has parent_id for hierarchy
- csr_partner_id, toll_id, project_id are in project_expenses
- budget_category_id field exists in project_expenses table
