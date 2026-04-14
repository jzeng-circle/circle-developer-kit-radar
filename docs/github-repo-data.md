# GitHub Repo Data — Integration Reference

The Circle Developer Kit Radar dashboard automatically collects GitHub repositories
that integrate Circle developer kits (App Kit, Bridge Kit, Swap Kit). After each
product tab loads, the repo data is persisted to browser storage for consumption
by external services.

## How data is populated

1. Open the live dashboard: https://jzeng-circle.github.io/circle-developer-kit-radar/
2. Select each product tab (App Kit, Bridge Kit, Swap Kit) — the dashboard fetches
   and stores repos for each product as you switch.
3. All three products are captured after a full tab cycle.

Data refreshes automatically on every page load (1-hour cache TTL).

## Storage locations

| Location | How to access |
|---|---|
| `localStorage` | `localStorage.getItem('circle-radar-repos')` |
| `window` global | `window.__circleRadarRepos` |

Both hold the same JSON object. The `window` global is useful for reading from
the browser console or a browser extension on the same page.

## Schema

```ts
type RepoStore = Record<ProductId, ProductEntry>

type ProductId = 'bridge-kit' | 'app-kit' | 'swap-kit'

type ProductEntry = {
  product:     string       // Display name, e.g. "Circle App Kit"
  repos:       Repo[]       // Sorted by stars descending, capped at 20
  lastUpdated: string       // ISO 8601 timestamp of last fetch
}

type Repo = {
  name:        string       // GitHub full name: "owner/repo"
  url:         string       // Full GitHub URL: "https://github.com/owner/repo"
  stars:       number       // Current stargazer count
  description: string       // Repo description (may be empty string)
  kits:        string[]     // Circle npm packages declared as dependencies
                            // e.g. ["@circle-fin/app-kit"]
}
```

## Example payload

```json
{
  "app-kit": {
    "product": "Circle App Kit",
    "lastUpdated": "2026-04-14T08:30:00.000Z",
    "repos": [
      {
        "name": "acme-corp/payments-app",
        "url": "https://github.com/acme-corp/payments-app",
        "stars": 128,
        "description": "Stablecoin payment integration using Circle App Kit",
        "kits": ["@circle-fin/app-kit"]
      }
    ]
  },
  "bridge-kit": {
    "product": "Circle Bridge Kit",
    "lastUpdated": "2026-04-14T08:31:00.000Z",
    "repos": [
      {
        "name": "example/cross-chain-demo",
        "url": "https://github.com/example/cross-chain-demo",
        "stars": 54,
        "description": "USDC bridging demo with Circle Bridge Kit",
        "kits": ["@circle-fin/bridge-kit"]
      }
    ]
  },
  "swap-kit": {
    "product": "Circle Swap Kit",
    "lastUpdated": "2026-04-14T08:32:00.000Z",
    "repos": []
  }
}
```

## Reading from another project

### Browser console (same page)

```js
const data = JSON.parse(localStorage.getItem('circle-radar-repos') ?? '{}')
console.log(data['app-kit'].repos)
```

### Browser extension (content script on the dashboard page)

```js
const data = window.__circleRadarRepos ?? {}
const allRepos = Object.values(data).flatMap(entry => entry.repos)
```

### Extracting all repos across all products

```js
const raw = localStorage.getItem('circle-radar-repos')
const store = JSON.parse(raw ?? '{}')

const allRepos = Object.entries(store).flatMap(([productId, entry]) =>
  entry.repos.map(repo => ({ ...repo, productId, product: entry.product }))
)

// Sort by stars across all products
allRepos.sort((a, b) => b.stars - a.stars)
```

## Snapshot file

A point-in-time snapshot of verified repos is committed alongside this doc:

```
docs/github-repos-snapshot.json
```

It is updated manually by running the API and re-committing. The live dashboard
updates `localStorage` automatically on every page load.

## Notes

- Repos are verified against `package.json` before inclusion — each entry
  genuinely declares the kit as a dependency.
- Discovery uses two methods: (1) GitHub repo name/topic search and (2) GitHub
  code search for `"@circle-fin/<kit>" filename:package.json`. This catches repos
  that don't mention the kit in their name or description.
- A repo may appear in multiple products if it declares more than one kit.
- The `kits` array reflects all `@circle-fin/*` packages found in any
  `package.json` in the repo (supports monorepos).
