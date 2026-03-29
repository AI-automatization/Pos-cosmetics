---
name: tdd:fix-tests
description: Systematically fix all failing tests after business logic changes or refactoring. Uses parallel agents per failing test file, preserves test intent, avoids changing business logic.
argument-hint: what tests or modules to focus on
---

# Fix Tests

## User Arguments

User can provide focus on specific tests or modules:

```
$ARGUMENTS
```

If nothing is provided, focus on all tests.

## Context

After business logic changes, refactoring, or dependency updates, tests may fail because they no longer match the current behavior or implementation. This command orchestrates automated fixing of all failing tests using specialized agents.

## Goal

Fix all failing tests to match current business logic and implementation.

## Important Constraints

- **Focus on fixing tests** - avoid changing business logic unless absolutely necessary
- **Preserve test intent** - ensure tests still validate the expected behavior
- "Analyse complexity of changes" -
  - if there 2 or more failing files, or one file with complex logic, then **Do not fix tests yourself** - only orchestrate agents!
  - if there is only one failing file, and it's a simple fix, then you can fix tests yourself.

## Workflow Steps

### Preparation

1. **Discover test infrastructure**
   - Read README.md and package.json (or equivalent project config)
   - Identify commands to run tests and coverage reports
   - Understand project structure and testing conventions

2. **Run all tests**
   - Execute full test suite to establish baseline

3. **Identify all failing test files**
   - Parse test output to get list of failing test files
   - Group by file for parallel agent execution

### Analysis

4. **Verify single test execution**
   - Choose any test file
   - Launch haiku agent with instructions to find proper command to run this only test file
     - Ask it to iterate until you can reliably run individual tests
   - After it completes, try running a specific test file
   - This ensures agents can run tests in isolation

### Test Fixing

5. **Launch `developer` agents (parallel)**
   - Launch one agent per failing test file
   - Provide each agent with clear instructions:
     * **Context**: Why this test needs fixing (business logic changed)
     * **Target**: Which specific file to fix
     * **Resources**: Read README and relevant documentation
     * **Command**: How to run this specific test file
     * **Goal**: Iterate until test passes
     * **Constraint**: Fix test, not business logic (unless clearly broken)

6. **Verify all fixes**
   - After all agents complete, run full test suite again
   - Verify all tests pass

7. **Iterate if needed**
   - If any tests still fail: return to step 5
   - Launch new agents only for remaining failures
   - Continue until 100% pass rate

## Success Criteria

- All tests pass ✅
- Test coverage maintained
- Test intent preserved
- Business logic unchanged (unless bugs found)

## Agent Instructions Template

When launching agents, use this template:

```
The business logic has changed and test file {FILE_PATH} is now failing.

Your task:
1. Read the test file and understand what it's testing
2. Read README.md for project context
3. Run the test: {TEST_COMMAND}
4. Analyze the failure - is it:
   - Test expectations outdated? → Fix test assertions
   - Test setup broken? → Fix test setup/mocks
   - Business logic bug? → Fix logic (rare case)
5. Fix the test and verify it passes
6. Iterate until test passes
```
