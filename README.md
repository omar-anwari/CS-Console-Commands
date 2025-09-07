# CS Console Commands Tool
This is my scuffed console command lookup tool for CS2. You can search through 2000+ console commands and see all the info about flags, default values, descriptions, etc. Made this using Next.js for the static site gen and some janky CSV parsing that probably needs optimization.

## Features
- **Search through all CS2 console commands** with real-time filtering
- **Filter by command categories** (Graphics, Audio, Network, Performance, etc)
- **Command Presets** - Pre-configured command bundles for specific use cases (Need to actually fill it out):
  - FPS Boost Config
  - Practice/Training Setup
  - Screenshot Setup
  - More to come later if I can think of other stuff
- **Favorites System** - Save your favorite commands locally in browser storage
- **Batch Operations**:
  - Select multiple commands with checkboxes
  - Export selected commands as autoexec.cfg
  - Copy all selected commands at once
- **Command Details**:
  - Copy commands with one click (with visual feedback)
  - Syntax highlighting for command examples
  - Expand/collapse for detailed command info
  - Flag information with tooltips
  - Default values and ranges
- **Export Options**:
  - Generate autoexec.cfg files from presets
  - Export selected commands as config
  - Export favorite commands
- **Mobile Responsive** - Works on all device sizes
- **Dark Theme** - Easy on the eyes with purple accent colors
- **Performance Optimized** - Virtual scrolling for smooth experience

## Tech Stack
- Next.js (with static export)
- React with TypeScript
- Virtual scrolling for performance
- LocalStorage for persistence
- CSV parsing with caching
- ~~Tailwind CSS~~
    - Custom inline styles with dark theme

## New Features Added
- [x] Command Presets modal with 10+ pre-made configs
- [x] Checkbox selection system for batch operations
- [x] Selected commands panel with management options
- [x] Favorites system with localStorage persistence
- [x] Export functionality for autoexec.cfg generation
- [x] Improved UI/UX with consistent dark theme
- [x] Mobile responsive design
- [x] Better performance with optimizations
- [x] Command categorization system
- [x] Tooltip system for command flags

## To-Do/Broken
- [x] ~~CSV parsing slow when going through all 2000+ commands~~ → Added virtualization
- [x] ~~No virtualization so it's rendering all commands at once~~ → Fixed with virtual scrolling
- [x] ~~Search doesn't debounce so it lags on every keystroke~~ → Added 300ms debounce
- [x] ~~No preset configurations~~ → Added Command Presets feature
- [x] ~~Can't select multiple commands~~ → Added checkbox selection system
- [x] ~~No way to save favorite commands~~ → Added favorites with localStorage
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

## How to Use

### Basic Search
1. Type in the search box to filter commands
2. Use the category dropdown to filter by type
3. Click on any command to expand details
4. Click the copy button to copy a command

### Command Presets
1. Click "Command Presets" button
2. Browse through pre-configured bundles
3. Select commands you want from each preset
4. Generate and download autoexec.cfg file

### Batch Selection
1. Use checkboxes to select multiple commands
2. View selected commands in the side panel
3. Copy all or export as autoexec.cfg
4. Remove individual commands or clear all

### Favorites
1. Click the star icon on any command to favorite it
2. Click "Favorites" button to view only favorited commands
3. Export favorites as a custom autoexec.cfg
4. Favorites persist between sessions in browser storage

## Performance Notes
- Virtual scrolling means we're only rendering ~50 commands at a time instead of 2000+
- Search is debounced by 300ms to prevent lag
- Commands are parsed once and cached in memory
- Smooth animations with CSS transitions
- Efficient state management with React hooks

> This project is for educational and community use only. Just a tool to help players find console commands easier without digging through console or wikis.
