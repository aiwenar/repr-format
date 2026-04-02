# Changelog

## Unreleased

## 0.3.0 - 2020-08-14

Migrated codebase to TypeScript.

### Additions

- Improved multiline formatting. New formatter option `maxComplexity` can be
  used to control complexity threshold objects must exceed to be formatted over
  multiple lines.
- Show when formatted value includes multiple references to the same object.
- Show when formatted value is a proxy (in Node.js).
- Formatters for primitive wrapper objects: `Boolean`, `Number`, and `String`.
- Formatter for `Error`s.
- Include `Symbol.toStringTag` in object's name.
- Interface for applying colour and styles.
- `console.repr` extension for Node.js and browser.

### Fixes

- Fix [@@represent] showing up in ownKeys
- Fix unbounded recursion when formatting reference cycles
- Fix crash when formatting BigInts.
- Fix crash when an error is raised during formatting.
- Skip non-enumerable properties.

## 0.2.0 - 2020-07-28

### Additions

- Added TypeScript typpings.

### Fixes

- Correctly format non-identifier keys.
- Fix crash when formatting objects with a `null` prototype.
- Fix using as a GIT dependency from yarn and yarn 2.
