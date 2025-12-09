# URGENT: Database Setup Required

## ⚠️ The template buttons don't work because the database table doesn't exist yet!

### Quick Fix - Run This SQL in Supabase:

1. **Open Supabase Dashboard** → Go to SQL Editor
2. **Copy and paste** the entire contents of `MIGRATION_ADD_ACTIVITY_TEMPLATES_TABLE.sql`
3. **Click "Run"** or press Ctrl/Cmd + Enter

### Or Run This SQL Directly:

```sql
-- Create activity_templates table
CREATE TABLE IF NOT EXISTS public.activity_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  activities JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_activity_templates_created_by ON public.activity_templates(created_by);
CREATE INDEX IF NOT EXISTS idx_activity_templates_created_at ON public.activity_templates(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_templates_name ON public.activity_templates(name);

-- Enable RLS
ALTER TABLE public.activity_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Allow authenticated users to read activity templates"
  ON public.activity_templates FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to create activity templates"
  ON public.activity_templates FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow users to update their own activity templates"
  ON public.activity_templates FOR UPDATE TO authenticated USING (created_by = auth.uid());

CREATE POLICY "Allow users to delete their own activity templates"
  ON public.activity_templates FOR DELETE TO authenticated USING (created_by = auth.uid());

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.activity_templates TO authenticated;
GRANT SELECT ON public.activity_templates TO anon;
```

### Verify Installation:

After running the SQL, test by running this query:

```sql
SELECT * FROM activity_templates;
```

You should see an empty table (no errors).

---

## Now Test the Buttons:

1. **Open browser console** (F12)
2. **Go to Project Timeline** page
3. **Navigate to a project** with activities
4. **Click "Save Template"**
5. **Check console** - you should see logs like:
   - "Save template clicked"
   - "Creating template..."
   - "Template created: {...}"

If you see errors about "relation does not exist", the migration didn't run properly.

---

## Common Issues:

### Error: "relation 'activity_templates' does not exist"
**Solution:** Run the migration SQL above

### Error: "permission denied for table activity_templates"
**Solution:** Check RLS policies are created correctly

### Error: "Failed to save activity template: ..."
**Solution:** Check browser console for detailed error message

---

## After Setup Works:

1. Remove or comment out console.log statements for cleaner logs
2. Test saving a template
3. Test loading a template
4. Test managing templates (view/delete)

---

**Need help?** Check `ACTIVITY_TEMPLATES_QUICK_START.md` for detailed usage guide.
