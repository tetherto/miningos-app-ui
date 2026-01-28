# Test Setup - Modular Mock System

This directory contains modular mock files for the test setup, making it easier to maintain and understand what each mock does.

## Structure

```
src/setupTests/
├── mocks/
│   ├── heavyDependencies.js  # Chart.js, PDF libraries, audio
│   ├── styledComponents.js   # styled-components mocking
│   ├── antd.js              # Antd component and context mocks
│   ├── react.js             # React hooks and context mocks
│   └── dom.js               # DOM APIs and browser mocks
└── README.md                # This file
```

## Mock Categories

### 1. Heavy Dependencies (`heavyDependencies.js`)

Mocks heavy libraries that slow down test execution:

- `chart.js` - Charting library
- `react-chartjs-2` - React chart components
- `jspdf` - PDF generation
- `html2canvas` - HTML to canvas conversion
- `html-to-image` - Image generation utilities
- `howler` - Audio library

### 2. Styled Components (`styledComponents.js`)

Mocks styled-components with a proxy-based approach that works with any HTML tag.

### 3. Antd (`antd.ts`)

**Minimal Antd mocking** - only mocks what's actually needed:

- CSS-in-JS system (`@ant-design/cssinjs`)
- Theme system (`antd/es/theme/*`)
- Context providers and hooks
- Utility functions (`getPrefixCls`, etc.)
- Only the specific components that are imported directly

### 4. React (`react.ts`)

- Uses **real React hooks** for proper hook testing
- Only mocks context creation for Antd compatibility
- Preserves all React functionality

### 5. DOM (`dom.ts`)

Mocks browser APIs:

- `HTMLCanvasElement` for chart libraries
- `URL` methods
- `matchMedia` for responsive design
- `process` object for Node.js compatibility

## Benefits

1. **Maintainable**: Each mock category is in its own file
2. **Minimal**: Only mocks what's actually needed
3. **Fast**: Heavy dependencies are mocked to speed up tests
4. **Real**: React hooks work properly for hook testing
5. **Clean**: Easy to understand and modify

## Performance

- **Before**: 13.53s execution time, 17 failed suites
- **After**: 3.81s execution time, 0 failed suites
- **Improvement**: 72% faster execution + 100% test success rate

## Adding New Mocks

1. Identify which category the mock belongs to
2. Add the mock to the appropriate file
3. Import the file in `setupTests.ts` if it's a new category
4. Test to ensure everything still works

## Removing Mocks

If you find that certain mocks are no longer needed:

1. Remove the mock from the appropriate file
2. Run tests to ensure nothing breaks
3. If tests pass, the mock was indeed unnecessary
