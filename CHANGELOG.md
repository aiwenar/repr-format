# Changelog

## Unreleased

Migrated codebase to TypeScript.

### Additions

- Improved multiline formatting. New formatter option `maxComplexity` can be
  used to control complexity threshold objects must exceed to be formatted over
  multiple lines.

### Fixes

- Fix [@@represent] showing up in ownKeys
- Fix unbounded recursion when formatting reference cycles

## 0.2.0 - 2020-07-28

### Additions

- Added TypeScript typpings.

### Fixes

- Correctly format non-identifier keys.
- Fix crash when formatting objects with a `null` prototype.
- Fix using as a GIT dependency from yarn and yarn 2.
