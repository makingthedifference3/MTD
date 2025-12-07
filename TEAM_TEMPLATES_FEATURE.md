# Team Templates Feature - Documentation

## Overview
The Team Templates feature allows you to save and reuse team member configurations across multiple projects. This eliminates the repetitive task of adding the same team members to similar projects.

## Features

### 1. **Save Team Templates**
- Save the current team member configuration as a reusable template
- Add a custom name and optional description
- Templates are stored in the database and shared across all projects

### 2. **Load Team Templates**
- Quick-load saved templates with a single click
- Dropdown showing all available templates with member counts
- Templates populate team members with their assigned roles

### 3. **Manage Templates**
- View all saved templates with full details
- See team members and their roles in each template
- Delete templates you no longer need
- Load templates directly from the management modal

## How to Use

### Creating a Template

1. **Add Team Members to Project**
   - Open the Add/Edit Project modal
   - In the "Project Team" section, add team members with their roles
   - You can add as many members as needed

2. **Save as Template**
   - Click the **"💾 Save Current Team as Template"** button
   - Enter a template name (e.g., "Standard Project Team", "Infrastructure Team")
   - Optionally add a description explaining when to use this template
   - Click **"Save Template"**

### Loading a Template

**Option 1: From Project Form**
1. Open the Add/Edit Project modal
2. In the "Project Team" section, find the **"Load Team Template"** dropdown
3. Select a template from the list
4. Team members will be automatically populated
5. You can still add/remove members as needed

**Option 2: From Template Manager**
1. Click **"Manage Templates"** link in the Project Team section
2. Browse all available templates
3. Click **"Load This Template"** on any template
4. The modal closes and team members are populated

### Managing Templates

1. Click **"Manage Templates"** link in the Project Team section
2. View all saved templates with:
   - Template name and description
   - List of team members with their roles
   - Member count
3. **Delete a template**: Click the trash icon next to any template
4. **Load a template**: Click "Load This Template" button

## Database Schema

### Table: `team_templates`

```sql
CREATE TABLE team_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  members JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Members JSON Structure

```json
[
  {
    "user_id": "uuid-of-user",
    "role": "project_manager"
  },
  {
    "user_id": "uuid-of-user",
    "role": "team_member"
  }
]
```

## Files Modified/Created

### New Files
1. **`src/services/teamTemplatesService.ts`**
   - Service layer for template CRUD operations
   - Functions: `getAllTeamTemplates`, `createTeamTemplate`, `deleteTeamTemplate`

2. **`MIGRATIONS/005_create_team_templates.sql`**
   - Database migration to create the team_templates table
   - Includes RLS policies for security

### Modified Files
1. **`src/pages/ProjectsPage.tsx`**
   - Added template state management
   - Added UI for load/save/manage templates
   - Added handler functions for template operations
   - Added Save Template Modal
   - Added Manage Templates Modal

## Technical Implementation

### State Management
```typescript
const [teamTemplates, setTeamTemplates] = useState<TeamTemplate[]>([]);
const [templatesLoading, setTemplatesLoading] = useState(false);
const [showSaveTemplateModal, setShowSaveTemplateModal] = useState(false);
const [showManageTemplatesModal, setShowManageTemplatesModal] = useState(false);
const [newTemplateName, setNewTemplateName] = useState('');
const [newTemplateDescription, setNewTemplateDescription] = useState('');
```

### Handler Functions

#### `handleLoadTemplate(templateId: string)`
- Finds template by ID
- Maps template members to form data structure
- Updates formData state with team members

#### `handleSaveTemplate()`
- Validates template name and team members
- Creates template with current team configuration
- Refreshes template list
- Shows success/error messages

#### `handleDeleteTemplate(templateId: string)`
- Confirms deletion with user
- Deletes template from database
- Refreshes template list

### Security (RLS Policies)

1. **View**: All authenticated users can view all templates
2. **Create**: All authenticated users can create templates
3. **Update**: Users can only update templates they created
4. **Delete**: Users can only delete templates they created

## Benefits

### Time Savings
- **Before**: Add 5 team members × 10 projects = 50 manual selections
- **After**: Save template once + Load template 10 times = 11 clicks

### Consistency
- Ensures consistent team structures across similar projects
- Reduces human error in team assignments
- Standardizes team roles and responsibilities

### Flexibility
- Can still modify team members after loading template
- Multiple templates for different project types
- No impact on existing project creation flow

## Example Use Cases

### 1. Infrastructure Projects
**Template**: "Infrastructure Team"
- Project Manager: Ravi Kumar
- Site Engineer: Site Engineer A
- Accountant: Accountant A

### 2. Education Projects
**Template**: "Education Team"
- Project Manager: Project Manager B
- Team Lead: Team Member B
- Coordinator: Team Member C

### 3. Health Projects
**Template**: "Health Initiative Team"
- Project Manager: Project Manager C
- Medical Coordinator: Team Member D
- Accountant: Accountant B

## Future Enhancements (Optional)

1. **Edit Templates**: Modify existing templates without deleting/recreating
2. **Template Sharing**: Share templates between organizations
3. **Template Analytics**: Track which templates are used most
4. **Template Categories**: Organize templates by project type
5. **Default Template**: Set a template as default for new projects
6. **Template Permissions**: Fine-grained access control for templates

## Troubleshooting

### Template not appearing in dropdown
- **Solution**: Refresh the page or re-open the modal to reload templates

### Can't save template
- **Cause**: No team members selected or template name is empty
- **Solution**: Add at least one team member and provide a template name

### Deleted template still shows
- **Solution**: Close and reopen the modal to refresh the template list

### Template members not loading
- **Cause**: User IDs in template don't match active users
- **Solution**: Ensure all users in the template are still active in the system

## API Reference

### `getAllTeamTemplates(): Promise<TeamTemplate[]>`
Fetches all team templates ordered by name.

### `createTeamTemplate(input: CreateTeamTemplateInput): Promise<TeamTemplate>`
Creates a new team template with the provided configuration.

**Input:**
```typescript
{
  name: string;
  description?: string;
  members: Array<{
    user_id: string;
    role: ProjectTeamRole;
  }>;
  created_by?: string;
}
```

### `deleteTeamTemplate(templateId: string): Promise<void>`
Deletes a team template by ID.

## Migration Instructions

### Run the SQL Migration

1. **Via Supabase Dashboard**:
   - Go to SQL Editor
   - Copy contents of `MIGRATIONS/005_create_team_templates.sql`
   - Execute the script

2. **Via Supabase CLI**:
   ```bash
   supabase db push MIGRATIONS/005_create_team_templates.sql
   ```

3. **Verify Migration**:
   ```sql
   SELECT * FROM team_templates;
   ```

## Notes

- Templates are global and shared across all users in the organization
- Deleting a user does NOT delete templates (created_by is SET NULL)
- Template members must be active users in the system
- Loading a template replaces ALL current team members
- You can manually adjust team members after loading a template
