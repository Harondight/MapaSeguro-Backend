const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const admin = require('firebase-admin');
require('dotenv').config();

// 1. Iniciar Firebase Admin
const serviceAccount = require('./firebaseKey.json');
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });

// 2. Conectar a MariaDB (Aiven)
const pool = mysql.createPool({ uri: process.env.DB_URL });

const app = express();
app.use(cors());
app.use(express.json());

// 3. Middleware: El cadenero que revisa el Token de Firebase
const verificarUsuario = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: "No autorizado" });
    try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        req.user = decodedToken; // Guardamos los datos del usuario validado
        next(); // Pasa a la base de datos
    } catch (error) {
        res.status(401).json({ error: "Token inválido" });
    }
};

// 4. Ruta Protegida: Guardar un reporte
app.post('/api/reportes', verificarUsuario, async (req, res) => {
    try {
        // req.user.uid viene directo de Firebase, es 100% seguro y no se puede falsificar
        const uid = req.body.es_anonimo ? req.user.uid : req.user.uid; 
        
        const [resultado] = await pool.execute(
            `INSERT INTO reportes (uid_usuario, tipo, nivel_riesgo, latitud, longitud) VALUES (?, ?, ?, ?, ?)`,
            [uid, req.body.tipo, req.body.nivel_riesgo, req.body.latitud, req.body.longitud]
        );
        res.json({ mensaje: "Reporte guardado", id: resultado.insertId });
    } catch (error) {
        res.status(500).json({ error: "Error en base de datos" });
    }
});

app.listen(3000, () => console.log('Backend vivo en puerto 3000'));