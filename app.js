const TD_KEY = typeof CONFIG !== 'undefined' ? CONFIG.TD_KEY : '';
const FRED_KEY = typeof CONFIG !== 'undefined' ? CONFIG.FRED_KEY : '';
const FH_KEY = typeof CONFIG !== 'undefined' ? CONFIG.FINNHUB_KEY : '';

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

const watchSymbols = ['SPY','QQQ','DIA','IWM','VTI','VOO','XLK','XLF','XLE','GLD','SLV','USO','AAPL','MSFT','NVDA','AMZN','GOOGL','META','TSLA','JPM'];

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
        <div>
          <div class="label-main">${def.label}</div>
          <div class="label-sub">ETF proxy / free feed</div>
        </div>
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
      <div>
        <div class="label-main">${item.label}</div>
        <div class="label-sub">Macro / commodity monitor</div>
      </div>
      <div class="value-main">${item.value}</div>
      <div class="change-main flat">${item.change}</div>
    </div>
  `).join('');
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
  wrap.innerHTML = FALLBACK.wire.map(item => `
    <div class="wire-item wide-wire-item">
      <div>
        <div class="wire-headline">${item.headline}</div>
        <div class="wire-meta">${item.source}</div>
      </div>
      <div></div>
      <div class="change-main flat wire-age">${item.age}</div>
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
  if (!TD_KEY) return null;
  try {
    const res = await fetch(`https://api.twelvedata.com/time_series?symbol=${encodeURIComponent(symbol)}&interval=1day&outputsize=30&apikey=${TD_KEY}`);
    const data = await res.json();
    if (!data.values || data.status === 'error') return null;
    const ordered = data.values.slice().reverse();
    const series = ordered.map(d => Number(d.close)).filter(n => Number.isFinite(n));
    const dates = ordered.map(d => d.datetime || d.date);
    if (series.length < 2) return null;
    const price = series[series.length - 1];
    const prev = series[series.length - 2];
    return { price, changePct: ((price - prev) / prev) * 100, closes: series, dates };
  } catch {
    return null;
  }
}

async function fetchTDQuote(symbol) {
  if (!TD_KEY) return null;
  try {
    const res = await fetch(`https://api.twelvedata.com/quote?symbol=${encodeURIComponent(symbol)}&apikey=${TD_KEY}`);
    const data = await res.json();
    const price = Number(data.close || data.price);
    const changePct = Number(data.percent_change);
    if (!Number.isFinite(price)) return null;
    return { symbol, price, changePct: Number.isFinite(changePct) ? changePct : 0 };
  } catch {
    return null;
  }
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
  for (const symbol of watchSymbols) {
    const quote = await fetchTDQuote(symbol);
    if (quote) watchlistStore[symbol] = quote;
  }
  renderWatchlistRows();
}

async function fetchFredLatest(seriesId) {
  if (!FRED_KEY) return null;
  try {
    const res = await fetch(`https://api.stlouisfed.org/fred/series/observations?series_id=${seriesId}&api_key=${FRED_KEY}&sort_order=desc&file_type=json&limit=10`);
    const data = await res.json();
    const val = data.observations?.find(obs => obs.value !== '.')?.value;
    const num = Number(val);
    return Number.isFinite(num) ? num : null;
  } catch {
    return null;
  }
}

async function loadYields() {
  const values = [];
  for (const [tenor, series] of yieldDefs) {
    const fallback = FALLBACK.yields.find(v => v.tenor === tenor)?.value ?? null;
    const live = await fetchFredLatest(series);
    values.push({ tenor, value: live ?? fallback ?? 0 });
  }
  renderYieldTable(values);
  drawYieldChart(values);
}

async function loadWireFromFinnhub() {
  if (!FH_KEY) return;
  try {
    const res = await fetch(`https://finnhub.io/api/v1/news?category=general&token=${FH_KEY}`);
    const data = await res.json();
    if (!Array.isArray(data)) return;
    const rows = data.slice(0, 6).map(item => ({
      source: item.source || 'Newswire',
      headline: item.headline,
      age: relativeTime(item.datetime)
    })).filter(item => item.headline);
    if (rows.length) {
      FALLBACK.wire = rows;
      renderWire();
    }
  } catch {}
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

function init() {
  setDate();
  populateTicker();
  renderHero();
  renderCommodityRows();
  renderRates();
  renderNews();
  renderWire();
  renderMarketRows();
  renderWatchlistRows();
  initChartTabs();
  drawMainChart();
  renderYieldTable(FALLBACK.yields);
  drawYieldChart(FALLBACK.yields);
  initNotes();
  loadIndices();
  loadWatchlist();
  loadYields();
  loadWireFromFinnhub();
  setInterval(setDate, 1000);
}

document.addEventListener('DOMContentLoaded', init);
