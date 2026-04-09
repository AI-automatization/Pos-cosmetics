---
name: dev:create-hook
description: Create and configure Claude Code hooks — PreToolUse, PostToolUse, Stop events. Auto-detects project tooling (TypeScript, ESLint, Prettier) and suggests relevant hooks. Saves to .claude/settings.json.
argument-hint: describe what the hook should do (e.g., "run tsc after every file write", "block dangerous git commands")
---

# Create Claude Code Hook

Creates intelligent hooks for Claude Code workflow automation.

## User Arguments

```
$ARGUMENTS
```

Describe what the hook should do. Examples:
- `run tsc after every file write`
- `block rm -rf commands`
- `run eslint after editing TypeScript files`
- `show git status after bash commands`

## Hook Types

### PreToolUse
Runs **before** a tool executes. Can block the action (exit 2).

```json
{
  "type": "PreToolUse",
  "matcher": "Bash",
  "hooks": [{ "type": "command", "command": "..." }]
}
```

**Use for:**
- Blocking dangerous commands
- Validating before write operations
- Confirming destructive actions

### PostToolUse
Runs **after** a tool executes. Cannot block, provides feedback.

```json
{
  "type": "PostToolUse",
  "matcher": "Write",
  "hooks": [{ "type": "command", "command": "..." }]
}
```

**Use for:**
- Running linters after file edits
- Running type checking after saves
- Updating documentation automatically
- Logging changes

### Stop
Runs when Claude finishes a response.

## Workflow

### Step 1 — Analyze Project

```bash
# Detect tools
ls apps/api/package.json && cat apps/api/package.json | jq '.scripts'
ls .eslintrc* .eslintignore 2>/dev/null
ls tsconfig*.json 2>/dev/null
ls .prettierrc* 2>/dev/null
```

### Step 2 — Suggest Hook

Based on description, design the hook script.

### Step 3 — Create Hook Script

Save to `.claude/hooks/[hook-name].sh`:

```bash
#!/bin/bash
# .claude/hooks/typecheck-on-write.sh
# Runs tsc after TypeScript files are written

# Read tool input from stdin
INPUT=$(cat)
FILE=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

# Only run for TypeScript files in apps/
if [[ "$FILE" == *"apps/"*".ts" ]] || [[ "$FILE" == *"apps/"*".tsx" ]]; then
  cd /c/Users/asus/Desktop/Pos-cosmetics

  # Detect which app
  if [[ "$FILE" == *"apps/api/"* ]]; then
    PROJECT="apps/api/tsconfig.json"
  elif [[ "$FILE" == *"apps/web/"* ]]; then
    PROJECT="apps/web/tsconfig.json"
  else
    exit 0
  fi

  # Run tsc silently, output errors to stderr (visible to Claude)
  RESULT=$(npx tsc --noEmit --project "$PROJECT" 2>&1 | head -20)
  if [ -n "$RESULT" ]; then
    echo "$RESULT" >&2
    echo '{"decision": "block", "reason": "TypeScript errors found — fix before proceeding"}'
    exit 2
  fi
fi

exit 0
```

```bash
chmod +x .claude/hooks/typecheck-on-write.sh
```

### Step 4 — Register in settings.json

Read current `.claude/settings.json`, add hook:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write",
        "hooks": [{
          "type": "command",
          "command": "/c/Users/asus/Desktop/Pos-cosmetics/.claude/hooks/typecheck-on-write.sh"
        }]
      }
    ]
  }
}
```

### Step 5 — Test Hook

Test success scenario:
```bash
# Write a valid TypeScript file and verify hook runs
```

Test failure scenario:
```bash
# Write TypeScript with an error and verify hook blocks
```

## Pre-built Hook Templates for RAOS

### 1. TypeScript Check After Write
```bash
# Blocks on tsc errors in apps/api/ or apps/web/
PostToolUse → Write → run tsc --noEmit
```

### 2. Block Dangerous Git Commands
```bash
# Blocks: git push --force, git reset --hard, prisma migrate reset
PreToolUse → Bash → check for dangerous patterns
```

### 3. ESLint After TypeScript Edit
```bash
# Runs eslint on changed file, shows warnings
PostToolUse → Edit/Write → run eslint $FILE
```

### 4. Auto-format with Prettier
```bash
# Runs prettier on saved file
PostToolUse → Write → run prettier --write $FILE
```

### 5. Remind About Tests
```bash
# After editing service files, remind to run tests
PostToolUse → Edit → if .service.ts modified, suggest /write-tests
```

## Hook Communication Protocol

Exit codes:
- `0` — success, action proceeds
- `2` — block action, stderr = reason shown to Claude

JSON output format (stdout):
```json
{
  "decision": "block",
  "reason": "TypeScript errors found in apps/api/src/catalog.service.ts"
}
```

For feedback only (PostToolUse):
```json
{
  "message": "ESLint: 2 warnings in this file"
}
```
