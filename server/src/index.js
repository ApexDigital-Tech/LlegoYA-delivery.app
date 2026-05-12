const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const vendorRoutes = require('./routes/vendorRoutes');

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/vendors', vendorRoutes);



// Basic Route
app.get('/', (req, res) => {
  res.json({ message: 'LlegoYA API - 🚀 Corriendo con Datos Mock (Sin DB requerida)' });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor LlegoYA corriendo en puerto ${PORT}`);
});
