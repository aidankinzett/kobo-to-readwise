# Kobo to Readwise

A desktop application built with Next.js and Tauri to upload your Kobo highlights to Readwise.

## Features

- Modern desktop application using Next.js and Tauri
- Cross-platform support (Windows, macOS, Linux)
- Upload your Kobo highlights to Readwise from a Kobo device or a sqlite database
- Maintains your highlights order (as much as possible, if you have any issues, please let me know)

## Installation

Go to the [releases](https://github.com/aidankinzett/kobo-to-readwise/releases) page to download the latest version for your platform.

## Development

### Prerequisites

Before you begin, ensure you have installed:

- Node.js (LTS)
- pnpm (latest)
- Rust (for Tauri development)
- Platform-specific dependencies for Tauri:
  - Windows: Microsoft Visual Studio C++ Build Tools
  - macOS: Xcode Command Line Tools
  - Linux: `build-essential` package

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd <project-directory>
```

2. Install dependencies:

```bash
pnpm install
```

### Development

Run the development server:

```bash
# Run the desktop application in development mode
pnpm run desktop:dev
```

### Building

Create a production build:

```bash
# Build the application
pnpm tauri build
```

The built applications will be available in the `src-tauri/target/release` directory.

### Project Structure

```
├── src-tauri/          # Rust-based Tauri backend
├── components/         # React components
│   └── ui/            # UI components
├── hooks/             # Custom React hooks
├── lib/              # Utility functions and helpers
├── public/           # Static assets
└── store/            # State management
```

### Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

See LICENSE file for details

## Acknowledgments

- [zakkolar/kobo-to-readwise](https://github.com/zakkolar/kobo-to-readwise) - The original inspiration for this project
- [Next.js](https://nextjs.org/)
- [Tauri](https://tauri.app/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Readwise](https://readwise.io/)
- [Kobo](https://kobo.com/)

## Similar Applications

If you're looking for alternatives, here are some other applications that sync Kobo highlights to Readwise:

- [October](https://github.com/marcus-crane/october)
