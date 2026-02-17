# 📁 Project Management System - User Guide

## What's New

Your Voice Over System now includes **Project Management**! You can:
- ✅ Create projects for different voiceover jobs
- ✅ Organize scripts by project
- ✅ Store all voiceovers and files per project
- ✅ Delete projects and clean up

## How to Use

### 1. Create a New Project

1. Look at the left sidebar - you'll see "📁 Projects"
2. Click "+ New Project" button
3. Enter project name (e.g., "Commercial for XYZ", "Cartoon Scene 5")
4. Optionally add a description
5. Click "Create"

### 2. Select a Project

- Click on any project card in the sidebar
- The main area shows the project's workspace
- You'll see the project name at the top

### 3. Generate Voiceovers

Once a project is selected:
1. Write your script in the textarea
2. Select a voice from the dropdown
3. Select an emotion
4. Click "🎬 Generate Voiceover"

The voiceover will be automatically saved to your project!

### 4. View Saved Voiceovers

All generated voiceovers appear in the "📁 Saved Voiceovers" section at the bottom.

For each voiceover you'll see:
- Filename
- Voice used
- Emotion applied
- Script preview
- Play button (▶) - for preview
- Delete button (🗑️) - to remove

### 5. Manage Projects

- **View stats**: Each project card shows number of voiceovers and files
- **Delete**: Click 🗑️ on a project card (ask for confirmation)
- **Edit**: Click on project to select it and work on it

## File Organization

Each project has this structure:

```
projects/
└── my-project-id/
    ├── project.json          ← Project metadata
    ├── voiceovers/           ← Generated audio files
    ├── files/                ← Uploaded media files
    └── drafts/               ← Work in progress
```

## API Endpoints

### Projects
- `GET /api/projects` - List all projects
- `POST /api/projects` - Create new project
- `GET /api/projects/{id}` - Get project details
- `PUT /api/projects/{id}` - Update project
- `DELETE /api/projects/{id}` - Delete project

### Project Voiceovers
- `GET /api/projects/{id}/voiceovers` - List voiceovers
- `POST /api/projects/{id}/voiceovers` - Save voiceover
- `DELETE /api/projects/{id}/files/{name}` - Delete file

## Features

✅ **Create/Delete Projects**
- Organize by client, campaign, or scene
- Clean directory structure

✅ **Auto-save to Project**
- Generate voiceover → auto-saved to project
- No extra steps needed

✅ **Project History**
- All voiceovers stored per project
- Easy to find and reuse

✅ **Stats Dashboard**
- See project stats at a glance
- Number of voiceovers and files per project

✅ **Responsive Design**
- Works on desktop, tablet, mobile
- Sidebar collapses on small screens

## Storage Location

All projects stored in:
```
C:\voice over system\projects\
```

Each project folder contains:
- `project.json` - metadata
- `voiceovers/` - audio files
- `files/` - uploaded files
- `drafts/` - work in progress

## Workflow Example

### Scenario: Create a Commercial Voiceover

1. **Create Project**
   - Name: "Car Ad - Q1 2026"
   - Description: "Luxury sedan commercial"

2. **Add Voiceovers**
   - Script: "Experience luxury like never before"
   - Voice: "Male Narrator"
   - Emotion: "Serious"
   - Generate → Auto-saved

3. **Add More Variations**
   - Same script, try different emotions
   - Try different voices
   - All saved to same project

4. **Review & Download**
   - All voiceovers in project history
   - Compare different versions
   - Download best one

5. **Archive**
   - When done, keep in project or delete

## Tips & Tricks

### Tip 1: Project Naming
Use clear, descriptive names:
- ✅ "Nike Ad - Emotional" 
- ✅ "Cartoon S05E03"
- ❌ "Test" or "Voiceover 1"

### Tip 2: Batch Generation
Create multiple versions quickly:
1. Write script once
2. Generate with different voices
3. Generate with different emotions
4. Compare in project history

### Tip 3: Organization
Create projects by:
- Client/Brand
- Campaign/Project
- Scene/Chapter
- Date/Quarter

### Tip 4: Archiving
Keep completed projects for reference, delete old drafts to save space

## Troubleshooting

**Q: Can't see my projects?**
A: Projects are stored in `C:\voice over system\projects\`. Make sure directory exists.

**Q: Where are my voiceovers saved?**
A: In `projects/{project-id}/voiceovers/` folder.

**Q: Can I rename a project?**
A: Edit the project - click it, then update name (coming in next update).

**Q: Can I move voiceovers between projects?**
A: Not yet - copy script and regenerate in target project.

**Q: How do I export all voiceovers?**
A: Check the `projects/` folder - each voiceover is saved as separate file.

## What's Next

Future enhancements:
- [ ] Download all project files as ZIP
- [ ] Export to various formats (WAV, OGG, etc.)
- [ ] Share projects with team members
- [ ] Project templates
- [ ] Batch generation from CSV
- [ ] Version control for voiceovers

## Support

- All projects stored locally in `C:\voice over system\projects\`
- Check project.json for metadata
- Check voiceovers/ folder for audio files
- API available at `/api/projects`

---

**Status**: Project Management System Ready ✅
**Location**: `C:\voice over system\projects\`
**API**: `/api/projects`
