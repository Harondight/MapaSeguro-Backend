const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const admin = require('firebase-admin');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Inicializar Firebase Admin
const firebaseKey = process.env.FIREBASE_KEY || process.env.firebase_key || process.env.FIREBASEKEY;

console.log('DB_URI exists:', process.env.DB_URI ? 'YES' : 'NO');
console.log('Firebase variable exists:', firebaseKey ? 'YES' : 'NO');

if (!firebaseKey) {
    console.error('ERROR: Firebase key variable not found');
    process.exit(1);
}

let serviceAccount;
try {
    serviceAccount = JSON.parse(firebaseKey);
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
    console.log('Firebase Admin initialized');
} catch (error) {
    console.error('Error parsing Firebase key:', error.message);
    process.exit(1);
}

// Conexion a MySQL
if (!process.env.DB_URI) {
    console.error('ERROR: DB_URI not defined');
    process.exit(1);
}

const pool = mysql.createPool({ uri: process.env.DB_URI });
console.log('MySQL connection configured');

// Middleware para verificar token
const verificarUsuario = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: "No autorizado" });
    }
    try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        req.user = decodedToken;
        next();
    } catch (error) {
        console.error('Token verification error:', error.message);
        res.status(401).json({ error: "Token invalido" });
    }
};

// Ruta de salud
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Guardar reporte
app.post('/api/reportes', verificarUsuario, async (req, res) => {
    try {
        const { tipo, nivel_riesgo, latitud, longitud, es_anonimo, descripcion, zona_id } = req.body;
        
        if (!tipo || !nivel_riesgo || !latitud || !longitud) {
            return res.status(400).json({ error: "Campos requeridos faltantes" });
        }
        
        const uid_usuario = es_anonimo ? null : req.user.uid;
        
        const [resultado] = await pool.execute(
            `INSERT INTO reportes 
            (uid_usuario, zona_id, tipo, nivel_riesgo, descripcion, latitud, longitud, es_anonimo, estado, fuente) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Activa', 'App')`,
            [uid_usuario, zona_id || null, tipo, nivel_riesgo, descripcion || null, latitud, longitud, es_anonimo || false]
        );
        
        res.json({ mensaje: "Reporte guardado", id: resultado.insertId });
    } catch (error) {
        console.error('Error saving report:', error);
        res.status(500).json({ error: "Error en base de datos" });
    }
});

// Obtener reportes
app.get('/api/reportes', verificarUsuario, async (req, res) => {
    try {
        const [reportes] = await pool.execute(
            `SELECT id, tipo, nivel_riesgo, descripcion, latitud, longitud, 
                    es_anonimo, estado, fecha_creacion 
             FROM reportes 
             WHERE uid_usuario = ? OR es_anonimo = TRUE
             ORDER BY fecha_creacion DESC 
             LIMIT 50`,
            [req.user.uid]
        );
        res.json(reportes);
    } catch (error) {
        console.error('Error fetching reports:', error);
        res.status(500).json({ error: "Error en base de datos" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Backend running on port ${PORT}`);
});