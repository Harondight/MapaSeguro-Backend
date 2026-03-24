const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const admin = require('firebase-admin');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// CONFIGURACIÓN SEGURA DE FIREBASE
let serviceAccount;

// PRIMERO: Intentar usar variable de entorno (Render)
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
        serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
        console.log('✅ Firebase: Usando credenciales desde variable de entorno');
    } catch (error) {
        console.error('❌ Error al parsear FIREBASE_SERVICE_ACCOUNT');
        process.exit(1);
    }
} 
// SEGUNDO: Intentar usar archivo local (solo desarrollo)
else {
    try {
        serviceAccount = require('./firebaseKey.json');
        console.log('⚠️ Firebase: Usando archivo local (solo desarrollo)');
    } catch (error) {
        console.error('❌ ERROR: Credenciales de Firebase no encontradas');
        console.error('   En producción: Configurar variable FIREBASE_SERVICE_ACCOUNT');
        console.error('   En desarrollo: Colocar firebaseKey.json en la raíz');
        process.exit(1);
    }
}

// Inicializar Firebase Admin
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

// Ruta de prueba
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'Servidor MapaSeguro funcionando',
        timestamp: new Date().toISOString()
    });
});

// Resto de tu código...

app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
});