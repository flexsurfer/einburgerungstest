# Einbürgerungstest

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Einbürgerungstest is a free, open-source, and user-friendly application for practicing the **"Leben in Deutschland"** test and the **Einbürgerungstest** (German naturalization test) created by a foreigner on a voluntary basis.

Website: [https://www.ebtest.org/](https://www.ebtest.org/)

If you like it, please give it a ⭐ on [GitHub](https://github.com/flexsurfer/einburgerungstest)!

**Disclaimer:** The author takes no responsibility for any mistakes or inaccuracies. Pull requests and issues are welcome.

Questions are based on the official dataset from: [www.bamf.de – Gesamtfragenkatalog zum Test „Leben in Deutschland“ und zum „Einbürgerungstest“, Stand: 07.05.2025](https://www.bamf.de)

The app is available as a web application and a mobile app (Android/iOS) built with React and React Native, sharing common logic via [Reflex](https://github.com/flexsurfer/reflex) library and a monorepo setup.

## Features

- **Practice Questions:** Over 300 questions categorized by topics like Recht, Gesellschaft und Familie, Staat, Politik, etc.
- **Multiple Modes:** 
  - Testing mode for practicing with statistics.
  - Review mode for checking answers.
- **Favorites:** Mark questions as favorites for quick access.
- **Vocabulary:** Multilingual vocabulary support (English, Russian, Arabic, Turkish) for key terms.
- **Offline Support:** Works offline after initial load.
- **Statistics:** Track correct/incorrect answers and accuracy.
- **Images:** Some questions include illustrative images.
- **Categories and Filtering:** Browse questions by category or favorites.

## Tech Stack

- **Frontend:** React (Web), React Native (Mobile)
- **State Management:** [Reflex](https://github.com/flexsurfer/reflex) (custom state management with events, effects, and subscriptions)
- **Build Tools:** Vite (Web), Metro (Mobile)
- **Package Manager:** pnpm
- **Testing:** Vitest

## Installation

### Prerequisites

- Node.js >= 18
- pnpm (install globally: `npm install -g pnpm`)
- For mobile: Android Studio (for Android), Xcode (for iOS), CocoaPods (for iOS)

### Setup

1. Clone the repository:
   ```
   git clone https://github.com/flexsurfer/einburgerungstest.git
   cd einburgerungstest
   ```

2. Install dependencies:
   ```
   pnpm install
   ```

## Usage

- Test: `pnpm test` (runs all tests)

### Web App

- Development: `pnpm dev:web` (runs on http://localhost:4200)
- Build: `pnpm build:web` 

### Mobile App

- Start Metro: `pnpm dev:mobile`
- Run on Android: `pnpm dev:run-android`
- Run on iOS: `pnpm dev:run-ios`
- For iOS, ensure Pods are installed: `cd app/mobile/ios && bundle exec pod install`

### Shared Package

The shared package contains common logic, data, events, and subscriptions used by both web and mobile apps.

- Test shared: `pnpm test:shared`

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

Please ensure your code passes tests and linting.

## License

Distributed under the MIT License. See `LICENSE` for more information.