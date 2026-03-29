---
name: security:snyk
description: Snyk-powered vulnerability scanning for pnpm dependencies, Docker images, and infrastructure-as-code. Requires Snyk CLI to be installed and authenticated.
argument-hint: what to scan (deps|docker|iac|code), or leave empty for full scan
---

# Snyk Security Scan

Vulnerability scanning for dependencies, Docker, infrastructure, and code.

## Prerequisites

```bash
# Install Snyk CLI
npm install -g snyk
# or
pnpm add -g snyk

# Authenticate
snyk auth
# Opens browser for Snyk account login

# Verify
snyk --version
```

## User Arguments

```
$ARGUMENTS
```

- `deps` — scan pnpm dependencies (default)
- `docker` — scan Docker images
- `iac` — scan infrastructure (docker-compose, Kubernetes)
- `code` — SAST code scanning
- empty — full scan (all types)

## Scan Types

### 1. Dependency Scan (Most Important)

```bash
# Scan all workspaces
cd /path/to/raos
snyk test --all-projects --detection-depth=4

# Scan specific app
snyk test apps/api --file=apps/api/package.json

# JSON output for CI
snyk test --all-projects --json > snyk-deps-report.json

# Only show high/critical
snyk test --all-projects --severity-threshold=high
```

### 2. Docker Image Scan

```bash
# Build images first
docker build -t raos-api apps/api/

# Scan image
snyk container test raos-api:latest

# With Dockerfile for better results
snyk container test raos-api:latest --file=apps/api/Dockerfile
```

### 3. Infrastructure-as-Code Scan

```bash
# Scan docker-compose and configs
snyk iac test docker/

# Scan specific file
snyk iac test docker/docker-compose.yml
snyk iac test docker/docker-compose.prod.yml
```

### 4. SAST Code Scan

```bash
# Scan source code for vulnerabilities
snyk code test apps/api/src/
snyk code test apps/web/src/
```

## RAOS Full Scan Workflow

```bash
# 1. Dependencies
echo "=== Dependency Scan ==="
snyk test --all-projects --severity-threshold=medium --json > reports/snyk-deps.json

# 2. Code
echo "=== Code SAST ==="
snyk code test apps/api/src/ --json > reports/snyk-code-api.json
snyk code test apps/web/src/ --json > reports/snyk-code-web.json

# 3. Infrastructure
echo "=== IaC Scan ==="
snyk iac test docker/ --json > reports/snyk-iac.json

# 4. Generate HTML report
snyk-to-html -i reports/snyk-deps.json -o reports/snyk-report.html 2>/dev/null || true
```

## Output Interpretation

```
✗ High severity vulnerability found in jsonwebtoken@8.5.1
  Description: Private key exposure
  Info: https://security.snyk.io/vuln/SNYK-JS-JSONWEBTOKEN-3180026
  Introduced through: jsonwebtoken@8.5.1
  Fix: Upgrade to jsonwebtoken@9.0.0
```

## CI/CD Integration

Add to `.github/workflows/security.yml`:

```yaml
- name: Snyk Security Scan
  uses: snyk/actions/node@master
  env:
    SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
  with:
    args: --all-projects --severity-threshold=high
```

## Fix Priorities

| Severity | Action |
|---------|--------|
| **Critical** | Fix immediately before next deploy |
| **High** | Fix within 1 day |
| **Medium** | Fix this sprint |
| **Low** | Track in backlog |

## Monitor Mode (Continuous)

```bash
# Send results to Snyk dashboard for monitoring
snyk monitor --all-projects

# View at: https://app.snyk.io
```

## Common RAOS Fixes

```bash
# Update vulnerable package
pnpm update jsonwebtoken --filter api

# Check if fix available
snyk test --all-projects | grep "Fix available"

# Apply Snyk patches (when upgrade not possible)
snyk protect
```
