# Portfolio Module Temp Folder

This folder is for temporary, experimental, and debug work specific to the Portfolio Manager module.

## Usage

- Experimental components and features
- Debug utilities and helpers
- Test data fixtures
- Temporary scripts for development

## Guidelines

- Use descriptive filenames with dates: `metrics-debug-2025-10-29.json`
- Clean up regularly - this folder should be ephemeral
- Never commit files from this folder (covered by .gitignore)
- All production code belongs in `../components/`, `../pages/`, etc.

## Examples

```
✅ Good:
- advisor-experiment-2025-10-29.tsx
- test-capital-calls-data.json
- debug-chart-rendering.ts

❌ Bad (belongs elsewhere):
- AdvisorPanel.tsx → use ../components/
- capital-calls-api.ts → use ../api/
```

This folder is gitignored and will not be tracked in version control.
