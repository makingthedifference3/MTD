# Quick Start Guide: Activity Templates

## 🎯 What's New

### 1. Activities Sort by Creation Order ✅
Activities now appear in the order they were created (oldest first), making it easy to see the natural progression of work.

### 2. Activity Templates System ✅
Save and reuse activity sets across projects!

---

## 🚀 Getting Started

### Step 1: Run Database Migration

1. Open Supabase SQL Editor
2. Copy contents of `MIGRATION_ADD_ACTIVITY_TEMPLATES_TABLE.sql`
3. Execute the SQL
4. Verify table creation: `SELECT * FROM activity_templates;`

---

## 📋 Using Templates

### Save Activities as Template

1. Go to Project Timeline page
2. Navigate to a project with activities
3. Click **"Save Template"** (purple button)
4. Enter:
   - Template name (e.g., "Standard Development Project")
   - Description (optional)
5. Click "Save Template"

**Result**: All current activities (including task items) are saved as a reusable template.

---

### Load Template into Project

1. Go to Project Timeline page
2. Navigate to any project (can be empty or have existing activities)
3. Click **"Load Template"** (blue button)
4. Browse available templates
5. Click **"Load"** on desired template

**Result**: Activities from template are created in the current project. Existing activities remain intact.

---

### Manage Templates

1. Click **"Manage"** (gray button)
2. View all saved templates with previews
3. Delete templates you no longer need (trash icon)

---

## 💡 Use Cases

### Scenario 1: New Project Setup
```
1. Create first project with complete activity list
2. Save as template: "Complete Project Setup"
3. For new projects: Load template → instant activity structure!
```

### Scenario 2: Phase-based Templates
```
- "Phase 1 - Planning"
- "Phase 2 - Development"  
- "Phase 3 - Testing"
- "Phase 4 - Deployment"

Load relevant phase template when needed.
```

### Scenario 3: Role-specific Activities
```
- "PM Activities"
- "Developer Tasks"
- "QA Checklist"

Each team can maintain their standard templates.
```

---

## 🎨 Button Legend

| Button | Color | Icon | Purpose |
|--------|-------|------|---------|
| **Load Template** | Blue | Download | Load saved template |
| **Save Template** | Purple | Save | Save current activities |
| **Manage** | Gray | FileText | View/delete templates |
| **Add Activity** | Green | Plus | Add single activity |

---

## ⚡ Tips & Tricks

1. **Start Small**: Create a simple template first to test the feature
2. **Descriptive Names**: Use clear names like "Website Launch Checklist"
3. **Regular Updates**: Update templates based on lessons learned
4. **Team Standards**: Use templates to enforce team standards
5. **Backup**: Templates are saved in database - no manual export needed

---

## 🔧 Troubleshooting

### Activities not in order?
- Refresh the page
- Activities sort by `created_at` timestamp

### Can't save template?
- Ensure you have at least one activity
- Check if you're logged in
- Verify database migration ran successfully

### Template not loading?
- Check browser console for errors
- Verify RLS policies are enabled
- Ensure project is selected

---

## 📊 Template Data Structure

```typescript
{
  name: "Template Name",
  description: "Optional description",
  activities: [
    {
      title: "Activity Title",
      description: "Activity details",
      priority: "high" | "medium" | "low" | "critical",
      responsible_person: "Person Name",
      items: [
        { text: "Task item 1", order: 1 },
        { text: "Task item 2", order: 2 }
      ]
    }
  ]
}
```

---

## 🎓 Best Practices

✅ **DO:**
- Use clear, descriptive template names
- Add descriptions to explain when to use template
- Review and update templates regularly
- Test templates on non-production projects first

❌ **DON'T:**
- Save incomplete activities as templates
- Use vague names like "Template 1"
- Delete templates still in use
- Load templates without reviewing first

---

## 🔐 Security & Permissions

- All authenticated users can view templates
- Users can only edit/delete their own templates
- Templates are shared across all users (read-only)
- RLS policies ensure data security

---

## 📈 Success Metrics

Track these to measure template effectiveness:
- Time saved per project setup
- Consistency across projects
- Reduction in missing activities
- Team adoption rate

---

## Need Help?

1. Check `ACTIVITY_TEMPLATES_IMPLEMENTATION.md` for technical details
2. Review database table structure in migration file
3. Check browser console for error messages
4. Verify Supabase RLS policies are active
