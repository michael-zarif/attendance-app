# Developer Notes – Next Iteration

Date: 2025-09-27

## Outstanding Issues

- [ ] Duplicate detection is still not working reliably
  - Symptom: Same attendee (same mobile) appears multiple times on the same day in `attendance.csv`.
  - Current approach: Duplicate check in `.github/workflows/attendance.yml` parses CSV and compares the date (same day) + mobile number.
  - Likely causes to investigate next:
    - CSV parsing edge cases (commas inside quoted fields already addressed; verify for names/services with commas or quotes).
    - Timezone mismatches when comparing dates (server vs local). Use a consistent timezone (e.g., UTC) for both parsing and comparison.
    - Race conditions: multiple dispatches before the CSV read includes the previous write. Consider:
      - Using a retry + re-fetch of the CSV just before writing, or
      - Serializing updates via a single-queue workflow (e.g., use `concurrency` with a fixed group), or
      - Writing to a separate data branch and merging once per N seconds.
    - Ensure the duplicate check runs on the latest content (re-fetch after a detected change or add a small backoff when needed).

- [ ] GitHub Pages still builds when `attendance.csv` changes
  - Goal: Do not trigger a Pages deployment when only `attendance.csv` is updated.
  - Current steps implemented:
    - Added `.nojekyll` file (performance only, does not affect triggers).
    - Created `pages.yml` workflow with `on.push.paths` filters excluding `attendance.csv`.
    - Added `[skip ci]` to CSV update commit messages (Pages may ignore this).
  - Next steps to fully prevent unwanted builds:
    - Verify repository Pages source is set to "GitHub Actions" and only the `pages.yml` workflow deploys.
    - Confirm no other Pages-related workflows exist or are enabled.
    - Consider moving `attendance.csv` writes to a dedicated `data` branch not used for Pages, or a separate repository.
    - Alternatively, place the CSV under a directory excluded by Pages artifact upload (e.g., write to `data/attendance.csv` and configure `upload-pages-artifact` to exclude `data/`).

## Quick Action Items

1. Enforce timezone normalization in duplicate check (parse and compare using UTC date-only strings).
2. Add stricter CSV parsing (handle quotes and commas for all fields consistently) or switch to a minimal CSV parser snippet within the workflow.
3. Add a second fetch of `attendance.csv` just before write to reduce race conditions; if `sha` changed, re-run duplicate logic with the new content.
4. Move data writes to a non-Pages branch (e.g., `data`) or exclude `data/` from the Pages artifact.
