---
name: tdd:write-tests
description: Systematically add test coverage for all local code changes using specialized review and development agents. Add tests for uncommitted changes (including untracked files), or if everything is committed, then will cover latest commit.
argument-hint: what tests or modules to focus on
---

# Cover Local Changes with Tests

## User Arguments

User can provide what tests or modules to focus on:

```
$ARGUMENTS
```

If nothing is provided, focus on all changes in current git diff that are not committed. If everything is committed, then will cover latest commit.

## Context

After implementing new features or refactoring existing code, it's critical to ensure all business logic changes are covered by tests. This command orchestrates automated test creation for local changes using coverage analysis and specialized agents.

## Goal

Achieve comprehensive test coverage for all critical business logic in local code changes.

## Important Constraints

- **Focus on critical business logic** - not every line needs 100% coverage
- **Preserve existing tests** - only add new tests, don't modify existing ones
- "Analyse complexity of changes" -
  - if there 2 or more changed files, or one file with complex logic, then **Do not write tests yourself** - only orchestrate agents!
  - if there is only one changed file, and it's a simple change, then you can write tests yourself.

## Workflow Steps

### Preparation

1. **Discover test infrastructure**
   - Read README.md and package.json (or equivalent project config)
   - Identify commands to run tests and coverage reports
   - Understand project structure and testing conventions

2. **Run all tests**
   - Execute full test suite to establish baseline

### Analysis

Do steps 3-4 in parallel using haiku agents:

3. **Verify single test execution**
   - Choose any passing test file
   - Launch haiku agent with instructions to find proper command to run this only test file
     - Ask it to iterate until you can reliably run individual tests
   - After it completes, try running a specific test file if it exists
   - This ensures agents can run tests in isolation

4. **Analyze local changes**
   - Run `git status -u` to identify all changed files (including untracked files)
     - If there are no uncommitted changes, then run `git show --name-status` to get the list of files changed in the latest commit.
   - Filter out non-code files (docs, configs, etc.)
   - Launch separate haiku agent per changed file to analyze file itself, and the complexity of the changes, and prepare short summary of it.
   - Extract list of files with actual logic changes

### Test Writing

#### Simple Single File Flow

If there is only one changed file, and it's a simple change, then you can write tests yourself. Follow this guideline:

1. Read the target file and understand the logic
2. Review existing test files for patterns and style; if none exist, create it.
3. Analyse which test cases should be added to cover the changes.
4. Create comprehensive tests for all identified cases
5. Run the test command identified before.
6. Iterate and fix any issues until all tests pass

Ensure tests are:
  - Clear and maintainable
  - Follow project conventions
  - Test behavior, not implementation
  - Cover edge cases and error paths

#### Multiple Files or Complex File Flow

If there are multiple changed files, or one file with complex logic, use specialized agents:

5. **Launch `code-review:test-coverage-reviewer` agents (parallel)** (Sonnet or Opus models)
   - Launch one coverage-reviewer agent per changed file
   - Provide each agent with:
     - **Context**: What changed in this file (git diff)
     - **Target**: Which specific file to analyze
     - **Resources**: Read README and relevant documentation
     - **Goal**: Identify what test suites need to be added
     - **Output**: List of test cases needed for critical business logic
   - Collect all coverage review reports

6. **Launch `developer` agents for test file (parallel)** (Sonnet or Opus models)
   - Launch one developer agent per changed file that needs tests
   - Provide each agent with:
     - **Context**: Coverage review report for this file
     - **Target**: Which specific file to create tests for
     - **Test cases**: List from coverage-reviewer agent
     - **Resources**: Read README and test examples
     - **Command**: How to run tests for this file
     - **Goal**: Create comprehensive tests for all identified cases
     - **Constraint**: Add new tests, don't modify existing logic (unless clearly broken)

7. **Verify coverage (iteration)** (Sonnet or Opus models)
   - Launch `code-review:test-coverage-reviewer` agents again per file
   - Provide:
     - **Context**: Original changes + new tests added
     - **Goal**: Verify all critical business logic is covered
     - **Output**: Confirmation or list of missing coverage

8. **Iterate if needed**
   - If any files still lack coverage: return to step 5
   - Launch new developer agents only for files with gaps
   - Continue until all critical business logic is covered

9. **Final verification**
   - Run full test suite to ensure all tests pass
   - Generate coverage report if available
   - Verify no regressions in existing tests

## Success Criteria

- All critical business logic in changed files has test coverage ✅
- All tests pass (new and existing) ✅
- Test quality verified by coverage-reviewer agents ✅
