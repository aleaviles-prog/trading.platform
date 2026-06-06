// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCsJpaDypEyfuwgkLKBmaFHGuZdbAa4-xs",
  authDomain: "web-trading-84360.firebaseapp.com",
  projectId: "web-trading-84360",
  storageBucket: "web-trading-84360.firebasestorage.app",
  messagingSenderId: "788624307776",
  appId: "1:788624307776:web:73755d25533e1514ea11a5"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);

// Referencias a servicios
const auth = firebase.auth();
const db = firebase.firestore();

// Configuración global
const APP_CONFIG = {
    initialBalance: 10000,
    adminEmail: 'admin@tradingpro.com',
    tradingHours: {
        start: 0,
        end: 24
    },
    assets: {
        forex: [
            { symbol: 'EUR/USD', name: 'Euro/US Dollar', price: 1.0852 },
            { symbol: 'GBP/USD', name: 'British Pound/US Dollar', price: 1.2654 },
            { symbol: 'USD/JPY', name: 'US Dollar/Japanese Yen', price: 149.85 },
            { symbol: 'AUD/USD', name: 'Australian Dollar/US Dollar', price: 0.6542 }
        ],
        crypto: [
            { symbol: 'BTC/USD', name: 'Bitcoin', price: 43250.00 },
            { symbol: 'ETH/USD', name: 'Ethereum', price: 2280.50 },
            { symbol: 'XRP/USD', name: 'Ripple', price: 0.6234 }
        ],
        indices: [
            { symbol: 'US30', name: 'Dow Jones', price: 37248.50 },
            { symbol: 'SP500', name: 'S&P 500', price: 4758.25 },
            { symbol: 'NAS100', name: 'Nasdaq 100', price: 16825.30 }
        ]
    }
};

