# Circle Developer Kit — Reports Index

Each run captures a point-in-time snapshot of public GitHub adoption and developer sentiment for Circle's developer kits (App Kit, Bridge Kit, Swap Kit).

To run a new report, follow the steps in [RUNBOOK.md](./RUNBOOK.md).

---

## Runs

| Date | Twitter Feedback | GitHub Repos | Snapshot | Totals |
|---|---|---|---|---|
| [2026-04-14](./2026-04-14/) | [01-twitter-feedback.md](./2026-04-14/01-twitter-feedback.md) | [02-github-repos.md](./2026-04-14/02-github-repos.md) | [snapshot.json](./2026-04-14/snapshot.json) | 23 repos · 35 stars · 22 forks |

---

## Notes

- **Twitter feedback** is sourced from the Arc App Kits launch tweet and requires a manual export from the tweet thread (see RUNBOOK).
- **GitHub repos** are discovered via the radar dashboard and independently verified against `package.json` before inclusion.
- **Snapshot** is the raw JSON used to generate the repos report for that run — preserves the exact state for reproducibility.
