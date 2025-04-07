// DOM Elements
document.addEventListener('DOMContentLoaded', function() {
    // Navigation
    const navLinks = document.querySelectorAll('nav ul li a');
    const sections = document.querySelectorAll('.section');
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const mainNav = document.getElementById('main-nav');
    
    // Create menu overlay
    const menuOverlay = document.createElement('div');
    menuOverlay.className = 'menu-overlay';
    document.body.appendChild(menuOverlay);
    
    // Time buttons
    const stockTimeButtons = document.querySelectorAll('#stocks .time-btn');
    const cryptoTimeButtons = document.querySelectorAll('#crypto .time-btn');
    
    // Search elements
    const stockSearchInput = document.getElementById('stock-search');
    const stockSearchBtn = document.getElementById('stock-search-btn');
    const cryptoSearchInput = document.getElementById('crypto-search');
    const cryptoSearchBtn = document.getElementById('crypto-search-btn');
    
    // Mobile menu toggle
    mobileMenuToggle.addEventListener('click', function() {
        mainNav.classList.toggle('active');
        menuOverlay.classList.toggle('active');
        document.body.style.overflow = mainNav.classList.contains('active') ? 'hidden' : '';
    });
    
    // Close menu when clicking overlay
    menuOverlay.addEventListener('click', function() {
        mainNav.classList.remove('active');
        menuOverlay.classList.remove('active');
        document.body.style.overflow = '';
    });
    
    // Close menu when clicking a nav link
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            mainNav.classList.remove('active');
            menuOverlay.classList.remove('active');
            document.body.style.overflow = '';
        });
    });
    
    // Check if Chart.js is loaded
    if (typeof Chart === 'undefined') {
        console.error('Chart.js is not loaded. Please include chart.min.js in your project.');
        // Create a fallback message
        document.querySelectorAll('.chart-container').forEach(container => {
            const fallbackMsg = document.createElement('div');
            fallbackMsg.className = 'chart-fallback';
            fallbackMsg.textContent = 'Chart visualization is not available.';
            container.appendChild(fallbackMsg);
        });
    } else {
        // Initialize charts
        try {
            initializeCharts();
        } catch (error) {
            console.error('Error initializing charts:', error);
        }
    }
    
    // Load initial data
    try {
        loadDashboardData();
        loadStockData('AAPL', '1d');
        loadCryptoData('bitcoin', '1d');
        loadPortfolioData();
    } catch (error) {
        console.error('Error loading initial data:', error);
    }
    
    // Navigation event listeners
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            
            // Update active nav link
            navLinks.forEach(link => {
                link.parentElement.classList.remove('active');
            });
            this.parentElement.classList.add('active');
            
            // Show target section
            sections.forEach(section => {
                section.classList.remove('active');
                if (section.id === targetId) {
                    section.classList.add('active');
                }
            });
        });
    });
    
    // Time button event listeners
    stockTimeButtons.forEach(button => {
        button.addEventListener('click', function() {
            stockTimeButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            const timeFrame = this.getAttribute('data-time');
            const symbol = document.getElementById('selected-stock-symbol').textContent;
            loadStockData(symbol, timeFrame);
        });
    });
    
    cryptoTimeButtons.forEach(button => {
        button.addEventListener('click', function() {
            cryptoTimeButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            const timeFrame = this.getAttribute('data-time');
            const id = document.getElementById('selected-crypto-name').textContent.toLowerCase();
            loadCryptoData(id, timeFrame);
        });
    });
    
    // Search event listeners
    stockSearchBtn.addEventListener('click', function() {
        const symbol = stockSearchInput.value.trim().toUpperCase();
        if (symbol) {
            loadStockData(symbol, '1d');
            // Reset active time button
            stockTimeButtons.forEach(btn => btn.classList.remove('active'));
            stockTimeButtons[0].classList.add('active');
        }
    });
    
    cryptoSearchBtn.addEventListener('click', function() {
        const id = cryptoSearchInput.value.trim().toLowerCase();
        if (id) {
            loadCryptoData(id, '1d');
            // Reset active time button
            cryptoTimeButtons.forEach(btn => btn.classList.remove('active'));
            cryptoTimeButtons[0].classList.add('active');
        }
    });
    
    // Allow search on Enter key
    stockSearchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            stockSearchBtn.click();
        }
    });
    
    cryptoSearchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            cryptoSearchBtn.click();
        }
    });
    
    // Handle window resize for charts
    window.addEventListener('resize', debounce(function() {
        if (typeof Chart !== 'undefined') {
            try {
                if (portfolioChart) portfolioChart.resize();
                if (allocationChart) allocationChart.resize();
                if (stockChart) stockChart.resize();
                if (cryptoChart) cryptoChart.resize();
                if (portfolioAllocationChart) portfolioAllocationChart.resize();
            } catch (error) {
                console.error('Error resizing charts:', error);
            }
        }
    }, 250));
});

// Debounce function for resize events
function debounce(func, wait) {
    let timeout;
    return function() {
        const context = this;
        const args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(function() {
            func.apply(context, args);
        }, wait);
    };
}

// Chart objects
let portfolioChart, allocationChart, stockChart, cryptoChart, portfolioAllocationChart;

// Initialize all charts
function initializeCharts() {
    // Set default Chart.js options for all charts
    Chart.defaults.font.family = "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";
    Chart.defaults.font.size = 12;
    Chart.defaults.color = '#666666';
    Chart.defaults.responsive = true;
    Chart.defaults.maintainAspectRatio = false;
    
    // Dashboard charts
    portfolioChart = new Chart(
        document.getElementById('portfolio-chart'),
        {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Portfolio Value',
                    data: [],
                    borderColor: '#6200ee',
                    backgroundColor: 'rgba(98, 0, 238, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        }
                    },
                    y: {
                        beginAtZero: false,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    }
                }
            }
        }
    );
    
    allocationChart = new Chart(
        document.getElementById('allocation-chart'),
        {
            type: 'doughnut',
            data: {
                labels: [],
                datasets: [{
                    data: [],
                    backgroundColor: [
                        '#6200ee',
                        '#03dac6',
                        '#ff9800',
                        '#f44336',
                        '#4caf50'
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            boxWidth: 12,
                            padding: 15
                        }
                    }
                }
            }
        }
    );
    
    // Stock chart
    stockChart = new Chart(
        document.getElementById('stock-chart'),
        {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Price',
                    data: [],
                    borderColor: '#6200ee',
                    backgroundColor: 'rgba(98, 0, 238, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        }
                    },
                    y: {
                        beginAtZero: false,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    }
                }
            }
        }
    );
    
    // Crypto chart
    cryptoChart = new Chart(
        document.getElementById('crypto-chart'),
        {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Price',
                    data: [],
                    borderColor: '#03dac6',
                    backgroundColor: 'rgba(3, 218, 198, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        }
                    },
                    y: {
                        beginAtZero: false,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    }
                }
            }
        }
    );
    
    // Portfolio allocation chart
    portfolioAllocationChart = new Chart(
        document.getElementById('portfolio-allocation-chart'),
        {
            type: 'doughnut',
            data: {
                labels: [],
                datasets: [{
                    data: [],
                    backgroundColor: [
                        '#6200ee',
                        '#03dac6',
                        '#ff9800',
                        '#f44336',
                        '#4caf50',
                        '#2196f3',
                        '#9c27b0'
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            boxWidth: 12,
                            padding: 15
                        }
                    }
                }
            }
        }
    );
}

// Load dashboard data
function loadDashboardData() {
    // Sample portfolio history data
    const dates = getLast30Days();
    const portfolioValues = generateRandomPriceData(10000, 11000, 30);
    
    // Update portfolio chart
    portfolioChart.data.labels = dates;
    portfolioChart.data.datasets[0].data = portfolioValues;
    portfolioChart.update();
    
    // Sample allocation data
    const allocationLabels = ['Stocks', 'Crypto', 'Cash', 'Bonds'];
    const allocationData = [60, 25, 10, 5];
    
    // Update allocation chart
    allocationChart.data.labels = allocationLabels;
    allocationChart.data.datasets[0].data = allocationData;
    allocationChart.update();
    
    // Sample watchlist data
    const watchlistData = [
        { symbol: 'AAPL', name: 'Apple Inc.', price: 173.45, change: 1.23, changePercent: 0.72 },
        { symbol: 'MSFT', name: 'Microsoft Corp.', price: 328.79, change: 2.56, changePercent: 0.78 },
        { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 142.65, change: -0.87, changePercent: -0.61 },
        { symbol: 'AMZN', name: 'Amazon.com Inc.', price: 178.22, change: 3.45, changePercent: 1.97 },
        { symbol: 'TSLA', name: 'Tesla Inc.', price: 245.67, change: -5.32, changePercent: -2.12 },
        { symbol: 'BTC', name: 'Bitcoin', price: 63245.78, change: 1245.32, changePercent: 2.01 },
        { symbol: 'ETH', name: 'Ethereum', price: 3456.89, change: 87.65, changePercent: 2.60 }
    ];
    
    // Update watchlist table
    const watchlistTable = document.getElementById('watchlist-table').getElementsByTagName('tbody')[0];
    watchlistTable.innerHTML = '';
    
    watchlistData.forEach(item => {
        const row = watchlistTable.insertRow();
        
        const symbolCell = row.insertCell(0);
        symbolCell.textContent = item.symbol;
        
        const nameCell = row.insertCell(1);
        nameCell.textContent = item.name;
        
        const priceCell = row.insertCell(2);
        priceCell.textContent = '$' + item.price.toFixed(2);
        
        const changeCell = row.insertCell(3);
        const isPositive = item.change >= 0;
        changeCell.textContent = (isPositive ? '+' : '') + item.change.toFixed(2) + ' (' + (isPositive ? '+' : '') + item.changePercent.toFixed(2) + '%)';
        changeCell.className = isPositive ? 'positive' : 'negative';
    });
}

// Load stock data
function loadStockData(symbol, timeFrame) {
    // Update stock info
    document.getElementById('selected-stock-symbol').textContent = symbol;
    
    // Sample stock data based on symbol
    let stockName, currentPrice, priceChange, priceChangePercent;
    
    switch(symbol) {
        case 'AAPL':
            stockName = 'Apple Inc.';
            currentPrice = 173.45;
            priceChange = 1.23;
            priceChangePercent = 0.72;
            break;
        case 'MSFT':
            stockName = 'Microsoft Corp.';
            currentPrice = 328.79;
            priceChange = 2.56;
            priceChangePercent = 0.78;
            break;
        case 'GOOGL':
            stockName = 'Alphabet Inc.';
            currentPrice = 142.65;
            priceChange = -0.87;
            priceChangePercent = -0.61;
            break;
        case 'AMZN':
            stockName = 'Amazon.com Inc.';
            currentPrice = 178.22;
            priceChange = 3.45;
            priceChangePercent = 1.97;
            break;
        case 'TSLA':
            stockName = 'Tesla Inc.';
            currentPrice = 245.67;
            priceChange = -5.32;
            priceChangePercent = -2.12;
            break;
        default:
            stockName = symbol;
            currentPrice = 100 + Math.random() * 200;
            priceChange = (Math.random() * 10) - 5;
            priceChangePercent = (priceChange / currentPrice) * 100;
    }
    
    // Update stock info
    document.getElementById('selected-stock-name').textContent = stockName;
    document.getElementById('selected-stock-price').textContent = currentPrice.toFixed(2);
    
    const changeText = (priceChange >= 0 ? '+' : '') + priceChange.toFixed(2) + ' (' + (priceChange >= 0 ? '+' : '') + priceChangePercent.toFixed(2) + '%)';
    const changeElement = document.getElementById('selected-stock-change');
    changeElement.textContent = changeText;
    changeElement.className = 'price-change ' + (priceChange >= 0 ? 'positive' : 'negative');
    
    // Generate chart data based on timeframe
    let labels, prices;
    
    switch(timeFrame) {
        case '1d':
            labels = getHoursToday();
            prices = generateRandomPriceData(currentPrice - 5, currentPrice + 5, 7);
            break;
        case '1w':
            labels = getLast7Days();
            prices = generateRandomPriceData(currentPrice - 10, currentPrice + 10, 7);
            break;
        case '1m':
            labels = getLast30Days();
            prices = generateRandomPriceData(currentPrice - 20, currentPrice + 20, 30);
            break;
        case '3m':
            labels = getLast90Days();
            prices = generateRandomPriceData(currentPrice - 30, currentPrice + 30, 90);
            break;
        case '1y':
            labels = getLast12Months();
            prices = generateRandomPriceData(currentPrice - 50, currentPrice + 50, 12);
            break;
    }
    
    // Update stock chart
    stockChart.data.labels = labels;
    stockChart.data.datasets[0].data = prices;
    stockChart.update();
    
    // Update stock stats
    document.getElementById('stock-open').textContent = '$' + (currentPrice - (Math.random() * 2)).toFixed(2);
    document.getElementById('stock-high').textContent = '$' + (currentPrice + (Math.random() * 3)).toFixed(2);
    document.getElementById('stock-low').textContent = '$' + (currentPrice - (Math.random() * 3)).toFixed(2);
    
    const volume = Math.floor(Math.random() * 100) + 10;
    document.getElementById('stock-volume').textContent = volume + 'M';
    
    const marketCap = (currentPrice * (Math.random() * 10 + 1)).toFixed(1);
    document.getElementById('stock-market-cap').textContent = '$' + (marketCap > 1000 ? (marketCap / 1000).toFixed(2) + 'T' : marketCap + 'B');
    
    document.getElementById('stock-pe').textContent = (Math.random() * 40 + 10).toFixed(2);
}

// Load crypto data
function loadCryptoData(id, timeFrame) {
    // Sample crypto data based on id
    let cryptoName, symbol, currentPrice, priceChange, priceChangePercent;
    
    switch(id) {
        case 'bitcoin':
            cryptoName = 'Bitcoin';
            symbol = 'BTC';
            currentPrice = 63245.78;
            priceChange = 1245.32;
            priceChangePercent = 2.01;
            break;
        case 'ethereum':
            cryptoName = 'Ethereum';
            symbol = 'ETH';
            currentPrice = 3456.89;
            priceChange = 87.65;
            priceChangePercent = 2.60;
            break;
        case 'solana':
            cryptoName = 'Solana';
            symbol = 'SOL';
            currentPrice = 142.35;
            priceChange = -3.78;
            priceChangePercent = -2.59;
            break;
        case 'cardano':
            cryptoName = 'Cardano';
            symbol = 'ADA';
            currentPrice = 0.45;
            priceChange = 0.02;
            priceChangePercent = 4.65;
            break;
        default:
            cryptoName = id.charAt(0).toUpperCase() + id.slice(1);
            symbol = id.substring(0, 3).toUpperCase();
            currentPrice = Math.random() * 1000;
            priceChange = (Math.random() * 100) - 50;
            priceChangePercent = (priceChange / currentPrice) * 100;
    }
    
    // Update crypto info
    document.getElementById('selected-crypto-name').textContent = cryptoName;
    document.getElementById('selected-crypto-symbol').textContent = symbol;
    document.getElementById('selected-crypto-price').textContent = currentPrice.toFixed(2);
    
    const changeText = (priceChange >= 0 ? '+' : '') + priceChange.toFixed(2) + ' (' + (priceChange >= 0 ? '+' : '') + priceChangePercent.toFixed(2) + '%)';
    const changeElement = document.getElementById('selected-crypto-change');
    changeElement.textContent = changeText;
    changeElement.className = 'price-change ' + (priceChange >= 0 ? 'positive' : 'negative');
    
    // Generate chart data based on timeframe
    let labels, prices;
    
    switch(timeFrame) {
        case '1d':
            labels = getHoursToday();
            prices = generateRandomPriceData(currentPrice * 0.98, currentPrice * 1.02, 7);
            break;
        case '1w':
            labels = getLast7Days();
            prices = generateRandomPriceData(currentPrice * 0.95, currentPrice * 1.05, 7);
            break;
        case '1m':
            labels = getLast30Days();
            prices = generateRandomPriceData(currentPrice * 0.9, currentPrice * 1.1, 30);
            break;
        case '3m':
            labels = getLast90Days();
            prices = generateRandomPriceData(currentPrice * 0.8, currentPrice * 1.2, 90);
            break;
        case '1y':
            labels = getLast12Months();
            prices = generateRandomPriceData(currentPrice * 0.5, currentPrice * 1.5, 12);
            break;
    }
    
    // Update crypto chart
    cryptoChart.data.labels = labels;
    cryptoChart.data.datasets[0].data = prices;
    cryptoChart.update();
    
    // Update crypto stats
    document.getElementById('crypto-high').textContent = '$' + (currentPrice * 1.02).toFixed(2);
    document.getElementById('crypto-low').textContent = '$' + (currentPrice * 0.98).toFixed(2);
    
    const volume = (currentPrice * (Math.random() * 5 + 1)).toFixed(1);
    document.getElementById('crypto-volume').textContent = '$' + (volume > 10 ? volume + 'B' : volume * 1000 + 'M');
    
    const marketCap = (currentPrice * (Math.random() * 10 + 10)).toFixed(1);
    document.getElementById('crypto-market-cap').textContent = '$' + (marketCap > 1000 ? (marketCap / 1000).toFixed(2) + 'T' : marketCap + 'B');
    
    const supply = (Math.random() * 100 + 10).toFixed(1);
    document.getElementById('crypto-supply').textContent = supply + 'M';
    
    const ath = currentPrice * (1 + Math.random() * 0.5);
    document.getElementById('crypto-ath').textContent = '$' + ath.toFixed(2);
}

// Load portfolio data
function loadPortfolioData() {
    // Sample portfolio data
    const portfolioData = [
        { asset: 'AAPL', type: 'Stock', quantity: 10, avgPrice: 150.25, currentPrice: 173.45, value: 1734.50, profitLoss: 232.00 },
        { asset: 'MSFT', type: 'Stock', quantity: 5, avgPrice: 290.50, currentPrice: 328.79, value: 1643.95, profitLoss: 191.45 },
        { asset: 'GOOGL', type: 'Stock', quantity: 8, avgPrice: 135.75, currentPrice: 142.65, value: 1141.20, profitLoss: 55.20 },
        { asset: 'AMZN', type: 'Stock', quantity: 3, avgPrice: 160.30, currentPrice: 178.22, value: 534.66, profitLoss: 53.76 },
        { asset: 'BTC', type: 'Crypto', quantity: 0.05, avgPrice: 58000.00, currentPrice: 63245.78, value: 3162.29, profitLoss: 262.29 },
        { asset: 'ETH', type: 'Crypto', quantity: 0.5, avgPrice: 3200.00, currentPrice: 3456.89, value: 1728.45, profitLoss: 128.45 },
        { asset: 'SOL', type: 'Crypto', quantity: 5, avgPrice: 130.50, currentPrice: 142.35, value: 711.75, profitLoss: 59.25 }
    ];
    
    // Update portfolio table
    const portfolioTable = document.getElementById('portfolio-table').getElementsByTagName('tbody')[0];
    portfolioTable.innerHTML = '';
    
    let totalValue = 0;
    let stocksValue = 0;
    let cryptoValue = 0;
    
    const portfolioAllocationLabels = [];
    const portfolioAllocationData = [];
    
    portfolioData.forEach(item => {
        const row = portfolioTable.insertRow();
        
        const assetCell = row.insertCell(0);
        assetCell.textContent = item.asset;
        
        const typeCell = row.insertCell(1);
        typeCell.textContent = item.type;
        
        const quantityCell = row.insertCell(2);
        quantityCell.textContent = item.quantity;
        
        const avgPriceCell = row.insertCell(3);
        avgPriceCell.textContent = '$' + item.avgPrice.toFixed(2);
        
        const currentPriceCell = row.insertCell(4);
        currentPriceCell.textContent = '$' + item.currentPrice.toFixed(2);
        
        const valueCell = row.insertCell(5);
        valueCell.textContent = '$' + item.value.toFixed(2);
        
        const profitLossCell = row.insertCell(6);
        const isPositive = item.profitLoss >= 0;
        profitLossCell.textContent = (isPositive ? '+$' : '-$') + Math.abs(item.profitLoss).toFixed(2) + ' (' + 
            (isPositive ? '+' : '-') + (Math.abs(item.profitLoss) / (item.value - item.profitLoss) * 100).toFixed(2) + '%)';
        profitLossCell.className = isPositive ? 'positive' : 'negative';
        
        // Update totals
        totalValue += item.value;
        if (item.type === 'Stock') {
            stocksValue += item.value;
        } else if (item.type === 'Crypto') {
            cryptoValue += item.value;
        }
        
        // Add to allocation data
        portfolioAllocationLabels.push(item.asset);
        portfolioAllocationData.push(item.value);
    });
    
    // Update portfolio summary
    document.getElementById('total-portfolio-value').textContent = totalValue.toFixed(2);
    document.getElementById('stocks-value').textContent = stocksValue.toFixed(2);
    document.getElementById('crypto-value').textContent = cryptoValue.toFixed(2);
    
    // Update portfolio allocation chart
    portfolioAllocationChart.data.labels = portfolioAllocationLabels;
    portfolioAllocationChart.data.datasets[0].data = portfolioAllocationData;
    portfolioAllocationChart.update();
}

// Helper functions for generating time labels
function getHoursToday() {
    const hours = ['9:30 AM', '10:30 AM', '11:30 AM', '12:30 PM', '1:30 PM', '2:30 PM', '3:30 PM', '4:00 PM'];
    return hours;
}

function getLast7Days() {
    const days = [];
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        days.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
    }
    return days;
}

function getLast30Days() {
    const days = [];
    for (let i = 29; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        days.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
    }
    return days;
}

function getLast90Days() {
    const days = [];
    for (let i = 0; i < 90; i += 3) {
        const date = new Date();
        date.setDate(date.getDate() - (90 - i));
        days.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
    }
    return days;
}

function getLast12Months() {
    const months = [];
    for (let i = 11; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        months.push(date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }));
    }
    return months;
}

// Generate random price data
function generateRandomPriceData(min, max, count) {
    const data = [];
    let lastPrice = min + Math.random() * (max - min);
    
    for (let i = 0; i < count; i++) {
        // Add some randomness but keep the trend somewhat realistic
        const change = (Math.random() - 0.5) * (max - min) * 0.05;
        lastPrice = Math.max(min, Math.min(max, lastPrice + change));
        data.push(lastPrice);
    }
    
    return data;
}