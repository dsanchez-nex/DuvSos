# Conventional Commits — DuvSos

## Format

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

## Types

| Type | When |
|---|---|
| `feat` | New feature or page |
| `fix` | Bug fix |
| `style` | CSS/UI changes only (no logic) |
| `refactor` | Code restructure without behavior change |
| `docs` | Documentation or skills only |
| `chore` | Config, dependencies, build, tooling |
| `test` | Adding or updating tests |
| `perf` | Performance improvement |

## Scopes

Use the area of the app affected:

| Scope | Covers |
|---|---|
| `ui` | Components, styles, layout |
| `auth` | Login, register, session, middleware |
| `habits` | Habits feature (API + components) |
| `todos` | Todos feature (API + components) |
| `settings` | Settings page and preferences |
| `theme` | Theme system (dark/light/system) |
| `api` | API routes only |
| `db` | Prisma schema, migrations, db config |
| `sidebar` | Navigation sidebar |
| `skills` | Kiro skills files |

Multiple scopes: `fix(theme,settings): ...`

## Rules

- Description in lowercase, no period at end.
- Max 72 characters for first line.
- Use imperative mood: "fix bug" not "fixed bug" or "fixes bug".
- Body explains WHY, not WHAT (the diff shows what).
- Breaking changes: add `!` after type/scope: `feat(api)!: change response format`
- Reference issues in footer: `Closes #123`

## Examples

```
feat(todos): add always-visible input with keyboard shortcut

fix(theme): switch to class-based dark mode for tailwind v4

style(ui): add dark mode support to habit components

refactor(api): use deleteMany for atomic todo deletion

docs(skills): add ui style guide and theme system skills

chore(db): setup local postgresql and regenerate migrations
```

## Multi-scope Commits

When a commit touches many areas, use the most relevant type and scope, then list details in the body:

```
fix(ui): fix dark mode and styling across multiple components

- Replace green background-dark (#132210) with neutral gray (#111827)
- Add dark: variants to HabitCard, HabitForm, HabitList, LoginPage
- Replace hardcoded bg-blue-600 with bg-primary token
- Remove unused ThemeProvider component
```

---

## Pull Requests

### Title

Use the branch name as the PR title: `fix/fix-generales`

### Description

Use this template:

```markdown
## Summary

Brief description of what this PR does and why.

## Changes

### <type>: <area>
- Change 1
- Change 2

### <type>: <area>
- Change 1
- Change 2

## Notes

Any context, caveats, or follow-up items.
```

### Rules

- Group changes by commit/area, not by file.
- Each group header matches its commit type and scope.
- Use bullet points, keep them concise.
- Add a Notes section only if there are caveats or follow-ups.
