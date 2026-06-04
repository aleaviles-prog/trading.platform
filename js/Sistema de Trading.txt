// Sistema de Trading

let currentUser = null;
let userData = null;
let currentAsset = 'EUR/USD';
let openPositions = [];
let priceUpdateInterval = null;
let chart = null;

// Inicializar al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    initializeDashboard();
});

// Inicializar Dashboard
async function initializeDashboard() {
    auth.onAuthStateChanged(async (user) => {
        if (user) {
            currentUser = user;
            await loadUserData();
            initializeChart();
            startPriceUpdates();
            loadOpenPositions();
            setupEventListeners();
        } else {
            window.location.href = 'login.html';
        }
    });
}

// Cargar datos del usuario
async function loadUserData() {
    try {
        const userDoc = await db.collection('users').doc(currentUser.uid).get();
        userData = userDoc.data();
        document.getElementById('userBalance').textContent = 
            parseFloat(userData.balance).toFixed(2);
    } catch (error) {
        console.error('Error cargando datos:', error);
    }
}

// Inicializar gráfico de TradingView
function initializeChart() {
    chart = new TradingView.widget({
        "width": "100%",
        "height": "100%",
        "symbol": currentAsset.replace('/', ''),
        "interval": "D",
        "timezone": "Etc/UTC",
        "theme": "dark",
        "style": "1",
        "locale": "es",
        "toolbar_bg": "#f1f3f6",
        "enable_publishing": false,
        "allow_symbol_change": false,
        "container_id": "tradingview_chart",
        "hide_side_toolbar": false,
        "studies": [
            "MASimple@tv-basicstudies",
            "RSI@tv-basicstudies",
            "MACD@tv-basicstudies"
        ]
    });
}

// Configurar event listeners
function setupEventListeners() {
    // Menú de cuenta
    document.getElementById('accountMenuBtn').addEventListener('click', () => {
        const menu = document.getElementById('accountMenu');
        menu.classList.toggle('hidden');
    });

    // Selector de activos
    document.getElementById('assetSelector').addEventListener('click', () => {
        document.getElementById('assetModal').classList.remove('hidden');
    });

    // Cerrar modales al hacer clic fuera
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.classList.add('hidden');
        }
    });
}

// Actualizar precios en tiempo real
function startPriceUpdates() {
    updatePrice(); // Actualizar inmediatamente
    
    // Actualizar cada 2 segundos
    priceUpdateInterval = setInterval(updatePrice, 2000);
}

// Actualizar precio actual
function updatePrice() {
    const basePrice = getAssetPrice(currentAsset);
    const variation = (Math.random() - 0.5) * 0.0010; // Variación de ±0.001
    const newPrice = basePrice + variation;
    
    document.getElementById('currentPrice').textContent = newPrice.toFixed(5);
    
    // Actualizar P&L de posiciones abiertas
    updatePositionsPnL(newPrice);
}

// Obtener precio base del activo
function getAssetPrice(asset) {
    const allAssets = [
        ...APP_CONFIG.assets.forex,
        ...APP_CONFIG.assets.crypto,
        ...APP_CONFIG.assets.indices
    ];
    
    const assetData = allAssets.find(a => a.symbol === asset);
    return assetData ? assetData.price : 1.0000;
}

// Seleccionar activo
function selectAsset(asset) {
    currentAsset = asset;
    document.getElementById('currentAsset').textContent = asset;
    document.getElementById('assetModal').classList.add('hidden');
    
    // Actualizar gráfico
    if (chart) {
        chart.setSymbol(asset.replace('/', ''));
    }
    
    updatePrice();
}

// Cerrar modal de activos
function closeAssetModal() {
    document.getElementById('assetModal').classList.add('hidden');
}

// Ejecutar operación
async function executeTrade(type) {
    const volume = parseFloat(document.getElementById('volume').value);
    const stopLoss = parseFloat(document.getElementById('stopLoss').value) || 0;
    const takeProfit = parseFloat(document.getElementById('takeProfit').value) || 0;
    const currentPrice = parseFloat(document.getElementById('currentPrice').textContent);
    
    // Validaciones
    if (volume <= 0) {
        showNotification('El volumen debe ser mayor a 0', 'error');
        return;
    }
    
    const requiredMargin = volume * 1000; // Margen requerido simplificado
    if (requiredMargin > userData.balance) {
        showNotification('Balance insuficiente para esta operación', 'error');
        return;
    }
    
    try {
        // Crear operación
        const trade = {
            userId: currentUser.uid,
            asset: currentAsset,
            type: type,
            volume: volume,
            openPrice: currentPrice,
            stopLoss: stopLoss,
            takeProfit: takeProfit,
            openTime: firebase.firestore.FieldValue.serverTimestamp(),
            status: 'open',
            pnl: 0
        };
        
        // Guardar en
