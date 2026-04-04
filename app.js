// API key variables (fallback to empty if backend is used)
const TD_KEY = '';  // No longer needed - using backend
const FRED_KEY = '';  // No longer needed - using backend
const FH_KEY = '';  // No longer needed - using backend

// Backend API base URL
const BACKEND_URL = 'http://localhost:8001/api';

// Helper function to fetch from backend with fallback
async function fetchFromBackend(endpoint, options = {}) {
  try {
    const hasBody = options.body !== undefined;
    const response = await fetch(`${BACKEND_URL}${endpoint}`, {
      method: options.method || 'GET',
      headers: {
        ...(hasBody && { 'Content-Type': 'application/json' }),
        ...options.headers
      },
      body: options.body ? JSON.stringify(options.body) : undefined
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.warn(`Backend fetch failed for ${endpoint}:`, error);
    return null;  // Return null to trigger fallback
  }
}

const FALLBACK = {
  alerts: [
    'Oil above $110 as Middle East conflict escalates',
    'Fed holds at 3.50%–3.75% for second straight meeting',
    'Gold remains near record highs on safe haven demand',
    '2-year Treasury yield rises sharply on inflation fears',
    'Labor market still firm, but geopolitical risk dominates tape'
  ],
  indices: {
    spy: { symbol: 'SPY', label: 'SPY', price: 655.83, changePct: 0.09, closes: [683,679,681,676,674,673,671,668,665,666,664,660,659,653,645,646,652,655] },
    qqq: { symbol: 'QQQ', label: 'QQQ', price: 584.98, changePct: 0.11, closes: [610,608,606,604,601,599,598,596,592,589,586,584,582,579,578,581,583,585] },
    dia: { symbol: 'DIA', label: 'DIA', price: 465.06, changePct: -0.09, closes: [474,473,472,471,470,468,469,467,466,465,463,461,459,458,457,460,462,465] },
    iwm: { symbol: 'IWM', label: 'IWM', price: 251.29, changePct: 0.06, closes: [258,257,255,254,253,251,249,248,246,245,244,243,241,242,244,246,249,251] }
  },
  marketOverview: [
    { label: 'SPY', value: '$655.83', change: '+0.09%' },
    { label: 'QQQ', value: '$584.98', change: '+0.11%' },
    { label: 'DIA', value: '$465.06', change: '-0.09%' },
    { label: 'IWM', value: '$251.29', change: '+0.06%' }
  ],
  commodities: [
    { label: 'WTI Crude Oil', value: '$112.00', change: 'VOLATILE' },
    { label: 'Gold Spot', value: '$4,700', change: 'SAFE HAVEN' },
    { label: 'Silver Spot', value: '$65.80', change: 'FIRM' },
    { label: 'VIX', value: '23.87', change: 'CAUTION' }
  ],
  yields: [
    { tenor: '1M', value: 3.73 },
    { tenor: '3M', value: 3.81 },
    { tenor: '6M', value: 3.94 },
    { tenor: '1Y', value: 3.80 },
    { tenor: '2Y', value: 3.88 },
    { tenor: '3Y', value: 3.92 },
    { tenor: '5Y', value: 3.72 },
    { tenor: '7Y', value: 4.05 },
    { tenor: '10Y', value: 4.39 },
    { tenor: '20Y', value: 4.78 },
    { tenor: '30Y', value: 4.96 }
  ],
  rates: {
    policy: [
      ['Fed funds target range', '3.50–3.75%'],
      ['EFFR', '4.11%'],
      ['SOFR', '3.62%'],
      ['IORB', '3.65%'],
      ['Discount rate', '3.75%'],
      ['Prime rate', '6.75%']
    ],
    borrowing: [
      ['15-year mortgage', '4.21%'],
      ['30-year mortgage', '5.57%'],
      ['30-year FHA', '5.84%'],
      ['30-year jumbo', '6.45%'],
      ['Auto loan avg', '7.00%'],
      ['Auto loan prime', '4.67%']
    ]
  },
  stocks: {
    AAPL: { price: 212.88, changePct: 0.71 },
    MSFT: { price: 431.12, changePct: 0.66 },
    NVDA: { price: 118.37, changePct: 1.98 },
    AMZN: { price: 189.08, changePct: 0.41 },
    GOOGL: { price: 168.74, changePct: 0.39 },
    META: { price: 528.47, changePct: 0.58 },
    TSLA: { price: 171.22, changePct: -0.92 },
    JPM: { price: 201.14, changePct: 0.36 }
  },
  news: [
    { source: 'Reuters', title: 'US fighter jet shot down over Iran, search underway for crew member, officials say', tag: 'MKT', age: '57m ago' },
    { source: 'Reuters', title: 'Israeli strikes Beirut, US warns Iran may hit Lebanese universities', tag: 'OIL', age: '2h ago' },
    { source: 'Reuters', title: 'US labor market posts largest jobs gain in 15 months, but clouds brewing from Iran war', tag: 'MKT', age: '3h ago' },
    { source: 'CNBC', title: 'Wall Street snapped its 5-week losing streak. Here are 3 themes that caught our eye', tag: 'MKT', age: '8h ago' }
  ],
  wire: [
    { source: 'Reuters', headline: 'US fighter jet shot down over Iran, search underway for crew member, officials say', age: '49m ago' },
    { source: 'Reuters', headline: 'Trump’s anger over Iran thrusts NATO into fresh crisis', age: '3h ago' },
    { source: 'Reuters', headline: 'Tehran rejected 48-hour ceasefire proposal from US, Iranian media says', age: '4h ago' },
    { source: 'Reuters', headline: 'Americans have bleak views on Iran war, Reuters/Ipsos poll shows', age: '6h ago' }
  ]
};

const indexDefs = [
  { id: 'spy', symbol: 'SPY', label: 'SPY' },
  { id: 'qqq', symbol: 'QQQ', label: 'QQQ' },
  { id: 'dia', symbol: 'DIA', label: 'DIA' },
  { id: 'iwm', symbol: 'IWM', label: 'IWM' }
];

const watchSymbols = ['SPY','QQQ','DIA','IWM','VTI','VOO','GLD','SLV','AAPL','MSFT'];
const stockDefs = ['AAPL','MSFT','NVDA','AMZN','GOOGL','META','TSLA','JPM'];

const yieldDefs = [
  ['1M', 'DGS1MO'], ['3M', 'DGS3MO'], ['6M', 'DGS6MO'], ['1Y', 'DGS1'],
  ['2Y', 'DGS2'], ['3Y', 'DGS3'], ['5Y', 'DGS5'], ['7Y', 'DGS7'],
  ['10Y', 'DGS10'], ['20Y', 'DGS20'], ['30Y', 'DGS30']
];

let mainChart;
let yieldChart;
let selectedIndex = 'spy';
const indexStore = {};
const watchlistStore = {};
const yieldStore = { '2Y': 3.88, '10Y': 4.39 };

function setDate() {
  const el = document.getElementById('navDate');
  if (!el) return;
  const now = new Date();
  el.textContent = now.toLocaleString(undefined, {
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  }).toUpperCase();
}

function populateTicker() {
  const stream = document.getElementById('tickerInner');
  if (!stream) return;
  const items = [...FALLBACK.alerts, ...FALLBACK.alerts]
    .map(text => `<span class="ticker-item">${text}</span>`)
    .join('');
  stream.innerHTML = items;
}

function asChangeClass(text) {
  if (!text) return 'flat';
  if (String(text).includes('-')) return 'down';
  if (String(text).includes('+')) return 'up';
  return 'flat';
}

function renderHero() {
  const wrap = document.getElementById('heroOverview');
  wrap.innerHTML = indexDefs.map(def => {
    const item = indexStore[def.id] || FALLBACK.indices[def.id];
    const change = `${item.changePct >= 0 ? '+' : ''}${item.changePct.toFixed(2)}%`;
    return `
      <div class="hero-card">
        <div class="hero-label">${def.label}</div>
        <div class="hero-value">$${Number(item.price).toFixed(2)}</div>
        <div class="hero-change ${asChangeClass(change)}">${change}</div>
      </div>
    `;
  }).join('');
}

function renderMarketRows() {
  const wrap = document.getElementById('marketRows');
  const rows = indexDefs.map(def => {
    const item = indexStore[def.id] || FALLBACK.indices[def.id];
    const change = `${item.changePct >= 0 ? '+' : ''}${item.changePct.toFixed(2)}%`;
    return `
      <div class="data-row">
        <div class="label-main">${def.label}</div>
        <div class="value-main">$${Number(item.price).toFixed(2)}</div>
        <div class="change-main ${item.changePct >= 0 ? 'up' : 'down'}">${change}</div>
      </div>
    `;
  }).join('');
  wrap.innerHTML = rows;
}

function renderCommodityRows() {
  const wrap = document.getElementById('commodityRows');
  wrap.innerHTML = FALLBACK.commodities.map(item => `
    <div class="data-row">
      <div class="label-main">${item.label}</div>
      <div class="value-main">${item.value}</div>
      <div class="change-main flat">${item.change}</div>
    </div>
  `).join('');
}

function renderStockRows() {
  const wrap = document.getElementById('stockRows');
  if (!wrap) return;
  wrap.innerHTML = stockDefs.map(symbol => {
    const stored = watchlistStore[symbol];
    const fb = FALLBACK.stocks?.[symbol];
    const price = stored?.price ?? fb?.price ?? null;
    const changePct = stored?.changePct ?? fb?.changePct ?? null;
    const priceStr = Number.isFinite(price) ? `$${price.toFixed(2)}` : '—';
    const changeStr = Number.isFinite(changePct) ? `${changePct >= 0 ? '+' : ''}${changePct.toFixed(2)}%` : '—';
    const cls = Number.isFinite(changePct) ? (changePct > 0 ? 'up' : changePct < 0 ? 'down' : 'flat') : 'flat';
    return `
      <div class="data-row">
        <div class="label-main">${symbol}</div>
        <div class="value-main">${priceStr}</div>
        <div class="change-main ${cls}">${changeStr}</div>
      </div>
    `;
  }).join('');
}

function renderRates() {
  const policy = document.getElementById('policyRates');
  const borrowing = document.getElementById('borrowingRates');
  const draw = (rows) => rows.map(([label, value]) => `
    <div class="rate-row">
      <div class="rate-label">${label}</div>
      <div class="rate-value">${value}</div>
    </div>
  `).join('');
  policy.innerHTML = draw(FALLBACK.rates.policy);
  borrowing.innerHTML = draw(FALLBACK.rates.borrowing);
}

function renderNews() {
  const wrap = document.getElementById('newsGrid');
  wrap.innerHTML = FALLBACK.news.map(item => `
    <article class="news-card">
      <div class="news-source">${item.source}</div>
      <div class="news-title">${item.title}</div>
      <div class="news-foot"><span>${item.tag}</span><span>${item.age}</span></div>
    </article>
  `).join('');
}

function renderWire() {
  const wrap = document.getElementById('wireList');
  const wireItems = FALLBACK.wire.map(item => ({ source: item.source, headline: item.headline, age: item.age }));
  const newsItems = FALLBACK.news.map(item => ({ source: item.source, headline: item.title, age: item.age }));
  const seen = new Set();
  const combined = [...wireItems, ...newsItems].filter(item => {
    const key = item.headline.slice(0, 50);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  wrap.innerHTML = combined.slice(0, 8).map(item => `
    <div class="news-item">
      <div class="news-source">${item.source}</div>
      <div class="news-headline">${item.headline}</div>
      <div class="news-age">${item.age}</div>
    </div>
  `).join('');
}

function formatChartLabel(input, index) {
  if (!input) return `Day ${index + 1}`;
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return `Day ${index + 1}`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function drawMainChart() {
  const def = indexDefs.find(item => item.id === selectedIndex);
  const item = indexStore[selectedIndex] || FALLBACK.indices[selectedIndex];
  const closes = item.closes || [];
  const labels = (item.dates && item.dates.length === closes.length)
    ? item.dates.map((d, i) => formatChartLabel(d, i))
    : closes.map((_, i) => `Day ${i + 1}`);
  document.getElementById('chartName').textContent = def.label;
  document.getElementById('chartPrice').textContent = `$${Number(item.price).toFixed(2)}`;
  document.getElementById('chartChange').textContent = `${item.changePct >= 0 ? '+' : ''}${item.changePct.toFixed(2)}%`;
  document.getElementById('chartChange').className = `hero-change ${item.changePct >= 0 ? 'up' : 'down'}`;

  const color = item.changePct >= 0 ? '#4db87a' : '#d16262';
  if (mainChart) mainChart.destroy();
  mainChart = new Chart(document.getElementById('mainChart'), {
    type: 'line',
    data: { labels, datasets: [{ data: closes, borderColor: color, borderWidth: 2, pointRadius: 0, tension: 0.35, fill: true, backgroundColor: color + '18' }] },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { ticks: { color: '#6c8777', maxTicksLimit: 6 }, grid: { color: 'rgba(255,255,255,0.04)' }, border: { display: false } },
        y: { position: 'right', ticks: { color: '#6c8777', callback: value => `$${Number(value).toFixed(0)}` }, grid: { color: 'rgba(255,255,255,0.04)' }, border: { display: false } }
      }
    }
  });
}

function initChartTabs() {
  document.querySelectorAll('.chart-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.chart-tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedIndex = btn.dataset.index;
      drawMainChart();
    });
  });
}

function renderYieldTable(values) {
  const max = Math.max(...values.map(v => v.value), 5.2);
  const wrap = document.getElementById('yieldRows');
  wrap.innerHTML = values.map(item => `
    <div class="yield-row">
      <div class="label-main">${item.tenor}</div>
      <div class="yield-bar"><span style="width:${(item.value / max) * 100}%"></span></div>
      <div class="value-main yield-value">${item.value.toFixed(2)}%</div>
    </div>
  `).join('');
}

function drawYieldChart(values) {
  if (yieldChart) yieldChart.destroy();
  yieldChart = new Chart(document.getElementById('yieldChart'), {
    type: 'line',
    data: {
      labels: values.map(v => v.tenor),
      datasets: [{ data: values.map(v => v.value), borderColor: '#d8e6dd', borderWidth: 2, pointBackgroundColor: '#d8e6dd', pointRadius: 3, tension: 0.25, fill: false }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { ticks: { color: '#6c8777' }, grid: { color: 'rgba(255,255,255,0.04)' }, border: { display: false } },
        y: { ticks: { color: '#6c8777', callback: v => `${Number(v).toFixed(1)}%` }, grid: { color: 'rgba(255,255,255,0.04)' }, border: { display: false } }
      }
    }
  });
}

async function fetchTDSeries(symbol) {
  const data = await fetchFromBackend(`/candles?symbol=${encodeURIComponent(symbol)}&interval=1day&limit=30`);
  if (!data || !data.values) return null;
  const ordered = data.values.slice().reverse();
  const series = ordered.map(d => Number(d.close)).filter(n => Number.isFinite(n));
  const dates = ordered.map(d => d.datetime || d.date);
  if (series.length < 2) return null;
  const price = series[series.length - 1];
  const prev = series[series.length - 2];
  return { price, changePct: ((price - prev) / prev) * 100, closes: series, dates };
}

async function fetchTDQuote(symbol) {
  const data = await fetchFromBackend(`/quote?symbol=${encodeURIComponent(symbol)}`);
  if (!data) return null;
  const price = Number(data.close || data.price);
  const changePct = Number(data.change_percent || data.percent_change);
  if (!Number.isFinite(price)) return null;
  return { symbol, price, changePct: Number.isFinite(changePct) ? changePct : 0 };
}

async function loadIndices() {
  for (const def of indexDefs) {
    const fetched = await fetchTDSeries(def.symbol);
    if (fetched) indexStore[def.id] = { ...FALLBACK.indices[def.id], ...fetched };
  }
  renderHero();
  renderMarketRows();
  drawMainChart();
}

function renderWatchlistRows() {
  const wrap = document.getElementById('watchlistRows');
  const rows = watchSymbols.map(symbol => watchlistStore[symbol] || { symbol, price: null, changePct: null });
  wrap.innerHTML = rows.map(item => {
    const price = Number.isFinite(item.price) ? `$${item.price.toFixed(2)}` : '—';
    const chg = Number.isFinite(item.changePct) ? `${item.changePct >= 0 ? '+' : ''}${item.changePct.toFixed(2)}%` : '—';
    return `
      <div class="yield-row watch-row">
        <div class="label-main">${item.symbol}</div>
        <div class="watch-price">${price}</div>
        <div class="value-main ${Number(item.changePct) > 0 ? 'up' : Number(item.changePct) < 0 ? 'down' : 'flat'}">${chg}</div>
      </div>
    `;
  }).join('');
}

async function loadWatchlist() {
  const allFetchSymbols = [...new Set([...watchSymbols, ...stockDefs, 'VIX', 'USO'])];
  // Use batch quotes for efficiency
  const batchData = await fetchFromBackend('/quotes', {
    method: 'POST',
    body: allFetchSymbols
  });

  if (batchData) {
    // Process batch results
    for (const symbol of allFetchSymbols) {
      const quoteData = batchData[symbol];
      if (quoteData && !quoteData.error) {
        watchlistStore[symbol] = {
          symbol,
          price: Number(quoteData.close || quoteData.price),
          changePct: Number(quoteData.change_percent || quoteData.percent_change) || 0
        };
      }
    }
  } else {
    // Fallback to individual calls
    for (const symbol of allFetchSymbols) {
      const quote = await fetchTDQuote(symbol);
      if (quote) watchlistStore[symbol] = quote;
    }
  }
  renderWatchlistRows();
  renderStockRows();
}


async function loadYields() {
  const yieldsData = await fetchFromBackend('/yields');
  if (!yieldsData) {
    // Fallback to static data
    const values = FALLBACK.yields.map(y => ({ tenor: y.tenor, value: y.value }));
    renderYieldTable(values);
    drawYieldChart(values);
    return;
  }

  const values = [];
  for (const [tenor, series] of yieldDefs) {
    const yieldInfo = yieldsData[tenor];
    const value = yieldInfo && yieldInfo.value !== 'N/A' ? Number(yieldInfo.value) : null;
    const fallback = FALLBACK.yields.find(v => v.tenor === tenor)?.value ?? null;
    values.push({ tenor, value: value ?? fallback ?? 0 });
  }
  values.forEach(v => { yieldStore[v.tenor] = v.value; });
  renderYieldTable(values);
  drawYieldChart(values);
}

async function loadWireFromFinnhub() {
  const newsData = await fetchFromBackend('/news');
  if (!Array.isArray(newsData)) return;
  const rows = newsData.slice(0, 6).map(item => ({
    source: item.source || 'Newswire',
    headline: item.headline,
    age: relativeTime(item.datetime)
  })).filter(item => item.headline);
  if (rows.length) {
    FALLBACK.wire = rows;
    renderWire();
  }
}

function relativeTime(unix) {
  if (!unix) return '';
  const diff = Math.max(0, Date.now() - unix * 1000);
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function initNotes() {
  const key = 'finance-monitor-notes';
  const title = document.getElementById('noteTitle');
  const tag = document.getElementById('noteTag');
  const body = document.getElementById('noteBody');
  const saveBtn = document.getElementById('saveNote');
  const list = document.getElementById('notesList');

  const read = () => JSON.parse(localStorage.getItem(key) || '[]');
  const write = (notes) => localStorage.setItem(key, JSON.stringify(notes));

  const render = () => {
    const notes = read();
    if (!notes.length) {
      list.innerHTML = '<div class="empty-note">No notes yet. Use this box for macro observations, trade ideas, or class notes.</div>';
      return;
    }
    list.innerHTML = notes.map((note, idx) => `
      <div class="note-row">
        <div>
          <div class="note-title">${note.title}</div>
          <div class="note-meta">${note.tag.toUpperCase()} · ${note.date}</div>
          <div class="widget-note">${note.body}</div>
        </div>
        <div></div>
        <div><button class="btn-terminal" data-del="${idx}">Del</button></div>
      </div>
    `).join('');
    list.querySelectorAll('[data-del]').forEach(btn => {
      btn.addEventListener('click', () => {
        const notes = read();
        notes.splice(Number(btn.dataset.del), 1);
        write(notes);
        render();
      });
    });
  };

  saveBtn.addEventListener('click', () => {
    if (!body.value.trim()) return;
    const notes = read();
    notes.unshift({
      title: title.value.trim() || 'Untitled note',
      tag: tag.value,
      body: body.value.trim(),
      date: new Date().toLocaleString()
    });
    write(notes.slice(0, 20));
    title.value = '';
    body.value = '';
    render();
  });

  render();
}

// ── Dashboard Research Bot ──────────────────────────────────────────────────

function quoteForDash(symbol) {
  const indexDef = indexDefs.find(d => d.symbol === symbol);
  if (indexDef && indexStore[indexDef.id]) return indexStore[indexDef.id];
  if (watchlistStore[symbol]) return watchlistStore[symbol];
  return { price: null, changePct: null };
}

function fmtMoney(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return '--';
  return `$${n >= 1000 ? n.toLocaleString(undefined, { maximumFractionDigits: 0 }) : n.toFixed(2)}`;
}

function fmtPct(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return '--';
  return `${n >= 0 ? '+' : ''}${n.toFixed(2)}%`;
}

function marketToneDash() {
  const avg = indexDefs.reduce((sum, def) => {
    const item = indexStore[def.id] || FALLBACK.indices[def.id];
    return sum + (item ? item.changePct : 0);
  }, 0) / indexDefs.length;
  const vix = quoteForDash('VIX');
  const vixPrice = Number(vix.price || 23.87);
  if (avg > 0.3 && vixPrice < 20) return 'Risk-on bias with volatility contained.';
  if (avg > 0 && vixPrice < 25) return 'Cautiously constructive tone with selective risk appetite.';
  if (avg < 0 && vixPrice > 25) return 'Risk-off tone with defensive positioning and elevated caution.';
  return 'Mixed market tone with cross-currents between equities, rates, and macro headlines.';
}

function summarizeDash(query) {
  const q = (query || '').toLowerCase();
  const spy = quoteForDash('SPY');
  const qqq = quoteForDash('QQQ');
  const dia = quoteForDash('DIA');
  const iwm = quoteForDash('IWM');
  const vix = quoteForDash('VIX');
  const gld = quoteForDash('GLD');
  const uso = quoteForDash('USO');
  const slv = quoteForDash('SLV');
  const twoY = yieldStore['2Y'] || 3.88;
  const tenY = yieldStore['10Y'] || 4.39;
  const top = FALLBACK.wire.slice(0, 3);

  let lead = `Markets are showing a ${marketToneDash().toLowerCase()}`;
  if (q.includes('oil')) lead = `Oil is a macro focus. USO is ${fmtMoney(uso.price)} (${fmtPct(uso.changePct)}), reflecting supply and geopolitical risk.`;
  if (q.includes('safe') || q.includes('haven') || q.includes('gold')) lead = `Safe-haven assets are in focus. GLD is ${fmtMoney(gld.price)} (${fmtPct(gld.changePct)}) and SLV is ${fmtMoney(slv.price)} (${fmtPct(slv.changePct)}).`;
  if (q.includes('volatility') || q.includes('tone') || q.includes('risk')) lead = `Market tone: ${marketToneDash()} VIX is ${Number(vix.price || 23.87).toFixed(2)}.`;

  return `
    <div class="research-answer">
      <p>${lead}</p>
      <p><strong>Benchmarks:</strong> SPY ${fmtMoney(spy.price)} (${fmtPct(spy.changePct)}) · QQQ ${fmtMoney(qqq.price)} (${fmtPct(qqq.changePct)}) · DIA ${fmtMoney(dia.price)} (${fmtPct(dia.changePct)}) · IWM ${fmtMoney(iwm.price)} (${fmtPct(iwm.changePct)})</p>
      <p><strong>Volatility &amp; rates:</strong> VIX ${Number(vix.price || 23.87).toFixed(2)} · 2Y ${twoY.toFixed(2)}% · 10Y ${tenY.toFixed(2)}%</p>
      <p><strong>Commodities:</strong> GLD ${fmtMoney(gld.price)} (${fmtPct(gld.changePct)}) · USO ${fmtMoney(uso.price)} (${fmtPct(uso.changePct)})</p>
      ${top.length ? `<p><strong>Wire:</strong> ${top[0].source} — ${top[0].headline}</p>` : ''}
      <p><strong>Tone:</strong> ${marketToneDash()}</p>
    </div>
  `;
}

async function renderDashResearch(query) {
  const out = document.getElementById('dashResearchOutput');
  if (!out) return;
  out.innerHTML = '<span style="color:var(--muted);font-size:10px">Analyzing...</span>';

  const summaryData = await fetchFromBackend('/research-summary', {
    method: 'POST',
    body: { symbols: ['SPY', 'QQQ', 'VIX'] }
  });

  if (summaryData) {
    out.innerHTML = `
      <div class="research-answer">
        <p>${summaryData.summary || 'Market analysis unavailable.'}</p>
        ${summaryData.market_tone ? `<p><strong>Tone:</strong> ${summaryData.market_tone}</p>` : ''}
        ${summaryData.volatility_risk ? `<p><strong>Volatility:</strong> ${summaryData.volatility_risk}</p>` : ''}
        ${summaryData.commodities_rates ? `<p><strong>Commodities &amp; rates:</strong> ${summaryData.commodities_rates}</p>` : ''}
        ${summaryData.conclusion ? `<p><strong>Conclusion:</strong> ${summaryData.conclusion}</p>` : ''}
      </div>
    `;
  } else {
    out.innerHTML = summarizeDash(query);
  }
}

function initDashResearch() {
  const input = document.getElementById('dashResearchInput');
  const btn = document.getElementById('dashResearchBtn');
  if (!input || !btn) return;

  btn.addEventListener('click', async () => {
    const query = input.value.trim();
    await renderDashResearch(query || "What's going on with the markets today?");
  });

  document.querySelectorAll('[data-dash-prompt]').forEach(chip => {
    chip.addEventListener('click', async () => {
      input.value = chip.dataset.dashPrompt;
      await renderDashResearch(chip.dataset.dashPrompt);
    });
  });

  renderDashResearch("What's going on with the markets today?");
}

function init() {
  setDate();
  populateTicker();
  renderHero();
  renderCommodityRows();
  renderStockRows();
  renderRates();
  renderWire();
  renderMarketRows();
  renderWatchlistRows();
  initChartTabs();
  drawMainChart();
  renderYieldTable(FALLBACK.yields);
  drawYieldChart(FALLBACK.yields);
  initDashResearch();
  loadIndices();
  loadWatchlist();
  loadYields();
  loadWireFromFinnhub();
  setInterval(setDate, 1000);
}

document.addEventListener('DOMContentLoaded', init);
