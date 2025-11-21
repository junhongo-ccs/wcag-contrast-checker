# WCAG Contrast Checker - AI Development Guide

## Project Overview

This is a Figma plugin that calculates the contrast ratio between text and background colors, validating against WCAG 2.1 AA standards (4.5:1 minimum ratio).

**Tech Stack:**
- **Framework:** Create Figma Plugin CLI (`@create-figma-plugin/*`)
- **UI:** Preact (aliased as React in `tsconfig.json`)
- **Language:** TypeScript
- **Build:** Custom build pipeline via `build-figma-plugin`

## Architecture

### Two-Process Model
The plugin uses Figma's standard architecture with two isolated contexts:

1. **Main Thread** (`src/main.ts`): Runs in Figma's sandbox with access to Figma API
   - Handles selection validation
   - Extracts colors from Figma nodes
   - Calculates WCAG contrast ratios
   - Emits results to UI

2. **UI Thread** (`src/ui.tsx`): Runs in iframe with DOM access
   - Preact-based React components
   - Event-driven communication with main thread
   - Displays contrast results and validation status

### Communication Pattern
- UI → Main: `emit<CheckContrastHandler>('CHECK_CONTRAST')`
- Main → UI: `emit<ContrastResultHandler>('CONTRAST_RESULT', result)`
- Event handlers defined in `src/types.ts` using `@create-figma-plugin/utilities`

## Development Workflow

### Build Commands
```bash
npm run build   # Production build with typecheck and minification
npm run watch   # Development mode with auto-rebuild on file changes
```

**Critical:** Always run `npm run watch` during development. The build output (`build/main.js`, `build/ui.js`) is what Figma loads, not the source files.

### Testing in Figma
1. Open Figma desktop app
2. Run "Import plugin from manifest..." from Quick Actions (Cmd+/)
3. Select `manifest.json` from project root
4. Plugin appears in Plugins menu

### Debugging
- **Main thread:** `console.log()` visible in Figma's dev console (Quick Actions → "Show/Hide Console")
- **UI thread:** Standard browser DevTools not available; use `console.log()` which appears in Figma console

## Key Implementation Details

### Color Extraction (`src/main.ts`)
```typescript
// Text color from node.fills (must be SOLID paint type)
extractSolidColor(node.fills)

// Background color traverses parent hierarchy
extractBackgroundColor(node) // Walks up parent chain to find first solid fill
```

**Important:** Only `SolidPaint` types are supported. Gradients and images return error messages.

### WCAG Contrast Calculation
The contrast ratio follows W3C's relative luminance algorithm:

1. **Normalize RGB:** `(0-255) → (0-1)`
2. **Linearize sRGB:** 
   - If `c ≤ 0.03928`: `c / 12.92`
   - Else: `((c + 0.055) / 1.055) ^ 2.4`
3. **Calculate luminance:** `L = 0.2126*R + 0.7152*G + 0.0722*B`
4. **Contrast ratio:** `(L_lighter + 0.05) / (L_darker + 0.05)`

Reference: [WCAG 2.1 Contrast Ratio Definition](https://www.w3.org/TR/WCAG21/#dfn-contrast-ratio)

### UI Styling Constraints
**Critical:** The linter prohibits inline styles. Use external CSS only:

```tsx
// ❌ Forbidden
<div style={{ backgroundColor: color }} />

// ✅ Required pattern
function ColorBox({ color }: { color: RGB }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (ref.current) {
      ref.current.style.backgroundColor = `rgb(${color.r}, ${color.g}, ${color.b})`
    }
  }, [color])
  return <div className="color-box" ref={ref} />
}
```

### TypeScript Configuration
The `tsconfig.json` extends `@create-figma-plugin/tsconfig` with critical additions:

```json
{
  "jsx": "react",
  "jsxFactory": "h",           // Preact's createElement
  "jsxFragmentFactory": "Fragment"
}
```

Without these, JSX fragments (`<>...</>`) will cause compiler errors.

## Common Patterns

### Adding New Event Handlers
1. Define in `src/types.ts`:
   ```typescript
   export interface MyHandler extends EventHandler {
     name: 'MY_EVENT'
     handler: (data: MyData) => void
   }
   ```
2. Main thread: `on<MyHandler>('MY_EVENT', handler)`
3. UI thread: `emit<MyHandler>('MY_EVENT', data)`

### Node Type Guards
Always validate node types before accessing type-specific properties:
```typescript
if (node.type !== 'TEXT') return errorResult
// Now safe to access node.fills, node.characters, etc.
```

### Parent Traversal
Use `node.parent` to walk up the hierarchy. Check for `null` (reached PageNode):
```typescript
let parent = node.parent
while (parent && parent.type !== 'PAGE') {
  // Process parent
  parent = parent.parent
}
```

## Project Conventions

- **Error Handling:** Return structured `ContrastResult` objects with `success: false` and `errorMessage` rather than throwing exceptions
- **Color Format:** Internal RGB uses 0-255 integers; Figma API uses 0-1 floats (convert with `Math.round(value * 255)`)
- **UI States:** Use React hooks (`useState`, `useEffect`) for managing async results and loading states
- **Manifest Updates:** When changing plugin name/UI dimensions, update both `package.json` (`figma-plugin` section) and `manifest.json`

## Known Issues

### UI Rendering Bug (Historical)
Previous versions had `DOMException: removeChild` errors. Fixed by:
1. Using proper JSX Fragment configuration in `tsconfig.json`
2. Adding non-null assertion to render target: `render(<App />, document.getElementById('react-page')!)`

If UI doesn't appear, verify `build-figma-plugin.ui.js` contains:
```javascript
module.exports = function (buildOptions) {
  return {
    ...buildOptions,
    define: { global: 'window' }
  }
}
```

## Resources

- [Create Figma Plugin Docs](https://yuanqing.github.io/create-figma-plugin/)
- [Figma Plugin API](https://figma.com/plugin-docs/)
- [WCAG 2.1 Guidelines](https://www.w3.org/TR/WCAG21/)
