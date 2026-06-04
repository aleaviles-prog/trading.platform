// Sistema de autenticación

// Registro de usuarios
document.getElementById('registerForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const birthdate = document.getElementById('birthdate').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    // Validaciones
    if (password !== confirmPassword) {
        showNotification('Las contraseñas no coinciden', 'error');
        return;
    }
    
    if (password.length < 6) {
        showNotification('La contraseña debe tener al menos 6 caracteres', 'error');
        return;
    }
    
    try {
        // Crear usuario en Firebase Auth
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;
        
        // Guardar datos adicionales en Firestore
        await db.collection('users').doc(user.uid).set({
            firstName,
            lastName,
            email,
            phone,
            birthdate,
            balance: APP_CONFIG.initialBalance,
            currency: 'USD',
            status: 'active',
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            role: email === APP_CONFIG.adminEmail ? 'admin' : 'user'
        });
        
        // Crear documento de estadísticas
        await db.collection('stats').doc(user.uid).set({
            totalTrades: 0,
            winTrades: 0,
            lossTrades: 0,
            totalProfit: 0,
            totalLoss: 0,
            totalDeposits: 0,
            totalWithdrawals: 0
        });
        
        showNotification('Cuenta creada exitosamente', 'success');
        
        // Redirigir según el rol
        setTimeout(() => {
            if (email === APP_CONFIG.adminEmail) {
                window.location.href = 'admin.html';
            } else {
                window.location.href = 'dashboard.html';
            }
        }, 2000);
        
    } catch (error) {
        console.error('Error en registro:', error);
        
        if (error.code === 'auth/email-already-in-use') {
            showNotification('Este correo ya está registrado', 'error');
        } else if (error.code === 'auth/invalid-email') {
            showNotification('Correo electrónico inválido', 'error');
        } else {
            showNotification('Error al crear la cuenta: ' + error.message, 'error');
        }
    }
});

// Login de usuarios
document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    try {
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        const user = userCredential.user;
        
        // Obtener datos del usuario
        const userDoc = await db.collection('users').doc(user.uid).get();
        const userData = userDoc.data();
        
        if (userData.status === 'suspended') {
            showNotification('Tu cuenta está suspendida. Contacta al soporte.', 'error');
            await auth.signOut();
            return;
        }
        
        showNotification('Inicio de sesión exitoso', 'success');
        
        // Guardar datos en localStorage
        localStorage.setItem('userRole', userData.role);
        localStorage.setItem('userId', user.uid);
        
        // Redirigir según el rol
        setTimeout(() => {
            if (userData.role === 'admin') {
                window.location.href = 'admin.html';
            } else {
                window.location.href = 'dashboard.html';
            }
        }, 1500);
        
    } catch (error) {
        console.error('Error en login:', error);
        
        if (error.code === 'auth/user-not-found') {
            showNotification('Usuario no encontrado', 'error');
        } else if (error.code === 'auth/wrong-password') {
            showNotification('Contraseña incorrecta', 'error');
        } else if (error.code === 'auth/invalid-email') {
            showNotification('Correo electrónico inválido', 'error');
        } else {
            showNotification('Error al iniciar sesión: ' + error.message, 'error');
        }
    }
});

// Verificar estado de autenticación
auth.onAuthStateChanged((user) => {
    if (user) {
        // Usuario autenticado
        if (window.location.pathname.includes('login.html') || 
            window.location.pathname.includes('register.html')) {
            // Si está en login o registro, redirigir
            db.collection('users').doc(user.uid).get().then((doc) => {
                if (doc.exists) {
                    const userData = doc.data();
                    if (userData.role === 'admin') {
                        window.location.href = 'admin.html';
                    } else {
                        window.location.href = 'dashboard.html';
                    }
                }
            });
        }
    } else {
        // Usuario no autenticado
        if (window.location.pathname.includes('dashboard.html') || 
            window.location.pathname.includes('admin.html')) {
            window.location.href = 'login.html';
        }
    }
});

// Función para cerrar sesión
function logout() {
    auth.signOut().then(() => {
        localStorage.clear();
        window.location.href = 'index.html';
    }).catch((error) => {
        console.error('Error al cerrar sesión:', error);
        showNotification('Error al cerrar sesión', 'error');
    });
}

// Función para mostrar notificaciones
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

