# Einbürgerungstest

A free app for preparing for the German citizenship test and **Leben in Deutschland**.

**[Use the app at ebtest.org](https://www.ebtest.org/)**

Study questions, practice answers, take timed mock exams, save bookmarks, and
track your progress. Available in German, English, Russian, Ukrainian, Turkish,
and Arabic. Built with React, React Native, and [Uklad](https://github.com/ukladjs/uklad).

## What's in this repository

The public code is available for review and contributions:

- [`packages/shared`](packages/shared): shared state, learning logic, translations, and persistence.
- [`packages/web-app`](packages/web-app): web learning, exam, and settings components, plus browser integration.
- [`packages/mobile-app`](packages/mobile-app): React Native components and platform integration.

## Development

Use Node.js 26.13.1 LTS (pinned in `.nvmrc`) and pnpm 12.21.0.
Patched Node 24 LTS is also supported from 24.22.3 for tools such as Dependabot.

```sh
nvm use
pnpm install --frozen-lockfile
pnpm check
pnpm audit:deps
```

`pnpm check` runs ESLint, Prettier, strict TypeScript checking for the shared
and web packages, and all public package tests. Web checking includes source,
tests, and the Vitest configuration. The optional Expo host
type-checks the native package against its SDK's declarations.

The independent host installations share pnpm's content-addressed virtual store
so identical React packages resolve to one physical instance. Lockfiles remain
independent. Installs enforce the Node engine, a 24-hour release delay, explicit
build-script permissions, and provenance downgrade protection. Use frozen
installs in CI. See [the dependency maintenance policy](tooling/DEPENDENCIES.md)
before changing SDK-constrained versions or temporary overrides.

GitHub Actions runs public checks and dependency audits on Node 24.22.3 and
26.13.1 on pushes, pull requests, and weekly. Dependabot proposes tool and
action updates for review.

## Contributing

Issues and pull requests are welcome, including corrections to translations and
explanations. Questions are based on the [BAMF catalogue](https://www.bamf.de)
dated 7 May 2025; mistakes are possible.

## License

[MIT](LICENSE).
