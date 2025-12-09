# Testing Activity Templates

## Step-by-Step Testing Guide

### Prerequisites ✅
- [ ] Migration SQL has been run in Supabase
- [ ] Browser console is open (F12)
- [ ] You're logged into the app

---

## Test 1: Save Template Button Click

1. **Navigate to Project Timeline**
2. **Select a CSR Partner** → Subcompany (if any) → Folder → Project
3. **Add at least 2-3 activities** if none exist
4. **Click "Save Template"** (purple button)
5. **Check console output:**

**Expected Console Logs:**
```
Save template clicked {newTemplateName: "", activitiesCount: 3}
```

**If you see this:** ✅ Button click works!

**If nothing in console:** ❌ Check:
- Is button visible?
- Did page load completely?
- Any JavaScript errors?

---

## Test 2: Save Template Form

1. **Click "Save Template"** button
2. **Modal should appear** with form
3. **Enter template name:** "Test Template"
4. **Enter description (optional):** "My first test"
5. **Click "Save Template"** inside modal
6. **Check console output:**

**Expected Console Logs:**
```
Save template clicked {newTemplateName: "Test Template", activitiesCount: 3}
Creating template...
Template created: {id: "...", name: "Test Template", ...}
```

**Expected Alert:**
```
Activity template saved successfully!
```

**If you see error about "relation does not exist":**
❌ Migration SQL was not run! See DATABASE_SETUP_REQUIRED.md

---

## Test 3: Load Template

1. **Click "Load Template"** (blue button)
2. **Modal should appear** with list of templates
3. **Should see your saved template** ("Test Template")
4. **Click "Load"** button
5. **Check console output:**

**Expected Console Logs:**
```
Load template clicked {templateId: "..."}
Found template: {id: "...", name: "Test Template", activities: [...]}
Loading activities from template...
```

**Expected Alert:**
```
Activities loaded from template successfully!
```

---

## Test 4: Manage Templates

1. **Click "Manage"** (gray button)
2. **Modal should appear** with all templates
3. **Should see "Test Template"** with preview of activities
4. **Click trash icon** to delete
5. **Confirm deletion**

**Expected Alert:**
```
Template deleted successfully
```

---

## Common Issues & Solutions

### Issue: No console logs when clicking buttons
**Cause:** JavaScript not loading or page error
**Fix:** 
- Refresh page
- Check browser console for red errors
- Clear browser cache

### Issue: "relation 'activity_templates' does not exist"
**Cause:** Database migration not run
**Fix:** 
1. Open Supabase Dashboard → SQL Editor
2. Run `MIGRATION_ADD_ACTIVITY_TEMPLATES_TABLE.sql`
3. Refresh your app

### Issue: "Permission denied for table activity_templates"
**Cause:** RLS policies not set up correctly
**Fix:**
- Re-run migration SQL
- Check user is authenticated
- Verify RLS policies in Supabase

### Issue: Modal appears but nothing happens on save
**Cause:** Template name is empty
**Fix:** Enter a template name before clicking save

### Issue: Activities not loading from template
**Cause:** Template has no activities or wrong format
**Fix:** 
- Check template in Supabase database
- Verify `activities` column has JSONB array
- Re-save template

---

## Verification Queries (Run in Supabase SQL Editor)

### Check if table exists:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name = 'activity_templates';
```

### Check templates:
```sql
SELECT id, name, description, 
       jsonb_array_length(activities) as activity_count,
       created_at 
FROM activity_templates 
ORDER BY created_at DESC;
```

### Check template activities detail:
```sql
SELECT 
  name,
  jsonb_pretty(activities) as activities_detail
FROM activity_templates 
WHERE name = 'Test Template';
```

### Check RLS policies:
```sql
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename = 'activity_templates';
```

---

## Success Criteria ✅

All tests pass when:
- [x] Save Template button shows modal
- [x] Template saves successfully with alert
- [x] Load Template shows saved templates
- [x] Template loads activities into project
- [x] Manage Templates shows all templates
- [x] Can delete templates
- [x] No errors in console
- [x] Activities maintain order

---

## Debug Mode

If still having issues, enable detailed logging:

1. Open `src/services/activityTemplatesService.ts`
2. Logs are already added with console.log and console.error
3. Check browser console for detailed messages

**Look for:**
- "❌ DATABASE TABLE MISSING!" - Run migration
- "Error fetching activity templates" - Check Supabase connection
- "Failed to save activity template" - Check data format

---

## Next Steps After Success

1. Remove debug console.log statements (optional)
2. Create real templates for your projects
3. Share templates with team
4. Document your template naming conventions

---

**Still stuck?** Check these files:
- `DATABASE_SETUP_REQUIRED.md` - Setup instructions
- `ACTIVITY_TEMPLATES_QUICK_START.md` - User guide
- `ACTIVITY_TEMPLATES_IMPLEMENTATION.md` - Technical details
