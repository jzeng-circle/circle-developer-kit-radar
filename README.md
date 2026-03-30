# Circle Developer Kit Radar

## Introduction

Circle's developer kits — Bridge Kit, App Kit, and Swap Kit — are purpose-built SDKs that simplify stablecoin operations for developers building on-chain applications. As these products grow, a key question emerges: **how much organic presence do they have across the public internet?**

Developers discover SDKs through many channels: GitHub repositories and issues, Reddit and Hacker News discussions, Stack Overflow questions, Dev.to and Medium articles, and npm download trends. Tracking these signals manually across eight different platforms is impractical and inconsistent.

**Live dashboard:** https://jzeng-circle.github.io/circle-developer-kit-radar/

## Objective

Circle Developer Kit Radar aggregates public developer activity across the internet to answer a single question: **how visible are Circle's developer kits in the developer community?**

The dashboard pulls live data from public APIs — no scraping, no proprietary data — and compiles it into a single view that shows:

- **Mention volume** across GitHub, Reddit, Hacker News, Stack Overflow, Dev.to, Medium, and web articles
- **Trend over time** — whether community exposure is growing, flat, or declining
- **Platform breakdown** — where developers are talking about the product most
- **npm download trends** — a direct signal of active adoption
- **Sentiment** — whether community sentiment is positive, neutral, or negative
- **Top repositories** — public projects actively using the kits

A second mode, **Outreach**, surfaces developer threads where someone has the exact problem a kit solves but has not yet discovered the product — enabling targeted, high-signal developer outreach.

## Methodology

The radar works in three stages:

**1. Define product keywords**
Each product has a set of search queries — exact phrases, package names, and related terms — configured per source. For example, Bridge Kit searches for `"Bridge Kit" circle`, `@circle-fin/bridge-kit`, `CCTP bridge circle`, and similar variants. These queries are editable in the dashboard under the Search Keywords panel, so you can tune what counts as a relevant mention without touching code.

**2. Search public sources**
Queries run in parallel across all enabled sources using their public APIs. Each source is searched independently: GitHub scans issues and commits, Reddit and Hacker News search post titles and bodies, Dev.to and Medium search articles, Stack Overflow searches questions, NewsAPI searches news headlines, and Google CSE sweeps broader web content. Requests are rate-limited and sequenced per API to stay within free-tier quotas. Results are cached in-session for one hour to avoid redundant calls.

**3. Compile and score results**
Raw results are filtered for relevance — posts that mention the query string but have no meaningful connection to the product are dropped. Remaining mentions are deduplicated, sorted by date, and tagged with a platform and sentiment label (positive / neutral / negative) based on the surrounding language. The dashboard then aggregates these into counts, trends, platform breakdowns, and sentiment distributions.

---

## Products Tracked

| Product | npm Package |
|---|---|
| Circle Bridge Kit | `@circle-fin/bridge-kit` |
| Circle App Kit | `@circle-fin/app-kit` |
| Circle Swap Kit | `@circle-fin/swap-kit` |

## Data Sources

| Source | Auth Required |
|---|---|
| GitHub (issues, commits, repos) | None (optional token for higher rate limit) |
| Reddit | None |
| Hacker News | None |
| Dev.to | None |
| Stack Overflow | None (optional key for higher quota) |
| Medium | None |
| npm registry | None |
| NewsAPI | `VITE_NEWSAPI_KEY` (free tier: 100 req/day) |
| Google Custom Search | `VITE_GOOGLE_CSE_KEY` + `VITE_GOOGLE_CSE_ID` (free tier: 100 req/day) |

The dashboard works out of the box without any API keys. Keys unlock NewsAPI and Google CSE coverage, and raise rate limits on GitHub and Stack Overflow.

---

## Running the Dashboard

### Prerequisites

- Node.js 18+
- npm

### Install dependencies

```bash
cd circle-developer-kit-radar
npm install
```

### Configure API keys (optional)

Create a `.env` file in the project root:

```bash
# Raises GitHub API rate limit from 10 to 30 requests/min
VITE_GITHUB_TOKEN=your_github_personal_access_token

# Enables NewsAPI coverage (free at newsapi.org)
VITE_NEWSAPI_KEY=your_newsapi_key

# Enables Google Custom Search coverage (free at programmablesearchengine.google.com)
VITE_GOOGLE_CSE_KEY=your_google_cse_api_key
VITE_GOOGLE_CSE_ID=your_google_cse_id

# Raises Stack Overflow API quota (register at stackapps.com)
VITE_STACKEXCHANGE_KEY=your_stackexchange_key
```

### Start the development server

```bash
npm run dev
```

Open `http://localhost:5173` in your browser.

### Build for production

```bash
npm run build
npm run preview
```

---

## Usage

**Select a product** from the dropdown in the header to switch between Bridge Kit, App Kit, and Swap Kit.

**Select a time range** using the preset buttons (7d, 30d, 90d, 180d, 1y) or pick a custom start date. The earliest meaningful date is 2025-10-14 (Bridge Kit publish date).

**Monitor mode** answers the question: *how visible is this product in the developer community?* It pulls live mentions across all sources, aggregates them into trend charts, platform breakdowns, sentiment scores, and npm download curves, and shows top public repos using the kit. Use this to track whether community awareness is growing, flat, or declining over a chosen time range.

**Outreach mode** answers a different question: *who needs this product but hasn't found it yet?* It searches developer forums and Q&A sites for threads where someone describes the exact problem a kit solves — cross-chain transfers, stablecoin bridging, on-chain payments — but hasn't mentioned Circle's products. Each result includes a "Why?" explanation of the relevance signal, making it easy to identify high-signal moments for targeted developer outreach.

**Refresh** the data at any time using the refresh button in the header.
