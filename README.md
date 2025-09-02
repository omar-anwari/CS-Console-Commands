# CS Console Commands Tool
This is my scuffed console command lookup tool for CS2. You can search through 1,850+ console commands and see all the info about flags, default values, descriptions, etc. Made this using Next.js for the static site gen and some janky CSV parsing that probably needs optimization.

## Features
- Search through all CS2 console commands
- Filter by command flags (cheat, replicated, etc)
- Copy commands with one click

## Tech Stack
- Next.js (with static export)
- TypeScript
- CSV parsing (homemade parser that's probably causing lag)
- Tailwind CSS

## To-Do/Broken
- [ ] CSV parsing slow when going through all 1,850+ commands (speeds up after a sec)
- [ ] No virtualization so it's rendering all commands at once
- [ ] Search doesn't debounce so it lags on every keystroke
- [ ] Should probably just convert to JSON at build time
    - Need to figre out how not to loose the formating that the CSV has
- [ ] No caching so it parses the CSV every page load

## Getting Started
Clone the repo, install dependencies, and run the development server:
```sh
npm install
npm run dev
```

Build for production:
```sh
npm run build
```

> This project is for educational and community use only. Just a tool to help players find console commands easier without digging
