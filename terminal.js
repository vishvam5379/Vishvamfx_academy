// Dummy Data for Indian Market
const marketData = [
    { symbol: 'NIFTY 50', desc: 'NSE Index', price: 21456.80, change: 120.50 },
    { symbol: 'BANKNIFTY', desc: 'NSE Index', price: 47890.30, change: -45.20 },
    { symbol: 'RELIANCE', desc: 'Reliance Industries', price: 2456.80, change: 12.40 },
    { symbol: 'TCS', desc: 'Tata Consultancy Svcs', price: 3890.10, change: -8.50 },
    { symbol: 'INFY', desc: 'Infosys Ltd', price: 1560.45, change: 5.60 },
    { symbol: 'HDFCBANK', desc: 'HDFC Bank Ltd', price: 1670.20, change: -2.10 },
    { symbol: 'ICICIBANK', desc: 'ICICI Bank Ltd', price: 980.50, change: 4.30 },
    { symbol: 'SBIN', desc: 'State Bank of India', price: 610.75, change: 1.20 },
    { symbol: 'TATAMOTORS', desc: 'Tata Motors Ltd', price: 780.90, change: 15.60 },
    { symbol: 'ADANIENT', desc: 'Adani Enterprises', price: 2950.00, change: -30.00 },
    { symbol: 'SUNPHARMA', desc: 'Sun Pharma', price: 1250.60, change: 8.90 },
    { symbol: 'ITC', desc: 'ITC Limited', price: 450.30, change: 0.50 },
    { symbol: 'BAJFINANCE', desc: 'Bajaj Finance', price: 7200.50, change: 50.00 },
    { symbol: 'WIPRO', desc: 'Wipro Ltd', price: 460.20, change: -1.40 },
    { symbol: 'BHARTIARTL', desc: 'Bharti Airtel', price: 1020.10, change: 6.70 },
];

const positionsData = [
    { id: 9823423, time: '2023.10.24 10:45', type: 'buy', size: 50, symbol: 'RELIANCE', price: 2440.00, current: 2456.80, sl: 2400.00, tp: 2500.00, profit: 840.00 },
    { id: 9823425, time: '2023.10.24 11:20', type: 'sell', size: 25, symbol: 'TCS', price: 3900.00, current: 3890.10, sl: 3950.00, tp: 3800.00, profit: 247.50 },
];

// Helper to format currency
const formatPrice = (price) => price.toFixed(2);

// Populate Market Watch
function initMarketWatch() {
    const container = document.getElementById('market-list-container');
    container.innerHTML = ''; // Clear

    marketData.forEach(item => {
        const bid = (item.price - 0.05).toFixed(2);
        const ask = (item.price + 0.05).toFixed(2);
        const colorClass = item.change >= 0 ? 'price-up' : 'price-down';
        
        const el = document.createElement('div');
        el.className = 'market-item';
        el.innerHTML = `
            <div class="item-symbol">
                <span class="symbol-name">${item.symbol}</span>
                <span class="symbol-desc">${item.desc}</span>
            </div>
            <div class="item-bid ${colorClass}">${bid}</div>
            <div class="item-ask ${colorClass}">${ask}</div>
        `;
        
        el.addEventListener('click', () => {
            document.querySelectorAll('.market-item').forEach(i => i.classList.remove('selected'));
            el.classList.add('selected');
            updateChart(item);
        });
        
        container.appendChild(el);
    });

    // Select first item by default
    if(container.firstChild) container.firstChild.classList.add('selected');
}

// Populate Bottom Panel (Trade Tab)
function initTradePanel() {
    const container = document.getElementById('panel-content');
    
    let html = `
        <table>
            <thead>
                <tr>
                    <th>Ticket</th>
                    <th>Time</th>
                    <th>Type</th>
                    <th>Size</th>
                    <th>Symbol</th>
                    <th>Price</th>
                    <th>S/L</th>
                    <th>T/P</th>
                    <th>Price</th>
                    <th>Profit</th>
                </tr>
            </thead>
            <tbody>
    `;

    let totalProfit = 0;

    positionsData.forEach(pos => {
        totalProfit += pos.profit;
        const typeColor = pos.type === 'buy' ? 'price-up' : 'price-down';
        const profitColor = pos.profit >= 0 ? 'price-up' : 'price-down';
        
        html += `
            <tr class="trade-row">
                <td>${pos.id}</td>
                <td>${pos.time}</td>
                <td class="${typeColor}" style="font-weight:bold; text-transform:uppercase">${pos.type}</td>
                <td>${pos.size}</td>
                <td style="font-weight:600">${pos.symbol}</td>
                <td>${formatPrice(pos.price)}</td>
                <td>${formatPrice(pos.sl)}</td>
                <td>${formatPrice(pos.tp)}</td>
                <td>${formatPrice(pos.current)}</td>
                <td class="${profitColor}" style="font-weight:bold">${formatPrice(pos.profit)}</td>
            </tr>
        `;
    });

    // Summary Row
    html += `
            <tr style="background-color: rgba(255,255,255,0.05); font-weight: bold;">
                <td colspan="9" style="text-align: right; padding-right: 20px;">Balance: 10,000.00 USD &nbsp;&nbsp; Equity: ${formatPrice(10000 + totalProfit)}</td>
                <td class="${totalProfit >= 0 ? 'price-up' : 'price-down'}">${formatPrice(totalProfit)}</td>
            </tr>
            </tbody>
        </table>
    `;

    container.innerHTML = html;
}

// Update Chart Placeholder info (Simulation)
function updateChart(item) {
    document.querySelector('.qt-header').textContent = item.symbol;
    document.querySelector('.chart-watermark').textContent = item.symbol + ' H1';
    
    // Update Quick Trade buttons
    const bid = (item.price - 0.05).toFixed(2);
    const ask = (item.price + 0.05).toFixed(2);
    
    document.querySelector('.qt-btn.sell .qt-price').textContent = bid;
    document.querySelector('.qt-btn.buy .qt-price').textContent = ask;
}

// Tab Switching Logic
document.querySelectorAll('.panel-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.panel-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        // Logic to switch content based on tab would go here
    });
});

// Initialize
window.addEventListener('DOMContentLoaded', () => {
    initMarketWatch();
    initTradePanel();
    
    // Simulate live data updates
    setInterval(() => {
        // Randomly update a price in the market watch
        const items = document.querySelectorAll('.market-item');
        const randomItem = items[Math.floor(Math.random() * items.length)];
        const bidParams = randomItem.querySelector('.item-bid');
        
        // Flash animation or color change could go here
        // For now just console log to show it's "alive"
    }, 1000);
});
