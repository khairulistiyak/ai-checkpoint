# Dogfooding Test Plan
  
> Test ai-checkpoint by using it to track one phase of its own development.

## Test Scenario
Pick one small enhancement (e.g., add color to error messages) and:

1. Create plan with `./l new-plan color-errors`
2. Write 3-5 atomic steps following RULE 1
3. Execute steps using `./l start`, `./l v`, `./l c`
4. Create checkpoint with `./l cp save "colors added"`
5. Intentionally break something and test `./l cp back --force aicp/X.Y-Z`
6. Verify validation catches >150-line file violations

## Success Criteria
- [ ] All CLI commands work without errors
- [ ] Dashboard updates correctly after each step
- [ ] Validation catches file size violations
- [ ] Checkpoint rollback restores exact state without detaching HEAD
- [ ] No friction or confusion during workflow

## Duration
Run for 1 week minimum, document any rough edges.

## Issues Found
- (Log issues here as they're discovered)
