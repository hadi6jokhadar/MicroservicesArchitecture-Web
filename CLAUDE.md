# Frontend — Claude Code Instructions

## Documentation — ALWAYS READ FIRST

Before writing any code, confirm you have read all files below. State this explicitly.

| # | File | Purpose |
|---|---|---|
| 1 | `.claude/instructions/Angular.instructions.md` | Angular workflow & mandatory rules |
| 2 | `.claude/instructions/Zardui-Strict.instructions.md` | Zardui component usage rules |
| 3 | `Doc/ZARDUI_AI_REFERENCE.md` | Complete Zardui component reference **(MANDATORY before any `z-*` usage)** |
| 4 | `Doc/TRANSLATION_SYSTEM_GUIDE.md` | Translation system & RTL support **(CRITICAL)** |
| 5 | `Doc/DIALOG_DESIGN_GUIDE.md` | Dialog component patterns |
| 6 | `Doc/FEATURE_FLAGS_GUIDE.md` | Feature flags directive, guard, and service |

## Critical Errors to Avoid

- **PowerShell**: Use `;` not `&&` to chain commands. Quote paths with spaces.
- **Project paths**: All paths in `project.json` must be relative to the **workspace root**.
- **Zardui verification (MANDATORY)**: Before using ANY `z-*` selector, verify the selector AND every input used exists in `Doc/ZARDUI_AI_REFERENCE.md`. Never invent selectors.

## Core Principle: MINIMAL CODE

No over-engineering, no unnecessary abstractions, no test infrastructure.

## Form Field → Zardui Component Mapping (MANDATORY)

| Field type | Zardui component | Notes |
|---|---|---|
| Text / email / password | `z-input` | Always inside `z-form` |
| Long text | `z-input` with `zType="textarea"` | |
| Single select (short list) | `z-select` with `z-select-item` | Never use empty string for "all" — use `"all"` sentinel |
| Searchable / long list | `z-combobox` or `z-command` | |
| Date | `z-date-picker` | `z-calendar` only for standalone display |
| Boolean on/off (settings) | `z-switch` | |
| Boolean pressable (toolbar) | `z-toggle` | |
| Multiple choice | `z-checkbox` group | |
| Single choice from set | `z-radio` group | |
| Range / numeric | `z-slider` | |
| Segmented choice | `z-segmented` | |
| File upload | `z-input` with `zType="file"` | |

## Feedback Pattern Rules

| Situation | Correct component | Never use |
|---|---|---|
| Async action result (save, delete, submit) | `toast` via `ngx-sonner` | `z-alert` |
| Destructive action confirmation | `ZardAlertDialogService.confirm()` | `window.confirm()` |
| Persistent inline page-level message | `z-alert` | `z-toast` |
| Form field validation error | `z-form` error slot | `z-alert` |
| Contextual info on hover (short text) | `z-tooltip` | `z-popover` |
| Rich contextual content on click | `z-popover` | `z-tooltip` |
| Full workflow / multi-step / large form | `z-dialog` or `z-sheet` | `z-alert-dialog` |
| Quick info panel from edge | `z-sheet` | `z-dialog` |

## Page Template Output Rules (MANDATORY)

- Every `z-*` selector verified against `Doc/ZARDUI_AI_REFERENCE.md` before use
- All form fields inside `z-form` with `formControlName` (typed `FormGroup`)
- `z-skeleton` for loading states — not spinners or `*ngIf` flicker
- `z-empty` for empty list/table states
- `z-toaster` placed once in the app shell only — never per-page
- Responsive layout: Desktop → Tablet → Mobile via CSS media queries
- Logical CSS properties in all custom styles (`margin-inline` not `margin-left`)
- Never hardcode colors — CSS variables only
- Never use `[(ngModel)]` on any form field
- Never invent a `z-*` input not in `Doc/ZARDUI_AI_REFERENCE.md`

## Best Practices Checklist

Before marking any task complete:

1. No unused imports, no dead code, no over-abstraction
2. Every UI element uses a `z-*` component if one exists
3. Every `z-*` selector checked against `Doc/ZARDUI_AI_REFERENCE.md`
4. Typed `FormGroup` used — no `ngModel` anywhere
5. `input()` and `output()` signals used exclusively — no `@Input()`/`@Output()`
6. Change detection set to `OnPush` on every component
7. Interface + Class pattern used for every model
8. Desktop, Tablet, and Mobile layouts handled
9. All custom styles use CSS logical properties
10. No `.spec.ts`, `jest.config.ts`, or e2e files created

## Anti-Patterns

| Anti-pattern | Correct approach |
|---|---|
| Custom buttons / inputs / cards | `z-button`, `z-input`, `z-card` |
| `@Input()` / `@Output()` | `input()` / `output()` signals |
| `[(ngModel)]` on forms | Typed `FormGroup` with `formControlName` |
| `window.confirm()` | `ZardAlertDialogService.confirm()` |
| `z-toast` for persistent messages | `z-alert` for persistent, `z-toast` for transient |
| `z-alert-dialog` for large workflows | `z-dialog` or `z-sheet` |
| `z-calendar` for date input | `z-date-picker` |
| Hardcoded colors | CSS variables only |
| Physical CSS properties | Logical properties (`margin-inline-start`) |
| `@apply` in SCSS | Keep Tailwind in `.css` files |
| Style `:host` with wrapper divs | Style `:host` directly |
| `any` type | Explicit TypeScript types |
| NgModules | Standalone components only |
| `.spec.ts` / test files | Skip entirely |
| Inventing `z-*` inputs | Verify in `Doc/ZARDUI_AI_REFERENCE.md` |

## Auto-Maintenance Rules

After completing ANY task, self-check and update ALL affected files. These are **required** steps — a task is not done until they are complete.

| Change Made | File(s) to Update | Section |
|---|---|---|
| New/deleted/renamed `Doc/*.md` | This file | "Documentation" reading list |
| New/deleted/renamed `Doc/*.md` | Root `CLAUDE.md` | "Key File Locations" table |
| New Zardui component installed | This file | Available Zardui Components |
| New lib added to `libs/` | This file | Project Structure |
| New page/feature pattern discovered | `.claude/instructions/Angular.instructions.md` | Relevant section |
| New Zardui usage rule discovered | `.claude/instructions/Zardui-Strict.instructions.md` | Relevant section |
| Translation keys added | `apps/admin/src/assets/i18n/en.json` + `ar.json` | Respective key sections |
| New anti-pattern discovered | `.claude/instructions/Angular.instructions.md` | "Common Pitfalls to Avoid" |

---

@../.claude/instructions/terminal.instructions.md
@.claude/instructions/Angular.instructions.md
@.claude/instructions/Zardui-Strict.instructions.md
