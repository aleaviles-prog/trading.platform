// Panel de Administración

let allUsers = [];
let allDeposits = [];
let allWithdrawals = [];
let allTrades = [];
let currentEditingUser = null;

// Inicializar al cargar
document.addEventListener('DOMContentLoaded', () => {
    checkAdminAccess();
});

// Verificar acceso de administrador
async function checkAdminAccess() {
    auth.onAuthStateChanged(async (user) => {
        if (user) {
            const userDoc = await db.collection('users').doc(user.uid).get();
            const userData = userDoc.data();
            
            if (userData.role !== 'admin') {
                alert('No tienes permisos de administrador');
                window.location.href = 'dashboard.html';
                return;
            }
            
            initializeAdmin();
        } else {
            window.location.href = 'login.html';
        }
    });
}

// Inicializar panel de admin
async function initializeAdmin() {
    await loadAllData();
    updateStatistics();
    setupRealtimeListeners();
}

// Cargar todos los datos
async function loadAllData() {
    try {
        // Cargar usuarios
        const usersSnapshot = await db.collection('users').get();
        allUsers = [];
        usersSnapshot.forEach(doc => {
            allUsers.push({ id: doc.id, ...doc.data() });
        });
        
        // Cargar depósitos
        const depositsSnapshot = await db.collection('deposits').get();
        allDeposits = [];
        depositsSnapshot.forEach(doc => {
            allDeposits.push({ id: doc.id, ...doc.data() });
        });
        
        // Cargar retiros
        const withdrawalsSnapshot = await db.collection('withdrawals').get();
        allWithdrawals = [];
        withdrawalsSnapshot.forEach(doc => {
            allWithdrawals.push({ id: doc.id, ...doc.data() });
        });
        
        // Cargar operaciones
        const tradesSnapshot = await db.collection('trades').get();
        allTrades = [];
        tradesSnapshot.forEach(doc => {
            allTrades.push({ id: doc.id, ...doc.data() });
        });
        
    } catch (error) {
        console.error('Error cargando datos:', error);
    }
}

// Actualizar estadísticas
function updateStatistics() {
    // Total usuarios
    document.getElementById('totalUsers').textContent = 
        allUsers.filter(u => u.role !== 'admin').length;
    
    // Depósitos pendientes
    document.getElementById('pendingDeposits').textContent = 
        allDeposits.filter(d => d.status === 'pending').length;
    
    // Retiros pendientes
    document.getElementById('pendingWithdrawals').textContent = 
        allWithdrawals.filter(w => w.status === 'pending').length;
    
    // Volumen total
    const totalVolume = allTrades.reduce((total, trade) => {
        return total + (trade.volume * 100000);
    }, 0);
    document.getElementById('totalVolume').textContent = 
        totalVolume.toFixed(2);
}

//
