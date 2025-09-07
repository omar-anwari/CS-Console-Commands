# CS Console Commands Tool
This is my scuffed console command lookup tool for CS2. You can search through 2000+ console commands and see all the info about flags, default values, descriptions, etc. Made this using Next.js for the static site gen and some janky CSV parsing that probably needs optimization.

## Features
- Search through all CS2 console commands
- Filter by command categories (Graphics, Audio, Network, etc)
- Copy commands with one click (with visual feedback)
- Syntax highlighting for command examples
- Expand/collapse for detailed command info
- Quick guide on how to use the console

## Tech Stack
- Next.js (with static export)
- React
- TypeScript
- CSV parsing (homemade parser that's probably causing lag)
- ~~Tailwind CSS~~
    - Inline styles (no Tailwind needed)

## To-Do/Broken
- [x] ~~CSV parsing slow when going through all 2000+ commands~~ → Added virtualization
- [x] ~~No virtualization so it's rendering all commands at once~~ → Fixed with virtual scrolling
- [x] ~~Search doesn't debounce so it lags on every keystroke~~ → Added 300ms debounce
- [ ] Should probably just convert to JSON at build time
    - Need to figure out how not to lose the formatting that the CSV has
- [x] ~~No caching so it parses the CSV every page load~~ → Commands load once on mount


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

The site gets statically exported so you can host it anywhere (GitHub Pages, Vercel, whatever).

## Performance Notes
- Virtual scrolling means we're only rendering ~10-15 commands at a time instead of 2000+
- Search is debounced by 300ms to prevent lag
- Commands are parsed once and cached in memory
- Still need to convert CSV → JSON at build time for even better perf

> This project is for educational and community use only. Just a tool to help players find console commands easier without digging
