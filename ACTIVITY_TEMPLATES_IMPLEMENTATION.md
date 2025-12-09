# Project Timeline Activities - Sorting & Templates Implementation

## Summary

Fixed two issues in the Project Timeline page:
1. **Activities now ordered by creation date** (oldest first)
2. **Activity template functionality added** (save/load/manage templates)

---

## Changes Made

### 1. Activity Sorting Fix

**File: `src/services/projectActivitiesService.ts`**
- Changed `getActivitiesByProject()` query to order by `created_at` instead of `section_order` and `activity_order`
- Activities now display in the order they were created

```typescript
// OLD:
.order('section_order', { ascending: true })
.order('activity_order', { ascending: true });

// NEW:
.order('created_at', { ascending: true });
```

---

### 2. Activity Template System

#### New Service: `activityTemplatesService.ts`

Created a new service to manage activity templates with the following functions:

- `getAllActivityTemplates()` - Fetch all templates
- `getActivityTemplateById()` - Fetch specific template
- `createActivityTemplate()` - Save new template
- `updateActivityTemplate()` - Update existing template
- `deleteActivityTemplate()` - Remove template

**Template Structure:**
```typescript
interface ActivityTemplate {
  id: string;
  name: string;
  description?: string;
  activities: ActivityTemplateActivity[];
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}
```

#### Updated: `ProjectTimelinePage.tsx`

**New UI Elements:**
- **Load Template** button (blue) - Load activities from saved template
- **Save Template** button (purple) - Save current activities as template
- **Manage** button (gray) - View and delete existing templates

**New Modal Components:**

1. **Save Template Modal**
   - Input template name and description
   - Saves all current activities (with their titles, descriptions, priorities, and task items)

2. **Load Template Modal**
   - Shows all available templates
   - Click "Load" to add template activities to current project
   - Preserves existing activities (adds to them)

3. **Manage Templates Modal**
   - View all saved templates
   - Preview activity list for each template
   - Delete unwanted templates

**New Functions:**
- `loadActivityTemplates()` - Load templates on page load
- `handleSaveAsTemplate()` - Save current activities as reusable template
- `handleLoadFromTemplate()` - Create activities from template
- `handleDeleteTemplate()` - Remove template

---

## Database Migration

**File: `MIGRATION_ADD_ACTIVITY_TEMPLATES_TABLE.sql`**

Creates `activity_templates` table with:
- `id` (UUID, primary key)
- `name` (template name)
- `description` (optional description)
- `activities` (JSONB array of activity objects)
- `created_by` (user reference)
- `created_at` / `updated_at` timestamps

**RLS Policies:**
- All authenticated users can read templates
- Users can create templates
- Users can only update/delete their own templates

---

## How to Use

### Saving Templates

1. Create activities in a project
2. Click **"Save Template"** button
3. Enter template name and description
4. Click "Save Template"

### Loading Templates

1. Open a project's activities view
2. Click **"Load Template"** button
3. Browse available templates
4. Click "Load" on desired template
5. Activities from template are added to project

### Managing Templates

1. Click **"Manage"** button
2. View all saved templates
3. Preview activities in each template
4. Delete unwanted templates with trash icon

---

## Benefits

1. **Consistent Activity Creation**: Use templates to ensure all projects have standard activities
2. **Time Saving**: Quickly add predefined activities instead of creating each one manually
3. **Best Practices**: Save proven activity sets as templates for reuse
4. **Flexible**: Templates can be loaded into any project and customized as needed

---

## Testing Checklist

- [x] Activities display in creation order (oldest first)
- [ ] Save current activities as template
- [ ] Load template into empty project
- [ ] Load template into project with existing activities
- [ ] Delete template from manage modal
- [ ] Template activities include task items (checkable points)
- [ ] Verify RLS policies work correctly
- [ ] Test with multiple users creating templates

---

## Files Modified

1. `src/services/projectActivitiesService.ts` - Changed sort order
2. `src/services/activityTemplatesService.ts` - NEW - Template CRUD operations
3. `src/pages/ProjectTimelinePage.tsx` - Added template UI and logic
4. `MIGRATION_ADD_ACTIVITY_TEMPLATES_TABLE.sql` - NEW - Database schema

---

## Next Steps

1. **Run the migration** in Supabase SQL Editor:
   ```sql
   -- Copy and execute MIGRATION_ADD_ACTIVITY_TEMPLATES_TABLE.sql
   ```

2. **Test the features**:
   - Create some activities
   - Save as template
   - Load template in another project
   - Verify activities are in correct order

3. **Optional Enhancements** (future):
   - Template categories/tags
   - Share templates with specific users/teams
   - Template marketplace
   - Import/export templates as JSON
   - Template versioning
