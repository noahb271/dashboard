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

1. Get a free API key at https://fred.stlouisfed.org/docs/api/api_key.html
2. Open `index.html` and `treasuries.html` in a text editor
3. Find the line: `const FRED_KEY = '77b7ca5506ad1762a5caeeee15a023f7';`
4. Replace `77b7ca5506ad1762a5caeeee15a023f7` with your actual key
5. Save and upload to GitHub

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
