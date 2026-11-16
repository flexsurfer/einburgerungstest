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

Requires Node.js 22.18+ and pnpm 11.24.0.

```sh
pnpm install --frozen-lockfile
pnpm test:shared
pnpm test:web-app
```

## Contributing

Issues and pull requests are welcome, including corrections to translations and
explanations. Questions are based on the [BAMF catalogue](https://www.bamf.de)
dated 7 May 2025; mistakes are possible.

## License

[MIT](LICENSE).
