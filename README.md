# Noah's Financial Dashboard

A personal finance dashboard built with pure HTML/CSS/JS, hosted on GitHub Pages.

## Live URL
**https://noahb271.github.io/dashboard**

## Pages
- `index.html` — Homepage with navigation and live rate tickers
- `treasuries.html` — Full US Treasury yield curve (live FRED API data)
- `rates.html` — Fed policy rates, SOFR, prime rate, mortgage & loan rates
- `media.html` — Media conglomerate ownership map (2026)

## Setup — Add Live Data

To enable live data from the Federal Reserve:

1. Copy `config.example.js` to `config.js`.
2. Edit `config.js` and replace the placeholder values with your real keys.
3. Keep `config.js` private; it is listed in `.gitignore` so it will not be uploaded to GitHub.
4. Open `index.html` or `market-intel.html` in a browser to view the dashboard locally.

Without the key, the dashboard shows static data from March 2026.

## Data Sources
- Federal Reserve H.15 Selected Interest Rates
- FRED St. Louis Fed (fred.stlouisfed.org)
- US Department of the Treasury (home.treasury.gov)
- NY Federal Reserve (SOFR)
- Freddie Mac PMMS (mortgage rates)
- Bankrate, Experian (consumer rates)
- Various financial news sources

## Hosting
Hosted free on GitHub Pages. No server required. No ongoing costs.
