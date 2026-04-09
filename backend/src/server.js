require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authMiddleware = require('./middleware/auth');

// Importar rutas
const productRoutes = require('./routes/products');
const unitRoutes = require('./routes/units');
const rawMaterialRoutes = require('./routes/rawMaterials');
const recipeRoutes = require('./routes/recipes');
const saleRoutes = require('./routes/sales');
const purchaseRoutes = require('./routes/purchases');
const productionRoutes = require('./routes/productions');
const roleRoutes = require('./routes/roles');
const userRoutes = require('./routes/users');
const userRoleRoutes = require('./routes/userRoles');

// Conectar a MongoDB
connectDB();

const app = express();

// Middlewares globales
app.use(cors({
  origin: true, // Permite el origen dinámicamente para que otros equipos entren
  credentials: true,
}));
app.use(express.json());

// Health check (sin autenticación)
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Bakery API corriendo correctamente 🍰' });
});

// Rutas protegidas con autenticación de Appwrite
// Para desarrollo local sin Appwrite configurado, puedes comentar authMiddleware
app.use('/api/products', authMiddleware, productRoutes);
app.use('/api/units', authMiddleware, unitRoutes);
app.use('/api/raw-materials', authMiddleware, rawMaterialRoutes);
app.use('/api/recipes', authMiddleware, recipeRoutes);
app.use('/api/sales', authMiddleware, saleRoutes);
app.use('/api/purchases', authMiddleware, purchaseRoutes);
app.use('/api/productions', authMiddleware, productionRoutes);
app.use('/api/roles', authMiddleware, roleRoutes);
app.use('/api/users', authMiddleware, userRoutes);
app.use('/api/user-roles', authMiddleware, userRoleRoutes);

// Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ message: `Ruta ${req.originalUrl} no encontrada` });
});

// Manejo global de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Error interno del servidor' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/api/health`);
});
