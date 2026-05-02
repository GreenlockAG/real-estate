# Server Temp Folder

This folder is for temporary, experimental, and debug work for the backend/server.

## Usage

- API debugging scripts
- Database migration drafts
- Performance profiling logs
- Temporary data exports
- Test utilities

## Guidelines

- Use descriptive filenames with dates: `api-debug-2025-10-29.ts`
- Clean up regularly - this folder should be ephemeral
- Never commit files from this folder (covered by .gitignore)
- All production code belongs in `../routes.ts`, `../services/`, etc.

This folder is gitignored and will not be tracked in version control.
