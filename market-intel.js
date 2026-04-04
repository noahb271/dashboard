const TD_KEY = typeof CONFIG !== 'undefined' ? CONFIG.TD_KEY : '';
const FH_KEY = typeof CONFIG !== 'undefined' ? CONFIG.FINNHUB_KEY : '';
const FRED_KEY = typeof CONFIG !== 'undefined' ? CONFIG.FRED_KEY : '';

const DEFAULT_WATCHLIST = ['SPY','QQQ','DIA','IWM','VTI','VOO','XLK','XLF','XLE','GLD','SLV','USO','AAPL','MSFT','NVDA','AMZN','GOOGL','META','TSLA','JPM'];
const BENCHMARKS = ['SPY','QQQ','DIA','IWM','VIX'];
const COMMODITY_SYMBOLS = [
  { symbol: 'USO', label: 'WTI Crude Proxy' },
  { symbol: 'GLD', label: 'Gold ETF' },
  { symbol: 'SLV', label: 'Silver ETF' },
  { symbol: 'VIX', label: 'VIX' }
];
const MEGACAP_SYMBOLS = ['AAPL','MSFT','NVDA','AMZN','GOOGL','META','TSLA','JPM'];
const STORAGE_KEY = 'finance-monitor-watchlist';

const FALLBACK = {
  benchmarks: {
    SPY: { price: 658.26, changePct: 0.11, closes: [650,651,649,652,654,653,655,656,657,658], label: 'SPY' },
    QQQ: { price: 584.98, changePct: 0.18, closes: [575,576,577,578,580,579,581,582,583,585], label: 'QQQ' },
    DIA: { price: 465.04, changePct: -0.13, closes: [468,467,466,465,464,463,464,465,465,465], label: 'DIA' },
    IWM: { price: 253.04, changePct: 0.70, closes: [246,247,248,249,249,250,251,252,252,253], label: 'IWM' },
    VIX: { price: 23.87, changePct: -2.73, closes: [26,25,25,24.5,24.2,24,23.8,23.7,23.8,23.87], label: 'VIX' }
  },
  watchlist: {
    SPY: { price: 658.26, changePct: 0.11 }, QQQ: { price: 584.98, changePct: 0.18 }, DIA: { price: 465.04, changePct: -0.13 }, IWM: { price: 253.04, changePct: 0.70 },
    VTI: { price: 309.41, changePct: 0.19 }, VOO: { price: 603.19, changePct: 0.10 }, XLK: { price: 242.07, changePct: 0.42 }, XLF: { price: 51.83, changePct: 0.31 }, XLE: { price: 92.11, changePct: -0.27 },
    GLD: { price: 285.22, changePct: 1.62 }, SLV: { price: 29.31, changePct: 0.94 }, USO: { price: 84.55, changePct: 2.45 },
    AAPL: { price: 212.88, changePct: 0.71 }, MSFT: { price: 431.12, changePct: 0.66 }, NVDA: { price: 118.37, changePct: 1.98 }, AMZN: { price: 189.08, changePct: 0.41 },
    GOOGL: { price: 168.74, changePct: 0.39 }, META: { price: 528.47, changePct: 0.58 }, TSLA: { price: 171.22, changePct: -0.92 }, JPM: { price: 201.14, changePct: 0.36 },
    VIX: { price: 23.87, changePct: -2.73 }
  },
  news: [
    { source: 'Benzinga', headline: 'Trump proposes $152 million plan to reopen Alcatraz', age: '5 min ago', tag: 'POL' },
    { source: 'Wall Street Journal', headline: 'SpaceX pushes back crucial Starship test launch', age: '13 min ago', tag: 'MKT' },
    { source: 'Benzinga', headline: 'Lucid reaffirms production outlook despite supplier issues', age: '1 hr ago', tag: 'AUTO' },
    { source: 'Reuters', headline: 'Oil holds above $110 as Middle East supply fears intensify', age: '1 hr ago', tag: 'OIL' },
    { source: 'Reuters', headline: 'Gold remains near record highs on safe-haven demand', age: '2 hr ago', tag: 'SAFE' }
  ],
  yields: { '2Y': 3.88, '10Y': 4.39 },
  rates: { sofr: 3.62, fed: '3.50–3.75%' }
};

const state = {
  watchlist: [],
  quotes: {},
  series: {},
  news: FALLBACK.news.slice(),
  yields: { ...FALLBACK.yields },
  rates: { ...FALLBACK.rates }
};

function setDate() {
  const el = document.getElementById('navDate');
  if (!el) return;
  el.textContent = new Date().toLocaleString(undefined, {
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  }).toUpperCase();
}

function formatMoney(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) return '--';
  return `$${num >= 1000 ? num.toLocaleString(undefined, { maximumFractionDigits: 0 }) : num.toFixed(2)}`;
}

function formatPct(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) return '--';
  return `${num >= 0 ? '+' : ''}${num.toFixed(2)}%`;
}

function classForChange(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) return 'flat';
  if (num > 0) return 'up';
  if (num < 0) return 'down';
  return 'flat';
}

function loadWatchlist() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    state.watchlist = Array.isArray(saved) && saved.length ? saved : DEFAULT_WATCHLIST.slice();
  } catch {
    state.watchlist = DEFAULT_WATCHLIST.slice();
  }
}

function saveWatchlist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.watchlist));
}

function normalizeTicker(input) {
  return String(input || '').trim().toUpperCase().replace(/[^A-Z.\-^]/g, '');
}

function sparklinePath(points, width = 78, height = 22) {
  if (!points?.length) return '';
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  return points.map((p, i) => {
    const x = (i / Math.max(points.length - 1, 1)) * width;
    const y = height - ((p - min) / range) * height;
    return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
}

function benchmarkSeries(symbol) {
  return state.series[symbol] || FALLBACK.benchmarks[symbol]?.closes || [1,2,3,4,5,4,5,6,5,6];
}

function quoteFor(symbol) {
  return state.quotes[symbol] || FALLBACK.watchlist[symbol] || FALLBACK.benchmarks[symbol] || { price: null, changePct: null };
}

function renderTicker() {
  const el = document.getElementById('intelTicker');
  if (!el) return;
  const items = [
    `SPY ${formatMoney(quoteFor('SPY').price)} ${formatPct(quoteFor('SPY').changePct)}`,
    `QQQ ${formatMoney(quoteFor('QQQ').price)} ${formatPct(quoteFor('QQQ').changePct)}`,
    `DIA ${formatMoney(quoteFor('DIA').price)} ${formatPct(quoteFor('DIA').changePct)}`,
    `IWM ${formatMoney(quoteFor('IWM').price)} ${formatPct(quoteFor('IWM').changePct)}`,
    `VIX ${quoteFor('VIX').price ?? FALLBACK.benchmarks.VIX.price}`,
    `2Y ${state.yields['2Y']?.toFixed(2) || '3.88'}%`,
    `10Y ${state.yields['10Y']?.toFixed(2) || '4.39'}%`,
    `SOFR ${state.rates.sofr}%`
  ];
  el.innerHTML = [...items, ...items].map(item => `<span class="ticker-item">${item}</span>`).join('');
}

function renderBenchmarks() {
  const wrap = document.getElementById('benchmarkGrid');
  wrap.innerHTML = BENCHMARKS.map(symbol => {
    const q = quoteFor(symbol);
    const closes = benchmarkSeries(symbol);
    return `
      <article class="benchmark-card">
        <div class="benchmark-symbol">${symbol}</div>
        <div class="benchmark-price ${symbol === 'VIX' ? '' : ''}">${symbol === 'VIX' ? Number(q.price || 0).toFixed(2) : formatMoney(q.price)}</div>
        <div class="benchmark-change ${classForChange(q.changePct)}">${formatPct(q.changePct)}</div>
        <svg class="benchmark-spark" viewBox="0 0 78 22" preserveAspectRatio="none">
          <path d="${sparklinePath(closes)}"></path>
        </svg>
      </article>
    `;
  }).join('');
}

function renderWatchlist() {
  const wrap = document.getElementById('watchlistList');
  wrap.innerHTML = state.watchlist.map(symbol => {
    const q = quoteFor(symbol);
    const path = sparklinePath(benchmarkSeries(symbol));
    return `
      <div class="watch-row">
        <div>
          <div class="watch-symbol">${symbol}</div>
          <div class="watch-sub">${symbol === 'VIX' ? 'volatility index' : 'live / fallback quote'}</div>
        </div>
        <svg class="watch-spark" viewBox="0 0 54 18" preserveAspectRatio="none"><path d="${path}"></path></svg>
        <div class="watch-price">${symbol === 'VIX' ? Number(q.price || 0).toFixed(2) : formatMoney(q.price)}</div>
        <div class="watch-change ${classForChange(q.changePct)}">${formatPct(q.changePct)}</div>
        <button class="watch-remove" data-symbol="${symbol}" aria-label="Remove ${symbol}">×</button>
      </div>
    `;
  }).join('');

  wrap.querySelectorAll('.watch-remove').forEach(btn => {
    btn.addEventListener('click', () => {
      state.watchlist = state.watchlist.filter(s => s !== btn.dataset.symbol);
      saveWatchlist();
      renderWatchlist();
    });
  });
}

function renderNews() {
  const wrap = document.getElementById('updatesList');
  wrap.innerHTML = state.news.map(item => `
    <article class="update-row">
      <div class="update-age">• ${item.age}</div>
      <div class="update-body">
        <div class="update-source">${item.source}</div>
        <div class="update-headline">${item.headline}</div>
      </div>
      <div class="update-tag">${item.tag || 'MKT'}</div>
    </article>
  `).join('');
}

function marketTone() {
  const eq = ['SPY','QQQ','DIA','IWM'].map(s => quoteFor(s).changePct || 0);
  const avg = eq.reduce((a,b)=>a+b,0) / eq.length;
  const vix = Number(quoteFor('VIX').price || FALLBACK.benchmarks.VIX.price);
  if (avg > 0.3 && vix < 20) return 'Risk-on bias with volatility contained.';
  if (avg > 0 && vix < 25) return 'Cautiously constructive tone with selective risk appetite.';
  if (avg < 0 && vix > 25) return 'Risk-off tone with defensive positioning and elevated caution.';
  return 'Mixed market tone with cross-currents between equities, rates, and macro headlines.';
}

function renderSummary() {
  const spy = quoteFor('SPY');
  const qqq = quoteFor('QQQ');
  const dia = quoteFor('DIA');
  const iwm = quoteFor('IWM');
  const oil = quoteFor('USO');
  const gold = quoteFor('GLD');
  const vix = quoteFor('VIX');
  const topHeadline = state.news[0]?.headline || 'Macro headlines remain the main driver of positioning.';
  const text = `
    <p>US benchmarks are trading with SPY at <strong>${formatMoney(spy.price)}</strong> (${formatPct(spy.changePct)}), QQQ at <strong>${formatMoney(qqq.price)}</strong> (${formatPct(qqq.changePct)}), DIA at <strong>${formatMoney(dia.price)}</strong> (${formatPct(dia.changePct)}), and IWM at <strong>${formatMoney(iwm.price)}</strong> (${formatPct(iwm.changePct)}).</p>
    <p>Volatility is ${Number(vix.price || 0).toFixed(2)} on the VIX, while oil proxy USO is ${formatMoney(oil.price)} and gold proxy GLD is ${formatMoney(gold.price)}. The 10-year Treasury is around <strong>${state.yields['10Y']?.toFixed(2) || '4.39'}%</strong> with SOFR near <strong>${state.rates.sofr}%</strong>.</p>
    <p><strong>Market tone:</strong> ${marketTone()}</p>
    <p><strong>Headline in focus:</strong> ${topHeadline}</p>
  `;
  document.getElementById('marketSummary').innerHTML = text;
}

function renderSimpleTable(elId, rows, useMoney = true) {
  const el = document.getElementById(elId);
  el.innerHTML = rows.map(({ label, symbol }) => {
    const q = quoteFor(symbol);
    return `
      <div class="intel-row">
        <div>
          <div class="label-main">${label}</div>
          <div class="label-sub">${symbol}</div>
        </div>
        <div class="value-main">${useMoney && symbol !== 'VIX' ? formatMoney(q.price) : Number(q.price || 0).toFixed(2)}</div>
        <div class="change-main ${classForChange(q.changePct)}">${formatPct(q.changePct)}</div>
      </div>
    `;
  }).join('');
}

function renderTables() {
  renderSimpleTable('commodityTable', COMMODITY_SYMBOLS, true);
  renderSimpleTable('megacapTable', MEGACAP_SYMBOLS.map(s => ({ symbol: s, label: s })), true);
}

function summarizeResearch(query) {
  const q = query.toLowerCase();
  const spy = quoteFor('SPY');
  const qqq = quoteFor('QQQ');
  const dia = quoteFor('DIA');
  const iwm = quoteFor('IWM');
  const vix = quoteFor('VIX');
  const uso = quoteFor('USO');
  const gld = quoteFor('GLD');
  const slv = quoteFor('SLV');
  const top = state.news.slice(0, 3);

  let lead = `Markets are showing a ${marketTone().toLowerCase()}`;
  if (q.includes('oil')) lead = `Oil is a clear macro focus. USO is ${formatMoney(uso.price)} (${formatPct(uso.changePct)}), and the headlines suggest energy supply and geopolitical risk are helping keep the tape bid.`;
  if (q.includes('safe') || q.includes('haven') || q.includes('gold')) lead = `Safe-haven assets are firm. GLD is ${formatMoney(gld.price)} (${formatPct(gld.changePct)}) and SLV is ${formatMoney(slv.price)} (${formatPct(slv.changePct)}), which fits a market still balancing risk appetite with macro caution.`;
  if (q.includes('volatility') || q.includes('tone') || q.includes('risk')) lead = `The market tone is best described as ${marketTone().toLowerCase()} VIX is ${Number(vix.price || 0).toFixed(2)}, which is elevated enough to keep traders selective rather than fully aggressive.`;

  return `
    <div class="research-answer">
      <p>${lead}</p>
      <h4>Market summary</h4>
      <p>SPY is ${formatMoney(spy.price)} (${formatPct(spy.changePct)}), QQQ is ${formatMoney(qqq.price)} (${formatPct(qqq.changePct)}), DIA is ${formatMoney(dia.price)} (${formatPct(dia.changePct)}), and IWM is ${formatMoney(iwm.price)} (${formatPct(iwm.changePct)}).</p>
      <h4>Volatility and macro</h4>
      <p>VIX is ${Number(vix.price || 0).toFixed(2)}. The 2-year Treasury is about ${state.yields['2Y']?.toFixed(2) || '3.88'}% and the 10-year is about ${state.yields['10Y']?.toFixed(2) || '4.39'}%, while SOFR is ${state.rates.sofr}%.</p>
      <h4>Commodities</h4>
      <p>USO is ${formatMoney(uso.price)} (${formatPct(uso.changePct)}), GLD is ${formatMoney(gld.price)} (${formatPct(gld.changePct)}), and SLV is ${formatMoney(slv.price)} (${formatPct(slv.changePct)}).</p>
      <h4>Notable headlines</h4>
      <ul>${top.map(item => `<li>${item.source}: ${item.headline}</li>`).join('')}</ul>
      <h4>Conclusion</h4>
      <p>${marketTone()}</p>
    </div>
  `;
}

function renderResearch(query = "What's going on with the markets today?") {
  document.getElementById('researchOutput').innerHTML = summarizeResearch(query);
}

function initResearch() {
  const form = document.getElementById('researchForm');
  const input = document.getElementById('researchInput');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const query = input.value.trim();
    if (!query) return;
    renderResearch(query);
  });
  document.querySelectorAll('.prompt-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      input.value = btn.dataset.prompt;
      renderResearch(btn.dataset.prompt);
    });
  });
  renderResearch();
}

async function fetchTDSeries(symbol) {
  if (!TD_KEY) return null;
  try {
    const res = await fetch(`https://api.twelvedata.com/time_series?symbol=${encodeURIComponent(symbol)}&interval=1day&outputsize=12&apikey=${TD_KEY}`);
    const data = await res.json();
    if (!Array.isArray(data.values)) return null;
    const values = data.values.slice().reverse().map(v => ({
      close: Number(v.close),
      datetime: v.datetime
    })).filter(v => Number.isFinite(v.close));
    if (values.length < 2) return null;
    const closes = values.map(v => v.close);
    const price = closes.at(-1);
    const prev = closes.at(-2);
    return { price, changePct: ((price - prev) / prev) * 100, closes };
  } catch {
    return null;
  }
}

async function fetchQuote(symbol) {
  const series = await fetchTDSeries(symbol);
  if (series) {
    state.series[symbol] = series.closes;
    state.quotes[symbol] = { price: series.price, changePct: series.changePct };
    return;
  }
  if (FH_KEY) {
    try {
      const map = { VIX: '^VIX' };
      const lookup = map[symbol] || symbol;
      const res = await fetch(`https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(lookup)}&token=${FH_KEY}`);
      const data = await res.json();
      if (Number.isFinite(data.c)) {
        const prev = Number(data.pc) || data.c;
        state.quotes[symbol] = { price: data.c, changePct: ((data.c - prev) / prev) * 100 };
      }
    } catch {}
  }
}

async function loadQuotes() {
  const symbols = [...new Set([...BENCHMARKS, ...state.watchlist, ...COMMODITY_SYMBOLS.map(x => x.symbol), ...MEGACAP_SYMBOLS])];
  await Promise.all(symbols.map(fetchQuote));
  renderBenchmarks();
  renderWatchlist();
  renderTables();
  renderSummary();
  renderTicker();
  renderResearch(document.getElementById('researchInput')?.value || undefined);
}

async function loadNews() {
  if (!FH_KEY) {
    renderNews();
    return;
  }
  try {
    const res = await fetch(`https://finnhub.io/api/v1/news?category=general&token=${FH_KEY}`);
    const data = await res.json();
    if (Array.isArray(data) && data.length) {
      state.news = data.slice(0, 5).map(item => ({
        source: item.source || 'Newswire',
        headline: item.headline,
        age: relativeTime(item.datetime),
        tag: inferTag(item.headline)
      })).filter(x => x.headline);
    }
  } catch {}
  renderNews();
  renderSummary();
  renderResearch(document.getElementById('researchInput')?.value || undefined);
}

function inferTag(headline = '') {
  const h = headline.toLowerCase();
  if (h.includes('oil') || h.includes('crude') || h.includes('energy')) return 'OIL';
  if (h.includes('fed') || h.includes('yield') || h.includes('treasury')) return 'RATES';
  if (h.includes('gold') || h.includes('silver')) return 'SAFE';
  return 'MKT';
}

function relativeTime(unix) {
  if (!unix) return '';
  const diff = Math.max(0, Date.now() - unix * 1000);
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  return `${Math.floor(hrs / 24)} d ago`;
}

async function fetchFredLatest(seriesId) {
  if (!FRED_KEY) return null;
  try {
    const res = await fetch(`https://api.stlouisfed.org/fred/series/observations?series_id=${seriesId}&api_key=${FRED_KEY}&sort_order=desc&file_type=json&limit=10`);
    const data = await res.json();
    const value = Number(data.observations?.find(obs => obs.value !== '.')?.value);
    return Number.isFinite(value) ? value : null;
  } catch {
    return null;
  }
}

async function loadRatesContext() {
  const [twoY, tenY, sofr] = await Promise.all([
    fetchFredLatest('DGS2'),
    fetchFredLatest('DGS10'),
    fetchFredLatest('SOFR')
  ]);
  if (Number.isFinite(twoY)) state.yields['2Y'] = twoY;
  if (Number.isFinite(tenY)) state.yields['10Y'] = tenY;
  if (Number.isFinite(sofr)) state.rates.sofr = sofr.toFixed(2);
  renderTicker();
  renderSummary();
  renderResearch(document.getElementById('researchInput')?.value || undefined);
}

function initWatchlistForm() {
  const form = document.getElementById('watchlistForm');
  const input = document.getElementById('watchlistInput');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const symbol = normalizeTicker(input.value);
    if (!symbol) return;
    if (!state.watchlist.includes(symbol)) {
      state.watchlist.unshift(symbol);
      state.watchlist = state.watchlist.slice(0, 24);
      saveWatchlist();
      await fetchQuote(symbol);
      renderWatchlist();
      renderTables();
    }
    input.value = '';
  });
}

function init() {
  setDate();
  loadWatchlist();
  renderTicker();
  renderBenchmarks();
  renderWatchlist();
  renderNews();
  renderTables();
  renderSummary();
  initWatchlistForm();
  initResearch();
  loadQuotes();
  loadNews();
  loadRatesContext();
  setInterval(setDate, 1000);
}

document.addEventListener('DOMContentLoaded', init);
