# Circle Developer Kit Reports — Runbook

This runbook documents how to reproduce the reports in this folder from scratch. Run it any time you want a fresh snapshot — quarterly reviews, post-launch analysis, or ad hoc investigations.

---

## Prerequisites

| Tool | Purpose | Install |
|---|---|---|
| `gh` CLI | GitHub API access | `brew install gh` + `gh auth login` |
| Python 3 + openpyxl | Parse Twitter Excel exports | `pip3 install openpyxl` |
| Claude Code | Compile and write reports | Already here |
| Twitter/X account | Export tweet replies | Manual step |

---

## Part 1 — Twitter Feedback

### 1.1 Export tweet replies

Twitter does not expose replies via API without elevated access. Use a browser extension:

- **TwCommentExport** (Chrome extension) — navigate to the tweet, click Export, save as `.xlsx`
- Aim for 100–200 replies minimum for a meaningful sample
- Target tweet: the most recent App Kits launch or update announcement from @arc

The exported file has columns: `TweetText`, `LikeCount`, `FollowersCount`, `Name`, `Handle`.

### 1.2 Parse the export

```python
import openpyxl

wb = openpyxl.load_workbook('/path/to/export.xlsx')
ws = wb.active
headers = [cell.value for cell in next(ws.iter_rows(min_row=1, max_row=1))]
rows = []
for row in ws.iter_rows(min_row=2, values_only=True):
    rows.append(dict(zip(headers, row)))

# Print all non-empty tweets
for r in rows:
    if r.get('TweetText'):
        print(f"[{r['Handle']} | {r['FollowersCount']} followers | {r['LikeCount']} likes]")
        print(r['TweetText'])
        print()
```

### 1.3 Compile the report

Ask Claude Code to compile the parsed output into the standard report format:
- Post Performance metrics (get from tweet analytics if available)
- Key Findings (group by theme: DX, monetization, technical questions, intent signals)
- Comment Quality Breakdown table
- Recommended Actions

Save to `docs/reports/YYYY-MM-DD/01-twitter-feedback.md`.

---

## Part 2 — GitHub Repos Snapshot

### 2.1 Collect repos from the radar dashboard

Open the live dashboard: https://jzeng-circle.github.io/circle-developer-kit-radar/

Click each product tab (App Kit, Bridge Kit, Swap Kit) to trigger repo fetches. After cycling all three tabs, run in the browser console:

```js
JSON.stringify(JSON.parse(localStorage.getItem('circle-radar-repos')), null, 2)
```

Copy the output — this is your raw list. It is capped at 20 repos per kit, sorted by stars.

### 2.2 Supplement with code search

The dashboard uses repo name/topic search, which misses repos that don't mention the kit in their name. Cross-check with GitHub code search:

```bash
# Search for repos that declare the kit in package.json
gh search code '"@circle-fin/app-kit" filename:package.json' --limit 30
gh search code '"@circle-fin/bridge-kit" filename:package.json' --limit 30
gh search code '"@circle-fin/swap-kit" filename:package.json' --limit 30
```

### 2.3 Verify each repo against package.json

**Never trust the dashboard alone** — always confirm against the actual `package.json`.

```bash
# Standard root package.json
gh api repos/{owner}/{repo}/contents/package.json | jq -r '.content' | base64 -d | jq '.dependencies'

# If root returns 404, list the repo root first to find monorepo structure
gh api repos/{owner}/{repo}/contents | jq '.[].name'

# Then check likely subdirectories
gh api repos/{owner}/{repo}/contents/frontend/package.json | jq -r '.content' | base64 -d | jq '.dependencies'
gh api repos/{owner}/{repo}/contents/webapp/package.json | jq -r '.content' | base64 -d | jq '.dependencies'
```

**Common monorepo structures seen in the wild**:
- `frontend/package.json` — most monorepos (Flowfi, proofpay-escrow, sourcebounty)
- `webapp/package.json` — polypop
- Root `package.json` is a pnpm workspace manifest with no direct kit deps — need to check workspace packages

### 2.4 Collect fork counts

The dashboard does not show forks. Fetch them separately:

```bash
for repo in owner1/repo1 owner2/repo2; do
  gh api repos/$repo --jq '{name: .full_name, stars: .stargazers_count, forks: .forks_count}'
done
```

### 2.5 Read READMEs for detail profiles

```bash
gh api repos/{owner}/{repo}/readme | jq -r '.content' | base64 -d
```

If the README is a default Vite/CRA boilerplate, note it. Sparse READMEs are a signal in themselves.

### 2.6 Update the snapshot JSON

Edit `docs/github-repos-snapshot.json` with verified repos. Schema:

```json
{
  "meta": { "fetched_at": "YYYY-MM-DD", "source": "..." },
  "app-kit": {
    "product": "Circle App Kit",
    "total": 0,
    "unverified": 0,
    "notes": "any caveats",
    "repos": [
      {
        "name": "owner/repo",
        "url": "https://github.com/owner/repo",
        "stars": 0,
        "description": "...",
        "kits": ["@circle-fin/app-kit"],
        "last_commit": "YYYY-MM-DD",
        "notes": "optional"
      }
    ]
  }
}
```

Copy the updated snapshot to `docs/reports/YYYY-MM-DD/snapshot.json`.

### 2.7 Compile the repos report

Ask Claude Code to analyze the verified repos and write the report. Standard sections:
- At a Glance table (Kit | Repos | Stars | Forks | Activity)
- Executive Summaries per kit (Adoption, What builders build, Target chains, Builder profile, Top signals, Key gaps)
- Repo Reference Tables
- Detailed Repo Profiles
- Cross-Kit Findings (patterns, sophistication tiers, gaps, strengths)

Save to `docs/reports/YYYY-MM-DD/02-github-repos.md`.

---

## Part 3 — Commit and Push

```bash
cd /path/to/circle-developer-kit-radar

git add docs/reports/YYYY-MM-DD/
git add docs/reports/INDEX.md
git add docs/github-repos-snapshot.json  # update the canonical snapshot too

git commit -m "Add YYYY-MM-DD developer kit reports"
git push
```

Update `docs/reports/INDEX.md` to add the new run row before committing.

---

## Known Pitfalls

### Dashboard false positives
The radar dashboard infers kit usage from repo names and topics — it can list repos that don't actually have the kit in `package.json`. Always verify. Known false positive as of April 2026: `developermynk/Arc-Wallet` was listed with `swap-kit` but package.json only had `app-kit`.

### Unverifiable monorepos
Deep pnpm monorepos with workspace configs at root can obscure kit usage. If a repo has a `pnpm-workspace.yaml` and no `@circle-fin` packages at root, check each workspace package directory. If all subdirectories return 404 from the API, mark as "unverified" rather than excluding or including.

### zsh glob expansion with `gh api`
When using `gh api` with query strings (e.g., `?recursive=1`), zsh treats `?` as a glob and expands it. Use `--raw-field` flags instead, or quote the URL with single quotes: `gh api 'repos/owner/repo/git/trees/HEAD?recursive=1'`.

### GitHub API rate limits
Unauthenticated: 60 req/hr. With `gh auth login`: 5,000 req/hr. Always run authenticated. Parallel `gh api` calls can exhaust the limit quickly on large repo sets — add small delays or batch sequentially if hitting 403s.

### Twitter reply ordering
The TwCommentExport extension exports in chronological order, not by engagement. High-value replies (from accounts with many followers or likes) can be buried. Sort by `LikeCount` descending when reading the data before compilation.

---

## Report Cadence Suggestions

| Trigger | What to run |
|---|---|
| Major SDK launch (new kit, major version) | Full run: Twitter + GitHub |
| Monthly cadence | GitHub only (update snapshot, re-run repos report) |
| Post-hackathon (ETHGlobal, etc.) | GitHub only (new repos appear within days) |
| Quarterly review | Full run |
