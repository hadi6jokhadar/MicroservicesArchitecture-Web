# Documentation Index

Quick reference to all documentation files in this project.

## 📖 Documentation Files

### 🚨 [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - **START HERE IF YOU HAVE ERRORS**

**When to read:** Encountering build errors, serve failures, or any issues.

**Contains:**

- ✅ Missing `@angular/animations` dependency fix
- ✅ Angular Material 20+ M3 theming migration
- ✅ PowerShell path handling with spaces
- ✅ Project.json path resolution
- ✅ Port conflicts, cache issues, import problems
- ✅ Complete diagnostics guide

**Critical errors covered:**

- `Cannot find module '@angular/animations/browser'`
- `Undefined function mat.define-palette()`
- `The current directory isn't part of an Nx workspace`
- `Cannot find tsconfig file`

---

### ⚡ [QUICK_START.md](./QUICK_START.md) - Quick Reference

**When to read:** Daily development, need quick examples.

**Contains:**

- Common commands (serve, build, test, lint)
- Component creation patterns
- Service usage examples
- Routing, guards, interceptors
- Testing examples
- Common issues quick fixes

---

### 🏗️ [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) - Architecture Guide

**When to read:** Understanding project organization, creating new features.

**Contains:**

- Complete folder structure
- Core principles (MINIMAL CODE)
- Naming conventions
- Entity pattern (Interface + Class)
- Signal-based components
- Dependency injection patterns
- Styling guidelines

---

### 🎉 [SETUP_COMPLETE.md](./SETUP_COMPLETE.md) - Setup Summary

**When to read:** Initial setup, understanding what's configured.

**Contains:**

- What was created
- Project structure overview
- Key directories
- Theme usage
- Code standards summary
- Next steps guide
- Critical dependencies list

---

### 📋 [.github/.copilot-instructions.md](../.github/.copilot-instructions.md) - Coding Standards

**When to read:** Before coding, for AI-assisted development.

**Contains:**

- Complete coding standards for GitHub Copilot
- Mandatory patterns (signal inputs/outputs, Interface + Class)
- Component structure
- Service patterns
- Critical errors to avoid
- PowerShell command guidelines
- Angular Material 20+ theming
- Project path rules

---

### 📁 [apps/README.md](../apps/README.md) - Apps Folder Structure

**When to read:** Creating new applications, understanding apps organization.

**Contains:**

- Apps folder structure explanation
- Self-contained app pattern
- How to create new applications
- Port allocation
- Project configuration details

---

### 📘 [README.md](../README.md) - Main Project Overview

**When to read:** First time setup, project introduction.

**Contains:**

- Quick start commands
- Key features
- Project overview
- Links to all documentation
- Technology stack

---

## 🎯 Quick Navigation by Need

### "I'm getting an error"

→ [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)

### "How do I create a component/service?"

→ [QUICK_START.md](./QUICK_START.md)

### "What's the project structure?"

→ [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)

### "What's already set up?"

→ [SETUP_COMPLETE.md](./SETUP_COMPLETE.md)

### "How should I write code?"

→ [.github/.copilot-instructions.md](../.github/.copilot-instructions.md)

### "How do I create a new app?"

→ [apps/README.md](../apps/README.md)

### "I'm just starting"

→ [README.md](../README.md) → [SETUP_COMPLETE.md](./SETUP_COMPLETE.md)

---

## 🚨 Most Important Rules

1. **PowerShell Paths:** Always use quotes for paths with spaces

   ```powershell
   cd "C:\Users\Name With Spaces\..." ; npx nx serve app
   ```

2. **Angular Material 20+:** Use M3 theming API (`mat.define-theme()`)

   ```scss
   $theme: mat.define-theme(
     (
       color: (
         theme-type: light,
         primary: mat.$violet-palette,
       ),
     )
   );
   ```

3. **Angular Animations:** Required dependency for Material

   ```bash
   npm install @angular/animations@~20.3.0
   ```

4. **Project Paths:** Always from workspace root in `project.json`

   ```json
   "tsConfig": "apps/playground/tsconfig.app.json"
   ```

5. **Signal I/O:** NEVER use `@Input()`/`@Output()`
   ```typescript
   userId = input.required<string>();
   userChanged = output<User>();
   ```

---

## 📚 Reading Order for New Team Members

1. Start: [README.md](../README.md)
2. Setup: [SETUP_COMPLETE.md](./SETUP_COMPLETE.md)
3. Quick Ref: [QUICK_START.md](./QUICK_START.md)
4. Deep Dive: [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)
5. Standards: [.github/.copilot-instructions.md](../.github/.copilot-instructions.md)
6. Keep handy: [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)

---

**Last Updated:** November 20, 2025
