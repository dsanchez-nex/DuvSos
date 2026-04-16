# DuvSos - Project Documentation

## Overview

Habit tracking application built with Next.js 16, Prisma, and PostgreSQL.

## Tech Stack

- **Frontend**: Next.js 16, React 19, TailwindCSS 4
- **Database**: PostgreSQL (Prisma ORM)
- **Auth**: Custom with jose + bcryptjs

## Project Structure

```
src/
├── app/              # Next.js App Router pages
│   ├── api/          # API routes
│   └── ...
├── components/       # React components
├── lib/             # Utilities (auth, db, utils)
prisma/
└── schema.prisma   # Database schema
```

## Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run db:sync` | Sync Prisma schema to DB |
| `npm run db:migrate` | Create and run migration |
| `npm run build` | Production build |
| `npm run lint` | Lint code |

## Database

### Schema Sync

⚠️ **Important**: When the Prisma schema changes:
1. Run `npm run db:sync` to update the database
2. All developers must run after `git pull`

### Troubleshooting

**Error: Unknown field in model**
```bash
npm run db:sync
```

## Conventions

- Use kebab-case for file names
- ESLint + Prettier for formatting
- Components in `src/components/`
- API routes in `src/app/api/[resource]/route.ts`
- Prisma models in `prisma/schema.prisma`

## Agent Capabilities

This project uses AI-assisted development with OpenSpec. The following workflows are available:

### Workflows (slop/opsx)

- `/opsx:propose` - Create a new change with proposal, design, and tasks
- `/opsx:apply` - Implement tasks from a change
- `/opsx:explore` - Explore and understand the codebase
- `/opsx:archive` - Archive a completed change

### Skills

Skills are loaded by specific agents. Configure them per-agent.

## Agent Sync Script

This project includes a sync script to distribute capabilities to all AI agents. It supports 27+ agents including Claude Code, Cursor, Windsurf, OpenCode, Kiro, and more.

### Usage

```bash
# Sync all agents
node scripts/sync-agents.js

# Sync specific agent
node scripts/sync-agents.js --agent .claude

# Create new agent
node scripts/sync-agents.js --new .windsurf

# Force sync even without OpenSpec installed
node scripts/sync-agents.js --force
```

### How It Works

1. **Source**: All capabilities are stored in `.agent/` folder
2. **Detection**: Agent folders are auto-detected in the project
3. **Mapping**: Each agent has its folder mapping (e.g., workflows → commands for Claude, prompts for Kiro)
4. **OpenSpec Check**: If OpenSpec is not installed, only base skills are synced

### Folder Mapping

| Agent | Skills | Commands/Workflows |
|-------|--------|-------------------|
| Claude, Cursor | `skills/` | `commands/` |
| Kiro | `skills/` | `prompts/` |
| Windsurf | `skills/` | `workflows/` |
| OpenCode | `skills/` | `commands/` |
| *others* | `skills/` | *(agent-specific)* |

See `.agent/agent-config.json` for complete mapping list.

### Adding New Capabilities

1. Add skills/workflows to `.agent/` folder
2. Run `node scripts/sync-agents.js` to distribute to all agents
3. Commit the changes to share with team

### Troubleshooting

**OpenSpec not detected**: Install it globally or run with `--force`
```bash
npm install -g @fission-ai/openspec@latest
node scripts/sync-agents.js --force
```

---
Generated for AI agent onboarding. Update this file when project structure changes.